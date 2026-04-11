import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Move, Play, Sparkles, MoreHorizontal, Clock } from "lucide-react";

const PALETTE_BLOCKS = [
  { type: "command",   label: "Comando",  icon: MessageSquare, color: "#6D28D9", desc: "Gatilho de texto" },
  { type: "action",    label: "Ação",     icon: Zap,           color: "#7C3AED", desc: "Executa função" },
  { type: "condition", label: "Condição", icon: GitBranch,     color: "#F59E0B", desc: "Desvio lógico" },
  { type: "response",  label: "Resposta", icon: MessageCircle, color: "#22C55E", desc: "Envia mensagem" },
  { type: "buttons",   label: "Botões",   icon: Layout,        color: "#06B6D4", desc: "Menu interativo" },
];

const SAMPLE_NODES = [
  { id: "1", type: "command",   label: ".menu",         x: 60,  y: 130, color: "#6D28D9", icon: MessageSquare },
  { id: "2", type: "action",    label: "Buscar Dados",  x: 280, y: 70,  color: "#7C3AED", icon: Zap },
  { id: "3", type: "condition", label: "Tem plano?",    x: 280, y: 210, color: "#F59E0B", icon: GitBranch },
  { id: "4", type: "response",  label: "Menu Premium",  x: 510, y: 140, color: "#22C55E", icon: MessageCircle },
  { id: "5", type: "buttons",   label: "Opções",        x: 510, y: 280, color: "#06B6D4", icon: Layout },
];

function NodeBlock({ node }: { node: typeof SAMPLE_NODES[0] }) {
  const Icon = node.icon;
  return (
    <div className="absolute rounded-2xl border" style={{
      left: node.x, top: node.y, width: 160, minHeight: 70,
      background: `linear-gradient(135deg, ${node.color}18, ${node.color}08)`,
      borderColor: node.color + "45",
      boxShadow: `0 8px 32px ${node.color}12, inset 0 1px 0 ${node.color}20`,
    }}>
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5" style={{ borderBottom: `1px solid ${node.color}25` }}>
        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: node.color + "25" }}>
          <Icon size={10} color={node.color} />
        </div>
        <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: node.color }}>{node.type}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[12px] font-semibold text-[#E8E8F2] leading-snug">{node.label}</p>
      </div>
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: node.color, borderColor: "#08080D", boxShadow: `0 0 12px ${node.color}` }}>
        <div className="w-2 h-2 bg-white/80 rounded-full" />
      </div>
      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2" style={{ backgroundColor: "#0C0C18", borderColor: node.color + "50" }} />
    </div>
  );
}

export function Orbital() {
  const [zoom, setZoom] = useState(100);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  return (
    <div className="w-full h-screen bg-[#08080D] flex flex-col font-sans overflow-hidden select-none" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header — bold gradient pill */}
      <header className="px-5 py-2.5 flex items-center justify-between relative z-20" style={{ background: "linear-gradient(to bottom, #0F0F1A, #08080D)" }}>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-[#444460] hover:text-[#8888B0] transition-colors text-xs">
            <ChevronLeft size={15} />
            Voltar
          </button>
          <div className="h-6 w-px bg-[#1A1A28]" />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)" }}>
              <Zap size={14} color="white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#E0E0F0] leading-none">MenuBot Pro</p>
              <p className="text-[9px] text-[#444460] mt-0.5 flex items-center gap-1"><Clock size={8} />Editado há 2 min</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#111118] border border-[#1E1E2E]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
            <span className="text-[10px] text-[#666680]">não salvo</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#A78BFA] border border-[#7C3AED]/30 bg-[#7C3AED]/08 hover:bg-[#7C3AED]/15 transition-colors">
            <Play size={11} /> Simular
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all" style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", boxShadow: "0 4px 14px #7C3AED50" }}>
            <Save size={11} /> Salvar
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#111118] border border-[#1E1E2E] text-[#444460] hover:text-[#8888B0]">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas — first */}
        <main className="flex-1 relative overflow-hidden" style={{
          backgroundImage: `linear-gradient(#1A1A2808 1px, transparent 1px), linear-gradient(90deg, #1A1A2808 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}>
          {/* Glow spot */}
          <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, #7C3AED08 0%, transparent 70%)" }} />
          {SAMPLE_NODES.map(n => <NodeBlock key={n.id} node={n} />)}

          {/* Floating zoom bar */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#0E0E18]/95 border border-[#1E1E2A] rounded-2xl px-3 py-2 backdrop-blur gap-2">
            <button onClick={() => setZoom(z => Math.max(50, z-10))} className="p-1 text-[#444460] hover:text-[#A0A0C0]"><ZoomOut size={14} /></button>
            <span className="text-[11px] text-[#7070A0] font-mono w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z+10))} className="p-1 text-[#444460] hover:text-[#A0A0C0]"><ZoomIn size={14} /></button>
            <div className="w-px h-4 bg-[#1E1E2A]" />
            <button className="p-1 text-[#444460] hover:text-[#A0A0C0]"><Move size={14} /></button>
            <button className="p-1.5 rounded-lg text-white" style={{ backgroundColor: "#7C3AED" }}><Sparkles size={13} /></button>
          </div>
        </main>

        {/* Block Palette — right side panel */}
        <aside className="w-56 bg-[#0C0C16] border-l border-[#141420] flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-2 border-b border-[#141420]">
            <p className="text-[10px] font-bold tracking-widest text-[#444460] uppercase">Biblioteca de Blocos</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {PALETTE_BLOCKS.map(b => {
              const Icon = b.icon;
              const isActive = activeBlock === b.type;
              return (
                <div
                  key={b.type}
                  onClick={() => setActiveBlock(isActive ? null : b.type)}
                  className="rounded-xl border p-3 cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02]"
                  style={{
                    background: isActive ? b.color + "22" : b.color + "0E",
                    borderColor: isActive ? b.color + "60" : b.color + "28",
                    boxShadow: isActive ? `0 4px 16px ${b.color}20` : "none",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: b.color + "25" }}>
                      <Icon size={12} color={b.color} />
                    </div>
                    <span className="text-xs font-semibold text-[#D0D0E8]">{b.label}</span>
                    <Plus size={10} color={b.color} className="ml-auto" />
                  </div>
                  <p className="text-[9px] text-[#555575] ml-8">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Orbital;
