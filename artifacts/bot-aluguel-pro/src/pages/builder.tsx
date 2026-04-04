import { useState, useRef, useCallback, startTransition } from "react";
import {
  Save, Plus, Trash2, Bot, Loader2, MessageSquare, Zap, GitBranch,
  Reply, Info, Pencil, X, ChevronRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListBots, useGetBotCommands, useSaveBotCommands, getGetBotCommandsQueryKey } from "@workspace/api-client-react";
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

const NODE_W = 176;
const NODE_H = 88;
const PORT_Y = NODE_H / 2;

const nodeConfig: Record<NodeType, { color: string; border: string; icon: React.ElementType; label: string; description: string }> = {
  command: { color: "bg-primary/10", border: "border-primary/40", icon: MessageSquare, label: "Comando", description: "Gatilho (ex: sticker)" },
  action: { color: "bg-violet-500/10", border: "border-violet-500/40", icon: Zap, label: "Ação", description: "Ação executada" },
  condition: { color: "bg-yellow-500/10", border: "border-yellow-500/40", icon: GitBranch, label: "Condição", description: "Se / Senão" },
  response: { color: "bg-green-500/10", border: "border-green-500/40", icon: Reply, label: "Resposta", description: "Mensagem enviada" },
};

const CONFIG_FIELDS: Record<NodeType, { key: string; label: string; type: "text" | "textarea" | "select"; placeholder?: string; options?: { value: string; label: string }[] }[]> = {
  command: [
    { key: "trigger", label: "Gatilho (sem prefixo)", type: "text", placeholder: "ex: sticker" },
  ],
  action: [
    {
      key: "action", label: "Tipo de Ação", type: "select", options: [
        { value: "make_sticker", label: "🖼️ Criar Figurinha" },
        { value: "send_text", label: "💬 Enviar Texto" },
        { value: "kick_member", label: "🚪 Remover Membro" },
        { value: "ban_member", label: "🔨 Banir Membro" },
      ],
    },
    { key: "message", label: "Mensagem adicional (opcional)", type: "text", placeholder: "ex: Figurinha criada!" },
  ],
  condition: [
    {
      key: "condition", label: "Condição", type: "select", options: [
        { value: "has_image", label: "📷 Tem imagem/vídeo" },
        { value: "is_admin", label: "👑 Usuário é admin" },
        { value: "contains_text", label: "🔍 Mensagem contém..." },
      ],
    },
    { key: "value", label: "Valor da condição", type: "text", placeholder: "ex: palavra-chave" },
  ],
  response: [
    { key: "text", label: "Texto da Resposta", type: "textarea", placeholder: "Digite a mensagem que o bot vai enviar..." },
  ],
};

const DEFAULT_FLOW: { nodes: FlowNode[]; edges: FlowEdge[] } = {
  nodes: [
    { id: "n1", type: "command", label: "sticker", config: { trigger: "sticker" }, position: { x: 60, y: 120 } },
    { id: "n2", type: "action", label: "Criar Figurinha", config: { action: "make_sticker" }, position: { x: 300, y: 120 } },
    { id: "n3", type: "response", label: "Aqui está sua figurinha!", config: { text: "Aqui está sua figurinha! 🎉" }, position: { x: 540, y: 120 } },
  ],
  edges: [
    { id: "e1", source: "n1", target: "n2" },
    { id: "e2", source: "n2", target: "n3" },
  ],
};

