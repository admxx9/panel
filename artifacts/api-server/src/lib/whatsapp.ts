import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  downloadMediaMessage,
  type WAMessage,
} from "baileys";
import { Boom } from "@hapi/boom";
import { toDataURL } from "qrcode";
import path from "path";
import fs from "fs";
import { logger } from "./logger.js";
import { db, botsTable, botCommandsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Response } from "express";

const SESSION_DIR = "/tmp/baileys-sessions";

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

const sessions = new Map<string, ReturnType<typeof makeWASocket>>();
const sseClients = new Map<string, Set<Response>>();

export function addSseClient(botId: string, res: Response) {
  if (!sseClients.has(botId)) sseClients.set(botId, new Set());
  sseClients.get(botId)!.add(res);
}

export function removeSseClient(botId: string, res: Response) {
  sseClients.get(botId)?.delete(res);
  if (sseClients.get(botId)?.size === 0) sseClients.delete(botId);
}

function sendSse(botId: string, event: string, data: unknown) {
  const clients = sseClients.get(botId);
  if (!clients) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
    }
  }
}

type FlowNode = {
  id: string;
  type: "command" | "action" | "condition" | "response";
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
};

type FlowEdge = {
  id: string;
  source: string;
  target: string;
};

function getMessageText(msg: WAMessage): string {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    ""
  );
}

async function executeFlow(
  sock: ReturnType<typeof makeWASocket>,
  msg: WAMessage,
  startNode: FlowNode,
  nodes: FlowNode[],
  edges: FlowEdge[],
): Promise<void> {
  const jid = msg.key.remoteJid;
  if (!jid) return;

  let currentId: string | null = startNode.id;

  while (currentId) {
    const node = nodes.find((n) => n.id === currentId);
    if (!node) break;

    if (node.type === "response") {
      const text = (node.config?.text as string) || node.label;
      if (text) {
        await sock.sendMessage(jid, { text }, { quoted: msg });
      }
    } else if (node.type === "action") {
      const action = node.config?.action as string;

      if (action === "make_sticker") {
        try {
          const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          const hasImage = !!quoted?.imageMessage;
          const hasVideo = !!quoted?.videoMessage;

          if (!hasImage && !hasVideo) {
            await sock.sendMessage(jid, {
              text: "⚠️ Responda a uma imagem ou vídeo com *" + (msg.message?.extendedTextMessage?.text || ".sticker") + "* para criar uma figurinha!",
            }, { quoted: msg });
          } else {
            const quotedMsg: WAMessage = {
              key: {
                remoteJid: jid,
                id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId,
                fromMe: false,
              },
              message: quoted,
            };
            const buffer = await downloadMediaMessage(quotedMsg, "buffer", {}) as Buffer;
            await sock.sendMessage(jid, { sticker: buffer }, { quoted: msg });
          }
        } catch (err) {
          logger.error({ err }, "Sticker creation error");
          await sock.sendMessage(jid, { text: "❌ Erro ao criar figurinha." }, { quoted: msg });
        }
      } else if (action === "kick_member") {
        try {
          const sender = msg.key.participant || msg.key.remoteJid || "";
          if (jid.endsWith("@g.us")) {
            await sock.groupParticipantsUpdate(jid, [sender], "remove");
          }
        } catch (err) {
          logger.error({ err }, "Kick error");
        }
      } else if (action === "ban_member") {
        try {
          const sender = msg.key.participant || msg.key.remoteJid || "";
          if (jid.endsWith("@g.us")) {
            await sock.groupParticipantsUpdate(jid, [sender], "remove");
          }
        } catch (err) {
          logger.error({ err }, "Ban error");
        }
      }
    }

    const nextEdge = edges.find((e) => e.source === currentId);
    currentId = nextEdge?.target ?? null;
  }
}

async function processMessage(
  botId: string,
  sock: ReturnType<typeof makeWASocket>,
  msg: WAMessage,
): Promise<void> {
  try {
    const text = getMessageText(msg).trim();
    if (!text) return;

    const [bot] = await db.select().from(botsTable).where(eq(botsTable.id, botId));
    if (!bot) return;

    const prefix = bot.prefix || ".";
    if (!text.startsWith(prefix)) return;

    const commandText = text.slice(prefix.length).trim().toLowerCase().split(/\s+/)[0];
    if (!commandText) return;

    const [commands] = await db.select().from(botCommandsTable).where(eq(botCommandsTable.botId, botId));
    if (!commands) return;

    const nodes = (commands.nodes as FlowNode[]) || [];
    const edges = (commands.edges as FlowEdge[]) || [];

    const commandNode = nodes.find(
      (n) =>
        n.type === "command" &&
        ((n.config?.trigger as string) || n.label)
          .replace(/^[^a-zA-Z0-9]/, "")
          .toLowerCase() === commandText,
    );

    if (!commandNode) return;

    await executeFlow(sock, msg, commandNode, nodes, edges);
  } catch (err) {
    logger.error({ err, botId }, "Error processing message");
  }
}

