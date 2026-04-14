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

  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;

  return (
    <View style={s.root}>
      <View style={[s.nav, { paddingTop }]}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#F0F0F5" />
        </Pressable>
        <Text style={s.navTitle}>Configurações do Bot</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!bot ? (
            <View style={s.loader}><ActivityIndicator color="#6D28D9" size="large" /></View>
          ) : (
            <>
              <View style={s.card}>
                <Text style={s.cardSectionLabel}>GERAL</Text>

                <View style={s.field}>
                  <Text style={s.label}>NOME DO BOT</Text>
                  <View style={s.inputRow}>
                    <Feather name="cpu" size={14} color="#A0A0B0" />
                    <TextInput
                      style={s.input}
                      value={settings.name}
                      onChangeText={(v) => setSettings((p) => ({ ...p, name: v }))}
                      placeholder="Ex: MeuBot"
                      placeholderTextColor="#6B7280"
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
                    Caractere que precede os comandos. Ex: <Text style={{ color: "#A0A0B0" }}>{settings.prefix !== "nenhum" ? settings.prefix : ""}sticker</Text>
                  </Text>
                </View>

                <View style={s.field}>
                  <Text style={s.label}>NÚMERO DO DONO (COM DDI)</Text>
                  <View style={s.inputRow}>
                    <Feather name="phone" size={14} color="#A0A0B0" />
                    <TextInput
                      style={s.input}
                      value={settings.ownerPhone}
                      onChangeText={(v) => setSettings((p) => ({ ...p, ownerPhone: v.replace(/\D/g, "") }))}
                      placeholder="Ex: 5511999990000"
                      placeholderTextColor="#6B7280"
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
                  { badge: `${settings.prefix !== "nenhum" ? settings.prefix : ""}sticker`, badgeColor: "#6D28D9", desc: "Com o prefixo e gatilho definidos, o bot responde ao comando em grupos." },
                  { badge: "Builder", badgeColor: "#6D28D9", desc: "Use o Construtor Visual para montar o fluxo: Comando → Ação → Resposta." },
                  { badge: "Live", badgeColor: "#22C55E", desc: "O bot precisa estar conectado ao WhatsApp para processar comandos." },
                ].map((tip) => (
                  <View key={tip.badge} style={s.tipRow}>
                    <View style={[s.tipBadge, { backgroundColor: tip.badgeColor + "15", borderColor: tip.badgeColor + "30" }]}>
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
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F0F14" },

  nav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2A2A3540",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1A1A24",
    borderWidth: 1,
    borderColor: "#2A2A35",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, color: "#F0F0F5", fontFamily: "Inter_700Bold" },

  scroll: { padding: 20, gap: 16 },
  loader: { paddingVertical: 60, alignItems: "center" },

  card: {
    backgroundColor: "#1A1A24", borderRadius: 16, borderWidth: 1, borderColor: "#2A2A35",
    padding: 20, gap: 18,
  },
  cardSectionLabel: { fontSize: 11, color: "#A0A0B0", fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },

  field: { gap: 8 },
  label: { fontSize: 11, color: "#A0A0B0", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#1E1E28", borderRadius: 12, borderWidth: 1, borderColor: "#2A2A35", paddingHorizontal: 14,
  },
  input: { flex: 1, color: "#F0F0F5", fontSize: 15, paddingVertical: 14, fontFamily: "Inter_400Regular" },
  hint: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_400Regular" },

  prefixRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  prefixBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    backgroundColor: "#1E1E28", borderWidth: 1, borderColor: "#2A2A35",
  },
  prefixBtnActive: { backgroundColor: "#6D28D915", borderColor: "#6D28D930" },
  prefixText: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_600SemiBold" },
  prefixTextActive: { color: "#A78BFA" },

  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  tipBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, marginTop: 2 },
  tipBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tipText: { flex: 1, fontSize: 13, color: "#A0A0B0", fontFamily: "Inter_400Regular", lineHeight: 20 },

  saveBtn: {
    backgroundColor: "#6D28D9", borderRadius: 12, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  saveBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
});
