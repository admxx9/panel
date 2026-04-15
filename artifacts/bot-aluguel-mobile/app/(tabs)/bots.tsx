import {
  useCreateBot,
  useCreateHostedBot,
  useDeleteBot,
  useListBots,
  useListHostedBots,
  useDeleteHostedBot,
  useStartHostedBot,
  useStopHostedBot,
  useRestartHostedBot,
  getListHostedBotsQueryKey,
  type HostedBot,
} from "@workspace/api-client-react";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { maybeRequestReview } from "@/utils/requestReview";
import { parseApiError } from "@/utils/parseApiError";
import { BotListSkeleton } from "@/components/SkeletonLoader";
import { ErrorCard } from "@/components/ErrorCard";
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
import { getListBotsQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const HOSTED_STATUS: Record<string, { color: string; label: string }> = {
  running:  { color: "#22C55E", label: "Rodando" },
  stopped:  { color: "#9CA3AF", label: "Parado" },
  error:    { color: "#EF4444", label: "Erro" },
};

function HostedBotCard({
  bot,
  onStart,
  onStop,
  onRestart,
  onDelete,
  actionPending,
}: {
  bot: HostedBot;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  actionPending: boolean;
}) {
  const isRunning = bot.isRunning ?? bot.status === "running";
  const statusKey = isRunning ? "running" : (bot.status ?? "stopped");
  const cfg = HOSTED_STATUS[statusKey] ?? HOSTED_STATUS.stopped;

  return (
    <Pressable
      style={({ pressed }) => [hcard.wrap, pressed && { opacity: 0.88 }]}
      onPress={() => router.push(`/hosted-bot/${bot.id}` as any)}
    >
      <View style={hcard.top}>
        <View style={hcard.iconCircle}>
          <Feather name="server" size={20} color="#A78BFA" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={hcard.name} numberOfLines={1}>{bot.name}</Text>
          <View style={hcard.metaRow}>
            <View style={[hcard.statusPill, { borderColor: cfg.color + "40" }]}>
              <View style={[hcard.statusDot, { backgroundColor: cfg.color }]} />
              <Text style={[hcard.statusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            {bot.sourceType === "github" && (
              <View style={hcard.srcBadge}>
                <Feather name="github" size={9} color="#8E8E9E" />
                <Text style={hcard.srcText}>GitHub</Text>
              </View>
            )}
          </View>
        </View>
        <Feather name="chevron-right" size={16} color="#8E8E9E" />
      </View>
      <View style={hcard.actions}>
        {isRunning ? (
          <>
            <Pressable
              style={[hcard.btn, hcard.btnStop]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onStop(bot.id!); }}
              disabled={actionPending}
            >
              <Feather name="square" size={11} color="#EF4444" />
              <Text style={hcard.btnStopText}>Parar</Text>
            </Pressable>
            <Pressable
              style={[hcard.btn, hcard.btnRestart]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRestart(bot.id!); }}
              disabled={actionPending}
            >
              <Feather name="refresh-cw" size={11} color="#F59E0B" />
              <Text style={hcard.btnRestartText}>Reiniciar</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[hcard.btn, hcard.btnStart]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onStart(bot.id!); }}
            disabled={actionPending}
          >
            <Feather name="play" size={11} color="#22C55E" />
            <Text style={hcard.btnStartText}>Iniciar</Text>
          </Pressable>
        )}
        <Pressable
          style={[hcard.btn, hcard.btnDanger]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onDelete(bot.id!, bot.name ?? "Bot"); }}
        >
          <Feather name="trash-2" size={11} color="#EF4444" />
        </Pressable>
      </View>
    </Pressable>
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

  const [activeTab, setActiveTab] = useState<"whatsapp" | "hosted">("whatsapp");
  const [showCreateHosted, setShowCreateHosted] = useState(false);
  const [hostedBotName, setHostedBotName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [hostedSourceType, setHostedSourceType] = useState<"github" | "zip">("github");
  const [zipFile, setZipFile] = useState<{ name: string; uri: string; mimeType?: string } | null>(null);
  const [isUploadingZip, setIsUploadingZip] = useState(false);

  const { data: hostedBots, isLoading: isHostedLoading, isError: isHostedError, refetch: refetchHosted, isRefetching: isHostedRefetching } = useListHostedBots();
  const createHostedBot = useCreateHostedBot();
  const deleteHostedBot = useDeleteHostedBot();
  const startHostedBot = useStartHostedBot();
  const stopHostedBot = useStopHostedBot();
  const restartHostedBot = useRestartHostedBot();

  const paddingBottom = insets.bottom + 110;

  const handleCreate = async () => {
    if (!newBotName.trim()) return;
    try {
      await createBot.mutateAsync({ data: { name: newBotName.trim() } });
      queryClient.invalidateQueries({ queryKey: getListBotsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
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
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        },
      },
    ]);
  };

  const handlePickZip = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/zip", "application/x-zip-compressed", "*/*"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!asset.name.endsWith(".zip")) {
          Alert.alert("Arquivo inválido", "Selecione um arquivo .zip");
          return;
        }
        setZipFile({ name: asset.name, uri: asset.uri, mimeType: asset.mimeType ?? "application/zip" });
      }
    } catch {
      Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
    }
  };

  const handleCreateHosted = async () => {
    if (!hostedBotName.trim()) return;
    if (hostedSourceType === "github") {
      if (!githubUrl.trim()) return;
      try {
        await createHostedBot.mutateAsync({ data: { name: hostedBotName.trim(), githubUrl: githubUrl.trim() } });
        queryClient.invalidateQueries({ queryKey: getListHostedBotsQueryKey() });
        setHostedBotName("");
        setGithubUrl("");
        setShowCreateHosted(false);
      } catch (err) {
        Alert.alert("Erro ao criar bot hospedado", parseApiError(err));
      }
    } else {
      if (!zipFile) return;
      setIsUploadingZip(true);
      try {
        const token = await AsyncStorage.getItem("auth_token");
        const domain = process.env.EXPO_PUBLIC_DOMAIN;
        const baseUrl = domain ? `https://${domain}` : "http://localhost:8080";
        const form = new FormData();
        form.append("name", hostedBotName.trim());
        form.append("file", { uri: zipFile.uri, name: zipFile.name, type: zipFile.mimeType ?? "application/zip" } as any);
        const res = await fetch(`${baseUrl}/api/hosted-bots`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as any)?.error ?? "Erro ao fazer upload");
        }
        queryClient.invalidateQueries({ queryKey: getListHostedBotsQueryKey() });
        setHostedBotName("");
        setZipFile(null);
        setShowCreateHosted(false);
      } catch (err: any) {
        Alert.alert("Erro ao criar bot hospedado", err?.message ?? "Tente novamente");
      } finally {
        setIsUploadingZip(false);
      }
    }
  };

  const handleHostedStart = async (id: string) => {
    try {
      await startHostedBot.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListHostedBotsQueryKey() });
    } catch (err) {
      Alert.alert("Erro", parseApiError(err));
    }
  };

  const handleHostedStop = async (id: string) => {
    try {
      await stopHostedBot.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListHostedBotsQueryKey() });
    } catch (err) {
      Alert.alert("Erro", parseApiError(err));
    }
  };

  const handleHostedRestart = async (id: string) => {
    try {
      await restartHostedBot.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListHostedBotsQueryKey() });
    } catch (err) {
      Alert.alert("Erro", parseApiError(err));
    }
  };

  const handleHostedDelete = (id: string, name: string) => {
    Alert.alert("Remover bot hospedado", `Deseja remover "${name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          await deleteHostedBot.mutateAsync({ id });
          queryClient.invalidateQueries({ queryKey: getListHostedBotsQueryKey() });
        },
      },
    ]);
  };

  const hostedBotList = (hostedBots as HostedBot[] | undefined) ?? [];
  const hostedActionPending = startHostedBot.isPending || stopHostedBot.isPending || restartHostedBot.isPending;

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
          onPress={() => activeTab === "whatsapp" ? setShowCreate(true) : setShowCreateHosted(true)}
        >
          <Feather name="plus" size={22} color="#EBEBF2" />
        </Pressable>
      </View>

      <View style={s.tabSegment}>
        <Pressable
          style={[s.segBtn, activeTab === "whatsapp" && s.segBtnActive]}
          onPress={() => setActiveTab("whatsapp")}
        >
          <Feather name="message-circle" size={13} color={activeTab === "whatsapp" ? "#EBEBF2" : "#8E8E9E"} />
          <Text style={[s.segText, activeTab === "whatsapp" && s.segTextActive]}>WhatsApp</Text>
        </Pressable>
        <Pressable
          style={[s.segBtn, activeTab === "hosted" && s.segBtnActive]}
          onPress={() => setActiveTab("hosted")}
        >
          <Feather name="server" size={13} color={activeTab === "hosted" ? "#EBEBF2" : "#8E8E9E"} />
          <Text style={[s.segText, activeTab === "hosted" && s.segTextActive]}>Hospedados</Text>
        </Pressable>
      </View>

      {activeTab === "whatsapp" && (isLoading && botList.length === 0 ? (
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
                <ErrorCard
                  message="Não foi possível carregar seus bots."
                  onRetry={refetch}
                />
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
      ))}

      {activeTab === "hosted" && (isHostedLoading && hostedBotList.length === 0 ? (
        <BotListSkeleton />
      ) : (
        <FlatList
          data={hostedBotList}
          keyExtractor={(b) => b.id ?? ""}
          contentContainerStyle={{ padding: 16, paddingBottom }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          refreshControl={
            <RefreshControl refreshing={isHostedRefetching} onRefresh={refetchHosted} tintColor="#6D28D9" />
          }
          ListEmptyComponent={
            isHostedError ? (
              <View style={s.empty}>
                <ErrorCard
                  message="Não foi possível carregar bots hospedados."
                  onRetry={refetchHosted}
                />
              </View>
            ) : (
              <View style={s.empty}>
                <View style={s.emptyIcon}>
                  <Feather name="server" size={32} color="#A78BFA" />
                </View>
                <Text style={s.emptyTitle}>Nenhum bot hospedado</Text>
                <Text style={s.emptyDesc}>
                  Adicione um bot via URL do GitHub para hospedar aqui
                </Text>
                <Pressable style={s.emptyBtn} onPress={() => setShowCreateHosted(true)} accessibilityLabel="Adicionar bot hospedado" accessibilityRole="button">
                  <Feather name="plus" size={14} color="#FFF" />
                  <Text style={s.emptyBtnText}>Adicionar via GitHub</Text>
                </Pressable>
              </View>
            )
          }
          renderItem={({ item }) => (
            <HostedBotCard
              bot={item}
              onStart={handleHostedStart}
              onStop={handleHostedStop}
              onRestart={handleHostedRestart}
              onDelete={handleHostedDelete}
              actionPending={hostedActionPending}
            />
          )}
        />
      ))}

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

      <Modal
        visible={showCreateHosted}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowCreateHosted(false); setZipFile(null); setHostedSourceType("github"); }}
      >
        <Pressable style={s.overlay} onPress={() => { setShowCreateHosted(false); setZipFile(null); setHostedSourceType("github"); }}>
          <Pressable style={s.modal} onPress={() => {}}>
            <View style={s.modalHeader}>
              <View style={s.modalIconWrap}>
                <Feather name="server" size={16} color="#A78BFA" />
              </View>
              <Text style={s.modalTitle}>Adicionar bot hospedado</Text>
            </View>

            <View style={s.srcToggle}>
              <Pressable
                style={[s.srcBtn, hostedSourceType === "github" && s.srcBtnActive]}
                onPress={() => setHostedSourceType("github")}
              >
                <Feather name="github" size={12} color={hostedSourceType === "github" ? "#A78BFA" : "#8E8E9E"} />
                <Text style={[s.srcBtnText, hostedSourceType === "github" && s.srcBtnTextActive]}>GitHub</Text>
              </Pressable>
              <Pressable
                style={[s.srcBtn, hostedSourceType === "zip" && s.srcBtnActive]}
                onPress={() => setHostedSourceType("zip")}
              >
                <Feather name="upload" size={12} color={hostedSourceType === "zip" ? "#A78BFA" : "#8E8E9E"} />
                <Text style={[s.srcBtnText, hostedSourceType === "zip" && s.srcBtnTextActive]}>Upload ZIP</Text>
              </Pressable>
            </View>

            <Text style={s.modalLabel}>NOME DO BOT</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Ex: Meu Bot Node"
              placeholderTextColor="#6B7280"
              value={hostedBotName}
              onChangeText={setHostedBotName}
              autoFocus
            />

            {hostedSourceType === "github" ? (
              <>
                <Text style={[s.modalLabel, { marginTop: 14 }]}>URL DO REPOSITÓRIO GITHUB</Text>
                <TextInput
                  style={s.modalInput}
                  placeholder="https://github.com/user/repo"
                  placeholderTextColor="#6B7280"
                  value={githubUrl}
                  onChangeText={setGithubUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </>
            ) : (
              <>
                <Text style={[s.modalLabel, { marginTop: 14 }]}>ARQUIVO ZIP</Text>
                <Pressable style={s.zipPickerBtn} onPress={handlePickZip}>
                  <Feather name={zipFile ? "check-circle" : "upload-cloud"} size={16} color={zipFile ? "#22C55E" : "#A78BFA"} />
                  <Text style={[s.zipPickerText, zipFile && { color: "#22C55E" }]} numberOfLines={1}>
                    {zipFile ? zipFile.name : "Selecionar arquivo .zip"}
                  </Text>
                </Pressable>
              </>
            )}

            <View style={s.modalActions}>
              <Pressable style={s.cancelBtn} onPress={() => { setShowCreateHosted(false); setZipFile(null); setHostedSourceType("github"); }}>
                <Text style={s.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[s.confirmBtn, { opacity: (createHostedBot.isPending || isUploadingZip) ? 0.7 : 1 }]}
                onPress={handleCreateHosted}
                disabled={createHostedBot.isPending || isUploadingZip}
              >
                {(createHostedBot.isPending || isUploadingZip) ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={s.confirmText}>Adicionar</Text>
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

  tabSegment: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  segBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  segBtnActive: {
    backgroundColor: "rgba(109,40,217,0.2)",
    borderColor: "rgba(109,40,217,0.4)",
  },
  segText: { fontSize: 13, color: "#8E8E9E", fontFamily: "Inter_600SemiBold" },
  segTextActive: { color: "#EBEBF2" },
});

const hcard = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    padding: 0,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    paddingBottom: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(167,139,250,0.1)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 16, color: "#EBEBF2", fontFamily: "Inter_600SemiBold", marginBottom: 5 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase" },
  srcBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  srcText: { fontSize: 9, color: "#8E8E9E", fontFamily: "Inter_500Medium" },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 6,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  btnStart: { backgroundColor: "rgba(34,197,94,0.07)", borderColor: "rgba(34,197,94,0.25)" },
  btnStop:  { backgroundColor: "rgba(239,68,68,0.07)", borderColor: "rgba(239,68,68,0.25)" },
  btnRestart: { backgroundColor: "rgba(245,158,11,0.07)", borderColor: "rgba(245,158,11,0.25)" },
  btnDanger: { borderColor: "rgba(239,68,68,0.25)", marginLeft: "auto" },
  btnStartText: { fontSize: 12, color: "#22C55E", fontFamily: "Inter_600SemiBold" },
  btnStopText: { fontSize: 12, color: "#EF4444", fontFamily: "Inter_600SemiBold" },
  btnRestartText: { fontSize: 12, color: "#F59E0B", fontFamily: "Inter_600SemiBold" },

  srcToggle: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  srcBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#20202B",
    backgroundColor: "#13131D",
    flex: 1,
    justifyContent: "center",
  },
  srcBtnActive: {
    borderColor: "#6D28D940",
    backgroundColor: "#6D28D915",
  },
  srcBtnText: { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_600SemiBold" },
  srcBtnTextActive: { color: "#A78BFA" },

  zipPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  zipPickerText: {
    flex: 1,
    fontSize: 13,
    color: "#8E8E9E",
    fontFamily: "Inter_400Regular",
  },
});
