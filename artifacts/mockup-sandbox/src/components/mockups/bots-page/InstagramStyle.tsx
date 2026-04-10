import React from "react";
import { MessageCircle, Hash, Send, Plus, ChevronRight, MoreVertical } from "lucide-react";

export function InstagramStyle() {
  const bots = [
    {
      id: 1,
      name: "Bot Vendas",
      platform: "WhatsApp",
      status: "Online",
      detail: "12 grupos",
      icon: MessageCircle,
      platformColor: "text-[#25D366]",
      statusColor: "bg-[#22C55E]",
      ringColor: "ring-[#22C55E]",
      avatarBg: "bg-[#25D366]/10",
    },
    {
      id: 2,
      name: "Bot Suporte",
      platform: "WhatsApp",
      status: "Offline",
      detail: "5 grupos",
      icon: MessageCircle,
      platformColor: "text-[#25D366]",
      statusColor: "bg-[#9CA3AF]",
      ringColor: "ring-[#9CA3AF]",
      avatarBg: "bg-[#25D366]/10",
    },
    {
      id: 3,
      name: "Discord Helper",
      platform: "Discord",
      status: "Online",
      detail: "3 servers",
      icon: Hash,
      platformColor: "text-[#5865F2]",
      statusColor: "bg-[#22C55E]",
      ringColor: "ring-[#22C55E]",
      avatarBg: "bg-[#5865F2]/10",
    },
    {
      id: 4,
      name: "Telegram News",
      platform: "Telegram",
      status: "Conectando",
      detail: "1 group",
      icon: Send,
      platformColor: "text-[#0088CC]",
      statusColor: "bg-[#F59E0B]",
      ringColor: "ring-[#F59E0B]",
      avatarBg: "bg-[#0088CC]/10",
    },
  ];

  return (
    <div className="w-[390px] h-[844px] bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-hidden flex flex-col relative rounded-[40px] border-8 border-black shadow-2xl mx-auto my-8 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-14 pb-4 bg-[#0F0F14]/80 backdrop-blur-md z-10 sticky top-0 border-b border-[#1A1A24]">
        <h1 className="text-2xl font-bold tracking-tight">Meus Bots</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1A1A24] border border-[#2A2A35] text-[#F0F0F5] hover:bg-[#2A2A35] transition-colors active:scale-95">
          <Plus size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 hide-scrollbar">
        {/* Stories - Horizontal Scroll */}
        <div className="px-6 py-6 border-b border-[#1A1A24]">
          <div className="flex space-x-5 overflow-x-auto hide-scrollbar pb-2">
            {/* Add New Bot Story */}
            <div className="flex flex-col items-center space-y-2 flex-shrink-0">
              <button className="w-16 h-16 rounded-full border-2 border-dashed border-[#2A2A35] flex items-center justify-center bg-[#1A1A24] text-[#A0A0B0] hover:text-[#F0F0F5] hover:border-[#F0F0F5] transition-all active:scale-95">
                <Plus size={24} />
              </button>
              <span className="text-xs text-[#A0A0B0] font-medium">Novo</span>
            </div>

            {/* Bot Stories */}
            {bots.map((bot) => (
              <div key={`story-${bot.id}`} className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer group">
                <div className={`w-16 h-16 rounded-full p-[3px] ring-2 ${bot.ringColor} ring-offset-2 ring-offset-[#0F0F14] transition-transform group-active:scale-95`}>
                  <div className={`w-full h-full rounded-full ${bot.avatarBg} flex items-center justify-center`}>
                    <bot.icon size={28} className={bot.platformColor} strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-xs text-[#F0F0F5] font-medium w-16 truncate text-center">
                  {bot.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* List Section */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-sm font-semibold text-[#A0A0B0] uppercase tracking-wider mb-4">
            Todos os Bots
          </h2>
          <div className="flex flex-col space-y-4">
            {bots.map((bot) => (
              <div
                key={`list-${bot.id}`}
                className="flex items-center p-4 rounded-2xl bg-[#1A1A24] border border-[#2A2A35] active:bg-[#2A2A35] transition-colors cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-full ${bot.avatarBg} flex items-center justify-center mr-4 flex-shrink-0`}>
                  <bot.icon size={22} className={bot.platformColor} strokeWidth={2.5} />
                </div>
                
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-semibold text-[#F0F0F5] truncate pr-2">
                      {bot.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center text-sm text-[#A0A0B0]">
                    <span className="flex items-center">
                      <span className={`w-2 h-2 rounded-full ${bot.statusColor} mr-2`} />
                      <span className="capitalize">{bot.status}</span>
                    </span>
                    <span className="mx-2 text-[#2A2A35]">•</span>
                    <span className="truncate">{bot.platform}</span>
                  </div>
                </div>

                <div className="flex items-center text-[#A0A0B0]">
                    <ChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Basic styles for hiding scrollbar */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
