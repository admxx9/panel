import React from "react";
import {
  MessageSquare,
  Activity,
  Zap,
  Bot,
  Plus,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Settings,
  MoreHorizontal,
  Wifi,
  WifiOff,
  Loader2,
  Wallet,
  Smartphone
} from "lucide-react";

export function CardGrid() {
  return (
    <div className="min-h-screen bg-[#0F0F14] text-[#F0F0F5] font-sans overflow-x-hidden pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-12">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#6D28D9] to-purple-400 p-[2px]">
            <div className="h-full w-full rounded-full bg-[#1A1A24] flex items-center justify-center border-2 border-[#1A1A24]">
              <span className="font-bold text-lg">J</span>
            </div>
          </div>
          <div>
            <p className="text-[#A0A0B0] text-sm font-medium">Bem-vindo de volta</p>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Olá, João</h1>
              <span className="bg-[#6D28D9]/20 text-[#6D28D9] text-xs font-bold px-2 py-0.5 rounded-full border border-[#6D28D9]/30">
                PRO
              </span>
            </div>
          </div>
        </div>
        <button className="h-10 w-10 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center text-[#F0F0F5]">
          <Settings size={20} />
        </button>
      </header>

      <main className="px-6 space-y-6">
        {/* Hero Card */}
        <section>
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#6D28D9] to-[#3B0764] p-6 shadow-2xl">
            {/* Background Graphic */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20">
              <Bot size={160} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                  <Bot size={16} className="text-white" />
                  <span className="text-sm font-medium text-white">Total de Bots</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                  <ArrowUpRight size={14} />
                  <span className="text-xs font-bold">+12%</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-white tracking-tight">4</span>
                  <span className="text-purple-200 text-lg mb-2 font-medium">ativos</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2-Column Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-[#1A1A24] rounded-[24px] p-5 border border-[#2A2A35] flex flex-col justify-between aspect-square relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4 z-10">
              <Wifi className="text-emerald-500" size={20} />
            </div>
            <div className="z-10">
              <span className="text-3xl font-bold text-[#F0F0F5]">2</span>
              <p className="text-[#A0A0B0] text-sm font-medium mt-1">Online</p>
            </div>
          </div>

          <div className="bg-[#1A1A24] rounded-[24px] p-5 border border-[#2A2A35] flex flex-col justify-between aspect-square relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="h-10 w-10 rounded-2xl bg-[#6D28D9]/10 flex items-center justify-center border border-[#6D28D9]/20 mb-4 z-10">
              <MessageSquare className="text-[#6D28D9]" size={20} />
            </div>
            <div className="z-10">
              <span className="text-3xl font-bold text-[#F0F0F5]">1.2K</span>
              <p className="text-[#A0A0B0] text-sm font-medium mt-1">Mensagens hoje</p>
            </div>
          </div>
        </section>

        {/* Quick Actions (Horizontal scroll for card feel) */}
        <section>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory hide-scrollbar">
            <button className="snap-start shrink-0 w-32 bg-[#1A1A24] rounded-[20px] p-4 border border-[#2A2A35] flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform">
              <div className="h-12 w-12 rounded-full bg-[#6D28D9] flex items-center justify-center shadow-[0_0_15px_rgba(109,40,217,0.5)]">
                <Plus size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium">Novo Bot</span>
            </button>
            <button className="snap-start shrink-0 w-32 bg-[#1A1A24] rounded-[20px] p-4 border border-[#2A2A35] flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform">
              <div className="h-12 w-12 rounded-full bg-[#2A2A35] flex items-center justify-center">
                <Activity size={24} className="text-[#F0F0F5]" />
              </div>
              <span className="text-sm font-medium">Builder</span>
            </button>
            <button className="snap-start shrink-0 w-32 bg-[#1A1A24] rounded-[20px] p-4 border border-[#2A2A35] flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform">
              <div className="h-12 w-12 rounded-full bg-[#2A2A35] flex items-center justify-center">
                <Wallet size={24} className="text-[#F0F0F5]" />
              </div>
              <span className="text-sm font-medium">Recarga</span>
            </button>
            <button className="snap-start shrink-0 w-32 bg-[#1A1A24] rounded-[20px] p-4 border border-[#2A2A35] flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform">
              <div className="h-12 w-12 rounded-full bg-[#2A2A35] flex items-center justify-center">
                <CreditCard size={24} className="text-[#F0F0F5]" />
              </div>
              <span className="text-sm font-medium">Planos</span>
            </button>
          </div>
        </section>

        {/* Bot List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Seus Bots</h2>
            <button className="text-[#6D28D9] text-sm font-bold">Ver todos</button>
          </div>

          <div className="bg-[#1A1A24] rounded-[20px] p-4 border border-[#2A2A35] flex items-center gap-4">
            <div className="h-14 w-14 rounded-[16px] bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Smartphone size={24} className="text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-[#F0F0F5] truncate">Suporte Vendas</h3>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">Online</span>
              </div>
              <p className="text-[#A0A0B0] text-sm truncate">+55 11 99999-9999</p>
              <div className="flex items-center gap-2 mt-2">
                <MessageSquare size={12} className="text-[#A0A0B0]" />
                <span className="text-xs text-[#A0A0B0]">842 msgs hoje</span>
              </div>
            </div>
            <button className="p-2 text-[#A0A0B0]">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="bg-[#1A1A24] rounded-[20px] p-4 border border-[#2A2A35] flex items-center gap-4">
            <div className="h-14 w-14 rounded-[16px] bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Loader2 size={24} className="text-amber-500 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-[#F0F0F5] truncate">Atendimento</h3>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">Conectando</span>
              </div>
              <p className="text-[#A0A0B0] text-sm truncate">+55 11 98888-8888</p>
              <div className="flex items-center gap-2 mt-2">
                <MessageSquare size={12} className="text-[#A0A0B0]" />
                <span className="text-xs text-[#A0A0B0]">215 msgs hoje</span>
              </div>
            </div>
            <button className="p-2 text-[#A0A0B0]">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="bg-[#1A1A24] rounded-[20px] p-4 border border-[#2A2A35] flex items-center gap-4 opacity-75">
            <div className="h-14 w-14 rounded-[16px] bg-gray-500/10 flex items-center justify-center shrink-0 border border-gray-500/20">
              <WifiOff size={24} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-[#F0F0F5] truncate">Bot Backup</h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded-md">Offline</span>
              </div>
              <p className="text-[#A0A0B0] text-sm truncate">+55 11 97777-7777</p>
              <div className="flex items-center gap-2 mt-2">
                <MessageSquare size={12} className="text-[#A0A0B0]" />
                <span className="text-xs text-[#A0A0B0]">0 msgs hoje</span>
              </div>
            </div>
            <button className="p-2 text-[#A0A0B0]">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </section>

        {/* Weekly Chart Placeholder */}
        <section className="bg-[#1A1A24] rounded-[24px] p-6 border border-[#2A2A35]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#6D28D9]" />
              <h2 className="font-bold">Uso da Semana</h2>
            </div>
            <span className="text-xs font-bold text-[#A0A0B0] bg-[#2A2A35] px-2 py-1 rounded-md">Últimos 7 dias</span>
          </div>
          
          <div className="flex items-end justify-between h-32 gap-2 mt-4">
            {[30, 45, 20, 60, 80, 50, 100].map((height, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full relative flex items-end justify-center h-full">
                  <div 
                    className="w-full max-w-[24px] bg-gradient-to-t from-[#6D28D9]/40 to-[#6D28D9] rounded-t-sm"
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-[#A0A0B0] font-medium">
                  {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Atividade Recente</h2>
          <div className="bg-[#1A1A24] rounded-[24px] border border-[#2A2A35] overflow-hidden">
            <div className="p-4 border-b border-[#2A2A35] flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Zap size={18} className="text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#F0F0F5]">Bot Suporte Vendas conectado</p>
                <p className="text-xs text-[#A0A0B0] mt-0.5">Há 10 minutos</p>
              </div>
            </div>
            <div className="p-4 border-b border-[#2A2A35] flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-[#6D28D9]/10 flex items-center justify-center">
                <Activity size={18} className="text-[#6D28D9]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#F0F0F5]">Novo fluxo adicionado</p>
                <p className="text-xs text-[#A0A0B0] mt-0.5">Há 2 horas</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <CreditCard size={18} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#F0F0F5]">Pagamento de R$ 97,00 recebido</p>
                <p className="text-xs text-[#A0A0B0] mt-0.5">Ontem</p>
              </div>
            </div>
            <button className="w-full py-3 text-sm font-bold text-[#A0A0B0] bg-[#2A2A35]/30 hover:bg-[#2A2A35]/50 transition-colors">
              Ver histórico completo
            </button>
          </div>
        </section>
      </main>
      
      {/* CSS specific styles for hiding scrollbar but keeping functionality */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
