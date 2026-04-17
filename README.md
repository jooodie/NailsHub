# NailsHub (MVP)

NailsHub is a Tainan nail booking MVP built with Next.js + Tailwind + shadcn/ui, using Supabase as backend/database.

## Tech Stack

- Frontend: Next.js (App Router), TypeScript
- UI: Tailwind CSS, shadcn/ui
- Backend/Data: Supabase (Postgres + RLS + Auth)

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+
- A Supabase project

## 1) Clone and install

```bash
git clone <your-repo-url>
cd booking_platform/web
npm install
```

## 2) Configure env vars

In `web/`, create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from Supabase dashboard:

- Project Settings -> API -> Project URL
- Project Settings -> API -> anon public key

## 3) Initialize database schema

Run SQL in Supabase SQL Editor in order:

1. `supabase/migrations/20260217000000_init.sql`
2. `supabase/migrations/202604170001_auth_roles_studio.sql`

## 4) Start local dev server

```bash
cd web
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/shops`

## Current MVP capabilities

- Shop list/detail pages
- Filter by desired date / city (Tainan) / district
- User sign up/sign in/sign out (email + password)
- Booking requires login and stores user-linked booking records
- My bookings page (`/my/bookings`)
- Studio availability backend (`/studio/availability`) with membership-based access

## Studio account setup (for testing)

`shop_memberships` controls who can access studio backend for each shop.

Example SQL (replace with your test user id):

```sql
insert into public.shop_memberships (user_id, shop_id, role)
values ('<auth_user_uuid>', 'shop-001', 'owner')
on conflict (user_id, shop_id) do nothing;
```

## E2E test checklist

### Customer flow

1. Go to `/auth/sign-up` and register.
2. Go to `/shops/<shop_id>` and verify booking form is available.
3. Submit booking with service/date/time.
4. Verify redirect to `/bookings/<id>`.
5. Verify `/my/bookings` shows the created booking.

### Studio flow

1. Ensure account has a row in `shop_memberships`.
2. Go to `/studio/availability`.
3. Add/modify slots for a date.
4. Delete one date to simulate holiday.
5. Verify corresponding shop page reflects changes in available slots.

## Common issues

- Missing env vars: check `web/.env.local`
- Empty data: ensure both migration SQL files were executed in order
- Permission denied: check RLS + `shop_memberships` binding for current user

## Notes

- `mvp_spec.md` may contain draft planning text and is not required to run the app.
- Do not commit `.env.local`.
