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
import { useColors } from "@/hooks/useColors";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente", color: "#F59E0B", bg: "#F59E0B20" },
  paid: { label: "Pago", color: "#22C55E", bg: "#22C55E20" },
  expired: { label: "Expirado", color: "#8E8EA0", bg: "#8E8EA020" },
  error: { label: "Erro", color: "#DC2626", bg: "#DC262620" },
};

type Tab = "users" | "payments";

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("users");

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminGetStats();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useAdminListUsers();
  const { data: payments, isLoading: paymentsLoading, refetch: refetchPayments } = useAdminListPayments();

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  function refetchAll() {
    refetchStats();
    refetchUsers();
    refetchPayments();
  }

  if (!user?.isAdmin) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="shield-off" size={48} color={colors.mutedForeground} />
        <Text style={[styles.noAccessTitle, { color: colors.foreground }]}>Acesso restrito</Text>
        <Text style={[styles.noAccessSub, { color: colors.mutedForeground }]}>
          Esta área é exclusiva para administradores
        </Text>
      </View>
    );
  }

  const statItems = stats
    ? [
        { label: "Usuários", value: stats.totalUsers, icon: "users", accent: colors.primary },
        { label: "Total Bots", value: stats.totalBots, icon: "cpu", accent: colors.accent },
        { label: "Bots Ativos", value: stats.activeBots, icon: "wifi", accent: colors.success },
        { label: "Receita", value: `R$ ${stats.totalRevenue.toFixed(2)}`, icon: "dollar-sign", accent: colors.warning },
        { label: "Pend. PIX", value: stats.pendingPayments, icon: "clock", accent: "#F59E0B" },
        { label: "Planos", value: stats.totalPlans, icon: "star", accent: "#F97316" },
      ]
    : [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingTop, paddingBottom }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refetchAll} tintColor={colors.primary} />
      }
    >
      <View style={styles.headerRow}>
        <View style={[styles.headerIcon, { backgroundColor: colors.accent + "20" }]}>
          <Feather name="shield" size={20} color={colors.accent} />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Painel Admin</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Gerenciamento da plataforma
          </Text>
        </View>
      </View>

      {statsLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={styles.statsGrid}>
          {statItems.map((item) => (
            <View
              key={item.label}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.statIcon, { backgroundColor: item.accent + "20" }]}>
                <Feather name={item.icon as any} size={16} color={item.accent} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.tabBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        {(["users", "payments"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            style={[styles.tabBtn, tab === t && { backgroundColor: colors.primary }]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, { color: tab === t ? "#FFF" : colors.mutedForeground }]}>
              {t === "users" ? "Usuários" : "Pagamentos"}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "users" && (
        usersLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : (
          <View style={{ gap: 8 }}>
            {(users ?? []).map((u) => (
              <View key={u.id} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.userAvatar, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={[styles.userInitial, { color: colors.primary }]}>
                    {u.name?.[0]?.toUpperCase() ?? "?"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, { color: colors.foreground }]}>{u.name}</Text>
                  <Text style={[styles.itemSub, { color: colors.mutedForeground }]}>
                    {u.phone} • {u.coins} moedas
                  </Text>
                </View>
                {u.isAdmin && (
                  <View style={[styles.adminBadge, { backgroundColor: colors.primary + "20" }]}>
                    <Text style={[styles.adminBadgeText, { color: colors.primary }]}>Admin</Text>
                  </View>
                )}
              </View>
            ))}
            {(!users || users.length === 0) && (
              <View style={styles.emptyBox}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Nenhum usuário</Text>
              </View>
            )}
          </View>
        )
      )}

      {tab === "payments" && (
        paymentsLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : (
          <View style={{ gap: 8 }}>
            {(payments ?? []).map((p) => {
              const st = STATUS_LABELS[p.status] ?? STATUS_LABELS.pending;
              const date = new Date(p.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <View key={p.id} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: colors.foreground }]}>
                      +{p.coins} moedas
                    </Text>
                    <Text style={[styles.itemSub, { color: colors.mutedForeground }]}>
                      R$ {p.amount.toFixed(2)} • {date}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                  </View>
                </View>
              );
            })}
            {(!payments || payments.length === 0) && (
              <View style={styles.emptyBox}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Nenhum pagamento</Text>
              </View>
            )}
          </View>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  noAccessTitle: { fontSize: 20, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  noAccessSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" as const },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  loader: { paddingVertical: 40, alignItems: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 10 },
  statCard: {
    width: "30%",
    flex: 1,
    minWidth: "28%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  statIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 18, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  tabBar: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  userInitial: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  itemTitle: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  itemSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  adminBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  adminBadgeText: { fontSize: 11, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  emptyBox: { paddingVertical: 24, alignItems: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
