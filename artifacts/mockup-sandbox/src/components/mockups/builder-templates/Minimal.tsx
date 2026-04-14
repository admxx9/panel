import React from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Trash2, ChevronDown, SlidersHorizontal } from "lucide-react";

const NODE_CFG = [
  { label: "Comando",  icon: MessageSquare, color: "#6D28D9", dim: "#6D28D91A" },
  { label: "Ação",     icon: Zap,           color: "#7C3AED", dim: "#7C3AED1A" },
  { label: "Condição", icon: GitBranch,     color: "#D97706", dim: "#D977061A" },
  { label: "Resposta", icon: MessageCircle, color: "#16A34A", dim: "#16A34A1A" },
  { label: "Botões",   icon: Layout,        color: "#0891B2", dim: "#0891B21A" },
];

const NODES = [
  { type: "AÇÃO",      label: "Criar Figurinha", sub: "Executa algo",   x: 20,  y: 80,  color: "#7C3AED", dim: "#7C3AED1A", icon: Zap,       handles: [] },
  { type: "CONDIÇÃO",  label: "Tem imagem?",     sub: "mídia",          x: 200, y: 60,  color: "#D97706", dim: "#D977061A", icon: GitBranch, handles: ["SIM","NÃO"] },
];

function Node({ n }: { n: typeof NODES[0] }) {
  const Icon = n.icon;
  return (
    <div className="absolute rounded-2xl border" style={{ left: n.x, top: n.y, width: 158, backgroundColor: n.dim, borderColor: n.color + "55" }}>
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5" style={{ borderBottom: `1px solid ${n.color}25` }}>
        <div className="flex items-center gap-1.5">
          <Icon size={10} color={n.color} />
          <span className="text-[8px] font-bold tracking-widest" style={{ color: n.color }}>{n.type}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="text-[10px]" style={{ color: "#8E8E9E" }}>✏</span>
          <span className="text-[10px]" style={{ color: "#8E8E9E" }}>🗑</span>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[12px] font-bold" style={{ color: "#EBEBF2" }}>{n.label}</p>
        {n.sub && <p className="text-[9px] mt-0.5" style={{ color: "#8E8E9E" }}>{n.sub}</p>}
      </div>
      {n.handles.length > 0 ? (
        n.handles.map((h, i) => (
          <div key={h} className="absolute flex items-center gap-1" style={{ right: -28, top: i === 0 ? 28 : 52 }}>
            <span className="text-[8px] font-bold" style={{ color: i === 0 ? "#16A34A" : "#DC2626" }}>{h}</span>
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: i === 0 ? "#16A34A" : "#DC2626" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        ))
      ) : (
        <div className="absolute -right-2.5 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F97316" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>
      )}
      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2" style={{ backgroundColor: "#0C0C11", borderColor: n.color + "60" }} />
    </div>
  );
}

export function Minimal() {
  return (
    <div className="w-[390px] h-[844px] flex flex-col overflow-hidden" style={{ backgroundColor: "#0C0C11", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <span className="text-[11px] font-semibold" style={{ color: "#EBEBF2" }}>9:41</span>
        <div className="w-4 h-2.5 rounded-sm border border-white/30 flex items-center pr-0.5"><div className="w-2.5 h-1.5 rounded-sm ml-0.5" style={{ backgroundColor: "#22C55E" }} /></div>
      </div>

      {/* ── HEADER ── */}
      <div className="px-4 pt-2 pb-3 border-b" style={{ borderColor: "#20202B" }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <ChevronLeft size={20} color="#8E8E9E" />
            <div>
              <p className="text-[15px] font-bold leading-none" style={{ color: "#EBEBF2" }}>Construtor Visual</p>
              <p className="text-[9px] mt-0.5" style={{ color: "#555575" }}>Arraste para navegar · Scroll para zoom</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px]" style={{ borderColor: "#DC262650", color: "#DC2626", backgroundColor: "#DC26261A" }}>
              <Trash2 size={11} /> Limpar
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white" style={{ backgroundColor: "#6D28D9" }}>
              <Save size={12} /> Salvar
            </button>
          </div>
        </div>
        {/* Bot selector */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
            <span className="text-[12px] font-semibold flex-1" style={{ color: "#EBEBF2" }}>MenuBot Pro</span>
            <ChevronDown size={14} color="#555575" />
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl border" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
            <SlidersHorizontal size={15} color="#8E8E9E" />
          </button>
        </div>
      </div>

      {/* ── BLOCK TYPE PILLS ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto border-b" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
        {NODE_CFG.map(b => {
          const Icon = b.icon;
          return (
            <button key={b.label} className="flex-none flex items-center gap-1.5 px-3 py-2 rounded-xl border" style={{ backgroundColor: b.dim, borderColor: b.color + "50" }}>
              <Plus size={11} color={b.color} />
              <Icon size={12} color={b.color} />
              <span className="text-[11px] font-semibold" style={{ color: b.color }}>{b.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── CANVAS ── */}
      <div className="flex-1 relative overflow-hidden" style={{
        backgroundImage: `radial-gradient(circle, #20202B 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        backgroundColor: "#0C0C11",
      }}>
        {NODES.map((n, i) => <Node key={i} n={n} />)}
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t" style={{ borderColor: "#20202B" }}>
        <p className="text-[9px]" style={{ color: "#333355" }}>Arraste para mover · Clique conexão para remover</p>
        <div className="flex items-center gap-1 rounded-xl border px-2 py-1.5" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
          <button className="p-1"><ZoomOut size={13} color="#555575" /></button>
          <span className="text-[10px] font-mono w-8 text-center" style={{ color: "#444460" }}>100%</span>
          <button className="p-1"><ZoomIn size={13} color="#555575" /></button>
        </div>
      </div>
    </div>
  );
}

export default Minimal;
