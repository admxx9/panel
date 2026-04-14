import React, { useState } from 'react';
import { MessageCircle, Hash, Send, Plus, Search, Settings, Trash2 } from 'lucide-react';

const bots = [
  { id: '1', name: 'Bot Vendas', platform: 'whatsapp', status: 'online', detail: '12 grupos' },
  { id: '2', name: 'Bot Suporte', platform: 'whatsapp', status: 'offline', detail: '5 grupos' },
  { id: '3', name: 'Discord Helper', platform: 'discord', status: 'online', detail: '3 servidores' },
  { id: '4', name: 'Telegram News', platform: 'telegram', status: 'connecting', detail: '1 grupo' },
];

const platformColors: Record<string, string> = {
  whatsapp: 'bg-[#25D366]',
  discord: 'bg-[#5865F2]',
  telegram: 'bg-[#0088CC]'
};

const platformIcons: Record<string, any> = {
  whatsapp: MessageCircle,
  discord: Hash,
  telegram: Send
};

const statusColors: Record<string, string> = {
  online: 'bg-[#22C55E]',
  offline: 'bg-[#9CA3AF]',
  connecting: 'bg-[#F59E0B]'
};

export function CleanMinimal() {
  const [activeBotId, setActiveBotId] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/40 p-4 sm:p-8 font-sans">
      <div className="w-full max-w-[390px] h-[844px] bg-[#0F0F14] rounded-[40px] overflow-hidden flex flex-col relative shadow-2xl ring-8 ring-black/50">
        
        {/* Header */}
        <div className="px-6 pt-16 pb-4 flex items-center justify-between bg-[#0F0F14] z-20 relative">
          <h1 className="text-[#F0F0F5] text-[32px] font-semibold tracking-tight">Meus Bots</h1>
          <button className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center text-[#A78BFA] hover:bg-[#2A2A35] transition-colors active:scale-95">
            <Plus size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pb-6 bg-[#0F0F14] z-20 relative">
          <div className="h-[44px] bg-[#1A1A24] rounded-2xl flex items-center px-4 gap-3 focus-within:ring-1 focus-within:ring-[#6D28D9] transition-all">
            <Search size={18} className="text-[#A0A0B0]" />
            <input
              type="text"
              placeholder="Buscar bots..."
              className="bg-transparent border-none outline-none text-[#F0F0F5] placeholder:text-[#A0A0B0] flex-1 text-[16px]"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pb-12 pt-2 scrollbar-hide">
          <div className="flex flex-col gap-2">
            {bots.map(bot => {
              const Icon = platformIcons[bot.platform];
              const isActive = activeBotId === bot.id;

              return (
                <div key={bot.id} className="relative group overflow-hidden">
                  {/* Background Actions */}
                  <div className="absolute right-0 top-0 bottom-0 flex items-center px-6 gap-3 z-0 bg-[#0F0F14]">
                    <button className="w-12 h-12 rounded-full bg-[#1A1A24] flex items-center justify-center text-[#F0F0F5] hover:bg-[#2A2A35] transition-colors active:scale-95">
                      <Settings size={20} />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors active:scale-95">
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Foreground Row */}
                  <div
                    onClick={() => setActiveBotId(isActive ? null : bot.id)}
                    className={`relative z-10 flex items-center gap-4 px-6 py-3 bg-[#0F0F14] transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer select-none active:bg-[#1A1A24]/30 ${
                      isActive ? '-translate-x-[140px]' : 'translate-x-0'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-[52px] h-[52px] shrink-0 rounded-[18px] flex items-center justify-center text-white ${platformColors[bot.platform]}`}>
                      <Icon size={26} strokeWidth={2.5} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-[#F0F0F5] text-[17px] font-semibold leading-tight tracking-tight truncate">
                        {bot.name}
                      </h3>
                      <p className="text-[#A0A0B0] text-[15px] leading-tight truncate mt-1 capitalize flex items-center gap-1.5">
                        {bot.platform}
                        <span className="text-[#A0A0B0]/40 text-[10px]">●</span>
                        {bot.detail}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center w-6 h-6 shrink-0 pl-2">
                      <div 
                        className={`w-2.5 h-2.5 rounded-full ${statusColors[bot.status]} ${
                          bot.status === 'connecting' ? 'animate-pulse' : ''
                        } ${bot.status === 'online' ? 'shadow-[0_0_8px_rgba(34,197,94,0.4)]' : ''}`} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
