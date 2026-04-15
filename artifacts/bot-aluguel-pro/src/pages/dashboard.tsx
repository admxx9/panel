import { Bot, Coins, Shield, TrendingUp, Activity, Clock, ArrowRight, Cpu, Zap, Star, Wrench, MessageSquare, Search, Settings, Play, Terminal } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetDashboardStats, useListBots } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const diff = value - prev.current;
    if (diff === 0) return;
    const start = prev.current;
    const startTime = performance.now();
    let raf = 0;
    const animate = (now: number) => {
      const p = Math.min((now - startTime) / 900, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * e));
      if (p < 1) raf = requestAnimationFrame(animate);
      else prev.current = value;
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{display.toLocaleString("pt-BR")}</>;
}

const WaveHeader = ({ userName }: { userName: string }) => (
  <div className="relative overflow-hidden rounded-xl mb-6">
    <div className="relative z-10 px-6 py-8 md:py-10">
      <p className="text-[12px] text-[#c9cadb]/60 mb-1">Olá, {userName}</p>
      <h1 className="text-[28px] md:text-[32px] font-extrabold text-white leading-tight">Bem-vindo de volta!</h1>
    </div>
    <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ height: "50px" }}>
      <path d="M0,40 C360,100 720,0 1080,60 C1260,80 1380,30 1440,50 L1440,100 L0,100 Z" fill="#090A0F" />
      <path d="M0,60 C240,20 480,90 720,40 C960,0 1200,70 1440,30 L1440,100 L0,100 Z" fill="#090A0F" opacity="0.6" />
    </svg>
    <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/20 via-[#6D28D9]/10 to-[#4C1D95]/20" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#090A0F]/80" />
    <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
  </div>
);

const featureCards = [
  { icon: Bot, label: "Criar Bot", desc: "Configure um novo bot WhatsApp", href: "/dashboard/bots", color: "#7C3AED" },
  { icon: Wrench, label: "Construtor", desc: "Editor visual de comandos", href: "/dashboard/builder", color: "#6366F1" },
  { icon: Coins, label: "Moedas", desc: "Recarregar saldo via PIX", href: "/dashboard/payments", color: "#8B5CF6" },
  { icon: Star, label: "Planos", desc: "Escolha o melhor plano", href: "/dashboard/plans", color: "#A78BFA" },
];

