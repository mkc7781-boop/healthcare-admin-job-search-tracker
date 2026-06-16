# Build Plan — Healthcare Admin Job Search Tracker

> **Status: BUILT AND RUNNING.** Start with `npm run dev` → http://localhost:3000

Use alongside [README.md](./README.md) for setup and [JOB_AGENT_API.md](./JOB_AGENT_API.md) for your job-search agent.

---

## Goal

A job tracker for healthcare admin applications:

- Six fixed regions, **max 10 leads each**
- Full tracking table with priority/status colors
- Search, sort, export (CSV/Excel), add/edit/delete
- **Agent-friendly:** your job-search AI fills the tracker via REST API — no manual copy-paste

---

## Architecture (what was built)

```mermaid
flowchart TB
    User[You in browser] --> UI[Next.js Dashboard /]
    JobAgent[Your job-search AI agent] --> API[/api/agent/*]
    UI --> Storage[data/leads.json]
    API --> Storage
```

| Piece | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 + TypeScript | UI + API in one project |
| Storage | Local JSON file | **Works immediately** — no Supabase signup required |
| Agent API | REST endpoints | Your job-search agent POSTs structured job data |
| Styling | Tailwind + shadcn-style components | Tables, badges, forms, dialogs |
| Export | SheetJS + native CSV | Download tracker data |

> **Note:** An earlier draft of this plan used Supabase + login. That was replaced because it blocked you from running the app. Local storage works now; cloud deploy can be added later.

---

## Regions (enum)

| Region ID | Display name | Max leads |
|-----------|--------------|-----------|
| `sacramento` | Sacramento | 10 |
| `bay_area` | Bay Area | 10 |
| `northern_california` | Northern California | 10 |
| `government` | Government Jobs | 10 |
| `state_of_california` | State of California | 10 |
| `remote` | Remote (Work from Home) | 10 |

---

## Lead fields

| Field | Required | Notes |
|-------|----------|-------|
| `region` | yes | One of six region IDs |
| `employer` | yes | Organization name |
| `career_site` | no | URL |
| `position` | no | Job title |
| `city` | no | Location |
| `min_requirements` | no | Free text |
| `priority` | no | `high`, `medium` (default), `low` |
| `status` | no | `need_to_apply` (default), `applied`, `interviewing`, `rejected` |
| `date_applied` | no | `YYYY-MM-DD` |
| `follow_up_date` | no | `YYYY-MM-DD` |
| `due_date` | no | `YYYY-MM-DD` |
| `contact_recruiter` | no | Name, email, or phone |
| `notes` | no | Free text |

VA column intentionally omitted (user typo).

---

## UI (built)

### Route: `/`

- Global search + Export CSV/Excel
- Six collapsible region sections (`3/10` counter each)
- Per region: Add Lead, Sort by Priority, data table
- Edit modal, delete with confirmation
- Priority badges: High=red, Medium=amber, Low=slate
- Status badges: Need to apply=blue, Applied=amber, Interviewing=green, Rejected=gray

### Table columns

Employer → Career Site → Position → City → Min Requirements → Priority → Status → Date Applied → Follow-up → Due Date → Contact → Notes → Actions

---

## Job-search agent API (built)

Your agent reads [JOB_AGENT_API.md](./JOB_AGENT_API.md) and calls:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/agent/schema` | Learn all fields, regions, example body |
| GET | `/api/agent/leads` | List leads + `slots_available` per region |
| POST | `/api/agent/leads` | Add one lead |
| POST | `/api/agent/leads/bulk` | Add multiple leads at once |
| PATCH | `/api/agent/leads/{id}` | Update a lead |
| DELETE | `/api/agent/leads/{id}` | Delete a lead |

No API key required locally. Optional `AGENT_API_KEY` in `.env.local` for production.

### Agent workflow

```
1. GET /api/agent/schema
2. GET /api/agent/leads          → check slots_available
3. Search for jobs (agent's job)
4. POST /api/agent/leads         → one lead per good match
5. You review at http://localhost:3000
```

---

## File structure (actual)

```
healthcare-admin-job-search-tracker-app/
├── README.md
├── BUILDPLAN.md
├── JOB_AGENT_API.md              ← give this to your job-search agent
├── data/leads.json               ← your tracker data (auto-created)
├── schema/job-lead.schema.json
├── docs/DOMAIN.md
├── scripts/test-agent-api.mjs    ← smoke test
└── src/
    ├── app/
    │   ├── page.tsx              ← dashboard
    │   └── api/agent/            ← agent endpoints
    ├── components/               ← UI
    └── lib/
        ├── db.ts                 ← JSON file read/write
        ├── leads.ts              ← business logic + 10-lead cap
        ├── actions.ts            ← server actions for UI
        └── types.ts, constants.ts, export.ts
```

---

## Implementation phases

### Phase 1 — Scaffold
- [x] Next.js 15, TypeScript, Tailwind, ESLint

### Phase 2 — Storage + types
- [x] JSON file storage (`data/leads.json`)
- [x] Types and constants
- [x] 10-lead cap enforcement

### Phase 3 — Dashboard UI
- [x] Six region sections
- [x] Add / edit / delete leads
- [x] Priority and status color badges
- [x] Sort by priority per region

### Phase 4 — Search and export
- [x] Global search
- [x] CSV and Excel export

### Phase 5 — Job-search agent API
- [x] CRUD endpoints for agent
- [x] Schema endpoint
- [x] Bulk create endpoint
- [x] JOB_AGENT_API.md documentation

### Phase 6 — Verify
- [x] `npm run build` passes
- [x] Dev server runs
- [x] Agent API smoke test passes
- [x] Dashboard loads with data

### Phase 7 — Cross-device cloud sync
- [x] Supabase storage layer (dual local/cloud mode)
- [x] Login + auth middleware (cloud mode only)
- [x] Agent API works in cloud with `AGENT_API_KEY` + `TRACKER_OWNER_USER_ID`
- [x] PWA manifest (Add to Home Screen on Android)
- [x] Migration script (`npm run migrate:cloud`)
- [x] [DEPLOY.md](./DEPLOY.md) step-by-step guide
- [ ] **You:** Create Supabase project + deploy to Vercel (follow DEPLOY.md)

---

## How to run

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

Test agent API:

```bash
node scripts/test-agent-api.mjs
```

---

## Build checklist

| Phase | Status |
|-------|--------|
| 1. Scaffold | ✅ Complete |
| 2. Storage | ✅ Complete |
| 3. Dashboard UI | ✅ Complete |
| 4. Search + export | ✅ Complete |
| 5. Agent API | ✅ Complete |
| 6. Verified | ✅ Complete |
| 7. Cross-device cloud | ✅ Code ready — follow [DEPLOY.md](./DEPLOY.md) to go live |