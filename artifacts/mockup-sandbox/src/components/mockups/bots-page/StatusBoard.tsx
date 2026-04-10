import React from "react";
import { MessageCircle, Hash, Send, Plus, Settings, Trash2, Users, Loader } from "lucide-react";

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

const PLATFORM_COLORS = {
  whatsapp: "#25D366",
  discord: "#5865F2",
  telegram: "#0088CC",
};

const STATUS_CONFIG = {
  connected: { color: "#22C55E", label: "Online", icon: null },
  connecting: { color: "#F59E0B", label: "Connecting", icon: Loader },
  disconnected: { color: "#9CA3AF", label: "Offline", icon: null },
  error: { color: "#EF4444", label: "Error", icon: null },
};

function BotCard({ bot }: { bot: Bot }) {
  const platColor = PLATFORM_COLORS[bot.platform];
  
  return (
    <div className="w-[280px] shrink-0 bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${platColor}20`, color: platColor }}
          >
            {bot.platform === "whatsapp" && <MessageCircle size={20} />}
            {bot.platform === "discord" && <Hash size={20} />}
            {bot.platform === "telegram" && <Send size={20} />}
          </div>
          <div>
            <h3 className="text-[#F0F0F5] font-semibold text-sm">{bot.name}</h3>
            <p className="text-[#A0A0B0] text-xs mt-0.5">{bot.phone || "No phone"}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-[#A0A0B0]">
        <div className="flex items-center gap-1.5">
          <Users size={14} />
          <span>{bot.groups} {bot.platform === 'discord' ? 'servers' : 'groups'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="opacity-60">prefix:</span>
          <code className="bg-[#2A2A35] px-1.5 py-0.5 rounded text-[#F0F0F5]">{bot.prefix}</code>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-[#2A2A35]">
        <button className="flex-1 bg-[#2A2A35] hover:bg-[#3A3A45] text-[#F0F0F5] py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors">
          <Settings size={14} />
          Gerenciar
        </button>
        <button className="flex-1 bg-[#6D28D9] hover:bg-[#7C3AED] text-white py-2 rounded-lg text-xs font-medium transition-colors">
          Builder
        </button>
        <button className="w-9 h-9 flex items-center justify-center bg-[#EF444415] hover:bg-[#EF444425] text-[#EF4444] rounded-lg transition-colors border border-[#EF444430]">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function Column({ status, title, count }: { status: keyof typeof STATUS_CONFIG, title: string, count: number }) {
  const config = STATUS_CONFIG[status];
  const bots = BOTS.filter((b) => b.status === status);

  return (
    <div className="w-[300px] shrink-0 flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
          <h2 className="text-[#F0F0F5] font-semibold text-sm">{title}</h2>
        </div>
        <div className="bg-[#2A2A35] text-[#A0A0B0] text-xs font-medium px-2 py-0.5 rounded-full">
          {count}
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        {bots.map((bot) => (
          <BotCard key={bot.id} bot={bot} />
        ))}
      </div>
    </div>
  );
}

export function StatusBoard() {
  return (
    <div className="min-h-screen bg-[#0F0F14] font-sans w-[390px] mx-auto overflow-hidden flex flex-col">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 border-b border-[#2A2A35] flex items-center justify-between bg-[#0F0F14] z-10 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#F0F0F5]">Meus Bots</h1>
          <p className="text-[#A0A0B0] text-sm mt-0.5">4 bots · 2 online</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-[#6D28D9] flex items-center justify-center text-white hover:bg-[#7C3AED] transition-colors">
          <Plus size={20} />
        </button>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-8 custom-scrollbar">
        <div className="flex gap-4 p-5 w-max h-full">
          <Column status="connected" title="Online" count={2} />
          <Column status="disconnected" title="Offline" count={1} />
          <Column status="connecting" title="Conectando" count={1} />
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0F0F14;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2A2A35;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
