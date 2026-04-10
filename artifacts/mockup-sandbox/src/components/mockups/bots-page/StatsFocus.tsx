import React from "react";
import { 
  MessageCircle, 
  Hash, 
  Send, 
  Plus, 
  Settings, 
  Trash2, 
  Users, 
  Activity,
  BarChart3,
  TrendingUp,
  MoreVertical,
  ActivitySquare
} from "lucide-react";

const BOTS = [
  {
    id: "1",
    name: "Bot Vendas",
    platform: "whatsapp",
    status: "connected",
    phone: "+55 62 99373-5175",
    groups: 12,
    prefix: "!",
    stats: {
      messagesSent: "14.2k",
      uptime: 99.9,
      activeUsers: 840,
    }
  },
  {
    id: "2",
    name: "Bot Suporte",
    platform: "whatsapp",
    status: "disconnected",
    phone: "+55 11 98765-4321",
    groups: 5,
    prefix: "/",
    stats: {
      messagesSent: "3.1k",
      uptime: 82.4,
      activeUsers: 120,
    }
  },
  {
    id: "3",
    name: "Discord Helper",
    platform: "discord",
    status: "connected",
    phone: null,
    groups: 3,
    prefix: "!",
    stats: {
      messagesSent: "45.8k",
      uptime: 99.9,
      activeUsers: "2.3k",
    }
  },
  {
    id: "4",
    name: "Telegram News",
    platform: "telegram",
    status: "connecting",
    phone: null,
    groups: 1,
    prefix: ".",
    stats: {
      messagesSent: "890",
      uptime: 95.5,
      activeUsers: 45,
    }
  }
];

const PLATFORM_CONFIG = {
  whatsapp: { icon: MessageCircle, color: "#25D366", label: "WhatsApp" },
  discord: { icon: Hash, color: "#5865F2", label: "Discord" },
  telegram: { icon: Send, color: "#0088CC", label: "Telegram" },
};

const STATUS_CONFIG = {
  connected: { label: "Online", color: "#22C55E" },
  connecting: { label: "Connecting", color: "#F59E0B" },
  disconnected: { label: "Offline", color: "#9CA3AF" },
  error: { label: "Error", color: "#EF4444" },
};

function CircularProgress({ value, color }: { value: number, color: string }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="transform -rotate-90 w-12 h-12">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-[#2A2A35]"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-[#F0F0F5]">
        {Math.round(value)}%
      </span>
    </div>
  );
}

