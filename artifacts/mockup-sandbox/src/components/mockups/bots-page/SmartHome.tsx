import React, { useState } from "react";
import {
  MessageCircle,
  Plus,
  Search,
  Settings,
  Power,
  Zap,
  Activity,
  Hash,
  MessageSquare,
  Clock,
  TerminalSquare,
  Trash2,
  Bell,
  Cpu,
  Users,
  Server,
  Smartphone,
  ChevronRight,
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
  Gauge,
  MoreVertical,
  Calendar,
  Grid,
  Thermometer,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

const BOTS = [
  {
    id: 1,
    name: "Bot Vendas",
    platform: "whatsapp",
    status: "connected",
    phone: "+55 62 99373-5175",
    groups: 12,
    msgsToday: 847,
    uptime: 99.2,
    createdAt: "15 Jan 2025",
    lastMsg: "Olá! Como posso ajudar?",
    lastMsgTime: "2 min ago",
    commands: 24,
    prefix: "!",
    room: "WhatsApp Devices",
    features: { autoReply: true, antiSpam: true }
  },
  {
    id: 2,
    name: "Bot Suporte",
    platform: "whatsapp",
    status: "disconnected",
    phone: "+55 11 98765-4321",
    groups: 5,
    msgsToday: 0,
    uptime: 0,
    offlineSince: "2h",
    createdAt: "3 Mar 2025",
    commands: 8,
    prefix: "/",
    room: "WhatsApp Devices",
    features: { autoReply: false, antiSpam: true }
  },
  {
    id: 3,
    name: "Discord Helper",
    platform: "discord",
    status: "connected",
    phone: "Discord Server",
    groups: 3,
    msgsToday: 234,
    uptime: 98.7,
    createdAt: "20 Feb 2025",
    lastMsg: "!help menu",
    lastMsgTime: "5 min ago",
    commands: 15,
    prefix: "!",
    room: "Discord Devices",
    features: { autoReply: true, antiSpam: false }
  },
  {
    id: 4,
    name: "Telegram News",
    platform: "telegram",
    status: "connecting",
    phone: "@tgnews_bot",
    groups: 1,
    msgsToday: 12,
    uptime: 0,
    createdAt: "1 Apr 2025",
    commands: 3,
    prefix: ".",
    room: "Telegram Devices",
    features: { autoReply: false, antiSpam: false }
  }
];

export function SmartHome() {
  const [filter, setFilter] = useState("all");

  const filteredBots = BOTS.filter(bot => {
    if (filter === "online") return bot.status === "connected";
    if (filter === "offline") return bot.status === "disconnected";
    return true;
  });

  const rooms = Array.from(new Set(filteredBots.map(b => b.room)));

  return (
    <div className="min-h-screen bg-[#0F0F14] text-[#F0F0F5] font-sans selection:bg-[#6D28D9] selection:text-white flex justify-center">
      <style dangerouslySetInnerHTML={{ __html: \`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
        }
        .pulse-online { animation: pulse-glow 2.5s infinite; }
        
        @keyframes pulse-connecting {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        .animate-connecting { animation: pulse-connecting 1.5s ease-in-out infinite; }
      \`}} />
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#0F0F14] relative overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/5">
        
        {/* Header - Apple Home style */}
        <header className="pt-16 pb-4 px-5 sticky top-0 z-20 bg-gradient-to-b from-[#0F0F14] to-[#0F0F14]/90 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-[32px] font-bold tracking-tight text-white leading-tight">Minha Casa</h1>
              <p className="text-[#A0A0B0] text-[14px] font-medium mt-1 flex items-center gap-1.5">
                <HomeStatusIcon />
                4 bots · 2 online
              </p>
            </div>
            <button className="w-10 h-10 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center text-white hover:bg-[#2A2A35] transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
            {['all', 'online', 'offline'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={\`px-5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all \${
                  filter === f 
                  ? 'bg-white text-[#0F0F14] shadow-[0_4px_12px_rgba(255,255,255,0.15)]' 
                  : 'bg-[#1A1A24] text-[#A0A0B0] border border-[#2A2A35]'
                }\`}
              >
                {f === 'all' ? 'Todos os Dispositivos' : f === 'online' ? 'Ligados' : 'Desligados'}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-32 px-5 pt-2 space-y-8">
          
          {/* Summary Stats - Climate style */}
          <div className="bg-[#1A1A24] rounded-3xl p-5 border border-[#2A2A35] shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D28D9]/10 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-[13px] font-semibold text-[#A0A0B0] mb-4 uppercase tracking-wider">Visão Geral da Casa</h3>
            
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#15151E] flex items-center justify-center mb-2 border border-[#2A2A35]">
                  <Activity className="w-5 h-5 text-[#A78BFA]" />
                </div>
                <span className="text-xl font-bold text-white">1,093</span>
                <span className="text-[10px] text-[#6B7280] font-medium mt-0.5">MENSAGENS</span>
              </div>
              <div className="w-px h-12 bg-[#2A2A35]"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#15151E] flex items-center justify-center mb-2 border border-[#2A2A35]">
                  <Users className="w-5 h-5 text-[#25D366]" />
                </div>
                <span className="text-xl font-bold text-white">21</span>
                <span className="text-[10px] text-[#6B7280] font-medium mt-0.5">GRUPOS</span>
              </div>
              <div className="w-px h-12 bg-[#2A2A35]"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#15151E] flex items-center justify-center mb-2 border border-[#2A2A35]">
                  <Zap className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <span className="text-xl font-bold text-white">50</span>
                <span className="text-[10px] text-[#6B7280] font-medium mt-0.5">COMANDOS</span>
              </div>
            </div>
          </div>

          {rooms.map(room => (
            <div key={room} className="space-y-4">
              <h2 className="text-xl font-bold text-white px-1 tracking-tight">{room}</h2>
              <div className="space-y-5">
                {filteredBots.filter(b => b.room === room).map(bot => (
                  <DeviceCard key={bot.id} bot={bot} />
                ))}
              </div>
            </div>
          ))}

        </main>

        {/* Bottom Nav - Apple Home Style */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A24]/90 backdrop-blur-xl border-t border-[#2A2A35] px-6 pt-4 pb-8 flex justify-between items-center z-30">
          <NavItem icon={<Activity />} label="Início" />
          <NavItem icon={<Grid />} label="Cômodos" active />
          <NavItem icon={<Zap />} label="Automação" />
          <NavItem icon={<Settings />} label="Ajustes" />
        </div>

      </div>
    </div>
  );
}

function HomeStatusIcon() {
  return (
    <div className="relative w-2 h-2 rounded-full bg-[#22C55E]">
      <div className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping opacity-75"></div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={\`flex flex-col items-center gap-1.5 \${active ? 'text-[#6D28D9]' : 'text-[#6B7280]'}\`}>
      {React.cloneElement(icon as React.ReactElement, { 
        className: \`w-6 h-6 \${active ? 'fill-[#6D28D9]/20 stroke-[#6D28D9]' : 'stroke-current'}\` 
      })}
      <span className={\`text-[10px] font-semibold \${active ? 'text-white' : ''}\`}>{label}</span>
    </button>
  );
}

function DeviceCard({ bot }: { bot: any }) {
  const isOnline = bot.status === 'connected';
  const isConnecting = bot.status === 'connecting';
  const isError = bot.status === 'error';
  
  let statusColor = "#9CA3AF"; // offline
  if (isOnline) statusColor = "#22C55E";
  if (isConnecting) statusColor = "#F59E0B";
  if (isError) statusColor = "#EF4444";

  let platformColor = "#25D366";
  if (bot.platform === 'discord') platformColor = "#5865F2";
  if (bot.platform === 'telegram') platformColor = "#0088CC";

  const PlatformIcon = bot.platform === 'whatsapp' ? MessageCircle : 
                       bot.platform === 'discord' ? TerminalSquare : 
                       MessageSquare;

  return (
    <div className="bg-[#1A1A24] rounded-[28px] overflow-hidden shadow-lg relative group">
      {/* Background glow for online status */}
      {isOnline && (
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-15 pointer-events-none"
          style={{ backgroundColor: platformColor }}
        ></div>
      )}

      <div className="p-5">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4 z-10">
            <div 
              className={\`w-14 h-14 rounded-full flex items-center justify-center shadow-lg \${isOnline ? 'bg-white text-[#1A1A24]' : 'bg-[#15151E] text-[#6B7280] border border-[#2A2A35]'}\`}
            >
              <PlatformIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-[19px] text-white tracking-tight">{bot.name}</h3>
              <p className="text-[13px] text-[#A0A0B0] font-medium flex items-center gap-1.5 mt-0.5">
                {bot.phone}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 z-10">
            {/* Large Power Button */}
            <button className={\`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl \${isOnline ? 'bg-[#22C55E] text-white pulse-online' : isConnecting ? 'bg-[#F59E0B] text-white animate-connecting' : 'bg-[#1E1E28] text-[#6B7280] border border-[#2A2A35]'}\`}>
              {isConnecting ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Power className="w-6 h-6 stroke-[2.5]" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 text-[13px] font-medium z-10 relative">
          <div className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-full uppercase tracking-wider text-[11px] font-bold\`} style={{ backgroundColor: \`\${statusColor}15\`, color: statusColor }}>
            <div className={\`w-2 h-2 rounded-full\`} style={{ backgroundColor: statusColor }}></div>
            {isOnline ? 'Ligado' : isConnecting ? 'Conectando' : 'Desligado'}
          </div>
          <span className="text-[#6B7280] px-1">•</span>
          <span className="text-[#A0A0B0] flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {bot.createdAt}</span>
        </div>

        {/* Device Controls - Smart Home Style */}
        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
          
          {/* Uptime Temperature Gauge Style */}
          <div className="bg-[#15151E] rounded-[20px] p-4 border border-[#2A2A35] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center">
                <Thermometer className={\`w-4 h-4 \${bot.uptime > 90 ? 'text-[#22C55E]' : 'text-[#EF4444]'}\`} />
              </div>
              <span className="text-[11px] font-semibold text-[#A0A0B0] uppercase tracking-wider">Uptime</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">{bot.uptime}%</div>
              <div className="w-full h-1.5 bg-[#1A1A24] rounded-full mt-3 overflow-hidden">
                 <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: \`\${bot.uptime}%\`,
                    background: bot.uptime > 90 ? '#22C55E' : '#EF4444'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Volume Slider Style for Message Rate */}
          <div className="bg-[#15151E] rounded-[20px] p-4 border border-[#2A2A35] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4 text-[#A78BFA]" />
              </div>
              <span className="text-[11px] font-semibold text-[#A0A0B0] uppercase tracking-wider">Tráfego</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">{bot.msgsToday}</div>
              <div className="text-[11px] text-[#6B7280] font-medium mt-1 uppercase">Msgs Hoje</div>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
            {/* Toggle Switches */}
            <div className="bg-[#15151E] rounded-xl p-3 border border-[#2A2A35] flex justify-between items-center">
                <span className="text-[13px] font-semibold text-[#F0F0F5]">Auto-Reply</span>
                {bot.features.autoReply ? <ToggleRight className="w-7 h-7 text-[#22C55E]" /> : <ToggleLeft className="w-7 h-7 text-[#6B7280]" />}
            </div>
            <div className="bg-[#15151E] rounded-xl p-3 border border-[#2A2A35] flex justify-between items-center">
                <span className="text-[13px] font-semibold text-[#F0F0F5]">Anti-Spam</span>
                {bot.features.antiSpam ? <ToggleRight className="w-7 h-7 text-[#22C55E]" /> : <ToggleLeft className="w-7 h-7 text-[#6B7280]" />}
            </div>
        </div>

        {/* Details List */}
        <div className="space-y-3 mb-6 relative z-10">
          {bot.lastMsg && (
            <div className="flex items-start gap-3 text-sm">
              <div className="w-7 h-7 rounded-full bg-[#15151E] flex items-center justify-center mt-1 border border-[#2A2A35]">
                <MessageSquare className="w-3.5 h-3.5 text-[#A0A0B0]" />
              </div>
              <div className="flex-1 bg-[#15151E] rounded-[16px] p-3 border border-[#2A2A35]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] font-semibold text-[#A0A0B0] uppercase tracking-wider">Última Atividade</span>
                  <span className="text-[11px] text-[#6B7280] font-medium">{bot.lastMsgTime}</span>
                </div>
                <p className="text-white italic text-[14px]">"{bot.lastMsg}"</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between text-[14px] px-3 py-1">
            <span className="text-[#A0A0B0] flex items-center gap-2"><Settings className="w-4 h-4" /> Comandos</span>
            <span className="font-semibold text-white">{bot.commands} config</span>
          </div>
          <div className="flex items-center justify-between text-[14px] px-3 py-1">
            <span className="text-[#A0A0B0] flex items-center gap-2"><Hash className="w-4 h-4" /> Prefixo</span>
            <span className="font-mono font-bold text-[#A78BFA] bg-[#6D28D9]/15 px-2.5 py-1 rounded-lg">{bot.prefix}</span>
          </div>
          <div className="flex items-center justify-between text-[14px] px-3 py-1">
            <span className="text-[#A0A0B0] flex items-center gap-2"><Users className="w-4 h-4" /> Grupos</span>
            <span className="font-semibold text-white">{bot.groups} ativos</span>
          </div>
        </div>

        {/* Device Actions */}
        <div className="flex gap-2 relative z-10">
          <button className="flex-1 bg-[#15151E] hover:bg-[#2A2A35] transition-colors border border-[#2A2A35] rounded-[14px] py-3.5 flex items-center justify-center gap-2 text-[14px] font-bold text-white shadow-sm">
            <Settings className="w-4 h-4 text-[#A0A0B0]" />
            Gerenciar
          </button>
          <button className="flex-1 bg-[#6D28D9] hover:bg-[#5b21b6] transition-colors shadow-lg shadow-[#6D28D9]/25 rounded-[14px] py-3.5 flex items-center justify-center gap-2 text-[14px] font-bold text-white">
            <Grid className="w-4 h-4 text-white" />
            Builder
          </button>
          <button className="w-[54px] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 transition-colors border border-[#EF4444]/20 rounded-[14px] flex items-center justify-center text-[#EF4444]">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
