import { create } from "zustand";

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
      showLocationsList: false,
    });

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

export const selectHasHostAccess = (state) =>
  Boolean(state.hostProfile.hostSub) && (state.hostLotState.locations?.length ?? 0) > 0;
