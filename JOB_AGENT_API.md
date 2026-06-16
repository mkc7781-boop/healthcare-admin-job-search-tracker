# Job-Search Agent API

This document is for **your job-search AI agent** — the one that finds healthcare admin jobs and fills in this tracker for you.

**Local mode:** No login. Data in `data/leads.json` on your PC.

**Cloud mode (cross-device):** Use your live Vercel URL. Requires `x-agent-api-key` header. See [DEPLOY.md](./DEPLOY.md).

---

## Quick start for your agent

1. Make sure the app is running: `npm run dev` → http://localhost:3000
2. Ask your agent to read this file and `GET /api/agent/schema`
3. Your agent POSTs each job lead it finds to `/api/agent/leads`

---

## Endpoints

Base URL (local): `http://localhost:3000`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/agent/schema` | Full schema, regions, enums, example body |
| GET | `/api/agent/leads` | List all leads + region capacity |
| GET | `/api/agent/leads?region=sacramento` | List leads in one region |
| POST | `/api/agent/leads` | Add a new lead |
| POST | `/api/agent/leads/bulk` | Add multiple leads at once |
| GET | `/api/agent/leads/{id}` | Get one lead |
| PATCH | `/api/agent/leads/{id}` | Update a lead |
| DELETE | `/api/agent/leads/{id}` | Delete a lead |

### Authentication (optional)

If `AGENT_API_KEY` is set in `.env.local`, send it on every request:

```
x-agent-api-key: your-secret-key-here
```

If not set, the API is open — your agent can call it with no headers.

---

## Regions (pick one per lead)

| ID | Label | Max leads |
|----|-------|-----------|
| `sacramento` | Sacramento | 10 |
| `bay_area` | Bay Area | 10 |
| `northern_california` | Northern California | 10 |
| `government` | Government Jobs | 10 |
| `state_of_california` | State of California | 10 |
| `remote` | Remote (Work from Home) | 10 |

**Before adding a lead**, check `GET /api/agent/leads` — the response includes `slots_available` per region. Do not POST if `slots_available` is 0.

---

## Create a lead

**POST** `/api/agent/leads`

```json
{
  "region": "sacramento",
  "employer": "UC Davis Health",
  "career_site": "https://careers.ucdavis.edu/job/example",
  "position": "Healthcare Administrator",
  "city": "Sacramento",
  "min_requirements": "Bachelor's degree, 3+ years healthcare admin experience",
  "priority": "high",
  "status": "need_to_apply",
  "due_date": "2026-07-01",
  "contact_recruiter": "Jane Smith, jane@example.com",
  "notes": "Found on LinkedIn. Strong benefits."
}
```

### Required fields
- `region` — one of the six region IDs above
- `employer` — organization name

### Optional fields (with defaults)
- `priority` — `high` | `medium` (default) | `low`
- `status` — `need_to_apply` (default) | `applied` | `interviewing` | `rejected`
- `career_site`, `position`, `city`, `min_requirements`
- `date_applied`, `follow_up_date`, `due_date` — format `YYYY-MM-DD`
- `contact_recruiter`, `notes`

### Success response (201)

```json
{
  "success": true,
  "lead": { "id": "...", "region": "sacramento", ... }
}
```

### Error response (400)

```json
{
  "error": "Maximum of 10 leads per region reached for sacramento."
}
```

---

## Agent workflow (recommended)

```
1. GET /api/agent/schema          → learn regions, fields, enums
2. GET /api/agent/leads           → see what's already tracked + open slots
3. Search for jobs (your agent's job)
4. For each good match:
   a. Pick the right region
   b. Check slots_available > 0
   c. POST /api/agent/leads with structured data
5. User reviews at http://localhost:3000
```

---

## Bulk create (multiple jobs at once)

**POST** `/api/agent/leads/bulk`

```json
{
  "leads": [
    {
      "region": "bay_area",
      "employer": "Stanford Health Care",
      "position": "Admin Director",
      "priority": "high",
      "status": "need_to_apply"
    },
    {
      "region": "remote",
      "employer": "Anthem",
      "position": "Healthcare Admin",
      "priority": "medium",
      "status": "need_to_apply"
    }
  ]
}
```

Returns `created` array and `errors` array (e.g. if a region is full).

---

## Example: curl

```bash
# Check open slots
curl http://localhost:3000/api/agent/leads

# Add a lead
curl -X POST http://localhost:3000/api/agent/leads \
  -H "Content-Type: application/json" \
  -d "{\"region\":\"remote\",\"employer\":\"Kaiser Permanente\",\"position\":\"Admin Coordinator\",\"career_site\":\"https://example.com/job\",\"priority\":\"high\",\"status\":\"need_to_apply\",\"notes\":\"Fully remote, healthcare admin\"}"
```

---

## Priority guide for your agent

| Priority | When to use |
|----------|-------------|
| `high` | Strong match to skills, good pay, preferred location |
| `medium` | Decent match, worth applying |
| `low` | Stretch role or backup option |

Set `status` to `need_to_apply` when the agent first adds a lead. You update it to `applied`, `interviewing`, or `rejected` as you go.