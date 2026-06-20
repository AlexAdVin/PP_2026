import { hostLocationAdapter } from "@/src/adapters/hostLocationAdapter";

export async function fetchHostData() {
  return hostLocationAdapter.fetchCurrentHostLotState();
}

export const hostDatabaseAdapter = {
  fetchHostData,
};