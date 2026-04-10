import React from "react";
import { 
  MessageCircle, 
  Hash, 
  Send, 
  Plus, 
  Settings, 
  Trash2, 
  Users, 
  Wifi, 
  Power, 
  Loader 
} from "lucide-react";

const BOTS = [
  {
    id: "1",
    name: "Bot Vendas",
    platform: "whatsapp",
    status: "connected",
    phone: "+55 62 99373-5175",
    groups: 12,
    groupLabel: "groups",
    prefix: "!",
    size: "large",
  },
  {
    id: "2",
    name: "Bot Suporte",
    platform: "whatsapp",
    status: "disconnected",
    phone: "+55 11 98765-4321",
    groups: 5,
    groupLabel: "groups",
    prefix: "/",
    size: "medium",
  },
  {
    id: "3",
    name: "Discord Helper",
    platform: "discord",
    status: "connected",
    phone: null,
    groups: 3,
    groupLabel: "servers",
    prefix: "!",
    size: "medium",
  },
  {
    id: "4",
    name: "Telegram News",
    platform: "telegram",
    status: "connecting",
    phone: null,
    groups: 1,
    groupLabel: "group",
    prefix: ".",
    size: "large",
  }
];

const PLATFORM_COLORS = {
  whatsapp: { bg: "from-[#25D366]/40 to-[#25D366]/5", icon: "#25D366", solid: "bg-[#25D366]" },
  discord: { bg: "from-[#5865F2]/40 to-[#5865F2]/5", icon: "#5865F2", solid: "bg-[#5865F2]" },
  telegram: { bg: "from-[#0088CC]/40 to-[#0088CC]/5", icon: "#0088CC", solid: "bg-[#0088CC]" }
};

const STATUS_COLORS = {
  connected: { text: "text-[#22C55E]", bg: "bg-[#22C55E]/10", dot: "bg-[#22C55E]", label: "Online" },
  connecting: { text: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", dot: "bg-[#F59E0B]", label: "Connecting" },
  disconnected: { text: "text-[#9CA3AF]", bg: "bg-[#9CA3AF]/10", dot: "bg-[#9CA3AF]", label: "Offline" },
  error: { text: "text-[#EF4444]", bg: "bg-[#EF4444]/10", dot: "bg-[#EF4444]", label: "Error" },
};

function getPlatformIcon(platform: string, size: number, color: string) {
  switch (platform) {
    case "whatsapp": return <MessageCircle size={size} color={color} />;
    case "discord": return <MessageCircle size={size} color={color} />; 
    case "telegram": return <Send size={size} color={color} />;
    default: return <MessageCircle size={size} color={color} />;
  }
}

export function TileMosaic() {
  return (
    <div className="min-h-screen bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-x-hidden w-[390px] mx-auto">
      {/* Header */}
      <header className="px-5 pt-12 pb-6 border-b border-[#2A2A35]/50 flex items-center justify-between sticky top-0 bg-[#0F0F14]/90 backdrop-blur-md z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus Bots</h1>
          <p className="text-sm text-[#A0A0B0] mt-1">4 bots · 2 online</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-[#6D28D9] flex items-center justify-center hover:bg-[#5b21b6] transition-colors shadow-lg shadow-[#6D28D9]/20">
          <Plus size={20} color="#FFFFFF" />
        </button>
      </header>

      {/* Content */}
      <div className="p-4 flex flex-col gap-5 pb-24">
        {BOTS.map((bot) => {
          const pColor = PLATFORM_COLORS[bot.platform as keyof typeof PLATFORM_COLORS];
          const sColor = STATUS_COLORS[bot.status as keyof typeof STATUS_COLORS];
          const isLarge = bot.size === "large";

          return (
            <div 
              key={bot.id} 
              className="bg-[#1A1A24] rounded-[24px] border border-[#2A2A35] overflow-hidden flex flex-col"
            >
              {/* Top Gradient Area */}
              <div className={`relative bg-gradient-to-b ${pColor.bg} flex items-center justify-center ${isLarge ? 'h-40' : 'h-28'}`}>
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#1A1A24]/80 backdrop-blur-sm border border-[#2A2A35] px-2.5 py-1.5 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${sColor.dot} ${bot.status === 'connecting' ? 'animate-pulse' : ''}`} />
                  <span className={`text-xs font-semibold ${sColor.text}`}>{sColor.label}</span>
                </div>
                
                <div className={`p-4 rounded-3xl bg-[#1A1A24]/50 backdrop-blur-md border border-[#2A2A35]/50 shadow-xl ${isLarge ? 'scale-125' : 'scale-100'}`}>
                  {getPlatformIcon(bot.platform, 32, pColor.icon)}
                </div>
              </div>

              {/* Details Area */}
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{bot.name}</h2>
                  {bot.phone ? (
                    <p className="text-[#A0A0B0] text-sm mt-1">{bot.phone}</p>
                  ) : (
                    <p className="text-[#A0A0B0] text-sm mt-1">No phone connected</p>
                  )}
                </div>

                <div className="flex items-center gap-4 bg-[#0F0F14] rounded-xl p-3 border border-[#2A2A35]/50">
                  <div className="flex items-center gap-2 text-[#A0A0B0]">
                    <Users size={14} />
                    <span className="text-sm font-medium">{bot.groups} {bot.groupLabel}</span>
                  </div>
                  <div className="w-px h-4 bg-[#2A2A35]" />
                  <div className="flex items-center gap-2 text-[#A0A0B0]">
                    <Hash size={14} />
                    <span className="text-sm font-medium">prefix: {bot.prefix}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button className="flex-1 flex justify-center items-center gap-2 bg-[#2A2A35]/50 hover:bg-[#2A2A35] text-white py-3 rounded-xl transition-colors font-medium text-sm border border-[#2A2A35]">
                    <Settings size={16} className="text-[#A0A0B0]" />
                    Gerenciar
                  </button>
                  <button className="flex-1 flex justify-center items-center gap-2 bg-[#6D28D9] hover:bg-[#5b21b6] text-white py-3 rounded-xl transition-colors font-medium text-sm shadow-lg shadow-[#6D28D9]/20 border border-[#6D28D9]">
                    <Wifi size={16} />
                    Builder
                  </button>
                  <button className="w-12 flex justify-center items-center bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] py-3 rounded-xl transition-colors border border-[#EF4444]/20">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
