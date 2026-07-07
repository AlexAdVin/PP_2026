# Supabase Auth Setup

This app now uses Supabase Auth as the primary identity system, with a modular client-side flow that currently supports:

- Single-entry email-or-phone authentication
- Passwordless OTP verification for email and phone
- Password fallback for returning email users only
- Sign in with Apple

The auth UI is mounted once at the app root and rendered inside the shared glass modal component. Today it is triggered by the unauthenticated search gate after 3 completed searches. The implementation is structured so Google or other providers can be added by extending the provider config and auth flow component.

The flow is now identity led and step based. It starts with one field only: email or phone. The app detects whether the identity already exists and adapts automatically into sign-in or sign-up without asking the user to choose first. Future providers should follow the same one-input-per-slide pattern.

The authenticated user is always the driver identity in the product. Hosting is additive: when that same authenticated user successfully publishes a listing, the backend also creates a host profile tied to the same `auth.users.id`.

## Environment Variables

Set these in the Expo runtime environment:

```env
EXPO_PUBLIC_SUPABASE_URL=https://qwycvzzozafyzyutvifj.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your_publishable_key
```

## Required Packages

Installed in the app:

```bash
npm install @supabase/supabase-js expo-apple-authentication expo-crypto lottie-react-native
```

## Minimal User Table

The existing GraphQL model uses `Driver` as the user-facing entity. For Supabase, the app now writes a minimal relational `users` table aligned to that concept and keyed by `auth.users.id`.

Run the full SQL command from [docs/supabase-users.sql](c:/Users/aaavu/Documents/TBD/PP_2026_Project/PP_2026/docs/supabase-users.sql) in the Supabase SQL Editor. It creates the table if it does not exist, enables RLS, and adds a trigger that mirrors confirmed `auth.users` records into `public.users`.

```sql
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  email text unique,
  display_name text,
  auth_provider text not null default 'phone',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();
```

For production, prefer the dedicated SQL script instead of manually pasting partial snippets, because the database-side sync trigger remains the durable mirror into `public.users`.

If you ever run `drop schema public cascade; create schema public;`, you also remove the default Supabase grants on the `public` schema. Re-run [docs/supabase-users.sql](c:/Users/aaavu/Documents/TBD/PP_2026_Project/PP_2026/docs/supabase-users.sql) afterward so schema usage is granted back to `anon`, `authenticated`, and `service_role` before testing the app again.

The `users` table also needs table-level grants in addition to RLS policies. The script now grants `select`, `insert`, and `update` on `public.users` to `authenticated`, because the mobile app reads and upserts the current driver's own profile before any host row exists.

Session hydration now treats `public.users` as a mirror that may already be populated by the database trigger. On app start and after auth state changes, the client first reads `public.users` by `auth.users.id` before attempting an upsert. If a legacy row still causes a `23505` uniqueness conflict on `users_phone_key` or `users_email_key`, the app falls back to a session-derived in-memory profile instead of failing auth bootstrap.

That safeguard prevents login restore from breaking, but it does not repair stale duplicate identity rows in Supabase. If you still see repeated uniqueness conflicts in logs, clean up the conflicting `public.users` records so phone and email ownership matches the canonical `auth.users.id`.

## Row Level Security

```sql
alter table public.users enable row level security;

create policy "Users can read own profile"
on public.users
for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.users
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
```

## Supabase Dashboard Configuration

### Phone OTP

1. Enable Phone in Auth > Providers.
2. Configure an SMS provider in Supabase.
3. Set production SMS templates and rate limits.
4. Add test phone numbers only in non-production environments.

### Email OTP / Magic Link

1. Enable Email in Auth > Providers.
2. Enable email OTP if you want in-app code entry. Magic link also works, but OTP is the default UX assumed by the mobile flow.
3. Disable mandatory email confirmation if you want immediate sign-up completion in-app.
4. The app uses a single entry field, auto-detects existing users through the identity lookup RPC, then sends OTP by default.
5. Returning email users can switch to password only as a fallback path.
6. New users verify first, then provide only a required name. Optional password setup is deferred to a separate step.
7. Newly authenticated users are written into `public.users` by the SQL trigger from [docs/supabase-users.sql](c:/Users/aaavu/Documents/TBD/PP_2026_Project/PP_2026/docs/supabase-users.sql) and refreshed client-side after the session is established.

