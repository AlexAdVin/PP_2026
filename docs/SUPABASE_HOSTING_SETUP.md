# Supabase Hosting Setup

This setup keeps `public.users` as the single identity table while allowing any authenticated driver to become a host only when they publish the first location.

The role model is additive, not exclusive: a user is always a driver in the app, and once the first listing is published that same user also becomes a host. The same auth identity can still search, book parking, and manage owned listings.

## Ownership Model

- Every signed-in person gets a row in `public.users`.
- Drivers stay drivers permanently.
- A row in `public.hosts` is created only when the first listing is published.
- Publishing does not replace or migrate the driver identity. It adds host capabilities to the same `public.users.id`.
- `hosts.host_sub` mirrors the old Amplify `hostSub` pattern and stores the same value as `auth.users.id`.
- `public.locations` belongs to `public.hosts`.
- `public.lots`, `public.lot_availability_windows`, and `public.chargers` belong to a location through the lot.
- Locations are auto-approved for now and are published immediately.

## SQL Deployment

Run these scripts in order:

1. [docs/supabase-users.sql](c:/Users/aaavu/Documents/TBD/PP_2026_Project/PP_2026/docs/supabase-users.sql)
2. [docs/supabase-hosting.sql](c:/Users/aaavu/Documents/TBD/PP_2026_Project/PP_2026/docs/supabase-hosting.sql)

Example CLI flow:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

If you manage SQL migrations explicitly, copy [docs/supabase-hosting.sql](c:/Users/aaavu/Documents/TBD/PP_2026_Project/PP_2026/docs/supabase-hosting.sql) into your migrations directory before pushing.

## What The SQL Adds

- `public.users.is_host`
- `public.users.hosted_location_count`
- `public.hosts`
- `public.locations`
- `public.lots`
- `public.lot_availability_windows`
- `public.chargers`
- `public.transactions`
- `public.cars`
- `public.upsert_host_profile(input_display_name text)`
- `public.create_host_listing(input_payload jsonb)`

The `create_host_listing` RPC is the critical production boundary because it persists the full location graph in one transaction instead of relying on many client-side inserts.

## App Adapters

- `src/adapters/hostProfileAdapter.ts`: host profile upsert bound to the authenticated Supabase user.
- `src/adapters/hostLocationAdapter.ts`: full listing create and read mapping between Supabase rows and the app's existing nested location shape.
- `src/adapters/hostListingPersistenceAdapter.ts`: save boundary used by `src/hostStore.js` when the host finishes the create-listing flow.
- `src/adapters/hostDatabaseAdapter.ts`: current host read adapter for Hosting Hub hydration.
- `src/adapters/publicLocationAdapter.ts`: published location read adapter for the driver map.

## Current Flow

1. User authenticates and gets a `public.users` row.
2. User remains a driver and can use all driver flows.
3. Final publish calls `hostListingPersistenceAdapter.persistListing()`.
4. The adapter upserts the host profile and calls `create_host_listing`.
5. The same `public.users.id` is marked with `is_host = true` and linked to `public.hosts`.
6. The new location is fetched back from Supabase and hydrated into the host store.
7. Hosting Hub fetches owned locations from Supabase.
8. The driver map fetches published active locations from Supabase.

## Scope Today

- Create host profile on first publish: implemented
- Create location with lots, availability, and chargers: implemented
- Hydrate Hosting Hub from Supabase: implemented
- Hydrate public map from Supabase: implemented
- Update existing listings: deferred
- Admin review workflow: deferred, defaults to auto-approved publish