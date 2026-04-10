import { useRegister } from "@workspace/api-client-react";
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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);
  const registerMutation = useRegister();

  const handleRegister = async () => {
    if (!name || !phone || !password) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await registerMutation.mutateAsync({ data: { name, phone, password } });
      await signIn(result.token, result.user);
      router.replace("/(tabs)/");
    } catch (err: any) {
      const msg = err?.data?.message ?? err?.message ?? "Erro ao criar conta";
      alert(msg);
    }
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={["#7C3AED", "#6D28D9", "#5B21B6"]} style={[s.headerGradient, { paddingTop: insets.top + 32 }]}>
        <View style={s.logoBox}>
          <Feather name="cpu" size={26} color="#7C3AED" />
        </View>
        <Text style={s.brandName}>BotAluguel<Text style={{ color: "#E9D5FF" }}>.Pro</Text></Text>
        <Text style={s.brandSub}>Crie sua conta grátis</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>
            <Text style={s.cardTitle}>Criar conta</Text>

            <View style={s.field}>
              <Text style={s.label}>NOME</Text>
              <View style={[s.inputRow, nameFocus && s.inputFocus]}>
                <Feather name="user" size={16} color={nameFocus ? "#7C3AED" : "#9CA3AF"} />
                <TextInput
                  style={s.input}
                  placeholder="Seu nome"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  onFocus={() => setNameFocus(true)}
                  onBlur={() => setNameFocus(false)}
                />
              </View>
            </View>

            <View style={s.field}>
              <Text style={s.label}>TELEFONE</Text>
              <View style={[s.inputRow, phoneFocus && s.inputFocus]}>
                <Feather name="phone" size={16} color={phoneFocus ? "#7C3AED" : "#9CA3AF"} />
                <TextInput
                  style={s.input}
                  placeholder="55 11 99999-9999"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => setPhoneFocus(true)}
                  onBlur={() => setPhoneFocus(false)}
                />
              </View>
            </View>

            <View style={s.field}>
              <Text style={s.label}>SENHA</Text>
              <View style={[s.inputRow, pwFocus && s.inputFocus]}>
                <Feather name="lock" size={16} color={pwFocus ? "#7C3AED" : "#9CA3AF"} />
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPwFocus(true)}
                  onBlur={() => setPwFocus(false)}
                />
                <Pressable onPress={() => setShowPassword(v => !v)}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#9CA3AF" />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [s.btn, { opacity: pressed || registerMutation.isPending ? 0.8 : 1 }]}
              onPress={handleRegister}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={s.btnText}>Criar conta</Text>
              )}
            </Pressable>
          </View>

          <Pressable style={s.loginLink} onPress={() => router.push("/(auth)/login")}>
            <Text style={s.loginLinkText}>
              Já tem conta? <Text style={{ color: "#7C3AED", fontWeight: "700" }}>Entrar</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F5F5" },

  headerGradient: {
    alignItems: "center",
    paddingBottom: 32,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  brandName: { fontSize: 24, fontWeight: "800", color: "#FFF", fontFamily: "Inter_700Bold" },
  brandSub: { fontSize: 13, color: "#FFFFFFBB", fontFamily: "Inter_400Regular", marginTop: 4 },

  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937", fontFamily: "Inter_700Bold" },

  field: { gap: 8 },
  label: { fontSize: 11, fontWeight: "600", color: "#9CA3AF", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputFocus: { borderColor: "#7C3AED", backgroundColor: "#FAFAFF" },
  input: { flex: 1, fontSize: 15, color: "#1F2937", fontFamily: "Inter_400Regular" },

  btn: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  btnText: { fontSize: 16, fontWeight: "700", color: "#FFF", fontFamily: "Inter_700Bold" },

  loginLink: { alignItems: "center", marginTop: 24 },
  loginLinkText: { fontSize: 14, color: "#9CA3AF", fontFamily: "Inter_400Regular" },
});
