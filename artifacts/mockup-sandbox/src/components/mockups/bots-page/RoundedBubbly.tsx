import React from "react";
import { MessageCircle, Hash, Send, Plus, Settings, Trash2, MoreVertical, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type Platform = "whatsapp" | "discord" | "telegram";
type Status = "online" | "connecting" | "offline";

interface Bot {
  id: string;
  name: string;
  platform: Platform;
  status: Status;
  detail: string;
  initial: string;
}

// Data
const BOTS: Bot[] = [
  {
    id: "1",
    name: "Bot Vendas",
    platform: "whatsapp",
    status: "online",
    detail: "12 grupos",
    initial: "V",
  },
  {
    id: "2",
    name: "Bot Suporte",
    platform: "whatsapp",
    status: "offline",
    detail: "5 grupos",
    initial: "S",
  },
  {
    id: "3",
    name: "Discord Helper",
    platform: "discord",
    status: "online",
    detail: "3 servidores",
    initial: "D",
  },
  {
    id: "4",
    name: "Telegram News",
    platform: "telegram",
    status: "connecting",
    detail: "1 grupo",
    initial: "T",
  },
];

// Helpers
const getStatusColor = (status: Status) => {
  switch (status) {
    case "online":
      return "bg-[#22C55E]";
    case "connecting":
      return "bg-[#F59E0B]";
    case "offline":
      return "bg-[#9CA3AF]";
  }
};

const getStatusLabel = (status: Status) => {
  switch (status) {
    case "online":
      return "Online";
    case "connecting":
      return "Conectando";
    case "offline":
      return "Offline";
  }
};

const getPlatformIcon = (platform: Platform) => {
  switch (platform) {
    case "whatsapp":
      return <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />;
    case "discord":
      return <Hash className="w-3.5 h-3.5 text-[#5865F2]" />;
    case "telegram":
      return <Send className="w-3.5 h-3.5 text-[#0088CC]" />;
  }
};

const getPlatformColor = (platform: Platform) => {
  switch (platform) {
    case "whatsapp":
      return "bg-[#25D366]/10 text-[#25D366]";
    case "discord":
      return "bg-[#5865F2]/10 text-[#5865F2]";
    case "telegram":
      return "bg-[#0088CC]/10 text-[#0088CC]";
  }
};

const getPlatformAvatarColor = (platform: Platform) => {
  switch (platform) {
    case "whatsapp":
      return "bg-[#25D366]/20 text-[#25D366]";
    case "discord":
      return "bg-[#5865F2]/20 text-[#5865F2]";
    case "telegram":
      return "bg-[#0088CC]/20 text-[#0088CC]";
  }
};


export function RoundedBubbly() {
  return (
    <div className="flex justify-center bg-[#0F0F14] min-h-screen p-4 sm:p-8 font-sans text-[#F0F0F5]">
      {/* Mobile Container */}
      <div className="w-full max-w-[390px] mx-auto flex flex-col gap-6 relative">
        
        {/* Header */}
        <header className="flex items-center justify-between pt-8 pb-2 px-2">
          <h1 className="text-3xl font-bold tracking-tight">Meus Bots</h1>
          <button className="w-12 h-12 bg-[#6D28D9] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </button>
        </header>

        {/* List */}
        <div className="flex flex-col gap-4">
          {BOTS.map((bot) => (
            <div
              key={bot.id}
              className="group bg-[#1A1A24] border border-[#2A2A35] rounded-[24px] p-4 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer overflow-hidden relative"
            >
              {/* Avatar */}
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0",
                getPlatformAvatarColor(bot.platform)
              )}>
                {bot.initial}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold truncate">{bot.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      getStatusColor(bot.status),
                      bot.status === "online" && "animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                    )} />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-[#A0A0B0]">
                  <span className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                    getPlatformColor(bot.platform)
                  )}>
                    {getPlatformIcon(bot.platform)}
                    <span className="capitalize">{bot.platform}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {bot.detail}
                  </span>
                </div>
              </div>

              {/* Action Button (simulated swipe reveal or tap) */}
              <div className="w-10 h-10 rounded-full bg-[#2A2A35] flex items-center justify-center shrink-0">
                <MoreVertical className="w-5 h-5 text-[#A0A0B0]" />
              </div>

              {/* Hover/Active Actions Overlay (desktop hover simulation) */}
              <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-[#1A1A24] via-[#1A1A24] to-transparent w-40 flex items-center justify-end px-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 sm:flex hidden">
                 <button className="w-10 h-10 rounded-full bg-[#2A2A35] flex items-center justify-center hover:bg-[#6D28D9] hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                 </button>
                 <button className="w-10 h-10 rounded-full bg-[#2A2A35] flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
