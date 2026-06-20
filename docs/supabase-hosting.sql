create extension if not exists pgcrypto;

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

create index if not exists idx_hosts_host_sub on public.hosts(host_sub);
create index if not exists idx_locations_host_id on public.locations(host_id);
create index if not exists idx_locations_publication on public.locations(publication_status, is_active, published_at desc);
create index if not exists idx_lots_location_id on public.lots(location_id);
create index if not exists idx_lot_availability_windows_lot_id on public.lot_availability_windows(lot_id);
create index if not exists idx_chargers_lot_id on public.chargers(lot_id);

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

grant execute on function public.refresh_user_host_metrics(uuid) to authenticated;
grant execute on function public.upsert_host_profile(text) to authenticated;
grant execute on function public.create_host_listing(jsonb) to authenticated;

grant select on public.hosts to authenticated;
grant select on public.locations to anon, authenticated;
grant select on public.lots to anon, authenticated;
grant select on public.lot_availability_windows to anon, authenticated;
grant select on public.chargers to anon, authenticated;

alter table public.hosts enable row level security;
alter table public.locations enable row level security;
alter table public.lots enable row level security;
alter table public.lot_availability_windows enable row level security;
alter table public.chargers enable row level security;

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