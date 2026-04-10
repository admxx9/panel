import React, { useState } from 'react';
import { 
  MessageCircle, Hash, Send, Plus, Settings, Trash2, Users, Wifi, 
  Power, Loader, Clock, BarChart3, Terminal, Activity, Search, 
  Filter, Phone, Calendar, CheckCircle2, XCircle, AlertCircle, MessageSquare, Globe, Zap
} from 'lucide-react';

const MOCK_BOTS = [
  {
    id: '1',
    name: "Bot Vendas",
    platform: "WhatsApp",
    status: "connected",
    phone: "+55 62 99373-5175",
    groups: 12,
    messagesToday: 847,
    uptime: "99.2",
    created: "15 Jan 2025",
    lastMessage: "Olá! Como posso ajudar?",
    lastMessageTime: "2 min ago",
    commands: 24,
    prefix: "!",
    platformColor: "#25D366"
  },
  {
    id: '2',
    name: "Bot Suporte",
    platform: "WhatsApp",
    status: "disconnected",
    phone: "+55 11 98765-4321",
    groups: 5,
    messagesToday: 0,
    uptime: "0.0",
    created: "3 Mar 2025",
    lastMessage: null,
    lastMessageTime: "offline since 2h",
    commands: 8,
    prefix: "/",
    platformColor: "#25D366"
  },
  {
    id: '3',
    name: "Discord Helper",
    platform: "Discord",
    status: "connected",
    phone: null,
    groups: 3,
    messagesToday: 234,
    uptime: "98.7",
    created: "20 Feb 2025",
    lastMessage: "!help menu",
    lastMessageTime: "5 min ago",
    commands: 15,
    prefix: "!",
    platformColor: "#5865F2"
  },
  {
    id: '4',
    name: "Telegram News",
    platform: "Telegram",
    status: "connecting",
    phone: null,
    groups: 1,
    messagesToday: 12,
    uptime: "95.0",
    created: "1 Apr 2025",
    lastMessage: null,
    lastMessageTime: "connecting...",
    commands: 3,
    prefix: ".",
    platformColor: "#0088CC"
  }
];

const STATUS_CFG = {
  connected: { color: "#22C55E", label: "Online", icon: CheckCircle2, bg: "#22C55E15" },
  connecting: { color: "#F59E0B", label: "Connecting", icon: Loader, bg: "#F59E0B15" },
  disconnected: { color: "#9CA3AF", label: "Offline", icon: XCircle, bg: "#9CA3AF15" },
  error: { color: "#EF4444", label: "Error", icon: AlertCircle, bg: "#EF444415" },
};

