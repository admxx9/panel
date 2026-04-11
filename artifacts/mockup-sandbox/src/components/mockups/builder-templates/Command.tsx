import React from "react";
import { Zap, MessageCircle, GitBranch, MessageSquare, ChevronLeft, Plus, ZoomIn, ZoomOut, Terminal, Play, Save } from "lucide-react";

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
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border" style={{ backgroundColor: "#06060B", borderColor: n.color + "55" }} />
    </div>
  );
}

function Canvas() {
  return (
    <div className="flex-1 relative overflow-hidden" style={{ backgroundImage: `linear-gradient(#18182230 1px, transparent 1px), linear-gradient(90deg,#18182230 1px, transparent 1px)`, backgroundSize: "22px 22px", backgroundColor: "#06060B" }}>
      <div className="absolute top-2 left-4 text-[8px]" style={{ color: "#222238", fontFamily: "monospace" }}>// canvas · arraste blocos</div>
      {NODES.map((n, i) => <Node key={i} n={n} />)}
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

      {/* ── HEADER: terminal bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "#181826", backgroundColor: "#0A0A12" }}>
        <button style={{ color: "#333355" }}><ChevronLeft size={16} /></button>
        <Terminal size={13} color="#7C3AED" />
        <span className="text-[13px] font-bold flex-1" style={{ color: "#D0D0F0" }}>
          bot_editor<span className="text-[#333355]">~/flow.json</span>
        </span>
        <div className="w-2 h-4 animate-pulse" style={{ backgroundColor: "#7C3AED" }} />
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px]" style={{ color: "#7C3AED", borderColor: "#7C3AED35", backgroundColor: "#7C3AED10" }}>
          <Play size={10} />run
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white" style={{ backgroundColor: "#7C3AED" }}>
          :w <Save size={10} className="inline ml-0.5" />
        </button>
      </div>

      <Canvas />

      {/* ── FOOTER: keyboard shortcut bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t" style={{ borderColor: "#181826", backgroundColor: "#0A0A12" }}>
        <div className="flex items-center gap-3">
          {[["⌘A", "Bloco"], ["⌘Z", "Desfazer"], ["⌘S", "Salvar"]].map(([key, label]) => (
            <div key={key} className="flex items-center gap-1">
              <span className="text-[9px] px-1.5 py-0.5 rounded border" style={{ color: "#7C3AED", borderColor: "#7C3AED35", backgroundColor: "#7C3AED10", fontFamily: "monospace" }}>{key}</span>
              <span className="text-[9px]" style={{ color: "#333355" }}>{label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1" style={{ color: "#333355" }}><ZoomOut size={12} /></button>
          <span className="text-[9px] font-mono w-8 text-center" style={{ color: "#444466" }}>100%</span>
          <button className="p-1" style={{ color: "#333355" }}><ZoomIn size={12} /></button>
          <button className="ml-1 flex items-center gap-1 text-[10px]" style={{ color: "#7C3AED" }}>
            <Plus size={11} />bloco
          </button>
        </div>
      </div>
    </div>
  );
}

export default Command;
