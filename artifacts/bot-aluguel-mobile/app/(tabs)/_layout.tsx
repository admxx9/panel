import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import BottomNav, { type NavTab } from "@/components/BottomNav";

const ALL_TABS: (NavTab & { name: string })[] = [
  { name: "index",    href: "/",        icon: "grid",         label: "Hub" },
  { name: "bots",     href: "/bots",    icon: "cpu",          label: "Bots" },
  { name: "payments", href: "/payments",icon: "credit-card",  label: "Moedas" },
  { name: "settings", href: "/settings",icon: "settings",     label: "Config" },
];

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={() => <BottomNav tabs={ALL_TABS} />}
        screenOptions={{ headerShown: false }}
      >
        {ALL_TABS.map((route) => (
          <Tabs.Screen
            key={route.name}
            name={route.name}
            options={{ title: route.label }}
          />
        ))}
      </Tabs>
    </View>
  );
}
