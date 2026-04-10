import { useRegister } from "@workspace/api-client-react";
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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = useRegister();

  async function handleRegister() {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      setError("Preencha todos os campos");
      return;
    }
    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return;
    }
    setError("");
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const data = await registerMutation.mutateAsync({
        data: { name: name.trim(), phone: phone.trim(), password },
      });
      await signIn(data.token, data.user);
      router.replace("/(tabs)/");
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "";
      setError(msg.includes("409") || msg.includes("já")
        ? "Telefone já cadastrado"
        : "Erro ao criar conta. Tente novamente.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20),
    },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 32,
    },
    backText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
    },
    title: {
      fontSize: 28,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 15,
      color: colors.mutedForeground,
      marginBottom: 32,
      fontFamily: "Inter_400Regular",
    },
    form: { gap: 16 },
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
    eyeBtn: { padding: 4 },
    errorBox: {
      backgroundColor: "#DC262620",
      borderRadius: colors.radius,
      padding: 12,
      borderWidth: 1,
      borderColor: "#DC262640",
    },
    errorText: { color: colors.destructive, fontSize: 13, fontFamily: "Inter_400Regular" },
    btn: { borderRadius: colors.radius, overflow: "hidden" as const, marginTop: 8 },
    btnGradient: {
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    btnText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    loginRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 24,
      gap: 4,
    },
    loginText: { color: colors.mutedForeground, fontSize: 14, fontFamily: "Inter_400Regular" },
    loginLink: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
  });

  return (
    <View style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.mutedForeground} />
            <Text style={s.backText}>Voltar</Text>
          </Pressable>

          <Text style={s.title}>Criar conta</Text>
          <Text style={s.subtitle}>Comece gratuitamente agora</Text>

          <View style={s.form}>
            <View>
              <Text style={s.fieldLabel}>NOME</Text>
              <View style={s.inputWrapper}>
                <TextInput
                  style={s.input}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.mutedForeground}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

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
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable style={s.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
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
              style={({ pressed }) => [s.btn, { opacity: pressed || registerMutation.isPending ? 0.8 : 1 }]}
              onPress={handleRegister}
              disabled={registerMutation.isPending}
            >
              <LinearGradient
                colors={["#F97316", "#C850C0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.btnGradient}
              >
                {registerMutation.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={s.btnText}>Criar conta</Text>
                )}
              </LinearGradient>
            </Pressable>

            <View style={s.loginRow}>
              <Text style={s.loginText}>Já tem conta?</Text>
              <Pressable onPress={() => router.push("/(auth)/login")}>
                <Text style={s.loginLink}>Entrar</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
