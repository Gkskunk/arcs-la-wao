# Permissions

All access requires an active organization membership. Organization is derived from the server session, never request body. Unknown/cross-organization IDs return 404. Unassigned records are refused.

| Role | Read / write scope |
|---|---|
| chapter_admin | Organization records and approval administration; no bypass of execution integrity |
| chapter_leadership | Chapter operations, reports and independent approvals; raw interviews require explicit grants |
| development_steward | Assigned donor, gift, designation, campaign records |
| university_liaison | Assigned university and scholar records; roster proposals in assigned institutions |
| scholar_steward | Assigned profiles, updates and consent; may propose contact drafts |
| event_coordinator | Assigned events/tasks; invitation proposals |
| member_volunteer | Assigned tasks; may update state, not reassign or rewrite scope |
| scholar_alum | Own profile, award and consent records; cannot change self identity/affiliation |
| story_producer | Assigned film and related production records; private interviews need explicit grants |
| film_reviewer | Shared film materials; scientific/final gates only when designated; raw interviews not inherited |
| auditor | Non-personal operational records, reports/audit; no writes or approvals |

Explicit read grants can share a restricted record; donor-private data additionally requires a stewardship/leadership role. Film grants inherit to production artifacts but not raw interviews/segments/quotes. New production owner receives a write grant; reviewers receive read grants. Generic edits of scripts/cuts/interviews/segments/quotes are prohibited; create a version instead. UI controls are conveniences; API policy is authoritative. Exports use the same record checks.

Prototype identities are preseeded synthetic people, not evidence of real-world identities or chapter authority. Production has no identity-provider integration. Postgres RLS is a supplied migration only; storage RLS and authenticated mutation RPCs remain unimplemented.
