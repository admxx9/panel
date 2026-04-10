import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/AuthContext";

const TABS = [
  { name: "index", title: "Início", icon: "home" },
  { name: "bots", title: "Bots", icon: "cpu" },
  { name: "payments", title: "Moedas", icon: "dollar-sign" },
  { name: "plans", title: "Planos", icon: "star" },
  { name: "settings", title: "Conta", icon: "user" },
  { name: "admin", title: "Admin", icon: "shield", adminOnly: true },
] as const;

export default function TabLayout() {
  const isIOS = Platform.OS === "ios";
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#F97316",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0A0B12" }]} />
          ),
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
            tabBarIcon: ({ color }) => (
              <Feather name={route.icon as any} size={22} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute" as const,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: "#1A1B28",
    elevation: 0,
    height: Platform.OS === "web" ? 70 : undefined,
    paddingBottom: Platform.OS === "android" ? 4 : undefined,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
    marginBottom: Platform.OS === "web" ? 8 : 0,
  },
});
