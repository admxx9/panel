import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

const INACTIVE_COLOR = "#555568";
const BAR_BG = "#0D0D12";
const BORDER_COLOR = "#1E1E2A";

export default function BottomNav({ tabs }: Props) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const active = (href: string) =>
    href === "/" ? pathname === "/" || pathname === "" : pathname.startsWith(href);

  const midIndex = Math.floor(tabs.length / 2);
  const leftTabs = tabs.slice(0, midIndex);
  const rightTabs = tabs.slice(midIndex);

  const pb = Math.max(insets.bottom, Platform.OS === "android" ? 6 : 0);

  return (
    <View style={[s.wrap, { paddingBottom: pb }]}>
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
              <Feather name={tab.icon as any} size={21} color={on ? "#A78BFA" : INACTIVE_COLOR} />
              <Text style={[s.itemLabel, on && s.itemLabelActive]}>{tab.label}</Text>
              {on && <View style={s.activeDot} />}
            </Pressable>
          );
        })}

        {/* Central FAB */}
        <View style={s.fabSlot}>
          <Pressable
            style={({ pressed }) => [s.fabWrap, pressed && { transform: [{ scale: 0.91 }] }]}
            onPress={() => router.push("/builder-picker" as any)}
            accessibilityLabel="Novo Bot"
          >
            <LinearGradient
              colors={["#7C3AED", "#4F46E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.fab}
            >
              <Feather name="plus" size={28} color="#FFF" />
            </LinearGradient>
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
              <Feather name={tab.icon as any} size={21} color={on ? "#A78BFA" : INACTIVE_COLOR} />
              <Text style={[s.itemLabel, on && s.itemLabelActive]}>{tab.label}</Text>
              {on && <View style={s.activeDot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: BAR_BG,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    overflow: "visible",
  },
  bar: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    overflow: "visible",
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    height: 62,
  },
  itemLabel: {
    fontSize: 10,
    color: INACTIVE_COLOR,
    fontFamily: "Inter_600SemiBold",
  },
  itemLabelActive: {
    color: "#A78BFA",
  },
  activeDot: {
    position: "absolute",
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#7C3AED",
  },
  fabSlot: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  fabWrap: {
    marginTop: -30,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 14,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: BAR_BG,
  },
});
