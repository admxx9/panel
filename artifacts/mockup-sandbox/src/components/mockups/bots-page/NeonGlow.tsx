import React from "react";
import { MessageCircle, Hash, Send, Plus, Settings, Trash2, Users, Wifi, Power, Loader } from "lucide-react";

type BotStatus = "connected" | "connecting" | "disconnected" | "error";
type Platform = "whatsapp" | "discord" | "telegram";

interface Bot {
  id: string;
  name: string;
  platform: Platform;
  status: BotStatus;
  phone?: string;
  groups: number;
  prefix: string;
}

const mockBots: Bot[] = [
  {
    id: "1",
    name: "Bot Vendas",
    platform: "whatsapp",
    status: "connected",
    phone: "+55 62 99373-5175",
    groups: 12,
    prefix: "!",
  },
  {
    id: "2",
    name: "Bot Suporte",
    platform: "whatsapp",
    status: "disconnected",
    phone: "+55 11 98765-4321",
    groups: 5,
    prefix: "/",
  },
  {
    id: "3",
    name: "Discord Helper",
    platform: "discord",
    status: "connected",
    groups: 3,
    prefix: "!",
  },
  {
    id: "4",
    name: "Telegram News",
    platform: "telegram",
    status: "connecting",
    groups: 1,
    prefix: ".",
  },
];

const PLATFORM_COLORS = {
  whatsapp: "#25D366",
  discord: "#5865F2",
  telegram: "#0088CC",
};

const PLATFORM_ICONS = {
  whatsapp: MessageCircle,
  discord: Hash,
  telegram: Send,
};

const STATUS_CONFIG = {
  connected: { color: "#22C55E", label: "Online", Icon: Wifi },
  connecting: { color: "#F59E0B", label: "Conectando", Icon: Loader },
  disconnected: { color: "#9CA3AF", label: "Offline", Icon: Power },
  error: { color: "#EF4444", label: "Erro", Icon: Power },
};

export function NeonGlow() {
  return (
    <div className="min-h-screen w-[390px] bg-[#0F0F14] font-sans text-[#F0F0F5] relative overflow-hidden flex flex-col mx-auto border-x border-[#2A2A35]">
      {/* Background Neon ambient glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-[#6D28D9] opacity-20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-[#25D366] opacity-10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="px-5 py-6 flex justify-between items-center z-10 sticky top-0 bg-[#0F0F14]/80 backdrop-blur-md border-b border-[#2A2A35]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            Meus Bots
          </h1>
          <p className="text-[#A0A0B0] text-sm mt-1">4 bots · 2 online</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-[#6D28D9] flex items-center justify-center shadow-[0_0_15px_rgba(109,40,217,0.5)] hover:shadow-[0_0_25px_rgba(109,40,217,0.8)] transition-shadow">
          <Plus size={20} color="#FFF" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 space-y-5 overflow-y-auto z-10 scrollbar-hide pb-24">
        {mockBots.map((bot) => {
          const platformColor = PLATFORM_COLORS[bot.platform];
          const PlatformIcon = PLATFORM_ICONS[bot.platform];
          const statusCfg = STATUS_CONFIG[bot.status];
          const StatusIcon = statusCfg.Icon;

          return (
            <div
              key={bot.id}
              className="relative rounded-2xl bg-[#1A1A24] border border-[#2A2A35] p-5 overflow-hidden group"
              style={{
                boxShadow: \`inset 0 0 20px -10px \${platformColor}, 0 0 10px -5px \${platformColor}\`,
              }}
            >
              {/* Animated top border glow */}
              <div 
                className="absolute top-0 left-0 right-0 h-[2px]" 
                style={{
                  background: \`linear-gradient(90deg, transparent, \${platformColor}, transparent)\`,
                  boxShadow: \`0 0 10px \${platformColor}\`
                }}
              />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                    style={{ backgroundColor: \`\${platformColor}15\` }}
                  >
                    <PlatformIcon size={24} color={platformColor} className="drop-shadow-[0_0_8px_rgba(currentColor,0.8)]" />
                    {/* Inner glowing ring */}
                    <div 
                      className="absolute inset-0 rounded-xl border border-white/10" 
                      style={{ boxShadow: \`inset 0 0 10px \${platformColor}30\` }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">{bot.name}</h3>
                    <p className="text-[#A0A0B0] text-xs mt-0.5 font-mono">
                      {bot.phone || "Sem número"}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border relative overflow-hidden"
                  style={{
                    backgroundColor: \`\${statusCfg.color}10\`,
                    borderColor: \`\${statusCfg.color}30\`,
                  }}
                >
                  <div 
                    className={\`w-2 h-2 rounded-full \${bot.status === 'connected' ? 'animate-pulse' : ''}\`}
                    style={{ 
                      backgroundColor: statusCfg.color,
                      boxShadow: \`0 0 8px \${statusCfg.color}\` 
                    }} 
                  />
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: statusCfg.color, textShadow: \`0 0 5px \${statusCfg.color}80\` }}
                  >
                    {statusCfg.label}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 mb-5 p-3 rounded-lg bg-black/40 border border-white/5">
                <div className="flex items-center gap-2">
                  <Users size={14} color="#A0A0B0" />
                  <span className="text-sm text-[#A0A0B0]">
                    <strong className="text-[#F0F0F5]">{bot.groups}</strong> {bot.platform === "discord" ? "servers" : "grupos"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash size={14} color="#A0A0B0" />
                  <span className="text-sm text-[#A0A0B0]">
                    prefix: <strong className="text-[#F0F0F5]">{bot.prefix}</strong>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1E1E28] border border-[#2A2A35] text-sm font-semibold text-[#A0A0B0] hover:bg-[#2A2A35] transition-colors">
                  <Settings size={16} />
                  Gerenciar
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#6D28D9] text-sm font-bold text-white shadow-[0_0_15px_rgba(109,40,217,0.4)] hover:shadow-[0_0_20px_rgba(109,40,217,0.6)] transition-all">
                  <MessageCircle size={16} />
                  Builder
                </button>
                <button className="w-11 flex items-center justify-center rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </main>
      
      {/* Global CSS for animations if needed */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