export async function startWhatsAppSession(
  botId: string,
  type: "qrcode" | "code",
  phone?: string,
): Promise<void> {
  const existing = sessions.get(botId);
  if (existing) {
    try {
      existing.end(undefined as any);
    } catch {}
    sessions.delete(botId);
  }

  const sessionPath = path.join(SESSION_DIR, botId);
  fs.mkdirSync(sessionPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: logger.child({ botId, baileys: true }) as any,
    browser: Browsers.ubuntu("Chrome"),
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
  });

  sessions.set(botId, sock);

  sock.ev.on("creds.update", async () => {
    try {
      await saveCreds();
    } catch (err: any) {
      if (err?.code !== "ENOENT") {
        logger.error({ err, botId }, "Error saving creds");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type: msgType }) => {
    if (msgType !== "notify") return;
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;
      await processMessage(botId, sock, msg);
    }
  });

  if (type === "code" && phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    setTimeout(async () => {
      try {
        if (!state.creds.registered) {
          const code = await sock.requestPairingCode(cleanPhone);
          const formatted = code?.match(/.{1,4}/g)?.join("-") ?? code;
          logger.info({ botId, code: formatted }, "Pairing code generated");
          sendSse(botId, "paircode", { code: formatted });
          await db
            .update(botsTable)
            .set({ pairCode: formatted, status: "connecting", phone: cleanPhone })
            .where(eq(botsTable.id, botId));
        }
      } catch (err: any) {
        logger.error({ err, botId }, "Error requesting pairing code");
        sendSse(botId, "error", { message: err?.message ?? "Erro ao gerar código" });
      }
    }, 3000);
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && type === "qrcode") {
      try {
        const qrDataUrl = await toDataURL(qr);
        sendSse(botId, "qr", { qrCode: qrDataUrl });
        await db
          .update(botsTable)
          .set({ qrCode: qr, status: "connecting" })
          .where(eq(botsTable.id, botId));
      } catch (err) {
        logger.error({ err, botId }, "Error generating QR Data URL");
      }
    }

    if (connection === "open") {
      const rawId = sock.user?.id ?? "";
      const phoneNumber = rawId.split(":")[0].split("@")[0] || phone?.replace(/\D/g, "") || "";
      logger.info({ botId, phoneNumber }, "WhatsApp connected");
      await db
        .update(botsTable)
        .set({
          status: "connected",
          phone: phoneNumber,
          connectedAt: new Date(),
          qrCode: null,
          pairCode: null,
        })
        .where(eq(botsTable.id, botId));
      sendSse(botId, "status", { status: "connected", phone: phoneNumber });
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      logger.info({ botId, statusCode, loggedOut }, "WhatsApp connection closed");

      if (!loggedOut) {
        sessions.delete(botId);
        setTimeout(() => startWhatsAppSession(botId, type, phone), 5000);
      } else {
        sessions.delete(botId);
        const sessionPath = path.join(SESSION_DIR, botId);
        fs.rmSync(sessionPath, { recursive: true, force: true });
        await db
          .update(botsTable)
          .set({ status: "disconnected", qrCode: null, pairCode: null })
          .where(eq(botsTable.id, botId));
        sendSse(botId, "status", { status: "disconnected" });
      }
    }
  });
}

export async function disconnectWhatsApp(botId: string): Promise<void> {
  const sock = sessions.get(botId);
  if (sock) {
    try {
      await sock.logout();
    } catch {}
    sessions.delete(botId);
  }
  const sessionPath = path.join(SESSION_DIR, botId);
  fs.rmSync(sessionPath, { recursive: true, force: true });
  await db
    .update(botsTable)
    .set({ status: "disconnected", qrCode: null, pairCode: null })
    .where(eq(botsTable.id, botId));
}

export function isSessionActive(botId: string): boolean {
  return sessions.has(botId);
}
