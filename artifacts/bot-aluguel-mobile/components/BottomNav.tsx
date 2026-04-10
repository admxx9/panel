import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { usePathname, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface NavTab {
  href: string;
  icon: string;
  label: string;
  adminOnly?: boolean;
}

interface Props {
  tabs: NavTab[];
}

const BAR_HEIGHT = 70;
const CIRCLE = 52;
const ACTIVE_COLOR = "#2FAE8F";
const INACTIVE_COLOR = "#6B7280";

function TabItem({ tab, isActive }: { tab: NavTab; isActive: boolean }) {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1 : 0.8,
        useNativeDriver: true,
        friction: 6,
        tension: 80,
      }),
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={() => router.push(tab.href as any)}
      activeOpacity={0.75}
      accessibilityLabel={tab.label}
    >
      {/* Active circle background */}
      <Animated.View
        style={[
          styles.activeCircle,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* Icon — always rendered, color changes */}
      <Animated.View style={styles.iconWrap}>
        <Feather
          name={tab.icon as any}
          size={22}
          color={isActive ? "#FFFFFF" : INACTIVE_COLOR}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function BottomNav({ tabs }: Props) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  function isTabActive(href: string) {
    if (href === "/") return pathname === "/" || pathname === "";
    return pathname.startsWith(href);
  }

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, Platform.OS === "android" ? 8 : 0) },
      ]}
    >
      <View style={styles.bar}>
        {tabs.map((tab) => (
          <TabItem key={tab.href} tab={tab} isActive={isTabActive(tab.href)} />
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
    // Shadow — iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    // Shadow — Android
    elevation: 20,
  },
  bar: {
    height: BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    height: BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircle: {
    position: "absolute",
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: ACTIVE_COLOR,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
