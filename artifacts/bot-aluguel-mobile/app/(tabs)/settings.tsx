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
import { LinearGradient } from "expo-linear-gradient";
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
      <View style={[s.rowIcon, { backgroundColor: destructive ? "#2D0A0A" : "#150F2A" }]}>
        <Feather name={icon as any} size={16} color={destructive ? "#EF4444" : "#6D28D9"} />
      </View>
      <Text style={[s.rowLabel, destructive && { color: "#EF4444" }]}>{label}</Text>
      {value ? (
        <Text style={s.rowValue}>{value}</Text>
      ) : onPress ? (
        <Feather name="chevron-right" size={16} color="#D1D5DB" />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const paddingBottom = Platform.OS === "web" ? 34 + 110 : insets.bottom + 110;
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
    <View style={s.root}>
      <LinearGradient colors={["#6D28D9", "#4C1D95"]} style={[s.header, { paddingTop: insets.top + 16 }]}>
        <View style={s.profileRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{user?.name ?? "Usuário"}</Text>
            <Text style={s.profilePhone}>{user?.phone ?? "—"}</Text>
          </View>
          <View style={s.planTag}>
            <Text style={s.planTagText}>
              {user?.isAdmin ? "ADMIN" : user?.plan ?? "SEM PLANO"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom }}
        showsVerticalScrollIndicator={false}
      >
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
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F0F14" },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "800", color: "#FFF", fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 18, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },
  profilePhone: { fontSize: 13, color: "#FFFFFFBB", fontFamily: "Inter_400Regular", marginTop: 2 },
  planTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  planTagText: { fontSize: 11, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold", letterSpacing: 0.5 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "600", color: "#9CA3AF", fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 8, paddingLeft: 4 },
  sectionCard: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#1E1E28" },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, color: "#D1D1DB", fontFamily: "Inter_500Medium" },
  rowValue: { fontSize: 14, color: "#9CA3AF", fontFamily: "Inter_400Regular" },

  version: { textAlign: "center", fontSize: 12, color: "#D1D5DB", fontFamily: "Inter_400Regular", marginTop: 12 },
});
