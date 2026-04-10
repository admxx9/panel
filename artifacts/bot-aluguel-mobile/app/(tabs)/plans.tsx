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
import { LinearGradient } from "expo-linear-gradient";

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
            <Feather name="check" size={12} color="#7C3AED" />
            <Text style={c.featureText}>{f}</Text>
          </View>
        ))}
        <View style={c.feature}>
          <Feather name="users" size={12} color="#9CA3AF" />
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
          <ActivityIndicator color={isActive ? "#7C3AED" : "#FFF"} size="small" />
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
  const { data: plans, isLoading: plansLoading } = useListPlans();
  const { data: stats, refetch } = useGetDashboardStats();
  const activatePlan = useActivatePlan();
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const paddingBottom = Platform.OS === "web" ? 34 + 110 : insets.bottom + 110;

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
    <View style={s.root}>
      <LinearGradient colors={["#7C3AED", "#6D28D9"]} style={[s.header, { paddingTop: insets.top + 12 }]}>
        <Text style={s.headerTitle}>Planos</Text>
        <Text style={s.headerSub}>Escolha o melhor plano para seus bots</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#7C3AED" />}
      >
        <View style={s.coinsCard}>
          <View style={s.coinsIconWrap}>
            <Feather name="dollar-sign" size={20} color="#7C3AED" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.coinsValue}>{coins} moedas</Text>
            <Text style={s.coinsLabel}>disponíveis</Text>
          </View>
          {activePlan && (
            <View style={s.activePlanBadge}>
              <Text style={s.activePlanText}>{activePlan}</Text>
            </View>
          )}
        </View>

        {plansLoading ? (
          <View style={s.loader}>
            <ActivityIndicator color="#7C3AED" size="large" />
          </View>
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: "#7C3AED",
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
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "Inter_700Bold",
  },
  activeBadge: {
    backgroundColor: "#EDE9FE",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7C3AED",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  desc: { fontSize: 13, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  price: { fontSize: 24, fontWeight: "800", color: "#7C3AED", fontFamily: "Inter_700Bold" },
  priceUnit: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_400Regular", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#F3F4F6" },
  features: { gap: 8 },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular" },
  btn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    backgroundColor: "#7C3AED",
  },
  btnActive: {
    backgroundColor: "#EDE9FE",
  },
  btnDisabled: {
    backgroundColor: "#F3F4F6",
  },
  btnText: { fontSize: 14, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },
  btnActiveText: { color: "#7C3AED" },
  btnDisabledText: { color: "#9CA3AF" },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, color: "#FFFFFFBB", fontFamily: "Inter_400Regular", marginTop: 4 },

  coinsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  coinsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  coinsValue: { fontSize: 18, fontWeight: "700", color: "#1F2937", fontFamily: "Inter_700Bold" },
  coinsLabel: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular", marginTop: 1 },
  activePlanBadge: {
    backgroundColor: "#EDE9FE",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activePlanText: { fontSize: 12, fontWeight: "700", color: "#7C3AED", fontFamily: "Inter_700Bold" },

  plansList: { gap: 14 },
  loader: { paddingVertical: 60, alignItems: "center" },
});
