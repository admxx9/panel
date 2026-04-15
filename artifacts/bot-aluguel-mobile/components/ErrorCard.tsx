import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorCard({ message, onRetry, retryLabel = "Tentar novamente" }: ErrorCardProps) {
  return (
    <View style={ec.container}>
      <View style={ec.iconWrap}>
        <Feather name="alert-triangle" size={22} color="#EF4444" />
      </View>
      <Text style={ec.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          style={({ pressed }) => [ec.retryBtn, pressed && { opacity: 0.8 }]}
          onPress={onRetry}
          accessibilityLabel={retryLabel}
          accessibilityRole="button"
        >
          <Feather name="refresh-cw" size={13} color="#FFF" />
          <Text style={ec.retryText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const ec = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "#13131D",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EF444420",
    marginBottom: 16,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EF444412",
    borderWidth: 1,
    borderColor: "#EF444425",
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#6D28D9",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 2,
  },
  retryText: {
    fontSize: 13,
    color: "#FFF",
    fontFamily: "Inter_600SemiBold",
  },
});
