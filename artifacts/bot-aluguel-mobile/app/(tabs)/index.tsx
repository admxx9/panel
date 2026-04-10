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
import { useAuth } from "@/context/AuthContext";

const WEEK_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function MiniBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <View style={ch.wrap}>
      <View style={ch.bars}>
        {data.map((v, i) => (
          <View key={i} style={ch.col}>
            <View style={ch.barBg}>
              <View
                style={[
                  ch.barFill,
                  { height: `${Math.max((v / max) * 100, 4)}%` as any },
                ]}
              />
            </View>
            <Text style={ch.label}>{WEEK_LABELS[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return String(n);
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

  const getStatusInfo = (status: string) => {
    if (status === "connected") return { label: "Online", color: "#22C55E", icon: "wifi" as const, bg: "#22C55E" };
    if (status === "connecting") return { label: "Conectando", color: "#F59E0B", icon: "loader" as const, bg: "#F59E0B" };
    return { label: "Offline", color: "#9CA3AF", icon: "power" as const, bg: "#9CA3AF" };
  };

  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6D28D9" />
        }
      >
        <View style={[s.header, { paddingTop }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{greeting()},</Text>
            <Text style={s.userName}>{user?.name ?? "Usuário"}</Text>
          </View>
          <View style={s.planRow}>
            <Text style={s.planLabel}>{data?.activePlan ?? "Sem plano"}</Text>
            <View style={s.planDot} />
          </View>
          <Pressable
            style={s.avatarWrap}
            onPress={() => router.push("/(tabs)/settings")}
          >
            <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? "U"}</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={s.loader}>
            <ActivityIndicator color="#6D28D9" size="large" />
          </View>
        ) : (
          <>
            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Text style={s.statLabel}>BOTS</Text>
                <Text style={s.statValue}>{totalBots}</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statLabel}>ONLINE</Text>
                <Text style={[s.statValue, { color: "#22C55E" }]}>{activeBots}</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statLabel}>OFFLINE</Text>
                <Text style={[s.statValue, { color: "#9CA3AF" }]}>{offlineBots}</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statLabel}>MSGS</Text>
                <Text style={s.statValue}>{formatNum(msgs)}</Text>
              </View>
            </View>

            <View style={s.actionsBar}>
              <Pressable
                style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.7 }]}
                onPress={() => router.push("/(tabs)/bots")}
              >
                <Feather name="plus" size={20} color="#F0F0F5" />
                <Text style={s.actionText}>Novo</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.7 }]}
                onPress={() => router.push("/(tabs)/bots")}
              >
                <Feather name="tool" size={20} color="#F0F0F5" />
                <Text style={s.actionText}>Builder</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.7 }]}
                onPress={() => router.push("/(tabs)/payments")}
              >
                <Feather name="credit-card" size={20} color="#F0F0F5" />
                <Text style={s.actionText}>Recarga</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.7 }]}
                onPress={() => router.push("/(tabs)/plans")}
              >
                <Feather name="layout" size={20} color="#F0F0F5" />
                <Text style={s.actionText}>Planos</Text>
              </Pressable>
            </View>

            {bots && bots.length > 0 && (
              <>
                <View style={s.sectionRow}>
                  <Text style={s.sectionTitle}>SEUS BOTS</Text>
                  <Pressable onPress={() => router.push("/(tabs)/bots")}>
                    <Text style={s.seeAll}>Ver todos</Text>
                  </Pressable>
                </View>

                {bots.slice(0, 4).map((bot: any) => {
                  const st = getStatusInfo(bot.status);
                  return (
                    <Pressable
                      key={bot.id}
                      style={({ pressed }) => [s.botCard, pressed && { opacity: 0.85 }]}
                      onPress={() => router.push(`/bot/${bot.id}` as any)}
                    >
                      <View style={[s.botStripe, { backgroundColor: st.bg }]} />
                      <View style={s.botContent}>
                        <View style={s.botTop}>
                          <View style={s.botInfo}>
                            <View style={[s.botIcon, { backgroundColor: st.color + "15" }]}>
                              <Feather name={st.icon} size={18} color={st.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={s.botName}>{bot.name}</Text>
                              <Text style={s.botPhone}>{bot.phone || "Sem número"}</Text>
                            </View>
                          </View>
                          <View style={[s.statusPill, { backgroundColor: st.color + "15", borderColor: st.color + "30" }]}>
                            <View style={[s.statusDot, { backgroundColor: st.color }]} />
                            <Text style={[s.statusText, { color: st.color }]}>{st.label}</Text>
                          </View>
                        </View>
                        <View style={s.botBottom}>
                          <View style={s.botMsgRow}>
                            <Feather name="message-square" size={13} color="#A0A0B0" />
                            <Text style={s.botMsgText}>{bot.messageCount ?? 0} msgs hoje</Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </>
            )}

            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>VOLUME DA SEMANA</Text>
              <Text style={s.chartBadge}>+12%</Text>
            </View>
            <View style={s.chartWrap}>
              <MiniBarChart data={weekData} />
            </View>

            {data?.recentActivity && data.recentActivity.length > 0 && (
              <>
                <View style={s.sectionRow}>
                  <Text style={s.sectionTitle}>ATIVIDADE RECENTE</Text>
                </View>
                <View style={s.activityCard}>
                  {data.recentActivity.slice(0, 4).map((item: any, i: number) => {
                    const iconName = item.type === "topup" ? "trending-up" : item.type === "bot_start" ? "cpu" : "zap";
                    const iconColor = item.type === "topup" ? "#22C55E" : item.type === "bot_start" ? "#22C55E" : "#6D28D9";
                    const iconBg = item.type === "topup" ? "#22C55E15" : item.type === "bot_start" ? "#22C55E15" : "#6D28D915";
                    return (
                      <View key={item.id}>
                        <View style={s.actRow}>
                          <View style={[s.actIcon, { backgroundColor: iconBg }]}>
                            <Feather name={iconName as any} size={13} color={iconColor} />
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
                          <View style={s.actDivider} />
                        )}
                      </View>
                    );
                  })}
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
  wrap: { marginTop: 4 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 64 },
  col: { flex: 1, alignItems: "center", gap: 6 },
  barBg: {
    width: "100%",
    height: 64,
    backgroundColor: "transparent",
    borderRadius: 3,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: { width: "100%", borderRadius: 3, backgroundColor: "#6D28D9", opacity: 0.8 },
  label: { fontSize: 10, color: "#A0A0B0", fontFamily: "Inter_400Regular" },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F0F14" },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2A2A3540",
  },
  greeting: { color: "#A0A0B0", fontSize: 13, fontFamily: "Inter_400Regular" },
  userName: { color: "#F0F0F5", fontSize: 22, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  planRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  planLabel: { fontSize: 12, color: "#A0A0B0", fontFamily: "Inter_500Medium" },
  planDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#6D28D9" },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A24",
    borderWidth: 1,
    borderColor: "#2A2A35",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#A0A0B0", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  loader: { paddingVertical: 80, alignItems: "center" },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  statItem: { gap: 4 },
  statLabel: { fontSize: 10, color: "#A0A0B0", fontFamily: "Inter_500Medium", letterSpacing: 1 },
  statValue: { fontSize: 18, color: "#F0F0F5", fontFamily: "Inter_600SemiBold" },
  statDivider: { width: 1, height: 32, backgroundColor: "#2A2A35" },

  actionsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: "#1A1A2480",
    borderWidth: 1,
    borderColor: "#2A2A3550",
    borderRadius: 16,
    padding: 6,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionText: { fontSize: 10, color: "#A0A0B0", fontFamily: "Inter_500Medium" },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    color: "#A0A0B0",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  seeAll: { fontSize: 12, color: "#6D28D9", fontFamily: "Inter_500Medium" },
  chartBadge: { fontSize: 11, color: "#22C55E", fontFamily: "Inter_600SemiBold" },

  botCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    overflow: "hidden",
  },
  botStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 3,
    height: "100%",
  },
  botContent: { padding: 14, paddingLeft: 16 },
  botTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  botInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  botIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  botName: { fontSize: 15, color: "#F0F0F5", fontFamily: "Inter_600SemiBold" },
  botPhone: { fontSize: 12, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 2 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  botBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2A2A3550",
  },
  botMsgRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  botMsgText: { fontSize: 12, color: "#A0A0B0", fontFamily: "Inter_400Regular" },

  chartWrap: {
    marginHorizontal: 20,
    marginBottom: 28,
  },

  activityCard: {
    marginHorizontal: 20,
    backgroundColor: "#1A1A2430",
    borderWidth: 1,
    borderColor: "#2A2A3550",
    borderRadius: 16,
    padding: 14,
  },
  actRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8 },
  actIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  actDesc: { fontSize: 13, color: "#F0F0F5", fontFamily: "Inter_500Medium", lineHeight: 18 },
  actTime: { fontSize: 11, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 2 },
  actDivider: { height: StyleSheet.hairlineWidth, backgroundColor: "#2A2A3540", marginLeft: 34 },
});
