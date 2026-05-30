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
  listingData: defaultListingData,
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

  resetListingData: () => set({ listingData: defaultListingData }),
  setCheckedPostIndex: (checkedPostIndex) => set({ checkedPostIndex }),
  setShowLocationsList: (showLocationsList) => set({ showLocationsList }),

  selectLocation: (index) => {
    const location = get().hostLotState.locations?.[index];
    set({
      checkedPostIndex: index,
      showLocationsList: false,
      listingData: location ? mapLocationToListing(location) : defaultListingData,
    });
  },
}));

export const selectCurrentHostLocation = (state) =>
  state.hostLotState.locations?.[state.checkedPostIndex] ?? null;
