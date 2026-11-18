# Approval model

Supported actions: profile-update simulation, invitation simulation, administrative roster reconciliation, film-distribution simulation. Other action types are rejected. No scholar-selection, award-authorization, payment, publishing or media-generation action exists.

State vocabulary: draft, pending_review, approved, rejected, expired, cancelled, executing, succeeded, failed, outcome_unknown. Proposals enter pending_review; expired approvals are refused at decision/execution. Relevant record edits require a new proposal. UI shows expired approvals without treating them as executable. Rejection/cancellation is terminal for that proposal.

SHA-256 binds canonical organization, action, sorted unique target IDs, exact validated payload, target revisions and policy version. Creation/expiry and proposer/approver remain in the approval record. Expiry can only be set during creation (maximum 7 days); there is no edit endpoint. Decision requires independent authorized chapter admin/leadership and the exact hash. Execution rechecks membership, approver authority, current target revisions, payload integrity, consent, film snapshot, intended uses and expiry.

Execution transaction consumes the approval, enforces a unique per-approval attempt and organization/idempotency key, records result and audit. Local roster reconciliation creates administrative synthetic profiles/affiliations; it does not merge people or authorize awards. Other actions record mock-only outcomes and never send/publish. outcome_unknown cannot be retried with the same approval. A new proposal for targets with an unresolved unknown outcome is blocked until independent leadership records a reconciliation reference. The original execution remains consumed. A production uncertain outcome needs verified provider reconciliation, never blind resend.

Audit triggers reject application UPDATE/DELETE; database administrators remain trusted. No administrator-proof immutability is claimed. Approval/execution rows are protected from generic client record edits.
