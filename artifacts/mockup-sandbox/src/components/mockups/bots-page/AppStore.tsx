import React from "react";
import {
  MessageCircle,
  Hash,
  Plus,
  Settings,
  Trash2,
  Users,
  Wifi,
  Power,
  Clock,
  BarChart3,
  Terminal,
  Activity,
  Search,
  Filter,
  ChevronRight,
  MoreVertical,
  Star,
  Download
} from "lucide-react";

// Types
type Platform = "WhatsApp" | "Discord" | "Telegram";
type Status = "online" | "offline" | "connecting" | "error";

interface BotData {
  id: string;
  name: string;
  platform: Platform;
  status: Status;
  phone?: string;
  groups: number;
  messagesToday: number;
  uptime?: number;
  createdAt: string;
  lastMessage?: {
    text: string;
    time: string;
  };
  commands: number;
  prefix: string;
  offlineSince?: string;
}

const bots: BotData[] = [
  {
    id: "1",
    name: "Bot Vendas",
    platform: "WhatsApp",
    status: "online",
    phone: "+55 62 99373-5175",
    groups: 12,
    messagesToday: 847,
    uptime: 99.2,
    createdAt: "15 Jan 2025",
    lastMessage: {
      text: "Olá! Como posso ajudar?",
      time: "2 min ago",
    },
    commands: 24,
    prefix: "!",
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
    createdAt: "3 Mar 2025",
    commands: 8,
    prefix: "/",
  },
  {
    id: "3",
    name: "Discord Helper",
    platform: "Discord",
    status: "online",
    groups: 3,
    messagesToday: 234,
    uptime: 98.7,
    createdAt: "20 Feb 2025",
    lastMessage: {
      text: "!help menu",
      time: "5 min ago",
    },
    commands: 15,
    prefix: "!",
  },
  {
    id: "4",
    name: "Telegram News",
    platform: "Telegram",
    status: "connecting",
    groups: 1,
    messagesToday: 12,
    createdAt: "1 Apr 2025",
    commands: 3,
    prefix: ".",
  },
];

const platformColors = {
  WhatsApp: { bg: "bg-[#25D366]", text: "text-[#25D366]", border: "border-[#25D366]", gradient: "from-[#25D366]/20 to-transparent" },
  Discord: { bg: "bg-[#5865F2]", text: "text-[#5865F2]", border: "border-[#5865F2]", gradient: "from-[#5865F2]/20 to-transparent" },
  Telegram: { bg: "bg-[#0088CC]", text: "text-[#0088CC]", border: "border-[#0088CC]", gradient: "from-[#0088CC]/20 to-transparent" },
};

const statusColors = {
  online: { bg: "bg-[#22C55E]", text: "text-[#22C55E]", label: "Online" },
  connecting: { bg: "bg-[#F59E0B]", text: "text-[#F59E0B]", label: "Connecting" },
  offline: { bg: "bg-[#9CA3AF]", text: "text-[#9CA3AF]", label: "Offline" },
  error: { bg: "bg-[#EF4444]", text: "text-[#EF4444]", label: "Error" },
};

