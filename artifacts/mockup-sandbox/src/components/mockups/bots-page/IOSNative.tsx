import React, { useState, useRef } from 'react';
import { MessageCircle, Hash, Send, Plus, ChevronRight, Settings, Layers, Trash2 } from 'lucide-react';

export function IOSNative() {
  const [swipedBotId, setSwipedBotId] = useState<number | null>(null);

  const bots = [
    {
      id: 1,
      name: "Bot Vendas",
      platform: "WhatsApp",
      status: "online",
      statusLabel: "Online",
      detail: "WhatsApp · 12 grupos",
      icon: MessageCircle,
      color: "bg-[#25D366]",
    },
    {
      id: 3,
      name: "Discord Helper",
      platform: "Discord",
      status: "online",
      statusLabel: "Online",
      detail: "Discord · 3 servers",
      icon: Hash,
      color: "bg-[#5865F2]",
    },
    {
      id: 4,
      name: "Telegram News",
      platform: "Telegram",
      status: "connecting",
      statusLabel: "Conectando",
      detail: "Telegram · 1 group",
      icon: Send,
      color: "bg-[#0088CC]",
    },
    {
      id: 2,
      name: "Bot Suporte",
      platform: "WhatsApp",
      status: "offline",
      statusLabel: "Offline",
      detail: "WhatsApp · 5 grupos",
      icon: MessageCircle,
      color: "bg-[#25D366]",
    }
  ];

  const onlineBots = bots.filter(b => b.status === 'online' || b.status === 'connecting');
  const offlineBots = bots.filter(b => b.status === 'offline');

  const handleTouchStart = (id: number) => {
    // Basic swipe mock handler
    if (swipedBotId === id) {
      setSwipedBotId(null);
    } else {
      setSwipedBotId(id);
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-[844px] max-w-[390px] bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-hidden mx-auto relative shadow-2xl rounded-[40px] border-[8px] border-[#0A0A0E]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-14 pb-2">
        <h1 className="text-[34px] font-bold tracking-tight text-[#F0F0F5]">Meus Bots</h1>
        <button className="p-2 -mr-2 text-[#A78BFA] hover:opacity-70 transition-opacity">
          <Plus size={28} strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 mt-4">
        
        {/* ONLINE SECTION */}
        <div className="mb-8">
          <h2 className="text-[13px] font-medium text-[#A0A0B0] ml-4 mb-2 uppercase tracking-wide">Online</h2>
          <div className="bg-[#1A1A24] rounded-2xl overflow-hidden border border-[#2A2A35]">
            {onlineBots.map((bot, index) => (
              <div key={bot.id} className="relative overflow-hidden">
                {/* Actions Background */}
                <div className="absolute inset-y-0 right-0 flex">
                  <div className="w-[74px] bg-[#6D28D9] flex flex-col items-center justify-center text-white cursor-pointer active:brightness-90 transition-all">
                    <Settings size={20} className="mb-1" />
                    <span className="text-[11px] font-medium">Ajustes</span>
                  </div>
                  <div className="w-[74px] bg-[#3B82F6] flex flex-col items-center justify-center text-white cursor-pointer active:brightness-90 transition-all">
                    <Layers size={20} className="mb-1" />
                    <span className="text-[11px] font-medium">Builder</span>
                  </div>
                  <div className="w-[74px] bg-[#EF4444] flex flex-col items-center justify-center text-white cursor-pointer active:brightness-90 transition-all">
                    <Trash2 size={20} className="mb-1" />
                    <span className="text-[11px] font-medium">Deletar</span>
                  </div>
                </div>

                {/* Main Row */}
                <div 
                  className={`relative bg-[#1A1A24] transition-transform duration-300 ease-out cursor-pointer z-10 flex items-center min-h-[58px] py-2 pl-4 pr-3 ${
                    swipedBotId === bot.id ? '-translate-x-[222px]' : 'translate-x-0'
                  }`}
                  onClick={() => handleTouchStart(bot.id)}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-white ${bot.color} shrink-0`}>
                    <bot.icon size={22} strokeWidth={2.5} />
                  </div>
                  
                  {/* Content */}
                  <div className="ml-[14px] flex-1 overflow-hidden">
                    <div className="text-[17px] leading-[22px] font-medium tracking-[-0.4px] text-[#F0F0F5] truncate">{bot.name}</div>
                  </div>
                  
                  {/* Right Detail */}
                  <div className="flex items-center shrink-0">
                    <span className={`text-[16px] leading-[22px] tracking-[-0.4px] mr-1 ${bot.status === 'connecting' ? 'text-[#F59E0B]' : 'text-[#A0A0B0]'}`}>
                      {bot.statusLabel}
                    </span>
                    <ChevronRight size={20} className="text-[#4A4A5A] shrink-0" strokeWidth={2.5} />
                  </div>
                </div>
                
                {/* Hairline separator */}
                {index < onlineBots.length - 1 && (
                  <div className="absolute bottom-0 left-[68px] right-0 h-[1px] bg-[#2A2A35] z-10" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* OFFLINE SECTION */}
        <div className="mb-8">
          <h2 className="text-[13px] font-medium text-[#A0A0B0] ml-4 mb-2 uppercase tracking-wide">Offline</h2>
          <div className="bg-[#1A1A24] rounded-2xl overflow-hidden border border-[#2A2A35]">
            {offlineBots.map((bot, index) => (
              <div key={bot.id} className="relative overflow-hidden">
                {/* Actions Background */}
                <div className="absolute inset-y-0 right-0 flex">
                  <div className="w-[74px] bg-[#6D28D9] flex flex-col items-center justify-center text-white cursor-pointer active:brightness-90 transition-all">
                    <Settings size={20} className="mb-1" />
                    <span className="text-[11px] font-medium">Ajustes</span>
                  </div>
                  <div className="w-[74px] bg-[#3B82F6] flex flex-col items-center justify-center text-white cursor-pointer active:brightness-90 transition-all">
                    <Layers size={20} className="mb-1" />
                    <span className="text-[11px] font-medium">Builder</span>
                  </div>
                  <div className="w-[74px] bg-[#EF4444] flex flex-col items-center justify-center text-white cursor-pointer active:brightness-90 transition-all">
                    <Trash2 size={20} className="mb-1" />
                    <span className="text-[11px] font-medium">Deletar</span>
                  </div>
                </div>

                {/* Main Row */}
                <div 
                  className={`relative bg-[#1A1A24] opacity-80 hover:opacity-100 transition-transform duration-300 ease-out cursor-pointer z-10 flex items-center min-h-[58px] py-2 pl-4 pr-3 ${
                    swipedBotId === bot.id ? '-translate-x-[222px]' : 'translate-x-0'
                  }`}
                  onClick={() => handleTouchStart(bot.id)}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-white ${bot.color} shrink-0`}>
                    <bot.icon size={22} strokeWidth={2.5} />
                  </div>
                  
                  {/* Content */}
                  <div className="ml-[14px] flex-1 overflow-hidden">
                    <div className="text-[17px] leading-[22px] font-medium tracking-[-0.4px] text-[#F0F0F5] truncate">{bot.name}</div>
                  </div>
                  
                  {/* Right Detail */}
                  <div className="flex items-center shrink-0">
                    <span className="text-[16px] leading-[22px] tracking-[-0.4px] text-[#A0A0B0] mr-1">
                      {bot.statusLabel}
                    </span>
                    <ChevronRight size={20} className="text-[#4A4A5A] shrink-0" strokeWidth={2.5} />
                  </div>
                </div>
                
                {/* Hairline separator */}
                {index < offlineBots.length - 1 && (
                  <div className="absolute bottom-0 left-[68px] right-0 h-[1px] bg-[#2A2A35] z-10" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
