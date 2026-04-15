import { useGetDashboardStats, useGetUnreadCount } from "@workspace/api-client-react";
import { useListBots } from "@workspace/api-client-react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
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
import { ErrorView } from "@/components/StateViews";
import { DashboardSkeleton } from "@/components/SkeletonLoader";

function daysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const PLATFORM_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  whatsapp:     { color: "#25D366", bg: "#25D36615", icon: "message-circle", label: "WhatsApp" },
  discord:      { color: "#5865F2", bg: "#5865F215", icon: "hash",           label: "Discord" },
  telegram:     { color: "#0088CC", bg: "#0088CC15", icon: "send",           label: "Telegram" },
};

function formatNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isRefetching } = useGetDashboardStats();
  const { data: bots } = useListBots();
  const { data: unreadData } = useGetUnreadCount();
  const unreadCount = (unreadData as any)?.count ?? 0;
  const paddingBottom = Platform.OS === "web" ? 34 + 110 : insets.bottom + 110;

  const totalBots = data?.totalBots ?? 0;
  const activeBots = data?.activeBots ?? 0;
  const msgs = data?.totalMessages ?? 0;
  const activePlan = data?.activePlan ?? null;
  const planExpiresAt = data?.planExpiresAt ?? null;
  const daysLeft = daysUntil(planExpiresAt);

  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;

  const getStatusInfo = (status: string) => {
    if (status === "connected") return { label: "Online", color: "#22C55E", icon: "wifi" as const };
    if (status === "connecting") return { label: "Conectando", color: "#F59E0B", icon: "loader" as const };
    return { label: "Offline", color: "#9CA3AF", icon: "power" as const };
  };

  const getPlatform = (_bot: any) => {
    return PLATFORM_CONFIG["whatsapp"];
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
        <View style={[s.header, { paddingTop }]}>
          <View style={s.headerIcon}>
            <Feather name="terminal" size={16} color="#EBEBF2" />
            <View style={s.headerOnline} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>BotAluguel</Text>
            <View style={s.headerMeta}>
              <View style={s.proBadge}>
                <Text style={s.proBadgeText}>PRO</Text>
              </View>
              <Text style={s.headerSub}>{user?.name ?? "Usuário"}</Text>
            </View>
          </View>
          <Pressable
            style={s.bellBtn}
            onPress={() => router.push("/notifications" as any)}
            accessibilityLabel="Notificações"
            accessibilityRole="button"
          >
            <Feather name="bell" size={20} color="#8E8E9E" />
            {unreadCount > 0 && (
              <View style={s.bellBadge}>
                <Text style={s.bellBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={s.avatarBtn}
            onPress={() => router.push("/(tabs)/settings")}
            accessibilityLabel="Configurações"
            accessibilityRole="button"
          >
            <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? "U"}</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <ErrorView message="Não foi possível carregar o painel" onRetry={refetch} />
        ) : (
          <>
            <View style={s.createCard}>
              <View style={s.createHeader}>
                <View style={s.createIconWrap}>
                  <Feather name="plus" size={16} color="#A78BFA" />
                </View>
                <Text style={s.createTitle}>Criar Novo Bot</Text>
              </View>
              <Text style={s.createDesc}>Selecione a plataforma para começar a construir sua experiência conversacional.</Text>
              <View style={s.platformRow}>
                {(["whatsapp", "discord", "telegram"] as const).map((platform) => {
                  const cfg = PLATFORM_CONFIG[platform];
                  return (
                    <Pressable
                      key={platform}
                      style={({ pressed }) => [s.platformBtn, pressed && { opacity: 0.7 }]}
                      onPress={() => router.push("/(tabs)/bots")}
                    >
                      <View style={[s.platformIconWrap, { backgroundColor: cfg.bg }]}>
                        <Feather name={cfg.icon as any} size={20} color={cfg.color} />
                      </View>
                      <Text style={s.platformLabel}>{cfg.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={s.sectionHeader}>
              <Text style={s.sectionLabel}>VISÃO GERAL</Text>
              <Pressable onPress={() => router.push("/(tabs)/bots")}>
                <Text style={s.sectionLink}>Analytics <Feather name="chevron-right" size={12} color="#6D28D9" /></Text>
              </Pressable>
            </View>
            <View style={s.statsRow}>
              <View style={s.statCard}>
                <View style={s.statIconRow}>
                  <View style={s.statIconWrap}>
                    <Feather name="activity" size={14} color="#EBEBF2" />
                  </View>
                  <Text style={s.statCardLabel}>Bots Ativos</Text>
                </View>
                <View style={s.statValueRow}>
                  <Text style={s.statBigNum}>{activeBots}</Text>
                  <Text style={s.statSmallNum}>/ {totalBots} total</Text>
                </View>
              </View>
              <View style={s.statCard}>
                <View style={s.statIconRow}>
                  <View style={s.statIconWrap}>
                    <Feather name="zap" size={14} color="#EBEBF2" />
                  </View>
                  <Text style={s.statCardLabel}>Msgs Hoje</Text>
                </View>
                <View style={s.statValueRow}>
                  <Text style={s.statBigNum}>{formatNum(msgs)}</Text>
                  <Text style={s.statGreen}>+12%</Text>
                </View>
              </View>
            </View>

            {bots && bots.length > 0 && (
              <>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionLabel}>SEUS BOTS</Text>
                  <View style={s.totalBadge}>
                    <Text style={s.totalBadgeText}>{bots.length} Total</Text>
                  </View>
                </View>

                {bots.slice(0, 4).map((bot: any) => {
                  const st = getStatusInfo(bot.status);
                  const plat = getPlatform(bot);
                  const isOnline = bot.status === "connected";
                  return (
                    <Pressable
                      key={bot.id}
                      style={({ pressed }) => [s.botCard, pressed && { opacity: 0.85 }]}
                      onPress={() => router.push(`/bot/${bot.id}` as any)}
                    >
                      <View style={[s.botTopGlow, { backgroundColor: plat.color }]} />
                      <View style={s.botTop}>
                        <View style={s.botInfo}>
                          <View style={[s.botIconWrap, { backgroundColor: plat.bg }]}>
                            <Feather name={plat.icon as any} size={18} color={plat.color} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={s.botName}>{bot.name}</Text>
                            <View style={s.botBadgeRow}>
                              <View style={[s.platBadge, { backgroundColor: plat.bg, borderColor: plat.color + "30" }]}>
                                <Text style={[s.platBadgeText, { color: plat.color }]}>{plat.label}</Text>
                              </View>
                              <View style={s.statusPill}>
                                <View style={[s.statusDot, { backgroundColor: st.color }]} />
                                <Text style={s.statusText}>{isOnline ? "ONLINE" : "OFFLINE"}</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                        <Pressable
                          style={s.botMenuBtn}
                          onPress={() => router.push(`/bot/settings/${bot.id}` as any)}
                        >
                          <Feather name="more-vertical" size={16} color="#8E8E9E" />
                        </Pressable>
                      </View>
                      <View style={s.botBottom}>
                        <View>
                          <Text style={s.botVolumeLabel}>24H VOLUME</Text>
                          <Text style={s.botVolumeValue}>{bot.messageCount ?? 0} <Text style={s.botVolumeSuffix}>msgs</Text></Text>
                        </View>
                        <Pressable
                          style={({ pressed }) => [s.builderBtn, pressed && { opacity: 0.8 }]}
                          onPress={() => router.push(`/builder/${bot.id}` as any)}
                        >
                          <Feather name="grid" size={14} color="#EBEBF2" />
                          <Text style={s.builderBtnText}>Builder</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })}
              </>
            )}

            {activePlan ? (
              <Pressable
                style={({ pressed }) => [s.planCard, pressed && { opacity: 0.9 }]}
                onPress={() => router.push("/(tabs)/plans")}
                accessibilityLabel="Ver detalhes do plano"
                accessibilityRole="button"
              >
                <View style={s.planTop}>
                  <View style={s.planIconWrap}>
                    <Feather name="credit-card" size={18} color="#A78BFA" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.planTitle}>{activePlan}</Text>
                    <Text style={s.planSub}>
                      {daysLeft === null
                        ? "Plano ativo"
                        : daysLeft === 0
                        ? "Expira hoje"
                        : `Expira em ${daysLeft} dias`}
                    </Text>
                  </View>
                  <View style={s.planActiveBadge}>
                    <Feather name="check-circle" size={12} color="#22C55E" />
                    <Text style={s.planActiveText}>ATIVO</Text>
                  </View>
                </View>
                <View style={s.meterSection}>
                  <View style={s.meterHeader}>
                    <Text style={s.meterLabel}>Mensagens hoje</Text>
                    <Text style={s.meterValue}>{formatNum(msgs)}</Text>
                  </View>
                  <View style={s.meterTrack}>
                    <View style={[s.meterFill, { width: `${Math.min((msgs / 1000) * 100, 100)}%` as any }]} />
                  </View>
                </View>
                <View style={s.meterSection}>
                  <View style={s.meterHeader}>
                    <Text style={s.meterLabel}>Bots ativos</Text>
                    <Text style={s.meterValue}>{activeBots} <Text style={s.meterMax}>/ {totalBots} total</Text></Text>
                  </View>
                  <View style={s.meterTrack}>
                    <View style={[s.meterFillGreen, { width: totalBots > 0 ? `${Math.min((activeBots / totalBots) * 100, 100)}%` as any : "0%" }]} />
                  </View>
                </View>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [s.upgradeBanner, pressed && { opacity: 0.85 }]}
                onPress={() => router.push("/(tabs)/plans")}
                accessibilityLabel="Ativar plano"
                accessibilityRole="button"
              >
                <View style={s.upgradeLeft}>
                  <View style={s.upgradeIconWrap}>
                    <Feather name="zap" size={20} color="#A78BFA" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.upgradeTitle}>Ative um plano</Text>
                    <Text style={s.upgradeSub}>Desbloqueie mais grupos e recursos avançados</Text>
                  </View>
                </View>
                <View style={s.upgradeArrow}>
                  <Feather name="arrow-right" size={16} color="#A78BFA" />
                </View>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0C0C11" },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#20202B40",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6D28D930",
    backgroundColor: "#0C0C11",
    alignItems: "center",
    justifyContent: "center",
  },
  headerOnline: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#0C0C11",
  },
  headerTitle: { fontSize: 16, color: "#EBEBF2", fontFamily: "Inter_600SemiBold" },
  headerMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  proBadge: {
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proBadgeText: { fontSize: 10, color: "#A78BFA", fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  headerSub: { fontSize: 11, color: "#8E8E9E", fontFamily: "Inter_400Regular" },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#0C0C11",
  },
  bellBadgeText: {
    fontSize: 9,
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#8E8E9E", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  loader: { paddingVertical: 80, alignItems: "center" },

  createCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  createHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  createIconWrap: {
    padding: 6,
    backgroundColor: "#6D28D915",
    borderRadius: 8,
  },
  createTitle: { fontSize: 17, color: "#EBEBF2", fontFamily: "Inter_600SemiBold" },
  createDesc: { fontSize: 13, color: "#8E8E9E", fontFamily: "Inter_400Regular", lineHeight: 19 },
  platformRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  platformBtn: {
    flex: 1,
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#20202B",
    backgroundColor: "#0C0C11",
  },
  platformIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  platformLabel: { fontSize: 11, color: "#EBEBF2", fontFamily: "Inter_600SemiBold" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    color: "#8E8E9E",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  sectionLink: { fontSize: 12, color: "#6D28D9", fontFamily: "Inter_500Medium" },
  totalBadge: {
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  totalBadgeText: { fontSize: 11, color: "#8E8E9E", fontFamily: "Inter_500Medium" },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  statIconRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statIconWrap: {
    padding: 4,
    backgroundColor: "#20202B",
    borderRadius: 6,
  },
  statCardLabel: { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_500Medium" },
  statValueRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  statBigNum: { fontSize: 28, color: "#EBEBF2", fontFamily: "Inter_700Bold" },
  statSmallNum: { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_500Medium" },
  statGreen: { fontSize: 12, color: "#22C55E", fontFamily: "Inter_600SemiBold" },

  botCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    borderRadius: 16,
    overflow: "hidden",
  },
  botTopGlow: {
    height: 1,
    opacity: 0.4,
  },
  botTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 0,
  },
  botInfo: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  botIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botName: { fontSize: 15, color: "#EBEBF2", fontFamily: "Inter_600SemiBold" },
  botBadgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  platBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  platBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#0C0C11",
    borderWidth: 1,
    borderColor: "#20202B",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, color: "#8E8E9E", fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  botMenuBtn: { padding: 4 },
  botBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 14,
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#20202B60",
  },
  botVolumeLabel: { fontSize: 9, color: "#8E8E9E", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  botVolumeValue: { fontSize: 14, color: "#EBEBF2", fontFamily: "Inter_700Bold", marginTop: 2 },
  botVolumeSuffix: { fontSize: 11, color: "#8E8E9E", fontFamily: "Inter_500Medium" },
  builderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1E1E28",
    borderWidth: 1,
    borderColor: "#20202B",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  builderBtnText: { fontSize: 12, color: "#EBEBF2", fontFamily: "Inter_600SemiBold" },

  planCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "#0C0C11",
    borderWidth: 1,
    borderColor: "#20202B",
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  planTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  planIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    alignItems: "center",
    justifyContent: "center",
  },
  planTitle: { fontSize: 14, color: "#EBEBF2", fontFamily: "Inter_700Bold" },
  planSub: { fontSize: 11, color: "#8E8E9E", fontFamily: "Inter_500Medium", marginTop: 2 },
  planActiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#22C55E15",
    borderWidth: 1,
    borderColor: "#22C55E30",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  planActiveText: { fontSize: 9, color: "#22C55E", fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  meterSection: { gap: 8 },
  meterHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  meterLabel: { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_500Medium" },
  meterValue: { fontSize: 12, color: "#EBEBF2", fontFamily: "Inter_700Bold" },
  meterMax: { color: "#8E8E9E", fontFamily: "Inter_500Medium" },
  meterTrack: {
    height: 5,
    backgroundColor: "#13131D",
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#20202B50",
  },
  meterFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#6D28D9",
  },
  meterFillGreen: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#22C55E",
  },

  upgradeBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#6D28D930",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  upgradeLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  upgradeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  upgradeTitle: {
    fontSize: 15,
    color: "#EBEBF2",
    fontFamily: "Inter_700Bold",
    marginBottom: 3,
  },
  upgradeSub: {
    fontSize: 12,
    color: "#8E8E9E",
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  upgradeArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
