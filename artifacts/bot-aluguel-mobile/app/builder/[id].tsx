import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, Alert, Modal,
  ScrollView, TextInput, Switch, Dimensions, KeyboardAvoidingView, Platform,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue, useAnimatedStyle, runOnJS, type SharedValue,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
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

const NODE_CFG: Record<NodeType, { color: string; dim: string; label: string; icon: string }> = {
  command:   { color: "#6D28D9", dim: "#6D28D930", label: "Comando",  icon: "message-square" },
  action:    { color: "#7C3AED", dim: "#7C3AED30", label: "Ação",     icon: "zap" },
  condition: { color: "#F59E0B", dim: "#F59E0B30", label: "Condição", icon: "git-branch" },
  response:  { color: "#22C55E", dim: "#22C55E30", label: "Resposta", icon: "message-circle" },
  buttons:   { color: "#06B6D4", dim: "#06B6D430", label: "Botões",   icon: "layout" },
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

const TEMPLATES: { name: string; icon: string; nodes: Partial<FlowNode>[]; edges: Partial<FlowEdge>[] }[] = [
  {
    name: "Menu Principal", icon: "list",
    nodes: [
      { type: "command", label: "Comando", config: { name: "menu", prefix: "." }, x: 60, y: 240 },
      { type: "response", label: "Resposta", config: { texto: "🤖 *Menu do Bot*\n\n🖼️ .sticker — Criar figurinha\n📋 .menu — Ver opções\n💰 .saldo — Ver moedas", tipoResposta: "texto" }, x: 320, y: 240 },
    ],
    edges: [{ source: "0", target: "1" }],
  },
  {
    name: "Figurinha", icon: "image",
    nodes: [
      { type: "command", label: "Comando", config: { name: "sticker", prefix: "." }, x: 60, y: 240 },
      { type: "action", label: "Ação", config: { action: "make_sticker" }, x: 320, y: 240 },
    ],
    edges: [{ source: "0", target: "1" }],
  },
  {
    name: "Marcar Todos", icon: "at-sign",
    nodes: [
      { type: "command", label: "Comando", config: { name: "marcar", prefix: ".", requerAdmin: true }, x: 60, y: 240 },
      { type: "condition", label: "Condição", config: { condition: "is_admin" }, x: 320, y: 240 },
      { type: "action", label: "Ação (Sim)", config: { action: "hidetag", message: "📢 Atenção a todos!" }, x: 580, y: 140 },
      { type: "response", label: "Negado (Não)", config: { texto: "❌ Apenas admins podem usar este comando!", tipoResposta: "texto" }, x: 580, y: 340 },
    ],
    edges: [{ source: "0", target: "1" }, { source: "1", target: "2", sourceHandle: "true" }, { source: "1", target: "3", sourceHandle: "false" }],
  },
  {
    name: "Saldo de Moedas", icon: "dollar-sign",
    nodes: [
      { type: "command", label: "Comando", config: { name: "saldo", prefix: "." }, x: 60, y: 240 },
      { type: "response", label: "Resposta", config: { texto: "💰 *Saldo*\n\n👤 Usuário: {nome}\n🪙 Moedas: {moedas}\n📦 Plano: {plano}", tipoResposta: "texto" }, x: 320, y: 240 },
    ],
    edges: [{ source: "0", target: "1" }],
  },
  {
    name: "Cara ou Coroa", icon: "circle",
    nodes: [
      { type: "command", label: "Comando", config: { name: "cara", prefix: "." }, x: 60, y: 240 },
      { type: "action", label: "Jogo", config: { action: "coin_flip" }, x: 320, y: 240 },
    ],
    edges: [{ source: "0", target: "1" }],
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

function bezier(sx: number, sy: number, tx: number, ty: number): string {
  const cp = Math.max(80, Math.abs(tx - sx) * 0.5);
  return `M ${sx} ${sy} C ${sx + cp} ${sy} ${tx - cp} ${ty} ${tx} ${ty}`;
}

interface NodeCardProps {
  node: FlowNode;
  canvasScale: SharedValue<number>;
  selected: boolean;
  connectingFrom: string | null;
  isConnectable: boolean;
  onTap: () => void;
  onPortTap: (handle?: "true" | "false") => void;
  onInputTap: () => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

function NodeCard({ node, canvasScale, selected, connectingFrom, isConnectable, onTap, onPortTap, onInputTap, onDragEnd }: NodeCardProps) {
  const cfg = NODE_CFG[node.type];
  const sharedX = useSharedValue(node.x);
  const sharedY = useSharedValue(node.y);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  useEffect(() => {
    if (sharedX.value !== node.x) sharedX.value = node.x;
    if (sharedY.value !== node.y) sharedY.value = node.y;
  }, [node.x, node.y]);

  const animStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: sharedX.value,
    top: sharedY.value,
  }));

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    onDragEnd(id, x, y);
  }, [onDragEnd]);

  const nodeId = node.id;
  const dragGesture = Gesture.Pan()
    .minDistance(6)
    .onStart(() => {
      "worklet";
      savedX.value = sharedX.value;
      savedY.value = sharedY.value;
    })
    .onUpdate((e) => {
      "worklet";
      sharedX.value = savedX.value + e.translationX / canvasScale.value;
      sharedY.value = savedY.value + e.translationY / canvasScale.value;
    })
    .onEnd(() => {
      "worklet";
      runOnJS(handleDragEnd)(nodeId, sharedX.value, sharedY.value);
    });

  const isConnecting = !!connectingFrom && connectingFrom !== node.id;

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[animStyle, { width: NODE_W }]}>
        <Pressable
          onPress={isConnecting ? onInputTap : onTap}
          style={({ pressed }) => [
            s.node,
            { borderColor: selected ? cfg.color : isConnectable ? cfg.color + "80" : C.border },
            pressed && { opacity: 0.9 },
          ]}
        >
          <View style={[s.nodeHeader, { backgroundColor: cfg.dim }]}>
            <View style={[s.nodeTypeIndicator, { backgroundColor: cfg.color }]} />
            <Feather name={cfg.icon as any} size={13} color={cfg.color} />
            <Text style={[s.nodeType, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <View style={s.nodeBody}>
            <Text style={[s.nodeLabel, { color: C.fg }]} numberOfLines={2}>
              {getNodeLabel(node)}
            </Text>
          </View>
        </Pressable>

        <Pressable style={[s.port, s.portLeft]} onPress={onInputTap}>
          <View style={[s.portDot, { backgroundColor: C.border, borderColor: C.border }]} />
        </Pressable>

        {node.type === "condition" ? (
          <>
            <Pressable style={[s.port, s.portRightTrue]} onPress={() => onPortTap("true")}>
              <View style={[s.portDot, { backgroundColor: "#22C55E", borderColor: "#22C55E" }]} />
              <Text style={s.portLabel}>Sim</Text>
            </Pressable>
            <Pressable style={[s.port, s.portRightFalse]} onPress={() => onPortTap("false")}>
              <View style={[s.portDot, { backgroundColor: "#EF4444", borderColor: "#EF4444" }]} />
              <Text style={s.portLabel}>Não</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={[s.port, s.portRight]} onPress={() => onPortTap()}>
            <View style={[s.portDot, { backgroundColor: cfg.color, borderColor: cfg.color }]} />
          </Pressable>
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
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; handle?: "true" | "false" } | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const { data: commandData } = useGetBotCommands(botId ?? "", { query: { enabled: !!botId } });
  const saveMutation = useSaveBotCommands();

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

  const canvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: canvasX.value },
      { translateY: canvasY.value },
      { scale: canvasScale.value },
    ],
  }));

  const panGesture = Gesture.Pan()
    .minDistance(8)
    .onStart(() => {
      "worklet";
      savedCX.value = canvasX.value;
      savedCY.value = canvasY.value;
    })
    .onUpdate((e) => {
      "worklet";
      canvasX.value = savedCX.value + e.translationX;
      canvasY.value = savedCY.value + e.translationY;
    });

  const canvasGesture = panGesture;

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    setHasUnsaved(true);
  }, []);

  const addNode = useCallback((type: NodeType) => {
    const n = makeNode(type, 100 + nodes.length * 220 % 600, 180 + Math.floor(nodes.length / 3) * 140);
    setNodes(prev => [...prev, n]);
    setHasUnsaved(true);
    setShowTypePicker(false);
  }, [nodes.length]);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setSelectedId(null);
    setHasUnsaved(true);
  }, []);

  const updateNode = useCallback((updated: FlowNode) => {
    setNodes(prev => prev.map(n => n.id === updated.id ? updated : n));
    setEditingNode(null);
    setHasUnsaved(true);
  }, []);

  const handlePortTap = useCallback((nodeId: string, handle?: "true" | "false") => {
    setConnectingFrom({ nodeId, handle });
    setSelectedId(nodeId);
  }, []);

  const handleInputTap = useCallback((targetId: string) => {
    if (!connectingFrom || connectingFrom.nodeId === targetId) {
      setConnectingFrom(null);
      return;
    }
    const already = edges.some(e => e.source === connectingFrom.nodeId && e.target === targetId && e.sourceHandle === connectingFrom.handle);
    if (!already) {
      setEdges(prev => [...prev, { id: uid(), source: connectingFrom.nodeId, target: targetId, sourceHandle: connectingFrom.handle }]);
      setHasUnsaved(true);
    }
    setConnectingFrom(null);
    setSelectedId(null);
  }, [connectingFrom, edges]);

  const handleNodeTap = useCallback((node: FlowNode) => {
    if (connectingFrom) {
      handleInputTap(node.id);
    } else {
      setSelectedId(node.id);
      setEditingNode({ ...node });
    }
  }, [connectingFrom, handleInputTap]);

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
    canvasScale.value = Math.max(0.25, Math.min(2.5, canvasScale.value * factor));
  }, [canvasScale]);

  const paddingTop = Platform.OS === "web" ? insets.top + 60 : insets.top;

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <View style={[s.topBar, { paddingTop: paddingTop + 10, borderBottomColor: C.border }]}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={C.fg} />
        </Pressable>
        <Text style={[s.title, { color: C.fg }]}>Construtor de Fluxo</Text>
        <View style={s.topBarRight}>
          {hasUnsaved && (
            <View style={s.unsavedDot} />
          )}
          <Pressable style={[s.saveBtn, { backgroundColor: "#7C3AED" }]} onPress={handleSave} disabled={saveMutation.isPending}>
            <Feather name="save" size={14} color="#FFF" />
            <Text style={s.saveBtnText}>{saveMutation.isPending ? "Salvando…" : "Salvar"}</Text>
          </Pressable>
        </View>
      </View>

      {connectingFrom && (
        <View style={[s.connectingBanner, { backgroundColor: "#F59E0B20", borderColor: "#F59E0B40" }]}>
          <Feather name="link" size={14} color="#F59E0B" />
          <Text style={[s.connectingText, { color: "#F59E0B" }]}>Toque em outro bloco para conectar</Text>
          <Pressable onPress={() => setConnectingFrom(null)}>
            <Feather name="x" size={16} color="#F59E0B" />
          </Pressable>
        </View>
      )}

      <GestureDetector gesture={canvasGesture}>
        <View style={s.canvasContainer}>
          <Animated.View style={[s.canvas, canvasStyle]}>
            <View style={s.canvasBg} />
            <Svg
              pointerEvents="none"
              style={{ position: "absolute", top: 0, left: 0 }}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
            >
              {edges.map(edge => {
                const src = getNodeById(edge.source);
                const tgt = getNodeById(edge.target);
                if (!src || !tgt) return null;
                let sy = src.y + NODE_H / 2;
                if (edge.sourceHandle === "true") sy = src.y + NODE_H / 3;
                if (edge.sourceHandle === "false") sy = src.y + (NODE_H * 2) / 3;
                const sx = src.x + NODE_W;
                const tx = tgt.x;
                const ty = tgt.y + NODE_H / 2;
                const edgeColor = edge.sourceHandle === "true" ? "#22C55E" : edge.sourceHandle === "false" ? "#EF4444" : "#7C3AED";
                return (
                  <Path
                    key={edge.id}
                    d={bezier(sx, sy, tx, ty)}
                    stroke={edgeColor}
                    strokeWidth={2}
                    fill="none"
                    strokeOpacity={0.7}
                  />
                );
              })}
            </Svg>

            {nodes.map(node => (
              <NodeCard
                key={node.id}
                node={node}
                canvasScale={canvasScale}
                selected={selectedId === node.id}
                connectingFrom={connectingFrom?.nodeId ?? null}
                isConnectable={!!connectingFrom && connectingFrom.nodeId !== node.id}
                onTap={() => handleNodeTap(node)}
                onPortTap={(handle) => handlePortTap(node.id, handle)}
                onInputTap={() => connectingFrom ? handleInputTap(node.id) : handleNodeTap(node)}
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
        <Pressable style={[s.toolBtnPrimary, { backgroundColor: C.primary }]} onPress={() => setShowTypePicker(true)}>
          <Feather name="plus" size={20} color="#FFF" />
          <Text style={s.toolBtnPrimaryText}>Adicionar bloco</Text>
        </Pressable>
        <View style={s.zoomBtns}>
          <Pressable style={[s.zoomBtn, { backgroundColor: C.secondary }]} onPress={() => zoom(1.2)}>
            <Feather name="zoom-in" size={16} color={C.fg} />
          </Pressable>
          <Pressable style={[s.zoomBtn, { backgroundColor: C.secondary }]} onPress={() => zoom(0.8)}>
            <Feather name="zoom-out" size={16} color={C.fg} />
          </Pressable>
        </View>
      </View>

      <NodeEditor
        node={editingNode}
        onSave={updateNode}
        onDelete={deleteNode}
        onClose={() => setEditingNode(null)}
      />

      <TypePickerModal
        visible={showTypePicker}
        onSelect={addNode}
        onClose={() => setShowTypePicker(false)}
      />

      <TemplatesModal
        visible={showTemplates}
        onSelect={applyTemplate}
        onClose={() => setShowTemplates(false)}
      />
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
      <View style={[s.modalSheet, { backgroundColor: C.card, paddingBottom: insets.bottom + 20 }]}>
        <View style={[s.editorHandle, { backgroundColor: C.border }]} />
        <Text style={[s.modalTitle, { color: C.fg }]}>Templates prontos</Text>
        <Text style={[s.modalSubtitle, { color: C.muted }]}>Substitui o fluxo atual</Text>
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
              <Text style={[s.typeDesc, { color: C.muted }]}>{tpl.nodes.length} blocos · {tpl.edges.length} conexões</Text>
            </View>
            <Feather name="chevron-right" size={18} color={C.muted} />
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center" as const, fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  topBarRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  unsavedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F59E0B" },
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
  node: {
    width: NODE_W,
    borderRadius: 12, borderWidth: 1.5,
    overflow: "hidden" as const,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  nodeHeader: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  nodeTypeIndicator: { width: 4, height: 20, borderRadius: 2, marginRight: 2 },
  nodeType: { fontSize: 11, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  nodeBody: { paddingHorizontal: 10, paddingVertical: 8, minHeight: 36 },
  nodeLabel: { fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 18 },
  port: { position: "absolute" as const, justifyContent: "center", alignItems: "center", zIndex: 10 },
  portLeft: { left: -10, top: NODE_H / 2 - 9 },
  portRight: { right: -10, top: NODE_H / 2 - 9 },
  portRightTrue: { right: -28, top: NODE_H / 3 - 9, flexDirection: "row", alignItems: "center", gap: 2 },
  portRightFalse: { right: -28, top: (NODE_H * 2) / 3 - 9, flexDirection: "row", alignItems: "center", gap: 2 },
  portDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  portLabel: { fontSize: 9, color: "#888", fontFamily: "Inter_500Medium" },
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
});
