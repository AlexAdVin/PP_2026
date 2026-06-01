const mockHostData = require("@/model/mockLocations.json");

const clonePayload = <T,>(payload: T): T => JSON.parse(JSON.stringify(payload));

export async function fetchMockHostData() {
  return clonePayload(mockHostData);
}

export const hostDatabaseAdapter = {
  fetchHostData: fetchMockHostData,
};