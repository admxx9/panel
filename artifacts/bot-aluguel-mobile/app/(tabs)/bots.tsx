import {
  useCreateBot,
  useDeleteBot,
  useListBots,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
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
  connected:    { color: "#22C55E", label: "Online", bg: "#0D2818" },
  connecting:   { color: "#F59E0B", label: "Conectando", bg: "#2D2506" },
  disconnected: { color: "#9CA3AF", label: "Offline", bg: "#1E1E28" },
  error:        { color: "#EF4444", label: "Erro", bg: "#2D0A0A" },
};

function BotRow({ bot, onDelete }: { bot: Bot; onDelete: (id: string, name: string) => void }) {
  const cfg = STATUS_CFG[bot.status] ?? STATUS_CFG.disconnected;

  return (
    <View style={row.card}>
      <View style={row.top}>
        <View style={[row.iconWrap, { backgroundColor: cfg.bg }]}>
          <Feather name="cpu" size={18} color={cfg.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={row.name}>{bot.name}</Text>
          <Text style={row.phone}>{bot.phone ? `+${bot.phone}` : "Sem número"}</Text>
        </View>
        <View style={[row.badge, { backgroundColor: cfg.bg }]}>
          <View style={[row.dot, { backgroundColor: cfg.color }]} />
          <Text style={[row.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={row.meta}>
        <View style={row.metaItem}>
          <Feather name="users" size={12} color="#9CA3AF" />
          <Text style={row.metaText}>{bot.totalGroups} grupo{bot.totalGroups !== 1 ? "s" : ""}</Text>
        </View>
        <View style={row.metaItem}>
          <Feather name="hash" size={12} color="#9CA3AF" />
          <Text style={row.metaText}>prefix: {bot.prefix || "!"}</Text>
        </View>
      </View>

      <View style={row.actions}>
        <Pressable
          style={({ pressed }) => [row.btn, row.btnOutline, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/bot/${bot.id}` as any);
          }}
        >
          <Feather name="settings" size={13} color="#6B7280" />
          <Text style={row.btnOutlineText}>Gerenciar</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [row.btn, row.btnPrimary, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/builder/${bot.id}` as any);
          }}
        >
          <Feather name="layout" size={13} color="#FFF" />
          <Text style={row.btnPrimaryText}>Construtor</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [row.btn, row.btnDanger, pressed && { opacity: 0.7 }]}
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
  const { data: bots, isLoading, refetch, isRefetching } = useListBots();
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
    } catch {
      Alert.alert("Erro", "Não foi possível criar o bot.");
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
  const onlineCount = botList.filter(b => b.status === "connected").length;

  return (
    <View style={s.root}>
      <LinearGradient colors={["#7C3AED", "#6D28D9"]} style={[s.header, { paddingTop: insets.top + 12 }]}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>Meus Bots</Text>
            <Text style={s.headerSub}>{botList.length} bots · {onlineCount} online</Text>
          </View>
          <Pressable
            style={({ pressed }) => [s.addBtn, pressed && { opacity: 0.8 }]}
            onPress={() => setShowCreate(true)}
          >
            <Feather name="plus" size={18} color="#7C3AED" />
          </Pressable>
        </View>
      </LinearGradient>

      <FlatList
        data={botList}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 20, paddingBottom }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C3AED" />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={s.empty}>
              <ActivityIndicator color="#7C3AED" size="large" />
              <Text style={s.emptyText}>Carregando bots...</Text>
            </View>
          ) : (
            <View style={s.empty}>
              <View style={s.emptyIcon}>
                <Feather name="cpu" size={32} color="#9CA3AF" />
              </View>
              <Text style={s.emptyTitle}>Nenhum bot criado</Text>
              <Text style={s.emptyDesc}>Crie seu primeiro bot e comece a automatizar grupos no WhatsApp</Text>
              <Pressable style={s.emptyBtn} onPress={() => setShowCreate(true)}>
                <Feather name="plus" size={14} color="#FFF" />
                <Text style={s.emptyBtnText}>Criar primeiro bot</Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }) => <BotRow bot={item} onDelete={handleDelete} />}
      />

      <Modal
        visible={showCreate}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreate(false)}
      >
        <Pressable style={s.overlay} onPress={() => setShowCreate(false)}>
          <Pressable style={s.modal} onPress={() => {}}>
            <Text style={s.modalTitle}>Criar novo bot</Text>
            <Text style={s.modalLabel}>NOME DO BOT</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Ex: Bot Vendas"
              placeholderTextColor="#9CA3AF"
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

const row = StyleSheet.create({
  card: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F0F0F5",
    fontFamily: "Inter_600SemiBold",
  },
  phone: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    flexDirection: "row",
    gap: 16,
    paddingLeft: 54,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 4,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnOutline: {
    backgroundColor: "#1E1E28",
  },
  btnOutlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "Inter_600SemiBold",
  },
  btnPrimary: {
    backgroundColor: "#7C3AED",
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
    fontFamily: "Inter_600SemiBold",
  },
  btnDanger: {
    backgroundColor: "#2D0A0A",
  },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F0F14" },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 13,
    color: "#FFFFFFBB",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1A1A24",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#1E1E28",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#D1D1DB", fontFamily: "Inter_700Bold" },
  emptyDesc: { fontSize: 14, color: "#9CA3AF", fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 280, lineHeight: 20 },
  emptyText: { fontSize: 14, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 4,
  },
  emptyBtnText: { color: "#FFF", fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modal: {
    width: "100%",
    backgroundColor: "#1A1A24",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#F0F0F5", fontFamily: "Inter_700Bold", marginBottom: 20 },
  modalLabel: { fontSize: 11, color: "#9CA3AF", fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 8 },
  modalInput: {
    backgroundColor: "#1E1E28",
    borderRadius: 12,
    color: "#F0F0F5",
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#1E1E28",
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: { color: "#6B7280", fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  confirmBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmText: { color: "#FFF", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
