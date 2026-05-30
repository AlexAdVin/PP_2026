# Hosting Migration

## Scope

This migration ports the old hosting entry flow from `PP-old` into the Expo Router app under the global drawer.

## Route Structure

- Drawer entry: `Hosting Home`
- Host stack owner: `app/(drawer)/host/_layout.tsx`
- Host tabs shell: `app/(drawer)/host/(tabs)/_layout.tsx`
- Host landing screen: `app/(drawer)/host/(tabs)/index.tsx`
- Host listing wizard: `app/(drawer)/host/start-listing.tsx`
- Supporting screens:
  - `app/(drawer)/host/(tabs)/calendar.tsx`
  - `app/(drawer)/host/(tabs)/reservations.tsx`
  - `app/(drawer)/host/update-avl.tsx`

The drawer item uses `router.replace("/host")` so host entry swaps stacks instead of preserving prior driver history.

## State Migration

Legacy Recoil atoms were replaced with a dedicated Zustand host store in `src/hostStore.js`.

- `hostLotStateAtom` -> `useHostStore(state => state.hostLotState)`
- `listingDataAtom` -> `useHostStore(state => state.listingData)`
- `checkedPostIndex` and location picker visibility are stored in the same host store
- Driver location state remains isolated in `src/store.js`

## Component Migration

Host-specific UI was moved into `components/hostHub/`:

- `BulletPoints.tsx`
- `HostFooterButton.tsx`
- `HostHighlightsGrid.tsx`
- `HostLocationModal.tsx`
- `HostTitle.tsx`
- `ListingCard.tsx`
- `TransactionDataCard.tsx`

Host listing wizard UI lives in `components/hostHub/startListing/`:

- `FooterBackNext.tsx`
- `ManageHostLocation.tsx`
- `PriceSection.tsx`
- `RenderIncrementer.tsx`
- `RenderStartListingMap.tsx`
- `SearchHostLocation.tsx`
- `SelectPType.tsx`

These components preserve the old HostHome visual treatment while removing Recoil and legacy overlay dependencies.

## Start Listing Flow

The `Start sharing` CTA now opens a five-step host listing wizard.

Steps:

1. Parking type
2. Location search, current location, or draggable map confirmation
3. Number of lots
4. Hourly price
5. Listing name

Completing the wizard creates a new draft host location inside `src/hostStore.js`, generates default lots from the chosen lot count, and returns the user to the host hub with the new location selected.

## Current Data Source

The hosting flow currently hydrates from `model/mockLocations.json` because the current ParkingPlanet app still runs on mock location data.

To connect the real backend later:

1. Replace the `hydrateHostData(mockHostData)` calls in the host screens with the real host fetcher.
2. Keep the fetched payload aligned with the `hostLotState` shape used in `src/hostStore.js`.
3. Continue keeping host state separate from the driver location store.