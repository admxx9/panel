import { useGetBot } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PREFIX_OPTIONS = [".", "!", "/", "#", "@", "$", "nenhum"];

export default function BotSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({ name: "", prefix: ".", ownerPhone: "" });
  const [saving, setSaving] = useState(false);

  const { data: bot } = useGetBot(id ?? "", { query: { enabled: !!id } });

  useEffect(() => {
    if (bot) {
      setSettings({
        name: bot.name ?? "",
        prefix: (bot as any).prefix ?? ".",
        ownerPhone: (bot as any).ownerPhone ?? "",
      });
    }
  }, [bot]);

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const paddingBottom = Platform.OS === "web" ? 34 : insets.bottom + 20;

  async function handleSave() {
    setSaving(true);
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      const token = await AsyncStorage.getItem("auth_token");
      const baseUrl = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";
      const res = await fetch(`${baseUrl}/api/bots/${id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message ?? "Erro ao salvar");
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Salvo!", "Configurações do bot atualizadas com sucesso.");
    } catch (e: unknown) {
      Alert.alert("Erro", (e as Error).message ?? "Não foi possível salvar.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[s.nav, { paddingTop: paddingTop + 8 }]}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#C9CADB" />
        </Pressable>
        <Text style={s.navTitle}>Configurações do Bot</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!bot ? (
          <View style={s.loader}><ActivityIndicator color="#F97316" size="large" /></View>
        ) : (
          <>
            <View style={s.card}>
              <Text style={s.cardSectionLabel}>GERAL</Text>

              <View style={s.field}>
                <Text style={s.label}>NOME DO BOT</Text>
                <View style={s.inputRow}>
                  <Feather name="cpu" size={14} color="#4B4C6B" />
                  <TextInput
                    style={s.input}
                    value={settings.name}
                    onChangeText={(v) => setSettings((p) => ({ ...p, name: v }))}
                    placeholder="Ex: MeuBot"
                    placeholderTextColor="#4B4C6B"
                  />
                </View>
                <Text style={s.hint}>Nome de exibição do bot na plataforma</Text>
              </View>

              <View style={s.field}>
                <Text style={s.label}>PREFIXO DOS COMANDOS</Text>
                <View style={s.prefixRow}>
                  {PREFIX_OPTIONS.map((p) => {
                    const sel = settings.prefix === p;
                    return (
                      <Pressable
                        key={p}
                        style={[s.prefixBtn, sel && s.prefixBtnActive]}
                        onPress={() => setSettings((st) => ({ ...st, prefix: p }))}
                      >
                        <Text style={[s.prefixText, sel && s.prefixTextActive]}>{p}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={s.hint}>
                  Caractere que precede os comandos. Ex: <Text style={{ color: "#8B8EA0" }}>{settings.prefix !== "nenhum" ? settings.prefix : ""}sticker</Text>
                </Text>
              </View>

              <View style={s.field}>
                <Text style={s.label}>NÚMERO DO DONO (COM DDI)</Text>
                <View style={s.inputRow}>
                  <Feather name="phone" size={14} color="#4B4C6B" />
                  <TextInput
                    style={s.input}
                    value={settings.ownerPhone}
                    onChangeText={(v) => setSettings((p) => ({ ...p, ownerPhone: v.replace(/\D/g, "") }))}
                    placeholder="Ex: 5511999990000"
                    placeholderTextColor="#4B4C6B"
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>
                <Text style={s.hint}>Número com DDI (55 para Brasil)</Text>
              </View>
            </View>

            <View style={s.card}>
              <Text style={s.cardSectionLabel}>COMO OS COMANDOS FUNCIONAM</Text>
              {[
                { badge: `${settings.prefix !== "nenhum" ? settings.prefix : ""}sticker`, badgeColor: "#F97316", desc: "Com o prefixo e gatilho definidos, o bot responde ao comando em grupos." },
                { badge: "Builder", badgeColor: "#C850C0", desc: "Use o Construtor Visual para montar o fluxo: Comando → Ação → Resposta." },
                { badge: "Live", badgeColor: "#22C55E", desc: "O bot precisa estar conectado ao WhatsApp para processar comandos." },
              ].map((tip) => (
                <View key={tip.badge} style={s.tipRow}>
                  <View style={[s.tipBadge, { backgroundColor: tip.badgeColor + "15" }]}>
                    <Text style={[s.tipBadgeText, { color: tip.badgeColor }]}>{tip.badge}</Text>
                  </View>
                  <Text style={s.tipText}>{tip.desc}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [s.saveBtn, { opacity: pressed || saving ? 0.8 : 1 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Feather name="save" size={16} color="#FFF" />
                  <Text style={s.saveBtnText}>Salvar Configurações</Text>
                </>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090A0F" },

  nav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: "#1A1B28", backgroundColor: "#090A0F",
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 15, fontWeight: "600" as const, color: "#F1F2F6", fontFamily: "Inter_600SemiBold" },

  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 14 },
  loader: { paddingVertical: 60, alignItems: "center" },

  card: { backgroundColor: "#0D0E16", borderRadius: 8, borderWidth: 1, borderColor: "#1A1B28", padding: 16, gap: 16 },
  cardSectionLabel: { fontSize: 9, color: "#4B4C6B", fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: -4 },

  field: { gap: 6 },
  label: { fontSize: 9, color: "#4B4C6B", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#131420", borderRadius: 6, borderWidth: 1, borderColor: "#1E1F2E", paddingHorizontal: 12,
  },
  input: { flex: 1, color: "#F1F2F6", fontSize: 14, paddingVertical: 12, fontFamily: "Inter_400Regular" },
  hint: { fontSize: 11, color: "#4B4C6B", fontFamily: "Inter_400Regular" },

  prefixRow: { flexDirection: "row", flexWrap: "wrap" as const, gap: 6 },
  prefixBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6,
    backgroundColor: "#131420", borderWidth: 1, borderColor: "#1A1B28",
  },
  prefixBtnActive: { backgroundColor: "#F9731618", borderColor: "#F97316" },
  prefixText: { fontSize: 13, fontWeight: "600" as const, color: "#4B4C6B", fontFamily: "Inter_600SemiBold" },
  prefixTextActive: { color: "#F97316" },

  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  tipBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  tipBadgeText: { fontSize: 11, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  tipText: { flex: 1, fontSize: 12, color: "#8B8EA0", fontFamily: "Inter_400Regular", lineHeight: 18 },

  saveBtn: {
    backgroundColor: "#F97316", borderRadius: 6, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  saveBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
});
