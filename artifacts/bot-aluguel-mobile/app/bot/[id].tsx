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
  connected:    { color: "#22C55E", label: "Online",      icon: "wifi",          bg: "#22C55E15" },
  connecting:   { color: "#F59E0B", label: "Conectando",  icon: "loader",        bg: "#F59E0B15" },
  disconnected: { color: "#9CA3AF", label: "Offline",     icon: "wifi-off",      bg: "#9CA3AF15" },
  error:        { color: "#EF4444", label: "Erro",        icon: "alert-circle",  bg: "#EF444415" },
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

  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;

  if (!bot) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#6D28D9" size="large" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={[s.nav, { paddingTop }]}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#F0F0F5" />
        </Pressable>
        <Text style={s.navTitle} numberOfLines={1}>{bot.name}</Text>
        <Pressable style={s.backBtn} onPress={() => router.push(`/bot/settings/${id}` as any)}>
          <Feather name="settings" size={18} color="#A0A0B0" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
        <View style={s.statusCard}>
          <View style={[s.statusIconWrap, { backgroundColor: status.bg }]}>
            <Feather name={status.icon as any} size={20} color={status.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.statusLabel}>{status.label}</Text>
            {bot.phone && <Text style={s.botPhone}>+{bot.phone} · {bot.totalGroups} grupos</Text>}
          </View>
          <View style={[s.statusBadge, { backgroundColor: status.bg, borderColor: status.color + "30" }]}>
            <View style={[s.statusDot, { backgroundColor: status.color }]} />
          </View>
        </View>

        <View style={s.quickRow}>
          <Pressable
            style={({ pressed }) => [s.quickBtn, s.quickBtnPrimary, pressed && { opacity: 0.75 }]}
            onPress={() => router.push(`/builder/${id}` as any)}
          >
            <Feather name="git-branch" size={16} color="#A78BFA" />
            <Text style={s.quickBtnPrimaryText}>Construtor</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [s.quickBtn, s.quickBtnOutline, pressed && { opacity: 0.75 }]}
            onPress={() => router.push(`/bot/settings/${id}` as any)}
          >
            <Feather name="sliders" size={16} color="#A0A0B0" />
            <Text style={s.quickBtnOutlineText}>Configurar</Text>
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
                  <Feather name={icon} size={13} color={connectionType === t ? "#FFF" : "#A0A0B0"} />
                  <Text style={[s.toggleText, connectionType === t && s.toggleTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            {connectionType === "code" && (
              <View style={s.phoneBox}>
                <Feather name="phone" size={14} color="#A0A0B0" />
                <TextInput
                  style={s.phoneInput}
                  placeholder="5511999999999"
                  placeholderTextColor="#6B7280"
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
                  <ActivityIndicator color="#6D28D9" size="small" />
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
                  <ActivityIndicator color="#6D28D9" size="small" />
                  <Text style={s.waitText}>Aguardando confirmação...</Text>
                </View>
              </View>
            ) : (
              <View style={s.waitingCenter}>
                <ActivityIndicator color="#6D28D9" size="large" />
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
  root: { flex: 1, backgroundColor: "#0F0F14" },
  center: { flex: 1, backgroundColor: "#0F0F14", alignItems: "center", justifyContent: "center" },

  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  navTitle: { flex: 1, textAlign: "center", fontSize: 17, color: "#F0F0F5", fontFamily: "Inter_700Bold" },

  scroll: { padding: 20, gap: 14 },

  statusCard: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLabel: { fontSize: 16, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  botPhone: { fontSize: 12, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  quickRow: { flexDirection: "row", gap: 10 },
  quickBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 13, borderRadius: 12,
  },
  quickBtnPrimary: {
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
  },
  quickBtnPrimaryText: { fontSize: 14, color: "#A78BFA", fontFamily: "Inter_600SemiBold" },
  quickBtnOutline: {
    backgroundColor: "#1E1E28",
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  quickBtnOutlineText: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_600SemiBold" },

  connectedCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#22C55E15", borderRadius: 12, borderWidth: 1, borderColor: "#22C55E30", padding: 16,
  },
  connectedText: { fontSize: 15, color: "#22C55E", fontFamily: "Inter_600SemiBold" },
  disconnectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 13, borderRadius: 12,
    backgroundColor: "#EF444415", borderWidth: 1, borderColor: "#EF444430",
  },
  disconnectBtnText: { fontSize: 14, color: "#EF4444", fontFamily: "Inter_600SemiBold" },

  connectSection: {
    backgroundColor: "#1A1A24", borderRadius: 16, borderWidth: 1, borderColor: "#2A2A35",
    padding: 20, gap: 14,
  },
  sectionLabel: { fontSize: 11, color: "#A0A0B0", fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  typeToggle: {
    flexDirection: "row", backgroundColor: "#1E1E28", borderRadius: 10, padding: 3, gap: 3,
    borderWidth: 1, borderColor: "#2A2A35",
  },
  toggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: "#6D28D9" },
  toggleText: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_600SemiBold" },
  toggleTextActive: { color: "#FFF" },
  phoneBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#1E1E28", borderRadius: 12, borderWidth: 1, borderColor: "#2A2A35", paddingHorizontal: 14,
  },
  phoneInput: { flex: 1, color: "#F0F0F5", fontSize: 15, paddingVertical: 14, fontFamily: "Inter_400Regular" },
  connectHint: { fontSize: 13, color: "#A0A0B0", fontFamily: "Inter_400Regular", lineHeight: 20 },
  connectBtn: {
    backgroundColor: "#6D28D9", borderRadius: 12, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  connectBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },

  connectingSection: {
    backgroundColor: "#1A1A24", borderRadius: 16, borderWidth: 1, borderColor: "#2A2A35",
    borderLeftWidth: 3, borderLeftColor: "#F59E0B",
    padding: 20, gap: 16,
  },
  qrContainer: { alignItems: "center", gap: 12 },
  connectingLabel: { fontSize: 17, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  connectingHint: { fontSize: 13, color: "#A0A0B0", fontFamily: "Inter_400Regular", textAlign: "center" },
  qrBox: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#2A2A35" },
  qrImage: { width: 200, height: 200 },
  pairContainer: { alignItems: "center", gap: 12 },
  pairBox: {
    backgroundColor: "#6D28D915", borderRadius: 12, borderWidth: 2,
    borderColor: "#6D28D940", paddingHorizontal: 30, paddingVertical: 18,
  },
  pairCode: { fontSize: 32, color: "#A78BFA", fontFamily: "Inter_700Bold", letterSpacing: 6 },
  waitRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  waitText: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_400Regular" },
  waitingCenter: { alignItems: "center", gap: 14, paddingVertical: 24 },
  cancelBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 12, borderRadius: 12,
    backgroundColor: "#EF444415", borderWidth: 1, borderColor: "#EF444430",
  },
  cancelBtnText: { fontSize: 14, color: "#EF4444", fontFamily: "Inter_600SemiBold" },

  infoCard: {
    backgroundColor: "#1A1A24", borderRadius: 16, borderWidth: 1, borderColor: "#2A2A35", overflow: "hidden",
  },
  infoCardTitle: { fontSize: 11, color: "#A0A0B0", fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, padding: 16, paddingBottom: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13 },
  infoRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2A2A3560" },
  infoLabel: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 14, color: "#D1D1DB", fontFamily: "Inter_500Medium" },
});
