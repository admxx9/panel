import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View, Text, StyleSheet, Pressable, Alert, Modal,
  ScrollView, TextInput, Switch, Dimensions, KeyboardAvoidingView, Platform,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Svg, { Defs, Pattern, Circle, Rect } from "react-native-svg";
import Animated, {
  useSharedValue, useAnimatedStyle, runOnJS, runOnUI, type SharedValue,
  withRepeat, withSequence, withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useGetBotCommands, useSaveBotCommands } from "@workspace/api-client-react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  bg: "#08080D",
  card: "#0E0E16",
  fg: "#C9CADB",
  muted: "#4B4C6B",
  border: "#1A1B28",
  primary: "#6D28D9",
  secondary: "#131420",
  destructive: "#EF4444",
};

const { width: SW, height: SH } = Dimensions.get("window");
const NODE_W = 180;
const NODE_H = 82;
const GRID = 28;
const CANVAS_SIZE = 3000;

type NodeType = "command" | "action" | "condition" | "response" | "buttons";
interface FlowNode { id: string; type: NodeType; label: string; config: Record<string, unknown>; x: number; y: number; }
interface FlowEdge { id: string; source: string; target: string; sourceHandle?: "true" | "false"; }

const NODE_CFG: Record<NodeType, { color: string; dim: string; label: string; icon: string; desc: string }> = {
  command:   { color: "#6D28D9", dim: "#6D28D91A", label: "Comando",  icon: "message-square", desc: "Recebe mensagem" },
  action:    { color: "#7C3AED", dim: "#7C3AED1A", label: "Ação",     icon: "zap",            desc: "Executa algo" },
  condition: { color: "#F59E0B", dim: "#F59E0B1A", label: "Condição", icon: "git-branch",     desc: "Ramificação" },
  response:  { color: "#22C55E", dim: "#22C55E1A", label: "Resposta", icon: "message-circle", desc: "Envia mensagem" },
  buttons:   { color: "#06B6D4", dim: "#06B6D41A", label: "Botões",   icon: "layout",         desc: "Menu de botões" },
};

const CFG: Record<NodeType, { key: string; label: string; type: "text" | "textarea" | "select" | "toggle"; options?: { value: string; label: string }[]; placeholder?: string; showWhen?: (c: Record<string, unknown>) => boolean }[]> = {
  command: [
    { key: "name", label: "Nome do comando", type: "text", placeholder: "menu" },
    { key: "prefix", label: "Prefixo", type: "select", options: [{ value: ".", label: "." }, { value: "!", label: "!" }, { value: "/", label: "/" }, { value: "#", label: "#" }, { value: "nenhum", label: "Nenhum" }] },
    { key: "caseSensitive", label: "Diferencia maiúsculas", type: "toggle" },
    { key: "apenasGrupos", label: "Apenas grupos", type: "toggle" },
    { key: "apenasPrivado", label: "Apenas privado", type: "toggle" },
    { key: "requerAdmin", label: "Requer admin", type: "toggle" },
    { key: "requerPlano", label: "Requer plano ativo", type: "toggle" },
  ],
  action: [
    { key: "action", label: "Tipo de Ação", type: "select", options: [
      { value: "make_sticker", label: "🖼️ Criar Figurinha" },
      { value: "send_image", label: "🖼️ Enviar Imagem" },
      { value: "hidetag", label: "📢 Marcar Todos (Hidetag)" },
      { value: "kick_member", label: "🚪 Remover Membro" },
      { value: "ban_member", label: "🔨 Banir Membro" },
      { value: "warn_member", label: "⚠️ Dar Aviso (Warn)" },
      { value: "mute_member", label: "🔇 Mutar Membro" },
      { value: "unmute_member", label: "🔊 Desmutar Membro" },
      { value: "delete_message", label: "🗑️ Apagar Mensagem" },
      { value: "promote_member", label: "⬆️ Promover a Admin" },
      { value: "demote_member", label: "⬇️ Rebaixar Admin" },
      { value: "mute_group", label: "🔇 Silenciar Grupo" },
      { value: "unmute_group", label: "🔊 Liberar Grupo" },
      { value: "close_group", label: "🔒 Fechar Grupo" },
      { value: "open_group", label: "🔓 Abrir Grupo" },
      { value: "get_group_link", label: "🔗 Link do Grupo" },
      { value: "show_menu", label: "📋 Menu Principal" },
      { value: "show_menu_admin", label: "📋 Menu Admin" },
      { value: "show_menu_owner", label: "📋 Menu Dono" },
      { value: "send_poll", label: "📊 Enviar Enquete" },
      { value: "react_message", label: "😀 Reagir à Mensagem" },
      { value: "coin_flip", label: "🪙 Cara ou Coroa" },
      { value: "dice_roll", label: "🎲 Rolar Dado" },
      { value: "pick_random", label: "🎯 Sortear Membro" },
      { value: "love_meter", label: "💕 Medidor de Amor" },
      { value: "rate", label: "⭐ Nota de 0 a 10" },
      { value: "fortune", label: "🥠 Biscoito da Sorte" },
      { value: "roulette", label: "🔫 Roleta Russa" },
      { value: "top5", label: "🏆 Top 5 do Grupo" },
      { value: "rank", label: "📊 Ranking de Mensagens" },
      { value: "joke", label: "😂 Piada Aleatória" },
      { value: "bot_on", label: "✅ Ligar Bot (Dono)" },
      { value: "bot_off", label: "❌ Desligar Bot (Dono)" },
      { value: "give_coins", label: "💰 Dar Moedas (Dono)" },
      { value: "add_coins", label: "💰 Adicionar Moedas" },
      { value: "remove_coins", label: "💸 Remover Moedas" },
      { value: "broadcast", label: "📢 Broadcast (Dono)" },
      { value: "antilink", label: "🚫 Anti-Link" },
      { value: "antispam", label: "🛡️ Anti-Spam" },
      { value: "antiflood", label: "💧 Anti-Flood" },
      { value: "antifake", label: "🎭 Anti-Fake" },
      { value: "antitoxic", label: "🤬 Anti-Palavrão" },
      { value: "antidelete", label: "👁️ Anti-Delete" },
      { value: "set_welcome", label: "👋 Boas-Vindas" },
      { value: "set_goodbye", label: "👋 Despedida" },
      { value: "set_auto_reply", label: "💬 Auto-Resposta" },
      { value: "group_info", label: "📋 Info do Grupo" },
      { value: "member_list", label: "👥 Lista de Membros" },
      { value: "admin_list", label: "👑 Lista de Admins" },
      { value: "translate", label: "🌐 Traduzir Texto" },
      { value: "calc", label: "🧮 Calculadora" },
      { value: "qrcode_gen", label: "📱 Gerar QR Code" },
      { value: "typing", label: "⌨️ Simular Digitando" },
      { value: "delay", label: "⏳ Aguardar (Pausa)" },
      { value: "http_request", label: "🌐 Requisição HTTP (Webhook)" },
      { value: "send_log", label: "📝 Enviar Log (Debug)" },
      { value: "join_group_link", label: "🔗 Entrar no Grupo (Link)" },
      { value: "leave_group", label: "🚪 Sair do Grupo" },
    ]},
    { key: "message", label: "Mensagem (variáveis: {nome}, {grupo}...)", type: "textarea", placeholder: "Olá {nome}!" },
    { key: "emoji", label: "Emoji (react)", type: "text", placeholder: "👍", showWhen: (c) => c.action === "react_message" },
    { key: "image_url", label: "URL da imagem", type: "text", placeholder: "https://...", showWhen: (c) => c.action === "send_image" },
    { key: "coins_amount", label: "Quantidade de moedas", type: "text", placeholder: "100", showWhen: (c) => ["give_coins","add_coins","remove_coins"].includes(String(c.action)) },
    { key: "menu_title", label: "Título do menu", type: "text", placeholder: "🤖 Menu do Bot", showWhen: (c) => String(c.action).startsWith("show_menu") },
    { key: "menu_text", label: "Texto do menu", type: "textarea", placeholder: "👤 {nome}\n🪙 Moedas: {moedas}\n\n📋 Comandos:\n🖼️ {prefix}sticker", showWhen: (c) => String(c.action).startsWith("show_menu") },
    { key: "http_url", label: "URL da requisição", type: "text", placeholder: "https://api.exemplo.com/webhook", showWhen: (c) => c.action === "http_request" },
    { key: "http_method", label: "Método HTTP", type: "select", options: [{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }, { value: "DELETE", label: "DELETE" }], showWhen: (c) => c.action === "http_request" },
    { key: "delay_ms", label: "Tempo de espera (ms)", type: "text", placeholder: "1500", showWhen: (c) => c.action === "delay" },
    { key: "welcome_text", label: "Mensagem de boas-vindas", type: "textarea", placeholder: "👋 Bem-vindo(a) {nome}!", showWhen: (c) => c.action === "set_welcome" },
    { key: "goodbye_text", label: "Mensagem de despedida", type: "textarea", placeholder: "👋 {nome} saiu!", showWhen: (c) => c.action === "set_goodbye" },
    { key: "flood_max", label: "Máx. msgs por intervalo", type: "text", placeholder: "5", showWhen: (c) => c.action === "antiflood" },
    { key: "broadcast_text", label: "Mensagem do broadcast", type: "textarea", placeholder: "📢 Aviso para todos os grupos!", showWhen: (c) => c.action === "broadcast" },
  ],
  condition: [
    { key: "condition", label: "Condição", type: "select", options: [
      { value: "is_group", label: "👥 É grupo" },
      { value: "is_private", label: "💬 É privado" },
      { value: "is_admin", label: "👑 Remetente é admin" },
      { value: "is_not_admin", label: "🚫 Remetente NÃO é admin" },
      { value: "is_owner", label: "👑 É o dono do bot" },
      { value: "is_bot_admin", label: "🤖 Bot é admin" },
      { value: "has_image", label: "📷 Tem imagem" },
      { value: "has_video", label: "🎥 Tem vídeo" },
      { value: "has_sticker", label: "🏷️ Tem figurinha" },
      { value: "contains_text", label: "🔍 Contém texto..." },
      { value: "has_mention", label: "📌 Menciona alguém" },
      { value: "is_reply", label: "↩️ É reply" },
      { value: "contains_link", label: "🔗 Contém link" },
      { value: "sender_has_plan", label: "📦 Remetente tem plano ativo" },
      { value: "time_between", label: "🕐 Horário entre X e Y" },
      { value: "member_count_gt", label: "👥 Grupo tem + de N membros" },
      { value: "bot_is_on", label: "✅ Bot está ligado" },
    ]},
    { key: "value", label: "Valor / Palavra-chave", type: "text", placeholder: "ex: palavra", showWhen: (c) => c.condition === "contains_text" },
    { key: "time_start", label: "Hora início (HH:MM)", type: "text", placeholder: "08:00", showWhen: (c) => c.condition === "time_between" },
    { key: "time_end", label: "Hora fim (HH:MM)", type: "text", placeholder: "22:00", showWhen: (c) => c.condition === "time_between" },
    { key: "min_members", label: "Mínimo de membros", type: "text", placeholder: "10", showWhen: (c) => c.condition === "member_count_gt" },
  ],
  response: [
    { key: "tipoResposta", label: "Tipo", type: "select", options: [{ value: "texto", label: "Texto simples" }, { value: "imagem", label: "Imagem" }, { value: "audio", label: "Áudio" }, { value: "localizacao", label: "Localização" }, { value: "contato", label: "Contato" }] },
    { key: "texto", label: "Texto ({nome}, {numero}, {moedas}, {plano})", type: "textarea", placeholder: "Olá {nome}! Seu saldo é {moedas} moedas.", showWhen: (c) => !c.tipoResposta || c.tipoResposta === "texto" },
    { key: "imagemUrl", label: "URL da imagem", type: "text", placeholder: "https://...", showWhen: (c) => c.tipoResposta === "imagem" },
    { key: "legenda", label: "Legenda", type: "textarea", placeholder: "Legenda da imagem", showWhen: (c) => c.tipoResposta === "imagem" },
    { key: "audioUrl", label: "URL do áudio", type: "text", placeholder: "https://...", showWhen: (c) => c.tipoResposta === "audio" },
    { key: "mention", label: "Mencionar usuário", type: "toggle" },
    { key: "quote", label: "Citar mensagem", type: "toggle" },
    { key: "temBotoes", label: "Adicionar botões", type: "toggle", showWhen: (c) => !c.tipoResposta || c.tipoResposta === "texto" || c.tipoResposta === "imagem" },
    { key: "botoes", label: "Botões (id | texto, max 3 por linha)", type: "textarea", placeholder: ".sim | ✅ Sim\n.nao | ❌ Não", showWhen: (c) => !!c.temBotoes },
  ],
  buttons: [
    { key: "tipoBotao", label: "Tipo", type: "select", options: [{ value: "normal", label: "Botões normais (max 3)" }, { value: "lista", label: "Lista interativa" }] },
    { key: "botoes", label: "Botões (id | texto, um por linha)", type: "textarea", placeholder: ".sim | Sim\n.nao | Não" },
    { key: "titulo", label: "Título", type: "text", placeholder: "Escolha uma opção:" },
    { key: "rodape", label: "Rodapé", type: "text", placeholder: "BotAluguel Pro" },
  ],
};

