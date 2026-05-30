# Host Home Migration

This directory contains the migrated Host Home stack from the legacy JazzPark app. All state is managed with Zustand (see src/hostStore.js). Subcomponents and logic are being ported incrementally. Integrate new screens into the drawer via app/(drawer)/host/index.tsx.

- Main entry: HostHome.js
- State: src/hostStore.js
- Drawer: app/(drawer)/\_layout.tsx

## Migration Notes

- Recoil state is replaced by Zustand (host store is separate from driver store).
- All subcomponents from JazzPark 5 2/components/hostHub/ should be migrated here.
- Utilities from JazzPark 5 2/global/utils/ should be ported as needed.
- Use TypeScript for new/converted files when possible.
- Document any architectural or logic changes in this file.
