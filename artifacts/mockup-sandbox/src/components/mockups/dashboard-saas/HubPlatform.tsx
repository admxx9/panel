import React from "react";
import { 
  MessageCircle, 
  Send, 
  Plus, 
  BarChart2, 
  Settings, 
  ChevronRight, 
  Activity, 
  Zap, 
  CreditCard, 
  Hash, 
  LayoutGrid, 
  Terminal,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Bot {
  id: string;
  name: string;
  platform: "whatsapp" | "discord" | "telegram";
  status: "online" | "offline";
  messagesToday: number | string;
}

const bots: Bot[] = [
  {
    id: "1",
    name: "Atendimento Vendas",
    platform: "whatsapp",
    status: "online",
    messagesToday: "1.2K",
  },
  {
    id: "2",
    name: "Suporte Discord",
    platform: "discord",
    status: "online",
    messagesToday: "842",
  },
  {
    id: "3",
    name: "Bot Telegram",
    platform: "telegram",
    status: "offline",
    messagesToday: "0",
  },
];

const platformConfig = {
  whatsapp: {
    color: "#25D366",
    bgClass: "bg-[#25D366]/10",
    textClass: "text-[#25D366]",
    borderClass: "border-[#25D366]/20",
    gradientHover: "hover:shadow-[0_0_20px_-5px_rgba(37,211,102,0.3)]",
    icon: MessageCircle,
    label: "WhatsApp",
  },
  discord: {
    color: "#5865F2",
    bgClass: "bg-[#5865F2]/10",
    textClass: "text-[#5865F2]",
    borderClass: "border-[#5865F2]/20",
    gradientHover: "hover:shadow-[0_0_20px_-5px_rgba(88,101,242,0.3)]",
    icon: Hash,
    label: "Discord",
  },
  telegram: {
    color: "#0088CC",
    bgClass: "bg-[#0088CC]/10",
    textClass: "text-[#0088CC]",
    borderClass: "border-[#0088CC]/20",
    gradientHover: "hover:shadow-[0_0_20px_-5px_rgba(0,136,204,0.3)]",
    icon: Send,
    label: "Telegram",
  },
};

export function HubPlatform() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0A0A0F] text-[#F0F0F5] font-sans selection:bg-[#7C3AED]/30 w-full max-w-[390px] mx-auto border-x border-[#1E1E2A] relative overflow-hidden">
      
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-[#7C3AED]/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#1E1E2A] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] p-[1px] shadow-[0_0_15px_-3px_rgba(124,58,237,0.4)] relative group cursor-pointer">
            <div className="w-full h-full bg-[#0A0A0F] rounded-[11px] flex items-center justify-center transition-colors group-hover:bg-[#12121A]">
              <Terminal className="w-4 h-4 text-[#F0F0F5]" />
            </div>
            {/* Online indicator for platform */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#0A0A0F] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full" />
            </div>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-[#F0F0F5]">HubPlatform</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-[#A78BFA] font-medium tracking-wide bg-[#7C3AED]/10 px-1.5 py-0.5 rounded-md border border-[#7C3AED]/20">PRO</span>
              <span className="text-[11px] text-[#7A7A8A]">João Silva</span>
            </div>
          </div>
        </div>
        <button className="w-9 h-9 rounded-full bg-[#12121A] border border-[#1E1E2A] flex items-center justify-center overflow-hidden hover:border-[#7C3AED]/50 transition-colors">
          <img src="/__mockup/images/avatar.png" alt="User" className="w-full h-full object-cover opacity-80" onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjN0E3QThBIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDIxdi0yYTRgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';
            (e.target as HTMLImageElement).className = "w-5 h-5 opacity-50";
          }} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 pt-4 scrollbar-hide relative z-10">
        
        {/* Create Bot Hero */}
        <div className="px-5 mb-8">
          <div className="bg-[#12121A] border border-[#1E1E2A] rounded-[20px] p-5 relative overflow-hidden group hover:border-[#2A2A35] transition-all duration-500">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7C3AED]/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
            
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#7C3AED]/10 blur-[40px] -mr-10 -mt-10 rounded-full" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-[#7C3AED]/10 rounded-lg">
                  <Plus className="w-4 h-4 text-[#A78BFA]" />
                </div>
                <h2 className="text-[17px] font-semibold text-[#F0F0F5]">Create New Bot</h2>
              </div>
              <p className="text-[13px] text-[#7A7A8A] mb-5 leading-relaxed pr-4">Select a platform below to start building your next conversational experience.</p>
              
              <div className="grid grid-cols-3 gap-3">
                {(["whatsapp", "discord", "telegram"] as const).map((platform) => {
                  const config = platformConfig[platform];
                  const Icon = config.icon;
                  return (
                    <button 
                      key={platform}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2.5 py-4 rounded-[14px] border border-[#1E1E2A] bg-[#0A0A0F] transition-all duration-300 relative overflow-hidden",
                        config.gradientHover,
                        "hover:-translate-y-0.5"
                      )}
                    >
                      <div className={cn("absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-transparent to-black/50", config.bgClass)} />
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center relative z-10 shadow-inner", config.bgClass)}>
                        <Icon className={cn("w-5 h-5", config.textClass)} />
                      </div>
                      <span className="text-[11px] font-semibold tracking-wide text-[#F0F0F5] relative z-10">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="px-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-bold text-[#7A7A8A] uppercase tracking-widest">Overview</h3>
            <button className="text-[12px] font-medium text-[#7C3AED] hover:text-[#A78BFA] transition-colors flex items-center">
              Analytics <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#12121A] border border-[#1E1E2A] rounded-[16px] p-4 flex flex-col gap-1.5 hover:border-[#2A2A35] transition-colors">
              <div className="flex items-center gap-2 text-[#7A7A8A] mb-2">
                <div className="p-1 bg-[#2A2A35] rounded-md">
                  <Activity className="w-3.5 h-3.5 text-[#F0F0F5]" />
                </div>
                <span className="text-[12px] font-medium">Active Bots</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[28px] font-bold text-[#F0F0F5] leading-none">2</span>
                <span className="text-[12px] text-[#7A7A8A] font-medium">/ 3 total</span>
              </div>
            </div>
            <div className="bg-[#12121A] border border-[#1E1E2A] rounded-[16px] p-4 flex flex-col gap-1.5 hover:border-[#2A2A35] transition-colors relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#25D366]/5 rounded-full blur-xl" />
              <div className="flex items-center gap-2 text-[#7A7A8A] mb-2 relative z-10">
                <div className="p-1 bg-[#2A2A35] rounded-md">
                  <Zap className="w-3.5 h-3.5 text-[#F0F0F5]" />
                </div>
                <span className="text-[12px] font-medium">Msgs Today</span>
              </div>
              <div className="flex items-baseline gap-1.5 relative z-10">
                <span className="text-[28px] font-bold text-[#F0F0F5] leading-none">2.1K</span>
                <span className="text-[12px] text-[#22C55E] font-medium flex items-center">
                  +12%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Bots List */}
        <div className="px-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-bold text-[#7A7A8A] uppercase tracking-widest">Your Bots</h3>
            <span className="text-[11px] font-medium text-[#7A7A8A] bg-[#1A1A24] px-2 py-0.5 rounded-full border border-[#1E1E2A]">3 Total</span>
          </div>
          
          <div className="flex flex-col gap-3">
            {bots.map((bot) => {
              const config = platformConfig[bot.platform];
              const Icon = config.icon;
              const isOnline = bot.status === "online";
              
              return (
                <div key={bot.id} className="bg-[#12121A] border border-[#1E1E2A] rounded-[16px] p-4 hover:border-[#2A2A35] transition-colors flex flex-col relative overflow-hidden group">
                  {/* Subtle top border glow for platform */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] opacity-40 transition-opacity group-hover:opacity-100" style={{ backgroundColor: config.color }} />
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3.5">
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner", config.bgClass)}>
                        <Icon className={cn("w-5 h-5", config.textClass)} />
                      </div>
                      <div className="flex flex-col gap-1 pt-0.5">
                        <h4 className="text-[15px] font-semibold text-[#F0F0F5] leading-none">{bot.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-[11px] font-medium px-1.5 py-0.5 rounded-md border", config.bgClass, config.textClass, config.borderClass)}>
                            {config.label}
                          </span>
                          <div className="flex items-center gap-1.5 bg-[#0A0A0F] px-1.5 py-0.5 rounded-md border border-[#1E1E2A]">
                            <span className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-[#22C55E] shadow-[0_0_5px_rgba(34,197,94,0.5)]" : "bg-[#7A7A8A]")} />
                            <span className="text-[10px] font-medium text-[#7A7A8A] uppercase tracking-wider">{isOnline ? 'Online' : 'Offline'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="text-[#7A7A8A] hover:text-[#F0F0F5] p-1 -mr-1 rounded-md hover:bg-[#1A1A24] transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[#1E1E2A]/60">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#7A7A8A] uppercase tracking-widest font-semibold mb-0.5">24h Volume</span>
                      <span className="text-[14px] font-bold text-[#F0F0F5] flex items-center gap-1.5">
                        {bot.messagesToday}
                        <span className="text-[11px] font-medium text-[#7A7A8A] normal-case">msgs</span>
                      </span>
                    </div>
                    <Button variant="secondary" size="sm" className="h-8 bg-[#1A1A24] hover:bg-[#2A2A35] text-[#F0F0F5] border border-[#2A2A35] text-[12px] font-semibold rounded-lg px-3 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                      <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
                      Builder
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Usage Meter */}
        <div className="px-5 mb-4">
          <div className="bg-[#0A0A0F] border border-[#1E1E2A] rounded-[16px] p-5 flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/5 blur-2xl rounded-full" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-[#1A1A24] border border-[#2A2A35] flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#A78BFA]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#F0F0F5] flex items-center gap-2">
                    Pro Workspace
                  </h3>
                  <p className="text-[11px] text-[#7A7A8A] font-medium mt-0.5">Renews in 14 days</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wide">Active</span>
              </div>
            </div>
            
            <div className="grid gap-4 relative z-10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#7A7A8A] font-medium">Messages (Monthly)</span>
                  <span className="text-[#F0F0F5] font-bold">45K <span className="text-[#7A7A8A] font-medium">/ 100K</span></span>
                </div>
                <div className="h-1.5 w-full bg-[#1A1A24] rounded-full overflow-hidden border border-[#2A2A35]/50">
                  <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full relative">
                    <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#7A7A8A] font-medium">Active Bots</span>
                  <span className="text-[#F0F0F5] font-bold">3 <span className="text-[#7A7A8A] font-medium">/ 5</span></span>
                </div>
                <div className="h-1.5 w-full bg-[#1A1A24] rounded-full overflow-hidden border border-[#2A2A35]/50">
                  <div className="h-full bg-gradient-to-r from-[#25D366] to-[#4ADE80] rounded-full w-[60%] relative">
                    <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-30">
        <div className="absolute bottom-0 left-0 w-full h-[80px] bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent pointer-events-none" />
        
        <nav className="relative bg-[#12121A]/80 backdrop-blur-xl border-t border-[#1E1E2A] pb-safe pt-2 px-6 flex items-center justify-between h-[72px] mb-0">
          <button className="flex flex-col items-center gap-1 p-2 min-w-[60px] text-[#F0F0F5] group">
            <LayoutGrid className="w-[22px] h-[22px] transition-transform group-hover:-translate-y-0.5 group-active:scale-95" />
            <span className="text-[10px] font-semibold tracking-wide">Hub</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 min-w-[60px] text-[#7A7A8A] hover:text-[#F0F0F5] transition-colors group">
            <BarChart2 className="w-[22px] h-[22px] transition-transform group-hover:-translate-y-0.5 group-active:scale-95" />
            <span className="text-[10px] font-semibold tracking-wide">Stats</span>
          </button>
          
          <div className="relative -top-6">
            <button className="w-14 h-14 rounded-full bg-gradient-to-b from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white shadow-[0_8px_30px_-5px_rgba(124,58,237,0.5)] hover:shadow-[0_8px_40px_-5px_rgba(124,58,237,0.6)] hover:-translate-y-0.5 transition-all active:scale-95 active:translate-y-0 border-4 border-[#0A0A0F]">
              <Plus className="w-6 h-6" />
            </button>
          </div>
          
          <button className="flex flex-col items-center gap-1 p-2 min-w-[60px] text-[#7A7A8A] hover:text-[#F0F0F5] transition-colors group">
            <CreditCard className="w-[22px] h-[22px] transition-transform group-hover:-translate-y-0.5 group-active:scale-95" />
            <span className="text-[10px] font-semibold tracking-wide">Plan</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 min-w-[60px] text-[#7A7A8A] hover:text-[#F0F0F5] transition-colors group">
            <Settings className="w-[22px] h-[22px] transition-transform group-hover:-translate-y-0.5 group-active:scale-95" />
            <span className="text-[10px] font-semibold tracking-wide">Config</span>
          </button>
        </nav>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
}