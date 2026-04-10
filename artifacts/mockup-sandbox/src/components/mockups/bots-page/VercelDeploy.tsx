import React from "react";
import { 
  Search, 
  Plus, 
  GitBranch, 
  Activity, 
  Globe, 
  TerminalSquare, 
  MoreVertical,
  Clock,
  Database,
  Play,
  Settings,
  Trash2,
  Box,
  Hash,
  MessageSquare
} from "lucide-react";

export function VercelDeploy() {
  const bots = [
    {
      id: "bot_vendas_prod",
      hash: "a7f92b4",
      name: "Bot Vendas",
      framework: "WhatsApp",
      frameworkColor: "#25D366",
      status: "ready",
      statusColor: "#22C55E",
      env: "Production",
      phone: "+55 62 99373-5175",
      groups: 12,
      msgsToday: 847,
      uptime: "99.2%",
      createdAt: "15 Jan 2025",
      lastMsg: "Olá! Como posso ajudar?",
      lastMsgTime: "2 min ago",
      commands: 24,
      prefix: "!",
      duration: "14s"
    },
    {
      id: "bot_suporte_prod",
      hash: "c3d18e5",
      name: "Bot Suporte",
      framework: "WhatsApp",
      frameworkColor: "#25D366",
      status: "error",
      statusColor: "#9CA3AF",
      env: "Production",
      phone: "+55 11 98765-4321",
      groups: 5,
      msgsToday: 0,
      uptime: "0.0%",
      createdAt: "3 Mar 2025",
      lastMsg: null,
      lastMsgTime: "offline since 2h",
      commands: 8,
      prefix: "/",
      duration: "0s"
    },
    {
      id: "discord_help_prod",
      hash: "f82a9c1",
      name: "Discord Helper",
      framework: "Discord",
      frameworkColor: "#5865F2",
      status: "ready",
      statusColor: "#22C55E",
      env: "Production",
      phone: null,
      groups: 3,
      msgsToday: 234,
      uptime: "98.7%",
      createdAt: "20 Feb 2025",
      lastMsg: "!help menu",
      lastMsgTime: "5 min ago",
      commands: 15,
      prefix: "!",
      duration: "4s"
    },
    {
      id: "tg_news_preview",
      hash: "e5b7410",
      name: "Telegram News",
      framework: "Telegram",
      frameworkColor: "#0088CC",
      status: "building",
      statusColor: "#F59E0B",
      env: "Preview",
      phone: null,
      groups: 1,
      msgsToday: 12,
      uptime: "-",
      createdAt: "1 Apr 2025",
      lastMsg: null,
      lastMsgTime: "Just now",
      commands: 3,
      prefix: ".",
      duration: "42s"
    }
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-[#0F0F14] text-[#F0F0F5] font-sans pb-20 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0F0F14]/90 backdrop-blur-md border-b border-[#2A2A35]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#A78BFA] flex items-center justify-center">
              <Box className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">Meus Bots</h1>
              <div className="text-[11px] text-[#A0A0B0]">
                4 bots · 2 online
              </div>
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-[#6D28D9] flex items-center justify-center hover:bg-[#5B21B6] transition-colors shadow-[0_0_15px_rgba(109,40,217,0.4)]">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="px-4 flex items-center gap-6 text-[13px] font-medium text-[#A0A0B0] border-t border-[#2A2A35]/50 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button className="py-3 text-[#F0F0F5] border-b-2 border-[#F0F0F5]">All Deployments</button>
          <button className="py-3 hover:text-[#F0F0F5] transition-colors">Production</button>
          <button className="py-3 hover:text-[#F0F0F5] transition-colors">Preview</button>
          <button className="py-3 hover:text-[#F0F0F5] transition-colors">Stopped</button>
        </div>
      </header>

      <main className="px-4 pt-6 max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search deployments..." 
            className="w-full h-10 bg-[#1E1E28] border border-[#2A2A35] rounded-md pl-9 pr-4 text-sm text-[#F0F0F5] placeholder:text-[#6B7280] focus:outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9] transition-all"
          />
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {bots.map((bot, idx) => (
            <div key={idx} className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl overflow-hidden hover:border-[#4A4A5A] transition-colors group">
              
              {/* Top Row */}
              <div className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="mt-1.5 relative">
                      {bot.status === "ready" && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping opacity-20"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] relative z-10 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        </>
                      )}
                      {bot.status === "building" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] relative z-10 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"></div>
                      )}
                      {bot.status === "error" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF] border border-[#1A1A24] relative z-10 ring-1 ring-[#9CA3AF]"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[15px]">{bot.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${bot.env === 'Production' ? 'bg-[#2A2A35] text-[#F0F0F5]' : 'bg-[#6D28D9]/20 text-[#A78BFA]'}`}>
                          {bot.env}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#A0A0B0]">
                        <span className="flex items-center gap-1 text-[#F0F0F5]">
                          <GitBranch className="w-3 h-3" />
                          <span className="font-mono">{bot.hash}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {bot.duration}
                        </span>
                        <span>•</span>
                        <span>{bot.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-8 h-8 rounded-md hover:bg-[#2A2A35] flex items-center justify-center text-[#A0A0B0] transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Platform</span>
                    <div className="flex items-center gap-2 text-[13px] font-medium">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bot.frameworkColor }}></span>
                      {bot.framework}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Endpoint</span>
                    <div className="flex items-center gap-1.5 text-[13px] font-medium">
                      <Globe className="w-3 h-3 text-[#A0A0B0]" />
                      <span className={bot.phone ? "text-[#F0F0F5]" : "text-[#A0A0B0]"}>
                        {bot.phone || `${bot.id}.botaluguel`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Metrics Today</span>
                    <div className="flex items-center gap-3 text-[12px] text-[#A0A0B0]">
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span className="text-[#F0F0F5]">{bot.msgsToday}</span> msgs
                      </div>
                      <div className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        <span className="text-[#F0F0F5]">{bot.groups}</span> grps
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Commands</span>
                    <div className="flex items-center gap-3 text-[12px] text-[#A0A0B0]">
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        prefix: <span className="text-[#F0F0F5]">{bot.prefix}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TerminalSquare className="w-3 h-3" />
                        <span className="text-[#F0F0F5]">{bot.commands}</span> cmd
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Build Logs / Activity Area */}
              <div className="bg-[#15151E] border-t border-[#2A2A35] p-3 px-4 font-mono text-[11px] leading-relaxed">
                {bot.status === "ready" && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-2">
                      <span className="text-[#6B7280] shrink-0 w-12">{bot.lastMsgTime.split(' ')[0]}</span>
                      <span className="text-[#22C55E] shrink-0">[Monitor]</span>
                      <span className="text-[#A0A0B0]">Uptime {bot.uptime}</span>
                    </div>
                    {bot.lastMsg && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#6B7280] shrink-0 w-12">last</span>
                        <span className="text-[#A78BFA] shrink-0">[Message]</span>
                        <span className="text-[#A0A0B0] truncate">{bot.lastMsg}</span>
                      </div>
                    )}
                  </div>
                )}

                {bot.status === "building" && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-2">
                      <span className="text-[#6B7280] shrink-0 w-12">10:42</span>
                      <span className="text-[#F59E0B] shrink-0">[Init]</span>
                      <span className="text-[#A0A0B0]">Starting connection...</span>
                    </div>
                    <div className="flex items-start gap-2 opacity-70">
                      <span className="text-[#6B7280] shrink-0 w-12">10:42</span>
                      <span className="text-[#3B82F6] shrink-0">[Wait]</span>
                      <span className="text-[#A0A0B0]">Generating QR Code for Auth...</span>
                    </div>
                  </div>
                )}

                {bot.status === "error" && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-2">
                      <span className="text-[#6B7280] shrink-0 w-12">08:15</span>
                      <span className="text-[#EF4444] shrink-0">[Error]</span>
                      <span className="text-[#EF4444]">Connection closed by client</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#6B7280] shrink-0 w-12">sys</span>
                      <span className="text-[#A0A0B0] shrink-0">[System]</span>
                      <span className="text-[#A0A0B0]">Offline for 2h</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-3 border-t border-[#2A2A35] flex items-center justify-between bg-[#15151E]">
                <div className="flex items-center gap-2">
                  <button className="h-8 px-3 rounded-md border border-[#2A2A35] bg-[#1E1E28] hover:bg-[#2A2A35] text-[12px] font-medium transition-colors text-[#F0F0F5] flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5" />
                    Gerenciar
                  </button>
                  <button className="h-8 px-3 rounded-md border border-[#EF4444]/20 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[12px] font-medium transition-colors text-[#EF4444] flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button className="h-8 px-4 rounded-md bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-[12px] font-semibold transition-colors flex items-center gap-1.5">
                  {bot.status === "error" ? <Play className="w-3.5 h-3.5 fill-current" /> : <Box className="w-3.5 h-3.5" />}
                  {bot.status === "error" ? "Reconnect" : "Builder"}
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
