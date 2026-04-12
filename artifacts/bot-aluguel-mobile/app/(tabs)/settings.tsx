import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
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
  label: string;
  value?: string;
  badge?: string;
  onPress?: () => void;
  last?: boolean;
};

function RowItem({ icon, label, value, badge, onPress, last }: RowProps) {
  return (
    <Pressable
      style={({ pressed }) => [s.row, !last && s.rowBorder, { opacity: pressed && onPress ? 0.72 : 1 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={s.rowIconWrap}>
        <Feather name={icon as any} size={15} color="#A78BFA" />
      </View>
      <Text style={s.rowLabel}>{label}</Text>
      {badge ? (
        <View style={s.badgeWrap}>
          <Text style={s.badgeText}>{badge}</Text>
        </View>
      ) : value ? (
        <Text style={s.rowValue}>{value}</Text>
      ) : null}
      {onPress && <Feather name="chevron-right" size={15} color="#8E8E9E" style={{ marginLeft: 2 }} />}
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

  async function doLogout() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await signOut();
    router.replace("/(auth)/login");
  }

  function handleLogout() {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Deseja encerrar a sessão?");
      if (confirmed) doLogout();
    } else {
      Alert.alert("Sair da Conta", "Deseja encerrar a sessão?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: doLogout },
      ]);
    }
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
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{user?.name ?? "Usuário"}</Text>
            <View style={s.phoneRow}>
              <Feather name="phone" size={11} color="#8E8E9E" />
              <Text style={s.userPhone}>{user?.phone ?? "—"}</Text>
            </View>
          </View>
          <Pressable style={s.gearBtn} onPress={() => {}}>
            <Feather name="settings" size={17} color="#8E8E9E" />
          </Pressable>
        </View>

        {/* ── Stat Cards ── */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { marginRight: 10 }]}>
            <View style={s.statIconRow}>
              <View style={s.statIconWrap}>
                <Feather name="zap" size={13} color="#EBEBF2" />
              </View>
              <Text style={s.statLabel}>SALDO</Text>
            </View>
            <Text style={s.statValue}>{coins}</Text>
            <Text style={s.statSub}>Moedas disponíveis</Text>
          </View>
          <View style={s.statCard}>
            <View style={s.statIconRow}>
              <View style={s.statIconWrap}>
                <Feather name="credit-card" size={13} color="#EBEBF2" />
              </View>
              <Text style={s.statLabel}>PLANO</Text>
            </View>
            <Text style={[s.statValue, { fontSize: planName.length > 8 ? 17 : 22, color: "#A78BFA" }]}>
              {planName}
            </Text>
            <Text style={s.statSub}>
              {planName === "Gratuito" ? "Não há nenhum" : "Ativo no momento"}
            </Text>
          </View>
        </View>

        {/* ── SUA CONTA ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>SUA CONTA</Text>
        </View>
        <View style={s.card}>
          <RowItem
            icon="message-square"
            label="Meus Bots"
            badge={activeBots > 0 ? `${activeBots} Ativo${activeBots !== 1 ? "s" : ""}` : undefined}
            onPress={() => router.push("/(tabs)/bots")}
          />
          <RowItem
            icon="zap"
            label="Comprar Moedas"
            onPress={() => router.push("/(tabs)/payments")}
          />
          <RowItem
            icon="credit-card"
            label="Ver Planos"
            onPress={() => router.push("/(tabs)/payments")}
            last
          />
        </View>

        {/* ── PREFERENCIAS ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>PREFERENCIAS</Text>
        </View>
        <View style={s.card}>
          <RowItem icon="bell"        label="Notificações"     value="Ativadas" />
          <RowItem icon="shield"      label="Privacidade"      onPress={() => {}} />
          <RowItem icon="help-circle" label="Central de Ajuda" onPress={() => {}} last />
        </View>

        {/* ── Logout ── */}
        <Pressable
          style={({ pressed }) => [s.logoutBtn, { opacity: pressed ? 0.75 : 1 }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={16} color="#8E8E9E" />
          <Text style={s.logoutText}>Sair da conta</Text>
        </Pressable>

        <Text style={s.version}>BOTALUGUEL PRO V1.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0C0C11" },

  topBar: { paddingHorizontal: 20, paddingBottom: 14 },
  title:  { fontSize: 24, color: "#EBEBF2", fontFamily: "Inter_700Bold", letterSpacing: -0.3 },

  /* User Card */
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#13131D",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#20202B",
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText:  { fontSize: 20, color: "#A78BFA", fontFamily: "Inter_700Bold" },
  userName:    { fontSize: 16, color: "#EBEBF2", fontFamily: "Inter_700Bold" },
  phoneRow:    { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  userPhone:   { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_400Regular" },
  gearBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Stat Cards */
  statsRow: { flexDirection: "row", marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  statIconRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  statIconWrap: {
    padding: 5,
    backgroundColor: "#20202B",
    borderRadius: 7,
  },
  statLabel: {
    fontSize: 10,
    color: "#8E8E9E",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  statValue: { fontSize: 24, color: "#EBEBF2", fontFamily: "Inter_700Bold" },
  statSub:   { fontSize: 11, color: "#8E8E9E", fontFamily: "Inter_400Regular" },

  /* Section */
  sectionHeader: { marginBottom: 10, paddingLeft: 2 },
  sectionLabel: {
    fontSize: 11,
    color: "#8E8E9E",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },

  /* Card + Rows */
  card: {
    backgroundColor: "#13131D",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#20202B",
    overflow: "hidden",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#20202B60" },
  rowIconWrap: {
    width: 34, height: 34,
    borderRadius: 10,
    backgroundColor: "#6D28D912",
    borderWidth: 1,
    borderColor: "#6D28D920",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowLabel: { flex: 1, fontSize: 14, color: "#D1D1DB", fontFamily: "Inter_500Medium" },
  rowValue: { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_400Regular" },

  badgeWrap: {
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, color: "#A78BFA", fontFamily: "Inter_600SemiBold" },

  /* Logout */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 15,
    marginBottom: 24,
  },
  logoutText: { fontSize: 15, color: "#8E8E9E", fontFamily: "Inter_600SemiBold" },

  version: {
    textAlign: "center",
    fontSize: 10,
    color: "#20202B",
    fontFamily: "Inter_400Regular",
    letterSpacing: 2,
    marginBottom: 8,
  },
});
