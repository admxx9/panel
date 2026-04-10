import React, { useState } from 'react';
import { MessageCircle, Disc, Send, Plus, ChevronUp } from 'lucide-react';

const bots = [
  {
    id: 1,
    name: 'Bot Vendas',
    platform: 'WhatsApp',
    status: 'online',
    detail: '12 groups',
    colorClass: 'bg-[#25D366]',
    textClass: 'text-[#25D366]',
    borderClass: 'border-[#25D366]',
    shadowClass: 'shadow-[0_0_12px_rgba(37,211,102,0.6)]',
    icon: MessageCircle
  },
  {
    id: 2,
    name: 'Bot Suporte',
    platform: 'WhatsApp',
    status: 'offline',
    detail: '5 groups',
    colorClass: 'bg-[#25D366]',
    textClass: 'text-[#25D366]',
    borderClass: 'border-[#25D366]',
    shadowClass: '',
    icon: MessageCircle
  },
  {
    id: 3,
    name: 'Discord Helper',
    platform: 'Discord',
    status: 'online',
    detail: '3 servers',
    colorClass: 'bg-[#5865F2]',
    textClass: 'text-[#5865F2]',
    borderClass: 'border-[#5865F2]',
    shadowClass: 'shadow-[0_0_12px_rgba(88,101,242,0.6)]',
    icon: Disc
  },
  {
    id: 4,
    name: 'Telegram News',
    platform: 'Telegram',
    status: 'connecting',
    detail: '1 group',
    colorClass: 'bg-[#0088CC]',
    textClass: 'text-[#0088CC]',
    borderClass: 'border-[#0088CC]',
    shadowClass: 'shadow-[0_0_12px_rgba(0,136,204,0.6)]',
    icon: Send
  }
];

export function StackedLayers() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % bots.length);
  };

  const getCardStyles = (offset: number) => {
    switch (offset) {
      case 0:
        return 'translate-y-0 scale-100 z-40 opacity-100 rotate-0';
      case 1:
        return '-translate-y-4 scale-[0.95] z-30 opacity-100 -rotate-2';
      case 2:
        return '-translate-y-8 scale-[0.90] z-20 opacity-100 -rotate-3';
      case 3:
      default:
        return '-translate-y-12 scale-[0.85] z-10 opacity-0 -rotate-6';
    }
  };

  return (
    <div className="flex flex-col h-[844px] w-[390px] bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-hidden relative mx-auto border-4 border-black rounded-[40px] shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-14 pb-6 z-50">
        <h1 className="text-2xl font-semibold tracking-tight">Meus Bots</h1>
        <button className="w-10 h-10 bg-[#1A1A24] rounded-full flex items-center justify-center border border-[#2A2A35]">
          <Plus className="w-5 h-5 text-[#F0F0F5]" />
        </button>
      </div>

      {/* Cards Area */}
      <div className="flex-1 relative mt-16 perspective-[1000px]" onClick={handleNext}>
        {bots.map((bot, index) => {
          let offset = index - activeIndex;
          if (offset < 0) offset += bots.length;

          return (
            <div
              key={bot.id}
              className={`absolute top-0 left-0 right-0 mx-6 transition-all duration-500 ease-out cursor-pointer origin-bottom ${getCardStyles(offset)}`}
            >
              <div 
                className="bg-[#1A1A24] border border-[#2A2A35] rounded-[32px] h-[480px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
              >
                {/* Colored top edge peek */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-[6px] opacity-90 ${bot.colorClass}`}
                />

                {/* Subtle background glow */}
                <div 
                  className={`absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] opacity-[0.05] blur-[50px] pointer-events-none ${bot.colorClass}`}
                />
                
                <div 
                  className="w-28 h-28 rounded-full flex items-center justify-center mb-10 shadow-lg relative z-10 bg-[#0F0F14] border border-[#2A2A35]"
                >
                  <bot.icon size={56} className={bot.textClass} strokeWidth={1.5} />
                </div>
                
                <h2 className="text-3xl font-bold mb-12 text-[#F0F0F5] tracking-tight relative z-10">{bot.name}</h2>
                
                <div className="flex flex-col items-center gap-5 w-full relative z-10 mt-auto">
                  <div className="flex items-center gap-3 bg-[#0F0F14] px-6 py-3 rounded-full border border-[#2A2A35]">
                    <div 
                      className={`w-3 h-3 rounded-full ${
                        bot.status === 'online' ? 'bg-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.6)]' :
                        bot.status === 'connecting' ? 'bg-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'bg-[#9CA3AF]'
                      }`}
                    />
                    <span className="text-base font-medium capitalize text-[#F0F0F5]">
                      {bot.status}
                    </span>
                  </div>
                  <span className="text-[#A0A0B0] mt-2 font-medium">{bot.detail}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Swipe Indicator */}
      <div className="pb-16 pt-4 flex flex-col items-center justify-center text-[#A0A0B0] gap-3 z-50 pointer-events-none">
        <ChevronUp size={28} className="animate-bounce opacity-80" />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50">Toque para próximo</span>
      </div>
    </div>
  );
}
