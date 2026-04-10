import React, { useState } from "react";
import {
  MessageCircle,
  Hash,
  Send,
  Plus,
  Settings,
  Trash2,
  ChevronDown,
  LayoutGrid,
  MoreVertical
} from "lucide-react";

type Bot = {
  id: string;
  name: string;
  platform: "whatsapp" | "discord" | "telegram";
  status: "connected" | "disconnected" | "connecting" | "error";
  phone?: string;
  groups: number;
  prefix: string;
};

const BOTS: Bot[] = [
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

const PLATFORM_CONFIG = {
  whatsapp: { icon: MessageCircle, color: "#25D366", label: "WhatsApp" },
  discord: { icon: Hash, color: "#5865F2", label: "Discord" },
  telegram: { icon: Send, color: "#0088CC", label: "Telegram" },
};

const STATUS_CONFIG = {
  connected: { color: "#22C55E", label: "Online" },
  connecting: { color: "#F59E0B", label: "Connecting" },
  disconnected: { color: "#9CA3AF", label: "Offline" },
  error: { color: "#EF4444", label: "Error" },
};

export function MinimalTable() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-x-hidden flex flex-col w-[390px] mx-auto relative border-x border-[#2A2A35]/30">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 border-b border-[#2A2A35] flex items-center justify-between bg-[#1A1A24]/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus Bots</h1>
          <p className="text-[13px] text-[#A0A0B0] mt-0.5">4 bots · 2 online</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-[#6D28D9] flex items-center justify-center hover:bg-[#5B21B6] transition-colors active:scale-95 shadow-[0_0_15px_rgba(109,40,217,0.3)]">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Table-like List */}
      <div className="flex-1 overflow-y-auto">
        {/* Table Header pseudo */}
        <div className="flex items-center px-5 py-3 text-[10px] font-semibold text-[#A0A0B0] uppercase tracking-wider border-b border-[#2A2A35]/50 bg-[#15151C] sticky top-0 z-0">
          <div className="flex-1">Nome & Plataforma</div>
          <div className="w-[80px]">Status</div>
          <div className="w-[40px] text-right">Grp</div>
          <div className="w-[24px]"></div>
        </div>

        <div className="flex flex-col">
          {BOTS.map((bot) => {
            const platform = PLATFORM_CONFIG[bot.platform];
            const status = STATUS_CONFIG[bot.status];
            const PlatformIcon = platform.icon;
            const isExpanded = expandedId === bot.id;

            return (
              <div 
                key={bot.id} 
                className={`flex flex-col border-b border-[#2A2A35]/50 transition-colors ${
                  isExpanded ? "bg-[#1A1A24]/40" : "bg-[#0F0F14] hover:bg-[#1A1A24]/20"
                }`}
              >
                <div 
                  className="flex items-center px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : bot.id)}
                >
                  {/* Name & Platform */}
                  <div className="flex-1 flex flex-col justify-center min-w-0 pr-3">
                    <span className="text-[13px] font-medium truncate text-[#F0F0F5] tracking-tight">{bot.name}</span>
                    <div className="flex items-center gap-1.5 mt-1 opacity-80">
                      <PlatformIcon className="w-[10px] h-[10px]" style={{ color: platform.color }} />
                      <span className="text-[10px] text-[#A0A0B0] uppercase tracking-wider">{platform.label}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="w-[80px] flex items-center gap-2">
                    <div 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ 
                        backgroundColor: status.color,
                        boxShadow: `0 0 6px ${status.color}`
                      }} 
                    />
                    <span className="text-[11px] text-[#A0A0B0] tracking-tight">{status.label}</span>
                  </div>

                  {/* Groups */}
                  <div className="w-[40px] flex items-center justify-end">
                    <span className="text-[12px] font-mono text-[#A0A0B0]">{bot.groups}</span>
                  </div>
                  
                  {/* Expand Icon */}
                  <div className="w-[24px] flex justify-end">
                    <ChevronDown 
                      className={`w-4 h-4 text-[#505060] transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#F0F0F5]' : ''}`} 
                    />
                  </div>
                </div>

                {/* Expanded Details & Actions */}
                {isExpanded && (
                  <div className="px-5 pb-4 pt-1 bg-transparent overflow-hidden">
                    <div className="flex flex-col gap-3 p-3 rounded-lg bg-[#1A1A24] border border-[#2A2A35] mb-3">
                      <div className="flex justify-between items-center border-b border-[#2A2A35]/50 pb-2">
                        <span className="text-[11px] text-[#A0A0B0] uppercase tracking-wider font-semibold">Telefone</span>
                        <span className="font-mono text-[12px] text-[#F0F0F5]">{bot.phone || "Sem número"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-[#A0A0B0] uppercase tracking-wider font-semibold">Prefixo</span>
                        <span className="font-mono bg-[#2A2A35] px-2 py-0.5 rounded text-[12px] text-[#A78BFA]">{bot.prefix}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-[#1E1E28] border border-[#2A2A35] text-[12px] font-medium text-[#F0F0F5] hover:bg-[#2A2A35] transition-colors active:scale-95">
                        <Settings className="w-3.5 h-3.5" />
                        Gerenciar
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-[#6D28D9] text-[12px] font-medium text-white hover:bg-[#5B21B6] transition-colors active:scale-95 shadow-[0_4px_10px_rgba(109,40,217,0.2)]">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Builder
                      </button>
                      <button className="w-10 h-9 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center hover:bg-[#EF4444]/20 transition-colors active:scale-95">
                        <Trash2 className="w-4 h-4 text-[#EF4444]" />
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
