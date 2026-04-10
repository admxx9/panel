import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
import { useColors } from "@/hooks/useColors";

function SettingRow({
  icon,
  label,
  value,
  onPress,
  destructive,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: destructive ? colors.destructive + "20" : colors.primary + "15" }]}>
        <Feather name={icon as any} size={16} color={destructive ? colors.destructive : colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: destructive ? colors.destructive : colors.foreground }]}>
        {label}
      </Text>
      {value ? (
        <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
      ) : onPress ? (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

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

  const initial = user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingTop, paddingBottom }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Configurações</Text>

      <View style={styles.profileCard}>
        <LinearGradient
          colors={["#8B3FFF", "#2979FF"]}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </LinearGradient>
        <View>
          <Text style={[styles.profileName, { color: colors.foreground }]}>{user?.name ?? ""}</Text>
          <Text style={[styles.profilePhone, { color: colors.mutedForeground }]}>{user?.phone ?? ""}</Text>
          {user?.isAdmin && (
            <View style={[styles.adminBadge, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.adminText, { color: colors.primary }]}>Admin</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CONTA</Text>
      <View style={{ gap: 2 }}>
        <SettingRow
          icon="dollar-sign"
          label="Moedas"
          value={String(user?.coins ?? 0)}
        />
        <SettingRow
          icon="phone"
          label="Telefone"
          value={user?.phone ?? ""}
        />
        <SettingRow
          icon="calendar"
          label="Membro desde"
          value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : ""}
        />
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>APLICATIVO</Text>
      <View style={{ gap: 2 }}>
        <SettingRow icon="info" label="Versão" value="1.0.0" />
        <SettingRow
          icon="help-circle"
          label="Suporte"
          onPress={() => {}}
        />
      </View>

      <View style={{ marginTop: 8 }}>
        <SettingRow
          icon="log-out"
          label="Sair da conta"
          onPress={handleLogout}
          destructive
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  profileName: { fontSize: 18, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  profilePhone: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 2 },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: "flex-start" as const,
  },
  adminText: { fontSize: 11, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  rowValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
