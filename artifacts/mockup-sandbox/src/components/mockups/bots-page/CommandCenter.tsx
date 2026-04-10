import React from 'react';
import { 
  MessageCircle, 
  Hash, 
  Send, 
  Plus, 
  Settings, 
  Trash2, 
  Users, 
  Wifi, 
  Power, 
  Loader,
  Server,
  Terminal,
  Activity
} from 'lucide-react';

const bots = [
  {
    id: 1,
    name: 'Bot Vendas',
    platform: 'whatsapp',
    status: 'connected',
    phone: '+55 62 99373-5175',
    groups: 12,
    groupType: 'groups',
    prefix: '!',
  },
  {
    id: 2,
    name: 'Bot Suporte',
    platform: 'whatsapp',
    status: 'disconnected',
    phone: '+55 11 98765-4321',
    groups: 5,
    groupType: 'groups',
    prefix: '/',
  },
  {
    id: 3,
    name: 'Discord Helper',
    platform: 'discord',
    status: 'connected',
    phone: null,
    groups: 3,
    groupType: 'servers',
    prefix: '!',
  },
  {
    id: 4,
    name: 'Telegram News',
    platform: 'telegram',
    status: 'connecting',
    phone: null,
    groups: 1,
    groupType: 'groups',
    prefix: '.',
  }
];

const PLATFORM_CONFIG = {
  whatsapp: { icon: MessageCircle, color: '#25D366', label: 'WHA' },
  discord: { icon: Server, color: '#5865F2', label: 'DIS' },
  telegram: { icon: Send, color: '#0088CC', label: 'TEL' },
};

const STATUS_CONFIG = {
  connected: { label: 'ONLINE', color: '#22C55E', icon: Wifi },
  disconnected: { label: 'OFFLINE', color: '#9CA3AF', icon: Power },
  connecting: { label: 'CONNECTING', color: '#F59E0B', icon: Loader },
  error: { label: 'ERROR', color: '#EF4444', icon: Activity },
};

export function CommandCenter() {
  return (
    <div className="min-h-screen bg-[#0F0F14] text-[#F0F0F5] font-mono w-[390px] mx-auto overflow-hidden relative">
      {/* Grid background effect for that "control center" feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#6D28D9 1px, transparent 1px), linear-gradient(90deg, #6D28D9 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Header */}
      <div className="relative p-5 border-b border-[#2A2A35] bg-[#1A1A24]/80 backdrop-blur-sm z-10">
        <div className="flex justify-between items-center mb-4 font-sans">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-[#6D28D9]/50 bg-[#6D28D9]/10 flex items-center justify-center">
              <Terminal size={16} className="text-[#A78BFA]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F0F0F5]">Meus Bots</h1>
              <p className="text-[13px] text-[#A0A0B0]">4 bots · 2 online</p>
            </div>
          </div>
          <button className="w-8 h-8 flex items-center justify-center bg-[#6D28D9] text-white rounded hover:bg-[#5b21b6] transition-colors">
            <Plus size={18} />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#0F0F14] border border-[#2A2A35] p-2 rounded flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-[#22C55E]/50"></div>
            <span className="text-xl font-bold text-[#22C55E]">2</span>
            <span className="text-[9px] text-[#A0A0B0] tracking-wider mt-1">ONLINE</span>
          </div>
          <div className="bg-[#0F0F14] border border-[#2A2A35] p-2 rounded flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-[#F59E0B]/50"></div>
            <span className="text-xl font-bold text-[#F59E0B]">1</span>
            <span className="text-[9px] text-[#A0A0B0] tracking-wider mt-1">PENDING</span>
          </div>
          <div className="bg-[#0F0F14] border border-[#2A2A35] p-2 rounded flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-[#9CA3AF]/50"></div>
            <span className="text-xl font-bold text-[#9CA3AF]">1</span>
            <span className="text-[9px] text-[#A0A0B0] tracking-wider mt-1">OFFLINE</span>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="p-4 space-y-4 pb-24 relative z-10 h-[calc(100vh-140px)] overflow-y-auto">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={12} className="text-[#6D28D9]" />
          <span className="text-[10px] text-[#A0A0B0] uppercase tracking-widest">Live Node Feed</span>
          <div className="flex-1 border-t border-[#2A2A35] border-dashed ml-2"></div>
        </div>

        {bots.map((bot) => {
          const PlatformIcon = PLATFORM_CONFIG[bot.platform as keyof typeof PLATFORM_CONFIG].icon;
          const statusCfg = STATUS_CONFIG[bot.status as keyof typeof STATUS_CONFIG];
          const StatusIcon = statusCfg.icon;

          return (
            <div key={bot.id} className="bg-[#1A1A24] border border-[#2A2A35] rounded overflow-hidden relative group">
              {/* Left accent line based on status */}
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: statusCfg.color }}></div>
              
              <div className="p-4 pl-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-[#2A2A35] bg-[#0F0F14] flex items-center justify-center relative">
                      <PlatformIcon size={18} style={{ color: PLATFORM_CONFIG[bot.platform as keyof typeof PLATFORM_CONFIG].color }} />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1A1A24]" style={{ backgroundColor: statusCfg.color }}>
                        {bot.status === 'connecting' && <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: statusCfg.color }}></div>}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[15px]">{bot.name}</h3>
                        <span className="text-[9px] px-1.5 py-0.5 rounded border" style={{ color: statusCfg.color, borderColor: `${statusCfg.color}30`, backgroundColor: `${statusCfg.color}10` }}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-[#A0A0B0]">ID: ND-{bot.id.toString().padStart(4, '0')}</span>
                        <span className="text-[10px] text-[#A0A0B0]">|</span>
                        <span className="text-[11px] text-[#A0A0B0]" style={{ color: PLATFORM_CONFIG[bot.platform as keyof typeof PLATFORM_CONFIG].color }}>
                          {PLATFORM_CONFIG[bot.platform as keyof typeof PLATFORM_CONFIG].label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 bg-[#0F0F14] p-3 rounded border border-[#2A2A35]">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#A0A0B0] tracking-wider mb-1">TARGET</span>
                    <span className="text-xs text-[#F0F0F5]">{bot.phone || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#A0A0B0] tracking-wider mb-1">PREFIX</span>
                    <span className="text-xs text-[#A78BFA] bg-[#6D28D9]/10 px-2 py-0.5 rounded border border-[#6D28D9]/20 self-start">{bot.prefix}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[9px] text-[#A0A0B0] tracking-wider mb-1">LOAD</span>
                    <div className="flex items-center gap-2 text-xs">
                      <Users size={12} className="text-[#A0A0B0]" />
                      <span>{bot.groups} {bot.groupType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-[#1E1E28] border border-[#2A2A35] text-[#A0A0B0] hover:text-[#F0F0F5] hover:bg-[#2A2A35] transition-colors text-xs tracking-wider uppercase font-sans font-semibold">
                    <Settings size={14} />
                    <span>Gerenciar</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-[#6D28D9] text-white hover:bg-[#5b21b6] transition-colors text-xs tracking-wider uppercase font-sans font-semibold">
                    <Terminal size={14} />
                    <span>Builder</span>
                  </button>
                  <button className="w-10 flex items-center justify-center rounded bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
