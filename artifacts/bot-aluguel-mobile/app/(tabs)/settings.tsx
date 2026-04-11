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

function RowItem({
  icon, label, value, badge, onPress, last,
}: {
  icon: string;
  label: string;
  value?: string;
  badge?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [s.row, !last && s.rowBorder, { opacity: pressed && onPress ? 0.75 : 1 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={s.rowIconWrap}>
        <Feather name={icon as any} size={16} color="#7C3AED" />
      </View>
      <Text style={s.rowLabel}>{label}</Text>
      {badge ? (
        <View style={s.badgeWrap}>
          <Text style={s.badgeText}>{badge}</Text>
        </View>
      ) : value ? (
        <Text style={s.rowValue}>{value}</Text>
      ) : null}
      {onPress && <Feather name="chevron-right" size={16} color="#555566" style={{ marginLeft: 2 }} />}
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
        <Text style={s.title}>Configuracoes</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={s.userCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{user?.name ?? "Usuário"}</Text>
            {user?.phone ? (
              <Text style={s.userPhone}>
                <Feather name="phone" size={11} color="#555566" /> {user.phone}
              </Text>
            ) : null}
          </View>
          <Pressable style={s.gearBtn} onPress={() => {}}>
            <Feather name="settings" size={18} color="#555566" />
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { marginRight: 8 }]}>
            <View style={s.statIconRow}>
              <Feather name="zap" size={14} color="#7C3AED" />
              <Text style={s.statLabel}>SALDO</Text>
            </View>
            <Text style={s.statValue}>{coins}</Text>
            <Text style={s.statSub}>Moedas disponiveis</Text>
          </View>
          <View style={s.statCard}>
            <View style={s.statIconRow}>
              <Feather name="credit-card" size={14} color="#7C3AED" />
              <Text style={s.statLabel}>PLANO</Text>
            </View>
            <Text style={[s.statValue, { fontSize: planName.length > 8 ? 18 : 22 }]}>{planName}</Text>
            <Text style={s.statSub}>Ativo no momento</Text>
          </View>
        </View>

        {/* Sua Conta */}
        <Text style={s.sectionLabel}>SUA CONTA</Text>
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

        {/* Preferencias */}
        <Text style={s.sectionLabel}>PREFERENCIAS</Text>
        <View style={s.card}>
          <RowItem icon="bell" label="Notificacoes" value="Ativadas" />
          <RowItem icon="moon" label="Tema Escuro" value="Sistema" />
          <RowItem icon="shield" label="Privacidade e Seguranca" onPress={() => {}} />
          <RowItem icon="help-circle" label="Central de Ajuda" onPress={() => {}} last />
        </View>

        {/* Sair */}
        <Pressable
          style={({ pressed }) => [s.logoutBtn, { opacity: pressed ? 0.75 : 1 }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={16} color="#F0F0F5" />
          <Text style={s.logoutText}>Sair da Conta</Text>
        </Pressable>

        <Text style={s.version}>BOTALUGUEL PRO V1.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F0F14" },

  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 24, color: "#F0F0F5", fontFamily: "Inter_700Bold" },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    padding: 16,
    marginBottom: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2A2A40",
    borderWidth: 1,
    borderColor: "#6D28D930",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, color: "#A78BFA", fontFamily: "Inter_700Bold" },
  userName: { fontSize: 17, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  userPhone: { fontSize: 12, color: "#555566", fontFamily: "Inter_400Regular", marginTop: 3 },
  gearBtn: { padding: 6 },

  statsRow: { flexDirection: "row", marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    padding: 16,
    gap: 4,
  },
  statIconRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  statLabel: { fontSize: 10, color: "#555566", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  statValue: { fontSize: 22, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  statSub: { fontSize: 11, color: "#7C3AED", fontFamily: "Inter_400Regular" },

  sectionLabel: {
    fontSize: 11,
    color: "#555566",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: 10,
    paddingLeft: 2,
  },

  card: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
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
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2A2A3560" },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#6D28D912",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, color: "#D1D1DB", fontFamily: "Inter_500Medium" },
  rowValue: { fontSize: 13, color: "#555566", fontFamily: "Inter_400Regular" },

  badgeWrap: {
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, color: "#A78BFA", fontFamily: "Inter_600SemiBold" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A35",
    paddingVertical: 15,
    marginBottom: 24,
  },
  logoutText: { fontSize: 15, color: "#F0F0F5", fontFamily: "Inter_600SemiBold" },

  version: {
    textAlign: "center",
    fontSize: 11,
    color: "#333344",
    fontFamily: "Inter_400Regular",
    letterSpacing: 1,
    marginBottom: 8,
  },
});
