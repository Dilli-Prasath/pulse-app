# PULSE — Fitness OS ⚡

A futuristic, full-featured fitness tracker and coach: **React + TypeScript + Vite + Tailwind**, with **cloud sync, Google/email auth, groups, an admin leaderboard, guided workouts, real exercise images, recipes, and an AI coach.**

- **Live app:** deploy on Vercel (see §6)
- **Stack:** React 18 · TypeScript · Vite · Tailwind · React Router · Zustand · Recharts · Supabase (Auth + Postgres + Edge Functions)

---

## Table of contents
1. [Run locally](#1-run-locally)
2. [Cloud sync (Supabase)](#2-cloud-sync-supabase)
3. [Google sign-in](#3-google-sign-in)
4. [API Ninjas features (optional)](#4-api-ninjas-features-optional)
5. [Database schema & admin leaderboard](#5-database-schema--admin-leaderboard)
6. [Deploy to Vercel](#6-deploy-to-vercel)
7. [Feature tour](#7-feature-tour)
8. [Troubleshooting & FAQ](#8-troubleshooting--faq)

---

## 1. Run locally

You need **Node.js 18+** ([download](https://nodejs.org)).

```bash
cd pulse-app
npm install      # installs ALL dependencies — required after any pull/dep change
npm run dev      # starts http://localhost:5173
```

> **Important:** run `npm install` whenever `package.json` changes (e.g. after `git pull`). If you only `git pull` and run `npm run dev`, you'll get *"Failed to resolve import …"* errors — that just means a package isn't installed yet.

The app works **fully offline** (data saved in your browser) until you turn on cloud sync.

Production build: `npm run build` then `npm run preview`.

---

## 2. Cloud sync (Supabase)

Lets your data sync across devices and powers accounts, groups and leaderboards. ~5 minutes.

1. Create a free project at **https://supabase.com → New project** (note the database password).
2. **SQL Editor → New query** → paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**. This creates all tables + security rules. (Safe to re-run any time you pull schema changes.)
3. **Project Settings → API** → copy:
   - **Project URL** (e.g. `https://abcd.supabase.co`)
   - **Publishable key** (`sb_publishable_…`) — the new replacement for the anon key. *(Never use the secret key in this app.)*
4. In `pulse-app/`, copy `.env.example` → `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxx
   ```
5. **Restart** the dev server (`Ctrl+C`, then `npm run dev`). Vite only reads `.env` at startup.
6. Open the app → you'll see the **login screen** → create an account → onboard → done. Your data now syncs. 🎉

> Tip: **Authentication → Sign In / Providers → Email** → turn **Confirm email** OFF during testing so you can sign in instantly.

---

## 3. Google sign-in

The "Continue with Google" button is built in; you enable the provider once. **This is where the redirect URLs matter — get them exactly right.**

### 3a. Create Google OAuth credentials
1. **https://console.cloud.google.com** → create/select a project.
2. **Google Auth Platform → Overview** (`/auth/overview`) → **Get started** → fill app name + your email → Audience **External** → finish. Add your email under **Audience → Test users** (required while the app is in "Testing").
3. **Google Auth Platform → Clients** (`/auth/clients`) → **Create client** → type **Web application**:
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     https://YOUR-VERCEL-APP.vercel.app
     ```
   - **Authorized redirect URIs** — this is your **Supabase callback URL**, exactly:
     ```
     https://YOUR-PROJECT.supabase.co/auth/v1/callback
     ```
     (You can copy this exact URL from Supabase → Authentication → Providers → Google → "Callback URL".)
   - **Create** → copy the **Client ID** and **Client secret**.

### 3b. Enable it in Supabase
4. **Supabase → Authentication → Sign In / Providers → Google** → **Enable** → paste **Client ID** + **Client secret** → **Save**.

### 3c. Set the app URLs (fixes the "redirected to localhost:3000" problem)
5. **Supabase → Authentication → URL Configuration:**
   - **Site URL:** your main app URL — `https://YOUR-VERCEL-APP.vercel.app` (or `http://localhost:5173` for local).
   - **Redirect URLs:** add **both**:
     ```
     http://localhost:5173/**
     https://YOUR-VERCEL-APP.vercel.app/**
     ```
6. Sign in from the **same URL** you set as Site URL.

---

## 4. API Ninjas features (optional)

Powers the **Smart** plain-English meal logger, the cardio calorie estimator, and the Library's online exercise search. The key is kept **server-side** in a Supabase Edge Function — never in the browser.

> Recipes and exercise **images do NOT need this** — Recipes use TheMealDB (free) and images use the open free-exercise-db. So you can skip this section and most of the app still works.

1. **Get a free key:** https://api-ninjas.com → **Get Free API Key**.
2. **Deploy the function** (`supabase/functions/api-ninjas/index.ts`):
   - **Dashboard:** Supabase → **Edge Functions → Deploy a new function** → name it exactly `api-ninjas` → paste the file → **Deploy**.
   - **CLI:** `supabase functions deploy api-ninjas`
3. **⚠️ Disable JWT verification** for this function (otherwise the browser's CORS preflight is rejected — the *"preflight … does not have HTTP ok status"* error): in the dashboard open the **api-ninjas** function → **Details/Settings** → turn **OFF "Enforce JWT verification"**. (The CLI reads `supabase/config.toml`, which already sets `verify_jwt = false`.)
4. **Add the secret:** Supabase → **Edge Functions → Secrets** → add `API_NINJAS_KEY = your_key`. (CLI: `supabase secrets set API_NINJAS_KEY=…`)
5. Reload the app while signed in.

> The wger key isn't needed (the app uses free public/open sources). If you ever want it, add a `WGER_API_KEY` secret too.

---

## 5. Database schema & admin leaderboard

Running `supabase/schema.sql` creates:
- **`pulse_state`** — one JSON row per user holding all their data (workouts, meals, water, measurements, InBody, settings…). Protected by row-level security so only you can read your own.
- **`leaderboard`** — a global, **admin-only-editable** board. Everyone signed in can view it; only the admin email can add/edit/delete (enforced in the DB, not just the UI).
- **`groups` / `group_members`** + a `join_group()` function — teams with invite codes.

**To change the admin email:** edit it in the three `lb admin …` policies in `schema.sql` **and** in `src/lib/leaderboard.ts` (`ADMIN_EMAIL`). Default: `dilli.prasath0201@gmail.com`.

If you set up Supabase before groups/leaderboard existed, just **re-run `schema.sql`** — it's idempotent.

---

## 6. Deploy to Vercel

1. Push the project to a GitHub repo.
2. On [vercel.com](https://vercel.com) → **New Project** → import the repo (auto-detects Vite; build `vite build`, output `dist`, root `./`).
3. **Environment Variables** — add only these two (publishable key is safe to expose; the API Ninjas key is NOT — it lives in Supabase):
   ```
   VITE_SUPABASE_URL = https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY = sb_publishable_xxxxxxxx
   ```
4. **Deploy.** You'll get a URL like `https://pulse-app.vercel.app`.
5. **After deploy:** add that URL to **Supabase → Auth → URL Configuration** (Site URL + Redirect URLs) and to **Google → Authorized JavaScript origins** (see §3c) so login works in production.

> `vercel.json` already rewrites all routes to `index.html`, so deep links / refresh on any page work (no 404s).

---

## 7. Feature tour

- **Programs & Coaching** — goal plans (Cut, Six-Pack M/W, Lean Bulk, Glutes, Recomp, Strength, General) with weekly split, calorie+macro targets, recommended foods, expected results. Auto-recommended from your stats; set one as your active goal.
- **Workouts — guided "Today's Session"** — auto-detects today's workout from your program + weekday, auto-fills the exercises (or a timed HIIT circuit), and **walks you through it step-by-step** with a running clock, "now/next", rest countdowns, resizable exercise images, and an estimated duration. Saves once (no duplicates).
- **Nutrition** — log via **Smart** (plain-English NLP), **Scan** (photo → OCR), online **Search** (Open Food Facts), **Barcode**, a **Quick** list (incl. Tamil Nadu / Indian foods), or manual. Export your day as **PNG/PDF**. Water tracker.
- **Body** — weight + BMI, **InBody** body-composition (manual + CSV import) and **measurements** (waist/chest/arms…), all with charts.
- **Library** — exercise catalogue by level with real images & how-to.
- **Recipes** — search thousands with photos (TheMealDB).
- **Friends & Groups** — personal share-code board, a global admin leaderboard, and **create/join groups via invite link**.
- **AI Coach** — adaptive insights from your real data.
- **Settings** — 5 accent themes, kg/lb units, data-source switches, water goal.

---

## 8. Troubleshooting & FAQ

**"Failed to resolve import 'html-to-image' / 'tesseract.js' …"**
Dependencies aren't installed. Run `npm install` (after any `git pull`). On a corporate/locked npm registry use `npm install --registry https://registry.npmjs.org`.

**Google login shows `provider is not enabled`**
You haven't enabled Google in Supabase → Auth → Providers (see §3b).

**After Google login it lands on `localhost:3000` / "site can't be reached"**
Your Supabase **Site URL / Redirect URLs** are wrong. Set them per §3c. The app's dev port is **5173**, not 3000.

**Recipes / Smart meal says CORS "preflight does not have HTTP ok status"**
The `api-ninjas` edge function needs **JWT verification turned OFF** (§4 step 3). Note Recipes themselves use TheMealDB and don't need the function.

**Exercise images show letter tiles instead of photos**
Those exercises aren't in the curated image map (we map common lifts to real photos and fall back to neon tiles). Most program/library exercises have real photos.

**I got logged out**
Shouldn't happen — sessions persist and auto-refresh. If it does, your Supabase project may have a short session timeout (**Auth → Sessions**), or browser storage was cleared.

**`.git` lock errors / "another git process is running"**
`rm -f .git/index.lock .git/HEAD.lock` then retry.

**Where's the InBody CSV import?** Body page → **🧬 InBody** tab → **CSV template** + **Import CSV** buttons (top-right).

**Privacy** — with Supabase, data lives in your own private project behind row-level security. Without cloud, everything stays in your browser's local storage.
