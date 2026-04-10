import React from "react";
import { MessageCircle, Hash, Send, Plus, ChevronRight } from "lucide-react";

export function PillCards() {
  const bots = [
    {
      id: 1,
      name: "Bot Vendas",
      platform: "WhatsApp",
      status: "online",
      statusText: "Online",
      details: "12 grupos",
      icon: MessageCircle,
      platformColor: "text-[#25D366]",
      bgAccent: "bg-[#25D366]/10",
      statusColor: "bg-[#22C55E]",
      borderLeft: "border-l-[#22C55E]"
    },
    {
      id: 2,
      name: "Bot Suporte",
      platform: "WhatsApp",
      status: "offline",
      statusText: "Offline",
      details: "5 grupos",
      icon: MessageCircle,
      platformColor: "text-[#25D366]",
      bgAccent: "bg-[#25D366]/10",
      statusColor: "bg-[#9CA3AF]",
      borderLeft: "border-l-[#9CA3AF]"
    },
    {
      id: 3,
      name: "Discord Helper",
      platform: "Discord",
      status: "online",
      statusText: "Online",
      details: "3 servers",
      icon: Hash,
      platformColor: "text-[#5865F2]",
      bgAccent: "bg-[#5865F2]/10",
      statusColor: "bg-[#22C55E]",
      borderLeft: "border-l-[#22C55E]"
    },
    {
      id: 4,
      name: "Telegram News",
      platform: "Telegram",
      status: "connecting",
      statusText: "Conectando",
      details: "1 grupo",
      icon: Send,
      platformColor: "text-[#0088CC]",
      bgAccent: "bg-[#0088CC]/10",
      statusColor: "bg-[#F59E0B]",
      borderLeft: "border-l-[#F59E0B]"
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F14] text-[#F0F0F5] font-sans flex justify-center">
      {/* Mobile container constraint */}
      <div className="w-full max-w-[390px] bg-[#0F0F14] min-h-screen flex flex-col relative overflow-hidden shadow-2xl shadow-black/50">
        
        {/* Header */}
        <header className="px-5 pt-12 pb-6 flex items-center justify-between sticky top-0 z-10 bg-[#0F0F14]/90 backdrop-blur-md">
          <h1 className="text-2xl font-bold tracking-tight">Meus Bots</h1>
          <button className="w-10 h-10 rounded-full bg-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#6D28D9]/20 hover:bg-[#5b21b6] transition-colors">
            <Plus size={22} className="text-white" />
          </button>
        </header>

        {/* Content */}
        <div className="px-4 flex-1 overflow-y-auto pb-24">
          <div className="flex flex-col gap-2.5">
            {bots.map((bot) => (
              <button
                key={bot.id}
                className={`w-full flex items-center p-2 rounded-full bg-[#1A1A24] border border-[#2A2A35] border-l-4 ${bot.borderLeft} hover:bg-[#20202c] active:scale-[0.98] transition-all text-left group`}
              >
                {/* Platform Icon */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${bot.bgAccent} ${bot.platformColor} shrink-0`}>
                  <bot.icon size={20} strokeWidth={2.5} />
                </div>
                
                {/* Bot Info */}
                <div className="ml-3 flex-1 flex flex-col justify-center min-w-0">
                  <span className="text-[#F0F0F5] font-semibold text-[15px] leading-tight truncate">
                    {bot.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 opacity-80">
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${bot.statusColor} ${bot.status === 'connecting' ? 'animate-pulse' : ''}`}></span>
                      <span className="text-[#A0A0B0] text-xs font-medium tracking-wide">
                        {bot.statusText}
                      </span>
                    </span>
                    <span className="text-[#505060] text-[10px]">•</span>
                    <span className="text-[#A0A0B0] text-xs truncate">
                      {bot.details}
                    </span>
                  </div>
                </div>
                
                {/* Action Arrow */}
                <div className="w-10 h-10 flex items-center justify-center text-[#505060] group-hover:text-[#A0A0B0] transition-colors shrink-0">
                  <ChevronRight size={20} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Floating gradient to fade bottom out a bit */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0F0F14] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
