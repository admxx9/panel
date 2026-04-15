import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface LoadingButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  isLoading?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  iconPosition?: "left" | "right";
  style?: StyleProp<ViewStyle>;
  labelStyle?: object;
  variant?: "primary" | "danger" | "ghost";
}

export function LoadingButton({
  label,
  isLoading = false,
  icon,
  iconPosition = "right",
  style,
  labelStyle,
  variant = "primary",
  disabled,
  ...rest
}: LoadingButtonProps) {
  const isDisabled = disabled || isLoading;

  const bgColor =
    variant === "danger" ? "#EF4444" :
    variant === "ghost" ? "transparent" :
    "#6D28D9";

  const textColor =
    variant === "ghost" ? "#A78BFA" : "#FFF";

  return (
    <Pressable
      style={({ pressed }) => [
        btn.base,
        { backgroundColor: bgColor },
        variant === "ghost" && btn.ghost,
        isDisabled && btn.disabled,
        pressed && !isDisabled && btn.pressed,
        style,
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading, disabled: isDisabled }}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Feather name={icon} size={16} color={textColor} />
          )}
          <Text style={[btn.label, { color: textColor }, labelStyle]}>{label}</Text>
          {icon && iconPosition === "right" && (
            <Feather name={icon} size={16} color={textColor} />
          )}
        </>
      )}
    </Pressable>
  );
}

const btn = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    minHeight: 50,
  },
  ghost: {
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
