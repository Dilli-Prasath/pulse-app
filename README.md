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

---

## 🌐 Deploy it online (optional)

The app is a static site, so any free host works. Easiest is **Vercel** or **Netlify**:

1. Push this folder to a GitHub repo.
2. Import it on [vercel.com](https://vercel.com) (it auto-detects Vite).
3. Add the two `VITE_SUPABASE_*` environment variables in the host's dashboard.
4. Deploy — you'll get a public URL you can open on your phone.

---

## ✨ Features

- **Dashboard** — live stats, weight trajectory, calorie trends, macro rings, quick actions
- **Workouts** — strength & cardio logging, auto exercise images, personal records, total volume, streaks
- **Nutrition** — searchable food database (incl. Indian foods), calories & macro targets that scale with bodyweight
- **Body** — weight log, BMI with health zones, progress charts, time-to-goal
- **Routines** — built-in Push/Pull/Legs/Fat-burn plans + custom routine builder, one-tap "start workout"
- **AI Coach** — adaptive, rules-based insights from your real data (calorie pacing, protein, training frequency, projections)
- **Friends** — leaderboards (weight lost / streak / consistency), shareable codes, achievements & challenges
- **Profile** — Mifflin–St Jeor calorie math, goal settings, cloud sign-in, JSON export/import, reset

## 🧱 Tech
React 18 · TypeScript · Vite · Tailwind CSS · React Router · Zustand · Recharts · Supabase · lucide-react · wger exercise API

## 🔐 Privacy
Without cloud configured, 100% of your data stays in your browser's local storage. With Supabase, data is stored in your own private project, protected by row-level security so only you can read it.