function StatusDot({ status }: { status: Status }) {
  const colors = statusColors[status];
  return (
    <div className="relative flex h-3 w-3 items-center justify-center">
      {status === "online" && (
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${colors.bg}`} />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${colors.bg}`} />
    </div>
  );
}

function StarRating({ uptime }: { uptime?: number }) {
  if (!uptime) return null;
  const rating = Math.max(1, Math.round((uptime / 100) * 5));
  
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating ? "fill-yellow-500 text-yellow-500" : "fill-[#1E1E28] text-[#2A2A35]"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-[#A0A0B0] font-medium">{uptime}%</span>
    </div>
  );
}

function AppStoreCard({ bot }: { bot: BotData }) {
  const pColor = platformColors[bot.platform];
  const sColor = statusColors[bot.status];

  return (
    <div className="mb-6 rounded-3xl bg-[#1A1A24] border border-[#2A2A35] overflow-hidden shadow-xl shadow-black/50 flex flex-col">
      {/* Header Gradient Area */}
      <div className={`h-24 bg-gradient-to-b ${pColor.gradient} relative px-5 pt-5 pb-0 flex items-start justify-between`}>
        <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5">
          <StatusDot status={bot.status} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${sColor.text}`}>
            {sColor.label}
          </span>
        </div>
        <button className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <MoreVertical className="h-4 w-4 text-[#A0A0B0]" />
        </button>
      </div>

      {/* Main Info */}
      <div className="px-5 pb-5 relative -mt-8 flex gap-4">
        {/* App Icon */}
        <div className={`w-20 h-20 rounded-2xl shadow-lg border-[3px] border-[#1A1A24] flex items-center justify-center ${pColor.bg} flex-shrink-0 z-10`}>
          <MessageCircle className="h-10 w-10 text-white" />
        </div>
        
        {/* App Title & Action */}
        <div className="flex-1 pt-9 flex flex-col justify-center">
          <h3 className="text-xl font-bold text-[#F0F0F5] leading-tight truncate">{bot.name}</h3>
          <p className="text-sm text-[#A0A0B0] mt-0.5 truncate">{bot.platform} {bot.phone ? `· ${bot.phone}` : ""}</p>
        </div>
      </div>

      <div className="px-5 pb-5 flex items-center justify-between">
        <StarRating uptime={bot.uptime} />
        
        <button className="bg-[#6D28D9] hover:bg-[#5B21B6] active:scale-95 transition-all text-white font-bold py-1.5 px-6 rounded-full text-sm flex items-center gap-1.5 shadow-lg shadow-[#6D28D9]/20">
          <Download className="h-4 w-4" />
          <span>OPEN</span>
        </button>
      </div>

      {/* Details Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#2A2A35] to-transparent w-full" />

      {/* Stats Grid - "What's New / Info" style */}
      <div className="p-5 grid grid-cols-3 gap-y-4 gap-x-2 bg-[#15151E]">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-1 flex items-center gap-1">
            <Users className="h-3 w-3" /> GROUPS
          </span>
          <span className="text-lg font-bold text-[#F0F0F5]">{bot.groups}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-1 flex items-center gap-1">
            <MessageCircle className="h-3 w-3" /> MSGS/DAY
          </span>
          <span className="text-lg font-bold text-[#F0F0F5]">{bot.messagesToday}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-1 flex items-center gap-1">
            <Terminal className="h-3 w-3" /> CMDS
          </span>
          <span className="text-lg font-bold text-[#F0F0F5]">{bot.commands}</span>
        </div>
      </div>

      {/* Activity Preview - Screenshot style */}
      <div className="px-5 pb-5 pt-2 bg-[#15151E]">
        <h4 className="text-xs font-bold text-[#F0F0F5] mb-3 uppercase tracking-wider">Recent Activity</h4>
        
        <div className="bg-[#1E1E28] rounded-xl p-3 border border-[#2A2A35] shadow-inner">
          {bot.lastMessage ? (
            <div className="flex gap-3 items-start">
              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${pColor.bg} bg-opacity-20`}>
                <MessageCircle className={`h-3 w-3 ${pColor.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-semibold text-[#A78BFA]">User</span>
                  <span className="text-[10px] text-[#6B7280]">{bot.lastMessage.time}</span>
                </div>
                <p className="text-sm text-[#F0F0F5] leading-relaxed break-words line-clamp-2">
                  {bot.lastMessage.text}
                </p>
              </div>
            </div>
          ) : bot.offlineSince ? (
            <div className="flex items-center justify-center py-2 text-center text-[#9CA3AF] text-sm gap-2">
              <Power className="h-4 w-4" />
              Offline for {bot.offlineSince}
            </div>
          ) : (
            <div className="flex items-center justify-center py-2 text-center text-[#A0A0B0] text-sm gap-2">
              <Activity className="h-4 w-4" />
              Waiting for activity...
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-[#1A1A24] border-t border-[#2A2A35] flex gap-2">
        <button className="flex-1 bg-[#1E1E28] hover:bg-[#2A2A35] text-[#F0F0F5] border border-[#2A2A35] rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
          <Settings className="h-4 w-4 text-[#A0A0B0]" />
          Manage
        </button>
        <button className="w-12 flex-shrink-0 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/20 rounded-xl py-2.5 flex items-center justify-center transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function AppStore() {
  const totalBots = bots.length;
  const onlineBots = bots.filter((b) => b.status === "online").length;
  const totalMsgs = bots.reduce((acc, b) => acc + b.messagesToday, 0);
  const totalCmds = bots.reduce((acc, b) => acc + b.commands, 0);

  return (
    <div className="min-h-[100dvh] w-full max-w-[390px] mx-auto bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-hidden flex flex-col relative selection:bg-[#6D28D9]/30">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0F0F14]/90 backdrop-blur-xl border-b border-[#2A2A35]/50 px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Bot Store</h1>
            <p className="text-sm font-medium text-[#A0A0B0] mt-0.5">
              {totalBots} bots · {onlineBots} online
            </p>
          </div>
          <button className="h-10 w-10 rounded-full bg-[#6D28D9] text-white flex items-center justify-center shadow-lg shadow-[#6D28D9]/25 hover:bg-[#5B21B6] active:scale-95 transition-all">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search bots..."
            className="w-full bg-[#1E1E28] border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#F0F0F5] placeholder-[#6B7280] focus:ring-2 focus:ring-[#6D28D9]/50 transition-shadow outline-none"
          />
        </div>
      </header>

      {/* Global Stats Summary */}
      <div className="px-5 py-4">
        <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Network Summary</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl p-3 min-w-[120px] flex-shrink-0 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-[#22C55E]" />
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-none">{totalMsgs}</div>
              <div className="text-[10px] font-bold text-[#A0A0B0] uppercase mt-1">Msgs Today</div>
            </div>
          </div>
          
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl p-3 min-w-[120px] flex-shrink-0 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#A78BFA]/10 flex items-center justify-center">
              <Terminal className="h-5 w-5 text-[#A78BFA]" />
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-none">{totalCmds}</div>
              <div className="text-[10px] font-bold text-[#A0A0B0] uppercase mt-1">Commands</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <main className="flex-1 overflow-y-auto px-5 pb-24">
        <div className="flex items-center justify-between mb-4 mt-2">
          <h2 className="text-lg font-bold text-white">Installed Bots</h2>
          <button className="text-xs font-bold text-[#6D28D9] flex items-center hover:text-[#A78BFA] transition-colors">
            See All <ChevronRight className="h-3 w-3 ml-0.5" />
          </button>
        </div>

        <div className="space-y-2">
          {bots.map((bot) => (
            <AppStoreCard key={bot.id} bot={bot} />
          ))}
        </div>
      </main>

    </div>
  );
}

export default AppStore;
