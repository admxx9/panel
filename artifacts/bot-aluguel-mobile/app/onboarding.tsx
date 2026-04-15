import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export const ONBOARDING_KEY = "ONBOARDING_SEEN";

const { width: SW } = Dimensions.get("window");

type Slide = {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  tag: string;
  title: string;
  subtitle: string;
};

const SLIDES: Slide[] = [
  {
    id: "welcome",
    icon: "zap",
    iconColor: "#A78BFA",
    iconBg: "#6D28D920",
    tag: "BEM-VINDO",
    title: "BotAluguel Pro",
    subtitle: "Crie bots para WhatsApp sem nenhuma linha de código. Automatize grupos e atendimentos em minutos.",
  },
  {
    id: "builder",
    icon: "grid",
    iconColor: "#34D399",
    iconBg: "#22C55E20",
    tag: "BUILDER VISUAL",
    title: "Crie seu Bot",
    subtitle: "Monte fluxos completos de comandos, respostas e condições arrastando blocos no nosso editor visual.",
  },
  {
    id: "connect",
    icon: "smartphone",
    iconColor: "#60A5FA",
    iconBg: "#3B82F620",
    tag: "CONEXÃO",
    title: "Conecte ao WhatsApp",
    subtitle: "Escaneie o QR Code ou insira o código de 8 dígitos para ativar seu bot instantaneamente.",
  },
  {
    id: "start",
    icon: "rocket" as any,
    iconColor: "#FB923C",
    iconBg: "#F9731620",
    tag: "PRONTO",
    title: "Vamos Começar!",
    subtitle: "Tudo pronto. Crie seu primeiro bot e comece a automatizar seu WhatsApp agora mesmo.",
  },
];

async function markSeen() {
  await AsyncStorage.setItem(ONBOARDING_KEY, "1");
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  async function handleSkip() {
    await markSeen();
    router.replace("/(tabs)/");
  }

  async function handleNext() {
    if (activeIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      await markSeen();
      router.replace("/(tabs)/bots");
    }
  }

  const isLast = activeIndex === SLIDES.length - 1;

  const paddingTop = Platform.OS === "web" ? insets.top + 20 : insets.top + 16;

  return (
    <View style={s.root}>
      <View style={s.blob1} />
      <View style={s.blob2} />

      <View style={[s.topBar, { paddingTop }]}>
        <View style={s.dotRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[s.dot, i === activeIndex && s.dotActive]}
            />
          ))}
        </View>
        <Pressable
          style={({ pressed }) => [s.skipBtn, pressed && { opacity: 0.6 }]}
          onPress={handleSkip}
          accessibilityLabel="Pular onboarding"
          accessibilityRole="button"
        >
          <Text style={s.skipText}>Pular</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[s.slide, { width: SW }]}>
            <View style={[s.iconCircle, { backgroundColor: item.iconBg }]}>
              <Feather name={item.icon as any} size={48} color={item.iconColor} />
            </View>
            <View style={s.tagRow}>
              <View style={[s.tagBadge, { backgroundColor: item.iconBg }]}>
                <Text style={[s.tagText, { color: item.iconColor }]}>{item.tag}</Text>
              </View>
            </View>
            <Text style={s.slideTitle}>{item.title}</Text>
            <Text style={s.slideSubtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={[s.bottom, { paddingBottom: insets.bottom + 32 }]}>
        {isLast ? (
          <Pressable
            style={({ pressed }) => [s.ctaBtn, pressed && { opacity: 0.85 }]}
            onPress={handleNext}
            accessibilityLabel="Criar primeiro bot"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={["#7C3AED", "#6D28D9", "#5B21B6"]}
              style={s.ctaBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="plus-circle" size={18} color="#FFF" />
              <Text style={s.ctaBtnText}>Criar Primeiro Bot</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [s.nextBtn, pressed && { opacity: 0.85 }]}
            onPress={handleNext}
            accessibilityLabel="Próximo"
            accessibilityRole="button"
          >
            <Text style={s.nextText}>Próximo</Text>
            <Feather name="arrow-right" size={18} color="#A78BFA" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#09090F" },
  blob1: {
    position: "absolute",
    top: -60,
    left: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(109,40,217,0.10)",
    ...(Platform.OS === "web" ? { filter: "blur(80px)" } as any : {}),
  },
  blob2: {
    position: "absolute",
    bottom: 100,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(139,92,246,0.06)",
    ...(Platform.OS === "web" ? { filter: "blur(70px)" } as any : {}),
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  dotRow: { flexDirection: "row", gap: 6 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(167,139,250,0.2)",
  },
  dotActive: {
    width: 20,
    backgroundColor: "#7C3AED",
  },
  skipBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  skipText: {
    fontSize: 14,
    color: "rgba(167,139,250,0.5)",
    fontFamily: "Inter_500Medium",
  },

  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.1)",
  },
  tagRow: { marginBottom: 16 },
  tagBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  slideTitle: {
    fontSize: 32,
    color: "#EBEBF2",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 15,
    color: "#8E8E9E",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },

  bottom: {
    paddingHorizontal: 28,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(109,40,217,0.12)",
    borderWidth: 1,
    borderColor: "rgba(109,40,217,0.25)",
  },
  nextText: {
    fontSize: 16,
    color: "#A78BFA",
    fontFamily: "Inter_600SemiBold",
  },
  ctaBtn: { borderRadius: 16, overflow: "hidden" },
  ctaBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
  },
  ctaBtnText: {
    fontSize: 16,
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
});
