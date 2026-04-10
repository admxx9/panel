import React, { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronDown,
  MessageSquare,
  Users,
  Activity,
  Clock,
  TerminalSquare,
  Settings,
  LayoutGrid,
  Trash2,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Wifi,
  WifiOff,
  Hash,
  MessageCircle,
  BarChart2,
  Eye,
  FileText
} from "lucide-react";

type BotStatus = "connected" | "connecting" | "disconnected" | "error";
type Platform = "WhatsApp" | "Discord" | "Telegram";

interface Bot {
  id: string;
  name: string;
  platform: Platform;
  status: BotStatus;
  phone?: string;
  servers?: number;
  groups: number;
  messagesToday: number;
  uptime?: number;
  offlineSince?: string;
  createdAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  commands: number;
  prefix: string;
}

const mockBots: Bot[] = [
  {
    id: "1",
    name: "Bot Vendas",
    platform: "WhatsApp",
    status: "connected",
    phone: "+55 62 99373-5175",
    groups: 12,
    messagesToday: 847,
    uptime: 99.2,
    createdAt: "15 Jan 2025",
    lastMessage: "Olá! Como posso ajudar?",
    lastMessageTime: "2 min ago",
    commands: 24,
    prefix: "!",
  },
  {
    id: "2",
    name: "Bot Suporte",
    platform: "WhatsApp",
    status: "disconnected",
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
    status: "connected",
    servers: 3,
    groups: 3,
    messagesToday: 234,
    uptime: 98.7,
    createdAt: "20 Feb 2025",
    lastMessage: "!help menu",
    lastMessageTime: "5 min ago",
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

const statusConfig = {
  connected: { color: "#22C55E", bg: "rgba(34, 197, 94, 0.15)", label: "Online", icon: CheckCircle2 },
  connecting: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)", label: "Connecting", icon: Activity },
  disconnected: { color: "#9CA3AF", bg: "rgba(156, 163, 175, 0.15)", label: "Offline", icon: Clock },
  error: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)", label: "Error", icon: AlertCircle },
};

const platformConfig = {
  WhatsApp: { color: "#25D366", bg: "rgba(37, 211, 102, 0.15)" },
  Discord: { color: "#5865F2", bg: "rgba(88, 101, 242, 0.15)" },
  Telegram: { color: "#0088CC", bg: "rgba(0, 136, 204, 0.15)" },
};