function BotProfileCard({ bot }: { bot: typeof MOCK_BOTS[0] }) {
  const [activeTab, setActiveTab] = useState<'info' | 'activity' | 'stats'>('info');
  const status = STATUS_CFG[bot.status as keyof typeof STATUS_CFG];
  const StatusIcon = status.icon;

  const initials = bot.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="bg-[#1A1A24] rounded-2xl border border-[#2A2A35] overflow-hidden mb-6 shadow-lg shadow-black/20">
      {/* Header Profile Section */}
      <div className="p-6 pb-0 flex flex-col items-center text-center relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5`}
               style={{ backgroundColor: status.bg, color: status.color, border: `1px solid ${status.color}30` }}>
            {bot.status === 'connecting' ? (
              <Loader className="w-3 h-3 animate-spin" />
            ) : bot.status === 'connected' ? (
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            ) : null}
            {status.label}
          </div>
        </div>

        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-xl"
               style={{ backgroundColor: bot.platformColor }}>
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#1A1A24] flex items-center justify-center">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: bot.platformColor }}>
              {bot.platform === 'WhatsApp' && <MessageCircle className="w-3 h-3" />}
              {bot.platform === 'Discord' && <MessageCircle className="w-3 h-3" />}
              {bot.platform === 'Telegram' && <Send className="w-3 h-3" />}
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-[#F0F0F5] mb-1">{bot.name}</h3>
        <p className="text-sm text-[#A0A0B0] flex items-center gap-1.5">
          {bot.phone ? <Phone className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
          {bot.phone || `Platform: ${bot.platform}`}
        </p>
      </div>

      {/* Custom Tabs */}
      <div className="flex border-b border-[#2A2A35] mt-6 px-4">
        {[
          { id: 'info', label: 'Info', icon: Activity },
          { id: 'activity', label: 'Activity', icon: Clock },
          { id: 'stats', label: 'Stats', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-[#6D28D9] text-[#F0F0F5]' 
                : 'border-transparent text-[#A0A0B0] hover:text-[#D1D1DB]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-5 bg-[#15151E] min-h-[180px]">
        {activeTab === 'info' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1A1A24] p-3 rounded-xl border border-[#2A2A35]">
              <div className="text-[11px] text-[#A0A0B0] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> Groups
              </div>
              <div className="text-lg font-semibold text-[#F0F0F5]">{bot.groups}</div>
            </div>
            <div className="bg-[#1A1A24] p-3 rounded-xl border border-[#2A2A35]">
              <div className="text-[11px] text-[#A0A0B0] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Terminal className="w-3 h-3" /> Commands
              </div>
              <div className="text-lg font-semibold text-[#F0F0F5]">{bot.commands}</div>
            </div>
            <div className="bg-[#1A1A24] p-3 rounded-xl border border-[#2A2A35]">
              <div className="text-[11px] text-[#A0A0B0] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3" /> Prefix
              </div>
              <div className="text-lg font-semibold text-[#F0F0F5]">{bot.prefix}</div>
            </div>
            <div className="bg-[#1A1A24] p-3 rounded-xl border border-[#2A2A35]">
              <div className="text-[11px] text-[#A0A0B0] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Created
              </div>
              <div className="text-sm font-semibold text-[#F0F0F5] mt-1">{bot.created}</div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#2A2A35] before:to-transparent">
            {bot.lastMessage ? (
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#2A2A35] bg-[#1A1A24] text-[#A78BFA] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <MessageSquare className="w-3 h-3" />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] shadow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-[#F0F0F5]">Outbound</span>
                    <span className="text-[10px] text-[#A0A0B0]">{bot.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-[#A0A0B0] italic">"{bot.lastMessage}"</p>
                </div>
              </div>
            ) : (
               <div className="text-center py-6 text-[#A0A0B0] text-sm">
                 <Power className="w-8 h-8 mx-auto mb-2 opacity-20" />
                 {bot.lastMessageTime}
               </div>
            )}
            
            {bot.status === 'connected' && (
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#2A2A35] bg-[#1A1A24] text-[#22C55E] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Wifi className="w-3 h-3" />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] shadow opacity-70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-[#F0F0F5]">Connection</span>
                    <span className="text-[10px] text-[#A0A0B0]">System</span>
                  </div>
                  <p className="text-xs text-[#A0A0B0]">Connected to {bot.platform}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="bg-[#1A1A24] p-4 rounded-xl border border-[#2A2A35] flex items-center justify-between">
              <div>
                <div className="text-xs text-[#A0A0B0] mb-1">Messages Today</div>
                <div className="text-2xl font-bold text-[#F0F0F5]">{bot.messagesToday}</div>
              </div>
              <div className="flex items-end gap-1 h-10">
                {[40, 70, 30, 85, 50, 90, 60].map((h, i) => (
                  <div key={i} className="w-2 bg-[#6D28D9] rounded-t-sm opacity-80" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
            
            <div className="bg-[#1A1A24] p-4 rounded-xl border border-[#2A2A35] flex items-center gap-4">
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path className="text-[#2A2A35]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-[#6D28D9]" strokeDasharray={`${bot.uptime}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#A78BFA]" />
                </div>
              </div>
              <div>
                <div className="text-xs text-[#A0A0B0] mb-1">Uptime SLA</div>
                <div className="text-lg font-bold text-[#F0F0F5]">{bot.uptime}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-4 bg-[#1A1A24] border-t border-[#2A2A35] flex gap-3">
        <button className="flex-1 bg-[#1E1E28] hover:bg-[#2A2A35] border border-[#2A2A35] text-[#F0F0F5] py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
          <Settings className="w-4 h-4 text-[#A0A0B0]" /> Manage
        </button>
        <button className="flex-1 bg-[#6D28D9] hover:bg-[#5B21B6] text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#6D28D9]/20">
          <Terminal className="w-4 h-4" /> Builder
        </button>
        <button className="w-11 h-[42px] bg-[#EF444415] hover:bg-[#EF444425] border border-[#EF444430] text-[#EF4444] rounded-xl flex items-center justify-center transition-colors shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function CRMProfile() {
  const totalBots = MOCK_BOTS.length;
  const onlineBots = MOCK_BOTS.filter(b => b.status === 'connected').length;
  const totalMsgs = MOCK_BOTS.reduce((acc, b) => acc + b.messagesToday, 0);
  const totalCmds = MOCK_BOTS.reduce((acc, b) => acc + b.commands, 0);

  return (
    <div className="w-[390px] h-[844px] bg-[#0F0F14] overflow-y-auto overflow-x-hidden font-sans text-[#F0F0F5] mx-auto border border-[#2A2A35] shadow-2xl relative scrollbar-hide">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#0F0F14]/90 backdrop-blur-md border-b border-[#2A2A35] px-5 py-4 pt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Meus Bots</h1>
            <p className="text-sm text-[#A0A0B0] flex items-center gap-2">
              <span className="font-medium text-[#F0F0F5]">{totalBots} bots</span>
              <span className="w-1 h-1 rounded-full bg-[#2A2A35]"></span>
              <span className="text-[#22C55E]">{onlineBots} online</span>
            </p>
          </div>
          <button className="w-10 h-10 bg-[#6D28D9] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#6D28D9]/20 hover:scale-105 active:scale-95 transition-transform">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 bg-[#1E1E28] border border-[#2A2A35] rounded-xl px-3 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#A0A0B0]" />
            <input 
              type="text" 
              placeholder="Search bots..." 
              className="bg-transparent border-none outline-none text-sm text-[#F0F0F5] w-full placeholder:text-[#6B7280]"
            />
          </div>
          <button className="w-[42px] h-[42px] bg-[#1E1E28] border border-[#2A2A35] rounded-xl flex items-center justify-center text-[#A0A0B0]">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6D28D9]/10 flex items-center justify-center text-[#A78BFA]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-[#A0A0B0] font-medium uppercase">Messages</div>
              <div className="text-lg font-bold">{totalMsgs}</div>
            </div>
          </div>
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-[#A0A0B0] font-medium uppercase">Commands</div>
              <div className="text-lg font-bold">{totalCmds}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bot Cards List */}
      <div className="px-5 pb-8">
        {MOCK_BOTS.map((bot) => (
          <BotProfileCard key={bot.id} bot={bot} />
        ))}
      </div>
    </div>
  );
}
