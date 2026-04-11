import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Layers, Code2, Settings } from "lucide-react";

const NODE_CFG = [
  { type: "command",   label: "Comando",  icon: MessageSquare, color: "#6D28D9", dim: "#6D28D91A" },
  { type: "action",    label: "Ação",     icon: Zap,           color: "#7C3AED", dim: "#7C3AED1A" },
  { type: "condition", label: "Condição", icon: GitBranch,     color: "#F59E0B", dim: "#F59E0B1A" },
  { type: "response",  label: "Resposta", icon: MessageCircle, color: "#22C55E", dim: "#22C55E1A" },
  { type: "buttons",   label: "Botões",   icon: Layout,        color: "#06B6D4", dim: "#06B6D41A" },
];

const NODES = [
  { type: "command",   label: ".ajuda",       x: 14, y: 30,  color: "#6D28D9", dim: "#6D28D91A", icon: MessageSquare },
  { type: "condition", label: "É admin?",     x: 14, y: 150, color: "#F59E0B", dim: "#F59E0B1A", icon: GitBranch },
  { type: "response",  label: "Menu Completo",x: 14, y: 270, color: "#22C55E", dim: "#22C55E1A", icon: MessageCircle },
];

function Node({ n }: { n: typeof NODES[0] }) {
  const Icon = n.icon;
  return (
    <div className="absolute rounded-2xl border" style={{ left: n.x, top: n.y, width: 220, backgroundColor: n.dim, borderColor: n.color + "45" }}>
      <div className="flex items-center gap-1.5 px-3 pt-2 pb-1.5" style={{ borderBottom: `1px solid ${n.color}25` }}>
        <Icon size={10} color={n.color} />
        <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: n.color }}>{n.type}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[13px] font-semibold" style={{ color: "#EBEBF2" }}>{n.label}</p>
      </div>
      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: n.color, boxShadow: `0 0 8px ${n.color}` }}>
        <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
      </div>
    </div>
  );
}

const SIDE_TABS = [
  { id: "blocks", icon: Layers },
  { id: "code",   icon: Code2 },
  { id: "config", icon: Settings },
];

export function Studio() {
  const [sideTab, setSideTab] = useState("blocks");
  const [zoom, setZoom] = useState(100);

  return (
    <div className="w-[390px] h-[844px] flex flex-col overflow-hidden" style={{ backgroundColor: "#0C0C11", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1">
        <span className="text-[11px] font-semibold" style={{ color: "#EBEBF2" }}>9:41</span>
        <div className="w-4 h-2.5 rounded-sm border border-[#EBEBF2]/40 flex items-center pr-0.5">
          <div className="w-2.5 h-1.5 rounded-sm ml-0.5" style={{ backgroundColor: "#22C55E" }} />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#20202B" }}>
            <ChevronLeft size={16} color="#8E8E9E" />
          </button>
          <p className="text-[14px] font-bold" style={{ color: "#EBEBF2" }}>Studio — MenuBot</p>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: "#6D28D9" }}>
          <Save size={14} color="white" />
        </button>
      </div>

      {/* Body: side tab + canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left icon bar */}
        <div className="flex flex-col items-center pt-3 gap-2 border-r" style={{ width: 52, backgroundColor: "#13131D", borderColor: "#20202B" }}>
          {SIDE_TABS.map(t => {
            const Icon = t.icon;
            const isActive = sideTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSideTab(t.id)}
                className="w-9 h-9 flex items-center justify-center rounded-xl"
                style={{ backgroundColor: isActive ? "#6D28D9" + "25" : "transparent", border: isActive ? "1px solid #6D28D955" : "1px solid transparent" }}
              >
                <Icon size={16} color={isActive ? "#A78BFA" : "#555575"} />
              </button>
            );
          })}

          {/* Divider + add */}
          <div className="w-6 h-px mt-1" style={{ backgroundColor: "#20202B" }} />
          {NODE_CFG.map(b => {
            const Icon = b.icon;
            return (
              <button
                key={b.type}
                title={b.label}
                className="w-9 h-9 flex items-center justify-center rounded-xl"
                style={{ backgroundColor: b.color + "15", border: `1px solid ${b.color}30` }}
              >
                <Icon size={14} color={b.color} />
              </button>
            );
          })}
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden" style={{
          backgroundImage: `radial-gradient(circle, #20202B 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}>
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, #6D28D90A 0%, transparent 65%)" }} />
          {NODES.map((n, i) => <Node key={i} n={n} />)}

          {/* Bottom zoom */}
          <div className="absolute bottom-4 right-3 flex items-center gap-1 rounded-2xl border px-2 py-1.5" style={{ backgroundColor: "#13131D", borderColor: "#20202B" }}>
            <button onClick={() => setZoom(z => Math.max(50, z-10))} className="p-1" style={{ color: "#8E8E9E" }}><ZoomOut size={12} /></button>
            <span className="text-[9px] font-mono w-7 text-center" style={{ color: "#555575" }}>{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z+10))} className="p-1" style={{ color: "#8E8E9E" }}><ZoomIn size={12} /></button>
          </div>

          {/* Info tag */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl border text-[10px]" style={{ backgroundColor: "#13131D", borderColor: "#20202B", color: "#555575" }}>
            3 blocos · 2 arestas
          </div>
        </div>
      </div>

      {/* Bottom label */}
      <div className="px-4 py-2 border-t flex items-center justify-between" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22C55E" }} />
          <span className="text-[10px]" style={{ color: "#8E8E9E" }}>0 erros · salvo há 2 min</span>
        </div>
        <button className="flex items-center gap-1 text-[10px]" style={{ color: "#A78BFA" }}>
          <Plus size={11} /> Bloco
        </button>
      </div>
    </div>
  );
}

export default Studio;
