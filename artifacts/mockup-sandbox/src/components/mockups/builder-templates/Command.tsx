import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Terminal, Search, Play, Cpu, Hash } from "lucide-react";

const PALETTE_BLOCKS = [
  { type: "command",   label: "Comando",  key: "cmd", icon: MessageSquare, color: "#6D28D9" },
  { type: "action",    label: "Ação",     key: "act", icon: Zap,           color: "#7C3AED" },
  { type: "condition", label: "Condição", key: "cnd", icon: GitBranch,     color: "#F59E0B" },
  { type: "response",  label: "Resposta", key: "res", icon: MessageCircle, color: "#22C55E" },
  { type: "buttons",   label: "Botões",   key: "btn", icon: Layout,        color: "#06B6D4" },
];

const SAMPLE_NODES = [
  { id: "1", type: "command",   label: ".ban",          x: 60,  y: 90,  color: "#6D28D9", icon: MessageSquare },
  { id: "2", type: "condition", label: "É admin?",      x: 280, y: 40,  color: "#F59E0B", icon: GitBranch },
  { id: "3", type: "action",    label: "Banir membro",  x: 500, y: 40,  color: "#7C3AED", icon: Zap },
  { id: "4", type: "response",  label: "Sem permissão", x: 280, y: 180, color: "#22C55E", icon: MessageCircle },
];

function NodeBlock({ node }: { node: typeof SAMPLE_NODES[0] }) {
  const Icon = node.icon;
  return (
    <div className="absolute rounded-xl border font-mono" style={{
      left: node.x, top: node.y, width: 166, minHeight: 65,
      backgroundColor: "#0C0C18",
      borderColor: node.color + "40",
      borderLeftWidth: 3,
      borderLeftColor: node.color,
    }}>
      <div className="flex items-center gap-2 px-3 pt-2 pb-1.5" style={{ borderBottom: `1px solid ${node.color}18` }}>
        <Hash size={9} color={node.color} />
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: node.color + "CC" }}>{node.type}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[11px] font-bold text-[#C8C8E0]">{node.label}</p>
      </div>
      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-sm flex items-center justify-center border" style={{ backgroundColor: node.color, borderColor: node.color + "80", borderRadius: 4 }}>
        <div className="w-1.5 h-1.5 bg-white/80 rounded-full" />
      </div>
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm border" style={{ backgroundColor: "#0C0C18", borderColor: node.color + "50", borderRadius: 4 }} />
    </div>
  );
}

export function Command() {
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(100);
  const filtered = PALETTE_BLOCKS.filter(b => b.label.toLowerCase().includes(search.toLowerCase()) || !search);

  return (
    <div className="w-full h-screen flex flex-col font-mono overflow-hidden select-none" style={{ backgroundColor: "#06060B", fontFamily: "JetBrains Mono, Fira Code, monospace" }}>

      {/* Header — terminal bar */}
      <header className="flex items-center gap-4 px-5 py-3 border-b z-20" style={{ backgroundColor: "#0A0A12", borderColor: "#181826" }}>
        <button className="text-[#333355] hover:text-[#6666A0] text-xs flex items-center gap-1">
          <ChevronLeft size={14} /> ../bots
        </button>
        <div className="h-4 w-px bg-[#181826]" />
        <div className="flex items-center gap-2 flex-1">
          <Terminal size={14} color="#7C3AED" />
          <span className="text-sm font-bold text-[#D0D0F0]">bot_editor</span>
          <span className="text-xs text-[#333355]">~/MenuBot/flow.json</span>
          <div className="w-2 h-4 bg-[#7C3AED] animate-pulse ml-1" />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#333355]">[BETA]</span>
          <button className="px-3 py-1 rounded border text-[#7C3AED] border-[#7C3AED]/40 hover:bg-[#7C3AED]/10 text-[11px]">
            <Play size={10} className="inline mr-1" />run
          </button>
          <button className="px-3 py-1 rounded text-[11px] font-bold text-white" style={{ backgroundColor: "#7C3AED" }}>
            :w <Save size={10} className="inline" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Palette — command style */}
        <aside className="w-56 flex flex-col border-r overflow-hidden" style={{ backgroundColor: "#09090F", borderColor: "#181826" }}>
          {/* Search */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg border" style={{ backgroundColor: "#0C0C18", borderColor: "#181826" }}>
              <Search size={11} color="#333355" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="buscar bloco..."
                className="flex-1 bg-transparent text-[11px] text-[#8888C0] outline-none placeholder-[#2A2A45]"
              />
            </div>
          </div>
          <div className="px-3 pb-1">
            <p className="text-[8px] text-[#2A2A45] uppercase tracking-widest">// blocos disponíveis</p>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {filtered.map(b => {
              const Icon = b.icon;
              return (
                <div key={b.type} className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-1 border cursor-grab hover:border-opacity-60 transition-all group"
                  style={{ backgroundColor: b.color + "08", borderColor: b.color + "25" }}>
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ backgroundColor: b.color + "20", color: b.color + "CC" }}>{b.key}</span>
                  <span className="text-[11px] text-[#9090C0]">{b.label}</span>
                  <Plus size={9} color={b.color} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>

          <div className="border-t px-3 py-2" style={{ borderColor: "#181826" }}>
            <p className="text-[9px] text-[#222238]">ESC · SPC · Ctrl+S</p>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 relative overflow-hidden" style={{
          backgroundImage: `linear-gradient(#18182230 1px, transparent 1px), linear-gradient(90deg, #18182230 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          backgroundColor: "#06060B",
        }}>
          <div className="absolute top-3 left-4 text-[9px] text-[#222238] font-mono">// canvas — arraste blocos aqui</div>
          {SAMPLE_NODES.map(n => <NodeBlock key={n.id} node={n} />)}

          {/* Floating status */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-xl border text-[10px]"
            style={{ backgroundColor: "#0A0A14", borderColor: "#181826" }}>
            <Cpu size={11} color="#7C3AED" />
            <span className="text-[#333355]">4 blocos · 3 arestas</span>
            <div className="w-px h-3 bg-[#181826]" />
            <button onClick={() => setZoom(z => Math.max(50, z-10))} className="text-[#333355] hover:text-[#7C3AED]"><ZoomOut size={11} /></button>
            <span className="text-[#444466] w-8 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z+10))} className="text-[#333355] hover:text-[#7C3AED]"><ZoomIn size={11} /></button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Command;
