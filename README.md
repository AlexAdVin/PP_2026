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

The `Start sharing` action now opens a five-step host listing wizard for type, address, lot count, hourly price, and location name. Completing that flow creates a host location draft in the host Zustand store and returns the user to the hosting hub.

The hosting hub now uses a premium shared liquid-glass layout system from `components/layout/premium/`, reused by both the landing screen and the host home screen.

The host home no longer auto-seeds mock data on entry. If there is no mocked host profile or no hosted locations, the user sees a premium onboarding screen instead of the full hosting hub. Completing the `Start sharing` wizard creates the first host draft and returns to the operational hub.

When backend host data is reintroduced, hydrate `src/hostStore.js` from the real host fetch layer and keep this onboarding branch intact instead of restoring automatic mock hydration in the host screens.

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
