import React, { useState, useRef } from "react";
import { MessageCircle, Hash, Send, Plus, Settings, Trash2, Users, Wifi, Power, Loader, MessageSquare } from "lucide-react";

type BotStatus = "connected" | "disconnected" | "connecting" | "error";
type Platform = "whatsapp" | "discord" | "telegram";

interface Bot {
  id: string;
  name: string;
  platform: Platform;
  status: BotStatus;
  phone?: string;
  groups: number;
  prefix: string;
}

const bots: Bot[] = [
  { id: "1", name: "Bot Vendas", platform: "whatsapp", status: "connected", phone: "+55 62 99373-5175", groups: 12, prefix: "!" },
  { id: "2", name: "Bot Suporte", platform: "whatsapp", status: "disconnected", phone: "+55 11 98765-4321", groups: 5, prefix: "/" },
  { id: "3", name: "Discord Helper", platform: "discord", status: "connected", groups: 3, prefix: "!" },
  { id: "4", name: "Telegram News", platform: "telegram", status: "connecting", groups: 1, prefix: "." },
];

const STATUS_CONFIG: Record<BotStatus, { color: string; label: string; icon: React.ReactNode }> = {
  connected: { color: "#22C55E", label: "Online", icon: <Wifi size={14} className="text-[#22C55E]" /> },
  connecting: { color: "#F59E0B", label: "Conectando", icon: <Loader size={14} className="text-[#F59E0B] animate-spin" /> },
  disconnected: { color: "#9CA3AF", label: "Offline", icon: <Power size={14} className="text-[#9CA3AF]" /> },
  error: { color: "#EF4444", label: "Erro", icon: <Power size={14} className="text-[#EF4444]" /> },
};

const PLATFORM_CONFIG: Record<Platform, { color: string; icon: React.ElementType }> = {
  whatsapp: { color: "#25D366", icon: MessageCircle },
  discord: { color: "#5865F2", icon: MessageSquare },
  telegram: { color: "#0088CC", icon: Send },
};

export function CarouselView() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const width = containerRef.current.offsetWidth;
    const index = Math.round(scrollLeft / width);
    setActiveIndex(index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F14] text-[#F0F0F5] w-[390px] max-w-full mx-auto relative overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus Bots</h1>
          <p className="text-[#A0A0B0] text-sm mt-1">4 bots · 2 online</p>
        </div>
        <button className="w-10 h-10 bg-[#6D28D9] hover:bg-[#5b21b6] rounded-xl flex items-center justify-center transition-colors shadow-[0_4px_12px_rgba(109,40,217,0.3)]">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Carousel Area */}
      <div className="flex-1 flex flex-col justify-center pb-20">
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {bots.map((bot, index) => {
            const status = STATUS_CONFIG[bot.status];
            const platform = PLATFORM_CONFIG[bot.platform];
            const PlatformIcon = platform.icon;
            
            return (
              <div 
                key={bot.id} 
                className="w-full shrink-0 snap-center px-2 flex flex-col justify-center"
              >
                <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-3xl overflow-hidden shadow-2xl relative h-[480px] flex flex-col transition-transform duration-300">
                  {/* Top Status Banner */}
                  <div 
                    className="h-1.5 w-full opacity-80" 
                    style={{ backgroundColor: status.color }}
                  />
                  
                  <div className="p-8 flex-1 flex flex-col">
                    {/* Bot Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: `${platform.color}20` }}
                      >
                        <PlatformIcon size={28} color={platform.color} />
                      </div>
                      
                      <div 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-opacity-10 backdrop-blur-sm"
                        style={{ 
                          borderColor: `${status.color}30`, 
                          backgroundColor: `${status.color}15`
                        }}
                      >
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: status.color }} 
                        />
                        <span 
                          className="text-xs font-semibold tracking-wide uppercase"
                          style={{ color: status.color }}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                    
                    {/* Bot Identity */}
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold mb-2">{bot.name}</h2>
                      {bot.phone && (
                        <p className="text-[#A0A0B0] text-lg font-mono tracking-tight">{bot.phone}</p>
                      )}
                      {!bot.phone && (
                        <p className="text-[#A0A0B0] text-lg italic">Sem número</p>
                      )}
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-auto">
                      <div className="bg-[#0F0F14] rounded-2xl p-4 border border-[#2A2A35]">
                        <div className="flex items-center gap-2 text-[#A0A0B0] mb-2">
                          <Users size={16} />
                          <span className="text-xs font-medium uppercase tracking-wider">Grupos</span>
                        </div>
                        <p className="text-2xl font-bold">{bot.groups}</p>
                      </div>
                      
                      <div className="bg-[#0F0F14] rounded-2xl p-4 border border-[#2A2A35]">
                        <div className="flex items-center gap-2 text-[#A0A0B0] mb-2">
                          <Hash size={16} />
                          <span className="text-xs font-medium uppercase tracking-wider">Prefixo</span>
                        </div>
                        <p className="text-2xl font-bold font-mono text-[#A78BFA]">{bot.prefix}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions Footer */}
                  <div className="p-6 border-t border-[#2A2A35] bg-[#1A1A24] flex gap-3 z-10 relative">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#6D28D9] hover:bg-[#5b21b6] text-white rounded-xl font-semibold transition-colors">
                      <MessageCircle size={18} />
                      Builder
                    </button>
                    <button className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#1E1E28] hover:bg-[#2A2A35] border border-[#2A2A35] text-[#F0F0F5] rounded-xl font-medium transition-colors">
                      <Settings size={18} />
                    </button>
                    <button className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#EF444415] hover:bg-[#EF444425] border border-[#EF444430] text-[#EF4444] rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-2">
          {bots.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex 
                  ? "w-6 bg-[#6D28D9]" 
                  : "w-2 bg-[#2A2A35]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
