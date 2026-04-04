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
const warnCounts = new Map<string, Map<string, number>>();

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
  sourceHandle?: string;
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

async function isGroupAdmin(
  sock: ReturnType<typeof makeWASocket>,
  jid: string,
  participant: string,
): Promise<boolean> {
  try {
    const meta = await sock.groupMetadata(jid);
    const baseNum = participant.split("@")[0].split(":")[0];
    return meta.participants.some(
      (p) =>
        p.id.split("@")[0].split(":")[0] === baseNum &&
        (p.admin === "admin" || p.admin === "superadmin"),
    );
  } catch {
    return false;
  }
}

async function isBotAdmin(
  sock: ReturnType<typeof makeWASocket>,
  jid: string,
): Promise<boolean> {
  try {
    const botJid = sock.user?.id || "";
    return await isGroupAdmin(sock, jid, botJid);
  } catch {
    return false;
  }
}

function getMentionedJid(msg: WAMessage): string | null {
  const mentioned =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (mentioned && mentioned.length > 0) return mentioned[0];
  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  if (quoted?.participant) return quoted.participant;
  return null;
}

function messageHasMedia(msg: WAMessage, type: "image" | "video" | "sticker" | "any"): boolean {
  const m = msg.message;
  if (!m) return false;

  const hasImage = !!(m.imageMessage || m.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage);
  const hasVideo = !!(m.videoMessage || m.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage);
  const hasSticker = !!(m.stickerMessage || m.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage);

  switch (type) {
    case "image": return hasImage;
    case "video": return hasVideo;
    case "sticker": return hasSticker;
    case "any": return hasImage || hasVideo || hasSticker;
  }
}

function messageContainsLink(msg: WAMessage): boolean {
  const text = getMessageText(msg);
  return /https?:\/\/[^\s]+|chat\.whatsapp\.com\/[^\s]+/i.test(text);
}

