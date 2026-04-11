import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Home, BarChart3, Settings, Sparkles } from "lucide-react";

const NODE_CFG = [
  { type: "command",   label: "Comando",  desc: "Gatilho de texto",  icon: MessageSquare, color: "#6D28D9", dim: "#6D28D91A", count: 2 },
  { type: "action",    label: "Ação",     desc: "Executa função",    icon: Zap,           color: "#7C3AED", dim: "#7C3AED1A", count: 3 },
  { type: "condition", label: "Condição", desc: "Ramificação lógica",icon: GitBranch,     color: "#F59E0B", dim: "#F59E0B1A", count: 1 },
  { type: "response",  label: "Resposta", desc: "Envia mensagem",    icon: MessageCircle, color: "#22C55E", dim: "#22C55E1A", count: 4 },
  { type: "buttons",   label: "Botões",   desc: "Menu interativo",   icon: Layout,        color: "#06B6D4", dim: "#06B6D41A", count: 0 },
];

const NODES = [
  { type: "command",   label: ".coinflip",     x: 16, y: 40,  color: "#6D28D9", dim: "#6D28D91A", icon: MessageSquare },
  { type: "action",    label: "Sortear cara/coroa", x: 16, y: 160, color: "#7C3AED", dim: "#7C3AED1A", icon: Zap },
  { type: "response",  label: "🪙 Cara!",      x: 16, y: 280, color: "#22C55E", dim: "#22C55E1A", icon: MessageCircle },
];

function Node({ n }: { n: typeof NODES[0] }) {
  const Icon = n.icon;
  return (
    <div className="absolute rounded-2xl border" style={{ left: n.x, top: n.y, width: 236, backgroundColor: n.dim, borderColor: n.color + "45", boxShadow: `0 6px 24px ${n.color}10` }}>
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-2" style={{ borderBottom: `1px solid ${n.color}22` }}>
        <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ backgroundColor: n.color + "25" }}>
          <Icon size={10} color={n.color} />
        </div>
        <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: n.color }}>{n.type}</span>
        <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: n.color + "80" }} />
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-semibold" style={{ color: "#EBEBF2" }}>{n.label}</p>
      </div>
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: n.color, borderColor: "#07070C", boxShadow: `0 0 12px ${n.color}` }}>
        <div className="w-2 h-2 rounded-full bg-white/80" />
      </div>
      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2" style={{ backgroundColor: "#0C0C11", borderColor: n.color + "50" }} />
    </div>
  );
}

const BOTTOM_TABS = [
  { id: "canvas", label: "Canvas", icon: Home },
  { id: "blocks", label: "Blocos", icon: Sparkles },
  { id: "stats",  label: "Stats",  icon: BarChart3 },
  { id: "config", label: "Config", icon: Settings },
];

export function Flow() {
  const [activeTab, setActiveTab] = useState("canvas");
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
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
        <div className="flex items-center gap-2.5">
          <button className="w-9 h-9 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "#20202B" }}>
            <ChevronLeft size={18} color="#8E8E9E" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-bold" style={{ color: "#EBEBF2" }}>Editor de Fluxo</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22C55E" }} />
              <p className="text-[10px]" style={{ color: "#8E8E9E" }}>MenuBot Pro · 10 blocos</p>
            </div>
          </div>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 4px 14px #6D28D940" }}>
          <Save size={15} color="white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === "canvas" && (
          <div className="w-full h-full relative" style={{
            backgroundImage: `radial-gradient(circle, #20202B55 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}>
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 40%, #7C3AED0A 0%, transparent 65%)" }} />
            {NODES.map((n, i) => <Node key={i} n={n} />)}
            <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-2xl border px-2.5 py-2" style={{ backgroundColor: "#13131D", borderColor: "#20202B" }}>
              <button onClick={() => setZoom(z => Math.max(50, z-10))} style={{ color: "#8E8E9E" }}><ZoomOut size={13} /></button>
              <span className="text-[9px] font-mono w-8 text-center" style={{ color: "#555575" }}>{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(200, z+10))} style={{ color: "#8E8E9E" }}><ZoomIn size={13} /></button>
            </div>
            <div className="absolute top-4 right-4 text-[10px] px-2.5 py-1 rounded-xl border" style={{ backgroundColor: "#13131D", borderColor: "#20202B", color: "#555575" }}>3 blocos · 2 arestas</div>
          </div>
        )}

        {activeTab === "blocks" && (
          <div className="h-full overflow-y-auto p-4" style={{ backgroundColor: "#0C0C11" }}>
            <p className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: "#555575" }}>Biblioteca de blocos</p>
            <div className="flex flex-col gap-3">
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
                    <div className="flex items-center gap-1.5">
                      {b.count > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: b.color + "20", color: b.color }}>{b.count}</span>}
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                        <Plus size={14} color={b.color} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(activeTab === "stats" || activeTab === "config") && (
          <div className="h-full flex items-center justify-center" style={{ color: "#555575" }}>
            <p className="text-[13px]">{activeTab === "stats" ? "📊 Estatísticas" : "⚙️ Configurações"}</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="border-t" style={{ borderColor: "#20202B", backgroundColor: "#13131D" }}>
        <div className="flex items-center justify-around px-2 pt-2 pb-4">
          {BOTTOM_TABS.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all"
                style={isActive ? { backgroundColor: "#6D28D9" + "20" } : {}}
              >
                <Icon size={18} color={isActive ? "#A78BFA" : "#555575"} />
                <span className="text-[9px] font-semibold" style={{ color: isActive ? "#A78BFA" : "#555575" }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Flow;
