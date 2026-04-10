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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionCard}>
        {children}
      </View>
    </View>
  );
}

function Row({
  icon, label, value, onPress, destructive, last,
}: {
  icon: string; label: string; value?: string; onPress?: () => void; destructive?: boolean; last?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [s.row, !last && s.rowBorder, { opacity: pressed && onPress ? 0.7 : 1 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[s.rowIcon, { backgroundColor: destructive ? "#EF444415" : "#F9731615" }]}>
        <Feather name={icon as any} size={15} color={destructive ? "#EF4444" : "#F97316"} />
      </View>
      <Text style={[s.rowLabel, destructive && { color: "#EF4444" }]}>{label}</Text>
      {value ? (
        <Text style={s.rowValue}>{value}</Text>
      ) : onPress ? (
        <Feather name="chevron-right" size={14} color="#2A2B3E" />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 80;

  const initial = user?.name?.charAt(0).toUpperCase() ?? "U";

  function handleLogout() {
    Alert.alert("Sair", "Deseja encerrar a sessão?", [
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
    <ScrollView
      style={s.root}
      contentContainerStyle={{ paddingTop, paddingBottom, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.topBar}>
        <Text style={s.pageLabel}>CONTA</Text>
        <Text style={s.pageTitle}>Configurações</Text>
      </View>

      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.profileName}>{user?.name ?? "Usuário"}</Text>
          <Text style={s.profilePhone}>{user?.phone ?? "—"}</Text>
        </View>
        <View style={[s.planTag, user?.isAdmin && { borderColor: "#C850C0", backgroundColor: "#C850C015" }]}>
          <Text style={[s.planTagText, user?.isAdmin && { color: "#C850C0" }]}>
            {user?.isAdmin ? "ADMIN" : user?.plan ?? "SEM PLANO"}
          </Text>
        </View>
      </View>

      <Section title="CONTA">
        <Row icon="dollar-sign" label="Moedas disponíveis" value={`${user?.coins ?? 0}`} />
        <Row icon="star" label="Plano atual" value={user?.plan ?? "Nenhum"} last />
      </Section>

      <Section title="NAVEGAÇÃO">
        <Row icon="cpu" label="Meus Bots" onPress={() => router.push("/(tabs)/bots")} />
        <Row icon="dollar-sign" label="Comprar Moedas" onPress={() => router.push("/(tabs)/payments")} />
        <Row icon="star" label="Ver Planos" onPress={() => router.push("/(tabs)/plans")} last />
      </Section>

      <Section title="SESSÃO">
        <Row icon="log-out" label="Sair da conta" onPress={handleLogout} destructive last />
      </Section>

      <Text style={s.version}>BotAluguel Pro v1.0</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090A0F" },

  topBar: { marginBottom: 20 },
  pageLabel: { fontSize: 10, color: "#4B4C6B", fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 4 },
  pageTitle: { fontSize: 22, fontWeight: "800" as const, color: "#F1F2F6", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    borderLeftWidth: 3,
    borderLeftColor: "#F97316",
    padding: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F9731620",
    borderWidth: 1,
    borderColor: "#F9731630",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "800" as const, color: "#F97316", fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 15, fontWeight: "600" as const, color: "#F1F2F6", fontFamily: "Inter_600SemiBold" },
  profilePhone: { fontSize: 12, color: "#4B4C6B", fontFamily: "Inter_400Regular", marginTop: 2 },
  planTag: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#F9731640",
    backgroundColor: "#F9731615",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  planTagText: { fontSize: 9, fontWeight: "700" as const, color: "#F97316", fontFamily: "Inter_700Bold", letterSpacing: 0.5 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 9, fontWeight: "600" as const, color: "#2A2B3E", fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 8, paddingLeft: 2 },
  sectionCard: { backgroundColor: "#0D0E16", borderRadius: 8, borderWidth: 1, borderColor: "#1A1B28", overflow: "hidden" as const },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#1A1B28" },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 14, color: "#C9CADB", fontFamily: "Inter_400Regular" },
  rowValue: { fontSize: 13, color: "#4B4C6B", fontFamily: "Inter_400Regular" },

  version: { textAlign: "center", fontSize: 11, color: "#1A1B28", fontFamily: "Inter_400Regular", marginTop: 8 },
});
