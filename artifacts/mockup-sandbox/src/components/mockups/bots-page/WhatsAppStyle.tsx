import React, { useState } from "react";
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
  Loader,
  Clock,
  BarChart3,
  Terminal,
  Activity,
  Search,
  Filter,
  ChevronRight,
  MoreVertical,
  Zap,
  Globe,
  Shield,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type Platform = "whatsapp" | "discord" | "telegram";
type Status = "connected" | "disconnected" | "connecting" | "error";

interface BotData {
  id: string;
  name: string;
  platform: Platform;
  status: Status;
  phone?: string;
  groups: number;
  messagesToday: number;
  uptime?: string;
  created: string;
  lastMessage?: string;
  lastActivity: string;
  commands: number;
  prefix: string;
  unreadCount?: number;
  offlineSince?: string;
}

// Mock Data
const MOCK_BOTS: BotData[] = [
  {
    id: "1",
    name: "Bot Vendas",
    platform: "whatsapp",
    status: "connected",
    phone: "+55 62 99373-5175",
    groups: 12,
    messagesToday: 847,
    uptime: "99.2%",
    created: "15 Jan 2025",
    lastMessage: "Olá! Como posso ajudar?",
    lastActivity: "2 min",
    commands: 24,
    prefix: "!",
    unreadCount: 3,
  },
  {
    id: "2",
    name: "Bot Suporte",
    platform: "whatsapp",
    status: "disconnected",
    phone: "+55 11 98765-4321",
    groups: 5,
    messagesToday: 0,
    created: "3 Mar 2025",
    lastActivity: "2h",
    commands: 8,
    prefix: "/",
    offlineSince: "2h",
  },
  {
    id: "3",
    name: "Discord Helper",
    platform: "discord",
    status: "connected",
    groups: 3,
    messagesToday: 234,
    uptime: "98.7%",
    created: "20 Feb 2025",
    lastMessage: "!help menu",
    lastActivity: "5 min",
    commands: 15,
    prefix: "!",
    unreadCount: 1,
  },
  {
    id: "4",
    name: "Telegram News",
    platform: "telegram",
    status: "connecting",
    groups: 1,
    messagesToday: 12,
    created: "1 Apr 2025",
    lastActivity: "agora",
    commands: 3,
    prefix: ".",
  },
];

const PLATFORM_COLORS = {
  whatsapp: "#25D366",
  discord: "#5865F2",
  telegram: "#0088CC",
};

const STATUS_COLORS = {
  connected: "#22C55E",
  connecting: "#F59E0B",
  disconnected: "#9CA3AF",
  error: "#EF4444",
};

