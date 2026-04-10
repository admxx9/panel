import React from "react";
import {
  MessageCircle,
  Hash,
  Terminal,
  Clock,
  Settings,
  Trash2,
  Users,
  Activity,
  Plus,
  Search,
  Zap,
  Power,
  BarChart3,
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

interface BotData {
  id: string;
  name: string;
  platform: "WhatsApp" | "Discord" | "Telegram";
  status: "online" | "offline" | "connecting" | "error";
  phone?: string;
  groups: number;
  messagesToday: number;
  uptime?: number;
  created: string;
  lastMessage?: { text: string; time: string };
  commands: number;
  prefix: string;
  offlineSince?: string;
  chartData: number[];
}

const mockBots: BotData[] = [
  {
    id: "1",
    name: "Bot Vendas",
    platform: "WhatsApp",
    status: "online",
    phone: "+55 62 99373-5175",
    groups: 12,
    messagesToday: 847,
    uptime: 99.2,
    created: "15 Jan 2025",
    lastMessage: { text: "Olá! Como posso ajudar?", time: "2 min ago" },
    commands: 24,
    prefix: "!",
    chartData: [320, 450, 410, 560, 680, 590, 847],
  },
  {
    id: "2",
    name: "Bot Suporte",
    platform: "WhatsApp",
    status: "offline",
    phone: "+55 11 98765-4321",
    groups: 5,
    messagesToday: 0,
    offlineSince: "2h",
    created: "3 Mar 2025",
    commands: 8,
    prefix: "/",
    chartData: [120, 150, 180, 110, 90, 20, 0],
  },
  {
    id: "3",
    name: "Discord Helper",
    platform: "Discord",
    status: "online",
    groups: 3,
    messagesToday: 234,
    uptime: 98.7,
    created: "20 Feb 2025",
    lastMessage: { text: "!help menu", time: "5 min ago" },
    commands: 15,
    prefix: "!",
    chartData: [180, 210, 195, 230, 220, 245, 234],
  },
  {
    id: "4",
    name: "Telegram News",
    platform: "Telegram",
    status: "connecting",
    groups: 1,
    messagesToday: 12,
    created: "1 Apr 2025",
    commands: 3,
    prefix: ".",
    chartData: [5, 8, 12, 10, 15, 9, 12],
  },
];

const PLATFORM_COLORS = {
  WhatsApp: "#25D366",
  Discord: "#5865F2",
  Telegram: "#0088CC",
};

const STATUS_COLORS = {
  online: "#22C55E",
  connecting: "#F59E0B",
  offline: "#9CA3AF",
  error: "#EF4444",
};

const STATUS_LABELS = {
  online: "Online",
  connecting: "Connecting",
  offline: "Offline",
  error: "Error",
};

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data) || 1;
  return (
    <div className="flex items-end gap-1 h-12 w-full pt-2">
      {data.map((val, i) => {
        const height = Math.max(4, (val / max) * 100);
        return (
          <div
            key={i}
            className="flex-1 rounded-t-[2px] transition-all duration-300"
            style={{
              height: `${height}%`,
              backgroundColor: color,
              opacity: i === data.length - 1 ? 1 : 0.4,
            }}
          />
        );
      })}
    </div>
  );
}