function uid() { return Math.random().toString(36).slice(2, 9); }
function makeNode(type: NodeType, x: number, y: number): FlowNode {
  const cfg = NODE_CFG[type];
  return { id: uid(), type, label: cfg.label, config: {}, x, y };
}

const TEMPLATES: { name: string; icon: string; desc: string; nodes: Partial<FlowNode>[]; edges: Partial<FlowEdge>[] }[] = [
  {
    name: "Menu Principal", icon: "list", desc: "Menu interativo com lista de comandos",
    nodes: [
      { type: "command", label: "Comando", config: { name: "menu", prefix: "." }, x: 60, y: 200 },
      { type: "condition", label: "É grupo?", config: { condition: "is_group" }, x: 300, y: 200 },
      { type: "response", label: "Menu Grupo", config: { texto: "🤖 *Menu do Bot*\n\n👤 Olá, {nome}!\n🪙 Moedas: {moedas}\n\n📋 *Comandos:*\n🖼️ .sticker — Figurinha\n📢 .marcar — Marcar todos\n💰 .saldo — Ver moedas\n🎲 .dado — Rolar dado\n🏆 .top — Ranking\n📊 .rank — Meu rank\n\n_Digite o comando desejado_", tipoResposta: "texto", mention: true }, x: 540, y: 100 },
      { type: "response", label: "Menu PV", config: { texto: "🤖 *Menu Privado*\n\n👤 {nome}\n📦 Plano: {plano}\n🪙 Moedas: {moedas}\n\n📋 *Opções:*\n💳 .planos — Ver planos\n🔑 .meubot — Painel do bot\n📊 .stats — Estatísticas\n\n_Envie o comando desejado_", tipoResposta: "texto" }, x: 540, y: 340 },
    ],
    edges: [{ source: "0", target: "1" }, { source: "1", target: "2", sourceHandle: "true" }, { source: "1", target: "3", sourceHandle: "false" }],
  },
  {
    name: "Figurinha Completa", icon: "image", desc: "Sticker com verificação de imagem",
    nodes: [
      { type: "command", label: "Comando", config: { name: "sticker", prefix: "." }, x: 60, y: 200 },
      { type: "condition", label: "Tem imagem?", config: { condition: "has_image" }, x: 300, y: 200 },
      { type: "action", label: "Criar sticker", config: { action: "make_sticker" }, x: 540, y: 100 },
      { type: "response", label: "Sem imagem", config: { texto: "⚠️ *Envie ou responda uma imagem/vídeo* para criar a figurinha!\n\n💡 _Dica: você também pode responder um GIF_", tipoResposta: "texto", quote: true }, x: 540, y: 340 },
    ],
    edges: [{ source: "0", target: "1" }, { source: "1", target: "2", sourceHandle: "true" }, { source: "1", target: "3", sourceHandle: "false" }],
  },
  {
    name: "Boas-Vindas", icon: "user-plus", desc: "Mensagem automática para novos membros",
    nodes: [
      { type: "command", label: "Configurar", config: { name: "welcome", prefix: "." }, x: 60, y: 200 },
      { type: "condition", label: "É admin?", config: { condition: "is_admin" }, x: 300, y: 200 },
      { type: "action", label: "Ativar", config: { action: "set_welcome", welcome_text: "👋 *Bem-vindo(a), {nome}!*\n\n📋 Regras do grupo:\n1️⃣ Respeite todos\n2️⃣ Sem spam/flood\n3️⃣ Sem links sem permissão\n4️⃣ Sem conteúdo +18\n\n🤖 Digite *.menu* para ver os comandos!" }, x: 540, y: 100 },
      { type: "response", label: "Negado", config: { texto: "❌ Apenas *admins* podem configurar a mensagem de boas-vindas!", tipoResposta: "texto" }, x: 540, y: 340 },
    ],
    edges: [{ source: "0", target: "1" }, { source: "1", target: "2", sourceHandle: "true" }, { source: "1", target: "3", sourceHandle: "false" }],
  },
  {
    name: "Anti-Link Completo", icon: "shield", desc: "Proteção contra links com aviso e remoção",
    nodes: [
      { type: "command", label: "Ativar", config: { name: "antilink", prefix: "." }, x: 60, y: 100 },
      { type: "condition", label: "É admin?", config: { condition: "is_admin" }, x: 300, y: 100 },
      { type: "action", label: "Ligar Anti-Link", config: { action: "antilink" }, x: 540, y: 30 },
      { type: "response", label: "Negado", config: { texto: "❌ Comando exclusivo para admins!", tipoResposta: "texto" }, x: 540, y: 200 },
      { type: "condition", label: "Tem link?", config: { condition: "contains_link" }, x: 60, y: 380 },
      { type: "condition", label: "Autor admin?", config: { condition: "is_admin" }, x: 300, y: 380 },
      { type: "action", label: "Apagar msg", config: { action: "delete_message" }, x: 540, y: 460 },
      { type: "response", label: "Aviso", config: { texto: "🚫 *@{nome}*, links não são permitidos neste grupo!\n\n⚠️ Próxima vez será removido(a).", tipoResposta: "texto", mention: true }, x: 780, y: 460 },
    ],
    edges: [
      { source: "0", target: "1" }, { source: "1", target: "2", sourceHandle: "true" }, { source: "1", target: "3", sourceHandle: "false" },
      { source: "4", target: "5", sourceHandle: "true" }, { source: "5", target: "6", sourceHandle: "false" }, { source: "6", target: "7" },
    ],
  },
  {
    name: "Marcar Todos", icon: "at-sign", desc: "Hidetag com verificação de admin",
    nodes: [
      { type: "command", label: "Comando", config: { name: "marcar", prefix: "." }, x: 60, y: 200 },
      { type: "condition", label: "É grupo?", config: { condition: "is_group" }, x: 300, y: 200 },
      { type: "condition", label: "É admin?", config: { condition: "is_admin" }, x: 540, y: 100 },
      { type: "action", label: "Marcar todos", config: { action: "hidetag", message: "📢 *Atenção membros!*\n\n{mensagem}" }, x: 780, y: 30 },
      { type: "response", label: "Não é admin", config: { texto: "❌ Apenas *admins* podem marcar todos!", tipoResposta: "texto" }, x: 780, y: 200 },
      { type: "response", label: "Só grupo", config: { texto: "⚠️ Este comando só funciona em *grupos*!", tipoResposta: "texto" }, x: 540, y: 340 },
    ],
    edges: [
      { source: "0", target: "1" },
      { source: "1", target: "2", sourceHandle: "true" }, { source: "1", target: "5", sourceHandle: "false" },
      { source: "2", target: "3", sourceHandle: "true" }, { source: "2", target: "4", sourceHandle: "false" },
    ],
  },
  {
    name: "Saldo & Loja", icon: "dollar-sign", desc: "Sistema de moedas com menu de loja",
    nodes: [
      { type: "command", label: ".saldo", config: { name: "saldo", prefix: "." }, x: 60, y: 100 },
      { type: "response", label: "Exibir saldo", config: { texto: "💰 *Carteira de {nome}*\n\n🪙 Moedas: *{moedas}*\n📦 Plano: {plano}\n📊 Nível: {nivel}\n\n🛒 Digite *.loja* para gastar moedas!", tipoResposta: "texto" }, x: 300, y: 100 },
      { type: "command", label: ".loja", config: { name: "loja", prefix: "." }, x: 60, y: 340 },
      { type: "response", label: "Menu loja", config: { texto: "🛒 *Loja de Itens*\n\n🏷️ *Itens disponíveis:*\n\n1️⃣ 🎖️ Cargo VIP — 500 moedas\n2️⃣ 🖼️ Figurinha exclusiva — 100 moedas\n3️⃣ 🎰 Giro da sorte — 50 moedas\n4️⃣ 📢 Anúncio no grupo — 200 moedas\n\n_Responda com o número do item_", tipoResposta: "texto" }, x: 300, y: 340 },
    ],
    edges: [{ source: "0", target: "1" }, { source: "2", target: "3" }],
  },
  {
    name: "Jogos & Diversão", icon: "zap", desc: "Pacote com cara/coroa, dado e roleta",
    nodes: [
      { type: "command", label: ".cara", config: { name: "cara", prefix: "." }, x: 60, y: 60 },
      { type: "action", label: "Cara ou Coroa", config: { action: "coin_flip" }, x: 300, y: 60 },
      { type: "command", label: ".dado", config: { name: "dado", prefix: "." }, x: 60, y: 200 },
      { type: "action", label: "Rolar Dado", config: { action: "dice_roll" }, x: 300, y: 200 },
      { type: "command", label: ".sorte", config: { name: "sorte", prefix: "." }, x: 60, y: 340 },
      { type: "action", label: "Biscoito", config: { action: "fortune" }, x: 300, y: 340 },
      { type: "command", label: ".roleta", config: { name: "roleta", prefix: "." }, x: 60, y: 480 },
      { type: "action", label: "Roleta Russa", config: { action: "roulette" }, x: 300, y: 480 },
    ],
    edges: [{ source: "0", target: "1" }, { source: "2", target: "3" }, { source: "4", target: "5" }, { source: "6", target: "7" }],
  },
  {
    name: "Moderação Completa", icon: "shield", desc: "Anti-spam, anti-flood e anti-palavrão",
    nodes: [
      { type: "command", label: ".mod", config: { name: "mod", prefix: "." }, x: 60, y: 200 },
      { type: "condition", label: "É admin?", config: { condition: "is_admin" }, x: 300, y: 200 },
      { type: "action", label: "Anti-Spam", config: { action: "antispam" }, x: 540, y: 60 },
      { type: "action", label: "Anti-Flood", config: { action: "antiflood", flood_max: "5" }, x: 540, y: 200 },
      { type: "action", label: "Anti-Palavrão", config: { action: "antitoxic" }, x: 540, y: 340 },
      { type: "response", label: "Confirmado", config: { texto: "✅ *Moderação ativada!*\n\n🛡️ Anti-Spam: ON\n💧 Anti-Flood: ON (máx 5 msgs)\n🤬 Anti-Palavrão: ON\n\n_O bot agora protege o grupo automaticamente_", tipoResposta: "texto" }, x: 780, y: 200 },
      { type: "response", label: "Negado", config: { texto: "❌ Apenas *admins* podem ativar a moderação!", tipoResposta: "texto" }, x: 300, y: 400 },
    ],
    edges: [
      { source: "0", target: "1" },
      { source: "1", target: "2", sourceHandle: "true" }, { source: "1", target: "6", sourceHandle: "false" },
      { source: "2", target: "3" }, { source: "3", target: "4" }, { source: "4", target: "5" },
    ],
  },
  {
    name: "Enquete Rápida", icon: "bar-chart-2", desc: "Criar enquete com botões interativos",
    nodes: [
      { type: "command", label: ".enquete", config: { name: "enquete", prefix: "." }, x: 60, y: 200 },
      { type: "condition", label: "É grupo?", config: { condition: "is_group" }, x: 300, y: 200 },
      { type: "buttons", label: "Votação", config: { tipoBotao: "normal", titulo: "📊 Enquete Rápida", botoes: ".voto_sim | ✅ Sim, concordo\n.voto_nao | ❌ Não concordo\n.voto_tanto | 🤷 Tanto faz", rodape: "BotAluguel Pro" }, x: 540, y: 100 },
      { type: "response", label: "Só grupo", config: { texto: "⚠️ Enquetes só funcionam em *grupos*!", tipoResposta: "texto" }, x: 540, y: 340 },
    ],
    edges: [{ source: "0", target: "1" }, { source: "1", target: "2", sourceHandle: "true" }, { source: "1", target: "3", sourceHandle: "false" }],
  },
  {
    name: "Webhook Externo", icon: "globe", desc: "Integração com API externa via HTTP",
    nodes: [
      { type: "command", label: ".api", config: { name: "api", prefix: "." }, x: 60, y: 200 },
      { type: "condition", label: "É dono?", config: { condition: "is_owner" }, x: 300, y: 200 },
      { type: "action", label: "Digitando...", config: { action: "typing" }, x: 540, y: 100 },
      { type: "action", label: "Webhook", config: { action: "http_request", http_url: "https://api.exemplo.com/webhook", http_method: "POST" }, x: 780, y: 100 },
      { type: "response", label: "Resultado", config: { texto: "✅ *Webhook executado!*\n\n📡 Resposta da API recebida com sucesso.\n\n_Dados enviados: {mensagem}_", tipoResposta: "texto" }, x: 1020, y: 100 },
      { type: "response", label: "Negado", config: { texto: "🔒 Este comando é exclusivo do *dono do bot*!", tipoResposta: "texto" }, x: 540, y: 340 },
    ],
    edges: [
      { source: "0", target: "1" },
      { source: "1", target: "2", sourceHandle: "true" }, { source: "1", target: "5", sourceHandle: "false" },
      { source: "2", target: "3" }, { source: "3", target: "4" },
    ],
  },
];

