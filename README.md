# PULSE — Fitness OS ⚡

A futuristic, full-featured fitness tracker built with **React + TypeScript + Vite + Tailwind**, with **cloud sync via Supabase** and real **exercise images** from the open wger database.

Tracks workouts, nutrition, body weight, routines, an adaptive AI coach, friends & leaderboards, and achievements — pre-loaded with Dilli's stats (188 cm, 110 kg → 88 kg goal).

---

## 🚀 Quick start (runs offline immediately)

You need **Node.js 18+** installed ([download here](https://nodejs.org)).

```bash
cd pulse-app
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173). That's it — the app works fully offline, saving your data on your device. No account needed.

To build a production version: `npm run build`, then `npm run preview`.

---

## ☁️ Turn on cloud sync (optional, ~5 minutes)

This makes your data sync across devices and lets friends connect for real.

1. Create a free account at **https://supabase.com** and click **New project** (any name; remember the database password).
2. When it's ready, go to **SQL Editor → New query**, open the file `supabase/schema.sql` from this project, paste its contents, and click **Run**. This creates the table and security rules.
3. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key
4. In the `pulse-app` folder, copy `.env.example` to a new file named `.env` and paste your values:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...your-long-anon-key...
   ```
5. Stop the dev server (Ctrl+C) and run `npm run dev` again.
6. Open the app → **Profile → Sign in to sync** → create an account. Your data now syncs to the cloud automatically. 🎉

> Tip: in Supabase, **Authentication → Providers → Email**, you can turn off "Confirm email" during testing so you can sign in instantly.

> **Global leaderboard:** the SQL in `supabase/schema.sql` also creates a `leaderboard` table that only the admin email (`dilli.prasath0201@gmail.com`) can edit. If you set up Supabase before this was added, just re-run `schema.sql` once. To change the admin, edit the email in the three `lb admin …` policies and in `src/lib/leaderboard.ts`.

> Note: the new Supabase **publishable key** (`sb_publishable_…`) works in place of the legacy anon key — paste it into `VITE_SUPABASE_ANON_KEY`. Never use the **secret key** in this app.

---

## 🔐 Enable "Continue with Google" (optional)

The Google button is already built in. To make it work you enable the provider once:

1. **Google Cloud Console** → https://console.cloud.google.com → create/select a project.
2. **APIs & Services → OAuth consent screen** → set it up (External), add your email as a test user.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** → type **Web application**.
   - **Authorized JavaScript origins:** `http://localhost:5173` (and your deployed URL later).
   - **Authorized redirect URIs:** paste the callback URL from Supabase (next step) — it looks like
     `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.
   - Copy the **Client ID** and **Client secret**.
4. **Supabase → Authentication → Sign In / Providers → Google** → toggle **Enable**, paste the **Client ID** + **Client secret**, **Save**.
5. **Supabase → Authentication → URL Configuration** → set **Site URL** to `http://localhost:5173` (add your deployed URL too), and add it under **Redirect URLs**.
6. Restart `npm run dev`, click **Continue with Google** on the login screen — done. 🎉

Until you finish this, just use email + password (works immediately).

---

## 🥷 API Ninjas features (Exercises · Nutrition · Calories · Recipes)

These power: full exercise database search (Library), plain-English "Smart" meal logging (Nutrition), the cardio calorie estimator (Workouts), and the Recipes page. The API Ninjas key is kept secret inside a Supabase Edge Function — never in the browser.

1. **Get a free key:** https://api-ninjas.com → **Get Free API Key** → copy it.
2. **Deploy the function** (the code is in `supabase/functions/api-ninjas/index.ts`). Two ways:
   - **Dashboard (no CLI):** Supabase → **Edge Functions** → **Deploy a new function** → name it exactly `api-ninjas` → paste the file's contents → **Deploy**.
   - **CLI:** `supabase functions deploy api-ninjas`
3. **Add the secret key:** Supabase → **Edge Functions → Secrets** (or **Project Settings → Edge Functions**) → add:
   ```
   API_NINJAS_KEY = your_api_ninjas_key
   ```
   (CLI: `supabase secrets set API_NINJAS_KEY=your_api_ninjas_key`)
4. Reload the app while signed in — the API Ninjas features light up automatically.

> Free-tier notes: the **Nutrition** endpoint returns core macros (calories, protein, carbs, fat). The **Recipe** endpoint may require an API Ninjas premium key — if so, the Recipes page will simply show "no results." Everything degrades gracefully if the function isn't deployed yet.

---

## 🌐 Deploy it online (optional)

The app is a static site, so any free host works. Easiest is **Vercel** or **Netlify**:

1. Push this folder to a GitHub repo.
2. Import it on [vercel.com](https://vercel.com) (it auto-detects Vite).
3. Add the two `VITE_SUPABASE_*` environment variables in the host's dashboard.
4. Deploy — you'll get a public URL you can open on your phone.

---

## ✨ Features

- **Accounts** — Google + email sign-in (Supabase Auth). Every account is empty until you onboard; no shared/demo data. Data is per-user and synced to the cloud.
- **Onboarding** — a 3-step wizard captures your profile on first sign-in and drives all targets.
- **Dashboard** — live stats, weight trajectory, calorie trends, macro rings, quick actions
- **Workouts** — strength & cardio logging, auto exercise images, personal records, total volume, streaks
- **Nutrition** — three ways to log: **online search** (Open Food Facts, millions of foods), **barcode** lookup, a **quick** local list (incl. Indian foods), or fully manual. Macro targets scale with bodyweight.
- **Body** — weight + BMI tracking AND **InBody** body-composition tracking (body fat %, skeletal muscle mass, visceral fat, body water, InBody score) with manual entry, **CSV import**, and trend charts.
- **Exercise Library** — curated catalogue across **Beginner / Intermediate / Advanced** levels with images, how-to, and ready-made programs you can start or save.
- **Routines** — custom routine builder + saved programs, one-tap "start workout"
- **AI Coach** — adaptive insights from your real data (calorie pacing, protein, training frequency, projections)
- **Friends** — leaderboards (weight lost / streak / consistency), shareable codes, achievements & challenges
- **Profile** — Mifflin–St Jeor calorie math, goal settings, JSON export/import, reset
- **Programs & Coaching** — goal-based plans (Cut, Six-Pack for men & women, Lean Bulk, Glutes, Recomp, Strength, General) each with a weekly split, calorie + macro targets, recommended food lists, and expected results. The app auto-recommends one from your stats and you can set any as your active goal.
- **Leaderboards** — a personal friend-code board PLUS a **global, admin-curated leaderboard**: everyone sees it, but only the admin can add/edit/delete (enforced by database row-level security, not just the UI).
- **Settings & customization** — 5 accent themes, **kg/lb** units (converted everywhere, data stays in kg), and switchable **data sources**.
- **Resilient data sources** — exercise search runs **Auto**: API Ninjas first, and the instant it errors or hits its daily quota it **falls back to wger** automatically. You can also force a specific provider in Settings.
- **Responsive** — works across phone, tablet, laptop and large screens.

## 🧱 Tech
React 18 · TypeScript · Vite · Tailwind CSS · React Router · Zustand · Recharts · Supabase (Auth + Postgres) · lucide-react · wger exercise images · Open Food Facts

## 🔐 Privacy
With Supabase, your data lives in your own private project, protected by row-level security so only you can read it. Without cloud configured, the app runs offline with data in your browser's local storage.
