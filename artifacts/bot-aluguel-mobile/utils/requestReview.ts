import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REVIEW_KEY = "@botaluguel:review_requested";

export async function maybeRequestReview() {
  try {
    const already = await AsyncStorage.getItem(REVIEW_KEY);
    if (already) return;

    const available = await StoreReview.isAvailableAsync();
    if (!available) return;

    await StoreReview.requestReview();
    await AsyncStorage.setItem(REVIEW_KEY, "1");
  } catch {}
}
