import { create } from 'zustand';

export const useLocationStore = create((set) => ({
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

  // Setters
  setOriginDetails: (details) => set({ originDetails: details }),
  setDestinationDetails: (details) => set({ destinationDetails: details }),
  setMapBounds: (bounds) => set({ mapBounds: bounds }),
  
  // Update booking time - called only when user saves in TimeReg
  setBookingTime: (startTime, duration) => set({
    bookingTime: {
      startTime: startTime.toISOString?.() || startTime,
      duration: duration.toISOString?.() || duration
    }
  }),
}));