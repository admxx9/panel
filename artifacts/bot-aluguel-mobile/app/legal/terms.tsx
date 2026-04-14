import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECTIONS = [
  {
    title: "1. Aceitação dos Termos",
    body: "Ao criar uma conta e utilizar o BotAluguel Pro, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize o serviço.",
  },
  {
    title: "2. Descrição do Serviço",
    body: "O BotAluguel Pro é uma plataforma SaaS que permite a criação e gerenciamento de bots para WhatsApp através de um editor visual. O serviço inclui:\n\n• Criação e configuração de bots automatizados\n• Editor visual de fluxos (drag-and-drop)\n• Conexão com WhatsApp via QR Code ou código de pareamento\n• Sistema de moedas e planos de assinatura",
  },
  {
    title: "3. Conta do Usuário",
    body: "• Você é responsável por manter a segurança da sua conta e senha\n• Cada conta é pessoal e intransferível\n• Você deve fornecer informações verdadeiras no cadastro\n• Menores de 18 anos devem ter autorização dos responsáveis",
  },
  {
    title: "4. Uso Aceitável",
    body: "Ao usar o BotAluguel Pro, você concorda em NÃO utilizar o serviço para:\n\n• Enviar spam ou mensagens em massa não solicitadas\n• Práticas de phishing ou fraude\n• Assédio, ameaças ou discurso de ódio\n• Violar leis ou regulamentos aplicáveis\n• Distribuir malware ou conteúdo malicioso\n• Violar os Termos de Serviço do WhatsApp",
  },
  {
    title: "5. Pagamentos e Moedas",
    body: "• Moedas são adquiridas via PIX na taxa de R$ 1,00 = 100 moedas\n• Moedas são utilizadas para ativar planos de assinatura\n• Planos têm duração de 30 dias a partir da ativação\n• Moedas não utilizadas permanecem na conta sem expiração\n• Reembolsos podem ser solicitados em até 7 dias após a compra, desde que as moedas não tenham sido utilizadas",
  },
  {
    title: "6. Limitações do Serviço",
    body: "• O BotAluguel Pro utiliza bibliotecas não-oficiais para conexão com WhatsApp\n• Não garantimos disponibilidade 100% do tempo\n• O WhatsApp pode restringir ou bloquear números que utilizam automação\n• O usuário é responsável pelo conteúdo enviado através dos bots",
  },
  {
    title: "7. Propriedade Intelectual",
    body: "Todo o conteúdo, design e código do BotAluguel Pro são de propriedade exclusiva da plataforma. Os fluxos e configurações criados pelo usuário pertencem ao usuário.",
  },
  {
    title: "8. Exclusão de Conta",
    body: "Você pode excluir sua conta a qualquer momento nas Configurações do aplicativo. Ao excluir:\n\n• Todos os bots serão desconectados e removidos\n• Fluxos e configurações serão permanentemente apagados\n• Moedas não utilizadas serão perdidas\n• Histórico de pagamentos será removido",
  },
  {
    title: "9. Modificações nos Termos",
    body: "Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre mudanças significativas através do aplicativo.",
  },
  {
    title: "10. Contato",
    body: "Para dúvidas sobre estes termos:\n\n• E-mail: suporte@botaluguel.pro\n• WhatsApp: Através do suporte no aplicativo",
  },
];

export default function TermsScreen() {
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
        <Text style={s.title}>Termos de Uso</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.updated}>Última atualização: Abril 2026</Text>
        <Text style={s.intro}>
          Bem-vindo ao BotAluguel Pro. Leia atentamente estes Termos de Uso antes de utilizar nossa plataforma.
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
