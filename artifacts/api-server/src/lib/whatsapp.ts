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
import { sendInteractiveButtons, sendInteractiveList } from "./buttons.js";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { logger } from "./logger.js";
import { v4 as uuidv4 } from "uuid";
import { db, botsTable, botCommandsTable, usersTable, botMessageEventsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import type { Response } from "express";
import { sendExpoPush } from "./expoPush.js";

async function notifyBotOwner(botId: string, title: string, body: string, extraData?: Record<string, string>): Promise<void> {
  try {
    const [bot] = await db.select({ userId: botsTable.userId, name: botsTable.name }).from(botsTable).where(eq(botsTable.id, botId));
    if (!bot) return;
    const [user] = await db.select({ expoPushToken: usersTable.expoPushToken }).from(usersTable).where(eq(usersTable.id, bot.userId));
    if (!user?.expoPushToken) return;
    await sendExpoPush([{
      to: user.expoPushToken,
      title,
      body,
      sound: "default",
      data: { botId, ...extraData },
    }]);
  } catch (err) {
    logger.warn({ err, botId }, "Failed to send push notification to bot owner (non-fatal)");
  }
}

const SESSION_DIR = path.join(process.cwd(), ".baileys-sessions");

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

const sessions = new Map<string, ReturnType<typeof makeWASocket>>();
const reconnectAttempts = new Map<string, number>();
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
  type: "command" | "action" | "condition" | "response" | "buttons";
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
    (msg.message as any)?.buttonsResponseMessage?.selectedButtonId ||
    (msg.message as any)?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    (msg.message as any)?.templateButtonReplyMessage?.selectedId ||
    ""
  );
}

function normalizeJid(jid: string): string {
  return jid.split("@")[0].split(":")[0];
}

