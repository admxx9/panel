import React from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Trash2, ChevronDown, Move, Eye } from "lucide-react";

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
    <div className="absolute rounded-2xl border backdrop-blur-sm" style={{ left: n.x, top: n.y, width: 158, background: `linear-gradient(135deg,${n.color}16,${n.color}08)`, borderColor: n.color + "38", boxShadow: `0 8px 32px ${n.color}12, inset 0 1px 0 ${n.color}20` }}>
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5" style={{ borderBottom: `1px solid ${n.color}18` }}>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-md flex items-center justify-center" style={{ backgroundColor: n.color + "25" }}><Icon size={9} color={n.color} /></div><span className="text-[8px] font-bold tracking-widest" style={{ color: n.color }}>{n.type}</span></div>
        <div className="flex items-center gap-1.5 opacity-40"><span className="text-[10px]" style={{ color: "#8E8E9E" }}>✏</span><span className="text-[10px]" style={{ color: "#8E8E9E" }}>🗑</span></div>
      </div>
      <div className="px-3 py-2.5"><p className="text-[12px] font-bold" style={{ color: "#EBEBF2" }}>{n.label}</p>{n.sub && <p className="text-[9px] mt-0.5" style={{ color: "#8E8E9E" }}>{n.sub}</p>}</div>
      {n.handles.length > 0 ? n.handles.map((h, i) => (
        <div key={h} className="absolute flex items-center gap-1" style={{ right: -32, top: i === 0 ? 28 : 52 }}>
          <span className="text-[8px] font-bold" style={{ color: i === 0 ? "#16A34A" : "#DC2626" }}>{h}</span>
          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: i === 0 ? "#16A34A" : "#DC2626", borderColor: "#07070C", boxShadow: `0 0 10px ${i === 0 ? "#16A34A" : "#DC2626"}` }}><div className="w-2 h-2 rounded-full bg-white" /></div>
        </div>
      )) : (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: "#F97316", borderColor: "#07070C", boxShadow: "0 0 10px #F97316" }}><div className="w-2 h-2 rounded-full bg-white" /></div>
      )}
      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border" style={{ backgroundColor: "#07070C", borderColor: n.color + "50" }} />
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

      {/* ── HEADER: glass ── */}
      <div className="px-4 pt-2 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(10,10,20,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <ChevronLeft size={16} color="#8E8E9E" />
            </button>
            <div>
              <p className="text-[14px] font-bold leading-none" style={{ color: "#EBEBF2" }}>Construtor Visual</p>
              <p className="text-[9px] mt-0.5" style={{ color: "#3A3A58" }}>Arraste para navegar · Scroll para zoom</p>
            </div>
          </div>
          {/* Mini mode toolbar */}
          <div className="flex items-center gap-1 px-1.5 py-1.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <button className="w-7 h-7 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#6D28D9" }}><Move size={13} color="white" /></button>
            <button className="w-7 h-7 flex items-center justify-center rounded-xl"><Eye size={13} color="#555575" /></button>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="p-2 rounded-xl" style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)" }}><Trash2 size={13} color="#DC2626" /></button>
            <button className="flex items-center gap-1 px-3 py-2 rounded-2xl text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", boxShadow: "0 4px 14px #7C3AED40" }}><Save size={12} /> Salvar</button>
          </div>
        </div>
        {/* Bot selector glass */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "radial-gradient(circle,#22C55E,#16A34A)", boxShadow: "0 0 6px #22C55E" }} />
          <span className="text-[12px] font-semibold flex-1" style={{ color: "#EBEBF2" }}>MenuBot Pro</span>
          <ChevronDown size={13} color="#555575" />
        </div>
      </div>

      {/* ── BLOCK PILLS: glass ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(10,10,20,0.60)" }}>
        {NODE_CFG.map(b => {
          const Icon = b.icon;
          return (
            <button key={b.label} className="flex-none flex items-center gap-1.5 px-3 py-2 rounded-2xl border backdrop-blur-sm" style={{ background: `${b.color}14`, borderColor: `${b.color}35`, boxShadow: `0 2px 8px ${b.color}08` }}>
              <Plus size={11} color={b.color} />
              <Icon size={12} color={b.color} />
              <span className="text-[11px] font-semibold" style={{ color: b.color }}>{b.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── CANVAS ── */}
      <div className="flex-1 relative overflow-hidden" style={{ backgroundImage: `radial-gradient(circle, rgba(124,58,237,0.15) 1px, transparent 1px)`, backgroundSize: "26px 26px", backgroundColor: "#07070C" }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 40%, #7C3AED08 0%, transparent 65%)" }} />
        {NODES.map((n, i) => <Node key={i} n={n} />)}
      </div>

      {/* ── FOOTER: glass ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(10,10,20,0.80)", backdropFilter: "blur(20px)" }}>
        <p className="text-[9px]" style={{ color: "#2A2A45" }}>Arraste para mover · Clique conexão para remover</p>
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)" }}>
          <button className="p-1"><ZoomOut size={13} color="#444465" /></button>
          <span className="text-[10px] font-mono w-8 text-center" style={{ color: "#555575" }}>100%</span>
          <button className="p-1"><ZoomIn size={13} color="#444465" /></button>
        </div>
      </div>
    </div>
  );
}

export default Edge;
