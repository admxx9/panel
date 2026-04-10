import React, { useState } from "react";
import {
  Search,
  Plus,
  ChevronRight,
  MessageCircle,
  Hash,
  Users,
  Clock,
  Activity,
  Power,
  Settings,
  Trash2,
  ChevronLeft,
  Bot,
  Command,
  Smartphone,
  Globe,
  Bell,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type Platform = "whatsapp" | "discord" | "telegram";
type Status = "connected" | "connecting" | "disconnected" | "error";

interface BotData {
  id: string;
  name: string;
  platform: Platform;
  status: Status;
  phoneOrServer: string;
  groups: number;
  msgsToday: number;
  uptime?: number;
  createdAt: string;
  lastMsg?: { text: string; time: string };
  offlineSince?: string;
  commands: number;
  prefix: string;
}

const MOCK_BOTS: BotData[] = [
  {
    id: "1",
    name: "Bot Vendas",
    platform: "whatsapp",
    status: "connected",
    phoneOrServer: "+55 62 99373-5175",
    groups: 12,
    msgsToday: 847,
    uptime: 99.2,
    createdAt: "15 Jan 2025",
    lastMsg: { text: "Olá! Como posso ajudar?", time: "2 min ago" },
    commands: 24,
    prefix: "!",
  },
  {
    id: "3",
    name: "Discord Helper",
    platform: "discord",
    status: "connected",
    phoneOrServer: "3 servers",
    groups: 3,
    msgsToday: 234,
    uptime: 98.7,
    createdAt: "20 Feb 2025",
    lastMsg: { text: "!help menu", time: "5 min ago" },
    commands: 15,
    prefix: "!",
  },
  {
    id: "4",
    name: "Telegram News",
    platform: "telegram",
    status: "connecting",
    phoneOrServer: "1 group",
    groups: 1,
    msgsToday: 12,
    createdAt: "1 Apr 2025",
    commands: 3,
    prefix: ".",
  },
  {
    id: "2",
    name: "Bot Suporte",
    platform: "whatsapp",
    status: "disconnected",
    phoneOrServer: "+55 11 98765-4321",
    groups: 5,
    msgsToday: 0,
    offlineSince: "2h",
    createdAt: "3 Mar 2025",
    commands: 8,
    prefix: "/",
  },
];

const PLATFORM_COLORS: Record<Platform, string> = {
  whatsapp: "#25D366",
  discord: "#5865F2",
  telegram: "#0088CC",
};

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  whatsapp: <MessageCircle className="w-5 h-5 text-white" />,
  discord: <Bot className="w-5 h-5 text-white" />,
  telegram: <Globe className="w-5 h-5 text-white" />,
};

const STATUS_COLORS: Record<Status, string> = {
  connected: "#22C55E",
  connecting: "#F59E0B",
  disconnected: "#9CA3AF",
  error: "#EF4444",
};

