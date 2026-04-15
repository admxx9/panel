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
  if (Platform.OS === "web" || !Notifications) return null;

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    return tokenData.data;
  } catch {
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
