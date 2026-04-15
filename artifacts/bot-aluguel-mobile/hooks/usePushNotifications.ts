import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function getExpoPushToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;

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

function navigateToBotFromNotification(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data as Record<string, string> | undefined;
  if (data?.botId) {
    router.push({ pathname: "/bot/[id]", params: { id: data.botId } });
  }
}

export function usePushNotifications(
  isAuthenticated: boolean,
  onToken: (token: string) => void
) {
  const responseListenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    getExpoPushToken().then((token) => {
      if (token) onToken(token);
    });

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) navigateToBotFromNotification(response);
    });

    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      navigateToBotFromNotification
    );

    return () => {
      responseListenerRef.current?.remove();
    };
  }, [isAuthenticated, onToken]);
}
