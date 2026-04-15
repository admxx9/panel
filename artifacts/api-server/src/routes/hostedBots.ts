import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import AdmZip from "adm-zip";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { db, hostedBotsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";
import { processManager } from "../lib/processManager.js";
import { logger } from "../lib/logger.js";
import { createResourceLimiter } from "../lib/rateLimiter.js";

const GITHUB_URL_RE = /^https:\/\/github\.com\/[\w.\-]+\/[\w.\-]+(\.git)?\/?$/;

const router = Router();
const HOSTED_DIR = path.resolve(process.cwd(), ".hosted-bots");

if (!fs.existsSync(HOSTED_DIR)) {
  fs.mkdirSync(HOSTED_DIR, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/zip" || file.originalname.endsWith(".zip")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos .zip são aceitos"));
    }
  },
});

function getBotDir(userId: string, botId: string): string {
  return path.join(HOSTED_DIR, userId, botId);
}

function detectMainFile(dir: string): string {
  const candidates = ["index.js", "bot.js", "app.js", "main.js", "server.js", "src/index.js", "src/bot.js"];
  for (const f of candidates) {
    if (fs.existsSync(path.join(dir, f))) return f;
  }
  const pkg = path.join(dir, "package.json");
  if (fs.existsSync(pkg)) {
    try {
      const pkgJson = JSON.parse(fs.readFileSync(pkg, "utf8"));
      if (pkgJson.main) return pkgJson.main;
      if (pkgJson.scripts?.start) {
        const startScript = pkgJson.scripts.start;
        const match = startScript.match(/node\s+(\S+)/);
        if (match) return match[1];
      }
    } catch {}
  }
  return "index.js";
}

function listFilesRecursive(dir: string, base = ""): string[] {
  const result: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    if (entry.isDirectory()) {
      result.push(...listFilesRecursive(path.join(dir, entry.name), rel));
    } else {
      result.push(rel);
    }
  }
  return result;
}

