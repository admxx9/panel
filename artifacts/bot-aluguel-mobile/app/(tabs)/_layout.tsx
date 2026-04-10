import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  { name: "index", title: "Início", icon: "home" },
  { name: "bots", title: "Bots", icon: "cpu" },
  { name: "payments", title: "Moedas", icon: "dollar-sign" },
  { name: "plans", title: "Planos", icon: "star" },
  { name: "settings", title: "Menu", icon: "menu" },
  { name: "admin", title: "Admin", icon: "shield", adminOnly: true },
] as const;

function TabBarIcon({ name, label, focused }: { name: string; label: string; focused: boolean }) {
  return (
    <View style={tb.item}>
      <View style={[tb.iconWrap, focused && tb.iconActive]}>
        <Feather name={name as any} size={20} color={focused ? "#FFFFFF" : "#9CA3AF"} />
      </View>
      <Text style={[tb.label, focused && tb.labelActive]}>{label}</Text>
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
          ...tb.tabBar,
          height: 64 + (Platform.OS === "ios" ? insets.bottom : 8),
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#F0F0F0" }]} />
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

const tb = StyleSheet.create({
  tabBar: {
    position: "absolute",
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 8,
    width: 64,
  },
  iconWrap: {
    width: 44,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  iconActive: {
    backgroundColor: "#7C3AED",
    borderRadius: 20,
    width: 48,
    height: 34,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  labelActive: {
    color: "#7C3AED",
    fontFamily: "Inter_700Bold",
  },
});
