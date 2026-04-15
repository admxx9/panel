import {
  useGetHostedBot,
  useGetHostedBotFiles,
  useGetHostedBotFile,
  useStartHostedBot,
  useStopHostedBot,
  useRestartHostedBot,
  useDeleteHostedBot,
  getListHostedBotsQueryKey,
  type GetHostedBotFile200,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useHostedBotLogs } from "@/hooks/useHostedBotLogs";
import { parseApiError } from "@/utils/parseApiError";

type Token = { text: string; color: string };

const C = {
  keyword:  "#C792EA",
  string:   "#C3E88D",
  comment:  "#546E7A",
  number:   "#F78C6C",
  property: "#82AAFF",
  plain:    "#D1D1DB",
  punct:    "#89DDFF",
};

const JS_KW = /^(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|default|from|of|in|typeof|instanceof|async|await|try|catch|finally|throw|true|false|null|undefined|void|delete|yield|static|super|get|set|type|interface|enum|namespace|as|implements|abstract|declare|module|require)$/;

function tokenizeJs(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === "/" && line[i + 1] === "/") {
      tokens.push({ text: line.slice(i), color: C.comment });
      break;
    }
    if (line[i] === "/" && line[i + 1] === "*") {
      const end = line.indexOf("*/", i + 2);
      const chunk = end === -1 ? line.slice(i) : line.slice(i, end + 2);
      tokens.push({ text: chunk, color: C.comment });
      i += chunk.length;
      continue;
    }
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const q = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== q) {
        if (line[j] === "\\") j++;
        j++;
      }
      tokens.push({ text: line.slice(i, j + 1), color: C.string });
      i = j + 1;
      continue;
    }
    if (/\d/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\d._xXa-fA-F]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), color: C.number });
      i = j;
      continue;
    }
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      tokens.push({ text: word, color: JS_KW.test(word) ? C.keyword : C.plain });
      i = j;
      continue;
    }
    if (/[(){}[\];,.]/.test(line[i])) {
      tokens.push({ text: line[i], color: C.punct });
      i++;
      continue;
    }
    tokens.push({ text: line[i], color: C.plain });
    i++;
  }
  return tokens;
}

function tokenizeJson(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let j = i + 1;
      while (j < line.length && line[j] !== '"') {
        if (line[j] === "\\") j++;
        j++;
      }
      const str = line.slice(i, j + 1);
      const nextNonSpace = line.slice(j + 1).trimStart();
      tokens.push({ text: str, color: nextNonSpace.startsWith(":") ? C.property : C.string });
      i = j + 1;
      continue;
    }
    if (/[\d\-]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\d.\-eE+]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), color: C.number });
      i = j;
      continue;
    }
    if (line.slice(i, i + 4) === "true" || line.slice(i, i + 5) === "false" || line.slice(i, i + 4) === "null") {
      const w = line.slice(i, i + 4) === "true" ? "true" : line.slice(i, i + 5) === "false" ? "false" : "null";
      tokens.push({ text: w, color: C.keyword });
      i += w.length;
      continue;
    }
    tokens.push({ text: line[i], color: /[{}[\]:,]/.test(line[i]) ? C.punct : C.plain });
    i++;
  }
  return tokens;
}

function getLanguage(filename: string): "js" | "json" | "plain" {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["js", "ts", "jsx", "tsx", "mjs", "cjs"].includes(ext)) return "js";
  if (ext === "json") return "json";
  return "plain";
}

function SyntaxLine({ line, lang }: { line: string; lang: "js" | "json" | "plain" }) {
  const tokens = useMemo(() => {
    if (lang === "js") return tokenizeJs(line);
    if (lang === "json") return tokenizeJson(line);
    return [{ text: line, color: C.plain }];
  }, [line, lang]);
  return (
    <Text style={sh.line} selectable>
      {tokens.map((t, i) => (
        <Text key={i} style={{ color: t.color }}>{t.text}</Text>
      ))}
      {"\n"}
    </Text>
  );
}

const sh = StyleSheet.create({
  line: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    lineHeight: 20,
  },
});

const STATUS_CFG: Record<string, { color: string; label: string }> = {
  running:  { color: "#22C55E", label: "Rodando" },
  stopped:  { color: "#9CA3AF", label: "Parado" },
  error:    { color: "#EF4444", label: "Erro" },
};

