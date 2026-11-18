# Data dictionary and consolidation

Dedicated relational tables: organizations; profiles (person/actor identity); organization_memberships (one active role per actor/org; consolidates role_assignments); record_access_assignments; sessions (hashed tokens and expiry); approval_requests; execution_attempts; job_queue (agent_runs); audit_events; schema_migrations.

Organization-scoped versioned records consolidate the remaining logical tables:

| Record kind | Logical entity |
|---|---|
| institution, unit | institutions and institutional_units, unit.institution_id hierarchy |
| contact, chapter_membership | contacts and chapter memberships independent of people |
| scholar, affiliation, award, scholar_update | scholars, scholar_affiliations, scholar_awards (academic year), scholar_updates/alumni updates |
| consent | consent_records (scholar, purpose, use list, grant/revoke, expiry, reference) |
| donor, designation, gift, campaign | donor_profiles, funding_designations, gifts, campaigns |
| event, registration, volunteer_assignment, task | events, event_registrations, volunteer_assignments, tasks |
| source, claim, decision, import, integration | source_documents, source_claims, decisions/import provenance, integration_connections |
| agent_artifact | structured draft artifact; actor, scope, provider and local mock metadata |
| film, participant | film_projects, film_participants; scholar links reuse the scholar record |
| interview, segment, quote | interviews, transcript_segments, quote_selections; missing timecodes null |
| script | script_versions with ordered embedded script_scenes; no separate duplicate scene table |
| film_claim, shot | film_claims and storyboard_shots |
| asset, asset_version, asset_right, project_asset | media_assets, asset_versions, asset_rights, project_asset_links |
| handoff, film_review, review_comment, cut | production_handoffs, film_reviews, review_comments, cut_versions |
| release_package, release_record | release_packages versus actual publication/distribution records |

Each record has ID, org, kind, data, revision, access classification, synthetic flag, created/updated timestamps. Supported API schemas are in server/model.ts. Not every logical entity has a complete CRUD interface: contact management, registrations, asset-file versions and actual release records are future extensions.

Money uses integer minor_units plus ISO currency. Pledged, received and reconciled are distinct states. Awards are preexisting synthetic records, not authorizations. Reports deduplicate scholar IDs. Source records separate chapter_scope, scope_evidence, period, actual retrieval timestamp, publication date, content hash and access classification. Public retrieval does not imply consent to republish a person. Script/cut versions and exact snapshot hashes distinguish draft/script review from final release review.
