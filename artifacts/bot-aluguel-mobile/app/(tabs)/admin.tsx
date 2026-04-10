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

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente", color: "#F59E0B", bg: "#F59E0B15" },
  paid:    { label: "Pago",     color: "#22C55E", bg: "#22C55E15" },
  expired: { label: "Expirado", color: "#9CA3AF", bg: "#9CA3AF15" },
  error:   { label: "Erro",     color: "#EF4444", bg: "#EF444415" },
};

type Tab = "users" | "payments";

const STAT_ITEMS = (stats: any) => [
  { label: "Usuários",   value: stats.totalUsers,                      icon: "users",       color: "#6D28D9" },
  { label: "Total Bots", value: stats.totalBots,                       icon: "cpu",         color: "#6D28D9" },
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

  const paddingBottom = Platform.OS === "web" ? 34 + 110 : insets.bottom + 110;
  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;

  function refetchAll() { refetchStats(); refetchUsers(); refetchPayments(); }

  if (!user?.isAdmin) {
    return (
      <View style={s.center}>
        <View style={s.noAccessIcon}>
          <Feather name="shield-off" size={28} color="#A0A0B0" />
        </View>
        <Text style={s.noAccessTitle}>Acesso restrito</Text>
        <Text style={s.noAccessSub}>Área exclusiva para administradores</Text>
      </View>
    );
  }

  const userList = (users as any[] | undefined) ?? [];
  const paymentList = (payments as any[] | undefined) ?? [];

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop }]}>
        <Text style={s.headerTitle}>Painel Admin</Text>
        <Text style={s.headerSub}>Gerenciar plataforma</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetchAll} tintColor="#6D28D9" />}
      >
        {statsLoading ? (
          <View style={s.loader}><ActivityIndicator color="#6D28D9" /></View>
        ) : stats && (
          <View style={s.statsGrid}>
            {STAT_ITEMS(stats).map((item) => (
              <View key={item.label} style={s.statCard}>
                <View style={[s.statIconWrap, { backgroundColor: item.color + "15" }]}>
                  <Feather name={item.icon as any} size={16} color={item.color} />
                </View>
                <Text style={s.statValue}>{item.value}</Text>
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
            <View style={s.loader}><ActivityIndicator color="#6D28D9" /></View>
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
            <View style={s.loader}><ActivityIndicator color="#6D28D9" /></View>
          ) : (
            <View style={s.listCard}>
              {paymentList.length === 0 ? (
                <View style={s.emptyBox}><Text style={s.emptyText}>Nenhum pagamento</Text></View>
              ) : paymentList.map((p: any, i: number) => {
                const cfg = STATUS_LABELS[p.status] ?? STATUS_LABELS.pending;
                const date = new Date(p.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
                return (
                  <View key={p.id} style={[s.listRow, i < paymentList.length - 1 && s.listRowBorder]}>
                    <View style={s.payIcon}>
                      <Feather name="dollar-sign" size={14} color="#A78BFA" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowTitle}>+{p.coins} moedas</Text>
                      <Text style={s.rowSub}>R$ {p.amount.toFixed(2)} · {date}</Text>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + "30" }]}>
                      <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F0F14" },

  center: { flex: 1, backgroundColor: "#0F0F14", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  noAccessIcon: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: "#1A1A24",
    borderWidth: 1, borderColor: "#2A2A35",
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  noAccessTitle: { fontSize: 18, color: "#D1D1DB", fontFamily: "Inter_700Bold" },
  noAccessSub: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_400Regular", textAlign: "center" },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2A2A3540",
  },
  headerTitle: { fontSize: 22, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 4 },

  loader: { paddingVertical: 32, alignItems: "center" },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    minWidth: "28%",
    backgroundColor: "#1A1A24",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A35",
    padding: 14,
    gap: 6,
    alignItems: "flex-start",
  },
  statIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  statValue: { fontSize: 18, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, color: "#A0A0B0", fontFamily: "Inter_400Regular" },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1A1A24",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A35",
    padding: 4,
    gap: 4,
    marginBottom: 14,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#6D28D9" },
  tabText: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_600SemiBold" },
  tabTextActive: { color: "#FFF" },

  listCard: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    overflow: "hidden",
  },
  listRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  listRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2A2A3560" },

  userAvatar: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    alignItems: "center", justifyContent: "center",
  },
  userInitial: { fontSize: 15, color: "#A78BFA", fontFamily: "Inter_700Bold" },
  payIcon: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: "#6D28D915",
    alignItems: "center", justifyContent: "center",
  },
  rowTitle: { fontSize: 14, color: "#F0F0F5", fontFamily: "Inter_600SemiBold" },
  rowSub: { fontSize: 12, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 2 },
  adminBadge: {
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  adminBadgeText: { fontSize: 11, color: "#A78BFA", fontFamily: "Inter_700Bold" },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  emptyBox: { paddingVertical: 30, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_400Regular" },
});
