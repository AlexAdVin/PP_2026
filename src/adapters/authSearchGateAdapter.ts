import AsyncStorage from "@react-native-async-storage/async-storage";

const SEARCH_GATE_STORAGE_KEY = "pp-2026-auth-search-count";
const FREE_SEARCH_LIMIT = 3;

async function getSearchCount() {
  const rawValue = await AsyncStorage.getItem(SEARCH_GATE_STORAGE_KEY);
  const parsedValue = Number(rawValue ?? "0");

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export async function recordSearchAttempt() {
  const nextCount = (await getSearchCount()) + 1;
  await AsyncStorage.setItem(SEARCH_GATE_STORAGE_KEY, String(nextCount));

  return {
    count: nextCount,
    allowed: nextCount <= FREE_SEARCH_LIMIT,
    remaining: Math.max(FREE_SEARCH_LIMIT - nextCount, 0),
  };
}

export async function resetSearchGate() {
  await AsyncStorage.removeItem(SEARCH_GATE_STORAGE_KEY);
}

export const authSearchGateAdapter = {
  getSearchCount,
  recordSearchAttempt,
  resetSearchGate,
  FREE_SEARCH_LIMIT,
};