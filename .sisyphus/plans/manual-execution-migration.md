# Manual Execution Migration

## TL;DR

> **Quick Summary**: Remove cron-based scheduling, add manual execute API + UI trigger, and simplify schedule creation/display to manual-only while keeping DB time columns for compatibility.
> 
> **Deliverables**:
> - Cron infrastructure removed (routes/scripts/config/deps)
> - Manual execute API endpoint with summary response
> - Manual trigger UI with toast feedback
> - Schedule creation simplified; time fields unused
> - Message detail view renders plain text with newline preservation
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 2 → Task 3

---

## Context

### Original Request
Convert MessageFlow from cron-based scheduling to manual execution. Remove cron infra, remove markdown parsing, add manual trigger button, remove time validation and inputs, keep DB time columns.

### Interview Summary
**Key Discussions**:
- Manual execution runs all enabled schedules; no filtering.
- Manual execute API returns summary counts only.
- UI feedback via toast notification.
- Keep DB time columns; stop using them in code.
- Message content is plain text with newline preservation.

**Research Findings**:
- Cron execution logic lives in `app/api/cron/execute-schedules/route.ts`.
- Time-based filtering lives in `lib/schedule-utils.ts`.
- Schedule creation form and display rely on execution time fields in `app/components/AddScheduleModal.tsx`, `app/page.tsx`, and `app/schedules/page.tsx`.
- `react-markdown` only used in `app/components/MessageDetailModal.tsx`.

### Metis Review
Metis agent unavailable in this environment; proceeding with explicit defaults and verification steps.

---

## Work Objectives

### Core Objective
Replace cron execution with manual execution while simplifying schedule creation and ensuring the UI reflects manual-only semantics.

### Concrete Deliverables
- Remove cron route, cron config, local cron script, and cron dependencies.
- Add `POST /api/schedules/execute` to run all active schedules immediately.
- Add manual trigger button on Messages page with toast feedback.
- Simplify schedule creation form to only task name, model, prompt, notes; remove time fields and cadence.
- Replace markdown rendering with plain text preserving newlines.

### Definition of Done
- Manual execute endpoint returns `{ success: true, data: { total, successful, failed } }`.
- Manual trigger button calls the endpoint and shows toast with counts.
- Schedule creation no longer requires or submits time fields.
- Cron infrastructure removed from repo and dependencies.

### Must Have
- Manual execution runs all active schedules, no time filtering.
- DB time columns remain untouched (compatibility).

### Must NOT Have (Guardrails)
- Do NOT add new scheduling automation.
- Do NOT introduce markdown parsing elsewhere.
- Do NOT alter database schema.

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: NO (defaulted)
- **Framework**: none
- **QA approach**: Manual verification via commands and Playwright

### Automated Verification Only (No User Intervention)

**API/Backend**:
```bash
curl -s -X POST http://localhost:3000/api/schedules/execute | jq '.success,.data.total,.data.successful,.data.failed'
# Assert: success = true; data fields exist (numbers)
```

**Frontend/UI (Playwright)**:
```
1. Navigate to http://localhost:3000
2. Click button with text "Manual Trigger"
3. Wait for toast element (role=alert or data-testid=toast)
4. Assert toast text includes "schedules executed"
5. Screenshot: .sisyphus/evidence/manual-trigger-toast.png
```

**Repo Hygiene**:
```bash
test ! -f vercel.json
test ! -f scripts/local-cron.ts
test ! -d app/api/cron
```

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Start Immediately):
- Task 1: Remove cron infrastructure + dependencies
- Task 2: Create manual execute API endpoint
- Task 4: Simplify schedule creation + types + UI display

Wave 2 (After Wave 1):
- Task 3: Manual trigger UI + API client + toast
- Task 5: Replace markdown rendering in message detail modal

Critical Path: Task 2 → Task 3

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 3 | 2, 4, 5 |
| 2 | None | 3 | 1, 4, 5 |
| 3 | 2 | None | 5 |
| 4 | None | None | 1, 2, 5 |
| 5 | None | None | 1, 2, 4 |

---

## TODOs

- [ ] 1. Remove cron infrastructure and related dependencies

  **What to do**:
  - Delete cron config and routes.
  - Remove local cron script.
  - Remove cron dependencies and script from `package.json`.
  - Remove time-based schedule utilities now unused.

  **Must NOT do**:
  - Do not touch DB schema.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: straightforward file deletions and dependency cleanup.
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `git-master`: no git operations required for planning.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 4)
  - **Blocks**: Task 3 (manual trigger should not reference old cron)
  - **Blocked By**: None

  **References**:
  - `vercel.json:1` - Remove cron schedule configuration (entire file).
  - `scripts/local-cron.ts:1` - Local cron job script to delete.
  - `app/api/cron/execute-schedules/route.ts:1` - Cron endpoint to remove.
  - `lib/schedule-utils.ts:1` - Time-based schedule utilities to remove.
  - `package.json:5` - Remove `cron` script.
  - `package.json:12` - Remove `node-cron` and `react-markdown` dependencies.
  - `package.json:25` - Remove `@types/node-cron` and `tsx` devDependencies if unused elsewhere.

  **Acceptance Criteria**:
  - [ ] `vercel.json` removed or empty of cron config.
  - [ ] `scripts/local-cron.ts` removed.
  - [ ] `app/api/cron/` directory removed.
  - [ ] `lib/schedule-utils.ts` removed and no imports remain.
  - [ ] `package.json` no longer lists `node-cron`, `@types/node-cron`, `tsx`, `react-markdown`, or the `cron` script.

