import Database from 'better-sqlite3';
import fs from 'node:fs';
import { migrateSqlite } from '../../packages/wao-runtime/index.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { need, type Actor, type RecordRow, type Kind, schemas } from './model';
export const stamp=()=>new Date().toISOString();
export class Store {
 db:Database.Database;
 constructor(filename:string) { if(filename!==':memory:') fs.mkdirSync(path.dirname(filename),{recursive:true}); this.db=new Database(filename); migrateSqlite(this.db,fileURLToPath(new URL('../migrations/001_local.sql',import.meta.url))); }
 row(id:string,org:string):RecordRow|undefined { const r=this.db.prepare('SELECT * FROM records WHERE id=? AND org_id=?').get(id,org) as any; return r?{...r,data:JSON.parse(r.data)}:undefined; }
 rows(org:string,kind?:string):RecordRow[] { const r=(kind?this.db.prepare('SELECT * FROM records WHERE org_id=? AND kind=? ORDER BY created_at,id').all(org,kind):this.db.prepare('SELECT * FROM records WHERE org_id=? ORDER BY created_at,id').all(org)) as any[]; return r.map(v=>({...v,data:JSON.parse(v.data)})); }
 membership(a:Actor) { return this.db.prepare('SELECT 1 FROM organization_memberships WHERE org_id=? AND actor_id=? AND role=? AND active=1').get(a.org,a.id,a.role); }
 assigned(a:Actor,r:RecordRow,write=false):boolean { const own=this.db.prepare('SELECT permission FROM record_access_assignments WHERE org_id=? AND record_id=? AND actor_id=?').get(a.org,r.id,a.id) as any; if(own && (!write||own.permission==='write')) return true; if(r.data.film_id&&!['interview','segment','quote'].includes(r.kind)) { const film=this.row(r.data.film_id,a.org); return !!film&&this.assigned(a,film,write); } return false; }
 can(a:Actor,r:RecordRow,write=false):boolean {
  if(a.org!==r.org_id||!this.membership(a)) return false;
  if(a.role==='chapter_admin') return true;
  const raw=['interview','segment','quote'];
  if(raw.includes(r.kind)) return !!this.assigned(a,r,write);
  if(['donor','gift','campaign','designation'].includes(r.kind)) return ['chapter_leadership','development_steward'].includes(a.role) && (a.role==='chapter_leadership'||!!this.assigned(a,r,write));
  if(a.role==='chapter_leadership') return true;
  if(!write&&this.assigned(a,r,false)) return true;
  if(!write&&r.access==='chapter'&&!['scholar','contact','consent','scholar_update','award','affiliation','release_record'].includes(r.kind)) return true;
  if(a.role==='auditor') return !write&&!['scholar','contact','consent','scholar_update','donor','gift'].includes(r.kind);
  if(a.role==='scholar_alum') { const s=r.kind==='scholar'?r:r.data.scholar_id?this.row(r.data.scholar_id,a.org):undefined; return !!s&&s.data.actor_id===a.id&&(!write||['scholar','scholar_update','consent'].includes(r.kind)); }
  const groups:Record<string,string[]>={university_liaison:['scholar','institution','unit','affiliation','award','import','source','task'],scholar_steward:['scholar','scholar_update','affiliation','award','consent','task','source'],event_coordinator:['event','registration','volunteer_assignment','task'],member_volunteer:['task'],story_producer:['film','participant','interview','segment','quote','script','film_claim','shot','asset','asset_version','asset_right','project_asset','handoff','review_comment','cut','release_package'],film_reviewer:['film','script','film_claim','shot','asset','asset_right','cut','film_review','review_comment','release_package']};
  return !!groups[a.role]?.includes(r.kind)&&!!this.assigned(a,r,write);
 }
 get(a:Actor,id:string,write=false):RecordRow { const r=this.row(id,a.org); need(r,404,'Record not found'); need(this.can(a,r,write),403,'This record is outside your assigned scope'); return r; }
 list(a:Actor,kind?:string) { return this.rows(a.org,kind).filter(r=>this.can(a,r)); }
 insert(org:string,kind:Kind,data:any,options:{id?:string;access?:string}={}) { const id=options.id||randomUUID(),t=stamp(); this.db.prepare('INSERT INTO records(id,org_id,kind,data,revision,access,created_at,updated_at) VALUES(?,?,?,?,1,?,?,?)').run(id,org,kind,JSON.stringify(data),options.access||'private',t,t); return this.row(id,org)!; }
 grant(org:string,id:string,actor:string,permission='write') { this.db.prepare('INSERT OR REPLACE INTO record_access_assignments VALUES(?,?,?,?)').run(org,id,actor,permission); }
 audit(a:Actor,action:string,target:string,detail:any={}) { this.db.prepare('INSERT INTO audit_events(org_id,actor_id,action,target,detail,created_at) VALUES(?,?,?,?,?,?)').run(a.org,a.id,action,target,JSON.stringify(detail),stamp()); }
 update(r:RecordRow,data:any) { this.db.prepare('UPDATE records SET data=?,revision=revision+1,updated_at=? WHERE id=? AND org_id=? AND revision=?').run(JSON.stringify(data),stamp(),r.id,r.org_id,r.revision); return this.row(r.id,r.org_id)!; }
 validate(a:Actor,kind:Kind,data:any) {
  need(schemas[kind],400,'This record type requires a dedicated workflow'); const parsed=schemas[kind]!.parse(data);
  for(const field of ['institution_id','unit_id','donor_id','designation_id','scholar_id','film_id','interview_id','segment_id','asset_id','source_id']) if(parsed[field]) this.get(a,parsed[field]);
  for(const field of ['scholar_ids','source_ids','participants']) for(const id of parsed[field]||[]) this.get(a,id);
  for(const key of ['assignee','owner','scientific_reviewer','editorial_reviewer','steward']) if(parsed[key]) need(this.db.prepare('SELECT 1 FROM organization_memberships WHERE org_id=? AND actor_id=? AND active=1').get(a.org,parsed[key]),400,'Assigned person is not an organization member');
  if(kind==='scholar') { const u=this.get(a,parsed.unit_id); need(u.kind==='unit'&&u.data.institution_id===parsed.institution_id,400,'Institutional unit does not belong to institution'); }
  if(kind==='quote') { const s=this.get(a,parsed.segment_id); need(s.kind==='segment'&&s.data.film_id===parsed.film_id&&s.data.text.includes(parsed.text),400,'A verbatim quote must be present in its authorized transcript segment'); }
  if(kind==='segment') {const i=this.get(a,parsed.interview_id);need(i.kind==='interview'&&i.data.film_id===parsed.film_id,400,'Interview belongs to another film');}
  if(kind==='asset_right') {const asset=this.get(a,parsed.asset_id);need(asset.kind==='asset'&&asset.data.film_id===parsed.film_id,400,'Asset belongs to another film');}
  if(kind==='script') for(const scene of parsed.scenes) { need(scene.audio_type!=='verbatim'||scene.quote_ids.length,400,'Verbatim audio requires a transcript-linked quote'); for(const id of [...scene.claim_ids,...scene.quote_ids,...scene.asset_ids]) { const r=this.get(a,id); need(r.data.film_id===parsed.film_id,400,'Scene references another film'); } if(scene.audio_type==='verbatim') {const q=scene.quote_ids.map((id:string)=>this.get(a,id).data.text).join('\n');need(q.includes(scene.audio),400,'Verbatim audio must match its selected quotation');} }
  if(['asset','cut'].includes(kind)) need(/^manual:[a-zA-Z0-9_.:-]+$/.test(parsed.reference),400,'Use a manual identifier, not an external/private access link');
  if(kind==='interview'&&parsed.recording_ref) need(/^manual:[a-zA-Z0-9_.:-]+$/.test(parsed.recording_ref),400,'Use a manual recording identifier');
  if(parsed.film_id) { const f=this.get(a,parsed.film_id);need(f.kind==='film',400,'Not a film project'); }
  if(kind==='film_claim') { parsed.flags=/\b(breakthrough|revolutionary|proves|cure|first ever|caused by|because of the award)\b/i.test(parsed.wording)?['Unsupported superlative or causal wording requires review']:[]; }
  return parsed;
 }
 save(a:Actor,kind:Kind,data:any,id?:string) {
  need(this.membership(a),401,'Membership is inactive');
  const old=id?this.get(a,id,true):undefined; need(!old||old.kind===kind,400,'Record type cannot change');
  const parsed=this.validate(a,kind,data);
  if(!old) {
   const allowed:Record<string,string[]>={chapter_admin:['*'],chapter_leadership:['*'],scholar_steward:['scholar','task','consent'],university_liaison:['import'],development_steward:['donor','gift','campaign','task'],event_coordinator:['event','task'],story_producer:['film','interview','segment','quote','script','film_claim','shot','asset','asset_right','cut'],film_reviewer:['review_comment']};
   need(allowed[a.role]?.includes('*')||allowed[a.role]?.includes(kind),403,'Your role cannot create this record type');
   if(parsed.film_id) this.get(a,parsed.film_id,true);
  }
  need(!['script','cut','interview','segment','quote'].includes(kind)||!old,409,'Versioned media records are append-only; create a new version');
  if(kind==='film') need(parsed.stage!=='release_ready',409,'Use the release-readiness workflow to enter release_ready');
  if(kind==='task'&&a.role==='member_volunteer')need(old&&parsed.assignee===old.data.assignee&&parsed.title===old.data.title&&parsed.scope===old.data.scope&&parsed.deadline===old.data.deadline,403,'Volunteers may update only the state of assigned tasks');
  if(kind==='scholar'&&a.role==='scholar_alum') need(parsed.actor_id===old?.data.actor_id&&parsed.institution_id===old?.data.institution_id&&parsed.unit_id===old?.data.unit_id,403,'Self-service updates cannot change identity or affiliation');
  if(kind==='consent'&&a.role==='scholar_alum') {const s=this.get(a,parsed.scholar_id);need(s.data.actor_id===a.id,403,'Consent is outside your scope');}
  if(kind==='film_claim'&&parsed.decision==='approved') need(['chapter_admin','film_reviewer'].includes(a.role),403,'Scientific review authority required');
  if(['script','cut','interview'].includes(kind)) need(!this.rows(a.org,kind).some(r=>r.data.film_id===parsed.film_id&&r.data.version===parsed.version),409,'Version already exists');
  return this.db.transaction(()=>{
   const r=old?this.update(old,parsed):this.insert(a.org,kind,parsed); if(!old)this.grant(a.org,r.id,a.id);
   if(kind==='film') {this.grant(a.org,r.id,parsed.owner,'write');for(const actor of [parsed.scientific_reviewer,parsed.editorial_reviewer]) this.grant(a.org,r.id,actor,'read');}
   if(kind==='donor')this.grant(a.org,r.id,parsed.steward,'write');
   if(kind==='task') this.grant(a.org,r.id,parsed.assignee,'write');
   this.audit(a,old?'record.updated':'record.created',r.id,{kind,revision:r.revision});
   if(kind==='consent'&&parsed.status==='revoked') {for(const rel of this.rows(a.org,'release_record').filter(v=>v.data.scholar_ids?.includes(parsed.scholar_id))) this.insert(a.org,'task',{title:'Human remediation review: consent revoked after distribution',assignee:a.id,deadline:null,status:'proposed',scope:`Review distributed material ${rel.id}; automatic removal is not promised.`});}
   return r;
  })();
 }
}
