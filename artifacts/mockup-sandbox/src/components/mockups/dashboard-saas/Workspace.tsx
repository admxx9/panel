import React, { useState } from 'react';
import { 
  MessageCircle, 
  Hash, 
  Send, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Activity, 
  Settings, 
  BarChart2, 
  Box,
  ChevronRight,
  Command,
  Zap,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Mock Data
const USER = {
  name: 'João Silva',
  plan: 'Pro',
  avatar: '/__mockup/images/avatar.png'
};

const BOTS = [
  {
    id: '1',
    name: 'Atendimento Vendas',
    platform: 'whatsapp',
    status: 'online',
    messagesToday: 1200,
    lastActive: 'Just now'
  },
  {
    id: '2',
    name: 'Suporte Discord',
    platform: 'discord',
    status: 'online',
    messagesToday: 842,
    lastActive: '5m ago'
  },
  {
    id: '3',
    name: 'Bot Telegram',
    platform: 'telegram',
    status: 'offline',
    messagesToday: 0,
    lastActive: '2h ago'
  }
];

const PLATFORMS = {
  whatsapp: { icon: MessageCircle, color: '#25D366', bgClass: 'bg-[#25D366]/10', textClass: 'text-[#25D366]' },
  discord: { icon: Hash, color: '#5865F2', bgClass: 'bg-[#5865F2]/10', textClass: 'text-[#5865F2]' },
  telegram: { icon: Send, color: '#0088CC', bgClass: 'bg-[#0088CC]/10', textClass: 'text-[#0088CC]' }
};

export function Workspace() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-[100dvh] w-full max-w-[390px] mx-auto bg-[#0A0A0F] text-[#F0F0F5] font-sans pb-24 font-light selection:bg-[#7C3AED]/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#7C3AED]/5 to-transparent pointer-events-none" />

      {/* Header section */}
      <header className="px-5 pt-12 pb-6 border-b border-[#1E1E2A]/50 bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#1A1A24] border border-[#1E1E2A] overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-[#7C3AED] font-medium">JS</div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22C55E] border-2 border-[#0A0A0F] rounded-full"></div>
            </div>
            <div>
              <h1 className="text-lg font-medium text-[#F0F0F5] leading-none mb-1">{USER.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-[#7C3AED] border-[#7C3AED]/30 bg-[#7C3AED]/10 h-5 px-1.5 rounded-sm font-medium">
                  {USER.plan} Plan
                </Badge>
                <span className="text-xs text-[#7A7A8A]">Workspace</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-[#7A7A8A] hover:text-[#F0F0F5] hover:bg-[#1A1A24] rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Command Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#7A7A8A] group-focus-within:text-[#7C3AED] transition-colors" />
          </div>
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bots, commands..." 
            className="w-full bg-[#12121A] border-[#1E1E2A] text-sm text-[#F0F0F5] placeholder:text-[#7A7A8A] pl-10 pr-10 h-11 rounded-lg focus-visible:ring-1 focus-visible:ring-[#7C3AED] focus-visible:border-transparent transition-all shadow-sm shadow-black/20 font-medium"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Command className="h-3 w-3 text-[#7A7A8A] opacity-50" />
            <span className="text-[10px] text-[#7A7A8A] ml-0.5 opacity-50 font-medium">K</span>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-8">
        {/* Your Workspace / Bots Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#F0F0F5] flex items-center gap-2">
              <Box className="w-4 h-4 text-[#7A7A8A]" />
              Your Bots
            </h2>
            <span className="text-xs text-[#7A7A8A] font-medium">3 active</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {BOTS.map(bot => {
              const platform = PLATFORMS[bot.platform as keyof typeof PLATFORMS];
              const PlatformIcon = platform.icon;
              const isOnline = bot.status === 'online';

              return (
                <div 
                  key={bot.id} 
                  className="group relative bg-[#12121A] border border-[#1E1E2A] rounded-xl p-4 overflow-hidden hover:border-[#7C3AED]/30 transition-colors cursor-pointer shadow-sm shadow-black/20"
                >
                  {/* Status Glow Effect */}
                  {isOnline && (
                    <div 
                      className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none transition-opacity group-hover:opacity-20"
                      style={{ backgroundColor: platform.color }}
                    />
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shadow-sm", platform.bgClass)}>
                        <PlatformIcon className={cn("w-5 h-5", platform.textClass)} />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-[#F0F0F5] mb-0.5">{bot.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]", isOnline ? "bg-[#22C55E] shadow-[#22C55E]/40" : "bg-[#7A7A8A]")}></span>
                            <span className="text-xs text-[#7A7A8A] capitalize font-medium">{bot.status}</span>
                          </div>
                          <span className="text-xs text-[#1E1E2A]">•</span>
                          <span className="text-xs text-[#7A7A8A] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {bot.lastActive}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-[#7A7A8A] hover:text-[#F0F0F5] hover:bg-[#1A1A24]">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t border-[#1E1E2A]/50 mt-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#7A7A8A] mb-1 font-medium">Messages Today</div>
                      <div className="text-xl font-medium text-[#F0F0F5] tracking-tight">
                        {bot.messagesToday > 0 ? (bot.messagesToday >= 1000 ? `${(bot.messagesToday/1000).toFixed(1)}K` : bot.messagesToday) : '0'}
                      </div>
                    </div>
                    
                    {/* Fake Sparkline */}
                    <div className="flex items-end gap-1 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                      {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 rounded-t-sm transition-all"
                          style={{ 
                            height: `${h}%`,
                            backgroundColor: bot.messagesToday > 0 ? platform.color : '#1E1E2A'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Stats Strip */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#F0F0F5] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#7A7A8A]" />
              Quick Stats
            </h2>
            <Button variant="ghost" className="h-auto p-0 text-xs text-[#7C3AED] hover:text-[#6D28D9] hover:bg-transparent font-medium">
              View Analytics
            </Button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-none snap-x">
            <div className="snap-start flex-shrink-0 bg-[#12121A] border border-[#1E1E2A] rounded-xl p-4 w-[140px] flex flex-col justify-between shadow-sm shadow-black/20">
              <div className="text-[11px] uppercase tracking-wider text-[#7A7A8A] mb-3 flex items-center gap-1.5 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"></div>
                Bots Limit
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-medium text-[#F0F0F5] tracking-tight">3</span>
                  <span className="text-sm text-[#7A7A8A]">/ 5</span>
                </div>
                <div className="w-full bg-[#1A1A24] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#7C3AED] h-full rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="snap-start flex-shrink-0 bg-[#12121A] border border-[#1E1E2A] rounded-xl p-4 w-[160px] flex flex-col justify-between shadow-sm shadow-black/20">
              <div className="text-[11px] uppercase tracking-wider text-[#7A7A8A] mb-3 flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-[#22C55E]" />
                Msg Volume
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-medium text-[#F0F0F5] tracking-tight">45K</span>
                  <span className="text-sm text-[#7A7A8A]">/ 100K</span>
                </div>
                <div className="w-full bg-[#1A1A24] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>

            <div className="snap-start flex-shrink-0 bg-[#12121A] border border-[#1E1E2A] rounded-xl p-4 w-[140px] flex flex-col justify-between shadow-sm shadow-black/20">
              <div className="text-[11px] uppercase tracking-wider text-[#7A7A8A] mb-3 flex items-center gap-1.5 font-medium">
                <BarChart2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                Today Total
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-medium text-[#F0F0F5] tracking-tight">2.1K</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Floating Create Bot Action */}
      <div className="fixed bottom-6 right-5 z-50">
        <Button 
          className="w-14 h-14 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-[#7C3AED]/25 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

    </div>
  );
}
