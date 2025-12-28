You are implementing a single file in Planner v3.

GLOBAL CONTEXT
- Stack: Next.js App Router (TypeScript)
- Architecture: modular monolith
- Rule: You may ONLY modify the file specified below
- No AI logic in this file
- No schema changes
- No new API routes
- No automatic behavior
- Manual, human-first planning only

TARGET FILE
apps/web/app/week/[yearWeek]/PlanView.tsx

PURPOSE
This component is the MANUAL WEEKLY PLAN EDITOR.

The weekly plan is an interpretation layer:
- It does NOT affect daily execution logs
- It does NOT auto-generate tasks
- It is editable by the user at any time
- AI will later READ this, never overwrite it

--------------------------------
SECTION 1 — DATA LOADING
--------------------------------

On load:
- Fetch weekly plan data from GET `/api/week?week=<yearWeek>`

Assume response shape:
{
  "week": "2025-W01",
  "focus_areas": string[],        // max 3
  "linked_goal_ids": string[],    // optional
  "weekly_tasks": string[],
  "expected_hours_per_day": number
}

If no plan exists:
- Initialize empty editable state
- DO NOT auto-create a plan on the backend

--------------------------------
SECTION 2 — WEEKLY PLAN FORM
--------------------------------

User must be able to EDIT and SAVE the following fields.

FIELD 1 — Focus Areas (REQUIRED)
- Max 3 short strings
- Render as text inputs
- Enforce max length (e.g. 50 chars)
- Prevent adding more than 3

FIELD 2 — Linked Goals (OPTIONAL)
- Fetch goals from GET `/api/goals`
- Render as checkboxes
- Allow linking 0 or more goals
- Store only goal IDs

FIELD 3 — Weekly Tasks (OPTIONAL)
- Free-form list of text items
- Add/remove rows
- No dates
- No priority
- No status tracking

FIELD 4 — Expected Hours Per Day
- Number input
- Optional
- Used later for AI only

--------------------------------
SECTION 3 — SAVE BEHAVIOR
--------------------------------

Save button:
- POST `/api/week`

Payload:
{
  "week": "2025-W01",
  "focus_areas": string[],
  "linked_goal_ids": string[],
  "weekly_tasks": string[],
  "expected_hours_per_day": number | null
}

Rules:
- Do NOT touch daily execution data
- Do NOT validate against habits
- Do NOT auto-adjust anything
- Show inline success or error state

--------------------------------
SECTION 4 — UX RULES
--------------------------------

- This is NOT a dashboard
- This is a form
- Simple, readable layout
- No charts
- No AI hints
- No motivational copy

Copy guidance allowed:
"Define what this week is about. Keep it small."

--------------------------------
SECTION 5 — TECHNICAL RULES
--------------------------------

- Controlled inputs only
- Local component state
- Proper TypeScript types
- Graceful loading + empty states
- No console.log
- No TODOs
- No side effects outside this component

--------------------------------
OUTPUT FORMAT
--------------------------------
- Return ONLY the code for apps/web/app/week/[yearWeek]/PlanView.tsx
- No explanations
- No markdown
- No additional files
