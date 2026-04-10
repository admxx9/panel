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

type Plan = {
  id: string;
  name: string;
  description: string;
  coins: number;
  days: number;
  maxGroups: number;
  features: string[];
};

const PLAN_COLORS: Record<string, string> = {
  Basico:  "#7C3AED",
  Pro:     "#7C3AED",
  Premium: "#F59E0B",
};

function PlanRow({ plan, isActive, coins, onActivate, loading }: {
  plan: Plan; isActive: boolean; coins: number; onActivate: () => void; loading: boolean;
}) {
  const color = PLAN_COLORS[plan.name] ?? "#7C3AED";
  const canAfford = coins >= plan.coins;

  return (
    <View style={[row.card, isActive && { borderLeftColor: color }]}>
      <View style={row.header}>
        <View>
          <View style={row.nameLine}>
            <Text style={row.name}>{plan.name}</Text>
            {isActive && (
              <View style={[row.activeBadge, { backgroundColor: color + "20", borderColor: color + "40" }]}>
                <Text style={[row.activeBadgeText, { color }]}>ATIVO</Text>
              </View>
            )}
          </View>
          <Text style={row.desc}>{plan.description}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[row.price, { color }]}>{plan.coins} <Text style={row.priceUnit}>moedas</Text></Text>
          <Text style={row.days}>{plan.days} dias</Text>
        </View>
      </View>

      <View style={row.features}>
        {plan.features.slice(0, 3).map((f, i) => (
          <View key={i} style={row.feature}>
            <Feather name="check" size={11} color={color} />
            <Text style={row.featureText}>{f}</Text>
          </View>
        ))}
        <View style={row.feature}>
          <Feather name="users" size={11} color="#4B4C6B" />
          <Text style={row.featureText}>Até {plan.maxGroups} grupos</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          row.btn,
          isActive
            ? { borderColor: color + "40", backgroundColor: color + "15" }
            : canAfford
            ? { backgroundColor: color, borderColor: color }
            : { borderColor: "#1A1B28", backgroundColor: "#131420" },
          { opacity: pressed || loading ? 0.8 : 1 },
        ]}
        onPress={onActivate}
        disabled={isActive || loading || !canAfford}
      >
        {loading ? (
          <ActivityIndicator color={isActive ? color : "#FFF"} size="small" />
        ) : (
          <Text style={[row.btnText, !canAfford && !isActive && { color: "#4B4C6B" }, isActive && { color }]}>
            {isActive ? "Plano ativo" : canAfford ? "Ativar plano" : `Faltam ${plan.coins - coins} moedas`}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const { data: plans, isLoading: plansLoading } = useListPlans();
  const { data: stats, refetch } = useGetDashboardStats();
  const activatePlan = useActivatePlan();
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 80;

  const handleActivate = (plan: Plan) => {
    Alert.alert("Ativar plano", `Ativar "${plan.name}" por ${plan.coins} moedas?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          setActivatingId(plan.id);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          try {
            await activatePlan.mutateAsync({ planId: plan.id });
            await refetch();
          } catch {
            Alert.alert("Erro", "Não foi possível ativar o plano.");
          } finally {
            setActivatingId(null);
          }
        },
      },
    ]);
  };

  const coins = stats?.coins ?? 0;
  const activePlan = stats?.activePlan;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={{ paddingTop, paddingBottom, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#7C3AED" />}
    >
      <View style={s.topBar}>
        <Text style={s.pageLabel}>ASSINATURA</Text>
        <Text style={s.pageTitle}>Planos</Text>
      </View>

      <View style={s.coinsCard}>
        <View style={s.coinsLeft}>
          <Feather name="dollar-sign" size={18} color="#7C3AED" />
          <View>
            <Text style={s.coinsValue}>{coins}</Text>
            <Text style={s.coinsLabel}>moedas disponíveis</Text>
          </View>
        </View>
        {activePlan && (
          <View style={s.activePlanBadge}>
            <Text style={s.activePlanText}>{activePlan}</Text>
          </View>
        )}
      </View>

      {plansLoading ? (
        <View style={s.loader}>
          <ActivityIndicator color="#7C3AED" />
        </View>
      ) : (
        <View style={s.plansList}>
          {(plans as Plan[] | undefined)?.map((plan) => (
            <PlanRow
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
  );
}

const row = StyleSheet.create({
  card: {
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    borderLeftWidth: 3,
    borderLeftColor: "#1A1B28",
    padding: 16,
    gap: 12,
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
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#F1F2F6",
    fontFamily: "Inter_700Bold",
  },
  activeBadge: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  desc: { fontSize: 12, color: "#4B4C6B", fontFamily: "Inter_400Regular" },
  price: { fontSize: 20, fontWeight: "800" as const, fontFamily: "Inter_700Bold" },
  priceUnit: { fontSize: 12, fontWeight: "400" as const, color: "#8B8EA0" },
  days: { fontSize: 11, color: "#4B4C6B", fontFamily: "Inter_400Regular", marginTop: 2 },
  features: { gap: 6 },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureText: { fontSize: 12, color: "#8B8EA0", fontFamily: "Inter_400Regular" },
  btn: {
    borderRadius: 6,
    borderWidth: 1,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 13, fontWeight: "700" as const, color: "#FFF", fontFamily: "Inter_700Bold" },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090A0F" },

  topBar: { marginBottom: 20 },
  pageLabel: { fontSize: 10, color: "#4B4C6B", fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 4 },
  pageTitle: { fontSize: 22, fontWeight: "800" as const, color: "#F1F2F6", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },

  coinsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    borderLeftWidth: 3,
    borderLeftColor: "#7C3AED",
    padding: 16,
    marginBottom: 20,
  },
  coinsLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  coinsValue: { fontSize: 22, fontWeight: "800" as const, color: "#7C3AED", fontFamily: "Inter_700Bold" },
  coinsLabel: { fontSize: 11, color: "#4B4C6B", fontFamily: "Inter_400Regular" },
  activePlanBadge: {
    backgroundColor: "#7C3AED15",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#7C3AED30",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activePlanText: { fontSize: 11, fontWeight: "700" as const, color: "#7C3AED", fontFamily: "Inter_700Bold" },

  plansList: { gap: 10 },
  loader: { paddingVertical: 40, alignItems: "center" },
});
