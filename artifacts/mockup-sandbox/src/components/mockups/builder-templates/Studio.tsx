import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Trash2, ChevronDown, AlertCircle, CheckCircle } from "lucide-react";

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
    <div className="absolute rounded-xl border" style={{ left: n.x, top: n.y, width: 158, backgroundColor: n.dim, borderColor: n.color + "45", borderLeftWidth: 3, borderLeftColor: n.color }}>
      <div className="flex items-center justify-between px-3 pt-2 pb-1.5" style={{ borderBottom: `1px solid ${n.color}20` }}>
        <div className="flex items-center gap-1.5"><Icon size={9} color={n.color} /><span className="text-[8px] font-bold tracking-widest" style={{ color: n.color }}>{n.type}</span></div>
        <div className="flex items-center gap-1.5 opacity-50"><span className="text-[10px]" style={{ color: "#8E8E9E" }}>✏</span><span className="text-[10px]" style={{ color: "#8E8E9E" }}>🗑</span></div>
      </div>
      <div className="px-3 py-2"><p className="text-[12px] font-bold" style={{ color: "#EBEBF2" }}>{n.label}</p>{n.sub && <p className="text-[9px] mt-0.5" style={{ color: "#8E8E9E" }}>{n.sub}</p>}</div>
      {n.handles.length > 0 ? n.handles.map((h, i) => (
        <div key={h} className="absolute flex items-center gap-1" style={{ right: -28, top: i === 0 ? 28 : 52 }}>
          <span className="text-[8px] font-bold" style={{ color: i === 0 ? "#16A34A" : "#DC2626" }}>{h}</span>
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: i === 0 ? "#16A34A" : "#DC2626" }}><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>
        </div>
      )) : (
        <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F97316" }}><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>
      )}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border" style={{ backgroundColor: "#0C0C11", borderColor: n.color + "55" }} />
    </div>
  );
}

export function Studio() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="w-[390px] h-[844px] flex flex-col overflow-hidden" style={{ backgroundColor: "#0C0C11", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <span className="text-[11px] font-semibold" style={{ color: "#EBEBF2" }}>9:41</span>
        <div className="w-4 h-2.5 rounded-sm border border-white/30 flex items-center pr-0.5"><div className="w-2.5 h-1.5 rounded-sm ml-0.5" style={{ backgroundColor: "#22C55E" }} /></div>
      </div>

      {/* ── HEADER: Studio — compact + status indicator ── */}
      <div className="px-4 pt-2 pb-3 border-b" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: "#20202B" }}>
              <ChevronLeft size={15} color="#8E8E9E" />
            </button>
            <div>
              <p className="text-[14px] font-bold leading-none" style={{ color: "#EBEBF2" }}>Construtor Visual</p>
              <p className="text-[9px] mt-0.5" style={{ color: "#444460" }}>Arraste para navegar · Scroll para zoom</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {saved
              ? <span className="flex items-center gap-1 text-[10px]" style={{ color: "#22C55E" }}><CheckCircle size={11} />Salvo</span>
              : <span className="flex items-center gap-1 text-[10px]" style={{ color: "#F59E0B" }}><AlertCircle size={11} />Não salvo</span>
            }
            <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px]" style={{ borderColor: "#DC262640", color: "#DC2626", backgroundColor: "#DC262610" }}>
              <Trash2 size={10} />
            </button>
            <button onClick={() => setSaved(s => !s)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white" style={{ backgroundColor: "#6D28D9" }}>
              <Save size={12} /> Salvar
            </button>
          </div>
        </div>
        {/* Bot selector */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: "#20202B" }}>
          <span className="text-[11px] font-semibold flex-1" style={{ color: "#EBEBF2" }}>MenuBot Pro</span>
          <ChevronDown size={13} color="#555575" />
        </div>
      </div>

      {/* ── BLOCK PILLS ── */}
      <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-b" style={{ borderColor: "#20202B" }}>
        {NODE_CFG.map(b => {
          const Icon = b.icon;
          return (
            <button key={b.label} className="flex-none flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border" style={{ backgroundColor: b.dim, borderColor: b.color + "45" }}>
              <Plus size={10} color={b.color} />
              <Icon size={11} color={b.color} />
              <span className="text-[10px] font-semibold" style={{ color: b.color }}>{b.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── CANVAS ── */}
      <div className="flex-1 relative overflow-hidden" style={{ backgroundImage: `radial-gradient(circle, #20202B 1px, transparent 1px)`, backgroundSize: "24px 24px", backgroundColor: "#0C0C11" }}>
        {NODES.map((n, i) => <Node key={i} n={n} />)}
      </div>

      {/* ── FOOTER: status bar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-t" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
        <div className="flex items-center gap-3 text-[9px]" style={{ color: "#333355" }}>
          <span className="flex items-center gap-1"><AlertCircle size={9} />0 erros</span>
          <span>2 blocos · 1 conexão</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5"><ZoomOut size={12} color="#555575" /></button>
          <span className="text-[10px] font-mono w-8 text-center" style={{ color: "#444460" }}>100%</span>
          <button className="p-1.5"><ZoomIn size={12} color="#555575" /></button>
        </div>
      </div>
    </div>
  );
}

export default Studio;