router.post("/", requireAuth, createResourceLimiter, upload.single("file"), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { name, githubUrl } = req.body as { name?: string; githubUrl?: string };

    logger.info({ body: req.body, hasFile: !!req.file, contentType: req.headers["content-type"] }, "Hosted bot creation request");

    if (!name) {
      res.status(400).json({ message: "Nome é obrigatório" });
      return;
    }

    const botId = uuidv4();
    const botDir = getBotDir(userId, botId);
    fs.mkdirSync(botDir, { recursive: true });

    let sourceType = "zip";

    if (githubUrl) {
      sourceType = "github";

      const cleanUrl = githubUrl.trim().replace(/\/+$/, "");
      if (!GITHUB_URL_RE.test(cleanUrl)) {
        fs.rmSync(botDir, { recursive: true, force: true });
        logger.warn({ userId, githubUrl }, "Blocked invalid GitHub URL for hosted bot");
        res.status(400).json({ message: "URL inválida. Apenas repositórios públicos do GitHub são aceitos (https://github.com/user/repo)." });
        return;
      }

      try {
        execSync("git clone --depth 1 -- " + JSON.stringify(cleanUrl) + " .", {
          cwd: botDir,
          timeout: 60000,
          stdio: "pipe",
          env: { PATH: process.env.PATH ?? "/usr/bin:/bin", HOME: botDir, GIT_TERMINAL_PROMPT: "0" },
        });
      } catch (err) {
        fs.rmSync(botDir, { recursive: true, force: true });
        res.status(400).json({ message: "Erro ao clonar repositório. Verifique a URL." });
        return;
      }
    } else if (req.file) {
      try {
        const zip = new AdmZip(req.file.buffer);
        const entries = zip.getEntries();

        const botDirBoundary = path.resolve(botDir) + path.sep;
        for (const entry of entries) {
          const resolved = path.resolve(botDir, entry.entryName);
          if (!resolved.startsWith(botDirBoundary) && resolved !== path.resolve(botDir)) {
            fs.rmSync(botDir, { recursive: true, force: true });
            logger.warn({ userId, entryName: entry.entryName }, "Blocked path traversal in ZIP upload");
            res.status(400).json({ message: "Arquivo ZIP contém caminhos inválidos" });
            return;
          }
        }

        const hasRootFolder = entries.length > 0 &&
          entries.every(e => e.entryName.startsWith(entries[0].entryName.split("/")[0] + "/"));

        if (hasRootFolder) {
          const rootFolder = entries[0].entryName.split("/")[0];
          zip.extractAllTo(botDir, true);
          const innerDir = path.join(botDir, rootFolder);
          if (fs.existsSync(innerDir)) {
            const innerEntries = fs.readdirSync(innerDir);
            for (const e of innerEntries) {
              fs.renameSync(path.join(innerDir, e), path.join(botDir, e));
            }
            fs.rmSync(innerDir, { recursive: true, force: true });
          }
        } else {
          zip.extractAllTo(botDir, true);
        }
      } catch {
        fs.rmSync(botDir, { recursive: true, force: true });
        res.status(400).json({ message: "Erro ao extrair arquivo ZIP" });
        return;
      }
    } else {
      fs.rmSync(botDir, { recursive: true, force: true });
      res.status(400).json({ message: "Envie um arquivo ZIP ou forneça uma URL do GitHub" });
      return;
    }

    const mainFile = detectMainFile(botDir);

    await db.insert(hostedBotsTable).values({
      id: botId,
      userId,
      name,
      sourceType,
      githubUrl: githubUrl ?? null,
      mainFile,
      status: "stopped",
    });

    const files = listFilesRecursive(botDir);

    res.json({
      id: botId,
      name,
      sourceType,
      mainFile,
      status: "stopped",
      files,
    });
  } catch (err) {
    req.log.error({ err }, "CreateHostedBot error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const bots = await db.select().from(hostedBotsTable).where(eq(hostedBotsTable.userId, userId));

    const result = bots.map((b) => ({
      ...b,
      isRunning: processManager.isRunning(b.id),
      status: processManager.isRunning(b.id) ? "running" : b.status,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "ListHostedBots error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const botId = req.params.id;
    const [bot] = await db.select().from(hostedBotsTable)
      .where(and(eq(hostedBotsTable.id, botId), eq(hostedBotsTable.userId, userId)));

    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }

    const botDir = getBotDir(userId, botId);
    const files = fs.existsSync(botDir) ? listFilesRecursive(botDir) : [];

    res.json({
      ...bot,
      isRunning: processManager.isRunning(botId),
      status: processManager.isRunning(botId) ? "running" : bot.status,
      files,
    });
  } catch (err) {
    req.log.error({ err }, "GetHostedBot error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const botId = req.params.id;

    const [bot] = await db.select().from(hostedBotsTable)
      .where(and(eq(hostedBotsTable.id, botId), eq(hostedBotsTable.userId, userId)));

    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }

    processManager.stop(botId);

    const botDir = getBotDir(userId, botId);
    if (fs.existsSync(botDir)) {
      fs.rmSync(botDir, { recursive: true, force: true });
    }

    await db.delete(hostedBotsTable)
      .where(and(eq(hostedBotsTable.id, botId), eq(hostedBotsTable.userId, userId)));

    res.json({ message: "Bot removido com sucesso" });
  } catch (err) {
    req.log.error({ err }, "DeleteHostedBot error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/:id/start", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const botId = req.params.id;

    const [bot] = await db.select().from(hostedBotsTable)
      .where(and(eq(hostedBotsTable.id, botId), eq(hostedBotsTable.userId, userId)));

    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }

    if (processManager.isRunning(botId)) {
      res.status(400).json({ message: "Bot já está rodando" });
      return;
    }

    const botDir = getBotDir(userId, botId);
    if (!fs.existsSync(botDir)) {
      res.status(400).json({ message: "Arquivos do bot não encontrados" });
      return;
    }

    const mainFile = bot.mainFile ?? "index.js";
    const hasPackageJson = fs.existsSync(path.join(botDir, "package.json"));
    const managed = processManager.startBot(botId, userId, botDir, mainFile, hasPackageJson);

    await db.update(hostedBotsTable)
      .set({ status: "running", pid: managed.proc.pid ?? null })
      .where(eq(hostedBotsTable.id, botId));

    processManager.on(`exit:${botId}`, async () => {
      await db.update(hostedBotsTable)
        .set({ status: "stopped", pid: null })
        .where(eq(hostedBotsTable.id, botId));
    });

    res.json({ message: "Bot iniciado", pid: managed.proc.pid });
  } catch (err) {
    req.log.error({ err }, "StartHostedBot error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/:id/stop", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const botId = req.params.id;

    const [bot] = await db.select().from(hostedBotsTable)
      .where(and(eq(hostedBotsTable.id, botId), eq(hostedBotsTable.userId, userId)));

    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }

    processManager.stop(botId);

    await db.update(hostedBotsTable)
      .set({ status: "stopped", pid: null })
      .where(eq(hostedBotsTable.id, botId));

    res.json({ message: "Bot parado" });
  } catch (err) {
    req.log.error({ err }, "StopHostedBot error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.post("/:id/restart", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const botId = req.params.id;

    const [bot] = await db.select().from(hostedBotsTable)
      .where(and(eq(hostedBotsTable.id, botId), eq(hostedBotsTable.userId, userId)));

    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }

    processManager.stop(botId);

    const botDir = getBotDir(userId, botId);
    const mainFile = bot.mainFile ?? "index.js";
    const hasPackageJson = fs.existsSync(path.join(botDir, "package.json"));
    const managed = processManager.startBot(botId, userId, botDir, mainFile, hasPackageJson);

    await db.update(hostedBotsTable)
      .set({ status: "running", pid: managed.proc.pid ?? null })
      .where(eq(hostedBotsTable.id, botId));

    res.json({ message: "Bot reiniciado", pid: managed.proc.pid });
  } catch (err) {
    req.log.error({ err }, "RestartHostedBot error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/:id/files", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const botId = req.params.id;

    const [bot] = await db.select().from(hostedBotsTable)
      .where(and(eq(hostedBotsTable.id, botId), eq(hostedBotsTable.userId, userId)));

    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }

    const botDir = getBotDir(userId, botId);
    const files = fs.existsSync(botDir) ? listFilesRecursive(botDir) : [];
    res.json({ files });
  } catch (err) {
    req.log.error({ err }, "ListHostedBotFiles error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/:id/logs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const botId = req.params.id;

    const [bot] = await db.select().from(hostedBotsTable)
      .where(and(eq(hostedBotsTable.id, botId), eq(hostedBotsTable.userId, userId)));

    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }

    const logs = processManager.getLogs(botId);
    res.json({ logs });
  } catch (err) {
    req.log.error({ err }, "GetHostedBotLogs error");
    res.status(500).json({ message: "Erro interno" });
  }
});

router.get("/:id/file", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const botId = req.params.id;
    const filePath = req.query.path as string;

    if (!filePath) {
      res.status(400).json({ message: "path é obrigatório" });
      return;
    }

    const [bot] = await db.select().from(hostedBotsTable)
      .where(and(eq(hostedBotsTable.id, botId), eq(hostedBotsTable.userId, userId)));

    if (!bot) {
      res.status(404).json({ message: "Bot não encontrado" });
      return;
    }

    const botDir = getBotDir(userId, botId);
    const botDirRoot = path.resolve(botDir) + path.sep;
    const resolved = path.resolve(botDir, filePath);
    if (!resolved.startsWith(botDirRoot)) {
      logger.warn({ userId, botId, filePath }, "Blocked file access outside bot directory");
      res.status(403).json({ message: "Acesso negado" });
      return;
    }

    if (!fs.existsSync(resolved)) {
      res.status(404).json({ message: "Arquivo não encontrado" });
      return;
    }

    const content = fs.readFileSync(resolved, "utf8");
    res.json({ path: filePath, content });
  } catch (err) {
    req.log.error({ err }, "ReadHostedBotFile error");
    res.status(500).json({ message: "Erro interno" });
  }
});

export default router;
