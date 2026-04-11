import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Move, Play, Share2, Cpu, Layers, Eye, Settings } from "lucide-react";

const PALETTE_BLOCKS = [
  { type: "command",   label: "Comando",  icon: MessageSquare, color: "#6D28D9" },
  { type: "action",    label: "Ação",     icon: Zap,           color: "#8B5CF6" },
  { type: "condition", label: "Condição", icon: GitBranch,     color: "#F59E0B" },
  { type: "response",  label: "Resposta", icon: MessageCircle, color: "#22C55E" },
  { type: "buttons",   label: "Botões",   icon: Layout,        color: "#06B6D4" },
];

const SAMPLE_NODES = [
  { id: "1", type: "command",   label: ".ranking",      x: 50,  y: 110, color: "#6D28D9", icon: MessageSquare },
  { id: "2", type: "condition", label: "Tem grupo?",    x: 270, y: 60,  color: "#F59E0B", icon: GitBranch },
  { id: "3", type: "action",    label: "Calcular top",  x: 490, y: 60,  color: "#8B5CF6", icon: Zap },
  { id: "4", type: "response",  label: "Ranking 🏆",    x: 490, y: 200, color: "#22C55E", icon: MessageCircle },
  { id: "5", type: "response",  label: "Só em grupos",  x: 270, y: 200, color: "#22C55E", icon: MessageCircle },
];

function NodeBlock({ node }: { node: typeof SAMPLE_NODES[0] }) {
  const Icon = node.icon;
  return (
    <div className="absolute rounded-2xl border backdrop-blur-sm" style={{
      left: node.x, top: node.y, width: 162, minHeight: 72,
      background: `linear-gradient(135deg, ${node.color}16 0%, ${node.color}08 100%)`,
      borderColor: node.color + "38",
      boxShadow: `0 8px 32px ${node.color}14, inset 0 1px 0 ${node.color}25`,
    }}>
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5" style={{ borderBottom: `1px solid ${node.color}18` }}>
        <div className="w-4.5 h-4.5 rounded-md flex items-center justify-center" style={{ background: `${node.color}25` }}>
          <Icon size={10} color={node.color} />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: node.color }}>{node.type}</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[12px] font-semibold text-[#E8E8F2]">{node.label}</p>
      </div>
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ background: `radial-gradient(circle, ${node.color}, ${node.color}AA)`, borderColor: "#07070C", boxShadow: `0 0 14px ${node.color}90` }}>
        <div className="w-2 h-2 bg-white rounded-full opacity-80" />
      </div>
      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border" style={{ backgroundColor: "#0A0A12", borderColor: node.color + "50" }} />
    </div>
  );
}

export function Edge() {
  const [zoom, setZoom] = useState(100);
  const [paletteOpen, setPaletteOpen] = useState(true);

  return (
    <div className="w-full h-screen flex flex-col font-sans overflow-hidden select-none" style={{ backgroundColor: "#07070C", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header — frosted glass panel */}
      <header className="flex items-center justify-between px-5 py-3 z-20 relative" style={{
        background: "linear-gradient(to bottom, rgba(12,12,22,0.95), rgba(10,10,18,0.85))",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
      }}>
        <div className="flex items-center gap-3">
          <button className="w-7 h-7 flex items-center justify-center rounded-xl text-[#444465] hover:text-[#9090C0] hover:bg-white/5 transition-all">
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}>
                <Share2 size={13} color="white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] border border-[#07070C]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#E4E4F4]">MenuBot Pro</p>
              <p className="text-[9px] text-[#3A3A58]">Builder · Auto-salvo</p>
            </div>
          </div>
        </div>

        {/* Center mini toolbar */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-2xl border" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
          {[{ icon: Move, tip: "mover" }, { icon: Layers, tip: "layers" }, { icon: Eye, tip: "preview" }].map(({ icon: Icon, tip }) => (
            <button key={tip} title={tip} className="p-1.5 rounded-xl text-[#444465] hover:text-[#A0A0D0] hover:bg-white/05 transition-all">
              <Icon size={14} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-xl text-xs text-[#8B5CF6] border border-[#8B5CF6]/25 hover:bg-[#8B5CF6]/08 transition-colors flex items-center gap-1.5">
            <Play size={11} /> Simular
          </button>
          <button className="px-4 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", boxShadow: "0 4px 16px #7C3AED45" }}>
            <Save size={11} /> Publicar
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-xl text-[#444465] hover:text-[#9090C0] hover:bg-white/05 transition-all">
            <Settings size={14} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Canvas */}
        <main className="flex-1 relative overflow-hidden" style={{
          backgroundImage: `radial-gradient(circle, rgba(124,58,237,0.12) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          backgroundColor: "#07070C",
        }}>
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #7C3AED18 0%, transparent 70%)" }} />
            <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #22C55E14 0%, transparent 70%)" }} />
          </div>

          {SAMPLE_NODES.map(n => <NodeBlock key={n.id} node={n} />)}

          {/* Floating zoom HUD */}
          <div className="absolute bottom-5 left-5 flex items-center gap-1 px-3 py-2 rounded-2xl border backdrop-blur"
            style={{ background: "rgba(10,10,20,0.85)", borderColor: "rgba(255,255,255,0.06)" }}>
            <Cpu size={12} color="#555575" />
            <span className="text-[10px] text-[#333355] mx-1">5 blocos</span>
            <div className="w-px h-3.5 bg-[#181828] mx-1" />
            <button onClick={() => setZoom(z => Math.max(50, z-10))} className="p-1 text-[#444465] hover:text-[#A0A0D0]"><ZoomOut size={13} /></button>
            <span className="text-[11px] text-[#555575] font-mono w-9 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z+10))} className="p-1 text-[#444465] hover:text-[#A0A0D0]"><ZoomIn size={13} /></button>
          </div>
        </main>

        {/* Block palette — glass floating panel */}
        {paletteOpen && (
          <aside className="absolute top-4 right-4 w-52 rounded-2xl border backdrop-blur-2xl z-10 overflow-hidden"
            style={{ background: "rgba(10,10,20,0.88)", borderColor: "rgba(255,255,255,0.07)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] font-bold tracking-widest text-[#3A3A58] uppercase">Blocos</p>
              <button onClick={() => setPaletteOpen(false)} className="text-[#2A2A45] hover:text-[#6666A0] text-xs">×</button>
            </div>
            <div className="p-3 flex flex-col gap-1.5">
              {PALETTE_BLOCKS.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.type} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-grab hover:scale-[1.02] transition-all"
                    style={{ background: b.color + "10", borderColor: b.color + "28" }}>
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: b.color + "22" }}>
                      <Icon size={11} color={b.color} />
                    </div>
                    <span className="text-[11px] font-medium text-[#C0C0D8]">{b.label}</span>
                    <Plus size={9} color={b.color + "80"} className="ml-auto" />
                  </div>
                );
              })}
            </div>
          </aside>
        )}
        {!paletteOpen && (
          <button onClick={() => setPaletteOpen(true)} className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 rounded-2xl border backdrop-blur text-xs text-[#7C3AED]"
            style={{ background: "rgba(10,10,20,0.85)", borderColor: "#7C3AED30" }}>
            <Layers size={13} /> Blocos
          </button>
        )}
      </div>
    </div>
  );
}

export default Edge;
