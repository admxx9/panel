import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { parseApiError } from "@/utils/parseApiError";
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
import { useRequestResetCode, useResetPassword } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";

type Step = "phone" | "code" | "password";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const requestCodeMutation = useRequestResetCode();
  const resetMutation = useResetPassword();

  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;

  async function handleRequestCode() {
    if (!phone.trim()) {
      setError("Digite seu telefone");
      return;
    }
    setError("");
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await requestCodeMutation.mutateAsync({ data: { phone: phone.trim() } });
      setStep("code");
    } catch (err) {
      setError(parseApiError(err, "Erro ao enviar código. Verifique o número e tente novamente."));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function handleVerifyCode() {
    if (!code.trim() || code.trim().length !== 6) {
      setError("Digite o código de 6 dígitos");
      return;
    }
    setError("");
    setStep("password");
  }

  async function handleReset() {
    if (!newPassword.trim()) {
      setError("Digite a nova senha");
      return;
    }
    if (newPassword.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    setError("");
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const data = await resetMutation.mutateAsync({
        data: { phone: phone.trim(), code: code.trim(), newPassword },
      });
      await signIn(data.token, data.user);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)" as any);
    } catch (err) {
      setError(parseApiError(err, "Erro ao redefinir senha. Tente novamente."));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function handleBack() {
    if (step === "password") setStep("code");
    else if (step === "code") setStep("phone");
    else router.back();
  }

  const stepIcon = step === "phone" ? "phone" : step === "code" ? "hash" : "lock";

  return (
    <View style={s.root}>
      <View style={[s.topBar, { paddingTop }]}>
        <Pressable
          style={s.backBtn}
          onPress={handleBack}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={20} color="#EBEBF2" />
        </Pressable>
        <Text style={s.title}>Recuperar Senha</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.iconWrap}>
            <View style={s.iconCircle}>
              <Feather name={stepIcon as any} size={32} color="#A78BFA" />
            </View>
          </View>

          <View style={s.stepRow}>
            {(["phone", "code", "password"] as Step[]).map((s2, i) => (
              <View
                key={s2}
                style={[
                  s.stepDot,
                  { backgroundColor: step === s2 ? "#6D28D9" : i < ["phone", "code", "password"].indexOf(step) ? "#A78BFA" : "#20202B" },
                ]}
              />
            ))}
          </View>

          {step === "phone" && (
            <>
              <Text style={s.heading}>Qual seu telefone?</Text>
              <Text style={s.desc}>
                Digite o número de telefone cadastrado na sua conta. Enviaremos um código de verificação.
              </Text>

              <Text style={s.label}>TELEFONE</Text>
              <View style={s.inputWrap}>
                <Feather name="phone" size={16} color="#8E8E9E" />
                <TextInput
                  style={s.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="55 11 99999-9999"
                  placeholderTextColor="#555568"
                  keyboardType="phone-pad"
                  autoFocus
                  accessibilityLabel="Telefone"
                />
              </View>

              {error ? (
                <View style={s.errorBox}>
                  <Feather name="alert-circle" size={14} color="#EF4444" />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                style={({ pressed }) => [s.btn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={handleRequestCode}
                disabled={requestCodeMutation.isPending}
                accessibilityLabel="Enviar código"
                accessibilityRole="button"
              >
                {requestCodeMutation.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Text style={s.btnText}>Enviar Código</Text>
                    <Feather name="arrow-right" size={18} color="#FFF" />
                  </>
                )}
              </Pressable>
            </>
          )}

          {step === "code" && (
            <>
              <Text style={s.heading}>Código de verificação</Text>
              <Text style={s.desc}>
                Digite o código de 6 dígitos enviado para seu telefone.
              </Text>

              <Text style={s.label}>CÓDIGO</Text>
              <View style={s.inputWrap}>
                <Feather name="hash" size={16} color="#8E8E9E" />
                <TextInput
                  style={[s.input, { letterSpacing: 8, fontSize: 20, textAlign: "center" }]}
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  placeholderTextColor="#555568"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  accessibilityLabel="Código de verificação"
                />
              </View>

              {error ? (
                <View style={s.errorBox}>
                  <Feather name="alert-circle" size={14} color="#EF4444" />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                style={({ pressed }) => [s.btn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={handleVerifyCode}
                accessibilityLabel="Verificar código"
                accessibilityRole="button"
              >
                <Text style={s.btnText}>Verificar</Text>
                <Feather name="arrow-right" size={18} color="#FFF" />
              </Pressable>

              <Pressable
                style={s.resendBtn}
                onPress={handleRequestCode}
                disabled={requestCodeMutation.isPending}
                accessibilityLabel="Reenviar código"
              >
                <Text style={s.resendText}>
                  {requestCodeMutation.isPending ? "Enviando..." : "Reenviar código"}
                </Text>
              </Pressable>
            </>
          )}

          {step === "password" && (
            <>
              <Text style={s.heading}>Nova senha</Text>
              <Text style={s.desc}>
                Crie uma nova senha para sua conta. Mínimo de 6 caracteres.
              </Text>

              <Text style={s.label}>NOVA SENHA</Text>
              <View style={s.inputWrap}>
                <Feather name="lock" size={16} color="#8E8E9E" />
                <TextInput
                  style={s.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#555568"
                  secureTextEntry={!showPassword}
                  autoFocus
                  accessibilityLabel="Nova senha"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} accessibilityLabel="Mostrar senha">
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#555568" />
                </Pressable>
              </View>

              <Text style={[s.label, { marginTop: 16 }]}>CONFIRMAR SENHA</Text>
              <View style={s.inputWrap}>
                <Feather name="lock" size={16} color="#8E8E9E" />
                <TextInput
                  style={s.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repita a senha"
                  placeholderTextColor="#555568"
                  secureTextEntry={!showPassword}
                  accessibilityLabel="Confirmar senha"
                />
              </View>

              {error ? (
                <View style={s.errorBox}>
                  <Feather name="alert-circle" size={14} color="#EF4444" />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                style={({ pressed }) => [s.btn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={handleReset}
                disabled={resetMutation.isPending}
                accessibilityLabel="Redefinir senha"
                accessibilityRole="button"
              >
                {resetMutation.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Feather name="check" size={18} color="#FFF" />
                    <Text style={s.btnText}>Redefinir Senha</Text>
                  </>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0C0C11" },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, gap: 12 },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 20, color: "#EBEBF2", fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  iconWrap: { alignItems: "center", marginTop: 24, marginBottom: 16 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#6D28D915", borderWidth: 2, borderColor: "#6D28D930",
    alignItems: "center", justifyContent: "center",
  },
  stepRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  heading: { fontSize: 24, color: "#EBEBF2", fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 8 },
  desc: { fontSize: 14, color: "#8E8E9E", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  label: {
    fontSize: 11, color: "#8E8E9E", fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5, marginBottom: 8, paddingLeft: 2,
  },
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#13131D", borderRadius: 14, borderWidth: 1, borderColor: "#20202B",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 15, color: "#EBEBF2", fontFamily: "Inter_500Medium" },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#EF444410", borderRadius: 10, padding: 12, marginTop: 16,
  },
  errorText: { fontSize: 13, color: "#EF4444", fontFamily: "Inter_500Medium", flex: 1 },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#6D28D9", borderRadius: 14, paddingVertical: 16, marginTop: 32,
  },
  btnText: { fontSize: 16, color: "#FFF", fontFamily: "Inter_700Bold" },
  resendBtn: { alignItems: "center", marginTop: 20 },
  resendText: { fontSize: 14, color: "#A78BFA", fontFamily: "Inter_500Medium" },
});
