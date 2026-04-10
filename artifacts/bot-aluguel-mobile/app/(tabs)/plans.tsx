import {
  useActivatePlan,
  useGetActivePlan,
  useGetDashboardStats,
  useListPlans,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Plan = {
  id: string;
  name: string;
  description: string;
  coins: number;
  days: number;
  maxGroups: number;
  features: string[];
};

const PLAN_ACCENTS: Record<string, [string, string]> = {
  Basico: ["#8B3FFF", "#6B1FDF"],
  Pro: ["#2979FF", "#1559CF"],
  Premium: ["#F59E0B", "#D97706"],
};

function PlanCard({
  plan,
  isActive,
  coins,
  onActivate,
  loading,
}: {
  plan: Plan;
  isActive: boolean;
  coins: number;
  onActivate: () => void;
  loading: boolean;
}) {
  const colors = useColors();
  const accent = PLAN_ACCENTS[plan.name] ?? ["#8B3FFF", "#6B1FDF"];
  const canAfford = coins >= plan.coins;

  return (
    <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: isActive ? accent[0] : colors.border }]}>
      {isActive && (
        <View style={[styles.activePill, { backgroundColor: accent[0] }]}>
          <Text style={styles.activePillText}>ATIVO</Text>
        </View>
      )}
      <LinearGradient
        colors={[accent[0] + "20", "transparent"]}
        style={styles.planCardHeader}
      >
        <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
        <Text style={[styles.planDesc, { color: colors.mutedForeground }]}>{plan.description}</Text>
        <View style={styles.planPriceRow}>
          <Feather name="dollar-sign" size={16} color={accent[0]} />
          <Text style={[styles.planCoins, { color: accent[0] }]}>{plan.coins} moedas</Text>
          <Text style={[styles.planDays, { color: colors.mutedForeground }]}>/ {plan.days} dias</Text>
        </View>
      </LinearGradient>

      <View style={styles.planFeatures}>
        <View style={styles.planFeatureRow}>
          <Feather name="users" size={14} color={accent[0]} />
          <Text style={[styles.planFeatureText, { color: colors.foreground }]}>
            Até {plan.maxGroups} grupos
          </Text>
        </View>
        {plan.features.map((f, i) => (
          <View key={i} style={styles.planFeatureRow}>
            <Feather name="check" size={14} color={accent[0]} />
            <Text style={[styles.planFeatureText, { color: colors.foreground }]}>{f}</Text>
          </View>
        ))}
      </View>

      {!isActive && (
        <Pressable
          style={({ pressed }) => [
            styles.activateBtn,
            {
              backgroundColor: canAfford ? accent[0] : colors.secondary,
              opacity: pressed || loading ? 0.7 : 1,
            },
          ]}
          onPress={onActivate}
          disabled={loading || !canAfford}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={[styles.activateBtnText, { color: canAfford ? "#FFF" : colors.mutedForeground }]}>
              {canAfford ? "Ativar plano" : `Precisa de ${plan.coins - coins} moedas`}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

export default function PlansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const { data: plans, isLoading } = useListPlans();
  const { data: activePlan, refetch: refetchActive } = useGetActivePlan();
  const { data: stats, refetch: refetchStats } = useGetDashboardStats();
  const activatePlan = useActivatePlan();

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  async function handleActivate(planId: string, planName: string) {
    Alert.alert("Ativar plano", `Deseja ativar o plano ${planName}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Ativar",
        onPress: async () => {
          setActivatingId(planId);
          try {
            await activatePlan.mutateAsync({ planId });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            refetchActive();
            refetchStats();
          } catch (e: unknown) {
            const msg = (e as { message?: string })?.message ?? "";
            Alert.alert("Erro", msg.includes("402") ? "Moedas insuficientes" : "Erro ao ativar plano.");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } finally {
            setActivatingId(null);
          }
        },
      },
    ]);
  }

  const coins = stats?.coins ?? 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingTop, paddingBottom }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Planos</Text>
        <View style={[styles.coinsBadge, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
          <Feather name="dollar-sign" size={14} color={colors.primary} />
          <Text style={[styles.coinsCount, { color: colors.primary }]}>{coins} moedas</Text>
        </View>
      </View>

      {activePlan?.planName && (
        <View style={[styles.activeInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="star" size={16} color={colors.primary} />
          <View>
            <Text style={[styles.activeInfoLabel, { color: colors.mutedForeground }]}>Plano atual</Text>
            <Text style={[styles.activeInfoName, { color: colors.foreground }]}>{activePlan.planName}</Text>
          </View>
          {activePlan.expiresAt && (
            <Text style={[styles.activeInfoExpiry, { color: colors.mutedForeground }]}>
              Expira {new Date(activePlan.expiresAt).toLocaleDateString("pt-BR")}
            </Text>
          )}
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={{ gap: 16 }}>
          {(plans ?? []).map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan as Plan}
              isActive={activePlan?.planId === plan.id}
              coins={coins}
              onActivate={() => handleActivate(plan.id, plan.name)}
              loading={activatingId === plan.id}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  coinsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  coinsCount: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  activeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  activeInfoLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  activeInfoName: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  activeInfoExpiry: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: "auto" as const },
  planCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden" as const,
  },
  activePill: {
    position: "absolute" as const,
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 1,
  },
  activePillText: { color: "#FFF", fontSize: 10, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  planCardHeader: { padding: 20, paddingBottom: 16 },
  planName: { fontSize: 20, fontWeight: "700" as const, fontFamily: "Inter_700Bold", marginBottom: 4 },
  planDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  planPriceRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  planCoins: { fontSize: 18, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  planDays: { fontSize: 14, fontFamily: "Inter_400Regular", marginLeft: 4 },
  planFeatures: { paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  planFeatureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  planFeatureText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  activateBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  activateBtnText: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});
