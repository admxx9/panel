import React, { useState } from 'react';
import { Plus, MessageCircle, Play, Settings, Power, Disc, Send } from 'lucide-react';

export function ChatBubbles() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const bots = [
    { id: 1, name: 'Bot Vendas', platform: 'whatsapp', status: 'online', detail: '12 groups', align: 'left', time: '10:42 AM' },
    { id: 2, name: 'Bot Suporte', platform: 'whatsapp', status: 'offline', detail: '5 groups', align: 'right', time: '11:15 AM' },
    { id: 3, name: 'Discord Helper', platform: 'discord', status: 'online', detail: '3 servers', align: 'left', time: '12:30 PM' },
    { id: 4, name: 'Telegram News', platform: 'telegram', status: 'connecting', detail: '1 group', align: 'right', time: '1:05 PM' },
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-[#22C55E]';
      case 'connecting': return 'bg-[#F59E0B]';
      case 'offline': return 'bg-[#9CA3AF]';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return <MessageCircle size={12} className="text-white" />;
      case 'discord': return <Disc size={12} className="text-white" />;
      case 'telegram': return <Send size={12} className="text-white" />;
      default: return <MessageCircle size={12} className="text-white" />;
    }
  };
  
  const getPlatformBg = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return 'bg-[#25D366]';
      case 'discord': return 'bg-[#5865F2]';
      case 'telegram': return 'bg-[#0088CC]';
      default: return 'bg-gray-500';
    }
  };

  const getAvatarInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-[390px] h-[844px] bg-[#0F0F14] overflow-hidden flex flex-col relative font-sans text-[#F0F0F5]">
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-14 pb-4 bg-[#1A1A24]/95 backdrop-blur-md z-10 sticky top-0 border-b border-[#2A2A35]">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight">Meus Bots</h1>
          <span className="text-xs text-[#22C55E] font-medium">4 bots configured</span>
        </div>
        <button className="w-10 h-10 rounded-full bg-[#6D28D9] flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          <Plus size={22} className="text-white" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24" style={{ backgroundImage: 'radial-gradient(#2A2A35 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundPosition: '-12px -12px' }}>
        {bots.map((bot) => {
          const isLeft = bot.align === 'left';
          const isExpanded = expandedId === bot.id;

          return (
            <div key={bot.id} className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
              <div 
                className={`flex gap-2 max-w-[85%] ${isLeft ? 'flex-row' : 'flex-row-reverse'} cursor-pointer`}
                onClick={() => toggleExpand(bot.id)}
              >
                {/* Avatar (Only for left aligned usually, but we keep it alternating for the chat feel) */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2A2A35] flex items-center justify-center shadow-sm relative self-end mb-4">
                  <span className="text-[10px] font-bold text-[#F0F0F5]">{getAvatarInitials(bot.name)}</span>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0F0F14] flex items-center justify-center ${getPlatformBg(bot.platform)}`}>
                    {getPlatformIcon(bot.platform)}
                  </div>
                </div>

                {/* Bubble Container */}
                <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
                  
                  {/* Message Bubble */}
                  <div className={`
                    relative p-3.5 rounded-2xl bg-[#1A1A24] border border-[#2A2A35] shadow-sm transition-all duration-200 ease-in-out active:scale-[0.98]
                    ${isLeft ? 'rounded-bl-sm bg-[#1A1A24]' : 'rounded-br-sm bg-[#6D28D9]/20 border-[#6D28D9]/30'}
                  `}>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold tracking-tight">{bot.name}</span>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(bot.status)}`} />
                      </div>
                      <div className="flex items-center gap-1.5 opacity-80">
                        <span className="text-[13px] text-[#A0A0B0] capitalize">{bot.status} • {bot.detail}</span>
                      </div>
                    </div>

                    {/* Expanded Actions */}
                    <div className={`
                      overflow-hidden transition-all duration-300 ease-in-out flex justify-center
                      ${isExpanded ? 'max-h-24 opacity-100 mt-3 pt-3 border-t border-[#2A2A35]/50' : 'max-h-0 opacity-0 mt-0 pt-0 border-transparent'}
                    `}>
                      <div className="flex items-center justify-around gap-2 w-full">
                        <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-[#2A2A35] active:bg-[#2A2A35] transition-colors w-16">
                          <Play size={16} className="text-[#22C55E] mb-1" />
                          <span className="text-[10px] text-[#A0A0B0] font-medium">Start</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-[#2A2A35] active:bg-[#2A2A35] transition-colors w-16">
                          <Power size={16} className="text-[#9CA3AF] mb-1" />
                          <span className="text-[10px] text-[#A0A0B0] font-medium">Stop</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-[#2A2A35] active:bg-[#2A2A35] transition-colors w-16">
                          <Settings size={16} className="text-[#F0F0F5] mb-1" />
                          <span className="text-[10px] text-[#A0A0B0] font-medium">Config</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#A0A0B0] mt-1 px-1 font-medium">{bot.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
