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
import Svg, { Path } from "react-native-svg";
import { useAuth } from "@/context/AuthContext";

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass, setFocusPass] = useState(false);

  const loginMutation = useLogin();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Preencha todos os campos");
      return;
    }
    setError("");
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const data = await loginMutation.mutateAsync({
        data: { phone: email.trim(), password },
      });
      await signIn(data.token, data.user);
      router.replace("/(tabs)/");
    } catch {
      setError("E-mail ou senha incorretos");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function handleGoogleLogin() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const paddingTop = Platform.OS === "web" ? insets.top + 20 : insets.top;

  return (
    <View style={s.root}>
      <View style={s.blob1} />
      <View style={s.blob2} />
      <View style={s.blob3} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: paddingTop + 60 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={s.logoArea}>
            <LinearGradient colors={["#7C3AED", "#6D28D9"]} style={s.logoBox}>
              <Feather name="zap" size={26} color="#FFF" />
            </LinearGradient>
            <View style={s.logoTextWrap}>
              <Text style={s.brandName}>BotAluguel</Text>
              <Text style={s.brandPro}>PRO</Text>
            </View>
            <Text style={s.tagline}>Automatize seu WhatsApp com inteligência</Text>
          </View>

          {/* Título */}
          <Text style={s.title}>Entrar na conta</Text>
          <Text style={s.subtitle}>Acesse sua conta para gerenciar seus bots</Text>

          {/* Email */}
          <Text style={s.label}>E-MAIL</Text>
          <View style={[s.inputRow, focusEmail && s.inputFocused]}>
            <Feather name="mail" size={18} color={focusEmail ? "#7C3AED" : "#4B4C6B"} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="seu@email.com"
              placeholderTextColor="#4B4C6B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onFocus={() => setFocusEmail(true)}
              onBlur={() => setFocusEmail(false)}
            />
          </View>

          {/* Senha */}
          <Text style={s.label}>SENHA</Text>
          <View style={[s.inputRow, focusPass && s.inputFocused]}>
            <Feather name="lock" size={18} color={focusPass ? "#7C3AED" : "#4B4C6B"} style={s.inputIcon} />
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
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#4B4C6B" />
            </Pressable>
          </View>

          <Pressable style={s.forgotBtn}>
            <Text style={s.forgotText}>Esqueci minha senha</Text>
          </Pressable>

          {/* Error */}
          {error ? (
            <View style={s.errorRow}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login button */}
          <Pressable
            style={({ pressed }) => [s.loginBtn, { opacity: pressed || loginMutation.isPending ? 0.85 : 1 }]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
          >
            <LinearGradient colors={["#7C3AED", "#6D28D9", "#5B21B6"]} style={s.loginBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              {loginMutation.isPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={s.loginBtnText}>Entrar</Text>
                  <Feather name="arrow-right" size={18} color="#FFF" />
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>ou continue com</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Google button */}
          <Pressable
            style={({ pressed }) => [s.googleBtn, pressed && { opacity: 0.8 }]}
            onPress={handleGoogleLogin}
          >
            <GoogleIcon />
            <Text style={s.googleBtnText}>Entrar com Google</Text>
          </Pressable>

          {/* Register link */}
          <View style={s.linkRow}>
            <Text style={s.linkText}>Não tem conta? </Text>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text style={s.linkAction}>Criar agora</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#08080D",
  },
  blob1: {
    position: "absolute",
    top: -60,
    left: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(124,58,237,0.15)",
    ...(Platform.OS === "web" ? { filter: "blur(60px)" } as any : {}),
  },
  blob2: {
    position: "absolute",
    top: 120,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(236,72,153,0.08)",
    ...(Platform.OS === "web" ? { filter: "blur(50px)" } as any : {}),
  },
  blob3: {
    position: "absolute",
    bottom: 60,
    left: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(99,102,241,0.06)",
    ...(Platform.OS === "web" ? { filter: "blur(45px)" } as any : {}),
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  logoArea: {
    marginBottom: 36,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoTextWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 12,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  brandPro: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(124,58,237,0.7)",
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(139,130,177,0.5)",
    fontFamily: "Inter_400Regular",
    marginTop: 8,
    lineHeight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(139,130,177,0.4)",
    fontFamily: "Inter_400Regular",
    marginBottom: 28,
    lineHeight: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(139,130,177,0.5)",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: "rgba(124,58,237,0.4)",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingVertical: 0,
    height: "100%",
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 4,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: -8,
  },
  forgotText: {
    fontSize: 12,
    color: "rgba(124,58,237,0.6)",
    fontFamily: "Inter_500Medium",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  loginBtn: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  loginBtnGradient: {
    height: 54,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loginBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    fontSize: 11,
    color: "rgba(139,130,177,0.3)",
    fontFamily: "Inter_500Medium",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    height: 52,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  googleBtnText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
    paddingBottom: 20,
  },
  linkText: {
    fontSize: 13,
    color: "rgba(139,130,177,0.3)",
    fontFamily: "Inter_400Regular",
  },
  linkAction: {
    fontSize: 13,
    color: "#7C3AED",
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});