export function AnalyticsHub() {
  return (
    <div className="flex flex-col w-[390px] h-[844px] bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-hidden border border-[#2A2A35] rounded-[32px] mx-auto my-8 relative shadow-2xl">
      <style dangerouslySetInnerHtml={{ __html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
      `}} />

      {/* Header */}
      <div className="pt-14 pb-4 px-4 sticky top-0 z-10 bg-[#0F0F14]/90 backdrop-blur-md border-b border-[#2A2A35]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Meus Bots</h1>
            <p className="text-xs text-[#A0A0B0] mt-0.5 font-medium">4 bots · 2 online</p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-[#6D28D9] hover:bg-[#5b21b6] flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(109,40,217,0.3)]">
            <Plus size={20} color="#FFF" />
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Buscar bots por nome ou status..."
            className="w-full bg-[#1E1E28] border border-[#2A2A35] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#F0F0F5] placeholder:text-[#6B7280] focus:outline-none focus:border-[#6D28D9] transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-6 custom-scrollbar">
        {/* Global Summary Stats */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl p-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
              <Zap size={40} className="text-[#22C55E]" />
            </div>
            <div className="text-[#A0A0B0] text-xs font-medium mb-1 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
              Online
            </div>
            <div className="text-2xl font-bold">2<span className="text-sm font-medium text-[#6B7280] ml-1">/ 4</span></div>
            <div className="text-[10px] text-[#22C55E] mt-1 font-medium">+1 na última hora</div>
          </div>
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl p-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
              <Activity size={40} className="text-[#6D28D9]" />
            </div>
            <div className="text-[#A0A0B0] text-xs font-medium mb-1 flex items-center gap-1.5">
              <MessageCircle size={12} />
              Msgs Hoje
            </div>
            <div className="text-2xl font-bold">1,093</div>
            <div className="text-[10px] text-[#6D28D9] mt-1 font-medium flex items-center gap-0.5">
              <TrendingUp size={10} />
              +14% vs ontem
            </div>
          </div>
        </div>

        {/* Bot Cards */}
        <div className="space-y-4">
          {mockBots.map((bot) => {
            const platformColor = PLATFORM_COLORS[bot.platform];
            const statusColor = STATUS_COLORS[bot.status];
            const isOnline = bot.status === 'online';

            return (
              <div key={bot.id} className="bg-[#1A1A24] border border-[#2A2A35] rounded-[20px] overflow-hidden flex flex-col shadow-lg">
                {/* Card Header */}
                <div className="p-4 border-b border-[#2A2A35]/50 flex items-start justify-between bg-[#15151E]">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center relative shadow-inner"
                      style={{ backgroundColor: `${platformColor}15`, border: `1px solid ${platformColor}30` }}
                    >
                      <MessageCircle size={20} color={platformColor} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#F0F0F5] text-base leading-tight">{bot.name}</h3>
                      <p className="text-xs text-[#A0A0B0] mt-0.5 font-mono">{bot.phone || bot.platform}</p>
                    </div>
                  </div>
                  <button className="p-1.5 text-[#6B7280] hover:text-[#F0F0F5] rounded-lg transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>

                {/* Status & Chart Row */}
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center justify-center">
                        <div 
                          className="w-2 h-2 rounded-full z-10" 
                          style={{ backgroundColor: statusColor }}
                        />
                        {isOnline && (
                          <div 
                            className="absolute w-4 h-4 rounded-full animate-pulse-ring"
                            style={{ backgroundColor: statusColor }}
                          />
                        )}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: statusColor }}>
                        {STATUS_LABELS[bot.status]}
                        {bot.offlineSince && ` • ${bot.offlineSince}`}
                      </span>
                    </div>
                    <div className="text-xs text-[#A0A0B0] font-medium flex items-center gap-1">
                      <BarChart3 size={12} />
                      Volume (7d)
                    </div>
                  </div>
                  <MiniBarChart data={bot.chartData} color={isOnline ? statusColor : '#6B7280'} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-px bg-[#2A2A35] mx-4 my-2 rounded-xl overflow-hidden border border-[#2A2A35]">
                  <div className="bg-[#1A1A24] p-2 flex flex-col items-center justify-center">
                    <span className="text-[#A0A0B0] text-[10px] uppercase tracking-wider mb-0.5">Grupos</span>
                    <span className="font-semibold text-sm">{bot.groups}</span>
                  </div>
                  <div className="bg-[#1A1A24] p-2 flex flex-col items-center justify-center">
                    <span className="text-[#A0A0B0] text-[10px] uppercase tracking-wider mb-0.5">Comandos</span>
                    <span className="font-semibold text-sm">{bot.commands}</span>
                  </div>
                  <div className="bg-[#1A1A24] p-2 flex flex-col items-center justify-center">
                    <span className="text-[#A0A0B0] text-[10px] uppercase tracking-wider mb-0.5">Uptime</span>
                    <span className="font-semibold text-sm">{bot.uptime ? `${bot.uptime}%` : 'N/A'}</span>
                  </div>
                </div>

                {/* Activity Feed Snippet */}
                <div className="px-4 py-3 bg-[#15151E] flex items-center gap-3 border-y border-[#2A2A35]/30">
                  <div className="w-6 h-6 rounded-md bg-[#1E1E28] border border-[#2A2A35] flex items-center justify-center shrink-0">
                    <Terminal size={12} className="text-[#A0A0B0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {bot.lastMessage ? (
                      <>
                        <p className="text-xs text-[#F0F0F5] truncate font-medium">"{bot.lastMessage.text}"</p>
                        <p className="text-[10px] text-[#6B7280] mt-0.5 flex items-center gap-1">
                          <Clock size={10} /> {bot.lastMessage.time}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-[#6B7280] italic">Nenhuma atividade recente</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 flex items-center gap-2">
                  <button className="flex-1 py-2 px-3 bg-[#1E1E28] hover:bg-[#2A2A35] border border-[#2A2A35] rounded-xl text-xs font-semibold text-[#A0A0B0] flex items-center justify-center gap-1.5 transition-colors">
                    <Settings size={14} />
                    Gerenciar
                  </button>
                  <button className="flex-1 py-2 px-3 bg-[#6D28D9] hover:bg-[#5b21b6] rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors shadow-[0_4px_10px_rgba(109,40,217,0.2)]">
                    <ArrowUpRight size={14} />
                    Builder
                  </button>
                  <button className="w-10 h-10 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 rounded-xl text-[#EF4444] flex items-center justify-center transition-colors shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Bottom Nav Placeholder (Visual only for mockup realism) */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#0F0F14]/95 backdrop-blur-xl border-t border-[#2A2A35] flex items-center justify-around px-6 pb-4 pt-2">
         {[
           { icon: <Activity size={24} />, active: false, label: "Home" },
           { icon: <MessageCircle size={24} />, active: true, label: "Bots" },
           { icon: <Users size={24} />, active: false, label: "CRM" },
           { icon: <Settings size={24} />, active: false, label: "Ajustes" }
         ].map((item, i) => (
           <div key={i} className="flex flex-col items-center gap-1 cursor-pointer">
             <div className={item.active ? "text-[#6D28D9]" : "text-[#6B7280]"}>{item.icon}</div>
             <span className={`text-[10px] ${item.active ? "text-[#6D28D9] font-medium" : "text-[#6B7280]"}`}>{item.label}</span>
           </div>
         ))}
      </div>
    </div>
  );
}
