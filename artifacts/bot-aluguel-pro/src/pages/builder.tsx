import { useState, useRef, useCallback, startTransition, useEffect } from "react";
import {
  Save, Plus, Trash2, Bot, Loader2, MessageSquare, Zap, GitBranch,
  Reply, Info, Pencil, X, ChevronRight, Settings2, Link2, ChevronDown,
  ZoomIn, ZoomOut, Maximize2, LayoutTemplate, Image, Shield, Users, Star, HandMetal,
  Gamepad2, Crown, Lock, Heart, Sparkles, Send, Eye, Copy, MousePointerClick, Phone, List,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useListBots, useGetBotCommands, useSaveBotCommands, getGetBotCommandsQueryKey,
  useUpdateBotSettings, useGetBot, getGetBotQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type NodeType = "command" | "action" | "condition" | "response" | "buttons";
type Position = { x: number; y: number };

interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, unknown>;
  position: Position;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: "true" | "false";
}

interface ConnectingEdge {
  sourceId: string;
  sourceHandle?: "true" | "false";
  mouseX: number;
  mouseY: number;
}

interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

const NODE_W = 176;
const NODE_H = 88;
const PORT_Y = NODE_H / 2;
const MIN_SCALE = 0.3;
const MAX_SCALE = 2;
const SCALE_STEP = 0.15;

const nodeConfig: Record<NodeType, { color: string; border: string; icon: React.ElementType; label: string; description: string }> = {
  command: { color: "bg-primary/10", border: "border-primary/40", icon: MessageSquare, label: "Comando", description: "Detecta se a mensagem é um comando" },
  action: { color: "bg-violet-500/10", border: "border-violet-500/40", icon: Zap, label: "Ação", description: "Executa algo" },
  condition: { color: "bg-yellow-500/10", border: "border-yellow-500/40", icon: GitBranch, label: "Condição", description: "Se / Senão" },
  response: { color: "bg-green-500/10", border: "border-green-500/40", icon: Reply, label: "Resposta", description: "Envia texto" },
  buttons: { color: "bg-cyan-500/10", border: "border-cyan-500/40", icon: MousePointerClick, label: "Botoes", description: "Botoes interativos" },
};

