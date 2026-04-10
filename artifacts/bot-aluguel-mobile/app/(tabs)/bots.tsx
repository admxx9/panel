import {
  useCreateBot,
  useDeleteBot,
  useListBots,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Bot = {
  id: string;
  name: string;
  phone?: string | null;
  status: "disconnected" | "connecting" | "connected" | "error";
  totalGroups: number;
  createdAt: string;
  prefix: string;
};

const STATUS_CONFIG = {
  connected: { color: "#22C55E", label: "Online", icon: "wifi" },
  connecting: { color: "#F59E0B", label: "Conectando", icon: "loader" },
  disconnected: { color: "#6B7280", label: "Offline", icon: "wifi-off" },
  error: { color: "#EF4444", label: "Erro", icon: "alert-circle" },
};

const AVATAR_GRADIENTS: [string, string][] = [
  ["#F97316", "#B45309"],
  ["#C850C0", "#9D174D"],
  ["#10B981", "#065F46"],
  ["#3B82F6", "#1D4ED8"],
  ["#EF4444", "#991B1B"],
  ["#F59E0B", "#92400E"],
];

function getAvatarGradient(name: string): [string, string] {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

function StatusPulse({ color, active }: { color: string; active: boolean }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active]);

  const scale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const opacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });

  return (
    <View style={styles.pulseContainer}>
      {active && (
        <Animated.View
          style={[styles.pulseRing, { backgroundColor: color, transform: [{ scale }], opacity }]}
        />
      )}
      <View style={[styles.statusDot, { backgroundColor: color }]} />
    </View>
  );
}

