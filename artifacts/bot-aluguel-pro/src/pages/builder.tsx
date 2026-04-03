import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Bot, Loader2, MessageSquare, Zap, GitBranch, Reply, Info } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListBots, useGetBotCommands, useSaveBotCommands, getGetBotCommandsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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

const nodeConfig: Record<NodeType, { color: string; icon: React.ElementType; description: string }> = {
  command: { color: "border-primary/30 bg-primary/10", icon: MessageSquare, description: "Gatilho de comando (ex: .sticker)" },
  action: { color: "border-accent/30 bg-accent/10", icon: Zap, description: "Acao executada (ex: criar figurinha)" },
  condition: { color: "border-yellow-500/30 bg-yellow-500/10", icon: GitBranch, description: "Condicao logica (se/senao)" },
  response: { color: "border-green-500/30 bg-green-500/10", icon: Reply, description: "Resposta enviada ao usuario" },
};

const BLOCK_TYPES: { type: NodeType; label: string }[] = [
  { type: "command", label: "Comando" },
  { type: "action", label: "Acao" },
  { type: "condition", label: "Condicao" },
  { type: "response", label: "Resposta" },
];

const DEFAULT_FLOW: { nodes: FlowNode[]; edges: FlowEdge[] } = {
  nodes: [
    { id: "n1", type: "command", label: ".sticker", config: { trigger: ".sticker" }, position: { x: 80, y: 100 } },
    { id: "n2", type: "action", label: "Converter figurinha", config: { action: "make_sticker" }, position: { x: 320, y: 100 } },
    { id: "n3", type: "response", label: "Aqui esta sua figurinha!", config: { text: "Aqui esta sua figurinha!" }, position: { x: 560, y: 100 } },
  ],
  edges: [
    { id: "e1", source: "n1", target: "n2" },
    { id: "e2", source: "n2", target: "n3" },
  ],
};

function NodeCard({ node, selected, onSelect, onDelete, onUpdate }: {
  node: FlowNode;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (label: string) => void;
}) {
  const cfg = nodeConfig[node.type];
  const Icon = cfg.icon;
  const [editing, setEditing] = useState(false);
  const [labelVal, setLabelVal] = useState(node.label);

  return (
    <div
      className={`absolute cursor-pointer rounded-xl border-2 p-3 w-44 transition-all select-none ${cfg.color} ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg" : "hover:shadow-md"}`}
      style={{ left: node.position.x, top: node.position.y }}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-white/70" />
          <span className="text-xs font-medium text-white/70 uppercase tracking-wider">{node.type}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-white/30 hover:text-red-400 transition-colors">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      {editing ? (
        <input
          autoFocus
          value={labelVal}
          onChange={(e) => setLabelVal(e.target.value)}
          onBlur={() => { setEditing(false); onUpdate(labelVal); }}
          onKeyDown={(e) => { if (e.key === "Enter") { setEditing(false); onUpdate(labelVal); } e.stopPropagation(); }}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-transparent text-white text-sm font-semibold outline-none border-b border-primary"
        />
      ) : (
        <p className="text-white text-sm font-semibold truncate cursor-text" onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}>
          {node.label}
        </p>
      )}
      <p className="text-white/40 text-xs mt-0.5 truncate">{cfg.description}</p>
    </div>
  );
}

