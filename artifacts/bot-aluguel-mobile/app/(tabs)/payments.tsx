import {
  useActivatePlan,
  useCheckPixStatus,
  useCreatePixCharge,
  useGetDashboardStats,
  useGetPaymentHistory,
  useListPlans,
} from "@workspace/api-client-react";
import { Clipboard } from "react-native";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W * 0.74;

type Plan = {
  id: string;
  name: string;
  description: string;
  coins: number;
  days: number;
  maxGroups: number;
  features: string[];
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente",  color: "#F59E0B", bg: "#F59E0B15" },
  paid:    { label: "Pago",      color: "#22C55E", bg: "#22C55E15" },
  expired: { label: "Expirado",  color: "#9CA3AF", bg: "#9CA3AF15" },
  error:   { label: "Erro",      color: "#EF4444", bg: "#EF444415" },
};

function PlanCard({ plan, isActive, coins, onActivate, loading }: {
  plan: Plan; isActive: boolean; coins: number; onActivate: () => void; loading: boolean;
}) {
  const canAfford = coins >= plan.coins;
  const missing = plan.coins - coins;

  return (
    <View style={[p.card, isActive && p.cardActive]}>
      {/* Header Row */}
      <View style={p.headerRow}>
        <LinearGradient
          colors={["#7C3AED", "#C026D3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={p.iconGrad}
        >
          <Feather name="star" size={18} color="#FFF" />
        </LinearGradient>

        <View style={{ flex: 1, paddingLeft: 12 }}>
          <View style={p.nameLine}>
            <Text style={p.name}>{plan.name}</Text>
            {isActive && (
              <View style={p.activeBadge}>
                <Text style={p.activeBadgeText}>ATIVO</Text>
              </View>
            )}
          </View>
          <Text style={p.desc} numberOfLines={1}>{plan.description}</Text>
        </View>

        <View style={p.priceBlock}>
          <Text style={p.priceVal}>{plan.coins}</Text>
          <Text style={p.priceUnit}>moedas / {plan.days}d</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={p.divider} />

      {/* Features */}
      <View style={p.features}>
        {plan.features.slice(0, 3).map((f, i) => (
          <View key={i} style={p.feature}>
            <View style={p.checkWrap}>
              <Feather name="check" size={11} color="#A78BFA" />
            </View>
            <Text style={p.featureText}>{f}</Text>
          </View>
        ))}
        {plan.maxGroups > 0 && (
          <View style={p.feature}>
            <View style={p.checkWrap}>
              <Feather name="users" size={11} color="#A78BFA" />
            </View>
            <Text style={p.featureText}>
              {plan.maxGroups < 0 ? "Grupos ilimitados" : `Até ${plan.maxGroups} grupos`}
            </Text>
          </View>
        )}
      </View>

      {/* CTA Button */}
      <Pressable
        style={({ pressed }) => [
          p.btn,
          isActive ? p.btnActive : canAfford ? p.btnPrimary : p.btnDisabled,
          { opacity: pressed || loading ? 0.82 : 1 },
        ]}
        onPress={onActivate}
        disabled={isActive || loading || !canAfford}
      >
        {loading ? (
          <ActivityIndicator color={isActive ? "#A78BFA" : "#FFF"} size="small" />
        ) : (
          <Text style={[
            p.btnText,
            isActive && p.btnActiveText,
            !canAfford && !isActive && p.btnDisabledText,
          ]}>
            {isActive
              ? "Plano ativo"
              : canAfford
              ? "Ativar plano"
              : `Faltam ${missing} moedas`}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState("");
  const [pendingTxid, setPendingTxid] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ copyPaste?: string | null; coins: number; amount: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const createPix = useCreatePixCharge();
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useGetPaymentHistory();
  const { data: plans, isLoading: plansLoading } = useListPlans();
  const { data: stats, refetch: refetchStats } = useGetDashboardStats();
  const activatePlan = useActivatePlan();

  const { data: pixStatus } = useCheckPixStatus(pendingTxid ?? "", {
    query: { enabled: !!pendingTxid, refetchInterval: 10000 },
  });

  useEffect(() => {
    if (pixStatus?.status === "paid" && pendingTxid) {
      refetchHistory();
      refetchStats();
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

  const handleActivate = (plan: Plan) => {
    Alert.alert("Ativar plano", `Ativar "${plan.name}" por ${plan.coins} moedas?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          setActivatingId(plan.id);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          try {
            await activatePlan.mutateAsync({ planId: plan.id });
            await refetchStats();
          } catch {
            Alert.alert("Erro", "Não foi possível ativar o plano.");
          } finally {
            setActivatingId(null);
          }
        },
      },
    ]);
  };

  const paddingBottom = Platform.OS === "web" ? 34 + 110 : insets.bottom + 110;
  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;
  const historyList = (history as any[] | undefined) ?? [];
  const planList = (plans as Plan[] | undefined) ?? [];
  const coins = stats?.coins ?? 0;
  const activePlan = stats?.activePlan;

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={[s.header, { paddingTop }]}>
        <Text style={s.headerTitle}>Moedas & Planos</Text>
        <Text style={s.headerSub}>R$ 1,00 = 100 moedas</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={historyLoading}
            onRefresh={() => { refetchHistory(); refetchStats(); }}
            tintColor="#7C3AED"
          />
        }
      >
        <View style={s.inner}>
          {/* Balance Card */}
          <LinearGradient
            colors={["#1C1828", "#181520"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.balanceCard}
          >
            <View style={s.balanceCardInner}>
              <View>
                <Text style={s.balanceLabel}>Saldo atual</Text>
                <View style={s.balanceRow}>
                  <Text style={s.balanceValue}>{coins}</Text>
                  <Text style={s.balanceCoin}> moedas</Text>
                </View>
              </View>
              <Feather name="zap" size={34} color="#7C3AED" style={{ opacity: 0.85 }} />
            </View>
          </LinearGradient>

          {/* PLANOS section label */}
          <View style={s.sectionRow}>
            <Feather name="star" size={13} color="#7C3AED" />
            <Text style={s.sectionLabel}>PLANOS</Text>
          </View>
        </View>

        {/* Plans carousel */}
        {plansLoading ? (
          <View style={s.loaderBox}><ActivityIndicator color="#7C3AED" size="large" /></View>
        ) : planList.length === 0 ? (
          <View style={[s.inner, { marginBottom: 8 }]}>
            <View style={s.emptyBlock}>
              <Text style={s.emptyText}>Nenhum plano disponível</Text>
            </View>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.carousel}
            decelerationRate="fast"
            snapToInterval={CARD_W + 12}
            snapToAlignment="start"
          >
            {planList.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isActive={activePlan === plan.name}
                coins={coins}
                onActivate={() => handleActivate(plan)}
                loading={activatingId === plan.id}
              />
            ))}
          </ScrollView>
        )}

        <View style={s.inner}>
          {/* PIX section */}
          <Text style={s.inputLabel}>VALOR PERSONALIZADO</Text>
          <View style={s.inputRow}>
            <Text style={s.currency}>R$</Text>
            <TextInput
              style={s.input}
              placeholder="0,00"
              placeholderTextColor="#3D3D52"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(",", "."))}
            />
          </View>

          {amount && parseFloat(amount) > 0 && (
            <View style={s.coinsPreview}>
              <Feather name="zap" size={13} color="#7C3AED" />
              <Text style={s.coinsPreviewText}>
                Você receberá{" "}
                <Text style={s.coinsPreviewHighlight}>
                  {Math.round(parseFloat(amount) * 100)} moedas
                </Text>
              </Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [s.pixBtn, { opacity: pressed || createPix.isPending || !amount ? 0.72 : 1 }]}
            onPress={handleCreatePix}
            disabled={createPix.isPending || !amount}
          >
            <LinearGradient
              colors={["#7C3AED", "#4F46E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.pixBtnGrad}
            >
              {createPix.isPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={s.pixBtnText}>Gerar PIX  →</Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* PIX result card */}
          {pixData && (
            <View style={s.pixCard}>
              <View style={s.pixCardHeader}>
                <View style={s.pixCheckWrap}>
                  <Feather name="check-circle" size={18} color="#22C55E" />
                </View>
                <View>
                  <Text style={s.pixCardTitle}>PIX gerado com sucesso</Text>
                  <Text style={s.pixCardSub}>{pixData.coins} moedas por R$ {pixData.amount.toFixed(2)}</Text>
                </View>
              </View>

              {pixStatus?.status === "paid" ? (
                <View style={s.paidRow}>
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

          {/* History */}
          <Text style={[s.sectionLabel, { marginTop: 8, letterSpacing: 1.4 }]}>HISTORICO DE COMPRAS</Text>
          {historyLoading ? (
            <View style={s.loaderBox}><ActivityIndicator color="#7C3AED" /></View>
          ) : historyList.length === 0 ? (
            <View style={s.emptyBlock}>
              <Feather name="inbox" size={26} color="#3D3D52" />
              <Text style={s.emptyText}>Nenhum pagamento ainda</Text>
            </View>
          ) : (
            <View style={s.historyCard}>
              {historyList.map((item: any, i: number) => {
                const cfg = STATUS_CFG[item.status] ?? STATUS_CFG.pending;
                const itemCoins = item.coins ?? Math.round(parseFloat(item.amount ?? 0) * 100);
                const date = new Date(item.createdAt);
                const dateStr =
                  date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).toUpperCase() +
                  ", " +
                  date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                return (
                  <View key={item.id} style={[s.histRow, i < historyList.length - 1 && s.histRowBorder]}>
                    <View style={s.histIcon}>
                      <Text style={s.histIconText}>R$</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.histAmount}>R$ {parseFloat(item.amount ?? 0).toFixed(2)}</Text>
                      <Text style={s.histCoins}>+{itemCoins.toLocaleString("pt-BR")} moedas</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <Feather name="clock" size={10} color="#3D3D52" />
                        <Text style={s.histDate}>{dateStr}</Text>
                      </View>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + "40" }]}>
                      <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label.toUpperCase()}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ─── Plan Card styles ─── */
const p = StyleSheet.create({
  card: {
    width: CARD_W,
    backgroundColor: "#141320",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#252235",
    padding: 18,
    gap: 14,
  },
  cardActive: {
    borderColor: "#7C3AED",
    borderWidth: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconGrad: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  nameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  cardMeta: { flex: 1 },
  name: { fontSize: 17, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  activeBadge: {
    backgroundColor: "#7C3AED20",
    borderWidth: 1,
    borderColor: "#7C3AED40",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  activeBadgeText: { fontSize: 9, color: "#A78BFA", fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  desc: { fontSize: 12, color: "#6B6B80", fontFamily: "Inter_400Regular" },
  priceBlock: { alignItems: "flex-end", paddingLeft: 8, flexShrink: 0 },
  priceVal: { fontSize: 24, color: "#7C3AED", fontFamily: "Inter_700Bold" },
  priceUnit: { fontSize: 10, color: "#6B6B80", fontFamily: "Inter_400Regular", marginTop: 1 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#252235" },
  features: { gap: 9 },
  feature: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkWrap: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: "#7C3AED15",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: { fontSize: 13, color: "#A0A0B5", fontFamily: "Inter_400Regular", flex: 1 },
  btn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: { backgroundColor: "#7C3AED" },
  btnActive: { backgroundColor: "#7C3AED18", borderWidth: 1, borderColor: "#7C3AED40" },
  btnDisabled: { backgroundColor: "#1A1828", borderWidth: 1, borderColor: "#252235" },
  btnText: { fontSize: 14, color: "#FFF", fontFamily: "Inter_700Bold" },
  btnActiveText: { color: "#A78BFA" },
  btnDisabledText: { color: "#4A4A60" },
});

/* ─── Screen styles ─── */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0D12" },

  header: {
    paddingHorizontal: 22,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 23, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, color: "#6B6B80", fontFamily: "Inter_400Regular", marginTop: 4 },

  inner: { paddingHorizontal: 20 },

  /* Balance Card */
  balanceCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#252235",
    marginBottom: 22,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  balanceCardInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
  },
  balanceLabel: { fontSize: 13, color: "#6B6B80", fontFamily: "Inter_400Regular", marginBottom: 8 },
  balanceRow: { flexDirection: "row", alignItems: "baseline" },
  balanceValue: { fontSize: 36, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  balanceCoin: { fontSize: 17, color: "#A78BFA", fontFamily: "Inter_600SemiBold" },

  /* Section label */
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    color: "#6B6B80",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.6,
  },

  /* Carousel */
  carousel: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 4,
    marginBottom: 24,
  },

  /* PIX */
  inputLabel: {
    fontSize: 11,
    color: "#6B6B80",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141320",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#252235",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  currency: { fontSize: 18, color: "#6B6B80", fontFamily: "Inter_700Bold", marginRight: 4 },
  input: { flex: 1, color: "#F0F0F5", fontSize: 22, paddingVertical: 14, fontFamily: "Inter_700Bold" },

  coinsPreview: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  coinsPreviewText: { fontSize: 13, color: "#6B6B80", fontFamily: "Inter_400Regular" },
  coinsPreviewHighlight: { color: "#A78BFA", fontFamily: "Inter_700Bold" },

  pixBtn: { borderRadius: 14, overflow: "hidden", marginBottom: 16 },
  pixBtnGrad: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  pixBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },

  /* PIX card */
  pixCard: {
    backgroundColor: "#141320",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#252235",
    borderLeftWidth: 3,
    borderLeftColor: "#22C55E",
    padding: 18,
    marginBottom: 20,
    gap: 12,
  },
  pixCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  pixCheckWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#22C55E15", alignItems: "center", justifyContent: "center",
  },
  pixCardTitle: { fontSize: 15, color: "#F0F0F5", fontFamily: "Inter_700Bold" },
  pixCardSub: { fontSize: 12, color: "#6B6B80", fontFamily: "Inter_400Regular", marginTop: 2 },
  codeBox: {
    backgroundColor: "#22C55E0D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22C55E25",
    padding: 14,
  },
  codeText: { fontSize: 12, color: "#C4C4D4", fontFamily: "Inter_400Regular", lineHeight: 19 },
  copyBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 12, borderWidth: 1, borderColor: "#7C3AED50",
    paddingVertical: 13,
  },
  copyBtnDone: { borderColor: "#22C55E40" },
  copyText: { fontSize: 14, color: "#A78BFA", fontFamily: "Inter_600SemiBold" },
  waitText: { textAlign: "center", fontSize: 12, color: "#6B6B80", fontFamily: "Inter_400Regular" },
  paidRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#22C55E15", borderRadius: 12, padding: 14,
  },
  paidText: { fontSize: 14, color: "#22C55E", fontFamily: "Inter_600SemiBold" },

  /* History */
  historyCard: {
    backgroundColor: "#141320",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#252235",
    overflow: "hidden",
    marginTop: 10,
  },
  histRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  histRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#252235" },
  histIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#7C3AED15", borderWidth: 1,
    borderColor: "#7C3AED25", alignItems: "center", justifyContent: "center",
  },
  histIconText: { fontSize: 12, color: "#A78BFA", fontFamily: "Inter_700Bold" },
  histAmount: { fontSize: 15, color: "#F0F0F5", fontFamily: "Inter_600SemiBold" },
  histCoins: { fontSize: 12, color: "#A78BFA", fontFamily: "Inter_400Regular", marginTop: 1 },
  histDate: { fontSize: 11, color: "#3D3D52", fontFamily: "Inter_400Regular" },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },

  loaderBox: { paddingVertical: 32, alignItems: "center", marginBottom: 16 },
  emptyBlock: {
    alignItems: "center", gap: 8, paddingVertical: 28,
    backgroundColor: "#141320", borderRadius: 16,
    borderWidth: 1, borderColor: "#252235", marginBottom: 16,
  },
  emptyText: { fontSize: 14, color: "#6B6B80", fontFamily: "Inter_400Regular" },
});
