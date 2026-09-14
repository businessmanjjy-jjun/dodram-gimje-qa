(()=>{
  const KEY='rwSelectedYear';
  const valid=y=>/^20\d{2}$/.test(String(y||''));
  const urlYear=new URLSearchParams(location.search).get('year');
  let selectedYear=valid(urlYear)?String(urlYear):(valid(localStorage.getItem(KEY))?localStorage.getItem(KEY):'2026');
  localStorage.setItem(KEY,selectedYear);

  const originalFetch=window.fetch.bind(window);
  const scopedPaths=new Set(['/api/data','/api/processing','/api/production','/api/quality','/api/monthly-focus','/api/experiments','/api/audits','/api/foreign','/api/foreign/list','/api/kpi','/api/experiment-plan']);
  window.fetch=(input,init)=>{
    try{
      const raw=typeof input==='string'?input:input?.url;
      if(raw){
        const u=new URL(raw,location.origin);
        if(u.origin===location.origin&&scopedPaths.has(u.pathname)){
          u.searchParams.set('year',selectedYear);
          if(typeof input==='string') input=u.pathname+u.search+u.hash;
          else input=new Request(u.href,input);
        }
      }
    }catch(e){}
    return originalFetch(input,init);
  };

  function findYearSelect(){
    return [...document.querySelectorAll('select')].find(s=>{
      const vals=[...s.options].map(o=>String(o.value||o.textContent).trim());
      return vals.includes('2025')&&vals.includes('2026');
    });
  }

  function applyYearUi(){
    const sel=findYearSelect();
    if(!sel)return false;
    if(sel.value!==selectedYear)sel.value=selectedYear;
    if(sel.dataset.rwYearBound!=='1'){
      sel.dataset.rwYearBound='1';
      sel.addEventListener('change',()=>{
        const y=String(sel.value||'').trim();
        if(!valid(y)||y===selectedYear)return;
        localStorage.setItem(KEY,y);
        const u=new URL(location.href);
        u.searchParams.set('year',y);
        location.replace(u.href);
      },true);
    }
    return true;
  }

  function correctVisibleYear(){
    if(selectedYear==='2026')return;
    const roots=[...document.querySelectorAll('main,section,article,div')].filter(el=>/중점 진행사항 및 실적/.test(el.textContent||''));
    const root=roots.sort((a,b)=>a.querySelectorAll('*').length-b.querySelectorAll('*').length)[0];
    if(!root)return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];let n;
    while(n=w.nextNode())nodes.push(n);
    for(const t of nodes){
      if(t.parentElement?.closest('#rwSheet,#rwModal'))continue;
      if((t.nodeValue||'').includes('2026년'))t.nodeValue=t.nodeValue.replace(/2026년/g,selectedYear+'년');
    }
  }

  function tick(){applyYearUi();correctVisibleYear();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick,{once:true});else tick();
  addEventListener('load',tick);
  const mo=new MutationObserver(()=>{clearTimeout(mo._t);mo._t=setTimeout(tick,30)});
  mo.observe(document.documentElement,{subtree:true,childList:true});
})();