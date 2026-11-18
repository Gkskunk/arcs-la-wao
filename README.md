# ARCS LA WAO

**Unofficial prototype — synthetic demonstration data.**

A local Wise Autonomous Organization for chapter operations and scholar-centered mini-film production. A human-guided AI swarm prepares drafts; authorized people approve consequential actions. No affiliation, endorsement, operational authority, or production readiness is established.

## Run locally

From this app directory, use Node 22:

```sh
nvm use 22
npm ci
npm run build
npm run dev
```

Open [http://127.0.0.1:3104](http://127.0.0.1:3104). Choose a synthetic demo identity. Demo Alex is the chapter administrator; Demo Rowan supplies independent leadership approval; Demo Sage is the story producer; Demo Quinn and Demo River are the designated scientific/editorial reviewers. These are fictional people, not current chapter officers.

`npm run dev` explicitly sets ARCS_DEMO_MODE=true and serves the built client and backend on loopback only. Rebuild after client edits; restart after server edits. No API/model keys required. Existing sibling apps/Cloudflare deployments are unchanged. The shared helper at `../packages/wao-safety` must accompany this app.

Persistent data: `.data/arcs.db` (ignored). `.env.example` documents configuration; this app does not automatically load .env files. Supply environment variables explicitly if overriding the defaults. `PORT=3104` is the default. `ARCS_DB_PATH` is optional. Back up the SQLite database only while stopped or using SQLite's backup API. The seed is idempotent, not destructive. To reset the demo, stop this app and move `.data` aside; do not alter sibling databases.

## Working flows

- Mission Control from real local records: pending approvals, overdue tasks, completeness, stale/conflicting claims, synthetic events, active films and audit.
- Scholars/alumni with separate academic-year award records; five institutions/six units; synthetic CSV roster validation, duplicate candidates, human-reviewed proposed diff, approval and administrative reconciliation.
- Synthetic donor stewardship and gift ledger with pledges/received/reconciled states, designation and integer minor units/currency. No money moves.
- Event planning, run of show, assigned volunteer tasks, exact-recipient invitation/update drafts and individually approved simulations.
- Period-labeled source/claim registry, private manual meeting notes, draft chapter briefing and leadership handover with unresolved issues.
- Eight agent roles, explicitly selected context, persistent mock jobs, structured-output validation/quarantine and draft artifacts.
- Story Studio: project/treatment, authorized transcript notes, source-linked quotes, append-only script/cut versions, two-column scenes, storyboard, scientific ledger, asset rights, purpose-specific consent and separate final-cut gates.
- Manual production handoff and permission-checked Markdown, CSV, JSON and HTML exports; captions only when valid timing exists. Release-ready is never published.

## Verify

```sh
npm run check
npm test
npm run build
# with the local app running:
npx playwright install chromium  # only if a compatible browser is not already installed
npm run test:browser
```

Optional preinstalled browser: set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its full executable path. The recorded browser run used Playwright 1.56.1 and preinstalled Chromium headless shell revision 1228 on this Mac. Node tests exercise cross-organization and role access, self/stale/expired approvals, replay/idempotency, unknown outcomes, provenance/scope, report definitions, privacy, caption timing, and film gate invalidation. Results are under `verification/`. Tests use synthetic data; the browser suite intentionally leaves synthetic workflow records in the demo database.

## Boundaries and deployment

No emails sent, external accounts connected, files uploaded, films rendered, payments enabled, paid jobs launched, repositories pushed, or sites deployed. Drive, Gmail, Calendar and Fireflies are mock adapters. Media uses authorized **manual references**, not private file storage. The model adapter is deterministic and local. Cut hashes are supplied references, not verified media bytes.

Production identity is not implemented. `NODE_ENV=production ARCS_DEMO_MODE=true npm start` is refused. Without a production identity/session, protected endpoints fail closed. Demo login is disabled outside explicit demo mode. Do not expose this demo publicly or insert real chapter data.

Future deployment requires chapter authorization first, then implementing real identity/membership provisioning, authenticated server mutations, tested Postgres/Supabase RLS, private Storage policies, retention/backups, job recovery, approved integration accounts and operational review. `migrations/002_postgres_rls_reference.sql` is a future staging migration with default-denied browser writes; **it has not been executed or tested against Supabase**. No deployment command is supplied that would accidentally publish a demo. A static Pages upload alone cannot provide this Node/SQLite backend.

Full scope/status: [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md). Review [docs/CHAPTER_DISCOVERY_CHECKLIST.md](docs/CHAPTER_DISCOVERY_CHECKLIST.md), [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md), and [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) before a production proposal.