export function IOSSettings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBotId, setActiveBotId] = useState<string | null>(null);

  const filteredBots = MOCK_BOTS.filter((bot) =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineBots = filteredBots.filter((b) => b.status === "connected");
  const offlineBots = filteredBots.filter((b) => b.status !== "connected");

  const activeBot = MOCK_BOTS.find((b) => b.id === activeBotId);

  return (
    <div className="w-[390px] h-[844px] bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-hidden flex flex-col relative border border-[#2A2A35] mx-auto shadow-2xl sm:rounded-[40px] sm:my-8">
      {/* Detail View Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-[#0F0F14] z-50 transition-transform duration-300 ease-out flex flex-col",
          activeBot ? "translate-x-0" : "translate-x-full"
        )}
      >
        {activeBot && (
          <>
            {/* Detail Header */}
            <div className="flex items-center justify-between px-2 pt-14 pb-3 bg-[#15151E] border-b border-[#2A2A35]">
              <button
                onClick={() => setActiveBotId(null)}
                className="flex items-center text-[#A78BFA] px-2 py-1 active:opacity-70 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6 -ml-2" />
                <span className="text-[17px]">Meus Bots</span>
              </button>
              <div className="font-semibold text-[17px] absolute left-1/2 -translate-x-1/2">
                {activeBot.name}
              </div>
              <button className="text-[#A78BFA] px-2 py-1 text-[17px]">
                Edit
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#0F0F14] pb-8">
              {/* Bot Profile Header */}
              <div className="flex flex-col items-center pt-8 pb-6">
                <div
                  className="w-24 h-24 rounded-[22px] flex items-center justify-center mb-4 shadow-lg"
                  style={{ backgroundColor: PLATFORM_COLORS[activeBot.platform] }}
                >
                  {React.cloneElement(
                    PLATFORM_ICONS[activeBot.platform] as React.ReactElement,
                    { className: "w-12 h-12 text-white" }
                  )}
                </div>
                <h2 className="text-[22px] font-semibold mb-1 text-[#F0F0F5]">{activeBot.name}</h2>
                <p className="text-[#A0A0B0] text-[15px]">{activeBot.phoneOrServer}</p>
                <div className="flex items-center gap-1.5 mt-3 bg-[#1A1A24] px-3 py-1 rounded-full border border-[#2A2A35]">
                    <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          activeBot.status === "connected" && "animate-pulse"
                        )}
                        style={{ backgroundColor: STATUS_COLORS[activeBot.status] }}
                      />
                      <span
                      style={{ color: STATUS_COLORS[activeBot.status] }}
                      className="text-[13px] font-medium uppercase tracking-wider"
                    >
                      {activeBot.status === "connected"
                        ? "Online"
                        : activeBot.status}
                    </span>
                </div>
              </div>

              {/* Status & Toggles Section */}
              <div className="px-4 mb-6">
                <div className="bg-[#1A1A24] rounded-[10px] overflow-hidden border border-[#2A2A35]">
                  <div className="flex items-center justify-between p-4 border-b border-[#2A2A35]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[6px] bg-[#6D28D9] flex items-center justify-center">
                        <Power className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[17px] text-[#F0F0F5]">Auto-Reconnect</span>
                    </div>
                    <div className="w-[51px] h-[31px] bg-[#34C759] rounded-full p-[2px] cursor-pointer relative transition-colors">
                      <div className="w-[27px] h-[27px] bg-white rounded-full shadow-sm absolute right-[2px] top-[2px]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[6px] bg-[#FF9500] flex items-center justify-center">
                        <Bell className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[17px] text-[#F0F0F5]">Notifications</span>
                    </div>
                    <div className="w-[51px] h-[31px] bg-[#34C759] rounded-full p-[2px] cursor-pointer relative transition-colors">
                      <div className="w-[27px] h-[27px] bg-white rounded-full shadow-sm absolute right-[2px] top-[2px]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="px-4 mb-6">
                <h3 className="text-[#A0A0B0] text-[13px] uppercase tracking-wide ml-4 mb-2">
                  Analytics & Info
                </h3>
                <div className="bg-[#1A1A24] rounded-[10px] overflow-hidden border border-[#2A2A35]">
                  <div className="flex items-center justify-between p-4 border-b border-[#2A2A35]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[6px] bg-[#5856D6] flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[17px] text-[#F0F0F5]">Messages Today</span>
                    </div>
                    <span className="text-[#A0A0B0] text-[17px]">
                      {activeBot.msgsToday}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-[#2A2A35]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[6px] bg-[#34C759] flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[17px] text-[#F0F0F5]">Active Groups</span>
                    </div>
                    <span className="text-[#A0A0B0] text-[17px]">
                      {activeBot.groups}
                    </span>
                  </div>
                  {activeBot.uptime && (
                    <div className="flex items-center justify-between p-4 border-b border-[#2A2A35]">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-[6px] bg-[#007AFF] flex items-center justify-center">
                          <Activity className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[17px] text-[#F0F0F5]">Uptime</span>
                      </div>
                      <span className="text-[#A0A0B0] text-[17px]">
                        {activeBot.uptime}%
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 border-b border-[#2A2A35]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[6px] bg-[#FF2D55] flex items-center justify-center">
                        <Command className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[17px] text-[#F0F0F5]">Commands</span>
                    </div>
                    <span className="text-[#A0A0B0] text-[17px]">
                      {activeBot.commands} (Prefix: {activeBot.prefix})
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-[#2A2A35]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[6px] bg-[#8E8E93] flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[17px] text-[#F0F0F5]">Created</span>
                    </div>
                    <span className="text-[#A0A0B0] text-[17px]">
                      {activeBot.createdAt}
                    </span>
                  </div>
                  {activeBot.lastMsg && (
                    <div className="flex flex-col p-4">
                       <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-[6px] bg-[#6D28D9] flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[17px] text-[#F0F0F5]">Last Message</span>
                        <span className="ml-auto text-[#6B7280] text-[15px]">{activeBot.lastMsg.time}</span>
                      </div>
                      <div className="bg-[#15151E] p-3 rounded-lg border border-[#2A2A35] ml-10">
                          <p className="text-[#A0A0B0] text-[15px] italic">"{activeBot.lastMsg.text}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div className="px-4 mb-8">
                <div className="bg-[#1A1A24] rounded-[10px] overflow-hidden border border-[#2A2A35]">
                  <button className="w-full flex items-center justify-between p-4 border-b border-[#2A2A35] active:bg-[#15151E] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[6px] bg-[#1E1E28] flex items-center justify-center border border-[#2A2A35]">
                        <Settings className="w-4 h-4 text-[#F0F0F5]" />
                      </div>
                      <span className="text-[17px] text-[#F0F0F5]">Gerenciar</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 border-b border-[#2A2A35] active:bg-[#15151E] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[6px] bg-[#6D28D9] flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[17px] text-[#F0F0F5]">Builder</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 active:bg-[#15151E] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-[6px] bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-[#EF4444]" />
                      </div>
                      <span className="text-[#EF4444] text-[17px]">Delete Bot</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main View */}
      <div className="flex-1 bg-[#0F0F14] flex flex-col">
        {/* Header */}
        <div className="pt-14 pb-4 px-4 bg-[#15151E] border-b border-[#2A2A35]">
          <div className="flex justify-between items-start mb-4">
            <div>
                <h1 className="text-[34px] font-bold tracking-tight text-[#F0F0F5]">
                Meus Bots
                </h1>
                <p className="text-[#A0A0B0] text-[15px] mt-1">{MOCK_BOTS.length} bots · {onlineBots.length} online</p>
            </div>
            <button className="w-8 h-8 rounded-full bg-[#6D28D9] flex items-center justify-center text-white mt-2 active:scale-95 transition-transform">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mt-2">
            <Search className="w-5 h-5 text-[#A0A0B0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E1E28] border border-[#2A2A35] text-[#F0F0F5] rounded-[10px] py-2.5 pl-10 pr-4 text-[17px] focus:outline-none focus:border-[#6D28D9] transition-colors placeholder:text-[#6B7280]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          {/* ONLINE BOTS SECTION */}
          {onlineBots.length > 0 && (
            <div className="px-4 mt-6">
              <h2 className="text-[#22C55E] font-medium text-[13px] uppercase tracking-wider ml-4 mb-2">
                Online
              </h2>
              <div className="bg-[#1A1A24] rounded-[10px] overflow-hidden border border-[#2A2A35]">
                {onlineBots.map((bot, index) => (
                  <button
                    key={bot.id}
                    onClick={() => setActiveBotId(bot.id)}
                    className={cn(
                      "w-full flex items-center p-3 text-left active:bg-[#15151E] transition-colors",
                      index !== onlineBots.length - 1 &&
                        "border-b border-[#2A2A35]"
                    )}
                  >
                    <div
                      className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center mr-3 shrink-0"
                      style={{ backgroundColor: PLATFORM_COLORS[bot.platform] }}
                    >
                      {React.cloneElement(
                        PLATFORM_ICONS[bot.platform] as React.ReactElement,
                        { className: "w-[18px] h-[18px] text-white" }
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex items-center justify-between pr-1">
                      <div className="flex flex-col">
                          <span className="text-[17px] text-[#F0F0F5] font-medium truncate">
                            {bot.name}
                          </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[#A0A0B0] text-[17px]">
                          {bot.groups} groups
                        </span>
                        <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* OFFLINE/CONNECTING BOTS SECTION */}
          {offlineBots.length > 0 && (
            <div className="px-4 mt-8">
              <h2 className="text-[#6B7280] font-medium text-[13px] uppercase tracking-wider ml-4 mb-2">
                Offline & Connecting
              </h2>
              <div className="bg-[#1A1A24] rounded-[10px] overflow-hidden border border-[#2A2A35]">
                {offlineBots.map((bot, index) => (
                  <button
                    key={bot.id}
                    onClick={() => setActiveBotId(bot.id)}
                    className={cn(
                      "w-full flex items-center p-3 text-left active:bg-[#15151E] transition-colors",
                      index !== offlineBots.length - 1 &&
                        "border-b border-[#2A2A35]"
                    )}
                  >
                    <div
                      className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center mr-3 shrink-0"
                      style={{
                        backgroundColor: PLATFORM_COLORS[bot.platform],
                        opacity: bot.status === "disconnected" ? 0.6 : 1,
                      }}
                    >
                      {React.cloneElement(
                        PLATFORM_ICONS[bot.platform] as React.ReactElement,
                        { className: "w-[18px] h-[18px] text-white" }
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex items-center justify-between pr-1">
                      <div className="flex flex-col">
                        <span className="text-[17px] text-[#F0F0F5] font-medium truncate">
                          {bot.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div
                                className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                )}
                                style={{ backgroundColor: STATUS_COLORS[bot.status] }}
                            />
                            <span className="text-[#8E8E93] text-[13px] capitalize">
                                {bot.status}
                            </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         <span className="text-[#A0A0B0] text-[17px]">
                          {bot.groups} groups
                        </span>
                        <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
