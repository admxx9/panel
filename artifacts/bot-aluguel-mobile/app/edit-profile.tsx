import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useUpdateProfile } from "@workspace/api-client-react";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useUpdateProfile();

  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;

  async function handleSave() {
    if (!name.trim()) {
      setError("O nome não pode ficar vazio");
      return;
    }
    setError("");
    setSuccess(false);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const updated = await mutation.mutateAsync({
        data: { name: name.trim(), phone: phone.trim() },
      });
      if (updateUser) updateUser(updated as any);
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => router.back(), 800);
    } catch (err: any) {
      const msg = err?.data?.message ?? err?.message ?? "Erro ao atualizar perfil";
      setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  const initial = (name || "U").charAt(0).toUpperCase();

  return (
    <View style={s.root}>
      <View style={[s.topBar, { paddingTop }]}>
        <Pressable
          style={s.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={20} color="#EBEBF2" />
        </Pressable>
        <Text style={s.title}>Editar Perfil</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initial}</Text>
            </View>
          </View>

          <Text style={s.label}>NOME</Text>
          <View style={s.inputWrap}>
            <Feather name="user" size={16} color="#8E8E9E" />
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              placeholderTextColor="#555568"
              accessibilityLabel="Nome"
            />
          </View>

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
              accessibilityLabel="Telefone"
            />
          </View>

          {error ? (
            <View style={s.errorBox}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={s.successBox}>
              <Feather name="check-circle" size={14} color="#22C55E" />
              <Text style={s.successText}>Perfil atualizado com sucesso!</Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [s.saveBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={handleSave}
            disabled={mutation.isPending}
            accessibilityLabel="Salvar alterações"
            accessibilityRole="button"
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Feather name="check" size={18} color="#FFF" />
                <Text style={s.saveBtnText}>Salvar Alterações</Text>
              </>
            )}
          </Pressable>
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
  avatarWrap: { alignItems: "center", marginVertical: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#6D28D915", borderWidth: 2, borderColor: "#6D28D930",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 32, color: "#A78BFA", fontFamily: "Inter_700Bold" },
  label: {
    fontSize: 11, color: "#8E8E9E", fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5, marginBottom: 8, marginTop: 16, paddingLeft: 2,
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
  successBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#22C55E10", borderRadius: 10, padding: 12, marginTop: 16,
  },
  successText: { fontSize: 13, color: "#22C55E", fontFamily: "Inter_500Medium", flex: 1 },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#6D28D9", borderRadius: 14, paddingVertical: 16, marginTop: 32,
  },
  saveBtnText: { fontSize: 16, color: "#FFF", fontFamily: "Inter_700Bold" },
});
