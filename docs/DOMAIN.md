# Domain Model

Reference for the tracker and the job-search agent API.

## Regions (unlimited leads each)

| ID | Label |
|----|-------|
| `sacramento` | Sacramento |
| `bay_area` | Bay Area |
| `northern_california` | Northern California |
| `government` | Government Jobs |
| `state_of_california` | State of California |
| `remote` | Remote (Work from Home) |

## Lead fields

| Field | Required | Notes |
|-------|----------|-------|
| region | yes | One of six region IDs |
| employer | yes | Organization name |
| career_site | no | URL to posting |
| position | no | Job title |
| city | no | Location |
| min_requirements | no | Free text |
| priority | no | `high`, `medium` (default), `low` |
| status | no | `need_to_apply` (default), `applied`, `interviewing`, `rejected` |
| date_applied | no | `YYYY-MM-DD` |
| follow_up_date | no | `YYYY-MM-DD` |
| due_date | no | `YYYY-MM-DD` |
| contact_recruiter | no | Name, email, or phone |
| notes | no | Free text |

## Rules

1. No per-region lead limit — add as many leads as you need
2. Region cannot be changed after a lead is created
3. Agent can list existing leads via `GET /api/agent/leads` before POSTing
4. VA column does not exist (was a typo)