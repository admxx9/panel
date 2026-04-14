import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListBots } from "@workspace/api-client-react";

const PLATFORM_COLORS: Record<string, string> = {
  whatsapp: "#25D366",
  discord: "#5865F2",
  telegram: "#0088CC",
};

const PLATFORM_ICONS: Record<string, string> = {
  whatsapp: "message-circle",
  discord: "hash",
  telegram: "send",
};

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  connected: { label: "Online", color: "#22C55E" },
  connecting: { label: "Conectando", color: "#F59E0B" },
  disconnected: { label: "Offline", color: "#9CA3AF" },
};

export default function BuilderPickerScreen() {
  const insets = useSafeAreaInsets();
  const { data: bots, isLoading } = useListBots();
  const pt = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;

  const getPlatform = (_bot: any) => {
    if (_bot?.platform) return _bot.platform;
    return "whatsapp";
  };

  return (
    <View style={[s.container, { paddingTop: pt }]}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#F0F0F5" />
        </Pressable>
        <View style={s.headerCenter}>
          <View style={s.headerIcon}>
            <Feather name="layers" size={18} color="#A78BFA" />
          </View>
          <Text style={s.headerTitle}>Builder</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.subtitle}>Escolha um bot para editar no Builder</Text>
        <Text style={s.description}>
          Selecione o bot que deseja configurar com comandos, ações e condições no editor visual.
        </Text>

        {isLoading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color="#6D28D9" />
            <Text style={s.loadingText}>Carregando bots...</Text>
          </View>
        ) : !bots || bots.length === 0 ? (
          <View style={s.emptyWrap}>
            <View style={s.emptyIcon}>
              <Feather name="inbox" size={40} color="#6B7280" />
            </View>
            <Text style={s.emptyTitle}>Nenhum bot criado</Text>
            <Text style={s.emptyDesc}>Crie um bot primeiro na aba "Bots" para usar o Builder.</Text>
            <Pressable style={s.createBtn} onPress={() => router.push("/(tabs)/bots")}>
              <Feather name="plus" size={18} color="#FFF" />
              <Text style={s.createBtnText}>Criar Bot</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.botList}>
            {bots.map((bot: any) => {
              const platform = getPlatform(bot);
              const pColor = PLATFORM_COLORS[platform] || "#6D28D9";
              const pIcon = PLATFORM_ICONS[platform] || "cpu";
              const statusKey = bot.status || "disconnected";
              const status = STATUS_INFO[statusKey] || STATUS_INFO.disconnected;

              return (
                <Pressable
                  key={bot.id}
                  style={({ pressed }) => [s.botCard, pressed && { opacity: 0.85 }]}
                  onPress={() => router.push(`/builder/${bot.id}` as any)}
                >
                  <View style={[s.botGlow, { backgroundColor: pColor }]} />

                  <View style={s.botContent}>
                    <View style={s.botLeft}>
                      <View style={[s.botIconWrap, { backgroundColor: pColor + "15" }]}>
                        <Feather name={pIcon as any} size={20} color={pColor} />
                      </View>
                      <View style={s.botInfo}>
                        <Text style={s.botName} numberOfLines={1}>{bot.name}</Text>
                        <View style={s.botMeta}>
                          <View style={[s.statusDot, { backgroundColor: status.color }]} />
                          <Text style={[s.statusLabel, { color: status.color }]}>{status.label}</Text>
                          <Text style={s.separator}>·</Text>
                          <Text style={s.platformLabel}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={s.botAction}>
                      <Feather name="arrow-right" size={18} color="#A78BFA" />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={s.tipsSection}>
          <Text style={s.tipsTitle}>DICAS DO BUILDER</Text>

          <View style={s.tipCard}>
            <View style={[s.tipIcon, { backgroundColor: "#6D28D915" }]}>
              <Feather name="terminal" size={16} color="#A78BFA" />
            </View>
            <View style={s.tipContent}>
              <Text style={s.tipName}>Comandos</Text>
              <Text style={s.tipDesc}>Crie comandos que seus usuários podem enviar</Text>
            </View>
          </View>

          <View style={s.tipCard}>
            <View style={[s.tipIcon, { backgroundColor: "#22C55E15" }]}>
              <Feather name="zap" size={16} color="#22C55E" />
            </View>
            <View style={s.tipContent}>
              <Text style={s.tipName}>Ações</Text>
              <Text style={s.tipDesc}>Defina o que o bot faz quando recebe um comando</Text>
            </View>
          </View>

          <View style={s.tipCard}>
            <View style={[s.tipIcon, { backgroundColor: "#F59E0B15" }]}>
              <Feather name="git-branch" size={16} color="#F59E0B" />
            </View>
            <View style={s.tipContent}>
              <Text style={s.tipName}>Condições</Text>
              <Text style={s.tipDesc}>Crie fluxos inteligentes com lógica SIM/NÃO</Text>
            </View>
          </View>

          <View style={s.tipCard}>
            <View style={[s.tipIcon, { backgroundColor: "#0088CC15" }]}>
              <Feather name="layout" size={16} color="#0088CC" />
            </View>
            <View style={s.tipContent}>
              <Text style={s.tipName}>Templates</Text>
              <Text style={s.tipDesc}>Use templates prontos para começar rapidamente</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F14",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2A2A3540",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1A1A24",
    borderWidth: 1,
    borderColor: "#2A2A35",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#6D28D915",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#F0F0F5",
  },
  scroll: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#F0F0F5",
    marginTop: 24,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#A0A0B0",
    lineHeight: 20,
    marginBottom: 24,
  },
  loadingWrap: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: "#A0A0B0",
    fontFamily: "Inter_500Medium",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#1A1A24",
    borderWidth: 1,
    borderColor: "#2A2A35",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#F0F0F5",
  },
  emptyDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#A0A0B0",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#6D28D9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  createBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFF",
  },
  botList: {
    gap: 12,
  },
  botCard: {
    backgroundColor: "#1A1A24",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A35",
    overflow: "hidden",
  },
  botGlow: {
    height: 3,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  botContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  botLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  botIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botInfo: {
    flex: 1,
    gap: 4,
  },
  botName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#F0F0F5",
  },
  botMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  separator: {
    fontSize: 12,
    color: "#6B7280",
  },
  platformLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#A0A0B0",
  },
  botAction: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#6D28D910",
    alignItems: "center",
    justifyContent: "center",
  },
  tipsSection: {
    marginTop: 32,
    gap: 10,
  },
  tipsTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#6B7280",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1A1A24",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A35",
    padding: 14,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: {
    flex: 1,
    gap: 2,
  },
  tipName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#F0F0F5",
  },
  tipDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#A0A0B0",
  },
});