function getNodeLabel(node: FlowNode): string {
  const cfg = node.config;
  if (node.type === "command" && cfg.name) return `.${cfg.prefix ?? ""}${cfg.name}`;
  if (node.type === "action" && cfg.action) {
    const opt = CFG.action.find(f => f.key === "action")?.options?.find(o => o.value === cfg.action);
    return opt ? opt.label.replace(/[^\w\s]/gu, "").trim() : String(cfg.action);
  }
  if (node.type === "condition" && cfg.condition) {
    const opt = CFG.condition.find(f => f.key === "condition")?.options?.find(o => o.value === cfg.condition);
    return opt ? opt.label.replace(/[^\w\s]/gu, "").trim() : String(cfg.condition);
  }
  if (node.type === "response" && cfg.texto) return String(cfg.texto).slice(0, 28) + (String(cfg.texto).length > 28 ? "…" : "");
  return node.label;
}

/* Pulsing animated dot for output ports — with optional icon inside */
function PulsingDot({ color, size = 14, icon }: { color: string; size?: number; icon?: string }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 800 }),
        withTiming(1,   { duration: 800 }),
      ),
      -1,
    );
  }, []);
  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 2.2 - scale.value,
  }));
  return (
    <View style={{ width: size + 12, height: size + 12, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[{
        position: "absolute",
        width: size + 4,
        height: size + 4,
        borderRadius: (size + 4) / 2,
        borderWidth: 1.5,
        borderColor: color + "70",
      }, ring]} />
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
        elevation: 6,
      }}>
        {icon && <Feather name={icon as any} size={Math.floor(size * 0.52)} color="#fff" />}
      </View>
    </View>
  );
}

