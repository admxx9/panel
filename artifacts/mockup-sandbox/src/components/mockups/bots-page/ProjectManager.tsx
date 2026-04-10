import React, { useState } from "react";
import {
  MessageSquare,
  Phone,
  Server,
  Hash,
  Power,
  PowerOff,
  RefreshCw,
  AlertCircle,
  MoreVertical,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  BarChart3,
  Activity,
  CheckSquare,
  Users,
  Settings,
  LayoutGrid,
  Trash2,
  ChevronRight,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

export function ProjectManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const bots = [
    {
      id: "1",
      name: "Bot Vendas",
      platform: "whatsapp",
      status: "connected",
      phone: "+55 62 99373-5175",
      groups: 12,
      msgsToday: 847,
      uptime: "99.2%",
      created: "15 Jan 2025",
      lastMsg: "Olá! Como posso ajudar?",
      lastMsgTime: "2 min ago",
      commands: 24,
      commandsTotal: 30,
      prefix: "!",
      features: [
        { name: "Auto-reply", enabled: true },
        { name: "Welcome msg", enabled: true },
        { name: "Moderation", enabled: false },
      ],
      milestones: [
        { name: "Created", date: "15 Jan", done: true },
        { name: "First msg", date: "16 Jan", done: true },
        { name: "1k msgs", date: "20 Jan", done: true },
      ],
    },
    {
      id: "2",
      name: "Bot Suporte",
      platform: "whatsapp",
      status: "disconnected",
      phone: "+55 11 98765-4321",
      groups: 5,
      msgsToday: 0,
      uptime: "0%",
      created: "3 Mar 2025",
      lastMsg: "",
      lastMsgTime: "offline since 2h",
      commands: 8,
      commandsTotal: 15,
      prefix: "/",
      features: [
        { name: "Auto-reply", enabled: true },
        { name: "Welcome msg", enabled: false },
        { name: "Moderation", enabled: false },
      ],
      milestones: [
        { name: "Created", date: "3 Mar", done: true },
        { name: "First msg", date: "3 Mar", done: true },
        { name: "1k msgs", date: "-", done: false },
      ],
    },
    {
      id: "3",
      name: "Discord Helper",
      platform: "discord",
      status: "connected",
      phone: "3 servers",
      groups: 3,
      msgsToday: 234,
      uptime: "98.7%",
      created: "20 Feb 2025",
      lastMsg: "!help menu",
      lastMsgTime: "5 min ago",
      commands: 15,
      commandsTotal: 20,
      prefix: "!",
      features: [
        { name: "Auto-reply", enabled: false },
        { name: "Welcome msg", enabled: true },
        { name: "Moderation", enabled: true },
      ],
      milestones: [
        { name: "Created", date: "20 Feb", done: true },
        { name: "First msg", date: "20 Feb", done: true },
        { name: "1k msgs", date: "-", done: false },
      ],
    },
    {
      id: "4",
      name: "Telegram News",
      platform: "telegram",
      status: "connecting",
      phone: "1 group",
      groups: 1,
      msgsToday: 12,
      uptime: "100%",
      created: "1 Apr 2025",
      lastMsg: "",
      lastMsgTime: "connecting...",
      commands: 3,
      commandsTotal: 5,
      prefix: ".",
      features: [
        { name: "Auto-reply", enabled: false },
        { name: "Welcome msg", enabled: false },
        { name: "Moderation", enabled: false },
      ],
      milestones: [
        { name: "Created", date: "1 Apr", done: true },
        { name: "First msg", date: "-", done: false },
        { name: "1k msgs", date: "-", done: false },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F14] text-[#F0F0F5] font-sans pb-20 selection:bg-[#6D28D9] selection:text-white sm:max-w-[390px] sm:mx-auto sm:border-x sm:border-[#2A2A35] relative shadow-2xl">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
          70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .status-dot-pulse {
          animation: pulse-ring 2s infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Header */}
      <header className="px-4 pt-12 pb-4 sticky top-0 z-20 bg-[#0F0F14]/90 backdrop-blur-md border-b border-[#2A2A35]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#F0F0F5] tracking-tight">Meus Bots</h1>
            <p className="text-sm text-[#A0A0B0] mt-0.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>4 projetos · 2 ativos</span>
            </p>
          </div>
          <button className="bg-[#6D28D9] hover:bg-[#5B21B6] transition-colors w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(109,40,217,0.3)]">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 mb-4 overflow-x-auto scrollbar-hide pb-2">
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl px-3 py-2 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
              <Power className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-xs text-[#A0A0B0] font-medium">Uptime Médio</p>
              <p className="text-sm font-bold">99.1%</p>
            </div>
          </div>
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl px-3 py-2 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#6D28D9]/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#A78BFA]" />
            </div>
            <div>
              <p className="text-xs text-[#A0A0B0] font-medium">Msgs Hoje</p>
              <p className="text-sm font-bold">1.093</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar projetos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E1E28] border border-[#2A2A35] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F0F0F5] placeholder:text-[#6B7280] focus:outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9]/50 transition-all"
            />
          </div>
          <button className="w-[42px] h-[42px] shrink-0 bg-[#1A1A24] border border-[#2A2A35] rounded-xl flex items-center justify-center text-[#A0A0B0] hover:text-[#F0F0F5] transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
          {["All", "Active", "Planning", "Paused"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-[#6D28D9]/15 text-[#A78BFA] border border-[#6D28D9]/30' : 'bg-[#1A1A24] text-[#A0A0B0] border border-transparent hover:text-[#F0F0F5]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <main className="px-4 py-4 space-y-4">
        {bots.map((bot) => (
          <BotProjectCard key={bot.id} bot={bot} />
        ))}
      </main>

    </div>
  );
}

function BotProjectCard({ bot }: { bot: any }) {
  const isOnline = bot.status === "connected";
  const isConnecting = bot.status === "connecting";
  const isOffline = bot.status === "disconnected";
  const isError = bot.status === "error";

  const statusColor = isOnline ? "#22C55E" : isConnecting ? "#F59E0B" : isError ? "#EF4444" : "#9CA3AF";
  const statusBg = isOnline ? "bg-[#22C55E]/10" : isConnecting ? "bg-[#F59E0B]/10" : isError ? "bg-[#EF4444]/10" : "bg-[#9CA3AF]/10";
  const statusText = isOnline ? "text-[#22C55E]" : isConnecting ? "text-[#F59E0B]" : isError ? "text-[#EF4444]" : "text-[#9CA3AF]";
  const statusLabel = isOnline ? "Active" : isConnecting ? "Booting" : "Paused";

  const platformColor = bot.platform === "whatsapp" ? "#25D366" : bot.platform === "discord" ? "#5865F2" : "#0088CC";

  const commandsPercent = Math.round((bot.commands / bot.commandsTotal) * 100);

  return (
    <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl overflow-hidden relative shadow-sm group hover:border-[#2A2A35]/80 transition-colors">
      {/* Colored Sidebar Stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: platformColor }} />
      
      <div className="p-4 pl-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#15151E] border border-[#2A2A35] flex items-center justify-center shrink-0">
              {bot.platform === "whatsapp" && <MessageCircle className="w-5 h-5" style={{ color: platformColor }} />}
              {bot.platform === "discord" && <Hash className="w-5 h-5" style={{ color: platformColor }} />}
              {bot.platform === "telegram" && <MessageSquare className="w-5 h-5" style={{ color: platformColor }} />}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#F0F0F5] leading-tight mb-0.5 group-hover:text-white transition-colors">{bot.name}</h3>
              <p className="text-xs text-[#A0A0B0] font-medium flex items-center gap-1.5">
                <span>{bot.phone}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button className="text-[#6B7280] hover:text-[#A0A0B0] transition-colors p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className={`px-2 py-0.5 rounded-md ${statusBg} ${statusText} text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5`}>
              {isOnline && <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] status-dot-pulse" />}
              {statusLabel}
            </div>
          </div>
        </div>

        {/* Due Date & Quick Stats */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 bg-[#15151E] border border-[#2A2A35] rounded-md px-2 py-1">
            <Clock className={`w-3.5 h-3.5 ${isOnline ? 'text-[#22C55E]' : 'text-[#6B7280]'}`} />
            <span className="text-xs font-medium text-[#A0A0B0]">{bot.lastMsgTime}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#15151E] border border-[#2A2A35] rounded-md px-2 py-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span className="text-xs font-medium text-[#A0A0B0]">{bot.msgsToday} msgs</span>
          </div>
        </div>

        <div className="h-px w-full bg-[#2A2A35]/50 mb-4" />

        {/* Progress section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider">Commands Configured</span>
            <span className="text-xs font-bold text-[#F0F0F5]">{bot.commands}/{bot.commandsTotal}</span>
          </div>
          <div className="h-1.5 w-full bg-[#15151E] rounded-full overflow-hidden border border-[#2A2A35]">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ 
                width: `${commandsPercent}%`, 
                backgroundColor: statusColor 
              }}
            >
              <div className="absolute inset-0 bg-white/20" />
            </div>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="mb-4 bg-[#15151E] rounded-lg border border-[#2A2A35] p-3">
          <div className="text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider mb-2">Features</div>
          <div className="space-y-2">
            {bot.features.map((feat: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${feat.enabled ? 'bg-[#6D28D9] border-[#6D28D9]' : 'bg-[#1E1E28] border-[#2A2A35]'}`}>
                  {feat.enabled && <CheckSquare className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <span className={`text-[13px] ${feat.enabled ? 'text-[#F0F0F5]' : 'text-[#6B7280]'}`}>{feat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline & Avatars */}
        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-col gap-1.5">
            <div className="text-[10px] font-semibold text-[#A0A0B0] uppercase tracking-wider">Milestones</div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#6B7280]">
              {bot.milestones.map((m: any, idx: number) => (
                <React.Fragment key={idx}>
                  <span className={m.done ? "text-[#A78BFA]" : ""}>{m.name}</span>
                  {idx < bot.milestones.length - 1 && <span>›</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
             <div className="text-[10px] font-semibold text-[#A0A0B0] uppercase tracking-wider">Groups</div>
             <div className="flex -space-x-2">
               {[...Array(Math.min(bot.groups, 3))].map((_, i) => (
                 <div key={i} className="w-6 h-6 rounded-full bg-[#1E1E28] border border-[#2A2A35] flex items-center justify-center text-[10px] font-bold text-[#A0A0B0] ring-2 ring-[#1A1A24] z-10">
                   {String.fromCharCode(65 + i)}
                 </div>
               ))}
               {bot.groups > 3 && (
                 <div className="w-6 h-6 rounded-full bg-[#2A2A35] border border-[#2A2A35] flex items-center justify-center text-[9px] font-bold text-[#F0F0F5] ring-2 ring-[#1A1A24] z-0">
                   +{bot.groups - 3}
                 </div>
               )}
               {bot.groups === 0 && (
                  <div className="w-6 h-6 rounded-full bg-[#1E1E28] border border-[#2A2A35] border-dashed flex items-center justify-center">
                    <span className="text-[10px] text-[#6B7280]">-</span>
                  </div>
               )}
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-[#2A2A35]/50">
          <button className="flex-1 h-9 rounded-lg bg-[#15151E] border border-[#2A2A35] text-xs font-semibold text-[#A0A0B0] hover:text-[#F0F0F5] hover:bg-[#1E1E28] transition-colors flex items-center justify-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Gerenciar
          </button>
          <button className="flex-1 h-9 rounded-lg bg-[#6D28D9] text-xs font-semibold text-white hover:bg-[#5B21B6] transition-colors flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(109,40,217,0.25)]">
            <LayoutGrid className="w-3.5 h-3.5" />
            Builder
          </button>
          <button className="w-9 h-9 shrink-0 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors flex items-center justify-center">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
