import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useGetDashboardStats, useListBots } from "@workspace/api-client-react";

type RowProps = {
  icon: string;
  iconColor: string;
  label: string;
  value?: string;
  badge?: string;
  onPress?: () => void;
  last?: boolean;
};

function RowItem({ icon, iconColor, label, value, badge, onPress, last }: RowProps) {
  return (
    <Pressable
      style={({ pressed }) => [s.row, !last && s.rowBorder, { opacity: pressed && onPress ? 0.72 : 1 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[s.rowIconWrap, { backgroundColor: iconColor + "18", borderColor: iconColor + "28" }]}>
        <Feather name={icon as any} size={15} color={iconColor} />
      </View>
      <Text style={s.rowLabel}>{label}</Text>
      {badge ? (
        <View style={s.badgeWrap}>
          <Text style={s.badgeText}>{badge}</Text>
        </View>
      ) : value ? (
        <Text style={s.rowValue}>{value}</Text>
      ) : null}
      {onPress && <Feather name="chevron-right" size={15} color="#303040" style={{ marginLeft: 2 }} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { data: stats } = useGetDashboardStats();
  const { data: bots } = useListBots();

  const paddingBottom = Platform.OS === "web" ? 34 + 110 : insets.bottom + 110;
  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;

  const initial = (user?.name ?? "U").charAt(0).toUpperCase();
  const coins = stats?.coins ?? user?.coins ?? 0;
  const planName = stats?.activePlan ?? user?.plan ?? "Gratuito";
  const botList = (bots as any[] | undefined) ?? [];
  const activeBots = botList.filter((b) => b.status === "active" || b.isConnected).length;

  function handleLogout() {
    Alert.alert("Sair da Conta", "Deseja encerrar a sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <View style={s.root}>
      <View style={[s.topBar, { paddingTop }]}>
        <Text style={s.title}>Configurações</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── User Card ── */}
        <View style={s.userCard}>
          <LinearGradient
            colors={["#7C3AED", "#9333EA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.avatar}
          >
            <Text style={s.avatarText}>{initial}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{user?.name ?? "Usuário"}</Text>
            <View style={s.phoneRow}>
              <Feather name="phone" size={11} color="#505060" />
              <Text style={s.userPhone}>{user?.phone ?? "—"}</Text>
            </View>
          </View>
          <Pressable style={s.gearBtn} onPress={() => {}}>
            <Feather name="settings" size={17} color="#505060" />
          </Pressable>
        </View>

        {/* ── Stat Cards ── */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { marginRight: 8 }]}>
            <LinearGradient
              colors={["#7C3AED", "#4F46E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={s.statBar}
            />
            <Text style={s.statLabel}>SALDO</Text>
            <Text style={s.statValue}>{coins}</Text>
            <Text style={s.statSub}>Moedas disponíveis</Text>
          </View>
          <View style={s.statCard}>
            <LinearGradient
              colors={["#A78BFA", "#C026D3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={s.statBar}
            />
            <Text style={s.statLabel}>PLANO</Text>
            <Text style={[s.statValue, { color: "#8B5CF6", fontSize: planName.length > 8 ? 17 : 22 }]}>
              {planName}
            </Text>
            <Text style={s.statSub}>
              {planName === "Gratuito" ? "Não há nenhum" : "Ativo no momento"}
            </Text>
          </View>
        </View>

        {/* ── SUA CONTA ── */}
        <View style={s.sectionHeader}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>SUA CONTA</Text>
        </View>
        <View style={s.card}>
          <RowItem
            icon="message-square"
            iconColor="#7C3AED"
            label="Meus Bots"
            badge={activeBots > 0 ? `${activeBots} Ativo${activeBots !== 1 ? "s" : ""}` : undefined}
            onPress={() => router.push("/(tabs)/bots")}
          />
          <RowItem
            icon="zap"
            iconColor="#F59E0B"
            label="Comprar Moedas"
            onPress={() => router.push("/(tabs)/payments")}
          />
          <RowItem
            icon="credit-card"
            iconColor="#22C55E"
            label="Ver Planos"
            onPress={() => router.push("/(tabs)/payments")}
            last
          />
        </View>

        {/* ── PREFERENCIAS ── */}
        <View style={s.sectionHeader}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>PREFERENCIAS</Text>
        </View>
        <View style={s.card}>
          <RowItem icon="bell"        iconColor="#3B82F6" label="Notificações"        value="Ativadas" />
          <RowItem icon="shield"      iconColor="#EF4444" label="Privacidade"         onPress={() => {}} />
          <RowItem icon="help-circle" iconColor="#6366F1" label="Central de Ajuda"    onPress={() => {}} last />
        </View>

        {/* ── Logout ── */}
        <Pressable
          style={({ pressed }) => [s.logoutBtn, { opacity: pressed ? 0.75 : 1 }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={16} color="#7C3AED" />
          <Text style={s.logoutText}>Sair da conta</Text>
        </Pressable>

        <Text style={s.version}>BOTALUGUEL PRO V1.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#111118" },

  topBar: { paddingHorizontal: 20, paddingBottom: 14 },
  title:  { fontSize: 24, color: "#F0F0F5", fontFamily: "Inter_700Bold", letterSpacing: -0.3 },

  /* User Card */
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#18181F",
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText:  { fontSize: 22, color: "#FFF", fontFamily: "Inter_700Bold" },
  userName:    { fontSize: 17, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  phoneRow:    { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  userPhone:   { fontSize: 12, color: "#505060", fontFamily: "Inter_400Regular" },
  gearBtn: {
    width: 40, height: 40,
    borderRadius: 14,
    backgroundColor: "#111118",
    borderWidth: 1,
    borderColor: "#202028",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Stat Cards */
  statsRow: { flexDirection: "row", marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: "#18181F",
    borderRadius: 24,
    padding: 18,
    overflow: "hidden",
  },
  statBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  statLabel: {
    fontSize: 10,
    color: "#505060",
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 8,
    paddingLeft: 8,
  },
  statValue: {
    fontSize: 28,
    color: "#F0F0F5",
    fontFamily: "Inter_700Bold",
    paddingLeft: 8,
    lineHeight: 32,
  },
  statSub: {
    fontSize: 11,
    color: "#505060",
    fontFamily: "Inter_400Regular",
    marginTop: 6,
    paddingLeft: 8,
  },

  /* Section header */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: "#7C3AED",
  },
  sectionLabel: {
    fontSize: 11,
    color: "#505060",
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },

  /* Card + Rows */
  card: {
    backgroundColor: "#18181F",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#202028" },
  rowIconWrap: {
    width: 36, height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowLabel: { flex: 1, fontSize: 15, color: "#F0F0F5", fontFamily: "Inter_600SemiBold" },
  rowValue: { fontSize: 12, color: "#505060", fontFamily: "Inter_400Regular" },

  badgeWrap: {
    backgroundColor: "#7C3AED18",
    borderWidth: 1,
    borderColor: "#7C3AED28",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, color: "#A78BFA", fontFamily: "Inter_700Bold" },

  /* Logout */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#7C3AED30",
    paddingVertical: 16,
    marginBottom: 20,
  },
  logoutText: { fontSize: 15, color: "#7C3AED", fontFamily: "Inter_700Bold" },

  version: {
    textAlign: "center",
    fontSize: 10,
    color: "#303040",
    fontFamily: "Inter_400Regular",
    letterSpacing: 2,
    marginBottom: 8,
  },
});
