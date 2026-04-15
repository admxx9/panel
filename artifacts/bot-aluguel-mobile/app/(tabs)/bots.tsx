import {
  useCreateBot,
  useDeleteBot,
  useListBots,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { maybeRequestReview } from "@/utils/requestReview";
import { parseApiError } from "@/utils/parseApiError";
import { BotListSkeleton } from "@/components/SkeletonLoader";
import {
  ActivityIndicator,
  Alert,
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
import { useQueryClient } from "@tanstack/react-query";
import { getListBotsQueryKey } from "@workspace/api-client-react";
import { LinearGradient } from "expo-linear-gradient";

type Bot = {
  id: string;
  name: string;
  phone?: string | null;
  status: "disconnected" | "connecting" | "connected" | "error";
  totalGroups: number;
  createdAt: string;
  prefix: string;
};

const STATUS_CFG = {
  connected:    { color: "#22C55E", label: "Online" },
  connecting:   { color: "#F59E0B", label: "Conectando" },
  disconnected: { color: "#9CA3AF", label: "Offline" },
  error:        { color: "#EF4444", label: "Erro" },
};

function BotCard({ bot, onDelete }: { bot: Bot; onDelete: (id: string, name: string) => void }) {
  const cfg = STATUS_CFG[bot.status] ?? STATUS_CFG.disconnected;

  return (
    <View style={card.wrap}>
      <View style={card.inner}>
        <View style={card.iconCircle}>
          <Feather name="message-circle" size={22} color="#A78BFA" />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={card.name} numberOfLines={1}>{bot.name}</Text>
          <View style={card.metaRow}>
            <View style={card.statusPill}>
              <View style={[card.statusDot, { backgroundColor: cfg.color }]} />
              <Text style={[card.statusText, { color: "#8E8E9E" }]}>{cfg.label}</Text>
            </View>
            <Text style={card.detail}>
              · {bot.totalGroups} grupo{bot.totalGroups !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [card.actionBtn, pressed && { opacity: 0.6 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/bot/${bot.id}` as any);
          }}
        >
          <Feather name="chevron-right" size={18} color="#8E8E9E" />
        </Pressable>
      </View>

      <View style={card.actions}>
        <Pressable
          style={({ pressed }) => [card.btn, card.btnOutline, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/bot/${bot.id}` as any);
          }}
        >
          <Feather name="settings" size={13} color="#8E8E9E" />
          <Text style={card.btnOutlineText}>Gerenciar</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [card.btn, card.btnPrimary, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/builder/${bot.id}` as any);
          }}
        >
          <Feather name="grid" size={13} color="#FFF" />
          <Text style={card.btnPrimaryText}>Builder</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [card.btn, card.btnDanger, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDelete(bot.id, bot.name);
          }}
        >
          <Feather name="trash-2" size={13} color="#EF4444" />
        </Pressable>
      </View>
    </View>
  );
}

export default function BotsScreen() {
  const insets = useSafeAreaInsets();
  const { data: bots, isLoading, isError, refetch, isRefetching } = useListBots();
  const createBot = useCreateBot();
  const deleteBot = useDeleteBot();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newBotName, setNewBotName] = useState("");

  const paddingBottom = insets.bottom + 110;

  const handleCreate = async () => {
    if (!newBotName.trim()) return;
    try {
      await createBot.mutateAsync({ data: { name: newBotName.trim() } });
      queryClient.invalidateQueries({ queryKey: getListBotsQueryKey() });
      setNewBotName("");
      setShowCreate(false);
      setTimeout(() => maybeRequestReview(), 2000);
    } catch (err) {
      Alert.alert("Erro ao criar bot", parseApiError(err));
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Remover bot", `Deseja remover "${name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          await deleteBot.mutateAsync({ botId: id });
          queryClient.invalidateQueries({ queryKey: getListBotsQueryKey() });
        },
      },
    ]);
  };

  const botList = (bots as Bot[] | undefined) ?? [];
  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;

  return (
    <View style={s.root}>
      <View style={s.blobWrap} pointerEvents="none">
        <LinearGradient
          colors={["rgba(109,40,217,0.25)", "transparent"]}
          style={[s.blob, { top: -80, left: -40, width: 240, height: 240 }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <LinearGradient
          colors={["rgba(167,139,250,0.15)", "transparent"]}
          style={[s.blob, { bottom: -40, right: -40, width: 280, height: 280 }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <LinearGradient
          colors={["rgba(34,197,94,0.08)", "transparent"]}
          style={[s.blob, { top: "40%", left: "55%", width: 180, height: 180 }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <View style={[s.header, { paddingTop }]}>
        <Text style={s.headerTitle}>Meus Bots</Text>
        <Pressable
          style={({ pressed }) => [s.addBtn, pressed && { opacity: 0.8 }]}
          onPress={() => setShowCreate(true)}
        >
          <Feather name="plus" size={22} color="#EBEBF2" />
        </Pressable>
      </View>

      {isLoading && botList.length === 0 ? (
        <BotListSkeleton />
      ) : (
        <FlatList
          data={botList}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ padding: 16, paddingBottom }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6D28D9" />
          }
          ListEmptyComponent={
            isError ? (
              <View style={s.empty}>
                <View style={[s.emptyIcon, { backgroundColor: "#EF444412", borderColor: "#EF444420" }]}>
                  <Feather name="alert-triangle" size={32} color="#EF4444" />
                </View>
                <Text style={s.emptyTitle}>Erro ao carregar</Text>
                <Text style={s.emptyDesc}>
                  Não foi possível carregar seus bots.
                </Text>
                <Pressable
                  style={s.emptyBtn}
                  onPress={() => refetch()}
                  accessibilityLabel="Tentar novamente"
                  accessibilityRole="button"
                >
                  <Feather name="refresh-cw" size={14} color="#FFF" />
                  <Text style={s.emptyBtnText}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : (
              <View style={s.empty}>
                <View style={s.emptyIcon}>
                  <Feather name="cpu" size={32} color="#A78BFA" />
                </View>
                <Text style={s.emptyTitle}>Nenhum bot criado</Text>
                <Text style={s.emptyDesc}>
                  Crie seu primeiro bot e comece a automatizar grupos no WhatsApp
                </Text>
                <Pressable style={s.emptyBtn} onPress={() => setShowCreate(true)} accessibilityLabel="Criar primeiro bot" accessibilityRole="button">
                  <Feather name="plus" size={14} color="#FFF" />
                  <Text style={s.emptyBtnText}>Criar primeiro bot</Text>
                </Pressable>
              </View>
            )
          }
          renderItem={({ item }) => <BotCard bot={item} onDelete={handleDelete} />}
        />
      )}

      <Modal
        visible={showCreate}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreate(false)}
      >
        <Pressable style={s.overlay} onPress={() => setShowCreate(false)}>
          <Pressable style={s.modal} onPress={() => {}}>
            <View style={s.modalHeader}>
              <View style={s.modalIconWrap}>
                <Feather name="plus" size={16} color="#A78BFA" />
              </View>
              <Text style={s.modalTitle}>Criar novo bot</Text>
            </View>
            <Text style={s.modalLabel}>NOME DO BOT</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Ex: Bot Vendas"
              placeholderTextColor="#6B7280"
              value={newBotName}
              onChangeText={setNewBotName}
              autoFocus
            />
            <View style={s.modalActions}>
              <Pressable style={s.cancelBtn} onPress={() => setShowCreate(false)}>
                <Text style={s.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[s.confirmBtn, { opacity: createBot.isPending ? 0.7 : 1 }]}
                onPress={handleCreate}
                disabled={createBot.isPending}
              >
                {createBot.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={s.confirmText}>Criar Bot</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 17,
    color: "#EBEBF2",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  detail: {
    fontSize: 13,
    color: "#8E8E9E",
    fontFamily: "Inter_400Regular",
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  btnOutline: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  btnOutlineText: {
    fontSize: 12,
    color: "#8E8E9E",
    fontFamily: "Inter_600SemiBold",
  },
  btnPrimary: {
    backgroundColor: "#6D28D9",
  },
  btnPrimaryText: {
    fontSize: 12,
    color: "#FFF",
    fontFamily: "Inter_600SemiBold",
  },
  btnDanger: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0C0C11" },

  blobWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    color: "#EBEBF2",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, color: "#D1D1DB", fontFamily: "Inter_700Bold" },
  emptyDesc: {
    fontSize: 14,
    color: "#8E8E9E",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
  emptyText: { fontSize: 14, color: "#8E8E9E", fontFamily: "Inter_400Regular" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#6D28D9",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 4,
  },
  emptyBtnText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modal: {
    width: "100%",
    backgroundColor: "rgba(26,26,36,0.95)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 24,
    gap: 14,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  modalIconWrap: {
    padding: 8,
    backgroundColor: "rgba(109,40,217,0.15)",
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, color: "#EBEBF2", fontFamily: "Inter_700Bold" },
  modalLabel: { fontSize: 11, color: "#8E8E9E", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    color: "#EBEBF2",
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Inter_400Regular",
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: { color: "#8E8E9E", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  confirmBtn: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#6D28D9",
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
});
