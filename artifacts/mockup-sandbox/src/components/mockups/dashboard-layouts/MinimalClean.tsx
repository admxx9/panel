import React from "react";
import { 
  Bot, 
  Plus, 
  Wrench, 
  CreditCard, 
  LayoutTemplate,
  MessageSquare,
  Power,
  Zap,
  TrendingUp,
  CircleDashed,
  Activity
} from "lucide-react";

export function MinimalClean() {
  return (
    <div className="min-h-[100dvh] w-full bg-[#0F0F14] text-[#F0F0F5] font-sans antialiased overflow-y-auto pb-12 selection:bg-[#6D28D9]/30">
      
      {/* Header */}
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-[#0F0F14]/80 backdrop-blur-xl z-20 border-b border-[#2A2A35]/50">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Olá, João</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#A0A0B0]">Plano Pro</span>
              <div className="h-1 w-1 rounded-full bg-[#6D28D9]" />
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1A1A24] to-[#2A2A35] border border-[#2A2A35] flex items-center justify-center overflow-hidden">
             <span className="text-sm font-medium text-[#A0A0B0]">JB</span>
          </div>
        </div>
      </header>

      {/* Stats Row - Minimal single line */}
      <section className="px-6 py-6">
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[#A0A0B0] text-xs font-medium tracking-wide uppercase">Bots</span>
            <span className="text-lg font-medium">4</span>
          </div>
          <div className="w-[1px] h-8 bg-[#2A2A35]"></div>
          <div className="flex flex-col gap-1">
            <span className="text-[#A0A0B0] text-xs font-medium tracking-wide uppercase">Online</span>
            <span className="text-lg font-medium text-[#22C55E]">2</span>
          </div>
          <div className="w-[1px] h-8 bg-[#2A2A35]"></div>
          <div className="flex flex-col gap-1">
            <span className="text-[#A0A0B0] text-xs font-medium tracking-wide uppercase">Offline</span>
            <span className="text-lg font-medium text-[#9CA3AF]">1</span>
          </div>
          <div className="w-[1px] h-8 bg-[#2A2A35]"></div>
          <div className="flex flex-col gap-1">
            <span className="text-[#A0A0B0] text-xs font-medium tracking-wide uppercase">Msgs</span>
            <span className="text-lg font-medium text-[#F0F0F5]">1.2K</span>
          </div>
        </div>
      </section>

      {/* Actions - Slim icon row */}
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between bg-[#1A1A24]/50 border border-[#2A2A35]/50 rounded-2xl p-2">
          <button className="flex flex-col items-center justify-center gap-2 p-3 flex-1 rounded-xl hover:bg-[#2A2A35]/30 transition-colors">
            <Plus className="w-5 h-5 text-[#F0F0F5]" strokeWidth={1.5} />
            <span className="text-[10px] font-medium text-[#A0A0B0]">Novo</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 p-3 flex-1 rounded-xl hover:bg-[#2A2A35]/30 transition-colors">
            <Wrench className="w-5 h-5 text-[#F0F0F5]" strokeWidth={1.5} />
            <span className="text-[10px] font-medium text-[#A0A0B0]">Builder</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 p-3 flex-1 rounded-xl hover:bg-[#2A2A35]/30 transition-colors">
            <CreditCard className="w-5 h-5 text-[#F0F0F5]" strokeWidth={1.5} />
            <span className="text-[10px] font-medium text-[#A0A0B0]">Recarga</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 p-3 flex-1 rounded-xl hover:bg-[#2A2A35]/30 transition-colors">
            <LayoutTemplate className="w-5 h-5 text-[#F0F0F5]" strokeWidth={1.5} />
            <span className="text-[10px] font-medium text-[#A0A0B0]">Planos</span>
          </button>
        </div>
      </section>

      {/* Bot List - The Hero */}
      <section className="px-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-[#A0A0B0]">Seus Bots</h2>
        </div>
        <div className="flex flex-col gap-3">
          
          {/* Bot Card 1 - Online */}
          <div className="group relative bg-[#1A1A24] border border-[#2A2A35] rounded-2xl p-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#22C55E]" />
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#22C55E]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-medium text-[15px]">Atendimento Principal</h3>
                  <p className="text-[#A0A0B0] text-xs font-mono mt-0.5">+55 11 9999-8888</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-[10px] font-medium text-[#22C55E] uppercase tracking-wide">Online</span>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-3 border-t border-[#2A2A35]/50">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#A0A0B0]" strokeWidth={1.5} />
                <span className="text-xs font-medium text-[#A0A0B0]">842 msgs hoje</span>
              </div>
            </div>
          </div>

          {/* Bot Card 2 - Connecting */}
          <div className="group relative bg-[#1A1A24] border border-[#2A2A35] rounded-2xl p-4 overflow-hidden opacity-90">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#F59E0B]" />
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                  <CircleDashed className="w-5 h-5 text-[#F59E0B] animate-spin-slow" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-medium text-[15px]">Suporte Técnico</h3>
                  <p className="text-[#A0A0B0] text-xs font-mono mt-0.5">+55 11 7777-6666</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                <span className="text-[10px] font-medium text-[#F59E0B] uppercase tracking-wide">Conectando</span>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-3 border-t border-[#2A2A35]/50">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#A0A0B0]" strokeWidth={1.5} />
                <span className="text-xs font-medium text-[#A0A0B0]">0 msgs hoje</span>
              </div>
            </div>
          </div>

          {/* Bot Card 3 - Offline */}
          <div className="group relative bg-[#1A1A24] border border-[#2A2A35] rounded-2xl p-4 overflow-hidden opacity-70 grayscale-[20%]">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#9CA3AF]" />
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2A2A35]/50 flex items-center justify-center">
                  <Power className="w-5 h-5 text-[#9CA3AF]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-medium text-[15px]">Vendas Outbound</h3>
                  <p className="text-[#A0A0B0] text-xs font-mono mt-0.5">+55 11 5555-4444</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#2A2A35]/50 border border-[#2A2A35]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wide">Offline</span>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-3 border-t border-[#2A2A35]/50">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#A0A0B0]" strokeWidth={1.5} />
                <span className="text-xs font-medium text-[#A0A0B0]">358 msgs hoje</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Chart Sparkline */}
      <section className="px-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-[#A0A0B0]">Volume da Semana</h2>
          <span className="text-[11px] font-medium text-[#22C55E]">+12%</span>
        </div>
        <div className="h-16 w-full flex items-end gap-1.5 opacity-80">
          <div className="w-full bg-[#6D28D9] rounded-sm h-[30%]" />
          <div className="w-full bg-[#6D28D9] rounded-sm h-[50%]" />
          <div className="w-full bg-[#6D28D9] rounded-sm h-[40%]" />
          <div className="w-full bg-[#6D28D9] rounded-sm h-[80%]" />
          <div className="w-full bg-[#6D28D9] rounded-sm h-[60%]" />
          <div className="w-full bg-[#6D28D9] rounded-sm h-[90%]" />
          <div className="w-full bg-[#6D28D9] rounded-sm h-[100%]" />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-[#A0A0B0]">
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
          <span>Dom</span>
        </div>
      </section>

      {/* Minimal Activity Feed */}
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-[#A0A0B0]">Atividade Recente</h2>
        </div>
        
        <div className="bg-[#1A1A24]/30 border border-[#2A2A35]/50 rounded-2xl p-4">
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-[#22C55E]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Atendimento Principal online</p>
                <p className="text-xs text-[#A0A0B0] mt-0.5">Sessão iniciada com sucesso.</p>
              </div>
              <span className="text-[10px] text-[#A0A0B0]">Agora</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-[#6D28D9]/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-3 h-3 text-[#6D28D9]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Pico de mensagens</p>
                <p className="text-xs text-[#A0A0B0] mt-0.5">+150 msgs nos últimos 10 min.</p>
              </div>
              <span className="text-[10px] text-[#A0A0B0]">2h</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-[#2A2A35] flex items-center justify-center flex-shrink-0">
                <Zap className="w-3 h-3 text-[#F0F0F5]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Novo comando criado</p>
                <p className="text-xs text-[#A0A0B0] mt-0.5">Comando /pix adicionado.</p>
              </div>
              <span className="text-[10px] text-[#A0A0B0]">5h</span>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
