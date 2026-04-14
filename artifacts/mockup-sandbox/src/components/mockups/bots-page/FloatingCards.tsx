import React from 'react';
import { Plus, MessageCircle, Gamepad2, Send } from 'lucide-react';

const BOTS = [
  {
    id: 1,
    name: "Bot Vendas",
    platform: "WhatsApp",
    status: "online",
    detail: "12 groups",
    platformColor: "text-[#25D366] bg-[#25D366]/10",
    statusColor: "bg-[#22C55E]",
    icon: MessageCircle
  },
  {
    id: 2,
    name: "Bot Suporte",
    platform: "WhatsApp",
    status: "offline",
    detail: "5 groups",
    platformColor: "text-[#25D366] bg-[#25D366]/10",
    statusColor: "bg-[#9CA3AF]",
    icon: MessageCircle
  },
  {
    id: 3,
    name: "Discord Helper",
    platform: "Discord",
    status: "online",
    detail: "3 servers",
    platformColor: "text-[#5865F2] bg-[#5865F2]/10",
    statusColor: "bg-[#22C55E]",
    icon: Gamepad2
  },
  {
    id: 4,
    name: "Telegram News",
    platform: "Telegram",
    status: "connecting",
    detail: "1 group",
    platformColor: "text-[#0088CC] bg-[#0088CC]/10",
    statusColor: "bg-[#F59E0B]",
    icon: Send
  }
];

export function FloatingCards() {
  return (
    <div className="flex justify-center w-full min-h-screen bg-black/50 p-4 font-sans">
      <div className="w-[390px] h-[844px] bg-[#0F0F14] overflow-hidden relative shadow-2xl rounded-[40px] border-[8px] border-black">
        {/* Header */}
        <div className="pt-14 pb-6 px-6 flex justify-between items-center sticky top-0 bg-[#0F0F14]/90 backdrop-blur-md z-10">
          <h1 className="text-[28px] font-bold text-[#F0F0F5] tracking-tight">Meus Bots</h1>
          <button className="w-10 h-10 rounded-full bg-[#6D28D9] flex items-center justify-center shadow-[0_0_15px_rgba(109,40,217,0.4)] active:scale-95 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-10 overflow-y-auto h-[calc(100%-110px)] hide-scrollbar flex flex-col gap-4">
          {BOTS.map((bot, index) => {
            const Icon = bot.icon;
            
            return (
              <div 
                key={bot.id}
                className="relative bg-[#1A1A24] border border-[#2A2A35] rounded-2xl overflow-hidden shadow-lg transition-transform active:scale-[0.98]"
                style={{
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
              >
                {/* Status Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${bot.statusColor}`} />

                <div className="p-5 pl-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-[18px] font-bold text-[#F0F0F5] mb-2">{bot.name}</h2>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bot.platformColor}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">{bot.platform}</span>
                        </div>
                        <span className="text-[#A0A0B0] text-[13px]">•</span>
                        <span className="text-[#A0A0B0] text-[13px]">{bot.detail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button className="flex-1 py-3 px-4 rounded-xl border border-[#2A2A35] text-[#F0F0F5] text-[14px] font-semibold flex items-center justify-center hover:bg-[#2A2A35]/50 active:bg-[#2A2A35] transition-colors">
                      Gerenciar
                    </button>
                    <button className="flex-1 py-3 px-4 rounded-xl bg-[#6D28D9] text-white text-[14px] font-semibold flex items-center justify-center hover:bg-[#5B21B6] active:bg-[#4C1D95] shadow-[0_4px_12px_rgba(109,40,217,0.25)] transition-all">
                      Builder
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
