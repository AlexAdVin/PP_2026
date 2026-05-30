import { create } from "zustand";

export const useHostStore = create((set) => ({
  hostLotState: {
    hostSub: null,
    hostName: null,
    locations: [],
  },
  setHostLotState: (hostLotState) => set({ hostLotState }),

  listingData: {
    locName: "",
    addrLoc: "",
    // ...add other fields as needed
  },
  setListingData: (listingData) => set({ listingData }),

  checkedPostIndex: 0,
  setCheckedPostIndex: (checkedPostIndex) => set({ checkedPostIndex }),

  showLocationsList: false,
  setShowLocationsList: (showLocationsList) => set({ showLocationsList }),

  // Add any other host-specific state here
}));
