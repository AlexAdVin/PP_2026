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

The premium landing and host hub now also share reusable liquid-glass layout primitives in `components/layout/premium/`.

- `PremiumScreen.tsx`
- `PremiumHero.tsx`
- `PremiumMetricStrip.tsx`
- `GlassFeatureCard.tsx`
- `QuickActionCard.tsx`
- `GlassIconButton.tsx`
- `SectionHeader.tsx`
- `CountUpText.tsx`

## Start Listing Flow

The `Start sharing` CTA now opens a five-step host listing wizard.

Steps:

1. Parking type
2. Location search, current location, or draggable map confirmation
3. Number of lots
4. Hourly price
5. Listing name

Completing the wizard creates a new draft host location inside `src/hostStore.js`, generates default lots from the chosen lot count, and returns the user to the host hub with the new location selected.

## Host Entry Behavior

The host landing screen now behaves like a real host gate instead of seeding mock data automatically.

- If the mocked host profile is missing or the host has no listed locations, `app/(drawer)/host/(tabs)/index.tsx` shows a premium onboarding screen.
- Completing `Start sharing` creates the first host profile marker and host location draft in `src/hostStore.js`, then returns to the full hosting hub.
- The location selector uses `components/modals/LiquidGlassModal.tsx` rather than the legacy modal sheet.
- `components/hostHub/HostLocationModal.tsx` also exposes an in-modal `Add a new location` CTA that closes the selector and routes the user into `/host/start-listing-intro`.

## Backend Reconnection Notes

When a real backend is restored:

1. Fetch host profile and locations before or inside the host route tree, then hydrate `src/hostStore.js` with that payload.
2. Preserve the onboarding branch for `no host profile` and `no locations`; do not reintroduce automatic mock seeding in the host screens.
3. Keep the fetched payload aligned with the `hostLotState` shape and continue keeping host state separate from the driver store.