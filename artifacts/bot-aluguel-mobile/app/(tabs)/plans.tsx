import {
  useActivatePlan,
  useGetDashboardStats,
  useListPlans,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorCard } from "@/components/ErrorCard";
import { parseApiError } from "@/utils/parseApiError";

function daysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatExpiryLabel(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  const days = daysUntil(d);
  const formatted = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (days === 0) return `Expira hoje (${formatted})`;
  return `${days}d restantes · ${formatted}`;
}

type Plan = {
  id: string;
  name: string;
  description: string;
  coins: number;
  days: number;
  maxGroups: number;
  features: string[];
};

function PlanCard({ plan, isActive, coins, onActivate, loading }: {
  plan: Plan; isActive: boolean; coins: number; onActivate: () => void; loading: boolean;
}) {
  const canAfford = coins >= plan.coins;

  return (
    <View style={[c.card, isActive && c.cardActive]}>
      <View style={c.header}>
        <View style={{ flex: 1 }}>
          <View style={c.nameLine}>
            <Text style={c.name}>{plan.name}</Text>
            {isActive && (
              <View style={c.activeBadge}>
                <Text style={c.activeBadgeText}>ATIVO</Text>
              </View>
            )}
          </View>
          <Text style={c.desc}>{plan.description}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={c.price}>{plan.coins}</Text>
          <Text style={c.priceUnit}>moedas / {plan.days} dias</Text>
        </View>
      </View>

      <View style={c.divider} />

      <View style={c.features}>
        {plan.features.slice(0, 3).map((f, i) => (
          <View key={i} style={c.feature}>
            <Feather name="check" size={12} color="#6D28D9" />
            <Text style={c.featureText}>{f}</Text>
          </View>
        ))}
        <View style={c.feature}>
          <Feather name="users" size={12} color="#A0A0B0" />
          <Text style={c.featureText}>Até {plan.maxGroups} grupos</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          c.btn,
          isActive
            ? c.btnActive
            : canAfford
            ? c.btnPrimary
            : c.btnDisabled,
          { opacity: pressed || loading ? 0.8 : 1 },
        ]}
        onPress={onActivate}
        disabled={isActive || loading || !canAfford}
      >
        {loading ? (
          <ActivityIndicator color={isActive ? "#6D28D9" : "#FFF"} size="small" />
        ) : (
          <Text style={[c.btnText, isActive && c.btnActiveText, !canAfford && !isActive && c.btnDisabledText]}>
            {isActive ? "Plano ativo" : canAfford ? "Ativar plano" : `Faltam ${plan.coins - coins} moedas`}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const { data: plans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans, isRefetching: plansRefetching } = useListPlans();
  const { data: stats, refetch: refetchStats, isRefetching: statsRefetching } = useGetDashboardStats();
  const isRefreshing = plansRefetching || statsRefetching;
  const activatePlan = useActivatePlan();
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const paddingBottom = Platform.OS === "web" ? 34 + 110 : insets.bottom + 110;
  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;

  const handleActivate = (plan: Plan) => {
    Alert.alert(
      "Ativar plano",
      `Ativar "${plan.name}" por ${plan.coins} moedas?\n\nValidade: ${plan.days} dias a partir de hoje.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setActivatingId(plan.id);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              await activatePlan.mutateAsync({ planId: plan.id });
              await refetchStats();
            } catch (err) {
              Alert.alert("Erro ao ativar plano", parseApiError(err, "Não foi possível ativar o plano. Tente novamente."));
            } finally {
              setActivatingId(null);
            }
          },
        },
      ]
    );
  };

  const coins = stats?.coins ?? 0;
  const activePlan = stats?.activePlan;
  const planExpiresAt = stats?.planExpiresAt ?? null;
  const expiryLabel = formatExpiryLabel(planExpiresAt);

  async function handleRefresh() {
    await Promise.all([refetchStats(), refetchPlans()]);
  }

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop }]}>
        <Text style={s.headerTitle}>Planos</Text>
        <Text style={s.headerSub}>Escolha o melhor plano para seus bots</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#6D28D9" />}
      >
        <View style={s.coinsCard}>
          <View style={s.coinsIconWrap}>
            <Feather name="dollar-sign" size={18} color="#A78BFA" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.coinsValue}>{coins} moedas</Text>
            <Text style={s.coinsLabel}>disponíveis</Text>
          </View>
          {activePlan && (
            <View style={s.activePlanBadge}>
              <Text style={s.activePlanText}>{activePlan}</Text>
              {expiryLabel && (
                <Text style={s.activePlanExpiry}>{expiryLabel}</Text>
              )}
            </View>
          )}
        </View>

        {plansLoading ? (
          <View style={s.loader}>
            <ActivityIndicator color="#6D28D9" size="large" />
          </View>
        ) : plansError ? (
          <ErrorCard
            message="Não foi possível carregar os planos."
            onRetry={refetchPlans}
          />
        ) : (
          <View style={s.plansList}>
            {(plans as Plan[] | undefined)?.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isActive={activePlan === plan.name}
                coins={coins}
                onActivate={() => handleActivate(plan)}
                loading={activatingId === plan.id}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const c = StyleSheet.create({
  card: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    padding: 20,
    gap: 14,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: "#6D28D9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    color: "#F0F0F5",
    fontFamily: "Inter_700Bold",
  },
  activeBadge: {
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: {
    fontSize: 10,
    color: "#A78BFA",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  desc: { fontSize: 13, color: "#A0A0B0", fontFamily: "Inter_400Regular" },
  price: { fontSize: 24, color: "#6D28D9", fontFamily: "Inter_700Bold" },
  priceUnit: { fontSize: 11, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2A2A3560" },
  features: { gap: 8 },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: { fontSize: 13, color: "#A0A0B0", fontFamily: "Inter_400Regular" },
  btn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    backgroundColor: "#6D28D9",
  },
  btnActive: {
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
  },
  btnDisabled: {
    backgroundColor: "#1E1E28",
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  btnText: { fontSize: 14, color: "#FFF", fontFamily: "Inter_700Bold" },
  btnActiveText: { color: "#A78BFA" },
  btnDisabledText: { color: "#A0A0B0" },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F0F14" },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2A2A3540",
  },
  headerTitle: { fontSize: 22, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 4 },

  coinsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    padding: 18,
    marginBottom: 20,
  },
  coinsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    alignItems: "center",
    justifyContent: "center",
  },
  coinsValue: { fontSize: 18, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  coinsLabel: { fontSize: 12, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 1 },
  activePlanBadge: {
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activePlanText: { fontSize: 12, color: "#A78BFA", fontFamily: "Inter_700Bold" },
  activePlanExpiry: { fontSize: 10, color: "#8E8E9E", fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "right" },

  plansList: { gap: 14 },
  loader: { paddingVertical: 60, alignItems: "center" },
});
