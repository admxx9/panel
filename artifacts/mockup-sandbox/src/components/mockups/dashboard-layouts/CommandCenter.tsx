import React from 'react';
import { 
  Bot, 
  Activity, 
  Zap, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  MessageSquare, 
  Plus, 
  Wrench, 
  CreditCard, 
  Layers,
  ChevronRight,
  TrendingUp,
  Server,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar } from 'recharts';

const sparklineData1 = [
  { value: 10 }, { value: 25 }, { value: 15 }, { value: 40 }, { value: 30 }, { value: 50 }, { value: 45 }
];

const sparklineData2 = [
  { value: 50 }, { value: 40 }, { value: 45 }, { value: 30 }, { value: 40 }, { value: 20 }, { value: 25 }
];

const barData = [
  { value: 200 }, { value: 350 }, { value: 150 }, { value: 400 }, { value: 550 }, { value: 300 }, { value: 700 }
];

export function CommandCenter() {
  return (
    <div className="min-h-screen bg-[#0F0F14] text-[#F0F0F5] font-sans pb-6">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 border-b border-[#2A2A35] bg-[#1A1A24] sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="/__mockup/images/avatar.png" 
              alt="Avatar" 
              className="w-10 h-10 rounded-sm border border-[#2A2A35] object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#1A1A24]"></div>
          </div>
          <div>
            <h1 className="text-sm font-medium flex items-center gap-2">
              João Silva
              <span className="px-1.5 py-0.5 rounded bg-[#6D28D9]/20 text-[#6D28D9] text-[10px] font-bold uppercase tracking-wider">Pro</span>
            </h1>
            <p className="text-xs text-[#A0A0B0] font-mono">ID: 8849-BR</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded bg-[#2A2A35] flex items-center justify-center hover:bg-[#3A3A45] transition-colors">
            <Activity className="w-4 h-4 text-[#A0A0B0]" />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Quick Actions Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Plus, label: "New Bot" },
            { icon: Wrench, label: "Builder" },
            { icon: CreditCard, label: "Recharge" },
            { icon: Layers, label: "Plans" },
          ].map((action, i) => (
            <button key={i} className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-md bg-[#1A1A24] border border-[#2A2A35] hover:bg-[#2A2A35] transition-colors">
              <action.icon className="w-4 h-4 text-[#A0A0B0]" />
              <span className="text-[10px] text-[#A0A0B0] uppercase tracking-wider font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Dense Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Messages Metric */}
          <div className="col-span-2 bg-[#1A1A24] border border-[#2A2A35] rounded-md p-3 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start z-10 mb-6">
              <div>
                <p className="text-[10px] text-[#A0A0B0] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" /> Msg Today
                </p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-mono tracking-tight">1,248</h2>
                  <span className="text-xs text-[#22C55E] flex items-center font-mono">
                    <ArrowUpRight className="w-3 h-3" /> 12%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#A0A0B0] uppercase tracking-wider font-semibold mb-1">Peak Rate</p>
                <p className="text-sm font-mono text-[#F0F0F5]">42/min</p>
              </div>
            </div>
            <div className="h-16 w-full absolute bottom-0 left-0 right-0 opacity-50">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <Bar dataKey="value" fill="#6D28D9" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bots Metric */}
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-md p-3">
            <p className="text-[10px] text-[#A0A0B0] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
              <Server className="w-3 h-3" /> Fleet Status
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <h2 className="text-2xl font-mono tracking-tight">4</h2>
              <span className="text-[10px] text-[#A0A0B0] uppercase">Total</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#0F0F14] rounded p-1.5 border border-[#2A2A35]">
                <div className="text-[10px] text-[#22C55E] flex items-center gap-1 mb-0.5"><Wifi className="w-3 h-3" /> ON</div>
                <div className="text-sm font-mono">2</div>
              </div>
              <div className="flex-1 bg-[#0F0F14] rounded p-1.5 border border-[#2A2A35]">
                <div className="text-[10px] text-[#9CA3AF] flex items-center gap-1 mb-0.5"><WifiOff className="w-3 h-3" /> OFF</div>
                <div className="text-sm font-mono">1</div>
              </div>
            </div>
          </div>

          {/* Response Time Metric */}
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-md p-3 flex flex-col">
            <p className="text-[10px] text-[#A0A0B0] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Avg Latency
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <h2 className="text-2xl font-mono tracking-tight text-[#22C55E]">124</h2>
              <span className="text-[10px] text-[#A0A0B0] uppercase">ms</span>
            </div>
            <div className="h-8 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData1}>
                  <Area type="monotone" dataKey="value" stroke="#22C55E" fill="#22C55E" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bot List - Compact Table */}
        <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-md overflow-hidden">
          <div className="px-3 py-2 border-b border-[#2A2A35] bg-[#2A2A35]/30 flex justify-between items-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A0A0B0]">Active Instances</h3>
            <button className="text-[10px] text-[#6D28D9] font-medium hover:underline flex items-center">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-[#2A2A35]">
            {[
              { name: "Support Main", number: "+55 11 9999-9999", status: "online", msg: "8.4k", ping: "45ms" },
              { name: "Sales Bot", number: "+55 11 8888-8888", status: "online", msg: "3.2k", ping: "62ms" },
              { name: "Dev Test", number: "+55 11 7777-7777", status: "connecting", msg: "12", ping: "---" },
              { name: "Legacy System", number: "+55 11 6666-6666", status: "offline", msg: "0", ping: "ERR" },
            ].map((bot, i) => (
              <div key={i} className="p-2 flex items-center justify-between hover:bg-[#2A2A35]/20 cursor-pointer transition-colors group">
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    bot.status === 'online' ? 'bg-[#22C55E] shadow-[0_0_8px_#22C55E]' :
                    bot.status === 'connecting' ? 'bg-[#F59E0B] animate-pulse' : 'bg-[#9CA3AF]'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-[#F0F0F5] group-hover:text-[#6D28D9] transition-colors">{bot.name}</p>
                    <p className="text-[10px] text-[#A0A0B0] font-mono">{bot.number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-[#A0A0B0] uppercase mb-0.5">Ping</p>
                    <p className={`text-xs font-mono ${bot.status === 'online' ? 'text-[#22C55E]' : 'text-[#A0A0B0]'}`}>{bot.ping}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#A0A0B0] uppercase mb-0.5">Vol</p>
                    <p className="text-xs font-mono text-[#F0F0F5]">{bot.msg}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A0A0B0] group-hover:text-[#6D28D9] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-md">
          <div className="px-3 py-2 border-b border-[#2A2A35] bg-[#2A2A35]/30">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A0A0B0]">System Event Log</h3>
          </div>
          <div className="p-3 space-y-3">
            {[
              { type: 'sys', msg: 'System update applied v2.4.1', time: '10:42:05', icon: Activity, color: 'text-[#A0A0B0]' },
              { type: 'bot', msg: 'Support Main reconnected', time: '10:15:33', icon: RefreshCw, color: 'text-[#22C55E]' },
              { type: 'pay', msg: 'Invoice #8849 paid via Pix', time: '09:00:12', icon: CreditCard, color: 'text-[#6D28D9]' },
              { type: 'err', msg: 'Legacy System connection timeout', time: '08:45:00', icon: WifiOff, color: 'text-[#F59E0B]' },
            ].map((log, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <div className="mt-0.5">
                  <log.icon className={`w-3.5 h-3.5 ${log.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#F0F0F5]">{log.msg}</p>
                </div>
                <span className="text-[10px] text-[#A0A0B0] font-mono">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
