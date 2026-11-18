# ARCS LA WAO — local engineering report

Review date: November 9, 2026 (America/New_York).

## 1. What was built

A runnable local **Wise Autonomous Organization**, using a **human-guided AI swarm** model, for synthetic Los Angeles chapter operations and scholar-centered mini-film coordination. All eleven workspaces are implemented. The prominent demonstration notice is “Unofficial prototype — synthetic demonstration data.” No authorized affiliation or production readiness is implied.

Persistent vertical slices cover scholar records and award years; institutional hierarchy; validated roster diff/reconciliation; donor/gift/designation distinctions; event/run-of-show/tasks; historical source registry; private notes; deterministic reporting/briefing/handover; structured mock agent jobs; exact-payload approvals and execution ledger; Story Studio projects/transcripts/quotes/scripts/claims/shots/rights/consent/reviews/cuts/handoffs/exports/release blockers.

## 2. Architecture and major files

Existing workspace stack reused: Node 22, Express and SQLite, extended with TypeScript/Zod and a Vite client. No sibling app was changed.

- `server/store.ts`: organization/role/assignment policy, record schemas, revisions, persistence and grants.
- `server/workflows.ts`: approvals, reconciliation, mock execution, reports, film gates and exports.
- `server/index.ts`: same-origin API, explicit demo sessions, fail-closed production behavior, jobs and static server.
- `server/adapters.ts`: typed mock integration/model boundary and structured-output validation.
- `server/model.ts`, `server/seed.ts`, `fixtures/sources.json`: request models, fictional chapter data and actual research retrieval state.
- `client/main.ts`, `client/style.css`: responsive workspaces, forms, exact-payload review, versioned film interface.
- `migrations/001_local.sql`: executed local schema; `002_postgres_rls_reference.sql`: supplied future Supabase/RLS migration, not executed.
- `../packages/wao-safety/index.mjs`: reusable canonical hashing, CSV formula protection and HTML escaping.
- `tests/security.test.ts`, `tests/browser.cjs`: executable verification.

The record store intentionally consolidates domain tables into organization-scoped JSON records with strict schemas, while identity, grants, approvals, attempts, jobs and audit use dedicated tables. See DATA_DICTIONARY.md.

## 3. Exact setup and run commands

```sh
cd '/Users/gregkerr/Documents/ChatGPT/Github Production Sites/arcs-la-wao'
nvm use 22
npm ci
npm run build
npm run dev
```

Review at http://127.0.0.1:3104/. Choose Demo Alex for admin, Demo Rowan for independent leadership approval, Demo Sage for film production, Demo Quinn for science, Demo River for editorial/final-artifact review. These are fictional identities. Local data persists in ignored `.data/arcs.db`. The shared safety folder must accompany the app when moving it. The supplied environment example contains no secrets; environment values are supplied explicitly.

## 4. Tests executed and results

- `npm run build`: TypeScript checking and Vite production client build passed.
- `npm test`: **38 passed, 0 failed**. Includes the 29 requested core cases, roster reconciliation/persistence, malformed outputs, changed targets/authority, private sources, append-only audit behavior, unknown denominators, independent unknown-outcome reconciliation, production rejection of previously valid demo cookies, and prevention of sibling resends after uncertain outcomes.
- `npm run test:browser`: all eleven navigation destinations, desktop/mobile presentation, persistent demo notice, roster diff, independent approval and simulation, event creation, mock job, saved script version, production export and mobile navigation passed. No browser console/page errors, failed requests, or external network requests in the recorded passing run.
- Browser environment: Playwright 1.56.1 with preinstalled Chromium headless shell revision 1228. Exact browser invocation:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/gregkerr/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell npm run test:browser
```

Evidence: `verification/build.txt`, `security-tests.txt`, `browser-results.json`, `browser-run.txt`, and desktop/mobile PNGs. Tests use synthetic data. Browser verification exercises selected vertical slices, not every form/role combination. The SQL reference was not run against Postgres/Supabase. No live identity provider, real model, external delivery, media file, production concurrency/penetration test, or legal/operating policy was tested.

## 5. Demonstrated workflows

1. CSV roster: validate hierarchy and fields → detect duplicate candidates → choose explicit row decisions → propose exact diff → independent approval → local administrative reconciliation → inspect audit. No automatic merges, scholar selection, or award authorization.
2. Profile/event communications: preview exact synthetic recipient/body → independently review hash/targets → simulate success/failure/uncertainty → record attempt. Consent/revision/expiry/authority changes block execution.
3. Chapter operations: create fictional event, run of show and tasks; distinguish pledges/received/reconciled gifts and designations; produce date/year-specific briefing and handover with source periods and unresolved issues.
4. Agent draft: select authorized records → persist queued request → explicitly run deterministic mock → validate output → retain draft and unknowns. Malformed output is quarantined.
5. Film: reuse scholar identity → inspect authorized transcript and exact quote context → save scene-based script versions → plan shots → review claims/rights/consent → bind separate gates to current cut/materials → prepare release package and manual handoff → export permitted production materials. New cuts invalidate prior final-cut gates. Caption export requires supplied timing. Release-ready never publishes.

## 6. Mocked or disabled features

All external communications, calendar/Drive/Fireflies connections, model/media services and distribution are mocked or disabled. Routing labels do not deliver anything. No emails, account connections, private-account imports, paid jobs, generated voices/likenesses, rendering, payments, donation collection, tax receipts, public publishing or deployments occurred. No repository was pushed. Manual asset references and user-supplied hashes do not verify file contents.

## 7. Remaining limitations and decisions

The secure local vertical slice is complete; this is not a full production chapter system. Production auth/membership provisioning, tested database RLS/mutation APIs, private uploads/expiring downloads, automatic retention/erasure, real integration accounts, distributed worker/recovery, complete contact/registration administration and derivative-film lineage remain future work. Jobs are durable but explicitly drained; crashed running jobs need operator reconciliation. Demo identities do not establish real-world authority. Application audit is append-only but not administrator-proof.

See IMPLEMENTATION_STATUS.md for local/mock/incomplete/blocked distinctions and THREAT_MODEL.md for practical security limits. Public source retrieval does not make a historical claim current, nor grant republication permission.

## 8. Required chapter authorization before production

Verify the chapter sponsor/current leaders; national/chapter system ownership; current award cycle/institutions; accounting source of truth; membership/access delegation; funding-designation policies; privacy/retention/consent/media permissions; branding/public release authority; chapter-approved integration accounts; budget/support/security owner; and launch/rollback authority. Then implement and test production infrastructure in staging. Each live communication, external write, paid job and release needs explicit approval. No credentials alone may activate execution.
