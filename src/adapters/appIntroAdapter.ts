import AsyncStorage from "@react-native-async-storage/async-storage";

const APP_INTRO_STORAGE_KEY = "pp-2026-app-intro-seen";

export async function hasSeenAppIntro() {
  return (await AsyncStorage.getItem(APP_INTRO_STORAGE_KEY)) === "1";
}

export async function markAppIntroSeen() {
  await AsyncStorage.setItem(APP_INTRO_STORAGE_KEY, "1");
}

export const appIntroAdapter = {
  hasSeenAppIntro,
  markAppIntroSeen,
};