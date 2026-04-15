import { spawn, type ChildProcess } from "child_process";
import { EventEmitter } from "events";
import path from "path";
import { logger } from "./logger.js";

const SAFE_ENV_KEYS = new Set([
  "PATH",
  "LANG",
  "LC_ALL",
  "TERM",
  "TZ",
]);

const SENSITIVE_PATTERNS = [
  /secret/i,
  /password/i,
  /token/i,
  /key/i,
  /database/i,
  /db_/i,
  /redis/i,
  /session/i,
  /auth/i,
  /credential/i,
  /private/i,
  /cert/i,
  /dsn/i,
  /connection/i,
];

function buildSafeEnv(botId: string, cwd: string): Record<string, string> {
  const safe: Record<string, string> = {};

  for (const key of SAFE_ENV_KEYS) {
    const val = process.env[key];
    if (val !== undefined && !SENSITIVE_PATTERNS.some((p) => p.test(key))) {
      safe[key] = val;
    }
  }

  safe["NODE_ENV"] = "production";
  safe["BOT_ID"] = botId;
  safe["HOME"] = cwd;
  safe["TMPDIR"] = cwd;

  return safe;
}

const MAX_MEMORY_MB = 256;
const MAX_CPU_SECONDS = 30;
const MAX_FILE_SIZE_MB = 50;
const MAX_PROCESSES = 32;
const WALL_CLOCK_TIMEOUT_MS = 10 * 60 * 1000;

function buildResourceLimits(): string {
  return [
    `ulimit -v ${MAX_MEMORY_MB * 1024}`,
    `ulimit -t ${MAX_CPU_SECONDS}`,
    `ulimit -f ${MAX_FILE_SIZE_MB * 1024}`,
    `ulimit -u ${MAX_PROCESSES}`,
  ].join(" && ");
}

export interface ManagedProcess {
  proc: ChildProcess;
  botId: string;
  userId: string;
  cwd: string;
  wallClockTimer?: ReturnType<typeof setTimeout>;
}

class ProcessManager extends EventEmitter {
  private processes = new Map<string, ManagedProcess>();
  private logBuffer = new Map<string, string[]>();
  private readonly MAX_LOGS = 500;

  private appendLog(botId: string, line: string): void {
    const buf = this.logBuffer.get(botId) ?? [];
    buf.push(line);
    if (buf.length > this.MAX_LOGS) buf.splice(0, buf.length - this.MAX_LOGS);
    this.logBuffer.set(botId, buf);
  }

  getLogs(botId: string): string[] {
    return this.logBuffer.get(botId) ?? [];
  }

  clearLogs(botId: string): void {
    this.logBuffer.delete(botId);
  }


  stop(botId: string): boolean {
    const managed = this.processes.get(botId);
    if (!managed) return false;

    if (managed.wallClockTimer) {
      clearTimeout(managed.wallClockTimer);
    }

    try {
      managed.proc.kill("SIGTERM");
      setTimeout(() => {
        try {
          managed.proc.kill("SIGKILL");
        } catch {}
      }, 5000);
    } catch {}

    this.processes.delete(botId);
    return true;
  }

  startBot(
    botId: string,
    userId: string,
    cwd: string,
    mainFile: string,
    hasPackageJson: boolean,
  ): ManagedProcess {
    this.stop(botId);

    const safeEnv = buildSafeEnv(botId, cwd);
    const resolvedCwd = path.resolve(cwd);

    const normalized = path.normalize(mainFile);
    if (path.isAbsolute(normalized) || normalized.startsWith("..")) {
      logger.warn(
        { botId, userId, mainFile },
        "Blocked suspicious mainFile path in hosted bot",
      );
      throw new Error("mainFile inválido");
    }

    logger.info(
      {
        botId,
        userId,
        cwd: resolvedCwd,
        mainFile: normalized,
        hasPackageJson,
        envKeys: Object.keys(safeEnv),
        memoryLimitMB: MAX_MEMORY_MB,
      },
      "Starting sandboxed hosted bot process",
    );

    const nodeCmd = `node --experimental-permission --allow-fs-read=${JSON.stringify(resolvedCwd)} --allow-fs-write=${JSON.stringify(resolvedCwd)} ${JSON.stringify(normalized)}`;
    const installAndRun = hasPackageJson
      ? `${buildResourceLimits()} && npm install --ignore-scripts 2>&1 && exec ${nodeCmd}`
      : `${buildResourceLimits()} && exec ${nodeCmd}`;

    const proc = spawn("bash", ["-c", installAndRun], {
      cwd: resolvedCwd,
      env: safeEnv,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const managed: ManagedProcess = { proc, botId, userId, cwd: resolvedCwd };
    this.processes.set(botId, managed);

    managed.wallClockTimer = setTimeout(() => {
      logger.warn(
        { botId, userId, timeoutMs: WALL_CLOCK_TIMEOUT_MS },
        "Hosted bot exceeded wall-clock timeout, killing",
      );
      this.appendLog(botId, `[sys] Bot encerrado: tempo máximo de execução atingido (${WALL_CLOCK_TIMEOUT_MS / 1000}s)`);
      this.stop(botId);
    }, WALL_CLOCK_TIMEOUT_MS);

    proc.stdout?.on("data", (data: Buffer) => {
      const text = data.toString();
      for (const line of text.split("\n").filter(Boolean)) {
        this.appendLog(botId, `[out] ${line}`);
      }
      this.emit(`stdout:${botId}`, text);
    });

    proc.stderr?.on("data", (data: Buffer) => {
      const text = data.toString();
      for (const line of text.split("\n").filter(Boolean)) {
        this.appendLog(botId, `[err] ${line}`);

        if (
          line.includes("ERR_ACCESS_DENIED") ||
          line.includes("permission denied") ||
          line.includes("EACCES") ||
          line.includes("SecurityError")
        ) {
          logger.warn(
            { botId, userId, line },
            "Sandbox permission denial detected in hosted bot",
          );
        }
      }
      this.emit(`stderr:${botId}`, text);
    });

    proc.on("exit", (code, signal) => {
      if (managed.wallClockTimer) {
        clearTimeout(managed.wallClockTimer);
      }
      logger.info({ botId, code, signal }, "Hosted bot process exited");
      this.processes.delete(botId);
      this.emit(`exit:${botId}`, { code, signal });
    });

    proc.on("error", (err) => {
      logger.error({ botId, err }, "Hosted bot process error");
      this.emit(`error:${botId}`, err);
    });

    logger.info(
      { botId, pid: proc.pid, cwd: resolvedCwd },
      "Hosted bot process started (sandboxed)",
    );
    return managed;
  }

  write(botId: string, data: string): boolean {
    const managed = this.processes.get(botId);
    if (!managed || !managed.proc.stdin) return false;
    managed.proc.stdin.write(data);
    return true;
  }

  isRunning(botId: string): boolean {
    return this.processes.has(botId);
  }

  getProcess(botId: string): ManagedProcess | undefined {
    return this.processes.get(botId);
  }

  getPid(botId: string): number | undefined {
    return this.processes.get(botId)?.proc.pid;
  }

  stopAll(): void {
    for (const [botId] of this.processes) {
      this.stop(botId);
    }
  }
}

export const processManager = new ProcessManager();
