import { hostLocationAdapter } from "@/src/adapters/hostLocationAdapter";
import { hostProfileAdapter } from "@/src/adapters/hostProfileAdapter";

type PersistListingInput = {
  hostProfile: {
    hostSub: string | null;
    hostName: string;
  };
  listingData: Record<string, unknown>;
  lotDraft: unknown[];
};

export async function persistListing(payload: PersistListingInput) {
  const hostProfile = await hostProfileAdapter.upsertCurrent(payload.hostProfile.hostName);
  const persistedLocation = await hostLocationAdapter.createPublishedLocation(
    payload.listingData,
    payload.lotDraft,
  );

  return {
    persistedAt: new Date().toISOString(),
    status: "published",
    locationId: persistedLocation.locationId,
    location: persistedLocation.location,
    hostProfile,
  };
}

export const hostListingPersistenceAdapter = {
  persistListing,
};