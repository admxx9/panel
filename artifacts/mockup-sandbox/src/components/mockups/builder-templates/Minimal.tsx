import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, Maximize2, Minimize2, ZoomIn, ZoomOut, Move, Play } from "lucide-react";

const PALETTE_BLOCKS = [
  { type: "command",   label: "Comando",  icon: MessageSquare, color: "#6D28D9" },
  { type: "action",    label: "Ação",     icon: Zap,           color: "#7C3AED" },
  { type: "condition", label: "Condição", icon: GitBranch,     color: "#F59E0B" },
  { type: "response",  label: "Resposta", icon: MessageCircle, color: "#22C55E" },
  { type: "buttons",   label: "Botões",   icon: Layout,        color: "#06B6D4" },
];

const SAMPLE_NODES = [
  { id: "1", type: "command",   label: ".figurinha",   x: 80,  y: 160, color: "#6D28D9", icon: MessageSquare },
  { id: "2", type: "action",    label: "Criar Sticker",x: 310, y: 100, color: "#7C3AED", icon: Zap },
  { id: "3", type: "condition", label: "Tem mídia?",   x: 310, y: 240, color: "#F59E0B", icon: GitBranch },
  { id: "4", type: "response",  label: "Sem imagem!",  x: 540, y: 280, color: "#22C55E", icon: MessageCircle },
];

const EDGES = [
  { from: { x: 80+156, y: 160+40 },  to: { x: 310,     y: 120 }, color: "#7C3AED" },
  { from: { x: 80+156, y: 160+40 },  to: { x: 310,     y: 260 }, color: "#F59E0B" },
  { from: { x: 310+156, y: 260+40 }, to: { x: 540,     y: 300 }, color: "#EF4444" },
];

function NodeBlock({ node }: { node: typeof SAMPLE_NODES[0] }) {
  const Icon = node.icon;
  return (
    <div
      className="absolute rounded-xl border"
      style={{
        left: node.x, top: node.y, width: 156, minHeight: 68,
        backgroundColor: node.color + "14",
        borderColor: node.color + "50",
        boxShadow: `0 4px 20px ${node.color}18`,
      }}
    >
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5 border-b" style={{ borderColor: node.color + "30" }}>
        <Icon size={11} color={node.color} />
        <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: node.color }}>{node.type}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[12px] font-semibold text-[#E8E8F2]">{node.label}</p>
      </div>
      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: node.color, boxShadow: `0 0 8px ${node.color}90` }}>
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border" style={{ backgroundColor: "#0E0E18", borderColor: node.color + "60" }} />
    </div>
  );
}

function EdgeLine({ from, to, color }: { from: {x:number,y:number}; to: {x:number,y:number}; color: string }) {
  const dx = to.x - from.x; const dy = to.y - from.y;
  const len = Math.sqrt(dx*dx+dy*dy);
  const angle = Math.atan2(dy, dx) * 180/Math.PI;
  const cx = (from.x+to.x)/2; const cy = (from.y+to.y)/2;
  return (
    <div className="absolute" style={{ left: cx - len/2, top: cy - 1, width: len, height: 2, backgroundColor: color+"70", borderRadius: 1, transform: `rotate(${angle}deg)`, transformOrigin: "center" }} />
  );
}

export function Minimal() {
  const [zoom, setZoom] = useState(100);
  const [saved, setSaved] = useState(false);
  return (
    <div className="w-full h-screen bg-[#08080D] flex flex-col font-sans overflow-hidden select-none" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header — ultra-minimal floating bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-[#141420] bg-[#0C0C14]/90 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-[#555570] hover:text-[#9090B0] transition-colors">
            <ChevronLeft size={16} />
            <span className="text-xs">Bots</span>
          </button>
          <div className="w-px h-4 bg-[#1E1E2A]" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-sm font-semibold text-[#E0E0F0]">MenuBot Pro</span>
            <span className="text-[10px] text-[#444460] font-mono">v2.1</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#7C3AED] border border-[#7C3AED]/30 hover:bg-[#7C3AED]/10 transition-colors">
            <Play size={11} />
            Testar
          </button>
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
            style={{ background: saved ? "#22C55E" : "linear-gradient(135deg,#7C3AED,#6D28D9)" }}
          >
            <Save size={11} />
            {saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Block Palette — slim left sidebar */}
        <aside className="w-52 bg-[#0C0C14] border-r border-[#141420] flex flex-col gap-0 z-10">
          <div className="px-4 pt-4 pb-3">
            <p className="text-[10px] font-bold tracking-widest text-[#444460] uppercase mb-3">Blocos</p>
            <div className="flex flex-col gap-1.5">
              {PALETTE_BLOCKS.map(b => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.type}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: b.color + "12", borderColor: b.color + "35" }}
                  >
                    <Icon size={13} color={b.color} />
                    <span className="text-xs font-medium text-[#C0C0D8]">{b.label}</span>
                    <div className="ml-auto">
                      <Plus size={10} color={b.color} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-auto px-4 pb-4">
            <div className="rounded-lg p-3" style={{ background: "linear-gradient(135deg,#7C3AED18,#6D28D910)", border: "1px solid #7C3AED25" }}>
              <p className="text-[10px] font-bold text-[#A78BFA] mb-1">Dica</p>
              <p className="text-[9px] text-[#555570] leading-relaxed">Arraste blocos para o canvas e conecte pelas bolinhas</p>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 relative overflow-hidden" style={{
          backgroundImage: `radial-gradient(circle, #1E1E2A55 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}>
          {EDGES.map((e, i) => <EdgeLine key={i} {...e} />)}
          {SAMPLE_NODES.map(n => <NodeBlock key={n.id} node={n} />)}

          {/* Zoom controls */}
          <div className="absolute bottom-5 right-5 flex items-center gap-1 bg-[#0E0E18]/90 border border-[#1E1E2A] rounded-xl px-2 py-1.5 backdrop-blur">
            <button onClick={() => setZoom(z => Math.max(50, z-10))} className="p-1 text-[#555570] hover:text-[#A0A0C0]"><ZoomOut size={14} /></button>
            <span className="text-[11px] text-[#7070A0] font-mono w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z+10))} className="p-1 text-[#555570] hover:text-[#A0A0C0]"><ZoomIn size={14} /></button>
            <div className="w-px h-4 bg-[#1E1E2A] mx-1" />
            <button className="p-1 text-[#555570] hover:text-[#A0A0C0]"><Move size={14} /></button>
            <button className="p-1 text-[#555570] hover:text-[#A0A0C0]"><Maximize2 size={14} /></button>
          </div>

          {/* Node count badge */}
          <div className="absolute top-4 right-4 text-[10px] text-[#444460] bg-[#0E0E18]/80 border border-[#1E1E2A] px-2.5 py-1 rounded-full">
            4 blocos · 3 conexões
          </div>
        </main>
      </div>
    </div>
  );
}

export default Minimal;