async function isGroupAdmin(
  sock: ReturnType<typeof makeWASocket>,
  jid: string,
  participant: string,
): Promise<boolean> {
  try {
    const meta = await sock.groupMetadata(jid);
    const baseNum = normalizeJid(participant);
    return meta.participants.some(
      (p) => {
        const pNum = normalizeJid(p.id);
        const isMatch = pNum === baseNum;
        return isMatch && (p.admin === "admin" || p.admin === "superadmin");
      },
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
    const meta = await sock.groupMetadata(jid);
    const botPhone = normalizeJid(sock.user?.id || "");
    const botLid = sock.user?.lid ? normalizeJid(sock.user.lid) : "";

    return meta.participants.some((p) => {
      const pNum = normalizeJid(p.id);
      const isBot = pNum === botPhone || (botLid && pNum === botLid);
      return isBot && (p.admin === "admin" || p.admin === "superadmin");
    });
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

function messageHasMedia(msg: WAMessage, type: "image" | "video" | "sticker" | "audio" | "any"): boolean {
  const m = msg.message;
  if (!m) return false;

  const hasImage = !!(m.imageMessage || m.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage);
  const hasVideo = !!(m.videoMessage || m.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage);
  const hasSticker = !!(m.stickerMessage || m.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage);
  const hasAudio = !!(m.audioMessage || m.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage);

  switch (type) {
    case "image": return hasImage;
    case "video": return hasVideo;
    case "sticker": return hasSticker;
    case "audio": return hasAudio;
    case "any": return hasImage || hasVideo || hasSticker || hasAudio;
  }
}

function messageContainsLink(msg: WAMessage): boolean {
  const text = getMessageText(msg);
  return /https?:\/\/[^\s]+|chat\.whatsapp\.com\/[^\s]+/i.test(text);
}

const botDisabledSet = new Set<string>();
const welcomeMessages = new Map<string, string>();
const goodbyeMessages = new Map<string, string>();
const floodTracker = new Map<string, { count: number; lastTime: number }>();

const JOKES_BR = [
  "Por que o programador não gosta de natureza? Porque tem muitos bugs! 😂",
  "O que o zero disse para o oito? Bonito cinto! 😂",
  "Qual é o cúmulo da velocidade? Correr ao redor da mesa pra sentar atrás de si mesmo! 😂",
  "O que a impressora disse pro papel? Pode deixar que eu te imprimo! 😂",
  "Por que o livro de matemática está triste? Tem muitos problemas! 😂",
  "O que o café disse pro açúcar? Sem você minha vida é amarga! 😂",
  "Qual animal é o mais antigo? A zebra, porque é em preto e branco! 😂",
  "O que dá um cruzamento de um pato com uma rua? Um pato perdido! 😂",
];

const TRUTHS = [
  "Qual foi a maior vergonha que já passou?",
  "Já mandou mensagem errada pra alguém? Pra quem?",
  "Qual foi a pior comida que já comeu?",
  "Já fingiu gostar de um presente?",
  "Qual seu segredo mais bobo?",
  "Se pudesse trocar de corpo com alguém do grupo, quem seria?",
];

const DARES = [
  "Mande um áudio cantando no grupo!",
  "Mude sua foto de perfil por 1 hora!",
  "Mande 'eu te amo' pro último contato!",
  "Grave um áudio imitando um animal!",
  "Mande um sticker feio no grupo!",
  "Coloque seu status como 'Sou lindo(a)' por 1 hora!",
];

const FORTUNES = [
  "🥠 Grandes oportunidades vêm para quem espera... mas corre também!",
  "🥠 Hoje seu dia será cheio de surpresas boas!",
  "🥠 Alguém especial está pensando em você agora.",
  "🥠 Dinheiro inesperado chegará em breve!",
  "🥠 Um novo começo está mais perto do que imagina.",
  "🥠 Sua paciência será recompensada em dobro!",
  "🥠 Cuidado com links estranhos hoje... 😅",
  "🥠 Você vai rir muito hoje, prepare-se!",
];

async function replaceVars(
  template: string,
  sock: ReturnType<typeof makeWASocket>,
  msg: WAMessage,
  botId: string,
): Promise<string> {
  const jid = msg.key.remoteJid || "";
  const isGroup = jid.endsWith("@g.us");
  const sender = msg.key.participant || msg.key.remoteJid || "";
  const senderNum = normalizeJid(sender);
  const senderName = msg.pushName || senderNum;
  const text = getMessageText(msg);
  const args = text.split(/\s+/).slice(1).join(" ");
  const now = new Date();
  const data = now.toLocaleDateString("pt-BR");
  const hora = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  let groupName = "";
  let membros = "0";
  let adminsCount = "0";
  let donoNum = "";

  if (isGroup) {
    try {
      const meta = await sock.groupMetadata(jid);
      groupName = meta.subject;
      membros = String(meta.participants.length);
      const adminsList = meta.participants.filter(p => p.admin === "admin" || p.admin === "superadmin");
      adminsCount = String(adminsList.length);
      const owner = meta.participants.find(p => p.admin === "superadmin");
      donoNum = owner ? normalizeJid(owner.id) : "";
    } catch {}
  }

  const [bot] = await db.select().from(botsTable).where(eq(botsTable.id, botId));
  const prefix = bot?.prefix || ".";
  const botName = bot?.name || "Bot";

  let userCoins = "0";
  let userPlan = "Free";
  if (bot?.userId) {
    const [owner] = await db.select({ coins: usersTable.coins, plan: usersTable.plan }).from(usersTable).where(eq(usersTable.id, bot.userId));
    if (owner) {
      userCoins = String(owner.coins ?? 0);
      userPlan = owner.plan ?? "Free";
    }
  }

  const quotedText = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text || "";

  let result = template
    .replace(/\{nome\}/g, senderName)
    .replace(/\{user\}/g, `@${senderNum}`)
    .replace(/\{numero\}/g, senderNum)
    .replace(/\{grupo\}/g, groupName)
    .replace(/\{group\}/g, groupName)
    .replace(/\{membros\}/g, membros)
    .replace(/\{admins\}/g, adminsCount)
    .replace(/\{moedas\}/g, userCoins)
    .replace(/\{plano\}/g, userPlan)
    .replace(/\{prefix\}/g, prefix)
    .replace(/\{bot\}/g, botName)
    .replace(/\{botname\}/g, botName)
    .replace(/\{data\}/g, data)
    .replace(/\{hora\}/g, hora)
    .replace(/\{dono\}/g, donoNum)
    .replace(/\{args\}/g, args)
    .replace(/\{quoted\}/g, quotedText);

  return result;
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

  if (botDisabledSet.has(botId)) {
    const [botCheck] = await db.select().from(botsTable).where(eq(botsTable.id, botId));
    const ownerPhone = botCheck?.ownerPhone || botCheck?.phone || "";
    const senderNum = normalizeJid(sender);
    const botOwnNum = normalizeJid(sock.user?.id || "");
    if (senderNum !== ownerPhone && senderNum !== botOwnNum) return;
  }

  function findNextButtonsNode(fromId: string): FlowNode | null {
    const edge = edges.find((e) => e.source === fromId);
    if (!edge) return null;
    const nextNode = nodes.find((n) => n.id === edge.target);
    if (nextNode && nextNode.type === "buttons") return nextNode;
    return null;
  }

  function parseButtonsFromBlock(btnNode: FlowNode): { type: "normal" | "lista" | "ligar"; buttons?: any[]; listData?: any; callData?: any } {
    const tipoBotao = (btnNode.config?.tipoBotao as string) || "normal";
    if (tipoBotao === "normal") {
      const raw = (btnNode.config?.botoes as string) || "";
      const lines = raw.split("\n").filter((l: string) => l.trim()).slice(0, 3);
      const buttons = lines.map((line: string) => {
        const parts = line.split("|").map((s: string) => s.trim());
        return { buttonId: parts[0] || "", buttonText: { displayText: parts[1] || parts[0] || "" }, type: 1 };
      });
      return { type: "normal", buttons };
    }
    if (tipoBotao === "lista") {
      const textoBotao = (btnNode.config?.textoBotao as string) || "VER OPCOES";
      const opcoesRaw = (btnNode.config?.opcoes as string) || "";
      const rows = opcoesRaw.split("\n").filter((l: string) => l.trim()).map((line: string) => {
        const parts = line.split("|").map((s: string) => s.trim());
        return { id: parts[0] || `opt_${Date.now()}`, title: (parts[1] || parts[0] || "Opcao").slice(0, 24), description: parts[2] || undefined };
      });
      return { type: "lista", listData: { textoBotao, rows } };
    }
    if (tipoBotao === "ligar") {
      return { type: "ligar", callData: { textoLigar: (btnNode.config?.textoLigar as string) || "Ligar", numeroLigar: (btnNode.config?.numeroLigar as string) || "" } };
    }
    return { type: "normal" };
  }

  let currentId: string | null = startNode.id;

  while (currentId) {
    const node = nodes.find((n) => n.id === currentId);
    if (!node) break;

    if (node.type === "buttons") {
      const nextEdge = edges.find((e) => e.source === currentId);
      currentId = nextEdge?.target ?? null;
      continue;
    }

    if (node.type === "response") {
      const tipoResposta = (node.config?.tipoResposta as string) || "texto";
      const rawText = (node.config?.texto as string) || (node.config?.text as string) || "";
      const processedText = rawText ? await replaceVars(rawText, sock, msg, botId) : "";
      const mentions = processedText.includes("@") ? [sender] : [];

      const nextBtnNode = findNextButtonsNode(currentId);
      const btnData = nextBtnNode ? parseButtonsFromBlock(nextBtnNode) : null;

      try {
        if (tipoResposta === "texto" || !tipoResposta) {
          const temBotoes = !!node.config?.temBotoes;
          const botoesRaw = (node.config?.botoes as string) || "";

          if (btnData && btnData.type === "normal" && btnData.buttons && btnData.buttons.length > 0) {
            const btns = btnData.buttons.map((b: any) => ({ id: b.buttonId, text: b.buttonText.displayText }));
            await sendInteractiveButtons(sock, jid, {
              text: processedText || "Escolha uma opcao:",
              buttons: btns,
            });
          } else if (btnData && btnData.type === "lista" && btnData.listData) {
            const ld = btnData.listData;
            await sendInteractiveList(sock, jid, {
              text: processedText || "Escolha uma opcao:",
              title: "",
              footer: "",
              buttonText: ld.textoBotao,
              sections: [{ title: "Menu", rows: ld.rows }],
            });
          } else if (btnData && btnData.type === "ligar" && btnData.callData) {
            const cd = btnData.callData;
            await sendInteractiveButtons(sock, jid, {
              text: processedText || "Ligue para nos:",
              buttons: [{ id: `call_${cd.numeroLigar}`, text: cd.textoLigar }],
            });
          } else if (temBotoes && botoesRaw.trim()) {
            const botoesLines = botoesRaw.split("\n").filter((l: string) => l.trim()).slice(0, 3);
            const btns = botoesLines.map((line: string) => {
              const parts = line.split("|").map((s: string) => s.trim());
              return { id: parts[0] || "", text: parts[1] || parts[0] || "" };
            });
            await sendInteractiveButtons(sock, jid, {
              text: processedText || "Escolha uma opcao:",
              buttons: btns,
            });
          } else {
            if (processedText) {
              await sock.sendMessage(jid, { text: processedText, mentions }, { quoted: msg });
            }
          }

        } else if (tipoResposta === "lista") {
          const tituloLista = (node.config?.tituloLista as string) || "Menu";
          const textoLista = (node.config?.textoLista as string) || processedText || "Escolha uma opcao";
          const rodapeLista = (node.config?.rodapeLista as string) || "";
          const textoBotao = (node.config?.textoBotao as string) || "VER OPCOES";
          const secoesRaw = (node.config?.secoes as string) || "";

          const sections: { title: string; rows: { id: string; title: string; description?: string }[] }[] = [];
          let currentSection: { title: string; rows: { id: string; title: string; description?: string }[] } | null = null;

          for (const line of secoesRaw.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (!trimmed.includes("|")) {
              if (currentSection) sections.push(currentSection);
              currentSection = { title: trimmed, rows: [] };
            } else {
              const parts = trimmed.split("|").map((s: string) => s.trim());
              if (!currentSection) currentSection = { title: "Menu", rows: [] };
              currentSection.rows.push({
                id: parts[0] || `opt_${Date.now()}`,
                title: (parts[1] || parts[0] || "Opcao").slice(0, 24),
                description: parts[2] || undefined,
              });
            }
          }
          if (currentSection && currentSection.rows.length > 0) sections.push(currentSection);

          if (sections.length > 0) {
            const processedTextoLista = await replaceVars(textoLista, sock, msg, botId);
            const processedRodape = rodapeLista ? await replaceVars(rodapeLista, sock, msg, botId) : "";
            await sendInteractiveList(sock, jid, {
              text: processedTextoLista,
              title: tituloLista,
              footer: processedRodape,
              buttonText: textoBotao,
              sections,
            });
          } else {
            if (processedText) {
              await sock.sendMessage(jid, { text: processedText, mentions }, { quoted: msg });
            }
          }

        } else if (tipoResposta === "imagem") {
          const imagemUrl = (node.config?.imagemUrl as string) || "";
          const legenda = (node.config?.legenda as string) || "";
          const processedLegenda = legenda ? await replaceVars(legenda, sock, msg, botId) : "";
          if (imagemUrl) {
            await sock.sendMessage(jid, {
              image: { url: imagemUrl },
              caption: processedLegenda || undefined,
              mentions: processedLegenda.includes("@") ? [sender] : [],
            }, { quoted: msg });

            if (btnData && btnData.type === "normal" && btnData.buttons && btnData.buttons.length > 0) {
              const btns = btnData.buttons.map((b: any) => ({ id: b.buttonId, text: b.buttonText.displayText }));
              await sendInteractiveButtons(sock, jid, {
                text: processedLegenda || "Escolha:",
                buttons: btns,
              });
            } else if (btnData && btnData.type === "lista" && btnData.listData) {
              const ld = btnData.listData;
              await sendInteractiveList(sock, jid, {
                text: processedLegenda || "Escolha:",
                title: "",
                footer: "",
                buttonText: ld.textoBotao,
                sections: [{ title: "Menu", rows: ld.rows }],
              });
            } else {
              const temBotoes = !!node.config?.temBotoes;
              const botoesRaw = (node.config?.botoes as string) || "";
              if (temBotoes && botoesRaw.trim()) {
                const botoesLines = botoesRaw.split("\n").filter((l: string) => l.trim()).slice(0, 3);
                const btns = botoesLines.map((line: string) => {
                  const parts = line.split("|").map((s: string) => s.trim());
                  return { id: parts[0] || "", text: parts[1] || parts[0] || "" };
                });
                await sendInteractiveButtons(sock, jid, {
                  text: processedLegenda || "Escolha:",
                  buttons: btns,
                });
              }
            }
          }

        } else if (tipoResposta === "audio") {
          const audioUrl = (node.config?.audioUrl as string) || "";
          if (audioUrl) {
            await sock.sendMessage(jid, {
              audio: { url: audioUrl },
              mimetype: "audio/mpeg",
              ptt: true,
            }, { quoted: msg });
          }

        } else if (tipoResposta === "localizacao") {
          const lat = parseFloat(String(node.config?.latitude || "0"));
          const lng = parseFloat(String(node.config?.longitude || "0"));
          const nomeLocal = (node.config?.nomeLocal as string) || "";
          await sock.sendMessage(jid, {
            location: {
              degreesLatitude: lat,
              degreesLongitude: lng,
              name: nomeLocal || undefined,
            },
          }, { quoted: msg });

        } else if (tipoResposta === "contato") {
          const numeroContato = (node.config?.numeroContato as string) || "";
          const nomeContato = (node.config?.nomeContato as string) || numeroContato;
          if (numeroContato) {
            const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${nomeContato}\nTEL;type=CELL;type=VOICE;waid=${numeroContato}:+${numeroContato}\nEND:VCARD`;
            await sock.sendMessage(jid, {
              contacts: {
                displayName: nomeContato,
                contacts: [{ vcard }],
              },
            }, { quoted: msg });
          }

        } else {
          if (processedText) {
            await sock.sendMessage(jid, { text: processedText, mentions }, { quoted: msg });
          }
        }
      } catch (err) {
        console.error("[response block error]", err);
        if (processedText) {
          await sock.sendMessage(jid, { text: processedText, mentions }, { quoted: msg });
        }
      }

      if (nextBtnNode) {
        const btnEdge = edges.find((e) => e.source === nextBtnNode.id);
        currentId = btnEdge?.target ?? null;
        continue;
      }
    } else if (node.type === "action") {
      const action = node.config?.action as string;
      const actionMessage = node.config?.message as string;

      try {
        switch (action) {
          case "show_menu_photo":
          case "show_menu_admin":
          case "show_menu_games":
          case "show_menu_owner":
          case "show_menu_text": {
            const menuText = (node.config?.menu_text as string) || actionMessage || node.label;
            const menuFooter = (node.config?.menu_footer as string) || "";
            const imageUrl = node.config?.image_url as string;
            if (menuText) {
              const processed = await replaceVars(menuText, sock, msg, botId);
              const footerProcessed = menuFooter ? await replaceVars(menuFooter, sock, msg, botId) : "";
              let fullText = processed;
              if (footerProcessed) fullText += `\n\n_${footerProcessed}_`;
              if (imageUrl) {
                try {
                  await sock.sendMessage(jid, {
                    image: { url: imageUrl },
                    caption: fullText,
                    mentions: fullText.includes("@") ? [sender] : [],
                  }, { quoted: msg });
                } catch {
                  await sock.sendMessage(jid, { text: fullText, mentions: fullText.includes("@") ? [sender] : [] }, { quoted: msg });
                }
              } else {
                await sock.sendMessage(jid, { text: fullText, mentions: fullText.includes("@") ? [sender] : [] }, { quoted: msg });
              }
            }
            break;
          }

          case "coin_flip": {
            const result = Math.random() < 0.5 ? "🪙 *Cara!*" : "🪙 *Coroa!*";
            const processed = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "";
            await sock.sendMessage(jid, { text: processed ? `${processed}\n\n${result}` : result }, { quoted: msg });
            break;
          }

          case "dice_roll": {
            const sides = Number(node.config?.dice_sides) || 6;
            const roll = Math.floor(Math.random() * sides) + 1;
            const result = `🎲 Resultado: *${roll}* (de ${sides})`;
            await sock.sendMessage(jid, { text: result }, { quoted: msg });
            break;
          }

          case "pick_random": {
            if (!isGroup) break;
            try {
              const meta = await sock.groupMetadata(jid);
              const random = meta.participants[Math.floor(Math.random() * meta.participants.length)];
              await sock.sendMessage(jid, {
                text: `🎯 Sorteado: @${normalizeJid(random.id)}`,
                mentions: [random.id],
              }, { quoted: msg });
            } catch {
              await sock.sendMessage(jid, { text: "❌ Erro ao sortear." }, { quoted: msg });
            }
            break;
          }

          case "love_meter": {
            const percent = Math.floor(Math.random() * 101);
            const hearts = percent > 80 ? "💕💕💕💕💕" : percent > 60 ? "💕💕💕💕" : percent > 40 ? "💕💕💕" : percent > 20 ? "💕💕" : "💔";
            await sock.sendMessage(jid, { text: `💕 *Medidor de Amor*\n\n${hearts}\n\nResultado: *${percent}%*` }, { quoted: msg });
            break;
          }

          case "ship_members": {
            if (!isGroup) break;
            try {
              const meta = await sock.groupMetadata(jid);
              if (meta.participants.length < 2) break;
              const shuffled = [...meta.participants].sort(() => Math.random() - 0.5);
              const p1 = shuffled[0], p2 = shuffled[1];
              const percent = Math.floor(Math.random() * 101);
              await sock.sendMessage(jid, {
                text: `💑 *Ship!*\n\n@${normalizeJid(p1.id)} ❤️ @${normalizeJid(p2.id)}\n\nCompatibilidade: *${percent}%*`,
                mentions: [p1.id, p2.id],
              }, { quoted: msg });
            } catch {}
            break;
          }

          case "rate": {
            const nota = Math.floor(Math.random() * 11);
            const stars = "⭐".repeat(Math.ceil(nota / 2));
            await sock.sendMessage(jid, { text: `⭐ *Nota:* ${nota}/10\n${stars}` }, { quoted: msg });
            break;
          }

          case "fortune": {
            const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
            await sock.sendMessage(jid, { text: fortune }, { quoted: msg });
            break;
          }

          case "truth_or_dare": {
            const isTruth = Math.random() < 0.5;
            const list = isTruth ? TRUTHS : DARES;
            const pick = list[Math.floor(Math.random() * list.length)];
            await sock.sendMessage(jid, { text: `🎭 *${isTruth ? "Verdade" : "Desafio"}:*\n\n${pick}` }, { quoted: msg });
            break;
          }

          case "roulette": {
            if (!isGroup) break;
            const survived = Math.random() > (1 / 6);
            if (survived) {
              await sock.sendMessage(jid, { text: `🔫 *Click!* Nada aconteceu... @${normalizeJid(sender)} sobreviveu! 😅`, mentions: [sender] }, { quoted: msg });
            } else {
              const shouldKick = node.config?.roulette_kick === true;
              await sock.sendMessage(jid, { text: `🔫 *BANG!* @${normalizeJid(sender)} não sobreviveu! 💀`, mentions: [sender] }, { quoted: msg });
              if (shouldKick && await isBotAdmin(sock, jid)) {
                try { await sock.groupParticipantsUpdate(jid, [sender], "remove"); } catch {}
              }
            }
            break;
          }

          case "top5": {
            if (!isGroup) break;
            try {
              const meta = await sock.groupMetadata(jid);
              const shuffled = [...meta.participants].sort(() => Math.random() - 0.5).slice(0, 5);
              const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
              const list = shuffled.map((p, i) => `${medals[i]} @${normalizeJid(p.id)}`).join("\n");
              await sock.sendMessage(jid, {
                text: `🏆 *Top 5 aleatório:*\n\n${list}`,
                mentions: shuffled.map(p => p.id),
              }, { quoted: msg });
            } catch {}
            break;
          }

          case "rank": {
            if (!isGroup) break;
            try {
              const meta = await sock.groupMetadata(jid);
              const shuffled = [...meta.participants].sort(() => Math.random() - 0.5).slice(0, 10);
              const list = shuffled.map((p, i) => `${i + 1}. @${normalizeJid(p.id)}`).join("\n");
              await sock.sendMessage(jid, {
                text: `📊 *Ranking:*\n\n${list}`,
                mentions: shuffled.map(p => p.id),
              }, { quoted: msg });
            } catch {}
            break;
          }

          case "joke": {
            const joke = JOKES_BR[Math.floor(Math.random() * JOKES_BR.length)];
            await sock.sendMessage(jid, { text: joke }, { quoted: msg });
            break;
          }

          case "bot_on": {
            botDisabledSet.delete(botId);
            const processed = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "✅ Bot ligado!";
            await sock.sendMessage(jid, { text: processed }, { quoted: msg });
            break;
          }

          case "bot_off": {
            botDisabledSet.add(botId);
            const processed = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "❌ Bot desligado!";
            await sock.sendMessage(jid, { text: processed }, { quoted: msg });
            break;
          }

          case "give_coins": {
            const processed = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "💰 Moedas enviadas!";
            await sock.sendMessage(jid, { text: processed }, { quoted: msg });
            break;
          }

          case "broadcast": {
            const broadcastText = (node.config?.broadcast_text as string) || actionMessage || "";
            if (broadcastText) {
              const processed = await replaceVars(broadcastText, sock, msg, botId);
              await sock.sendMessage(jid, { text: `📢 Broadcast enviado!\n\n${processed}` }, { quoted: msg });
            }
            break;
          }

          case "block_user": {
            const blockTarget = getMentionedJid(msg);
            if (blockTarget) {
              try { await sock.updateBlockStatus(blockTarget, "block"); } catch {}
              const processed = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "🚷 Bloqueado!";
              await sock.sendMessage(jid, { text: processed }, { quoted: msg });
            } else {
              await sock.sendMessage(jid, { text: "⚠️ Mencione o usuário para bloquear." }, { quoted: msg });
            }
            break;
          }

          case "unblock_user": {
            const unblockTarget = getMentionedJid(msg);
            if (unblockTarget) {
              try { await sock.updateBlockStatus(unblockTarget, "unblock"); } catch {}
              const processed = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "✅ Desbloqueado!";
              await sock.sendMessage(jid, { text: processed }, { quoted: msg });
            } else {
              await sock.sendMessage(jid, { text: "⚠️ Mencione o usuário para desbloquear." }, { quoted: msg });
            }
            break;
          }

          case "set_welcome": {
            const welcomeText = (node.config?.welcome_text as string) || actionMessage || "";
            if (welcomeText && isGroup) {
              welcomeMessages.set(`${botId}:${jid}`, welcomeText);
              const processed = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "✅ Boas-vindas configurado!";
              await sock.sendMessage(jid, { text: processed }, { quoted: msg });
            }
            break;
          }

          case "set_goodbye": {
            const goodbyeText = (node.config?.goodbye_text as string) || actionMessage || "";
            if (goodbyeText && isGroup) {
              goodbyeMessages.set(`${botId}:${jid}`, goodbyeText);
              const processed = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "✅ Despedida configurada!";
              await sock.sendMessage(jid, { text: processed }, { quoted: msg });
            }
            break;
          }

          case "set_group_name": {
            if (!isGroup) break;
            const nameArgs = text.split(/\s+/).slice(1).join(" ");
            if (!nameArgs) { await sock.sendMessage(jid, { text: "⚠️ Use: .nome <novo nome>" }, { quoted: msg }); break; }
            if (await isBotAdmin(sock, jid)) {
              await sock.groupUpdateSubject(jid, nameArgs);
              await sock.sendMessage(jid, { text: actionMessage || `✅ Nome alterado para: *${nameArgs}*` }, { quoted: msg });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin." }, { quoted: msg });
            }
            break;
          }

          case "set_group_desc": {
            if (!isGroup) break;
            const descArgs = text.split(/\s+/).slice(1).join(" ");
            if (!descArgs) { await sock.sendMessage(jid, { text: "⚠️ Use: .desc <nova descrição>" }, { quoted: msg }); break; }
            if (await isBotAdmin(sock, jid)) {
              await sock.groupUpdateDescription(jid, descArgs);
              await sock.sendMessage(jid, { text: actionMessage || "✅ Descrição alterada!" }, { quoted: msg });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin." }, { quoted: msg });
            }
            break;
          }

          case "mute_member": {
            if (!isGroup) break;
            const processed = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "🔇 Membro mutado!";
            await sock.sendMessage(jid, { text: processed }, { quoted: msg });
            break;
          }

          case "unmute_member": {
            if (!isGroup) break;
            const processed2 = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "🔊 Membro desmutado!";
            await sock.sendMessage(jid, { text: processed2 }, { quoted: msg });
            break;
          }

          case "member_list": {
            if (!isGroup) break;
            try {
              const meta = await sock.groupMetadata(jid);
              const list = meta.participants.map((p, i) => `${i + 1}. @${normalizeJid(p.id)}`).join("\n");
              await sock.sendMessage(jid, {
                text: `👥 *Membros (${meta.participants.length}):*\n\n${list}`,
                mentions: meta.participants.map(p => p.id),
              }, { quoted: msg });
            } catch {
              await sock.sendMessage(jid, { text: "❌ Erro ao listar membros." }, { quoted: msg });
            }
            break;
          }

          case "admin_list": {
            if (!isGroup) break;
            try {
              const meta = await sock.groupMetadata(jid);
              const admins = meta.participants.filter(p => p.admin === "admin" || p.admin === "superadmin");
              const list = admins.map((p, i) => `${i + 1}. @${normalizeJid(p.id)} ${p.admin === "superadmin" ? "👑" : "🛡️"}`).join("\n");
              await sock.sendMessage(jid, {
                text: `👑 *Admins (${admins.length}):*\n\n${list}`,
                mentions: admins.map(p => p.id),
              }, { quoted: msg });
            } catch {
              await sock.sendMessage(jid, { text: "❌ Erro ao listar admins." }, { quoted: msg });
            }
            break;
          }

          case "send_poll": {
            const pollQuestion = (node.config?.poll_question as string) || "Enquete";
            const pollOptionsStr = (node.config?.poll_options as string) || "Sim, Não";
            const options = pollOptionsStr.split(",").map(o => o.trim()).filter(Boolean);
            if (options.length >= 2) {
              await sock.sendMessage(jid, {
                poll: {
                  name: pollQuestion,
                  values: options,
                  selectableCount: 1,
                },
              });
            } else {
              await sock.sendMessage(jid, { text: "⚠️ A enquete precisa de pelo menos 2 opções." }, { quoted: msg });
            }
            break;
          }

          case "cep_lookup": {
            const cepArgs = text.split(/\s+/).slice(1).join("").replace(/\D/g, "");
            if (!cepArgs || cepArgs.length !== 8) {
              await sock.sendMessage(jid, { text: "⚠️ Use: .cep 01001000" }, { quoted: msg });
              break;
            }
            try {
              const resp = await fetch(`https://viacep.com.br/ws/${cepArgs}/json/`);
              const data = await resp.json() as Record<string, string>;
              if (data.erro) {
                await sock.sendMessage(jid, { text: "❌ CEP não encontrado." }, { quoted: msg });
              } else {
                await sock.sendMessage(jid, {
                  text: `📮 *CEP: ${data.cep}*\n\n🏠 ${data.logradouro}\n🏘️ ${data.bairro}\n🌆 ${data.localidade} - ${data.uf}`,
                }, { quoted: msg });
              }
            } catch {
              await sock.sendMessage(jid, { text: "❌ Erro ao consultar CEP." }, { quoted: msg });
            }
            break;
          }

          case "calc": {
            const calcExpr = text.split(/\s+/).slice(1).join(" ");
            if (!calcExpr) {
              await sock.sendMessage(jid, { text: "⚠️ Use: .calc 2+2" }, { quoted: msg });
              break;
            }
            try {
              const sanitized = calcExpr.replace(/[^0-9+\-*/.() ]/g, "");
              const result = Function(`"use strict"; return (${sanitized})`)();
              await sock.sendMessage(jid, { text: `🧮 *Resultado:*\n${calcExpr} = *${result}*` }, { quoted: msg });
            } catch {
              await sock.sendMessage(jid, { text: "❌ Expressão inválida." }, { quoted: msg });
            }
            break;
          }

          case "antispam":
          case "antiflood":
          case "antifake":
          case "antitoxic":
          case "antidelete":
          case "antilink": {
            break;
          }

          case "make_sticker": {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            const directImage = msg.message?.imageMessage;
            const hasQuotedImage = !!quoted?.imageMessage;

            if (!directImage && !hasQuotedImage) {
              const processed = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "⚠️ Envie ou responda a uma *imagem* para criar uma figurinha!";
              await sock.sendMessage(jid, { text: processed }, { quoted: msg });
            } else {
              try {
                let buffer: Buffer;
                if (directImage) {
                  buffer = await downloadMediaMessage(msg, "buffer", {}) as Buffer;
                } else {
                  const quotedMsg: WAMessage = {
                    key: {
                      remoteJid: jid,
                      id: contextInfo?.stanzaId,
                      fromMe: false,
                      participant: contextInfo?.participant || msg.key.participant,
                    },
                    message: quoted,
                  };
                  buffer = await downloadMediaMessage(quotedMsg, "buffer", {}) as Buffer;
                }
                const webpBuffer = await sharp(buffer)
                  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
                  .webp({ quality: 80 })
                  .toBuffer();
                await sock.sendMessage(jid, { sticker: webpBuffer }, { quoted: msg });
              } catch (stickerErr) {
                logger.error({ err: stickerErr, botId }, "Error creating sticker");
                await sock.sendMessage(jid, {
                  text: "❌ Erro ao criar figurinha. Tente com outra imagem.",
                }, { quoted: msg });
              }
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
              if (actionMessage) { const p = await replaceVars(actionMessage, sock, msg, botId); await sock.sendMessage(jid, { text: p }); }
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
              if (actionMessage) { const p = await replaceVars(actionMessage, sock, msg, botId); await sock.sendMessage(jid, { text: p }); }
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
              const p = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : `✅ @${promTarget.split("@")[0]} foi promovido a admin!`;
              await sock.sendMessage(jid, { text: p, mentions: [promTarget] });
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
              const p = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : `✅ @${demTarget.split("@")[0]} foi rebaixado.`;
              await sock.sendMessage(jid, { text: p, mentions: [demTarget] });
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
              const p = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : `⚠️ @${warnTarget.split("@")[0]} recebeu um aviso! (${current}/${maxWarns})`;
              await sock.sendMessage(jid, { text: p, mentions: [warnTarget] });
            }
            break;
          }

          case "reset_warns": {
            if (!isGroup) break;
            const resetSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!resetSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            const resetTarget = getMentionedJid(msg);
            if (!resetTarget) { await sock.sendMessage(jid, { text: "⚠️ Mencione o membro para resetar avisos." }, { quoted: msg }); break; }
            if (warnCounts.has(jid)) {
              warnCounts.get(jid)!.delete(resetTarget);
            }
            const p = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : `✅ Avisos de @${resetTarget.split("@")[0]} foram resetados.`;
            await sock.sendMessage(jid, { text: p, mentions: [resetTarget] });
            break;
          }

          case "mute_group": {
            if (!isGroup) break;
            const muteSenderAdmin = await isGroupAdmin(sock, jid, sender);
            if (!muteSenderAdmin) { await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg }); break; }
            if (await isBotAdmin(sock, jid)) {
              await sock.groupSettingUpdate(jid, "announcement");
              const p = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "🔇 Grupo silenciado.";
              await sock.sendMessage(jid, { text: p });
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
              const p = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "🔊 Grupo aberto.";
              await sock.sendMessage(jid, { text: p });
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
              const p = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "✅ Link revogado!";
              await sock.sendMessage(jid, { text: p });
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
              const tagText = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : (text.split(" ").slice(1).join(" ") || "📢 Atenção!");
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
              const p = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "🔒 Grupo fechado.";
              await sock.sendMessage(jid, { text: p });
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
              const p = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "🔓 Grupo aberto.";
              await sock.sendMessage(jid, { text: p });
            } else {
              await sock.sendMessage(jid, { text: "❌ Preciso ser admin para abrir o grupo." }, { quoted: msg });
            }
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
            const imgCaption = actionMessage ? await replaceVars(actionMessage, sock, msg, botId) : "";
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

          case "typing": {
            const dur = Math.min(Number(node.config?.typing_duration) || 2000, 10000);
            await sock.sendPresenceUpdate("composing", jid);
            await new Promise((r) => setTimeout(r, dur));
            await sock.sendPresenceUpdate("paused", jid);
            break;
          }

          case "delay": {
            const ms = Number(node.config?.delay_ms) || 1500;
            await new Promise((r) => setTimeout(r, Math.min(ms, 30000)));
            break;
          }

          case "read_receipt": {
            try {
              await sock.readMessages([msg.key]);
            } catch {}
            break;
          }

          case "add_coins": {
            const amt = Number(node.config?.coins_amount) || 0;
            if (amt > 0) {
              const sNum = normalizeJid(sender);
              await db.update(usersTable).set({ coins: sql`${usersTable.coins} + ${amt}` }).where(eq(usersTable.phone, sNum));
            }
            break;
          }

          case "remove_coins": {
            const amt = Number(node.config?.coins_amount) || 0;
            if (amt > 0) {
              const sNum = normalizeJid(sender);
              await db.update(usersTable).set({ coins: sql`GREATEST(${usersTable.coins} - ${amt}, 0)` }).where(eq(usersTable.phone, sNum));
            }
            break;
          }

          case "set_coins": {
            const amt = Number(node.config?.coins_amount) || 0;
            const sNum = normalizeJid(sender);
            await db.update(usersTable).set({ coins: Math.max(amt, 0) }).where(eq(usersTable.phone, sNum));
            break;
          }

          case "join_group_link": {
            const link = (node.config?.group_invite_link as string) || "";
            const code = link.split("chat.whatsapp.com/")[1];
            if (code) {
              try {
                await sock.groupAcceptInvite(code.trim());
              } catch {
                logger.warn({ botId, link }, "Failed to join group via link");
              }
            }
            break;
          }

          case "leave_group": {
            if (isGroup) {
              try {
                await sock.groupLeave(jid);
              } catch {
                logger.warn({ botId, jid }, "Failed to leave group");
              }
            }
            break;
          }

          case "send_log": {
            const logMsg = (node.config?.log_message as string) || actionMessage || "";
            if (logMsg) {
              const processed = await replaceVars(logMsg, sock, msg, botId);
              logger.info({ botId, sender, jid }, `[BOT LOG] ${processed}`);
            }
            break;
          }

          case "http_request": {
            const url = (node.config?.http_url as string) || "";
            const method = (node.config?.http_method as string) || "GET";
            const isExternalUrl = url.startsWith("https://") || url.startsWith("http://");
            const isBlockedHost = /^https?:\/\/(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0|\[::1\])/i.test(url);
            if (url && isExternalUrl && !isBlockedHost) {
              try {
                let headers: Record<string, string> = { "Content-Type": "application/json" };
                if (node.config?.http_headers) {
                  try { headers = { ...headers, ...JSON.parse(String(node.config.http_headers)) }; } catch {}
                }
                let body: string | undefined;
                if (node.config?.http_body && method !== "GET") {
                  const raw = await replaceVars(String(node.config.http_body), sock, msg, botId);
                  body = raw;
                }
                await fetch(url, { method, headers, body, signal: AbortSignal.timeout(10000) });
              } catch (err) {
                logger.warn({ err, botId, url }, "HTTP request action failed");
              }
            }
            break;
          }

          default:
            if (actionMessage) {
              const p = await replaceVars(actionMessage, sock, msg, botId);
              await sock.sendMessage(jid, { text: p }, { quoted: msg });
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
          case "has_audio":
            result = messageHasMedia(msg, "audio");
            break;
          case "has_document":
            result = !!msg.message?.documentMessage;
            break;
          case "has_contact":
            result = !!msg.message?.contactMessage || !!msg.message?.contactsArrayMessage;
            break;
          case "has_location":
            result = !!msg.message?.locationMessage || !!msg.message?.liveLocationMessage;
            break;
          case "is_reply":
            result = !!msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
            break;
          case "is_quoted":
            result = !!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            break;
          case "is_owner": {
            const [botRow] = await db.select().from(botsTable).where(eq(botsTable.id, botId));
            const ownerNum = normalizeJid(botRow?.ownerPhone || botRow?.phone || "");
            const senderNum2 = normalizeJid(sender);
            result = senderNum2 === ownerNum;
            break;
          }
          case "has_prefix": {
            const prefixes = [".", "!", "/", "#", "@", "$"];
            result = prefixes.some((p) => text.startsWith(p));
            break;
          }
          case "sender_has_plan": {
            const sNum = normalizeJid(sender);
            const [u] = await db.select().from(usersTable).where(eq(usersTable.phone, sNum));
            result = !!(u && u.coins > 0);
            break;
          }
          case "msg_length_gt": {
            const minLen = Number(node.config?.min_length) || 0;
            result = text.length > minLen;
            break;
          }
          case "time_between": {
            const tStart = (node.config?.time_start as string) || "00:00";
            const tEnd = (node.config?.time_end as string) || "23:59";
            const now = new Date();
            const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
            result = hhmm >= tStart && hhmm <= tEnd;
            break;
          }
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
        ((n.config?.trigger as string) || (n.config?.name as string) || n.label)
          .replace(/^[^a-zA-Z0-9]/, "")
          .toLowerCase() === commandText,
    );

    if (!commandNode) return;

    const isGroup = jid.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid || "";
    const senderNum = normalizeJid(sender);
    const cfg = commandNode.config || {};

    if (cfg.group_only && !isGroup) {
      await sock.sendMessage(jid, { text: "❌ Este comando só funciona em grupos." }, { quoted: msg });
      return;
    }
    if (cfg.private_only && isGroup) {
      await sock.sendMessage(jid, { text: "❌ Este comando só funciona no privado." }, { quoted: msg });
      return;
    }
    if (cfg.admin_only && isGroup) {
      const isAdmin = await isGroupAdmin(sock, jid, sender);
      if (!isAdmin) {
        await sock.sendMessage(jid, { text: "❌ Apenas admins podem usar este comando." }, { quoted: msg });
        return;
      }
    }
    if (cfg.owner_only) {
      const ownerPhone = bot.ownerPhone || bot.phone || "";
      const isOwner = senderNum === ownerPhone || senderNum === normalizeJid(sock.user?.id || "");
      if (!isOwner) {
        await sock.sendMessage(jid, { text: "❌ Apenas o dono pode usar este comando." }, { quoted: msg });
        return;
      }
    }

    logger.info({ botId, command: commandText, jid }, "Executing command");
    await executeFlow(sock, msg, commandNode, nodes, edges, botId);

    await Promise.all([
      db.insert(botMessageEventsTable).values({ id: uuidv4(), botId, processedAt: new Date() }),
      db.update(botsTable).set({ messagesProcessed: sql`messages_processed + 1` }).where(eq(botsTable.id, botId)),
    ]);
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
          .set({ qrCode: qrDataUrl, status: "connecting" })
          .where(eq(botsTable.id, botId));
      } catch (err) {
        logger.error({ err, botId }, "Error generating QR Data URL");
      }
    }

    if (connection === "open") {
      const rawId = sock.user?.id ?? "";
      const phoneNumber = rawId.split(":")[0].split("@")[0] || phone?.replace(/\D/g, "") || "";
      reconnectAttempts.delete(botId);
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
      void notifyBotOwner(botId, "Bot conectado ✅", `Seu bot está online e pronto para uso.`);
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      logger.info({ botId, statusCode, loggedOut }, "WhatsApp connection closed");

      if (!loggedOut) {
        sessions.delete(botId);
        const attempt = (reconnectAttempts.get(botId) ?? 0) + 1;
        reconnectAttempts.set(botId, attempt);
        const maxDelay = 120_000;
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), maxDelay);
        logger.info({ botId, attempt, delay }, "Scheduling WhatsApp reconnect");
        if (attempt === 1) {
          void notifyBotOwner(botId, "Bot caiu 🔄", `Seu bot perdeu a conexão e está reconectando automaticamente.`);
        }
        setTimeout(() => startWhatsAppSession(botId, type, phone), delay);
      } else {
        sessions.delete(botId);
        const sessionPath = path.join(SESSION_DIR, botId);
        fs.rmSync(sessionPath, { recursive: true, force: true });
        await db
          .update(botsTable)
          .set({ status: "disconnected", qrCode: null, pairCode: null })
          .where(eq(botsTable.id, botId));
        sendSse(botId, "status", { status: "disconnected" });
        void notifyBotOwner(botId, "Bot desconectado ⚠️", `Seu bot foi desconectado. Toque para reconectar.`);
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
