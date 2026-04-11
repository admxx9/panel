import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Play, BarChart3, Bell, User, Sparkles, CornerDownRight } from "lucide-react";

const PALETTE_BLOCKS = [
  { type: "command",   label: "Comando",  icon: MessageSquare, color: "#6D28D9", count: 2 },
  { type: "action",    label: "Ação",     icon: Zap,           color: "#7C3AED", count: 3 },
  { type: "condition", label: "Condição", icon: GitBranch,     color: "#F59E0B", count: 1 },
  { type: "response",  label: "Resposta", icon: MessageCircle, color: "#22C55E", count: 4 },
  { type: "buttons",   label: "Botões",   icon: Layout,        color: "#06B6D4", count: 0 },
];

const SAMPLE_NODES = [
  { id: "1", type: "command",   label: ".coinflip",     x: 50,  y: 120, color: "#6D28D9", icon: MessageSquare },
  { id: "2", type: "action",    label: "Gerar resultado",x: 270, y: 60,  color: "#7C3AED", icon: Zap },
  { id: "3", type: "condition", label: "Cara ou coroa?", x: 270, y: 200, color: "#F59E0B", icon: GitBranch },
  { id: "4", type: "response",  label: "🪙 Cara!",      x: 500, y: 140, color: "#22C55E", icon: MessageCircle },
  { id: "5", type: "response",  label: "🪙 Coroa!",     x: 500, y: 280, color: "#22C55E", icon: MessageCircle },
];

function NodeBlock({ node }: { node: typeof SAMPLE_NODES[0] }) {
  const Icon = node.icon;
  return (
    <div className="absolute rounded-2xl border" style={{
      left: node.x, top: node.y, width: 170, minHeight: 72,
      backgroundColor: node.color + "14",
      borderColor: node.color + "45",
      boxShadow: `0 6px 24px ${node.color}10`,
    }}>
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-2" style={{ borderBottom: `1px solid ${node.color}22` }}>
        <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: node.color + "25" }}>
          <Icon size={11} color={node.color} />
        </div>
        <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: node.color }}>{node.type}</span>
        <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: node.color + "80" }} />
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[12px] font-semibold text-[#E8E8F4] leading-snug">{node.label}</p>
      </div>
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: node.color, borderColor: "#07070C", boxShadow: `0 0 12px ${node.color}` }}>
        <CornerDownRight size={8} color="white" />
      </div>
      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2" style={{ backgroundColor: "#0A0A14", borderColor: node.color + "50" }} />
    </div>
  );
}

export function Flow() {
  const [zoom, setZoom] = useState(100);
  const [activeType, setActiveType] = useState<string | null>(null);

  return (
    <div className="w-full h-screen flex flex-col font-sans overflow-hidden select-none" style={{ backgroundColor: "#08080E", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header — app-style with avatar and stats */}
      <header className="flex items-center justify-between px-5 py-3 border-b z-20" style={{ backgroundColor: "#0C0C18", borderColor: "#151522" }}>
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 flex items-center justify-center rounded-xl text-[#444465] hover:bg-[#141420] transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#E2E2F2]">Editor de Fluxo</h1>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "#7C3AED20", color: "#A78BFA" }}>BETA</span>
            </div>
            <p className="text-[9px] text-[#383858] flex items-center gap-1"><BarChart3 size={8} /> MenuBot Pro · 10 blocos no total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-xl text-[#444465] hover:bg-[#141420] transition-colors relative">
            <Bell size={15} />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7C3AED] border border-[#0C0C18]" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#8B5CF6] border border-[#8B5CF6]/25 hover:bg-[#8B5CF6]/08">
            <Play size={11} /> Testar
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", boxShadow: "0 4px 14px #7C3AED40" }}>
            <Save size={11} /> Salvar
          </button>
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#222235] flex items-center justify-center bg-[#141425]">
            <User size={15} color="#555575" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Compact palette bar */}
        <aside className="w-60 bg-[#0C0C18] border-r border-[#151522] flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-widest text-[#3A3A55] uppercase">Blocos disponíveis</p>
              <Sparkles size={12} color="#7C3AED" />
            </div>
            <div className="flex flex-col gap-1.5">
              {PALETTE_BLOCKS.map(b => {
                const Icon = b.icon;
                const isActive = activeType === b.type;
                return (
                  <div
                    key={b.type}
                    onClick={() => setActiveType(isActive ? null : b.type)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-grab transition-all hover:scale-[1.02]"
                    style={{
                      background: isActive ? b.color + "20" : b.color + "0C",
                      borderColor: isActive ? b.color + "55" : b.color + "25",
                      transform: isActive ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                      <Icon size={14} color={b.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#D0D0E8]">{b.label}</p>
                      {b.count > 0 && <p className="text-[9px] text-[#3A3A55]">{b.count} no fluxo</p>}
                    </div>
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                      <Plus size={10} color={b.color} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-[#151522]">
            <div className="rounded-xl p-3 border" style={{ background: "linear-gradient(135deg,#7C3AED14,#6D28D90C)", borderColor: "#7C3AED25" }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={12} color="#A78BFA" />
                <span className="text-[10px] font-bold text-[#A78BFA]">Dica</span>
              </div>
              <p className="text-[9px] text-[#444460] leading-relaxed">Toque num bloco para selecioná-lo, depois arraste-o para o canvas</p>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 relative overflow-hidden" style={{
          backgroundImage: `radial-gradient(circle, #1E1E2A55 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          backgroundColor: "#08080E",
        }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 40%, #7C3AED0A 0%, transparent 60%)" }} />
          {SAMPLE_NODES.map(n => <NodeBlock key={n.id} node={n} />)}

          {/* Floating zoom */}
          <div className="absolute bottom-5 right-5 flex items-center gap-1 px-3 py-2 rounded-2xl border backdrop-blur"
            style={{ background: "rgba(10,10,20,0.9)", borderColor: "#1E1E2A" }}>
            <button onClick={() => setZoom(z => Math.max(50, z-10))} className="p-1 text-[#444465] hover:text-[#A0A0D0]"><ZoomOut size={13} /></button>
            <span className="text-[11px] text-[#555575] font-mono w-9 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z+10))} className="p-1 text-[#444465] hover:text-[#A0A0D0]"><ZoomIn size={13} /></button>
          </div>

          {/* Canvas info */}
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px]" style={{ backgroundColor: "rgba(10,10,20,0.8)", borderColor: "#1E1E2A" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            <span className="text-[#444465]">5 blocos · 4 conexões</span>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Flow;