export function NotionStyle() {
  const [expandedId, setExpandedId] = useState<string | null>(mockBots[0].id);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-[390px] h-[844px] bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-y-auto pb-10 relative">
      <style dangerouslySetInInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .pulse-dot {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .property-pill {
          display: inline-flex;
          align-items: center;
          height: 20px;
          padding: 0 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          line-height: 1;
        }
      `}} />
      
      {/* Header */}
      <div className="px-5 pt-12 pb-4 sticky top-0 bg-[#0F0F14]/95 backdrop-blur-xl z-20">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#A0A0B0] text-sm font-medium">
              <FileText size={16} />
              <span>Workspace</span>
              <span className="text-[#2A2A35]">/</span>
              <span className="text-[#F0F0F5]">Meus Bots</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2 text-[#F0F0F5]">Meus Bots</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-[#A0A0B0]">
              <span>4 bots</span>
              <span className="text-[#2A2A35]">•</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] pulse-dot"></div> 2 online</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex gap-2 items-center mt-6">
          <div className="flex-1 bg-[#1E1E28] rounded-md h-8 flex items-center px-2.5 border border-[#2A2A35] focus-within:border-[#6D28D9] focus-within:bg-[#1E1E28] transition-colors">
            <Search size={14} className="text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Search in Meus Bots..." 
              className="bg-transparent border-none outline-none text-sm ml-2 w-full text-[#F0F0F5] placeholder:text-[#6B7280]"
            />
          </div>
          <button className="h-8 px-2.5 rounded-md border border-[#2A2A35] flex items-center gap-1.5 text-sm text-[#A0A0B0] hover:bg-[#1A1A24] hover:text-[#F0F0F5] transition-colors bg-[#15151E]">
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button className="h-8 px-2.5 rounded-md border border-[#2A2A35] flex items-center gap-1.5 text-sm text-[#A0A0B0] hover:bg-[#1A1A24] hover:text-[#F0F0F5] transition-colors bg-[#15151E]">
            <ArrowUpDown size={14} />
            <span>Sort</span>
          </button>
          <button className="h-8 w-8 rounded-md bg-[#6D28D9] flex items-center justify-center text-white hover:bg-[#5b21b6] shadow-sm transition-colors ml-1 shrink-0">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="px-5">
        {/* Table View */}
        <div className="flex flex-col border-t border-[#2A2A35] mt-2">
          
          {/* Table Header */}
          <div className="flex items-center py-2 border-b border-[#2A2A35] text-xs font-medium text-[#6B7280] group px-1">
            <div className="w-6 shrink-0"></div>
            <div className="flex-1 min-w-[120px] flex items-center gap-1">
              <span className="hover:bg-[#1A1A24] px-1 py-0.5 rounded cursor-pointer transition-colors">Aa Name</span>
            </div>
            <div className="w-[90px] shrink-0 flex items-center gap-1">
              <span className="hover:bg-[#1A1A24] px-1 py-0.5 rounded cursor-pointer transition-colors">Status</span>
            </div>
            <div className="w-[80px] shrink-0 flex items-center gap-1 justify-end">
              <span className="hover:bg-[#1A1A24] px-1 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1"><Hash size={12}/> Msgs</span>
            </div>
            <div className="w-[30px] shrink-0 flex justify-center text-transparent group-hover:text-[#6B7280] transition-colors cursor-pointer">
              <Plus size={14} />
            </div>
          </div>

          {/* Database Rows */}
          <div className="flex flex-col">
            {mockBots.map((bot) => {
              const isExpanded = expandedId === bot.id;
              const status = statusConfig[bot.status];
              const platform = platformConfig[bot.platform];
              const StatusIcon = status.icon;

              return (
                <div key={bot.id} className="flex flex-col border-b border-[#2A2A35]/40 last:border-b-0">
                  {/* Row */}
                  <div 
                    className={`flex items-center py-2 px-1 cursor-pointer transition-colors ${isExpanded ? 'bg-[#1A1A24]/50' : 'hover:bg-[#1A1A24]'}`}
                    onClick={() => toggleExpand(bot.id)}
                  >
                    <div className="w-6 shrink-0 flex items-center justify-center text-[#6B7280]">
                      <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                    
                    <div className="flex-1 min-w-[120px] flex items-center gap-2 overflow-hidden px-1">
                      <FileText size={14} className="text-[#6B7280] shrink-0" />
                      <span className={`text-[14px] font-medium whitespace-nowrap truncate ${isExpanded ? 'text-[#F0F0F5]' : 'text-[#E0E0E5]'}`}>{bot.name}</span>
                    </div>

                    <div className="w-[90px] shrink-0 px-1">
                      <span 
                        className="property-pill gap-1"
                        style={{ backgroundColor: status.bg, color: status.color }}
                      >
                        {bot.status === 'connected' && <div className="w-1.5 h-1.5 rounded-full bg-current pulse-dot"></div>}
                        {bot.status !== 'connected' && <StatusIcon size={10} />}
                        {status.label}
                      </span>
                    </div>

                    <div className="w-[80px] shrink-0 px-1 flex justify-end text-[13px] text-[#A0A0B0] font-mono">
                      {bot.messagesToday.toLocaleString()}
                    </div>
                    
                    <div className="w-[30px] shrink-0 flex justify-center text-[#6B7280] hover:text-[#F0F0F5]">
                      <button className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#2A2A35]">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details (Notion Page Style) */}
                  {isExpanded && (
                    <div className="pl-6 pr-2 py-4 mb-2 bg-[#1A1A24]/20">
                      <div className="pl-4 border-l-2 border-[#2A2A35] flex flex-col gap-4">
                        
                        {/* Properties List */}
                        <div className="flex flex-col gap-2">
                          
                          {/* Platform Property */}
                          <div className="flex text-sm">
                            <div className="w-[100px] shrink-0 flex items-center gap-1.5 text-[#6B7280]">
                              <Smartphone size={14} />
                              <span>Platform</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <span 
                                className="property-pill"
                                style={{ backgroundColor: platform.bg, color: platform.color }}
                              >
                                {bot.platform}
                              </span>
                              {bot.phone && <span className="text-[#A0A0B0] text-[13px] underline decoration-[#2A2A35] underline-offset-2">{bot.phone}</span>}
                            </div>
                          </div>

                          {/* Uptime/Status Details Property */}
                          <div className="flex text-sm">
                            <div className="w-[100px] shrink-0 flex items-center gap-1.5 text-[#6B7280]">
                              <Activity size={14} />
                              <span>Uptime</span>
                            </div>
                            <div className="flex items-center flex-1 text-[#D1D1DB] text-[13px]">
                              {bot.uptime ? `${bot.uptime}%` : bot.offlineSince ? `Offline for ${bot.offlineSince}` : 'N/A'}
                            </div>
                          </div>

                          {/* Created Property */}
                          <div className="flex text-sm">
                            <div className="w-[100px] shrink-0 flex items-center gap-1.5 text-[#6B7280]">
                              <Clock size={14} />
                              <span>Created</span>
                            </div>
                            <div className="flex items-center flex-1 text-[#D1D1DB] text-[13px]">
                              {bot.createdAt}
                            </div>
                          </div>

                          {/* Config Property */}
                          <div className="flex text-sm">
                            <div className="w-[100px] shrink-0 flex items-center gap-1.5 text-[#6B7280]">
                              <TerminalSquare size={14} />
                              <span>Config</span>
                            </div>
                            <div className="flex items-center flex-1 text-[13px] text-[#D1D1DB]">
                              <span className="property-pill bg-[#2A2A35] text-[#F0F0F5] mr-1">{bot.commands}</span> commands, prefix <span className="property-pill bg-[#2A2A35] text-[#F0F0F5] font-mono ml-1">{bot.prefix}</span>
                            </div>
                          </div>
                          
                          {/* Groups Property */}
                          <div className="flex text-sm">
                            <div className="w-[100px] shrink-0 flex items-center gap-1.5 text-[#6B7280]">
                              <Users size={14} />
                              <span>Groups</span>
                            </div>
                            <div className="flex items-center flex-1 text-[13px] text-[#D1D1DB]">
                              {bot.groups} groups connected
                            </div>
                          </div>
                        </div>

                        {/* Page Content Area */}
                        <div className="mt-2 pt-4 border-t border-[#2A2A35]/60 flex flex-col gap-4">
                          
                          {/* Last Message Block */}
                          {bot.lastMessage ? (
                            <div className="flex flex-col gap-2">
                              <h3 className="text-sm font-semibold text-[#F0F0F5] flex items-center gap-2">
                                <MessageCircle size={14} className="text-[#A78BFA]"/> Last Activity
                                <span className="text-xs font-normal text-[#6B7280] ml-auto">{bot.lastMessageTime}</span>
                              </h3>
                              <div className="bg-[#15151E] rounded-md border border-[#2A2A35] p-3 text-sm text-[#D1D1DB]">
                                {bot.lastMessage}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                                <h3 className="text-sm font-semibold text-[#F0F0F5] flex items-center gap-2">
                                  <MessageCircle size={14} className="text-[#A78BFA]"/> Last Activity
                                </h3>
                                <div className="text-sm text-[#6B7280] italic">No recent messages.</div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-2">
                            <button className="flex-1 bg-[#6D28D9] hover:bg-[#5b21b6] text-white h-8 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5">
                              <LayoutGrid size={14} />
                              Builder
                            </button>
                            <button className="flex-1 bg-[#1E1E28] hover:bg-[#2A2A35] border border-[#2A2A35] text-[#F0F0F5] h-8 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5">
                              <Settings size={14} />
                              Settings
                            </button>
                            <button className="w-8 h-8 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] rounded-md flex items-center justify-center transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* New Row / Add New */}
          <div className="flex items-center py-2 px-1 text-sm text-[#6B7280] hover:text-[#F0F0F5] hover:bg-[#1A1A24] cursor-pointer transition-colors group">
            <div className="w-6 shrink-0 flex justify-center">
              <Plus size={16} className="text-[#6B7280] group-hover:text-[#F0F0F5] transition-colors" />
            </div>
            <span className="ml-1">New bot</span>
          </div>
        </div>

      </div>
    </div>
  );
}
