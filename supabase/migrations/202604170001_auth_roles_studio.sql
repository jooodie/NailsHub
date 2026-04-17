-- Auth + shop role + booking ownership + studio availability management

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_memberships (
  user_id uuid not null references auth.users (id) on delete cascade,
  shop_id text not null references public.shops (id) on delete cascade,
  role text not null check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  primary key (user_id, shop_id)
);

alter table public.profiles enable row level security;
alter table public.shop_memberships enable row level security;

alter table public.bookings
  add column if not exists customer_user_id uuid references auth.users (id),
  add column if not exists customer_email text;

-- auto profile bootstrap on user sign-up
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- remove open booking access policies from v1
DROP POLICY IF EXISTS "bookings_insert_public" ON public.bookings;
DROP POLICY IF EXISTS "bookings_select_public" ON public.bookings;

-- profiles policy
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- memberships policy
DROP POLICY IF EXISTS "shop_memberships_select_own" ON public.shop_memberships;
create policy "shop_memberships_select_own"
on public.shop_memberships for select
using (auth.uid() = user_id);

-- bookings policy
DROP POLICY IF EXISTS "bookings_insert_own" ON public.bookings;
create policy "bookings_insert_own"
on public.bookings for insert
with check (auth.uid() = customer_user_id);

DROP POLICY IF EXISTS "bookings_select_own_or_member" ON public.bookings;
create policy "bookings_select_own_or_member"
on public.bookings for select
using (
  auth.uid() = customer_user_id
  or exists (
    select 1
    from public.shop_memberships m
    where m.user_id = auth.uid()
      and m.shop_id = bookings.shop_id
  )
);

DROP POLICY IF EXISTS "bookings_update_member" ON public.bookings;
create policy "bookings_update_member"
on public.bookings for update
using (
  exists (
    select 1
    from public.shop_memberships m
    where m.user_id = auth.uid()
      and m.shop_id = bookings.shop_id
  )
)
with check (
  exists (
    select 1
    from public.shop_memberships m
    where m.user_id = auth.uid()
      and m.shop_id = bookings.shop_id
  )
);

-- shop availability management policy
DROP POLICY IF EXISTS "shop_availability_manage_by_membership" ON public.shop_availability;
create policy "shop_availability_manage_by_membership"
on public.shop_availability for all
using (
  exists (
    select 1
    from public.shop_memberships m
    where m.user_id = auth.uid()
      and m.shop_id = shop_availability.shop_id
  )
)
with check (
  exists (
    select 1
    from public.shop_memberships m
    where m.user_id = auth.uid()
      and m.shop_id = shop_availability.shop_id
  )
);

-- seed one owner membership by email lookup (safe no-op if not found)
insert into public.shop_memberships (user_id, shop_id, role)
select u.id, 'shop-001', 'owner'
from auth.users u
where lower(u.email) = lower('owner@nailshub.local')
on conflict (user_id, shop_id) do nothing;
