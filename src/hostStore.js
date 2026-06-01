import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { hostListingPersistenceAdapter } from "@/src/adapters/hostListingPersistenceAdapter";

const HOST_LISTING_DRAFT_STORAGE_KEY = "pp-2026-host-listing-draft";

const addHoursToDate = (date, hours) => {
  const nextDate = new Date(date);
  nextDate.setHours(nextDate.getHours() + hours);
  return nextDate;
};

const addMonthsToDate = (date, months) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

const defaultListingData = {
  type: "",
  addrLoc: "",
  lat: null,
  lng: null,
  nrOfLots: 1,
  hrPrice: 0,
  locName: "",
  isActive: true,
};

const createDefaultListingDraft = () => ({
  type: "Open space",
  addrLoc: "",
  lat: null,
  lng: null,
  nrOfLots: 3,
  hrPrice: 25,
  locName: "",
  isActive: true,
});

const createDefaultAvailabilityDates = () => {
  const startDate = new Date();

  return [
    {
      boolStart: true,
      startAvl: startDate,
    },
    {
      boolEnd: true,
      endAvl: addMonthsToDate(startDate, 12),
    },
  ];
};

const createDefaultAvailabilityTimes = () =>
  [
    { day: "Monday", bool: true, sT: new Date(new Date().setHours(8, 0, 0, 0)), eT: new Date(new Date().setHours(18, 0, 0, 0)) },
    { day: "Tuesday", bool: true, sT: new Date(new Date().setHours(8, 0, 0, 0)), eT: new Date(new Date().setHours(18, 0, 0, 0)) },
    { day: "Wednesday", bool: true, sT: new Date(new Date().setHours(8, 0, 0, 0)), eT: new Date(new Date().setHours(18, 0, 0, 0)) },
    { day: "Thursday", bool: true, sT: new Date(new Date().setHours(8, 0, 0, 0)), eT: new Date(new Date().setHours(18, 0, 0, 0)) },
    { day: "Friday", bool: true, sT: new Date(new Date().setHours(8, 0, 0, 0)), eT: new Date(new Date().setHours(17, 0, 0, 0)) },
    { day: "Saturday", bool: true, sT: new Date(new Date().setHours(0, 0, 0, 0)), eT: addHoursToDate(new Date(new Date().setHours(0, 0, 0, 0)), 24) },
    { day: "Sunday", bool: true, sT: new Date(new Date().setHours(0, 0, 0, 0)), eT: addHoursToDate(new Date(new Date().setHours(0, 0, 0, 0)), 24) },
  ];

const createEditableLotDraft = (index, listingData) => ({
  id: `lot-draft-${Date.now()}-${index + 1}`,
  lotNr: index + 1,
  img: null,
  rules: "Please read the host note before arrival.",
  avlBool: listingData?.isActive ?? true,
  avlDates: createDefaultAvailabilityDates(),
  avlDaysNTime: createDefaultAvailabilityTimes(),
  chargerBool: false,
  charger: [
    {
      chargerNr: index + 1,
      note: "Turn on the charger by using the host instructions.",
      plugType: null,
      power: null,
      usageFee: 7,
      pricekWh: 4.25,
    },
  ],
  Transactions: {
    items: [],
  },
  parkingFee: Number(listingData?.hrPrice ?? 0),
});

const getDraftListingIsActive = (lotDraft = []) => lotDraft.some((lot) => lot?.avlBool !== false);