async function executeFlow(
  sock: ReturnType<typeof makeWASocket>,
  msg: WAMessage,
  startNode: FlowNode,
  nodes: FlowNode[],
  edges: FlowEdge[],
  botId: string,
): Promise<void> {
  const jid = msg.key.remoteJid;
  if (!jid) return;

  const isGroup = jid.endsWith("@g.us");
  const sender = msg.key.participant || msg.key.remoteJid || "";
  const text = getMessageText(msg);

  let currentId: string | null = startNode.id;

  while (currentId) {
    const node = nodes.find((n) => n.id === currentId);
    if (!node) break;

    if (node.type === "response") {
      const responseText = (node.config?.text as string) || node.label;
      if (responseText) {
        const processed = responseText
          .replace(/{user}/g, `@${sender.split("@")[0]}`)
          .replace(/{group}/g, jid.split("@")[0])
          .replace(/{botname}/g, "Bot");
        await sock.sendMessage(
          jid,
          { text: processed, mentions: processed.includes("@") ? [sender] : [] },
          { quoted: msg },
        );
      }
    } else if (node.type === "action") {
      const action = node.config?.action as string;
      const actionMessage = node.config?.message as string;

      try {
        switch (action) {
          case "make_sticker": {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const directImage = msg.message?.imageMessage;
            const directVideo = msg.message?.videoMessage;
            const hasQuotedImage = !!quoted?.imageMessage;
            const hasQuotedVideo = !!quoted?.videoMessage;

            if (!directImage && !directVideo && !hasQuotedImage && !hasQuotedVideo) {
              await sock.sendMessage(jid, {
                text: actionMessage || "⚠️ Responda a uma imagem ou vídeo para criar uma figurinha!",
              }, { quoted: msg });
            } else {
              let buffer: Buffer;
              if (directImage || directVideo) {
                buffer = await downloadMediaMessage(msg, "buffer", {}) as Buffer;
              } else {
                const quotedMsg: WAMessage = {
                  key: {
                    remoteJid: jid,
                    id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId,
                    fromMe: false,
                  },
                  message: quoted,
                };
                buffer = await downloadMediaMessage(quotedMsg, "buffer", {}) as Buffer;
              }
              await sock.sendMessage(jid, { sticker: buffer }, { quoted: msg });
            }
            break;
          }

          case "kick_member": {
            if (!isGroup) break;
            const kickSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!kickSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            const target = getMentionedJid(msg);
            if (!target) { await sock.sendMessage(jid, { text: "⚠️ Mencione o membro para remover." }, { quoted: msg }); break; }
            if (await isBotAdmin(sock, jid)) {
              await sock.groupParticipantsUpdate(jid, [target], "remove");
              if (actionMessage) await sock.sendMessage(jid, { text: actionMessage });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin para remover membros." }, { quoted: msg });
            }
            break;
          }

          case "ban_member": {
            if (!isGroup) break;
            const banSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!banSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            const banTarget = getMentionedJid(msg);
            if (!banTarget) { await sock.sendMessage(jid, { text: "⚠️ Mencione o membro para banir." }, { quoted: msg }); break; }
            if (await isBotAdmin(sock, jid)) {
              await sock.groupParticipantsUpdate(jid, [banTarget], "remove");
              if (actionMessage) await sock.sendMessage(jid, { text: actionMessage });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin para banir membros." }, { quoted: msg });
            }
            break;
          }

          case "promote_member": {
            if (!isGroup) break;
            const promSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!promSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            const promTarget = getMentionedJid(msg);
            if (!promTarget) {
              await sock.sendMessage(jid, { text: "⚠️ Mencione o membro para promover." }, { quoted: msg });
              break;
            }
            if (await isBotAdmin(sock, jid)) {
              await sock.groupParticipantsUpdate(jid, [promTarget], "promote");
              await sock.sendMessage(jid, {
                text: actionMessage || `✅ @${promTarget.split("@")[0]} foi promovido a admin!`,
                mentions: [promTarget],
              });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin para promover membros." }, { quoted: msg });
            }
            break;
          }

          case "demote_member": {
            if (!isGroup) break;
            const demSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!demSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            const demTarget = getMentionedJid(msg);
            if (!demTarget) {
              await sock.sendMessage(jid, { text: "⚠️ Mencione o membro para rebaixar." }, { quoted: msg });
              break;
            }
            if (await isBotAdmin(sock, jid)) {
              await sock.groupParticipantsUpdate(jid, [demTarget], "demote");
              await sock.sendMessage(jid, {
                text: actionMessage || `✅ @${demTarget.split("@")[0]} foi rebaixado.`,
                mentions: [demTarget],
              });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin para rebaixar membros." }, { quoted: msg });
            }
            break;
          }

          case "warn_member": {
            if (!isGroup) break;
            const warnSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!warnSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            const warnTarget = getMentionedJid(msg);
            if (!warnTarget) { await sock.sendMessage(jid, { text: "⚠️ Mencione o membro para avisar." }, { quoted: msg }); break; }
            if (!warnCounts.has(jid)) warnCounts.set(jid, new Map());
            const groupWarns = warnCounts.get(jid)!;
            const current = (groupWarns.get(warnTarget) || 0) + 1;
            const maxWarns = Number(node.config?.max_warns) || 3;
            groupWarns.set(warnTarget, current);

            if (current >= maxWarns) {
              groupWarns.delete(warnTarget);
              if (await isBotAdmin(sock, jid)) {
                await sock.groupParticipantsUpdate(jid, [warnTarget], "remove");
                await sock.sendMessage(jid, {
                  text: `⚠️ @${warnTarget.split("@")[0]} atingiu ${maxWarns} avisos e foi removido!`,
                  mentions: [warnTarget],
                });
              }
            } else {
              await sock.sendMessage(jid, {
                text: actionMessage || `⚠️ @${warnTarget.split("@")[0]} recebeu um aviso! (${current}/${maxWarns})`,
                mentions: [warnTarget],
              });
            }
            break;
          }

          case "reset_warns": {
            if (!isGroup) break;
            const resetTarget = getMentionedJid(msg);
            if (resetTarget && warnCounts.has(jid)) {
              warnCounts.get(jid)!.delete(resetTarget);
              await sock.sendMessage(jid, {
                text: actionMessage || `✅ Avisos de @${resetTarget.split("@")[0]} foram resetados.`,
                mentions: [resetTarget],
              });
            }
            break;
          }

          case "mute_group": {
            if (!isGroup) break;
            const muteSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!muteSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            if (await isBotAdmin(sock, jid)) {
              await sock.groupSettingUpdate(jid, "announcement");
              await sock.sendMessage(jid, { text: actionMessage || "🔇 Grupo silenciado. Apenas admins podem enviar mensagens." });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin para silenciar o grupo." }, { quoted: msg });
            }
            break;
          }

          case "unmute_group": {
            if (!isGroup) break;
            const unmuteSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!unmuteSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            if (await isBotAdmin(sock, jid)) {
              await sock.groupSettingUpdate(jid, "not_announcement");
              await sock.sendMessage(jid, { text: actionMessage || "🔊 Grupo aberto. Todos podem enviar mensagens." });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin para abrir o grupo." }, { quoted: msg });
            }
            break;
          }

          case "get_group_link": {
            if (!isGroup) break;
            if (await isBotAdmin(sock, jid)) {
              const code = await sock.groupInviteCode(jid);
              await sock.sendMessage(jid, {
                text: `🔗 Link do grupo:\nhttps://chat.whatsapp.com/${code}`,
              }, { quoted: msg });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin para gerar o link." }, { quoted: msg });
            }
            break;
          }

          case "revoke_group_link": {
            if (!isGroup) break;
            const revokeSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!revokeSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            if (await isBotAdmin(sock, jid)) {
              await sock.groupRevokeInvite(jid);
              await sock.sendMessage(jid, { text: actionMessage || "✅ Link do grupo revogado! Gere um novo com o comando de link." });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin para revogar o link." }, { quoted: msg });
            }
            break;
          }

          case "hidetag": {
            if (!isGroup) break;
            const hideSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!hideSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            try {
              const meta = await sock.groupMetadata(jid);
              const allJids = meta.participants.map((p) => p.id);
              const tagText = actionMessage || text.split(" ").slice(1).join(" ") || "📢 Atenção!";
              await sock.sendMessage(jid, { text: tagText, mentions: allJids });
            } catch {
              await sock.sendMessage(jid, { text: "❌ Erro ao marcar todos." }, { quoted: msg });
            }
            break;
          }

          case "group_info": {
            if (!isGroup) break;
            try {
              const meta = await sock.groupMetadata(jid);
              const admins = meta.participants.filter(
                (p) => p.admin === "admin" || p.admin === "superadmin",
              );
              const infoText =
                `📋 *Informações do Grupo*\n\n` +
                `🏠 Nome: *${meta.subject}*\n` +
                `👥 Membros: *${meta.participants.length}*\n` +
                `👑 Admins: *${admins.length}*\n` +
                `📝 Descrição: ${meta.desc || "Sem descrição"}`;
              await sock.sendMessage(jid, { text: infoText }, { quoted: msg });
            } catch {
              await sock.sendMessage(jid, { text: "❌ Erro ao obter informações." }, { quoted: msg });
            }
            break;
          }

          case "close_group": {
            if (!isGroup) break;
            const closeSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!closeSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            if (await isBotAdmin(sock, jid)) {
              await sock.groupSettingUpdate(jid, "announcement");
              await sock.sendMessage(jid, { text: actionMessage || "🔒 Grupo fechado. Apenas admins podem enviar mensagens." });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin para fechar o grupo." }, { quoted: msg });
            }
            break;
          }

          case "open_group": {
            if (!isGroup) break;
            const openSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!openSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            if (await isBotAdmin(sock, jid)) {
              await sock.groupSettingUpdate(jid, "not_announcement");
              await sock.sendMessage(jid, { text: actionMessage || "🔓 Grupo aberto. Todos podem enviar mensagens." });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin para abrir o grupo." }, { quoted: msg });
            }
            break;
          }

          case "antilink": {
            break;
          }

          case "react_message": {
            const emoji = (node.config?.emoji as string) || "👍";
            await sock.sendMessage(jid, {
              react: { text: emoji, key: msg.key },
            });
            break;
          }

          case "send_image": {
            const imgUrl = node.config?.image_url as string;
            const imgCaption = actionMessage || "";
            if (imgUrl) {
              await sock.sendMessage(jid, {
                image: { url: imgUrl },
                caption: imgCaption,
              }, { quoted: msg });
            }
            break;
          }

          case "delete_message": {
            if (!isGroup) break;
            const quotedCtx = msg.message?.extendedTextMessage?.contextInfo;
            if (quotedCtx?.stanzaId) {
              await sock.sendMessage(jid, {
                delete: {
                  remoteJid: jid,
                  fromMe: false,
                  id: quotedCtx.stanzaId,
                  participant: quotedCtx.participant || sender,
                },
              });
            }
            break;
          }

          default:
            if (actionMessage) {
              await sock.sendMessage(jid, { text: actionMessage }, { quoted: msg });
            }
            break;
        }
      } catch (err) {
        logger.error({ err, action, botId }, "Action execution error");
      }
    } else if (node.type === "condition") {
      const condition = node.config?.condition as string;
      let result = false;

      try {
        switch (condition) {
          case "is_group":
            result = isGroup;
            break;
          case "is_private":
            result = !isGroup;
            break;
          case "is_admin":
            result = isGroup ? await isGroupAdmin(sock, jid, sender) : false;
            break;
          case "is_not_admin":
            result = isGroup ? !(await isGroupAdmin(sock, jid, sender)) : true;
            break;
          case "is_bot_admin":
            result = isGroup ? await isBotAdmin(sock, jid) : false;
            break;
          case "has_image":
            result = messageHasMedia(msg, "image");
            break;
          case "has_video":
            result = messageHasMedia(msg, "video");
            break;
          case "has_sticker":
            result = messageHasMedia(msg, "sticker");
            break;
          case "has_media":
            result = messageHasMedia(msg, "any");
            break;
          case "contains_link":
            result = messageContainsLink(msg);
            break;
          case "contains_text": {
            const searchValue = (node.config?.value as string) || "";
            result = searchValue ? text.toLowerCase().includes(searchValue.toLowerCase()) : false;
            break;
          }
          case "has_mention":
            result = !!getMentionedJid(msg);
            break;
          case "is_reply":
            result = !!msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
            break;
          default:
            result = false;
        }
      } catch {
        result = false;
      }

      const outEdges = edges.filter((e) => e.source === currentId);

      if (result) {
        const trueEdge = outEdges.find((e) => e.sourceHandle === "true") || outEdges[0];
        currentId = trueEdge?.target ?? null;
      } else {
        const falseEdge = outEdges.find((e) => e.sourceHandle === "false") || (outEdges.length > 1 ? outEdges[1] : null);
        currentId = falseEdge?.target ?? null;
      }
      continue;
    }

    const nextEdge = edges.find((e) => e.source === currentId);
    currentId = nextEdge?.target ?? null;
  }
}