export function StatsFocus() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F14] text-[#F0F0F5] font-sans mx-auto overflow-hidden relative sm:border sm:border-[#2A2A35]" style={{ maxWidth: 390 }}>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0F0F14]/90 backdrop-blur-md border-b border-[#2A2A35] px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Meus Bots</h1>
          <p className="text-xs text-[#A0A0B0] mt-0.5 font-medium">4 bots · 2 online</p>
        </div>
        <button className="w-9 h-9 bg-[#6D28D9] rounded-xl flex items-center justify-center hover:bg-[#5b21b6] transition-colors shadow-[0_0_15px_rgba(109,40,217,0.3)]">
          <Plus size={20} className="text-white" />
        </button>
      </header>

      {/* Bot List */}
      <main className="flex-1 overflow-y-auto p-4 space-y-5">
        {BOTS.map((bot) => {
          const PlatformIcon = PLATFORM_CONFIG[bot.platform as keyof typeof PLATFORM_CONFIG].icon;
          const platformColor = PLATFORM_CONFIG[bot.platform as keyof typeof PLATFORM_CONFIG].color;
          const statusCfg = STATUS_CONFIG[bot.status as keyof typeof STATUS_CONFIG];

          return (
            <div key={bot.id} className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl overflow-hidden flex flex-col shadow-lg">
              {/* Card Header */}
              <div className="p-4 border-b border-[#2A2A35] flex items-start justify-between bg-[#1A1A24]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center relative" style={{ backgroundColor: `${platformColor}15` }}>
                    <PlatformIcon size={22} color={platformColor} />
                    <div 
                      className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#1A1A24]"
                      style={{ backgroundColor: statusCfg.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[16px] text-white">{bot.name}</h3>
                    <p className="text-xs text-[#A0A0B0] mt-0.5">{bot.phone || "Sem número conectado"}</p>
                  </div>
                </div>
                <button className="text-[#A0A0B0] hover:text-white p-1">
                  <MoreVertical size={18} />
                </button>
              </div>

              {/* Stats Dashboard Grid */}
              <div className="p-4 bg-[#0F0F14]/40 flex flex-col gap-3">
                {/* Main Uptime / Status Block */}
                <div className="flex items-center justify-between bg-[#1E1E28] rounded-xl p-3 border border-[#2A2A35]">
                  <div className="flex items-center gap-3">
                    <CircularProgress value={bot.stats.uptime} color={statusCfg.color} />
                    <div>
                      <p className="text-[10px] text-[#A0A0B0] uppercase tracking-wider font-bold mb-1">Uptime (30d)</p>
                      <div className="flex items-center gap-1.5 bg-[#0F0F14] px-2 py-1 rounded-md border border-[#2A2A35]">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: statusCfg.color }} />
                        <span className="text-[10px] font-semibold uppercase" style={{ color: statusCfg.color }}>
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Activity size={20} className="text-[#A0A0B0]/40" />
                </div>

                {/* Sub Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Messages Stat */}
                  <div className="bg-[#1E1E28] rounded-xl p-3 border border-[#2A2A35] flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2">
                      <BarChart3 size={14} className="text-[#A78BFA]" />
                      <span className="text-[10px] text-[#A0A0B0] uppercase tracking-wide">Mensagens</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold text-[#F0F0F5] leading-none">{bot.stats.messagesSent}</p>
                      <span className="text-[10px] text-[#22C55E] font-medium">+12%</span>
                    </div>
                  </div>

                  {/* Groups Stat */}
                  <div className="bg-[#1E1E28] rounded-xl p-3 border border-[#2A2A35] flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Users size={14} className="text-[#A78BFA]" />
                      <span className="text-[10px] text-[#A0A0B0] uppercase tracking-wide">Grupos</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold text-[#F0F0F5] leading-none">{bot.groups}</p>
                      <span className="text-[10px] text-[#A0A0B0] font-medium">ativos</span>
                    </div>
                  </div>
                </div>
                
                {/* Small meta row */}
                <div className="flex items-center justify-between px-1 mt-1">
                   <div className="flex items-center gap-1.5 text-xs text-[#A0A0B0] bg-[#1E1E28] px-2 py-1 rounded-md border border-[#2A2A35]">
                     <Hash size={12} className="text-[#6D28D9]" />
                     <span>Prefix: <strong className="text-[#F0F0F5] ml-0.5">{bot.prefix}</strong></span>
                   </div>
                   <div className="flex items-center gap-1.5 text-xs text-[#A0A0B0] bg-[#1E1E28] px-2 py-1 rounded-md border border-[#2A2A35]">
                     <TrendingUp size={12} className="text-[#25D366]" />
                     <span>Users: <strong className="text-[#F0F0F5] ml-0.5">{bot.stats.activeUsers}</strong></span>
                   </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 border-t border-[#2A2A35] flex items-center gap-2 bg-[#1A1A24]">
                <button className="flex-1 py-2.5 px-3 rounded-xl bg-[#1E1E28] text-[#F0F0F5] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#2A2A35] transition-colors border border-[#2A2A35]">
                  <Settings size={15} className="text-[#A0A0B0]" />
                  Gerenciar
                </button>
                <button className="flex-1 py-2.5 px-3 rounded-xl bg-[#6D28D9] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#5b21b6] transition-colors shadow-[0_0_15px_rgba(109,40,217,0.3)]">
                  <ActivitySquare size={15} />
                  Builder
                </button>
                <button className="w-11 h-11 rounded-xl bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 flex items-center justify-center hover:bg-[#EF4444]/20 transition-colors shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
        
        {/* Bottom spacing for mobile navigation */}
        <div className="h-10" />
      </main>
    </div>
  );
}
