# Payment And Reservation Flow

## Success Path

The driver payment flow writes the booking through `public.create_booking_transaction(...)` from `src/adapters/transactionAdapter.ts`.

After a successful write, `app/(drawer)/driver/pay.tsx` now:

1. Appends the new transaction window into the cached driver discovery payload.
2. Upserts a driver-facing reservation into the persisted driver Zustand store.
3. Resets the explicit arrival-time selection so the next fresh booking starts from `now` again unless the driver picks a new time.
4. Shows a full-screen Lottie success step for 4 seconds.
5. Navigates to `/driver/reservations?openReservationId=<transaction-id>`.
6. Opens the reservation passport in a `LiquidGlassModal`.

The alert-based success confirmation was intentionally removed so the driver lands in a durable reservation surface instead of being sent back to the map without context.

## Booking Time Lifecycle

The driver booking-time behavior is intentionally split between an effective default and an explicit persisted selection.

- `src/lib/bookingTime.ts#getEffectiveBookingStart(...)` returns the current rounded time when the user has not explicitly saved an arrival time.
- `components/time/TimeReg.js` persists the selected arrival time and duration only when the driver confirms in the booking time sheet.
- That persisted selection then flows from Place Detail into Pay, so `Park from` reflects the driver-selected arrival time during the active booking flow.
- Once the booking transaction is successfully created, `resetBookingStartSelection()` clears the explicit selection flag and refreshes the stored start timestamp.

This prevents the last successful booking's arrival time from leaking into the next booking session while preserving the selected time between Place Detail and Pay for the current booking.

## Reservation Screen Architecture

The reservation UI is shared, but the route screens stay separate.

- `components/reservations/ReservationListScreen.tsx` owns reusable tabs, filtering, cards, and passport modal behavior.
- `components/reservations/ReservationPassport.tsx` owns the booking passport presentation.
- `components/reservations/ReservationCountdown.tsx` owns countdown/progress logic without new dependencies.
- `app/(drawer)/driver/reservations.tsx` reads driver-owned reservations from `src/store.js`.
- `app/(drawer)/host/(tabs)/reservations.tsx` reads host-owned transactions from `src/hostStore.js` and maps them into the shared UI shape.

This split is more production-ready than forcing host and driver reservations into one route because the two roles have different data ownership, authorization, and fetch boundaries. Hosts need location/lot/guest context for owned listings. Drivers need only their own booking records. Sharing the presentation layer avoids duplicate UI while keeping the data boundaries explicit.

## Reservation Passport

The passport is opened after payment success and any time a reservation card's `Details` action is pressed.

The passport layout is split into two columns:

- Left side: user-facing reservation details, date/time, lot/location context, total, reference, and countdown/progress.
- Right side: cancel action and edit action.

Cancel and edit are UI entry points only at this stage. The actual cancellation and reservation-edit flows are intentionally deferred to their own backend and policy work.

## Availability And Alternatives

Pay-time booking remains the authoritative consistency boundary. If Supabase rejects a booking because the lot was just taken or marked unavailable, the app refreshes only that location and opens the existing alternative-lot modal when another lot is available for the requested window.