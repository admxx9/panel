import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLogin } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { parseApiError, parseLoginFieldErrors, FieldErrors } from "@/utils/parseApiError";
import {
  ActivityIndicator,
  Image,
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
import { getApiBaseUrl } from "@/lib/api";

type Screen = "choose" | "email";

function GoogleIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

function GithubIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="rgba(255,255,255,0.35)">
      <Path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </Svg>
  );
}

const POLL_INTERVAL = 2500;
const POLL_TIMEOUT = 5 * 60 * 1000;
const ONBOARDING_KEY = "ONBOARDING_SEEN";

async function redirectAfterLogin() {
  const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
  if (!seen) {
    router.replace("/onboarding" as any);
  } else {
    router.replace("/(tabs)/");
  }
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [screen, setScreen] = useState<Screen>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<"phone" | "password">>({});
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass, setFocusPass] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef(0);
  const loginMutation = useLogin();

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  async function startPolling(state: string) {
    pollStartRef.current = Date.now();
    pollRef.current = setInterval(async () => {
      if (Date.now() - pollStartRef.current > POLL_TIMEOUT) {
        stopPolling(); setGoogleLoading(false);
        setError("Tempo de login expirado. Tente novamente.");
        return;
      }
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/auth/google/poll/${state}`);
        const data = await res.json();
        if (data.status === "done") {
          stopPolling(); setGoogleLoading(false);
          await signIn(data.token, data.user);
          void redirectAfterLogin();
        } else if (data.status === "error") {
          stopPolling(); setGoogleLoading(false);
          setError(data.message ?? "Erro ao fazer login com Google");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } catch { /* keep trying */ }
    }, POLL_INTERVAL);
  }

  async function handleGoogleLogin() {
    try {
      setError(""); setGoogleLoading(true);
      const res = await fetch(`${getApiBaseUrl()}/api/auth/google/start`);
      if (!res.ok) throw new Error("Não foi possível iniciar login com Google");
      const { url, state } = await res.json();
      if (!url || !state) throw new Error("Resposta inválida do servidor");
      // Open in-app browser (stays inside the app)
      WebBrowser.openBrowserAsync(url, {
        toolbarColor: "#0A0A12",
        controlsColor: "#7C3AED",
        showTitle: false,
      });
      await startPolling(state);
    } catch (err) {
      stopPolling(); setGoogleLoading(false);
      setError(parseApiError(err, "Erro ao conectar com Google"));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function handleLogin() {
    if (!email.trim()) { setFieldErrors({ phone: "Informe seu e-mail ou telefone" }); return; }
    if (!password.trim()) { setFieldErrors({ password: "Informe sua senha" }); return; }
    setError(""); setFieldErrors({});
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const data = await loginMutation.mutateAsync({ data: { phone: email.trim(), password } });
      await signIn(data.token, data.user);
      void redirectAfterLogin();
    } catch (err) {
      const fe = parseLoginFieldErrors(err);
      setFieldErrors(fe);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  const paddingTop = (Platform.OS === "web" ? insets.top + 20 : insets.top) + 60;

  if (screen === "choose") {
    return (
      <View style={s.root}>
        <View style={s.blob1} /><View style={s.blob2} /><View style={s.blob3} />
        <ScrollView contentContainerStyle={[s.scroll, { paddingTop }]} showsVerticalScrollIndicator={false}>
          <View style={s.logoArea}>
            <Image source={require("@/assets/images/icon.png")} style={s.logoImg} />
            <View style={s.logoRow}>
              <Text style={s.brandName}>BotAluguel</Text>
              <Text style={s.brandPro}>PRO</Text>
            </View>
          </View>

          <Text style={s.chooseTitle}>Bem-vindo de volta</Text>
          <Text style={s.chooseSub}>Escolha como deseja entrar</Text>

          {error ? (
            <View style={s.errorRow}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Google */}
          <Pressable style={({ pressed }) => [s.methodBtn, pressed && { opacity: 0.85 }]} onPress={handleGoogleLogin} disabled={googleLoading}>
            {googleLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <><GoogleIcon size={22} /><Text style={s.methodBtnText}>Continuar com Google</Text></>
            )}
          </Pressable>

          {/* GitHub — em breve */}
          <Pressable style={[s.methodBtn, s.methodBtnDisabled]} disabled>
            <GithubIcon size={22} />
            <Text style={[s.methodBtnText, { color: "rgba(255,255,255,0.25)" }]}>Continuar com GitHub</Text>
            <View style={s.comingSoon}><Text style={s.comingSoonText}>em breve</Text></View>
          </Pressable>

          {/* Email */}
          <Pressable style={({ pressed }) => [s.methodBtn, s.methodBtnEmail, pressed && { opacity: 0.85 }]} onPress={() => { setError(""); setScreen("email"); }}>
            <Feather name="mail" size={22} color="rgba(255,255,255,0.8)" />
            <Text style={s.methodBtnText}>Continuar com E-mail</Text>
          </Pressable>

          <View style={s.linkRow}>
            <Text style={s.linkText}>Não tem conta? </Text>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text style={s.linkAction}>Criar agora</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Email form screen
  return (
    <View style={s.root}>
      <View style={s.blob1} /><View style={s.blob2} /><View style={s.blob3} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={[s.scroll, { paddingTop }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable style={s.backBtn} onPress={() => { setError(""); setScreen("choose"); }}>
            <Feather name="arrow-left" size={20} color="rgba(139,130,177,0.7)" />
            <Text style={s.backText}>Voltar</Text>
          </Pressable>

          <Text style={s.formTitle}>Entrar com e-mail</Text>
          <Text style={s.formSub}>Acesse sua conta para gerenciar seus bots</Text>

          <Text style={s.label}>E-MAIL</Text>
          <View style={[s.inputRow, focusEmail && s.inputFocused, !!fieldErrors.phone && s.inputError]}>
            <Feather name="mail" size={18} color={fieldErrors.phone ? "#EF4444" : focusEmail ? "#7C3AED" : "#4B4C6B"} style={s.inputIcon} />
            <TextInput style={s.input} placeholder="seu@email.com" placeholderTextColor="#4B4C6B" value={email} onChangeText={(v) => { setEmail(v); setFieldErrors((f) => ({ ...f, phone: undefined })); }} keyboardType="email-address" autoCapitalize="none" autoComplete="email" onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)} />
          </View>
          {fieldErrors.phone ? (
            <View style={s.fieldErrorRow}>
              <Feather name="alert-circle" size={12} color="#EF4444" />
              <Text style={s.fieldErrorText}>{fieldErrors.phone}</Text>
            </View>
          ) : null}

          <Text style={[s.label, { marginTop: fieldErrors.phone ? 8 : 0 }]}>SENHA</Text>
          <View style={[s.inputRow, focusPass && s.inputFocused, !!fieldErrors.password && s.inputError]}>
            <Feather name="lock" size={18} color={fieldErrors.password ? "#EF4444" : focusPass ? "#7C3AED" : "#4B4C6B"} style={s.inputIcon} />
            <TextInput style={s.input} placeholder="Sua senha" placeholderTextColor="#4B4C6B" value={password} onChangeText={(v) => { setPassword(v); setFieldErrors((f) => ({ ...f, password: undefined })); }} secureTextEntry={!showPassword} onFocus={() => setFocusPass(true)} onBlur={() => setFocusPass(false)} />
            <Pressable onPress={() => setShowPassword(v => !v)} style={s.eyeBtn}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#4B4C6B" />
            </Pressable>
          </View>
          {fieldErrors.password ? (
            <View style={s.fieldErrorRow}>
              <Feather name="alert-circle" size={12} color="#EF4444" />
              <Text style={s.fieldErrorText}>{fieldErrors.password}</Text>
            </View>
          ) : null}

          <Pressable style={[s.forgotBtn, { marginTop: fieldErrors.password ? 4 : -8 }]} onPress={() => router.push("/(auth)/forgot-password" as any)}>
            <Text style={s.forgotText}>Esqueci minha senha</Text>
          </Pressable>

          {error ? (
            <View style={s.errorRow}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable style={({ pressed }) => [s.loginBtn, { opacity: pressed || loginMutation.isPending ? 0.85 : 1 }]} onPress={handleLogin} disabled={loginMutation.isPending}>
            <LinearGradient colors={["#7C3AED", "#6D28D9", "#5B21B6"]} style={s.loginBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              {loginMutation.isPending ? <ActivityIndicator color="#FFF" size="small" /> : <><Text style={s.loginBtnText}>Entrar</Text><Feather name="arrow-right" size={18} color="#FFF" /></>}
            </LinearGradient>
          </Pressable>

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

const BG = "#020205";

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  blob1: { position: "absolute", top: -80, left: -60, width: 320, height: 320, borderRadius: 160, backgroundColor: "rgba(124,58,237,0.12)", ...(Platform.OS === "web" ? { filter: "blur(70px)" } as any : {}) },
  blob2: { position: "absolute", top: 160, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(236,72,153,0.06)", ...(Platform.OS === "web" ? { filter: "blur(60px)" } as any : {}) },
  blob3: { position: "absolute", bottom: 40, left: 0, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(99,102,241,0.05)", ...(Platform.OS === "web" ? { filter: "blur(55px)" } as any : {}) },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 48 },

  logoArea: { marginBottom: 40 },
  logoImg: { width: 56, height: 56, borderRadius: 16 },
  logoRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 14 },
  brandName: { fontSize: 22, fontWeight: "800", color: "#FFF", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  brandPro: { fontSize: 11, fontWeight: "700", color: "rgba(124,58,237,0.7)", fontFamily: "Inter_700Bold", letterSpacing: 2 },

  chooseTitle: { fontSize: 28, fontWeight: "800", color: "#FFF", fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 8 },
  chooseSub: { fontSize: 14, color: "rgba(139,130,177,0.4)", fontFamily: "Inter_400Regular", marginBottom: 32, lineHeight: 20 },

  methodBtn: { flexDirection: "row", alignItems: "center", gap: 14, height: 58, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", paddingHorizontal: 20, marginBottom: 12 },
  methodBtnDisabled: { opacity: 0.45 },
  methodBtnEmail: { borderColor: "rgba(124,58,237,0.25)", backgroundColor: "rgba(124,58,237,0.06)" },
  methodBtnText: { fontSize: 15, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_600SemiBold", fontWeight: "600", flex: 1 },
  comingSoon: { backgroundColor: "rgba(124,58,237,0.15)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  comingSoonText: { fontSize: 10, color: "rgba(167,139,250,0.5)", fontFamily: "Inter_600SemiBold" },

  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 28 },
  backText: { fontSize: 14, color: "rgba(139,130,177,0.6)", fontFamily: "Inter_500Medium" },

  formTitle: { fontSize: 26, fontWeight: "800", color: "#FFF", fontFamily: "Inter_700Bold", letterSpacing: -0.4, marginBottom: 8 },
  formSub: { fontSize: 14, color: "rgba(139,130,177,0.4)", fontFamily: "Inter_400Regular", marginBottom: 28, lineHeight: 20 },

  label: { fontSize: 11, fontWeight: "700", color: "rgba(139,130,177,0.45)", fontFamily: "Inter_700Bold", letterSpacing: 1.5, marginBottom: 8, marginTop: 4 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", height: 54, paddingHorizontal: 16, marginBottom: 4 },
  inputFocused: { borderColor: "rgba(124,58,237,0.4)", backgroundColor: "rgba(124,58,237,0.04)" },
  inputError: { borderColor: "rgba(239,68,68,0.5)", backgroundColor: "rgba(239,68,68,0.04)" },
  fieldErrorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12, paddingLeft: 4 },
  fieldErrorText: { fontSize: 12, color: "#EF4444", fontFamily: "Inter_500Medium", flex: 1 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#FFF", fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 0, height: "100%" },
  eyeBtn: { padding: 4, marginLeft: 4 },

  forgotBtn: { alignSelf: "flex-end", marginBottom: 20, marginTop: -8 },
  forgotText: { fontSize: 12, color: "rgba(124,58,237,0.6)", fontFamily: "Inter_500Medium" },

  errorRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(239,68,68,0.15)" },
  errorText: { color: "#EF4444", fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },

  loginBtn: { borderRadius: 14, overflow: "hidden", shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  loginBtnGradient: { height: 56, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  loginBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },

  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: 36, paddingBottom: 20 },
  linkText: { fontSize: 13, color: "rgba(139,130,177,0.3)", fontFamily: "Inter_400Regular" },
  linkAction: { fontSize: 13, color: "#7C3AED", fontWeight: "700", fontFamily: "Inter_700Bold" },
});
