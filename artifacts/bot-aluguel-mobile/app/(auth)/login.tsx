import { useLogin } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useLogin();

  async function handleLogin() {
    if (!phone.trim() || !password.trim()) {
      setError("Preencha todos os campos");
      return;
    }
    setError("");
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const data = await loginMutation.mutateAsync({
        data: { phone: phone.trim(), password },
      });
      await signIn(data.token, data.user);
      router.replace("/(tabs)/");
    } catch {
      setError("Telefone ou senha incorretos");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20),
    },
    logo: {
      marginBottom: 48,
    },
    logoGradient: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      color: colors.mutedForeground,
      marginTop: 6,
      fontFamily: "Inter_400Regular",
    },
    form: {
      gap: 16,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "500" as const,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      marginBottom: 6,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.secondary,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
    },
    input: {
      flex: 1,
      color: colors.foreground,
      fontSize: 15,
      paddingVertical: 14,
      fontFamily: "Inter_400Regular",
    },
    eyeBtn: {
      padding: 4,
    },
    errorBox: {
      backgroundColor: "#DC262620",
      borderRadius: colors.radius,
      padding: 12,
      borderWidth: 1,
      borderColor: "#DC262640",
    },
    errorText: {
      color: colors.destructive,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
    },
    loginBtn: {
      borderRadius: colors.radius,
      overflow: "hidden" as const,
      marginTop: 8,
    },
    loginBtnGradient: {
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    loginBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    registerRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 24,
      gap: 4,
    },
    registerText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
    },
    registerLink: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
  });

  return (
    <View style={s.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.logo}>
            <LinearGradient
              colors={["#8B3FFF", "#2979FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.logoGradient}
            >
              <Feather name="cpu" size={32} color="#FFF" />
            </LinearGradient>
            <Text style={s.title}>BotAluguel Pro</Text>
            <Text style={s.subtitle}>Entre na sua conta</Text>
          </View>

          <View style={s.form}>
            <View>
              <Text style={s.fieldLabel}>TELEFONE</Text>
              <View style={s.inputWrapper}>
                <TextInput
                  style={s.input}
                  placeholder="Ex: 5511999999999"
                  placeholderTextColor={colors.mutedForeground}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View>
              <Text style={s.fieldLabel}>SENHA</Text>
              <View style={s.inputWrapper}>
                <TextInput
                  style={s.input}
                  placeholder="Sua senha"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  style={s.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={18}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              </View>
            </View>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                s.loginBtn,
                { opacity: pressed || loginMutation.isPending ? 0.8 : 1 },
              ]}
              onPress={handleLogin}
              disabled={loginMutation.isPending}
            >
              <LinearGradient
                colors={["#8B3FFF", "#6B1FDF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.loginBtnGradient}
              >
                {loginMutation.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={s.loginBtnText}>Entrar</Text>
                )}
              </LinearGradient>
            </Pressable>

            <View style={s.registerRow}>
              <Text style={s.registerText}>Não tem conta?</Text>
              <Pressable onPress={() => router.push("/(auth)/register")}>
                <Text style={s.registerLink}>Criar conta</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
