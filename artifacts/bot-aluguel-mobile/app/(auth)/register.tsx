import { useRegister } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { parseApiError, parseRegisterFieldErrors, FieldErrors, RegisterField } from "@/utils/parseApiError";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
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

const COUNTRIES = [
  { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brasil" },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "Estados Unidos" },
  { code: "PT", dial: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "AR", dial: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "MX", dial: "+52", flag: "🇲🇽", name: "México" },
  { code: "CO", dial: "+57", flag: "🇨🇴", name: "Colômbia" },
  { code: "CL", dial: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "Espanha" },
  { code: "PE", dial: "+51", flag: "🇵🇪", name: "Peru" },
  { code: "UY", dial: "+598", flag: "🇺🇾", name: "Uruguai" },
  { code: "PY", dial: "+595", flag: "🇵🇾", name: "Paraguai" },
  { code: "BO", dial: "+591", flag: "🇧🇴", name: "Bolívia" },
];

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

function getPasswordStrength(pw: string): { label: string; color: string; pct: number } {
  if (!pw) return { label: "", color: "transparent", pct: 0 };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Fraca", color: "#EF4444", pct: 20 };
  if (score === 2) return { label: "Média", color: "#F59E0B", pct: 55 };
  if (score === 3) return { label: "Boa", color: "#10B981", pct: 75 };
  return { label: "Forte", color: "#7C3AED", pct: 100 };
}

const POLL_INTERVAL = 2500;
const POLL_TIMEOUT = 5 * 60 * 1000;

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [screen, setScreen] = useState<Screen>("choose");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterField>>({});
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [focusName, setFocusName] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPhone, setFocusPhone] = useState(false);
  const [focusPass, setFocusPass] = useState(false);
  const [focusConfirm, setFocusConfirm] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef(0);
  const registerMutation = useRegister();

  const strength = getPasswordStrength(password);

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
          router.replace("/onboarding" as any);
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

  function clearField(field: RegisterField) {
    setFieldErrors((f) => ({ ...f, [field]: undefined }));
  }

  async function handleRegister() {
    const fe: FieldErrors<RegisterField> = {};
    if (!name.trim()) fe.name = "Informe seu nome completo";
    if (!email.trim()) fe.phone = "Informe seu e-mail";
    if (!password) fe.password = "Informe uma senha";
    else if (password.length < 6) fe.password = "A senha deve ter no mínimo 6 caracteres";
    if (password && password !== confirmPassword) fe.confirmPassword = "As senhas não coincidem";
    if (Object.keys(fe).length > 0) { setFieldErrors(fe); return; }
    setFieldErrors({}); setError("");
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const fullPhone = phone.trim() ? `${selectedCountry.dial}${phone.trim()}` : "";
      const result = await registerMutation.mutateAsync({
        data: { name: name.trim(), phone: fullPhone || email.trim(), password },
      });
      await signIn(result.token, result.user);
      router.replace("/onboarding" as any);
    } catch (err) {
      const fe2 = parseRegisterFieldErrors(err);
      setFieldErrors(fe2);
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
            <LinearGradient colors={["#7C3AED", "#6D28D9"]} style={s.logoBox}>
              <Feather name="zap" size={26} color="#FFF" />
            </LinearGradient>
            <View style={s.logoRow}>
              <Text style={s.brandName}>BotAluguel</Text>
              <Text style={s.brandPro}>PRO</Text>
            </View>
          </View>

          <Text style={s.chooseTitle}>Criar sua conta</Text>
          <Text style={s.chooseSub}>Comece gratuitamente, cancele quando quiser</Text>

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
              <><GoogleIcon size={22} /><Text style={s.methodBtnText}>Registrar com Google</Text></>
            )}
          </Pressable>

          {/* GitHub — em breve */}
          <Pressable style={[s.methodBtn, s.methodBtnDisabled]} disabled>
            <GithubIcon size={22} />
            <Text style={[s.methodBtnText, { color: "rgba(255,255,255,0.25)" }]}>Registrar com GitHub</Text>
            <View style={s.comingSoon}><Text style={s.comingSoonText}>em breve</Text></View>
          </Pressable>

          {/* Email */}
          <Pressable style={({ pressed }) => [s.methodBtn, s.methodBtnEmail, pressed && { opacity: 0.85 }]} onPress={() => { setError(""); setScreen("email"); }}>
            <Feather name="mail" size={22} color="rgba(255,255,255,0.8)" />
            <Text style={s.methodBtnText}>Registrar com E-mail</Text>
          </Pressable>

          <View style={s.linkRow}>
            <Text style={s.linkText}>Já tem conta? </Text>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text style={s.linkAction}>Entrar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Email form
  return (
    <View style={s.root}>
      <View style={s.blob1} /><View style={s.blob2} /><View style={s.blob3} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={[s.scroll, { paddingTop }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable style={s.backBtn} onPress={() => { setError(""); setScreen("choose"); }}>
            <Feather name="arrow-left" size={20} color="rgba(139,130,177,0.7)" />
            <Text style={s.backText}>Voltar</Text>
          </Pressable>

          <Text style={s.formTitle}>Criar conta com e-mail</Text>
          <Text style={s.formSub}>Preencha os dados abaixo para começar</Text>

          {/* Nome */}
          <Text style={s.label}>NOME COMPLETO</Text>
          <View style={[s.inputRow, focusName && s.inputFocused, !!fieldErrors.name && s.inputError]}>
            <Feather name="user" size={18} color={fieldErrors.name ? "#EF4444" : focusName ? "#7C3AED" : "#4B4C6B"} style={s.inputIcon} />
            <TextInput style={s.input} placeholder="Seu nome completo" placeholderTextColor="#4B4C6B" value={name} onChangeText={(v) => { setName(v); clearField("name"); }} autoCapitalize="words" onFocus={() => setFocusName(true)} onBlur={() => setFocusName(false)} />
          </View>
          {fieldErrors.name ? <Text style={s.fieldError}>{fieldErrors.name}</Text> : null}

          {/* Email */}
          <Text style={[s.label, { marginTop: fieldErrors.name ? 4 : 0 }]}>E-MAIL</Text>
          <View style={[s.inputRow, focusEmail && s.inputFocused, !!fieldErrors.phone && s.inputError]}>
            <Feather name="mail" size={18} color={fieldErrors.phone ? "#EF4444" : focusEmail ? "#7C3AED" : "#4B4C6B"} style={s.inputIcon} />
            <TextInput style={s.input} placeholder="seu@email.com" placeholderTextColor="#4B4C6B" value={email} onChangeText={(v) => { setEmail(v); clearField("phone"); }} keyboardType="email-address" autoCapitalize="none" autoComplete="email" onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)} />
          </View>
          {fieldErrors.phone ? <Text style={s.fieldError}>{fieldErrors.phone}</Text> : null}

          {/* WhatsApp opcional */}
          <Text style={[s.label, { marginTop: fieldErrors.phone ? 4 : 0 }]}>WHATSAPP <Text style={s.optional}>(opcional)</Text></Text>
          <View style={s.phoneRow}>
            <Pressable style={({ pressed }) => [s.countryBtn, pressed && { opacity: 0.8 }]} onPress={() => setShowCountryPicker(true)}>
              <Text style={s.countryFlag}>{selectedCountry.flag}</Text>
              <Text style={s.countryDial}>{selectedCountry.dial}</Text>
              <Feather name="chevron-down" size={14} color="#4B4C6B" />
            </Pressable>
            <View style={[s.phoneInput, focusPhone && s.inputFocused]}>
              <TextInput style={s.input} placeholder="(00) 00000-0000" placeholderTextColor="#4B4C6B" value={phone} onChangeText={setPhone} keyboardType="phone-pad" onFocus={() => setFocusPhone(true)} onBlur={() => setFocusPhone(false)} />
            </View>
          </View>

          {/* Senha */}
          <Text style={s.label}>SENHA</Text>
          <View style={[s.inputRow, focusPass && s.inputFocused, !!fieldErrors.password && s.inputError]}>
            <Feather name="lock" size={18} color={fieldErrors.password ? "#EF4444" : focusPass ? "#7C3AED" : "#4B4C6B"} style={s.inputIcon} />
            <TextInput style={s.input} placeholder="Mínimo 6 caracteres" placeholderTextColor="#4B4C6B" value={password} onChangeText={(v) => { setPassword(v); clearField("password"); }} secureTextEntry={!showPassword} onFocus={() => setFocusPass(true)} onBlur={() => setFocusPass(false)} />
            <Pressable onPress={() => setShowPassword(v => !v)} style={s.eyeBtn}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#4B4C6B" />
            </Pressable>
          </View>
          {fieldErrors.password ? <Text style={s.fieldError}>{fieldErrors.password}</Text> : null}

          {/* Password strength bar */}
          {password.length > 0 && !fieldErrors.password && (
            <View style={s.strengthWrap}>
              <View style={s.strengthTrack}>
                <View style={[s.strengthFill, { width: `${strength.pct}%` as any, backgroundColor: strength.color }]} />
              </View>
              <Text style={[s.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}

          {/* Confirmar senha */}
          <Text style={[s.label, { marginTop: password.length > 0 && !fieldErrors.password ? 8 : 4 }]}>CONFIRMAR SENHA</Text>
          <View style={[s.inputRow, focusConfirm && s.inputFocused, !!fieldErrors.confirmPassword && s.inputError]}>
            <Feather name="lock" size={18} color={fieldErrors.confirmPassword ? "#EF4444" : focusConfirm ? "#7C3AED" : "#4B4C6B"} style={s.inputIcon} />
            <TextInput style={s.input} placeholder="Repita a senha" placeholderTextColor="#4B4C6B" value={confirmPassword} onChangeText={(v) => { setConfirmPassword(v); clearField("confirmPassword"); }} secureTextEntry={!showConfirm} onFocus={() => setFocusConfirm(true)} onBlur={() => setFocusConfirm(false)} />
            <Pressable onPress={() => setShowConfirm(v => !v)} style={s.eyeBtn}>
              <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color="#4B4C6B" />
            </Pressable>
          </View>
          {fieldErrors.confirmPassword ? (
            <Text style={s.fieldError}>{fieldErrors.confirmPassword}</Text>
          ) : confirmPassword.length > 0 && password !== confirmPassword ? (
            <Text style={s.mismatch}>As senhas não coincidem</Text>
          ) : null}

          {error ? (
            <View style={[s.errorRow, { marginTop: 8 }]}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable style={({ pressed }) => [s.loginBtn, { opacity: pressed || registerMutation.isPending ? 0.85 : 1 }]} onPress={handleRegister} disabled={registerMutation.isPending}>
            <LinearGradient colors={["#7C3AED", "#6D28D9", "#5B21B6"]} style={s.loginBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              {registerMutation.isPending ? <ActivityIndicator color="#FFF" size="small" /> : <><Text style={s.loginBtnText}>Criar conta</Text><Feather name="arrow-right" size={18} color="#FFF" /></>}
            </LinearGradient>
          </Pressable>

          <View style={s.linkRow}>
            <Text style={s.linkText}>Já tem conta? </Text>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text style={s.linkAction}>Entrar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showCountryPicker} animationType="slide" transparent onRequestClose={() => setShowCountryPicker(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setShowCountryPicker(false)} />
        <View style={[s.modalSheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>Selecionar país</Text>
          <FlatList
            data={COUNTRIES}
            keyExtractor={c => c.code}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable style={({ pressed }) => [s.countryRowItem, pressed && { backgroundColor: "rgba(124,58,237,0.1)" }]} onPress={() => { setSelectedCountry(item); setShowCountryPicker(false); }}>
                <Text style={s.countryRowFlag}>{item.flag}</Text>
                <Text style={s.countryRowName}>{item.name}</Text>
                <Text style={s.countryRowDial}>{item.dial}</Text>
                {item.code === selectedCountry.code && <Feather name="check" size={18} color="#7C3AED" />}
              </Pressable>
            )}
          />
        </View>
      </Modal>
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
  logoBox: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
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
  optional: { fontSize: 10, color: "rgba(139,130,177,0.25)", fontWeight: "400", letterSpacing: 0 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", height: 54, paddingHorizontal: 16, marginBottom: 16 },
  inputFocused: { borderColor: "rgba(124,58,237,0.4)", backgroundColor: "rgba(124,58,237,0.04)" },
  inputError: { borderColor: "rgba(239,68,68,0.35)" },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#FFF", fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 0, height: "100%" },
  eyeBtn: { padding: 4, marginLeft: 4 },

  phoneRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  countryBtn: { flexDirection: "row", alignItems: "center", gap: 6, height: 54, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  countryFlag: { fontSize: 20 },
  countryDial: { fontSize: 13, color: "rgba(139,130,177,0.6)", fontFamily: "Inter_500Medium" },
  phoneInput: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", height: 54, paddingHorizontal: 16 },

  strengthWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: -8, marginBottom: 12 },
  strengthTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  strengthFill: { height: "100%", borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600", minWidth: 36 },

  fieldError: { fontSize: 12, color: "#EF4444", fontFamily: "Inter_500Medium", marginTop: 4, marginBottom: 10, marginLeft: 4 },
  mismatch: { fontSize: 12, color: "#EF4444", fontFamily: "Inter_400Regular", marginTop: -10, marginBottom: 12, marginLeft: 4 },

  errorRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(239,68,68,0.15)" },
  errorText: { color: "#EF4444", fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },

  loginBtn: { borderRadius: 14, overflow: "hidden", shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8, marginTop: 4 },
  loginBtnGradient: { height: 56, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  loginBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },

  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: 36, paddingBottom: 20 },
  linkText: { fontSize: 13, color: "rgba(139,130,177,0.3)", fontFamily: "Inter_400Regular" },
  linkAction: { fontSize: 13, color: "#7C3AED", fontWeight: "700", fontFamily: "Inter_700Bold" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  modalSheet: { backgroundColor: "#0A0A12", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, maxHeight: "60%" },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#1A1B28", alignSelf: "center", marginTop: 12, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold", marginBottom: 16 },
  countryRowItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)", gap: 12 },
  countryRowFlag: { fontSize: 24 },
  countryRowName: { flex: 1, fontSize: 15, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_500Medium" },
  countryRowDial: { fontSize: 13, color: "rgba(139,130,177,0.4)", fontFamily: "Inter_400Regular", marginRight: 8 },
});
