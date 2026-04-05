import { useState, useRef, useCallback, startTransition, useEffect } from "react";
import {
  Save, Plus, Trash2, Bot, Loader2, MessageSquare, Zap, GitBranch,
  Reply, Info, Pencil, X, ChevronRight, Settings2, Link2, ChevronDown,
  ZoomIn, ZoomOut, Maximize2, LayoutTemplate, Image, Shield, Users, Star, HandMetal,
  Gamepad2, Crown, Lock, Heart, Sparkles, Send, Eye, Copy,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  useListBots, useGetBotCommands, useSaveBotCommands, getGetBotCommandsQueryKey,
  useUpdateBotSettings, useGetBot, getGetBotQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type NodeType = "command" | "action" | "condition" | "response";
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
}

interface ConnectingEdge {
  sourceId: string;
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
    { key: "coins_amount", label: "Quantidade de moedas", type: "text", placeholder: "100", showWhen: (c) => c.action === "give_coins" },
    { key: "target_number", label: "Número do alvo (DDI+DDD+Número)", type: "text", placeholder: "5511999999999", showWhen: (c) => ["give_coins", "block_user", "unblock_user"].includes(String(c.action)) },
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
    { key: "text", label: "Texto da Resposta", type: "textarea", placeholder: "Use variáveis: {nome}, {user}, {grupo}, {membros}, {moedas}, {plano}..." },
    { key: "response_image", label: "Imagem junto com a resposta (URL)", type: "text", placeholder: "https://..." },
    { key: "response_buttons", label: "Botões (id | texto, um por linha)", type: "textarea", placeholder: ".menu | 📋 Ver Menu\n.ajuda | ❓ Ajuda" },
    { key: "response_footer", label: "Rodapé (opcional)", type: "text", placeholder: "Bot feito com BotAluguel Pro" },
  ],
};

const BLOCK_TYPES: NodeType[] = ["command"];

interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const TEMPLATES: FlowTemplate[] = [];
function Port({ side, onPointerDown, isTarget, isConnecting }: {
  side: "left" | "right";
  onPointerDown?: (e: React.PointerEvent) => void;
  isTarget?: boolean;
  isConnecting?: boolean;
}) {
  const isRight = side === "right";
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center ${isRight ? "-right-3" : "-left-3"}`}
      style={{ touchAction: "none" }}
    >
      {isRight && !isTarget && <span className="absolute w-5 h-5 rounded-full bg-primary/20 animate-ping" />}
      <div
        className={`relative w-5 h-5 rounded-full border-2 transition-all duration-150 flex items-center justify-center
          ${isTarget ? "bg-green-400 border-green-300 scale-125 shadow-lg shadow-green-400/40"
            : isRight ? "bg-primary border-primary/80 hover:scale-125 hover:shadow-lg hover:shadow-primary/40 cursor-crosshair"
              : "bg-background border-white/20 cursor-default"}
          ${isConnecting && isRight ? "scale-125 shadow-primary/60 shadow-lg" : ""}`}
        onPointerDown={onPointerDown}
        style={{ touchAction: "none" }}
      >
        {isRight && <Link2 className="w-2.5 h-2.5 text-white/80" />}
      </div>
    </div>
  );
}

// ─── Node card ────────────────────────────────────────────────────────────────
function NodeCard({
  node, selected, isTarget, isConnecting,
  onSelect, onDelete, onEdit, onMove, onStartConnect, transformRef, touchCount,
}: {
  node: FlowNode; selected: boolean; isTarget: boolean; isConnecting: boolean;
  onSelect: () => void; onDelete: () => void; onEdit: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onStartConnect: (sourceId: string, e: React.PointerEvent) => void;
  transformRef: React.RefObject<CanvasTransform>;
  touchCount: React.RefObject<number>;
}) {
  const cfg = nodeConfig[node.type];
  const Icon = cfg.icon;
  const dragData = useRef<{ startX: number; startY: number; nodeX: number; nodeY: number; dragging: boolean } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCount = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    dragData.current = { startX: e.clientX, startY: e.clientY, nodeX: node.position.x, nodeY: node.position.y, dragging: false };
    onSelect();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragData.current;
    if (!d) return;
    if (touchCount.current >= 2) {
      if (d.dragging) cardRef.current?.releasePointerCapture(e.pointerId);
      dragData.current = null;
      return;
    }
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.dragging) {
      if (Math.hypot(dx, dy) < 6) return;
      d.dragging = true;
      cardRef.current?.setPointerCapture(e.pointerId);
    }
    const scale = transformRef.current.scale;
    onMove(node.id, Math.max(0, d.nodeX + dx / scale), Math.max(0, d.nodeY + dy / scale));
  };

  const handlePointerUp = () => { dragData.current = null; };

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

  const displayLabel = node.type === "command" && node.config?.name
    ? `${node.config.prefix && node.config.prefix !== "nenhum" ? node.config.prefix : ""}${node.config.name}`
    : node.config?.trigger
      ? String(node.config.trigger)
      : node.config?.action
        ? (CONFIG_FIELDS.action[0].options?.find(o => o.value === node.config.action)?.label ?? node.label)
        : node.config?.text
          ? String(node.config.text).slice(0, 22)
          : node.label;

  const commandTags: string[] = [];
  if (node.type === "command" && node.config) {
    if (node.config.apenasGrupos) commandTags.push("grupo");
    if (node.config.apenasPrivado) commandTags.push("privado");
    if (node.config.requerAdmin) commandTags.push("admin");
    if (node.config.requerPlano) commandTags.push("plano");
  }

  return (
    <div
      ref={cardRef}
      className={`absolute rounded-xl border-2 p-3 select-none transition-shadow
        ${cfg.color} ${cfg.border}
        ${selected ? "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-xl" : "shadow-md"}
        ${isTarget ? "ring-2 ring-green-400 ring-offset-1 ring-offset-background" : ""}`}
      style={{ left: node.position.x, top: node.position.y, width: NODE_W, minHeight: NODE_H, cursor: "grab", touchAction: "none", willChange: "left, top" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
    >
      <Port side="left" isTarget={isTarget} />
      <Port side="right" isConnecting={isConnecting}
        onPointerDown={(e) => { e.stopPropagation(); onStartConnect(node.id, e); }} />

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
      {commandTags.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-1">
          {commandTags.map((tag) => (
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
                <Label className="text-white/70 text-xs mb-1.5 block">{field.label}</Label>
                {field.type === "select" && field.options ? (
                  <Select value={String(localConfig[field.key] ?? "")} onValueChange={(v) => setLocalConfig((c) => ({ ...c, [field.key]: v }))}>
                    <SelectTrigger className="bg-background border-white/10 text-white h-9 text-sm"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      {field.options.map((opt) => <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-white/5 text-sm">{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea value={String(localConfig[field.key] ?? "")}
                    onChange={(e) => setLocalConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                    placeholder={field.placeholder} className="bg-background border-white/10 text-white text-sm min-h-[80px] resize-none" />
                ) : (
                  <Input value={String(localConfig[field.key] ?? "")}
                    onChange={(e) => setLocalConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                    placeholder={field.placeholder} className="bg-background border-white/10 text-white h-9 text-sm" />
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
      <div className="p-4 border-t border-white/5">
        <Button onClick={handleSave} size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
          <ChevronRight className="h-3.5 w-3.5 mr-1.5" />Salvar Bloco
        </Button>
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
          <Label className="text-white/70 text-xs mb-1.5 block">Nome do Bot</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: MeuBot" className="bg-background border-white/10 text-white h-9 text-sm" />
        </div>
        <div>
          <Label className="text-white/70 text-xs mb-1.5 block">Prefixo dos comandos</Label>
          <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="." maxLength={3} className="bg-background border-white/10 text-white h-9 text-sm font-mono" />
          <p className="text-muted-foreground text-xs mt-1">Ex: <span className="font-mono text-white/60">{prefix || "."}sticker</span></p>
        </div>
        <div>
          <Label className="text-white/70 text-xs mb-1.5 block">Número do Dono</Label>
          <Input value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="5511999999999" className="bg-background border-white/10 text-white h-9 text-sm" />
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
      <div className="p-4 border-t border-white/5">
        <Button onClick={handleSave} disabled={updateSettings.isPending} size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
          {updateSettings.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          Salvar Configurações
        </Button>
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
      setNodes((commandsData.nodes as FlowNode[]) ?? []);
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
      response: { label: "Mensagem", config: { text: "Mensagem de resposta" } },
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

  const handleDeleteEdge = (edgeId: string) => setEdges((prev) => prev.filter((e) => e.id !== edgeId));

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
      response: { label: "Mensagem", config: { text: "Mensagem de resposta" } },
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

  // ── Pan handlers ──
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (activePointers.current.size === 2) {
      // Two fingers — start pinch
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

    if (connectingEdge) return;
    isPanning.current = true;
    didPan.current = false;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { x: transform.x, y: transform.y };
  };

  // ── Canvas pointer events (pan + connecting edge + pinch) ──
  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    // Update pointer position
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
        setTransform((prev) => {
          const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * ratio));
          const actualRatio = newScale / prev.scale;
          return {
            scale: newScale,
            x: mid.x - actualRatio * (mid.x - prev.x),
            y: mid.y - actualRatio * (mid.y - prev.y),
          };
        });
      }
      return;
    }

    if (connectingEdge) {
      const world = screenToWorld(e.clientX, e.clientY);
      setConnectingEdge((prev) => prev ? { ...prev, mouseX: world.x, mouseY: world.y } : null);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const wx = (sx - transform.x) / transform.scale;
      const wy = (sy - transform.y) / transform.scale;
      const target = findNodeAtWorldPoint(wx, wy, connectingEdge.sourceId);
      setHoverTargetId(target);
      return;
    }
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didPan.current = true;
    const newX = panOrigin.current.x + dx;
    const newY = panOrigin.current.y + dy;
    transformRef.current = { ...transformRef.current, x: newX, y: newY };
    if (canvasInnerRef.current) {
      canvasInnerRef.current.style.transform = `translate(${newX}px, ${newY}px) scale(${transformRef.current.scale})`;
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (connectingEdge) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const wx = (e.clientX - rect.left - transform.x) / transform.scale;
      const wy = (e.clientY - rect.top - transform.y) / transform.scale;
      const targetId = findNodeAtWorldPoint(wx, wy, connectingEdge.sourceId);
      if (targetId && !edges.some((ed) => ed.source === connectingEdge.sourceId && ed.target === targetId)) {
        setEdges((prev) => [...prev, { id: `e${Date.now()}`, source: connectingEdge.sourceId, target: targetId }]);
      }
      setConnectingEdge(null); setHoverTargetId(null);
    }
    isPanning.current = false;
    setTransform({ ...transformRef.current });
    // Clean up pointer tracking
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) {
      lastPinchDist.current = null;
      lastPinchMid.current = null;
    }
    // If one finger remains, restart pan from current position
    if (activePointers.current.size === 1) {
      const remaining = [...activePointers.current.values()][0];
      panStart.current = { x: remaining.x, y: remaining.y };
      panOrigin.current = { x: transformRef.current.x, y: transformRef.current.y };
      isPanning.current = true;
    }
  };

  const handleCanvasClick = () => {
    if (didPan.current) return; // don't deselect if we just panned
    setSelectedNode(null);
  };

  const findNodeAtWorldPoint = (wx: number, wy: number, excludeId?: string): string | null => {
    for (const node of nodes) {
      if (node.id === excludeId) continue;
      if (wx >= node.position.x && wx <= node.position.x + NODE_W && wy >= node.position.y && wy <= node.position.y + NODE_H) return node.id;
    }
    return null;
  };

  const handleStartConnect = (sourceId: string, e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const world = screenToWorld(e.clientX, e.clientY);
    setConnectingEdge({ sourceId, mouseX: world.x, mouseY: world.y });
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

  // ── Wheel zoom ──
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
        // Zoom toward cursor
        const ratio = newScale / prev.scale;
        return {
          scale: newScale,
          x: mx - ratio * (mx - prev.x),
          y: my - ratio * (my - prev.y),
        };
      });
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
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

  const getNodePortPos = (node: FlowNode, side: "left" | "right") => ({
    x: side === "right" ? node.position.x + NODE_W : node.position.x,
    y: node.position.y + PORT_Y,
  });

  const buildCurve = (x1: number, y1: number, x2: number, y2: number) => {
    const cx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  };

  const editingNode = editingNodeId ? nodes.find((n) => n.id === editingNodeId) : null;

  // ── Canvas content (with transform) ──
  const canvasContent = (
    <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: "0 0", position: "absolute", inset: 0, willChange: "transform" }}>
      <svg style={{ position: "absolute", inset: 0, width: "9999px", height: "9999px", overflow: "visible", pointerEvents: "none" }}>
        {edges.map((edge) => {
          const src = nodes.find((n) => n.id === edge.source);
          const tgt = nodes.find((n) => n.id === edge.target);
          if (!src || !tgt) return null;
          const p1 = getNodePortPos(src, "right");
          const p2 = getNodePortPos(tgt, "left");
          return (
            <g key={edge.id} style={{ pointerEvents: "stroke" }}>
              <path d={buildCurve(p1.x, p1.y, p2.x, p2.y)} fill="none" stroke="transparent" strokeWidth={14 / transform.scale}
                style={{ pointerEvents: "stroke", cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); handleDeleteEdge(edge.id); }} />
              <path d={buildCurve(p1.x, p1.y, p2.x, p2.y)} fill="none" stroke="rgba(139,92,246,0.6)" strokeWidth="2.5"
                markerEnd="url(#arrow)" style={{ pointerEvents: "none" }} />
            </g>
          );
        })}
        {connectingEdge && (() => {
          const src = nodes.find((n) => n.id === connectingEdge.sourceId);
          if (!src) return null;
          const p1 = getNodePortPos(src, "right");
          return <path d={buildCurve(p1.x, p1.y, connectingEdge.mouseX, connectingEdge.mouseY)}
            fill="none" stroke="rgba(139,92,246,0.9)" strokeWidth="2.5" strokeDasharray="7 3"
            style={{ pointerEvents: "none" }} />;
        })()}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(139,92,246,0.7)" />
          </marker>
        </defs>
      </svg>

      {nodes.map((node) => (
        <NodeCard
          key={node.id} node={node}
          selected={selectedNode === node.id}
          isTarget={hoverTargetId === node.id}
          isConnecting={!!connectingEdge}
          onSelect={() => setSelectedNode(node.id)}
          onDelete={() => handleDeleteNode(node.id)}
          onEdit={() => { setEditingNodeId(editingNodeId === node.id ? null : node.id); setShowSettings(false); }}
          onMove={handleMoveNode}
          onStartConnect={handleStartConnect}
          canvasRef={canvasRef}
          transform={transform}
          touchCount={touchCount}
        />
      ))}
    </div>
  );

  // ── Canvas wrapper ──
  const canvasArea = (
    <div className="relative flex-1 min-h-0 bg-card border border-white/5 rounded-xl overflow-hidden">
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
              <LayoutTemplate className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-medium">Nenhum bloco ainda</p>
              <p className="text-muted-foreground/50 text-xs mt-1 mb-4">Comece com um template pronto ou adicione blocos manualmente</p>
              <Button onClick={() => setShowTemplates(true)} size="sm" className="bg-primary hover:bg-primary/90 text-white">
                <LayoutTemplate className="h-4 w-4 mr-1.5" /> Usar Template Pronto
              </Button>
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
          <Select onValueChange={handleBotSelect} value={selectedBotId}>
            <SelectTrigger className="w-44 bg-background border-white/10 text-white text-sm">
              <SelectValue placeholder="Selecionar bot" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10">
              {bots?.map((bot: { id: string; name: string }) => (
                <SelectItem key={bot.id} value={bot.id} className="text-white hover:bg-white/5">{bot.name}</SelectItem>
              ))}
              {(!bots || bots.length === 0) && (
                <SelectItem value="none" disabled className="text-muted-foreground">Crie um bot primeiro</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"
            onClick={() => { setShowTemplates(true); setEditingNodeId(null); setShowSettings(false); }}
            disabled={!selectedBotId}
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5">
            <LayoutTemplate className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
          <Button variant="outline" size="sm"
            onClick={() => { setShowSettings((v) => !v); setEditingNodeId(null); }}
            disabled={!selectedBotId}
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5">
            <Settings2 className="h-4 w-4" />
          </Button>
          {nodes.length > 0 && (
            <Button variant="outline" size="sm"
              onClick={() => {
                if (confirm(`Remover todos os ${nodes.length} blocos? Isso não pode ser desfeito.`)) {
                  setNodes([]); setEdges([]); setSelectedNode(null); setEditingNodeId(null);
                  toast({ title: "Todos os blocos foram removidos!" });
                }
              }}
              className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Limpar Tudo</span>
            </Button>
          )}
          <Button onClick={handleSave} disabled={saveCommands.isPending || !selectedBotId} size="sm" className="bg-primary hover:bg-primary/90 text-white">
            {saveCommands.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            Salvar
          </Button>
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

      {/* MOBILE ONLY: edit + settings bottom sheets — NOT rendered on desktop */}
      {isMobile && (
        <>
          <Sheet open={!!editingNode} onOpenChange={(open) => { if (!open) setEditingNodeId(null); }}>
            <SheetContent
              side="bottom"
              className="bg-card border-t border-white/10 rounded-t-2xl p-0 max-h-[80dvh] flex flex-col"
              onInteractOutside={(e) => e.preventDefault()}
              onPointerDownOutside={(e) => e.preventDefault()}
            >
              {editingNode && (
                <>
                  <SheetHeader className={`p-4 border-b border-white/5 flex-shrink-0 ${nodeConfig[editingNode.type].color}`}>
                    <SheetTitle className="text-white text-sm flex items-center gap-2">
                      {(() => { const Icon = nodeConfig[editingNode.type].icon; return <Icon className="h-4 w-4 text-white/70" />; })()}
                      Editar — {nodeConfig[editingNode.type].label}
                      <ChevronDown className="h-4 w-4 ml-auto text-white/40" />
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 min-h-0 overflow-auto">
                    <EditFormContent node={editingNode} onUpdate={handleUpdateNode} onClose={() => setEditingNodeId(null)} prefix={currentPrefix} />
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>

          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetContent
              side="bottom"
              className="bg-card border-t border-white/10 rounded-t-2xl p-0 max-h-[80dvh] flex flex-col"
              onInteractOutside={(e) => e.preventDefault()}
              onPointerDownOutside={(e) => e.preventDefault()}
            >
              <SheetHeader className="p-4 border-b border-white/5 flex-shrink-0 bg-violet-500/10">
                <SheetTitle className="text-white text-sm flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-violet-400" />
                  Configurações do Bot
                  <ChevronDown className="h-4 w-4 ml-auto text-white/40" />
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 min-h-0 overflow-auto">
                {selectedBotId && <SettingsFormContent botId={selectedBotId} onClose={() => setShowSettings(false)} />}
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </DashboardLayout>
  );
}
