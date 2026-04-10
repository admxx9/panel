import React from "react";
import { MessageCircle, Send, Hash, Plus, Settings, Trash2, Users, Wifi, Power, Loader, MoreHorizontal, MessageSquare, Image as ImageIcon, Zap } from "lucide-react";

interface BotData {
  id: string;
  name: string;
  platform: "whatsapp" | "discord" | "telegram";
  status: "connected" | "disconnected" | "connecting";
  phone: string | null;
  groups: number;
  prefix: string;
  events: Array<{ id: string; type: string; message: string; time: string }>;
}

const BOTS: BotData[] = [
  {
    id: "1",
    name: "Bot Vendas",
    platform: "whatsapp",
    status: "connected",
    phone: "+55 62 99373-5175",
    groups: 12,
    prefix: "!",
    events: [
      { id: "e1", type: "message", message: "Mensagem enviada para Grupo Vendas VIP", time: "Há 2 min" },
      { id: "e2", type: "command", message: "Comando !pix executado", time: "Há 15 min" },
    ]
  },
  {
    id: "2",
    name: "Bot Suporte",
    platform: "whatsapp",
    status: "disconnected",
    phone: "+55 11 98765-4321",
    groups: 5,
    prefix: "/",
    events: [
      { id: "e3", type: "disconnect", message: "Conexão perdida", time: "Há 2 horas" },
      { id: "e4", type: "message", message: "Mensagem recebida de Cliente #492", time: "Há 3 horas" },
    ]
  },
  {
    id: "3",
    name: "Discord Helper",
    platform: "discord",
    status: "connected",
    phone: null,
    groups: 3,
    prefix: "!",
    events: [
      { id: "e5", type: "command", message: "Comando !help executado", time: "Há 5 min" },
      { id: "e6", type: "join", message: "Novo membro no servidor Central", time: "Há 1 hora" },
    ]
  },
  {
    id: "4",
    name: "Telegram News",
    platform: "telegram",
    status: "connecting",
    phone: null,
    groups: 1,
    prefix: ".",
    events: [
      { id: "e7", type: "connect", message: "Tentando reconectar...", time: "Agora" },
    ]
  }
];

const PLATFORM_CONFIG = {
  whatsapp: { color: "#25D366", icon: MessageCircle, name: "WhatsApp" },
  discord: { color: "#5865F2", icon: Hash, name: "Discord" },
  telegram: { color: "#0088CC", icon: Send, name: "Telegram" },
};

const STATUS_CONFIG = {
  connected: { color: "#22C55E", label: "Online", icon: Wifi },
  disconnected: { color: "#9CA3AF", label: "Offline", icon: Power },
  connecting: { color: "#F59E0B", label: "Conectando", icon: Loader },
};

const EVENT_ICONS: Record<string, React.ElementType> = {
  message: MessageSquare,
  command: Zap,
  disconnect: Power,
  join: Users,
  connect: Loader,
};

