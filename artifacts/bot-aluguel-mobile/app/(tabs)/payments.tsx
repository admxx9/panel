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

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente",  color: "#F59E0B", bg: "#F59E0B15" },
  paid:    { label: "Pago",      color: "#22C55E", bg: "#22C55E15" },
  expired: { label: "Expirado",  color: "#9CA3AF", bg: "#9CA3AF15" },
  error:   { label: "Erro",      color: "#EF4444", bg: "#EF444415" },
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
  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;
  const historyList = (history as any[] | undefined) ?? [];

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop }]}>
        <Text style={s.headerTitle}>Comprar Moedas</Text>
        <Text style={s.headerSub}>R$ 1,00 = 100 moedas</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={historyLoading} onRefresh={refetch} tintColor="#6D28D9" />}
      >
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.cardIconWrap}>
              <Feather name="zap" size={16} color="#A78BFA" />
            </View>
            <Text style={s.cardTitle}>Gerar PIX</Text>
          </View>

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
              placeholderTextColor="#6B7280"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(",", "."))}
            />
          </View>

          {amount && parseFloat(amount) > 0 && (
            <View style={s.preview}>
              <Feather name="dollar-sign" size={14} color="#6D28D9" />
              <Text style={s.previewText}>
                Você receberá <Text style={{ color: "#6D28D9", fontWeight: "700" }}>{Math.round(parseFloat(amount) * 100)} moedas</Text>
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
                  <Feather name={copied ? "check" : "copy"} size={13} color={copied ? "#22C55E" : "#A78BFA"} />
                  <Text style={[s.copyText, copied && { color: "#22C55E" }]}>
                    {copied ? "Copiado!" : "Copiar código PIX"}
                  </Text>
                </Pressable>
                <Text style={s.waitText}>Aguardando pagamento...</Text>
              </>
            )}
          </View>
        )}

        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>HISTÓRICO</Text>
        </View>
        {historyLoading ? (
          <View style={s.loader}><ActivityIndicator color="#6D28D9" /></View>
        ) : historyList.length === 0 ? (
          <View style={s.emptyHistory}>
            <Feather name="inbox" size={28} color="#A0A0B0" />
            <Text style={s.emptyHistoryText}>Nenhum pagamento ainda</Text>
          </View>
        ) : (
          <View style={s.historyCard}>
            {historyList.map((item: any, i: number) => {
              const cfg = STATUS_CFG[item.status] ?? STATUS_CFG.pending;
              return (
                <View key={item.id} style={[s.historyRow, i < historyList.length - 1 && s.historyRowBorder]}>
                  <View style={s.historyIconWrap}>
                    <Feather name="dollar-sign" size={16} color="#A78BFA" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.historyAmount}>R$ {parseFloat(item.amount ?? 0).toFixed(2)}</Text>
                    <Text style={s.historyDate}>
                      {new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + "30" }]}>
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
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2A2A3540",
  },
  headerTitle: { fontSize: 22, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 4 },

  card: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    padding: 20,
    marginBottom: 16,
    gap: 14,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIconWrap: {
    padding: 6,
    backgroundColor: "#6D28D915",
    borderRadius: 8,
  },
  cardTitle: { fontSize: 16, color: "#F0F0F5", fontFamily: "Inter_700Bold" },

  presetsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  preset: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#1E1E28",
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  presetActive: { backgroundColor: "#6D28D915", borderColor: "#6D28D930" },
  presetText: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_600SemiBold" },
  presetTextActive: { color: "#A78BFA" },

  label: { fontSize: 11, color: "#A0A0B0", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E28",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A35",
    paddingHorizontal: 14,
  },
  currency: { fontSize: 18, color: "#A0A0B0", fontFamily: "Inter_700Bold", marginRight: 4 },
  input: { flex: 1, color: "#F0F0F5", fontSize: 20, paddingVertical: 14, fontFamily: "Inter_700Bold" },

  preview: { flexDirection: "row", alignItems: "center", gap: 6 },
  previewText: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_400Regular" },

  btn: {
    backgroundColor: "#6D28D9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },

  pixCard: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    borderLeftWidth: 3,
    borderLeftColor: "#22C55E",
    padding: 20,
    marginBottom: 16,
    gap: 12,
  },
  pixHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  pixIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#22C55E15",
    alignItems: "center",
    justifyContent: "center",
  },
  pixHeaderText: { fontSize: 15, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  pixSub: { fontSize: 12, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 2 },
  codeBox: { backgroundColor: "#1E1E28", borderRadius: 12, borderWidth: 1, borderColor: "#2A2A35", padding: 14 },
  codeText: { fontSize: 12, color: "#A0A0B0", fontFamily: "Inter_400Regular", lineHeight: 18 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    backgroundColor: "#6D28D915",
    borderWidth: 1,
    borderColor: "#6D28D930",
    paddingVertical: 12,
  },
  copyBtnDone: { backgroundColor: "#22C55E15", borderColor: "#22C55E30" },
  copyText: { fontSize: 14, color: "#A78BFA", fontFamily: "Inter_600SemiBold" },
  waitText: { textAlign: "center", fontSize: 12, color: "#A0A0B0", fontFamily: "Inter_400Regular" },
  paidBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#22C55E15", borderRadius: 12, padding: 14 },
  paidText: { fontSize: 14, color: "#22C55E", fontFamily: "Inter_600SemiBold" },

  sectionHeader: { marginBottom: 12 },
  sectionLabel: { fontSize: 11, color: "#A0A0B0", fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },

  historyCard: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    overflow: "hidden",
  },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  historyRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#2A2A3560" },
  historyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#6D28D915",
    alignItems: "center",
    justifyContent: "center",
  },
  historyAmount: { fontSize: 15, color: "#F0F0F5", fontFamily: "Inter_600SemiBold" },
  historyDate: { fontSize: 12, color: "#A0A0B0", fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },

  loader: { paddingVertical: 30, alignItems: "center" },
  emptyHistory: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 40,
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  emptyHistoryText: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_400Regular" },
});
