import React from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Trash2, Terminal, ChevronDown } from "lucide-react";

const NODE_CFG = [
  { label: "Comando",  key: "cmd", icon: MessageSquare, color: "#6D28D9", dim: "#6D28D91A" },
  { label: "Ação",     key: "act", icon: Zap,           color: "#7C3AED", dim: "#7C3AED1A" },
  { label: "Condição", key: "cnd", icon: GitBranch,     color: "#D97706", dim: "#D977061A" },
  { label: "Resposta", key: "res", icon: MessageCircle, color: "#16A34A", dim: "#16A34A1A" },
  { label: "Botões",   key: "btn", icon: Layout,        color: "#0891B2", dim: "#0891B21A" },
];

const NODES = [
  { type: "AÇÃO",     label: "Criar Figurinha", sub: "Executa algo", x: 20,  y: 80,  color: "#7C3AED", dim: "#7C3AED1A", icon: Zap,       handles: [] },
  { type: "CONDIÇÃO", label: "Tem imagem?",     sub: "mídia",        x: 200, y: 60,  color: "#D97706", dim: "#D977061A", icon: GitBranch, handles: ["SIM","NÃO"] },
];

function Node({ n }: { n: typeof NODES[0] }) {
  const Icon = n.icon;
  return (
    <div className="absolute rounded-xl border-l-4" style={{ left: n.x, top: n.y, width: 158, backgroundColor: "#13131D", borderLeftColor: n.color, borderTop: `1px solid ${n.color}30`, borderRight: `1px solid ${n.color}30`, borderBottom: `1px solid ${n.color}30`, fontFamily: "monospace" }}>
      <div className="flex items-center justify-between px-3 pt-2 pb-1.5" style={{ borderBottom: `1px solid ${n.color}18` }}>
        <div className="flex items-center gap-1.5"><Icon size={9} color={n.color} /><span className="text-[8px] font-bold uppercase" style={{ color: n.color + "BB" }}>{n.type}</span></div>
        <div className="opacity-40 flex gap-1.5"><span className="text-[10px]" style={{ color: "#8E8E9E" }}>✏</span><span className="text-[10px]" style={{ color: "#8E8E9E" }}>🗑</span></div>
      </div>
      <div className="px-3 py-2"><p className="text-[12px] font-bold" style={{ color: "#C8C8E0" }}>{n.label}</p>{n.sub && <p className="text-[9px] mt-0.5" style={{ color: "#555575" }}>{n.sub}</p>}</div>
      {n.handles.length > 0 ? n.handles.map((h, i) => (
        <div key={h} className="absolute flex items-center gap-1" style={{ right: -28, top: i === 0 ? 28 : 52 }}>
          <span className="text-[8px] font-bold" style={{ color: i === 0 ? "#16A34A" : "#DC2626" }}>{h}</span>
          <div className="w-5 h-5 rounded-sm flex items-center justify-center" style={{ backgroundColor: i === 0 ? "#16A34A" : "#DC2626" }}><div className="w-1.5 h-1.5 rounded-sm bg-white" /></div>
        </div>
      )) : (
        <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-sm flex items-center justify-center" style={{ backgroundColor: "#F97316" }}><div className="w-1.5 h-1.5 rounded-sm bg-white" /></div>
      )}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm border" style={{ backgroundColor: "#06060B", borderColor: n.color + "55" }} />
    </div>
  );
}

export function Command() {
  return (
    <div className="w-[390px] h-[844px] flex flex-col overflow-hidden" style={{ backgroundColor: "#06060B", fontFamily: "JetBrains Mono, Fira Code, monospace" }}>
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <span className="text-[11px] font-bold" style={{ color: "#C0C0D8" }}>9:41</span>
        <div className="w-4 h-2.5 rounded-sm border border-white/25 flex items-center pr-0.5"><div className="w-2.5 h-1.5 rounded-sm ml-0.5" style={{ backgroundColor: "#22C55E" }} /></div>
      </div>

      {/* ── HEADER: terminal style ── */}
      <div className="px-4 pt-2 pb-3 border-b" style={{ borderColor: "#181826", backgroundColor: "#0A0A12" }}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <ChevronLeft size={16} color="#333355" />
            <Terminal size={13} color="#7C3AED" />
            <div>
              <p className="text-[13px] font-bold leading-none" style={{ color: "#D0D0F0" }}>Construtor Visual</p>
              <p className="text-[9px] mt-0.5" style={{ color: "#2A2A45" }}>Arraste para navegar · Scroll para zoom</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="px-2 py-1.5 rounded-lg border text-[10px] font-bold" style={{ borderColor: "#DC262435", color: "#DC2626", backgroundColor: "#DC26240E" }}>
              <Trash2 size={10} className="inline" />
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white" style={{ backgroundColor: "#7C3AED" }}>
              :w <Save size={10} className="inline ml-0.5" />
            </button>
          </div>
        </div>
        {/* Bot selector — terminal style */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: "#181826", backgroundColor: "#0C0C18" }}>
          <span className="text-[10px]" style={{ color: "#333355" }}>~/bots/</span>
          <span className="text-[12px] font-bold flex-1" style={{ color: "#C0C0D8" }}>MenuBot Pro</span>
          <ChevronDown size={12} color="#333355" />
        </div>
      </div>

      {/* ── BLOCK PILLS: terminal tag style ── */}
      <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-b" style={{ borderColor: "#181826", backgroundColor: "#09090F" }}>
        {NODE_CFG.map(b => {
          const Icon = b.icon;
          return (
            <button key={b.label} className="flex-none flex items-center gap-1.5 px-2.5 py-2 rounded-lg border" style={{ backgroundColor: b.dim, borderColor: b.color + "35" }}>
              <span className="text-[8px] font-bold px-1 py-0.5 rounded" style={{ backgroundColor: b.color + "20", color: b.color + "CC" }}>{b.key}</span>
              <Icon size={11} color={b.color} />
              <span className="text-[10px] font-bold" style={{ color: b.color }}>{b.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── CANVAS ── */}
      <div className="flex-1 relative overflow-hidden" style={{ backgroundImage: `linear-gradient(#18182230 1px, transparent 1px), linear-gradient(90deg,#18182230 1px, transparent 1px)`, backgroundSize: "22px 22px", backgroundColor: "#06060B" }}>
        <div className="absolute top-2 left-4 text-[8px]" style={{ color: "#1A1A30", fontFamily: "monospace" }}>// canvas</div>
        {NODES.map((n, i) => <Node key={i} n={n} />)}
      </div>

      {/* ── FOOTER: keyboard hints ── */}
      <div className="flex items-center justify-between px-4 py-2 border-t" style={{ borderColor: "#181826", backgroundColor: "#0A0A12" }}>
        <div className="flex items-center gap-2 text-[8px]" style={{ color: "#1E1E38" }}>
          {["⌘A Bloco", "⌘Z Desfazer", "⌘S Salvar"].map(k => <span key={k}>{k}</span>)}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1"><ZoomOut size={12} color="#333355" /></button>
          <span className="text-[9px] font-mono w-8 text-center" style={{ color: "#333355" }}>100%</span>
          <button className="p-1"><ZoomIn size={12} color="#333355" /></button>
        </div>
      </div>
    </div>
  );
}

export default Command;
