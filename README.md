# NailsHub (MVP)

NailsHub is a Tainan nail booking MVP built with Next.js + Tailwind + shadcn/ui, using Supabase as backend/database.

## Tech Stack

- Frontend: Next.js (App Router), TypeScript
- UI: Tailwind CSS, shadcn/ui
- Backend/Data: Supabase (Postgres + RLS)

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

## 3) Initialize database schema and seed data

Run SQL in Supabase SQL Editor:

- `supabase/migrations/20260217000000_init.sql`

This creates tables/policies and inserts MVP seed data (shops/services/availability).

## 4) Start local dev server

```bash
cd web
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/shops`

## Current MVP capabilities

- Shop list and detail pages
- Filter by desired date / city (Tainan) / district
- Booking form submission to Supabase
- Booking confirmation page

## Common issues

- Missing env vars: check `web/.env.local`
- Empty data: ensure migration SQL was executed in Supabase
- Wrong Supabase key/project: verify URL and anon key match the same project

## Notes

- `mvp_spec.md` may contain draft planning text and is not required to run the app.
- Do not commit `.env.local`.
