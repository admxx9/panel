import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, ChevronUp, ChevronDown, Play } from "lucide-react";

const NODE_CFG = [
  { type: "command",   label: "Comando",  icon: MessageSquare, color: "#6D28D9", dim: "#6D28D91A" },
  { type: "action",    label: "Ação",     icon: Zap,           color: "#7C3AED", dim: "#7C3AED1A" },
  { type: "condition", label: "Condição", icon: GitBranch,     color: "#F59E0B", dim: "#F59E0B1A" },
  { type: "response",  label: "Resposta", icon: MessageCircle, color: "#22C55E", dim: "#22C55E1A" },
  { type: "buttons",   label: "Botões",   icon: Layout,        color: "#06B6D4", dim: "#06B6D41A" },
];

const NODES = [
  { type: "command",   label: ".figurinha",   x: 20,  y: 60,  color: "#6D28D9", dim: "#6D28D91A", icon: MessageSquare },
  { type: "action",    label: "Criar Sticker",x: 195, y: 0,   color: "#7C3AED", dim: "#7C3AED1A", icon: Zap },
  { type: "condition", label: "Tem imagem?",  x: 195, y: 120, color: "#F59E0B", dim: "#F59E0B1A", icon: GitBranch },
  { type: "response",  label: "Sem imagem!",  x: 195, y: 240, color: "#22C55E", dim: "#22C55E1A", icon: MessageCircle },
];

function Node({ n }: { n: typeof NODES[0] }) {
  const Icon = n.icon;
  return (
    <div className="absolute rounded-2xl border" style={{ left: n.x, top: n.y, width: 154, backgroundColor: n.dim, borderColor: n.color + "45" }}>
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5" style={{ borderBottom: `1px solid ${n.color}25` }}>
        <Icon size={10} color={n.color} />
        <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: n.color }}>{n.type}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[12px] font-semibold" style={{ color: "#EBEBF2" }}>{n.label}</p>
      </div>
      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: n.color, boxShadow: `0 0 8px ${n.color}` }}>
        <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
      </div>
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border" style={{ backgroundColor: "#0C0C11", borderColor: n.color + "55" }} />
    </div>
  );
}

export function Minimal() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  return (
    <div className="w-[390px] h-[844px] flex flex-col overflow-hidden relative" style={{ backgroundColor: "#0C0C11", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1">
        <span className="text-[11px] font-semibold" style={{ color: "#EBEBF2" }}>9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2.5 rounded-sm border border-[#EBEBF2]/40 flex items-center pr-0.5">
            <div className="w-2.5 h-1.5 rounded-sm ml-0.5" style={{ backgroundColor: "#22C55E" }} />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#20202B" }}>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#13131D" }}>
            <ChevronLeft size={18} color="#8E8E9E" />
          </button>
          <div>
            <p className="text-[14px] font-bold" style={{ color: "#EBEBF2" }}>MenuBot Pro</p>
            <p className="text-[10px]" style={{ color: "#8E8E9E" }}>Editor de fluxo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold" style={{ backgroundColor: "#6D28D9" + "22", color: "#A78BFA" }}>
            <Play size={11} /> Testar
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#6D28D9" }}>
            <Save size={15} color="white" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden" style={{
        backgroundImage: `radial-gradient(circle, #20202B 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 40% 50%, #6D28D90A 0%, transparent 60%)" }} />
        {NODES.map((n, i) => <Node key={i} n={n} />)}

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1 rounded-2xl overflow-hidden border" style={{ backgroundColor: "#13131D", borderColor: "#20202B" }}>
          <button onClick={() => setZoom(z => Math.min(200, z+10))} className="p-2.5" style={{ color: "#8E8E9E" }}><ZoomIn size={15} /></button>
          <div className="text-[9px] font-mono py-1 text-center w-10" style={{ color: "#555570" }}>{zoom}%</div>
          <button onClick={() => setZoom(z => Math.max(50, z-10))} className="p-2.5" style={{ color: "#8E8E9E" }}><ZoomOut size={15} /></button>
        </div>

        {/* Trigger button for sheet */}
        <button
          onClick={() => setSheetOpen(true)}
          className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl border"
          style={{ backgroundColor: "#13131D", borderColor: "#6D28D9" + "50" }}
        >
          <Plus size={14} color="#A78BFA" />
          <span className="text-[12px] font-semibold" style={{ color: "#A78BFA" }}>Adicionar bloco</span>
        </button>
      </div>

      {/* Bottom sheet overlay */}
      {sheetOpen && (
        <div className="absolute inset-0 z-20" style={{ backgroundColor: "#00000060" }} onClick={() => setSheetOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-x"
            style={{ backgroundColor: "#13131D", borderColor: "#20202B" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "#20202B" }} />
            </div>
            <div className="flex items-center justify-between px-5 pb-3">
              <p className="text-[13px] font-bold" style={{ color: "#EBEBF2" }}>Escolher bloco</p>
              <button onClick={() => setSheetOpen(false)}><ChevronDown size={18} color="#8E8E9E" /></button>
            </div>
            <div className="px-4 pb-6 grid grid-cols-1 gap-2">
              {NODE_CFG.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.type} className="flex items-center gap-3 px-4 py-3 rounded-2xl border" style={{ backgroundColor: b.dim, borderColor: b.color + "40" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: b.color + "25" }}>
                      <Icon size={16} color={b.color} />
                    </div>
                    <span className="text-[13px] font-semibold flex-1" style={{ color: "#EBEBF2" }}>{b.label}</span>
                    <Plus size={14} color={b.color} />
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

export default Minimal;
