import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import pg from 'pg';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||3000);
const DATABASE_URL=process.env.DATABASE_URL||'';
const SOURCE='https://app-p7vcr6.v2.appdeploy.ai';
const pool=DATABASE_URL?new pg.Pool({connectionString:DATABASE_URL,ssl:DATABASE_URL.includes('localhost')?false:{rejectUnauthorized:false}}):null;
const qualitySeed=JSON.parse(await fs.readFile(path.join(__dirname,'data/quality.json'),'utf8'));
let mem={};
const json=(res,status,obj,headers={})=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8',...headers});res.end(JSON.stringify(obj))};
const body=async req=>{let s='';for await(const c of req)s+=c;try{return JSON.parse(s||'{}')}catch{return {}}};
async function initDb(){if(!pool)return;await pool.query('create table if not exists qa_state (key text primary key, value jsonb not null)')}
async function getState(k,d=null){if(!pool)return k in mem?mem[k]:d;const r=await pool.query('select value from qa_state where key=$1',[k]);return r.rows[0]?.value??d}
async function setState(k,v){if(!pool){mem[k]=v;return}await pool.query('insert into qa_state(key,value) values($1,$2::jsonb) on conflict(key) do update set value=excluded.value',[k,JSON.stringify(v)])}
async function fetchJson(url,opts={}){const r=await fetch(url,{...opts,headers:{'content-type':'application/json',...(opts.headers||{})}});if(!r.ok)throw new Error(`${r.status} ${url}`);return r.json()}
async function migrateYear(year){const qs=`year=${encodeURIComponent(year)}`;const endpoints=[['returns',`/api/data?${qs}`],['processing',`/api/processing?${qs}`],['audits',`/api/audits?${qs}`],['quality',`/api/quality?${qs}`],['focus',`/api/monthly-focus?${qs}`],['experiments',`/api/experiments?${qs}`],['foreign',`/api/foreign?${qs}`],['kpi',`/api/kpi?${qs}`]];const summary={year};for(const [name,ep] of endpoints){try{const d=await fetchJson(SOURCE+ep);if(name==='returns')await setState(`returns:${year}`,d.rows||[]);if(name==='processing')await setState(`processing:${year}`,d.monthly||Array(12).fill(0));if(name==='audits'){await setState(`audits:${year}`,d.rows||[]);await setState(`auditNcr:${year}`,d.nonconformMonthly||Array(12).fill(0))}if(name==='quality')await setState(`quality:${year}`,d.rows||[]);if(name==='focus')await setState(`focus:${year}`,d.rows||[]);if(name==='experiments')await setState(`experiments:${year}`,d.rows||[]);if(name==='foreign'){await setState(`foreign:${year}`,d.rows||[]);await setState(`foreignActual:${year}`,d.actual??0);await setState(`foreignTarget:${year}`,d.target??5)}if(name==='kpi')await setState(`kpi:${year}`,d);summary[name]=Array.isArray(d.rows)?d.rows.length:(Array.isArray(d.monthly)?d.monthly.length:'ok')}catch(e){summary[name]=`error:${e.message}`}}
 const prod=[];for(let m=1;m<=12;m++){try{const d=await fetchJson(`${SOURCE}/api/production?year=${year}&month=${m}`);prod.push({month:m,rows:d.rows||[]})}catch{prod.push({month:m,rows:[]})}}await setState(`production:${year}`,prod);summary.production=prod.reduce((s,x)=>s+x.rows.length,0);return summary}
