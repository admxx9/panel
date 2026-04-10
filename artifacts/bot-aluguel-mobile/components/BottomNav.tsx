/**
 * BottomNav — barra de navegação inferior com efeito de botão elevado (notch).
 *
 * Design:
 *  - Barra branca com cantos superiores arredondados e sombra
 *  - Item ativo sobe da barra (translateY) com círculo verde
 *  - "Notch" visual: arco de fundo (#F5F5F5) mascara a barra ao redor do botão ativo
 *  - Animações spring suaves via Reanimated
 */
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
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

const BAR_H = 72;
const CIRCLE = 58;
const LIFT = 24;
const NOTCH_R = CIRCLE / 2 + 6;

const GREEN = "#2FAE8F";
const GRAY = "#9CA3AF";
const BG = "#F5F5F5";

const SPRING = { damping: 14, stiffness: 200, mass: 0.8 };

function TabItem({
  tab,
  isActive,
  onPress,
}: {
  tab: NavTab;
  isActive: boolean;
  onPress: () => void;
}) {
  const active = useSharedValue(isActive ? 1 : 0);

  React.useEffect(() => {
    active.value = withSpring(isActive ? 1 : 0, SPRING);
  }, [isActive]);

  /* Circle: rises up and scales in when active */
  const circleStyle = useAnimatedStyle(() => ({
    opacity: withTiming(active.value, { duration: 160 }),
    transform: [
      { translateY: withSpring(active.value === 1 ? -LIFT : 0, SPRING) },
      { scale: withSpring(active.value === 1 ? 1 : 0.6, SPRING) },
    ],
  }));

  /* Notch mask: matches circle rise, hides the bar behind the button */
  const notchStyle = useAnimatedStyle(() => ({
    opacity: withTiming(active.value, { duration: 160 }),
    transform: [
      { translateY: withSpring(active.value === 1 ? -LIFT + CIRCLE / 2 : 0, SPRING) },
    ],
  }));

  /* Icon inside circle (white when active) */
  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(active.value === 1 ? -LIFT : 0, SPRING) },
    ],
  }));

  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      accessibilityLabel={tab.label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      {/* Notch background — same color as app bg, masks bar behind the circle */}
      <Animated.View
        style={[
          styles.notchMask,
          { width: NOTCH_R * 2, height: NOTCH_R * 2, borderRadius: NOTCH_R },
          notchStyle,
        ]}
        pointerEvents="none"
      />

      {/* Green elevated circle */}
      <Animated.View style={[styles.circle, circleStyle]}>
        <Animated.View style={iconContainerStyle}>
          <Feather name={tab.icon as any} size={22} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>

      {/* Inactive icon (hidden when active via opacity) */}
      <Animated.View
        style={[
          styles.inactiveIcon,
          useAnimatedStyle(() => ({
            opacity: withTiming(1 - active.value, { duration: 160 }),
          })),
        ]}
      >
        <Feather name={tab.icon as any} size={22} color={GRAY} />
      </Animated.View>
    </Pressable>
  );
}

export default function BottomNav({ tabs }: Props) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  function isActive(href: string) {
    return href === "/"
      ? pathname === "/" || pathname === ""
      : pathname.startsWith(href);
  }

  const safeBottom = Math.max(insets.bottom, Platform.OS === "android" ? 6 : 0);

  return (
    <View style={[styles.wrapper, { paddingBottom: safeBottom }]}>
      {/* Bar */}
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 24,
    overflow: "visible",
  },
  bar: {
    height: BAR_H + LIFT, // extra top space for the elevated circle to live in
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 10,
    paddingHorizontal: 4,
    overflow: "visible",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: BAR_H,
    overflow: "visible",
  },
  /* The green elevated circle */
  circle: {
    position: "absolute",
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    // Inner shadow / depth
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
    // Card-like border for the "encaixe" feel
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
  },
  /* Notch mask: #F5F5F5 circle that sits at bar top, "cutting" through bar bg */
  notchMask: {
    position: "absolute",
    backgroundColor: BG,
  },
  /* Inactive icon sits at center of item */
  inactiveIcon: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
