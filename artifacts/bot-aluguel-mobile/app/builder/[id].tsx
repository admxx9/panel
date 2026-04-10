import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, Alert, Modal,
  ScrollView, TextInput, Switch, Dimensions, KeyboardAvoidingView, Platform,
} from "react-native";
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

const { height: SH } = Dimensions.get("window");

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
      { value: "make_sticker", label: "Criar Figurinha" },
      { value: "send_image", label: "Enviar Imagem" },
      { value: "hidetag", label: "Marcar Todos" },
      { value: "kick_member", label: "Remover Membro" },
      { value: "ban_member", label: "Banir Membro" },
      { value: "warn_member", label: "Dar Aviso" },
      { value: "mute_member", label: "Mutar Membro" },
      { value: "unmute_member", label: "Desmutar Membro" },
      { value: "delete_message", label: "Apagar Mensagem" },
      { value: "promote_member", label: "Promover a Admin" },
      { value: "demote_member", label: "Rebaixar Admin" },
      { value: "mute_group", label: "Silenciar Grupo" },
      { value: "unmute_group", label: "Liberar Grupo" },
      { value: "close_group", label: "Fechar Grupo" },
      { value: "open_group", label: "Abrir Grupo" },
      { value: "get_group_link", label: "Link do Grupo" },
      { value: "show_menu", label: "Menu Principal" },
      { value: "show_menu_admin", label: "Menu Admin" },
      { value: "show_menu_owner", label: "Menu Dono" },
      { value: "send_poll", label: "Enviar Enquete" },
      { value: "react_message", label: "Reagir Mensagem" },
      { value: "coin_flip", label: "Cara ou Coroa" },
      { value: "dice_roll", label: "Rolar Dado" },
      { value: "pick_random", label: "Sortear Membro" },
      { value: "love_meter", label: "Medidor de Amor" },
      { value: "rate", label: "Nota de 0 a 10" },
      { value: "fortune", label: "Biscoito da Sorte" },
      { value: "roulette", label: "Roleta Russa" },
      { value: "top5", label: "Top 5 do Grupo" },
      { value: "rank", label: "Ranking Mensagens" },
      { value: "joke", label: "Piada Aleatória" },
      { value: "bot_on", label: "Ligar Bot (Dono)" },
      { value: "bot_off", label: "Desligar Bot (Dono)" },
      { value: "give_coins", label: "Dar Moedas (Dono)" },
      { value: "add_coins", label: "Adicionar Moedas" },
      { value: "remove_coins", label: "Remover Moedas" },
      { value: "broadcast", label: "Broadcast (Dono)" },
      { value: "antilink", label: "Anti-Link" },
      { value: "antispam", label: "Anti-Spam" },
      { value: "antiflood", label: "Anti-Flood" },
      { value: "antifake", label: "Anti-Fake" },
      { value: "antitoxic", label: "Anti-Palavrão" },
      { value: "antidelete", label: "Anti-Delete" },
      { value: "set_welcome", label: "Boas-Vindas" },
      { value: "set_goodbye", label: "Despedida" },
      { value: "set_auto_reply", label: "Auto-Resposta" },
      { value: "group_info", label: "Info do Grupo" },
      { value: "member_list", label: "Lista de Membros" },
      { value: "admin_list", label: "Lista de Admins" },
      { value: "translate", label: "Traduzir Texto" },
      { value: "calc", label: "Calculadora" },
      { value: "qrcode_gen", label: "Gerar QR Code" },
      { value: "typing", label: "Simular Digitando" },
      { value: "delay", label: "Aguardar (Pausa)" },
      { value: "http_request", label: "Requisição HTTP" },
      { value: "send_log", label: "Enviar Log" },
      { value: "join_group_link", label: "Entrar no Grupo" },
      { value: "leave_group", label: "Sair do Grupo" },
    ]},
    { key: "message", label: "Mensagem ({nome}, {grupo}...)", type: "textarea", placeholder: "Olá {nome}!" },
    { key: "emoji", label: "Emoji", type: "text", placeholder: "👍", showWhen: (c) => c.action === "react_message" },
    { key: "image_url", label: "URL da imagem", type: "text", placeholder: "https://...", showWhen: (c) => c.action === "send_image" },
    { key: "coins_amount", label: "Quantidade de moedas", type: "text", placeholder: "100", showWhen: (c) => ["give_coins","add_coins","remove_coins"].includes(String(c.action)) },
    { key: "menu_title", label: "Título do menu", type: "text", placeholder: "Menu do Bot", showWhen: (c) => String(c.action).startsWith("show_menu") },
    { key: "menu_text", label: "Texto do menu", type: "textarea", placeholder: "{nome}\nMoedas: {moedas}\n\nComandos:\n.sticker", showWhen: (c) => String(c.action).startsWith("show_menu") },
    { key: "http_url", label: "URL da requisição", type: "text", placeholder: "https://api.exemplo.com/webhook", showWhen: (c) => c.action === "http_request" },
    { key: "http_method", label: "Método HTTP", type: "select", options: [{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }, { value: "DELETE", label: "DELETE" }], showWhen: (c) => c.action === "http_request" },
    { key: "delay_ms", label: "Tempo de espera (ms)", type: "text", placeholder: "1500", showWhen: (c) => c.action === "delay" },
    { key: "welcome_text", label: "Mensagem de boas-vindas", type: "textarea", placeholder: "Bem-vindo(a) {nome}!", showWhen: (c) => c.action === "set_welcome" },
    { key: "goodbye_text", label: "Mensagem de despedida", type: "textarea", placeholder: "{nome} saiu!", showWhen: (c) => c.action === "set_goodbye" },
    { key: "flood_max", label: "Máx. msgs por intervalo", type: "text", placeholder: "5", showWhen: (c) => c.action === "antiflood" },
    { key: "broadcast_text", label: "Mensagem do broadcast", type: "textarea", placeholder: "Aviso para todos os grupos!", showWhen: (c) => c.action === "broadcast" },
  ],
  condition: [
    { key: "condition", label: "Condição", type: "select", options: [
      { value: "is_group", label: "É grupo" },
      { value: "is_private", label: "É privado" },
      { value: "is_admin", label: "Remetente é admin" },
      { value: "is_not_admin", label: "Não é admin" },
      { value: "is_owner", label: "É o dono do bot" },
      { value: "is_bot_admin", label: "Bot é admin" },
      { value: "has_image", label: "Tem imagem" },
      { value: "has_video", label: "Tem vídeo" },
      { value: "has_sticker", label: "Tem figurinha" },
      { value: "contains_text", label: "Contém texto..." },
      { value: "has_mention", label: "Menciona alguém" },
      { value: "is_reply", label: "É reply" },
      { value: "contains_link", label: "Contém link" },
      { value: "sender_has_plan", label: "Tem plano ativo" },
      { value: "time_between", label: "Horário entre X e Y" },
      { value: "member_count_gt", label: "Grupo tem + de N membros" },
      { value: "bot_is_on", label: "Bot está ligado" },
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
    { key: "botoes", label: "Botões (id | texto, max 3)", type: "textarea", placeholder: ".sim | Sim\n.nao | Não", showWhen: (c) => !!c.temBotoes },
  ],
  buttons: [
    { key: "tipoBotao", label: "Tipo", type: "select", options: [{ value: "normal", label: "Botões normais (max 3)" }, { value: "lista", label: "Lista interativa" }] },
    { key: "botoes", label: "Botões (id | texto)", type: "textarea", placeholder: ".sim | Sim\n.nao | Não" },
    { key: "titulo", label: "Título", type: "text", placeholder: "Escolha uma opção:" },
    { key: "rodape", label: "Rodapé", type: "text", placeholder: "BotAluguel Pro" },
  ],
};

function uid() { return Math.random().toString(36).slice(2, 9); }

function getNodeLabel(node: FlowNode): string {
  const cfg = node.config;
  if (node.type === "command" && cfg.name) return `${cfg.prefix ?? "."}${cfg.name}`;
  if (node.type === "action" && cfg.action) {
    const opt = CFG.action.find(f => f.key === "action")?.options?.find(o => o.value === cfg.action);
    return opt ? opt.label : String(cfg.action);
  }
  if (node.type === "condition" && cfg.condition) {
    const opt = CFG.condition.find(f => f.key === "condition")?.options?.find(o => o.value === cfg.condition);
    return opt ? opt.label : String(cfg.condition);
  }
  if (node.type === "response" && cfg.texto) return String(cfg.texto).slice(0, 40) + (String(cfg.texto).length > 40 ? "…" : "");
  return NODE_CFG[node.type].label;
}

const TEMPLATES = [
  {
    name: "Menu Principal", icon: "list",
    nodes: [
      { type: "command" as NodeType, config: { name: "menu", prefix: "." }, x: 60, y: 100 },
      { type: "response" as NodeType, config: { texto: "Menu do Bot\n\n.sticker — Criar figurinha\n.menu — Ver opções\n.saldo — Ver moedas", tipoResposta: "texto" }, x: 300, y: 100 },
    ],
    edges: [{ source: "0", target: "1" }],
  },
  {
    name: "Figurinha", icon: "image",
    nodes: [
      { type: "command" as NodeType, config: { name: "sticker", prefix: "." }, x: 60, y: 100 },
      { type: "action" as NodeType, config: { action: "make_sticker" }, x: 300, y: 100 },
    ],
    edges: [{ source: "0", target: "1" }],
  },
  {
    name: "Marcar Todos", icon: "at-sign",
    nodes: [
      { type: "command" as NodeType, config: { name: "marcar", prefix: ".", requerAdmin: true }, x: 60, y: 100 },
      { type: "condition" as NodeType, config: { condition: "is_admin" }, x: 300, y: 100 },
      { type: "action" as NodeType, config: { action: "hidetag", message: "Atenção a todos!" }, x: 540, y: 50 },
      { type: "response" as NodeType, config: { texto: "Apenas admins podem usar este comando!", tipoResposta: "texto" }, x: 540, y: 200 },
    ],
    edges: [{ source: "0", target: "1" }, { source: "1", target: "2", sourceHandle: "true" }, { source: "1", target: "3", sourceHandle: "false" }],
  },
  {
    name: "Saldo de Moedas", icon: "dollar-sign",
    nodes: [
      { type: "command" as NodeType, config: { name: "saldo", prefix: "." }, x: 60, y: 100 },
      { type: "response" as NodeType, config: { texto: "Saldo\n\nUsuário: {nome}\nMoedas: {moedas}\nPlano: {plano}", tipoResposta: "texto" }, x: 300, y: 100 },
    ],
    edges: [{ source: "0", target: "1" }],
  },
];

export default function BuilderScreen() {
  const { id: botId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; handle?: "true" | "false" } | null>(null);
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

  const addNode = useCallback((type: NodeType) => {
    const n: FlowNode = {
      id: uid(), type, label: NODE_CFG[type].label,
      config: {}, x: 100 + nodes.length * 220 % 600, y: 100 + Math.floor(nodes.length / 3) * 140,
    };
    setNodes(prev => [...prev, n]);
    setHasUnsaved(true);
    setShowTypePicker(false);
    setEditingNode(n);
  }, [nodes.length]);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setEditingNode(null);
    setHasUnsaved(true);
  }, []);

  const updateNode = useCallback((updated: FlowNode) => {
    setNodes(prev => prev.map(n => n.id === updated.id ? updated : n));
    setEditingNode(null);
    setHasUnsaved(true);
  }, []);

  const handleConnect = useCallback((targetId: string) => {
    if (!connectingFrom || connectingFrom.nodeId === targetId) {
      setConnectingFrom(null);
      return;
    }
    const already = edges.some(e => e.source === connectingFrom.nodeId && e.target === targetId);
    if (!already) {
      setEdges(prev => [...prev, { id: uid(), source: connectingFrom.nodeId, target: targetId, sourceHandle: connectingFrom.handle }]);
      setHasUnsaved(true);
    }
    setConnectingFrom(null);
  }, [connectingFrom, edges]);

  const removeEdge = useCallback((edgeId: string) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    setHasUnsaved(true);
  }, []);

  const applyTemplate = useCallback((tpl: typeof TEMPLATES[0]) => {
    const ids: string[] = tpl.nodes.map(() => uid());
    const newNodes: FlowNode[] = tpl.nodes.map((n, i) => ({
      id: ids[i], type: n.type, label: NODE_CFG[n.type].label,
      config: n.config ?? {}, x: n.x ?? 100, y: n.y ?? 100,
    }));
    const newEdges: FlowEdge[] = tpl.edges.map(e => ({
      id: uid(), source: ids[parseInt(e.source)], target: ids[parseInt(e.target)],
      sourceHandle: (e as any).sourceHandle,
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
      Alert.alert("Salvo", "Fluxo salvo com sucesso!");
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o fluxo.");
    }
  }, [botId, nodes, edges, saveMutation]);

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  const getConnections = (nodeId: string) => {
    return edges.filter(e => e.source === nodeId).map(e => {
      const target = getNodeById(e.target);
      return { edge: e, target };
    }).filter(c => c.target);
  };

  const paddingTop = Platform.OS === "web" ? insets.top + 60 : insets.top;

  return (
    <View style={[s.root, { paddingTop: paddingTop + 10 }]}>
      <View style={s.topBar}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={C.fg} />
        </Pressable>
        <Text style={s.title}>Construtor de Fluxo</Text>
        <View style={s.topBarRight}>
          {hasUnsaved && <View style={s.unsavedDot} />}
          <Pressable style={s.saveBtn} onPress={handleSave} disabled={saveMutation.isPending}>
            <Feather name="save" size={14} color="#FFF" />
            <Text style={s.saveBtnText}>{saveMutation.isPending ? "..." : "Salvar"}</Text>
          </Pressable>
        </View>
      </View>

      {connectingFrom && (
        <View style={s.connectBanner}>
          <Feather name="link" size={14} color="#F59E0B" />
          <Text style={s.connectText}>Toque em um bloco para conectar</Text>
          <Pressable onPress={() => setConnectingFrom(null)}>
            <Feather name="x" size={16} color="#F59E0B" />
          </Pressable>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {nodes.length === 0 && (
          <View style={s.emptyState}>
            <Feather name="git-branch" size={40} color={C.muted} />
            <Text style={s.emptyTitle}>Nenhum bloco</Text>
            <Text style={s.emptyDesc}>Comece adicionando blocos ou use um template</Text>
          </View>
        )}

        {nodes.map((node, idx) => {
          const cfg = NODE_CFG[node.type];
          const connections = getConnections(node.id);
          const isConnecting = !!connectingFrom && connectingFrom.nodeId !== node.id;

          return (
            <View key={node.id}>
              <Pressable
                style={({ pressed }) => [
                  s.nodeCard,
                  { borderLeftColor: cfg.color },
                  isConnecting && s.nodeConnectable,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => {
                  if (connectingFrom) {
                    handleConnect(node.id);
                  } else {
                    setEditingNode({ ...node, config: { ...node.config } });
                  }
                }}
              >
                <View style={s.nodeTop}>
                  <View style={[s.nodeIcon, { backgroundColor: cfg.dim }]}>
                    <Feather name={cfg.icon as any} size={16} color={cfg.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.nodeType, { color: cfg.color }]}>{cfg.label}</Text>
                    <Text style={s.nodeLabel} numberOfLines={2}>{getNodeLabel(node)}</Text>
                  </View>
                  <View style={s.nodeActions}>
                    <Pressable
                      style={s.nodeActionBtn}
                      onPress={() => setConnectingFrom({ nodeId: node.id })}
                    >
                      <Feather name="link" size={14} color={C.muted} />
                    </Pressable>
                    {node.type === "condition" && (
                      <>
                        <Pressable
                          style={[s.nodeActionBtn, { backgroundColor: "#22C55E15" }]}
                          onPress={() => setConnectingFrom({ nodeId: node.id, handle: "true" })}
                        >
                          <Text style={{ color: "#22C55E", fontSize: 10, fontFamily: "Inter_600SemiBold" }}>SIM</Text>
                        </Pressable>
                        <Pressable
                          style={[s.nodeActionBtn, { backgroundColor: "#EF444415" }]}
                          onPress={() => setConnectingFrom({ nodeId: node.id, handle: "false" })}
                        >
                          <Text style={{ color: "#EF4444", fontSize: 10, fontFamily: "Inter_600SemiBold" }}>NÃO</Text>
                        </Pressable>
                      </>
                    )}
                    <Pressable
                      style={s.nodeActionBtn}
                      onPress={() => Alert.alert("Excluir?", "Remover este bloco?", [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Excluir", style: "destructive", onPress: () => deleteNode(node.id) },
                      ])}
                    >
                      <Feather name="trash-2" size={14} color={C.destructive} />
                    </Pressable>
                  </View>
                </View>

                {connections.length > 0 && (
                  <View style={s.connectionsArea}>
                    {connections.map(({ edge, target }) => {
                      const tCfg = NODE_CFG[target!.type];
                      const handleLabel = edge.sourceHandle === "true" ? " (Sim)" : edge.sourceHandle === "false" ? " (Não)" : "";
                      return (
                        <View key={edge.id} style={s.connectionRow}>
                          <Feather name="arrow-right" size={12} color={C.muted} />
                          <View style={[s.connectionDot, { backgroundColor: tCfg.color }]} />
                          <Text style={s.connectionText} numberOfLines={1}>
                            {tCfg.label}: {getNodeLabel(target!)}{handleLabel}
                          </Text>
                          <Pressable onPress={() => removeEdge(edge.id)}>
                            <Feather name="x-circle" size={14} color={C.muted} />
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <View style={[s.toolbar, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable style={s.toolBtn} onPress={() => setShowTemplates(true)}>
          <Feather name="layout" size={18} color={C.primary} />
          <Text style={[s.toolBtnText, { color: C.primary }]}>Templates</Text>
        </Pressable>
        <Pressable style={s.toolBtnPrimary} onPress={() => setShowTypePicker(true)}>
          <Feather name="plus" size={20} color="#FFF" />
          <Text style={s.toolBtnPrimaryText}>Adicionar bloco</Text>
        </Pressable>
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
  const cfg = NODE_CFG[draft.type];

  function setVal(key: string, val: unknown) {
    setDraft(prev => prev ? { ...prev, config: { ...prev.config, [key]: val } } : null);
  }

  return (
    <Modal visible animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <Pressable style={s.editorOverlay} onPress={onClose} />
        <View style={[s.editorSheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={s.editorHandle} />
          <View style={s.editorHeader}>
            <View style={[s.editorTypeChip, { backgroundColor: cfg.dim }]}>
              <Feather name={cfg.icon as any} size={14} color={cfg.color} />
              <Text style={[s.editorTypeName, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Pressable onPress={() => Alert.alert("Excluir?", "", [{ text: "Cancelar" }, { text: "Excluir", style: "destructive", onPress: () => onDelete(draft.id) }])}>
              <Feather name="trash-2" size={18} color={C.destructive} />
            </Pressable>
            <Pressable onPress={onClose} style={{ marginLeft: 16 }}>
              <Feather name="x" size={20} color={C.muted} />
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={s.editorBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {visibleFields.map(field => (
              <View key={field.key} style={s.formGroup}>
                <Text style={s.formLabel}>{field.label}</Text>
                {field.type === "text" && (
                  <TextInput
                    style={s.formInput}
                    value={String(draft.config[field.key] ?? "")}
                    onChangeText={v => setVal(field.key, v)}
                    placeholder={field.placeholder}
                    placeholderTextColor={C.muted}
                  />
                )}
                {field.type === "textarea" && (
                  <TextInput
                    style={[s.formInput, s.formTextarea]}
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
                      style={[s.formInput, { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderColor: selectOpen === field.key ? cfg.color : C.border }]}
                      onPress={() => setSelectOpen(selectOpen === field.key ? null : field.key)}
                    >
                      <Text style={{ color: draft.config[field.key] ? C.fg : C.muted, flex: 1, fontSize: 14 }} numberOfLines={1}>
                        {field.options?.find(o => o.value === draft.config[field.key])?.label ?? "Selecione…"}
                      </Text>
                      <Feather name={selectOpen === field.key ? "chevron-up" : "chevron-down"} size={16} color={C.muted} />
                    </Pressable>
                    {selectOpen === field.key && (
                      <View style={s.selectDropdown}>
                        <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                          {field.options?.map(opt => (
                            <Pressable
                              key={opt.value}
                              style={[s.selectOption, draft.config[field.key] === opt.value && { backgroundColor: cfg.dim }]}
                              onPress={() => { setVal(field.key, opt.value); setSelectOpen(null); }}
                            >
                              <Text style={{ color: draft.config[field.key] === opt.value ? cfg.color : C.fg, fontSize: 14, fontFamily: "Inter_400Regular" }}>{opt.label}</Text>
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
    command: "Detecta um comando WhatsApp",
    action: "Executa uma ação (figurinha, ban...)",
    condition: "Bifurca o fluxo Sim/Não",
    response: "Envia resposta ao usuário",
    buttons: "Botões interativos",
  };
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose} />
      <View style={[s.modalSheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={s.editorHandle} />
        <Text style={s.modalTitle}>Adicionar bloco</Text>
        {types.map(type => {
          const cfg = NODE_CFG[type];
          return (
            <Pressable key={type} style={s.typeRow} onPress={() => onSelect(type)}>
              <View style={[s.typeIcon, { backgroundColor: cfg.dim }]}>
                <Feather name={cfg.icon as any} size={20} color={cfg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.typeName, { color: cfg.color }]}>{cfg.label}</Text>
                <Text style={s.typeDesc}>{descriptions[type]}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={C.muted} />
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
      <View style={[s.modalSheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={s.editorHandle} />
        <Text style={s.modalTitle}>Templates prontos</Text>
        <Text style={s.modalSubtitle}>Carrega um fluxo pronto (substitui o atual)</Text>
        {TEMPLATES.map((tpl, i) => (
          <Pressable key={i} style={s.typeRow} onPress={() => onSelect(tpl)}>
            <View style={[s.typeIcon, { backgroundColor: C.primary + "20" }]}>
              <Feather name={tpl.icon as any} size={20} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.typeName, { color: C.fg }]}>{tpl.name}</Text>
              <Text style={s.typeDesc}>{tpl.nodes.length} blocos</Text>
            </View>
            <Feather name="chevron-right" size={16} color={C.muted} />
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.secondary, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, fontSize: 17, color: C.fg, fontFamily: "Inter_700Bold" },
  topBarRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  unsavedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F59E0B" },
  saveBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },

  connectBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: "#F59E0B15", borderBottomWidth: 1, borderBottomColor: "#F59E0B30",
  },
  connectText: { flex: 1, fontSize: 13, color: "#F59E0B", fontFamily: "Inter_500Medium" },

  list: { padding: 16, gap: 12 },

  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, color: C.fg, fontFamily: "Inter_700Bold" },
  emptyDesc: { fontSize: 14, color: C.muted, fontFamily: "Inter_400Regular", textAlign: "center" },

  nodeCard: {
    backgroundColor: C.card, borderRadius: 12, padding: 14,
    borderLeftWidth: 4, borderColor: C.border,
  },
  nodeConnectable: { borderColor: "#F59E0B", borderWidth: 1.5, borderLeftWidth: 4 },
  nodeTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  nodeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  nodeType: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  nodeLabel: { fontSize: 13, color: C.fg, fontFamily: "Inter_500Medium", lineHeight: 18, marginTop: 2 },
  nodeActions: { flexDirection: "row", gap: 4 },
  nodeActionBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: C.secondary, alignItems: "center", justifyContent: "center" },

  connectionsArea: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border, gap: 6 },
  connectionRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  connectionDot: { width: 8, height: 8, borderRadius: 4 },
  connectionText: { flex: 1, fontSize: 12, color: C.muted, fontFamily: "Inter_400Regular" },

  toolbar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border,
  },
  toolBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, backgroundColor: C.secondary },
  toolBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  toolBtnPrimary: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 10, backgroundColor: C.primary },
  toolBtnPrimaryText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  editorOverlay: { flex: 1 },
  editorSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: SH * 0.82, minHeight: SH * 0.4,
  },
  editorHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginTop: 12, marginBottom: 8 },
  editorHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  editorTypeChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  editorTypeName: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  editorBody: { padding: 20, gap: 18 },
  formGroup: { gap: 6 },
  formLabel: { fontSize: 12, color: C.muted, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.6 },
  formInput: {
    borderRadius: 10, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.secondary, color: C.fg,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, fontFamily: "Inter_400Regular",
  },
  formTextarea: { height: 100, textAlignVertical: "top" },
  selectDropdown: {
    borderRadius: 10, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.card, marginTop: 4, overflow: "hidden",
  },
  selectOption: { paddingHorizontal: 14, paddingVertical: 12 },
  editorSaveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 20, marginTop: 12, paddingVertical: 14, borderRadius: 12 },
  editorSaveBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  modalSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 8,
  },
  modalTitle: { fontSize: 18, color: C.fg, fontFamily: "Inter_700Bold", marginTop: 12, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: C.muted, fontFamily: "Inter_400Regular", marginBottom: 16 },
  typeRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border,
  },
  typeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  typeName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  typeDesc: { fontSize: 12, color: C.muted, fontFamily: "Inter_400Regular", marginTop: 2 },
});
