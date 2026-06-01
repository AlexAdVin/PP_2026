import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const HOST_LISTING_DRAFT_STORAGE_KEY = "pp-2026-host-listing-draft";

const defaultListingData = {
  type: "",
  addrLoc: "",
  lat: null,
  lng: null,
  nrOfLots: 1,
  hrPrice: 0,
  locName: "",
};

const createDefaultListingDraft = () => ({
  type: "Open space",
  addrLoc: "",
  lat: null,
  lng: null,
  nrOfLots: 3,
  hrPrice: 25,
  locName: "",
});

const createDefaultLot = (index, hourlyPrice) => ({
  id: `lot-${Date.now()}-${index + 1}`,
  lotNr: index + 1,
  img: null,
  rules: "Please read the host note before arrival.",
  avlBool: true,
  startAvl: new Date().toISOString().slice(0, 10),
  endAvl: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .slice(0, 10),
  chargerBool: false,
  AvlDaysNTimes: {
    items: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day, dayIndex) => ({
      id: `avl-${Date.now()}-${index + 1}-${day}`,
      day,
      bool: true,
      sT: new Date(new Date().setHours(dayIndex < 5 ? 8 : 0, 0, 0, 0)).toISOString(),
      eT: new Date(new Date().setHours(dayIndex < 5 ? 18 : 23, 59, 59, 999)).toISOString(),
    })),
  },
  Charger: null,
  Transactions: {
    items: [],
  },
  parkingFee: Number(hourlyPrice ?? 0),
});

const createLocationFromListing = (listingData) => ({
  id: `host-location-${Date.now()}`,
  type: listingData?.type ?? "Open space",
  addrLoc: listingData?.addrLoc ?? "",
  nrOfLots: Number(listingData?.nrOfLots ?? 1),
  hrPrice: Number(listingData?.hrPrice ?? 0),
  locName: listingData?.locName ?? "",
  lat: listingData?.lat ?? null,
  lng: listingData?.lng ?? null,
  description: "New host listing draft",
  isActive: true,
  Lots: {
    items: Array.from({ length: Number(listingData?.nrOfLots ?? 1) }, (_, index) =>
      createDefaultLot(index, listingData?.hrPrice),
    ),
  },
});

const mapLocationToListing = (location) => ({
  type: location?.type ?? "",
  addrLoc: location?.addrLoc ?? "",
  lat: location?.lat ?? null,
  lng: location?.lng ?? null,
  nrOfLots: location?.nrOfLots ?? 1,
  hrPrice: location?.hrPrice ?? 0,
  locName: location?.locName ?? "",
});

const normalizeSavedListingDraft = (savedDraft) => {
  if (!savedDraft?.listingData) {
    return null;
  }

  return {
    listingData: {
      ...createDefaultListingDraft(),
      ...savedDraft.listingData,
      nrOfLots: Number(savedDraft?.listingData?.nrOfLots ?? createDefaultListingDraft().nrOfLots),
      hrPrice: Number(savedDraft?.listingData?.hrPrice ?? createDefaultListingDraft().hrPrice),
    },
    step: Math.min(Math.max(Number(savedDraft?.step ?? 0), 0), 4),
    savedAt: savedDraft?.savedAt ?? new Date().toISOString(),
  };
};

const createSavedDraftPreview = (savedDraft) => {
  const normalizedDraft = normalizeSavedListingDraft(savedDraft);

  if (!normalizedDraft) {
    return null;
  }

  return {
    id: `saved-draft-${normalizedDraft.savedAt}`,
    type: normalizedDraft.listingData.type || "Open space",
    addrLoc: normalizedDraft.listingData.addrLoc?.trim() || "Undefined address",
    nrOfLots: Number(normalizedDraft.listingData.nrOfLots ?? 1),
    hrPrice: Number(normalizedDraft.listingData.hrPrice ?? 0),
    locName: normalizedDraft.listingData.locName?.trim() || "Unlisted parking",
    lat: normalizedDraft.listingData.lat ?? null,
    lng: normalizedDraft.listingData.lng ?? null,
    isDraft: true,
    isActive: false,
    savedAt: normalizedDraft.savedAt,
    draftStep: normalizedDraft.step,
  };
};

