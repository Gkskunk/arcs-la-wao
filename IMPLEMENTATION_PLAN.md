# ARCS LA WAO local implementation plan

1. Reuse the existing Node 22 / Express / SQLite foundation and introduce shared canonical-payload/export helpers. Build an isolated app; preserve all three existing apps.
2. Add versioned migrations, synthetic chapter fixtures, organization- and assignment-scoped access, explicit demo sessions, audit records, exact-payload approvals, idempotent mock execution, and durable jobs.
3. Implement chapter record workspaces, reviewed roster reconciliation, consent-aware communications, event and development workflows, deterministic reporting, and provenance registry.
4. Implement Story Studio with transcript-linked quotations, versioned scripts/cuts, claim and rights review, purpose-specific consent, invalidated approvals, release blockers, and permission-checked exports.
5. Build the responsive interface, run security/workflow and browser checks, document tested versus mocked versus incomplete capabilities, and leave a runnable local review environment. No deployment, external communications, account connections, paid jobs, scholar selection, or financial actions.

Stack choice: existing Express + better-sqlite3, TypeScript with Zod, Vite for the client, Node test runner and Playwright. SQLite authorization is enforced by the application repository layer. A separate Postgres migration supplies deny-by-default RLS for a future authenticated deployment; it is not represented as locally executed RLS.
