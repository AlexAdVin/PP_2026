type PersistListingInput = {
  hostProfile: {
    hostSub: string | null;
    hostName: string;
  };
  listingData: Record<string, unknown>;
  lotDraft: unknown[];
};

export async function persistListingPlaceholder(_payload: PersistListingInput) {
  return {
    persistedAt: new Date().toISOString(),
    locationId: `location-${Date.now()}`,
    status: "placeholder-saved",
  };
}

export const hostListingPersistenceAdapter = {
  persistListing: persistListingPlaceholder,
};