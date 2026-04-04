import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
} from "baileys";
import { Boom } from "@hapi/boom";
import { toDataURL } from "qrcode";
import path from "path";
import fs from "fs";
import { logger } from "./logger.js";
import { db, botsTable } from "@workspace/db";
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
