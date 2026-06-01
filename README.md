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

- Drawer label: `Hosting Home`
- Landing route: `app/(drawer)/host/(tabs)/index.tsx`
- Listing wizard: `app/(drawer)/host/start-listing.tsx`
- Navigation behavior: the drawer entry replaces the current route with `/host`, so stale driver stack history is not preserved beneath the host flow.
- State: host state is managed in `src/hostStore.js` with Zustand and kept separate from the driver location store in `src/store.js`.

The `Start sharing` action now opens a five-step host listing wizard for type, address, lot count, hourly price, and location name. Completing those metadata steps continues into the migrated lot-settings stage at `/host/create-listing`, where each lot is configured before the final listing is committed into the host Zustand store.

After the five-step metadata wizard is complete, the flow now continues into `/host/create-listing`, which migrates the old `CreateListingNew` lot-settings stage into the Expo Router app. This second stage uses Zustand-backed `listingLotDraft` state for per-lot availability and charger settings, replacing the old Recoil `useLotState` flow.

Database writes are intentionally routed through the placeholder adapter in `src/adapters/hostListingPersistenceAdapter.ts`. The adapter currently simulates a successful persistence call and returns a synthetic location id so the UI and store can behave like production without binding the new host flow to unfinished backend writes.

The hosting hub now uses a premium shared liquid-glass layout system from `components/layout/premium/`, reused by both the landing screen and the host home screen.

Host locations and resumable listing drafts now come from separate sources so the app matches the intended production split.

- Hosted locations are loaded through `src/adapters/hostDatabaseAdapter.ts`, which currently reads `model/mockLocations.json` to simulate a database response.
- `Save & Exit` persists only the in-progress listing draft in AsyncStorage through `src/hostStore.js`.
- Final listing submission from `/host/create-listing` is routed through `src/adapters/hostListingPersistenceAdapter.ts`, which currently acts as a placeholder write boundary until the real backend contract is wired in.
- The hosting hub always hydrates the simulated database locations, then overlays any saved draft in the UI as a resumable unlisted item.
- If there are database-backed locations, the saved draft appears alongside them in the location switcher. If the draft is the only host artifact, the hub shows a dedicated `Continue listing` CTA.

When the backend is ready, replace the adapter implementation in `src/adapters/hostDatabaseAdapter.ts` with the real API or database client and keep AsyncStorage reserved for incomplete local drafts.

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
