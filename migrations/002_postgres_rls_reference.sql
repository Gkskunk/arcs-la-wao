-- FUTURE SUPABASE TARGET. Not executed locally. No production connection is configured.
-- Run only after chapter authorization, authenticated API integration and a staging RLS test.
-- Deliberately no browser mutation policies: writes fail closed pending narrow API/RPC design.
BEGIN;
CREATE TABLE public.organizations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL);
CREATE TABLE public.profiles(id uuid PRIMARY KEY REFERENCES auth.users(id), display_name text NOT NULL);
CREATE TABLE public.organization_memberships(org_id uuid NOT NULL REFERENCES public.organizations(id), actor_id uuid NOT NULL REFERENCES public.profiles(id), role text NOT NULL CHECK(role IN ('chapter_admin','chapter_leadership','development_steward','university_liaison','scholar_steward','event_coordinator','member_volunteer','scholar_alum','story_producer','film_reviewer','auditor')), active boolean NOT NULL DEFAULT true, PRIMARY KEY(org_id,actor_id));
CREATE TABLE public.records(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES public.organizations(id), kind text NOT NULL, data jsonb NOT NULL, revision integer NOT NULL DEFAULT 1 CHECK(revision>0), access text NOT NULL DEFAULT 'private' CHECK(access IN ('private','chapter')), synthetic boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(org_id,id));
CREATE INDEX ON public.records(org_id,kind);
CREATE TABLE public.record_access_assignments(org_id uuid NOT NULL, record_id uuid NOT NULL, actor_id uuid NOT NULL, permission text NOT NULL CHECK(permission IN ('read','write')), PRIMARY KEY(org_id,record_id,actor_id), FOREIGN KEY(org_id,record_id) REFERENCES public.records(org_id,id), FOREIGN KEY(org_id,actor_id) REFERENCES public.organization_memberships(org_id,actor_id));
CREATE TABLE public.approval_requests(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),org_id uuid NOT NULL REFERENCES public.organizations(id), action_type text NOT NULL, targets jsonb NOT NULL, payload jsonb NOT NULL, payload_hash text NOT NULL CHECK(length(payload_hash)=64), dependencies jsonb NOT NULL, proposer uuid NOT NULL, approver uuid, policy_version text NOT NULL, status text NOT NULL CHECK(status IN ('draft','pending_review','approved','rejected','expired','cancelled','executing','succeeded','failed','outcome_unknown')), created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, decided_at timestamptz, UNIQUE(org_id,id), FOREIGN KEY(org_id,proposer) REFERENCES public.organization_memberships(org_id,actor_id), FOREIGN KEY(org_id,approver) REFERENCES public.organization_memberships(org_id,actor_id));
CREATE TABLE public.execution_attempts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL, approval_id uuid NOT NULL UNIQUE, idempotency_key text NOT NULL, payload_hash text NOT NULL, adapter text NOT NULL, status text NOT NULL, result jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(org_id,idempotency_key), FOREIGN KEY(org_id,approval_id) REFERENCES public.approval_requests(org_id,id));
CREATE TABLE public.job_queue(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),org_id uuid NOT NULL REFERENCES public.organizations(id),actor_id uuid NOT NULL,role text NOT NULL,objective text NOT NULL,context jsonb NOT NULL,status text NOT NULL,output jsonb,error text,created_at timestamptz NOT NULL DEFAULT now(),finished_at timestamptz,FOREIGN KEY(org_id,actor_id) REFERENCES public.organization_memberships(org_id,actor_id));
CREATE TABLE public.audit_events(seq bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,org_id uuid NOT NULL REFERENCES public.organizations(id),actor_id uuid NOT NULL,action text NOT NULL,target text NOT NULL,detail jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE FUNCTION public.arcs_role(p_org uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$ SELECT role FROM public.organization_memberships WHERE org_id=p_org AND actor_id=auth.uid() AND active $$;
CREATE FUNCTION public.arcs_can_read(p_org uuid,p_record uuid) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r public.records; role_name text; assigned boolean; parent_assigned boolean;
BEGIN
 role_name:=public.arcs_role(p_org); IF role_name IS NULL THEN RETURN false; END IF;
 SELECT * INTO r FROM public.records WHERE org_id=p_org AND id=p_record; IF NOT FOUND THEN RETURN false; END IF;
 IF role_name='chapter_admin' THEN RETURN true; END IF;
 SELECT EXISTS(SELECT 1 FROM public.record_access_assignments WHERE org_id=p_org AND record_id=p_record AND actor_id=auth.uid()) INTO assigned;
 IF r.kind IN ('interview','segment','quote') THEN RETURN assigned; END IF;
 IF r.kind IN ('donor','gift','campaign','designation') THEN RETURN role_name='chapter_leadership' OR (role_name='development_steward' AND assigned); END IF;
 IF role_name='chapter_leadership' OR assigned THEN RETURN true; END IF;
 IF r.access='chapter' AND r.kind NOT IN ('scholar','contact','consent','scholar_update','award','affiliation','release_record') THEN RETURN true; END IF;
 IF role_name='auditor' THEN RETURN r.kind NOT IN ('scholar','contact','consent','scholar_update','donor','gift'); END IF;
 IF role_name='scholar_alum' THEN
  IF r.kind='scholar' THEN RETURN r.data->>'actor_id'=auth.uid()::text; END IF;
  RETURN EXISTS(SELECT 1 FROM public.records scholar WHERE scholar.org_id=p_org AND scholar.kind='scholar' AND scholar.id::text=r.data->>'scholar_id' AND scholar.data->>'actor_id'=auth.uid()::text);
 END IF;
 SELECT EXISTS(SELECT 1 FROM public.record_access_assignments a JOIN public.records f ON f.org_id=a.org_id AND f.id=a.record_id AND f.kind='film' WHERE a.org_id=p_org AND a.actor_id=auth.uid() AND f.id::text=r.data->>'film_id') INTO parent_assigned;
 RETURN parent_assigned AND role_name IN ('story_producer','film_reviewer');
END $$;
CREATE FUNCTION public.arcs_audit_append_only() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Audit events are append-only'; END $$;
CREATE TRIGGER audit_append_only BEFORE UPDATE OR DELETE ON public.audit_events FOR EACH ROW EXECUTE FUNCTION public.arcs_audit_append_only();
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_access_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY organization_read ON public.organizations FOR SELECT TO authenticated USING(public.arcs_role(id) IS NOT NULL);
CREATE POLICY own_profile_read ON public.profiles FOR SELECT TO authenticated USING(id=auth.uid());
CREATE POLICY own_membership_read ON public.organization_memberships FOR SELECT TO authenticated USING(actor_id=auth.uid() OR public.arcs_role(org_id) IN ('chapter_admin','chapter_leadership'));
CREATE POLICY scoped_record_read ON public.records FOR SELECT TO authenticated USING(public.arcs_can_read(org_id,id));
CREATE POLICY own_assignment_read ON public.record_access_assignments FOR SELECT TO authenticated USING(actor_id=auth.uid() AND public.arcs_role(org_id) IS NOT NULL);
-- Approval payloads stay restricted to chapter approvers until an assignment-safe RPC is integrated.
CREATE POLICY approval_read ON public.approval_requests FOR SELECT TO authenticated USING(public.arcs_role(org_id) IN ('chapter_admin','chapter_leadership'));
CREATE POLICY execution_read ON public.execution_attempts FOR SELECT TO authenticated USING(public.arcs_role(org_id) IN ('chapter_admin','chapter_leadership','auditor'));
CREATE POLICY own_job_read ON public.job_queue FOR SELECT TO authenticated USING(actor_id=auth.uid() AND public.arcs_role(org_id) IS NOT NULL);
CREATE POLICY audit_read ON public.audit_events FOR SELECT TO authenticated USING(public.arcs_role(org_id) IN ('chapter_admin','chapter_leadership','auditor'));
REVOKE ALL ON public.organizations,public.profiles,public.organization_memberships,public.records,public.record_access_assignments,public.approval_requests,public.execution_attempts,public.job_queue,public.audit_events FROM anon,authenticated;
GRANT SELECT ON public.organizations,public.profiles,public.organization_memberships,public.records,public.record_access_assignments,public.approval_requests,public.execution_attempts,public.job_queue,public.audit_events TO authenticated;
REVOKE ALL ON FUNCTION public.arcs_role(uuid),public.arcs_can_read(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.arcs_role(uuid),public.arcs_can_read(uuid,uuid) TO authenticated;
COMMIT;
-- Table owner/service-role access bypasses RLS and is trusted; never expose such credentials.
-- Private object Storage, signed-download policies and mutation RPCs are not implemented here.