### Apple Sign-In

1. Enable Apple in Auth > Providers.
2. Configure Service ID, Team ID, Key ID, and private key in Supabase.
3. Add the exact iOS bundle identifier used by Expo/EAS.
4. In Expo config, enable `ios.usesAppleSignIn` and include the `expo-apple-authentication` plugin.
5. Rebuild the iOS app after enabling the capability so the entitlement is present.
6. Test on a physical iOS device because Apple auth is not available on Android.

If Face ID succeeds but Supabase returns `Provider (issuer "https://appleid.apple.com") is not enabled`, the device-side Apple login is already working. The missing piece is the Supabase Apple provider configuration.

## App Architecture

- `src/lib/supabase.ts`: singleton Supabase client with AsyncStorage-backed session persistence.
- `src/store/authStore.ts`: global auth runtime state, modal control, and session hydration.
- `src/adapters/authIdentityAdapter.ts`: parses the single entry field and performs anonymous identity lookup through Supabase RPC.
- `src/adapters/userProfileAdapter.ts`: upsert/read boundary for the `users` table.
- `src/adapters/authSearchGateAdapter.ts`: unauthenticated search-count persistence.
- `components/auth/AuthFlowScreen.tsx`: provider-agnostic auth stepper UI.
- `components/auth/AuthModalHost.tsx`: renders the auth flow inside `LiquidGlassModal`.
- `components/auth/SignOutButton.tsx`: shared sign-out control reused by the drawer and profile screen.

The app still upserts the signed-in session profile client-side as an idempotent safety net, while the database trigger remains the primary server-side sync path.

That safety net is intentionally defensive now: `src/adapters/userProfileAdapter.ts` reads first, only writes when needed, and degrades to the active Supabase session payload if an old uniqueness conflict prevents `public.users` from being refreshed immediately.

## Hosting Setup

Hosting now has its own Supabase schema and adapters. After the base users script is in place, run [docs/supabase-hosting.sql](c:/Users/aaavu/Documents/TBD/PP_2026_Project/PP_2026/docs/supabase-hosting.sql) and follow [docs/SUPABASE_HOSTING_SETUP.md](c:/Users/aaavu/Documents/TBD/PP_2026_Project/PP_2026/docs/SUPABASE_HOSTING_SETUP.md).

## Modal Trigger Rules

- Search gate: unauthenticated users can complete 3 searches; the 4th search attempt opens the auth modal.
- Profile passport: pressing the passport header while signed out opens the auth modal.
- Pay confirmation: signed-out users can browse and reach the pay screen, but pressing Confirm and pay opens the auth modal.
- Hosting drawer entry: pressing Hosting Home while signed out opens the hosting intro slides first; when the user finishes or skips those slides, the auth modal opens.
- Sign-out is available from both the custom drawer and the profile screen through the same reusable button component.

## Current Trigger Rule

- Unauthenticated users can complete 3 searches.
- On the 4th search attempt, the auth modal is shown.
- After successful authentication, the blocked search resumes automatically.
- The default path is a single email-or-phone input plus passwordless OTP.
- Password appears only as a fallback for returning email accounts.
- Apple sign-in remains available as an optional SSO path.
- The auth footer stays above the keyboard while the user is typing.

## Step-by-Step Flow

1. Entry: one field for email or phone, plus optional SSO.
2. Adaptive lookup: the app calls `public.lookup_auth_identity()` through `authIdentityAdapter`.
3. Returning user: send OTP immediately, then allow password fallback only if the identity is an email.
4. New user: send OTP immediately, verify, then ask for required name only.
5. Optional password: available after the required name step, but skipped by default.
6. Success: play the Lottie confirmation and route back to the trigger surface.

If the lookup RPC has not been deployed yet, the flow still works. It falls back to OTP-first behavior and decides whether onboarding is needed after verification by inspecting the signed-in profile.

## Security Notes

- OTP is the primary mobile sign-in path for both email and phone.
- Password is never shown up front and is only offered after account detection for returning email users.
- The lookup RPC exposes only whether an identity exists, not profile data.
- Passkeys and MFA should be added behind separate capability adapters when native mobile support is wired in.

## Next Extensions

These can be added without changing the mounted modal host pattern:

- Google sign-in
- Host profile binding
- Location ownership relations
- Transactions linked to `users.id`
- Server-side onboarding flags and profile completion