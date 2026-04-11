import React from "react";
import { Zap, MessageCircle, GitBranch, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Move, Eye, Layers } from "lucide-react";

const NODES = [
  { type: "command",   label: ".figurinha",    x: 16,  y: 30,  color: "#6D28D9", dim: "#6D28D91A", icon: MessageSquare },
  { type: "action",    label: "Criar Sticker", x: 196, y: 0,   color: "#7C3AED", dim: "#7C3AED1A", icon: Zap },
  { type: "condition", label: "Tem imagem?",   x: 196, y: 115, color: "#F59E0B", dim: "#F59E0B1A", icon: GitBranch },
  { type: "response",  label: "Sem imagem!",   x: 196, y: 230, color: "#22C55E", dim: "#22C55E1A", icon: MessageCircle },
];

function Node({ n }: { n: typeof NODES[0] }) {
  const Icon = n.icon;
  return (
    <div className="absolute rounded-2xl border backdrop-blur-sm" style={{
      left: n.x, top: n.y, width: 160,
      background: `linear-gradient(135deg, ${n.color}16, ${n.color}08)`,
      borderColor: n.color + "38",
      boxShadow: `0 8px 32px ${n.color}14, inset 0 1px 0 ${n.color}20`,
    }}>
      <div className="flex items-center gap-1.5 px-3 pt-2 pb-1.5" style={{ borderBottom: `1px solid ${n.color}18` }}>
        <Icon size={9} color={n.color} /><span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: n.color }}>{n.type}</span>
      </div>
      <div className="px-3 py-2"><p className="text-[12px] font-semibold" style={{ color: "#EBEBF2" }}>{n.label}</p></div>
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: n.color, borderColor: "#07070C", boxShadow: `0 0 14px ${n.color}90` }}><div className="w-2 h-2 rounded-full bg-white opacity-80" /></div>
      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border" style={{ backgroundColor: "#07070C", borderColor: n.color + "50" }} />
    </div>
  );
}

function Canvas() {
  return (
    <div className="flex-1 relative overflow-hidden" style={{ backgroundImage: `radial-gradient(circle, rgba(124,58,237,0.15) 1px, transparent 1px)`, backgroundSize: "26px 26px", backgroundColor: "#07070C" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 40%, #7C3AED08 0%, transparent 60%)" }} />
      {NODES.map((n, i) => <Node key={i} n={n} />)}
    </div>
  );
}

export function Edge() {
  return (
    <div className="w-[390px] h-[844px] flex flex-col overflow-hidden" style={{ backgroundColor: "#07070C", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <span className="text-[11px] font-semibold" style={{ color: "#EBEBF2" }}>9:41</span>
        <div className="w-4 h-2.5 rounded-sm border border-white/30 flex items-center pr-0.5"><div className="w-2.5 h-1.5 rounded-sm ml-0.5" style={{ backgroundColor: "#22C55E" }} /></div>
      </div>

      {/* ── HEADER: frosted glass with center mini toolbar ── */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(10,10,20,0.80)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2.5">
          <button className="w-9 h-9 flex items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ChevronLeft size={18} color="#8E8E9E" />
          </button>
          <div>
            <p className="text-[14px] font-bold" style={{ color: "#EBEBF2" }}>MenuBot Pro</p>
            <p className="text-[9px]" style={{ color: "#3A3A58" }}>Builder · auto-salvo</p>
          </div>
        </div>
        {/* Center mode picker */}
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <button className="w-7 h-7 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#6D28D9" }}><Move size={13} color="white" /></button>
          <button className="w-7 h-7 flex items-center justify-center rounded-xl"><Layers size={13} color="#555575" /></button>
          <button className="w-7 h-7 flex items-center justify-center rounded-xl"><Eye size={13} color="#555575" /></button>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", boxShadow: "0 4px 14px #7C3AED45" }}>
          <Save size={15} color="white" />
        </button>
      </div>

      <Canvas />

      {/* ── FOOTER: glass bar ── */}
      <div className="flex items-center justify-between px-5 py-3" style={{ background: "rgba(10,10,20,0.80)", borderTop: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
        <span className="text-[10px]" style={{ color: "#2A2A45" }}>4 blocos · 3 conexões</span>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <button className="p-1" style={{ color: "#444465" }}><ZoomOut size={13} /></button>
          <span className="text-[10px] font-mono w-8 text-center" style={{ color: "#555575" }}>100%</span>
          <button className="p-1" style={{ color: "#444465" }}><ZoomIn size={13} /></button>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-2xl" style={{ background: "rgba(109,40,217,0.20)", border: "1px solid #6D28D940" }}>
          <Plus size={13} color="#A78BFA" />
          <span className="text-[11px] font-semibold" style={{ color: "#A78BFA" }}>Bloco</span>
        </button>
      </div>
    </div>
  );
}

export default Edge;
