# Implementation status

| Area | Status | What is actually implemented |
|---|---|---|
| Local application | Working local | 11 responsive workspaces, persistent SQLite, same-origin API, explicit synthetic demo identities |
| Organization/assignment access | Tested locally | Server-side scoped repository, role/grant checks, private donor/interview/profile access, export checks |
| Production auth | Blocked / not implemented | Production rejects demo switching; protected API fails closed without session; no live identity provider |
| Postgres RLS | Supplied, untested | Future Supabase migration with SELECT policies, default-denied browser writes; no project or credentials configured |
| Scholar/university flow | Working local | Profiles, separate award fixtures, hierarchy, CSV validation, candidate duplicates, explicit diff and approved administrative reconciliation |
| Stewardship/events | Working local + mocks | Synthetic donors, gifts/states/designations, campaigns, event run-of-show, assigned tasks, exact-recipient approval and simulated delivery |
| Evidence | Working local | Scoped sources/claims, period/retrieval labels, historical/stale/conflicting fixtures; one source not retrieved |
| Meeting imports | Partial local | Private authorized manual notes; selected agent context; extracted tasks remain draft proposals, no automated ingestion |
| Agents/jobs | Mock + durable local | 8 roles, queued runs, structured-output validation/quarantine, persistent drafts; deterministic adapter, no paid/live models or autonomous worker |
| Approval engine | Tested local | Canonical payload/target revisions, independent approval, expiry, rechecks, transactional consumption, execution ledger, replay rejection, unknown outcomes and independent reconciliation |
| Reports | Working local | Distinct scholars/award years, currency/designation-separated gifts, explicit response denominator, completeness/tasks/claims/stages, draft briefing/handover |
| Story Studio | Working local | Film project, transcript notes and linked quotes, append-only script/cut versions, two-column script, claims, storyboard, references/rights, separate snapshot reviews/blockers |
| Media files | Partial / references only | Manual identifiers and self-reported hashes; no uploads, private object storage, expiring downloads, byte verification or render engine |
| Release preparation | Working local + mock | Separate gates, consent/rights/claim blockers, changed-cut invalidation, release package, release-ready distinct from publication; all distribution simulated |
| Exports | Working local | Markdown, CSV, JSON, HTML and timing-validated SRT/VTT; permission checks and formula escaping |
| Integrations | Mock / disabled | Drive/Gmail/Calendar/Fireflies fixtures, local CSV/manual handoff; no personal accounts or MCP services connected |
| Advanced administration | Incomplete | No complete contact/registration CRUD, retention scheduler, verified identity onboarding, arbitrary grant editor, search index, distributed worker or derivative-version graph |
| Transactions/publishing | Disabled | No payments, donations, receipts, scholar selection, award authorization, external writes, public deployment or paid generation |

Test evidence: verification/security-tests.txt, browser-results.json, build.txt. See README for exact executed commands. Supabase SQL, real provider delivery, real media files, paid models, production authentication, distributed concurrency and chapter operational/legal policy were not tested.