function FeatureCard({ icon: Icon, label, desc, href, color }: typeof featureCards[0]) {
  return (
    <Link href={href}>
      <div className="group bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5 text-center hover:border-[#7C3AED]/30 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-[#7C3AED]/5 cursor-pointer">
        <div className="h-12 w-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <p className="text-[13px] font-bold text-white mb-1">{label}</p>
        <p className="text-[11px] text-[#4b4c6b] mb-3">{desc}</p>
        <span className="inline-block text-[11px] font-bold text-white border border-[#1e1f2e] rounded-md px-4 py-1.5 transition-all duration-200 group-hover:border-[#7C3AED]/50 group-hover:bg-[#7C3AED]/10 group-hover:text-[#c4b5fd]">
          ACESSAR
        </span>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const { data: bots, isLoading: botsLoading } = useListBots();
  const { user } = useAuth();
  const [botSearch, setBotSearch] = useState("");

  const planExpiry = stats?.planExpiresAt
    ? format(new Date(stats.planExpiresAt), "dd/MM/yyyy", { locale: ptBR })
    : null;

  return (
    <DashboardLayout>
      <WaveHeader userName={user?.name?.split(" ")[0] ?? "Usuário"} />

      <p className="text-[10px] font-bold text-[#4b4c6b] tracking-[1.5px] uppercase mb-3">ACESSO RÁPIDO</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {featureCards.map((card) => (
          <FeatureCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-[#4b4c6b] tracking-[1.5px] uppercase">SEUS BOTS</p>
            {bots && bots.length > 0 && (
              <span className="text-[10px] text-[#4b4c6b]">MOSTRANDO SEUS BOTS <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7C3AED] ml-1" /></span>
            )}
          </div>

          <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 flex items-center gap-2 border-b border-[#1a1b28]">
              <Search className="h-3.5 w-3.5 text-[#4b4c6b]" />
              <input
                type="text"
                placeholder="Buscar bot por nome..."
                value={botSearch}
                onChange={(e) => setBotSearch(e.target.value)}
                className="bg-transparent text-[12px] text-[#c9cadb] placeholder-[#2a2b3e] outline-none flex-1"
              />
            </div>

            {botsLoading ? (
              <div className="space-y-px">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 bg-[#090A0F] animate-pulse" />
                ))}
              </div>
            ) : bots && bots.length > 0 ? (() => {
              const filtered = bots.filter((b: any) =>
                !botSearch || b.name?.toLowerCase().includes(botSearch.toLowerCase())
              );
              return filtered.length > 0 ? (
              <div>
                {filtered.slice(0, 5).map((bot: any, i: number) => (
                  <Link key={bot.id} href={`/dashboard/bots/${bot.id}`}>
                    <div className={`flex items-center justify-between px-4 py-3 ${i < Math.min(filtered.length, 5) - 1 ? "border-b border-[#1a1b28]" : ""} hover:bg-white/[0.02] transition-all duration-200 group cursor-pointer`}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#131420] border border-[#1e1f2e] flex items-center justify-center">
                          <Terminal className="h-3.5 w-3.5 text-[#7C3AED]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-white">{bot.name}</p>
                          <p className="text-[10px] text-[#4b4c6b]">{bot.phone || "Sem conexão"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${bot.isActive ? "bg-green-500" : "bg-[#2a2b3e]"}`} />
                          <span className="text-[10px] text-[#4b4c6b]">{bot.isActive ? "Online" : "Offline"}</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#c9cadb] border border-[#1e1f2e] rounded-md px-3 py-1 transition-all duration-200 group-hover:border-[#7C3AED]/40 group-hover:text-[#c4b5fd]">
                          Control
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Search className="h-6 w-6 text-[#2a2b3e]" />
                <p className="text-[12px] text-[#4b4c6b]">Nenhum bot encontrado para "{botSearch}"</p>
              </div>
            );
            })() : (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bot className="h-6 w-6 text-[#2a2b3e]" />
                <p className="text-[12px] text-[#4b4c6b]">Nenhum bot criado ainda</p>
                <Link href="/dashboard/bots">
                  <button className="mt-2 text-[11px] font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] px-4 py-1.5 rounded-md transition-all duration-200">
                    Criar Bot
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-md bg-[#7C3AED]/10 flex items-center justify-center">
                <Shield className="h-3.5 w-3.5 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">{stats?.activePlan ?? "Sem plano"}</p>
                <p className="text-[10px] text-[#4b4c6b]">
                  {planExpiry ? `Expira ${planExpiry}` : "Sem plano ativo"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#4b4c6b]">Moedas</span>
                <span className="text-white font-bold">{isLoading ? "—" : <AnimatedNumber value={stats?.coins ?? 0} />}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#4b4c6b]">Total Bots</span>
                <span className="text-white font-bold">{isLoading ? "—" : <AnimatedNumber value={stats?.totalBots ?? 0} />}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#4b4c6b]">Bots Ativos</span>
                <span className="text-white font-bold">{isLoading ? "—" : <AnimatedNumber value={stats?.activeBots ?? 0} />}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#4b4c6b]">Mensagens</span>
                <span className="text-white font-bold">{isLoading ? "—" : <AnimatedNumber value={stats?.totalMessages ?? 0} />}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#7C3AED]/20 to-[#4C1D95]/10 border border-[#7C3AED]/20 rounded-lg p-4 overflow-hidden relative">
            <div className="absolute top-2 right-2 opacity-10">
              <MessageSquare className="h-16 w-16 text-[#7C3AED]" />
            </div>
            <p className="text-[10px] font-bold text-[#7C3AED] tracking-[1.5px] uppercase mb-1">PRÉ-VISUALIZAÇÃO</p>
            <p className="text-[13px] font-bold text-white mb-1">Comandos do Bot</p>
            <p className="text-[11px] text-[#c9cadb]/60 mb-3">Veja como ficam os comandos configurados no seu bot</p>
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 bg-black/20 rounded px-2 py-1.5">
                <span className="text-[11px] text-[#7C3AED] font-mono font-bold">.menu</span>
                <span className="text-[10px] text-[#4b4c6b]">→ Mostra menu principal</span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 rounded px-2 py-1.5">
                <span className="text-[11px] text-[#7C3AED] font-mono font-bold">.sticker</span>
                <span className="text-[10px] text-[#4b4c6b]">→ Cria figurinha</span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 rounded px-2 py-1.5">
                <span className="text-[11px] text-[#7C3AED] font-mono font-bold">.help</span>
                <span className="text-[10px] text-[#4b4c6b]">→ Lista de comandos</span>
              </div>
            </div>
            <Link href="/dashboard/builder">
              <button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-bold py-2 rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-[#7C3AED]/20">
                ABRIR CONSTRUTOR
              </button>
            </Link>
          </div>
        </div>
      </div>

      <p className="text-[10px] font-bold text-[#4b4c6b] tracking-[1.5px] uppercase mb-3">ATIVIDADE RECENTE</p>
      <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-[#090A0F] animate-pulse" />
            ))}
          </div>
        ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div>
            {stats.recentActivity.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-4 py-3 ${i < stats.recentActivity.length - 1 ? "border-b border-[#1a1b28]" : ""} hover:bg-white/[0.02] transition-all duration-200`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#7C3AED] shrink-0" />
                  <p className="text-[13px] text-[#c9cadb]">{item.description}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#4b4c6b] shrink-0">
                  <Clock className="h-3 w-3" />
                  {format(new Date(item.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Activity className="h-6 w-6 text-[#2a2b3e]" />
            <p className="text-[12px] text-[#4b4c6b]">Nenhuma atividade recente</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
