# Supabase Hosting Setup

This setup keeps `public.users` as the single identity table while allowing any authenticated driver to become a host only when they publish the first location.

No Supabase GraphQL configuration is required for the driver discovery flow implemented here. The app uses one bounded Supabase RPC payload per active map boundary/filter state instead of a GraphQL endpoint.

The role model is additive, not exclusive: a user is always a driver in the app, and once the first listing is published that same user also becomes a host. The same auth identity can still search, book parking, and manage owned listings.

## Ownership Model

- Every signed-in person gets a row in `public.users`.
- Drivers stay drivers permanently.
- A row in `public.hosts` is created only when the first listing is published.
- Publishing does not replace or migrate the driver identity. It adds host capabilities to the same `public.users.id`.
- `hosts.host_sub` mirrors the old Amplify `hostSub` pattern and stores the same value as `auth.users.id`.
- `public.locations` belongs to `public.hosts`.
- `public.lots`, `public.lot_availability_windows`, and `public.chargers` belong to a location through the lot.
- `public.transactions` belongs to `public.lots` and stores successful confirmed bookings.
- `public.transaction_payment_details` stores sanitized payment-instrument snapshots for each booking.
- `public.transaction_events` stores append-only audit events for the booking lifecycle.
- Locations are auto-approved for now and are published immediately.

## SQL Deployment

Run these scripts in order:

1. [docs/supabase-users.sql](c:/Users/aaavu/Documents/TBD/PP_2026_Project/PP_2026/docs/supabase-users.sql)
2. [docs/supabase-hosting.sql](c:/Users/aaavu/Documents/TBD/PP_2026_Project/PP_2026/docs/supabase-hosting.sql)

If you previously dropped and recreated the `public` schema, run both scripts again in that order. Recreating `public` removes schema grants and every function, trigger, table, and policy defined there.

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
- `public.transaction_payment_details`
- `public.transaction_events`
- `public.cars`
- `public.upsert_host_profile(input_display_name text)`
- `public.create_host_listing(input_payload jsonb)`
- `public.get_lot_booking_windows(input_lot_id uuid, input_window_start timestamptz, input_window_end timestamptz)`
- `public.create_booking_transaction(input_payload jsonb)`
- `public.build_public_location_payload(input_location_id uuid)`
- `public.get_public_location_by_id(input_location_id uuid)`
- `public.list_public_locations_in_bounds(...)`

The `create_host_listing` RPC is the critical production boundary because it persists the full location graph in one transaction instead of relying on many client-side inserts.

`public.transactions` is no longer just a placeholder. A new booking row is now written only after the driver confirms payment from the pay screen.

## Transaction Model

The booking model is split into three layers instead of forcing every payment detail into one wide table:

- `public.transactions`: immutable commercial booking facts such as lot, driver, host, booking window, booked timestamp, status, pricing snapshot, totals, currency, and a masked payment label.
- `public.transaction_payment_details`: sanitized payment-method snapshot keyed `1:1` to the transaction.
- `public.transaction_events`: append-only audit trail for important booking and payment events.

This is the better production shape for millions of bookings. The core table stays queryable for operational reporting, host dashboards, dispute lookup, occupancy checks, and revenue analytics, while payment-specific details and event history stay normalized.

### What Gets Stored

- Card bookings: payment method type, display label, card brand, last 4 digits, expiry month, expiry year, cardholder name, provider references when available.
- MobilePay bookings: payment method type, display label, masked phone last 4 digits, MobilePay profile name, provider references when available.
- Apple Pay bookings: payment method type, display label, wallet provider, and provider references when available.

The app does not store full PAN values, CVC codes, or a full MobilePay phone number inside Supabase.

## App Adapters

- `src/adapters/hostProfileAdapter.ts`: host profile upsert bound to the authenticated Supabase user.
- `src/adapters/hostLocationAdapter.ts`: full listing create and read mapping between Supabase rows and the app's existing nested location shape.
- `src/adapters/hostListingPersistenceAdapter.ts`: save boundary used by `src/hostStore.js` when the host finishes the create-listing flow.
- `src/adapters/hostDatabaseAdapter.ts`: current host read adapter for Hosting Hub hydration.
- `src/adapters/publicLocationAdapter.ts`: one-request public location discovery adapter for the driver map and single-location refreshes.
- `src/adapters/transactionAdapter.ts`: driver booking create flow and authoritative booking write boundary.

## Driver Discovery Cache

The driver flow now uses one boundary-scoped discovery fetch and then keeps the payload in local Zustand state persisted through AsyncStorage.

- Home screen requests published locations only after map bounds are available.
- The request is keyed by `activeTab + filters + viewport`.
- The fetch itself is a single Supabase RPC call that returns the nested published locations inside the current boundary, including only sanitized future booking windows per lot.
- The resulting nested location payload is stored in `useLocationStore().driverDiscovery`.
- Downstream screens such as place detail resolve the selected location from the local cache by `locationId` instead of re-querying while the user scrolls lots in the carousel.
- The cache is refreshed only at explicit consistency boundaries, such as a booking conflict or a future manual refresh flow.
- Booking conflicts now trigger a single-location refresh through `public.get_public_location_by_id(...)` and can surface an alternative-lot suggestion without re-querying per carousel change.

Current filter UI is still placeholder-only, but the cache and adapter now accept a filter object so the driver discovery query can stay boundary-scoped once the filter screen is implemented.

## Current Flow

1. User authenticates and gets a `public.users` row.
2. User remains a driver and can use all driver flows.
3. Final publish calls `hostListingPersistenceAdapter.persistListing()`.
4. The adapter upserts the host profile and calls `create_host_listing`.
5. The same `public.users.id` is marked with `is_host = true` and linked to `public.hosts`.
6. The new location is fetched back from Supabase and hydrated into the host store.
7. Hosting Hub fetches owned locations from Supabase.
8. The driver map fetches published active locations from Supabase.
9. The driver pay screen opens a structured payment-method modal and calls `create_booking_transaction` on successful confirm.
10. Place detail reads lot booking windows from the cached driver discovery payload and blocks booking when the selected lot is already reserved for the requested time.
11. If payment fails because the lot was just taken, the app refreshes only that location from Supabase, updates the local cache, and suggests a locally computed alternative lot when available.

## Scope Today

- Create host profile on first publish: implemented
- Create location with lots, availability, and chargers: implemented
- Transaction records on driver booking: implemented
- Cached booking-window availability checks on place detail: implemented
- Boundary-scoped driver discovery cache: implemented
- Hydrate Hosting Hub from Supabase: implemented
- Hydrate public map from Supabase: implemented
- Update existing listings: deferred
- Admin review workflow: deferred, defaults to auto-approved publish

## Deployment Note

Because the transaction schema changed materially, rerun [docs/supabase-hosting.sql](c:/Users/aaavu/Documents/TBD/PP_2026_Project/PP_2026/docs/supabase-hosting.sql) before testing bookings. That adds the new transaction columns, payment-detail table, event log table, and the booking RPCs.