import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";

const isExpoGo = Constants.appOwnership === "expo";

let Notifications: typeof import("expo-notifications") | null = null;

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
    Notifications!.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
  }
}

async function getExpoPushToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    console.log("[Push] Skipped: platform is web");
    return null;
  }
  if (!Notifications) {
    console.warn("[Push] Skipped: expo-notifications not loaded (isExpoGo or module missing)");
    return null;
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    console.log("[Push] Permission status:", existing);
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("[Push] Requested permission, result:", status);
    }

    if (finalStatus !== "granted") {
      console.warn("[Push] Permission not granted, status:", finalStatus);
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    console.log("[Push] Using projectId:", projectId);

    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    console.log("[Push] Token obtained:", tokenData.data);
    return tokenData.data;
  } catch (err: any) {
    console.error("[Push] Failed to get push token:", err?.message ?? err);
    return null;
  }
}

function navigateToBotFromNotification(response: any) {
  const data = response?.notification?.request?.content?.data as Record<string, string> | undefined;
  if (data?.botId) {
    router.push({ pathname: "/bot/[id]", params: { id: data.botId } });
  }
}

export function usePushNotifications(
  isAuthenticated: boolean,
  onToken: (token: string) => void
) {
  const responseListenerRef = useRef<any>(null);

  useEffect(() => {
    if (!isAuthenticated || !Notifications) return;

    getExpoPushToken().then((token) => {
      if (token) onToken(token);
    });

    if (Platform.OS !== "web") {
      Notifications.getLastNotificationResponseAsync().then((response) => {
        if (response) navigateToBotFromNotification(response);
      });

      responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
        navigateToBotFromNotification
      );
    }

    return () => {
      responseListenerRef.current?.remove();
    };
  }, [isAuthenticated, onToken]);
}