function Port({ side, onPointerDown, isTarget }: {
  side: "left" | "right";
  onPointerDown?: (e: React.PointerEvent) => void;
  isTarget?: boolean;
}) {
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all z-10
        ${side === "left" ? "-left-1.5" : "-right-1.5"}
        ${isTarget
          ? "bg-green-400 border-green-300 scale-125"
          : side === "right"
            ? "bg-primary/60 border-primary hover:bg-primary hover:scale-125 cursor-crosshair"
            : "bg-white/20 border-white/30"
        }`}
      onPointerDown={onPointerDown}
      style={{ touchAction: "none" }}
    />
  );
}

function NodeCard({
  node,
  selected,
  isTarget,
  onSelect,
  onDelete,
  onEdit,
  onMove,
  onStartConnect,
  canvasRef,
}: {
  node: FlowNode;
  selected: boolean;
  isTarget: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onStartConnect: (sourceId: string, e: React.PointerEvent) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}) {
  const cfg = nodeConfig[node.type];
  const Icon = cfg.icon;
  const dragOffset = useRef<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    cardRef.current?.setPointerCapture(e.pointerId);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left - node.position.x,
      y: e.clientY - rect.top - node.position.y,
    };
    onSelect();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOffset.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragOffset.current.x);
    const y = Math.max(0, e.clientY - rect.top - dragOffset.current.y);
    onMove(node.id, x, y);
  };

  const handlePointerUp = () => {
    dragOffset.current = null;
  };

  const displayLabel = node.config?.trigger
    ? String(node.config.trigger)
    : node.config?.action
      ? (CONFIG_FIELDS.action[0].options?.find(o => o.value === node.config.action)?.label ?? node.label)
      : node.config?.text
        ? String(node.config.text).slice(0, 24)
        : node.label;

  return (
    <div
      ref={cardRef}
      className={`absolute rounded-xl border-2 p-3 select-none transition-shadow
        ${cfg.color} ${cfg.border}
        ${selected ? "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-xl" : ""}
        ${isTarget ? "ring-2 ring-green-400 ring-offset-1 ring-offset-background" : ""}
      `}
      style={{ left: node.position.x, top: node.position.y, width: NODE_W, minHeight: NODE_H, cursor: "grab", touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      <Port side="left" />
      <Port
        side="right"
        isTarget={false}
        onPointerDown={(e) => {
          e.stopPropagation();
          onStartConnect(node.id, e);
        }}
      />

      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{cfg.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-white/30 hover:text-primary transition-colors p-0.5"
            title="Editar bloco"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-white/30 hover:text-red-400 transition-colors p-0.5"
            title="Deletar bloco"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <p className="text-white text-sm font-semibold truncate leading-tight">{displayLabel}</p>
      <p className="text-white/40 text-xs mt-0.5 truncate">{cfg.description}</p>
    </div>
  );
}

function EditPanel({ node, onUpdate, onClose }: {
  node: FlowNode;
  onUpdate: (id: string, label: string, config: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const cfg = nodeConfig[node.type];
  const Icon = cfg.icon;
  const fields = CONFIG_FIELDS[node.type];
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>({ ...node.config });
  const [localLabel, setLocalLabel] = useState(node.label);

  const handleSave = () => {
    const displayKey = fields[0]?.key;
    const autoLabel = displayKey && localConfig[displayKey]
      ? String(localConfig[displayKey])
      : localLabel;
    onUpdate(node.id, autoLabel || localLabel, localConfig);
    onClose();
  };

  return (
    <div className="w-72 flex-shrink-0 bg-card border border-white/5 rounded-xl flex flex-col overflow-hidden">
      <div className={`flex items-center justify-between p-4 border-b border-white/5 ${cfg.color}`}>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-white/70" />
          <span className="text-white font-semibold text-sm">Editar — {cfg.label}</span>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <Label className="text-white/70 text-xs mb-1.5 block">{field.label}</Label>
            {field.type === "select" && field.options ? (
              <Select
                value={String(localConfig[field.key] ?? "")}
                onValueChange={(v) => setLocalConfig((c) => ({ ...c, [field.key]: v }))}
              >
                <SelectTrigger className="bg-background border-white/10 text-white h-9 text-sm">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  {field.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-white/5 text-sm">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "textarea" ? (
              <Textarea
                value={String(localConfig[field.key] ?? "")}
                onChange={(e) => setLocalConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="bg-background border-white/10 text-white text-sm min-h-[80px] resize-none"
              />
            ) : (
              <Input
                value={String(localConfig[field.key] ?? "")}
                onChange={(e) => setLocalConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="bg-background border-white/10 text-white h-9 text-sm"
              />
            )}
          </div>
        ))}

        {node.type === "command" && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-white/60 mb-1">💡 Como funciona</p>
            <p>O gatilho <span className="text-white/70 font-mono">{String(localConfig.trigger || "sticker")}</span> é acionado quando alguém envia o prefixo + gatilho no grupo.</p>
            <p className="mt-1 text-white/50">Ex: <span className="font-mono text-white/70">.{String(localConfig.trigger || "sticker")}</span></p>
          </div>
        )}

        {node.type === "action" && localConfig.action === "make_sticker" && (
          <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-white/60 mb-1">🖼️ Figurinha</p>
            <p>O usuário precisa responder (<span className="text-white/70">reply</span>) a uma imagem ou vídeo com o comando. O bot converte para figurinha automaticamente.</p>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-white/5">
        <Button onClick={handleSave} size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
          <ChevronRight className="h-3.5 w-3.5 mr-1.5" />
          Salvar Bloco
        </Button>
      </div>
    </div>
  );
}

const BLOCK_TYPES: NodeType[] = ["command", "action", "condition", "response"];

export default function BuilderPage() {
  const { data: bots } = useListBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  useGetBotCommands(selectedBotId, { query: { enabled: !!selectedBotId } });
  const saveCommands = useSaveBotCommands();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [nodes, setNodes] = useState<FlowNode[]>(DEFAULT_FLOW.nodes);
  const [edges, setEdges] = useState<FlowEdge[]>(DEFAULT_FLOW.edges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [connectingEdge, setConnectingEdge] = useState<ConnectingEdge | null>(null);
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleBotSelect = (botId: string) => {
    startTransition(() => setSelectedBotId(botId));
  };

  const handleAddNode = (type: NodeType) => {
    const defaults: Record<NodeType, { label: string; config: Record<string, unknown> }> = {
      command: { label: "novocomando", config: { trigger: "novocomando" } },
      action: { label: "Criar Figurinha", config: { action: "make_sticker" } },
      condition: { label: "Tem imagem?", config: { condition: "has_image" } },
      response: { label: "Mensagem de resposta", config: { text: "Mensagem de resposta" } },
    };
    const d = defaults[type];
    const offset = (nodes.length % 5) * 24;
    setNodes((prev) => [
      ...prev,
      { id: `n${Date.now()}`, type, label: d.label, config: d.config, position: { x: 60 + offset, y: 60 + offset } },
    ]);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
    if (editingNodeId === nodeId) setEditingNodeId(null);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  const handleUpdateNode = (id: string, label: string, config: Record<string, unknown>) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, label, config } : n));
  };

  const handleMoveNode = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, position: { x, y } } : n));
  }, []);

  const getCanvasCoords = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const findNodeAtPoint = (x: number, y: number, excludeId?: string): string | null => {
    for (const node of nodes) {
      if (node.id === excludeId) continue;
      if (x >= node.position.x && x <= node.position.x + NODE_W && y >= node.position.y && y <= node.position.y + NODE_H) {
        return node.id;
      }
    }
    return null;
  };

  const handleStartConnect = (sourceId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const coords = getCanvasCoords(e);
    setConnectingEdge({ sourceId, mouseX: coords.x, mouseY: coords.y });
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!connectingEdge) return;
    const coords = getCanvasCoords(e);
    setConnectingEdge((prev) => prev ? { ...prev, mouseX: coords.x, mouseY: coords.y } : null);
    const target = findNodeAtPoint(coords.x, coords.y, connectingEdge.sourceId);
    setHoverTargetId(target);
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (!connectingEdge) return;
    const coords = getCanvasCoords(e);
    const targetId = findNodeAtPoint(coords.x, coords.y, connectingEdge.sourceId);
    if (targetId) {
      const alreadyExists = edges.some(
        (ed) => ed.source === connectingEdge.sourceId && ed.target === targetId,
      );
      if (!alreadyExists) {
        setEdges((prev) => [
          ...prev,
          { id: `e${Date.now()}`, source: connectingEdge.sourceId, target: targetId },
        ]);
      }
    }
    setConnectingEdge(null);
    setHoverTargetId(null);
  };

  const handleSave = async () => {
    if (!selectedBotId) {
      toast({ title: "Selecione um bot", description: "Escolha um bot antes de salvar.", variant: "destructive" });
      return;
    }
    try {
      await saveCommands.mutateAsync({ botId: selectedBotId, data: { botId: selectedBotId, nodes, edges } });
      queryClient.invalidateQueries({ queryKey: getGetBotCommandsQueryKey(selectedBotId) });
      toast({ title: "Fluxo salvo!", description: "Configuração do bot atualizada." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar o fluxo.", variant: "destructive" });
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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Construtor Visual</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Monte o fluxo do bot — ligue os blocos pelas bolinhas</p>
        </div>
        <div className="flex items-center gap-3">
          <Select onValueChange={handleBotSelect} value={selectedBotId}>
            <SelectTrigger className="w-48 bg-background border-white/10 text-white">
              <SelectValue placeholder="Selecionar bot" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10">
              {bots?.map((bot) => (
                <SelectItem key={bot.id} value={bot.id} className="text-white hover:bg-white/5">{bot.name}</SelectItem>
              ))}
              {(!bots || bots.length === 0) && (
                <SelectItem value="none" disabled className="text-muted-foreground">Crie um bot primeiro</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={saveCommands.isPending} className="bg-primary hover:bg-primary/90 text-white">
            {saveCommands.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </div>

      <div className="flex gap-3 h-[calc(100vh-228px)] min-h-[400px]">
        {/* Left — block palette */}
        <div className="w-44 flex-shrink-0 bg-card border border-white/5 rounded-xl p-3 flex flex-col gap-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Blocos</p>
          <div className="space-y-1.5">
            {BLOCK_TYPES.map((type) => {
              const cfg = nodeConfig[type];
              const Icon = cfg.icon;
              return (
                <button
                  key={type}
                  onClick={() => handleAddNode(type)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg border-2 text-left transition-all hover:scale-[1.02] active:scale-95 ${cfg.color} ${cfg.border}`}
                >
                  <Icon className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />
                  <span className="text-white text-xs font-semibold">{cfg.label}</span>
                  <Plus className="h-3 w-3 text-white/30 ml-auto" />
                </button>
              );
            })}
          </div>
          <div className="mt-auto pt-3 border-t border-white/5">
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">Arraste a <span className="text-white/60">bolinha direita</span> de um bloco até outro para conectar</p>
            </div>
          </div>
        </div>

        {/* Center — canvas */}
        <div className="flex-1 bg-card border border-white/5 rounded-xl overflow-hidden relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          <div
            ref={canvasRef}
            className="absolute inset-0"
            style={{ cursor: connectingEdge ? "crosshair" : "default" }}
            onClick={() => { setSelectedNode(null); }}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
          >
            {/* SVG for edges + preview line */}
            <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible", pointerEvents: "none" }}>
              {/* Existing edges */}
              {edges.map((edge) => {
                const src = nodes.find((n) => n.id === edge.source);
                const tgt = nodes.find((n) => n.id === edge.target);
                if (!src || !tgt) return null;
                const p1 = getNodePortPos(src, "right");
                const p2 = getNodePortPos(tgt, "left");
                return (
                  <g key={edge.id} style={{ pointerEvents: "stroke" }}>
                    {/* Invisible wider path for easier clicking */}
                    <path
                      d={buildCurve(p1.x, p1.y, p2.x, p2.y)}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="12"
                      style={{ pointerEvents: "stroke", cursor: "pointer" }}
                      onClick={(e) => { e.stopPropagation(); handleDeleteEdge(edge.id); }}
                    />
                    <path
                      d={buildCurve(p1.x, p1.y, p2.x, p2.y)}
                      fill="none"
                      stroke="rgba(139, 92, 246, 0.5)"
                      strokeWidth="2"
                      strokeDasharray="none"
                      markerEnd="url(#arrow)"
                      style={{ pointerEvents: "none" }}
                    />
                  </g>
                );
              })}
              {/* Preview edge while connecting */}
              {connectingEdge && (() => {
                const src = nodes.find((n) => n.id === connectingEdge.sourceId);
                if (!src) return null;
                const p1 = getNodePortPos(src, "right");
                return (
                  <path
                    d={buildCurve(p1.x, p1.y, connectingEdge.mouseX, connectingEdge.mouseY)}
                    fill="none"
                    stroke="rgba(139, 92, 246, 0.8)"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    style={{ pointerEvents: "none" }}
                  />
                );
              })()}
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="rgba(139, 92, 246, 0.6)" />
                </marker>
              </defs>
            </svg>

            {nodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                selected={selectedNode === node.id}
                isTarget={hoverTargetId === node.id}
                onSelect={() => setSelectedNode(node.id)}
                onDelete={() => handleDeleteNode(node.id)}
                onEdit={() => setEditingNodeId(editingNodeId === node.id ? null : node.id)}
                onMove={handleMoveNode}
                onStartConnect={handleStartConnect}
                canvasRef={canvasRef}
              />
            ))}

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <Bot className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Adicione blocos do painel esquerdo</p>
                  <p className="text-muted-foreground/50 text-xs mt-1">Arraste a bolinha direita para conectar blocos</p>
                </div>
              </div>
            )}
          </div>

          {/* Edge delete hint */}
          <div className="absolute bottom-3 left-3 text-xs text-muted-foreground/50 pointer-events-none">
            Clique em uma conexão para removê-la
          </div>
        </div>

        {/* Right — edit panel */}
        {editingNode && (
          <EditPanel
            node={editingNode}
            onUpdate={handleUpdateNode}
            onClose={() => setEditingNodeId(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
