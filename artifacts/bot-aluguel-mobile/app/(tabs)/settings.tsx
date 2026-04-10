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
      <View style={[s.rowIcon, { backgroundColor: destructive ? "#EF444415" : "#6D28D915" }]}>
        <Feather name={icon as any} size={16} color={destructive ? "#EF4444" : "#6D28D9"} />
      </View>
      <Text style={[s.rowLabel, destructive && { color: "#EF4444" }]}>{label}</Text>
      {value ? (
        <Text style={s.rowValue}>{value}</Text>
      ) : onPress ? (
        <Feather name="chevron-right" size={16} color="#A0A0B0" />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const paddingBottom = Platform.OS === "web" ? 34 + 110 : insets.bottom + 110;
  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;
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
      <View style={[s.header, { paddingTop }]}>
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
      </View>

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
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2A2A3540",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#1A1A24",
    borderWidth: 1,
    borderColor: "#6D28D930",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, color: "#A78BFA", fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 18, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  profilePhone: { fontSize: 13, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 2 },
  planTag: {
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  planTagText: { fontSize: 10, color: "#A78BFA", fontFamily: "Inter_700Bold", letterSpacing: 0.5 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, color: "#A0A0B0", fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginBottom: 8, paddingLeft: 4 },
  sectionCard: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2A2A3560" },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, color: "#D1D1DB", fontFamily: "Inter_500Medium" },
  rowValue: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_400Regular" },

  version: { textAlign: "center", fontSize: 12, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 12 },
});
