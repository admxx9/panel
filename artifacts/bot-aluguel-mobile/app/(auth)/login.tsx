import { useLogin } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
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
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [focusPhone, setFocusPhone] = useState(false);
  const [focusPass, setFocusPass] = useState(false);

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

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.brand}>
            <View style={s.logoWrap}>
              <LinearGradient
                colors={["#F97316", "#C850C0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.logoBox}
              >
                <Feather name="cpu" size={26} color="#FFF" />
              </LinearGradient>
            </View>
            <Text style={s.brandName}>BotAluguel<Text style={s.brandDot}>.Pro</Text></Text>
            <Text style={s.brandSub}>Painel de gerenciamento de bots</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Entrar na conta</Text>

            <View style={s.field}>
              <Text style={s.label}>TELEFONE</Text>
              <View style={[s.inputRow, focusPhone && s.inputFocused]}>
                <Feather name="phone" size={15} color={focusPhone ? "#F97316" : "#4B4C6B"} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="55 11 99999-9999"
                  placeholderTextColor="#4B4C6B"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  onFocus={() => setFocusPhone(true)}
                  onBlur={() => setFocusPhone(false)}
                />
              </View>
            </View>

            <View style={s.field}>
              <Text style={s.label}>SENHA</Text>
              <View style={[s.inputRow, focusPass && s.inputFocused]}>
                <Feather name="lock" size={15} color={focusPass ? "#F97316" : "#4B4C6B"} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="Sua senha"
                  placeholderTextColor="#4B4C6B"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusPass(true)}
                  onBlur={() => setFocusPass(false)}
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} style={s.eyeBtn}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={15} color="#4B4C6B" />
                </Pressable>
              </View>
            </View>

            {error ? (
              <View style={s.errorRow}>
                <Feather name="alert-circle" size={13} color="#EF4444" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [s.btn, { opacity: pressed || loginMutation.isPending ? 0.85 : 1 }]}
              onPress={handleLogin}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={s.btnText}>Entrar</Text>
              )}
            </Pressable>

            <View style={s.divider}>
              <View style={s.dividerLine} />
            </View>

            <Pressable style={s.registerRow} onPress={() => router.push("/(auth)/register")}>
              <Text style={s.registerText}>Não tem conta?</Text>
              <Text style={s.registerLink}> Criar conta grátis</Text>
            </Pressable>
          </View>

          <Text style={s.footer}>BotAluguel Pro © 2025</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#090A0F",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  brand: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrap: {
    marginBottom: 16,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#F1F2F6",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  brandDot: {
    color: "#F97316",
  },
  brandSub: {
    fontSize: 12,
    color: "#4B4C6B",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    padding: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#F1F2F6",
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#4B4C6B",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131420",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1E1F2E",
    paddingHorizontal: 12,
  },
  inputFocused: {
    borderColor: "#F97316",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#F1F2F6",
    fontSize: 14,
    paddingVertical: 13,
    fontFamily: "Inter_400Regular",
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 4,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EF444415",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#EF444430",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  btn: {
    backgroundColor: "#F97316",
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1A1B28",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    color: "#4B4C6B",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  registerLink: {
    color: "#F97316",
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    color: "#2A2B3E",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 32,
  },
});
