import { Tabs, usePathname, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const ALL_TABS = [
  { name: "(tabs)/index", href: "/", title: "Início", icon: "home" },
  { name: "(tabs)/bots", href: "/bots", title: "Bots", icon: "cpu" },
  { name: "(tabs)/payments", href: "/payments", title: "Moedas", icon: "dollar-sign" },
  { name: "(tabs)/plans", href: "/plans", title: "Planos", icon: "shopping-bag" },
  { name: "(tabs)/settings", href: "/settings", title: "Menu", icon: "menu" },
  { name: "(tabs)/admin", href: "/admin", title: "Admin", icon: "shield", adminOnly: true },
] as const;

function CustomTabBar() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const tabs = ALL_TABS.filter(
    (t) => !("adminOnly" in t && t.adminOnly && !user?.isAdmin)
  );

  const BAR_HEIGHT = 64;
  const CIRCLE = 62;
  const OVERFLOW = 18;

  const totalHeight = BAR_HEIGHT + insets.bottom + OVERFLOW;

  return (
    <View
      style={[
        styles.container,
        {
          height: totalHeight,
          paddingBottom: insets.bottom,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/" || pathname === ""
              : pathname.startsWith(tab.href);

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => router.push(tab.href as any)}
              activeOpacity={0.8}
            >
              {isActive ? (
                <View
                  style={[
                    styles.activeCircle,
                    {
                      width: CIRCLE,
                      height: CIRCLE,
                      borderRadius: CIRCLE / 2,
                      marginTop: -(OVERFLOW + 10),
                    },
                  ]}
                >
                  <Feather name={tab.icon as any} size={26} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.inactiveWrap}>
                  <Feather name={tab.icon as any} size={22} color="#9CA3AF" />
                </View>
              )}
              <Text
                style={[styles.label, isActive && styles.labelActive]}
                numberOfLines={1}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {ALL_TABS.map((route) => (
        <Tabs.Screen
          key={route.name}
          name={route.name.replace("(tabs)/", "")}
          options={{
            title: route.title,
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
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    pointerEvents: "box-none" as any,
  },
  bar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 4,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 12,
    overflow: "visible",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 6,
    overflow: "visible",
  },
  activeCircle: {
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  inactiveWrap: {
    width: 44,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  labelActive: {
    color: "#7C3AED",
    fontFamily: "Inter_700Bold",
  },
});
