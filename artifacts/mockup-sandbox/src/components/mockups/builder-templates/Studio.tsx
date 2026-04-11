import React, { useState } from "react";
import { Zap, MessageCircle, GitBranch, Layout, MessageSquare, Save, ChevronLeft, Plus, ZoomIn, ZoomOut, Play, Settings, Code, Layers, RefreshCw, AlertCircle } from "lucide-react";

const CATEGORIES = [
  { name: "Entradas", blocks: [
    { type: "command", label: "Comando", icon: MessageSquare, color: "#6D28D9", desc: "Recebe texto" },
  ]},
  { name: "Lógica", blocks: [
    { type: "condition", label: "Condição", icon: GitBranch, color: "#F59E0B", desc: "Ramificação" },
  ]},
  { name: "Ações", blocks: [
    { type: "action", label: "Ação", icon: Zap, color: "#7C3AED", desc: "Executa algo" },
    { type: "response", label: "Resposta", icon: MessageCircle, color: "#22C55E", desc: "Envia msg" },
    { type: "buttons", label: "Botões", icon: Layout, color: "#06B6D4", desc: "Menu inline" },
  ]},
];

const SAMPLE_NODES = [
  { id: "1", type: "command",   label: ".ajuda",        x: 50,  y: 100, color: "#6D28D9", icon: MessageSquare },
  { id: "2", type: "condition", label: "É admin?",      x: 270, y: 60,  color: "#F59E0B", icon: GitBranch },
  { id: "3", type: "action",    label: "Log de uso",    x: 270, y: 200, color: "#7C3AED", icon: Zap },
  { id: "4", type: "response",  label: "Menu Completo", x: 490, y: 100, color: "#22C55E", icon: MessageCircle },
  { id: "5", type: "buttons",   label: "Ações rápidas", x: 490, y: 240, color: "#06B6D4", icon: Layout },
];

function NodeBlock({ node }: { node: typeof SAMPLE_NODES[0] }) {
  const Icon = node.icon;
  return (
    <div className="absolute rounded-xl border" style={{
      left: node.x, top: node.y, width: 158, minHeight: 68,
      backgroundColor: node.color + "12",
      borderColor: node.color + "40",
    }}>
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5" style={{ borderBottom: `1px solid ${node.color}22` }}>
        <Icon size={10} color={node.color} />
        <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: node.color }}>{node.type}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[12px] font-semibold text-[#E8E8F2]">{node.label}</p>
      </div>
      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: node.color, borderColor: "#08080D" }}>
        <div className="w-1.5 h-1.5 bg-white/80 rounded-full" />
      </div>
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border" style={{ backgroundColor: "#0C0C16", borderColor: node.color + "55" }} />
    </div>
  );
}

export function Studio() {
  const [tab, setTab] = useState<"blocks"|"layers"|"code">("blocks");
  const [zoom, setZoom] = useState(100);
  const TABS = [
    { id: "blocks", label: "Blocos", icon: Layers },
    { id: "layers", label: "Camadas", icon: RefreshCw },
    { id: "code", label: "JSON", icon: Code },
  ] as const;

  return (
    <div className="w-full h-screen bg-[#07070C] flex flex-col font-sans overflow-hidden select-none" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header — studio style with tabs */}
      <header className="flex items-center gap-0 border-b border-[#141420] bg-[#0B0B14] z-20" style={{ minHeight: 52 }}>
        <div className="flex items-center gap-3 px-5 pr-4 border-r border-[#141420]">
          <button className="text-[#444460] hover:text-[#8888B0] transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7C3AED,#6D28D9)" }}>
              <Zap size={12} color="white" />
            </div>
            <span className="text-sm font-bold text-[#E0E0F0]">MenuBot Pro</span>
          </div>
        </div>

        {/* Center tabs */}
        <div className="flex items-center flex-1 justify-center gap-1 px-4">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs transition-all"
                style={tab === t.id ? { backgroundColor: "#7C3AED20", color: "#A78BFA", fontWeight: 600 } : { color: "#555575" }}
              >
                <Icon size={12} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-4 border-l border-[#141420]">
          <button className="p-1.5 rounded-lg text-[#555575] hover:text-[#A0A0C0] hover:bg-[#141420]"><Settings size={14} /></button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] text-[#7C3AED] border border-[#7C3AED]/30">
            <Play size={11} /> Simular
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg,#7C3AED,#6D28D9)" }}>
            <Save size={11} /> Salvar
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Left panel */}
        <aside className="w-56 bg-[#0B0B14] border-r border-[#141420] flex flex-col overflow-hidden">
          {tab === "blocks" && (
            <div className="flex-1 overflow-y-auto p-3">
              {CATEGORIES.map(cat => (
                <div key={cat.name} className="mb-4">
                  <p className="text-[9px] font-bold tracking-widest text-[#3A3A55] uppercase mb-2 px-1">{cat.name}</p>
                  <div className="flex flex-col gap-1.5">
                    {cat.blocks.map(b => {
                      const Icon = b.icon;
                      return (
                        <div key={b.type} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-grab hover:scale-[1.02] transition-all"
                          style={{ backgroundColor: b.color + "10", borderColor: b.color + "30" }}>
                          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: b.color + "20" }}>
                            <Icon size={12} color={b.color} />
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-[#D0D0E8]">{b.label}</p>
                            <p className="text-[9px] text-[#444460]">{b.desc}</p>
                          </div>
                          <Plus size={10} color={b.color} className="ml-auto flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "layers" && (
            <div className="flex-1 p-3">
              <p className="text-[10px] text-[#444460] px-1 mb-3">5 blocos no canvas</p>
              {SAMPLE_NODES.map((n, i) => {
                const Icon = n.icon;
                return (
                  <div key={n.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1 hover:bg-[#141420] cursor-pointer">
                    <Icon size={11} color={n.color} />
                    <span className="text-[11px] text-[#C0C0D8]">{n.label}</span>
                    <span className="ml-auto text-[9px] text-[#333355]">#{i+1}</span>
                  </div>
                );
              })}
            </div>
          )}
          {tab === "code" && (
            <div className="flex-1 p-3 overflow-y-auto">
              <pre className="text-[9px] text-[#6060A0] leading-relaxed font-mono">
{`{
  "nodes": [
    {
      "id": "1",
      "type": "command",
      "label": ".ajuda",
      "x": 50, "y": 100
    },
    ...
  ],
  "edges": [
    {
      "source": "1",
      "target": "2"
    }
  ]
}`}
              </pre>
            </div>
          )}
        </aside>

        {/* Canvas */}
        <main className="flex-1 relative overflow-hidden" style={{
          backgroundImage: `radial-gradient(circle, #1E1E2A40 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          backgroundColor: "#07070C",
        }}>
          {SAMPLE_NODES.map(n => <NodeBlock key={n.id} node={n} />)}

          {/* Bottom status bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-2 border-t border-[#141420] bg-[#0B0B14]/90 backdrop-blur">
            <div className="flex items-center gap-3 text-[10px] text-[#444460]">
              <span className="flex items-center gap-1"><AlertCircle size={10} /> 0 erros</span>
              <span>5 blocos · 4 conexões</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom(z => Math.max(50, z-10))} className="p-1 text-[#444460] hover:text-[#A0A0C0]"><ZoomOut size={13} /></button>
              <span className="text-[10px] text-[#555575] font-mono w-9 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(200, z+10))} className="p-1 text-[#444460] hover:text-[#A0A0C0]"><ZoomIn size={13} /></button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Studio;
