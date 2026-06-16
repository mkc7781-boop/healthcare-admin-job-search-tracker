# Healthcare Admin Job Search Tracker

Track healthcare administration job applications by region. Each region holds up to 10 leads. Your **job-search AI agent** can fill the tracker automatically via a simple API.

## Run it on Windows (easiest)

1. **First time only:** double-click **`setup.bat`** in the project folder
2. **Every time:** double-click **`start.bat`**
3. Open **http://localhost:3000** in your browser

Keep the black window open while you use the app. Close it (or press Ctrl+C) to stop.

## Run it manually (if you prefer terminal)

```bash
npm install
npm run build
npm run dev
```

Open **http://localhost:3000**

## If you get errors

| Error | Fix |
|-------|-----|
| `Port 3000 is in use` | Close all old terminal windows, or run `start.bat` (it kills old servers) |
| `EPERM` / `operation not permitted` | Stop the app first (Ctrl+C), then run `setup.bat` again |
| `node is not recognized` | Install Node.js from https://nodejs.org/ (LTS version) |
| Page won't load | Make sure `start.bat` window is still open and says `Ready` |

Data is saved to `data/leads.json` on your machine.

## What you get

### Six regions (max 10 leads each)
- Sacramento
- Bay Area
- Northern California
- Government Jobs
- State of California
- Remote (Work from Home)

### Tracker columns
Employer, Career Site, Position, City, Min Requirements, Priority (color-coded), Status (color-coded), Date Applied, Follow-up, Due Date, Contact Recruiter, Notes, Delete

### Features
- Search across all fields
- Sort by priority per region
- Add / edit / delete leads in the UI
- Export CSV or Excel
- **Agent API** — your job-search AI fills the tracker for you

## Your job-search agent

Give your agent **[JOB_AGENT_API.md](./JOB_AGENT_API.md)**. It explains how to:

1. Check open slots per region
2. POST new job leads as JSON
3. Update or delete leads

Example:

```bash
curl -X POST http://localhost:3000/api/agent/leads \
  -H "Content-Type: application/json" \
  -d "{\"region\":\"sacramento\",\"employer\":\"UC Davis Health\",\"position\":\"Healthcare Administrator\",\"priority\":\"high\",\"status\":\"need_to_apply\"}"
```

The agent can also call `GET http://localhost:3000/api/agent/schema` to learn all fields and regions.

## Cross-device (phone, tablet, any browser)

Follow **[DEPLOY.md](./DEPLOY.md)** to deploy to Vercel + Supabase. Once live:

- Open the same URL on your **Android phone** (Chrome → Add to Home Screen)
- Sign in — leads sync across all devices
- Your job-search agent uses the live URL + API key

Local mode still works on your PC when Supabase env vars are not set.

## Optional API key (local)

Copy `.env.local.example` to `.env.local` and set `AGENT_API_KEY` if you want to lock down the agent API. Leave it unset for local use (open access).

## Documentation

| File | Purpose |
|------|---------|
| [JOB_AGENT_API.md](./JOB_AGENT_API.md) | API for your job-search agent |
| [BUILDPLAN.md](./BUILDPLAN.md) | Build plan and status |
| [docs/DOMAIN.md](./docs/DOMAIN.md) | Regions, fields, business rules |
| [schema/job-lead.schema.json](./schema/job-lead.schema.json) | JSON schema for lead data |