import {
  useActivatePlan,
  useCheckPixStatus,
  useCreatePixCharge,
  useGetDashboardStats,
  useGetPaymentHistory,
  useListPlans,
} from "@workspace/api-client-react";
import { Clipboard } from "react-native";
import { parseApiError } from "@/utils/parseApiError";
import { ErrorCard } from "@/components/ErrorCard";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
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
      {/* Header */}
      <View style={p.headerRow}>
        <View style={p.iconWrap}>
          <Feather name="star" size={16} color="#A78BFA" />
        </View>
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <View style={p.nameLine}>
            <Text style={p.name}>{plan.name}</Text>
            {isActive && (
              <View style={p.activeBadge}>
                <Feather name="check-circle" size={10} color="#22C55E" />
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

      <View style={p.divider} />

      {/* Features */}
      <View style={p.features}>
        {plan.features.slice(0, 3).map((f, i) => (
          <View key={i} style={p.feature}>
            <Feather name="check" size={12} color="#22C55E" />
            <Text style={p.featureText}>{f}</Text>
          </View>
        ))}
        {plan.maxGroups !== 0 && (
          <View style={p.feature}>
            <Feather name="users" size={12} color="#8E8E9E" />
            <Text style={p.featureText}>
              {plan.maxGroups < 0 ? "Grupos ilimitados" : `Até ${plan.maxGroups} grupos`}
            </Text>
          </View>
        )}
      </View>

      {/* CTA */}
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
          <Text style={[p.btnText, isActive && p.btnActiveText, !canAfford && !isActive && p.btnDisabledText]}>
            {isActive ? "Plano ativo" : canAfford ? "Ativar plano" : `Faltam ${missing} moedas`}
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
  const [pixData, setPixData] = useState<{ copyPaste?: string | null; qrCodeBase64?: string | null; coins: number; amount: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const copyScale = useRef(new Animated.Value(1)).current;

  const createPix = useCreatePixCharge();
  const { data: history, isLoading: historyLoading, isError: historyError, refetch: refetchHistory } = useGetPaymentHistory();
  const { data: plans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = useListPlans();
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
      setPixData({ copyPaste: result.copyPaste, qrCodeBase64: result.qrCodeBase64, coins: result.coins, amount: amtNum });
      setPendingTxid(result.txid ?? null);
    } catch (err) { Alert.alert("Erro ao gerar PIX", parseApiError(err)); }
  };

  const handleCopy = async () => {
    if (!pixData?.copyPaste) return;
    Clipboard.setString(pixData.copyPaste);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Bounce animation
    Animated.sequence([
      Animated.spring(copyScale, { toValue: 0.88, useNativeDriver: true, speed: 40 }),
      Animated.spring(copyScale, { toValue: 1.06, useNativeDriver: true, speed: 20 }),
      Animated.spring(copyScale, { toValue: 1,    useNativeDriver: true, speed: 20 }),
    ]).start();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
          } catch (err) {
            Alert.alert("Erro ao ativar plano", parseApiError(err));
          } finally { setActivatingId(null); }
        },
      },
    ]);
  };

  const paddingBottom = Platform.OS === "web" ? 34 + 110 : insets.bottom + 110;
  const paddingTop    = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;
  const historyList   = Array.isArray(history) ? history : [];
  const planList      = (plans as Plan[] | undefined) ?? [];
  const coins         = stats?.coins ?? 0;
  const activePlan    = stats?.activePlan;

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
            tintColor="#6D28D9"
          />
        }
      >
        <View style={s.inner}>
          {/* Balance Card */}
          <View style={s.balanceCard}>
            <View>
              <Text style={s.balanceLabel}>Saldo atual</Text>
              <View style={s.balanceRow}>
                <Text style={s.balanceValue}>{coins}</Text>
                <Text style={s.balanceCoin}> moedas</Text>
              </View>
            </View>
            <View style={s.balanceIconWrap}>
              <Feather name="zap" size={20} color="#A78BFA" />
            </View>
          </View>

          {/* PLANOS label */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>PLANOS</Text>
          </View>
        </View>

        {/* Plans carousel */}
        {plansLoading ? (
          <View style={s.loaderBox}><ActivityIndicator color="#6D28D9" size="large" /></View>
        ) : plansError ? (
          <View style={s.inner}>
            <ErrorCard message="Não foi possível carregar os planos." onRetry={() => refetchPlans()} />
          </View>
        ) : planList.length === 0 ? (
          <View style={s.inner}>
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
          {/* COMPRAR MOEDAS */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>COMPRAR MOEDAS</Text>
          </View>

          {/* Preset amounts */}
          <View style={s.presetGrid}>
            {[0.01, 5, 10, 25, 50, 100].map((val) => (
              <Pressable
                key={val}
                style={({ pressed }) => [s.presetBtn, amount === String(val) && s.presetBtnActive, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => setAmount(String(val))}
              >
                <Text style={[s.presetText, amount === String(val) && s.presetTextActive]}>
                  R$ {val < 1 ? val.toFixed(2) : val}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Custom amount */}
          <Text style={s.inputLabel}>VALOR PERSONALIZADO</Text>
          <View style={[s.inputRow, amount && parseFloat(amount) > 0 && s.inputRowActive]}>
            <Text style={s.currency}>R$</Text>
            <TextInput
              style={s.input}
              placeholder="0,00"
              placeholderTextColor="#555566"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(",", "."))}
            />
          </View>

          {amount && parseFloat(amount) > 0 && (
            <View style={s.coinsPreview}>
              <Feather name="zap" size={12} color="#A78BFA" />
              <Text style={s.coinsPreviewText}>
                Você receberá{" "}
                <Text style={s.coinsPreviewHighlight}>
                  {Math.round(parseFloat(amount) * 100)} moedas
                </Text>
              </Text>
            </View>
          )}

          {/* PIX button */}
          <Pressable
            style={({ pressed }) => [s.pixBtn, { opacity: pressed || createPix.isPending || !amount ? 0.7 : 1 }]}
            onPress={handleCreatePix}
            disabled={createPix.isPending || !amount}
          >
            {createPix.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Feather name="credit-card" size={16} color="#FFF" />
                <Text style={s.pixBtnText}>Gerar PIX</Text>
              </>
            )}
          </Pressable>

          {/* PIX result */}
          {pixData && (
            <View style={s.pixCard}>
              <View style={s.pixCardHeader}>
                <View style={s.pixCheckWrap}>
                  <Feather name="check-circle" size={16} color="#22C55E" />
                </View>
                <View>
                  <Text style={s.pixCardTitle}>PIX gerado com sucesso</Text>
                  <Text style={s.pixCardSub}>{pixData.coins} moedas · R$ {pixData.amount.toFixed(2)}</Text>
                </View>
              </View>

              {pixStatus?.status === "paid" ? (
                <View style={s.paidRow}>
                  <Feather name="check" size={13} color="#22C55E" />
                  <Text style={s.paidText}>Pagamento confirmado! Moedas adicionadas.</Text>
                </View>
              ) : (
                <>
                  {pixData.qrCodeBase64 && (
                    <View style={s.qrWrap}>
                      <Image
                        source={{ uri: pixData.qrCodeBase64 }}
                        style={s.qrImage}
                        resizeMode="contain"
                      />
                      <Text style={s.qrHint}>Escaneie com o app do banco</Text>
                    </View>
                  )}
                  <View style={s.codeBox}>
                    <Text style={s.codeText} numberOfLines={3}>{pixData.copyPaste ?? "—"}</Text>
                  </View>
                  <Animated.View style={{ transform: [{ scale: copyScale }] }}>
                    <Pressable
                      style={({ pressed }) => [
                        s.copyBtn,
                        copied ? s.copyBtnDone : s.copyBtnDefault,
                        { opacity: pressed ? 0.8 : 1 },
                      ]}
                      onPress={handleCopy}
                    >
                      <Feather
                        name={copied ? "check-circle" : "copy"}
                        size={15}
                        color="#22C55E"
                      />
                      <Text style={[s.copyText, copied && s.copyTextDone]}>
                        {copied ? "Copiado com sucesso!" : "Copiar código PIX"}
                      </Text>
                    </Pressable>
                  </Animated.View>
                  <Text style={s.waitText}>Aguardando pagamento...</Text>
                </>
              )}
            </View>
          )}

          {/* History */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>HISTORICO DE COMPRAS</Text>
          </View>

          {historyLoading ? (
            <View style={s.loaderBox}><ActivityIndicator color="#6D28D9" /></View>
          ) : historyError ? (
            <ErrorCard message="Não foi possível carregar o histórico de pagamentos." onRetry={() => refetchHistory()} />
          ) : historyList.length === 0 ? (
            <View style={s.emptyBlock}>
              <Feather name="inbox" size={24} color="#8E8E9E" />
              <Text style={s.emptyText}>Nenhum pagamento ainda</Text>
            </View>
          ) : (
            <View style={s.histCard}>
              {historyList.map((item: any, i: number) => {
                const cfg = STATUS_CFG[item.status] ?? STATUS_CFG.pending;
                const itemCoins = item.coins ?? Math.round(parseFloat(item.amount ?? 0) * 100);
                const date = new Date(item.createdAt);
                const dateStr =
                  date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).toUpperCase() +
                  " " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                return (
                  <View key={item.id} style={[s.histRow, i < historyList.length - 1 && s.histRowBorder]}>
                    <View style={s.histIconWrap}>
                      <Text style={s.histIconText}>R$</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.histAmount}>R$ {parseFloat(item.amount ?? 0).toFixed(2)}</Text>
                      <Text style={s.histCoins}>+{itemCoins.toLocaleString("pt-BR")} moedas</Text>
                      <View style={s.histDateRow}>
                        <Feather name="clock" size={10} color="#555566" />
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
    backgroundColor: "#13131D",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#20202B",
    padding: 18,
    gap: 14,
  },
  cardActive: { borderColor: "#6D28D9", borderWidth: 2 },
  headerRow: { flexDirection: "row", alignItems: "flex-start" },
  iconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#6D28D915", borderWidth: 1, borderColor: "#6D28D930",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  nameLine: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 3 },
  name: { fontSize: 17, color: "#EBEBF2", fontFamily: "Inter_700Bold" },
  activeBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#22C55E15", borderWidth: 1, borderColor: "#22C55E30",
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
  },
  activeBadgeText: { fontSize: 9, color: "#22C55E", fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  desc: { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_400Regular" },
  priceBlock: { alignItems: "flex-end", paddingLeft: 8, flexShrink: 0 },
  priceVal:  { fontSize: 24, color: "#A78BFA", fontFamily: "Inter_700Bold" },
  priceUnit: { fontSize: 10, color: "#8E8E9E", fontFamily: "Inter_400Regular", marginTop: 1 },
  divider:   { height: StyleSheet.hairlineWidth, backgroundColor: "#20202B" },
  features: { gap: 9 },
  feature: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 13, color: "#8E8E9E", fontFamily: "Inter_400Regular", flex: 1 },
  btn: {
    borderRadius: 12, paddingVertical: 13,
    alignItems: "center", justifyContent: "center",
  },
  btnPrimary:  { backgroundColor: "#6D28D9" },
  btnActive:   { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  btnDisabled: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  btnText:         { fontSize: 14, color: "#FFF",    fontFamily: "Inter_700Bold" },
  btnActiveText:   { color: "#A78BFA" },
  btnDisabledText: { color: "#555566" },
});

/* ─── Screen styles ─── */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0C0C11" },

  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, color: "#EBEBF2", fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  headerSub:   { fontSize: 13, color: "#8E8E9E", fontFamily: "Inter_400Regular", marginTop: 4 },

  inner: { paddingHorizontal: 20 },

  /* Balance */
  balanceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#13131D",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#20202B",
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_400Regular", marginBottom: 8, letterSpacing: 0.5 },
  balanceRow:   { flexDirection: "row", alignItems: "baseline" },
  balanceValue: { fontSize: 38, color: "#EBEBF2", fontFamily: "Inter_700Bold" },
  balanceCoin:  { fontSize: 16, color: "#A78BFA", fontFamily: "Inter_600SemiBold" },
  balanceIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "#20202B", alignItems: "center", justifyContent: "center",
  },

  /* Section */
  sectionHeader: { marginBottom: 12 },
  sectionLabel: {
    fontSize: 11, color: "#8E8E9E",
    fontFamily: "Inter_600SemiBold", letterSpacing: 1.5,
  },

  /* Carousel */
  carousel: { paddingHorizontal: 20, gap: 12, paddingBottom: 4, marginBottom: 24 },

  /* Preset buttons */
  presetGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16,
  },
  presetBtn: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  presetBtnActive: {
    backgroundColor: "rgba(109,40,217,0.15)",
    borderColor: "rgba(109,40,217,0.5)",
  },
  presetText: { fontSize: 14, color: "#D1D1DB", fontFamily: "Inter_600SemiBold" },
  presetTextActive: { color: "#A78BFA" },

  /* Input */
  inputLabel: {
    fontSize: 11, color: "#8E8E9E", fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5, marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16, marginBottom: 10,
  },
  inputRowActive: { borderColor: "#6D28D960" },
  currency: { fontSize: 18, color: "#8E8E9E", fontFamily: "Inter_700Bold", marginRight: 4 },
  input:    { flex: 1, color: "#EBEBF2", fontSize: 22, paddingVertical: 14, fontFamily: "Inter_700Bold" },

  coinsPreview: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  coinsPreviewText: { fontSize: 13, color: "#8E8E9E", fontFamily: "Inter_400Regular" },
  coinsPreviewHighlight: { color: "#A78BFA", fontFamily: "Inter_700Bold" },

  /* PIX button */
  pixBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#6D28D9",
    borderRadius: 14, paddingVertical: 15, marginBottom: 16,
  },
  pixBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },

  /* PIX card */
  pixCard: {
    backgroundColor: "rgba(34,197,94,0.07)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  pixCardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  pixCheckWrap: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: "rgba(34,197,94,0.15)",
    borderWidth: 1, borderColor: "rgba(34,197,94,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  pixCardTitle: { fontSize: 15, color: "#EBEBF2", fontFamily: "Inter_600SemiBold" },
  pixCardSub:   { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_400Regular", marginTop: 2 },
  qrWrap: {
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 4,
  },
  qrImage: { width: 200, height: 200 },
  qrHint: {
    fontSize: 11, color: "#555566",
    fontFamily: "Inter_400Regular",
    marginTop: 6, textAlign: "center",
  },
  codeBox: {
    backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(34,197,94,0.12)", padding: 12,
  },
  codeText: { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_400Regular", lineHeight: 18 },
  copyBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 12, paddingVertical: 13,
  },
  copyBtnDefault: {
    backgroundColor: "rgba(34,197,94,0.18)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.35)",
  },
  copyBtnDone: {
    backgroundColor: "rgba(34,197,94,0.28)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.5)",
  },
  copyText:     { fontSize: 14, color: "#22C55E", fontFamily: "Inter_700Bold" },
  copyTextDone: { color: "#22C55E" },
  waitText: { textAlign: "center", fontSize: 12, color: "rgba(34,197,94,0.6)", fontFamily: "Inter_400Regular" },
  paidRow: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: "rgba(34,197,94,0.12)", borderRadius: 10, padding: 12,
  },
  paidText: { fontSize: 14, color: "#22C55E", fontFamily: "Inter_600SemiBold" },

  /* History */
  histCard: {
    backgroundColor: "#13131D", borderRadius: 16,
    borderWidth: 1, borderColor: "#20202B", overflow: "hidden", marginTop: 4,
  },
  histRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  histRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#20202B60" },
  histIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#6D28D915", borderWidth: 1,
    borderColor: "#6D28D925", alignItems: "center", justifyContent: "center",
  },
  histIconText: { fontSize: 11, color: "#A78BFA", fontFamily: "Inter_700Bold" },
  histAmount:  { fontSize: 15, color: "#EBEBF2", fontFamily: "Inter_600SemiBold" },
  histCoins:   { fontSize: 12, color: "#A78BFA", fontFamily: "Inter_400Regular", marginTop: 1 },
  histDateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  histDate:    { fontSize: 11, color: "#555566", fontFamily: "Inter_400Regular" },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 5 },
  statusText:  { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },

  loaderBox: { paddingVertical: 32, alignItems: "center" },
  emptyBlock: {
    alignItems: "center", gap: 8, paddingVertical: 24,
    backgroundColor: "#13131D", borderRadius: 16,
    borderWidth: 1, borderColor: "#20202B", marginBottom: 16,
  },
  emptyText: { fontSize: 14, color: "#8E8E9E", fontFamily: "Inter_400Regular" },
});
