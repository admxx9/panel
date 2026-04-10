import { useGetDashboardStats } from "@workspace/api-client-react";
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

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <View style={[s.statCard, { borderLeftColor: color }]}>
      <View style={[s.statIconWrap, { backgroundColor: color + "20" }]}>
        <Feather name={icon as any} size={16} color={color} />
      </View>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, desc, onPress }: { icon: string; label: string; desc: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [s.quickAction, { opacity: pressed ? 0.7 : 1 }]}
      onPress={onPress}
    >
      <View style={s.qaIconWrap}>
        <Feather name={icon as any} size={18} color="#F97316" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.qaLabel}>{label}</Text>
        <Text style={s.qaDesc}>{desc}</Text>
      </View>
      <Feather name="chevron-right" size={16} color="#2A2B3E" />
    </Pressable>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useGetDashboardStats();

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 80;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={{ paddingTop, paddingBottom }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F97316" />
      }
    >
      <View style={s.topBar}>
        <View>
          <Text style={s.topLabel}>BotAluguel.Pro</Text>
          <Text style={s.topUser}>{user?.name?.split(" ")[0] ?? "Usuário"}</Text>
        </View>
        <View style={s.coinsBadge}>
          <Feather name="dollar-sign" size={12} color="#F97316" />
          <Text style={s.coinsText}>{isLoading ? "—" : (data?.coins ?? user?.coins ?? 0)}</Text>
          <Text style={s.coinsMoedas}>moedas</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={s.loader}>
          <ActivityIndicator color="#F97316" />
        </View>
      ) : (
        <>
          <View style={s.planRow}>
            <View style={s.planLeft}>
              <Text style={s.planSub}>PLANO ATIVO</Text>
              <Text style={s.planName}>{data?.activePlan ?? "Nenhum"}</Text>
              {data?.planExpiresAt ? (
                <Text style={s.planExp}>Expira {new Date(data.planExpiresAt).toLocaleDateString("pt-BR")}</Text>
              ) : (
                <Text style={s.planExp}>Sem plano ativo</Text>
              )}
            </View>
            <Pressable style={s.planBtn} onPress={() => router.push("/(tabs)/plans")}>
              <Text style={s.planBtnText}>Planos</Text>
            </Pressable>
          </View>

          <View style={s.sectionLabel}>
            <Text style={s.sectionText}>ESTATÍSTICAS</Text>
          </View>

          <View style={s.statsGrid}>
            <StatCard label="Total de Bots" value={data?.totalBots ?? 0} icon="cpu" color="#F97316" />
            <StatCard label="Bots Ativos" value={data?.activeBots ?? 0} icon="wifi" color="#22C55E" />
            <StatCard label="Mensagens" value={data?.totalMessages ?? 0} icon="message-square" color="#C850C0" />
            <StatCard label="Moedas" value={data?.coins ?? 0} icon="dollar-sign" color="#F59E0B" />
          </View>

          <View style={s.sectionLabel}>
            <Text style={s.sectionText}>ACESSO RÁPIDO</Text>
          </View>

          <View style={s.quickActions}>
            <QuickAction
              icon="cpu"
              label="Meus Bots"
              desc="Gerenciar bots conectados"
              onPress={() => router.push("/(tabs)/bots")}
            />
            <View style={s.qaDivider} />
            <QuickAction
              icon="dollar-sign"
              label="Comprar Moedas"
              desc="Recarregar via PIX"
              onPress={() => router.push("/(tabs)/payments")}
            />
            <View style={s.qaDivider} />
            <QuickAction
              icon="star"
              label="Ver Planos"
              desc="Ativar ou mudar plano"
              onPress={() => router.push("/(tabs)/plans")}
            />
          </View>

          <View style={s.sectionLabel}>
            <Text style={s.sectionText}>ATIVIDADE RECENTE</Text>
          </View>

          <View style={s.activityCard}>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.slice(0, 6).map((item, i) => (
                <View key={item.id}>
                  <View style={s.activityRow}>
                    <View style={s.activityDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.activityDesc}>{item.description}</Text>
                      <Text style={s.activityDate}>
                        {new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </View>
                  </View>
                  {i < (data.recentActivity.length - 1) && i < 5 && <View style={s.actLine} />}
                </View>
              ))
            ) : (
              <View style={s.emptyAct}>
                <Feather name="activity" size={24} color="#2A2B3E" />
                <Text style={s.emptyActText}>Nenhuma atividade ainda</Text>
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090A0F" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  topLabel: { fontSize: 11, color: "#4B4C6B", fontFamily: "Inter_400Regular", letterSpacing: 0.3 },
  topUser: { fontSize: 22, fontWeight: "800" as const, color: "#F1F2F6", fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginTop: 2 },

  coinsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0D0E16",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1A1B28",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  coinsText: { fontSize: 16, fontWeight: "700" as const, color: "#F97316", fontFamily: "Inter_700Bold" },
  coinsMoedas: { fontSize: 10, color: "#4B4C6B", fontFamily: "Inter_400Regular", marginTop: 1 },

  planRow: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    borderLeftWidth: 3,
    borderLeftColor: "#F97316",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planLeft: { flex: 1 },
  planSub: { fontSize: 9, color: "#4B4C6B", fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 4 },
  planName: { fontSize: 18, fontWeight: "700" as const, color: "#F1F2F6", fontFamily: "Inter_700Bold" },
  planExp: { fontSize: 11, color: "#4B4C6B", fontFamily: "Inter_400Regular", marginTop: 2 },
  planBtn: {
    backgroundColor: "#F97316",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  planBtnText: { color: "#FFF", fontSize: 12, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },

  sectionLabel: { paddingHorizontal: 20, marginBottom: 10 },
  sectionText: { fontSize: 10, color: "#4B4C6B", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap" as const,
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    borderLeftWidth: 3,
    padding: 14,
    gap: 8,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 24, fontWeight: "800" as const, color: "#F1F2F6", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, color: "#4B4C6B", fontFamily: "Inter_400Regular" },

  quickActions: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    overflow: "hidden" as const,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  qaIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F9731618",
    alignItems: "center",
    justifyContent: "center",
  },
  qaLabel: { fontSize: 14, fontWeight: "600" as const, color: "#E1E2F0", fontFamily: "Inter_600SemiBold" },
  qaDesc: { fontSize: 11, color: "#4B4C6B", fontFamily: "Inter_400Regular", marginTop: 2 },
  qaDivider: { height: 1, backgroundColor: "#1A1B28", marginLeft: 66 },

  activityCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    padding: 16,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F97316",
    marginTop: 5,
  },
  actLine: { width: 1, height: 8, backgroundColor: "#1A1B28", marginLeft: 3.5 },
  activityDesc: { fontSize: 13, color: "#C9CADB", fontFamily: "Inter_400Regular", lineHeight: 18 },
  activityDate: { fontSize: 11, color: "#4B4C6B", fontFamily: "Inter_400Regular", marginTop: 3 },

  emptyAct: { alignItems: "center", gap: 10, paddingVertical: 24 },
  emptyActText: { fontSize: 13, color: "#2A2B3E", fontFamily: "Inter_400Regular" },

  loader: { paddingVertical: 60, alignItems: "center" },
});
