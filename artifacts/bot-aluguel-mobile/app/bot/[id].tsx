import {
  useConnectBot,
  useDisconnectBot,
  useGetBot,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const STATUS_CONFIG = {
  connected: { color: "#22C55E", label: "Conectado", icon: "wifi" },
  connecting: { color: "#F59E0B", label: "Conectando...", icon: "loader" },
  disconnected: { color: "#8E8EA0", label: "Desconectado", icon: "wifi-off" },
  error: { color: "#DC2626", label: "Erro", icon: "alert-circle" },
};

export default function BotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [connectionType, setConnectionType] = useState<"qrcode" | "code">("qrcode");
  const [phone, setPhone] = useState("");
  const [connecting, setConnecting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: bot, refetch } = useGetBot({ botId: id ?? "" }, { enabled: !!id });
  const connectBot = useConnectBot();
  const disconnectBot = useDisconnectBot();

  const status = STATUS_CONFIG[(bot?.status as keyof typeof STATUS_CONFIG) ?? "disconnected"];

  useEffect(() => {
    if (bot?.status === "connecting") {
      pollRef.current = setInterval(() => refetch(), 3000);
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      setConnecting(false);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [bot?.status]);

  async function handleConnect() {
    if (!id) return;
    if (connectionType === "code" && !phone.trim()) {
      Alert.alert("Atenção", "Digite o número de telefone com DDI (ex: 5511999999999)");
      return;
    }
    setConnecting(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await connectBot.mutateAsync({
        botId: id,
        data: {
          type: connectionType,
          phone: connectionType === "code" ? phone.trim() : undefined,
        },
      });
      refetch();
    } catch {
      setConnecting(false);
      Alert.alert("Erro", "Não foi possível iniciar a conexão.");
    }
  }

  async function handleDisconnect() {
    if (!id) return;
    Alert.alert("Desconectar", "Deseja desconectar este bot do WhatsApp?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desconectar",
        style: "destructive",
        onPress: async () => {
          try {
            await disconnectBot.mutateAsync({ botId: id });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            refetch();
          } catch {
            Alert.alert("Erro", "Não foi possível desconectar.");
          }
        },
      },
    ]);
  }

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const paddingBottom = Platform.OS === "web" ? 34 : insets.bottom + 20;

  if (!bot) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background, paddingTop }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.navBar, { paddingTop: paddingTop + 8, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]} numberOfLines={1}>
          {bot.name}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: status.color + "40" }]}>
          <LinearGradient
            colors={[status.color + "15", "transparent"]}
            style={styles.statusCardGradient}
          >
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
          </LinearGradient>
          {bot.phone && (
            <Text style={[styles.botPhone, { color: colors.mutedForeground }]}>
              {bot.phone}
            </Text>
          )}
        </View>

        <View style={styles.quickActionsRow}>
          <Pressable
            style={({ pressed }) => [styles.quickAction, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40", opacity: pressed ? 0.75 : 1 }]}
            onPress={() => router.push(`/builder/${id}` as any)}
          >
            <Feather name="git-branch" size={20} color={colors.primary} />
            <Text style={[styles.quickActionLabel, { color: colors.primary }]}>Construtor</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.quickAction, { backgroundColor: colors.secondary, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
            onPress={() => router.push(`/bot/settings/${id}` as any)}
          >
            <Feather name="sliders" size={20} color={colors.foreground} />
            <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>Configurar</Text>
          </Pressable>
        </View>

        {bot.status === "connected" ? (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.destructive + "20", borderColor: colors.destructive + "40" }]}
            onPress={handleDisconnect}
          >
            <Feather name="wifi-off" size={18} color={colors.destructive} />
            <Text style={[styles.actionBtnText, { color: colors.destructive }]}>Desconectar</Text>
          </Pressable>
        ) : (
          bot.status !== "connecting" && (
            <View style={styles.connectSection}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Conectar ao WhatsApp</Text>

              <View style={[styles.typeToggle, { backgroundColor: colors.secondary }]}>
                <Pressable
                  style={[styles.toggleBtn, connectionType === "qrcode" && { backgroundColor: colors.primary }]}
                  onPress={() => setConnectionType("qrcode")}
                >
                  <Feather name="camera" size={15} color={connectionType === "qrcode" ? "#FFF" : colors.mutedForeground} />
                  <Text style={[styles.toggleText, { color: connectionType === "qrcode" ? "#FFF" : colors.mutedForeground }]}>
                    QR Code
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleBtn, connectionType === "code" && { backgroundColor: colors.primary }]}
                  onPress={() => setConnectionType("code")}
                >
                  <Feather name="hash" size={15} color={connectionType === "code" ? "#FFF" : colors.mutedForeground} />
                  <Text style={[styles.toggleText, { color: connectionType === "code" ? "#FFF" : colors.mutedForeground }]}>
                    Código
                  </Text>
                </Pressable>
              </View>

              {connectionType === "code" && (
                <View style={[styles.phoneInput, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.phoneField, { color: colors.foreground }]}
                    placeholder="Ex: 5511999999999"
                    placeholderTextColor={colors.mutedForeground}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.connectBtn,
                  { opacity: pressed || connecting ? 0.75 : 1 },
                ]}
                onPress={handleConnect}
                disabled={connecting}
              >
                <LinearGradient
                  colors={["#8B3FFF", "#6B1FDF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.connectBtnGradient}
                >
                  {connecting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Feather name="link" size={16} color="#FFF" />
                      <Text style={styles.connectBtnText}>Conectar</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          )
        )}

        {bot.status === "connecting" && (
          <View style={styles.connectingSection}>
            {bot.qrCode ? (
              <View style={styles.qrContainer}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Escaneie o QR Code
                </Text>
                <Text style={[styles.qrHint, { color: colors.mutedForeground }]}>
                  Abra o WhatsApp {">"} Dispositivos vinculados {">"} Vincular um dispositivo
                </Text>
                <View style={[styles.qrBox, { backgroundColor: "#FFF", borderColor: colors.border }]}>
                  <Image
                    source={{ uri: bot.qrCode }}
                    style={styles.qrImage}
                    contentFit="contain"
                  />
                </View>
                <View style={styles.refreshRow}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={[styles.refreshText, { color: colors.mutedForeground }]}>
                    Aguardando leitura...
                  </Text>
                </View>
              </View>
            ) : bot.pairCode ? (
              <View style={styles.pairCodeSection}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Código de pareamento
                </Text>
                <Text style={[styles.qrHint, { color: colors.mutedForeground }]}>
                  Abra o WhatsApp {">"} Dispositivos vinculados {">"} Vincular com número de telefone
                </Text>
                <View style={[styles.pairCodeBox, { backgroundColor: colors.card, borderColor: colors.primary + "50" }]}>
                  <Text style={[styles.pairCode, { color: colors.primary }]}>{bot.pairCode}</Text>
                </View>
                <View style={styles.refreshRow}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={[styles.refreshText, { color: colors.mutedForeground }]}>
                    Aguardando confirmação...
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.waitingSection}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={[styles.waitingText, { color: colors.mutedForeground }]}>
                  Iniciando conexão...
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={[styles.infoSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.mutedForeground }]}>DETALHES DO BOT</Text>
          <InfoRow label="Prefixo" value={bot.prefix} colors={colors} />
          <InfoRow label="Grupos" value={String(bot.totalGroups)} colors={colors} />
          <InfoRow
            label="Criado em"
            value={new Date(bot.createdAt).toLocaleDateString("pt-BR")}
            colors={colors}
          />
          {bot.connectedAt && (
            <InfoRow
              label="Conectado em"
              value={new Date(bot.connectedAt).toLocaleDateString("pt-BR")}
              colors={colors}
            />
          )}
          {bot.ownerPhone && (
            <InfoRow label="Dono" value={bot.ownerPhone} colors={colors} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  navTitle: { flex: 1, textAlign: "center" as const, fontSize: 17, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden" as const,
  },
  statusCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 20,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  botPhone: { fontSize: 14, fontFamily: "Inter_400Regular", paddingHorizontal: 20, paddingBottom: 16 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  connectSection: { gap: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  typeToggle: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  toggleText: { fontSize: 14, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  phoneInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  phoneField: {
    fontSize: 15,
    paddingVertical: 14,
    fontFamily: "Inter_400Regular",
  },
  connectBtn: { borderRadius: 12, overflow: "hidden" as const },
  connectBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  connectBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  connectingSection: {},
  qrContainer: { gap: 12, alignItems: "center" },
  qrHint: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" as const, paddingHorizontal: 16 },
  qrBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  qrImage: { width: 220, height: 220 },
  pairCodeSection: { gap: 12, alignItems: "center" },
  pairCodeBox: {
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  pairCode: { fontSize: 32, fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: 6 },
  refreshRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  refreshText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  waitingSection: { alignItems: "center", gap: 16, paddingVertical: 32 },
  waitingText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  infoSection: { borderRadius: 14, borderWidth: 1, overflow: "hidden" as const },
  infoTitle: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.8, padding: 16, paddingBottom: 8 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 14, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  quickActionsRow: { flexDirection: "row", gap: 12 },
  quickAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickActionLabel: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});
