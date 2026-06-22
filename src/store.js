import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const DRIVER_LOCATION_STORE_KEY = 'pp2026-driver-location-store';

const defaultDriverFilters = {
  minHourlyPrice: null,
  maxHourlyPrice: null,
  chargerRequired: false,
  locationTypes: [],
};

const defaultDriverDiscovery = {
  activeTab: 'Parking',
  boundsKey: null,
  filters: defaultDriverFilters,
  locations: [],
  lastFetchedAt: null,
};

function updateLocationCollection(locations, nextLocation) {
  const existingLocations = Array.isArray(locations) ? locations : [];
  const nextLocations = existingLocations.filter((location) => location?.id !== nextLocation?.id);

  if (nextLocation) {
    nextLocations.push(nextLocation);
  }

  return nextLocations;
}

export const useLocationStore = create(persist((set, get) => ({
  // Origin details state
  originDetails: {
    location: null,
    viewport: null,
    description: null
  },

  // Destination details state
  destinationDetails: {
    location: null,
    viewport: null,
    description: null
  },

  // Map bounds state
  mapBounds: {
    viewport: null
  },

  // Booking time state - persists across component tree
  bookingTime: {
    startTime: new Date().toISOString(),
    duration: new Date(new Date().setHours(1, 0)).toISOString()
  },

  driverFilters: defaultDriverFilters,
  driverDiscovery: defaultDriverDiscovery,
  selectedLocationId: null,
  selectedLotId: null,

  // Setters
  setOriginDetails: (details) => set({ originDetails: details }),
  setDestinationDetails: (details) => set({ destinationDetails: details }),
  setMapBounds: (bounds) => set({ mapBounds: bounds }),
  setDriverFilters: (filters) => set((state) => ({
    driverFilters: {
      ...state.driverFilters,
      ...(filters ?? {}),
    },
  })),
  setDriverDiscovery: (payload) => set((state) => ({
    driverDiscovery: {
      ...state.driverDiscovery,
      ...(payload ?? {}),
      filters: {
        ...state.driverDiscovery.filters,
        ...(payload?.filters ?? {}),
      },
    },
  })),
  replaceCachedLocation: (location) => set((state) => ({
    driverDiscovery: {
      ...state.driverDiscovery,
      locations: updateLocationCollection(state.driverDiscovery.locations, location),
      lastFetchedAt: new Date().toISOString(),
    },
  })),
  appendTransactionToCachedLot: ({ locationId, lotId, transaction }) => set((state) => ({
    driverDiscovery: {
      ...state.driverDiscovery,
      locations: (state.driverDiscovery.locations ?? []).map((location) => {
        if (location?.id !== locationId) {
          return location;
        }

        return {
          ...location,
          Lots: {
            ...location.Lots,
            items: (location?.Lots?.items ?? []).map((lot) => {
              if (lot?.id !== lotId) {
                return lot;
              }

              const existingItems = lot?.Transactions?.items ?? [];
              const nextItems = [...existingItems.filter((item) => item?.id !== transaction?.id), transaction]
                .sort((left, right) => new Date(left.startBooking).getTime() - new Date(right.startBooking).getTime());

              return {
                ...lot,
                Transactions: {
                  ...lot.Transactions,
                  items: nextItems,
                },
              };
            }),
          },
        };
      }),
      lastFetchedAt: new Date().toISOString(),
    },
  })),
  setSelectedParkingTarget: (locationId, lotId = null) => set({
    selectedLocationId: locationId,
    selectedLotId: lotId,
  }),
  
  // Update booking time - called only when user saves in TimeReg
  setBookingTime: (startTime, duration) => set({
    bookingTime: {
      startTime: startTime.toISOString?.() || startTime,
      duration: duration.toISOString?.() || duration
    }
  }),
}), {
  name: DRIVER_LOCATION_STORE_KEY,
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({
    bookingTime: state.bookingTime,
    driverFilters: state.driverFilters,
    driverDiscovery: state.driverDiscovery,
    selectedLocationId: state.selectedLocationId,
    selectedLotId: state.selectedLotId,
  }),
}));