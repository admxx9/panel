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

const PRESETS = [5, 10, 25, 50, 100];

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente",  color: "#F59E0B" },
  paid:    { label: "Pago",      color: "#22C55E" },
  expired: { label: "Expirado",  color: "#4B4C6B" },
  error:   { label: "Erro",      color: "#EF4444" },
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

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 80;

  const historyList = (history as any[] | undefined) ?? [];

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={{ paddingTop, paddingBottom, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={historyLoading} onRefresh={refetch} tintColor="#F97316" />}
    >
      <View style={s.topBar}>
        <Text style={s.pageLabel}>RECARGA</Text>
        <Text style={s.pageTitle}>Comprar Moedas</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Gerar PIX</Text>
        <Text style={s.rateInfo}>R$ 1,00 = 100 moedas</Text>

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

        <View style={s.inputLabel}>
          <Text style={s.label}>VALOR PERSONALIZADO</Text>
        </View>
        <View style={s.inputRow}>
          <Text style={s.currency}>R$</Text>
          <TextInput
            style={s.input}
            placeholder="0,00"
            placeholderTextColor="#4B4C6B"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={(v) => setAmount(v.replace(",", "."))}
          />
        </View>

        {amount && parseFloat(amount) > 0 && (
          <View style={s.preview}>
            <Feather name="dollar-sign" size={14} color="#F97316" />
            <Text style={s.previewText}>
              Você receberá <Text style={{ color: "#F97316", fontWeight: "700" }}>{Math.round(parseFloat(amount) * 100)} moedas</Text>
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
            <Feather name="check-circle" size={16} color="#22C55E" />
            <Text style={s.pixHeaderText}>PIX gerado com sucesso</Text>
          </View>
          <Text style={s.pixSub}>{pixData.coins} moedas por R$ {pixData.amount.toFixed(2)}</Text>

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
                <Feather name={copied ? "check" : "copy"} size={13} color={copied ? "#22C55E" : "#F97316"} />
                <Text style={[s.copyText, copied && { color: "#22C55E" }]}>
                  {copied ? "Copiado!" : "Copiar código PIX"}
                </Text>
              </Pressable>
              <Text style={s.waitText}>Aguardando pagamento...</Text>
            </>
          )}
        </View>
      )}

      <View style={s.historySection}>
        <Text style={s.historySectionTitle}>HISTÓRICO</Text>
        {historyLoading ? (
          <View style={s.loader}><ActivityIndicator color="#F97316" /></View>
        ) : historyList.length === 0 ? (
          <View style={s.emptyHistory}>
            <Feather name="inbox" size={24} color="#2A2B3E" />
            <Text style={s.emptyHistoryText}>Nenhum pagamento ainda</Text>
          </View>
        ) : (
          <View style={s.historyCard}>
            {historyList.map((item: any, i: number) => {
              const cfg = STATUS_CFG[item.status] ?? STATUS_CFG.pending;
              return (
                <View key={item.id} style={[s.historyRow, i < historyList.length - 1 && s.historyRowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.historyAmount}>R$ {parseFloat(item.amount ?? 0).toFixed(2)}</Text>
                    <Text style={s.historyDate}>
                      {new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: cfg.color + "15", borderColor: cfg.color + "30" }]}>
                    <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090A0F" },

  topBar: { marginBottom: 20 },
  pageLabel: { fontSize: 10, color: "#4B4C6B", fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 4 },
  pageTitle: { fontSize: 22, fontWeight: "800" as const, color: "#F1F2F6", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },

  card: { backgroundColor: "#0D0E16", borderRadius: 8, borderWidth: 1, borderColor: "#1A1B28", padding: 16, marginBottom: 16, gap: 12 },
  cardTitle: { fontSize: 14, fontWeight: "700" as const, color: "#F1F2F6", fontFamily: "Inter_700Bold" },
  rateInfo: { fontSize: 11, color: "#4B4C6B", fontFamily: "Inter_400Regular", marginTop: -6 },

  presetsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" as const },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1A1B28",
    backgroundColor: "#131420",
  },
  presetActive: { borderColor: "#F97316", backgroundColor: "#F9731618" },
  presetText: { fontSize: 13, color: "#4B4C6B", fontFamily: "Inter_600SemiBold" },
  presetTextActive: { color: "#F97316" },

  inputLabel: {},
  label: { fontSize: 9, color: "#4B4C6B", fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131420",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1E1F2E",
    paddingHorizontal: 12,
  },
  currency: { fontSize: 16, color: "#4B4C6B", fontFamily: "Inter_700Bold", marginRight: 4 },
  input: { flex: 1, color: "#F1F2F6", fontSize: 18, fontWeight: "700" as const, paddingVertical: 12, fontFamily: "Inter_700Bold" },

  preview: { flexDirection: "row", alignItems: "center", gap: 6 },
  previewText: { fontSize: 13, color: "#8B8EA0", fontFamily: "Inter_400Regular" },

  btn: {
    backgroundColor: "#F97316",
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnText: { color: "#FFF", fontSize: 14, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },

  pixCard: { backgroundColor: "#0D0E16", borderRadius: 8, borderWidth: 1, borderColor: "#22C55E40", borderLeftWidth: 3, borderLeftColor: "#22C55E", padding: 16, marginBottom: 16, gap: 10 },
  pixHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  pixHeaderText: { fontSize: 14, fontWeight: "700" as const, color: "#22C55E", fontFamily: "Inter_700Bold" },
  pixSub: { fontSize: 12, color: "#4B4C6B", fontFamily: "Inter_400Regular" },
  codeBox: { backgroundColor: "#090A0F", borderRadius: 6, borderWidth: 1, borderColor: "#1A1B28", padding: 12 },
  codeText: { fontSize: 11, color: "#8B8EA0", fontFamily: "Inter_400Regular", lineHeight: 16 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#F97316",
    paddingVertical: 10,
  },
  copyBtnDone: { borderColor: "#22C55E" },
  copyText: { fontSize: 13, fontWeight: "600" as const, color: "#F97316", fontFamily: "Inter_600SemiBold" },
  waitText: { textAlign: "center", fontSize: 11, color: "#4B4C6B", fontFamily: "Inter_400Regular" },
  paidBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#22C55E15", borderRadius: 6, borderWidth: 1, borderColor: "#22C55E30", padding: 12 },
  paidText: { fontSize: 13, color: "#22C55E", fontFamily: "Inter_600SemiBold" },

  historySection: { marginBottom: 8 },
  historySectionTitle: { fontSize: 9, color: "#2A2B3E", fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10 },
  historyCard: { backgroundColor: "#0D0E16", borderRadius: 8, borderWidth: 1, borderColor: "#1A1B28", overflow: "hidden" as const },
  historyRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 },
  historyRowBorder: { borderBottomWidth: 1, borderBottomColor: "#1A1B28" },
  historyAmount: { fontSize: 14, fontWeight: "600" as const, color: "#C9CADB", fontFamily: "Inter_600SemiBold" },
  historyDate: { fontSize: 11, color: "#4B4C6B", fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: { borderRadius: 4, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },

  loader: { paddingVertical: 20, alignItems: "center" },
  emptyHistory: { alignItems: "center", gap: 8, paddingVertical: 30 },
  emptyHistoryText: { fontSize: 12, color: "#2A2B3E", fontFamily: "Inter_400Regular" },
});
