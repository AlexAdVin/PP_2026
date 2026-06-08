create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  email text unique,
  display_name text,
  auth_provider text not null default 'email',
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

create or replace function public.sync_auth_user_to_public_users()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_display_name text;
  derived_provider text;
begin
  derived_display_name := coalesce(
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    new.email,
    new.phone
  );

  derived_provider := coalesce(
    new.raw_app_meta_data ->> 'provider',
    case
      when new.email is not null then 'email'
      when new.phone is not null then 'phone'
      else 'email'
    end
  );

  if tg_op = 'INSERT' then
    if new.email_confirmed_at is not null or new.phone_confirmed_at is not null then
      insert into public.users (id, phone, email, display_name, auth_provider)
      values (new.id, new.phone, new.email, derived_display_name, derived_provider)
      on conflict (id) do update
      set
        phone = excluded.phone,
        email = excluded.email,
        display_name = excluded.display_name,
        auth_provider = excluded.auth_provider;
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.email_confirmed_at is not null or new.phone_confirmed_at is not null then
      insert into public.users (id, phone, email, display_name, auth_provider)
      values (new.id, new.phone, new.email, derived_display_name, derived_provider)
      on conflict (id) do update
      set
        phone = excluded.phone,
        email = excluded.email,
        display_name = excluded.display_name,
        auth_provider = excluded.auth_provider;
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_synced_to_public_users on auth.users;

create trigger on_auth_user_synced_to_public_users
after insert or update on auth.users
for each row
execute function public.sync_auth_user_to_public_users();

insert into public.users (id, phone, email, display_name, auth_provider)
select
  au.id,
  au.phone,
  au.email,
  coalesce(
    au.raw_user_meta_data ->> 'display_name',
    au.raw_user_meta_data ->> 'full_name',
    au.raw_user_meta_data ->> 'name',
    au.email,
    au.phone
  ) as display_name,
  coalesce(
    au.raw_app_meta_data ->> 'provider',
    case
      when au.email is not null then 'email'
      when au.phone is not null then 'phone'
      else 'email'
    end
  ) as auth_provider
from auth.users au
where au.email_confirmed_at is not null or au.phone_confirmed_at is not null
on conflict (id) do update
set
  phone = excluded.phone,
  email = excluded.email,
  display_name = excluded.display_name,
  auth_provider = excluded.auth_provider;

alter table public.users enable row level security;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
on public.users
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);