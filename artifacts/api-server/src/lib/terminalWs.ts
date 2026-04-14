import type { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { processManager } from "./processManager.js";
import { logger } from "./logger.js";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "botaluguel-secret-dev";

interface TerminalClient {
  ws: WebSocket;
  botId: string;
  userId: string;
}

const clients = new Map<string, Set<TerminalClient>>();

export function setupTerminalWs(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    if (!url.pathname.startsWith("/api/terminal/")) {
      socket.destroy();
      return;
    }

    const botId = url.pathname.split("/api/terminal/")[1];
    const token = url.searchParams.get("token");

    if (!botId || !token) {
      socket.destroy();
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, decoded.userId, botId);
      });
    } catch {
      socket.destroy();
    }
  });

  wss.on("connection", (ws: WebSocket, userId: string, botId: string) => {
    const client: TerminalClient = { ws, botId, userId };

    if (!clients.has(botId)) {
      clients.set(botId, new Set());
    }
    clients.get(botId)!.add(client);

    logger.info({ botId, userId }, "Terminal WebSocket connected");

    ws.send(JSON.stringify({ type: "connected", botId }));

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === "stdin") {
          processManager.write(botId, msg.data);
        }
      } catch {
        const data = raw.toString();
        processManager.write(botId, data);
      }
    });

    ws.on("close", () => {
      const set = clients.get(botId);
      if (set) {
        set.delete(client);
        if (set.size === 0) clients.delete(botId);
      }
    });

    const onStdout = (data: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "stdout", data }));
      }
    };

    const onStderr = (data: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "stderr", data }));
      }
    };

    const onExit = (info: { code: number | null; signal: string | null }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "exit", ...info }));
      }
    };

    processManager.on(`stdout:${botId}`, onStdout);
    processManager.on(`stderr:${botId}`, onStderr);
    processManager.on(`exit:${botId}`, onExit);

    ws.on("close", () => {
      processManager.removeListener(`stdout:${botId}`, onStdout);
      processManager.removeListener(`stderr:${botId}`, onStderr);
      processManager.removeListener(`exit:${botId}`, onExit);
    });
  });

  return wss;
}
