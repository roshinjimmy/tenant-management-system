# Tenant Management System

A simple tenant management dashboard built with Next.js (App Router), Tailwind CSS, and Supabase.

It supports:
- Managing tenants (create, list, delete)
- Viewing vacant rooms
- Generating monthly payments and updating payment status
- Creating and tracking maintenance requests
- A tenant portal to upload payment proof and raise maintenance requests

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Supabase (Postgres + Storage)

## Pages & Routes

- `/` — Home
- `/tenants` — Tenant list + add/delete
- `/payments` — Payment generation + status updates
- `/maintenance` — Maintenance requests + status updates
- `/rooms` — Vacant rooms view
- `/tenant-portal` — Tenant self-service (payment proof upload + maintenance request)

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env.local` file at the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

These are used in [lib/supabaseClient.ts](lib/supabaseClient.ts).

### 3) Run the app

```bash
npm run dev
```

Then open http://localhost:3000

## Supabase Setup

This project assumes a Supabase project with a Postgres schema and one Storage bucket.

### Database tables (expected)

The UI expects the following tables/columns to exist:

**rooms**
- `id` (pk)
- `room_no` (text)
- `floor` (int)
- `extra_facilities` (text, nullable)

**tenants**
- `id` (pk)
- `name` (text)
- `phone` (text, nullable)
- `email` (text, nullable)
- `address` (text, nullable)
- `room_id` (fk → rooms.id, nullable)

**payments**
- `id` (pk)
- `tenant_id` (fk → tenants.id)
- `month` (date) — stored as the 1st of the month (e.g. `2025-12-01`)
- `amount` (numeric/int)
- `status` (text) — one of `pending | paid | late`

**maintenance_requests**
- `id` (pk)
- `room_id` (fk → rooms.id)
- `tenant_name` (text, optional but used by tenant portal)
- `issue` (text)
- `status` (text) — one of `open | in_progress | resolved`
- `created_at` (timestamp) — used for sorting in the admin list

**payment_proofs**
- `id` (pk)
- `tenant_name` (text)
- `room_id` (fk → rooms.id)
- `month` (date)
- `file_url` (text)
- `created_at` (timestamp)

### Recommended constraints (important)

The payments page uses `upsert` with `onConflict: "tenant_id,month"`. For this to work correctly, add a unique constraint:

```sql
alter table public.payments
add constraint payments_tenant_id_month_key unique (tenant_id, month);
```

### Storage bucket

The tenant portal uploads proof files to a bucket named:

- `payment-proofs`

The current implementation uses `getPublicUrl(...)`, so the bucket should be **public** (or you should switch to signed URLs).

### Row Level Security (RLS)

This app uses the Supabase **anon** key on the client and does not implement authentication yet.

That means you must ensure your Supabase RLS policies allow the required operations (select/insert/update/delete) for anon users, or disable RLS in development.

## UI Notes

- Light mode is forced globally via the root layout.
- Navbar is implemented as a client component and highlights the active route.

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # start production server
npm run lint     # eslint
```

## Project Structure

- [app](app) — Next.js App Router pages
- [components](components) — UI components (tables/forms)
- [lib/supabaseClient.ts](lib/supabaseClient.ts) — Supabase client

## Troubleshooting

- **Blank tables / no data**: confirm `.env.local` values and Supabase RLS policies.
- **Payments upsert not preventing duplicates**: ensure the `(tenant_id, month)` unique constraint exists.
- **Upload fails in tenant portal**: ensure bucket `payment-proofs` exists and is public (or update to signed URLs).
