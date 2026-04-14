import React from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Trash2, ChevronDown, Maximize2 } from "lucide-react";

const NODE_CFG = [
  { label: "Comando",  icon: MessageSquare, color: "#6D28D9", dim: "#6D28D91A" },
  { label: "Ação",     icon: Zap,           color: "#7C3AED", dim: "#7C3AED1A" },
  { label: "Condição", icon: GitBranch,     color: "#D97706", dim: "#D977061A" },
  { label: "Resposta", icon: MessageCircle, color: "#16A34A", dim: "#16A34A1A" },
  { label: "Botões",   icon: Layout,        color: "#0891B2", dim: "#0891B21A" },
];

const NODES = [
  { type: "AÇÃO",     label: "Criar Figurinha", sub: "Executa algo", x: 20,  y: 80,  color: "#7C3AED", dim: "#7C3AED1A", icon: Zap,       handles: [] },
  { type: "CONDIÇÃO", label: "Tem imagem?",     sub: "mídia",        x: 200, y: 60,  color: "#D97706", dim: "#D977061A", icon: GitBranch, handles: ["SIM","NÃO"] },
];

function Node({ n }: { n: typeof NODES[0] }) {
  const Icon = n.icon;
  return (
    <div className="absolute rounded-2xl border" style={{ left: n.x, top: n.y, width: 158, background: `linear-gradient(135deg,${n.color}18,${n.color}08)`, borderColor: n.color + "45", boxShadow: `0 8px 24px ${n.color}12` }}>
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5" style={{ borderBottom: `1px solid ${n.color}22` }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md flex items-center justify-center" style={{ backgroundColor: n.color + "25" }}><Icon size={9} color={n.color} /></div>
          <span className="text-[8px] font-bold tracking-widest" style={{ color: n.color }}>{n.type}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-50">
          <span className="text-[10px]" style={{ color: "#8E8E9E" }}>✏</span>
          <span className="text-[10px]" style={{ color: "#8E8E9E" }}>🗑</span>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[12px] font-bold" style={{ color: "#EBEBF2" }}>{n.label}</p>
        {n.sub && <p className="text-[9px] mt-0.5" style={{ color: "#8E8E9E" }}>{n.sub}</p>}
      </div>
      {n.handles.length > 0 ? n.handles.map((h, i) => (
        <div key={h} className="absolute flex items-center gap-1" style={{ right: -30, top: i === 0 ? 28 : 52 }}>
          <span className="text-[8px] font-bold" style={{ color: i === 0 ? "#16A34A" : "#DC2626" }}>{h}</span>
          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: i === 0 ? "#16A34A" : "#DC2626", borderColor: "#0C0C11" }}><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>
        </div>
      )) : (
        <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: "#F97316", borderColor: "#0C0C11" }}><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>
      )}
      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2" style={{ backgroundColor: "#0C0C11", borderColor: n.color + "60" }} />
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

      {/* ── HEADER: gradient card ── */}
      <div className="px-4 pt-2 pb-3 border-b" style={{ borderColor: "#20202B", background: "linear-gradient(180deg,#13131D 0%,#0C0C11 100%)" }}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#20202B" }}>
              <ChevronLeft size={16} color="#8E8E9E" />
            </button>
            <div>
              <p className="text-[15px] font-bold leading-none" style={{ color: "#EBEBF2" }}>Construtor Visual</p>
              <p className="text-[9px] mt-0.5" style={{ color: "#444460" }}>Arraste para navegar · Scroll para zoom</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-semibold" style={{ borderColor: "#DC262645", color: "#DC2626", backgroundColor: "#DC262612" }}>
              <Trash2 size={10} /> Limpar
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 4px 14px #6D28D940" }}>
              <Save size={12} /> Salvar
            </button>
          </div>
        </div>
        {/* Bot selector styled */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border" style={{ borderColor: "#6D28D940", backgroundColor: "#6D28D912" }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22C55E" }} />
          <span className="text-[12px] font-semibold flex-1" style={{ color: "#EBEBF2" }}>MenuBot Pro</span>
          <ChevronDown size={14} color="#A78BFA" />
        </div>
      </div>

      {/* ── BLOCK PILLS ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto border-b" style={{ borderColor: "#20202B" }}>
        {NODE_CFG.map(b => {
          const Icon = b.icon;
          return (
            <button key={b.label} className="flex-none flex items-center gap-1.5 px-3 py-2 rounded-2xl border" style={{ background: `linear-gradient(135deg,${b.color}20,${b.color}0C)`, borderColor: b.color + "50" }}>
              <Plus size={11} color={b.color} />
              <Icon size={12} color={b.color} />
              <span className="text-[11px] font-semibold" style={{ color: b.color }}>{b.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── CANVAS ── */}
      <div className="flex-1 relative overflow-hidden" style={{ backgroundImage: `radial-gradient(circle, #20202B 1px, transparent 1px)`, backgroundSize: "24px 24px", backgroundColor: "#0C0C11" }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 40% 50%, #7C3AED08 0%, transparent 65%)" }} />
        {NODES.map((n, i) => <Node key={i} n={n} />)}
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
        <p className="text-[9px]" style={{ color: "#2A2A45" }}>Arraste para mover · Clique conexão para remover</p>
        <div className="flex items-center gap-1 rounded-2xl border px-2 py-1.5" style={{ borderColor: "#20202B" }}>
          <button className="p-1"><ZoomOut size={13} color="#555575" /></button>
          <span className="text-[10px] font-mono w-8 text-center" style={{ color: "#444460" }}>100%</span>
          <button className="p-1"><ZoomIn size={13} color="#555575" /></button>
          <div className="w-px h-4 mx-1" style={{ backgroundColor: "#20202B" }} />
          <button className="p-1"><Maximize2 size={13} color="#555575" /></button>
        </div>
      </div>
    </div>
  );
}

export default Orbital;