const CONFIG_FIELDS: Record<NodeType, { key: string; label: string; type: "text" | "textarea" | "select" | "checkbox"; placeholder?: string; options?: { value: string; label: string }[]; showWhen?: (config: Record<string, unknown>) => boolean }[]> = {
  command: [
    { key: "prefix", label: "Prefixo", type: "select", options: [
      { value: ".", label: "." },
      { value: "!", label: "!" },
      { value: "/", label: "/" },
      { value: "#", label: "#" },
      { value: "@", label: "@" },
      { value: "$", label: "$" },
      { value: "nenhum", label: "Nenhum" },
    ] },
    { key: "name", label: "Nome do comando", type: "text", placeholder: "menu" },
    { key: "caseSensitive", label: "Diferenciar maiúsculas", type: "checkbox" },
    { key: "apenasGrupos", label: "Apenas grupos", type: "checkbox" },
    { key: "apenasPrivado", label: "Apenas privado", type: "checkbox" },
    { key: "requerPlano", label: "Requer plano", type: "checkbox" },
    { key: "requerAdmin", label: "Requer admin", type: "checkbox" },
  ],
  action: [
    {
      key: "action", label: "Tipo de Ação", type: "select", options: [
        { value: "make_sticker", label: "🖼️ Criar Figurinha" },
        { value: "send_image", label: "🖼️ Enviar Imagem" },
        { value: "send_audio", label: "🎵 Enviar Áudio" },
        { value: "send_video", label: "🎥 Enviar Vídeo" },
        { value: "send_document", label: "📄 Enviar Documento" },
        { value: "send_gif", label: "🎭 Enviar GIF" },
        { value: "send_sticker", label: "🏷️ Enviar Figurinha Pronta" },
        { value: "kick_member", label: "🚪 Remover Membro" },
        { value: "ban_member", label: "🔨 Banir Membro" },
        { value: "warn_member", label: "⚠️ Dar Aviso (Warn)" },
        { value: "reset_warns", label: "🔄 Resetar Avisos" },
        { value: "mute_member", label: "🔇 Mutar Membro" },
        { value: "unmute_member", label: "🔊 Desmutar Membro" },
        { value: "delete_message", label: "🗑️ Apagar Mensagem" },
        { value: "promote_member", label: "⬆️ Promover a Admin" },
        { value: "demote_member", label: "⬇️ Rebaixar Admin" },
        { value: "mute_group", label: "🔇 Silenciar Grupo" },
        { value: "unmute_group", label: "🔊 Liberar Grupo" },
        { value: "close_group", label: "🔒 Fechar Grupo" },
        { value: "open_group", label: "🔓 Abrir Grupo" },
        { value: "set_group_name", label: "📝 Mudar Nome do Grupo" },
        { value: "set_group_desc", label: "📄 Mudar Descrição do Grupo" },
        { value: "set_group_photo", label: "🖼️ Mudar Foto do Grupo" },
        { value: "get_group_link", label: "🔗 Link do Grupo" },
        { value: "revoke_group_link", label: "🔄 Revogar Link do Grupo" },
        { value: "hidetag", label: "📢 Marcar Todos (Hidetag)" },
        { value: "react_message", label: "😀 Reagir à Mensagem" },
        { value: "send_poll", label: "📊 Enviar Enquete" },
        { value: "send_list", label: "📋 Enviar Lista Interativa" },
        { value: "send_buttons", label: "🔘 Enviar Botões" },
        { value: "send_carousel", label: "🎠 Enviar Carrossel" },
        { value: "send_contact", label: "📌 Enviar Contato" },
        { value: "send_location", label: "📍 Enviar Localização" },
        { value: "forward_message", label: "↩️ Encaminhar Mensagem" },
        { value: "antilink", label: "🚫 Anti-Link" },
        { value: "antispam", label: "🛡️ Anti-Spam" },
        { value: "antiflood", label: "💧 Anti-Flood" },
        { value: "antifake", label: "🎭 Anti-Fake (DDI Estrangeiro)" },
        { value: "antitoxic", label: "🤬 Anti-Palavrão" },
        { value: "antidelete", label: "👁️ Anti-Delete (Log Apagadas)" },
        { value: "show_menu", label: "📋 Menu Principal" },
        { value: "show_menu_admin", label: "📋 Menu Admin" },
        { value: "show_menu_owner", label: "📋 Menu Dono" },
        { value: "show_menu_games", label: "📋 Menu Jogos" },
        { value: "show_menu_photo", label: "📋 Menu com Foto" },
        { value: "coin_flip", label: "🪙 Cara ou Coroa" },
        { value: "dice_roll", label: "🎲 Rolar Dado" },
        { value: "pick_random", label: "🎯 Sortear Membro" },
        { value: "love_meter", label: "💕 Medidor de Amor" },
        { value: "ship_members", label: "💑 Shippar Membros" },
        { value: "rate", label: "⭐ Nota de 0 a 10" },
        { value: "fortune", label: "🥠 Biscoito da Sorte" },
        { value: "truth_or_dare", label: "🎭 Verdade ou Desafio" },
        { value: "roulette", label: "🔫 Roleta Russa" },
        { value: "top5", label: "🏆 Top 5 do Grupo" },
        { value: "rank", label: "📊 Ranking de Mensagens" },
        { value: "joke", label: "😂 Piada Aleatória" },
        { value: "bot_on", label: "✅ Ligar Bot (Dono)" },
        { value: "bot_off", label: "❌ Desligar Bot (Dono)" },
        { value: "give_coins", label: "💰 Dar Moedas (Dono)" },
        { value: "broadcast", label: "📢 Broadcast — Todos Grupos (Dono)" },
        { value: "block_user", label: "🚷 Bloquear Usuário (Dono)" },
        { value: "unblock_user", label: "✅ Desbloquear Usuário (Dono)" },
        { value: "set_welcome", label: "👋 Definir Boas-Vindas" },
        { value: "set_goodbye", label: "👋 Definir Despedida" },
        { value: "set_auto_reply", label: "💬 Auto-Resposta" },
        { value: "group_info", label: "📋 Info do Grupo" },
        { value: "member_list", label: "👥 Lista de Membros" },
        { value: "admin_list", label: "👑 Lista de Admins" },
        { value: "online_list", label: "🟢 Membros Online" },
        { value: "cep_lookup", label: "📮 Consultar CEP" },
        { value: "translate", label: "🌐 Traduzir Texto" },
        { value: "calc", label: "🧮 Calculadora" },
        { value: "qrcode_gen", label: "📱 Gerar QR Code" },
        { value: "typing", label: "⌨️ Simular Digitando" },
        { value: "delay", label: "⏳ Aguardar (Pausa)" },
        { value: "read_receipt", label: "✔️ Marcar como Lido" },
        { value: "add_coins", label: "💰 Adicionar Moedas" },
        { value: "remove_coins", label: "💸 Remover Moedas" },
        { value: "set_coins", label: "🏦 Definir Moedas (Exato)" },
        { value: "join_group_link", label: "🔗 Entrar no Grupo (Link)" },
        { value: "leave_group", label: "🚪 Sair do Grupo" },
        { value: "send_log", label: "📝 Enviar Log (Debug)" },
        { value: "http_request", label: "🌐 Requisição HTTP (Webhook)" },
      ],
    },
    { key: "message", label: "Mensagem (use variáveis: {nome}, {grupo}...)", type: "textarea", placeholder: "Ex: Olá {nome}! Ação executada no {grupo}." },
    { key: "max_warns", label: "Máx. avisos antes de kick", type: "text", placeholder: "3", showWhen: (c) => c.action === "warn_member" },
    { key: "emoji", label: "Emoji para reação", type: "text", placeholder: "👍", showWhen: (c) => c.action === "react_message" },
    { key: "image_url", label: "URL da imagem", type: "text", placeholder: "https://...", showWhen: (c) => ["send_image", "show_menu_photo", "set_group_photo"].includes(String(c.action)) },
    { key: "audio_url", label: "URL do áudio", type: "text", placeholder: "https://...", showWhen: (c) => c.action === "send_audio" },
    { key: "video_url", label: "URL do vídeo", type: "text", placeholder: "https://...", showWhen: (c) => c.action === "send_video" },
    { key: "document_url", label: "URL do documento", type: "text", placeholder: "https://...", showWhen: (c) => c.action === "send_document" },
    { key: "gif_url", label: "URL do GIF", type: "text", placeholder: "https://...", showWhen: (c) => c.action === "send_gif" },
    { key: "sticker_url", label: "URL da figurinha", type: "text", placeholder: "https://...", showWhen: (c) => c.action === "send_sticker" },
    { key: "kick_on_link", label: "Remover quem enviar link", type: "checkbox", showWhen: (c) => c.action === "antilink" },
    { key: "warn_on_link", label: "Dar warn ao enviar link", type: "checkbox", showWhen: (c) => c.action === "antilink" },
    { key: "poll_question", label: "Pergunta da enquete", type: "text", placeholder: "Qual a melhor opção?", showWhen: (c) => c.action === "send_poll" },
    { key: "poll_options", label: "Opções (separadas por vírgula)", type: "text", placeholder: "Opção 1, Opção 2, Opção 3", showWhen: (c) => c.action === "send_poll" },
    { key: "list_title", label: "Título da lista", type: "text", placeholder: "Menu Principal", showWhen: (c) => c.action === "send_list" },
    { key: "list_items", label: "Itens (um por linha: id | título | desc)", type: "textarea", placeholder: ".sticker | 🖼️ Figurinha | Criar figurinha\n.menu | 📋 Menu | Ver opções", showWhen: (c) => c.action === "send_list" },
    { key: "list_button_text", label: "Texto do botão da lista", type: "text", placeholder: "VER OPÇÕES", showWhen: (c) => c.action === "send_list" },
    { key: "button_texts", label: "Botões (um por linha: id | texto)", type: "textarea", placeholder: ".sim | ✅ Sim\n.nao | ❌ Não", showWhen: (c) => ["send_buttons", "send_carousel"].includes(String(c.action)) },
    { key: "carousel_items", label: "Cards (título | desc | imagem_url por linha)", type: "textarea", placeholder: "Plano Básico | 100 moedas | https://...\nPlano Pro | 250 moedas | https://...", showWhen: (c) => c.action === "send_carousel" },
    { key: "contact_name", label: "Nome do contato", type: "text", placeholder: "João Silva", showWhen: (c) => c.action === "send_contact" },
    { key: "contact_number", label: "Número do contato", type: "text", placeholder: "5511999999999", showWhen: (c) => c.action === "send_contact" },
    { key: "latitude", label: "Latitude", type: "text", placeholder: "-23.5505", showWhen: (c) => c.action === "send_location" },
    { key: "longitude", label: "Longitude", type: "text", placeholder: "-46.6333", showWhen: (c) => c.action === "send_location" },
    { key: "location_name", label: "Nome do local", type: "text", placeholder: "São Paulo, SP", showWhen: (c) => c.action === "send_location" },
    { key: "group_name", label: "Novo nome do grupo", type: "text", placeholder: "Meu Grupo TOP", showWhen: (c) => c.action === "set_group_name" },
    { key: "group_desc", label: "Nova descrição", type: "textarea", placeholder: "Descrição do grupo...", showWhen: (c) => c.action === "set_group_desc" },
    { key: "welcome_text", label: "Mensagem de boas-vindas", type: "textarea", placeholder: "👋 Bem-vindo(a) {nome} ao {grupo}!\n\n📋 Use {prefix}menu para ver os comandos.", showWhen: (c) => c.action === "set_welcome" },
    { key: "goodbye_text", label: "Mensagem de despedida", type: "textarea", placeholder: "👋 {nome} saiu do grupo. Até mais!", showWhen: (c) => c.action === "set_goodbye" },
    { key: "auto_reply_text", label: "Texto da auto-resposta", type: "textarea", placeholder: "🤖 Bot está offline. Tente mais tarde.", showWhen: (c) => c.action === "set_auto_reply" },
    { key: "broadcast_text", label: "Mensagem do broadcast", type: "textarea", placeholder: "📢 Aviso para todos os grupos!", showWhen: (c) => c.action === "broadcast" },
    { key: "coins_amount", label: "Quantidade de moedas", type: "text", placeholder: "100", showWhen: (c) => ["give_coins", "add_coins", "remove_coins", "set_coins"].includes(String(c.action)) },
    { key: "target_number", label: "Número do alvo (DDI+DDD+Número)", type: "text", placeholder: "5511999999999", showWhen: (c) => ["give_coins", "block_user", "unblock_user"].includes(String(c.action)) },
    { key: "typing_duration", label: "Duração do digitando (ms)", type: "text", placeholder: "2000", showWhen: (c) => c.action === "typing" },
    { key: "delay_ms", label: "Tempo de espera (ms)", type: "text", placeholder: "1500", showWhen: (c) => c.action === "delay" },
    { key: "group_invite_link", label: "Link de convite do grupo", type: "text", placeholder: "https://chat.whatsapp.com/XXXXX", showWhen: (c) => c.action === "join_group_link" },
    { key: "log_message", label: "Mensagem de log", type: "textarea", placeholder: "Usuário {nome} executou ação X", showWhen: (c) => c.action === "send_log" },
    { key: "http_url", label: "URL da requisição", type: "text", placeholder: "https://api.exemplo.com/webhook", showWhen: (c) => c.action === "http_request" },
    { key: "http_method", label: "Método HTTP", type: "select", options: [{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }, { value: "DELETE", label: "DELETE" }], showWhen: (c) => c.action === "http_request" },
    { key: "http_headers", label: "Headers (JSON)", type: "textarea", placeholder: '{"Authorization": "Bearer token"}', showWhen: (c) => c.action === "http_request" },
    { key: "http_body", label: "Body (JSON, use variáveis)", type: "textarea", placeholder: '{"user": "{nome}", "phone": "{numero}"}', showWhen: (c) => c.action === "http_request" },
    { key: "flood_max", label: "Máx. msgs por intervalo", type: "text", placeholder: "5", showWhen: (c) => c.action === "antiflood" },
    { key: "flood_interval", label: "Intervalo (segundos)", type: "text", placeholder: "10", showWhen: (c) => c.action === "antiflood" },
    { key: "kick_on_flood", label: "Remover por flood", type: "checkbox", showWhen: (c) => c.action === "antiflood" },
    { key: "allowed_ddis", label: "DDIs permitidos (ex: 55,1,44)", type: "text", placeholder: "55", showWhen: (c) => c.action === "antifake" },
    { key: "kick_on_fake", label: "Remover números estrangeiros", type: "checkbox", showWhen: (c) => c.action === "antifake" },
    { key: "bad_words", label: "Palavras proibidas (vírgula)", type: "textarea", placeholder: "palavra1, palavra2, palavra3", showWhen: (c) => c.action === "antitoxic" },
    { key: "kick_on_toxic", label: "Remover por palavrão", type: "checkbox", showWhen: (c) => c.action === "antitoxic" },
    { key: "warn_on_spam", label: "Dar warn por spam", type: "checkbox", showWhen: (c) => c.action === "antispam" },
    { key: "translate_lang", label: "Idioma de destino", type: "text", placeholder: "pt", showWhen: (c) => c.action === "translate" },
    { key: "menu_title", label: "Título do menu", type: "text", placeholder: "🤖 Menu do Bot", showWhen: (c) => String(c.action).startsWith("show_menu") },
    { key: "menu_text", label: "Texto do menu (use variáveis)", type: "textarea", placeholder: "👤 {nome}\n🪙 Moedas: {moedas}\n📦 Plano: {plano}\n\n📋 Comandos:\n🖼️ {prefix}sticker\n📋 {prefix}menu", showWhen: (c) => String(c.action).startsWith("show_menu") },
    { key: "menu_footer", label: "Rodapé do menu", type: "text", placeholder: "BotAluguel Pro", showWhen: (c) => String(c.action).startsWith("show_menu") },
    { key: "roulette_kick", label: "Realmente kickar o perdedor", type: "checkbox", showWhen: (c) => c.action === "roulette" },
    { key: "dice_sides", label: "Lados do dado", type: "text", placeholder: "6", showWhen: (c) => c.action === "dice_roll" },
  ],
  condition: [
    {
      key: "condition", label: "Condição", type: "select", options: [
        { value: "is_group", label: "👥 É grupo" },
        { value: "is_private", label: "💬 É privado" },
        { value: "is_admin", label: "👑 Remetente é admin" },
        { value: "is_not_admin", label: "🚫 Remetente NÃO é admin" },
        { value: "is_owner", label: "👑 Remetente é o dono do bot" },
        { value: "is_bot_admin", label: "🤖 Bot é admin no grupo" },
        { value: "has_image", label: "📷 Tem imagem" },
        { value: "has_video", label: "🎥 Tem vídeo" },
        { value: "has_audio", label: "🎵 Tem áudio" },
        { value: "has_sticker", label: "🏷️ Tem figurinha" },
        { value: "has_document", label: "📄 Tem documento" },
        { value: "has_media", label: "📎 Tem qualquer mídia" },
        { value: "has_contact", label: "👤 Tem contato" },
        { value: "has_location", label: "📍 Tem localização" },
        { value: "contains_link", label: "🔗 Contém link" },
        { value: "contains_text", label: "🔍 Contém texto..." },
        { value: "has_mention", label: "📌 Menciona alguém" },
        { value: "is_reply", label: "↩️ É resposta (reply)" },
        { value: "is_quoted", label: "💬 Tem mensagem citada" },
        { value: "is_flood", label: "💧 É flood (msg repetida)" },
        { value: "msg_length_gt", label: "📏 Tamanho da msg maior que..." },
        { value: "member_count_gt", label: "👥 Grupo tem + de N membros" },
        { value: "time_between", label: "🕐 Horário entre X e Y" },
        { value: "has_prefix", label: "🔤 Mensagem começa com prefixo" },
        { value: "sender_has_plan", label: "📦 Remetente tem plano ativo" },
        { value: "bot_is_on", label: "✅ Bot está ligado" },
      ],
    },
    { key: "value", label: "Valor / Palavra-chave", type: "text", placeholder: "ex: palavra", showWhen: (c) => c.condition === "contains_text" },
    { key: "min_length", label: "Tamanho mínimo", type: "text", placeholder: "50", showWhen: (c) => c.condition === "msg_length_gt" },
    { key: "min_members", label: "Mínimo de membros", type: "text", placeholder: "10", showWhen: (c) => c.condition === "member_count_gt" },
    { key: "time_start", label: "Hora início (HH:MM)", type: "text", placeholder: "08:00", showWhen: (c) => c.condition === "time_between" },
    { key: "time_end", label: "Hora fim (HH:MM)", type: "text", placeholder: "22:00", showWhen: (c) => c.condition === "time_between" },
  ],
  response: [
    { key: "tipoResposta", label: "Tipo de Resposta", type: "select", options: [
      { value: "texto", label: "Texto simples" },
      { value: "lista", label: "Lista interativa" },
      { value: "imagem", label: "Imagem" },
      { value: "audio", label: "Audio" },
      { value: "localizacao", label: "Localizacao" },
      { value: "contato", label: "Contato" },
    ] },
    { key: "texto", label: "Texto ({nome}, {numero}, {moedas}, {plano}, {expiraEm}, {grupos})", type: "textarea", placeholder: "Ola {nome}! Seu saldo e {moedas} moedas.", showWhen: (c) => !c.tipoResposta || c.tipoResposta === "texto" || c.tipoResposta === "lista" },
    { key: "tituloLista", label: "Titulo da lista", type: "text", placeholder: "Menu Principal", showWhen: (c) => c.tipoResposta === "lista" },
    { key: "textoLista", label: "Texto da lista", type: "textarea", placeholder: "Escolha uma opcao abaixo", showWhen: (c) => c.tipoResposta === "lista" },
    { key: "rodapeLista", label: "Rodape da lista", type: "text", placeholder: "BotAluguel", showWhen: (c) => c.tipoResposta === "lista" },
    { key: "textoBotao", label: "Texto do botao", type: "text", placeholder: "VER OPCOES", showWhen: (c) => c.tipoResposta === "lista" },
    { key: "secoes", label: "Secoes (titulo | id | titulo_row | descricao, por linha)", type: "textarea", placeholder: "Conta\n.saldo | Saldo | Ver moedas\n.plano | Plano | Ver plano ativo\nGrupos\n.grupos | Meus Grupos | Ver grupos", showWhen: (c) => c.tipoResposta === "lista" },
    { key: "imagemUrl", label: "URL da imagem", type: "text", placeholder: "https://exemplo.com/foto.jpg", showWhen: (c) => c.tipoResposta === "imagem" },
    { key: "legenda", label: "Legenda da imagem", type: "textarea", placeholder: "Texto abaixo da imagem", showWhen: (c) => c.tipoResposta === "imagem" },
    { key: "audioUrl", label: "URL do audio", type: "text", placeholder: "https://exemplo.com/som.mp3", showWhen: (c) => c.tipoResposta === "audio" },
    { key: "latitude", label: "Latitude", type: "text", placeholder: "-23.550520", showWhen: (c) => c.tipoResposta === "localizacao" },
    { key: "longitude", label: "Longitude", type: "text", placeholder: "-46.633309", showWhen: (c) => c.tipoResposta === "localizacao" },
    { key: "nomeLocal", label: "Nome do local", type: "text", placeholder: "Av. Paulista", showWhen: (c) => c.tipoResposta === "localizacao" },
    { key: "numeroContato", label: "Numero do contato", type: "text", placeholder: "5511999999999", showWhen: (c) => c.tipoResposta === "contato" },
    { key: "nomeContato", label: "Nome do contato", type: "text", placeholder: "Suporte BotAluguel", showWhen: (c) => c.tipoResposta === "contato" },
    { key: "temBotoes", label: "Adicionar botoes abaixo", type: "checkbox", showWhen: (c) => c.tipoResposta === "texto" || c.tipoResposta === "imagem" },
    { key: "botoes", label: "Botoes (id | titulo | tipo[reply/call], por linha, max 3)", type: "textarea", placeholder: ".planos | Ver Planos | reply\n.suporte | Suporte | reply\n5511999999999 | Ligar | call", showWhen: (c) => !!c.temBotoes && (c.tipoResposta === "texto" || c.tipoResposta === "imagem") },
    { key: "linkPreview", label: "Mostrar previa de links", type: "checkbox", showWhen: (c) => c.tipoResposta === "texto" },
  ],
  buttons: [
    { key: "tipoBotao", label: "Tipo de Botao", type: "select", options: [
      { value: "normal", label: "Botoes normais (max 3)" },
      { value: "lista", label: "Lista interativa (menu)" },
      { value: "ligar", label: "Botao de ligar" },
    ] },
    { key: "botoes", label: "Botoes (id | texto, um por linha, max 3)", type: "textarea", placeholder: ".sim | Sim\n.nao | Nao\n.talvez | Talvez", showWhen: (c) => !c.tipoBotao || c.tipoBotao === "normal" },
    { key: "textoBotao", label: "Texto do botao de abrir lista", type: "text", placeholder: "ABRIR MENU", showWhen: (c) => c.tipoBotao === "lista" },
    { key: "opcoes", label: "Opcoes (id | titulo | descricao, por linha)", type: "textarea", placeholder: ".saldo | Saldo | Ver moedas\n.planos | Planos | Ver planos\n.ajuda | Ajuda | Falar com suporte", showWhen: (c) => c.tipoBotao === "lista" },
    { key: "textoLigar", label: "Texto do botao", type: "text", placeholder: "Falar com suporte", showWhen: (c) => c.tipoBotao === "ligar" },
    { key: "numeroLigar", label: "Numero para ligar", type: "text", placeholder: "5511999999999", showWhen: (c) => c.tipoBotao === "ligar" },
  ],
};

