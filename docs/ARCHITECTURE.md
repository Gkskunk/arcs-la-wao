# Architecture

The existing workspace uses Express and better-sqlite3; ARCS reuses that stack rather than introducing a parallel Next/Supabase service. TypeScript/Zod define request schemas and adapter output; Vite builds the responsive framework-free TypeScript client. Shared `../packages/wao-safety/index.mjs` supplies canonical SHA-256 payload hashing, CSV escaping and HTML escaping. Existing WAO apps are unmodified.

`server/index.ts`: same-origin API, HttpOnly demo sessions, security headers, scoped routes, durable mock jobs and static client. `store.ts`: repository access checks, record validation, revisions, organization-filtered SQL, grants and audit. `workflows.ts`: roster, approvals, execution, deterministic reports, film reviews and exports. `adapters.ts`: typed provider-neutral mock contract. `seed.ts`: fictional records and permission fixtures. `migrations/001_local.sql`: applied local SQLite schema. `002_postgres_rls_reference.sql`: future Supabase schema and deny-by-default RLS, not executed or connected.

SQLite provides durable local data and transactional transitions. It has no native Postgres RLS; all request access passes the repository layer. JSON-backed organization-scoped `records` consolidate domain entities while core identity, grants, approvals, execution, jobs and audit use dedicated relational tables. See DATA_DICTIONARY.

Persistent jobs move queued → running → succeeded/quarantined; user explicitly drains a job. This is a local durable queue, not a production distributed worker. Live adapters are rejected. Crashed running jobs require operator reconciliation; there is no automatic retry.

Node binds 127.0.0.1 only. No outbound runtime HTTP calls or analytics. Demo role switching requires ARCS_DEMO_MODE=true and is refused in NODE_ENV=production. Production auth is intentionally unimplemented and private endpoints fail closed. No public deployment occurred.
