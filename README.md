# FutureTrack — Smart Attendance Management System

A modern, production-ready attendance management system built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

---

## Tech Stack

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Framework     | Next.js 15 (App Router)                 |
| Language      | TypeScript                              |
| Styling       | Tailwind CSS + custom design tokens     |
| UI Library    | shadcn/ui pattern + Lucide Icons        |
| Animation     | Framer Motion                           |
| Charts        | Recharts                                |
| Backend       | Supabase (Auth + PostgreSQL + Realtime) |
| Auth          | Supabase Auth (email/password)          |
| Realtime      | Supabase Realtime (postgres_changes)    |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning

### 3. Run the database schema

1. In your Supabase dashboard, go to **SQL Editor → New Query**
2. Copy and paste the contents of `supabase/schema.sql`
3. Click **Run**
4. *(Optional)* Run `supabase/seed.sql` to add sample unauthorized device data

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your values from **Supabase → Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Never commit `.env.local`** — it's in `.gitignore`.
> The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Keep it server-only.

### 5. Create the demo admin user

1. In Supabase dashboard → **Authentication → Users → Add User**
2. Email: `admin@futuretrack.io`
3. Password: `demo1234`
4. The trigger will automatically create a row in `public.users`
5. In **SQL Editor**, run:

```sql
UPDATE public.users
SET role = 'admin', department = 'Engineering', employee_id = 'EMP001'
WHERE email = 'admin@futuretrack.io';
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

---

## Project Structure

```
src/
├── app/
│   ├── auth/callback/          # OAuth/magic-link callback handler
│   ├── dashboard/              # Protected dashboard pages
│   │   ├── attendance/         # Attendance logs page
│   │   ├── connected/          # Connected users page
│   │   ├── devices/            # Device management (realtime)
│   │   ├── users/              # User management
│   │   └── settings/           # Settings page
│   ├── login/                  # Login page
│   ├── globals.css             # Design tokens & global styles
│   └── layout.tsx              # Root layout with AuthProvider
│
├── components/
│   ├── dashboard/              # Dashboard-specific widgets
│   ├── layout/                 # Sidebar, Topbar, DashboardLayout
│   ├── providers/              # AuthProvider (React Context)
│   └── ui/                     # Reusable primitives (Badge, Card, etc.)
│
├── data/
│   └── mock.ts                 # Fallback mock data (used when DB is empty)
│
├── hooks/
│   ├── use-auth.ts             # Client-side auth state
│   ├── use-supabase.ts         # Memoized browser client
│   ├── use-realtime-attendance.ts  # Live attendance updates
│   └── use-realtime-devices.ts     # Live device monitoring
│
├── lib/
│   ├── actions/
│   │   ├── auth.ts             # signIn, signOut, updateProfile
│   │   ├── attendance.ts       # checkIn, checkOut, getAttendanceLogs
│   │   ├── devices.ts          # blockDevice, reportUnauthorized
│   │   └── users.ts            # getUsers, adminCreateUser
│   ├── supabase/
│   │   ├── client.ts           # Browser client (Client Components)
│   │   ├── server.ts           # Server client + service role client
│   │   └── middleware.ts       # Session refresh + route protection
│   └── utils.ts                # cn(), color helpers, formatters
│
├── middleware.ts               # Next.js middleware (auth guard)
│
└── types/
    ├── database.ts             # Supabase DB types (Row, Insert, Update)
    └── index.ts                # App-level types
│
supabase/
├── schema.sql                  # Full DB schema with RLS policies
└── seed.sql                    # Development seed data
```

---

## Authentication Flow

```
User visits /dashboard
       ↓
middleware.ts → supabase.auth.getUser()
       ↓
No session? → redirect to /login?redirectTo=/dashboard
       ↓
User submits login form
       ↓
signIn() server action → supabase.auth.signInWithPassword()
       ↓
Success → redirect to /dashboard (or redirectTo param)
       ↓
AuthProvider (client) listens to onAuthStateChange
       ↓
Loads profile from public.users
```

---

## Realtime Subscriptions

The following tables stream live updates to the UI:

| Table                  | Hook                             | Used In                    |
|------------------------|----------------------------------|----------------------------|
| `attendance_logs`      | `useRealtimeAttendance`          | Dashboard, Attendance page |
| `unauthorized_devices` | `useRealtimeUnauthorizedDevices` | Dashboard, Devices page    |
| `device_sessions`      | `useRealtimeDeviceSessions`      | Devices page               |

Realtime is enabled via `ALTER PUBLICATION supabase_realtime ADD TABLE ...` in the schema.

---

## Row Level Security (RLS)

All tables have RLS enabled. The `get_user_role()` function reads the caller's role:

| Role       | Can Read       | Can Write        |
|------------|----------------|------------------|
| `admin`    | All tables     | All tables       |
| `manager`  | All tables     | Attendance logs  |
| `staff`    | Own records    | Own attendance   |
| `security` | Devices        | Device tables    |

---

## Environment Variables Reference

| Variable                        | Where to find                          | Required |
|---------------------------------|----------------------------------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Settings → API → Project URL | ✅       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key   | ✅       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase → Settings → API → service_role | ✅ (server only) |
| `NEXT_PUBLIC_APP_URL`           | Your deployment URL                    | ✅       |

---

## Deployment

### Netlify

This project ships with `netlify.toml` already configured with the official
`@netlify/plugin-nextjs` runtime — required because the app uses Server
Actions, Middleware, and Route Handlers (not just static pages).

**Steps:**

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Netlify → **Add new site → Import an existing project** → select the repo.
3. Netlify will auto-detect the build settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Before deploying**, add your environment variables:
   Site settings → **Environment variables** → add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
   ```
   > ⚠️ `NEXT_PUBLIC_*` variables are baked in at **build time**. If you add
   > or change one after the first deploy, you must trigger a new deploy
   > (Deploys → Trigger deploy → Clear cache and deploy site) — restarting
   > alone won't pick up the change.
5. Click **Deploy site**.
6. Once live, update Supabase → **Authentication → URL Configuration**:
   - Site URL: `https://your-site-name.netlify.app`
   - Redirect URLs: `https://your-site-name.netlify.app/auth/callback`

**Common Netlify errors and fixes:**

| Error | Cause | Fix |
|---|---|---|
| `npm install` fails with `403`/`404` on a package | A dependency doesn't exist or is unreachable | Already fixed in this version — unused/invalid Radix packages were removed |
| Site deploys but every page is blank/500s | Missing `@netlify/plugin-nextjs` | Already included in `netlify.toml` — don't remove the `[[plugins]]` block |
| Login works locally but not on Netlify | Supabase redirect URL not updated | Add your Netlify URL to Supabase Auth → URL Configuration (step 6 above) |
| Env vars set but site still says "missing Supabase URL" | Forgot to redeploy after adding vars | Trigger a new deploy with cache cleared |
| Build fails on lint step | Missing/misconfigured ESLint | Already fixed — `.eslintrc.json` is included |

### Vercel (alternative)

```bash
vercel deploy
```

Add all environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

Update your Supabase project's **Auth → URL Configuration**:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

---

## Generating Fresh DB Types

When you modify the schema, regenerate types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```
