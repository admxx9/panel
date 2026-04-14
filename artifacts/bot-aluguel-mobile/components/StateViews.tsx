import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message = "Carregando..." }: LoadingViewProps) {
  return (
    <View style={s.center} accessibilityLabel={message}>
      <ActivityIndicator size="large" color="#6D28D9" />
      <Text style={s.loadingText}>{message}</Text>
    </View>
  );
}

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorView({ message = "Algo deu errado", onRetry }: ErrorViewProps) {
  return (
    <View style={s.center} accessibilityLabel={message}>
      <View style={s.errorIcon}>
        <Feather name="alert-triangle" size={32} color="#EF4444" />
      </View>
      <Text style={s.errorTitle}>Ops!</Text>
      <Text style={s.errorMsg}>{message}</Text>
      {onRetry && (
        <Pressable
          style={({ pressed }) => [s.retryBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={onRetry}
          accessibilityLabel="Tentar novamente"
          accessibilityRole="button"
        >
          <Feather name="refresh-cw" size={16} color="#FFF" />
          <Text style={s.retryText}>Tentar novamente</Text>
        </Pressable>
      )}
    </View>
  );
}

interface EmptyViewProps {
  icon?: string;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyView({
  icon = "inbox",
  title = "Nada por aqui",
  message = "Nenhum item encontrado",
  actionLabel,
  onAction,
}: EmptyViewProps) {
  return (
    <View style={s.center} accessibilityLabel={title}>
      <View style={s.emptyIcon}>
        <Feather name={icon as any} size={36} color="#555568" />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptyMsg}>{message}</Text>
      {actionLabel && onAction && (
        <Pressable
          style={({ pressed }) => [s.actionBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={onAction}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
        >
          <Text style={s.actionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  loadingText: {
    fontSize: 14,
    color: "#8E8E9E",
    fontFamily: "Inter_500Medium",
    marginTop: 16,
  },
  errorIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#EF444412",
    alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20, color: "#EBEBF2", fontFamily: "Inter_700Bold", marginBottom: 8,
  },
  errorMsg: {
    fontSize: 14, color: "#8E8E9E", fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 22, marginBottom: 20,
  },
  retryBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#6D28D9", borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  retryText: { fontSize: 14, color: "#FFF", fontFamily: "Inter_600SemiBold" },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#13131D", borderWidth: 1, borderColor: "#20202B",
    alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18, color: "#EBEBF2", fontFamily: "Inter_700Bold", marginBottom: 6,
  },
  emptyMsg: {
    fontSize: 14, color: "#8E8E9E", fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 22, marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: "#6D28D9", borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  actionText: { fontSize: 14, color: "#FFF", fontFamily: "Inter_600SemiBold" },
});
