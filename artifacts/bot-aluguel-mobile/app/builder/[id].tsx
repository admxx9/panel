import {
  useGetBotCommands,
  useListBots,
  useSaveBotCommands,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type NodeType = "command" | "action" | "condition" | "response" | "buttons";

interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: "true" | "false";
}

const NODE_COLORS: Record<NodeType, { bg: string; border: string; icon: string }> = {
  command: { bg: "#8B3FFF20", border: "#8B3FFF60", icon: "message-square" },
  action: { bg: "#7C3AED20", border: "#7C3AED60", icon: "zap" },
  condition: { bg: "#F59E0B20", border: "#F59E0B60", icon: "git-branch" },
  response: { bg: "#22C55E20", border: "#22C55E60", icon: "message-circle" },
  buttons: { bg: "#06B6D420", border: "#06B6D460", icon: "list" },
};

const NODE_LABELS: Record<NodeType, string> = {
  command: "Comando",
  action: "Ação",
  condition: "Condição",
  response: "Resposta",
  buttons: "Botões",
};

const PREFIX_OPTIONS = [".", "!", "/", "#", "@", "$", "nenhum"];
const ACTION_OPTIONS = [
  { value: "make_sticker", label: "🖼️ Criar Figurinha" },
  { value: "send_image", label: "🖼️ Enviar Imagem" },
  { value: "send_audio", label: "🎵 Enviar Áudio" },
  { value: "send_video", label: "🎥 Enviar Vídeo" },
  { value: "kick_member", label: "🚪 Remover Membro" },
  { value: "ban_member", label: "🔨 Banir Membro" },
  { value: "warn_member", label: "⚠️ Dar Aviso" },
  { value: "mute_member", label: "🔇 Mutar Membro" },
  { value: "delete_message", label: "🗑️ Apagar Mensagem" },
  { value: "promote_member", label: "⬆️ Promover Admin" },
  { value: "demote_member", label: "⬇️ Rebaixar Admin" },
  { value: "mute_group", label: "🔇 Silenciar Grupo" },
  { value: "unmute_group", label: "🔊 Liberar Grupo" },
  { value: "hidetag", label: "📢 Marcar Todos" },
  { value: "show_menu", label: "📋 Menu Principal" },
  { value: "coin_flip", label: "🪙 Cara ou Coroa" },
  { value: "dice_roll", label: "🎲 Rolar Dado" },
  { value: "love_meter", label: "💕 Medidor de Amor" },
  { value: "joke", label: "😂 Piada Aleatória" },
  { value: "antilink", label: "🚫 Anti-Link" },
  { value: "antispam", label: "🛡️ Anti-Spam" },
  { value: "bot_on", label: "✅ Ligar Bot" },
  { value: "bot_off", label: "❌ Desligar Bot" },
  { value: "http_request", label: "🌐 Requisição HTTP" },
  { value: "typing", label: "⌨️ Simular Digitando" },
  { value: "delay", label: "⏳ Aguardar" },
  { value: "broadcast", label: "📢 Broadcast" },
  { value: "set_welcome", label: "👋 Boas-Vindas" },
  { value: "send_poll", label: "📊 Enquete" },
  { value: "translate", label: "🌐 Traduzir" },
];
const CONDITION_OPTIONS = [
  { value: "is_group", label: "👥 É grupo" },
  { value: "is_private", label: "💬 É privado" },
  { value: "is_admin", label: "👑 Remetente é admin" },
  { value: "is_owner", label: "👑 É o dono do bot" },
  { value: "has_image", label: "📷 Tem imagem" },
  { value: "has_media", label: "📎 Tem mídia" },
  { value: "contains_text", label: "🔍 Contém texto" },
  { value: "is_reply", label: "↩️ É resposta" },
  { value: "sender_has_plan", label: "📦 Remetente tem plano" },
  { value: "time_between", label: "🕐 Horário entre X e Y" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function nodeLabel(node: FlowNode): string {
  if (node.type === "command") {
    const p = String(node.config.prefix ?? ".");
    const n = String(node.config.name ?? "");
    return `${p !== "nenhum" ? p : ""}${n}`;
  }
  if (node.type === "action") return String(node.config.action ?? "Ação");
  if (node.type === "condition") return String(node.config.condition ?? "Condição");
  if (node.type === "response") {
    const t = String(node.config.texto ?? node.config.tipoResposta ?? "Resposta");
    return t.length > 40 ? t.slice(0, 40) + "..." : t;
  }
  if (node.type === "buttons") return `Botões (${node.config.tipoBotao ?? "normal"})`;
  return node.label;
}

function buildChain(
  startId: string,
  nodes: FlowNode[],
  edges: FlowEdge[]
): FlowNode[] {
  const chain: FlowNode[] = [];
  const visited = new Set<string>();
  let cur: string | undefined = startId;
  while (cur && !visited.has(cur)) {
    const node = nodes.find((n) => n.id === cur);
    if (!node) break;
    chain.push(node);
    visited.add(cur);
    const edge = edges.find((e) => e.source === cur && !e.sourceHandle);
    cur = edge?.target;
  }
  return chain;
}

function buildConditionBranches(
  condId: string,
  nodes: FlowNode[],
  edges: FlowEdge[]
): { trueBranch: FlowNode[]; falseBranch: FlowNode[] } {
  const trueEdge = edges.find((e) => e.source === condId && e.sourceHandle === "true");
  const falseEdge = edges.find((e) => e.source === condId && e.sourceHandle === "false");
  return {
    trueBranch: trueEdge ? buildChain(trueEdge.target, nodes, edges) : [],
    falseBranch: falseEdge ? buildChain(falseEdge.target, nodes, edges) : [],
  };
}

function getCommandFlows(nodes: FlowNode[], edges: FlowEdge[]) {
  return nodes
    .filter((n) => n.type === "command")
    .map((cmd) => ({ command: cmd, chain: buildChain(cmd.id, nodes, edges).slice(1) }));
}

function FieldEditor({
  fields,
  config,
  onChange,
  colors,
}: {
  fields: { key: string; label: string; type: string; placeholder?: string; options?: { value: string; label: string }[]; showWhen?: (c: Record<string, unknown>) => boolean }[];
  config: Record<string, unknown>;
  onChange: (key: string, val: unknown) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ gap: 16 }}>
      {fields.map((f) => {
        if (f.showWhen && !f.showWhen(config)) return null;
        if (f.type === "checkbox") {
          return (
            <View key={f.key} style={styles.checkRow}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
              <Switch
                value={!!config[f.key]}
                onValueChange={(v) => onChange(f.key, v)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          );
        }
        if (f.type === "select" && f.options) {
          return (
            <View key={f.key}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                <View style={{ flexDirection: "row", gap: 8, paddingBottom: 4 }}>
                  {f.options.map((opt) => {
                    const sel = config[f.key] === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: sel ? colors.primary : colors.secondary,
                            borderColor: sel ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => onChange(f.key, opt.value)}
                      >
                        <Text style={[styles.optionChipText, { color: sel ? "#FFF" : colors.mutedForeground }]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          );
        }
        if (f.type === "textarea") {
          return (
            <View key={f.key}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
              <TextInput
                style={[
                  styles.textarea,
                  { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground },
                ]}
                placeholder={f.placeholder}
                placeholderTextColor={colors.mutedForeground}
                value={String(config[f.key] ?? "")}
                onChangeText={(v) => onChange(f.key, v)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          );
        }
        return (
          <View key={f.key}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
            <TextInput
              style={[
                styles.fieldInput,
                { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground },
              ]}
              placeholder={f.placeholder}
              placeholderTextColor={colors.mutedForeground}
              value={String(config[f.key] ?? "")}
              onChangeText={(v) => onChange(f.key, v)}
            />
          </View>
        );
      })}
    </View>
  );
}

const CONFIG_FIELDS: Record<NodeType, any[]> = {
  command: [
    { key: "prefix", label: "Prefixo", type: "select", options: PREFIX_OPTIONS.map((p) => ({ value: p, label: p })) },
    { key: "name", label: "Nome do comando", type: "text", placeholder: "menu" },
    { key: "caseSensitive", label: "Diferenciar maiúsculas", type: "checkbox" },
    { key: "apenasGrupos", label: "Apenas grupos", type: "checkbox" },
    { key: "apenasPrivado", label: "Apenas privado", type: "checkbox" },
    { key: "requerPlano", label: "Requer plano", type: "checkbox" },
    { key: "requerAdmin", label: "Requer admin", type: "checkbox" },
  ],
  action: [
    { key: "action", label: "Tipo de Ação", type: "select", options: ACTION_OPTIONS },
    { key: "message", label: "Mensagem (use {nome}, {grupo}...)", type: "textarea", placeholder: "Olá {nome}!" },
    { key: "image_url", label: "URL da imagem", type: "text", placeholder: "https://...", showWhen: (c: any) => ["send_image"].includes(c.action) },
    { key: "audio_url", label: "URL do áudio", type: "text", placeholder: "https://...", showWhen: (c: any) => c.action === "send_audio" },
    { key: "http_url", label: "URL da requisição", type: "text", placeholder: "https://...", showWhen: (c: any) => c.action === "http_request" },
    { key: "http_method", label: "Método HTTP", type: "select", options: [{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }], showWhen: (c: any) => c.action === "http_request" },
    { key: "http_body", label: "Body (JSON)", type: "textarea", placeholder: '{"user": "{nome}"}', showWhen: (c: any) => c.action === "http_request" },
    { key: "welcome_text", label: "Mensagem de boas-vindas", type: "textarea", placeholder: "👋 Bem-vindo(a) {nome}!", showWhen: (c: any) => c.action === "set_welcome" },
    { key: "broadcast_text", label: "Mensagem do broadcast", type: "textarea", placeholder: "📢 Aviso para todos os grupos!", showWhen: (c: any) => c.action === "broadcast" },
    { key: "delay_ms", label: "Tempo de espera (ms)", type: "text", placeholder: "1500", showWhen: (c: any) => c.action === "delay" },
    { key: "typing_duration", label: "Duração do digitando (ms)", type: "text", placeholder: "2000", showWhen: (c: any) => c.action === "typing" },
  ],
  condition: [
    { key: "condition", label: "Condição", type: "select", options: CONDITION_OPTIONS },
    { key: "value", label: "Valor / Palavra-chave", type: "text", placeholder: "palavra", showWhen: (c: any) => c.condition === "contains_text" },
    { key: "time_start", label: "Hora início (HH:MM)", type: "text", placeholder: "08:00", showWhen: (c: any) => c.condition === "time_between" },
    { key: "time_end", label: "Hora fim (HH:MM)", type: "text", placeholder: "22:00", showWhen: (c: any) => c.condition === "time_between" },
  ],
  response: [
    { key: "tipoResposta", label: "Tipo de Resposta", type: "select", options: [
      { value: "texto", label: "Texto" },
      { value: "lista", label: "Lista interativa" },
      { value: "imagem", label: "Imagem" },
      { value: "audio", label: "Áudio" },
    ] },
    { key: "texto", label: "Texto ({nome}, {numero}, {moedas}...)", type: "textarea", placeholder: "Olá {nome}! Seu saldo é {moedas} moedas.", showWhen: (c: any) => !c.tipoResposta || c.tipoResposta === "texto" },
    { key: "imagemUrl", label: "URL da imagem", type: "text", placeholder: "https://...", showWhen: (c: any) => c.tipoResposta === "imagem" },
    { key: "legenda", label: "Legenda da imagem", type: "textarea", placeholder: "Texto abaixo da imagem", showWhen: (c: any) => c.tipoResposta === "imagem" },
    { key: "audioUrl", label: "URL do áudio", type: "text", placeholder: "https://...", showWhen: (c: any) => c.tipoResposta === "audio" },
    { key: "tituloLista", label: "Título da lista", type: "text", placeholder: "Menu Principal", showWhen: (c: any) => c.tipoResposta === "lista" },
    { key: "textoLista", label: "Texto da lista", type: "textarea", placeholder: "Escolha uma opção abaixo", showWhen: (c: any) => c.tipoResposta === "lista" },
    { key: "secoes", label: "Seções (título | id | titulo_row | desc, por linha)", type: "textarea", placeholder: "Conta\n.saldo | Saldo | Ver moedas", showWhen: (c: any) => c.tipoResposta === "lista" },
    { key: "temBotoes", label: "Adicionar botões abaixo", type: "checkbox", showWhen: (c: any) => c.tipoResposta === "texto" },
    { key: "botoes", label: "Botões (id | título, por linha, max 3)", type: "textarea", placeholder: ".planos | Ver Planos\n.ajuda | Ajuda", showWhen: (c: any) => !!c.temBotoes },
    { key: "linkPreview", label: "Mostrar prévia de links", type: "checkbox", showWhen: (c: any) => c.tipoResposta === "texto" },
  ],
  buttons: [
    { key: "tipoBotao", label: "Tipo de Botão", type: "select", options: [
      { value: "normal", label: "Botões normais (max 3)" },
      { value: "lista", label: "Lista interativa" },
    ] },
    { key: "botoes", label: "Botões (id | texto, por linha, max 3)", type: "textarea", placeholder: ".sim | Sim\n.nao | Não", showWhen: (c: any) => !c.tipoBotao || c.tipoBotao === "normal" },
    { key: "opcoes", label: "Opções (id | título | desc, por linha)", type: "textarea", placeholder: ".saldo | Saldo | Ver moedas", showWhen: (c: any) => c.tipoBotao === "lista" },
    { key: "textoBotao", label: "Texto do botão da lista", type: "text", placeholder: "VER OPÇÕES", showWhen: (c: any) => c.tipoBotao === "lista" },
  ],
};

const TEMPLATES = [
  {
    id: "menu",
    name: "Menu Principal",
    icon: "menu",
    nodes: [
      { id: uid(), type: "command" as NodeType, label: ".menu", position: { x: 0, y: 0 }, config: { prefix: ".", name: "menu" } },
    ],
    edges: [] as FlowEdge[],
  },
  {
    id: "sticker",
    name: "Figurinha",
    icon: "image",
    nodes: [
      { id: uid(), type: "command" as NodeType, label: ".sticker", position: { x: 0, y: 0 }, config: { prefix: ".", name: "sticker" } },
      { id: uid(), type: "action" as NodeType, label: "Criar figurinha", position: { x: 0, y: 1 }, config: { action: "make_sticker" } },
    ],
    edges: [] as FlowEdge[],
  },
  {
    id: "hidetag",
    name: "Marcar Todos",
    icon: "at-sign",
    nodes: [
      { id: uid(), type: "command" as NodeType, label: ".todos", position: { x: 0, y: 0 }, config: { prefix: ".", name: "todos", requerAdmin: true } },
      { id: uid(), type: "condition" as NodeType, label: "É admin?", position: { x: 0, y: 1 }, config: { condition: "is_admin" } },
      { id: uid(), type: "action" as NodeType, label: "Hidetag", position: { x: 0, y: 2 }, config: { action: "hidetag" } },
      { id: uid(), type: "response" as NodeType, label: "Sem permissão", position: { x: 0, y: 3 }, config: { tipoResposta: "texto", texto: "❌ Apenas admins podem usar este comando." } },
    ],
    edges: [] as FlowEdge[],
  },
];

export default function BuilderScreen() {
  const { id: botId } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const { data: commandData, isLoading } = useGetBotCommands({ botId: botId ?? "" }, { enabled: !!botId });
  const saveMutation = useSaveBotCommands();

  useEffect(() => {
    if (commandData) {
      const raw = commandData as { nodes?: FlowNode[]; edges?: FlowEdge[] };
      setNodes(raw.nodes ?? []);
      setEdges(raw.edges ?? []);
    }
  }, [commandData]);

  const commandFlows = useMemo(() => getCommandFlows(nodes, edges), [nodes, edges]);

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const paddingBottom = Platform.OS === "web" ? 34 : insets.bottom + 20;

  async function handleSave() {
    if (!botId) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await saveMutation.mutateAsync({ botId, data: { nodes, edges } as any });
      setHasUnsaved(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Salvo!", "Comandos do bot salvos com sucesso.");
    } catch {
      Alert.alert("Erro", "Não foi possível salvar os comandos.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function handleNodeChange(nodeId: string, key: string, val: unknown) {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, config: { ...n.config, [key]: val }, label: n.label } : n
      )
    );
    if (editingNode?.id === nodeId) {
      setEditingNode((prev) => prev ? { ...prev, config: { ...prev.config, [key]: val } } : prev);
    }
    setHasUnsaved(true);
  }

  function addNode(type: NodeType, parentId: string | null) {
    const newNode: FlowNode = {
      id: uid(),
      type,
      label: NODE_LABELS[type],
      config: type === "command" ? { prefix: ".", name: "" } : type === "response" ? { tipoResposta: "texto", texto: "" } : {},
      position: { x: 0, y: nodes.length },
    };
    setNodes((prev) => [...prev, newNode]);
    if (parentId) {
      const newEdge: FlowEdge = { id: uid(), source: parentId, target: newNode.id };
      setEdges((prev) => [...prev, newEdge]);
    }
    setHasUnsaved(true);
    setShowAddModal(false);
    setAddParentId(null);
    setEditingNode(newNode);
  }

  function deleteNode(nodeId: string) {
    Alert.alert("Excluir nó", "Deseja remover este bloco e suas conexões?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          setNodes((prev) => prev.filter((n) => n.id !== nodeId));
          setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
          setHasUnsaved(true);
        },
      },
    ]);
  }

  function applyTemplate(t: typeof TEMPLATES[number]) {
    const idMap: Record<string, string> = {};
    const newNodes = t.nodes.map((n) => {
      const newId = uid();
      idMap[n.id] = newId;
      return { ...n, id: newId, position: { x: 0, y: nodes.length + t.nodes.indexOf(n) } };
    });
    const newEdges = t.edges.map((e) => ({
      ...e,
      id: uid(),
      source: idMap[e.source] ?? e.source,
      target: idMap[e.target] ?? e.target,
    }));

    if (newNodes.length >= 2 && t.edges.length === 0) {
      for (let i = 0; i < newNodes.length - 1; i++) {
        newEdges.push({ id: uid(), source: newNodes[i].id, target: newNodes[i + 1].id });
      }
    }

    setNodes((prev) => [...prev, ...newNodes]);
    setEdges((prev) => [...prev, ...newEdges]);
    setHasUnsaved(true);
    setShowTemplates(false);
  }

  function FlowChainView({ chain, commandId }: { chain: FlowNode[]; commandId: string }) {
    return (
      <View style={{ gap: 4 }}>
        {chain.map((node, idx) => {
          const nc = NODE_COLORS[node.type];
          const isCondition = node.type === "condition";
          const { trueBranch, falseBranch } = isCondition
            ? buildConditionBranches(node.id, nodes, edges)
            : { trueBranch: [], falseBranch: [] };

          return (
            <View key={node.id}>
              <View style={styles.chainConnector}>
                <View style={[styles.chainLine, { backgroundColor: colors.border }]} />
                <Feather name="arrow-down" size={12} color={colors.mutedForeground} />
              </View>
              <Pressable
                style={[styles.chainNode, { backgroundColor: nc.bg, borderColor: nc.border }]}
                onPress={() => setEditingNode(node)}
                onLongPress={() => deleteNode(node.id)}
              >
                <Feather name={nc.icon as any} size={16} color={nc.border.slice(0, 7)} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainNodeType, { color: nc.border.slice(0, 7) }]}>
                    {NODE_LABELS[node.type]}
                  </Text>
                  <Text style={[styles.chainNodeLabel, { color: colors.foreground }]} numberOfLines={2}>
                    {nodeLabel(node)}
                  </Text>
                </View>
                <Feather name="edit-2" size={14} color={colors.mutedForeground} />
              </Pressable>

              {isCondition && (trueBranch.length > 0 || falseBranch.length > 0) && (
                <View style={styles.branchContainer}>
                  <View style={styles.branchCol}>
                    <View style={[styles.branchLabel, { backgroundColor: "#22C55E20" }]}>
                      <Text style={{ color: "#22C55E", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>✓ SIM</Text>
                    </View>
                    {trueBranch.map((bn) => (
                      <Pressable
                        key={bn.id}
                        style={[styles.branchNode, { backgroundColor: NODE_COLORS[bn.type].bg, borderColor: NODE_COLORS[bn.type].border }]}
                        onPress={() => setEditingNode(bn)}
                        onLongPress={() => deleteNode(bn.id)}
                      >
                        <Feather name={NODE_COLORS[bn.type].icon as any} size={13} color={NODE_COLORS[bn.type].border.slice(0, 7)} />
                        <Text style={[styles.branchNodeText, { color: colors.foreground }]} numberOfLines={2}>
                          {nodeLabel(bn)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.branchCol}>
                    <View style={[styles.branchLabel, { backgroundColor: "#DC262620" }]}>
                      <Text style={{ color: "#DC2626", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>✗ NÃO</Text>
                    </View>
                    {falseBranch.map((bn) => (
                      <Pressable
                        key={bn.id}
                        style={[styles.branchNode, { backgroundColor: NODE_COLORS[bn.type].bg, borderColor: NODE_COLORS[bn.type].border }]}
                        onPress={() => setEditingNode(bn)}
                        onLongPress={() => deleteNode(bn.id)}
                      >
                        <Feather name={NODE_COLORS[bn.type].icon as any} size={13} color={NODE_COLORS[bn.type].border.slice(0, 7)} />
                        <Text style={[styles.branchNodeText, { color: colors.foreground }]} numberOfLines={2}>
                          {nodeLabel(bn)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}
        <View style={styles.chainConnector}>
          <View style={[styles.chainLine, { backgroundColor: colors.border }]} />
        </View>
        <Pressable
          style={[styles.addNodeBtn, { borderColor: colors.border }]}
          onPress={() => {
            const lastNode = chain.length > 0 ? chain[chain.length - 1] : { id: commandId };
            setAddParentId(lastNode.id);
            setShowAddModal(true);
          }}
        >
          <Feather name="plus" size={16} color={colors.primary} />
          <Text style={[styles.addNodeText, { color: colors.primary }]}>Adicionar bloco</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.navBar, { paddingTop: paddingTop + 8, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>Constructor</Text>
        <Pressable
          style={[styles.saveNavBtn, { backgroundColor: hasUnsaved ? colors.primary : colors.secondary, opacity: saveMutation.isPending ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={[styles.saveNavText, { color: hasUnsaved ? "#FFF" : colors.mutedForeground }]}>
              Salvar
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <>
            <View style={styles.toolbarRow}>
              <Pressable
                style={[styles.toolBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={() => setShowTemplates(true)}
              >
                <Feather name="layout" size={16} color={colors.primary} />
                <Text style={[styles.toolBtnText, { color: colors.foreground }]}>Templates</Text>
              </Pressable>
              <Pressable
                style={[styles.toolBtn, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}
                onPress={() => {
                  setAddParentId(null);
                  setShowAddModal(true);
                }}
              >
                <Feather name="plus" size={16} color={colors.primary} />
                <Text style={[styles.toolBtnText, { color: colors.primary }]}>Novo comando</Text>
              </Pressable>
            </View>

            {commandFlows.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="git-branch" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nenhum comando</Text>
                <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                  Crie seu primeiro fluxo usando um template ou o botão "Novo comando"
                </Text>
              </View>
            ) : (
              commandFlows.map(({ command, chain }) => {
                const nc = NODE_COLORS.command;
                return (
                  <View key={command.id} style={[styles.commandCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Pressable
                      style={[styles.commandHeader, { backgroundColor: nc.bg, borderBottomColor: colors.border }]}
                      onPress={() => setEditingNode(command)}
                      onLongPress={() => deleteNode(command.id)}
                    >
                      <View style={[styles.commandIcon, { backgroundColor: nc.border.slice(0, 7) + "30" }]}>
                        <Feather name="terminal" size={18} color={nc.border.slice(0, 7)} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.commandName, { color: colors.foreground }]}>
                          {nodeLabel(command)}
                        </Text>
                        <Text style={[styles.commandMeta, { color: colors.mutedForeground }]}>
                          {chain.length} bloco{chain.length !== 1 ? "s" : ""} • toque para editar, segure para excluir
                        </Text>
                      </View>
                      <Feather name="edit-2" size={16} color={colors.mutedForeground} />
                    </Pressable>
                    <View style={{ padding: 16 }}>
                      <FlowChainView chain={chain} commandId={command.id} />
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Adicionar bloco</Text>
              <Pressable onPress={() => { setShowAddModal(false); setAddParentId(null); }}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <View style={{ gap: 10 }}>
              {(["command", "action", "condition", "response", "buttons"] as NodeType[]).map((t) => {
                const nc = NODE_COLORS[t];
                return (
                  <Pressable
                    key={t}
                    style={[styles.blockTypeBtn, { backgroundColor: nc.bg, borderColor: nc.border }]}
                    onPress={() => addNode(t, addParentId)}
                  >
                    <View style={[styles.blockTypeIcon, { backgroundColor: nc.border.slice(0, 7) + "30" }]}>
                      <Feather name={nc.icon as any} size={18} color={nc.border.slice(0, 7)} />
                    </View>
                    <View>
                      <Text style={[styles.blockTypeLabel, { color: colors.foreground }]}>{NODE_LABELS[t]}</Text>
                      <Text style={[styles.blockTypeDesc, { color: colors.mutedForeground }]}>
                        {{
                          command: "Detecta mensagem com prefixo",
                          action: "Executa uma ação no WhatsApp",
                          condition: "Verifica uma condição (Se/Senão)",
                          response: "Envia uma resposta ao usuário",
                          buttons: "Adiciona botões interativos",
                        }[t]}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showTemplates} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Templates</Text>
              <Pressable onPress={() => setShowTemplates(false)}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <View style={{ gap: 10 }}>
              {TEMPLATES.map((t) => (
                <Pressable
                  key={t.id}
                  style={[styles.blockTypeBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  onPress={() => applyTemplate(t)}
                >
                  <View style={[styles.blockTypeIcon, { backgroundColor: colors.primary + "20" }]}>
                    <Feather name={t.icon as any} size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.blockTypeLabel, { color: colors.foreground }]}>{t.name}</Text>
                    <Text style={[styles.blockTypeDesc, { color: colors.mutedForeground }]}>
                      {t.nodes.length} bloco{t.nodes.length !== 1 ? "s" : ""} pré-configurados
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!editingNode} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Pressable style={styles.modalOverlay} onPress={() => setEditingNode(null)}>
            <Pressable
              style={[styles.editorSheet, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={(e) => e.stopPropagation()}
            >
              {editingNode && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={[styles.editorIcon, { backgroundColor: NODE_COLORS[editingNode.type].bg }]}>
                        <Feather name={NODE_COLORS[editingNode.type].icon as any} size={18} color={NODE_COLORS[editingNode.type].border.slice(0, 7)} />
                      </View>
                      <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                        Editar {NODE_LABELS[editingNode.type]}
                      </Text>
                    </View>
                    <Pressable onPress={() => setEditingNode(null)}>
                      <Feather name="x" size={20} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                  <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                    <FieldEditor
                      fields={CONFIG_FIELDS[editingNode.type]}
                      config={editingNode.config}
                      onChange={(k, v) => handleNodeChange(editingNode.id, k, v)}
                      colors={colors}
                    />
                  </ScrollView>
                  <Pressable
                    style={[styles.editorDoneBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
                    onPress={() => setEditingNode(null)}
                  >
                    <Text style={styles.editorDoneText}>Confirmar</Text>
                  </Pressable>
                </>
              )}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 17, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center" as const },
  saveNavBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  saveNavText: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  loader: { paddingVertical: 60, alignItems: "center" },
  toolbarRow: { flexDirection: "row", gap: 10 },
  toolBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  toolBtnText: { fontSize: 14, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  emptyState: { borderRadius: 16, borderWidth: 1, padding: 40, alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 17, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" as const },
  commandCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" as const },
  commandHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  commandIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  commandName: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  commandMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  chainConnector: { alignItems: "center", paddingVertical: 2 },
  chainLine: { width: 2, height: 8 },
  chainNode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  chainNodeType: { fontSize: 11, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  chainNodeLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  branchContainer: { flexDirection: "row", gap: 8, marginTop: 4 },
  branchCol: { flex: 1, gap: 4 },
  branchLabel: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignItems: "center" },
  branchNode: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  branchNodeText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  addNodeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed" as const,
  },
  addNodeText: { fontSize: 14, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
    paddingBottom: 32,
    gap: 16,
  },
  editorSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
    paddingBottom: 32,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 18, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  blockTypeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  blockTypeIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  blockTypeLabel: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  blockTypeDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  editorIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  editorDoneBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  editorDoneText: { color: "#FFF", fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6 },
  fieldInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  textarea: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 100,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionChipText: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