async function handleAntilink(
  sock: ReturnType<typeof makeWASocket>,
  msg: WAMessage,
  nodes: FlowNode[],
): Promise<boolean> {
  const jid = msg.key.remoteJid;
  if (!jid || !jid.endsWith("@g.us")) return false;
  const text = getMessageText(msg);
  if (!text) return false;

  const antilinkNode = nodes.find(
    (n) => n.type === "action" && n.config?.action === "antilink",
  );
  if (!antilinkNode) return false;

  const hasLink = /https?:\/\/[^\s]+|chat\.whatsapp\.com\/[^\s]+/i.test(text);
  if (!hasLink) return false;

  const sender = msg.key.participant || msg.key.remoteJid || "";
  const senderIsAdmin = await isGroupAdmin(sock, jid, sender);
  if (senderIsAdmin) return false;

  if (!(await isBotAdmin(sock, jid))) return false;

  const warnMsg = (antilinkNode.config?.message as string) || "⚠️ Links não são permitidos neste grupo!";
  await sock.sendMessage(jid, { text: warnMsg, mentions: [sender] });

  try {
    const quotedCtx = msg.key;
    if (quotedCtx.id) {
      await sock.sendMessage(jid, {
        delete: {
          remoteJid: jid,
          fromMe: false,
          id: quotedCtx.id,
          participant: sender,
        },
      });
    }
  } catch {}

  const shouldKick = antilinkNode.config?.kick_on_link === true;
  if (shouldKick) {
    await sock.groupParticipantsUpdate(jid, [sender], "remove");
  }

  return true;
}

