import { useState, useRef, useCallback, startTransition, useEffect } from "react";
import {
  Save, Plus, Trash2, Bot, Loader2, MessageSquare, Zap, GitBranch,
  Reply, Info, Pencil, X, ChevronRight, Settings2, Link2, ChevronDown,
  ZoomIn, ZoomOut, Maximize2,
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
  command: { color: "bg-primary/10", border: "border-primary/40", icon: MessageSquare, label: "Comando", description: "Gatilho" },
  action: { color: "bg-violet-500/10", border: "border-violet-500/40", icon: Zap, label: "Ação", description: "Executa algo" },
  condition: { color: "bg-yellow-500/10", border: "border-yellow-500/40", icon: GitBranch, label: "Condição", description: "Se / Senão" },
  response: { color: "bg-green-500/10", border: "border-green-500/40", icon: Reply, label: "Resposta", description: "Envia texto" },
};

const CONFIG_FIELDS: Record<NodeType, { key: string; label: string; type: "text" | "textarea" | "select"; placeholder?: string; options?: { value: string; label: string }[] }[]> = {
  command: [{ key: "trigger", label: "Gatilho (sem prefixo)", type: "text", placeholder: "ex: sticker" }],
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
    { key: "value", label: "Valor", type: "text", placeholder: "ex: palavra-chave" },
  ],
  response: [{ key: "text", label: "Texto da Resposta", type: "textarea", placeholder: "Digite a mensagem..." }],
};

const BLOCK_TYPES: NodeType[] = ["command", "action", "condition", "response"];

