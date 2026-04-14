import React from "react";
import { 
  MessageCircle, 
  Headphones, 
  Send, 
  Plus, 
  Activity, 
  Settings, 
  BarChart3, 
  Zap, 
  MoreVertical,
  Play,
  Pause,
  ArrowRight,
  TrendingUp,
  CircleDashed,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function BotStudio() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F0F0F5] font-sans pb-24 overflow-x-hidden selection:bg-[#7C3AED]/30">
      
      {/* Top Navigation */}
      <header className="px-6 pt-14 pb-4 flex items-center justify-between sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#1E1E2A]/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-[#1E1E2A]">
            <AvatarImage src="https://i.pravatar.cc/150?u=joao" />
            <AvatarFallback className="bg-[#1A1A24] text-[#7A7A8A]">JS</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">João Silva</h1>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-1.5 py-0.5 rounded-sm">Pro</span>
              <span className="text-xs text-[#7A7A8A]">3 bots ativos</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-[#7A7A8A] hover:text-[#F0F0F5] hover:bg-[#1A1A24] rounded-full">
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      {/* Hero Section with Animated Mesh */}
      <section className="relative px-6 py-10 overflow-hidden">
        {/* Abstract Mesh Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-40">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[120%] bg-[#7C3AED] rounded-full mix-blend-screen filter blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[100%] bg-[#25D366] rounded-full mix-blend-screen filter blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-[20%] right-[10%] w-[50%] h-[80%] bg-[#5865F2] rounded-full mix-blend-screen filter blur-[90px] animate-[pulse_12s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0F]/50 to-[#0A0A0F]"></div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-2">
            Seu Estúdio <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#5865F2] to-[#25D366]">
              de Bots
            </span>
          </h2>
          <p className="text-[#7A7A8A] text-sm mb-8 max-w-[80%]">Crie, gerencie e escale suas automações em um só lugar.</p>
          
          {/* Quick Stats Overlay */}
          <div className="flex gap-4">
            <div className="bg-[#12121A]/80 backdrop-blur-md border border-[#1E1E2A] rounded-2xl p-4 flex-1 shadow-lg shadow-black/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></div>
                <span className="text-xs font-medium text-[#7A7A8A]">Online</span>
              </div>
              <div className="text-2xl font-bold">2<span className="text-sm text-[#7A7A8A] font-normal">/3</span></div>
            </div>
            <div className="bg-[#12121A]/80 backdrop-blur-md border border-[#1E1E2A] rounded-2xl p-4 flex-1 shadow-lg shadow-black/50">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className="text-xs font-medium text-[#7A7A8A]">Mensagens</span>
              </div>
              <div className="text-2xl font-bold">2.1K</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bot Carousel */}
      <section className="mt-2 mb-10 pl-6">
        <div className="flex items-center justify-between pr-6 mb-4">
          <h3 className="text-lg font-semibold tracking-tight">Meus Bots</h3>
          <Button variant="link" className="text-[#7C3AED] text-sm h-auto p-0">Ver todos</Button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-6 pr-6 snap-x snap-mandatory hide-scrollbar">
          
          {/* WhatsApp Bot */}
          <div className="snap-center shrink-0 w-[280px] h-[340px] rounded-3xl relative overflow-hidden group shadow-xl shadow-black/40">
            <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/20 via-[#12121A] to-[#12121A] z-0"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/30 filter blur-[40px] rounded-full"></div>
            
            <div className="relative z-10 p-5 flex flex-col h-full border border-[#1E1E2A]/50 rounded-3xl">
              <div className="flex justify-between items-start mb-auto">
                <div className="bg-[#25D366]/10 p-3 rounded-2xl border border-[#25D366]/20">
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
                </div>
                <div className="bg-[#1A1A24]/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#1E1E2A] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></div>
                  <span className="text-[10px] font-medium text-[#F0F0F5]">Online</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-[#25D366] mb-1">WhatsApp</p>
                <h4 className="text-xl font-bold text-[#F0F0F5] mb-4 leading-tight">Atendimento Vendas</h4>
                
                <div className="bg-[#0A0A0F]/40 border border-[#1E1E2A] rounded-xl p-3 mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#7A7A8A]">Hoje</span>
                    <span className="text-xs font-semibold text-[#22C55E] flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +12%</span>
                  </div>
                  <p className="text-lg font-bold">1,248 <span className="text-xs font-normal text-[#7A7A8A]">msgs</span></p>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#25D366] hover:bg-[#25D366]/90 text-black font-semibold shadow-lg shadow-[#25D366]/20 rounded-xl h-11">
                    <Zap className="w-4 h-4 mr-1.5" /> Builder
                  </Button>
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-[#1E1E2A] bg-[#1A1A24] hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/30">
                    <Pause className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Discord Bot */}
          <div className="snap-center shrink-0 w-[280px] h-[340px] rounded-3xl relative overflow-hidden group shadow-xl shadow-black/40">
            <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/20 via-[#12121A] to-[#12121A] z-0"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#5865F2]/30 filter blur-[40px] rounded-full"></div>
            
            <div className="relative z-10 p-5 flex flex-col h-full border border-[#1E1E2A]/50 rounded-3xl">
              <div className="flex justify-between items-start mb-auto">
                <div className="bg-[#5865F2]/10 p-3 rounded-2xl border border-[#5865F2]/20">
                  <Headphones className="w-6 h-6 text-[#5865F2]" />
                </div>
                <div className="bg-[#1A1A24]/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#1E1E2A] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></div>
                  <span className="text-[10px] font-medium text-[#F0F0F5]">Online</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-[#5865F2] mb-1">Discord</p>
                <h4 className="text-xl font-bold text-[#F0F0F5] mb-4 leading-tight">Suporte Discord</h4>
                
                <div className="bg-[#0A0A0F]/40 border border-[#1E1E2A] rounded-xl p-3 mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#7A7A8A]">Hoje</span>
                    <span className="text-xs font-semibold text-[#F59E0B] flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +2%</span>
                  </div>
                  <p className="text-lg font-bold">842 <span className="text-xs font-normal text-[#7A7A8A]">msgs</span></p>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-semibold shadow-lg shadow-[#5865F2]/20 rounded-xl h-11">
                    <Zap className="w-4 h-4 mr-1.5" /> Builder
                  </Button>
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-[#1E1E2A] bg-[#1A1A24] hover:bg-[#5865F2]/10 hover:text-[#5865F2] hover:border-[#5865F2]/30">
                    <Pause className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Telegram Bot */}
          <div className="snap-center shrink-0 w-[280px] h-[340px] rounded-3xl relative overflow-hidden group shadow-xl shadow-black/40 opacity-80">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0088CC]/10 via-[#12121A] to-[#12121A] z-0"></div>
            
            <div className="relative z-10 p-5 flex flex-col h-full border border-[#1E1E2A]/50 rounded-3xl">
              <div className="flex justify-between items-start mb-auto">
                <div className="bg-[#0088CC]/10 p-3 rounded-2xl border border-[#0088CC]/20 grayscale-[50%]">
                  <Send className="w-6 h-6 text-[#0088CC]" />
                </div>
                <div className="bg-[#1A1A24]/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#1E1E2A] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7A7A8A]"></div>
                  <span className="text-[10px] font-medium text-[#7A7A8A]">Offline</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-[#0088CC] mb-1 grayscale-[30%]">Telegram</p>
                <h4 className="text-xl font-bold text-[#F0F0F5] mb-4 leading-tight text-[#F0F0F5]/80">Bot Telegram</h4>
                
                <div className="bg-[#0A0A0F]/40 border border-[#1E1E2A] rounded-xl p-3 mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#7A7A8A]">Hoje</span>
                  </div>
                  <p className="text-lg font-bold text-[#7A7A8A]">0 <span className="text-xs font-normal">msgs</span></p>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#1A1A24] hover:bg-[#1E1E2A] border border-[#1E1E2A] text-[#F0F0F5] font-semibold rounded-xl h-11">
                    <Settings className="w-4 h-4 mr-1.5" /> Configurar
                  </Button>
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-[#1E1E2A] bg-[#1A1A24] hover:bg-[#0088CC]/10 hover:text-[#0088CC] hover:border-[#0088CC]/30">
                    <Play className="w-4 h-4 ml-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Create New Bot Action */}
      <section className="px-6 mb-10">
        <button className="w-full relative overflow-hidden rounded-3xl group text-left transition-transform active:scale-[0.98]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#5865F2] opacity-90"></div>
          
          {/* Background Illustration / Icons */}
          <div className="absolute -right-4 -top-8 opacity-20 transform rotate-12 group-hover:rotate-6 transition-transform duration-700">
            <Cpu className="w-48 h-48" />
          </div>
          
          <img 
            src="/__mockup/images/bot-studio-create.png" 
            alt="Create Bot Studio Illustration" 
            className="absolute right-0 top-0 h-full w-[50%] object-cover object-left opacity-30 mix-blend-overlay mask-image-linear-left"
          />

          <div className="relative z-10 p-6">
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Criar Novo Bot</h3>
            <p className="text-white/80 text-sm mb-4 max-w-[60%] leading-relaxed">Conecte um novo canal ao seu estúdio.</p>
            
            <div className="flex gap-[-8px]">
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center border-2 border-transparent shadow-sm z-30 transform hover:-translate-y-1 transition-transform">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center border-2 border-[#7C3AED] shadow-sm z-20 -ml-2 transform hover:-translate-y-1 transition-transform">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0088CC] flex items-center justify-center border-2 border-[#7C3AED] shadow-sm z-10 -ml-2 transform hover:-translate-y-1 transition-transform">
                <Send className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </button>
      </section>

      {/* Plan & Usage */}
      <section className="px-6 mb-10">
        <h3 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#7C3AED]" />
          Uso do Plano
        </h3>
        
        <div className="bg-[#12121A] rounded-3xl p-6 border border-[#1E1E2A] shadow-lg shadow-black/20">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm text-[#7A7A8A] font-medium mb-1">Mensagens este mês</p>
              <h4 className="text-2xl font-bold text-[#F0F0F5]">45K <span className="text-sm font-normal text-[#7A7A8A]">/ 100K</span></h4>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-1 rounded-md">45%</span>
            </div>
          </div>
          
          <div className="h-3 w-full bg-[#1A1A24] rounded-full overflow-hidden mt-4 mb-6">
            <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#5865F2] w-[45%] rounded-full relative">
              <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1E1E2A]">
            <div>
              <p className="text-xs text-[#7A7A8A] mb-1">Bots Criados</p>
              <p className="text-sm font-semibold">3 <span className="text-xs text-[#7A7A8A] font-normal">/ 5 permitidos</span></p>
            </div>
            <div>
              <p className="text-xs text-[#7A7A8A] mb-1">Renovação</p>
              <p className="text-sm font-semibold">Em 12 dias</p>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Feed */}
      <section className="px-6 mb-6">
        <h3 className="text-lg font-semibold tracking-tight mb-4">Atividade Recente</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4 items-start bg-[#12121A] p-4 rounded-2xl border border-[#1E1E2A]/50">
            <div className="w-2 h-2 rounded-full bg-[#25D366] mt-1.5 shadow-[0_0_8px_rgba(37,211,102,0.8)]"></div>
            <div>
              <p className="text-sm font-medium text-[#F0F0F5]">Fluxo atualizado</p>
              <p className="text-xs text-[#7A7A8A]">Atendimento Vendas • há 2 horas</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start bg-[#12121A] p-4 rounded-2xl border border-[#1E1E2A]/50">
            <div className="w-2 h-2 rounded-full bg-[#5865F2] mt-1.5 shadow-[0_0_8px_rgba(88,101,242,0.8)]"></div>
            <div>
              <p className="text-sm font-medium text-[#F0F0F5]">Pico de mensagens detectado</p>
              <p className="text-xs text-[#7A7A8A]">Suporte Discord • há 5 horas</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start bg-[#12121A] p-4 rounded-2xl border border-[#1E1E2A]/50">
            <div className="w-2 h-2 rounded-full bg-[#7A7A8A] mt-1.5"></div>
            <div>
              <p className="text-sm font-medium text-[#F0F0F5]">Bot desativado manualmente</p>
              <p className="text-xs text-[#7A7A8A]">Bot Telegram • Ontem</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full h-20 bg-[#0A0A0F]/90 backdrop-blur-xl border-t border-[#1E1E2A] flex items-center justify-around px-2 z-50">
        <button className="flex flex-col items-center gap-1 text-[#7C3AED] p-2">
          <div className="bg-[#7C3AED]/10 p-1.5 rounded-xl">
            <CircleDashed className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">Estúdio</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#7A7A8A] hover:text-[#F0F0F5] transition-colors p-2">
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-medium">Métricas</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#7A7A8A] hover:text-[#F0F0F5] transition-colors p-2">
          <MoreVertical className="w-5 h-5" />
          <span className="text-[10px] font-medium">Mais</span>
        </button>
      </div>

    </div>
  );
}
