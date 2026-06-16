# Deploy for Cross-Device Access (Phone, Tablet, Any Browser)

This guide gets your tracker online so you can open the **same URL** on your Android phone, laptop, or any device. All leads sync through Supabase.

**Time:** ~20 minutes | **Cost:** Free (Supabase + Vercel free tiers)

---

## Overview

```
Phone / Laptop / Any device
        ↓
   Vercel (your-app.vercel.app)
        ↓
   Supabase (database + login)
```

Local mode (`data/leads.json`) still works on your PC when Supabase env vars are **not** set. Once you deploy with Supabase, cloud sync takes over.

---

## Step 1 — Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project**
3. Pick a name, password, and region (choose one close to you)
4. Wait for the project to finish provisioning

---

## Step 2 — Run the database migration

1. In Supabase, open **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/migrations/001_job_leads.sql` from this project
4. Paste and click **Run**
5. You should see "Success"

---

## Step 3 — Enable email login

1. In Supabase, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Under **Authentication** → **URL Configuration**, add your site URL later (after Vercel deploy):
   - `https://your-app.vercel.app`
   - `http://localhost:3000` (for local testing)

---

## Step 4 — Get your Supabase keys

In Supabase → **Project Settings** → **API**, copy:

| Key | Env variable |
|-----|--------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role (secret!) | `SUPABASE_SERVICE_ROLE_KEY` |

Never put `SUPABASE_SERVICE_ROLE_KEY` in client code or commit it to git.

---

## Step 5 — Deploy to Vercel

1. Push this project to **GitHub** (if not already)
2. Go to [https://vercel.com](https://vercel.com) and sign up (free)
3. Click **Add New** → **Project** → import your GitHub repo
4. Before deploying, add these **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `AGENT_API_KEY` | Pick a long random secret string |
| `TRACKER_OWNER_USER_ID` | *(set in Step 7 — leave blank for first deploy)* |

5. Click **Deploy**
6. Copy your live URL (e.g. `https://healthcare-job-tracker.vercel.app`)

---

## Step 6 — Update Supabase redirect URLs

Back in Supabase → **Authentication** → **URL Configuration**:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** add `https://your-app.vercel.app/auth/callback`

---

## Step 7 — Create your account and get your User ID

1. Open your live Vercel URL on your phone or computer
2. Click **Sign Up** and create your account
3. In Supabase → **Authentication** → **Users**, find your account
4. Copy your **User UID** (looks like `a1b2c3d4-...`)

5. In Vercel → your project → **Settings** → **Environment Variables**:
   - Add `TRACKER_OWNER_USER_ID` = your User UID
6. **Redeploy** (Deployments → three dots → Redeploy)

This links your job-search agent API to your account.

---

## Step 8 — Use on your Android phone

1. Open **Chrome** on your Android phone
2. Go to your Vercel URL (e.g. `https://your-app.vercel.app`)
3. Sign in with the same email/password
4. Tap the **three dots** menu → **Add to Home screen** (installs like an app)
5. Your leads sync — add on phone, see on laptop, and vice versa

---

## Step 9 — Migrate existing local leads (optional)

If you already have leads in `data/leads.json` on your PC:

1. Create a `.env.local` file (copy from `.env.local.example`) with all Supabase keys
2. Set `TRACKER_OWNER_USER_ID` to your User UID
3. Run:

```bash
node scripts/migrate-to-supabase.mjs
```

This uploads your local leads to the cloud.

---

## Step 10 — Update your job-search agent

Give your agent the **live URL** instead of localhost:

```
GET https://your-app.vercel.app/api/agent/schema
POST https://your-app.vercel.app/api/agent/leads
Header: x-agent-api-key: your-AGENT_API_KEY-value
```

See [JOB_AGENT_API.md](./JOB_AGENT_API.md) for full API details.

---

## Environment variables reference

| Variable | Required for cloud | Purpose |
|----------|-------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side DB access for agent API |
| `TRACKER_OWNER_USER_ID` | Yes | Your user UUID (agent writes to your account) |
| `AGENT_API_KEY` | Yes (production) | Secret key for job-search agent |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Redirect loop on login | Check Supabase URL config matches your Vercel URL |
| "TRACKER_OWNER_USER_ID is not set" | Add your User UID in Vercel env vars and redeploy |
| Agent API returns 401 | Send `x-agent-api-key` header matching `AGENT_API_KEY` |
| Can't sign up | Check Email provider is enabled in Supabase |
| Local app still works without login | Supabase env vars not in `.env.local` — that's normal local mode |