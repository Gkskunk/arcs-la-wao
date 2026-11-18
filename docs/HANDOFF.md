# Engineering handoff

Start with README and IMPLEMENTATION_PLAN.md. All work is local under arcs-la-wao; the shared helper is ../packages/wao-safety. Existing three MVPs and their Cloudflare sites remain unchanged. No remote repository, deployment, message, payment or media generation occurred.

Review the local app on port 3104 using a synthetic identity. The seed is idempotent and only runs with explicit demo mode. Data is in ignored .data/arcs.db. To reset, stop only this app and move its .data directory aside; do not delete unrelated databases.

Critical checks are in tests/security.test.ts and tests/browser.cjs. Browser QA uses the local UI/API, not external accounts. No production secrets are needed. Preserve package-lock and Node 22. Shared helper must accompany the app if copied.

Next phase requires chapter sponsor/discovery decisions, real auth and membership provisioning, tested Postgres migration/RLS and authenticated mutation design, private media storage/rights processes, backups/retention, job reconciliation, and approved integration accounts. Keep live execution disabled until those capabilities are separately authorized and tested. Do not publish the static frontend expecting the SQLite backend to follow it.