async function migrateAll(){let years=[2026];try{const y=await fetchJson(SOURCE+'/api/years');if(Array.isArray(y.years)&&y.years.length)years=y.years}catch{};const out=[];for(const year of years)out.push(await migrateYear(year));await setState('migratedAt',new Date().toISOString());await setState('years',years);return out}
await initDb();
try{const migrated=await getState('migratedAt',null);if(!migrated){const r=await migrateAll();console.log('Initial AppDeploy migration complete',JSON.stringify(r))}}catch(e){console.error('Initial migration failed',e.message)}
function mime(p){return p.endsWith('.html')?'text/html; charset=utf-8':p.endsWith('.css')?'text/css; charset=utf-8':p.endsWith('.js')?'application/javascript; charset=utf-8':'application/octet-stream'}
async function serve(req,res){let p=new URL(req.url,'http://x').pathname;if(p==='/')p='/index.html';const f=path.normalize(path.join(__dirname,'public',p));if(!f.startsWith(path.join(__dirname,'public')))return json(res,403,{error:'forbidden'});try{const b=await fs.readFile(f);res.writeHead(200,{'content-type':mime(f)});res.end(b)}catch{json(res,404,{error:'not found'})}}
const yearOf=u=>Number(u.searchParams.get('year'))||2026;
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://x'),p=u.pathname,year=yearOf(u);
 if(p==='/health')return json(res,200,{ok:true,db:!!pool,migratedAt:await getState('migratedAt',null)});
 if(p==='/api/migrate'&&req.method==='POST')return json(res,200,{ok:true,summary:await migrateAll()});
 if(p==='/api/admin/login'&&req.method==='POST')return json(res,200,{ok:true});
 if(p==='/api/years')return json(res,200,{years:await getState('years',[2026])});
 if(p==='/api/data')return json(res,200,{rows:await getState(`returns:${year}`,[])});
 if(p==='/api/processing')return json(res,200,{year,monthly:await getState(`processing:${year}`,Array(12).fill(0))});
 if(p==='/api/production'){const m=Number(u.searchParams.get('month'));const all=await getState(`production:${year}`,[]);return json(res,200,{year,month:m,rows:all.find(x=>+x.month===m)?.rows||[]})}
 if(p==='/api/quality'&&req.method==='GET')return json(res,200,{year,rows:await getState(`quality:${year}`,year===2026?qualitySeed:[])});
 if(p==='/api/monthly-focus'&&req.method==='GET')return json(res,200,{year,rows:await getState(`focus:${year}`,[])});
 if(p==='/api/experiments'&&req.method==='GET')return json(res,200,{year,rows:await getState(`experiments:${year}`,[])});
 if(p==='/api/audits'&&req.method==='GET')return json(res,200,{year,rows:await getState(`audits:${year}`,[]),nonconformMonthly:await getState(`auditNcr:${year}`,Array(12).fill(0))});
 if((p==='/api/foreign'||p==='/api/foreign/list')){let yy=year;if(req.method==='POST'){const b=await body(req);yy=Number(b.year)||year}return json(res,200,{rows:await getState(`foreign:${yy}`,[]),actual:await getState(`foreignActual:${yy}`,0),target:await getState(`foreignTarget:${yy}`,5)})}
 if(p==='/api/kpi')return json(res,200,await getState(`kpi:${year}`,{year,auditAchievement:0,trainingActual:0,trainingAchievement:0}));
 if(p==='/api/quality/save'&&req.method==='POST'){const b=await body(req),yy=Number(b.year)||2026;let a=await getState(`quality:${yy}`,[]);const row={id:b.id||`q-${Date.now()}`,no:+b.no,date:b.date||'',completedDate:b.completedDate||'',location:b.location||'',status:b.status||'미정',request:b.request||'',note:b.note||'',before:b.before||'',after:b.after||''};a=a.filter(x=>x.id!==row.id&&+x.no!==row.no);a.push(row);await setState(`quality:${yy}`,a);return json(res,200,{ok:true,row})}
 if(p==='/api/monthly-focus/save'&&req.method==='POST'){const b=await body(req),yy=Number(b.year)||2026;let a=await getState(`focus:${yy}`,[]);const row={id:b.id||`f-${Date.now()}`,month:+b.month,educationCount:+b.educationCount||0,educationContent:b.educationContent||'',hygieneCount:+b.hygieneCount||0,hygieneContent:b.hygieneContent||'',otherContent:b.otherContent||''};a=a.filter(x=>+x.month!==row.month);a.push(row);await setState(`focus:${yy}`,a);return json(res,200,{ok:true,row})}
 if(p==='/api/processing/save'&&req.method==='POST'){const b=await body(req),yy=Number(b.year)||2026;await setState(`processing:${yy}`,Array.isArray(b.monthly)?b.monthly:Array(12).fill(0));return json(res,200,{ok:true})}
 if(p==='/api/audits/nonconform'&&req.method==='POST'){const b=await body(req),yy=Number(b.year)||2026,m=Number(b.month),a=await getState(`auditNcr:${yy}`,Array(12).fill(0));a[m-1]=Math.max(0,Number(b.count)||0);await setState(`auditNcr:${yy}`,a);return json(res,200,{ok:true,monthly:a})}
 if(p.startsWith('/api/'))return json(res,404,{error:'API not found'});
 return serve(req,res)
}catch(e){console.error(e);return json(res,500,{error:e.message||'server error'})}});
server.listen(PORT,'0.0.0.0',()=>console.log(`QA dashboard listening on ${PORT}`));
