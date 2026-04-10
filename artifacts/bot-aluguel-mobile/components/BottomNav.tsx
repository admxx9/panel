import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
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

const BAR_H = 64;
const DOT = 56;
const GREEN = "#2FAE8F";
const DARK = "#374151";

export default function BottomNav({ tabs }: Props) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const active = (href: string) =>
    href === "/" ? pathname === "/" || pathname === "" : pathname.startsWith(href);

  return (
    <View style={[s.wrap, { paddingBottom: Math.max(insets.bottom, Platform.OS === "android" ? 6 : 0) }]}>
      <View style={s.bar}>
        {tabs.map((tab) => {
          const on = active(tab.href);
          return (
            <Pressable
              key={tab.href}
              style={s.item}
              onPress={() => router.push(tab.href as any)}
              accessibilityLabel={tab.label}
            >
              {on ? (
                <View style={s.dot}>
                  <Feather name={tab.icon as any} size={24} color="#fff" />
                </View>
              ) : (
                <Feather name={tab.icon as any} size={22} color={DARK} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
    overflow: "visible",
  },
  bar: {
    height: BAR_H,
    flexDirection: "row",
    alignItems: "center",
    overflow: "visible",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: BAR_H,
    overflow: "visible",
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
});