/* Bezier dashed edge with arrowhead — no SVG required */
function BezierEdge({ x1, y1, x2, y2, color, live = false }: {
  x1: number; y1: number; x2: number; y2: number; color: string; live?: boolean;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.sqrt(dx * dx + dy * dy) < 4) return null;

  const liveBend = Math.min(Math.abs(dx) * 0.35 + 36, 90);
  const bend = live ? liveBend : Math.min(Math.abs(dx) * 0.55, 130);
  const cp1x = x1 + bend; const cp1y = y1;
  const cp2x = x2 - (live ? liveBend * 0.4 : bend); const cp2y = y2;

  const N = live ? 32 : 48;
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const t = i / N;
    const mt = 1 - t;
    return {
      x: mt ** 3 * x1 + 3 * mt ** 2 * t * cp1x + 3 * mt * t ** 2 * cp2x + t ** 3 * x2,
      y: mt ** 3 * y1 + 3 * mt ** 2 * t * cp1y + 3 * mt * t ** 2 * cp2y + t ** 3 * y2,
    };
  });

  const THICK = 2;
  const DASH = 9;
  const GAP = 6;
  const STEP = DASH + GAP;
  const opacity = live ? 0.92 : 0.82;
  let arc = 0;
  const segs: React.ReactElement[] = [];

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i]; const p1 = pts[i + 1];
    const sdx = p1.x - p0.x; const sdy = p1.y - p0.y;
    const segLen = Math.sqrt(sdx * sdx + sdy * sdy);
    const mid = arc + segLen / 2;
    arc += segLen;
    if (mid % STEP > DASH) continue;
    const cx = (p0.x + p1.x) / 2;
    const cy = (p0.y + p1.y) / 2;
    const angle = Math.atan2(sdy, sdx) * (180 / Math.PI);
    segs.push(
      <View key={i} style={{
        position: "absolute",
        left: cx - segLen / 2,
        top: cy - THICK / 2,
        width: segLen,
        height: THICK,
        borderRadius: THICK / 2,
        backgroundColor: color,
        opacity,
        transform: [{ rotate: `${angle}deg` }],
      }} />
    );
  }

  if (live) {
    return (
      <>
        {segs}
        {/* Live line endpoint: glowing circle, no arrowhead */}
        <View style={{
          position: "absolute",
          left: x2 - 7, top: y2 - 7,
          width: 14, height: 14, borderRadius: 7,
          backgroundColor: color, opacity: 0.85,
          shadowColor: color, shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1, shadowRadius: 6, elevation: 4,
        }} />
        <View style={{
          position: "absolute",
          left: x2 - 4, top: y2 - 4,
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: "#fff", opacity: 0.7,
        }} />
      </>
    );
  }

  const last2 = pts[pts.length - 2];
  const last1 = pts[pts.length - 1];
  const endAngle = Math.atan2(last1.y - last2.y, last1.x - last2.x) * (180 / Math.PI);
  const ARROW = 9;
  const cosA = Math.cos(endAngle * Math.PI / 180);
  const sinA = Math.sin(endAngle * Math.PI / 180);
  const ax = x2 - cosA * 5;
  const ay = y2 - sinA * 5;

  return (
    <>
      {segs}
      <View style={{ position: "absolute", left: ax - ARROW / 2, top: ay - THICK / 2, width: ARROW, height: THICK, borderRadius: THICK / 2, backgroundColor: color, opacity, transform: [{ rotate: `${endAngle - 38}deg` }] }} />
      <View style={{ position: "absolute", left: ax - ARROW / 2, top: ay - THICK / 2, width: ARROW, height: THICK, borderRadius: THICK / 2, backgroundColor: color, opacity, transform: [{ rotate: `${endAngle + 38}deg` }] }} />
    </>
  );
}

