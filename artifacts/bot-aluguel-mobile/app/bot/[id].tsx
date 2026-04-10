import {
  useConnectBot,
  useDisconnectBot,
  useGetBot,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
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

const STATUS_CONFIG = {
  connected:    { color: "#22C55E", label: "Online",      icon: "wifi" },
  connecting:   { color: "#F59E0B", label: "Conectando",  icon: "loader" },
  disconnected: { color: "#4B4C6B", label: "Offline",     icon: "wifi-off" },
  error:        { color: "#EF4444", label: "Erro",        icon: "alert-circle" },
};

export default function BotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [connectionType, setConnectionType] = useState<"qrcode" | "code">("code");
  const [phone, setPhone] = useState("");
  const [connecting, setConnecting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: bot, refetch } = useGetBot(id ?? "", { query: { enabled: !!id } });
  const connectBot = useConnectBot();
  const disconnectBot = useDisconnectBot();

  const status = STATUS_CONFIG[(bot?.status as keyof typeof STATUS_CONFIG) ?? "disconnected"];

  useEffect(() => {
    if (bot?.status === "connecting") {
      pollRef.current = setInterval(() => refetch(), 3000);
    } else {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      setConnecting(false);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
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
      await connectBot.mutateAsync({ botId: id, data: { type: connectionType, phone: connectionType === "code" ? phone.trim() : undefined } });
      refetch();
    } catch {
      setConnecting(false);
      Alert.alert("Erro", "Não foi possível iniciar a conexão.");
    }
  }

  async function handleCancelConnection() {
    if (!id) return;
    try {
      await disconnectBot.mutateAsync({ botId: id });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refetch();
    } catch { Alert.alert("Erro", "Não foi possível cancelar."); }
  }

  async function handleDisconnect() {
    if (!id) return;
    Alert.alert("Desconectar", "Deseja desconectar este bot do WhatsApp?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desconectar", style: "destructive",
        onPress: async () => {
          try {
            await disconnectBot.mutateAsync({ botId: id });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            refetch();
          } catch { Alert.alert("Erro", "Não foi possível desconectar."); }
        },
      },
    ]);
  }

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const paddingBottom = Platform.OS === "web" ? 34 : insets.bottom + 20;

  if (!bot) {
    return (
      <View style={[s.center, { paddingTop: paddingTop + 60 }]}>
        <ActivityIndicator color="#F97316" size="large" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={[s.nav, { paddingTop: paddingTop + 8 }]}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#C9CADB" />
        </Pressable>
        <Text style={s.navTitle} numberOfLines={1}>{bot.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom }]} showsVerticalScrollIndicator={false}>
        <View style={[s.statusCard, { borderLeftColor: status.color }]}>
          <View style={s.statusRow}>
            <View style={[s.dot, { backgroundColor: status.color }]} />
            <Text style={[s.statusLabel, { color: status.color }]}>{status.label}</Text>
          </View>
          {bot.phone && <Text style={s.botPhone}>+{bot.phone} · {bot.totalGroups} grupos</Text>}
        </View>

        <View style={s.quickRow}>
          <Pressable
            style={({ pressed }) => [s.quickBtn, s.quickBtnPrimary, { opacity: pressed ? 0.75 : 1 }]}
            onPress={() => router.push(`/builder/${id}` as any)}
          >
            <Feather name="git-branch" size={16} color="#F97316" />
            <Text style={[s.quickBtnText, { color: "#F97316" }]}>Construtor</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [s.quickBtn, s.quickBtnSecondary, { opacity: pressed ? 0.75 : 1 }]}
            onPress={() => router.push(`/bot/settings/${id}` as any)}
          >
            <Feather name="sliders" size={16} color="#8B8EA0" />
            <Text style={[s.quickBtnText, { color: "#8B8EA0" }]}>Configurar</Text>
          </Pressable>
        </View>

        {bot.status === "connected" ? (
          <>
            <View style={s.connectedCard}>
              <Feather name="wifi" size={16} color="#22C55E" />
              <Text style={s.connectedText}>Bot conectado e ativo!</Text>
            </View>
            <Pressable style={s.disconnectBtn} onPress={handleDisconnect}>
              <Feather name="wifi-off" size={15} color="#EF4444" />
              <Text style={s.disconnectBtnText}>Desconectar</Text>
            </Pressable>
          </>
        ) : bot.status !== "connecting" ? (
          <View style={s.connectSection}>
            <Text style={s.sectionLabel}>CONECTAR AO WHATSAPP</Text>

            <View style={s.typeToggle}>
              {([["code", "Código", "hash"], ["qrcode", "QR Code", "camera"]] as const).map(([t, label, icon]) => (
                <Pressable
                  key={t}
                  style={[s.toggleBtn, connectionType === t && s.toggleBtnActive]}
                  onPress={() => setConnectionType(t)}
                >
                  <Feather name={icon} size={13} color={connectionType === t ? "#FFF" : "#4B4C6B"} />
                  <Text style={[s.toggleText, connectionType === t && s.toggleTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            {connectionType === "code" && (
              <View style={s.phoneBox}>
                <Feather name="phone" size={14} color="#4B4C6B" />
                <TextInput
                  style={s.phoneInput}
                  placeholder="5511999999999"
                  placeholderTextColor="#4B4C6B"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            )}

            <Text style={s.connectHint}>
              {connectionType === "code"
                ? "Gere um código e insira em: WhatsApp → Dispositivos → Vincular com número"
                : "Gere o QR Code e escaneie em: WhatsApp → Dispositivos → Vincular dispositivo"}
            </Text>

            <Pressable
              style={({ pressed }) => [s.connectBtn, { opacity: pressed || connecting ? 0.8 : 1 }]}
              onPress={handleConnect}
              disabled={connecting}
            >
              {connecting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Feather name="link" size={15} color="#FFF" />
                  <Text style={s.connectBtnText}>Conectar</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={s.connectingSection}>
            {bot.qrCode ? (
              <View style={s.qrContainer}>
                <Text style={s.connectingLabel}>Escaneie o QR Code</Text>
                <Text style={s.connectingHint}>WhatsApp → Dispositivos → Vincular um dispositivo</Text>
                <View style={s.qrBox}>
                  <Image source={{ uri: bot.qrCode }} style={s.qrImage} contentFit="contain" />
                </View>
                <View style={s.waitRow}>
                  <ActivityIndicator color="#F97316" size="small" />
                  <Text style={s.waitText}>Aguardando leitura...</Text>
                </View>
              </View>
            ) : bot.pairCode ? (
              <View style={s.pairContainer}>
                <Text style={s.connectingLabel}>Código de pareamento</Text>
                <Text style={s.connectingHint}>WhatsApp → Dispositivos → Vincular com número</Text>
                <View style={s.pairBox}>
                  <Text style={s.pairCode}>{bot.pairCode}</Text>
                </View>
                <View style={s.waitRow}>
                  <ActivityIndicator color="#F97316" size="small" />
                  <Text style={s.waitText}>Aguardando confirmação...</Text>
                </View>
              </View>
            ) : (
              <View style={s.waitingCenter}>
                <ActivityIndicator color="#F97316" size="large" />
                <Text style={s.waitText}>Iniciando conexão...</Text>
              </View>
            )}

            <Pressable style={s.cancelBtn} onPress={handleCancelConnection}>
              <Feather name="x-circle" size={14} color="#EF4444" />
              <Text style={s.cancelBtnText}>Cancelar conexão</Text>
            </Pressable>
          </View>
        )}

        <View style={s.infoCard}>
          <Text style={s.infoCardTitle}>DETALHES</Text>
          {[
            { label: "Prefixo", value: bot.prefix },
            { label: "Grupos", value: String(bot.totalGroups) },
            { label: "Criado", value: new Date(bot.createdAt).toLocaleDateString("pt-BR") },
            bot.connectedAt ? { label: "Conectado", value: new Date(bot.connectedAt).toLocaleDateString("pt-BR") } : null,
            bot.ownerPhone ? { label: "Dono", value: bot.ownerPhone } : null,
          ].filter(Boolean).map((item, i, arr) => (
            <View key={item!.label} style={[s.infoRow, i < arr.length - 1 && s.infoRowBorder]}>
              <Text style={s.infoLabel}>{item!.label}</Text>
              <Text style={s.infoValue}>{item!.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090A0F" },
  center: { flex: 1, backgroundColor: "#090A0F", alignItems: "center" },

  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1B28",
    backgroundColor: "#090A0F",
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  navTitle: { flex: 1, textAlign: "center" as const, fontSize: 15, fontWeight: "600" as const, color: "#F1F2F6", fontFamily: "Inter_600SemiBold" },

  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },

  statusCard: {
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    borderLeftWidth: 3,
    padding: 14,
    gap: 6,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  botPhone: { fontSize: 12, color: "#4B4C6B", fontFamily: "Inter_400Regular" },

  quickRow: { flexDirection: "row", gap: 10 },
  quickBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 11, borderRadius: 8, borderWidth: 1,
  },
  quickBtnPrimary: { backgroundColor: "#F9731615", borderColor: "#F9731430" },
  quickBtnSecondary: { backgroundColor: "#131420", borderColor: "#1A1B28" },
  quickBtnText: { fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },

  connectedCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#22C55E10", borderRadius: 8, borderWidth: 1, borderColor: "#22C55E30",
    borderLeftWidth: 3, borderLeftColor: "#22C55E", padding: 14,
  },
  connectedText: { fontSize: 14, fontWeight: "600" as const, color: "#22C55E", fontFamily: "Inter_600SemiBold" },
  disconnectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, borderRadius: 8,
    backgroundColor: "#EF444415", borderWidth: 1, borderColor: "#EF444430",
  },
  disconnectBtnText: { fontSize: 14, fontWeight: "600" as const, color: "#EF4444", fontFamily: "Inter_600SemiBold" },

  connectSection: { backgroundColor: "#0D0E16", borderRadius: 8, borderWidth: 1, borderColor: "#1A1B28", padding: 16, gap: 12 },
  sectionLabel: { fontSize: 9, color: "#4B4C6B", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  typeToggle: {
    flexDirection: "row", backgroundColor: "#131420", borderRadius: 6,
    borderWidth: 1, borderColor: "#1A1B28", padding: 3, gap: 3,
  },
  toggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 4 },
  toggleBtnActive: { backgroundColor: "#F97316" },
  toggleText: { fontSize: 13, fontWeight: "600" as const, color: "#4B4C6B", fontFamily: "Inter_600SemiBold" },
  toggleTextActive: { color: "#FFF" },
  phoneBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#131420", borderRadius: 6, borderWidth: 1, borderColor: "#1E1F2E", paddingHorizontal: 12,
  },
  phoneInput: { flex: 1, color: "#F1F2F6", fontSize: 15, paddingVertical: 12, fontFamily: "Inter_400Regular" },
  connectHint: { fontSize: 12, color: "#4B4C6B", fontFamily: "Inter_400Regular", lineHeight: 18 },
  connectBtn: {
    backgroundColor: "#F97316", borderRadius: 6, paddingVertical: 13,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  connectBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },

  connectingSection: {
    backgroundColor: "#0D0E16", borderRadius: 8, borderWidth: 1,
    borderColor: "#F59E0B30", borderLeftWidth: 3, borderLeftColor: "#F59E0B", padding: 16, gap: 16,
  },
  qrContainer: { alignItems: "center", gap: 10 },
  connectingLabel: { fontSize: 15, fontWeight: "700" as const, color: "#F1F2F6", fontFamily: "Inter_700Bold" },
  connectingHint: { fontSize: 12, color: "#4B4C6B", fontFamily: "Inter_400Regular", textAlign: "center" as const },
  qrBox: { backgroundColor: "#FFF", borderRadius: 8, padding: 12 },
  qrImage: { width: 200, height: 200 },
  pairContainer: { alignItems: "center", gap: 10 },
  pairBox: {
    backgroundColor: "#F9731610", borderRadius: 8, borderWidth: 2,
    borderColor: "#F9731640", paddingHorizontal: 28, paddingVertical: 16,
  },
  pairCode: { fontSize: 32, fontWeight: "800" as const, color: "#F97316", fontFamily: "Inter_700Bold", letterSpacing: 6 },
  waitRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  waitText: { fontSize: 13, color: "#4B4C6B", fontFamily: "Inter_400Regular" },
  waitingCenter: { alignItems: "center", gap: 12, paddingVertical: 24 },
  cancelBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 11, borderRadius: 6, backgroundColor: "#EF444415", borderWidth: 1, borderColor: "#EF444430",
  },
  cancelBtnText: { fontSize: 13, fontWeight: "600" as const, color: "#EF4444", fontFamily: "Inter_600SemiBold" },

  infoCard: { backgroundColor: "#0D0E16", borderRadius: 8, borderWidth: 1, borderColor: "#1A1B28", overflow: "hidden" as const },
  infoCardTitle: { fontSize: 9, color: "#2A2B3E", fontFamily: "Inter_600SemiBold", letterSpacing: 1, padding: 14, paddingBottom: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: "#1A1B28" },
  infoLabel: { fontSize: 13, color: "#4B4C6B", fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 13, fontWeight: "500" as const, color: "#C9CADB", fontFamily: "Inter_500Medium" },
});
