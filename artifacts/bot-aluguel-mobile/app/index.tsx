import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const ONBOARDING_KEY = "ONBOARDING_SEEN";

export default function Index() {
  const { token, isLoading } = useAuth();
  const colors = useColors();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(false);

  useEffect(() => {
    if (!isLoading && token) {
      AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
        setOnboardingSeen(!!val);
        setOnboardingChecked(true);
      });
    } else if (!isLoading && !token) {
      setOnboardingChecked(true);
    }
  }, [isLoading, token]);

  if (isLoading || !onboardingChecked) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!onboardingSeen) {
    return <Redirect href={"/onboarding" as any} />;
  }

  return <Redirect href="/(tabs)/" />;
}
