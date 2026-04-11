import React from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Move, Play } from "lucide-react";

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
        <Icon size={9} color={n.color} />
        <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: n.color }}>{n.type}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[12px] font-semibold" style={{ color: "#EBEBF2" }}>{n.label}</p>
      </div>
      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: n.color, boxShadow: `0 0 8px ${n.color}` }}>
        <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
      </div>
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border" style={{ backgroundColor: "#0C0C11", borderColor: n.color + "55" }} />
    </div>
  );
}

function Canvas() {
  return (
    <div className="flex-1 relative overflow-hidden" style={{
      backgroundImage: `radial-gradient(circle, #20202B 1px, transparent 1px)`,
      backgroundSize: "24px 24px",
      backgroundColor: "#0C0C11",
    }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 40% 45%, #6D28D90A 0%, transparent 60%)" }} />
      {NODES.map((n, i) => <Node key={i} n={n} />)}
    </div>
  );
}

/* ─── TEMPLATE: Minimal ─────────────────────────────────────────── */
export function Minimal() {
  return (
    <div className="w-[390px] h-[844px] flex flex-col overflow-hidden" style={{ backgroundColor: "#0C0C11", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <span className="text-[11px] font-semibold" style={{ color: "#EBEBF2" }}>9:41</span>
        <div className="w-4 h-2.5 rounded-sm border border-white/30 flex items-center pr-0.5">
          <div className="w-2.5 h-1.5 rounded-sm ml-0.5" style={{ backgroundColor: "#22C55E" }} />
        </div>
      </div>

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#20202B" }}>
        <div className="flex items-center gap-2.5">
          <ChevronLeft size={22} color="#8E8E9E" />
          <div>
            <p className="text-[15px] font-bold leading-none" style={{ color: "#EBEBF2" }}>MenuBot Pro</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#555575" }}>Editor de fluxo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-xl text-[11px] font-semibold border" style={{ color: "#A78BFA", borderColor: "#6D28D955", backgroundColor: "#6D28D912" }}>
            <Play size={11} className="inline mr-1" />Testar
          </button>
          <button className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white flex items-center gap-1" style={{ backgroundColor: "#6D28D9" }}>
            <Save size={12} /> Salvar
          </button>
        </div>
      </div>

      <Canvas />

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "#20202B" }}>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border" style={{ borderColor: "#6D28D955", backgroundColor: "#6D28D912" }}>
          <Plus size={14} color="#A78BFA" />
          <span className="text-[12px] font-semibold" style={{ color: "#A78BFA" }}>Bloco</span>
        </button>
        <div className="flex items-center gap-1 rounded-xl border px-2 py-1.5" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
          <button className="p-1.5" style={{ color: "#8E8E9E" }}><ZoomOut size={14} /></button>
          <span className="text-[10px] font-mono w-9 text-center" style={{ color: "#555575" }}>100%</span>
          <button className="p-1.5" style={{ color: "#8E8E9E" }}><ZoomIn size={14} /></button>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl border" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
          <Move size={16} color="#8E8E9E" />
        </button>
      </div>
    </div>
  );
}

export default Minimal;
