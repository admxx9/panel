import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECTIONS = [
  {
    title: "1. Informações Coletadas",
    body: "Coletamos apenas as informações necessárias para o funcionamento do serviço:\n\n• Nome e número de telefone fornecidos no cadastro\n• Dados de uso do aplicativo (bots criados, fluxos configurados)\n• Informações de pagamento via PIX (valores, datas)\n• Dados de sessão do WhatsApp para conexão dos bots",
  },
  {
    title: "2. Uso das Informações",
    body: "Suas informações são utilizadas para:\n\n• Criar e manter sua conta no BotAluguel Pro\n• Conectar e gerenciar seus bots de WhatsApp\n• Processar pagamentos e gerenciar seu saldo de moedas\n• Enviar notificações importantes sobre o serviço\n• Melhorar a experiência do usuário",
  },
  {
    title: "3. Compartilhamento de Dados",
    body: "Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:\n\n• Quando necessário para processar pagamentos (gateway PIX)\n• Para cumprir obrigações legais\n• Com seu consentimento explícito",
  },
  {
    title: "4. Segurança",
    body: "Adotamos medidas de segurança para proteger seus dados:\n\n• Senhas armazenadas com criptografia bcrypt\n• Comunicação via HTTPS\n• Sessões do WhatsApp criptografadas\n• Acesso restrito aos dados do sistema",
  },
  {
    title: "5. Armazenamento",
    body: "Seus dados são armazenados em servidores seguros enquanto sua conta estiver ativa. Ao excluir sua conta, todos os dados pessoais, bots, fluxos e histórico de pagamentos são removidos permanentemente.",
  },
  {
    title: "6. Seus Direitos",
    body: "Conforme a LGPD (Lei Geral de Proteção de Dados), você tem direito a:\n\n• Acessar seus dados pessoais\n• Corrigir dados incorretos\n• Excluir sua conta e todos os dados\n• Solicitar portabilidade dos dados\n• Revogar consentimento a qualquer momento",
  },
  {
    title: "7. Contato",
    body: "Para dúvidas sobre privacidade, entre em contato:\n\n• E-mail: privacidade@botaluguel.pro\n• WhatsApp: Através do suporte no aplicativo",
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;

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
        <Text style={s.title}>Política de Privacidade</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.updated}>Última atualização: Abril 2026</Text>
        <Text style={s.intro}>
          O BotAluguel Pro respeita sua privacidade e está comprometido com a proteção dos seus dados pessoais. Esta política descreve como coletamos, usamos e protegemos suas informações.
        </Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <Text style={s.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
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
  updated: { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_400Regular", marginBottom: 16, marginTop: 8 },
  intro: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, color: "#EBEBF2", fontFamily: "Inter_700Bold", marginBottom: 8 },
  sectionBody: { fontSize: 14, color: "#A0A0B0", fontFamily: "Inter_400Regular", lineHeight: 22 },
});
