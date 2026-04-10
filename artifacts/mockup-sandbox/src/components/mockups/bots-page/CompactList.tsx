import React, { useState } from "react";
import { 
  MessageCircle, 
  Hash, 
  Send, 
  Plus, 
  Settings, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = "whatsapp" | "discord" | "telegram";
type Status = "connected" | "connecting" | "disconnected" | "error";

interface Bot {
  id: string;
  name: string;
  platform: Platform;
  status: Status;
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

const PLATFORM_COLORS: Record<Platform, string> = {
  whatsapp: "#25D366",
  discord: "#5865F2",
  telegram: "#0088CC",
};

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  whatsapp: MessageCircle,
  discord: Hash,
  telegram: Send,
};

const STATUS_COLORS: Record<Status, string> = {
  connected: "#22C55E",
  connecting: "#F59E0B",
  disconnected: "#9CA3AF",
  error: "#EF4444",
};

export function CompactList() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="w-[390px] h-[844px] bg-[#0F0F14] text-[#F0F0F5] font-sans mx-auto overflow-hidden relative flex flex-col border border-[#2A2A35]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-[#2A2A35] shrink-0 bg-[#0F0F14] z-10 relative">
        <div>
          <h1 className="text-xl font-bold text-[#F0F0F5]">Meus Bots</h1>
          <p className="text-xs text-[#A0A0B0] mt-1">4 bots · 2 online</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-[#6D28D9] flex items-center justify-center hover:bg-[#5b21b6] transition-colors shadow-lg shadow-[#6D28D9]/20">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#0F0F14]">
        <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl overflow-hidden divide-y divide-[#2A2A35]">
          {mockBots.map((bot) => {
            const Icon = PLATFORM_ICONS[bot.platform];
            const isExpanded = expandedId === bot.id;
            
            return (
              <div key={bot.id} className="flex flex-col transition-colors hover:bg-[#1E1E28]">
                {/* Row */}
                <button 
                  className="flex items-center w-full px-4 py-3 text-left focus:outline-none group"
                  onClick={() => toggleExpand(bot.id)}
                >
                  {/* Status Dot */}
                  <div className="relative flex items-center justify-center mr-3 w-3 h-3 shrink-0">
                    {bot.status === 'connecting' && (
                      <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: STATUS_COLORS[bot.status] }} />
                    )}
                    <div 
                      className="w-2.5 h-2.5 rounded-full z-10" 
                      style={{ 
                        backgroundColor: STATUS_COLORS[bot.status],
                        boxShadow: `0 0 8px ${STATUS_COLORS[bot.status]}60` 
                      }} 
                    />
                  </div>

                  {/* Platform Icon */}
                  <div className="shrink-0 mr-3">
                    <Icon size={14} style={{ color: PLATFORM_COLORS[bot.platform] }} />
                  </div>
                  
                  {/* Bot Info - Single Line */}
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[#F0F0F5] truncate shrink-0 max-w-[120px]">
                      {bot.name}
                    </span>
                    {bot.phone ? (
                      <span className="text-[12px] text-[#A0A0B0] truncate shrink group-hover:text-[#D1D1DB] transition-colors">
                        {bot.phone}
                      </span>
                    ) : (
                      <span className="text-[12px] text-[#A0A0B0] truncate shrink italic group-hover:text-[#D1D1DB] transition-colors">
                        Sem número
                      </span>
                    )}
                  </div>
                  
                  {/* Chevron */}
                  <div className="shrink-0 ml-3 text-[#A0A0B0] group-hover:text-[#F0F0F5] transition-colors">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </button>

                {/* Expanded Details & Actions */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-[#1A1A24]/50">
                    <div className="flex items-center gap-4 text-xs text-[#A0A0B0] mb-4 pl-[46px]">
                      <span>{bot.groups} {bot.groups === 1 ? 'grupo' : 'grupos'}</span>
                      <div className="w-1 h-1 rounded-full bg-[#2A2A35]" />
                      <span>Prefixo: <code className="bg-[#2A2A35] text-[#F0F0F5] px-1.5 py-0.5 rounded ml-1">{bot.prefix}</code></span>
                    </div>

                    <div className="flex items-center gap-2 pl-[46px]">
                      <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#1E1E28] border border-[#2A2A35] hover:bg-[#2A2A35] transition-colors text-xs font-medium text-[#F0F0F5] flex-1 justify-center active:scale-[0.98]">
                        <Settings size={14} className="text-[#A0A0B0]" />
                        Gerenciar
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5b21b6] transition-colors text-xs font-medium text-white flex-1 justify-center active:scale-[0.98]">
                        <LayoutGrid size={14} />
                        Builder
                      </button>
                      <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors shrink-0 active:scale-[0.98]">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
