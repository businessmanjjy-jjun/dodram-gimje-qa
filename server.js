import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import pg from 'pg';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||3000);
const ACCESS_PASSWORD=process.env.ACCESS_PASSWORD||'0987';
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'0987';
const SESSION_SECRET=process.env.SESSION_SECRET||'dodram-change-me';
const DATABASE_URL=process.env.DATABASE_URL||'';
const pool=DATABASE_URL?new pg.Pool({connectionString:DATABASE_URL,ssl:DATABASE_URL.includes('localhost')?false:{rejectUnauthorized:false}}):null;
const qualitySeed=JSON.parse(await fs.readFile(path.join(__dirname,'data/quality.json'),'utf8'));
let mem={quality:qualitySeed,focus:[],returns:[],processing:Array(12).fill(0),experiments:[],audits:[],auditNcr:Array(12).fill(0),foreign:[],foreignActual:0};
const sign=s=>crypto.createHmac('sha256',SESSION_SECRET).update(s).digest('hex');
const cookie=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),decodeURIComponent(x.slice(i+1))]}));
const isAuthed=req=>{const c=cookie(req).qa_session;if(!c)return false;const [v,s]=c.split('.');return v==='ok'&&s===sign('ok')};
const json=(res,status,obj,headers={})=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8',...headers});res.end(JSON.stringify(obj))};
const body=async req=>{let s='';for await(const c of req)s+=c;try{return JSON.parse(s||'{}')}catch{return {}}};
async function initDb(){if(!pool)return;await pool.query('create table if not exists qa_state (key text primary key, value jsonb not null)');for(const [k,v] of Object.entries(mem)){await pool.query('insert into qa_state(key,value) values($1,$2::jsonb) on conflict(key) do nothing',[k,JSON.stringify(v)])}}
async function getState(k){if(!pool)return mem[k];const r=await pool.query('select value from qa_state where key=$1',[k]);return r.rows[0]?.value??mem[k]}
async function setState(k,v){if(!pool){mem[k]=v;return}await pool.query('insert into qa_state(key,value) values($1,$2::jsonb) on conflict(key) do update set value=excluded.value',[k,JSON.stringify(v)])}
await initDb().catch(e=>console.error('DB init failed',e.message));
function mime(p){return p.endsWith('.html')?'text/html; charset=utf-8':p.endsWith('.css')?'text/css; charset=utf-8':p.endsWith('.js')?'application/javascript; charset=utf-8':'application/octet-stream'}
async function serve(req,res){let p=new URL(req.url,'http://x').pathname;if(p==='/')p='/index.html';const f=path.normalize(path.join(__dirname,'public',p));if(!f.startsWith(path.join(__dirname,'public')))return json(res,403,{error:'forbidden'});try{const b=await fs.readFile(f);res.writeHead(200,{'content-type':mime(f)});res.end(b)}catch{json(res,404,{error:'not found'})}}
const server=http.createServer(async(req,res)=>{try{
 const u=new URL(req.url,'http://x'),p=u.pathname;
 if(p==='/health') return json(res,200,{ok:true,db:!!pool});
 if(p==='/api/access/login'&&req.method==='POST'){const b=await body(req);if(String(b.password)!==ACCESS_PASSWORD)return json(res,401,{error:'비밀번호가 올바르지 않습니다.'});return json(res,200,{ok:true},{'set-cookie':`qa_session=ok.${sign('ok')}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`})}
 if(p.startsWith('/api/')&&!isAuthed(req)) return json(res,401,{error:'로그인이 필요합니다.'});
 if(p==='/api/admin/login'&&req.method==='POST'){const b=await body(req);return String(b.password)===ADMIN_PASSWORD?json(res,200,{ok:true}):json(res,401,{error:'관리자 비밀번호가 올바르지 않습니다.'})}
 if(p==='/api/data') return json(res,200,{rows:await getState('returns')});
 if(p==='/api/processing') return json(res,200,{monthly:await getState('processing')});
 if(p==='/api/quality'&&req.method==='GET') return json(res,200,{rows:await getState('quality')});
 if(p==='/api/monthly-focus'&&req.method==='GET') return json(res,200,{rows:await getState('focus')});
 if(p==='/api/experiments') return json(res,200,{rows:await getState('experiments')});
 if(p==='/api/audits') return json(res,200,{rows:await getState('audits'),nonconformMonthly:await getState('auditNcr')});
 if(p==='/api/foreign') return json(res,200,{rows:await getState('foreign'),actual:await getState('foreignActual')});
 if(p==='/api/quality/save'&&req.method==='POST'){const b=await body(req);if(String(b.password)!==ADMIN_PASSWORD)return json(res,403,{error:'관리자 권한이 필요합니다.'});let a=await getState('quality');const row={no:+b.no,date:b.date||'',completedDate:b.completedDate||'',location:b.location||'',status:b.status||'미정',request:b.request||'',note:b.note||'',before:b.before||'',after:b.after||''};a=a.filter(x=>+x.no!==row.no);a.push(row);await setState('quality',a);return json(res,200,{ok:true})}
 if(p==='/api/monthly-focus/save'&&req.method==='POST'){const b=await body(req);if(String(b.password)!==ADMIN_PASSWORD)return json(res,403,{error:'관리자 권한이 필요합니다.'});let a=await getState('focus');const row={year:+b.year||2026,month:+b.month,educationCount:+b.educationCount||0,educationContent:b.educationContent||'',hygieneCount:+b.hygieneCount||0,hygieneContent:b.hygieneContent||'',otherContent:b.otherContent||''};a=a.filter(x=>+x.month!==row.month);a.push(row);await setState('focus',a);return json(res,200,{ok:true})}
 if(p.startsWith('/api/'))return json(res,404,{error:'API not found'});
 if(!isAuthed(req)){const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>김제공장 QA팀</title><style>body{margin:0;font-family:Arial,sans-serif;background:#f4f6f8;display:grid;place-items:center;height:100vh}.box{width:min(380px,88vw);background:#fff;padding:30px;border-radius:18px;box-shadow:0 12px 40px #0002}h1{font-size:22px}input,button{width:100%;box-sizing:border-box;padding:14px;margin-top:10px;border-radius:10px;border:1px solid #ccc;font-size:16px}button{background:#b40019;color:#fff;border:0;font-weight:800}.err{color:#b40019;margin-top:10px}</style><div class="box"><h1>생산본부 김제공장 QA팀</h1><p>접속 비밀번호를 입력해주세요.</p><input id="p" type="password" placeholder="비밀번호"><button onclick="go()">접속</button><div class="err" id="e"></div></div><script>async function go(){const r=await fetch('/api/access/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:p.value})});if(r.ok)location.reload();else e.textContent='비밀번호가 올바르지 않습니다.'}p.onkeydown=x=>{if(x.key==='Enter')go()}</script>`;res.writeHead(200,{'content-type':'text/html; charset=utf-8'});return res.end(html)}
 return serve(req,res)
}catch(e){console.error(e);return json(res,500,{error:'server error'})}});
server.listen(PORT,'0.0.0.0',()=>console.log(`QA dashboard listening on ${PORT}`));