async function processMessage(
  botId: string,
  sock: ReturnType<typeof makeWASocket>,
  msg: WAMessage,
): Promise<void> {
  try {
    const text = getMessageText(msg).trim();
    const jid = msg.key.remoteJid;
    if (!jid) return;

    const [bot] = await db.select().from(botsTable).where(eq(botsTable.id, botId));
    if (!bot) return;

    const [commands] = await db.select().from(botCommandsTable).where(eq(botCommandsTable.botId, botId));
    if (!commands) return;

    const nodes = (commands.nodes as FlowNode[]) || [];
    const edges = (commands.edges as FlowEdge[]) || [];

    if (await handleAntilink(sock, msg, nodes)) return;

    if (!text) return;

    const prefix = bot.prefix || ".";
    if (!text.startsWith(prefix)) return;

    const commandText = text.slice(prefix.length).trim().toLowerCase().split(/\s+/)[0];
    if (!commandText) return;

    const commandNode = nodes.find(
      (n) =>
        n.type === "command" &&
        ((n.config?.trigger as string) || n.label)
          .replace(/^[^a-zA-Z0-9]/, "")
          .toLowerCase() === commandText,
    );

    if (!commandNode) return;

    logger.info({ botId, command: commandText, jid }, "Executing command");
    await executeFlow(sock, msg, commandNode, nodes, edges, botId);
  } catch (err) {
    logger.error({ err, botId }, "Error processing message");
  }
}

export async function restoreSessions(): Promise<void> {
  try {
    const connectedBots = await db
      .select()
      .from(botsTable)
      .where(eq(botsTable.status, "connected"));

    logger.info({ count: connectedBots.length }, "Restoring WhatsApp sessions");

    for (const bot of connectedBots) {
      const sessionPath = path.join(SESSION_DIR, bot.id);
      if (fs.existsSync(sessionPath)) {
        try {
          await startWhatsAppSession(bot.id, (bot.connectionType as "qrcode" | "code") || "code", bot.phone || undefined);
          logger.info({ botId: bot.id, name: bot.name }, "Session restored");
        } catch (err) {
          logger.error({ err, botId: bot.id }, "Failed to restore session");
        }
      } else {
        logger.warn({ botId: bot.id }, "No session files found, marking as disconnected");
        await db
          .update(botsTable)
          .set({ status: "disconnected", qrCode: null, pairCode: null })
          .where(eq(botsTable.id, bot.id));
      }
    }
  } catch (err) {
    logger.error({ err }, "Error restoring sessions");
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
