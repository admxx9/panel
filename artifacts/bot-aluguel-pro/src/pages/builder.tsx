import { useState, useRef, useCallback, startTransition, useEffect } from "react";
import {
  Save, Plus, Trash2, Bot, Loader2, MessageSquare, Zap, GitBranch,
  Reply, Info, Pencil, X, ChevronRight, Settings2, Link2, ChevronDown,
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

const NODE_W = 184;
const NODE_H = 92;
const PORT_Y = NODE_H / 2;

const nodeConfig: Record<NodeType, { color: string; border: string; icon: React.ElementType; label: string; description: string }> = {
  command: { color: "bg-primary/10", border: "border-primary/40", icon: MessageSquare, label: "Comando", description: "Gatilho" },
  action: { color: "bg-violet-500/10", border: "border-violet-500/40", icon: Zap, label: "Ação", description: "Executa algo" },
  condition: { color: "bg-yellow-500/10", border: "border-yellow-500/40", icon: GitBranch, label: "Condição", description: "Se / Senão" },
  response: { color: "bg-green-500/10", border: "border-green-500/40", icon: Reply, label: "Resposta", description: "Envia texto" },
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

const BLOCK_TYPES: NodeType[] = ["command", "action", "condition", "response"];

// ─── Port dot ────────────────────────────────────────────────────────────────
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
          ${isTarget
            ? "bg-green-400 border-green-300 scale-125 shadow-lg shadow-green-400/40"
            : isRight
              ? "bg-primary border-primary/80 hover:scale-125 hover:shadow-lg hover:shadow-primary/40 cursor-crosshair"
              : "bg-background border-white/20 cursor-default"
          }
          ${isConnecting && isRight ? "scale-125 shadow-primary/60 shadow-lg" : ""}
        `}
        onPointerDown={onPointerDown}
        style={{ touchAction: "none" }}
      >
        {isRight && <Link2 className="w-2.5 h-2.5 text-white/80" />}
      </div>
    </div>
  );
}

// ─── Node card ───────────────────────────────────────────────────────────────
function NodeCard({
  node, selected, isTarget, isConnecting,
  onSelect, onDelete, onEdit, onMove, onStartConnect, canvasRef,
}: {
  node: FlowNode; selected: boolean; isTarget: boolean; isConnecting: boolean;
  onSelect: () => void; onDelete: () => void; onEdit: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onStartConnect: (sourceId: string, e: React.PointerEvent) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}) {
  const cfg = nodeConfig[node.type];
  const Icon = cfg.icon;
  const dragOffset = useRef<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCount = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    cardRef.current?.setPointerCapture(e.pointerId);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left - node.position.x, y: e.clientY - rect.top - node.position.y };
    onSelect();
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOffset.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    onMove(node.id, Math.max(0, e.clientX - rect.left - dragOffset.current.x), Math.max(0, e.clientY - rect.top - dragOffset.current.y));
  };
  const handlePointerUp = () => { dragOffset.current = null; };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clickCount.current += 1;
    if (clickCount.current === 1) {
      clickTimer.current = setTimeout(() => { clickCount.current = 0; onSelect(); }, 250);
    } else if (clickCount.current === 2) {
      if (clickTimer.current) clearTimeout(clickTimer.current);
      clickCount.current = 0;
      onEdit();
    }
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
        ${selected ? "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-xl" : "shadow-md"}
        ${isTarget ? "ring-2 ring-green-400 ring-offset-1 ring-offset-background scale-[1.03]" : ""}
      `}
      style={{ left: node.position.x, top: node.position.y, width: NODE_W, minHeight: NODE_H, cursor: "grab", touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
    >
      <Port side="left" isTarget={isTarget} />
      <Port side="right" isConnecting={isConnecting} onPointerDown={(e) => { e.stopPropagation(); onStartConnect(node.id, e); }} />

      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{cfg.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-white/60 hover:text-primary transition-colors p-1 rounded hover:bg-white/10" title="Editar bloco">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-white/40 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10" title="Deletar bloco">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="text-white text-sm font-semibold truncate leading-tight">{displayLabel}</p>
      <p className="text-white/40 text-xs mt-0.5 truncate">{cfg.description}</p>
    </div>
  );
}

// ─── Edit form content (shared between desktop panel and mobile sheet) ────────
function EditFormContent({ node, onUpdate, onClose, prefix }: {
  node: FlowNode;
  onUpdate: (id: string, label: string, config: Record<string, unknown>) => void;
  onClose: () => void;
  prefix: string;
}) {
  const fields = CONFIG_FIELDS[node.type];
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>({ ...node.config });
  const [localLabel] = useState(node.label);

  const handleSave = () => {
    const displayKey = fields[0]?.key;
    const autoLabel = displayKey && localConfig[displayKey] ? String(localConfig[displayKey]) : localLabel;
    onUpdate(node.id, autoLabel || localLabel, localConfig);
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <Label className="text-white/70 text-xs mb-1.5 block">{field.label}</Label>
            {field.type === "select" && field.options ? (
              <Select value={String(localConfig[field.key] ?? "")} onValueChange={(v) => setLocalConfig((c) => ({ ...c, [field.key]: v }))}>
                <SelectTrigger className="bg-background border-white/10 text-white h-9 text-sm"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  {field.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-white/5 text-sm">{opt.label}</SelectItem>
                  ))}
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
          </div>
        ))}

        {node.type === "command" && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-white/60 mb-2">💡 Comando no grupo:</p>
            <p className="font-mono text-white/80 text-sm bg-background/60 px-2 py-1 rounded">
              {prefix}{String(localConfig.trigger || "sticker")}
            </p>
          </div>
        )}
        {node.type === "action" && localConfig.action === "make_sticker" && (
          <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-white/60 mb-1">🖼️ Como usar</p>
            <p>Responda (<span className="text-white/70 font-semibold">reply</span>) a uma imagem ou vídeo com o comando. O bot converte em figurinha.</p>
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

// ─── Settings form content ────────────────────────────────────────────────────
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
      setName(bot.name ?? "");
      setPrefix(bot.prefix ?? ".");
      setOwnerPhone(bot.ownerPhone ?? "");
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
          <p className="text-muted-foreground text-xs mt-1">Exemplo: <span className="font-mono text-white/60">{prefix || "."}sticker</span></p>
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

// ─── Main page ───────────────────────────────────────────────────────────────
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
  const [connectingEdge, setConnectingEdge] = useState<ConnectingEdge | null>(null);
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentPrefix = botData?.prefix ?? ".";

  // ── Load saved commands when bot changes ──────────────────────────────────
  useEffect(() => {
    if (!selectedBotId) {
      setNodes([]);
      setEdges([]);
      return;
    }
    if (commandsData) {
      setNodes((commandsData.nodes as FlowNode[]) ?? []);
      setEdges((commandsData.edges as FlowEdge[]) ?? []);
    }
  }, [selectedBotId, commandsData]);

  const handleBotSelect = (botId: string) => {
    startTransition(() => setSelectedBotId(botId));
    setEditingNodeId(null);
    setShowSettings(false);
    setSelectedNode(null);
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

  const handleDeleteEdge = (edgeId: string) => setEdges((prev) => prev.filter((e) => e.id !== edgeId));

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
      if (x >= node.position.x && x <= node.position.x + NODE_W && y >= node.position.y && y <= node.position.y + NODE_H) return node.id;
    }
    return null;
  };

  const handleStartConnect = (sourceId: string, e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
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
    setHoverTargetId(findNodeAtPoint(coords.x, coords.y, connectingEdge.sourceId));
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (!connectingEdge) return;
    const coords = getCanvasCoords(e);
    const targetId = findNodeAtPoint(coords.x, coords.y, connectingEdge.sourceId);
    if (targetId && !edges.some((ed) => ed.source === connectingEdge.sourceId && ed.target === targetId)) {
      setEdges((prev) => [...prev, { id: `e${Date.now()}`, source: connectingEdge.sourceId, target: targetId }]);
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
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
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

  // Canvas area JSX (shared)
  const canvasArea = (
    <div className="relative flex-1 min-h-0 bg-card border border-white/5 rounded-xl overflow-hidden">
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Canvas interaction area */}
      <div
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor: connectingEdge ? "crosshair" : "default" }}
        onClick={() => setSelectedNode(null)}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
      >
        {/* SVG edges */}
        <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible", pointerEvents: "none" }}>
          {edges.map((edge) => {
            const src = nodes.find((n) => n.id === edge.source);
            const tgt = nodes.find((n) => n.id === edge.target);
            if (!src || !tgt) return null;
            const p1 = getNodePortPos(src, "right");
            const p2 = getNodePortPos(tgt, "left");
            return (
              <g key={edge.id} style={{ pointerEvents: "stroke" }}>
                <path d={buildCurve(p1.x, p1.y, p2.x, p2.y)} fill="none" stroke="transparent" strokeWidth="14"
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

        {/* Nodes */}
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
          />
        ))}

        {/* Empty states */}
        {!selectedBotId && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-6">
              <Bot className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
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
        {selectedBotId && !commandsLoading && nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-6">
              <Plus className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-medium">Nenhum bloco ainda</p>
              <p className="text-muted-foreground/50 text-xs mt-1">Adicione blocos pelo painel lateral</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom hints */}
      <div className="absolute bottom-3 left-3 text-xs text-muted-foreground/40 pointer-events-none">
        Clique em uma conexão para removê-la
      </div>
      {connectingEdge && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-primary/90 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none shadow-lg">
          Arraste até outro bloco para conectar
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {/* ── Top bar ── */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Construtor Visual</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 hidden sm:block">
            Arraste a <span className="text-primary font-semibold">bolinha direita</span> de um bloco até outro para conectar
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select onValueChange={handleBotSelect} value={selectedBotId}>
            <SelectTrigger className="w-44 bg-background border-white/10 text-white text-sm">
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
          <Button variant="outline" size="sm"
            onClick={() => { setShowSettings((v) => !v); setEditingNodeId(null); }}
            disabled={!selectedBotId}
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
            title="Configurações do bot">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button onClick={handleSave} disabled={saveCommands.isPending || !selectedBotId} size="sm" className="bg-primary hover:bg-primary/90 text-white">
            {saveCommands.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="flex flex-col gap-3 md:hidden" style={{ height: "calc(100dvh - 260px)", minHeight: 380 }}>
        {/* Horizontal block palette strip */}
        <div className="flex-shrink-0 bg-card border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-muted-foreground whitespace-nowrap font-medium flex-shrink-0">Adicionar:</span>
            {BLOCK_TYPES.map((type) => {
              const cfg = nodeConfig[type];
              const Icon = cfg.icon;
              return (
                <button
                  key={type}
                  onClick={() => handleAddNode(type)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-left transition-all active:scale-95 flex-shrink-0 ${cfg.color} ${cfg.border}`}
                >
                  <Icon className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />
                  <span className="text-white text-xs font-semibold">{cfg.label}</span>
                  <Plus className="h-3 w-3 text-white/30" />
                </button>
              );
            })}
          </div>
          <p className="text-muted-foreground/50 text-[10px] mt-2 flex items-center gap-1">
            <Info className="h-3 w-3 flex-shrink-0 text-primary" />
            Arraste a <span className="text-primary">bolinha roxa</span> de um bloco para conectar
          </p>
        </div>

        {/* Canvas */}
        {canvasArea}
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden md:flex gap-3" style={{ height: "calc(100vh - 228px)", minHeight: 400 }}>
        {/* Left palette */}
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
          <div className="mt-auto pt-3 border-t border-white/5 space-y-3">
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <Info className="h-3 w-3 flex-shrink-0 mt-0.5 text-primary" />
              <p className="text-xs leading-relaxed">Arraste a <span className="text-primary font-semibold">bolinha direita</span> para conectar blocos</p>
            </div>
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <Pencil className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">Lápis ou <span className="text-white/60">duplo clique</span> para editar</p>
            </div>
          </div>
        </div>

        {/* Canvas */}
        {canvasArea}

        {/* Right panel — edit or settings */}
        {(editingNode || showSettings) && (
          <div className="w-72 flex-shrink-0 bg-card border border-white/5 rounded-xl flex flex-col overflow-hidden">
            <div className={`flex items-center justify-between p-4 border-b border-white/5 ${editingNode ? nodeConfig[editingNode.type].color : "bg-violet-500/10"}`}>
              <div className="flex items-center gap-2">
                {editingNode
                  ? (() => { const Icon = nodeConfig[editingNode.type].icon; return <Icon className="h-4 w-4 text-white/70" />; })()
                  : <Settings2 className="h-4 w-4 text-violet-400" />}
                <span className="text-white font-semibold text-sm">
                  {editingNode ? `Editar — ${nodeConfig[editingNode.type].label}` : "Configurações do Bot"}
                </span>
              </div>
              <button onClick={() => { setEditingNodeId(null); setShowSettings(false); }} className="text-white/40 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            {editingNode ? (
              <EditFormContent node={editingNode} onUpdate={handleUpdateNode} onClose={() => setEditingNodeId(null)} prefix={currentPrefix} />
            ) : selectedBotId ? (
              <SettingsFormContent botId={selectedBotId} onClose={() => setShowSettings(false)} />
            ) : null}
          </div>
        )}
      </div>

      {/* ── MOBILE: edit sheet ── */}
      <Sheet open={!!editingNode && true} onOpenChange={(open) => { if (!open) setEditingNodeId(null); }}>
        <SheetContent side="bottom" className="bg-card border-t border-white/10 rounded-t-2xl p-0 h-auto max-h-[85dvh] flex flex-col md:hidden">
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

      {/* ── MOBILE: settings sheet ── */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="bottom" className="bg-card border-t border-white/10 rounded-t-2xl p-0 h-auto max-h-[85dvh] flex flex-col md:hidden">
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
    </DashboardLayout>
  );
}
