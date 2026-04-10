import { Tabs, usePathname } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";

const TABS = [
  { name: "index", title: "Painel", icon: "grid" },
  { name: "bots", title: "Bots", icon: "cpu" },
  { name: "payments", title: "Moedas", icon: "dollar-sign" },
  { name: "plans", title: "Planos", icon: "star" },
  { name: "settings", title: "Conta", icon: "user" },
  { name: "admin", title: "Admin", icon: "shield", adminOnly: true },
] as const;

function TabBarIcon({ name, label, focused }: { name: string; label: string; focused: boolean }) {
  return (
    <View style={tbStyles.item}>
      {focused && <View style={tbStyles.indicator} />}
      <View style={[tbStyles.iconWrap, focused && tbStyles.iconActive]}>
        <Feather name={name as any} size={18} color={focused ? "#F97316" : "#4B4C6B"} />
      </View>
      <Text style={[tbStyles.label, focused && tbStyles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...tbStyles.tabBar,
          height: 54 + (Platform.OS === "ios" ? insets.bottom : 6),
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 6,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0A0B12", borderTopWidth: 1, borderTopColor: "#1A1B26" }]} />
        ),
        tabBarShowLabel: false,
      }}
    >
      {TABS.map((route) => (
        <Tabs.Screen
          key={route.name}
          name={route.name}
          options={{
            title: route.title,
            tabBarItemStyle:
              "adminOnly" in route && route.adminOnly && !user?.isAdmin
                ? { display: "none" }
                : undefined,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name={route.icon} label={route.title} focused={focused} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const tbStyles = StyleSheet.create({
  tabBar: {
    position: "absolute" as const,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 6,
    width: 60,
  },
  indicator: {
    position: "absolute",
    top: 0,
    width: 24,
    height: 2,
    backgroundColor: "#F97316",
    borderRadius: 2,
  },
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  iconActive: {
    backgroundColor: "#F9731618",
  },
  label: {
    fontSize: 9,
    color: "#4B4C6B",
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  labelActive: {
    color: "#F97316",
  },
});
