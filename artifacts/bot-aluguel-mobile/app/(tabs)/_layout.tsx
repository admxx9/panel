import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  { name: "index", title: "Início", icon: "home" },
  { name: "bots", title: "Bots", icon: "cpu" },
  { name: "payments", title: "Moedas", icon: "dollar-sign" },
  { name: "plans", title: "Planos", icon: "shopping-bag" },
  { name: "settings", title: "Menu", icon: "menu" },
  { name: "admin", title: "Admin", icon: "shield", adminOnly: true },
] as const;

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F0F0F0",
        },
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
            tabBarIcon: ({ color, size }) => (
              <Feather name={route.icon as any} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
