import React, { useState } from "react";
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
  Clock,
  BarChart3,
  Terminal,
  Activity,
  Search,
  Filter,
  ChevronRight,
  MoreVertical,
  Zap,
  Globe,
  Shield,
  Phone,
  Server,
  Network
} from "lucide-react";

export function PremiumDash() {
  const [filter, setFilter] = useState("all");

  const summaryCards = [
    { label: "Total Bots", value: "4", icon: <Terminal size={16} className="text-[#A78BFA]" />, trend: "+1 this week", trendUp: true },
    { label: "Online Now", value: "2", icon: <Zap size={16} className="text-[#22C55E]" />, trend: "98% avg uptime", trendUp: true },
    { label: "Msgs Today", value: "1,093", icon: <MessageCircle size={16} className="text-[#3B82F6]" />, trend: "+12% vs yday", trendUp: true },
    { label: "Commands", value: "50", icon: <Terminal size={16} className="text-[#F59E0B]" />, trend: "Across all bots", trendUp: true },
  ];

  const bots = [
    {
      id: "1",
      name: "Bot Vendas",
      platform: "whatsapp",
      platformColor: "#25D366",
      status: "online",
      phone: "+55 62 99373-5175",
      groups: 12,
      messages: 847,
      uptime: "99.2%",
      createdAt: "15 Jan 2025",
      lastMessage: "Olá! Como posso ajudar?",
      lastMessageTime: "2 min ago",
      commands: 24,
      prefix: "!",
    },
    {
      id: "2",
      name: "Bot Suporte",
      platform: "whatsapp",
      platformColor: "#25D366",
      status: "offline",
      phone: "+55 11 98765-4321",
      groups: 5,
      messages: 0,
      uptime: "0%",
      createdAt: "3 Mar 2025",
      lastMessage: null,
      lastMessageTime: "offline since 2h",
      commands: 8,
      prefix: "/",
    },
    {
      id: "3",
      name: "Discord Helper",
      platform: "discord",
      platformColor: "#5865F2",
      status: "online",
      phone: null,
      groups: 3,
      messages: 234,
      uptime: "98.7%",
      createdAt: "20 Feb 2025",
      lastMessage: "!help menu",
      lastMessageTime: "5 min ago",
      commands: 15,
      prefix: "!",
    },
    {
      id: "4",
      name: "Telegram News",
      platform: "telegram",
      platformColor: "#0088CC",
      status: "connecting",
      phone: null,
      groups: 1,
      messages: 12,
      uptime: "N/A",
      createdAt: "1 Apr 2025",
      lastMessage: null,
      lastMessageTime: "connecting...",
      commands: 3,
      prefix: ".",
    },
  ];

  const filteredBots = bots.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  return (
    <div className="min-h-[100dvh] bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-y-auto pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0F0F14]/90 backdrop-blur-md border-b border-[#2A2A35] px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Meus Bots</h1>
          <p className="text-[#A0A0B0] text-sm mt-0.5">4 bots · 2 online</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-[#6D28D9] flex items-center justify-center hover:bg-[#5B21B6] transition-colors shadow-[0_0_15px_rgba(109,40,217,0.3)]">
          <Plus size={20} className="text-white" />
        </button>
      </header>

      <div className="px-4 py-5 space-y-6">
        {/* Summary Scroll */}
        <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {summaryCards.map((card, i) => (
            <div
              key={i}
              className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl p-4 min-w-[160px] snap-center shrink-0 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-[#15151E] border border-[#2A2A35]">
                  {card.icon}
                </div>
                <span className="text-[#A0A0B0] text-xs font-medium">{card.label}</span>
              </div>
              <div className="text-2xl font-bold mb-1">{card.value}</div>
              <div className="text-[10px] text-[#A0A0B0]">{card.trend}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 bg-[#1A1A24] border border-[#2A2A35] p-1 rounded-xl">
            {[
              { id: "all", label: "Todos" },
              { id: "online", label: "Online" },
              { id: "offline", label: "Offline" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f.id
                    ? "bg-[#2A2A35] text-white shadow-sm"
                    : "text-[#A0A0B0] hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#2A2A35] text-[#A0A0B0] hover:text-white">
            <Search size={18} />
          </button>
        </div>

        {/* Bot Cards */}
        <div className="space-y-4">
          {filteredBots.map((bot) => (
            <div
              key={bot.id}
              className="relative bg-[#1A1A24] rounded-2xl border border-[#2A2A35] overflow-hidden flex flex-col group transition-all hover:border-[#3A3A45]"
            >
              {/* Platform Top Border Indicator */}
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-80"
                style={{ backgroundColor: bot.platformColor }}
              />

              {/* Main Info */}
              <div className="p-5 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10"
                      style={{ backgroundColor: bot.platformColor + '20' }}
                    >
                      <MessageCircle
                        size={24}
                        style={{ color: bot.platformColor }}
                        className={bot.platform === 'telegram' ? 'rotate-[-45deg]' : ''}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">{bot.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#A0A0B0] flex items-center gap-1">
                          {bot.platform === 'discord' ? (
                            <Server size={12} />
                          ) : (
                            <Phone size={12} />
                          )}
                          {bot.phone || 'Server Integration'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border"
                    style={{
                      backgroundColor:
                        bot.status === "online" ? "#22C55E15" :
                        bot.status === "connecting" ? "#F59E0B15" : "#9CA3AF15",
                      borderColor:
                        bot.status === "online" ? "#22C55E30" :
                        bot.status === "connecting" ? "#F59E0B30" : "#9CA3AF30",
                    }}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        bot.status === "online" ? "bg-[#22C55E] animate-pulse" :
                        bot.status === "connecting" ? "bg-[#F59E0B]" : "bg-[#9CA3AF]"
                      }`}
                    />
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        color:
                          bot.status === "online" ? "#22C55E" :
                          bot.status === "connecting" ? "#F59E0B" : "#9CA3AF",
                      }}
                    >
                      {bot.status}
                    </span>
                  </div>
                </div>

                {/* 4-column Stats */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-[#15151E] rounded-lg p-2 flex flex-col items-center justify-center border border-[#2A2A35] hover:bg-[#1E1E28] transition-colors">
                    <span className="text-[#6B7280] text-[10px] uppercase font-bold mb-1 flex items-center gap-1">
                      <Send size={10} /> Msgs
                    </span>
                    <span className="text-white font-semibold text-sm">{bot.messages}</span>
                  </div>
                  <div className="bg-[#15151E] rounded-lg p-2 flex flex-col items-center justify-center border border-[#2A2A35] hover:bg-[#1E1E28] transition-colors">
                    <span className="text-[#6B7280] text-[10px] uppercase font-bold mb-1 flex items-center gap-1">
                      {bot.platform === 'discord' ? <Server size={10} /> : <Users size={10} />}
                      {bot.platform === 'discord' ? 'Srvrs' : 'Grps'}
                    </span>
                    <span className="text-white font-semibold text-sm">{bot.groups}</span>
                  </div>
                  <div className="bg-[#15151E] rounded-lg p-2 flex flex-col items-center justify-center border border-[#2A2A35] hover:bg-[#1E1E28] transition-colors">
                    <span className="text-[#6B7280] text-[10px] uppercase font-bold mb-1 flex items-center gap-1">
                      <Terminal size={10} /> Cmds
                    </span>
                    <span className="text-white font-semibold text-sm">{bot.commands}</span>
                  </div>
                  <div className="bg-[#15151E] rounded-lg p-2 flex flex-col items-center justify-center border border-[#2A2A35] hover:bg-[#1E1E28] transition-colors">
                    <span className="text-[#6B7280] text-[10px] uppercase font-bold mb-1 flex items-center gap-1">
                      <Activity size={10} /> Up
                    </span>
                    <span className="text-white font-semibold text-sm">{bot.uptime}</span>
                  </div>
                </div>

                {/* Quote Bubble / Last Activity */}
                <div className="relative pl-3 border-l-2 border-[#2A2A35] py-1 mb-2">
                  <div className="flex justify-between items-end">
                    <div className="flex-1 pr-2">
                      <p className="text-xs text-[#6B7280] mb-0.5 flex items-center gap-1">
                        <Clock size={10} /> {bot.lastMessageTime}
                      </p>
                      {bot.lastMessage ? (
                        <p className="text-sm text-[#E0E0E5] italic line-clamp-1">
                          "{bot.lastMessage}"
                        </p>
                      ) : (
                        <p className="text-sm text-[#6B7280] italic">
                          No recent messages
                        </p>
                      )}
                    </div>
                    <div className="bg-[#1E1E28] text-[#A0A0B0] text-[10px] px-2 py-0.5 rounded flex items-center gap-1 border border-[#2A2A35]">
                      <Hash size={10} /> {bot.prefix}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-[#15151E] border-t border-[#2A2A35] p-3 flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[#1A1A24] border border-[#2A2A35] text-[#F0F0F5] text-sm font-medium hover:bg-[#2A2A35] transition-colors">
                  <Settings size={14} className="text-[#A0A0B0]" />
                  Gerenciar
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[#6D28D9] text-white text-sm font-semibold hover:bg-[#5B21B6] transition-colors shadow-inner">
                  <Activity size={14} />
                  Builder
                </button>
                <button className="w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Global CSS overrides for the component */}
      <style dangerouslySetContent={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
