grant usage on schema public to postgres, anon, authenticated, service_role;
grant create on schema public to postgres, service_role;

create extension if not exists pgcrypto;

create extension if not exists btree_gist;

alter table public.users
  add column if not exists is_host boolean not null default false,
  add column if not exists hosted_location_count integer not null default 0;

create table if not exists public.hosts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  host_sub uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.hosts(id) on delete cascade,
  type text not null,
  addr_loc text not null,
  nr_of_lots integer not null check (nr_of_lots > 0),
  hr_price numeric(10,2) not null check (hr_price >= 0),
  loc_name text not null,
  lng double precision,
  lat double precision,
  description text,
  dy_price boolean not null default false,
  img text,
  rating numeric(3,2),
  parking_fee numeric(10,2),
  review_status text not null default 'approved' check (review_status in ('not_required', 'awaiting_review', 'approved', 'rejected')),
  publication_status text not null default 'published' check (publication_status in ('draft', 'awaiting_review', 'published', 'paused', 'archived')),
  is_active boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lots (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  img text,
  rules text,
  lot_nr integer not null check (lot_nr > 0),
  avl_bool boolean not null default true,
  start_avl date,
  end_avl date,
  charger_bool boolean not null default false,
  parking_fee numeric(10,2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (location_id, lot_nr)
);

create table if not exists public.lot_availability_windows (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots(id) on delete cascade,
  day text not null,
  bool boolean not null default true,
  s_t timestamptz,
  e_t timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chargers (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null unique references public.lots(id) on delete cascade,
  charger_nr integer,
  plug_type text not null,
  power numeric(10,2) not null check (power >= 0),
  usage_fee numeric(10,2) not null default 0 check (usage_fee >= 0),
  price_kwh numeric(10,2) not null default 0 check (price_kwh >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  booking_reference text unique,
  lot_id uuid not null references public.lots(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  host_id uuid references public.hosts(id) on delete cascade,
  driver_id uuid not null references public.users(id) on delete cascade,
  driver_name text not null,
  status text not null default 'confirmed',
  booked_at timestamptz not null default timezone('utc', now()),
  start_booking timestamptz not null,
  end_booking timestamptz not null,
  duration_minutes integer,
  currency_code text not null default 'DKK',
  hourly_rate numeric(10,2),
  surge_multiplier numeric(10,4) not null default 1,
  parking_amount numeric(10,2),
  service_fee_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2),
  payment_provider text not null default 'manual',
  payment_method_type text,
  payment_method_label text,
  provider_transaction_id text,
  provider_payment_intent_id text,
  payment_captured_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  agreed_price_hr numeric(10,2) not null check (agreed_price_hr >= 0),
  surge numeric(10,2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.transactions
  add column if not exists booking_reference text,
  add column if not exists location_id uuid references public.locations(id) on delete cascade,
  add column if not exists host_id uuid references public.hosts(id) on delete cascade,
  add column if not exists status text default 'confirmed',
  add column if not exists booked_at timestamptz default timezone('utc', now()),
  add column if not exists duration_minutes integer,
  add column if not exists currency_code text default 'DKK',
  add column if not exists hourly_rate numeric(10,2),
  add column if not exists surge_multiplier numeric(10,4) default 1,
  add column if not exists parking_amount numeric(10,2),
  add column if not exists service_fee_amount numeric(10,2) default 0,
  add column if not exists total_amount numeric(10,2),
  add column if not exists payment_provider text default 'manual',
  add column if not exists payment_method_type text,
  add column if not exists payment_method_label text,
  add column if not exists provider_transaction_id text,
  add column if not exists provider_payment_intent_id text,
  add column if not exists payment_captured_at timestamptz,
  add column if not exists metadata jsonb default '{}'::jsonb;

update public.transactions transaction_row
set
  booking_reference = coalesce(transaction_row.booking_reference, concat('BK-', upper(substr(replace(transaction_row.id::text, '-', ''), 1, 12)))),
  location_id = coalesce(transaction_row.location_id, lot.location_id),
  host_id = coalesce(transaction_row.host_id, location.host_id),
  status = coalesce(transaction_row.status, 'confirmed'),
  booked_at = coalesce(transaction_row.booked_at, transaction_row.created_at, timezone('utc', now())),
  duration_minutes = coalesce(transaction_row.duration_minutes, greatest(1, floor(extract(epoch from (transaction_row.end_booking - transaction_row.start_booking)) / 60)::integer)),
  currency_code = coalesce(nullif(transaction_row.currency_code, ''), 'DKK'),
  hourly_rate = coalesce(transaction_row.hourly_rate, transaction_row.agreed_price_hr),
  surge_multiplier = coalesce(transaction_row.surge_multiplier, 1),
  parking_amount = coalesce(transaction_row.parking_amount, transaction_row.agreed_price_hr),
  service_fee_amount = coalesce(transaction_row.service_fee_amount, 0),
  total_amount = coalesce(transaction_row.total_amount, transaction_row.agreed_price_hr),
  payment_provider = coalesce(nullif(transaction_row.payment_provider, ''), 'manual'),
  payment_method_type = coalesce(nullif(transaction_row.payment_method_type, ''), 'card'),
  payment_method_label = coalesce(nullif(transaction_row.payment_method_label, ''), 'Card'),
  payment_captured_at = coalesce(transaction_row.payment_captured_at, transaction_row.created_at, timezone('utc', now())),
  metadata = coalesce(transaction_row.metadata, '{}'::jsonb)
from public.lots lot
join public.locations location on location.id = lot.location_id
where lot.id = transaction_row.lot_id;

alter table public.transactions
  alter column booking_reference set default concat('BK-', upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  alter column status set default 'confirmed',
  alter column booked_at set default timezone('utc', now()),
  alter column currency_code set default 'DKK',
  alter column surge_multiplier set default 1,
  alter column service_fee_amount set default 0,
  alter column payment_provider set default 'manual',
  alter column metadata set default '{}'::jsonb;

create table if not exists public.transaction_payment_details (
  transaction_id uuid primary key references public.transactions(id) on delete cascade,
  payment_method_type text not null,
  display_label text not null,
  wallet_provider text,
  card_brand text,
  card_last4 text,
  card_exp_month integer,
  card_exp_year integer,
  cardholder_name text,
  mobilepay_phone_last4 text,
  mobilepay_profile_name text,
  provider_customer_id text,
  provider_payment_method_id text,
  billing_country text,
  fingerprint text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transaction_events (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  event_type text not null,
  event_source text not null default 'system',
  event_status text not null,
  actor_user_id uuid references public.users(id) on delete set null,
  occurred_at timestamptz not null default timezone('utc', now()),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_hosts_host_sub on public.hosts(host_sub);
create index if not exists idx_locations_host_id on public.locations(host_id);
create index if not exists idx_locations_publication on public.locations(publication_status, is_active, published_at desc);
create index if not exists idx_lots_location_id on public.lots(location_id);
create index if not exists idx_lot_availability_windows_lot_id on public.lot_availability_windows(lot_id);
create index if not exists idx_chargers_lot_id on public.chargers(lot_id);
create index if not exists idx_transactions_lot_id on public.transactions(lot_id);
create index if not exists idx_transactions_driver_id on public.transactions(driver_id);
create index if not exists idx_transactions_host_id on public.transactions(host_id);
create index if not exists idx_transactions_booking_window on public.transactions(lot_id, start_booking, end_booking);
create index if not exists idx_transactions_status_dates on public.transactions(status, start_booking, end_booking);
create index if not exists idx_transactions_booked_at on public.transactions(booked_at desc);
create index if not exists idx_transaction_events_transaction_id on public.transaction_events(transaction_id, occurred_at desc);

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

drop trigger if exists hosts_set_updated_at on public.hosts;
create trigger hosts_set_updated_at
before update on public.hosts
for each row
execute function public.set_updated_at();

drop trigger if exists locations_set_updated_at on public.locations;
create trigger locations_set_updated_at
before update on public.locations
for each row
execute function public.set_updated_at();

drop trigger if exists lots_set_updated_at on public.lots;
create trigger lots_set_updated_at
before update on public.lots
for each row
execute function public.set_updated_at();

drop trigger if exists lot_availability_windows_set_updated_at on public.lot_availability_windows;
create trigger lot_availability_windows_set_updated_at
before update on public.lot_availability_windows
for each row
execute function public.set_updated_at();

drop trigger if exists chargers_set_updated_at on public.chargers;
create trigger chargers_set_updated_at
before update on public.chargers
for each row
execute function public.set_updated_at();

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at
before update on public.transactions
for each row
execute function public.set_updated_at();

drop trigger if exists transaction_payment_details_set_updated_at on public.transaction_payment_details;
create trigger transaction_payment_details_set_updated_at
before update on public.transaction_payment_details
for each row
execute function public.set_updated_at();

create or replace function public.refresh_user_host_metrics(input_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  location_count integer;
begin
  select count(*)::integer
  into location_count
  from public.locations location
  join public.hosts host on host.id = location.host_id
  where host.user_id = input_user_id;

  update public.users
  set
    is_host = location_count > 0,
    hosted_location_count = location_count,
    updated_at = timezone('utc', now())
  where id = input_user_id;
end;
$$;

create or replace function public.upsert_host_profile(input_display_name text default null)
returns public.hosts
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_user_id uuid := auth.uid();
  resolved_display_name text;
  result_host public.hosts;
begin
  if auth_user_id is null then
    raise exception 'Authentication required.';
  end if;

  select coalesce(
    nullif(trim(input_display_name), ''),
    nullif(trim(display_name), ''),
    'Host'
  )
  into resolved_display_name
  from public.users
  where id = auth_user_id;

  resolved_display_name := coalesce(resolved_display_name, 'Host');

  insert into public.hosts (user_id, host_sub, display_name)
  values (auth_user_id, auth_user_id, resolved_display_name)
  on conflict (user_id)
  do update
    set display_name = excluded.display_name,
        updated_at = timezone('utc', now())
  returning * into result_host;

  update public.users
  set
    is_host = true,
    display_name = coalesce(nullif(trim(public.users.display_name), ''), resolved_display_name),
    updated_at = timezone('utc', now())
  where id = auth_user_id;

  perform public.refresh_user_host_metrics(auth_user_id);

  return result_host;
end;
$$;

create or replace function public.create_host_listing(input_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_user_id uuid := auth.uid();
  host_row public.hosts;
  location_payload jsonb := coalesce(input_payload->'location', '{}'::jsonb);
  lot_payload jsonb;
  availability_payload jsonb;
  location_row public.locations;
  lot_row public.lots;
begin
  if auth_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if input_payload is null then
    raise exception 'Listing payload is required.';
  end if;

  if nullif(trim(location_payload->>'addr_loc'), '') is null then
    raise exception 'Location address is required.';
  end if;

  if nullif(trim(location_payload->>'loc_name'), '') is null then
    raise exception 'Location name is required.';
  end if;

  if coalesce(jsonb_array_length(coalesce(input_payload->'lots', '[]'::jsonb)), 0) = 0 then
    raise exception 'At least one lot is required.';
  end if;

  host_row := public.upsert_host_profile(null);

  insert into public.locations (
    host_id,
    type,
    addr_loc,
    nr_of_lots,
    hr_price,
    loc_name,
    lng,
    lat,
    description,
    dy_price,
    img,
    rating,
    is_active,
    review_status,
    publication_status,
    published_at,
    parking_fee
  )
  values (
    host_row.id,
    coalesce(nullif(trim(location_payload->>'type'), ''), 'Open space'),
    trim(location_payload->>'addr_loc'),
    greatest(coalesce(nullif(location_payload->>'nr_of_lots', '')::integer, 1), 1),
    coalesce(nullif(location_payload->>'hr_price', '')::numeric, 0),
    trim(location_payload->>'loc_name'),
    nullif(location_payload->>'lng', '')::double precision,
    nullif(location_payload->>'lat', '')::double precision,
    nullif(trim(location_payload->>'description'), ''),
    coalesce((location_payload->>'dy_price')::boolean, false),
    nullif(trim(location_payload->>'img'), ''),
    nullif(location_payload->>'rating', '')::numeric,
    coalesce((location_payload->>'is_active')::boolean, true),
    'approved',
    'published',
    timezone('utc', now()),
    coalesce(nullif(location_payload->>'parking_fee', '')::numeric, nullif(location_payload->>'hr_price', '')::numeric, 0)
  )
  returning * into location_row;

  for lot_payload in
    select value
    from jsonb_array_elements(coalesce(input_payload->'lots', '[]'::jsonb))
  loop
    insert into public.lots (
      location_id,
      img,
      rules,
      lot_nr,
      avl_bool,
      start_avl,
      end_avl,
      charger_bool,
      parking_fee
    )
    values (
      location_row.id,
      nullif(trim(lot_payload->>'img'), ''),
      nullif(trim(lot_payload->>'rules'), ''),
      greatest(coalesce(nullif(lot_payload->>'lot_nr', '')::integer, 1), 1),
      coalesce((lot_payload->>'avl_bool')::boolean, true),
      nullif(lot_payload->>'start_avl', '')::date,
      nullif(lot_payload->>'end_avl', '')::date,
      coalesce((lot_payload->>'charger_bool')::boolean, false),
      coalesce(nullif(lot_payload->>'parking_fee', '')::numeric, 0)
    )
    returning * into lot_row;

    for availability_payload in
      select value
      from jsonb_array_elements(coalesce(lot_payload->'availability', '[]'::jsonb))
    loop
      insert into public.lot_availability_windows (
        lot_id,
        day,
        bool,
        s_t,
        e_t
      )
      values (
        lot_row.id,
        coalesce(nullif(trim(availability_payload->>'day'), ''), 'Monday'),
        coalesce((availability_payload->>'bool')::boolean, false),
        nullif(availability_payload->>'s_t', '')::timestamptz,
        nullif(availability_payload->>'e_t', '')::timestamptz
      );
    end loop;

    if jsonb_typeof(lot_payload->'charger') = 'object'
      and nullif(trim(lot_payload->'charger'->>'plug_type'), '') is not null then
      insert into public.chargers (
        lot_id,
        charger_nr,
        plug_type,
        power,
        usage_fee,
        price_kwh
      )
      values (
        lot_row.id,
        nullif(lot_payload->'charger'->>'charger_nr', '')::integer,
        trim(lot_payload->'charger'->>'plug_type'),
        coalesce(nullif(lot_payload->'charger'->>'power', '')::numeric, 0),
        coalesce(nullif(lot_payload->'charger'->>'usage_fee', '')::numeric, 0),
        coalesce(nullif(lot_payload->'charger'->>'price_kwh', '')::numeric, 0)
      );
    end if;
  end loop;

  perform public.refresh_user_host_metrics(auth_user_id);

  return location_row.id;
end;
$$;

create or replace function public.get_lot_booking_windows(
  input_lot_id uuid,
  input_window_start timestamptz default null,
  input_window_end timestamptz default null
)
returns table (
  transaction_id uuid,
  lot_id uuid,
  start_booking timestamptz,
  end_booking timestamptz,
  status text
)
language sql
security definer
set search_path = public
as $$
  select
    transaction_row.id as transaction_id,
    transaction_row.lot_id,
    transaction_row.start_booking,
    transaction_row.end_booking,
    transaction_row.status
  from public.transactions transaction_row
  join public.lots lot on lot.id = transaction_row.lot_id
  join public.locations location on location.id = lot.location_id
  where transaction_row.lot_id = input_lot_id
    and transaction_row.status in ('pending_payment', 'confirmed')
    and location.publication_status = 'published'
    and location.is_active = true
    and (input_window_start is null or transaction_row.end_booking > input_window_start)
    and (input_window_end is null or transaction_row.start_booking < input_window_end)
  order by transaction_row.start_booking asc;
$$;

create or replace function public.create_booking_transaction(input_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_user_id uuid := auth.uid();
  input_lot_id uuid := nullif(input_payload->>'lot_id', '')::uuid;
  input_start_booking timestamptz := nullif(input_payload->>'start_booking', '')::timestamptz;
  input_end_booking timestamptz := nullif(input_payload->>'end_booking', '')::timestamptz;
  input_currency_code text := upper(coalesce(nullif(trim(input_payload->>'currency_code'), ''), 'DKK'));
  input_service_fee_rate numeric := greatest(coalesce(nullif(input_payload->>'service_fee_rate', '')::numeric, 0.07), 0);
  input_surge_multiplier numeric := greatest(coalesce(nullif(input_payload->>'surge_multiplier', '')::numeric, 1), 0.01);
  payment_payload jsonb := coalesce(input_payload->'payment_method', '{}'::jsonb);
  payment_method_type text := coalesce(nullif(trim(payment_payload->>'method_type'), ''), 'card');
  payment_method_label text := coalesce(nullif(trim(payment_payload->>'label'), ''), 'Card');
  payment_provider text := coalesce(nullif(trim(payment_payload->>'provider'), ''), 'manual');
  input_metadata jsonb := coalesce(input_payload->'metadata', '{}'::jsonb);
  driver_row public.users;
  lot_row public.lots;
  location_row public.locations;
  overlapping_end timestamptz;
  duration_minutes integer;
  effective_hourly_rate numeric(10,2);
  parking_amount numeric(10,2);
  service_fee_amount numeric(10,2);
  total_amount numeric(10,2);
  transaction_row public.transactions;
begin
  if auth_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if input_payload is null then
    raise exception 'Booking payload is required.';
  end if;

  if input_lot_id is null then
    raise exception 'Lot id is required.';
  end if;

  if input_start_booking is null or input_end_booking is null then
    raise exception 'Booking start and end are required.';
  end if;

  if input_end_booking <= input_start_booking then
    raise exception 'Booking end must be after booking start.';
  end if;

  if payment_method_type not in ('apple_pay', 'mobilepay', 'card') then
    raise exception 'Unsupported payment method.';
  end if;

  select *
  into driver_row
  from public.users
  where id = auth_user_id;

  if not found then
    raise exception 'User profile is missing.';
  end if;

  select lot.*
  into lot_row
  from public.lots lot
  where lot.id = input_lot_id
  for update;

  if not found then
    raise exception 'Lot not found.';
  end if;

  select location.*
  into location_row
  from public.locations location
  where location.id = lot_row.location_id;

  if not found or location_row.publication_status <> 'published' or location_row.is_active is not true then
    raise exception 'Lot is not bookable.';
  end if;

  if lot_row.avl_bool is not true then
    raise exception 'Lot is not available for booking.';
  end if;

  select max(existing.end_booking)
  into overlapping_end
  from public.transactions existing
  where existing.lot_id = input_lot_id
    and existing.status in ('pending_payment', 'confirmed')
    and input_start_booking < existing.end_booking
    and input_end_booking > existing.start_booking;

  if overlapping_end is not null then
    raise exception 'Lot is already booked for that time. It becomes available again at %.', overlapping_end;
  end if;

  duration_minutes := greatest(1, floor(extract(epoch from (input_end_booking - input_start_booking)) / 60)::integer);
  effective_hourly_rate := coalesce(lot_row.parking_fee, location_row.hr_price, 0);
  parking_amount := round((effective_hourly_rate * (duration_minutes::numeric / 60) * input_surge_multiplier)::numeric, 2);
  service_fee_amount := round((parking_amount * input_service_fee_rate)::numeric, 2);
  total_amount := round((parking_amount + service_fee_amount)::numeric, 2);

  insert into public.transactions (
    lot_id,
    location_id,
    host_id,
    driver_id,
    driver_name,
    status,
    booked_at,
    start_booking,
    end_booking,
    duration_minutes,
    currency_code,
    hourly_rate,
    surge_multiplier,
    parking_amount,
    service_fee_amount,
    total_amount,
    payment_provider,
    payment_method_type,
    payment_method_label,
    provider_transaction_id,
    provider_payment_intent_id,
    payment_captured_at,
    agreed_price_hr,
    surge,
    metadata
  )
  values (
    lot_row.id,
    location_row.id,
    location_row.host_id,
    auth_user_id,
    coalesce(nullif(trim(driver_row.display_name), ''), nullif(trim(driver_row.email), ''), nullif(trim(driver_row.phone), ''), 'Driver'),
    'confirmed',
    timezone('utc', now()),
    input_start_booking,
    input_end_booking,
    duration_minutes,
    input_currency_code,
    effective_hourly_rate,
    input_surge_multiplier,
    parking_amount,
    service_fee_amount,
    total_amount,
    payment_provider,
    payment_method_type,
    payment_method_label,
    nullif(trim(payment_payload->>'provider_transaction_id'), ''),
    nullif(trim(payment_payload->>'provider_payment_intent_id'), ''),
    timezone('utc', now()),
    effective_hourly_rate,
    nullif(input_surge_multiplier, 1),
    input_metadata
  )
  returning * into transaction_row;

  insert into public.transaction_payment_details (
    transaction_id,
    payment_method_type,
    display_label,
    wallet_provider,
    card_brand,
    card_last4,
    card_exp_month,
    card_exp_year,
    cardholder_name,
    mobilepay_phone_last4,
    mobilepay_profile_name,
    provider_customer_id,
    provider_payment_method_id,
    billing_country,
    fingerprint,
    metadata
  )
  values (
    transaction_row.id,
    payment_method_type,
    payment_method_label,
    nullif(trim(payment_payload->>'wallet_provider'), ''),
    nullif(trim(payment_payload->>'card_brand'), ''),
    nullif(trim(payment_payload->>'card_last4'), ''),
    nullif(payment_payload->>'card_exp_month', '')::integer,
    nullif(payment_payload->>'card_exp_year', '')::integer,
    nullif(trim(payment_payload->>'cardholder_name'), ''),
    nullif(trim(payment_payload->>'mobilepay_phone_last4'), ''),
    nullif(trim(payment_payload->>'mobilepay_profile_name'), ''),
    nullif(trim(payment_payload->>'provider_customer_id'), ''),
    nullif(trim(payment_payload->>'provider_payment_method_id'), ''),
    nullif(trim(payment_payload->>'billing_country'), ''),
    nullif(trim(payment_payload->>'fingerprint'), ''),
    coalesce(payment_payload->'metadata', '{}'::jsonb)
  );

  insert into public.transaction_events (
    transaction_id,
    event_type,
    event_source,
    event_status,
    actor_user_id,
    occurred_at,
    payload
  )
  values (
    transaction_row.id,
    'payment_captured',
    'app',
    transaction_row.status,
    auth_user_id,
    timezone('utc', now()),
    jsonb_build_object(
      'booking_reference', transaction_row.booking_reference,
      'lot_id', transaction_row.lot_id,
      'payment_method_type', payment_method_type,
      'payment_method_label', payment_method_label,
      'total_amount', total_amount,
      'currency_code', input_currency_code
    )
  );

  return jsonb_build_object(
    'id', transaction_row.id,
    'booking_reference', transaction_row.booking_reference,
    'lot_id', transaction_row.lot_id,
    'location_id', transaction_row.location_id,
    'host_id', transaction_row.host_id,
    'driver_id', transaction_row.driver_id,
    'driver_name', transaction_row.driver_name,
    'status', transaction_row.status,
    'booked_at', transaction_row.booked_at,
    'start_booking', transaction_row.start_booking,
    'end_booking', transaction_row.end_booking,
    'duration_minutes', transaction_row.duration_minutes,
    'currency_code', transaction_row.currency_code,
    'hourly_rate', transaction_row.hourly_rate,
    'surge_multiplier', transaction_row.surge_multiplier,
    'parking_amount', transaction_row.parking_amount,
    'service_fee_amount', transaction_row.service_fee_amount,
    'total_amount', transaction_row.total_amount,
    'payment_method_type', transaction_row.payment_method_type,
    'payment_method_label', transaction_row.payment_method_label,
    'payment_provider', transaction_row.payment_provider,
    'payment_captured_at', transaction_row.payment_captured_at
  );
end;
$$;

grant execute on function public.refresh_user_host_metrics(uuid) to authenticated;
grant execute on function public.upsert_host_profile(text) to authenticated;
grant execute on function public.create_host_listing(jsonb) to authenticated;
grant execute on function public.get_lot_booking_windows(uuid, timestamptz, timestamptz) to anon, authenticated;
grant execute on function public.create_booking_transaction(jsonb) to authenticated;

grant select on public.hosts to authenticated;
grant select on public.locations to anon, authenticated;
grant select on public.lots to anon, authenticated;
grant select on public.lot_availability_windows to anon, authenticated;
grant select on public.chargers to anon, authenticated;
grant select, insert, update on public.transactions to authenticated;
grant select on public.transaction_payment_details to authenticated;
grant select on public.transaction_events to authenticated;

alter table public.hosts enable row level security;
alter table public.locations enable row level security;
alter table public.lots enable row level security;
alter table public.lot_availability_windows enable row level security;
alter table public.chargers enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_payment_details enable row level security;
alter table public.transaction_events enable row level security;

drop policy if exists "Hosts can read own profile" on public.hosts;
create policy "Hosts can read own profile"
on public.hosts
for select
to authenticated
using (host_sub = auth.uid());

drop policy if exists "Hosts can insert own profile" on public.hosts;
create policy "Hosts can insert own profile"
on public.hosts
for insert
to authenticated
with check (host_sub = auth.uid() and user_id = auth.uid());

drop policy if exists "Hosts can update own profile" on public.hosts;
create policy "Hosts can update own profile"
on public.hosts
for update
to authenticated
using (host_sub = auth.uid())
with check (host_sub = auth.uid() and user_id = auth.uid());

drop policy if exists "Published locations are readable" on public.locations;
create policy "Published locations are readable"
on public.locations
for select
to anon, authenticated
using (publication_status = 'published');

drop policy if exists "Hosts can read own locations" on public.locations;
create policy "Hosts can read own locations"
on public.locations
for select
to authenticated
using (
  exists (
    select 1
    from public.hosts host
    where host.id = locations.host_id and host.host_sub = auth.uid()
  )
);

drop policy if exists "Hosts can insert own locations" on public.locations;
create policy "Hosts can insert own locations"
on public.locations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.hosts host
    where host.id = locations.host_id and host.host_sub = auth.uid()
  )
);

drop policy if exists "Hosts can update own locations" on public.locations;
create policy "Hosts can update own locations"
on public.locations
for update
to authenticated
using (
  exists (
    select 1
    from public.hosts host
    where host.id = locations.host_id and host.host_sub = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.hosts host
    where host.id = locations.host_id and host.host_sub = auth.uid()
  )
);

drop policy if exists "Published lots are readable" on public.lots;
create policy "Published lots are readable"
on public.lots
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.locations location
    where location.id = lots.location_id and location.publication_status = 'published'
  )
);

drop policy if exists "Hosts can manage own lots" on public.lots;
create policy "Hosts can manage own lots"
on public.lots
for all
to authenticated
using (
  exists (
    select 1
    from public.locations location
    join public.hosts host on host.id = location.host_id
    where location.id = lots.location_id and host.host_sub = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.locations location
    join public.hosts host on host.id = location.host_id
    where location.id = lots.location_id and host.host_sub = auth.uid()
  )
);

drop policy if exists "Published availability is readable" on public.lot_availability_windows;
create policy "Published availability is readable"
on public.lot_availability_windows
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.lots lot
    join public.locations location on location.id = lot.location_id
    where lot.id = lot_availability_windows.lot_id and location.publication_status = 'published'
  )
);

drop policy if exists "Hosts can manage own availability" on public.lot_availability_windows;
create policy "Hosts can manage own availability"
on public.lot_availability_windows
for all
to authenticated
using (
  exists (
    select 1
    from public.lots lot
    join public.locations location on location.id = lot.location_id
    join public.hosts host on host.id = location.host_id
    where lot.id = lot_availability_windows.lot_id and host.host_sub = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lots lot
    join public.locations location on location.id = lot.location_id
    join public.hosts host on host.id = location.host_id
    where lot.id = lot_availability_windows.lot_id and host.host_sub = auth.uid()
  )
);

drop policy if exists "Published chargers are readable" on public.chargers;
create policy "Published chargers are readable"
on public.chargers
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.lots lot
    join public.locations location on location.id = lot.location_id
    where lot.id = chargers.lot_id and location.publication_status = 'published'
  )
);

drop policy if exists "Hosts can manage own chargers" on public.chargers;
create policy "Hosts can manage own chargers"
on public.chargers
for all
to authenticated
using (
  exists (
    select 1
    from public.lots lot
    join public.locations location on location.id = lot.location_id
    join public.hosts host on host.id = location.host_id
    where lot.id = chargers.lot_id and host.host_sub = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lots lot
    join public.locations location on location.id = lot.location_id
    join public.hosts host on host.id = location.host_id
    where lot.id = chargers.lot_id and host.host_sub = auth.uid()
  )
);

drop policy if exists "Drivers can read own transactions" on public.transactions;
create policy "Drivers can read own transactions"
on public.transactions
for select
to authenticated
using (driver_id = auth.uid());

drop policy if exists "Drivers can create own transactions" on public.transactions;
create policy "Drivers can create own transactions"
on public.transactions
for insert
to authenticated
with check (driver_id = auth.uid());

drop policy if exists "Drivers can update own transactions" on public.transactions;
create policy "Drivers can update own transactions"
on public.transactions
for update
to authenticated
using (driver_id = auth.uid())
with check (driver_id = auth.uid());

drop policy if exists "Hosts can read location transactions" on public.transactions;
create policy "Hosts can read location transactions"
on public.transactions
for select
to authenticated
using (
  exists (
    select 1
    from public.lots lot
    join public.locations location on location.id = lot.location_id
    join public.hosts host on host.id = location.host_id
    where lot.id = transactions.lot_id and host.host_sub = auth.uid()
  )
);

drop policy if exists "Drivers can read own payment details" on public.transaction_payment_details;
create policy "Drivers can read own payment details"
on public.transaction_payment_details
for select
to authenticated
using (
  exists (
    select 1
    from public.transactions transaction_row
    where transaction_row.id = transaction_payment_details.transaction_id
      and transaction_row.driver_id = auth.uid()
  )
);

drop policy if exists "Hosts can read location payment details" on public.transaction_payment_details;
create policy "Hosts can read location payment details"
on public.transaction_payment_details
for select
to authenticated
using (
  exists (
    select 1
    from public.transactions transaction_row
    join public.hosts host on host.id = transaction_row.host_id
    where transaction_row.id = transaction_payment_details.transaction_id
      and host.host_sub = auth.uid()
  )
);

drop policy if exists "Drivers can read own transaction events" on public.transaction_events;
create policy "Drivers can read own transaction events"
on public.transaction_events
for select
to authenticated
using (
  exists (
    select 1
    from public.transactions transaction_row
    where transaction_row.id = transaction_events.transaction_id
      and transaction_row.driver_id = auth.uid()
  )
);

drop policy if exists "Hosts can read location transaction events" on public.transaction_events;
create policy "Hosts can read location transaction events"
on public.transaction_events
for select
to authenticated
using (
  exists (
    select 1
    from public.transactions transaction_row
    join public.hosts host on host.id = transaction_row.host_id
    where transaction_row.id = transaction_events.transaction_id
      and host.host_sub = auth.uid()
  )
);