/**
 * BottomNav — barra integrada, item ativo embutido (não flutuante).
 * O ícone ativo fica dentro de um "slot" circular dentro da barra.
 * Animação suave via Reanimated, sem efeito de balão ou FAB solto.
 */
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { usePathname, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface NavTab {
  href: string;
  icon: string;
  label: string;
}

interface Props {
  tabs: NavTab[];
}

const GREEN      = "#2FAE8F";
const GREEN_LIGHT = "rgba(47,174,143,0.12)";
const GRAY       = "#9CA3AF";
const SLOT_SIZE  = 48;
const SPRING_CFG = { damping: 18, stiffness: 260, mass: 0.7 };

function TabItem({
  tab,
  isActive,
  onPress,
}: {
  tab: NavTab;
  isActive: boolean;
  onPress: () => void;
}) {
  const progress = useSharedValue(isActive ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, SPRING_CFG);
  }, [isActive]);

  /* Slot outer ring: light green bg fades in */
  const slotStyle = useAnimatedStyle(() => ({
    opacity: withTiming(progress.value, { duration: 200 }),
    transform: [{ scale: withSpring(0.85 + 0.15 * progress.value, SPRING_CFG) }],
  }));

  /* Inner circle: scales up when active */
  const circleStyle = useAnimatedStyle(() => ({
    opacity: withTiming(progress.value, { duration: 180 }),
    transform: [{ scale: withSpring(0.7 + 0.3 * progress.value, SPRING_CFG) }],
  }));

  /* Inactive icon: fades out when active */
  const inactiveStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1 - progress.value, { duration: 180 }),
    transform: [{ scale: withSpring(1 - 0.1 * progress.value, SPRING_CFG) }],
  }));

  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      accessibilityLabel={tab.label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      {/* Outer slot — light green ring, embutido na barra */}
      <Animated.View style={[styles.slot, slotStyle]}>
        {/* Inner green circle */}
        <Animated.View style={[styles.circle, circleStyle]}>
          <Feather name={tab.icon as any} size={20} color="#fff" />
        </Animated.View>
      </Animated.View>

      {/* Inactive icon — fica por baixo e some quando ativo */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.inactiveWrap, inactiveStyle]}>
        <Feather name={tab.icon as any} size={22} color={GRAY} />
      </Animated.View>
    </Pressable>
  );
}

export default function BottomNav({ tabs }: Props) {
  const pathname  = usePathname();
  const insets    = useSafeAreaInsets();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname === "" : pathname.startsWith(href);

  const safeBottom = Math.max(insets.bottom, Platform.OS === "android" ? 4 : 0);

  return (
    <View style={[styles.wrapper, { paddingBottom: safeBottom }]}>
      <View style={styles.bar}>
        {tabs.map((tab) => (
          <TabItem
            key={tab.href}
            tab={tab}
            isActive={isActive(tab.href)}
            onPress={() => router.push(tab.href as any)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 14,
  },
  bar: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  /* Outer slot: light translucent green ring */
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: SLOT_SIZE / 2,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(47,174,143,0.2)",
  },
  /* Inner solid green circle */
  circle: {
    width: SLOT_SIZE - 14,
    height: SLOT_SIZE - 14,
    borderRadius: (SLOT_SIZE - 14) / 2,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
