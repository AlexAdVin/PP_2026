# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Hosting Migration

The hosting flow now lives under the global drawer at `/host`.

The app now also uses standalone cinematic intro screens instead of embedding splash content inside the destination screens.

- Drawer label: `Hosting Home`
- Landing route: `app/(drawer)/host/(tabs)/index.tsx`
- First-launch app intro: `app/(drawer)/welcome.tsx`
- Start-listing intro: `app/(drawer)/host/start-listing-intro.tsx`
- Listing wizard: `app/(drawer)/host/start-listing.tsx`
- Lot-settings intro: `app/(drawer)/host/create-listing-intro.tsx`
- Lot-settings editor: `app/(drawer)/host/create-listing.tsx`
- Navigation behavior: the drawer entry replaces the current route with `/host`, so stale driver stack history is not preserved beneath the host flow.
- State: host state is managed in `src/hostStore.js` with Zustand and kept separate from the driver location store in `src/store.js`.

The `Start sharing` action now routes to a standalone intro screen and then into the five-step host listing wizard for type, address, lot count, hourly price, and location name. Completing those metadata steps routes through a second standalone intro screen and then into the migrated lot-settings stage at `/host/create-listing`, where each lot is configured before the final listing is committed into the host Zustand store.

After the five-step metadata wizard is complete, the flow now continues into `/host/create-listing`, which migrates the old `CreateListingNew` lot-settings stage into the Expo Router app. This second stage uses Zustand-backed `listingLotDraft` state for per-lot availability and charger settings, replacing the old Recoil `useLotState` flow.

Database writes now route through Supabase-backed adapters and SQL RPCs for host profile creation and full listing persistence.

The same signed-in user remains the driver identity throughout the app. Publishing a listing adds a linked host profile for that same user instead of switching roles or creating a second account.

The hosting hub now uses a premium shared liquid-glass layout system from `components/layout/premium/`, reused by both the landing screen and the host home screen.

The standalone intros themselves use `components/hostHub/shared/FlowSplashScreen.tsx`, which keeps the older splash-screen structure: cinematic media on top, indicators below, text content beneath that, then the shared progress bar and shared footer navigation.

Host locations and resumable listing drafts now come from separate sources so the app matches the intended production split.

- Hosted locations are loaded through `src/adapters/hostDatabaseAdapter.ts`, which fetches the authenticated host's locations from Supabase.
- `Save & Exit` persists only the in-progress listing draft in AsyncStorage through `src/hostStore.js`.
- Final listing submission from `/host/create-listing` is routed through `src/adapters/hostListingPersistenceAdapter.ts`, which now validates the draft, upserts the host profile, and creates the location through Supabase.
- First-launch onboarding visibility is persisted separately through `src/adapters/appIntroAdapter.ts` so the app intro appears before Landing only for users who have not completed it yet.
- The host location switcher modal now includes an `Add a new location` liquid-glass CTA that routes directly to `/host/start-listing-intro`.
- The hosting hub always hydrates the simulated database locations, then overlays any saved draft in the UI as a resumable unlisted item.
- If there are database-backed locations, the saved draft appears alongside them in the location switcher. If the draft is the only host artifact, the hub shows a dedicated `Continue listing` CTA.

Published locations can now be fetched for the driver map through `src/adapters/publicLocationAdapter.ts`, while AsyncStorage stays reserved for incomplete local drafts only.

Driver discovery now uses a persisted local cache instead of querying per lot change.

- Home screen waits for map bounds, then fetches one Supabase payload for the current `activeTab + filters + viewport` state.
- That payload is stored in `src/store.js` and reused by map cards, place detail, and downstream booking screens.
- Place detail no longer makes a database request when the user scrolls the lot carousel; it reads the selected location and lot windows from the cached payload.
- If a lot becomes unavailable during payment confirmation, the app refreshes only that location from Supabase and can suggest an alternative lot with a liquid-glass modal.

Driver bookings are now backed by Supabase transactions instead of a mock confirm action.

- The pay screen opens a structured payment-method sheet and writes bookings through `src/adapters/transactionAdapter.ts`.
- Successful booking writes go through `public.create_booking_transaction(jsonb)` and create rows in `public.transactions`, `public.transaction_payment_details`, and `public.transaction_events`.
- Public driver discovery reads go through `public.list_public_locations_in_bounds(...)`, and single-location refreshes go through `public.get_public_location_by_id(...)`.
- Place detail checks cached lot occupancy from that payload and shows a glass availability clue when the selected booking window overlaps an existing reservation.
- Only masked payment details are stored in Supabase: card last 4 and expiry, or MobilePay last 4 and profile label. Full card numbers, CVC, and full MobilePay phone values are not stored.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
