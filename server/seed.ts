import fs from 'node:fs';
import { Store, stamp } from './store';
import type { Actor, Kind } from './model';
import { hash } from '../../packages/wao-safety/index.mjs';
export const identities=[
 {id:'demo-admin',name:'Demo Alex · chapter admin',role:'chapter_admin'},
 {id:'demo-leader',name:'Demo Rowan · leadership',role:'chapter_leadership'},
 {id:'demo-producer',name:'Demo Sage · story producer',role:'story_producer'},
 {id:'demo-science',name:'Demo Quinn · scientific reviewer',role:'film_reviewer'},
 {id:'demo-editor',name:'Demo River · editorial reviewer',role:'film_reviewer'},
 {id:'demo-liaison',name:'Demo Cedar · university liaison',role:'university_liaison'},
 {id:'demo-steward',name:'Demo Fern · scholar steward',role:'scholar_steward'},
 {id:'demo-development',name:'Demo Harbor · development',role:'development_steward'},
 {id:'demo-event',name:'Demo Indigo · events',role:'event_coordinator'},
 {id:'demo-volunteer',name:'Demo Linden · volunteer',role:'member_volunteer'},
 {id:'demo-scholar-a',name:'Demo Scholar Aster · scholar',role:'scholar_alum'},
 {id:'demo-scholar-b',name:'Demo Scholar Birch · scholar',role:'scholar_alum'},
 {id:'demo-auditor',name:'Demo Wren · auditor',role:'auditor'}
] as const;
export function seed(s:Store) {
 if(s.db.prepare('SELECT id FROM organizations WHERE id=?').get('arcs-la-demo')){
  seedOriginStory(s);
  return;
 }
 s.db.transaction(()=>{
  s.db.prepare('INSERT INTO organizations VALUES(?,?,1)').run('arcs-la-demo','ARCS LA WAO — unofficial synthetic workspace');
  s.db.prepare('INSERT INTO organizations VALUES(?,?,1)').run('other-demo','Other chapter — isolation fixture');
  for(const p of identities) {s.db.prepare('INSERT INTO profiles VALUES(?,?,1)').run(p.id,p.name); s.db.prepare('INSERT INTO organization_memberships VALUES(?,?,?,1)').run('arcs-la-demo',p.id,p.role);}
  s.db.prepare('INSERT INTO profiles VALUES(?,?,1)').run('other-actor','Other chapter synthetic admin');s.db.prepare('INSERT INTO organization_memberships VALUES(?,?,?,1)').run('other-demo','other-actor','chapter_admin');
  const add=(id:string,kind:Kind,data:any,access='private')=>s.insert('arcs-la-demo',kind,data,{id,access});
  const sources=JSON.parse(fs.readFileSync(new URL('../fixtures/sources.json',import.meta.url),'utf8'));
  for(const source of sources){const{id,...data}=source; add(id,'source',{...data,publisher:'ARCS Foundation Los Angeles public website',content_hash:null,classification:'public'},'chapter');}
  add('claim-history','claim',{source_id:'source-history',wording:'ARCS incorporated on September 5, 1958.',location:'Incorporation paragraph',period:'1958',state:'historical',reviewer:null,reviewed_at:null,freshness_days:3650,conflicts_with:[]},'chapter');
  add('claim-roster','claim',{source_id:'source-roster',wording:'Five institutions and six institutional units appear in the published 2024–2025 roster.',location:'Institution headings',period:'2024–2025',state:'published_unverified',reviewer:null,reviewed_at:null,freshness_days:365,conflicts_with:[]},'chapter');
  add('claim-leadership','claim',{source_id:'source-leadership',wording:'This historical board term ended in June 2017; current officers are unknown.',location:'Board term heading',period:'2016–2017',state:'stale',reviewer:null,reviewed_at:null,freshness_days:365,conflicts_with:[]},'chapter');
  add('claim-conflict','claim',{source_id:'source-members',wording:'Published membership summary has apparent category/count inconsistencies; total unknown.',location:'Summary',period:'2025–2026',state:'conflicting',reviewer:null,reviewed_at:null,freshness_days:90,conflicts_with:[]},'chapter');
  add('source-other-chapter','source',{title:'Synthetic national article on LA hostname',url:'https://los-angeles.arcsfoundation.org/',publisher:'Synthetic scope fixture',chapter_scope:'other',scope_evidence:'Synthetic body explicitly concerns another chapter; hostname does not determine scope.',publication_date:null,retrieved_at:null,period:'synthetic',content_hash:null,summary:'Other-chapter fixture excluded from LA activity.',classification:'public',retrieval_state:'synthetic',location:null},'chapter');
  add('source-research-demo','source',{title:'Synthetic lab notebook — no real findings',url:null,publisher:'Fictional Demonstration Lab',chapter_scope:'LA',scope_evidence:'Synthetic LA film fixture',publication_date:null,retrieved_at:null,period:'synthetic',content_hash:null,summary:'A fictional team compares sensor readings in a controlled demonstration. No scientific finding or clinical benefit is asserted.',classification:'public',retrieval_state:'synthetic',location:'Fixture page 1'},'chapter');
  const inst=[['caltech','California Institute of Technology'],['hmc','Harvey Mudd College'],['pomona','Pomona College'],['ucla','University of California, Los Angeles'],['usc','University of Southern California']];
  for(const[id,name]of inst)add(id,'institution',{name,period:'2024–2025',relationship:'published_period_specific',current_partnership_verified:false,source_id:'source-roster',liaison:'demo-liaison'},'chapter');
  for(const[id,institution_id,name]of [['unit-caltech','caltech','California Institute of Technology'],['unit-hmc','hmc','Harvey Mudd College'],['unit-pomona','pomona','Pomona College'],['unit-ucla','ucla','Brain Research Institute, UCLA'],['unit-keck','usc','Keck School of Medicine of USC'],['unit-viterbi','usc','USC Viterbi School of Engineering']])add(id,'unit',{name,institution_id,period:'2024–2025',source_id:'source-roster'},'chapter');
  for(const[id,name,inst,unit,actor]of [['scholar-aster','Demo Scholar Aster','caltech','unit-caltech','demo-scholar-a'],['scholar-birch','Demo Scholar Birch','usc','unit-viterbi','demo-scholar-b'],['scholar-coral','Demo Scholar Coral','usc','unit-keck',null]] as const){
   add(id,'scholar',{name,email:id+'@scholars.example',institution_id:inst,unit_id:unit,stage:inst==='caltech'?'PhD':'MD/PhD',research_summary:id==='scholar-coral'?'':'Fictional research into how sensors distinguish faint signals from background noise. This is a synthetic research scenario, not a finding.',interests:'Measurement, uncertainty, collaborative science',...(actor?{actor_id:actor}:{}),alumni:id==='scholar-birch'});
   add('aff-'+id,'affiliation',{scholar_id:id,institution_id:inst,unit_id:unit,period:'2025–2026'});
   s.grant('arcs-la-demo',id,'demo-steward');s.grant('arcs-la-demo',id,'demo-liaison');
  }
  for(const[id,scholar_id,year]of [['award-a1','scholar-aster','2024–2025'],['award-a2','scholar-aster','2025–2026'],['award-b1','scholar-birch','2025–2026']])add(id,'award',{scholar_id,academic_year:year,minor_units:500000,currency:'USD',status:'synthetic_preexisting_record',source_id:'source-research-demo'});
  for(const purpose of ['contact','interview_participation','recording','internal_review','public_screening','website_publication','name_image'])add('consent-'+purpose,'consent',{scholar_id:'scholar-aster',purpose,status:'granted',uses:['film-unseen'],reference:'Synthetic demonstration permission; not a legal release',expires_at:null});
  add('consent-revoked','consent',{scholar_id:'scholar-aster',purpose:'fundraising',status:'revoked',uses:['film-unseen'],reference:'Synthetic revoked permission fixture',expires_at:null});
  add('donor-orbit','donor',{name:'Demo Orbit Giving Circle',notes:'Entirely fictional donor. No solicitation authority.',steward:'demo-development'});
  add('designation-scholar','designation',{name:'Scholar-award support',type:'scholar_award',policy_verified:false});
  add('designation-underwriting','designation',{name:'Event / operating underwriting',type:'underwriting',policy_verified:false});
  for(const[id,status,minor,des]of [['gift-pledge','pledged',250000,'designation-scholar'],['gift-received','received',100000,'designation-scholar'],['gift-underwriting','reconciled',75000,'designation-underwriting']] as const)add(id,'gift',{donor_id:'donor-orbit',designation_id:des,minor_units:minor,currency:'USD',status,recorded_at:'2026-11-01T18:00:00.000Z'});
  add('campaign-demo','campaign',{title:'Demo stewardship notes',brief:'Draft a source-grounded acknowledgment for review; no messages sent.',status:'draft',source_ids:['source-development']});
  add('event-demo','event',{title:'Synthetic Science & Stories Evening',starts_at:'2026-12-10T02:00:00.000Z',description:'Fictional event for testing volunteer planning and film screening requests.',run_of_show:'18:00 Welcome\n18:10 Scholar conversation\n18:30 Screening only if cleared\n18:40 Questions\n19:00 Close',status:'planning',owner:'demo-event'},'chapter');
  add('task-overdue','task',{title:'Confirm synthetic event accessibility plan',assignee:'demo-volunteer',deadline:'2026-11-01T18:00:00.000Z',status:'accepted',scope:'Synthetic event operations',event_id:'event-demo'});
  add('task-film','task',{title:'Resolve music clearance before final review',assignee:'demo-producer',deadline:'2026-11-20T18:00:00.000Z',status:'accepted',scope:'Synthetic mini-film',film_id:'film-unseen'});
  add('decision-demo','decision',{title:'Keep external writes mocked',body:'Prototype review decision: no emails, publications, transactions, or paid generation jobs.',period:'2026-11',source_ids:[]},'chapter');
  add('film-unseen','film',{title:'An Unseen Question',logline:'A fictional scholar explores what we can learn from a signal we can barely see.',scholar_ids:['scholar-aster'],audience:'Chapter volunteers and science-curious viewers',uses:['public_screening'],treatment:'The person → the question → the investigation → why it matters → personal account of support → what remains unknown. Show uncertainty and team contributions; make no award-to-outcome causal claim.',target_seconds:180,owner:'demo-producer',scientific_reviewer:'demo-science',editorial_reviewer:'demo-editor',stage:'development',restrictions:'Synthetic concept only. No real voices, likenesses, or research results.'});
  add('participant-aster','participant',{film_id:'film-unseen',scholar_id:'scholar-aster',role:'fictional participant',status:'synthetic_permission'});
  add('interview-demo','interview',{film_id:'film-unseen',title:'Synthetic discovery conversation',participants:['scholar-aster'],recording_ref:null,authorization_ref:'Synthetic demonstration authorization',date:'2026-11-01',version:1,follow_up:'What is still uncertain? Who else contributed?'});
  add('segment-demo','segment',{film_id:'film-unseen',interview_id:'interview-demo',speaker:'Demo Scholar Aster (fictional)',text:'In this fictional example, the interesting part is learning what we cannot yet distinguish from noise.',start_ms:null,end_ms:null});
  add('quote-demo','quote',{film_id:'film-unseen',segment_id:'segment-demo',text:'the interesting part is learning what we cannot yet distinguish from noise.',type:'verbatim'});
  add('claim-film-demo','film_claim',{film_id:'film-unseen',wording:'The fictional team is testing a method for comparing faint sensor signals.',source_id:'source-research-demo',evidence_scope:'Synthetic notebook fixture only; not a scientific result.',classification:'hypothesis',limitations:'No actual experiment, validation, or demonstrated benefit.',plain_language:'They are exploring a way to compare very faint signals.',decision:'unreviewed',scene_ids:['scene-2'],flags:[]});
  add('script-demo','script',{film_id:'film-unseen',title:'Two-column script draft',version:1,scenes:[{id:'scene-1',order:1,purpose:'Introduce the person and uncertainty',duration:35,audio:'the interesting part is learning what we cannot yet distinguish from noise.',audio_type:'verbatim',visual:'Illustrative shapes emerge from a field of noise. No generated likeness.',visual_class:'illustrative_animation',claim_ids:[],quote_ids:['quote-demo'],asset_ids:[],notes:'Fictional quotation linked to synthetic transcript; no recorded voice exists.',status:'draft'},{id:'scene-2',order:2,purpose:'Frame the scientific question',duration:65,audio:'In this synthetic story, a team explores how to compare faint signals. The result remains unknown.',audio_type:'proposed_narration',visual:'Abstract diagram, explicitly illustrative.',visual_class:'scientific_visualization',claim_ids:['claim-film-demo'],quote_ids:[],asset_ids:[],notes:'Scientific review required.',status:'needs_review'},{id:'scene-3',order:3,purpose:'What comes next',duration:50,audio:'Further testing and careful comparison would be needed. No breakthrough is claimed.',audio_type:'proposed_narration',visual:'Handwritten questions and a blank notebook, filmed only with permission.',visual_class:'documentary_footage',claim_ids:[],quote_ids:[],asset_ids:['asset-music'],notes:'Proposed shot; not captured footage.',status:'draft'}]});
  add('shot-demo','shot',{film_id:'film-unseen',scene_id:'scene-2',shot_id:'S02-01',purpose:'Explain comparison without claiming a result',framing:'Locked wide diagram; slow reveal',subject:'Abstract synthetic signal and noise',duration:12,method:'illustrative_animation',requirements:'Diagram reference and approved narration',constraints:'No scientific-evidence claim; no fabricated microscopy',permissions:'Scientific review and institutional permission assessment',prompt:'Draft only: abstract signal/noise visualization, labeled illustration. No person or lab likeness.',continuity:'Use consistent diagram legend; continuity is not guaranteed by generation tools.',status:'draft'});
  add('asset-music','asset',{film_id:'film-unseen',title:'Placeholder music cue — not uploaded',type:'music',visual_class:null,creator:'Unknown — clearance required',provenance:'Synthetic placeholder, no media file',reference:'manual:placeholder-music',generated:false,version:1,sha256:null,credits:'Unresolved; do not release'});
  add('rights-music','asset_right',{film_id:'film-unseen',asset_id:'asset-music',basis:'License not supplied',uses:[],restrictions:'Not cleared for any distribution',status:'pending'});
  add('cut-demo','cut',{film_id:'film-unseen',title:'Synthetic cut reference, not rendered',version:1,reference:'manual:synthetic-cut-v1',sha256:hash('synthetic-cut-v1-fixture-not-media'),captions:'Not prepared',transcript:'Synthetic script only; no recorded final artifact',credits:'Demo team; music unresolved'});
  for(const[id,name]of [['google_drive','Google Drive read/import'],['gmail','Gmail draft preparation'],['google_calendar','Google Calendar proposals'],['fireflies','Authorized transcript import'],['csv','CSV review and reconciliation'],['media_handoff','Manual production handoff']])add('integration-'+id,'integration',{key:id,name,mode:id==='csv'?'local':'mock',active:false,external_writes:false,last_status:id==='gmail'?'failed_simulation':'not_connected'},'chapter');
  for(const r of s.rows('arcs-la-demo')){
   if(r.kind==='institution'||r.kind==='unit')s.grant('arcs-la-demo',r.id,'demo-liaison');
   if(r.id==='scholar-aster'||r.kind==='consent'&&r.data.scholar_id==='scholar-aster')s.grant('arcs-la-demo',r.id,'demo-producer','read');
   if(['donor','gift','campaign','designation'].includes(r.kind))s.grant('arcs-la-demo',r.id,'demo-development');
   if(r.kind==='event'||r.data.event_id)s.grant('arcs-la-demo',r.id,'demo-event');
   if(r.id==='task-overdue')s.grant('arcs-la-demo',r.id,'demo-volunteer');
   if(r.kind==='film'||r.data.film_id){s.grant('arcs-la-demo',r.id,'demo-producer');if(!['interview','segment','quote'].includes(r.kind)){s.grant('arcs-la-demo',r.id,'demo-science','read');s.grant('arcs-la-demo',r.id,'demo-editor','read');}}
  }
  s.insert('other-demo','scholar',{name:'Other chapter private scholar',secret:'must never cross organizations'},{id:'other-scholar'});
  const admin={id:'demo-admin',org:'arcs-la-demo',role:'chapter_admin',name:'Demo Alex'} as Actor;
  s.audit(admin,'workspace.seeded','arcs-la-demo',{synthetic:true,real_people_imported:false});
  // Persisted pending/expired fixtures; no execution or external writes occurred.
  const payload={recipient:'scholar-aster@scholars.example',scholar_id:'scholar-aster',subject:'Synthetic profile update request',body:'Please review your synthetic profile; this message is not sent.',simulation:'success'};
  const targets=['scholar-aster'],deps={'scholar-aster':1};
  for(const[id,expiry]of [['approval-pending','2027-01-01T00:00:00.000Z'],['approval-expired','2020-01-01T00:00:00.000Z']]){ const action='profile_update';const digest=hash({org:'arcs-la-demo',action,targets,payload,dependencies:deps,policy:'arcs-local-v1'});s.db.prepare('INSERT INTO approval_requests(id,org_id,action_type,targets,payload,payload_hash,dependencies,proposer,policy_version,status,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(id,'arcs-la-demo',action,JSON.stringify(targets),JSON.stringify(payload),digest,JSON.stringify(deps),'demo-admin','arcs-local-v1','pending_review',stamp(),expiry);}
 })();
 seedOriginStory(s);
}

function seedOriginStory(s:Store) {
 const currentCut=s.row('cut-arcs-origin','arcs-la-demo');
 if(currentCut?.data.preview_path==='/story-studio/arcs-origin-story-30s.mp4')return;
 const knownIds=['film-arcs-origin','origin-claim-1','origin-claim-2','origin-claim-3','origin-claim-4','origin-claim-5','script-arcs-origin','shot-arcs-origin-1','shot-arcs-origin-2','shot-arcs-origin-3','shot-arcs-origin-4','shot-arcs-origin-5','shot-arcs-origin-6','asset-arcs-origin-video','rights-arcs-origin-video','cut-arcs-origin','task-arcs-origin-review'];
 if(s.row('film-arcs-origin','arcs-la-demo'))s.db.transaction(()=>{
  const placeholders=knownIds.map(()=>'?').join(',');
  s.db.prepare(`DELETE FROM record_access_assignments WHERE org_id=? AND record_id IN (${placeholders})`).run('arcs-la-demo',...knownIds);
  s.db.prepare(`DELETE FROM records WHERE org_id=? AND id IN (${placeholders})`).run('arcs-la-demo',...knownIds);
 })();
 const add=(id:string,kind:Kind,data:any,access='private')=>s.insert('arcs-la-demo',kind,data,{id,access});
 const narration=[
  'Los Angeles, 1957. Sputnik crossed the sky, and four women asked: who would support America’s next generation of scientists?',
  'Florence Malouf, Irene Slagel, Alice Tyler, and Helene Wooldridge sought counsel from Caltech president Lee DuBridge—an alliance, in our telling, of egg heads and socialites.',
  'On September 5, 1958, Achievement Rewards for College Scientists was incorporated in California. Soon, 53 philanthropic leaders formed its first membership, connecting civic leadership with scientific possibility.'
 ];
 const scenes=[
  ['origin-scene-1','Establish the Sputnik-era question','A stylized Sputnik crosses a dark Southern California sky above a 1957 date card.'],
  ['origin-scene-2','Name the four founders, Caltech counsel, and creative framing','Four founder names appear on archival-style index cards with Caltech and editorial-framing labels.'],
  ['origin-scene-3','Mark incorporation and the first membership','An illustrated incorporation page transitions into 53 points and a source-credit bridge.']
 ];
 const claims=[
  ['origin-claim-1','ARCS was founded in Los Angeles after the Soviet Union launched Sputnik, by Florence Malouf, Irene Slagel, Alice Tyler, and Helene Wooldridge.','History page, founding paragraph','Historical account on the supplied ARCS Los Angeles page.','The page connects the organization’s founding context to Sputnik and names the four founders.',['origin-scene-1','origin-scene-2']],
  ['origin-claim-2','The founders sought counsel from Dr. Lee DuBridge, then president of the California Institute of Technology.','History page, founding paragraph','Historical account on the supplied ARCS Los Angeles page.','The founders consulted Caltech president Lee DuBridge.',['origin-scene-2']],
  ['origin-claim-3','Achievement Rewards for College Scientists Foundation, Inc. was incorporated in California on September 5, 1958.','History page, incorporation paragraph','Historical date stated on the supplied ARCS Los Angeles page.','ARCS was formally incorporated on September 5, 1958.',['origin-scene-3']],
  ['origin-claim-4','The co-founders brought together 53 Los Angeles philanthropic leaders with links to the aerospace industry for the first ARCS membership.','History page, first-membership paragraph','Historical account on the supplied ARCS Los Angeles page.','Fifty-three philanthropic leaders formed the first membership.',['origin-scene-3']]
 ] as const;
 s.db.transaction(()=>{
  add('film-arcs-origin','film',{title:'Egg Heads & Socialites: The Origin of ARCS Los Angeles',logline:'In the wake of Sputnik, four Los Angeles women joined scientific counsel with civic philanthropy—and built a new way to back scientific talent.',scholar_ids:[],audience:'ARCS members, scholars, alumni, university partners, and science-curious viewers',uses:['internal_review'],treatment:'A 30-second Story Studio demonstration in three acts: Sputnik raises the question, four founders join civic leadership with Caltech counsel, and incorporation leads to the first 53-member community.',target_seconds:30,owner:'demo-producer',scientific_reviewer:'demo-science',editorial_reviewer:'demo-editor',stage:'review',restrictions:'Draft preview for internal review. Original motion graphics and computer-generated narration only. “Egg heads and socialites” is user-supplied editorial framing, not a quotation from the source page. No real person likeness, archival photograph, endorsement, publication, or fundraising use is authorized.'});
  for(const [id,wording,location,evidence_scope,plain_language,scene_ids] of claims)add(id,'film_claim',{film_id:'film-arcs-origin',wording,source_id:'source-history',evidence_scope,classification:'established',limitations:'Based on the chapter’s published historical account; this draft does not independently verify the underlying archival record.',plain_language,decision:'unreviewed',scene_ids,flags:[]});
  add('script-arcs-origin','script',{film_id:'film-arcs-origin',title:'30-second origin story — Story Studio demonstration',version:1,scenes:scenes.map(([id,purpose,visual],index)=>({id,order:index+1,purpose,duration:10,audio:narration[index],audio_type:'proposed_narration',visual,visual_class:'illustrative_animation',claim_ids:index===0?['origin-claim-1']:index===1?['origin-claim-1','origin-claim-2']:['origin-claim-3','origin-claim-4'],quote_ids:[],asset_ids:['asset-arcs-origin-video'],notes:index===1?'The phrase “egg heads and socialites” was supplied by the user as editorial framing. It does not appear on the reference page and is not presented as a quotation.':'Historical narration is sourced to the ARCS Los Angeles history page; visual treatment is original illustration.',status:'needs_review'}))});
  scenes.forEach(([scene_id,purpose,subject],index)=>add(`shot-arcs-origin-${index+1}`,'shot',{film_id:'film-arcs-origin',scene_id,shot_id:`ORIGIN-${String(index+1).padStart(2,'0')}`,purpose,framing:index===0?'Slow push through a star field':'Slow documentary push with restrained parallax',subject,duration:10,method:'illustrative_animation',requirements:'Original vector motion graphics and approved narration',constraints:'Do not imply any generated visual is documentary evidence or an archival photograph.',permissions:'Internal review only; chapter/editorial approval required for distribution.',prompt:'Locally rendered vector scene; no generative media service used.',continuity:'Warm ivory, charcoal, rust, and muted teal; subtle grain throughout.',status:'captured'}));
  add('asset-arcs-origin-video','asset',{film_id:'film-arcs-origin',title:'ARCS Los Angeles origin story — 30-second demonstration',type:'animation',visual_class:'illustrative_animation',creator:'ARCS LA WAO Story Studio — local render',provenance:'Original vector motion graphics rendered locally from the approved Story Studio treatment; computer-generated generic narrator; no archival photographs or real-person likenesses.',reference:'manual:arcs-origin-story-30s-v1',generated:false,version:1,sha256:'af0df4ffe7424332aa01691448c0a13c0f2ea167e98bedbdf72c8edebc985268',credits:'Draft by ARCS LA WAO Story Studio. Historical reference: ARCS Foundation Los Angeles Founder Chapter history page.'});
  add('rights-arcs-origin-video','asset_right',{film_id:'film-arcs-origin',asset_id:'asset-arcs-origin-video',basis:'Original locally rendered motion graphics and generated narration; historical facts referenced from the public chapter history page.',uses:['internal_review'],restrictions:'Internal prototype review only. Chapter authorization, editorial review, source review, branding review, and distribution approval remain required.',status:'cleared'});
  add('cut-arcs-origin','cut',{film_id:'film-arcs-origin',title:'30-second Story Studio demonstration',version:1,reference:'manual:arcs-origin-story-30s-v1',sha256:'af0df4ffe7424332aa01691448c0a13c0f2ea167e98bedbdf72c8edebc985268',captions:'Timed English WebVTT captions included with the preview.',transcript:narration.join(' '),credits:'Original motion graphics and generic computer-generated narration. Historical reference: ARCS Foundation Los Angeles Founder Chapter history page. “Egg heads and socialites” is editorial framing supplied by the user, not a source quotation.',preview_path:'/story-studio/arcs-origin-story-30s.mp4',poster_path:'/story-studio/arcs-origin-story-30s-poster.jpg'});
  add('task-arcs-origin-review','task',{title:'Review ARCS origin story historical framing and 30-second demonstration',assignee:'demo-editor',deadline:null,status:'proposed',scope:'Confirm historical wording, the editorial use of “egg heads and socialites,” source credit, visual classifications, and distribution limits.',film_id:'film-arcs-origin'});
  for(const record of s.rows('arcs-la-demo').filter(record=>record.id==='film-arcs-origin'||record.data.film_id==='film-arcs-origin')){
   s.grant('arcs-la-demo',record.id,'demo-producer');
   if(!['interview','segment','quote'].includes(record.kind)){
    s.grant('arcs-la-demo',record.id,'demo-science','read');
    s.grant('arcs-la-demo',record.id,'demo-editor','read');
   }
  }
  const admin={id:'demo-admin',org:'arcs-la-demo',role:'chapter_admin',name:'Demo Alex'} as Actor;
  s.audit(admin,'film.origin_story_seeded','film-arcs-origin',{source:'source-history',duration_seconds:30,preview:true,published:false});
 })();
}
