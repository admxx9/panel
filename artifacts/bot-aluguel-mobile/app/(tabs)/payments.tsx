import {
  useCheckPixStatus,
  useCreatePixCharge,
  useGetPaymentHistory,
} from "@workspace/api-client-react";
import { Clipboard } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

import { useColors } from "@/hooks/useColors";

const PRESETS = [5, 10, 25, 50, 100];

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente", color: "#F59E0B", bg: "#F59E0B20" },
  paid: { label: "Pago", color: "#22C55E", bg: "#22C55E20" },
  expired: { label: "Expirado", color: "#8E8EA0", bg: "#8E8EA020" },
  error: { label: "Erro", color: "#DC2626", bg: "#DC262620" },
};

export default function PaymentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState("");
  const [pendingTxid, setPendingTxid] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{
    copyPaste?: string | null;
    coins: number;
    amount: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const createPix = useCreatePixCharge();
  const { data: history, isLoading: historyLoading, refetch } = useGetPaymentHistory();
  const { data: pixStatus } = useCheckPixStatus(pendingTxid ?? "", {
    query: {
      enabled: !!pendingTxid,
      refetchInterval: 10000,
    },
  });

  useEffect(() => {
    if (pixStatus?.status === "paid" && pendingTxid) {
      refetch();
    }
  }, [pixStatus?.status]);

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  async function handleCreatePix() {
    const val = parseFloat(amount);
    if (!val || val < 0.01) {
      Alert.alert("Valor inválido", "O mínimo é R$ 0,01");
      return;
    }
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await createPix.mutateAsync({ data: { amount: val } });
      setPendingTxid(result.txid);
      setPixData({ copyPaste: result.copyPaste, coins: result.coins, amount: result.amount });
      refetch();
    } catch {
      Alert.alert("Erro", "Não foi possível gerar o PIX.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function handleCopy() {
    if (pixData?.copyPaste) {
      Clipboard.setString(pixData.copyPaste);
      setCopied(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  function handleReset() {
    setPixData(null);
    setPendingTxid(null);
    setAmount("");
  }

  const s = StyleSheet.create({
    scroll: { paddingHorizontal: 20, paddingTop, paddingBottom },
    title: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold", marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 24 },
    card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 20, marginBottom: 20 },
    cardTitle: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 16 },
    cardTitleRow: { flexDirection: "row" as const, alignItems: "center", gap: 8, marginBottom: 16 },
    label: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 8 },
    presetsRow: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8, marginBottom: 16 },
    presetBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: "center" as const,
      minWidth: 64,
    },
    presetValue: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
    presetCoins: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
    inputRow: { flexDirection: "row" as const, alignItems: "center", backgroundColor: colors.secondary, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, marginBottom: 8 },
    input: { flex: 1, color: colors.foreground, fontSize: 16, paddingVertical: 13, fontFamily: "Inter_400Regular" },
    coinsPreview: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 16 },
    generateBtn: { borderRadius: 12, overflow: "hidden" as const },
    generateBtnGrad: { flexDirection: "row" as const, alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
    generateBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
    pixAmountBox: {
      backgroundColor: colors.primary + "15",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary + "30",
      padding: 16,
      alignItems: "center" as const,
      marginBottom: 16,
    },
    pixAmountCoins: { fontSize: 28, fontWeight: "700" as const, fontFamily: "Inter_700Bold", color: colors.primary },
    pixAmountBrl: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    paidBox: {
      backgroundColor: "#22C55E20",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#22C55E40",
      padding: 20,
      alignItems: "center" as const,
      gap: 8,
      marginBottom: 12,
    },
    paidText: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", color: "#22C55E" },
    paidSub: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    copyLabel: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 8 },
    pixCodeBox: {
      backgroundColor: colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 12,
    },
    pixCode: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    copyBtn: {
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 13,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.secondary,
      marginBottom: 12,
    },
    copyBtnText: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    waitingRow: { flexDirection: "row" as const, alignItems: "center", gap: 8 },
    waitingText: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    resetBtn: { alignItems: "center" as const, padding: 10, marginTop: 4 },
    resetText: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    historyItem: {
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "space-between",
      padding: 14,
      backgroundColor: colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    historyCoins: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    historyDetails: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
    emptyBox: { alignItems: "center" as const, paddingVertical: 32, gap: 8 },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
  });

  const isPaid = pixStatus?.status === "paid";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <Text style={[s.title, { color: colors.foreground }]}>Comprar Moedas</Text>
      <Text style={s.subtitle}>1 BRL = 100 moedas • Pagamento via PIX instantâneo</Text>

      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <Feather name="credit-card" size={18} color={colors.primary} />
          <Text style={[s.cardTitle, { marginBottom: 0 }]}>Gerar PIX</Text>
        </View>

        {!pixData ? (
          <>
            <Text style={s.label}>Valores rápidos</Text>
            <View style={s.presetsRow}>
              {PRESETS.map((p) => {
                const sel = amount === String(p);
                return (
                  <Pressable
                    key={p}
                    style={[
                      s.presetBtn,
                      {
                        backgroundColor: sel ? colors.primary + "20" : colors.secondary,
                        borderColor: sel ? colors.primary + "60" : colors.border,
                      },
                    ]}
                    onPress={() => setAmount(String(p))}
                  >
                    <Text style={[s.presetValue, { color: sel ? colors.primary : colors.foreground }]}>
                      R$ {p}
                    </Text>
                    <Text style={[s.presetCoins, { color: sel ? colors.primary : colors.mutedForeground }]}>
                      {p * 100} moedas
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={s.label}>Ou digite o valor (R$)</Text>
            <View style={s.inputRow}>
              <Text style={{ color: colors.mutedForeground, fontSize: 16, paddingRight: 6 }}>R$</Text>
              <TextInput
                style={s.input}
                placeholder="10,00"
                placeholderTextColor={colors.mutedForeground}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
            {amount && parseFloat(amount) > 0 ? (
              <Text style={s.coinsPreview}>
                = {Math.floor(parseFloat(amount) * 100)} moedas
              </Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [s.generateBtn, { opacity: pressed || createPix.isPending ? 0.75 : 1 }]}
              onPress={handleCreatePix}
              disabled={createPix.isPending || !amount}
            >
              <LinearGradient
                colors={["#8B3FFF", "#6B1FDF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.generateBtnGrad}
              >
                {createPix.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Feather name="dollar-sign" size={18} color="#FFF" />
                    <Text style={s.generateBtnText}>Gerar PIX</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </>
        ) : (
          <>
            <View style={s.pixAmountBox}>
              <Text style={s.pixAmountCoins}>{pixData.coins} moedas</Text>
              <Text style={s.pixAmountBrl}>R$ {pixData.amount.toFixed(2)}</Text>
            </View>

            {isPaid ? (
              <View style={s.paidBox}>
                <Feather name="check-circle" size={32} color="#22C55E" />
                <Text style={s.paidText}>Pagamento confirmado!</Text>
                <Text style={s.paidSub}>{pixData.coins} moedas adicionadas ao saldo.</Text>
              </View>
            ) : (
              <>
                <Text style={s.copyLabel}>PIX Copia e Cola</Text>
                <View style={s.pixCodeBox}>
                  <Text style={s.pixCode} numberOfLines={3}>{pixData.copyPaste}</Text>
                </View>
                <Pressable style={s.copyBtn} onPress={handleCopy}>
                  <Feather name={copied ? "check-circle" : "copy"} size={18} color={copied ? "#22C55E" : colors.foreground} />
                  <Text style={[s.copyBtnText, { color: copied ? "#22C55E" : colors.foreground }]}>
                    {copied ? "Copiado!" : "Copiar Código PIX"}
                  </Text>
                </Pressable>
                <View style={s.waitingRow}>
                  <ActivityIndicator color="#F59E0B" size="small" />
                  <Text style={s.waitingText}>Aguardando pagamento... verificando automaticamente</Text>
                </View>
              </>
            )}

            <Pressable style={s.resetBtn} onPress={handleReset}>
              <Text style={s.resetText}>Gerar novo PIX</Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={s.card}>
        <View style={s.cardTitleRow}>
          <Feather name="clock" size={18} color={colors.mutedForeground} />
          <Text style={[s.cardTitle, { marginBottom: 0 }]}>Histórico</Text>
        </View>

        {historyLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : history && history.length > 0 ? (
          history.map((payment) => {
            const st = STATUS_LABELS[payment.status] ?? STATUS_LABELS.pending;
            const date = new Date(payment.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <View key={payment.id} style={s.historyItem}>
                <View>
                  <Text style={s.historyCoins}>+{payment.coins} moedas</Text>
                  <Text style={s.historyDetails}>
                    R$ {payment.amount.toFixed(2)} • {date}
                  </Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
                  <Text style={[s.statusText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={s.emptyBox}>
            <Feather name="dollar-sign" size={32} color={colors.mutedForeground} />
            <Text style={s.emptyText}>Nenhuma recarga realizada</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
