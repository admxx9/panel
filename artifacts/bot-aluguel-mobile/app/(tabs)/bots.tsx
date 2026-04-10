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
  connected: { color: "#22C55E", label: "Conectado", icon: "wifi" },
  connecting: { color: "#F59E0B", label: "Conectando...", icon: "loader" },
  disconnected: { color: "#8E8EA0", label: "Desconectado", icon: "wifi-off" },
  error: { color: "#DC2626", label: "Erro", icon: "alert-circle" },
};

function BotCard({ bot, onDelete }: { bot: Bot; onDelete: (id: string) => void }) {
  const colors = useColors();
  const status = STATUS_CONFIG[bot.status] ?? STATUS_CONFIG.disconnected;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.botCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => router.push(`/bot/${bot.id}` as any)}
    >
      <View style={styles.botCardTop}>
        <View style={[styles.botAvatar, { backgroundColor: colors.primary + "20" }]}>
          <Feather name="cpu" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.botName, { color: colors.foreground }]} numberOfLines={1}>
            {bot.name}
          </Text>
          <Text style={[styles.botPhone, { color: colors.mutedForeground }]}>
            {bot.phone ?? "Sem número"}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={[styles.botCardBottom, { borderTopColor: colors.border }]}>
        <View style={styles.botMeta}>
          <Feather name="hash" size={13} color={colors.mutedForeground} />
          <Text style={[styles.botMetaText, { color: colors.mutedForeground }]}>{bot.prefix}</Text>
        </View>
        <View style={styles.botMeta}>
          <Feather name="users" size={13} color={colors.mutedForeground} />
          <Text style={[styles.botMetaText, { color: colors.mutedForeground }]}>
            {bot.totalGroups} grupos
          </Text>
        </View>
        <Pressable
          style={styles.deleteBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert("Excluir bot", `Tem certeza que deseja excluir "${bot.name}"?`, [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Excluir",
                style: "destructive",
                onPress: () => onDelete(bot.id),
              },
            ]);
          }}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function BotsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBotName, setNewBotName] = useState("");

  const { data: bots, isLoading, refetch, isRefetching } = useListBots();
  const createBot = useCreateBot();
  const deleteBot = useDeleteBot();

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={bots ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BotCard bot={item as Bot} onDelete={handleDelete} />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingTop, paddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!(bots && bots.length > 0)}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Meus Bots</Text>
            <Pressable
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Feather name="plus" size={18} color="#FFF" />
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="cpu" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nenhum bot</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                Crie seu primeiro bot tocando no +
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      />

      <Modal visible={showCreateModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCreateModal(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Novo Bot</Text>
            <TextInput
              style={[
                styles.modalInput,
                { color: colors.foreground, backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
              placeholder="Nome do bot"
              placeholderTextColor={colors.mutedForeground}
              value={newBotName}
              onChangeText={setNewBotName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, { borderColor: colors.border }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.mutedForeground }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: colors.primary }]}
                onPress={handleCreate}
                disabled={createBot.isPending}
              >
                {createBot.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Criar</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, gap: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: { paddingVertical: 60, alignItems: "center" },
  botCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden" as const,
  },
  botCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  botAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botName: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  botPhone: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  botCardBottom: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 16,
  },
  botMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  botMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  deleteBtn: { marginLeft: "auto" as const, padding: 4 },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 40,
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },
  emptyTitle: { fontSize: 17, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" as const },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalSheet: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  modalInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  modalActions: { flexDirection: "row", gap: 12 },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  modalBtnPrimary: { borderWidth: 0 },
  modalBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  modalBtnPrimaryText: { color: "#FFF", fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});
