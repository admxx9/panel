import { useGetBot, useListBots } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

import { useColors } from "@/hooks/useColors";

const PREFIX_OPTIONS = [".", "!", "/", "#", "@", "$", "nenhum"];

export default function BotSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({ name: "", prefix: ".", ownerPhone: "" });
  const [saving, setSaving] = useState(false);

  const { data: bot } = useGetBot(id ?? "", { query: { enabled: !!id } });
  const { data: bots } = useListBots();

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
      const baseUrl = process.env.EXPO_PUBLIC_DOMAIN
        ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
        : "";
      const res = await fetch(`${baseUrl}/api/bots/${id}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.navBar, { paddingTop: paddingTop + 8, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>Configurações do Bot</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!bot ? (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Geral</Text>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Nome do Bot</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="cpu" size={16} color={colors.mutedForeground} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={settings.name}
                    onChangeText={(v) => setSettings((s) => ({ ...s, name: v }))}
                    placeholder="Ex: MeuBot"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  Nome de exibição do bot na plataforma
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Prefixo dos Comandos</Text>
                <View style={styles.prefixRow}>
                  {PREFIX_OPTIONS.map((p) => {
                    const sel = settings.prefix === p;
                    return (
                      <Pressable
                        key={p}
                        style={[
                          styles.prefixBtn,
                          {
                            backgroundColor: sel ? colors.primary : colors.secondary,
                            borderColor: sel ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setSettings((s) => ({ ...s, prefix: p }))}
                      >
                        <Text style={[styles.prefixText, { color: sel ? "#FFF" : colors.mutedForeground }]}>
                          {p}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  Caractere que precede os comandos. Ex: {settings.prefix !== "nenhum" ? settings.prefix : ""}sticker
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Número do Dono (com DDI)</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="phone" size={16} color={colors.mutedForeground} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={settings.ownerPhone}
                    onChangeText={(v) => setSettings((s) => ({ ...s, ownerPhone: v.replace(/\D/g, "") }))}
                    placeholder="Ex: 5511999990000"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  Número com DDI (55 para Brasil) — usado para comandos de admin
                </Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Como funcionam os comandos</Text>
              <View style={styles.tipRow}>
                <View style={[styles.tipBadge, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={[styles.tipBadgeText, { color: colors.primary }]}>
                    {settings.prefix !== "nenhum" ? settings.prefix : ""}sticker
                  </Text>
                </View>
                <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                  Com o prefixo <Text style={{ color: colors.foreground }}>{settings.prefix}</Text> e
                  gatilho <Text style={{ color: colors.foreground }}>sticker</Text>, o bot responde ao
                  comando em grupos.
                </Text>
              </View>
              <View style={styles.tipRow}>
                <View style={[styles.tipBadge, { backgroundColor: "#F59E0B20" }]}>
                  <Text style={[styles.tipBadgeText, { color: "#F59E0B" }]}>Builder</Text>
                </View>
                <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                  Use o <Text style={{ color: colors.foreground }}>Construtor Visual</Text> para montar o
                  fluxo: Comando → Ação → Resposta.
                </Text>
              </View>
              <View style={styles.tipRow}>
                <View style={[styles.tipBadge, { backgroundColor: "#22C55E20" }]}>
                  <Text style={[styles.tipBadgeText, { color: "#22C55E" }]}>Live</Text>
                </View>
                <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                  O bot precisa estar{" "}
                  <Text style={{ color: colors.foreground }}>conectado</Text> ao WhatsApp para processar
                  comandos em tempo real.
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.saveBtn, { opacity: pressed || saving ? 0.75 : 1 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <LinearGradient
                colors={["#8B3FFF", "#6B1FDF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGrad}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Feather name="save" size={18} color="#FFF" />
                    <Text style={styles.saveBtnText}>Salvar Configurações</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 17, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  loader: { paddingVertical: 60, alignItems: "center" },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  field: { gap: 8 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 13, fontFamily: "Inter_400Regular" },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  prefixRow: { flexDirection: "row", flexWrap: "wrap" as const, gap: 8 },
  prefixBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  prefixText: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tipBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 2 },
  tipBadgeText: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  saveBtn: { borderRadius: 14, overflow: "hidden" as const },
  saveBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});
