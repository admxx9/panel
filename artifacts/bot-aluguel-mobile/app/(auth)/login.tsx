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
    <View style={s.root}>
      <LinearGradient colors={["#7C3AED", "#6D28D9", "#5B21B6"]} style={[s.headerGradient, { paddingTop: insets.top + 40 }]}>
        <View style={s.logoWrap}>
          <View style={s.logoBox}>
            <Feather name="cpu" size={28} color="#7C3AED" />
          </View>
        </View>
        <Text style={s.brandName}>BotAluguel<Text style={s.brandDot}>.Pro</Text></Text>
        <Text style={s.brandSub}>Gerencie seus bots WhatsApp</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>
            <Text style={s.cardTitle}>Entrar na conta</Text>

            <View style={s.field}>
              <Text style={s.label}>TELEFONE</Text>
              <View style={[s.inputRow, focusPhone && s.inputFocused]}>
                <Feather name="phone" size={16} color={focusPhone ? "#7C3AED" : "#9CA3AF"} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="55 11 99999-9999"
                  placeholderTextColor="#9CA3AF"
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
                <Feather name="lock" size={16} color={focusPass ? "#7C3AED" : "#9CA3AF"} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="Sua senha"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusPass(true)}
                  onBlur={() => setFocusPass(false)}
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} style={s.eyeBtn}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#9CA3AF" />
                </Pressable>
              </View>
            </View>

            {error ? (
              <View style={s.errorRow}>
                <Feather name="alert-circle" size={14} color="#EF4444" />
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
          </View>

          <Pressable style={s.registerRow} onPress={() => router.push("/(auth)/register")}>
            <Text style={s.registerText}>Não tem conta?</Text>
            <Text style={s.registerLink}> Criar conta grátis</Text>
          </Pressable>

          <Text style={s.footer}>BotAluguel Pro © 2025</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerGradient: {
    alignItems: "center",
    paddingBottom: 36,
  },
  logoWrap: {
    marginBottom: 16,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  brandName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  brandDot: {
    color: "#E9D5FF",
  },
  brandSub: {
    fontSize: 14,
    color: "#FFFFFFBB",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "Inter_700Bold",
    marginBottom: 24,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F3F4F6",
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: "#7C3AED",
    backgroundColor: "#FAFAFF",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#1F2937",
    fontSize: 15,
    paddingVertical: 14,
    fontFamily: "Inter_400Regular",
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 4,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  btn: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  registerLink: {
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  footer: {
    color: "#D1D5DB",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 24,
  },
});
