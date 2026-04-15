import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { setBaseUrl } from "@workspace/api-client-react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, ONE_DAY_MS } from "@/lib/queryClient";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { AuthProvider } from "@/context/AuthContext";

if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

SplashScreen.preventAutoHideAsync();

if (typeof global !== "undefined" && (global as any).ErrorUtils) {
  const origHandler = (global as any).ErrorUtils.getGlobalHandler?.();
  (global as any).ErrorUtils.setGlobalHandler?.((err: any, isFatal?: boolean) => {
    if (typeof err?.message === "string" && err.message.includes("keep awake")) return;
    origHandler?.(err, isFatal);
  });
}

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "QUERY_CACHE",
  throttleTime: 1000,
});

const SLIDE_FROM_RIGHT = {
  animation: "slide_from_right" as const,
  gestureEnabled: true,
};

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, ...SLIDE_FROM_RIGHT }}>
      <Stack.Screen name="index" options={{ animation: "none" }} />
      <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
      <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
      <Stack.Screen name="bot/[id]" />
      <Stack.Screen name="bot/settings/[id]" />
      <Stack.Screen name="builder/[id]" options={{ animation: "slide_from_bottom", gestureEnabled: false }} />
      <Stack.Screen name="builder-picker" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="legal" />
      <Stack.Screen name="onboarding" options={{ animation: "fade", gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister, maxAge: ONE_DAY_MS }}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
              <OfflineBanner />
              <RootLayoutNav />
            </AuthProvider>
          </GestureHandlerRootView>
        </PersistQueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
