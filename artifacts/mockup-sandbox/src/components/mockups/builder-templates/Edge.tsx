import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, X, Move, Layers } from "lucide-react";

const NODE_CFG = [
  { type: "command",   label: "Comando",  icon: MessageSquare, color: "#6D28D9", dim: "#6D28D91A" },
  { type: "action",    label: "Ação",     icon: Zap,           color: "#7C3AED", dim: "#7C3AED1A" },
  { type: "condition", label: "Condição", icon: GitBranch,     color: "#F59E0B", dim: "#F59E0B1A" },
  { type: "response",  label: "Resposta", icon: MessageCircle, color: "#22C55E", dim: "#22C55E1A" },
  { type: "buttons",   label: "Botões",   icon: Layout,        color: "#06B6D4", dim: "#06B6D41A" },
];

const NODES = [
  { type: "command",   label: ".ranking",      x: 16, y: 40,  color: "#6D28D9", dim: "#6D28D91A", icon: MessageSquare },
  { type: "condition", label: "Tem grupo?",    x: 16, y: 160, color: "#F59E0B", dim: "#F59E0B1A", icon: GitBranch },
  { type: "response",  label: "🏆 Ranking!",   x: 16, y: 280, color: "#22C55E", dim: "#22C55E1A", icon: MessageCircle },
];

function Node({ n }: { n: typeof NODES[0] }) {
  const Icon = n.icon;
  return (
    <div className="absolute rounded-2xl border backdrop-blur-sm" style={{
      left: n.x, top: n.y, width: 240,
      background: `linear-gradient(135deg, ${n.color}16, ${n.color}08)`,
      borderColor: n.color + "38",
      boxShadow: `0 8px 32px ${n.color}14, inset 0 1px 0 ${n.color}20`,
    }}>
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5" style={{ borderBottom: `1px solid ${n.color}18` }}>
        <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: n.color + "25" }}>
          <Icon size={10} color={n.color} />
        </div>
        <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: n.color }}>{n.type}</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-semibold" style={{ color: "#EBEBF2" }}>{n.label}</p>
      </div>
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ background: `radial-gradient(circle, ${n.color}, ${n.color}AA)`, borderColor: "#07070C", boxShadow: `0 0 14px ${n.color}90` }}>
        <div className="w-2 h-2 rounded-full bg-white opacity-80" />
      </div>
      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border" style={{ backgroundColor: "#09090F", borderColor: n.color + "50" }} />
    </div>
  );
}

export function Edge() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [zoom, setZoom] = useState(100);

  return (
    <div className="w-[390px] h-[844px] flex flex-col overflow-hidden relative" style={{ backgroundColor: "#07070C", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1">
        <span className="text-[11px] font-semibold" style={{ color: "#EBEBF2" }}>9:41</span>
        <div className="w-4 h-2.5 rounded-sm border border-[#EBEBF2]/40 flex items-center pr-0.5">
          <div className="w-2.5 h-1.5 rounded-sm ml-0.5" style={{ backgroundColor: "#22C55E" }} />
        </div>
      </div>

      {/* Glass header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(10,10,20,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <button className="w-9 h-9 flex items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ChevronLeft size={18} color="#8E8E9E" />
          </button>
          <div>
            <p className="text-[14px] font-bold" style={{ color: "#EBEBF2" }}>MenuBot Pro</p>
            <p className="text-[9px]" style={{ color: "#3A3A58" }}>Builder · Auto-salvo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mini toolbar */}
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <button className="p-1" style={{ color: "#555575" }}><Move size={13} /></button>
            <button className="p-1" style={{ color: "#A78BFA" }}><Layers size={13} /></button>
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", boxShadow: "0 4px 14px #7C3AED45" }}>
            <Save size={15} color="white" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden" style={{
        backgroundImage: `radial-gradient(circle, rgba(124,58,237,0.12) 1px, transparent 1px)`,
        backgroundSize: "26px 26px",
        backgroundColor: "#07070C",
      }}>
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 40%, #7C3AED08 0%, transparent 60%)" }} />
        {NODES.map((n, i) => <Node key={i} n={n} />)}

        {/* Floating chip palette — top right */}
        {!paletteOpen && (
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {NODE_CFG.map(b => {
              const Icon = b.icon;
              return (
                <button
                  key={b.type}
                  title={b.label}
                  className="w-9 h-9 flex items-center justify-center rounded-2xl border backdrop-blur-sm"
                  style={{ background: `${b.color}14`, borderColor: `${b.color}30`, boxShadow: `0 2px 8px ${b.color}10` }}
                >
                  <Icon size={16} color={b.color} />
                </button>
              );
            })}
            <button
              onClick={() => setPaletteOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-2xl border backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
            >
              <Plus size={16} color="#8E8E9E" />
            </button>
          </div>
        )}

        {/* Zoom HUD */}
        <div className="absolute bottom-5 right-4 flex items-center gap-1 px-2.5 py-2 rounded-2xl border backdrop-blur" style={{ background: "rgba(10,10,20,0.85)", borderColor: "rgba(255,255,255,0.06)" }}>
          <button onClick={() => setZoom(z => Math.max(50, z-10))} className="p-1" style={{ color: "#444465" }}><ZoomOut size={13} /></button>
          <span className="text-[10px] font-mono w-8 text-center" style={{ color: "#555575" }}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z+10))} className="p-1" style={{ color: "#444465" }}><ZoomIn size={13} /></button>
        </div>

        {/* Info */}
        <div className="absolute bottom-5 left-4 px-3 py-1.5 rounded-2xl border backdrop-blur text-[10px]" style={{ background: "rgba(10,10,20,0.85)", borderColor: "rgba(255,255,255,0.06)", color: "#333355" }}>
          3 blocos · 2 conexões
        </div>
      </div>

      {/* Full palette sheet */}
      {paletteOpen && (
        <div className="absolute inset-0 z-30" style={{ backgroundColor: "#00000070" }} onClick={() => setPaletteOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl"
            style={{ background: "rgba(12,12,22,0.97)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(24px)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full" style={{ backgroundColor: "#20202B" }} /></div>
            <div className="flex items-center justify-between px-5 pb-3">
              <p className="text-[14px] font-bold" style={{ color: "#EBEBF2" }}>Blocos</p>
              <button onClick={() => setPaletteOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full" style={{ backgroundColor: "#20202B" }}>
                <X size={13} color="#8E8E9E" />
              </button>
            </div>
            <div className="px-4 pb-8 flex flex-col gap-2">
              {NODE_CFG.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.type} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border" style={{ background: `${b.color}12`, borderColor: `${b.color}35` }}>
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                      <Icon size={17} color={b.color} />
                    </div>
                    <span className="text-[13px] font-semibold flex-1" style={{ color: "#EBEBF2" }}>{b.label}</span>
                    <Plus size={14} color={b.color + "80"} />
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

export default Edge;
