import React, { useState } from 'react';
import { Plus, MessageCircle, MessageSquare, Send, ChevronRight, Settings, Wrench, Trash2 } from 'lucide-react';

export function SwipeActions() {
  const [swipedId, setSwipedId] = useState<number | null>(1); // Default to first item swiped for mockup

  const bots = [
    {
      id: 1,
      name: "Bot Vendas",
      platform: "whatsapp",
      status: "online",
      detail: "12 groups",
    },
    {
      id: 2,
      name: "Bot Suporte",
      platform: "whatsapp",
      status: "offline",
      detail: "5 groups",
    },
    {
      id: 3,
      name: "Discord Helper",
      platform: "discord",
      status: "online",
      detail: "3 servers",
    },
    {
      id: 4,
      name: "Telegram News",
      platform: "telegram",
      status: "connecting",
      detail: "1 group",
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'bg-[#22C55E]';
      case 'connecting': return 'bg-[#F59E0B]';
      case 'offline': return 'bg-[#9CA3AF]';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case 'whatsapp': return <MessageCircle size={20} color="#fff" />;
      case 'discord': return <MessageSquare size={20} color="#fff" />;
      case 'telegram': return <Send size={20} color="#fff" />;
      default: return <MessageCircle size={20} color="#fff" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch(platform) {
      case 'whatsapp': return 'bg-[#25D366]';
      case 'discord': return 'bg-[#5865F2]';
      case 'telegram': return 'bg-[#0088CC]';
      default: return 'bg-gray-500';
    }
  };

  const toggleSwipe = (id: number) => {
    setSwipedId(swipedId === id ? null : id);
  };

  return (
    <div className="w-full max-w-[390px] h-[844px] bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-hidden flex flex-col relative mx-auto shadow-2xl rounded-[40px] border-[8px] border-[#1A1A24]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-16 pb-4 bg-[#0F0F14] z-20">
        <h1 className="text-[28px] font-bold tracking-tight">Meus Bots</h1>
        <button className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center text-[#F0F0F5] active:scale-95 transition-transform">
          <Plus size={24} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-8 z-10">
        {bots.map((bot) => (
          <div key={bot.id} className="relative border-b border-[#2A2A35]/50 overflow-hidden bg-[#1A1A24]">
            
            {/* Action Buttons Background - Absolute, behind the main row */}
            <div className="absolute inset-y-0 right-0 flex items-center z-0 h-full">
              <button className="h-full w-[76px] flex flex-col items-center justify-center bg-blue-600 text-white active:bg-blue-700 transition-colors">
                <Settings size={20} className="mb-1" />
                <span className="text-[10px] font-medium tracking-wide">Gerenciar</span>
              </button>
              <button className="h-full w-[76px] flex flex-col items-center justify-center bg-[#6D28D9] text-white active:bg-[#5B21B6] transition-colors">
                <Wrench size={20} className="mb-1" />
                <span className="text-[10px] font-medium tracking-wide">Builder</span>
              </button>
              <button className="h-full w-[76px] flex flex-col items-center justify-center bg-red-500 text-white active:bg-red-600 transition-colors">
                <Trash2 size={20} className="mb-1" />
                <span className="text-[10px] font-medium tracking-wide">Deletar</span>
              </button>
            </div>

            {/* Foreground Row - Slides left/right */}
            <div 
              className={`relative z-10 bg-[#0F0F14] flex items-center px-6 py-4 transition-transform duration-300 ease-out cursor-pointer active:bg-[#0F0F14]/90 ${swipedId === bot.id ? '-translate-x-[228px]' : 'translate-x-0'}`}
              onClick={() => toggleSwipe(bot.id)}
            >
              <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${getPlatformColor(bot.platform)}`}>
                {getPlatformIcon(bot.platform)}
              </div>
              
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center mb-0.5">
                  <h3 className="text-[16px] font-semibold text-[#F0F0F5] truncate leading-tight mr-2">{bot.name}</h3>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(bot.status)}`} />
                </div>
                <p className="text-[14px] text-[#A0A0B0] capitalize leading-tight">{bot.platform} • {bot.detail}</p>
              </div>

              <ChevronRight size={20} className="text-[#A0A0B0]/40 flex-shrink-0 ml-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