export const useHostStore = create((set, get) => ({
  hostProfile: {
    hostSub: null,
    hostName: "",
  },
  hostLotState: {
    hostSub: null,
    hostName: "",
    locations: [],
  },
  listingData: createDefaultListingDraft(),
  savedListingDraft: null,
  hasHydratedSavedListingDraft: false,
  checkedPostIndex: 0,
  showLocationsList: false,

  hydrateHostData: (payload) =>
    set({
      hostProfile: {
        hostSub: payload?.hostSub ?? null,
        hostName: payload?.hostName ?? "",
      },
      hostLotState: {
        hostSub: payload?.hostSub ?? null,
        hostName: payload?.hostName ?? "",
        locations: payload?.locations ?? [],
      },
      checkedPostIndex: 0,
      listingData: mapLocationToListing(payload?.locations?.[0]),
    }),

  setHostLotState: (hostLotState) =>
    set((state) => ({
      hostLotState,
      hostProfile: {
        hostSub: hostLotState?.hostSub ?? state.hostProfile.hostSub,
        hostName: hostLotState?.hostName ?? state.hostProfile.hostName,
      },
    })),

  setListingData: (listingData) =>
    set((state) => ({
      listingData: {
        ...state.listingData,
        ...listingData,
      },
    })),

  updateListingField: (key, value) =>
    set((state) => ({
      listingData: {
        ...state.listingData,
        [key]: value,
      },
    })),

  resetListingData: () => set({ listingData: createDefaultListingDraft() }),
  saveListingDraft: async ({ step }) => {
    const state = get();
    const savedListingDraft = normalizeSavedListingDraft({
      listingData: state.listingData,
      step,
      savedAt: new Date().toISOString(),
    });

    await AsyncStorage.setItem(HOST_LISTING_DRAFT_STORAGE_KEY, JSON.stringify(savedListingDraft));

    set({ savedListingDraft, hasHydratedSavedListingDraft: true });

    return savedListingDraft;
  },
  hydrateSavedListingDraft: async () => {
    const storedDraft = await AsyncStorage.getItem(HOST_LISTING_DRAFT_STORAGE_KEY);

    if (!storedDraft) {
      set({ savedListingDraft: null, hasHydratedSavedListingDraft: true });
      return null;
    }

    const savedListingDraft = normalizeSavedListingDraft(JSON.parse(storedDraft));
    set({ savedListingDraft, hasHydratedSavedListingDraft: true });
    return savedListingDraft;
  },
  restoreSavedListingDraft: async () => {
    const savedListingDraft = get().savedListingDraft ?? (await get().hydrateSavedListingDraft());

    if (!savedListingDraft) {
      set({ listingData: createDefaultListingDraft() });
      return null;
    }

    set({ listingData: savedListingDraft.listingData });
    return savedListingDraft;
  },
  clearSavedListingDraft: async () => {
    await AsyncStorage.removeItem(HOST_LISTING_DRAFT_STORAGE_KEY);
    set({ savedListingDraft: null, hasHydratedSavedListingDraft: true });
  },
  setCheckedPostIndex: (checkedPostIndex) => set({ checkedPostIndex }),
  setShowLocationsList: (showLocationsList) => set({ showLocationsList }),
  setMockHostProfile: (payload) =>
    set((state) => ({
      hostProfile: {
        hostSub: payload?.hostSub ?? state.hostProfile.hostSub,
        hostName: payload?.hostName ?? state.hostProfile.hostName,
      },
      hostLotState: {
        ...state.hostLotState,
        hostSub: payload?.hostSub ?? state.hostLotState.hostSub,
        hostName: payload?.hostName ?? state.hostLotState.hostName,
      },
    })),

  createHostLocationDraft: (listingData) => {
    const nextListingData = listingData ?? get().listingData;
    const newLocation = createLocationFromListing(nextListingData);
    const currentState = get().hostLotState;
    const currentProfile = get().hostProfile;
    const hostSub = currentProfile.hostSub ?? currentState.hostSub ?? `mock-host-${Date.now()}`;
    const hostName = currentProfile.hostName || currentState.hostName || "Scandinavian Host";
    const nextLocations = [...(currentState.locations ?? []), newLocation];

    set({
      hostProfile: {
        hostSub,
        hostName,
      },
      hostLotState: {
        ...currentState,
        hostSub,
        hostName,
        locations: nextLocations,
      },
      checkedPostIndex: nextLocations.length - 1,
      listingData: mapLocationToListing(newLocation),
      savedListingDraft: null,
      showLocationsList: false,
    });

    void AsyncStorage.removeItem(HOST_LISTING_DRAFT_STORAGE_KEY);

    return newLocation;
  },

  selectLocation: (index) => {
    const location = get().hostLotState.locations?.[index];
    set({
      checkedPostIndex: index,
      showLocationsList: false,
      listingData: location ? mapLocationToListing(location) : defaultListingData,
    });
  },

  toggleLocationActive: (index) =>
    set((state) => {
      const nextLocations = [...(state.hostLotState.locations ?? [])];
      const currentLocation = nextLocations[index];

      if (!currentLocation) {
        return state;
      }

      const nextIsActive = !(currentLocation?.isActive ?? true);
      nextLocations[index] = {
        ...currentLocation,
        isActive: nextIsActive,
        Lots: {
          ...currentLocation.Lots,
          items: (currentLocation?.Lots?.items ?? []).map((lot) => ({
            ...lot,
            avlBool: nextIsActive,
          })),
        },
      };

      return {
        hostLotState: {
          ...state.hostLotState,
          locations: nextLocations,
        },
      };
    }),
}));

export const selectCurrentHostLocation = (state) =>
  state.hostLotState.locations?.[state.checkedPostIndex] ?? null;

export const mapSavedListingDraftToPreview = createSavedDraftPreview;

export const selectHasHostAccess = (state) =>
  Boolean(state.hostProfile.hostSub) && (state.hostLotState.locations?.length ?? 0) > 0;
