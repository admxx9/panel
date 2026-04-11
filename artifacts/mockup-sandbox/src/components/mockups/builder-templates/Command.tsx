import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, ChevronLeft, Plus, ZoomIn, ZoomOut, Terminal, Search, Save } from "lucide-react";

const NODE_CFG = [
  { type: "command",   label: "Comando",  key: "cmd", icon: MessageSquare, color: "#6D28D9", dim: "#6D28D91A" },
  { type: "action",    label: "Ação",     key: "act", icon: Zap,           color: "#7C3AED", dim: "#7C3AED1A" },
  { type: "condition", label: "Condição", key: "cnd", icon: GitBranch,     color: "#F59E0B", dim: "#F59E0B1A" },
  { type: "response",  label: "Resposta", key: "res", icon: MessageCircle, color: "#22C55E", dim: "#22C55E1A" },
  { type: "buttons",   label: "Botões",   key: "btn", icon: Layout,        color: "#06B6D4", dim: "#06B6D41A" },
];

const NODES = [
  { type: "command",   label: ".ban",          x: 18, y: 50,  color: "#6D28D9", dim: "#6D28D91A", icon: MessageSquare },
  { type: "condition", label: "É admin?",      x: 18, y: 180, color: "#F59E0B", dim: "#F59E0B1A", icon: GitBranch },
  { type: "action",    label: "Banir membro",  x: 18, y: 310, color: "#7C3AED", dim: "#7C3AED1A", icon: Zap },
];

function Node({ n }: { n: typeof NODES[0] }) {
  const Icon = n.icon;
  return (
    <div className="absolute rounded-xl border-l-4" style={{
      left: n.x, top: n.y, width: 220,
      backgroundColor: "#13131D",
      borderLeftColor: n.color,
      borderTop: `1px solid ${n.color}30`,
      borderRight: `1px solid ${n.color}30`,
      borderBottom: `1px solid ${n.color}30`,
      fontFamily: "JetBrains Mono, monospace",
    }}>
      <div className="flex items-center gap-2 px-3 pt-2 pb-1.5" style={{ borderBottom: `1px solid ${n.color}18` }}>
        <span className="text-[8px] font-bold uppercase" style={{ color: n.color + "BB" }}># {n.type}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[12px] font-bold" style={{ color: "#C8C8E0" }}>{n.label}</p>
      </div>
      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center border" style={{ backgroundColor: n.color, borderColor: n.color + "80" }}>
        <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
      </div>
    </div>
  );
}

export function Command() {
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(100);
  const filtered = NODE_CFG.filter(b => !search || b.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-[390px] h-[844px] flex flex-col overflow-hidden" style={{ backgroundColor: "#06060B", fontFamily: "JetBrains Mono, Fira Code, monospace" }}>

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1">
        <span className="text-[11px] font-bold" style={{ color: "#C0C0D8" }}>9:41</span>
        <div className="w-4 h-2.5 rounded-sm border border-[#C0C0D8]/40 flex items-center pr-0.5">
          <div className="w-2.5 h-1.5 rounded-sm ml-0.5" style={{ backgroundColor: "#22C55E" }} />
        </div>
      </div>

      {/* Terminal header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#181826", backgroundColor: "#0A0A12" }}>
        <div className="flex items-center gap-2.5">
          <button className="text-[#333355]"><ChevronLeft size={16} /></button>
          <Terminal size={14} color="#7C3AED" />
          <span className="text-[13px] font-bold" style={{ color: "#D0D0F0" }}>bot_editor</span>
          <span className="text-[10px]" style={{ color: "#333355" }}>flow.json</span>
          <div className="w-2 h-4 animate-pulse" style={{ backgroundColor: "#7C3AED" }} />
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: "#7C3AED" }}>
          <Save size={14} color="white" />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden" style={{
        backgroundImage: `linear-gradient(#18182230 1px, transparent 1px), linear-gradient(90deg, #18182230 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
        backgroundColor: "#06060B",
      }}>
        <div className="absolute top-2 left-4 text-[8px]" style={{ color: "#222238", fontFamily: "monospace" }}>// canvas · arraste blocos</div>
        {NODES.map((n, i) => <Node key={i} n={n} />)}

        <div className="absolute bottom-4 right-3 flex items-center gap-1 rounded-xl border px-2 py-1.5" style={{ backgroundColor: "#0A0A12", borderColor: "#181826" }}>
          <button onClick={() => setZoom(z => Math.max(50, z-10))} style={{ color: "#333355" }}><ZoomOut size={12} /></button>
          <span className="text-[9px] font-mono w-7 text-center" style={{ color: "#444466" }}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z+10))} style={{ color: "#333355" }}><ZoomIn size={12} /></button>
        </div>
      </div>

      {/* Bottom palette — command list */}
      <div className="border-t" style={{ borderColor: "#181826", backgroundColor: "#09090F" }}>
        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ backgroundColor: "#0C0C18", borderColor: "#181826" }}>
            <Search size={12} color="#333355" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="buscar bloco..."
              className="flex-1 bg-transparent text-[11px] outline-none"
              style={{ color: "#8888C0", fontFamily: "monospace" }}
            />
            <span className="text-[9px]" style={{ color: "#2A2A45" }}>⌘K</span>
          </div>
        </div>
        <div className="px-3 pb-2 text-[8px]" style={{ color: "#2A2A45" }}>// blocos disponíveis</div>
        <div className="flex gap-2 px-4 pb-5 overflow-x-auto">
          {filtered.map(b => {
            const Icon = b.icon;
            return (
              <div key={b.type} className="flex-none flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border cursor-grab" style={{ backgroundColor: b.dim, borderColor: b.color + "30", minWidth: 62 }}>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: b.color + "20", color: b.color + "CC" }}>{b.key}</span>
                <Icon size={16} color={b.color} />
                <span className="text-[9px]" style={{ color: "#9090C0" }}>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Command;
