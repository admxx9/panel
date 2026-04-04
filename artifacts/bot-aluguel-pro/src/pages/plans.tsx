import { CheckCircle, Loader2, Crown, Star, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListPlans, useGetActivePlan, useActivatePlan, getGetActivePlanQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const planIcons: Record<string, React.ElementType> = {
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
        description: `Voce precisa de ${coins} moedas mas tem apenas ${user?.coins}. Recarregue em Comprar Moedas.`,
        variant: "destructive",
      });
      return;
    }
    try {
      await activatePlan.mutateAsync({ planId });
      queryClient.invalidateQueries({ queryKey: getGetActivePlanQueryKey() });
      toast({ title: "Plano ativado!", description: `${planName} ativado com sucesso por 30 dias!` });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao ativar plano";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
  };

  const isActivePlan = (planId: string) => activePlan && "planId" in activePlan && activePlan.planId === planId;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Planos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Saldo atual:{" "}
          <span className="text-primary font-semibold">{user?.coins ?? 0} moedas</span>
        </p>
      </div>

      {activePlan && "planId" in activePlan && activePlan.planId && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-400 font-medium text-sm">
              Plano {activePlan.planName} ativo
            </p>
            {activePlan.expiresAt && (
              <p className="text-muted-foreground text-xs">
                Expira em {format(new Date(activePlan.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            )}
          </div>
        </div>
      )}

      {plansLoading || planLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl bg-card" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {plans?.map((plan) => {
            const PlanIcon = planIcons[plan.id] || Star;
            const active = isActivePlan(plan.id);
            const isPro = plan.id === "pro";
            return (
              <div
                key={plan.id}
                className={`relative p-6 rounded-xl border transition-all duration-300 ${
                  isPro
                    ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/10"
                    : active
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-white/5 bg-card hover:border-white/10"
                }`}
              >
                {isPro && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white border-0 text-xs">
                    Mais Popular
                  </Badge>
                )}
                {active && (
                  <Badge className="absolute -top-3 right-4 bg-green-500 text-white border-0 text-xs">
                    Ativo
                  </Badge>
                )}
                <div className="mb-6">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${isPro ? "bg-primary/20" : "bg-white/5"}`}>
                    <PlanIcon className={`h-5 w-5 ${isPro ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{plan.coins}</span>
                    <span className="text-muted-foreground text-sm">moedas / {plan.days} dias</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    R$ {(plan.coins * 0.01).toFixed(2)} &bull; {plan.maxGroups === -1 ? "Grupos ilimitados" : `${plan.maxGroups} grupo${plan.maxGroups > 1 ? "s" : ""}`}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${isPro ? "bg-primary hover:bg-primary/90 text-white" : "border-white/10 bg-white/5 hover:bg-white/10 text-white"}`}
                  variant={isPro ? "default" : "outline"}
                  disabled={active || activatePlan.isPending}
                  onClick={() => handleActivate(plan.id, plan.name, plan.coins)}
                >
                  {activatePlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {active ? "Plano Ativo" : `Ativar por ${plan.coins} moedas`}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