export function WhatsAppStyle() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredBots = MOCK_BOTS.filter((bot) => {
    if (filter === "online" && bot.status !== "connected") return false;
    if (filter === "offline" && bot.status === "connected") return false;
    if (searchQuery && !bot.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalMessages = MOCK_BOTS.reduce((acc, bot) => acc + bot.messagesToday, 0);
  const totalCommands = MOCK_BOTS.reduce((acc, bot) => acc + bot.commands, 0);
  const onlineCount = MOCK_BOTS.filter((b) => b.status === "connected").length;

  return (
    <div className="w-[390px] h-[844px] bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-hidden flex flex-col relative border border-[#2A2A35]">
      {/* Header */}
      <header className="bg-[#15151E] pt-12 pb-4 px-4 flex flex-col gap-4 border-b border-[#2A2A35] z-10 sticky top-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[22px] font-bold text-[#F0F0F5] leading-tight">Meus Bots</h1>
            <p className="text-[13px] text-[#A0A0B0] font-medium mt-0.5">
              {MOCK_BOTS.length} bots · {onlineCount} online
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1E1E28] text-[#A0A0B0] hover:text-[#F0F0F5] transition-colors border border-[#2A2A35]">
              <MoreVertical size={18} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#6D28D9] text-white shadow-[0_0_15px_rgba(109,40,217,0.4)] transition-all active:scale-95">
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0B0]" />
          <input
            type="text"
            placeholder="Pesquisar bots..."
            className="w-full bg-[#1E1E28] text-[#F0F0F5] text-sm rounded-xl py-2.5 pl-10 pr-4 placeholder:text-[#6B7280] outline-none border border-[#2A2A35] focus:border-[#6D28D9] transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#A0A0B0] hover:text-[#F0F0F5]">
            <Filter size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Stats Summary */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#15151E] border-b border-[#2A2A35]/50">
          <div className="flex flex-col items-center flex-1 border-r border-[#2A2A35]">
            <span className="text-[10px] font-semibold text-[#6B7280] tracking-wider uppercase">Msgs Hoje</span>
            <span className="text-[14px] font-bold text-[#F0F0F5]">{totalMessages}</span>
          </div>
          <div className="flex flex-col items-center flex-1 border-r border-[#2A2A35]">
            <span className="text-[10px] font-semibold text-[#6B7280] tracking-wider uppercase">Online</span>
            <span className="text-[14px] font-bold text-[#22C55E]">{onlineCount}/{MOCK_BOTS.length}</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] font-semibold text-[#6B7280] tracking-wider uppercase">Comandos</span>
            <span className="text-[14px] font-bold text-[#F0F0F5]">{totalCommands}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex px-4 py-3 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors border",
              filter === "all"
                ? "bg-[#6D28D9] text-white border-[#6D28D9]"
                : "bg-[#1E1E28] text-[#A0A0B0] border-[#2A2A35] hover:text-[#F0F0F5]"
            )}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("online")}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors border",
              filter === "online"
                ? "bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30"
                : "bg-[#1E1E28] text-[#A0A0B0] border-[#2A2A35] hover:text-[#F0F0F5]"
            )}
          >
            Online
          </button>
          <button
            onClick={() => setFilter("offline")}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors border",
              filter === "offline"
                ? "bg-[#9CA3AF]/20 text-[#D1D1DB] border-[#9CA3AF]/30"
                : "bg-[#1E1E28] text-[#A0A0B0] border-[#2A2A35] hover:text-[#F0F0F5]"
            )}
          >
            Offline
          </button>
        </div>

        {/* Bot List - WhatsApp Style */}
        <div className="flex flex-col pb-20">
          {filteredBots.map((bot) => {
            const isExpanded = expandedId === bot.id;
            const platformColor = PLATFORM_COLORS[bot.platform];
            const statusColor = STATUS_COLORS[bot.status];
            
            return (
              <div key={bot.id} className="flex flex-col border-b border-[#2A2A35]/60 bg-[#0F0F14]">
                {/* Chat Row (WhatsApp Style) */}
                <div 
                  className="flex items-center px-4 py-3 gap-3 cursor-pointer active:bg-[#1A1A24] transition-colors"
                  onClick={() => toggleExpand(bot.id)}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div 
                      className="w-[50px] h-[50px] rounded-full flex items-center justify-center border-2"
                      style={{ 
                        backgroundColor: `${platformColor}15`,
                        borderColor: bot.status === "connected" ? statusColor : "#2A2A35",
                        borderStyle: bot.status === "connected" ? "solid" : "dashed"
                      }}
                    >
                      {bot.platform === "whatsapp" && <MessageCircle size={24} color={platformColor} className="fill-current" />}
                      {bot.platform === "discord" && <MessageCircle size={24} color={platformColor} />}
                      {bot.platform === "telegram" && <Send size={24} color={platformColor} className="fill-current" />}
                    </div>
                    {/* Status indicator dot */}
                    <div 
                      className={cn(
                        "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0F0F14]",
                        bot.status === "connected" && "animate-pulse"
                      )}
                      style={{ backgroundColor: statusColor }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="text-[16px] font-semibold text-[#F0F0F5] truncate pr-2">
                        {bot.name}
                      </h3>
                      <span 
                        className={cn(
                          "text-[12px] font-medium shrink-0",
                          bot.unreadCount ? "text-[#25D366]" : "text-[#A0A0B0]"
                        )}
                      >
                        {bot.lastActivity}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {bot.status === "connecting" ? (
                          <Loader size={14} className="text-[#F59E0B] animate-spin shrink-0" />
                        ) : bot.status === "disconnected" ? (
                          <Power size={14} className="text-[#9CA3AF] shrink-0" />
                        ) : null}
                        <p className={cn(
                          "text-[14px] truncate flex-1",
                          bot.unreadCount ? "text-[#F0F0F5] font-medium" : "text-[#A0A0B0]"
                        )}>
                          {bot.lastMessage || (bot.offlineSince ? `Offline há ${bot.offlineSince}` : "Conectando ao servidor...")}
                        </p>
                      </div>
                      {bot.unreadCount && (
                        <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center ml-2 shrink-0">
                          <span className="text-[11px] font-bold text-[#0F0F14] leading-none">{bot.unreadCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Area */}
                {isExpanded && (
                  <div className="px-4 py-3 bg-[#15151E] border-t border-[#2A2A35]/30 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
                    
                    {/* Tags Info Row */}
                    <div className="flex flex-wrap gap-2">
                      <div className="px-2.5 py-1 rounded bg-[#1E1E28] border border-[#2A2A35] flex items-center gap-1.5">
                        <Terminal size={12} className="text-[#A0A0B0]" />
                        <span className="text-[12px] text-[#D1D1DB] font-medium">{bot.platform}</span>
                      </div>
                      {bot.phone && (
                        <div className="px-2.5 py-1 rounded bg-[#1E1E28] border border-[#2A2A35] flex items-center gap-1.5">
                          <Hash size={12} className="text-[#A0A0B0]" />
                          <span className="text-[12px] text-[#D1D1DB] font-medium">{bot.phone}</span>
                        </div>
                      )}
                      <div className="px-2.5 py-1 rounded bg-[#1E1E28] border border-[#2A2A35] flex items-center gap-1.5">
                        <Activity size={12} className="text-[#A0A0B0]" />
                        <span className="text-[12px] text-[#D1D1DB] font-medium">Prefixo: {bot.prefix}</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#6D28D9]/10 flex items-center justify-center">
                          <MessageCircle size={16} className="text-[#A78BFA]" />
                        </div>
                        <div>
                          <p className="text-[11px] text-[#A0A0B0] font-medium mb-0.5">Mensagens Hoje</p>
                          <p className="text-[15px] text-[#F0F0F5] font-bold leading-none">{bot.messagesToday}</p>
                        </div>
                      </div>
                      
                      <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#6D28D9]/10 flex items-center justify-center">
                          <Users size={16} className="text-[#A78BFA]" />
                        </div>
                        <div>
                          <p className="text-[11px] text-[#A0A0B0] font-medium mb-0.5">Grupos Ativos</p>
                          <p className="text-[15px] text-[#F0F0F5] font-bold leading-none">{bot.groups}</p>
                        </div>
                      </div>

                      {bot.uptime && (
                        <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
                            <Wifi size={16} className="text-[#22C55E]" />
                          </div>
                          <div>
                            <p className="text-[11px] text-[#A0A0B0] font-medium mb-0.5">Uptime</p>
                            <p className="text-[15px] text-[#F0F0F5] font-bold leading-none">{bot.uptime}</p>
                          </div>
                        </div>
                      )}

                      <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                          <Zap size={16} className="text-[#F59E0B]" />
                        </div>
                        <div>
                          <p className="text-[11px] text-[#A0A0B0] font-medium mb-0.5">Comandos</p>
                          <p className="text-[15px] text-[#F0F0F5] font-bold leading-none">{bot.commands}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1 mt-1">
                      <button className="flex-1 flex items-center justify-center gap-2 bg-[#6D28D9] hover:bg-[#5B21B6] text-white py-2.5 rounded-xl font-semibold text-[13px] transition-colors">
                        <Settings size={14} />
                        Gerenciar
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-[#1E1E28] hover:bg-[#2A2A35] border border-[#2A2A35] text-[#F0F0F5] py-2.5 rounded-xl font-semibold text-[13px] transition-colors">
                        <Terminal size={14} />
                        Builder
                      </button>
                      <button className="w-11 flex items-center justify-center bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 text-[#EF4444] rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredBots.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center mb-4">
                <Search size={24} className="text-[#6B7280]" />
              </div>
              <h3 className="text-[16px] font-bold text-[#F0F0F5] mb-1">Nenhum bot encontrado</h3>
              <p className="text-[14px] text-[#A0A0B0]">Não encontramos resultados para sua busca.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