export default function HostedBotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;
  const paddingBottom = insets.bottom + 32;

  const [activeTab, setActiveTab] = useState<"logs" | "files">("logs");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const logsScrollRef = useRef<ScrollView>(null);

  const { data: bot, isLoading, refetch, isRefetching } = useGetHostedBot(id);
  const { data: filesData } = useGetHostedBotFiles(id);
  const { data: fileContent, isFetching: isFetchingFile } = useGetHostedBotFile<GetHostedBotFile200>(
    id,
    { path: selectedFile ?? "" },
    { query: { enabled: !!selectedFile } }
  );
  const { data: logsData } = useHostedBotLogs(id, true);

  const startMutation = useStartHostedBot();
  const stopMutation = useStopHostedBot();
  const restartMutation = useRestartHostedBot();
  const deleteMutation = useDeleteHostedBot();

  const isRunning = bot?.isRunning ?? bot?.status === "running";
  const statusKey = isRunning ? "running" : (bot?.status ?? "stopped");
  const statusCfg = STATUS_CFG[statusKey] ?? STATUS_CFG.stopped;
  const logs = logsData?.logs ?? [];
  const files = filesData?.files ?? bot?.files ?? [];

  useEffect(() => {
    if (logs.length > 0 && activeTab === "logs") {
      setTimeout(() => logsScrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [logs.length, activeTab]);

  const invalidate = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: getListHostedBotsQueryKey() });
  };

  const handleStart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await startMutation.mutateAsync({ id });
      invalidate();
    } catch (err) {
      Alert.alert("Erro", parseApiError(err));
    }
  };

  const handleStop = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await stopMutation.mutateAsync({ id });
      invalidate();
    } catch (err) {
      Alert.alert("Erro", parseApiError(err));
    }
  };

  const handleRestart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await restartMutation.mutateAsync({ id });
      invalidate();
    } catch (err) {
      Alert.alert("Erro", parseApiError(err));
    }
  };

  const handleDelete = () => {
    Alert.alert("Remover bot", `Deseja remover "${bot?.name ?? "este bot"}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync({ id });
            queryClient.invalidateQueries({ queryKey: getListHostedBotsQueryKey() });
            router.back();
          } catch (err) {
            Alert.alert("Erro", parseApiError(err));
          }
        },
      },
    ]);
  };

  const isActionPending =
    startMutation.isPending || stopMutation.isPending || restartMutation.isPending;

  if (isLoading) {
    return (
      <View style={[s.root, { paddingTop }]}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color="#EBEBF2" />
          </Pressable>
        </View>
        <View style={s.centered}>
          <ActivityIndicator color="#A78BFA" size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color="#EBEBF2" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{bot?.name ?? "Bot Hospedado"}</Text>
          <View style={s.statusRow}>
            <View style={[s.statusDot, { backgroundColor: statusCfg.color }]} />
            <Text style={[s.statusLabel, { color: statusCfg.color }]}>{statusCfg.label}</Text>
            {bot?.sourceType === "github" && (
              <View style={s.srcBadge}>
                <Feather name="github" size={10} color="#8E8E9E" />
                <Text style={s.srcText}>GitHub</Text>
              </View>
            )}
          </View>
        </View>
        <Pressable onPress={handleDelete} style={s.deleteBtn}>
          <Feather name="trash-2" size={18} color="#EF4444" />
        </Pressable>
      </View>

      <View style={s.controls}>
        {isRunning ? (
          <>
            <Pressable
              style={[s.ctrlBtn, s.ctrlStop, isActionPending && s.ctrlDisabled]}
              onPress={handleStop}
              disabled={isActionPending}
            >
              {stopMutation.isPending ? (
                <ActivityIndicator color="#EF4444" size="small" />
              ) : (
                <>
                  <Feather name="square" size={14} color="#EF4444" />
                  <Text style={s.ctrlStopText}>Parar</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={[s.ctrlBtn, s.ctrlRestart, isActionPending && s.ctrlDisabled]}
              onPress={handleRestart}
              disabled={isActionPending}
            >
              {restartMutation.isPending ? (
                <ActivityIndicator color="#F59E0B" size="small" />
              ) : (
                <>
                  <Feather name="refresh-cw" size={14} color="#F59E0B" />
                  <Text style={s.ctrlRestartText}>Reiniciar</Text>
                </>
              )}
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[s.ctrlBtn, s.ctrlStart, isActionPending && s.ctrlDisabled]}
            onPress={handleStart}
            disabled={isActionPending}
          >
            {startMutation.isPending ? (
              <ActivityIndicator color="#22C55E" size="small" />
            ) : (
              <>
                <Feather name="play" size={14} color="#22C55E" />
                <Text style={s.ctrlStartText}>Iniciar</Text>
              </>
            )}
          </Pressable>
        )}
        <Pressable style={s.ctrlBtn} onPress={() => { refetch(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
          <Feather name="refresh-cw" size={14} color="#8E8E9E" />
        </Pressable>
      </View>

      <View style={s.tabRow}>
        <Pressable
          style={[s.tabBtn, activeTab === "logs" && s.tabBtnActive]}
          onPress={() => { setActiveTab("logs"); setSelectedFile(null); }}
        >
          <Feather name="terminal" size={13} color={activeTab === "logs" ? "#A78BFA" : "#8E8E9E"} />
          <Text style={[s.tabText, activeTab === "logs" && s.tabTextActive]}>Logs</Text>
        </Pressable>
        <Pressable
          style={[s.tabBtn, activeTab === "files" && s.tabBtnActive]}
          onPress={() => setActiveTab("files")}
        >
          <Feather name="folder" size={13} color={activeTab === "files" ? "#A78BFA" : "#8E8E9E"} />
          <Text style={[s.tabText, activeTab === "files" && s.tabTextActive]}>Arquivos ({files.length})</Text>
        </Pressable>
      </View>

      {activeTab === "logs" && !selectedFile && (
        <ScrollView
          ref={logsScrollRef}
          style={s.logsBox}
          contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 14, paddingBottom }}
          showsVerticalScrollIndicator
        >
          {logs.length === 0 ? (
            <Text style={s.logsEmpty}>
              {isRunning ? "Aguardando logs..." : "Inicie o bot para ver os logs."}
            </Text>
          ) : (
            logs.map((line, idx) => {
              const isErr = line.startsWith("[err]");
              return (
                <Text key={idx} style={[s.logLine, isErr && s.logLineErr]}>{line}</Text>
              );
            })
          )}
        </ScrollView>
      )}

      {activeTab === "files" && !selectedFile && (
        <ScrollView
          style={s.filesList}
          contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16, paddingBottom }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6D28D9" />}
        >
          {files.length === 0 ? (
            <Text style={s.logsEmpty}>Nenhum arquivo encontrado.</Text>
          ) : (
            files.map((file) => (
              <Pressable
                key={file}
                style={({ pressed }) => [s.fileRow, pressed && { opacity: 0.7 }]}
                onPress={() => setSelectedFile(file)}
              >
                <Feather name="file-text" size={14} color="#A78BFA" />
                <Text style={s.fileName} numberOfLines={1}>{file}</Text>
                <Feather name="chevron-right" size={14} color="#8E8E9E" />
              </Pressable>
            ))
          )}
        </ScrollView>
      )}

      {selectedFile && (
        <View style={{ flex: 1 }}>
          <View style={s.fileViewerHeader}>
            <Pressable onPress={() => setSelectedFile(null)} style={s.fileBackBtn}>
              <Feather name="arrow-left" size={14} color="#A78BFA" />
              <Text style={s.fileBackText}>Arquivos</Text>
            </Pressable>
            <Text style={s.fileViewerPath} numberOfLines={1}>{selectedFile}</Text>
          </View>
          {isFetchingFile ? (
            <View style={s.centered}><ActivityIndicator color="#A78BFA" /></View>
          ) : (
            <ScrollView
              style={s.codeBox}
              contentContainerStyle={{ padding: 14, paddingBottom }}
              showsVerticalScrollIndicator
            >
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View>
                  {fileContent?.content
                    ? fileContent.content.split("\n").map((line, idx) => (
                        <SyntaxLine
                          key={idx}
                          line={line}
                          lang={getLanguage(selectedFile)}
                        />
                      ))
                    : <Text style={s.codeText}>Não foi possível carregar o arquivo.</Text>
                  }
                </View>
              </ScrollView>
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0C0C11" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#20202B",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    color: "#EBEBF2",
    fontFamily: "Inter_600SemiBold",
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  srcBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  srcText: { fontSize: 9, color: "#8E8E9E", fontFamily: "Inter_500Medium" },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EF444415",
    borderWidth: 1,
    borderColor: "#EF444430",
    alignItems: "center",
    justifyContent: "center",
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ctrlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
  },
  ctrlStart: { borderColor: "#22C55E30", backgroundColor: "#22C55E10" },
  ctrlStop: { borderColor: "#EF444430", backgroundColor: "#EF444410" },
  ctrlRestart: { borderColor: "#F59E0B30", backgroundColor: "#F59E0B10" },
  ctrlDisabled: { opacity: 0.5 },
  ctrlStartText: { fontSize: 13, color: "#22C55E", fontFamily: "Inter_600SemiBold" },
  ctrlStopText: { fontSize: 13, color: "#EF4444", fontFamily: "Inter_600SemiBold" },
  ctrlRestartText: { fontSize: 13, color: "#F59E0B", fontFamily: "Inter_600SemiBold" },

  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#20202B",
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
  },
  tabBtnActive: {
    backgroundColor: "#6D28D915",
    borderColor: "#6D28D940",
  },
  tabText: { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_600SemiBold" },
  tabTextActive: { color: "#A78BFA" },

  logsBox: {
    flex: 1,
    backgroundColor: "#08080E",
  },
  logsEmpty: {
    color: "#8E8E9E",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginTop: 40,
  },
  logLine: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 11,
    color: "#D1D1DB",
    lineHeight: 18,
  },
  logLineErr: { color: "#EF9999" },

  filesList: { flex: 1 },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#20202B50",
  },
  fileName: {
    flex: 1,
    color: "#D1D1DB",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },

  fileViewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#20202B",
  },
  fileBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fileBackText: { fontSize: 12, color: "#A78BFA", fontFamily: "Inter_600SemiBold" },
  fileViewerPath: {
    flex: 1,
    fontSize: 12,
    color: "#8E8E9E",
    fontFamily: "Inter_400Regular",
  },
  codeBox: { flex: 1, backgroundColor: "#08080E" },
  codeText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    color: "#D1D1DB",
    lineHeight: 20,
  },
});