// ─── Port dot ─────────────────────────────────────────────────────────────────
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
  onSelect, onDelete, onEdit, onMove, onStartConnect, canvasRef, transform,
}: {
  node: FlowNode; selected: boolean; isTarget: boolean; isConnecting: boolean;
  onSelect: () => void; onDelete: () => void; onEdit: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onStartConnect: (sourceId: string, e: React.PointerEvent) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  transform: CanvasTransform;
}) {
  const cfg = nodeConfig[node.type];
  const Icon = cfg.icon;
  const dragOffset = useRef<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCount = useRef(0);

  const screenToWorld = (sx: number, sy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (sx - rect.left - transform.x) / transform.scale,
      y: (sy - rect.top - transform.y) / transform.scale,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    cardRef.current?.setPointerCapture(e.pointerId);
    const world = screenToWorld(e.clientX, e.clientY);
    dragOffset.current = { x: world.x - node.position.x, y: world.y - node.position.y };
    onSelect();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOffset.current) return;
    const world = screenToWorld(e.clientX, e.clientY);
    onMove(node.id, Math.max(0, world.x - dragOffset.current.x), Math.max(0, world.y - dragOffset.current.y));
  };

  const handlePointerUp = () => { dragOffset.current = null; };

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

  const displayLabel = node.config?.trigger
    ? String(node.config.trigger)
    : node.config?.action
      ? (CONFIG_FIELDS.action[0].options?.find(o => o.value === node.config.action)?.label ?? node.label)
      : node.config?.text
        ? String(node.config.text).slice(0, 22)
        : node.label;

  return (
    <div
      ref={cardRef}
      className={`absolute rounded-xl border-2 p-3 select-none transition-shadow
        ${cfg.color} ${cfg.border}
        ${selected ? "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-xl" : "shadow-md"}
        ${isTarget ? "ring-2 ring-green-400 ring-offset-1 ring-offset-background" : ""}`}
      style={{ left: node.position.x, top: node.position.y, width: NODE_W, minHeight: NODE_H, cursor: "grab", touchAction: "none" }}
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
      <p className="text-white/40 text-[10px] mt-0.5 truncate">{cfg.description}</p>
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
          </div>
        ))}
        {node.type === "command" && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
            <p className="font-semibold text-white/60 mb-2">💡 Comando no grupo:</p>
            <p className="font-mono text-white/80 bg-background/60 px-2 py-1 rounded">{prefix}{String(localConfig.trigger || "sticker")}</p>
          </div>
        )}
        {node.type === "action" && localConfig.action === "make_sticker" && (
          <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-white/60 mb-1">🖼️ Como usar</p>
            <p>Responda (<span className="text-white/70 font-semibold">reply</span>) a uma imagem/vídeo com o comando. O bot converte em figurinha.</p>
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
  const [connectingEdge, setConnectingEdge] = useState<ConnectingEdge | null>(null);
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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
    setEditingNodeId(null); setShowSettings(false); setSelectedNode(null);
  };

  const handleAddNode = (type: NodeType) => {
    const defaults: Record<NodeType, { label: string; config: Record<string, unknown> }> = {
      command: { label: "novocomando", config: { trigger: "novocomando" } },
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

  const handleMoveNode = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, position: { x, y } } : n));
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
    setTransform((prev) => ({ ...prev, x: panOrigin.current.x + dx, y: panOrigin.current.y + dy }));
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
      setTransform((prev) => { panOrigin.current = { x: prev.x, y: prev.y }; return prev; });
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
    <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: "0 0", position: "absolute", inset: 0 }}>
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
        {selectedBotId && !commandsLoading && nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-6">
              <Plus className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-medium">Nenhum bloco ainda</p>
              <p className="text-muted-foreground/50 text-xs mt-1">Toque em um tipo de bloco para adicionar</p>
            </div>
          </div>
        )}
      </div>

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
            onClick={() => { setShowSettings((v) => !v); setEditingNodeId(null); }}
            disabled={!selectedBotId}
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button onClick={handleSave} disabled={saveCommands.isPending || !selectedBotId} size="sm" className="bg-primary hover:bg-primary/90 text-white">
            {saveCommands.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </div>

      {/* MOBILE layout */}
      <div className="flex flex-col gap-2 md:hidden" style={{ height: "calc(100dvh - 248px)", minHeight: 340 }}>
        {/* Horizontal palette strip */}
        <div className="flex-shrink-0 bg-card border border-white/5 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">Adicionar:</span>
            {BLOCK_TYPES.map((type) => {
              const cfg = nodeConfig[type];
              const Icon = cfg.icon;
              return (
                <button key={type} onClick={() => handleAddNode(type)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-left active:scale-95 flex-shrink-0 ${cfg.color} ${cfg.border}`}>
                  <Icon className="h-3 w-3 text-white/70 flex-shrink-0" />
                  <span className="text-white text-[11px] font-semibold">{cfg.label}</span>
                  <Plus className="h-2.5 w-2.5 text-white/30" />
                </button>
              );
            })}
          </div>
          <p className="text-muted-foreground/50 text-[10px] mt-1.5 flex items-center gap-1">
            <Info className="h-2.5 w-2.5 flex-shrink-0 text-primary" />
            1 dedo: mover · 2 dedos: zoom · <span className="text-primary">bolinha roxa</span>: conectar
          </p>
        </div>
        {canvasArea}
      </div>

      {/* DESKTOP layout */}
      <div className="hidden md:flex gap-3" style={{ height: "calc(100vh - 220px)", minHeight: 400 }}>
        {/* Left palette */}
        <div className="w-44 flex-shrink-0 bg-card border border-white/5 rounded-xl p-3 flex flex-col gap-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Blocos</p>
          <div className="space-y-1.5">
            {BLOCK_TYPES.map((type) => {
              const cfg = nodeConfig[type];
              const Icon = cfg.icon;
              return (
                <button key={type} onClick={() => handleAddNode(type)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg border-2 text-left transition-all hover:scale-[1.02] active:scale-95 ${cfg.color} ${cfg.border}`}>
                  <Icon className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />
                  <span className="text-white text-xs font-semibold">{cfg.label}</span>
                  <Plus className="h-3 w-3 text-white/30 ml-auto" />
                </button>
              );
            })}
          </div>
          <div className="mt-auto pt-3 border-t border-white/5 space-y-2.5">
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
