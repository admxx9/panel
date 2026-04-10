import React, { useState } from 'react';
import { Plus, MessageCircle, Hash, Send, Settings, Trash2, Users, LayoutGrid, X, Circle, Wifi, Power, Loader } from 'lucide-react';

interface Bot {
  id: string;
  name: string;
  platform: 'whatsapp' | 'discord' | 'telegram';
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  phone?: string;
  groups: number;
  groupLabel: string;
  prefix: string;
}

const mockBots: Bot[] = [
  {
    id: '1',
    name: 'Bot Vendas',
    platform: 'whatsapp',
    status: 'connected',
    phone: '+55 62 99373-5175',
    groups: 12,
    groupLabel: 'grupos',
    prefix: '!',
  },
  {
    id: '2',
    name: 'Bot Suporte',
    platform: 'whatsapp',
    status: 'disconnected',
    phone: '+55 11 98765-4321',
    groups: 5,
    groupLabel: 'grupos',
    prefix: '/',
  },
  {
    id: '3',
    name: 'Discord Helper',
    platform: 'discord',
    status: 'connected',
    groups: 3,
    groupLabel: 'servers',
    prefix: '!',
  },
  {
    id: '4',
    name: 'Telegram News',
    platform: 'telegram',
    status: 'connecting',
    groups: 1,
    groupLabel: 'grupo',
    prefix: '.',
  },
];

const PLATFORM_CONFIG = {
  whatsapp: { icon: MessageCircle, color: '#25D366', bg: 'rgba(37, 211, 102, 0.15)' },
  discord: { icon: Hash, color: '#5865F2', bg: 'rgba(88, 101, 242, 0.15)' },
  telegram: { icon: Send, color: '#0088CC', bg: 'rgba(0, 136, 204, 0.15)' },
};

const STATUS_CONFIG = {
  connected: { color: '#22C55E', label: 'Online', icon: Wifi },
  connecting: { color: '#F59E0B', label: 'Conectando', icon: Loader },
  disconnected: { color: '#9CA3AF', label: 'Offline', icon: Power },
  error: { color: '#EF4444', label: 'Erro', icon: Power },
};

export function GridCards() {
  const [selectedBot, setSelectedBot] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0F0F14] text-[#F0F0F5] font-sans flex flex-col items-center w-full">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col relative border-x border-[#2A2A35] shadow-2xl overflow-hidden bg-[#0F0F14]">
        
        {/* Header */}
        <header className="px-5 py-4 border-b border-[#2A2A35] flex items-center justify-between bg-[#0F0F14] z-10 sticky top-0">
          <div>
            <h1 className="text-[22px] font-bold text-[#F0F0F5]">Meus Bots</h1>
            <p className="text-[13px] text-[#A0A0B0] mt-0.5">4 bots · 2 online</p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-[#6D28D9] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* Content Grid */}
        <div className="p-5 flex-1 overflow-y-auto pb-24">
          <div className="grid grid-cols-2 gap-4">
            {mockBots.map((bot) => {
              const platform = PLATFORM_CONFIG[bot.platform];
              const status = STATUS_CONFIG[bot.status];
              const isSelected = selectedBot === bot.id;
              const Icon = platform.icon;

              return (
                <div key={bot.id} className="relative">
                  {/* Front Face: Bot Summary */}
                  <button
                    onClick={() => setSelectedBot(isSelected ? null : bot.id)}
                    className={`w-full aspect-square rounded-2xl bg-[#1A1A24] border p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                      isSelected 
                        ? 'border-[#6D28D9] scale-95 opacity-0 pointer-events-none' 
                        : 'border-[#2A2A35] hover:border-[#2A2A35]/80 active:scale-95 opacity-100'
                    }`}
                  >
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center relative shadow-sm"
                      style={{ backgroundColor: platform.bg }}
                    >
                      <Icon className="w-6 h-6" style={{ color: platform.color }} />
                      <div 
                        className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#1A1A24] flex items-center justify-center"
                        style={{ backgroundColor: status.color }}
                      />
                    </div>
                    
                    <div className="text-center w-full">
                      <h3 className="text-[15px] font-semibold text-[#F0F0F5] truncate px-1">{bot.name}</h3>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <Circle className="w-1.5 h-1.5 fill-current" style={{ color: status.color }} />
                        <p className="text-[12px] text-[#A0A0B0]">{status.label}</p>
                      </div>
                    </div>
                  </button>

                  {/* Back Face: Actions (Revealed on tap) */}
                  <div 
                    className={`absolute inset-0 bg-[#1A1A24] rounded-2xl border border-[#6D28D9] flex flex-col overflow-hidden transition-all duration-300 origin-center ${
                      isSelected ? 'opacity-100 scale-100 z-10 pointer-events-auto' : 'opacity-0 scale-95 -z-10 pointer-events-none'
                    }`}
                  >
                    <div className="flex justify-between items-center px-3 py-2.5 border-b border-[#2A2A35]">
                      <span className="text-[11px] font-bold text-[#A78BFA] uppercase tracking-wider">Ações</span>
                      <button 
                        onClick={() => setSelectedBot(null)}
                        className="p-1 rounded-md bg-[#2A2A35]/50 hover:bg-[#2A2A35] text-[#A0A0B0] transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col flex-1 p-2 gap-1.5 justify-center">
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#6D28D9] text-white text-[13px] font-medium hover:bg-[#5B21B6] active:scale-95 transition-all">
                        <LayoutGrid className="w-4 h-4" />
                        Builder
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E1E2A] border border-[#2A2A35] text-[#F0F0F5] text-[13px] font-medium hover:bg-[#2A2A35] active:scale-95 transition-all">
                        <Settings className="w-4 h-4 text-[#A0A0B0]" />
                        Gerenciar
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[13px] font-medium hover:bg-[#EF4444]/20 active:scale-95 transition-all mt-auto">
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
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
