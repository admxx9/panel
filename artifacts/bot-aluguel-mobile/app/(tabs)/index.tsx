import { useGetDashboardStats } from "@workspace/api-client-react";
import { useListBots } from "@workspace/api-client-react";
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
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthContext";

const WEEK_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const CHART_MAX = 100;

function MiniBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <View style={ch.wrap}>
      <View style={ch.bars}>
        {data.map((v, i) => (
          <View key={i} style={ch.col}>
            <View style={ch.barBg}>
              <LinearGradient
                colors={["#6D28D9", "#4C1D95"]}
                style={[ch.barFill, { height: `${Math.max((v / max) * 100, 4)}%` }]}
              />
            </View>
            <Text style={ch.label}>{WEEK_LABELS[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useGetDashboardStats();
  const { data: bots } = useListBots();

  const paddingBottom = Platform.OS === "web" ? 34 + 110 : insets.bottom + 110;

  const totalBots = data?.totalBots ?? 0;
  const activeBots = data?.activeBots ?? 0;
  const offlineBots = totalBots - activeBots;
  const coins = data?.coins ?? user?.coins ?? 0;
  const msgs = data?.totalMessages ?? 0;

  const weekData = [12, 28, 19, 35, 22, 8, activeBots * 10 || 5];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6D28D9" />
        }
      >
        <LinearGradient
          colors={["#6D28D9", "#4C1D95", "#3B0764"]}
          style={[s.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={s.headerRow}>
            <View style={s.avatarWrap}>
              <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? "U"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.greetText}>{greeting()},</Text>
              <Text style={s.userName}>{user?.name ?? "Usuário"}</Text>
            </View>
            <Pressable
              style={s.headerBtn}
              onPress={() => router.push("/(tabs)/settings")}
            >
              <Feather name="settings" size={20} color="#FFFFFFCC" />
            </Pressable>
            <Pressable style={s.headerBtn}>
              <Feather name="bell" size={20} color="#FFFFFFCC" />
            </Pressable>
          </View>

          <View style={s.planBadge}>
            <Feather name="zap" size={14} color="#FBBF24" />
            <Text style={s.planBadgeText}>
              {data?.activePlan ?? "Sem plano"} · {coins.toLocaleString("pt-BR")} moedas
            </Text>
          </View>
        </LinearGradient>

        {isLoading ? (
          <View style={s.loader}>
            <ActivityIndicator color="#6D28D9" size="large" />
          </View>
        ) : (
          <>
            <View style={s.statsGrid}>
              <View style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: "#150F2A" }]}>
                  <Feather name="cpu" size={18} color="#8B5CF6" />
                </View>
                <Text style={s.statValue}>{totalBots}</Text>
                <Text style={s.statLabel}>Total Bots</Text>
              </View>
              <View style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: "#0D2818" }]}>
                  <Feather name="wifi" size={18} color="#22C55E" />
                </View>
                <Text style={s.statValue}>{activeBots}</Text>
                <Text style={s.statLabel}>Online</Text>
              </View>
              <View style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: "#2D0A0A" }]}>
                  <Feather name="wifi-off" size={18} color="#EF4444" />
                </View>
                <Text style={s.statValue}>{offlineBots}</Text>
                <Text style={s.statLabel}>Offline</Text>
              </View>
              <View style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: "#2D2506" }]}>
                  <Feather name="message-circle" size={18} color="#F59E0B" />
                </View>
                <Text style={s.statValue}>{msgs}</Text>
                <Text style={s.statLabel}>Mensagens</Text>
              </View>
            </View>

            <View style={s.chartCard}>
              <View style={s.chartHeader}>
                <Text style={s.chartTitle}>Atividade Semanal</Text>
                <View style={s.chartBadge}>
                  <Feather name="trending-up" size={12} color="#22C55E" />
                  <Text style={s.chartBadgeText}>Ativo</Text>
                </View>
              </View>
              <MiniBarChart data={weekData} />
            </View>

            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Ações Rápidas</Text>
            </View>

            <View style={s.actionsGrid}>
              <Pressable
                style={({ pressed }) => [s.actionCard, pressed && { opacity: 0.8 }]}
                onPress={() => router.push("/(tabs)/bots")}
              >
                <LinearGradient colors={["#6D28D9", "#4C1D95"]} style={s.actionIconGrad}>
                  <Feather name="plus" size={20} color="#FFF" />
                </LinearGradient>
                <Text style={s.actionLabel}>Criar Bot</Text>
                <Text style={s.actionSub}>Novo bot WhatsApp</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [s.actionCard, pressed && { opacity: 0.8 }]}
                onPress={() => router.push("/(tabs)/bots")}
              >
                <View style={[s.actionIconWrap, { backgroundColor: "#0D2818" }]}>
                  <Feather name="grid" size={20} color="#22C55E" />
                </View>
                <Text style={s.actionLabel}>Builder</Text>
                <Text style={s.actionSub}>Editor visual</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [s.actionCard, pressed && { opacity: 0.8 }]}
                onPress={() => router.push("/(tabs)/payments")}
              >
                <View style={[s.actionIconWrap, { backgroundColor: "#2D2506" }]}>
                  <Feather name="credit-card" size={20} color="#F59E0B" />
                </View>
                <Text style={s.actionLabel}>Recarregar</Text>
                <Text style={s.actionSub}>Comprar moedas</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [s.actionCard, pressed && { opacity: 0.8 }]}
                onPress={() => router.push("/(tabs)/plans")}
              >
                <View style={[s.actionIconWrap, { backgroundColor: "#150F2A" }]}>
                  <Feather name="star" size={20} color="#8B5CF6" />
                </View>
                <Text style={s.actionLabel}>Planos</Text>
                <Text style={s.actionSub}>Upgrade</Text>
              </Pressable>
            </View>

            {bots && bots.length > 0 && (
              <>
                <View style={s.sectionRow}>
                  <Text style={s.sectionTitle}>Seus Bots</Text>
                  <Pressable onPress={() => router.push("/(tabs)/bots")}>
                    <Text style={s.seeAll}>Ver todos</Text>
                  </Pressable>
                </View>

                {bots.slice(0, 3).map((bot: any) => (
                  <Pressable
                    key={bot.id}
                    style={({ pressed }) => [s.botRow, pressed && { opacity: 0.85 }]}
                    onPress={() => router.push(`/bot/${bot.id}` as any)}
                  >
                    <View style={[s.botDot, bot.status === "connected" && s.botDotOn]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.botName}>{bot.name}</Text>
                      <Text style={s.botPhone}>{bot.phone || "Não conectado"}</Text>
                    </View>
                    <View style={[s.statusPill, bot.status === "connected" ? s.pillOn : s.pillOff]}>
                      <Text style={[s.statusText, bot.status === "connected" ? s.textOn : s.textOff]}>
                        {bot.status === "connected" ? "Online" : "Offline"}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#6B7280" />
                  </Pressable>
                ))}
              </>
            )}

            {data?.recentActivity && data.recentActivity.length > 0 && (
              <>
                <View style={[s.sectionRow, { marginTop: 8 }]}>
                  <Text style={s.sectionTitle}>Atividade Recente</Text>
                </View>
                <View style={s.activityCard}>
                  {data.recentActivity.slice(0, 4).map((item: any, i: number) => (
                    <View key={item.id}>
                      <View style={s.actRow}>
                        <View style={s.actDot}>
                          <Feather
                            name={item.type === "topup" ? "arrow-up-circle" : "zap"}
                            size={16}
                            color={item.type === "topup" ? "#22C55E" : "#6D28D9"}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.actDesc}>{item.description}</Text>
                          <Text style={s.actTime}>
                            {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </View>
                      </View>
                      {i < Math.min(data.recentActivity.length, 4) - 1 && (
                        <View style={s.actLine} />
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const ch = StyleSheet.create({
  wrap: { marginTop: 12 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 80 },
  col: { flex: 1, alignItems: "center", gap: 6 },
  barBg: {
    width: "100%",
    height: 80,
    backgroundColor: "#252530",
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: { width: "100%", borderRadius: 6 },
  label: { fontSize: 10, color: "#6B7280", fontFamily: "Inter_500Medium" },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F0F14" },

  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  greetText: { color: "#FFFFFF99", fontSize: 13, fontFamily: "Inter_400Regular" },
  userName: { color: "#FFF", fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 1 },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  planBadgeText: { color: "#FFFFFFCC", fontSize: 13, fontFamily: "Inter_500Medium" },

  loader: { paddingVertical: 80, alignItems: "center" },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "46%",
    backgroundColor: "#1A1A24",
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 26, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_500Medium" },

  chartCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#1A1A24",
    borderRadius: 14,
    padding: 18,
  },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chartTitle: { fontSize: 15, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  chartBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0D2818",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chartBadgeText: { fontSize: 11, color: "#22C55E", fontFamily: "Inter_600SemiBold" },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, color: "#6D28D9", fontFamily: "Inter_600SemiBold" },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
  },
  actionCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "46%",
    backgroundColor: "#1A1A24",
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  actionIconGrad: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontSize: 14, color: "#F0F0F5", fontFamily: "Inter_700Bold", marginTop: 4 },
  actionSub: { fontSize: 11, color: "#6B7280", fontFamily: "Inter_400Regular" },

  botRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    backgroundColor: "#1A1A24",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  botDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
  },
  botDotOn: { backgroundColor: "#22C55E" },
  botName: { fontSize: 14, color: "#F0F0F5", fontFamily: "Inter_600SemiBold" },
  botPhone: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_400Regular", marginTop: 2 },
  statusPill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  pillOn: { backgroundColor: "#0D2818" },
  pillOff: { backgroundColor: "#2D0A0A" },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  textOn: { color: "#22C55E" },
  textOff: { color: "#EF4444" },

  activityCard: {
    marginHorizontal: 16,
    backgroundColor: "#1A1A24",
    borderRadius: 14,
    padding: 14,
  },
  actRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 10 },
  actDot: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#1E1E28",
    alignItems: "center",
    justifyContent: "center",
  },
  actDesc: { fontSize: 13, color: "#D1D1DB", fontFamily: "Inter_500Medium", lineHeight: 18 },
  actTime: { fontSize: 11, color: "#6B7280", fontFamily: "Inter_400Regular", marginTop: 2 },
  actLine: { height: 1, backgroundColor: "#252530", marginLeft: 46 },
});
