You are building a production-ready personal planning app (Planner v3).

Constraints:
- Stack: Next.js (App Router), TypeScript, PostgreSQL
- Architecture: modular monolith
- NO microservices
- NO over-engineering
- NO premature abstractions
- NO AI agents with memory

Rules:
1. Daily execution data is the source of truth
2. Plans are derived views, never overwritten history
3. AI must NEVER directly mutate core data
4. Prefer simple, readable code over cleverness
5. Every service must be testable in isolation
6. Use functional, explicit code style

You will generate code ONLY for the file I ask.
Do not reference files I didn’t ask for.
Do not invent features not in the spec.



Context:
This file is part of Planner v3, a modular monolith Next.js app.

File path:
<PASTE FILE PATH HERE>

Responsibilities:
<PASTE RESPONSIBILITY>

Requirements:
- TypeScript
- Production-ready
- No TODOs
- No mock data
- Proper error handling
- Clear function boundaries

Output:
- Only code for this file
- No explanations


File path:
db/schema.sql

Responsibilities:
Define PostgreSQL schema for users, daily logs, habit checks, weekly plans, weekly reviews, and ai_runs.
Ensure indexes for (user_id, date) queries.
Keep schema minimal but extensible.

Output:
SQL only.


File path:
modules/execution/day-log.service.ts

Responsibilities:
- Create or fetch today's day log for a user
- Toggle habit completion
- Ensure idempotency
- Never overwrite past days

Output:
TypeScript code only.


File path:
apps/web/app/api/today/route.ts

Responsibilities:
- GET: return today’s checklist and completion status
- PATCH: toggle a habit item
- Auth required

Output:
TypeScript code only.


File path:
modules/ai/prompts/weekly-plan.prompt.ts

Responsibilities:
Generate a weekly plan given:
- user goals
- available hours per day
- last 7 days completion stats

Rules:
- Plan must be realistic
- Max 3 priorities
- Include fallback “minimum viable day”
- Output structured JSON

Output:
Prompt string only.


File path:
modules/ai/prompts/weekly-review.prompt.ts

Responsibilities:
Summarize weekly performance and generate:
- honest feedback
- what worked
- what didn’t
- next week adjustments

Tone:
Supportive, direct, non-judgmental.

Output:
Prompt string only.


Reminder:
Do NOT invent features.
Do NOT add fields or tables not requested.
Do NOT introduce new services or dependencies.
If unsure, keep it minimal.
