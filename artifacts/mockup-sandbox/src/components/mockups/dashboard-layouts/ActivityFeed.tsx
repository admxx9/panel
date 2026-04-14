import React, { useState } from "react";
import { 
  Bot, 
  MessageSquare, 
  Settings, 
  CreditCard, 
  Zap, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Circle,
  Bell,
  RefreshCw,
  Search,
  Filter,
  BarChart3
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ActivityFeed() {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="min-h-screen bg-[#0F0F14] text-[#F0F0F5] font-sans pb-24 overflow-x-hidden flex flex-col relative max-w-[390px] mx-auto border-x border-[#2A2A35]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0F0F14]/80 backdrop-blur-md border-b border-[#2A2A35] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-[#2A2A35]">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Joao" />
            <AvatarFallback className="bg-[#1A1A24] text-[#F0F0F5]">J</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#F0F0F5]">Olá, João</span>
            <span className="text-xs text-[#6D28D9] font-medium flex items-center gap-1">
              <Zap className="h-3 w-3" /> Plano Pro
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-[#A0A0B0] hover:text-[#F0F0F5] hover:bg-[#1A1A24]">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-[#A0A0B0] hover:text-[#F0F0F5] hover:bg-[#1A1A24] relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#6D28D9] rounded-full"></span>
          </Button>
        </div>
      </header>

      {/* Scrollable Stats Pills */}
      <div className="w-full overflow-x-auto no-scrollbar py-4 px-4 border-b border-[#2A2A35]/50 flex gap-3">
        <div className="flex-none bg-[#1A1A24] border border-[#2A2A35] rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
          <Bot className="h-4 w-4 text-[#A0A0B0]" />
          <span className="text-sm font-medium">4 Bots</span>
        </div>
        <div className="flex-none bg-[#1A1A24]/50 border border-[#22C55E]/30 rounded-full px-4 py-2 flex items-center gap-2">
          <Circle className="h-2 w-2 fill-[#22C55E] text-[#22C55E]" />
          <span className="text-sm font-medium text-[#22C55E]">2 Online</span>
        </div>
        <div className="flex-none bg-[#1A1A24]/50 border border-[#9CA3AF]/30 rounded-full px-4 py-2 flex items-center gap-2">
          <Circle className="h-2 w-2 fill-[#9CA3AF] text-[#9CA3AF]" />
          <span className="text-sm font-medium text-[#A0A0B0]">1 Offline</span>
        </div>
        <div className="flex-none bg-[#1A1A24]/50 border border-[#6D28D9]/30 rounded-full px-4 py-2 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#6D28D9]" />
          <span className="text-sm font-medium text-[#F0F0F5]">1.2K Hoje</span>
        </div>
      </div>

      {/* Main Feed Content */}
      <main className="flex-1 px-4 py-6 flex flex-col gap-8 relative">
        {/* Decorative timeline line */}
        <div className="absolute left-[31px] top-6 bottom-0 w-[1px] bg-[#2A2A35] z-0"></div>

        {/* Section: Hoje */}
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-6 px-2.5 rounded-md bg-[#1A1A24] border border-[#2A2A35] text-xs font-semibold text-[#A0A0B0] flex items-center justify-center">
              Hoje
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2A2A35] to-transparent"></div>
          </div>

          <div className="flex flex-col gap-4 pl-12 relative">
            {/* Event 1 */}
            <div className="relative">
              <div className="absolute -left-12 top-1 h-8 w-8 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center z-10">
                <RefreshCw className="h-4 w-4 text-[#22C55E]" />
              </div>
              <div className="bg-[#1A1A24]/60 border border-[#2A2A35]/60 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-[#F0F0F5]">Bot Iniciado</span>
                  <span className="text-xs text-[#A0A0B0]">Agora</span>
                </div>
                <p className="text-xs text-[#A0A0B0]">O bot <span className="text-[#F0F0F5] font-medium">Atendimento Vendas</span> conectou com sucesso.</p>
              </div>
            </div>

            {/* Event 2: Featured Bot Card (Status Change) */}
            <div className="relative mt-2 mb-2">
              <div className="absolute -left-12 top-4 h-8 w-8 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center z-10">
                <Bot className="h-4 w-4 text-[#F0F0F5]" />
              </div>
              <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#2A2A35] rounded-xl overflow-hidden shadow-lg relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#22C55E]"></div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#2A2A35]/50 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-[#22C55E]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#F0F0F5]">Suporte Técnico</span>
                        <span className="text-xs text-[#A0A0B0]">+55 11 99999-9999</span>
                      </div>
                    </div>
                    <Badge className="bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 border border-[#22C55E]/20 font-medium text-xs px-2 py-0.5">
                      Online
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-[#0F0F14] rounded-lg p-2.5 flex flex-col">
                      <span className="text-[10px] text-[#A0A0B0] uppercase tracking-wider font-semibold">Mensagens</span>
                      <span className="text-lg font-bold text-[#F0F0F5]">842</span>
                    </div>
                    <div className="bg-[#0F0F14] rounded-lg p-2.5 flex flex-col">
                      <span className="text-[10px] text-[#A0A0B0] uppercase tracking-wider font-semibold">Uptime</span>
                      <span className="text-lg font-bold text-[#F0F0F5]">99.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event 3 */}
            <div className="relative">
              <div className="absolute -left-12 top-1 h-8 w-8 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center z-10">
                <MessageSquare className="h-4 w-4 text-[#A0A0B0]" />
              </div>
              <div className="bg-[#1A1A24]/60 border border-[#2A2A35]/60 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-[#F0F0F5]">Novo Comando Criado</span>
                  <span className="text-xs text-[#A0A0B0]">10:42</span>
                </div>
                <p className="text-xs text-[#A0A0B0]">O comando <code className="bg-[#0F0F14] px-1.5 py-0.5 rounded text-[#6D28D9]">/precos</code> foi adicionado ao bot Atendimento Vendas.</p>
              </div>
            </div>

            {/* Event 4 */}
            <div className="relative">
              <div className="absolute -left-12 top-1 h-8 w-8 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center z-10">
                <CreditCard className="h-4 w-4 text-[#F59E0B]" />
              </div>
              <div className="bg-[#1A1A24]/60 border border-[#2A2A35]/60 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-[#F0F0F5]">Pagamento Recebido</span>
                  <span className="text-xs text-[#A0A0B0]">09:15</span>
                </div>
                <p className="text-xs text-[#A0A0B0]">Assinatura renovada. Plano Pro ativado até 15/11.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Ontem */}
        <div className="relative z-10 flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="h-6 px-2.5 rounded-md bg-[#1A1A24] border border-[#2A2A35] text-xs font-semibold text-[#A0A0B0] flex items-center justify-center">
              Ontem
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2A2A35] to-transparent"></div>
          </div>

          <div className="flex flex-col gap-4 pl-12 relative">
             {/* Weekly messages chart as a timeline event */}
             <div className="relative mb-2">
              <div className="absolute -left-12 top-4 h-8 w-8 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center z-10">
                <BarChart3 className="h-4 w-4 text-[#6D28D9]" />
              </div>
              <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-[#F0F0F5]">Resumo Diário</span>
                  <span className="text-xs text-[#A0A0B0]">Ontem, 23:59</span>
                </div>
                
                <div className="flex items-end justify-between h-20 gap-2 px-1">
                  {[40, 65, 45, 80, 55, 90, 100].map((height, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-full bg-[#2A2A35] rounded-sm flex items-end justify-center overflow-hidden h-full relative">
                        <div 
                          className={`w-full rounded-sm ${i === 6 ? 'bg-[#6D28D9]' : 'bg-[#6D28D9]/40'}`} 
                          style={{ height: `${height}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] text-[#A0A0B0]">{"DSQQSSD"[i]}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#2A2A35]/50 flex justify-between items-center mt-1">
                  <span className="text-xs text-[#A0A0B0]">Total da semana</span>
                  <span className="text-sm font-bold text-[#F0F0F5]">12.4K msgs</span>
                </div>
              </div>
            </div>

            {/* Event 5: Featured Bot Card (Offline) */}
            <div className="relative mt-2 mb-2">
              <div className="absolute -left-12 top-4 h-8 w-8 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center z-10">
                <XCircle className="h-4 w-4 text-[#ef4444]" />
              </div>
              <div className="bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-[#2A2A35] rounded-xl overflow-hidden shadow-lg relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#9CA3AF]"></div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#2A2A35]/50 flex items-center justify-center grayscale opacity-60">
                        <Bot className="h-5 w-5 text-[#A0A0B0]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#F0F0F5] opacity-80">Bot Financeiro</span>
                        <span className="text-xs text-[#A0A0B0]">+55 11 98888-8888</span>
                      </div>
                    </div>
                    <Badge className="bg-[#9CA3AF]/10 text-[#A0A0B0] hover:bg-[#9CA3AF]/20 border border-[#9CA3AF]/20 font-medium text-xs px-2 py-0.5">
                      Offline
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-[#A0A0B0] bg-[#0F0F14] p-2.5 rounded-lg flex items-center justify-between">
                    <span>Desconectado às 14:30</span>
                    <Button variant="ghost" className="h-6 px-2 text-xs text-[#F0F0F5] bg-[#2A2A35] hover:bg-[#2A2A35]/80">
                      Reconectar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Event 6 */}
            <div className="relative">
              <div className="absolute -left-12 top-1 h-8 w-8 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center z-10">
                <Settings className="h-4 w-4 text-[#A0A0B0]" />
              </div>
              <div className="bg-[#1A1A24]/60 border border-[#2A2A35]/60 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-[#F0F0F5]">Configurações Alteradas</span>
                  <span className="text-xs text-[#A0A0B0]">14:25</span>
                </div>
                <p className="text-xs text-[#A0A0B0]">Webhook de respostas atualizado.</p>
              </div>
            </div>
          </div>
        </div>

        {/* End of feed indicator */}
        <div className="flex justify-center mt-6 relative z-10">
          <div className="h-2 w-2 rounded-full bg-[#2A2A35]"></div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-4 z-40">
        <div className="relative group">
          <Button className="h-14 w-14 rounded-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-[0_0_20px_rgba(109,40,217,0.4)] transition-all transform hover:scale-105">
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
