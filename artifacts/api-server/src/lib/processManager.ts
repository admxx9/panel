import { spawn, type ChildProcess } from "child_process";
import { EventEmitter } from "events";
import { logger } from "./logger.js";

export interface ManagedProcess {
  proc: ChildProcess;
  botId: string;
  userId: string;
  cwd: string;
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

  start(botId: string, userId: string, cwd: string, mainFile: string): ManagedProcess {
    this.stop(botId);

    const proc = spawn("bash", [], {
      cwd,
      env: {
        ...process.env,
        NODE_ENV: "production",
        BOT_ID: botId,
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    const managed: ManagedProcess = { proc, botId, userId, cwd };
    this.processes.set(botId, managed);

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
      }
      this.emit(`stderr:${botId}`, text);
    });

    proc.on("exit", (code, signal) => {
      logger.info({ botId, code, signal }, "Hosted bot process exited");
      this.processes.delete(botId);
      this.emit(`exit:${botId}`, { code, signal });
    });

    proc.on("error", (err) => {
      logger.error({ botId, err }, "Hosted bot process error");
      this.emit(`error:${botId}`, err);
    });

    logger.info({ botId, pid: proc.pid, cwd }, "Hosted bot process started");
    return managed;
  }

  stop(botId: string): boolean {
    const managed = this.processes.get(botId);
    if (!managed) return false;

    try {
      managed.proc.kill("SIGTERM");
      setTimeout(() => {
        try { managed.proc.kill("SIGKILL"); } catch {}
      }, 5000);
    } catch {}

    this.processes.delete(botId);
    return true;
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
