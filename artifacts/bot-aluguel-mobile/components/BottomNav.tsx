import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
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

const ACTIVE_COLOR = "#F0F0F5";
const INACTIVE_COLOR = "#6B7280";
const ACCENT = "#6D28D9";

export default function BottomNav({ tabs }: Props) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const active = (href: string) =>
    href === "/" ? pathname === "/" || pathname === "" : pathname.startsWith(href);

  const midIndex = Math.floor(tabs.length / 2);
  const leftTabs = tabs.slice(0, midIndex);
  const rightTabs = tabs.slice(midIndex);

  return (
    <View style={[s.wrap, { paddingBottom: Math.max(insets.bottom, Platform.OS === "android" ? 6 : 0) }]}>
      <View style={s.bar}>
        {leftTabs.map((tab) => {
          const on = active(tab.href);
          return (
            <Pressable
              key={tab.href}
              style={s.item}
              onPress={() => router.push(tab.href as any)}
              accessibilityLabel={tab.label}
            >
              <Feather name={tab.icon as any} size={20} color={on ? ACTIVE_COLOR : INACTIVE_COLOR} />
              <Text style={[s.itemLabel, on && s.itemLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}

        <View style={s.fabSlot}>
          <Pressable
            style={({ pressed }) => [s.fab, pressed && { transform: [{ scale: 0.95 }] }]}
            onPress={() => router.push("/(tabs)/bots")}
            accessibilityLabel="Criar Bot"
          >
            <Feather name="plus" size={24} color="#FFF" />
          </Pressable>
        </View>

        {rightTabs.map((tab) => {
          const on = active(tab.href);
          return (
            <Pressable
              key={tab.href}
              style={s.item}
              onPress={() => router.push(tab.href as any)}
              accessibilityLabel={tab.label}
            >
              <Feather name={tab.icon as any} size={20} color={on ? ACTIVE_COLOR : INACTIVE_COLOR} />
              <Text style={[s.itemLabel, on && s.itemLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: "#1A1A2490",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2A2A35",
    overflow: "visible",
  },
  bar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    overflow: "visible",
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    height: 64,
  },
  itemLabel: {
    fontSize: 10,
    color: INACTIVE_COLOR,
    fontFamily: "Inter_600SemiBold",
  },
  itemLabelActive: {
    color: ACTIVE_COLOR,
  },
  fabSlot: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    borderWidth: 4,
    borderColor: "#0F0F14",
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
});