function BotCard({ bot, onDelete }: { bot: Bot; onDelete: (id: string) => void }) {
  const colors = useColors();
  const status = STATUS_CONFIG[bot.status] ?? STATUS_CONFIG.disconnected;
  const grad = getAvatarGradient(bot.name);
  const initial = bot.name.charAt(0).toUpperCase();
  const pressAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(pressAnim, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const handlePressOut = () =>
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  return (
    <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push(`/bot/${bot.id}` as any)}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert("Excluir bot", `Tem certeza que deseja excluir "${bot.name}"?`, [
            { text: "Cancelar", style: "cancel" },
            { text: "Excluir", style: "destructive", onPress: () => onDelete(bot.id) },
          ]);
        }}
      >
        <View style={[styles.card, { backgroundColor: "#0F1018", borderColor: "#1E2030" }]}>
          <View style={styles.cardMain}>
            <View style={styles.avatarWrapper}>
              <LinearGradient colors={grad} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.avatarText}>{initial}</Text>
              </LinearGradient>
              <View style={styles.statusPulsePos}>
                <StatusPulse color={status.color} active={bot.status === "connected"} />
              </View>
            </View>

            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.botName, { color: "#F1F2F6" }]} numberOfLines={1}>
                {bot.name}
              </Text>
              <Text style={[styles.botPhone, { color: "#6B7280" }]}>
                {bot.phone ? bot.phone : "Sem número vinculado"}
              </Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusChip, { backgroundColor: status.color + "1A" }]}>
                  <Feather name={status.icon as any} size={10} color={status.color} />
                  <Text style={[styles.statusChipText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.statsRow, { borderTopColor: "#1E2030" }]}>
            <View style={styles.statItem}>
              <Feather name="users" size={12} color="#6B7280" />
              <Text style={[styles.statText, { color: "#6B7280" }]}>{bot.totalGroups} grupos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather name="hash" size={12} color="#6B7280" />
              <Text style={[styles.statText, { color: "#6B7280" }]}>{bot.prefix}</Text>
            </View>
          </View>

          <View style={[styles.actionRow, { borderTopColor: "#1E2030" }]}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push(`/bot/${bot.id}` as any)}
            >
              <LinearGradient
                colors={["#1E2030", "#252840"]}
                style={styles.actionBtnInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather name="smartphone" size={14} color="#8B8EA0" />
                <Text style={[styles.actionBtnText, { color: "#8B8EA0" }]}>Detalhes</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/builder/${bot.id}` as any);
              }}
            >
              <LinearGradient
                colors={["#B45309", "#F97316"]}
                style={styles.actionBtnInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather name="layout" size={14} color="#FFF" />
                <Text style={[styles.actionBtnText, { color: "#FFF" }]}>Construtor</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function BotsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const fabAnim = useRef(new Animated.Value(1)).current;

  const { data: bots, isLoading, refetch, isRefetching } = useListBots();
  const createBot = useCreateBot();
  const deleteBot = useDeleteBot();

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 100;

  const onFabPressIn = () =>
    Animated.spring(fabAnim, { toValue: 0.9, useNativeDriver: true, speed: 40 }).start();
  const onFabPressOut = () =>
    Animated.spring(fabAnim, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  async function handleCreate() {
    if (!newBotName.trim()) return;
    try {
      await createBot.mutateAsync({ data: { name: newBotName.trim() } });
      setNewBotName("");
      setShowCreateModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refetch();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBot.mutateAsync({ botId: id });
      refetch();
    } catch {
      Alert.alert("Erro", "Não foi possível excluir o bot.");
    }
  }

  const botCount = bots?.length ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#090A0F" }}>
      <FlatList
        data={bots ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BotCard bot={item as Bot} onDelete={handleDelete} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop, paddingBottom, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.screenTitle}>Meus Bots</Text>
            <Text style={[styles.screenSubtitle, { color: "#6B7280" }]}>
              {isLoading ? "Carregando..." : botCount === 0 ? "Nenhum bot criado ainda" : `${botCount} ${botCount === 1 ? "bot ativo" : "bots ativos"}`}
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator color="#F97316" size="large" />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={["#B45309", "#F97316"]}
                style={styles.emptyIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather name="cpu" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: "#F1F2F6" }]}>Nenhum bot ainda</Text>
              <Text style={[styles.emptyBody, { color: "#6B7280" }]}>
                Crie seu primeiro bot e comece a automatizar grupos no WhatsApp
              </Text>
              <Pressable
                style={styles.emptyBtn}
                onPress={() => setShowCreateModal(true)}
              >
                <LinearGradient
                  colors={["#B45309", "#F97316"]}
                  style={styles.emptyBtnInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Feather name="plus" size={16} color="#FFF" />
                  <Text style={styles.emptyBtnText}>Criar primeiro bot</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F97316" />
        }
      />

      {botCount > 0 && (
        <Animated.View
          style={[
            styles.fab,
            { bottom: insets.bottom + (Platform.OS === "web" ? 84 : 84), transform: [{ scale: fabAnim }] },
          ]}
        >
          <Pressable
            onPressIn={onFabPressIn}
            onPressOut={onFabPressOut}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowCreateModal(true);
            }}
          >
            <LinearGradient
              colors={["#B45309", "#F97316"]}
              style={styles.fabInner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="plus" size={22} color="#FFF" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}

      <Modal visible={showCreateModal} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowCreateModal(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: "#F1F2F6" }]}>Novo Bot</Text>
            <Text style={[styles.sheetSubtitle, { color: "#6B7280" }]}>
              Escolha um nome para identificar seu bot
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Bot Vendas"
              placeholderTextColor="#4B5563"
              value={newBotName}
              onChangeText={setNewBotName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={styles.sheetActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.cancelBtnText, { color: "#6B7280" }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={{ flex: 1, borderRadius: 12, overflow: "hidden" }}
                onPress={handleCreate}
                disabled={createBot.isPending}
              >
                <LinearGradient
                  colors={["#B45309", "#F97316"]}
                  style={styles.createBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {createBot.isPending ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.createBtnText}>Criar Bot</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    color: "#F1F2F6",
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  loader: { paddingVertical: 80, alignItems: "center" },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden" as const,
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
  },
  avatarWrapper: {
    position: "relative" as const,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  statusPulsePos: {
    position: "absolute" as const,
    bottom: -3,
    right: -3,
  },
  pulseContainer: {
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute" as const,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0F1018",
  },
  botName: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  botPhone: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statusRow: {
    flexDirection: "row" as const,
    marginTop: 4,
  },
  statusChip: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "500" as const,
    fontFamily: "Inter_500Medium",
  },
  statsRow: {
    flexDirection: "row" as const,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 12,
  },
  statItem: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#1E2030",
  },
  actionRow: {
    flexDirection: "row" as const,
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden" as const,
  },
  actionBtnInner: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
    gap: 14,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center" as const,
    lineHeight: 22,
  },
  emptyBtn: {
    borderRadius: 12,
    overflow: "hidden" as const,
    marginTop: 8,
  },
  emptyBtnInner: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  fab: {
    position: "absolute" as const,
    right: 20,
    borderRadius: 28,
    overflow: "hidden" as const,
    elevation: 8,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0F1018",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: "#1E2030",
    gap: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#2D2F45",
    borderRadius: 2,
    alignSelf: "center" as const,
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: -8,
  },
  input: {
    backgroundColor: "#161824",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E2030",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#F1F2F6",
    fontFamily: "Inter_400Regular",
  },
  sheetActions: {
    flexDirection: "row" as const,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#161824",
    borderWidth: 1,
    borderColor: "#1E2030",
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  createBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});
