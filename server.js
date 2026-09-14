import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import pg from 'pg';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||3000);
const SOURCE='https://app-p7vcr6.v2.appdeploy.ai';
const DATABASE_URL=process.env.DATABASE_URL||'';
const pool=DATABASE_URL?new pg.Pool({connectionString:DATABASE_URL,ssl:{rejectUnauthorized:false}}):null;
let mem={};
const json=(res,status,obj)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(obj));};
async function init(){if(pool)await pool.query('create table if not exists qa_state(key text primary key,value jsonb not null)');}
async function get(key,def=null){if(!pool)return key in mem?mem[key]:def;const r=await pool.query('select value from qa_state where key=$1',[key]);return r.rows[0]?.value??def;}
const yearOf=u=>Number(u.searchParams.get('year'))||2026;
const rowsKey=(name,y)=>`${name}:${y}`;
await init();

async function sendLocal(res,file,type){try{const b=await fs.readFile(path.join(__dirname,'public',file));res.writeHead(200,{'content-type':type,'cache-control':'no-store, max-age=0'});res.end(b);}catch{return json(res,404,{error:'file not found'});}}
const bannerPatch=`<style>img[data-railway-banner]{width:100%!important;height:auto!important;display:block!important;object-fit:cover!important}</style><script>(function(){const NEW='/resources/qa-team-top-banner.png?v=20260914-1817';function fix(){const imgs=[...document.querySelectorAll('img')];let c=imgs.filter(i=>{const r=i.getBoundingClientRect();return r.top<750&&(r.width>700||i.naturalWidth>1200)});c.sort((a,b)=>(b.getBoundingClientRect().width*b.getBoundingClientRect().height)-(a.getBoundingClientRect().width*a.getBoundingClientRect().height));if(c[0]){c[0].setAttribute('data-railway-banner','1');c[0].src=NEW;c[0].srcset='';}}new MutationObserver(fix).observe(document.documentElement,{subtree:true,childList:true,attributes:true});addEventListener('DOMContentLoaded',fix);addEventListener('load',fix);setTimeout(fix,100);setTimeout(fix,700);})();</script><script src="/experiment-plan-patch.js?v=20260914-1908"></script>`;

async function proxyStatic(req,res){
  const u=new URL(req.url,'http://local');
  if(u.pathname==='/resources/qa-team-top-banner.jpg'||u.pathname==='/resources/qa-team-top-banner.png'||u.pathname==='/qa-team-top-banner.png')return sendLocal(res,'resources/qa-team-top-banner.png','image/png');
  if(u.pathname==='/experiment-plan-patch.js')return sendLocal(res,'experiment-plan-patch.js','application/javascript; charset=utf-8');
  const target=SOURCE+(u.pathname==='/'?'/':u.pathname)+u.search;
  const r=await fetch(target,{redirect:'follow'});
  if(!r.ok)return json(res,r.status,{error:'not found'});
  const type=r.headers.get('content-type')||'application/octet-stream';
  const isText=type.includes('text/')||type.includes('javascript')||type.includes('json');
  if(!isText){const b=Buffer.from(await r.arrayBuffer());res.writeHead(200,{'content-type':type,'cache-control':'no-cache'});return res.end(b);}
  let text=await r.text();
  if(type.includes('text/html')){
    text=text.replace(/(?:https:\/\/app-p7vcr6\.v2\.appdeploy\.ai\/)?resources\/qa-team-top-banner\.(?:png|jpg|jpeg|webp)(?:\?[^"']*)?/gi,'/resources/qa-team-top-banner.png?v=20260914-1817');
    text=text.replace('</body>',bannerPatch+'</body>');
  }
  res.writeHead(200,{'content-type':type,'cache-control':'no-store'});res.end(text);
}

async function handleApi(req,res,u){
  const p=u.pathname,y=yearOf(u),method=req.method||'GET';
  if(p==='/health')return json(res,200,{ok:true,db:!!pool});
  if(p==='/api/admin/login'&&method==='POST')return json(res,200,{ok:true});
  if(p==='/api/years')return json(res,200,{years:await get('years',[2026])});
  if(p==='/api/data')return json(res,200,{rows:await get(rowsKey('returns',y),[])});
  if(p==='/api/processing')return json(res,200,{year:y,monthly:await get(rowsKey('processing',y),Array(12).fill(0))});
  if(p==='/api/production'){const m=Number(u.searchParams.get('month')),a=await get(rowsKey('production',y),[]);return json(res,200,{year:y,month:m,rows:a.find(x=>Number(x.month)===m)?.rows||[]});}
  if(p==='/api/quality')return json(res,200,{year:y,rows:await get(rowsKey('quality',y),[])});
  if(p==='/api/monthly-focus')return json(res,200,{year:y,rows:await get(rowsKey('focus',y),[])});
  if(p==='/api/experiments')return json(res,200,{year:y,rows:await get(rowsKey('experiments',y),[])});
  if(p==='/api/audits')return json(res,200,{year:y,rows:await get(rowsKey('audits',y),[]),nonconformMonthly:await get(rowsKey('auditNcr',y),Array(12).fill(0))});
  if(p==='/api/foreign'||p==='/api/foreign/list')return json(res,200,{rows:await get(rowsKey('foreign',y),[]),actual:await get(rowsKey('foreignActual',y),0),target:await get(rowsKey('foreignTarget',y),5)});
  if(p==='/api/kpi')return json(res,200,await get(rowsKey('kpi',y),{year:y}));
  return json(res,404,{error:'API not found'});
}

http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://x');if(u.pathname==='/health'||u.pathname.startsWith('/api/'))return handleApi(req,res,u);return proxyStatic(req,res);}catch(e){console.error(e);json(res,500,{error:e.message});}}).listen(PORT,'0.0.0.0',()=>console.log('QA dashboard',PORT));