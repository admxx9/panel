import { Tabs, usePathname, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const ALL_TABS = [
  { name: "index", href: "/", icon: "home" },
  { name: "bots", href: "/bots", icon: "cpu" },
  { name: "payments", href: "/payments", icon: "dollar-sign" },
  { name: "plans", href: "/plans", icon: "shopping-bag" },
  { name: "settings", href: "/settings", icon: "menu" },
  { name: "admin", href: "/admin", icon: "shield", adminOnly: true },
] as const;

// Dimensions — tweak here only
const BAR_H = 88;        // height of the white bar
const CIRCLE_D = 68;     // diameter of the active circle
const RADIUS = 30;       // top corner radius of the bar
const PROTRUDE = 20;     // how many px the circle center rises ABOVE bar top

function CustomTabBar() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const tabs = ALL_TABS.filter(
    (t) => !("adminOnly" in t && t.adminOnly && !user?.isAdmin)
  );

  const safeBottom = Math.max(insets.bottom, 0);

  return (
    <View style={[styles.wrapper, { bottom: safeBottom }]}>
      <View style={[styles.bar, { borderTopLeftRadius: RADIUS, borderTopRightRadius: RADIUS }]}>
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/" || pathname === ""
              : pathname.startsWith(tab.href);

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.item}
              onPress={() => router.push(tab.href as any)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <View style={[styles.circle, { top: -(CIRCLE_D / 2 + PROTRUDE) }]}>
                  <Feather name={tab.icon as any} size={26} color="#fff" />
                </View>
              ) : (
                <Feather name={tab.icon as any} size={22} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{ headerShown: false }}
    >
      {ALL_TABS.map((route) => (
        <Tabs.Screen
          key={route.name}
          name={route.name}
          options={{
            tabBarItemStyle:
              "adminOnly" in route && route.adminOnly && !user?.isAdmin
                ? { display: "none" }
                : undefined,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    height: BAR_H + CIRCLE_D / 2 + PROTRUDE,
    justifyContent: "flex-end",
  },
  bar: {
    height: BAR_H,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 16,
    overflow: "visible",
  },
  item: {
    flex: 1,
    height: BAR_H,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  circle: {
    position: "absolute",
    width: CIRCLE_D,
    height: CIRCLE_D,
    borderRadius: CIRCLE_D / 2,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#F5F5F5",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
});