export function SocialFeed() {
  return (
    <div className="flex justify-center bg-black min-h-screen w-full">
      <div className="w-[390px] min-h-[844px] bg-[#0F0F14] flex flex-col relative overflow-hidden border-x border-[#2A2A35]">
        
        {/* Header */}
        <header className="px-5 py-4 flex items-center justify-between sticky top-0 z-10 bg-[#0F0F14]/90 backdrop-blur-md border-b border-[#2A2A35]">
          <div>
            <h1 className="text-[22px] font-bold text-[#F0F0F5]">Meus Bots</h1>
            <p className="text-[13px] text-[#A0A0B0] mt-0.5">4 bots · 2 online</p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-[#6D28D9] flex items-center justify-center active:scale-95 transition-transform">
            <Plus size={20} color="#F0F0F5" />
          </button>
        </header>

        {/* Feed */}
        <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          <div className="flex flex-col">
            {BOTS.map((bot) => {
              const platform = PLATFORM_CONFIG[bot.platform];
              const status = STATUS_CONFIG[bot.status];
              const PlatformIcon = platform.icon;
              const StatusIcon = status.icon;

              return (
                <article key={bot.id} className="border-b border-[#2A2A35] bg-[#1A1A24]/50">
                  {/* Post Header */}
                  <div className="px-4 pt-4 pb-3 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#2A2A35] bg-[#0F0F14]"
                          style={{ borderColor: platform.color + "40" }}
                        >
                          <PlatformIcon size={24} color={platform.color} />
                        </div>
                        <div 
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1A1A24] flex items-center justify-center bg-[#1A1A24]"
                        >
                          <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ backgroundColor: status.color }}>
                            {bot.status === 'connecting' ? (
                              <Loader size={8} color="#FFF" className="animate-spin" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-[16px] font-semibold text-[#F0F0F5] leading-tight">{bot.name}</h2>
                          <span className="text-[12px] font-medium px-1.5 py-0.5 rounded text-[#1A1A24]" style={{ backgroundColor: status.color }}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#A0A0B0] flex items-center gap-1.5 mt-0.5">
                          {platform.name}
                          <span>·</span>
                          {bot.phone || (bot.platform === 'discord' ? 'Servidor' : 'Canal')}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 -mr-2 text-[#A0A0B0] hover:text-[#F0F0F5] rounded-full active:bg-[#2A2A35]">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Post Content (Stats) */}
                  <div className="px-4 py-2">
                    <div className="bg-[#0F0F14] rounded-xl border border-[#2A2A35] p-3 flex justify-between">
                      <div className="flex flex-col items-center flex-1">
                        <Users size={16} className="text-[#A0A0B0] mb-1" />
                        <span className="text-[15px] font-bold text-[#F0F0F5]">{bot.groups}</span>
                        <span className="text-[10px] text-[#A0A0B0] uppercase tracking-wide">{bot.platform === 'discord' ? 'Servers' : 'Grupos'}</span>
                      </div>
                      <div className="w-px bg-[#2A2A35]" />
                      <div className="flex flex-col items-center flex-1">
                        <Hash size={16} className="text-[#A0A0B0] mb-1" />
                        <span className="text-[15px] font-bold text-[#F0F0F5]">{bot.prefix || "!"}</span>
                        <span className="text-[10px] text-[#A0A0B0] uppercase tracking-wide">Prefix</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="px-4 py-3">
                    <h3 className="text-[12px] font-semibold text-[#A0A0B0] mb-3 uppercase tracking-wider">Atividade Recente</h3>
                    <div className="space-y-3">
                      {bot.events.map((event, idx) => {
                        const EventIcon = EVENT_ICONS[event.type] || MessageSquare;
                        const isLast = idx === bot.events.length - 1;
                        return (
                          <div key={event.id} className="flex gap-3 relative">
                            {!isLast && <div className="absolute left-[11px] top-6 bottom-[-16px] w-px bg-[#2A2A35]" />}
                            <div className="w-6 h-6 rounded-full bg-[#2A2A35] flex items-center justify-center z-10 shrink-0">
                              <EventIcon size={12} className="text-[#F0F0F5]" />
                            </div>
                            <div className="flex-1 pb-1">
                              <p className="text-[14px] text-[#F0F0F5] leading-snug">{event.message}</p>
                              <span className="text-[11px] text-[#A0A0B0] mt-0.5 block">{event.time}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="px-4 py-3 border-t border-[#2A2A35] flex items-center justify-between">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A2A35]/50 hover:bg-[#2A2A35] text-[#F0F0F5] transition-colors">
                        <Settings size={16} className="text-[#A0A0B0]" />
                        <span className="text-[13px] font-medium">Gerenciar</span>
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D28D9]/20 hover:bg-[#6D28D9]/30 text-[#A78BFA] transition-colors">
                        <Zap size={16} />
                        <span className="text-[13px] font-medium">Builder</span>
                      </button>
                    </div>
                    
                    <button className="p-2 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/10 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          
          <div className="p-6 flex flex-col items-center justify-center text-center opacity-50">
             <div className="w-10 h-10 rounded-full bg-[#2A2A35] flex items-center justify-center mb-3">
               <Loader size={20} className="text-[#A0A0B0]" />
             </div>
             <p className="text-[13px] text-[#A0A0B0]">Fim do feed</p>
          </div>
        </main>
      </div>
    </div>
  );
}