const BLOCK_TYPES: NodeType[] = ["command", "action", "condition", "response", "buttons"];

const CONDITION_NODE_H = 110;
const CONDITION_PORT_YES_Y = 36;
const CONDITION_PORT_NO_Y = 80;

interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const TEMPLATES: FlowTemplate[] = [
  {
    id: "menu_botoes",
    name: "Menu com Botoes",
    description: "Comando .menu com resposta e botoes interativos",
    icon: MousePointerClick,
    color: "cyan",
    nodes: [
      { id: "t_cmd", type: "command", label: ".menu", position: { x: 60, y: 60 }, config: { prefix: ".", name: "menu", caseSensitive: false, apenasGrupos: false, apenasPrivado: false, requerPlano: false, requerAdmin: false } },
      { id: "t_resp", type: "response", label: "Bem-vindo ao Menu!", position: { x: 60, y: 220 }, config: { tipoResposta: "texto", texto: "Ola {nome}! Bem-vindo ao *Menu Principal*\n\nEscolha uma opcao abaixo:", temBotoes: false, linkPreview: false } },
      { id: "t_btn", type: "buttons", label: "Botoes", position: { x: 60, y: 380 }, config: { tipoBotao: "normal", botoes: ".saldo | Meu Saldo\n.planos | Ver Planos\n.ajuda | Ajuda" } },
    ],
    edges: [
      { id: "t_e1", source: "t_cmd", target: "t_resp" },
      { id: "t_e2", source: "t_resp", target: "t_btn" },
    ],
  },
  {
    id: "menu_lista",
    name: "Menu Lista Interativa",
    description: "Comando .catalogo com lista interativa estilo banco",
    icon: List,
    color: "cyan",
    nodes: [
      { id: "t2_cmd", type: "command", label: ".catalogo", position: { x: 60, y: 60 }, config: { prefix: ".", name: "catalogo", caseSensitive: false, apenasGrupos: false, apenasPrivado: false, requerPlano: false, requerAdmin: false } },
      { id: "t2_resp", type: "response", label: "Catalogo de Servicos", position: { x: 60, y: 220 }, config: { tipoResposta: "texto", texto: "Ola {nome}! Confira nosso catalogo de servicos.\n\nSelecione uma categoria no botao abaixo:", temBotoes: false, linkPreview: false } },
      { id: "t2_btn", type: "buttons", label: "Lista", position: { x: 60, y: 380 }, config: { tipoBotao: "lista", textoBotao: "ABRIR CATALOGO", opcoes: ".plano_basico | Plano Basico | 100 moedas/mes\n.plano_pro | Plano Pro | 250 moedas/mes\n.plano_premium | Plano Premium | 500 moedas/mes\n.suporte | Falar com Suporte | Atendimento humano" } },
    ],
    edges: [
      { id: "t2_e1", source: "t2_cmd", target: "t2_resp" },
      { id: "t2_e2", source: "t2_resp", target: "t2_btn" },
    ],
  },
  {
    id: "condicao_grupo",
    name: "Comando so no Privado",
    description: "Verifica se a mensagem e de grupo e responde diferente",
    icon: GitBranch,
    color: "yellow",
    nodes: [
      { id: "t3_cmd", type: "command", label: ".start", position: { x: 60, y: 60 }, config: { prefix: ".", name: "start", caseSensitive: false, apenasGrupos: false, apenasPrivado: false, requerPlano: false, requerAdmin: false } },
      { id: "t3_cond", type: "condition", label: "E grupo?", position: { x: 60, y: 220 }, config: { condition: "is_group" } },
      { id: "t3_resp_sim", type: "response", label: "Comando nao funciona em grupos", position: { x: -100, y: 400 }, config: { tipoResposta: "texto", texto: "Esse comando so funciona no privado! Me chama la no PV.", temBotoes: false, linkPreview: false } },
      { id: "t3_resp_nao", type: "response", label: "Bot iniciado!", position: { x: 260, y: 400 }, config: { tipoResposta: "texto", texto: "Ola {nome}! Bot iniciado com sucesso!\n\nUse .menu para ver os comandos.", temBotoes: false, linkPreview: false } },
    ],
    edges: [
      { id: "t3_e1", source: "t3_cmd", target: "t3_cond" },
      { id: "t3_e2", source: "t3_cond", target: "t3_resp_sim", sourceHandle: "true" as const },
      { id: "t3_e3", source: "t3_cond", target: "t3_resp_nao", sourceHandle: "false" as const },
    ],
  },
];
function Port({ side, onPointerDown, onClick, isTarget, isConnecting, hasConnection, label, color, topOffset }: {
  side: "left" | "right";
  onPointerDown?: (e: React.PointerEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  isTarget?: boolean;
  isConnecting?: boolean;
  hasConnection?: boolean;
  label?: string;
  color?: string;
  topOffset?: string;
}) {
  const isRight = side === "right";
  const posStyle = topOffset
    ? { top: topOffset, transform: "translateY(-50%)" }
    : { top: "50%", transform: "translateY(-50%)" };
  return (
    <div
      className={`absolute z-10 flex items-center justify-center ${isRight ? "-right-3" : "-left-3"}`}
      style={{ touchAction: "none", ...posStyle }}
    >
      {isRight && !isTarget && !hasConnection && !label && <span className="absolute w-5 h-5 rounded-full bg-primary/20 animate-ping" />}
      <div
        className={`relative w-5 h-5 rounded-full border-2 transition-all duration-150 flex items-center justify-center
          ${isTarget ? "bg-green-400 border-green-300 scale-125 shadow-lg shadow-green-400/40"
            : hasConnection && !isRight ? "bg-red-400/80 border-red-400 hover:bg-red-500 hover:scale-125 hover:shadow-lg hover:shadow-red-400/40 cursor-pointer"
            : hasConnection && isRight ? "bg-orange-400/80 border-orange-400 hover:bg-orange-500 hover:scale-125 hover:shadow-lg hover:shadow-orange-400/40 cursor-pointer"
            : color ? `${color} cursor-crosshair hover:scale-125 hover:shadow-lg`
            : isRight ? "bg-primary border-primary/80 hover:scale-125 hover:shadow-lg hover:shadow-primary/40 cursor-crosshair"
              : "bg-background border-white/20 cursor-default"}
          ${isConnecting && isRight ? "scale-125 shadow-primary/60 shadow-lg" : ""}`}
        onPointerDown={(e) => {
          if (hasConnection && onClick) { e.stopPropagation(); e.preventDefault(); onClick(e as unknown as React.MouseEvent); return; }
          if (onPointerDown) onPointerDown(e);
        }}
        style={{ touchAction: "none" }}
      >
        {hasConnection ? <X className="w-2.5 h-2.5 text-white" /> : isRight && !label ? <Link2 className="w-2.5 h-2.5 text-white/80" /> : null}
      </div>
      {label && (
        <span className={`absolute text-[8px] font-bold uppercase tracking-wider whitespace-nowrap ${isRight ? "right-7" : "left-7"} ${color?.includes("green") ? "text-green-400" : "text-red-400"}`}>{label}</span>
      )}
    </div>
  );
}

// ─── Node card ────────────────────────────────────────────────────────────────
function NodeCard({
  node, selected, isTarget, isConnecting,
  onSelect, onDelete, onEdit, onMove, onStartConnect, onDisconnectInput, onDisconnectOutput,
  hasInputConnection, hasOutputConnection, hasYesConnection, hasNoConnection,
  transformRef, touchCount, blockDragRef,
}: {
  node: FlowNode; selected: boolean; isTarget: boolean; isConnecting: boolean;
  onSelect: () => void; onDelete: () => void; onEdit: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onStartConnect: (sourceId: string, e: React.PointerEvent, handle?: "true" | "false") => void;
  onDisconnectInput: () => void; onDisconnectOutput: (handle?: "true" | "false") => void;
  hasInputConnection: boolean; hasOutputConnection: boolean;
  hasYesConnection?: boolean; hasNoConnection?: boolean;
  transformRef: React.RefObject<CanvasTransform>;
  touchCount: React.RefObject<number>;
  blockDragRef: React.RefObject<boolean>;
}) {
  const cfg = nodeConfig[node.type];
  const Icon = cfg.icon;
  const dragData = useRef<{ startX: number; startY: number; nodeX: number; nodeY: number; dragging: boolean; rafId: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCount = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragData.current = { startX: e.clientX, startY: e.clientY, nodeX: node.position.x, nodeY: node.position.y, dragging: false, rafId: 0 };
    blockDragRef.current = true;
    cardRef.current?.setPointerCapture(e.pointerId);
    onSelect();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const d = dragData.current;
    if (!d) return;
    if (touchCount.current >= 2) {
      if (d.rafId) cancelAnimationFrame(d.rafId);
      cardRef.current?.releasePointerCapture(e.pointerId);
      if (d.dragging) {
        cardRef.current!.style.transform = "";
        onMove(node.id, d.nodeX, d.nodeY);
      }
      dragData.current = null;
      blockDragRef.current = false;
      return;
    }
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.dragging) {
      if (Math.hypot(dx, dy) < 6) return;
      d.dragging = true;
    }
    const scale = transformRef.current.scale;
    const newX = Math.max(0, d.nodeX + dx / scale);
    const newY = Math.max(0, d.nodeY + dy / scale);
    const offsetX = newX - node.position.x;
    const offsetY = newY - node.position.y;
    if (!d.rafId) {
      d.rafId = requestAnimationFrame(() => {
        d.rafId = 0;
        if (cardRef.current) {
          cardRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const d = dragData.current;
    if (d) {
      if (d.rafId) cancelAnimationFrame(d.rafId);
      if (d.dragging) {
        const scale = transformRef.current.scale;
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        const finalX = Math.max(0, d.nodeX + dx / scale);
        const finalY = Math.max(0, d.nodeY + dy / scale);
        if (cardRef.current) cardRef.current.style.transform = "";
        onMove(node.id, finalX, finalY);
      }
    }
    dragData.current = null;
    blockDragRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clickCount.current += 1;
    if (clickCount.current === 1) {
      clickTimer.current = setTimeout(() => { clickCount.current = 0; onSelect(); }, 250);
    } else if (clickCount.current >= 2) {
      if (clickTimer.current) clearTimeout(clickTimer.current);
      clickCount.current = 0;
      onEdit();
    }
  };

  const TIPO_LABELS: Record<string, string> = { texto: "Texto", lista: "Lista", imagem: "Imagem", audio: "Audio", localizacao: "Local", contato: "Contato" };

  let displayLabel = node.label;
  if (node.type === "command" && node.config?.name) {
    displayLabel = `${node.config.prefix && node.config.prefix !== "nenhum" ? node.config.prefix : ""}${node.config.name}`;
  } else if (node.type === "response" && node.config) {
    const tipo = String(node.config.tipoResposta || "texto");
    if (node.config.texto) {
      displayLabel = String(node.config.texto).slice(0, 28);
    } else if (tipo === "imagem" && node.config.legenda) {
      displayLabel = String(node.config.legenda).slice(0, 28);
    } else if (tipo === "lista" && node.config.tituloLista) {
      displayLabel = String(node.config.tituloLista);
    } else {
      displayLabel = TIPO_LABELS[tipo] || "Resposta";
    }
  } else if (node.type === "condition" && node.config?.condition) {
    const condLabelsMap: Record<string, string> = {
      is_group: "E grupo?", is_private: "E privado?", is_admin: "E admin?", is_not_admin: "Nao e admin?",
      is_owner: "E dono?", is_bot_admin: "Bot e admin?", has_image: "Tem imagem?", has_video: "Tem video?",
      has_audio: "Tem audio?", has_sticker: "Tem figurinha?", has_document: "Tem doc?", has_media: "Tem midia?",
      has_contact: "Tem contato?", has_location: "Tem local?", contains_link: "Tem link?",
      contains_text: node.config.value ? `"${String(node.config.value).slice(0, 12)}"?` : "Contem texto?",
      has_mention: "Tem mencao?", is_reply: "E resposta?", is_quoted: "Tem citacao?",
      is_flood: "E flood?", msg_length_gt: `Msg > ${node.config.min_length || "?"}`,
      member_count_gt: `${node.config.min_members || "?"} membros`,
      time_between: `${node.config.time_start || "?"}-${node.config.time_end || "?"}`,
      has_prefix: "Tem prefixo?", sender_has_plan: "Tem plano?", bot_is_on: "Bot ligado?",
    };
    displayLabel = condLabelsMap[String(node.config.condition)] || node.label;
  } else if (node.type === "buttons" && node.config) {
    const tipoBt = String(node.config.tipoBotao || "normal");
    if (tipoBt === "normal" && node.config.botoes) {
      const firstLine = String(node.config.botoes).split("\n").find((l: string) => l.trim());
      if (firstLine) {
        const parts = firstLine.split("|").map((s: string) => s.trim());
        displayLabel = parts[1] || parts[0] || "Botoes";
      }
    } else if (tipoBt === "lista") {
      displayLabel = String(node.config.textoBotao || "Lista");
    } else if (tipoBt === "ligar") {
      displayLabel = String(node.config.textoLigar || "Ligar");
    }
  } else if (node.config?.action) {
    displayLabel = CONFIG_FIELDS.action[0].options?.find(o => o.value === node.config.action)?.label ?? node.label;
  } else if (node.config?.text) {
    displayLabel = String(node.config.text).slice(0, 22);
  }

  const nodeTags: string[] = [];
  if (node.type === "command" && node.config) {
    if (node.config.apenasGrupos) nodeTags.push("grupo");
    if (node.config.apenasPrivado) nodeTags.push("privado");
    if (node.config.requerAdmin) nodeTags.push("admin");
    if (node.config.requerPlano) nodeTags.push("plano");
  }
  if (node.type === "response" && node.config) {
    const tipo = String(node.config.tipoResposta || "texto");
    nodeTags.push(TIPO_LABELS[tipo] || tipo);
    if (node.config.temBotoes) nodeTags.push("botoes");
    if (node.config.linkPreview) nodeTags.push("preview");
  }
  if (node.type === "condition" && node.config) {
    const cond = String(node.config.condition || "");
    const catMap: Record<string, string> = {
      is_group: "chat", is_private: "chat", is_admin: "user", is_not_admin: "user", is_owner: "user",
      is_bot_admin: "bot", has_image: "midia", has_video: "midia", has_audio: "midia", has_sticker: "midia",
      has_document: "midia", has_media: "midia", has_contact: "msg", has_location: "msg", contains_link: "msg",
      contains_text: "msg", has_mention: "msg", is_reply: "msg", is_quoted: "msg", is_flood: "msg",
      msg_length_gt: "msg", member_count_gt: "grupo", time_between: "tempo", has_prefix: "msg",
      sender_has_plan: "plano", bot_is_on: "bot",
    };
    const cat = catMap[cond];
    if (cat) nodeTags.push(cat);
  }
  if (node.type === "buttons" && node.config) {
    const tipoBt = String(node.config.tipoBotao || "normal");
    const btLabels: Record<string, string> = { normal: "Normal", lista: "Lista", ligar: "Ligar" };
    nodeTags.push(btLabels[tipoBt] || tipoBt);
    if (tipoBt === "normal" && node.config.botoes) {
      const count = String(node.config.botoes).split("\n").filter((l: string) => l.trim()).length;
      if (count > 0) nodeTags.push(`${count} btn`);
    }
    if (tipoBt === "lista" && node.config.opcoes) {
      const count = String(node.config.opcoes).split("\n").filter((l: string) => l.trim()).length;
      if (count > 0) nodeTags.push(`${count} opc`);
    }
  }

  return (
    <div
      ref={cardRef}
      data-node-card
      className={`absolute rounded-xl border-2 p-3 select-none transition-shadow
        ${cfg.color} ${cfg.border}
        ${selected ? "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-xl" : "shadow-md"}
        ${isTarget ? "ring-2 ring-green-400 ring-offset-1 ring-offset-background" : ""}`}
      style={{ left: node.position.x, top: node.position.y, width: NODE_W, minHeight: node.type === "condition" ? CONDITION_NODE_H : NODE_H, cursor: "grab", touchAction: "none", willChange: "transform" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
    >
      <Port side="left" isTarget={isTarget} hasConnection={hasInputConnection}
        onClick={(e) => { e.stopPropagation(); onDisconnectInput(); }} />
      {node.type === "condition" ? (
        <>
          <Port side="right" isConnecting={isConnecting} hasConnection={!!hasYesConnection}
            label="SIM" color="bg-green-500 border-green-400" topOffset={`${CONDITION_PORT_YES_Y}px`}
            onClick={(e) => { e.stopPropagation(); onDisconnectOutput("true"); }}
            onPointerDown={(e) => { e.stopPropagation(); onStartConnect(node.id, e, "true"); }} />
          <Port side="right" isConnecting={isConnecting} hasConnection={!!hasNoConnection}
            label="NAO" color="bg-red-500 border-red-400" topOffset={`${CONDITION_PORT_NO_Y}px`}
            onClick={(e) => { e.stopPropagation(); onDisconnectOutput("false"); }}
            onPointerDown={(e) => { e.stopPropagation(); onStartConnect(node.id, e, "false"); }} />
        </>
      ) : (
        <Port side="right" isConnecting={isConnecting} hasConnection={hasOutputConnection}
          onClick={(e) => { e.stopPropagation(); onDisconnectOutput(); }}
          onPointerDown={(e) => { e.stopPropagation(); onStartConnect(node.id, e); }} />
      )}

      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />
          <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">{cfg.label}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-white/60 hover:text-primary transition-colors p-1 rounded hover:bg-white/10">
            <Pencil className="h-3 w-3" />
          </button>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-white/40 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <p className="text-white text-xs font-semibold truncate leading-tight">{displayLabel}</p>
      {nodeTags.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-1">
          {nodeTags.map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">{tag}</span>
          ))}
        </div>
      ) : (
        <p className="text-white/40 text-[10px] mt-0.5 truncate">{cfg.description}</p>
      )}
    </div>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────
function EditFormContent({ node, onUpdate, onClose, prefix }: {
  node: FlowNode; onUpdate: (id: string, label: string, config: Record<string, unknown>) => void;
  onClose: () => void; prefix: string;
}) {
  const fields = CONFIG_FIELDS[node.type];
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>({ ...node.config });
  const [localLabel] = useState(node.label);

  const handleSave = () => {
    let autoLabel = localLabel;
    if (node.type === "command" && localConfig.name) {
      const pfx = localConfig.prefix && localConfig.prefix !== "nenhum" ? String(localConfig.prefix) : "";
      autoLabel = pfx + String(localConfig.name);
    } else if (node.type === "response") {
      const tipo = String(localConfig.tipoResposta || "texto");
      const tipoLabel: Record<string, string> = { texto: "Texto", lista: "Lista", imagem: "Imagem", audio: "Audio", localizacao: "Local", contato: "Contato" };
      if (localConfig.texto) autoLabel = String(localConfig.texto).slice(0, 30);
      else if (tipo === "lista" && localConfig.tituloLista) autoLabel = String(localConfig.tituloLista);
      else if (tipo === "imagem" && localConfig.legenda) autoLabel = String(localConfig.legenda).slice(0, 30);
      else autoLabel = tipoLabel[tipo] || "Resposta";
    } else if (node.type === "condition") {
      const cond = String(localConfig.condition || "has_image");
      const condLabels: Record<string, string> = {
        is_group: "E grupo?", is_private: "E privado?", is_admin: "E admin?", is_not_admin: "Nao e admin?",
        is_owner: "E dono?", is_bot_admin: "Bot e admin?", has_image: "Tem imagem?", has_video: "Tem video?",
        has_audio: "Tem audio?", has_sticker: "Tem figurinha?", has_document: "Tem documento?", has_media: "Tem midia?",
        has_contact: "Tem contato?", has_location: "Tem localizacao?", contains_link: "Tem link?",
        contains_text: localConfig.value ? `Contem "${String(localConfig.value).slice(0, 15)}"?` : "Contem texto?",
        has_mention: "Tem mencao?", is_reply: "E resposta?", is_quoted: "Tem citacao?",
        is_flood: "E flood?", msg_length_gt: `Msg > ${localConfig.min_length || "?"}?`,
        member_count_gt: `Membros > ${localConfig.min_members || "?"}?`,
        time_between: `${localConfig.time_start || "?"}-${localConfig.time_end || "?"}?`,
        has_prefix: "Tem prefixo?", sender_has_plan: "Tem plano?", bot_is_on: "Bot ligado?",
      };
      autoLabel = condLabels[cond] || cond;
    } else if (node.type === "buttons") {
      const tipoBt = String(localConfig.tipoBotao || "normal");
      if (tipoBt === "ligar") autoLabel = String(localConfig.textoLigar || "Ligar");
      else if (tipoBt === "lista") autoLabel = String(localConfig.textoBotao || "Lista");
      else autoLabel = "Botoes";
    } else {
      const displayKey = fields[0]?.key;
      autoLabel = displayKey && localConfig[displayKey] ? String(localConfig[displayKey]) : localLabel;
    }
    onUpdate(node.id, autoLabel || localLabel, localConfig);
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {fields.filter((field) => !field.showWhen || field.showWhen(localConfig)).map((field) => (
          <div key={field.key}>
            {field.type === "checkbox" ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!localConfig[field.key]}
                  onChange={(e) => setLocalConfig((c) => ({ ...c, [field.key]: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/20 bg-background accent-primary" />
                <span className="text-white/70 text-xs">{field.label}</span>
              </label>
            ) : (
              <>
                <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1">{field.label}</label>
                {field.type === "select" && field.options ? (
                  <select
                    value={String(localConfig[field.key] ?? "")}
                    onChange={(e) => setLocalConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                    className="w-full bg-[#131420] border border-[#1e1f2e] text-white text-sm rounded-md px-3 py-2 outline-none focus:border-[#7C3AED] transition-colors"
                  >
                    <option value="" disabled>Selecionar...</option>
                    {field.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    value={String(localConfig[field.key] ?? "")}
                    onChange={(e) => setLocalConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-[#131420] border border-[#1e1f2e] text-white text-sm rounded-md px-3 py-2 min-h-[80px] resize-none outline-none focus:border-[#7C3AED] transition-colors"
                  />
                ) : (
                  <input
                    type="text"
                    value={String(localConfig[field.key] ?? "")}
                    onChange={(e) => setLocalConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-[#131420] border border-[#1e1f2e] text-white text-sm rounded-md px-3 py-2 h-9 outline-none focus:border-[#7C3AED] transition-colors"
                  />
                )}
              </>
            )}
          </div>
        ))}
        {node.type === "command" && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs space-y-2">
            <p className="font-semibold text-white/60">💡 Preview do comando:</p>
            <p className="font-mono text-white/80 bg-background/60 px-2 py-1 rounded">
              {localConfig.prefix && localConfig.prefix !== "nenhum" ? String(localConfig.prefix) : ""}{String(localConfig.name || "menu")}
            </p>
            {localConfig.apenasGrupos && <p className="text-blue-400/70">👥 Funciona apenas em grupos</p>}
            {localConfig.apenasPrivado && <p className="text-green-400/70">💬 Funciona apenas no privado</p>}
            {localConfig.requerAdmin && <p className="text-yellow-400/70">🛡️ Apenas admins podem usar</p>}
            {localConfig.requerPlano && <p className="text-amber-400/70">📦 Requer plano ativo</p>}
            {localConfig.caseSensitive && <p className="text-white/50">🔤 Diferencia maiúsculas/minúsculas</p>}
            <div className="mt-2 pt-2 border-t border-white/10 text-white/40 space-y-1">
              <p className="font-semibold text-white/50">Entradas recebidas:</p>
              <p>conteudo, ehGrupo, ehAdmin, temPlano</p>
              <p className="font-semibold text-white/50 mt-1">Saida:</p>
              <p>Ativa o proximo bloco conectado</p>
            </div>
          </div>
        )}
        {(node.type === "action" || node.type === "response") && (
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-white/60 mb-2">📝 Variáveis disponíveis <span className="text-white/30">(toque para copiar)</span></p>
            <div className="flex flex-wrap gap-1">
              {[
                { v: "{nome}", d: "Nome do user" }, { v: "{user}", d: "Mencionar @" }, { v: "{numero}", d: "Telefone" },
                { v: "{grupo}", d: "Nome grupo" }, { v: "{membros}", d: "Qtd membros" }, { v: "{admins}", d: "Qtd admins" },
                { v: "{desc}", d: "Descrição" }, { v: "{moedas}", d: "Saldo" }, { v: "{plano}", d: "Plano ativo" },
                { v: "{prefix}", d: "Prefixo" }, { v: "{bot}", d: "Nome bot" }, { v: "{data}", d: "Data atual" },
                { v: "{hora}", d: "Hora atual" }, { v: "{dono}", d: "Num. dono" }, { v: "{args}", d: "Argumentos" },
                { v: "{quoted}", d: "Msg citada" },
              ].map((item) => (
                <button key={item.v} type="button" onClick={() => { navigator.clipboard.writeText(item.v); }}
                  className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/30 transition-colors cursor-pointer"
                  title={item.d}>
                  <code className="text-emerald-300 text-[10px]">{item.v}</code>
                </button>
              ))}
            </div>
          </div>
        )}
        {node.type === "response" && (
          <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3 text-xs space-y-2">
            <p className="font-semibold text-white/60">Preview da resposta:</p>
            {(!localConfig.tipoResposta || localConfig.tipoResposta === "texto") && (
              <div className="bg-background/60 rounded-lg p-2 space-y-1">
                <p className="text-white/80 text-[11px]">{String(localConfig.texto || "Mensagem de texto...").slice(0, 60)}</p>
                {localConfig.temBotoes && localConfig.botoes && (
                  <div className="flex gap-1 mt-1.5 pt-1.5 border-t border-white/10">
                    {String(localConfig.botoes).split("\n").filter(Boolean).slice(0, 3).map((line: string, i: number) => {
                      const parts = line.split("|").map((s: string) => s.trim());
                      return <span key={i} className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[9px]">{parts[1] || parts[0]}</span>;
                    })}
                  </div>
                )}
              </div>
            )}
            {localConfig.tipoResposta === "lista" && (
              <div className="bg-background/60 rounded-lg p-2 space-y-1">
                <p className="text-white/70 text-[10px] font-semibold">{String(localConfig.tituloLista || "Lista")}</p>
                <p className="text-white/50 text-[10px]">{String(localConfig.textoLista || "Escolha uma opcao")}</p>
                <div className="mt-1 px-2 py-1 rounded bg-green-600/20 text-green-300 text-[10px] text-center font-semibold">{String(localConfig.textoBotao || "VER OPCOES")}</div>
              </div>
            )}
            {localConfig.tipoResposta === "imagem" && (
              <div className="bg-background/60 rounded-lg p-2 space-y-1">
                <div className="h-8 rounded bg-white/5 flex items-center justify-center text-white/20 text-[10px]">Imagem</div>
                {localConfig.legenda && <p className="text-white/60 text-[10px]">{String(localConfig.legenda).slice(0, 40)}</p>}
              </div>
            )}
            {localConfig.tipoResposta === "audio" && <p className="text-white/50 text-[10px]">Audio: {String(localConfig.audioUrl || "...").slice(0, 40)}</p>}
            {localConfig.tipoResposta === "localizacao" && <p className="text-white/50 text-[10px]">Lat: {String(localConfig.latitude || "?")} Lng: {String(localConfig.longitude || "?")}{localConfig.nomeLocal ? ` - ${localConfig.nomeLocal}` : ""}</p>}
            {localConfig.tipoResposta === "contato" && <p className="text-white/50 text-[10px]">Contato: {String(localConfig.nomeContato || "?")} ({String(localConfig.numeroContato || "?")})</p>}
            <div className="pt-2 border-t border-white/10 text-white/40 space-y-0.5">
              <p className="font-semibold text-white/50 text-[10px]">Entradas recebidas:</p>
              <p className="text-[10px]">jid, nome, moedas, plano, expiraEm, grupos</p>
            </div>
          </div>
        )}
        {node.type === "buttons" && (
          <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-3 text-xs space-y-2">
            <p className="font-semibold text-white/60">Preview dos botoes:</p>
            {(!localConfig.tipoBotao || localConfig.tipoBotao === "normal") && localConfig.botoes && (
              <div className="flex flex-col gap-1">
                {String(localConfig.botoes).split("\n").filter(Boolean).slice(0, 3).map((line: string, i: number) => {
                  const parts = line.split("|").map((s: string) => s.trim());
                  return <div key={i} className="px-3 py-1.5 rounded bg-cyan-600/20 text-cyan-300 text-[10px] text-center font-semibold">{parts[1] || parts[0]}</div>;
                })}
              </div>
            )}
            {localConfig.tipoBotao === "lista" && (
              <div className="bg-background/60 rounded-lg p-2 space-y-1">
                <p className="text-white/50 text-[10px] italic">(texto vem do bloco Resposta)</p>
                <div className="mt-1 px-2 py-1 rounded bg-cyan-600/20 text-cyan-300 text-[10px] text-center font-semibold">{String(localConfig.textoBotao || "VER OPCOES")}</div>
                {localConfig.opcoes && (
                  <div className="mt-1 space-y-0.5">
                    {String(localConfig.opcoes).split("\n").filter(Boolean).map((line: string, i: number) => {
                      const parts = line.split("|").map((s: string) => s.trim());
                      return <div key={i} className="text-white/40 text-[9px] pl-2 border-l border-cyan-500/20">{parts[1] || parts[0]}{parts[2] ? ` - ${parts[2]}` : ""}</div>;
                    })}
                  </div>
                )}
              </div>
            )}
            {localConfig.tipoBotao === "ligar" && (
              <div className="px-3 py-2 rounded bg-green-600/20 text-green-300 text-[10px] text-center font-semibold flex items-center justify-center gap-2">
                <span>📞</span> {String(localConfig.textoLigar || "Ligar")}
              </div>
            )}
            <div className="pt-2 border-t border-white/10 text-white/40 space-y-0.5">
              <p className="font-semibold text-white/50 text-[10px]">Conexao:</p>
              <p className="text-[10px]">Conecte a SAIDA de um bloco RESPOSTA na ENTRADA deste bloco</p>
              <p className="text-[10px]">Os botoes serao enviados junto com a mensagem da Resposta</p>
            </div>
          </div>
        )}
        {node.type === "action" && (
          <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-3 text-xs text-muted-foreground">
            {localConfig.action === "make_sticker" && (<><p className="font-semibold text-white/60 mb-1">🖼️ Figurinha</p><p>Responda a uma imagem/vídeo com o comando. Converte para WebP 512x512.</p></>)}
            {localConfig.action === "kick_member" && (<><p className="font-semibold text-white/60 mb-1">🚪 Remover</p><p>Mencione o membro ou responda à msg dele. Bot precisa ser admin.</p></>)}
            {localConfig.action === "ban_member" && (<><p className="font-semibold text-white/60 mb-1">🔨 Banir</p><p>Mencione o membro. Remove e impede reentrada. Bot admin obrigatório.</p></>)}
            {localConfig.action === "warn_member" && (<><p className="font-semibold text-white/60 mb-1">⚠️ Aviso</p><p>Mencione o membro. Ao atingir o máx, é removido automaticamente.</p></>)}
            {localConfig.action === "hidetag" && (<><p className="font-semibold text-white/60 mb-1">📢 Hidetag</p><p>Marca todos sem mostrar menções. Use {"{args}"} na mensagem para incluir texto do comando.</p></>)}
            {String(localConfig.action).startsWith("anti") && (<><p className="font-semibold text-white/60 mb-1">🛡️ Proteção Automática</p><p>Funciona automaticamente sem comando. Adicione o bloco sem conectar a um Comando — ele detecta e age sozinho. Admins são ignorados.</p></>)}
            {String(localConfig.action).startsWith("show_menu") && (<><p className="font-semibold text-white/60 mb-1">📋 Menu</p><p>Use variáveis no texto: {"{nome}"}, {"{moedas}"}, {"{prefix}"}sticker, etc. O menu é enviado como lista interativa ou texto formatado.</p></>)}
            {["coin_flip", "dice_roll", "pick_random", "love_meter", "ship_members", "rate", "fortune", "truth_or_dare", "roulette", "top5", "rank", "joke"].includes(String(localConfig.action)) && (<><p className="font-semibold text-white/60 mb-1">🎮 Diversão</p><p>Resultado gerado aleatoriamente. Funciona melhor em grupos!</p></>)}
            {["bot_on", "bot_off", "give_coins", "broadcast", "block_user", "unblock_user"].includes(String(localConfig.action)) && (<><p className="font-semibold text-white/60 mb-1">👑 Exclusivo do Dono</p><p>Apenas o número configurado como dono pode executar.</p></>)}
            {["set_welcome", "set_goodbye"].includes(String(localConfig.action)) && (<><p className="font-semibold text-white/60 mb-1">👋 Mensagem Automática</p><p>Enviada quando alguém entra/sai do grupo. Use {"{nome}"} e {"{grupo}"} no texto.</p></>)}
            {["send_poll", "send_list", "send_buttons", "send_carousel"].includes(String(localConfig.action)) && (<><p className="font-semibold text-white/60 mb-1">📨 Mensagem Interativa</p><p>Mensagens com botões/listas/enquetes. Formato moderno do WhatsApp.</p></>)}
            {["send_image", "send_audio", "send_video", "send_document", "send_gif", "send_sticker"].includes(String(localConfig.action)) && (<><p className="font-semibold text-white/60 mb-1">📎 Enviar Mídia</p><p>Informe a URL da mídia. Use {"{nome}"} e outras variáveis na mensagem.</p></>)}
            {["promote_member", "demote_member", "set_group_name", "set_group_desc", "set_group_photo", "close_group", "open_group", "mute_group", "unmute_group", "get_group_link", "revoke_group_link"].includes(String(localConfig.action)) && (<><p className="font-semibold text-white/60 mb-1">👥 Gerência de Grupo</p><p>Bot precisa ser admin do grupo para executar esta ação.</p></>)}
            {["group_info", "member_list", "admin_list", "online_list"].includes(String(localConfig.action)) && (<><p className="font-semibold text-white/60 mb-1">📋 Informações</p><p>Exibe informações do grupo/membros. Funciona em qualquer grupo.</p></>)}
            {["cep_lookup", "calc", "translate", "qrcode_gen"].includes(String(localConfig.action)) && (<><p className="font-semibold text-white/60 mb-1">🔧 Utilitário</p><p>Funciona em grupo e privado. Use {"{args}"} para capturar o texto do usuário.</p></>)}
            {["mute_member", "unmute_member", "delete_message", "reset_warns"].includes(String(localConfig.action)) && (<><p className="font-semibold text-white/60 mb-1">🛡️ Moderação</p><p>Mencione o membro ou responda à msg. Bot precisa ser admin.</p></>)}
            {localConfig.action === "react_message" && (<><p className="font-semibold text-white/60 mb-1">😀 Reação</p><p>Reage à mensagem com o emoji configurado.</p></>)}
            {localConfig.action === "set_auto_reply" && (<><p className="font-semibold text-white/60 mb-1">💬 Auto-Resposta</p><p>Resposta automática quando o bot está offline ou quando não reconhece o comando.</p></>)}
            {["send_contact", "send_location", "forward_message"].includes(String(localConfig.action)) && (<><p className="font-semibold text-white/60 mb-1">📨 Envio Especial</p><p>Envia contato, localização ou encaminha msg. Preencha os campos adicionais.</p></>)}
          </div>
        )}
        {node.type === "condition" && (
          <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-white/60 mb-1">💡 Condições</p>
            <p>Se <span className="text-green-400 font-semibold">verdadeira</span> → primeira conexão. <span className="text-red-400 font-semibold">Falsa</span> → segunda (se houver).</p>
            {localConfig.condition === "is_owner" && <p className="mt-1 text-amber-400/70">👑 Verifica se é o número do dono configurado nas settings.</p>}
            {localConfig.condition === "time_between" && <p className="mt-1 text-blue-400/70">🕐 Baseado no horário do servidor (Brasília).</p>}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-[#1a1b28]">
        <button onClick={handleSave} className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-bold py-2 rounded-md transition-colors flex items-center justify-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5" />Salvar Bloco
        </button>
      </div>
    </div>
  );
}

// ─── Settings form ────────────────────────────────────────────────────────────
function SettingsFormContent({ botId, onClose }: { botId: string; onClose: () => void }) {
  const { data: bot } = useGetBot(botId, { query: { enabled: !!botId } });
  const updateSettings = useUpdateBotSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState(".");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (bot && !initialized) {
      setName(bot.name ?? ""); setPrefix(bot.prefix ?? "."); setOwnerPhone(bot.ownerPhone ?? "");
      setInitialized(true);
    }
  }, [bot, initialized]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({ botId, data: { name: name.trim() || undefined, prefix: prefix || ".", ownerPhone: ownerPhone || undefined } });
      queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) });
      toast({ title: "Configurações salvas!" });
      onClose();
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1">Nome do Bot</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: MeuBot" className="w-full bg-[#131420] border border-[#1e1f2e] text-white text-sm rounded-md px-3 py-2 h-9 outline-none focus:border-[#7C3AED] transition-colors" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1">Prefixo dos comandos</label>
          <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="." maxLength={3} className="w-full bg-[#131420] border border-[#1e1f2e] text-white text-sm rounded-md px-3 py-2 h-9 outline-none focus:border-[#7C3AED] transition-colors font-mono" />
          <p className="text-[#4b4c6b] text-xs mt-1">Ex: <span className="font-mono text-white/60">{prefix || "."}sticker</span></p>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1">Número do Dono</label>
          <input type="text" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="5511999999999" className="w-full bg-[#131420] border border-[#1e1f2e] text-white text-sm rounded-md px-3 py-2 h-9 outline-none focus:border-[#7C3AED] transition-colors" />
          <p className="text-muted-foreground text-xs mt-1">DDD + número, sem espaços</p>
        </div>
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-white/60 mb-1">💡 Comandos disponíveis</p>
          <ul className="space-y-1 text-white/50">
            <li><span className="font-mono text-white/70">{prefix || "."}sticker</span> — cria figurinha</li>
            <li><span className="font-mono text-white/70">{prefix || "."}kick</span> — remove membro</li>
            <li><span className="font-mono text-white/70">{prefix || "."}ban</span> — bane membro</li>
          </ul>
        </div>
      </div>
      <div className="p-4 border-t border-[#1a1b28]">
        <button onClick={handleSave} disabled={updateSettings.isPending} className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-[13px] font-bold py-2 rounded-md transition-colors flex items-center justify-center gap-1.5">
          {updateSettings.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BuilderPage() {
  const { data: bots } = useListBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const { data: botData } = useGetBot(selectedBotId, { query: { enabled: !!selectedBotId } });
  const { data: commandsData, isLoading: commandsLoading } = useGetBotCommands(selectedBotId, { query: { enabled: !!selectedBotId } });
  const saveCommands = useSaveBotCommands();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [connectingEdge, setConnectingEdge] = useState<ConnectingEdge | null>(null);
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dragType, setDragType] = useState<NodeType | null>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const paletteDragStart = useRef<{ x: number; y: number; type: NodeType } | null>(null);
  const dragDropPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const wasDragged = useRef(false);
  const transformRef = useRef<CanvasTransform>({ x: 20, y: 20, scale: 1 });
  const canvasInnerRef = useRef<HTMLDivElement>(null);
  const dragTypeRef = useRef<NodeType | null>(null);

  // ── Pan + Zoom ──
  const [transform, setTransform] = useState<CanvasTransform>({ x: 20, y: 20, scale: 1 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const didPan = useRef(false); // flag to skip click after pan
  // Pinch-to-zoom tracking
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastPinchDist = useRef<number | null>(null);
  const lastPinchMid = useRef<{ x: number; y: number } | null>(null);
  const touchCount = useRef(0);
  const blockDragRef = useRef(false);

  // Init smaller scale on mobile + detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setTransform({ x: 12, y: 12, scale: 0.72 });
    }
  }, [isMobile]);

  useEffect(() => { transformRef.current = transform; }, [transform]);

  useEffect(() => {
    const onTouch = (e: TouchEvent) => { touchCount.current = e.touches.length; };
    document.addEventListener("touchstart", onTouch, { passive: true });
    document.addEventListener("touchend", onTouch, { passive: true });
    document.addEventListener("touchcancel", onTouch, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouch);
      document.removeEventListener("touchend", onTouch);
      document.removeEventListener("touchcancel", onTouch);
    };
  }, []);

  const currentPrefix = botData?.prefix ?? ".";

  // ── Load commands when bot changes ──
  useEffect(() => {
    if (!selectedBotId) { setNodes([]); setEdges([]); return; }
    if (commandsData) {
      const rawNodes: any[] = (commandsData.nodes as any[]) ?? [];
      const normalizedNodes: FlowNode[] = rawNodes.map((n) => ({
        ...n,
        position: n.position ?? { x: n.x ?? 100, y: n.y ?? 100 },
      }));
      setNodes(normalizedNodes);
      setEdges((commandsData.edges as FlowEdge[]) ?? []);
    }
  }, [selectedBotId, commandsData]);

  // ── Coordinate conversion ──
  const screenToWorld = useCallback((sx: number, sy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (sx - rect.left - transform.x) / transform.scale,
      y: (sy - rect.top - transform.y) / transform.scale,
    };
  }, [transform]);

  const handleBotSelect = (botId: string) => {
    startTransition(() => setSelectedBotId(botId));
    setEditingNodeId(null); setShowSettings(false); setSelectedNode(null); setShowTemplates(false);
  };

  const handleApplyTemplate = (template: FlowTemplate, append: boolean) => {
    const ts = Date.now();
    const idMap = new Map<string, string>();
    const maxY = append && nodes.length > 0
      ? Math.max(...nodes.map((n) => n.position.y + NODE_H)) + 40
      : 0;

    const newNodes = template.nodes.map((n) => {
      const newId = `n${ts}_${n.id}`;
      idMap.set(n.id, newId);
      return { ...n, id: newId, position: { x: n.position.x, y: n.position.y + maxY } };
    });

    const newEdges = template.edges.map((e) => ({
      ...e,
      id: `e${ts}_${e.id}`,
      source: idMap.get(e.source) || e.source,
      target: idMap.get(e.target) || e.target,
    }));

    if (append) {
      setNodes((prev) => [...prev, ...newNodes]);
      setEdges((prev) => [...prev, ...newEdges]);
    } else {
      setNodes(newNodes);
      setEdges(newEdges);
    }
    setShowTemplates(false);
    toast({ title: `Template "${template.name}" aplicado!` });
  };

  const handleAddNode = (type: NodeType) => {
    const defaults: Record<NodeType, { label: string; config: Record<string, unknown> }> = {
      command: { label: "Comando", config: { prefix: ".", name: "", caseSensitive: false, apenasGrupos: false, apenasPrivado: false, requerPlano: false, requerAdmin: false } },
      action: { label: "Criar Figurinha", config: { action: "make_sticker" } },
      condition: { label: "Tem imagem?", config: { condition: "has_image" } },
      response: { label: "Resposta", config: { tipoResposta: "texto", texto: "", temBotoes: false, linkPreview: false } },
      buttons: { label: "Botoes", config: { tipoBotao: "normal", botoes: "" } },
    };
    const d = defaults[type];
    // Place new node in visible area (world coords)
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    const cx = rect ? (rect.width / 2 - transform.x) / transform.scale : 100;
    const cy = rect ? (rect.height / 2 - transform.y) / transform.scale : 100;
    const offset = (nodes.length % 5) * 20;
    setNodes((prev) => [
      ...prev,
      { id: `n${Date.now()}`, type, label: d.label, config: d.config, position: { x: cx - NODE_W / 2 + offset, y: cy - NODE_H / 2 + offset } },
    ]);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
    if (editingNodeId === nodeId) setEditingNodeId(null);
  };



  const handleUpdateNode = (id: string, label: string, config: Record<string, unknown>) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, label, config } : n));
  };

  const moveRaf = useRef(0);
  const pendingMove = useRef<{ id: string; x: number; y: number } | null>(null);

  const handleMoveNode = useCallback((id: string, x: number, y: number) => {
    pendingMove.current = { id, x, y };
    if (!moveRaf.current) {
      moveRaf.current = requestAnimationFrame(() => {
        moveRaf.current = 0;
        const m = pendingMove.current;
        if (m) setNodes((prev) => prev.map((n) => n.id === m.id ? { ...n, position: { x: m.x, y: m.y } } : n));
      });
    }
  }, []);

  // ── Palette drag-to-canvas ──
  const handlePaletteDragStart = useCallback((type: NodeType, e: React.PointerEvent) => {
    paletteDragStart.current = { x: e.clientX, y: e.clientY, type };
    wasDragged.current = false;
  }, []);

  useEffect(() => {
    const NODE_DEFAULTS: Record<NodeType, { label: string; config: Record<string, unknown> }> = {
      command: { label: "Comando", config: { prefix: ".", name: "", caseSensitive: false, apenasGrupos: false, apenasPrivado: false, requerPlano: false, requerAdmin: false } },
      action: { label: "Criar Figurinha", config: { action: "make_sticker" } },
      condition: { label: "Tem imagem?", config: { condition: "has_image" } },
      response: { label: "Resposta", config: { tipoResposta: "texto", texto: "", temBotoes: false, linkPreview: false } },
      buttons: { label: "Botoes", config: { tipoBotao: "normal", botoes: "" } },
    };

    const onMove = (e: PointerEvent) => {
      if (!paletteDragStart.current) return;
      const dx = e.clientX - paletteDragStart.current.x;
      const dy = e.clientY - paletteDragStart.current.y;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        wasDragged.current = true;
        if (!dragTypeRef.current) {
          dragTypeRef.current = paletteDragStart.current.type;
          setDragType(paletteDragStart.current.type);
        }
        if (ghostRef.current) {
          ghostRef.current.style.left = `${e.clientX - NODE_W / 2}px`;
          ghostRef.current.style.top = `${e.clientY - NODE_H / 2}px`;
        }
        dragDropPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onUp = () => {
      const dt = dragTypeRef.current;
      if (dt && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const cx = dragDropPos.current.x;
        const cy = dragDropPos.current.y;
        if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
          const t = transformRef.current;
          const wx = (cx - rect.left - t.x) / t.scale;
          const wy = (cy - rect.top - t.y) / t.scale;
          const d = NODE_DEFAULTS[dt];
          setNodes((prev) => [...prev, {
            id: `n${Date.now()}`, type: dt, label: d.label, config: d.config,
            position: { x: Math.max(0, wx - NODE_W / 2), y: Math.max(0, wy - NODE_H / 2) },
          }]);
        }
      }
      setDragType(null);
      dragTypeRef.current = null;
      paletteDragStart.current = null;
      setTimeout(() => { wasDragged.current = false; }, 0);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, []);

  const panRaf = useRef(0);
  const pinchRaf = useRef(0);

  const applyDomTransform = useCallback(() => {
    const el = canvasInnerRef.current;
    if (el) {
      const t = transformRef.current;
      el.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.scale})`;
    }
  }, []);

  // ── Pan handlers ──
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (blockDragRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-node-card]")) return;
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (activePointers.current.size === 2) {
      isPanning.current = false;
      const pts = [...activePointers.current.values()];
      lastPinchDist.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const canvas = canvasRef.current;
      const rect = canvas?.getBoundingClientRect();
      lastPinchMid.current = rect
        ? { x: (pts[0].x + pts[1].x) / 2 - rect.left, y: (pts[0].y + pts[1].y) / 2 - rect.top }
        : null;
      return;
    }

    if (connectingEdge || blockDragRef.current) return;
    isPanning.current = true;
    didPan.current = false;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { x: transformRef.current.x, y: transformRef.current.y };
  };

  // ── Canvas pointer events (pan + connecting edge + pinch) ──
  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // ── Pinch-to-zoom (2 fingers) ──
    if (activePointers.current.size === 2 && lastPinchDist.current !== null) {
      const pts = [...activePointers.current.values()];
      const newDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const ratio = newDist / lastPinchDist.current;
      lastPinchDist.current = newDist;

      const canvas = canvasRef.current;
      const rect = canvas?.getBoundingClientRect();
      if (rect) {
        const mid = {
          x: (pts[0].x + pts[1].x) / 2 - rect.left,
          y: (pts[0].y + pts[1].y) / 2 - rect.top,
        };
        didPan.current = true;
        const prev = transformRef.current;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * ratio));
        const actualRatio = newScale / prev.scale;
        transformRef.current = {
          scale: newScale,
          x: mid.x - actualRatio * (mid.x - prev.x),
          y: mid.y - actualRatio * (mid.y - prev.y),
        };
        if (!pinchRaf.current) {
          pinchRaf.current = requestAnimationFrame(() => {
            pinchRaf.current = 0;
            applyDomTransform();
          });
        }
      }
      return;
    }

    if (connectingEdge) {
      const t = transformRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const wx = (e.clientX - rect.left - t.x) / t.scale;
      const wy = (e.clientY - rect.top - t.y) / t.scale;
      setConnectingEdge((prev) => prev ? { ...prev, mouseX: wx, mouseY: wy } : null);
      const target = findNodeAtWorldPoint(wx, wy, connectingEdge.sourceId);
      setHoverTargetId(target);
      return;
    }
    if (!isPanning.current || blockDragRef.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didPan.current = true;
    transformRef.current = { ...transformRef.current, x: panOrigin.current.x + dx, y: panOrigin.current.y + dy };
    if (!panRaf.current) {
      panRaf.current = requestAnimationFrame(() => {
        panRaf.current = 0;
        applyDomTransform();
      });
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (connectingEdge) {
      const t = transformRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const wx = (e.clientX - rect.left - t.x) / t.scale;
      const wy = (e.clientY - rect.top - t.y) / t.scale;
      const targetId = findNodeAtWorldPoint(wx, wy, connectingEdge.sourceId);
      if (targetId) {
        const alreadyExists = edges.some((ed) => ed.source === connectingEdge.sourceId && ed.target === targetId && ed.sourceHandle === connectingEdge.sourceHandle);
        if (!alreadyExists) {
          const newEdge: FlowEdge = { id: `e${Date.now()}`, source: connectingEdge.sourceId, target: targetId };
          if (connectingEdge.sourceHandle) newEdge.sourceHandle = connectingEdge.sourceHandle;
          setEdges((prev) => [...prev, newEdge]);
        }
      }
      setConnectingEdge(null); setHoverTargetId(null);
    }
    isPanning.current = false;
    setTransform({ ...transformRef.current });
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) {
      lastPinchDist.current = null;
      lastPinchMid.current = null;
    }
    if (activePointers.current.size === 1) {
      const remaining = [...activePointers.current.values()][0];
      panStart.current = { x: remaining.x, y: remaining.y };
      panOrigin.current = { x: transformRef.current.x, y: transformRef.current.y };
      isPanning.current = true;
    }
    if (!didPan.current && !connectingEdge && !blockDragRef.current) {
      setSelectedNode(null);
    }
  };

  const handleCanvasClick = () => {
    if (didPan.current || blockDragRef.current) return;
    setSelectedNode(null);
  };

  const findNodeAtWorldPoint = (wx: number, wy: number, excludeId?: string): string | null => {
    for (const node of nodes) {
      if (node.id === excludeId) continue;
      if (wx >= node.position.x && wx <= node.position.x + NODE_W && wy >= node.position.y && wy <= node.position.y + NODE_H) return node.id;
    }
    return null;
  };

  const handleStartConnect = (sourceId: string, e: React.PointerEvent, handle?: "true" | "false") => {
    e.stopPropagation(); e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const world = screenToWorld(e.clientX, e.clientY);
    setConnectingEdge({ sourceId, sourceHandle: handle, mouseX: world.x, mouseY: world.y });
  };

  // ── Zoom ──
  const zoom = (delta: number) => {
    setTransform((prev) => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale + delta));
      return { ...prev, scale: newScale };
    });
  };

  const fitView = () => {
    if (nodes.length === 0) { setTransform({ x: 20, y: 20, scale: 1 }); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const minX = Math.min(...nodes.map((n) => n.position.x));
    const minY = Math.min(...nodes.map((n) => n.position.y));
    const maxX = Math.max(...nodes.map((n) => n.position.x + NODE_W));
    const maxY = Math.max(...nodes.map((n) => n.position.y + NODE_H));
    const pw = rect.width - 48;
    const ph = rect.height - 48;
    const fw = maxX - minX || 1;
    const fh = maxY - minY || 1;
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(pw / fw, ph / fh)));
    setTransform({
      x: (rect.width - fw * scale) / 2 - minX * scale,
      y: (rect.height - fh * scale) / 2 - minY * scale,
      scale,
    });
  };

  // ── Wheel zoom + prevent native touch gestures on canvas ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
      setTransform((prev) => {
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale + delta));
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const ratio = newScale / prev.scale;
        return {
          scale: newScale,
          x: mx - ratio * (mx - prev.x),
          y: my - ratio * (my - prev.y),
        };
      });
    };
    const preventNativeMove = (e: TouchEvent) => { e.preventDefault(); };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchmove", preventNativeMove, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchmove", preventNativeMove);
    };
  }, []);

  const handleSave = async () => {
    if (!selectedBotId) {
      toast({ title: "Selecione um bot", variant: "destructive" }); return;
    }
    try {
      await saveCommands.mutateAsync({ botId: selectedBotId, data: { botId: selectedBotId, nodes, edges } });
      queryClient.invalidateQueries({ queryKey: getGetBotCommandsQueryKey(selectedBotId) });
      toast({ title: "Fluxo salvo!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const getNodePortPos = (node: FlowNode, side: "left" | "right", handle?: "true" | "false") => {
    if (side === "right" && node.type === "condition") {
      const portY = handle === "false" ? CONDITION_PORT_NO_Y : CONDITION_PORT_YES_Y;
      return { x: node.position.x + NODE_W, y: node.position.y + portY };
    }
    return {
      x: side === "right" ? node.position.x + NODE_W : node.position.x,
      y: node.position.y + PORT_Y,
    };
  };

  const buildCurve = (x1: number, y1: number, x2: number, y2: number) => {
    const cx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  };

  const editingNode = editingNodeId ? nodes.find((n) => n.id === editingNodeId) : null;

  // ── Canvas content (with transform) ──
  const canvasContent = (
    <div ref={canvasInnerRef} style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: "0 0", position: "absolute", inset: 0, willChange: "transform" }}>
      <svg style={{ position: "absolute", inset: 0, width: "9999px", height: "9999px", overflow: "visible", pointerEvents: "none" }}>
        {edges.map((edge) => {
          const src = nodes.find((n) => n.id === edge.source);
          const tgt = nodes.find((n) => n.id === edge.target);
          if (!src || !tgt) return null;
          const p1 = getNodePortPos(src, "right", edge.sourceHandle);
          const p2 = getNodePortPos(tgt, "left");
          const edgeColor = edge.sourceHandle === "true" ? "rgba(34,197,94,0.6)" : edge.sourceHandle === "false" ? "rgba(239,68,68,0.6)" : "rgba(139,92,246,0.6)";
          const markerId = edge.sourceHandle === "true" ? "arrow-green" : edge.sourceHandle === "false" ? "arrow-red" : "arrow";
          return (
            <g key={edge.id}>
              <path d={buildCurve(p1.x, p1.y, p2.x, p2.y)} fill="none" stroke={edgeColor} strokeWidth="2.5"
                markerEnd={`url(#${markerId})`} style={{ pointerEvents: "none" }} />
            </g>
          );
        })}
        {connectingEdge && (() => {
          const src = nodes.find((n) => n.id === connectingEdge.sourceId);
          if (!src) return null;
          const p1 = getNodePortPos(src, "right", connectingEdge.sourceHandle);
          const dashColor = connectingEdge.sourceHandle === "true" ? "rgba(34,197,94,0.9)" : connectingEdge.sourceHandle === "false" ? "rgba(239,68,68,0.9)" : "rgba(139,92,246,0.9)";
          return <path d={buildCurve(p1.x, p1.y, connectingEdge.mouseX, connectingEdge.mouseY)}
            fill="none" stroke={dashColor} strokeWidth="2.5" strokeDasharray="7 3"
            style={{ pointerEvents: "none" }} />;
        })()}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(139,92,246,0.7)" />
          </marker>
          <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(34,197,94,0.7)" />
          </marker>
          <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(239,68,68,0.7)" />
          </marker>
        </defs>
      </svg>

      {nodes.map((node) => (
        <NodeCard
          key={node.id} node={node}
          selected={selectedNode === node.id}
          isTarget={hoverTargetId === node.id}
          isConnecting={!!connectingEdge}
          hasInputConnection={edges.some((e) => e.target === node.id)}
          hasOutputConnection={edges.some((e) => e.source === node.id)}
          hasYesConnection={node.type === "condition" ? edges.some((e) => e.source === node.id && e.sourceHandle === "true") : undefined}
          hasNoConnection={node.type === "condition" ? edges.some((e) => e.source === node.id && e.sourceHandle === "false") : undefined}
          onSelect={() => setSelectedNode(node.id)}
          onDelete={() => handleDeleteNode(node.id)}
          onEdit={() => { setEditingNodeId(editingNodeId === node.id ? null : node.id); setShowSettings(false); }}
          onDisconnectInput={() => {
            const edgeToRemove = edges.find((e) => e.target === node.id);
            if (edgeToRemove) setEdges((prev) => prev.filter((e) => e.id !== edgeToRemove.id));
          }}
          onDisconnectOutput={(handle) => {
            const edgeToRemove = handle
              ? edges.find((e) => e.source === node.id && e.sourceHandle === handle)
              : edges.find((e) => e.source === node.id);
            if (edgeToRemove) setEdges((prev) => prev.filter((e) => e.id !== edgeToRemove.id));
          }}
          onMove={handleMoveNode}
          onStartConnect={handleStartConnect}
          transformRef={transformRef}
          touchCount={touchCount}
          blockDragRef={blockDragRef}
        />
      ))}
    </div>
  );

  // ── Canvas wrapper ──
  const canvasArea = (
    <div className="relative flex-1 min-h-0 bg-card border border-white/5 rounded-xl overflow-hidden" style={{ overscrollBehavior: "none" }}>
      {/* Dot grid (fixed, visual only) */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Interaction layer */}
      <div
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor: connectingEdge ? "crosshair" : isPanning.current ? "grabbing" : "grab", touchAction: "none" }}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onClick={handleCanvasClick}
      >
        {canvasContent}

        {/* Empty states (above transform) */}
        {!selectedBotId && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-6">
              <Bot className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-medium">Selecione um bot acima</p>
              <p className="text-muted-foreground/50 text-xs mt-1">Seus blocos salvos vão aparecer aqui</p>
            </div>
          </div>
        )}
        {selectedBotId && commandsLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 className="h-8 w-8 text-primary/40 animate-spin" />
          </div>
        )}
        {selectedBotId && !commandsLoading && nodes.length === 0 && !showTemplates && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-6 pointer-events-auto">
              <MessageSquare className="h-12 w-12 text-primary/30 mx-auto mb-4" />
              <p className="text-white text-base font-semibold mb-1">Comece criando um comando</p>
              <p className="text-muted-foreground/60 text-xs mb-5">Clique no botao abaixo para adicionar seu primeiro bloco</p>
              <button onClick={() => handleAddNode("command")} className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-3 text-sm font-bold rounded-md shadow-xl shadow-[#7C3AED]/20 transition-colors flex items-center gap-2">
                <Plus className="h-5 w-5" /> Adicionar Bloco Comando
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add block button (top left) */}
      {selectedBotId && !showTemplates && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          {BLOCK_TYPES.map((type) => {
            const cfg = nodeConfig[type];
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => handleAddNode(type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${cfg.border} ${cfg.color} bg-card/90 backdrop-blur-sm hover:bg-white/10 transition-all shadow-lg hover:shadow-xl hover:scale-105`}
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                <Icon className="h-3.5 w-3.5 text-white/70" />
                <span className="text-white text-xs font-semibold">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Zoom controls (bottom right) */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 z-20">
        <button onClick={() => zoom(SCALE_STEP)}
          className="w-8 h-8 rounded-lg bg-card/90 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-sm">
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => zoom(-SCALE_STEP)}
          className="w-8 h-8 rounded-lg bg-card/90 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-sm">
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button onClick={fitView}
          className="w-8 h-8 rounded-lg bg-card/90 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-sm">
          <Maximize2 className="h-3 w-3" />
        </button>
        <span className="text-[10px] text-muted-foreground/50 ml-1 tabular-nums">
          {Math.round(transform.scale * 100)}%
        </span>
      </div>

      {/* Template picker overlay */}
      {showTemplates && selectedBotId && (
        <div className="absolute inset-0 z-30 bg-background/80 backdrop-blur-sm overflow-auto">
          <div className="max-w-2xl mx-auto p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5 text-primary" /> Canvas vazio
                </h2>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Sem blocos padrão. Vamos montar do zero.
                </p>
              </div>
              <button onClick={() => setShowTemplates(false)} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hints */}
      <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground/30 pointer-events-none hidden sm:block">
        Arraste fundo para mover · Scroll para zoom · Clique conexão para remover
      </div>
      {connectingEdge && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-primary/90 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none shadow-lg z-20">
          Arraste até outro bloco para conectar
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {/* Top bar */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Construtor Visual</h1>
          <p className="text-muted-foreground text-xs mt-0.5 hidden sm:block">
            Arraste o fundo para navegar · Scroll ou botões para zoom
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedBotId}
            onChange={(e) => handleBotSelect(e.target.value)}
            className="w-44 bg-[#131420] border border-[#1e1f2e] text-white text-sm rounded-md px-3 py-2 outline-none focus:border-[#7C3AED] transition-colors"
          >
            <option value="" disabled>Selecionar bot</option>
            {bots?.map((bot: { id: string; name: string }) => (
              <option key={bot.id} value={bot.id}>{bot.name}</option>
            ))}
            {(!bots || bots.length === 0) && (
              <option value="none" disabled>Crie um bot primeiro</option>
            )}
          </select>

          <button
            onClick={() => { setShowSettings((v) => !v); setEditingNodeId(null); }}
            disabled={!selectedBotId}
            className="w-9 h-9 flex items-center justify-center rounded-md border border-[#1e1f2e] bg-[#131420] text-[#4b4c6b] hover:text-white hover:border-[#7C3AED] disabled:opacity-40 transition-colors"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          {nodes.length > 0 && (
            <button
              onClick={() => {
                if (confirm(`Remover todos os ${nodes.length} blocos? Isso não pode ser desfeito.`)) {
                  setNodes([]); setEdges([]); setSelectedNode(null); setEditingNodeId(null);
                  toast({ title: "Todos os blocos foram removidos!" });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-red-500/30 bg-[#131420] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline text-[13px] font-semibold">Limpar Tudo</span>
            </button>
          )}
          <button onClick={handleSave} disabled={saveCommands.isPending || !selectedBotId} className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-md transition-colors">
            {saveCommands.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </button>
        </div>
      </div>

      {/* MOBILE layout */}
      <div className="flex flex-col gap-2 md:hidden" style={{ height: "calc(100dvh - 248px)", minHeight: 340 }}>
        {canvasArea}
      </div>

      {/* DESKTOP layout */}
      <div className="hidden md:flex gap-3" style={{ height: "calc(100vh - 220px)", minHeight: 400 }}>
        {canvasArea}

        {/* Right panel */}
        {(editingNode || showSettings) && (
          <div className="w-72 flex-shrink-0 bg-card border border-white/5 rounded-xl flex flex-col overflow-hidden">
            <div className={`flex items-center justify-between p-4 border-b border-white/5 ${editingNode ? nodeConfig[editingNode.type].color : "bg-violet-500/10"}`}>
              <div className="flex items-center gap-2">
                {editingNode
                  ? (() => { const Icon = nodeConfig[editingNode.type].icon; return <Icon className="h-4 w-4 text-white/70" />; })()
                  : <Settings2 className="h-4 w-4 text-violet-400" />}
                <span className="text-white font-semibold text-sm">
                  {editingNode ? `Editar — ${nodeConfig[editingNode.type].label}` : "Configurações"}
                </span>
              </div>
              <button onClick={() => { setEditingNodeId(null); setShowSettings(false); }} className="text-white/40 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            {editingNode
              ? <EditFormContent node={editingNode} onUpdate={handleUpdateNode} onClose={() => setEditingNodeId(null)} prefix={currentPrefix} />
              : selectedBotId ? <SettingsFormContent botId={selectedBotId} onClose={() => setShowSettings(false)} /> : null}
          </div>
        )}
      </div>

      {/* Drag ghost overlay */}
      {dragType && (
        <div ref={ghostRef} className="fixed pointer-events-none z-[100]" style={{ left: -9999, top: -9999 }}>
          <div className={`rounded-xl border-2 p-3 opacity-80 shadow-2xl backdrop-blur-sm ${nodeConfig[dragType].color} ${nodeConfig[dragType].border}`}
            style={{ width: NODE_W, minHeight: NODE_H }}>
            <div className="flex items-center gap-1.5">
              {(() => { const Icon = nodeConfig[dragType].icon; return <Icon className="h-3.5 w-3.5 text-white/70" />; })()}
              <span className="text-white text-xs font-semibold">{nodeConfig[dragType].label}</span>
            </div>
            <p className="text-white/40 text-[10px] mt-0.5">{nodeConfig[dragType].description}</p>
          </div>
        </div>
      )}

      {/* MOBILE ONLY: edit + settings bottom drawers */}
      {isMobile && (
        <>
          {/* Edit node drawer */}
          {!!editingNode && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingNodeId(null)} />
              <div className="relative bg-[#0d0e16] border-t border-[#1a1b28] rounded-t-2xl max-h-[80dvh] flex flex-col">
                <div className={`p-4 border-b border-[#1a1b28] flex-shrink-0 flex items-center gap-2 ${nodeConfig[editingNode.type].color} rounded-t-2xl`}>
                  {(() => { const Icon = nodeConfig[editingNode.type].icon; return <Icon className="h-4 w-4 text-white/70" />; })()}
                  <span className="text-white text-sm font-semibold flex-1">Editar — {nodeConfig[editingNode.type].label}</span>
                  <button onClick={() => setEditingNodeId(null)} className="text-white/40 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-auto">
                  <EditFormContent node={editingNode} onUpdate={handleUpdateNode} onClose={() => setEditingNodeId(null)} prefix={currentPrefix} />
                </div>
              </div>
            </div>
          )}

          {/* Settings drawer */}
          {showSettings && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
              <div className="relative bg-[#0d0e16] border-t border-[#1a1b28] rounded-t-2xl max-h-[80dvh] flex flex-col">
                <div className="p-4 border-b border-[#1a1b28] flex-shrink-0 flex items-center gap-2 bg-violet-500/10 rounded-t-2xl">
                  <Settings2 className="h-4 w-4 text-violet-400" />
                  <span className="text-white text-sm font-semibold flex-1">Configurações do Bot</span>
                  <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-auto">
                  {selectedBotId && <SettingsFormContent botId={selectedBotId} onClose={() => setShowSettings(false)} />}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
