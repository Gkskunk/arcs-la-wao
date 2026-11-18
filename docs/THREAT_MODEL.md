# Threat model

Assets: donor-private notes, scholar profiles, raw interviews, consent, approval payloads, exact artifact versions and evidence provenance. Actors include assigned volunteers, malicious members, untrusted source text, faulty adapters, and an operator with direct SQLite access.

Controls: organization-filtered repository reads/writes, active membership checks, role/assignment checks, synthetic-only emails, strict Zod request objects, body limits, HttpOnly SameSite=Strict random sessions stored as hashes, same-origin mutation checks, no CORS, CSP, no request-body logging, escaped HTML, neutralized CSV formulas, manual-only media references, canonical payload hashes, revision-bound approvals, independent reviewers, unique execution keys, transactional consumption, explicit unknown states, structured-output quarantine and no runtime outbound providers.

Sources are untrusted data. They cannot select recipients, tools, permissions or approvers. No runtime URL ingestion exists, eliminating an SSRF fetch surface. Asset references use manual identifiers; the app does not fetch or infer their contents. Raw media uploads/private storage are not implemented.

Limits: demo identities are intentionally not real authentication. Admin/operator has trusted database access; audit is not administrator-proof. No production Supabase/Auth/Storage integration, penetration test, distributed concurrency load test or legal review has occurred. There is no public exposure. Missing production authentication fails closed. Running jobs are not auto-retried. Real retention, erasure, backups and incident response require chapter decisions before production.