interface NodeCardProps {
  node: FlowNode;
  canvasScale: SharedValue<number>;
  canvasX: SharedValue<number>;
  canvasY: SharedValue<number>;
  canvasOX: SharedValue<number>;
  canvasOY: SharedValue<number>;
  selected: boolean;
  hoverHighlight: boolean;
  isConnecting: boolean;
  onSelect: (id: string) => void;
  onEditNode: (node: FlowNode) => void;
  onDeleteNode: (id: string) => void;
  onInputTap: (id: string) => void;
  onPortDragStart: (portX: number, portY: number, color: string, nodeId: string, handle?: "true" | "false") => void;
  onPortDragUpdate: (absX: number, absY: number) => void;
  onPortDragEnd: (absX: number, absY: number) => void;
  onDragMove: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

function NodeCard({
  node, canvasScale, canvasX, canvasY, canvasOX, canvasOY,
  selected, hoverHighlight, isConnecting,
  onSelect, onEditNode, onDeleteNode, onInputTap,
  onPortDragStart, onPortDragUpdate, onPortDragEnd, onDragMove, onDragEnd,
}: NodeCardProps) {
  const cfg = NODE_CFG[node.type];
  const sharedX = useSharedValue(node.x);
  const sharedY = useSharedValue(node.y);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    if (!isDragging.value) {
      sharedX.value = node.x;
      sharedY.value = node.y;
    }
  }, [node.x, node.y]);

  const animStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: sharedX.value,
    top: sharedY.value,
  }));

  const nodeId = node.id;

  const dragGesture = Gesture.Pan()
    .enabled(selected)
    .minDistance(8)
    .onStart(() => {
      "worklet";
      isDragging.value = true;
      savedX.value = sharedX.value;
      savedY.value = sharedY.value;
    })
    .onUpdate((e) => {
      "worklet";
      sharedX.value = savedX.value + e.translationX / canvasScale.value;
      sharedY.value = savedY.value + e.translationY / canvasScale.value;
      runOnJS(onDragMove)(nodeId, sharedX.value, sharedY.value);
    })
    .onEnd(() => {
      "worklet";
      isDragging.value = false;
      runOnJS(onDragEnd)(nodeId, sharedX.value, sharedY.value);
    });

  const makePortGesture = (portOffsetY: number, color: string, handle?: "true" | "false") =>
    Gesture.Pan()
      .minDistance(4)
      .onStart((e) => {
        "worklet";
        const px = node.x + NODE_W;
        const py = node.y + portOffsetY;
        runOnJS(onPortDragStart)(px, py, color, nodeId, handle);
        runOnJS(onPortDragUpdate)(e.absoluteX, e.absoluteY);
      })
      .onUpdate((e) => {
        "worklet";
        runOnJS(onPortDragUpdate)(e.absoluteX, e.absoluteY);
      })
      .onEnd((e) => {
        "worklet";
        runOnJS(onPortDragEnd)(e.absoluteX, e.absoluteY);
      });

  const mainPortGesture = makePortGesture(NODE_H / 2, cfg.color);
  const truePortGesture = makePortGesture(NODE_H / 3, "#22C55E", "true");
  const falsePortGesture = makePortGesture((NODE_H * 2) / 3, "#EF4444", "false");

  const borderColor = hoverHighlight
    ? "#22C55E"
    : selected
    ? cfg.color
    : isConnecting
    ? cfg.color + "60"
    : "rgba(255,255,255,0.08)";
  const glowColor = selected ? cfg.color + "50" : "transparent";

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[animStyle, { width: NODE_W }]}>
        {/* Glow ring when selected */}
        {selected && (
          <View style={[s.nodeGlow, { borderColor: glowColor, shadowColor: cfg.color }]} pointerEvents="none" />
        )}

        {/* Node body */}
        <Pressable
          onPress={() => isConnecting ? onInputTap(nodeId) : onSelect(nodeId)}
          style={[s.node, { borderColor, borderWidth: hoverHighlight ? 2 : 1.5, backgroundColor: cfg.dim }]}
        >
          {/* Header */}
          <View style={s.nodeHeader}>
            <Feather name={cfg.icon as any} size={12} color={cfg.color} />
            <Text style={[s.nodeType, { color: cfg.color }]}>{cfg.label.toUpperCase()}</Text>
            <View style={{ flex: 1 }} />
            <Pressable hitSlop={8} onPress={() => onEditNode(node)} style={s.nodeIconBtn}>
              <Feather name="edit-2" size={12} color="rgba(255,255,255,0.35)" />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => onDeleteNode(nodeId)} style={s.nodeIconBtn}>
              <Feather name="trash-2" size={12} color="rgba(255,255,255,0.25)" />
            </Pressable>
          </View>

          {/* Body */}
          <View style={s.nodeBody}>
            <Text style={[s.nodeLabel, { color: "rgba(255,255,255,0.92)" }]} numberOfLines={2}>
              {getNodeLabel(node)}
            </Text>
            {node.type === "condition" ? (
              <View style={s.conditionPortLabels}>
                <View style={s.conditionPortLabelRow}>
                  <Feather name="check" size={8} color="#22C55E" />
                  <Text style={[s.conditionPortLabelText, { color: "#22C55E" }]}>SIM</Text>
                </View>
                <View style={s.conditionPortLabelRow}>
                  <Feather name="x" size={8} color="#EF4444" />
                  <Text style={[s.conditionPortLabelText, { color: "#EF4444" }]}>NÃO</Text>
                </View>
              </View>
            ) : (
              <Text style={[s.nodeSubLabel, { color: "rgba(255,255,255,0.38)" }]}>
                {cfg.desc}
              </Text>
            )}
          </View>
        </Pressable>

        {/* Left input port — tap always calls onInputTap (connects or disconnects) */}
        <Pressable
          style={s.portLeftWrap}
          onPress={() => onInputTap(nodeId)}
          hitSlop={16}
        >
          <View style={[s.inputDot, isConnecting && { borderColor: "#22C55E", borderWidth: 2 }]} />
        </Pressable>

        {/* Right output port(s) */}
        {node.type === "condition" ? (
          <>
            <GestureDetector gesture={truePortGesture}>
              <Pressable style={s.portRightTrue} hitSlop={16}>
                <PulsingDot color="#22C55E" size={13} icon="check" />
              </Pressable>
            </GestureDetector>
            <GestureDetector gesture={falsePortGesture}>
              <Pressable style={s.portRightFalse} hitSlop={16}>
                <PulsingDot color="#EF4444" size={13} icon="x" />
              </Pressable>
            </GestureDetector>
          </>
        ) : (
          <GestureDetector gesture={mainPortGesture}>
            <Pressable style={s.portRightSingle} hitSlop={20}>
              <PulsingDot color={cfg.color} size={14} icon="chevron-right" />
            </Pressable>
          </GestureDetector>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export default function BuilderScreen() {
  const { id: botId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; handle?: "true" | "false"; color: string } | null>(null);
  const [liveLine, setLiveLine] = useState<{ x1: number; y1: number; x2: number; y2: number; color: string } | null>(null);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<NodeType | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [draggingPos, setDraggingPos] = useState<{ id: string; x: number; y: number } | null>(null);
  const [showBuilderHint, setShowBuilderHint] = useState(false);

  const { data: commandData } = useGetBotCommands(botId ?? "", { query: { enabled: !!botId } });
  const saveMutation = useSaveBotCommands();

  const canvasContainerRef = useRef<View>(null);
  const canvasOX = useSharedValue(0);
  const canvasOY = useSharedValue(0);

  useEffect(() => {
    AsyncStorage.getItem("BUILDER_HINT_SEEN").then((seen) => {
      if (!seen) setShowBuilderHint(true);
    });
  }, []);

  function dismissBuilderHint() {
    setShowBuilderHint(false);
    AsyncStorage.setItem("BUILDER_HINT_SEEN", "1");
  }

  useEffect(() => {
    if (commandData) {
      const rawNodes: any[] = (commandData as any).nodes ?? [];
      const normalizedNodes: FlowNode[] = rawNodes.map((n: any) => ({
        ...n,
        x: n.x ?? n.position?.x ?? 100,
        y: n.y ?? n.position?.y ?? 100,
      }));
      setNodes(normalizedNodes);
      setEdges((commandData as any).edges ?? []);
    }
  }, [commandData]);

  const canvasX = useSharedValue(0);
  const canvasY = useSharedValue(0);
  const canvasScale = useSharedValue(1);
  const savedCX = useSharedValue(0);
  const savedCY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const containerW = useSharedValue(300);
  const containerH = useSharedValue(600);

  // Measure canvas absolute position — called on layout to get accurate screen coords
  const measureCanvas = useCallback(() => {
    canvasContainerRef.current?.measureInWindow((x, y, w, h) => {
      if (w > 0) {
        canvasOX.value = x;
        canvasOY.value = y;
        containerW.value = w;
        containerH.value = h;
      }
    });
  }, [canvasOX, canvasOY, containerW, containerH]);

  const ghostX = useSharedValue(0);
  const ghostY = useSharedValue(0);
  const ghostVisible = useSharedValue(0);

  // Gesture state: track pointer count changes to prevent jump on finger lift
  const isPinching = useSharedValue(false);
  const lastPointerCount = useSharedValue(0);
  const skipPanFrames = useSharedValue(0);

  // Scale from top-left (0,0) — simplifies ALL coordinate math
  const canvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: canvasX.value },
      { translateY: canvasY.value },
      { scale: canvasScale.value },
    ],
    // @ts-ignore web-only, native uses center by default but we override
    transformOrigin: "0% 0%",
  }));

  const ghostStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: ghostX.value - 52,
    top: ghostY.value - 18,
    opacity: ghostVisible.value,
    zIndex: 999,
  }));

  // --- Canvas gestures ---
  // Rule: pointer count change = new gesture. Skip frames during transition.
  const panGesture = useMemo(() =>
    Gesture.Pan()
      .minDistance(6)
      .onStart(() => {
        "worklet";
        savedCX.value = canvasX.value;
        savedCY.value = canvasY.value;
        lastPointerCount.value = 1;
      })
      .onUpdate((e) => {
        "worklet";
        const pointers = e.numberOfPointers;

        // Pointer count changed → reset gesture, skip this frame
        if (pointers !== lastPointerCount.value) {
          lastPointerCount.value = pointers;
          savedCX.value = canvasX.value - e.translationX;
          savedCY.value = canvasY.value - e.translationY;
          skipPanFrames.value = 3;
          return;
        }

        // During pinch or cooldown → resync but don't move
        if (isPinching.value || skipPanFrames.value > 0) {
          if (skipPanFrames.value > 0) skipPanFrames.value--;
          savedCX.value = canvasX.value - e.translationX;
          savedCY.value = canvasY.value - e.translationY;
          return;
        }

        // Normal 1-finger pan
        canvasX.value = savedCX.value + e.translationX;
        canvasY.value = savedCY.value + e.translationY;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const pinchGesture = useMemo(() =>
    Gesture.Pinch()
      .onStart(() => {
        "worklet";
        isPinching.value = true;
        savedScale.value = canvasScale.value;
        savedCX.value = canvasX.value;
        savedCY.value = canvasY.value;
      })
      .onUpdate((e) => {
        "worklet";
        const minF = 0.25 / savedScale.value;
        const maxF = 2.5  / savedScale.value;
        const f = Math.max(minF, Math.min(maxF, e.scale));
        canvasScale.value = savedScale.value * f;
        canvasX.value = e.focalX * (1 - f) + f * savedCX.value;
        canvasY.value = e.focalY * (1 - f) + f * savedCY.value;
      })
      .onEnd(() => {
        "worklet";
        isPinching.value = false;
        skipPanFrames.value = 4;
      })
      .onFinalize(() => {
        "worklet";
        isPinching.value = false;
        skipPanFrames.value = 4;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const composedGesture = useMemo(() =>
    Gesture.Simultaneous(panGesture, pinchGesture),
    [panGesture, pinchGesture]
  );

  /* --- Port drag handlers --- */
  // With transformOrigin 0,0: parent_x = cx * scale + tx
  // Inverse: cx = (parent_x - tx) / scale
  const absToCanvas = useCallback((absX: number, absY: number) => {
    const s = canvasScale.value;
    return {
      x: (absX - canvasOX.value - canvasX.value) / s,
      y: (absY - canvasOY.value - canvasY.value) / s,
    };
  }, [canvasOX, canvasOY, canvasX, canvasY, canvasScale]);

  const handlePortDragStart = useCallback((portX: number, portY: number, color: string, nodeId: string, handle?: "true" | "false") => {
    setConnectingFrom({ nodeId, handle, color });
    setSelectedId(nodeId);
    setLiveLine({ x1: portX, y1: portY, x2: portX, y2: portY, color });
  }, []);

  const handlePortDragUpdate = useCallback((absX: number, absY: number) => {
    const { x, y } = absToCanvas(absX, absY);
    setLiveLine(prev => prev ? { ...prev, x2: x, y2: y } : null);
    const hovered = nodes.find(n => x >= n.x && x <= n.x + NODE_W && y >= n.y && y <= n.y + NODE_H);
    setHoverNodeId(hovered?.id ?? null);
  }, [absToCanvas, nodes]);

  const handlePortDragEnd = useCallback((absX: number, absY: number) => {
    const { x, y } = absToCanvas(absX, absY);
    const target = nodes.find(n => x >= n.x && x <= n.x + NODE_W && y >= n.y && y <= n.y + NODE_H);
    if (target && connectingFrom && target.id !== connectingFrom.nodeId) {
      const already = edges.some(e => e.source === connectingFrom.nodeId && e.target === target.id && e.sourceHandle === connectingFrom.handle);
      if (!already) {
        setEdges(prev => [...prev, { id: uid(), source: connectingFrom.nodeId, target: target.id, sourceHandle: connectingFrom.handle }]);
        setHasUnsaved(true);
      }
    }
    setLiveLine(null);
    setHoverNodeId(null);
    setConnectingFrom(null);
  }, [absToCanvas, nodes, connectingFrom, edges]);

  /* --- Node handlers --- */
  const handleDragMove = useCallback((id: string, x: number, y: number) => {
    setDraggingPos({ id, x, y });
  }, []);

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    setDraggingPos(null);
    setHasUnsaved(true);
  }, []);

  const getEffectivePos = (node: FlowNode) => {
    if (draggingPos && draggingPos.id === node.id) {
      return { x: draggingPos.x, y: draggingPos.y };
    }
    return { x: node.x, y: node.y };
  };

  const handleSelectNode = useCallback((id: string) => {
    if (connectingFrom) {
      if (connectingFrom.nodeId !== id) {
        const already = edges.some(e => e.source === connectingFrom.nodeId && e.target === id && e.sourceHandle === connectingFrom.handle);
        if (!already) {
          setEdges(prev => [...prev, { id: uid(), source: connectingFrom.nodeId, target: id, sourceHandle: connectingFrom.handle }]);
          setHasUnsaved(true);
        }
        setConnectingFrom(null);
        setLiveLine(null);
        setHoverNodeId(null);
      }
    } else {
      setSelectedId(prev => prev === id ? null : id);
    }
  }, [connectingFrom, edges]);

  const handleInputTap = useCallback((targetId: string) => {
    if (connectingFrom) {
      if (connectingFrom.nodeId !== targetId) {
        const already = edges.some(e => e.source === connectingFrom.nodeId && e.target === targetId && e.sourceHandle === connectingFrom.handle);
        if (!already) {
          setEdges(prev => [...prev, { id: uid(), source: connectingFrom.nodeId, target: targetId, sourceHandle: connectingFrom.handle }]);
          setHasUnsaved(true);
        }
      }
      setConnectingFrom(null);
      setLiveLine(null);
      setHoverNodeId(null);
      setSelectedId(null);
    } else {
      const incoming = edges.filter(e => e.target === targetId);
      if (incoming.length > 0) {
        setEdges(prev => prev.filter(e => e.target !== targetId));
        setHasUnsaved(true);
      }
    }
  }, [connectingFrom, edges]);

  const handleEditNode = useCallback((node: FlowNode) => {
    setEditingNode({ ...node });
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    Alert.alert("Excluir bloco?", "Esta ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => {
        setNodes(prev => prev.filter(n => n.id !== id));
        setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
        setSelectedId(null);
        setHasUnsaved(true);
      }},
    ]);
  }, []);

  const addNode = useCallback((type: NodeType, cx?: number, cy?: number) => {
    const x = cx ?? 100 + nodes.length * 220 % 600;
    const y = cy ?? 180 + Math.floor(nodes.length / 3) * 140;
    const n = makeNode(type, x, y);
    setNodes(prev => [...prev, n]);
    setHasUnsaved(true);
  }, [nodes.length]);

  const addNodeAtCenter = useCallback((type: NodeType) => {
    // With transformOrigin 0,0: cx = (parentX - tx) / s
    const s = canvasScale.value;
    const cx = (containerW.value / 2 - canvasX.value) / s - NODE_W / 2;
    const cy = (containerH.value / 2 - canvasY.value) / s - NODE_H / 2;
    addNode(type, Math.max(20, cx), Math.max(20, cy));
  }, [containerW, containerH, canvasX, canvasY, canvasScale, addNode]);

  const handlePillDrop = useCallback((type: NodeType, absX: number, absY: number) => {
    setDraggingType(null);
    // With transformOrigin 0,0: cx = (parentX - tx) / s
    const s = canvasScale.value;
    const tx = canvasX.value;
    const ty = canvasY.value;
    const cx = (absX - canvasOX.value - tx) / s - NODE_W / 2;
    const cy = (absY - canvasOY.value - ty) / s - NODE_H / 2;
    const clampedX = Math.max(20, Math.min(CANVAS_SIZE - NODE_W - 20, cx));
    const clampedY = Math.max(20, Math.min(CANVAS_SIZE - NODE_H - 20, cy));
    addNode(type, clampedX, clampedY);
  }, [canvasOX, canvasOY, canvasX, canvasY, canvasScale, addNode]);

  const PILL_TYPES: NodeType[] = ["command", "action", "condition", "response", "buttons"];
  const pillGestures = PILL_TYPES.map((type) =>
    Gesture.Pan()
      .activateAfterLongPress(350)
      .onStart((e) => {
        "worklet";
        ghostX.value = e.absoluteX;
        ghostY.value = e.absoluteY;
        runOnJS(setDraggingType)(type);
      })
      .onUpdate((e) => {
        "worklet";
        const moved = Math.sqrt(e.translationX * e.translationX + e.translationY * e.translationY);
        if (moved > 8) ghostVisible.value = 1;
        ghostX.value = e.absoluteX;
        ghostY.value = e.absoluteY;
      })
      .onEnd((e) => {
        "worklet";
        ghostVisible.value = 0;
        const moved = Math.sqrt(e.translationX * e.translationX + e.translationY * e.translationY);
        if (moved < 10) {
          runOnJS(addNodeAtCenter)(type);
        } else {
          runOnJS(handlePillDrop)(type, e.absoluteX, e.absoluteY);
        }
      })
  );

  const updateNode = useCallback((updated: FlowNode) => {
    setNodes(prev => prev.map(n => n.id === updated.id ? updated : n));
    setEditingNode(null);
    setHasUnsaved(true);
  }, []);

  const applyTemplate = useCallback((tpl: typeof TEMPLATES[0]) => {
    const ids: string[] = tpl.nodes.map(() => uid());
    const newNodes: FlowNode[] = tpl.nodes.map((n, i) => ({
      id: ids[i], type: n.type!, label: NODE_CFG[n.type!].label,
      config: n.config ?? {}, x: n.x ?? 60 + i * 280, y: n.y ?? 240,
    }));
    const newEdges: FlowEdge[] = tpl.edges.map(e => ({
      id: uid(),
      source: ids[parseInt(e.source!)],
      target: ids[parseInt(e.target!)],
      sourceHandle: e.sourceHandle,
    }));
    setNodes(newNodes);
    setEdges(newEdges);
    setShowTemplates(false);
    setHasUnsaved(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!botId) return;
    try {
      const nodesToSave = nodes.map((n) => ({ ...n, position: { x: n.x, y: n.y } }));
      await saveMutation.mutateAsync({ botId, data: { nodes: nodesToSave, edges } as any });
      setHasUnsaved(false);
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o fluxo.");
    }
  }, [botId, nodes, edges, saveMutation]);

  const zoom = useCallback((factor: number) => {
    const oldS = canvasScale.value;
    const newS = Math.max(0.25, Math.min(2.5, oldS * factor));
    const f = newS / oldS;
    const cW = containerW.value > 50 ? containerW.value : 390;
    const cH = containerH.value > 50 ? containerH.value : 600;
    const tx = canvasX.value;
    const ty = canvasY.value;
    // With transformOrigin 0,0: keep viewport center stationary
    // newTX = (cW/2)*(1-f) + f*tx
    canvasX.value = withTiming((cW / 2) * (1 - f) + f * tx, { duration: 200 });
    canvasY.value = withTiming((cH / 2) * (1 - f) + f * ty, { duration: 200 });
    canvasScale.value = withTiming(newS, { duration: 200 });
  }, [canvasScale, canvasX, canvasY, containerW, containerH]);

  const paddingTop = Platform.OS === "web" ? insets.top + 60 : insets.top;

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* ── HEADER: Edge glass style ── */}
      <View style={[s.topBar, { paddingTop: paddingTop + 10, borderBottomColor: "rgba(255,255,255,0.06)", backgroundColor: "#0A0A14" }]}>
        {/* Row 1: back | title+subtitle | mode pills | save */}
        <View style={s.topBarRow}>
          {/* Back button — glass */}
          <Pressable style={s.backBtnGlass} onPress={() => router.back()}>
            <Feather name="chevron-left" size={18} color="#8E8E9E" />
          </Pressable>

          {/* Title + subtitle */}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.titleEdge}>Construtor Visual</Text>
            <Text style={s.subtitleEdge}>Arraste para navegar · Scroll para zoom</Text>
          </View>

          {/* Mode mini-toolbar — glass pill */}
          <View style={s.modePill}>
            <View style={s.modeBtnActive}>
              <Feather name="move" size={13} color="#fff" />
            </View>
            <View style={s.modeBtnInactive}>
              <Feather name="eye" size={13} color="#555575" />
            </View>
          </View>

          {/* Save button */}
          <Pressable
            style={[s.saveBtnEdge, saveMutation.isPending && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saveMutation.isPending}
          >
            <Feather name="save" size={14} color="#FFF" />
            <Text style={s.saveBtnText}>{saveMutation.isPending ? "…" : "Salvar"}</Text>
          </Pressable>
        </View>

        {/* Row 2: bot id badge + unsaved indicator */}
        <View style={s.topBarRow2}>
          <View style={s.botBadge}>
            <View style={[s.statusDot, { shadowColor: "#22C55E", shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }]} />
            <Text style={s.botBadgeText} numberOfLines={1}>Bot #{String(botId ?? "").slice(0, 8)}</Text>
            <Feather name="chevron-down" size={13} color="#555575" />
          </View>
          {hasUnsaved && (
            <View style={s.unsavedChip}>
              <View style={[s.unsavedDot, { marginRight: 4 }]} />
              <Text style={s.unsavedText}>não salvo</Text>
            </View>
          )}
        </View>

        {/* Row 3: block type pills — tap or drag-to-create */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.pillsRow}
          contentContainerStyle={s.pillsRowContent}
        >
          {PILL_TYPES.map((type, i) => {
            const cfg = NODE_CFG[type];
            return (
              <GestureDetector key={type} gesture={pillGestures[i]}>
                <View style={[s.blockPill, { backgroundColor: cfg.dim, borderColor: cfg.color + "55" }]}>
                  <Feather name="plus" size={10} color={cfg.color} />
                  <Feather name={cfg.icon as any} size={11} color={cfg.color} />
                  <Text style={[s.blockPillText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </GestureDetector>
            );
          })}
        </ScrollView>
      </View>

      <GestureDetector gesture={composedGesture}>
        <View
          ref={canvasContainerRef}
          style={s.canvasContainer}
          onLayout={(e) => {
            containerW.value = e.nativeEvent.layout.width;
            containerH.value = e.nativeEvent.layout.height;
            // Also measure absolute position for drag-drop coordinate mapping
            setTimeout(measureCanvas, 50);
          }}
        >
          <Animated.View style={[s.canvas, canvasStyle]}>
            {/* Dot-grid background — tap to deselect selected node */}
            <Pressable
              style={{ position: "absolute", top: 0, left: 0, width: CANVAS_SIZE, height: CANVAS_SIZE, backgroundColor: C.bg }}
              onPress={() => { setSelectedId(null); setConnectingFrom(null); setLiveLine(null); }}
            >
              {Platform.OS === "web" ? (
                <View style={{
                  width: CANVAS_SIZE, height: CANVAS_SIZE,
                  // @ts-ignore — web-only CSS
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }} />
              ) : (
                // Native: render dots only over a viewport-sized tile to avoid memory crash
                <Svg width={900} height={1400} style={{ position: "absolute", top: 0, left: 0 }}>
                  <Defs>
                    <Pattern id="dots" x="0" y="0" width={14} height={14} patternUnits="userSpaceOnUse">
                      <Circle cx={7} cy={7} r={0.9} fill="rgba(255,255,255,0.13)" />
                    </Pattern>
                  </Defs>
                  <Rect width={900} height={1400} fill="url(#dots)" />
                </Svg>
              )}
            </Pressable>

            {/* Static edges */}
            <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, width: CANVAS_SIZE, height: CANVAS_SIZE }}>
              {edges.map(edge => {
                const src = getNodeById(edge.source);
                const tgt = getNodeById(edge.target);
                if (!src || !tgt) return null;
                const srcPos = getEffectivePos(src);
                const tgtPos = getEffectivePos(tgt);
                let sy = srcPos.y + NODE_H / 2;
                if (edge.sourceHandle === "true")  sy = srcPos.y + NODE_H / 3;
                if (edge.sourceHandle === "false") sy = srcPos.y + (NODE_H * 2) / 3;
                const sx = srcPos.x + NODE_W;
                const tx = tgtPos.x;
                const ty = tgtPos.y + NODE_H / 2;
                const edgeColor = edge.sourceHandle === "true" ? "#22C55E" : edge.sourceHandle === "false" ? "#EF4444" : "#7C3AED";
                return (
                  <BezierEdge key={edge.id} x1={sx} y1={sy} x2={tx} y2={ty} color={edgeColor} />
                );
              })}

              {/* Live dragging line */}
              {liveLine && (
                <BezierEdge
                  x1={liveLine.x1} y1={liveLine.y1}
                  x2={liveLine.x2} y2={liveLine.y2}
                  color={liveLine.color}
                  live
                />
              )}
            </View>

            {/* Nodes */}
            {nodes.map(node => (
              <NodeCard
                key={node.id}
                node={node}
                canvasScale={canvasScale}
                canvasX={canvasX}
                canvasY={canvasY}
                canvasOX={canvasOX}
                canvasOY={canvasOY}
                selected={selectedId === node.id}
                hoverHighlight={hoverNodeId === node.id}
                isConnecting={!!connectingFrom && connectingFrom.nodeId !== node.id}
                onSelect={handleSelectNode}
                onEditNode={handleEditNode}
                onDeleteNode={handleDeleteNode}
                onInputTap={handleInputTap}
                onPortDragStart={handlePortDragStart}
                onPortDragUpdate={handlePortDragUpdate}
                onPortDragEnd={handlePortDragEnd}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
              />
            ))}
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={[s.toolbar, { backgroundColor: C.card, borderTopColor: C.border, paddingBottom: insets.bottom + 8 }]}>
        <Pressable style={[s.toolBtn, { backgroundColor: C.secondary }]} onPress={() => setShowTemplates(true)}>
          <Feather name="layout" size={18} color={C.primary} />
          <Text style={[s.toolBtnText, { color: C.primary }]}>Templates</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <View style={s.zoomBtns}>
          <Pressable style={[s.zoomBtn, { backgroundColor: C.secondary }]} onPress={() => zoom(1.2)}>
            <Feather name="zoom-in" size={16} color={C.fg} />
          </Pressable>
          <Pressable style={[s.zoomBtn, { backgroundColor: C.secondary }]} onPress={() => zoom(0.8)}>
            <Feather name="zoom-out" size={16} color={C.fg} />
          </Pressable>
        </View>
      </View>

      {/* Drag ghost — follows finger when dragging a block pill */}
      <Animated.View style={ghostStyle} pointerEvents="none">
        {draggingType && (() => {
          const cfg = NODE_CFG[draggingType];
          return (
            <View style={[s.blockPill, s.blockPillGhost, { backgroundColor: cfg.dim, borderColor: cfg.color + "80" }]}>
              <Feather name="plus" size={10} color={cfg.color} />
              <Feather name={cfg.icon as any} size={11} color={cfg.color} />
              <Text style={[s.blockPillText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          );
        })()}
      </Animated.View>

      <NodeEditor
        node={editingNode}
        onSave={updateNode}
        onDelete={handleDeleteNode}
        onClose={() => setEditingNode(null)}
      />

      <TemplatesModal
        visible={showTemplates}
        onSelect={applyTemplate}
        onClose={() => setShowTemplates(false)}
      />

      {showBuilderHint && (
        <View style={s.hintBanner} pointerEvents="box-none">
          <View style={s.hintCard}>
            <View style={s.hintIconWrap}>
              <Feather name="info" size={16} color="#A78BFA" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.hintTitle}>Dica de uso</Text>
              <Text style={s.hintBody}>Segure e arraste um bloco da paleta para o canvas. Toque em um nó para editá-lo.</Text>
            </View>
            <Pressable style={s.hintClose} onPress={dismissBuilderHint} accessibilityLabel="Fechar dica" accessibilityRole="button">
              <Feather name="x" size={14} color="#8E8E9E" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function NodeEditor({ node, onSave, onDelete, onClose }: { node: FlowNode | null; onSave: (n: FlowNode) => void; onDelete: (id: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<FlowNode | null>(null);
  const [selectOpen, setSelectOpen] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => { setDraft(node ? { ...node, config: { ...node.config } } : null); setSelectOpen(null); }, [node]);

  if (!draft) return null;

  const fields = CFG[draft.type];
  const visibleFields = fields.filter(f => !f.showWhen || f.showWhen(draft.config));

  function setVal(key: string, val: unknown) {
    setDraft(prev => prev ? { ...prev, config: { ...prev.config, [key]: val } } : null);
  }

  const cfg = NODE_CFG[draft.type];

  return (
    <Modal visible animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <Pressable style={s.editorOverlay} onPress={onClose} />
        <View style={[s.editorSheet, { backgroundColor: C.card, paddingBottom: insets.bottom + 16 }]}>
          <View style={[s.editorHandle, { backgroundColor: C.border }]} />
          <View style={[s.editorHeader, { borderBottomColor: C.border }]}>
            <View style={[s.editorTypeChip, { backgroundColor: cfg.dim }]}>
              <Feather name={cfg.icon as any} size={14} color={cfg.color} />
              <Text style={[s.editorTypeName, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Pressable onPress={() => { Alert.alert("Excluir bloco?", "Esta ação não pode ser desfeita.", [{ text: "Cancelar", style: "cancel" }, { text: "Excluir", style: "destructive", onPress: () => onDelete(draft.id) }]); }}>
              <Feather name="trash-2" size={18} color={C.destructive} />
            </Pressable>
            <Pressable onPress={onClose} style={{ marginLeft: 16 }}>
              <Feather name="x" size={20} color={C.muted} />
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={s.editorBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {visibleFields.map(field => (
              <View key={field.key} style={s.formGroup}>
                <Text style={[s.formLabel, { color: C.muted }]}>{field.label}</Text>
                {field.type === "text" && (
                  <TextInput
                    style={[s.formInput, { color: C.fg, backgroundColor: C.secondary, borderColor: C.border }]}
                    value={String(draft.config[field.key] ?? "")}
                    onChangeText={v => setVal(field.key, v)}
                    placeholder={field.placeholder}
                    placeholderTextColor={C.muted}
                  />
                )}
                {field.type === "textarea" && (
                  <TextInput
                    style={[s.formInput, s.formTextarea, { color: C.fg, backgroundColor: C.secondary, borderColor: C.border }]}
                    value={String(draft.config[field.key] ?? "")}
                    onChangeText={v => setVal(field.key, v)}
                    placeholder={field.placeholder}
                    placeholderTextColor={C.muted}
                    multiline
                    numberOfLines={4}
                  />
                )}
                {field.type === "toggle" && (
                  <Switch
                    value={!!draft.config[field.key]}
                    onValueChange={v => setVal(field.key, v)}
                    trackColor={{ false: C.secondary, true: cfg.color + "80" }}
                    thumbColor={draft.config[field.key] ? cfg.color : C.muted}
                  />
                )}
                {field.type === "select" && (
                  <View>
                    <Pressable
                      style={[s.formInput, { backgroundColor: C.secondary, borderColor: selectOpen === field.key ? cfg.color : C.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
                      onPress={() => setSelectOpen(selectOpen === field.key ? null : field.key)}
                    >
                      <Text style={{ color: draft.config[field.key] ? C.fg : C.muted, flex: 1, fontSize: 14 }} numberOfLines={1}>
                        {field.options?.find(o => o.value === draft.config[field.key])?.label ?? "Selecione…"}
                      </Text>
                      <Feather name={selectOpen === field.key ? "chevron-up" : "chevron-down"} size={16} color={C.muted} />
                    </Pressable>
                    {selectOpen === field.key && (
                      <View style={[s.selectDropdown, { backgroundColor: C.card, borderColor: C.border }]}>
                        <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                          {field.options?.map(opt => (
                            <Pressable
                              key={opt.value}
                              style={[s.selectOption, draft.config[field.key] === opt.value && { backgroundColor: cfg.dim }]}
                              onPress={() => { setVal(field.key, opt.value); setSelectOpen(null); }}
                            >
                              <Text style={[s.selectOptionText, { color: draft.config[field.key] === opt.value ? cfg.color : C.fg }]}>{opt.label}</Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <Pressable style={[s.editorSaveBtn, { backgroundColor: cfg.color }]} onPress={() => onSave(draft)}>
            <Feather name="check" size={16} color="#FFF" />
            <Text style={s.editorSaveBtnText}>Salvar bloco</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function TypePickerModal({ visible, onSelect, onClose }: { visible: boolean; onSelect: (t: NodeType) => void; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const types: NodeType[] = ["command", "action", "condition", "response", "buttons"];
  const descriptions: Record<NodeType, string> = {
    command: "Detecta um comando de WhatsApp (ex: .menu, .sticker)",
    action: "Executa uma ação (figurinha, hidetag, banir, etc.)",
    condition: "Bifurca o fluxo com lógica Sim/Não",
    response: "Envia uma mensagem de resposta ao usuário",
    buttons: "Envia botões interativos para o usuário clicar",
  };
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose} />
      <View style={[s.modalSheet, { backgroundColor: C.card, paddingBottom: insets.bottom + 20 }]}>
        <View style={[s.editorHandle, { backgroundColor: C.border }]} />
        <Text style={[s.modalTitle, { color: C.fg }]}>Adicionar bloco</Text>
        {types.map(type => {
          const cfg = NODE_CFG[type];
          return (
            <Pressable
              key={type}
              style={({ pressed }) => [s.typeRow, { backgroundColor: pressed ? cfg.dim : "transparent", borderColor: C.border }]}
              onPress={() => onSelect(type)}
            >
              <View style={[s.typeIcon, { backgroundColor: cfg.dim }]}>
                <Feather name={cfg.icon as any} size={20} color={cfg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.typeName, { color: C.fg }]}>{cfg.label}</Text>
                <Text style={[s.typeDesc, { color: C.muted }]}>{descriptions[type]}</Text>
              </View>
              <Feather name="plus" size={18} color={cfg.color} />
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}

function TemplatesModal({ visible, onSelect, onClose }: { visible: boolean; onSelect: (t: typeof TEMPLATES[0]) => void; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose} />
      <View style={[s.modalSheet, { backgroundColor: C.card, paddingBottom: insets.bottom + 20, maxHeight: "80%" }]}>
        <View style={[s.editorHandle, { backgroundColor: C.border }]} />
        <Text style={[s.modalTitle, { color: C.fg }]}>Templates prontos</Text>
        <Text style={[s.modalSubtitle, { color: C.muted }]}>Substitui o fluxo atual</Text>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {TEMPLATES.map(tpl => (
            <Pressable
              key={tpl.name}
              style={({ pressed }) => [s.typeRow, { backgroundColor: pressed ? "#7C3AED18" : "transparent", borderColor: C.border }]}
              onPress={() => onSelect(tpl)}
            >
              <View style={[s.typeIcon, { backgroundColor: "#7C3AED18" }]}>
                <Feather name={tpl.icon as any} size={20} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.typeName, { color: C.fg }]}>{tpl.name}</Text>
                <Text style={[s.typeDesc, { color: C.muted }]}>{tpl.desc}</Text>
                <Text style={{ fontSize: 10, color: C.muted, marginTop: 2, fontFamily: "Inter_400Regular" }}>{tpl.nodes.length} blocos · {tpl.edges.length} conexões</Text>
              </View>
              <Feather name="chevron-right" size={18} color={C.muted} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  /* ── Edge-style header ── */
  topBar: {
    paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1,
    gap: 10,
  },
  topBarRow: {
    flexDirection: "row" as const, alignItems: "center", gap: 8,
  },
  topBarRow2: {
    flexDirection: "row" as const, alignItems: "center", justifyContent: "space-between",
  },
  backBtnGlass: {
    width: 34, height: 34, alignItems: "center", justifyContent: "center",
    borderRadius: 12, borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)",
  },
  titleEdge: {
    fontSize: 15, fontWeight: "700" as const, fontFamily: "Inter_700Bold",
    color: "#EBEBF2", lineHeight: 18,
  },
  subtitleEdge: {
    fontSize: 9, fontFamily: "Inter_400Regular",
    color: "#3A3A58", marginTop: 1,
  },
  modePill: {
    flexDirection: "row" as const, alignItems: "center", gap: 6,
  },
  modeBtnActive: {
    width: 32, height: 32, alignItems: "center", justifyContent: "center",
    borderRadius: 16, backgroundColor: "#6D28D9",
  },
  modeBtnInactive: {
    width: 32, height: 32, alignItems: "center", justifyContent: "center",
    borderRadius: 16, backgroundColor: "rgba(255,255,255,0.06)",
  },
  saveBtnEdge: {
    flexDirection: "row" as const, alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14,
    backgroundColor: "#7C3AED",
    shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 6,
  },
  botBadge: {
    flexDirection: "row" as const, alignItems: "center", gap: 7,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)",
    flex: 1, marginRight: 8,
  },
  statusDot: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: "#22C55E",
  },
  botBadgeText: {
    flex: 1, fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", color: "#EBEBF2",
  },
  unsavedChip: {
    flexDirection: "row" as const, alignItems: "center",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1,
    backgroundColor: "rgba(245,158,11,0.10)", borderColor: "rgba(245,158,11,0.25)",
  },
  unsavedText: {
    fontSize: 10, fontFamily: "Inter_500Medium", color: "#F59E0B",
  },
  /* kept for compatibility */
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center" as const, fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  topBarRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  unsavedDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#F59E0B" },
  saveBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  saveBtnText: { color: "#FFF", fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  connectingBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1,
  },
  connectingText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  canvasContainer: { flex: 1, overflow: "hidden", backgroundColor: C.bg },
  canvas: { width: CANVAS_SIZE, height: CANVAS_SIZE },
  canvasBg: { position: "absolute" as const, top: 0, left: 0, width: CANVAS_SIZE, height: CANVAS_SIZE, backgroundColor: C.bg },

  /* Node glass card */
  node: {
    width: NODE_W,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },
  nodeGlow: {
    position: "absolute" as const,
    top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: 18,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 0,
  },
  nodeHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  nodeIconBtn: { padding: 2 },
  nodeType: {
    fontSize: 10,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  nodeBody: {
    paddingHorizontal: 10,
    paddingTop: 8,
    minHeight: 40,
    alignItems: "flex-start" as const,
  },
  nodeLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 18,
  },
  nodeSubLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    lineHeight: 14,
    marginTop: 2,
  },

  /* Ports */
  portLeftWrap: {
    position: "absolute" as const,
    left: -8,
    top: NODE_H / 2 - 8,
    zIndex: 10,
    padding: 4,
  },
  inputDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  portRightSingle: {
    position: "absolute" as const,
    right: -12,
    top: NODE_H / 2 - 12,
    zIndex: 10,
  },
  portRightTrue: {
    position: "absolute" as const,
    right: -12,
    top: NODE_H / 3 - 8,
    zIndex: 10,
  },
  portRightFalse: {
    position: "absolute" as const,
    right: -12,
    top: (NODE_H * 2) / 3 - 8,
    zIndex: 10,
  },
  portLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  conditionPortLabels: {
    flexDirection: "row" as const,
    gap: 8,
    marginTop: 2,
  },
  conditionPortLabelRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
  },
  conditionPortLabelText: {
    fontSize: 8,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  toolbar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1,
  },
  toolBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  toolBtnText: { fontSize: 13, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  toolBtnPrimary: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 10 },
  toolBtnPrimaryText: { color: "#FFF", fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  zoomBtns: { flexDirection: "row", gap: 6 },
  zoomBtn: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  pillsRow: { marginTop: 6 },
  pillsRowContent: {
    paddingHorizontal: 12, paddingBottom: 10, gap: 7,
    flexDirection: "row" as const, alignItems: "center",
  },
  blockPill: {
    flexDirection: "row" as const, alignItems: "center", gap: 5,
    paddingHorizontal: 11, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
  },
  blockPillGhost: { shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 10 },
  blockPillText: { fontSize: 12, fontFamily: "Inter_500Medium", letterSpacing: 0.2 },
  editorOverlay: { flex: 1 },
  editorSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: SH * 0.82, minHeight: SH * 0.4,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 20,
  },
  editorHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center" as const, marginTop: 12, marginBottom: 8 },
  editorHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  editorTypeChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  editorTypeName: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  editorBody: { padding: 20, gap: 18 },
  formGroup: { gap: 6 },
  formLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase" as const, letterSpacing: 0.6 },
  formInput: {
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, fontFamily: "Inter_400Regular",
  },
  formTextarea: { height: 100, textAlignVertical: "top" as const },
  selectDropdown: {
    borderRadius: 10, borderWidth: 1, marginTop: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
    overflow: "hidden" as const,
  },
  selectOption: { paddingHorizontal: 14, paddingVertical: 12 },
  selectOptionText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  editorSaveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 20, marginTop: 12, paddingVertical: 14, borderRadius: 12 },
  editorSaveBtnText: { color: "#FFF", fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" as const, fontFamily: "Inter_700Bold", marginTop: 12, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  typeRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth, borderRadius: 8,
  },
  typeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  typeName: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  typeDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  hintBanner: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
  },
  hintCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#6D28D940",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  hintIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6D28D918",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  hintTitle: { fontSize: 13, color: "#EBEBF2", fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  hintBody: { fontSize: 11, color: "#8E8E9E", fontFamily: "Inter_400Regular", lineHeight: 16 },
  hintClose: { padding: 6, flexShrink: 0 },
});