const cloneLotDraft = (lotDraft) => ({
  ...lotDraft,
  avlDates: (lotDraft?.avlDates ?? []).map((entry) => ({
    ...entry,
    startAvl: entry?.startAvl ? new Date(entry.startAvl) : entry?.startAvl,
    endAvl: entry?.endAvl ? new Date(entry.endAvl) : entry?.endAvl,
  })),
  avlDaysNTime: (lotDraft?.avlDaysNTime ?? []).map((entry) => ({
    ...entry,
    sT: entry?.sT ? new Date(entry.sT) : entry?.sT,
    eT: entry?.eT ? new Date(entry.eT) : entry?.eT,
  })),
  charger: (lotDraft?.charger ?? []).map((entry) => ({ ...entry })),
  Transactions: {
    items: [...(lotDraft?.Transactions?.items ?? [])],
  },
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

const createPersistedLotFromDraft = (lotDraft, hourlyPrice) => {
  const startDate = lotDraft?.avlDates?.[0]?.startAvl ? new Date(lotDraft.avlDates[0].startAvl) : new Date();
  const endDate = lotDraft?.avlDates?.[1]?.endAvl ? new Date(lotDraft.avlDates[1].endAvl) : addMonthsToDate(startDate, 12);
  const charger = lotDraft?.charger?.[0] ?? null;
  const hasCharger = Boolean(lotDraft?.chargerBool && charger?.plugType);

  return {
    id: lotDraft?.id ?? `lot-${Date.now()}-${lotDraft?.lotNr ?? 1}`,
    lotNr: lotDraft?.lotNr ?? 1,
    img: lotDraft?.img ?? null,
    rules: lotDraft?.rules ?? "Please read the host note before arrival.",
    avlBool: lotDraft?.avlBool ?? true,
    startAvl: startDate.toISOString().slice(0, 10),
    endAvl: endDate.toISOString().slice(0, 10),
    chargerBool: hasCharger,
    AvlDaysNTimes: {
      items: (lotDraft?.avlDaysNTime ?? []).map((entry, index) => ({
        id: `avl-${Date.now()}-${lotDraft?.lotNr ?? 1}-${index}`,
        day: entry.day,
        bool: entry.bool,
        sT: new Date(entry.sT).toISOString(),
        eT: new Date(entry.eT).toISOString(),
      })),
    },
    Charger: hasCharger
      ? {
          id: `charger-${Date.now()}-${lotDraft?.lotNr ?? 1}`,
          chargerNr: Number(charger.chargerNr ?? lotDraft?.lotNr ?? 1),
          plugType: charger.plugType,
          power: Number(charger.power ?? 0),
          usageFee: Number(charger.usageFee ?? 0),
          pricekWh: Number(charger.pricekWh ?? 0),
        }
      : null,
    Transactions: {
      items: [...(lotDraft?.Transactions?.items ?? [])],
    },
    parkingFee: Number(lotDraft?.parkingFee ?? hourlyPrice ?? 0),
  };
};

const createLocationFromListing = (listingData, lotDrafts, persistedLocationId) => ({
  id: persistedLocationId ?? `host-location-${Date.now()}`,
  type: listingData?.type ?? "Open space",
  addrLoc: listingData?.addrLoc ?? "",
  nrOfLots: Number(listingData?.nrOfLots ?? 1),
  hrPrice: Number(listingData?.hrPrice ?? 0),
  locName: listingData?.locName ?? "",
  lat: listingData?.lat ?? null,
  lng: listingData?.lng ?? null,
  description: "New host listing draft",
  isActive: lotDrafts?.length ? getDraftListingIsActive(lotDrafts) : listingData?.isActive ?? true,
  Lots: {
    items:
      lotDrafts?.length
        ? lotDrafts.map((lotDraft) => createPersistedLotFromDraft(lotDraft, listingData?.hrPrice))
        : Array.from({ length: Number(listingData?.nrOfLots ?? 1) }, (_, index) => createDefaultLot(index, listingData?.hrPrice)),
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
  isActive: location?.isActive ?? true,
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
      isActive: savedDraft?.listingData?.isActive ?? true,
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
  listingLotDraft: [],
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

  initializeListingLotDraft: (listingDataInput) => {
    const state = get();
    const nextListingData = {
      ...state.listingData,
      ...(listingDataInput ?? {}),
    };

    const nextLotCount = Math.max(1, Number(nextListingData?.nrOfLots ?? 1));
    const nextLotDraft = Array.from({ length: nextLotCount }, (_, index) => createEditableLotDraft(index, nextListingData));

    set({
      listingData: {
        ...nextListingData,
        isActive: getDraftListingIsActive(nextLotDraft),
      },
      listingLotDraft: nextLotDraft,
    });

    return nextLotDraft;
  },

  updateListingLotField: (lotIndex, key, value) =>
    set((state) => {
      const nextLotDraft = [...(state.listingLotDraft ?? [])];
      const currentLot = nextLotDraft[lotIndex];

      if (!currentLot) {
        return state;
      }

      nextLotDraft[lotIndex] = {
        ...currentLot,
        [key]: value,
      };

      return {
        listingData:
          key === "avlBool"
            ? {
                ...state.listingData,
                isActive: getDraftListingIsActive(nextLotDraft),
              }
            : state.listingData,
        listingLotDraft: nextLotDraft,
      };
    }),

  setListingDraftActive: (isActive) =>
    set((state) => ({
      listingData: {
        ...state.listingData,
        isActive,
      },
      listingLotDraft: (state.listingLotDraft ?? []).map((lotDraft) => ({
        ...lotDraft,
        avlBool: isActive,
      })),
    })),

  setListingLotActive: (lotIndex, isActive) =>
    set((state) => {
      const nextLotDraft = [...(state.listingLotDraft ?? [])];
      const currentLot = nextLotDraft[lotIndex];

      if (!currentLot) {
        return state;
      }

      nextLotDraft[lotIndex] = {
        ...currentLot,
        avlBool: isActive,
      };

      return {
        listingData: {
          ...state.listingData,
          isActive: getDraftListingIsActive(nextLotDraft),
        },
        listingLotDraft: nextLotDraft,
      };
    }),

  updateListingLotAvailability: (lotIndex, entry, avlIndex, key, value, key2, value2) =>
    set((state) => {
      const nextLotDraft = [...(state.listingLotDraft ?? [])];
      const currentLot = nextLotDraft[lotIndex];

      if (!currentLot) {
        return state;
      }

      if (entry === "avlDates") {
        const nextDates = [...(currentLot.avlDates ?? [])];
        nextDates[avlIndex] = {
          ...nextDates[avlIndex],
          [key]: value,
          ...(key2 ? { [key2]: value2 } : {}),
        };

        nextLotDraft[lotIndex] = {
          ...currentLot,
          avlDates: nextDates,
        };
      } else if (entry === "avlDaysNTime") {
        const nextAvailability = [...(currentLot.avlDaysNTime ?? [])];

        if (key === "bool" && avlIndex === "Weekdays") {
          for (let index = 0; index < 5; index += 1) {
            nextAvailability[index] = {
              ...nextAvailability[index],
              bool: value,
            };
          }
        } else if (key === "bool" && avlIndex === "Weekend") {
          for (let index = 5; index < nextAvailability.length; index += 1) {
            nextAvailability[index] = {
              ...nextAvailability[index],
              bool: value,
            };
          }
        } else {
          nextAvailability[avlIndex] = {
            ...nextAvailability[avlIndex],
            [key]: value,
            ...(key2 ? { [key2]: value2 } : {}),
          };
        }

        nextLotDraft[lotIndex] = {
          ...currentLot,
          avlDaysNTime: nextAvailability,
        };
      } else {
        const nextEntry = [...(currentLot[entry] ?? [])];
        nextEntry[avlIndex] = {
          ...nextEntry[avlIndex],
          [key]: value,
          ...(key2 ? { [key2]: value2 } : {}),
        };

        nextLotDraft[lotIndex] = {
          ...currentLot,
          [entry]: nextEntry,
        };
      }

      return {
        listingData: {
          ...state.listingData,
          isActive: getDraftListingIsActive(nextLotDraft),
        },
        listingLotDraft: nextLotDraft,
      };
    }),

  applyListingLotToAll: (lotIndex) =>
    set((state) => {
      const sourceLot = state.listingLotDraft?.[lotIndex];

      if (!sourceLot) {
        return state;
      }

      return {
        listingLotDraft: (state.listingLotDraft ?? []).map((lotDraft, index) =>
          index === lotIndex
            ? lotDraft
            : {
                ...cloneLotDraft(sourceLot),
                id: lotDraft.id,
                lotNr: lotDraft.lotNr,
              },
        ),
      };
    }),

  resetListingLotDraft: () => set({ listingLotDraft: [] }),

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

  finalizeHostListing: async () => {
    const state = get();
    const currentState = state.hostLotState;
    const currentProfile = state.hostProfile;
    const hostSub = currentProfile.hostSub ?? currentState.hostSub ?? `mock-host-${Date.now()}`;
    const hostName = currentProfile.hostName || currentState.hostName || "Scandinavian Host";
    const persistedListing = await hostListingPersistenceAdapter.persistListing({
      hostProfile: { hostSub, hostName },
      listingData: state.listingData,
      lotDraft: state.listingLotDraft,
    });

    const newLocation = createLocationFromListing(
      state.listingData,
      state.listingLotDraft,
      persistedListing?.locationId,
    );
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
      listingLotDraft: [],
      savedListingDraft: null,
      showLocationsList: false,
    });

    await AsyncStorage.removeItem(HOST_LISTING_DRAFT_STORAGE_KEY);

    return newLocation;
  },
}));

export const selectCurrentHostLocation = (state) =>
  state.hostLotState.locations?.[state.checkedPostIndex] ?? null;

export const mapSavedListingDraftToPreview = createSavedDraftPreview;

export const selectHasHostAccess = (state) =>
  Boolean(state.hostProfile.hostSub) && (state.hostLotState.locations?.length ?? 0) > 0;
