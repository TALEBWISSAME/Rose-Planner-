export const STORAGE_KEY='rose-planner-v1';
export const emptyData=()=>({version:1,events:[],notes:[]});
export const localDate=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const euro=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n);
export const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&localDate(new Date(s+'T12:00:00'))===s;
export function validateData(d){
 if(!d||d.version!==1||!Array.isArray(d.events)||!Array.isArray(d.notes))throw Error('Format de sauvegarde non reconnu.');
 const ids=new Set();
 for(const e of d.events){if(!e||typeof e.id!=='string'||ids.has(e.id)||!['service','appointment'].includes(e.type)||typeof e.client!=='string'||!e.client.trim()||!validDate(e.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)||!['planned','done','cancelled'].includes(e.status)||typeof e.paid!=='boolean'||!Number.isFinite(e.price)||e.price<0||e.price>1000000||![1,2,3].includes(e.reminder)||typeof e.notes!=='string'||typeof e.address!=='string'||typeof e.duration!=='string')throw Error('Une prestation ou un rendez-vous est invalide.');ids.add(e.id);}
 for(const n of d.notes){if(!n||typeof n.id!=='string'||ids.has(n.id)||typeof n.title!=='string'||!n.title.trim()||typeof n.text!=='string')throw Error('Une note est invalide.');ids.add(n.id);}return d;
}
export function monthlyStats(events,month){const services=events.filter(e=>e.type==='service'&&e.date.startsWith(month));const done=services.filter(e=>e.status==='done');return{services,count:done.length,total:done.reduce((a,e)=>a+e.price,0),paid:done.filter(e=>e.paid).reduce((a,e)=>a+e.price,0),unpaid:done.filter(e=>!e.paid).reduce((a,e)=>a+e.price,0)};}
