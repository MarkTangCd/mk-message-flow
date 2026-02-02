# Draft: Manual Execution Migration

## Requirements (confirmed)
- Remove cron infrastructure: delete cron routes/scripts/config and related deps.
- Remove react-markdown usage; display message content without markdown parsing.
- Add a manual trigger button on Messages page to execute schedules on demand.
- Remove execution time validation in schedule API.
- Remove time fields from schedule creation form and request payloads.
- Manual execution runs all enabled/active schedules (no filtering).
- Manual execute API returns summary counts only.
- UI feedback via toast notification with counts.
- Keep DB time columns; stop using them in code.
- Message content is plain text with newline preservation.

## Technical Decisions
- Manual execute endpoint response: { success, data: { total, successful, failed } }.
- Message detail view uses plain text with `white-space: pre-wrap`.
- Toast is the only UI feedback for manual execution.

## Research Findings
- User-provided context lists cron-related files and dependencies to remove.
- Message content uses ReactMarkdown only in MessageDetailModal.
- Explore agent notes additional schedule/time dependencies: `lib/schedule-utils.ts`, `lib/ai-service.ts`, `app/components/ScheduleForm.tsx`, `app/components/ScheduleList.tsx`, `app/schedules/page.tsx`, `app/api/cron/execute-schedules/route.ts`, `lib/types.ts`.

## Open Questions
- None (all clarified).

## Scope Boundaries
- INCLUDE: Removal of cron pipeline, manual execute API + UI trigger, schedule form simplification.
- EXCLUDE: Adding new scheduling features or automated execution logic.
