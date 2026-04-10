import {
  useCheckPixStatus,
  useCreatePixCharge,
  useGetPaymentHistory,
} from "@workspace/api-client-react";
import { Clipboard } from "react-native";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const PRESETS = [5, 10, 25, 50, 100];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente",  color: "#F59E0B", bg: "#2D2506" },
  paid:    { label: "Pago",      color: "#22C55E", bg: "#0D2818" },
  expired: { label: "Expirado",  color: "#9CA3AF", bg: "#1E1E28" },
  error:   { label: "Erro",      color: "#EF4444", bg: "#2D0A0A" },
};

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState("");
  const [pendingTxid, setPendingTxid] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ copyPaste?: string | null; coins: number; amount: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const createPix = useCreatePixCharge();
  const { data: history, isLoading: historyLoading, refetch } = useGetPaymentHistory();
  const { data: pixStatus } = useCheckPixStatus(pendingTxid ?? "", {
    query: { enabled: !!pendingTxid, refetchInterval: 10000 },
  });

  useEffect(() => {
    if (pixStatus?.status === "paid" && pendingTxid) {
      refetch();
    }
  }, [pixStatus]);

  const handleCreatePix = async () => {
    const amtNum = parseFloat(amount);
    if (!amtNum || amtNum <= 0) { Alert.alert("Valor inválido", "Digite um valor válido."); return; }
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await createPix.mutateAsync({ data: { amount: amtNum } });
      setPixData({ copyPaste: result.copyPaste, coins: result.coins, amount: amtNum });
      setPendingTxid(result.txid ?? null);
    } catch { Alert.alert("Erro", "Não foi possível gerar o PIX."); }
  };

  const handleCopy = async () => {
    if (!pixData?.copyPaste) return;
    Clipboard.setString(pixData.copyPaste);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paddingBottom = Platform.OS === "web" ? 34 + 110 : insets.bottom + 110;
  const historyList = (history as any[] | undefined) ?? [];

  return (
    <View style={s.root}>
      <LinearGradient colors={["#7C3AED", "#6D28D9"]} style={[s.header, { paddingTop: insets.top + 12 }]}>
        <Text style={s.headerTitle}>Comprar Moedas</Text>
        <Text style={s.headerSub}>R$ 1,00 = 100 moedas</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={historyLoading} onRefresh={refetch} tintColor="#7C3AED" />}
      >
        <View style={s.card}>
          <Text style={s.cardTitle}>Gerar PIX</Text>

          <View style={s.presetsRow}>
            {PRESETS.map((p) => (
              <Pressable
                key={p}
                style={[s.preset, amount === String(p) && s.presetActive]}
                onPress={() => setAmount(String(p))}
              >
                <Text style={[s.presetText, amount === String(p) && s.presetTextActive]}>R${p}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={s.label}>VALOR PERSONALIZADO</Text>
          <View style={s.inputRow}>
            <Text style={s.currency}>R$</Text>
            <TextInput
              style={s.input}
              placeholder="0,00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(",", "."))}
            />
          </View>

          {amount && parseFloat(amount) > 0 && (
            <View style={s.preview}>
              <Feather name="dollar-sign" size={14} color="#7C3AED" />
              <Text style={s.previewText}>
                Você receberá <Text style={{ color: "#7C3AED", fontWeight: "700" }}>{Math.round(parseFloat(amount) * 100)} moedas</Text>
              </Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [s.btn, { opacity: pressed || createPix.isPending || !amount ? 0.7 : 1 }]}
            onPress={handleCreatePix}
            disabled={createPix.isPending || !amount}
          >
            {createPix.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Feather name="zap" size={14} color="#FFF" />
                <Text style={s.btnText}>Gerar PIX</Text>
              </>
            )}
          </Pressable>
        </View>

        {pixData && (
          <View style={s.pixCard}>
            <View style={s.pixHeader}>
              <View style={s.pixIconWrap}>
                <Feather name="check-circle" size={18} color="#22C55E" />
              </View>
              <View>
                <Text style={s.pixHeaderText}>PIX gerado com sucesso</Text>
                <Text style={s.pixSub}>{pixData.coins} moedas por R$ {pixData.amount.toFixed(2)}</Text>
              </View>
            </View>

            {pixStatus?.status === "paid" ? (
              <View style={s.paidBadge}>
                <Feather name="check" size={14} color="#22C55E" />
                <Text style={s.paidText}>Pagamento confirmado! Moedas adicionadas.</Text>
              </View>
            ) : (
              <>
                <View style={s.codeBox}>
                  <Text style={s.codeText} numberOfLines={3}>{pixData.copyPaste ?? "—"}</Text>
                </View>
                <Pressable style={[s.copyBtn, copied && s.copyBtnDone]} onPress={handleCopy}>
                  <Feather name={copied ? "check" : "copy"} size={13} color={copied ? "#22C55E" : "#7C3AED"} />
                  <Text style={[s.copyText, copied && { color: "#22C55E" }]}>
                    {copied ? "Copiado!" : "Copiar código PIX"}
                  </Text>
                </Pressable>
                <Text style={s.waitText}>Aguardando pagamento...</Text>
              </>
            )}
          </View>
        )}

        <Text style={s.sectionTitle}>Histórico</Text>
        {historyLoading ? (
          <View style={s.loader}><ActivityIndicator color="#7C3AED" /></View>
        ) : historyList.length === 0 ? (
          <View style={s.emptyHistory}>
            <Feather name="inbox" size={28} color="#D1D5DB" />
            <Text style={s.emptyHistoryText}>Nenhum pagamento ainda</Text>
          </View>
        ) : (
          <View style={s.historyCard}>
            {historyList.map((item: any, i: number) => {
              const cfg = STATUS_CFG[item.status] ?? STATUS_CFG.pending;
              return (
                <View key={item.id} style={[s.historyRow, i < historyList.length - 1 && s.historyRowBorder]}>
                  <View style={s.historyIconWrap}>
                    <Feather name="dollar-sign" size={16} color="#7C3AED" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.historyAmount}>R$ {parseFloat(item.amount ?? 0).toFixed(2)}</Text>
                    <Text style={s.historyDate}>
                      {new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F0F14" },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, color: "#FFFFFFBB", fontFamily: "Inter_400Regular", marginTop: 4 },

  card: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#F0F0F5", fontFamily: "Inter_700Bold" },

  presetsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  preset: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1E1E28",
  },
  presetActive: { backgroundColor: "#1E1635" },
  presetText: { fontSize: 14, color: "#6B7280", fontFamily: "Inter_600SemiBold" },
  presetTextActive: { color: "#7C3AED" },

  label: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E28",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  currency: { fontSize: 18, color: "#9CA3AF", fontFamily: "Inter_700Bold", marginRight: 4 },
  input: { flex: 1, color: "#F0F0F5", fontSize: 20, fontWeight: "700", paddingVertical: 14, fontFamily: "Inter_700Bold" },

  preview: { flexDirection: "row", alignItems: "center", gap: 6 },
  previewText: { fontSize: 14, color: "#6B7280", fontFamily: "Inter_400Regular" },

  btn: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnText: { color: "#FFF", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },

  pixCard: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
    padding: 20,
    marginBottom: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  pixHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  pixIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0D2818",
    alignItems: "center",
    justifyContent: "center",
  },
  pixHeaderText: { fontSize: 15, fontWeight: "700", color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  pixSub: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular", marginTop: 2 },
  codeBox: { backgroundColor: "#1E1E28", borderRadius: 12, padding: 14 },
  codeText: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_400Regular", lineHeight: 18 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    backgroundColor: "#1E1635",
    paddingVertical: 12,
  },
  copyBtnDone: { backgroundColor: "#0D2818" },
  copyText: { fontSize: 14, fontWeight: "600", color: "#7C3AED", fontFamily: "Inter_600SemiBold" },
  waitText: { textAlign: "center", fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  paidBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#0D2818", borderRadius: 12, padding: 14 },
  paidText: { fontSize: 14, color: "#22C55E", fontFamily: "Inter_600SemiBold" },

  sectionTitle: { fontSize: 18, color: "#F0F0F5", fontFamily: "Inter_700Bold", marginBottom: 12 },

  historyCard: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  historyRowBorder: { borderBottomWidth: 1, borderBottomColor: "#1E1E28" },
  historyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1E1635",
    alignItems: "center",
    justifyContent: "center",
  },
  historyAmount: { fontSize: 15, fontWeight: "600", color: "#F0F0F5", fontFamily: "Inter_600SemiBold" },
  historyDate: { fontSize: 12, color: "#9CA3AF", fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  loader: { paddingVertical: 30, alignItems: "center" },
  emptyHistory: { alignItems: "center", gap: 8, paddingVertical: 40, backgroundColor: "#1A1A24", borderRadius: 16 },
  emptyHistoryText: { fontSize: 14, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
});
