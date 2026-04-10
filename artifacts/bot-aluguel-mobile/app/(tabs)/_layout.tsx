import { Tabs } from "expo-router";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import BottomNav, { type NavTab } from "@/components/BottomNav";

const ALL_TABS: (NavTab & { name: string; adminOnly?: boolean })[] = [
  { name: "index",    href: "/",        icon: "grid",         label: "Hub" },
  { name: "bots",     href: "/bots",    icon: "cpu",          label: "Bots" },
  { name: "payments", href: "/payments",icon: "credit-card",  label: "Moedas" },
  { name: "plans",    href: "/plans",   icon: "star",         label: "Planos" },
  { name: "settings", href: "/settings",icon: "settings",     label: "Config" },
  { name: "admin",    href: "/admin",   icon: "shield",       label: "Admin", adminOnly: true },
];

export default function TabLayout() {
  const { user } = useAuth();

  const visibleTabs = ALL_TABS.filter(
    (t) => !(t.adminOnly && !user?.isAdmin)
  );

  return (
    <Tabs
      tabBar={() => <BottomNav tabs={visibleTabs} />}
      screenOptions={{ headerShown: false }}
    >
      {ALL_TABS.map((route) => (
        <Tabs.Screen
          key={route.name}
          name={route.name}
          options={{
            title: route.label,
            tabBarItemStyle:
              route.adminOnly && !user?.isAdmin
                ? { display: "none" }
                : undefined,
          }}
        />
      ))}
    </Tabs>
  );
}
