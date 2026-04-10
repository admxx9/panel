import { useGetDashboardStats } from "@workspace/api-client-react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
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

const { width: SCREEN_W } = Dimensions.get("window");

const quickActions = [
  { icon: "cpu", label: "Criar Bot", route: "/(tabs)/bots" },
  { icon: "tool", label: "Builder", route: "/(tabs)/bots" },
  { icon: "dollar-sign", label: "Moedas", route: "/(tabs)/payments" },
  { icon: "star", label: "Planos", route: "/(tabs)/plans" },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useGetDashboardStats();

  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C3AED" />
        }
      >
        <LinearGradient colors={["#7C3AED", "#6D28D9", "#5B21B6"]} style={[s.header, { paddingTop: insets.top + 12 }]}>
          <View style={s.headerRow}>
            <View style={s.avatarWrap}>
              <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? "U"}</Text>
            </View>
            <View style={s.searchBar}>
              <Feather name="search" size={16} color="#FFFFFF90" />
              <Text style={s.searchText}>Buscar</Text>
            </View>
            <Pressable style={s.headerIcon}>
              <Feather name="help-circle" size={20} color="#FFFFFFCC" />
            </Pressable>
            <Pressable style={s.headerIcon}>
              <Feather name="bell" size={20} color="#FFFFFFCC" />
            </Pressable>
          </View>

          <View style={s.balanceCard}>
            <View style={s.balanceTop}>
              <Text style={s.balanceLabel}>Saldo em moedas</Text>
              <Pressable onPress={() => router.push("/(tabs)/payments")}>
                <Text style={s.balanceLink}>Ver extrato &gt;</Text>
              </Pressable>
            </View>
            <Text style={s.balanceValue}>
              {isLoading ? "—" : (data?.coins ?? user?.coins ?? 0).toLocaleString("pt-BR")}
            </Text>
            <Text style={s.balanceSub}>moedas disponíveis</Text>

            <View style={s.balanceDivider} />

            <View style={s.planInfo}>
              <Feather name="shield" size={14} color="#7C3AED" />
              <Text style={s.planText}>
                Plano: <Text style={s.planBold}>{data?.activePlan ?? "Nenhum"}</Text>
              </Text>
            </View>
          </View>

          <View style={s.dotsRow}>
            <View style={[s.dot, s.dotActive]} />
            <View style={s.dot} />
          </View>
        </LinearGradient>

        {isLoading ? (
          <View style={s.loader}>
            <ActivityIndicator color="#7C3AED" size="large" />
          </View>
        ) : (
          <>
            <View style={s.section}>
              <Text style={s.sectionTitle}>Pro dia a dia</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.actionsRow}>
              {quickActions.map((action) => (
                <Pressable
                  key={action.label}
                  style={({ pressed }) => [s.actionCard, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]}
                  onPress={() => router.push(action.route as any)}
                >
                  <View style={s.actionIconWrap}>
                    <Feather name={action.icon as any} size={22} color="#374151" />
                  </View>
                  <Text style={s.actionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              style={({ pressed }) => [s.featureCard, pressed && { opacity: 0.9 }]}
              onPress={() => router.push("/(tabs)/bots")}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.featureTitle}>Meus Bots</Text>
                <Text style={s.featureSub}>{data?.totalBots ?? 0} bots · {data?.activeBots ?? 0} ativos</Text>
              </View>
              <Feather name="cpu" size={24} color="#9CA3AF" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.featureCard, pressed && { opacity: 0.9 }]}
              onPress={() => router.push("/(tabs)/payments")}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.featureTitle}>Comprar Moedas</Text>
                <Text style={s.featureSub}>Recarregar via PIX</Text>
              </View>
              <Feather name="dollar-sign" size={24} color="#9CA3AF" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.featureCard, pressed && { opacity: 0.9 }]}
              onPress={() => router.push("/(tabs)/plans")}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.featureTitle}>Planos</Text>
                <Text style={s.featureSub}>Veja os melhores planos</Text>
              </View>
              <Feather name="star" size={24} color="#9CA3AF" />
            </Pressable>

            {data?.recentActivity && data.recentActivity.length > 0 && (
              <>
                <View style={[s.section, { marginTop: 8 }]}>
                  <Text style={s.sectionTitle}>Atividade recente</Text>
                </View>
                <View style={s.activityCard}>
                  {data.recentActivity.slice(0, 5).map((item, i) => (
                    <View key={item.id}>
                      <View style={s.activityRow}>
                        <View style={s.activityIconWrap}>
                          <Feather name="activity" size={16} color="#7C3AED" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.activityDesc}>{item.description}</Text>
                          <Text style={s.activityTime}>
                            {new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </Text>
                        </View>
                      </View>
                      {i < data.recentActivity.length - 1 && i < 4 && <View style={s.activityLine} />}
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

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchText: { color: "#FFFFFF90", fontSize: 14, fontFamily: "Inter_400Regular" },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  balanceCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 20,
  },
  balanceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: { color: "#FFFFFFCC", fontSize: 14, fontFamily: "Inter_500Medium" },
  balanceLink: { color: "#FFFFFFCC", fontSize: 13, fontFamily: "Inter_500Medium" },
  balanceValue: { color: "#FFF", fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  balanceSub: { color: "#FFFFFF80", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  balanceDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 14 },
  planInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  planText: { color: "#FFFFFFCC", fontSize: 13, fontFamily: "Inter_400Regular" },
  planBold: { fontFamily: "Inter_700Bold" },

  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive: { backgroundColor: "#FFF" },

  section: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 14 },
  sectionTitle: { fontSize: 18, color: "#1F2937", fontFamily: "Inter_700Bold" },

  actionsRow: { paddingHorizontal: 20, gap: 12 },
  actionCard: {
    width: 90,
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontSize: 12, color: "#374151", fontFamily: "Inter_500Medium", textAlign: "center" },

  featureCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: { fontSize: 16, color: "#1F2937", fontFamily: "Inter_700Bold" },
  featureSub: { fontSize: 13, color: "#9CA3AF", fontFamily: "Inter_400Regular", marginTop: 2 },

  activityCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
  },
  activityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  activityDesc: { fontSize: 14, color: "#374151", fontFamily: "Inter_500Medium", lineHeight: 20 },
  activityTime: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular", marginTop: 2 },
  activityLine: { height: 1, backgroundColor: "#F3F4F6", marginLeft: 48 },

  loader: { paddingVertical: 80, alignItems: "center" },
});
