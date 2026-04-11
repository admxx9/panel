import React from "react";
import { Zap, MessageCircle, GitBranch, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Sparkles, MoreVertical } from "lucide-react";

const NODES = [
  { type: "command",   label: ".figurinha",    x: 16,  y: 30,  color: "#6D28D9", dim: "#6D28D91A", icon: MessageSquare },
  { type: "action",    label: "Criar Sticker", x: 196, y: 0,   color: "#7C3AED", dim: "#7C3AED1A", icon: Zap },
  { type: "condition", label: "Tem imagem?",   x: 196, y: 115, color: "#F59E0B", dim: "#F59E0B1A", icon: GitBranch },
  { type: "response",  label: "Sem imagem!",   x: 196, y: 230, color: "#22C55E", dim: "#22C55E1A", icon: MessageCircle },
];

function Node({ n }: { n: typeof NODES[0] }) {
  const Icon = n.icon;
  return (
    <div className="absolute rounded-2xl border" style={{ left: n.x, top: n.y, width: 160, backgroundColor: n.dim, borderColor: n.color + "45" }}>
      <div className="flex items-center gap-1.5 px-3 pt-2 pb-1.5" style={{ borderBottom: `1px solid ${n.color}25` }}>
        <Icon size={9} color={n.color} /><span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: n.color }}>{n.type}</span>
      </div>
      <div className="px-3 py-2"><p className="text-[12px] font-semibold" style={{ color: "#EBEBF2" }}>{n.label}</p></div>
      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: n.color, boxShadow: `0 0 8px ${n.color}` }}><div className="w-1.5 h-1.5 rounded-full bg-white/80" /></div>
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border" style={{ backgroundColor: "#0C0C11", borderColor: n.color + "55" }} />
    </div>
  );
}

function Canvas() {
  return (
    <div className="flex-1 relative overflow-hidden" style={{ backgroundImage: `radial-gradient(circle, #20202B 1px, transparent 1px)`, backgroundSize: "24px 24px", backgroundColor: "#0C0C11" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 40% 45%, #6D28D90A 0%, transparent 60%)" }} />
      {NODES.map((n, i) => <Node key={i} n={n} />)}
    </div>
  );
}

export function Orbital() {
  return (
    <div className="w-[390px] h-[844px] flex flex-col overflow-hidden" style={{ backgroundColor: "#0C0C11", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <span className="text-[11px] font-semibold" style={{ color: "#EBEBF2" }}>9:41</span>
        <div className="w-4 h-2.5 rounded-sm border border-white/30 flex items-center pr-0.5"><div className="w-2.5 h-1.5 rounded-sm ml-0.5" style={{ backgroundColor: "#22C55E" }} /></div>
      </div>

      {/* ── HEADER: gradient dark card with status badge ── */}
      <div className="px-4 pt-2 pb-4" style={{ background: "linear-gradient(180deg,#13131D 0%,#0C0C11 100%)", borderBottom: "1px solid #20202B" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "#20202B" }}>
              <ChevronLeft size={18} color="#8E8E9E" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-bold" style={{ color: "#EBEBF2" }}>MenuBot Pro</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold" style={{ backgroundColor: "#6D28D920", color: "#A78BFA" }}>PRO</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <p className="text-[10px]" style={{ color: "#8E8E9E" }}>4 blocos · ativo</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-2xl border" style={{ backgroundColor: "#6D28D912", borderColor: "#6D28D940" }}>
              <Sparkles size={16} color="#A78BFA" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 4px 14px #6D28D940" }}>
              <Save size={15} color="white" />
            </button>
          </div>
        </div>
      </div>

      <Canvas />

      {/* ── FOOTER: FAB centered + side zoom pills ── */}
      <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
        <div className="flex items-center gap-1 rounded-2xl border px-2 py-2" style={{ borderColor: "#20202B" }}>
          <button className="p-1" style={{ color: "#555575" }}><ZoomOut size={14} /></button>
          <span className="text-[10px] font-mono w-9 text-center" style={{ color: "#444460" }}>100%</span>
          <button className="p-1" style={{ color: "#555575" }}><ZoomIn size={14} /></button>
        </div>
        <button className="w-14 h-14 flex items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 8px 24px #6D28D955" }}>
          <Plus size={24} color="white" />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl border" style={{ borderColor: "#20202B" }}>
          <MoreVertical size={16} color="#555575" />
        </button>
      </div>
    </div>
  );
}

export default Orbital;
