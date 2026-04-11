import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, X, Sparkles } from "lucide-react";

const NODE_CFG = [
  { type: "command",   label: "Comando",  desc: "Gatilho de texto", icon: MessageSquare, color: "#6D28D9", dim: "#6D28D91A" },
  { type: "action",    label: "Ação",     desc: "Executa função",   icon: Zap,           color: "#7C3AED", dim: "#7C3AED1A" },
  { type: "condition", label: "Condição", desc: "Desvio lógico",    icon: GitBranch,     color: "#F59E0B", dim: "#F59E0B1A" },
  { type: "response",  label: "Resposta", desc: "Envia mensagem",   icon: MessageCircle, color: "#22C55E", dim: "#22C55E1A" },
  { type: "buttons",   label: "Botões",   desc: "Menu inline",      icon: Layout,        color: "#06B6D4", dim: "#06B6D41A" },
];

const NODES = [
  { type: "command",   label: ".menu",         x: 18,  y: 40,  color: "#6D28D9", dim: "#6D28D91A", icon: MessageSquare },
  { type: "condition", label: "Tem plano?",    x: 190, y: 0,   color: "#F59E0B", dim: "#F59E0B1A", icon: GitBranch },
  { type: "response",  label: "Menu Premium",  x: 190, y: 120, color: "#22C55E", dim: "#22C55E1A", icon: MessageCircle },
  { type: "buttons",   label: "Opções rápidas",x: 190, y: 240, color: "#06B6D4", dim: "#06B6D41A", icon: Layout },
];

function Node({ n }: { n: typeof NODES[0] }) {
  const Icon = n.icon;
  return (
    <div className="absolute rounded-2xl border" style={{ left: n.x, top: n.y, width: 158, backgroundColor: n.dim, borderColor: n.color + "45", boxShadow: `0 4px 20px ${n.color}10` }}>
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5" style={{ borderBottom: `1px solid ${n.color}25` }}>
        <div className="w-4 h-4 rounded-md flex items-center justify-center" style={{ backgroundColor: n.color + "25" }}>
          <Icon size={9} color={n.color} />
        </div>
        <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: n.color }}>{n.type}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[12px] font-semibold" style={{ color: "#EBEBF2" }}>{n.label}</p>
      </div>
      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: n.color, borderColor: "#0C0C11", boxShadow: `0 0 10px ${n.color}` }}>
        <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
      </div>
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border" style={{ backgroundColor: "#0C0C11", borderColor: n.color + "55" }} />
    </div>
  );
}

export function Orbital() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  return (
    <div className="w-[390px] h-[844px] flex flex-col overflow-hidden relative" style={{ backgroundColor: "#0C0C11", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1">
        <span className="text-[11px] font-semibold" style={{ color: "#EBEBF2" }}>9:41</span>
        <div className="w-4 h-2.5 rounded-sm border border-[#EBEBF2]/40 flex items-center pr-0.5">
          <div className="w-2.5 h-1.5 rounded-sm ml-0.5" style={{ backgroundColor: "#22C55E" }} />
        </div>
      </div>

      {/* Bold gradient header */}
      <div className="px-4 pb-4 pt-2" style={{ background: "linear-gradient(180deg, #13131D 0%, #0C0C11 100%)", borderBottom: "1px solid #20202B" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button className="w-9 h-9 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "#20202B" }}>
              <ChevronLeft size={18} color="#8E8E9E" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-bold" style={{ color: "#EBEBF2" }}>MenuBot Pro</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold" style={{ backgroundColor: "#6D28D920", color: "#A78BFA" }}>PRO</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22C55E" }} />
                <p className="text-[10px]" style={{ color: "#8E8E9E" }}>Fluxo ativo · 4 blocos</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "#6D28D9" + "20", border: "1px solid #6D28D960" }}>
              <Sparkles size={15} color="#A78BFA" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 4px 14px #6D28D940" }}>
              <Save size={15} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden" style={{
        backgroundImage: `radial-gradient(circle, #20202B55 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, #7C3AED08 0%, transparent 65%)" }} />
        {NODES.map((n, i) => <Node key={i} n={n} />)}

        {/* Zoom — top right */}
        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-2xl border px-2 py-1.5" style={{ backgroundColor: "#13131D", borderColor: "#20202B" }}>
          <button onClick={() => setZoom(z => Math.max(50, z-10))} className="p-1" style={{ color: "#8E8E9E" }}><ZoomOut size={13} /></button>
          <span className="text-[9px] font-mono w-8 text-center" style={{ color: "#555575" }}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z+10))} className="p-1" style={{ color: "#8E8E9E" }}><ZoomIn size={13} /></button>
        </div>

        {/* FAB */}
        <button
          onClick={() => setPaletteOpen(true)}
          className="absolute bottom-6 right-4 w-14 h-14 flex items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 8px 24px #6D28D950" }}
        >
          <Plus size={24} color="white" />
        </button>
      </div>

      {/* Palette overlay */}
      {paletteOpen && (
        <div className="absolute inset-0 z-30" style={{ backgroundColor: "#00000070" }} onClick={() => setPaletteOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl"
            style={{ backgroundColor: "#13131D", border: "1px solid #20202B" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "#20202B" }} />
            </div>
            <div className="flex items-center justify-between px-5 pb-4">
              <p className="text-[14px] font-bold" style={{ color: "#EBEBF2" }}>Adicionar bloco</p>
              <button onClick={() => setPaletteOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full" style={{ backgroundColor: "#20202B" }}>
                <X size={14} color="#8E8E9E" />
              </button>
            </div>
            <div className="px-4 pb-8 flex flex-col gap-2.5">
              {NODE_CFG.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.type} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border" style={{ backgroundColor: b.dim, borderColor: b.color + "40" }}>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                      <Icon size={18} color={b.color} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold" style={{ color: "#EBEBF2" }}>{b.label}</p>
                      <p className="text-[10px]" style={{ color: "#8E8E9E" }}>{b.desc}</p>
                    </div>
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                      <Plus size={14} color={b.color} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orbital;