export default function BuilderPage() {
  const { data: bots } = useListBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const { data: commandFlow } = useGetBotCommands(selectedBotId, {
    query: { enabled: !!selectedBotId },
  });
  const saveCommands = useSaveBotCommands();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [nodes, setNodes] = useState<FlowNode[]>(DEFAULT_FLOW.nodes);
  const [edges, setEdges] = useState<FlowEdge[]>(DEFAULT_FLOW.edges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const handleBotSelect = (botId: string) => {
    setSelectedBotId(botId);
  };

  const handleAddNode = (type: NodeType) => {
    const defaultLabels: Record<NodeType, string> = {
      command: ".novocomando",
      action: "Nova acao",
      condition: "Se condicao",
      response: "Mensagem de resposta",
    };
    const newNode: FlowNode = {
      id: `n${Date.now()}`,
      type,
      label: defaultLabels[type],
      config: {},
      position: { x: 80 + nodes.length * 30, y: 80 + nodes.length * 30 },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const handleUpdateLabel = (nodeId: string, label: string) => {
    setNodes((prev) => prev.map((n) => n.id === nodeId ? { ...n, label } : n));
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    dragging.current = {
      id: nodeId,
      offsetX: e.clientX - rect.left - node.position.x,
      offsetY: e.clientY - rect.top - node.position.y,
    };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragging.current.offsetX);
    const y = Math.max(0, e.clientY - rect.top - dragging.current.offsetY);
    setNodes((prev) => prev.map((n) => n.id === dragging.current!.id ? { ...n, position: { x, y } } : n));
  }, []);

  const handleMouseUp = () => { dragging.current = null; };

  const handleSave = async () => {
    if (!selectedBotId) {
      toast({ title: "Selecione um bot", description: "Escolha um bot antes de salvar.", variant: "destructive" });
      return;
    }
    try {
      await saveCommands.mutateAsync({
        botId: selectedBotId,
        data: { botId: selectedBotId, nodes, edges },
      });
      queryClient.invalidateQueries({ queryKey: getGetBotCommandsQueryKey(selectedBotId) });
      toast({ title: "Fluxo salvo!", description: "A configuracao do bot foi salva com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Nao foi possivel salvar o fluxo.", variant: "destructive" });
    }
  };

  const getEdgePath = (edge: FlowEdge) => {
    const source = nodes.find((n) => n.id === edge.source);
    const target = nodes.find((n) => n.id === edge.target);
    if (!source || !target) return "";
    const x1 = source.position.x + 176;
    const y1 = source.position.y + 40;
    const x2 = target.position.x;
    const y2 = target.position.y + 40;
    const cx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Builder Visual</h1>
          <p className="text-muted-foreground text-sm mt-1">Monte o fluxo do seu bot arrastando blocos</p>
        </div>
        <div className="flex items-center gap-3">
          <Select onValueChange={handleBotSelect} value={selectedBotId}>
            <SelectTrigger className="w-48 bg-background border-white/10 text-white">
              <SelectValue placeholder="Selecionar bot" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10">
              {bots?.map((bot) => (
                <SelectItem key={bot.id} value={bot.id} className="text-white hover:bg-white/5">
                  {bot.name}
                </SelectItem>
              ))}
              {(!bots || bots.length === 0) && (
                <SelectItem value="none" disabled className="text-muted-foreground">
                  Crie um bot primeiro
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={saveCommands.isPending} className="bg-primary hover:bg-primary/90 text-white">
            {saveCommands.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-240px)] min-h-96">
        <div className="w-48 flex-shrink-0 bg-card border border-white/5 rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Blocos</p>
          <div className="space-y-2">
            {BLOCK_TYPES.map(({ type, label }) => {
              const cfg = nodeConfig[type];
              const Icon = cfg.icon;
              return (
                <button
                  key={type}
                  onClick={() => handleAddNode(type)}
                  className={`w-full flex items-center gap-2 p-2.5 rounded-lg border-2 text-left transition-all hover:scale-105 active:scale-95 ${cfg.color}`}
                >
                  <Icon className="h-4 w-4 text-white/70 flex-shrink-0" />
                  <div>
                    <p className="text-white text-xs font-semibold">{label}</p>
                  </div>
                  <Plus className="h-3 w-3 text-white/40 ml-auto" />
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <Info className="h-3 w-3" />
              <p className="text-xs">Dica</p>
            </div>
            <p className="text-xs text-muted-foreground/70">Clique para adicionar blocos. Duplo clique para editar o nome.</p>
          </div>
        </div>

        <div className="flex-1 bg-card border border-white/5 rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div
            ref={canvasRef}
            className="absolute inset-0 cursor-default"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
              {edges.map((edge) => (
                <path
                  key={edge.id}
                  d={getEdgePath(edge)}
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="none"
                />
              ))}
            </svg>

            {nodes.map((node) => (
              <div
                key={node.id}
                onMouseDown={(e) => { e.preventDefault(); handleMouseDown(e, node.id); setSelectedNode(node.id); }}
              >
                <NodeCard
                  node={node}
                  selected={selectedNode === node.id}
                  onSelect={() => setSelectedNode(node.id)}
                  onDelete={() => handleDeleteNode(node.id)}
                  onUpdate={(label) => handleUpdateLabel(node.id, label)}
                />
              </div>
            ))}

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Bot className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Adicione blocos do painel esquerdo</p>
                  <p className="text-muted-foreground/50 text-xs mt-1">Arraste para reposicionar</p>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {Object.entries(nodeConfig).map(([type, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div key={type} className={`flex items-center gap-1 px-2 py-1 rounded-md border ${cfg.color} opacity-70`}>
                  <Icon className="h-3 w-3 text-white/60" />
                  <span className="text-white/60 text-xs capitalize">{type}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
