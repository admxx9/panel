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
  disconnected: { color: "#4B4C6B", label: "Offline" },
  error:        { color: "#EF4444", label: "Erro" },
};

function BotRow({ bot, onDelete }: { bot: Bot; onDelete: (id: string, name: string) => void }) {
  const cfg = STATUS_CFG[bot.status] ?? STATUS_CFG.disconnected;

  return (
    <View style={[row.card, { borderLeftColor: cfg.color }]}>
      <View style={row.top}>
        <View style={row.dotWrap}>
          <View style={[row.dot, { backgroundColor: cfg.color }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={row.name}>{bot.name}</Text>
          <Text style={row.phone}>{bot.phone ? `+${bot.phone}` : "Sem número"}</Text>
        </View>
        <View style={[row.badge, { borderColor: cfg.color + "40", backgroundColor: cfg.color + "15" }]}>
          <Text style={[row.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={row.meta}>
        <View style={row.metaItem}>
          <Feather name="users" size={11} color="#4B4C6B" />
          <Text style={row.metaText}>{bot.totalGroups} grupo{bot.totalGroups !== 1 ? "s" : ""}</Text>
        </View>
        <View style={row.metaItem}>
          <Feather name="hash" size={11} color="#4B4C6B" />
          <Text style={row.metaText}>prefix: {bot.prefix || "!"}</Text>
        </View>
      </View>

      <View style={row.actions}>
        <Pressable
          style={({ pressed }) => [row.btn, row.btnGhost, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/bot/${bot.id}` as any);
          }}
        >
          <Feather name="settings" size={13} color="#8B8EA0" />
          <Text style={[row.btnText, { color: "#8B8EA0" }]}>Gerenciar</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [row.btn, row.btnPrimary, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/builder/${bot.id}` as any);
          }}
        >
          <Feather name="layout" size={13} color="#FFF" />
          <Text style={[row.btnText, { color: "#FFF" }]}>Construtor</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [row.btn, row.btnDanger, { opacity: pressed ? 0.7 : 1 }]}
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

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = insets.bottom + 80;

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

  return (
    <View style={[s.root]}>
      <View style={[s.header, { paddingTop }]}>
        <View>
          <Text style={s.pageLabel}>GERENCIAMENTO</Text>
          <Text style={s.pageTitle}>Meus Bots</Text>
        </View>
        <Pressable
          style={({ pressed }) => [s.createBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={() => setShowCreate(true)}
        >
          <Feather name="plus" size={16} color="#FFF" />
          <Text style={s.createBtnText}>Novo Bot</Text>
        </Pressable>
      </View>

      <View style={s.statsRow}>
        <View style={s.statChip}>
          <View style={[s.statDot, { backgroundColor: "#7C3AED" }]} />
          <Text style={s.statChipText}>{botList.length} total</Text>
        </View>
        <View style={s.statChip}>
          <View style={[s.statDot, { backgroundColor: "#22C55E" }]} />
          <Text style={s.statChipText}>{botList.filter(b => b.status === "connected").length} online</Text>
        </View>
        <View style={s.statChip}>
          <View style={[s.statDot, { backgroundColor: "#4B4C6B" }]} />
          <Text style={s.statChipText}>{botList.filter(b => b.status === "disconnected").length} offline</Text>
        </View>
      </View>

      <FlatList
        data={botList}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C3AED" />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={s.loader}>
              <ActivityIndicator color="#7C3AED" size="large" />
              <Text style={s.loaderText}>Carregando bots...</Text>
            </View>
          ) : (
            <View style={s.emptyState}>
              <View style={s.emptyIcon}>
                <Feather name="cpu" size={32} color="#2A2B3E" />
              </View>
              <Text style={s.emptyTitle}>Nenhum bot criado</Text>
              <Text style={s.emptyDesc}>Crie seu primeiro bot e comece a automatizar grupos no WhatsApp</Text>
              <Pressable style={s.emptyBtn} onPress={() => setShowCreate(true)}>
                <Feather name="plus" size={14} color="#7C3AED" />
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
              placeholderTextColor="#4B4C6B"
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
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    borderLeftWidth: 3,
    padding: 14,
    gap: 10,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dotWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#F1F2F6",
    fontFamily: "Inter_600SemiBold",
  },
  phone: {
    fontSize: 11,
    color: "#4B4C6B",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  badge: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  meta: {
    flexDirection: "row",
    gap: 16,
    paddingLeft: 26,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: "#4B4C6B",
    fontFamily: "Inter_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 6,
    paddingLeft: 26,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 5,
    borderWidth: 1,
  },
  btnGhost: {
    borderColor: "#1A1B28",
    backgroundColor: "#131420",
  },
  btnPrimary: {
    borderColor: "#7C3AED",
    backgroundColor: "#7C3AED",
  },
  btnDanger: {
    borderColor: "#EF444430",
    backgroundColor: "#EF444415",
  },
  btnText: {
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090A0F" },

  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  pageLabel: {
    fontSize: 10,
    color: "#4B4C6B",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#F1F2F6",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7C3AED",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  createBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },

  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#0D0E16",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#1A1B28",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statChipText: { fontSize: 11, color: "#8B8EA0", fontFamily: "Inter_400Regular" },

  sep: { height: 6 },
  loader: { paddingVertical: 60, alignItems: "center", gap: 12 },
  loaderText: { color: "#4B4C6B", fontSize: 13, fontFamily: "Inter_400Regular" },

  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#0D0E16",
    borderWidth: 1,
    borderColor: "#1A1B28",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700" as const, color: "#4B4C6B", fontFamily: "Inter_700Bold" },
  emptyDesc: { fontSize: 13, color: "#2A2B3E", fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260, lineHeight: 18 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#7C3AED",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 4,
  },
  emptyBtnText: { color: "#7C3AED", fontSize: 13, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modal: {
    width: "100%",
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    padding: 24,
  },
  modalTitle: { fontSize: 16, fontWeight: "700" as const, color: "#F1F2F6", fontFamily: "Inter_700Bold", marginBottom: 20 },
  modalLabel: { fontSize: 10, color: "#4B4C6B", fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 6 },
  modalInput: {
    backgroundColor: "#131420",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1E1F2E",
    color: "#F1F2F6",
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1A1B28",
    paddingVertical: 13,
    alignItems: "center",
  },
  cancelText: { color: "#4B4C6B", fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  confirmBtn: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: "#7C3AED",
    paddingVertical: 13,
    alignItems: "center",
  },
  confirmText: { color: "#FFF", fontSize: 14, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
});
