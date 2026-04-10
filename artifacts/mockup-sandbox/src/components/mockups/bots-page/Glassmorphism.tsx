import React from "react";
import { Plus, MessageCircle, MessageSquare, Send, ChevronRight } from "lucide-react";

const bots = [
  {
    id: 1,
    name: "Bot Vendas",
    platform: "whatsapp",
    status: "online",
    detail: "12 groups",
  },
  {
    id: 2,
    name: "Bot Suporte",
    platform: "whatsapp",
    status: "offline",
    detail: "5 groups",
  },
  {
    id: 3,
    name: "Discord Helper",
    platform: "discord",
    status: "online",
    detail: "3 servers",
  },
  {
    id: 4,
    name: "Telegram News",
    platform: "telegram",
    status: "connecting",
    detail: "1 group",
  },
];

const platformColors = {
  whatsapp: "#25D366",
  discord: "#5865F2",
  telegram: "#0088CC",
};

const statusColors = {
  online: "#22C55E",
  offline: "#9CA3AF",
  connecting: "#F59E0B",
};

const statusLabels = {
  online: "Online",
  offline: "Offline",
  connecting: "Connecting",
};

const platformIcons = {
  whatsapp: MessageCircle,
  discord: MessageSquare,
  telegram: Send,
};

export function Glassmorphism() {
  return (
    <div className="w-[390px] h-[844px] bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-hidden flex flex-col relative">
      {/* Decorative background blobs for glassmorphism effect */}
      <div className="absolute top-[-100px] left-[-50px] w-64 h-64 bg-[#6D28D9]/30 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-50px] right-[-50px] w-80 h-80 bg-[#A78BFA]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-48 h-48 bg-[#25D366]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 pt-16 pb-6 flex justify-between items-center z-10">
        <h1 className="text-3xl font-semibold tracking-tight">Meus Bots</h1>
        <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95 transition-transform">
          <Plus size={24} className="text-[#F0F0F5]" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto pb-8 z-10 flex flex-col gap-4">
        {bots.map((bot) => {
          const Icon = platformIcons[bot.platform as keyof typeof platformIcons];
          
          return (
            <div
              key={bot.id}
              className="relative p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex items-center gap-4 group"
            >
              {/* Subtle inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Icon Container */}
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0">
                <Icon size={24} color={platformColors[bot.platform as keyof typeof platformColors]} />
              </div>

              {/* Bot Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-medium text-[#F0F0F5] truncate mb-1">
                  {bot.name}
                </h2>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: statusColors[bot.status as keyof typeof statusColors] }}
                    />
                    <span className="text-[10px] font-medium tracking-wide uppercase text-[#A0A0B0]">
                      {statusLabels[bot.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  <span className="text-sm text-[#A0A0B0] truncate">
                    • {bot.detail}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[#A0A0B0] active:scale-95 transition-transform shrink-0">
                <ChevronRight size={20} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
