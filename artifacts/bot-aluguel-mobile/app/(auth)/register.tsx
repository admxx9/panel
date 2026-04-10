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
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.logo}>
          <View style={s.logoIcon}>
            <Feather name="cpu" size={28} color="#FFF" />
          </View>
          <Text style={s.logoText}>BotAluguel<Text style={{ color: "#F97316" }}>.Pro</Text></Text>
          <Text style={s.logoSub}>Crie sua conta grátis</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Criar conta</Text>

          <View style={s.field}>
            <Text style={s.label}>NOME</Text>
            <View style={[s.inputRow, nameFocus && s.inputFocus]}>
              <Feather name="user" size={14} color="#4B4C6B" />
              <TextInput
                style={s.input}
                placeholder="Seu nome"
                placeholderTextColor="#4B4C6B"
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
              <Feather name="phone" size={14} color="#4B4C6B" />
              <TextInput
                style={s.input}
                placeholder="55 11 99999-9999"
                placeholderTextColor="#4B4C6B"
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
              <Feather name="lock" size={14} color="#4B4C6B" />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#4B4C6B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPwFocus(true)}
                onBlur={() => setPwFocus(false)}
              />
              <Pressable onPress={() => setShowPassword(v => !v)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={14} color="#4B4C6B" />
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
            Já tem conta? <Text style={{ color: "#F97316", fontWeight: "700" }}>Entrar</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090A0F" },
  scroll: { flexGrow: 1, paddingHorizontal: 24, justifyContent: "center" },

  logo: { alignItems: "center", marginBottom: 32 },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#F97316",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  logoText: { fontSize: 22, fontWeight: "800" as const, color: "#FFF", fontFamily: "Inter_700Bold" },
  logoSub: { fontSize: 12, color: "#4B4C6B", fontFamily: "Inter_400Regular", marginTop: 4 },

  card: {
    backgroundColor: "#0D0E16",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A1B28",
    padding: 20,
    gap: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: "700" as const, color: "#F1F2F6", fontFamily: "Inter_700Bold", marginBottom: 2 },

  field: { gap: 6 },
  label: { fontSize: 9, fontWeight: "600" as const, color: "#4B4C6B", fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#131420",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1E1F2E",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  inputFocus: { borderColor: "#F97316" },
  input: { flex: 1, fontSize: 14, color: "#FFF", fontFamily: "Inter_400Regular" },

  btn: {
    backgroundColor: "#F97316",
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { fontSize: 14, fontWeight: "700" as const, color: "#FFF", fontFamily: "Inter_700Bold" },

  loginLink: { alignItems: "center", marginTop: 20 },
  loginLinkText: { fontSize: 13, color: "#4B4C6B", fontFamily: "Inter_400Regular" },
});
