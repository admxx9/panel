import {
  useAdminGetStats,
  useAdminListPayments,
  useAdminListUsers,
} from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "#F59E0B" },
  paid:    { label: "Pago",     color: "#22C55E" },
  expired: { label: "Expirado", color: "#4B4C6B" },
  error:   { label: "Erro",     color: "#EF4444" },
};

type Tab = "users" | "payments";

const STAT_ITEMS = (stats: any) => [
  { label: "Usuários",   value: stats.totalUsers,                      icon: "users",       color: "#F97316" },
  { label: "Total Bots", value: stats.totalBots,                       icon: "cpu",         color: "#C850C0" },
  { label: "Bots Ativ.", value: stats.activeBots,                      icon: "zap",         color: "#22C55E" },
  { label: "Receita",    value: `R$${stats.totalRevenue.toFixed(0)}`,  icon: "dollar-sign", color: "#3B82F6" },
  { label: "PIX Pend.",  value: stats.pendingPayments,                 icon: "clock",       color: "#F59E0B" },
  { label: "Planos",     value: stats.totalPlans,                      icon: "star",        color: "#8B5CF6" },
];

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("users");

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminGetStats();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useAdminListUsers();
  const { data: payments, isLoading: paymentsLoading, refetch: refetchPayments } = useAdminListPayments();

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 80;

  function refetchAll() { refetchStats(); refetchUsers(); refetchPayments(); }

  if (!user?.isAdmin) {
    return (
      <View style={[s.center, { paddingTop: paddingTop + 32 }]}>
        <View style={s.noAccessIcon}>
          <Feather name="shield-off" size={28} color="#2A2B3E" />
        </View>
        <Text style={s.noAccessTitle}>Acesso restrito</Text>
        <Text style={s.noAccessSub}>Área exclusiva para administradores</Text>
      </View>
    );
  }

  const userList = (users as any[] | undefined) ?? [];
  const paymentList = (payments as any[] | undefined) ?? [];

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={{ paddingTop, paddingBottom, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetchAll} tintColor="#F97316" />}
    >
      <View style={s.topBar}>
        <Text style={s.pageLabel}>PLATAFORMA</Text>
        <Text style={s.pageTitle}>Painel Admin</Text>
      </View>

      {statsLoading ? (
        <View style={s.loader}><ActivityIndicator color="#F97316" /></View>
      ) : stats && (
        <View style={s.statsGrid}>
          {STAT_ITEMS(stats).map((item) => (
            <View key={item.label} style={[s.statCard, { borderLeftColor: item.color }]}>
              <Feather name={item.icon as any} size={14} color={item.color} />
              <Text style={[s.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={s.tabBar}>
        {(["users", "payments"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            style={[s.tabBtn, tab === t && s.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === "users" ? "Usuários" : "Pagamentos"}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "users" && (
        usersLoading ? (
          <View style={s.loader}><ActivityIndicator color="#F97316" /></View>
        ) : (
          <View style={s.listCard}>
            {userList.length === 0 ? (
              <View style={s.emptyBox}><Text style={s.emptyText}>Nenhum usuário</Text></View>
            ) : userList.map((u: any, i: number) => (
              <View key={u.id} style={[s.listRow, i < userList.length - 1 && s.listRowBorder]}>
                <View style={s.userAvatar}>
                  <Text style={s.userInitial}>{u.name?.[0]?.toUpperCase() ?? "?"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{u.name}</Text>
                  <Text style={s.rowSub}>{u.phone} · {u.coins} moedas</Text>
                </View>
                {u.isAdmin && (
                  <View style={s.adminBadge}>
                    <Text style={s.adminBadgeText}>Admin</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )
      )}

      {tab === "payments" && (
        paymentsLoading ? (
          <View style={s.loader}><ActivityIndicator color="#F97316" /></View>
        ) : (
          <View style={s.listCard}>
            {paymentList.length === 0 ? (
              <View style={s.emptyBox}><Text style={s.emptyText}>Nenhum pagamento</Text></View>
            ) : paymentList.map((p: any, i: number) => {
              const cfg = STATUS_LABELS[p.status] ?? STATUS_LABELS.pending;
              const date = new Date(p.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
              return (
                <View key={p.id} style={[s.listRow, i < paymentList.length - 1 && s.listRowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowTitle}>+{p.coins} moedas</Text>
                    <Text style={s.rowSub}>R$ {p.amount.toFixed(2)} · {date}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: cfg.color + "15", borderColor: cfg.color + "30" }]}>
                    <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090A0F" },

  center: { flex: 1, backgroundColor: "#090A0F", alignItems: "center", gap: 10, padding: 40 },
  noAccessIcon: {
    width: 60, height: 60, borderRadius: 12, backgroundColor: "#0D0E16",
    borderWidth: 1, borderColor: "#1A1B28", alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  noAccessTitle: { fontSize: 18, fontWeight: "700" as const, color: "#C9CADB", fontFamily: "Inter_700Bold" },
  noAccessSub: { fontSize: 13, color: "#4B4C6B", fontFamily: "Inter_400Regular", textAlign: "center" as const },

  topBar: { marginBottom: 20 },
  pageLabel: { fontSize: 10, color: "#4B4C6B", fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 4 },
  pageTitle: { fontSize: 22, fontWeight: "800" as const, color: "#F1F2F6", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },

  loader: { paddingVertical: 32, alignItems: "center" },

  statsGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1,
    minWidth: "28%",
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    borderLeftWidth: 3,
    padding: 10,
    gap: 4,
    alignItems: "flex-start",
  },
  statValue: { fontSize: 18, fontWeight: "800" as const, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, color: "#4B4C6B", fontFamily: "Inter_400Regular" },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#0D0E16",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1A1B28",
    padding: 3,
    gap: 3,
    marginBottom: 12,
  },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 4, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#F97316" },
  tabText: { fontSize: 13, fontWeight: "600" as const, color: "#4B4C6B", fontFamily: "Inter_600SemiBold" },
  tabTextActive: { color: "#FFF" },

  listCard: { backgroundColor: "#0D0E16", borderRadius: 8, borderWidth: 1, borderColor: "#1A1B28", overflow: "hidden" as const },
  listRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: "#1A1B28" },

  userAvatar: {
    width: 32, height: 32, borderRadius: 6,
    backgroundColor: "#F9731620", borderWidth: 1, borderColor: "#F9731630",
    alignItems: "center", justifyContent: "center",
  },
  userInitial: { fontSize: 14, fontWeight: "700" as const, color: "#F97316", fontFamily: "Inter_700Bold" },
  rowTitle: { fontSize: 13, fontWeight: "600" as const, color: "#C9CADB", fontFamily: "Inter_600SemiBold" },
  rowSub: { fontSize: 11, color: "#4B4C6B", fontFamily: "Inter_400Regular", marginTop: 2 },
  adminBadge: { backgroundColor: "#C850C015", borderRadius: 4, borderWidth: 1, borderColor: "#C850C030", paddingHorizontal: 8, paddingVertical: 3 },
  adminBadgeText: { fontSize: 10, fontWeight: "700" as const, color: "#C850C0", fontFamily: "Inter_700Bold" },
  statusBadge: { borderRadius: 4, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  emptyBox: { paddingVertical: 24, alignItems: "center" },
  emptyText: { fontSize: 13, color: "#4B4C6B", fontFamily: "Inter_400Regular" },
});
