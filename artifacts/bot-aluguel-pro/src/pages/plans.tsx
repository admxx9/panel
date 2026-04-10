import { CheckCircle, Loader2, Coins, Star, Zap, Crown } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListPlans, useGetActivePlan, useActivatePlan, getGetActivePlanQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PLAN_COLORS: Record<string, string> = {
  basico: "#7C3AED",
  pro:    "#7C3AED",
  premium: "#F59E0B",
};

const PLAN_ICONS: Record<string, React.ElementType> = {
  basico: Star,
  pro: Zap,
  premium: Crown,
};

export default function PlansPage() {
  const { data: plans, isLoading: plansLoading } = useListPlans();
  const { data: activePlan, isLoading: planLoading } = useGetActivePlan();
  const activatePlan = useActivatePlan();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleActivate = async (planId: string, planName: string, coins: number) => {
    if ((user?.coins ?? 0) < coins) {
      toast({
        title: "Moedas insuficientes",
        description: `Você precisa de ${coins} moedas mas tem apenas ${user?.coins}. Recarregue em Comprar Moedas.`,
        variant: "destructive",
      });
      return;
    }
    try {
      await activatePlan.mutateAsync({ planId });
      queryClient.invalidateQueries({ queryKey: getGetActivePlanQueryKey() });
      toast({ title: "Plano ativado!", description: `${planName} ativado com sucesso!` });
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; message?: string };
      toast({ title: "Erro", description: apiErr?.data?.message || apiErr?.message || "Erro ao ativar", variant: "destructive" });
    }
  };

  const isActivePlan = (planId: string) => activePlan && "planId" in activePlan && activePlan.planId === planId;

  return (
    <DashboardLayout>
      <div className="mb-6 pb-4 border-b border-[#1a1b28] flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Assinatura</p>
          <h1 className="text-[20px] font-bold text-white mt-0.5">Planos</h1>
        </div>
        <div className="flex items-center gap-2 bg-[#0d0e16] border border-[#1a1b28] rounded-lg px-3 py-2">
          <Coins className="h-3.5 w-3.5 text-[#7C3AED]" />
          <span className="text-[13px] font-bold text-[#7C3AED]">{user?.coins ?? 0}</span>
          <span className="text-[11px] text-[#4b4c6b]">moedas</span>
        </div>
      </div>

      {activePlan && "planId" in activePlan && activePlan.planId && (
        <div className="bg-[#0d0e16] border border-[#22C55E]/30 border-l-[3px] border-l-[#22C55E] rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="h-4 w-4 text-[#22C55E] shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-[#22C55E]">Plano {activePlan.planName} ativo</p>
            {activePlan.expiresAt && (
              <p className="text-[11px] text-[#4b4c6b]">
                Expira em {format(new Date(activePlan.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            )}
          </div>
        </div>
      )}

      {plansLoading || planLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 bg-[#0d0e16] border border-[#1a1b28] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {plans?.map((plan) => {
            const color = PLAN_COLORS[plan.id] ?? "#7C3AED";
            const active = isActivePlan(plan.id);
            const PlanIcon = PLAN_ICONS[plan.id] ?? Star;
            return (
              <div
                key={plan.id}
                className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5 flex flex-col gap-4 border-l-[3px] transition-colors hover:border-[#2a2b3e]"
                style={{ borderLeftColor: color }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="h-9 w-9 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: color + "20" }}
                  >
                    <PlanIcon className="h-4 w-4" style={{ color }} />
                  </div>
                  {active && (
                    <div
                      className="px-2 py-1 rounded text-[10px] font-bold border"
                      style={{ color, backgroundColor: color + "15", borderColor: color + "30" }}
                    >
                      ATIVO
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-[16px] font-bold text-white">{plan.name}</h3>
                  <p className="text-[12px] text-[#4b4c6b] mt-1">{plan.description}</p>
                  <p className="text-[28px] font-extrabold mt-3 leading-none" style={{ color }}>{plan.coins}</p>
                  <p className="text-[12px] text-[#4b4c6b] mt-1">
                    moedas &bull; {plan.days} dias &bull; {plan.maxGroups === -1 ? "Grupos ilimitados" : `${plan.maxGroups} grupos`}
                  </p>
                </div>

                <ul className="space-y-2 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[12px] text-[#8b8ea0]">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={active || activatePlan.isPending}
                  onClick={() => handleActivate(plan.id, plan.name, plan.coins)}
                  className="w-full py-2.5 rounded-md text-[13px] font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  style={active
                    ? { backgroundColor: color + "15", color, border: `1px solid ${color}30` }
                    : { backgroundColor: color, color: "#fff" }
                  }
                >
                  {activatePlan.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {active ? "Plano Ativo" : `Ativar por ${plan.coins} moedas`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
