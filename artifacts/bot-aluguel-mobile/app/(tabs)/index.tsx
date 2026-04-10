import { useGetDashboardStats } from "@workspace/api-client-react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: accent + "20" }]}>
        <Feather name={icon as any} size={18} color={accent} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function ActivityItem({ item }: { item: { id: string; type: string; description: string; createdAt: string } }) {
  const colors = useColors();
  const iconMap: Record<string, string> = {
    coin_added: "dollar-sign",
    bot_created: "cpu",
    plan_activated: "star",
    bot_connected: "wifi",
    bot_disconnected: "wifi-off",
  };
  const icon = iconMap[item.type] ?? "activity";
  const dateStr = new Date(item.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <View style={[styles.activityItem, { borderColor: colors.border }]}>
      <View style={[styles.activityDot, { backgroundColor: colors.primary + "30" }]}>
        <Feather name={icon as any} size={14} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.activityDesc, { color: colors.foreground }]}>{item.description}</Text>
        <Text style={[styles.activityDate, { color: colors.mutedForeground }]}>{dateStr}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useGetDashboardStats();

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingTop, paddingBottom }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Olá,</Text>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {user?.name?.split(" ")[0] ?? "Usuário"}
          </Text>
        </View>
        <View style={[styles.coinsBadge, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
          <Feather name="dollar-sign" size={14} color={colors.primary} />
          <Text style={[styles.coinsText, { color: colors.primary }]}>
            {isLoading ? "..." : data?.coins ?? user?.coins ?? 0}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <LinearGradient
            colors={["#8B3FFF20", "#2979FF10"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.planBanner, { borderColor: colors.border }]}
          >
            <View>
              <Text style={[styles.planLabel, { color: colors.mutedForeground }]}>PLANO ATIVO</Text>
              <Text style={[styles.planName, { color: colors.foreground }]}>
                {data?.activePlan ?? "Nenhum"}
              </Text>
              {data?.planExpiresAt ? (
                <Text style={[styles.planExpiry, { color: colors.mutedForeground }]}>
                  Expira em {new Date(data.planExpiresAt).toLocaleDateString("pt-BR")}
                </Text>
              ) : null}
            </View>
            <Pressable
              style={[styles.upgradeBtnOuter, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(tabs)/plans")}
            >
              <Text style={styles.upgradeText}>Planos</Text>
            </Pressable>
          </LinearGradient>

          <View style={styles.statsGrid}>
            <StatCard
              label="Total de Bots"
              value={data?.totalBots ?? 0}
              icon="cpu"
              accent={colors.primary}
            />
            <StatCard
              label="Bots Ativos"
              value={data?.activeBots ?? 0}
              icon="wifi"
              accent={colors.success}
            />
            <StatCard
              label="Mensagens"
              value={data?.totalMessages ?? 0}
              icon="message-square"
              accent={colors.accent}
            />
            <StatCard
              label="Moedas"
              value={data?.coins ?? 0}
              icon="dollar-sign"
              accent={colors.warning}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Atividade Recente</Text>
          </View>

          {data?.recentActivity && data.recentActivity.length > 0 ? (
            data.recentActivity.slice(0, 8).map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="activity" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Nenhuma atividade</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  userName: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  coinsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  coinsText: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  loader: { paddingVertical: 60, alignItems: "center" },
  planBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planLabel: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.5, marginBottom: 4 },
  planName: { fontSize: 20, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  planExpiry: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  upgradeBtnOuter: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  upgradeText: { color: "#FFF", fontWeight: "600" as const, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    minWidth: "44%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  activityDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  activityDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  activityDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  emptyState: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