- [ ] 2. Create manual execute API endpoint

  **What to do**:
  - Add `POST /api/schedules/execute` that executes all active schedules immediately.
  - Reuse execution logic from the removed cron route (task execution + message creation + last_execution_time update).
  - Query all `scheduled_tasks` where `is_active = true`, joined with `ai_models`.
  - Return summary counts only: `{ success: true, data: { total, successful, failed } }`.

  **Must NOT do**:
  - Do not filter by time fields or schedule_type.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: server-side logic touching DB and AI execution flow.
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `vercel-react-best-practices`: not needed for API work.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `app/api/cron/execute-schedules/route.ts:10` - Execution flow, DB writes, and AI call patterns to reuse.
  - `lib/ai-service.ts:23` - `executeAIRequest` usage pattern.
  - `app/api/schedules/route.ts:7` - SQL join pattern with `ai_models`.
  - `lib/types.ts:28` - Scheduled task shape for typing.

  **Acceptance Criteria**:
  - [ ] `POST /api/schedules/execute` returns `{ success: true, data: { total, successful, failed } }`.
  - [ ] All active schedules are processed (no time gating).
  - [ ] Each execution writes `task_executions` and `messages` records similarly to cron flow.
  - [ ] `scheduled_tasks.last_execution_time` updated per executed schedule.

- [ ] 3. Add manual trigger UI + API client + toast feedback

  **What to do**:
  - Add `schedulesApi.executeAll()` to call `POST /api/schedules/execute`.
  - Add a "Manual Trigger" button in Messages page header.
  - Add loading state and toast notification for summary counts.

  **Must NOT do**:
  - Do not add additional scheduling UI controls.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI state + interaction feedback.
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: not required for minor UI addition.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: Task 2

  **References**:
  - `lib/api-client.ts:61` - schedules API client; add `executeAll` here.
  - `app/page.tsx:198` - header area where new button should sit.
  - `app/page.tsx:59` - component state management patterns.

  **Acceptance Criteria**:
  - [ ] Clicking "Manual Trigger" calls `/api/schedules/execute`.
  - [ ] Button shows loading state during request.
  - [ ] Toast appears with text like "5 schedules executed: 4 success, 1 failed".
  - [ ] Errors show a toast with failure message.

- [ ] 4. Simplify schedule creation + update types and display

  **What to do**:
  - Remove frequency/hour/minute inputs from `AddScheduleModal`.
  - Update `ScheduleDraft` to only `taskName`, `model`, `prompt`, `notes`.
  - Update `handleCreateSchedule` in `app/page.tsx` and `app/schedules/page.tsx` to send only required fields.
  - Update types so time fields are optional, and make `schedule_type` optional in create input.
  - In `app/api/schedules/route.ts`, drop time validation and set defaults (e.g., `schedule_type = "daily"`) for DB compatibility.
  - Update schedule display to show "Manual"/"On demand" when time fields are missing.

  **Must NOT do**:
  - Do not remove DB columns.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: cross-cutting type + API + UI changes.
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `vercel-react-best-practices`: not needed for small UI tweaks.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `app/components/AddScheduleModal.tsx:8` - current draft type and inputs to remove.
  - `app/page.tsx:47` - schedule display uses time fields.
  - `app/page.tsx:159` - schedule create payload to update.
  - `app/schedules/page.tsx:28` - cadence/time display helpers to update.
  - `app/schedules/page.tsx:96` - schedule create payload to update.
  - `lib/types.ts:25` - scheduled task fields and create input types.
  - `app/api/schedules/route.ts:33` - validation to remove and insert defaults.

  **Acceptance Criteria**:
  - [ ] Schedule create form shows only task name, model, prompt, notes.
  - [ ] Schedule creation no longer sends time fields.
  - [ ] API accepts creation without time fields and inserts defaults.
  - [ ] Schedules and messages display "Manual"/"On demand" without crashing when times are null.

- [ ] 5. Replace markdown rendering with plain text

  **What to do**:
  - Remove `react-markdown` import and usage.
  - Render message content in a plain `<div>` with `whitespace-pre-wrap` (or Tailwind `whitespace-pre-wrap`).

  **Must NOT do**:
  - Do not add any markdown parsing libraries.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: localized UI change.
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: not needed.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `app/components/MessageDetailModal.tsx:6` - remove `ReactMarkdown` import.
  - `app/components/MessageDetailModal.tsx:103` - replace markdown renderer with plain text.

  **Acceptance Criteria**:
  - [ ] Message content renders as plain text with newlines preserved.
  - [ ] No `react-markdown` usage remains.

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `chore: remove cron infrastructure and deps` | vercel.json, scripts/local-cron.ts, app/api/cron/**, lib/schedule-utils.ts, package.json | `npm run lint` (optional) |
| 2-3 | `feat: add manual schedule execution` | app/api/schedules/execute/route.ts, lib/api-client.ts, app/page.tsx | API curl check |
| 4 | `refactor: simplify schedule creation` | app/components/AddScheduleModal.tsx, app/schedules/page.tsx, app/page.tsx, app/api/schedules/route.ts, lib/types.ts | schedule create curl |
| 5 | `refactor: render message content as plain text` | app/components/MessageDetailModal.tsx | UI Playwright check |

---

## Success Criteria

### Verification Commands
```bash
curl -s -X POST http://localhost:3000/api/schedules/execute | jq '.success,.data'
npm run lint
```

### Final Checklist
- [ ] Cron infrastructure removed and dependencies cleaned.
- [ ] Manual execute endpoint returns summary counts.
- [ ] Manual trigger UI works and shows toast.
- [ ] Schedule creation is manual-only and no time fields required.
- [ ] Message content displays plain text with preserved newlines.
