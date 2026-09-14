(()=>{
const PLAN=[
['외부의뢰 실험','부분육','도드람한돈','자가성분 7항목','성상, 보존료, 휘발성염기질소 외 7항목','1회/월',[1,2,3,4,5,6,7,8,9,10,11,12]],
['외부의뢰 실험','부분육','도드람한돈','잔류성분 3종','설폰아미드계, 테트라싸이클린계, 아미노글리코시드계','1회/3개월',[2,5,8]],
['외부의뢰 실험','부분육','도드람한돈','미생물 3종','리스테리아, 바실루스, 클로스트리디움','2회/연',[7,8]],
['외부의뢰 실험','부분육','도드람한돈','잔류농약 320성분','','1회/연',[11]],
['외부의뢰 실험','부분육','도드람한돈','중금속 2종','납, 카드뮴','1회/연',[12]],
['외부의뢰 실험','부분육','더느림플러스','자가성분 7항목','','1회/2개월',[1,3,5,7,9,11]],
['외부의뢰 실험','부분육','더느림플러스','잔류성분 3종','설폰아미드계, 테트라싸이클린계, 아미노글리코시드계','1회/3개월',[2,5,8]],
['외부의뢰 실험','부산물','부산물 제품 2종(양념육,포장육)','살모넬라','','1회/월',[1,2,3,4,5,6,7,8,9,10,11,12]],
['외부의뢰 실험','부산물','부산물 제품 2종(양념육,포장육)','자가성분 5항목','일반세균, 대장균, 휘발성염기질소, 타르색소, 보존료','1회/반기',[2,3,7,8]],
['외부의뢰 실험','부산물','부산물 제품 2종(양념육,포장육)','병원성미생물 5종','바실루스, 클로스트리디움, 황색포도상구균, 리스테리아, 장출혈성대장균','2회/연',[4,5]],
['자체 실험','부분육 정기실험','도드람한돈, 제조설비,작업도구','표면 오염도','일반세균, 대장균, 대장균군','2회/월',[1,2,3,4,5,6,7,8,9,10,11,12]],
['자체 실험','부분육 정기실험','도드람한돈, 제조설비,작업도구','공중낙하균','','2회/월',[1,2,3,4,5,6,7,8,9,10,11,12]],
['자체 실험','부분육 정기실험','도드람한돈, 제조설비,작업도구','완제품3종','일반세균, 대장균, 대장균군','2회/월',[1,2,3,4,5,6,7,8,9,10,11,12]],
['자체 실험','별외 실험','제조설비 및 작업도구 (23항목)','표면 오염도','일반세균, 대장균, 대장균군','1회/연',[4,6]],
['자체 실험','별외 실험','제조설비 및 작업도구 (23항목)','공중낙하균','','1회/연',[4,6]],
['자체 실험','별외 실험','제조설비 및 작업도구 (23항목)','완제품3종','일반세균, 대장균, 대장균군','1회/연',[4,6]],
['자체 실험','별외 실험','작업자 손','표면 오염도','일반세균, 대장균, 대장균군','2회/연',[5,11]],
['자체 실험','소비기한','등심','완제품 실험','일반세균, 대장균, 대장균군, 관능검사','1회/연',[4]],
['자체 실험','보존성 실험','김제, 안동, 안성 (갈비,앞다리,목심)','완제품 실험','일반세균, 대장균, 대장균군, 관능검사','2회/연',[7,10]],
['자체 실험','부산물 정기실험','부산물 제품 2종(포장육,양념육)','표면 오염도','일반세균, 대장균, 대장균군','1회/월',[1,2,3,4,5,6,7,8,9,10,11,12]],
['자체 실험','부산물 정기실험','부산물 제품 2종(포장육,양념육)','공중낙하균','','1회/월',[1,2,3,4,5,6,7,8,9,10,11,12]],
['자체 실험','부산물 정기실험','부산물 제품 2종(포장육,양념육)','완제품3종','일반세균, 대장균, 대장균군','1회/월',[1,2,3,4,5,6,7,8,9,10,11,12]]
];
const css=`#rwExpSub{display:none;gap:8px;margin:10px 0 16px;padding:0;background:transparent;border:0;position:static;box-shadow:none;z-index:auto}#rwExpSub button{border:1px solid #cfd5dc;background:#fff;padding:9px 14px;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit}#rwExpSub button.on{background:#26364c;color:#fff}.rw-plan{display:none;margin-top:10px;background:#fff;overflow:auto;border:1px solid #d6dbe1;border-radius:12px;padding:16px}.rw-plan h2{text-align:center;font-size:26px;margin:0 0 10px}.rw-plan .cap{margin-bottom:10px;color:#667085}.rw-plan table{border-collapse:collapse;width:100%;min-width:1500px}.rw-plan th,.rw-plan td{border:1px solid #777;padding:6px;text-align:center;font-size:12px}.rw-plan th{background:#d8d4d4;position:static}.rw-plan .dot{font-size:20px;font-weight:900}.rw-plan .legend{text-align:right;margin-top:8px;font-weight:800}`;
function addStyle(){if(document.getElementById('rwExpStyle'))return;const s=document.createElement('style');s.id='rwExpStyle';s.textContent=css;document.head.appendChild(s)}
function visible(el){if(!el)return false;const r=el.getBoundingClientRect();const st=getComputedStyle(el);return r.width>0&&r.height>0&&st.display!=='none'&&st.visibility!=='hidden'}
function text(el){return (el?.innerText||el?.textContent||'').trim()}
function findHeading(){const hs=[...document.querySelectorAll('h1,h2,h3,h4,[role="heading"]')].filter(visible);return hs.find(x=>/실험\s*현황/.test(text(x)))||hs.find(x=>text(x)==='실험')||null}
function findHost(){const h=findHeading();if(!h)return null;return h.parentElement||null}
function parseMonthValue(v){if(v==null)return 0;if(typeof v==='number'&&v>=1&&v<=12)return v;const s=String(v).trim();let m=s.match(/^(1[0-2]|0?[1-9])\s*월?$/);if(m)return +m[1];m=s.match(/(?:^|\D)2026[-\/.](1[0-2]|0?[1-9])[-\/.](?:[0-3]?\d)(?:\D|$)/);if(m)return +m[1];m=s.match(/(?:^|\D)(1[0-2]|0?[1-9])\s*월(?:\D|$)/);return m?+m[1]:0}
function monthOf(r){if(!r||typeof r!=='object')return 0;const monthKeys=['month','Month','월','testMonth','experimentMonth','실험월','검사월'];for(const k of monthKeys){const n=parseMonthValue(r[k]);if(n)return n}const dateKeys=['date','Date','testDate','experimentDate','실험일자','실험일','검사일자','검사일','requestDate','의뢰일자','samplingDate','채취일자'];for(const k of dateKeys){const n=parseMonthValue(r[k]);if(n)return n}for(const [k,v] of Object.entries(r)){const key=String(k).toLowerCase();if(/created|updated|modified|saved|timestamp|등록|수정|저장|완료일/.test(key))continue;if(/date|일자|실험일|검사일|채취일/.test(key)){const n=parseMonthValue(v);if(n)return n}}return 0}
async function latestMonth(){try{const r=await fetch('/api/experiments?year=2026',{cache:'no-store'});const d=await r.json();return Math.max(0,...(d.rows||[]).map(monthOf))}catch{return 0}}
function restoreOriginal(host){if(!host)return;[...host.children].forEach(el=>{if(el.id==='rwExpSub'||el.id==='rwPlan')return;if(el.dataset.rwHidden==='1'){el.style.display=el.dataset.rwDisplay||'';delete el.dataset.rwHidden;delete el.dataset.rwDisplay}})}
function hideOriginal(host){if(!host)return;const heading=findHeading();[...host.children].forEach(el=>{if(el===heading||el.id==='rwExpSub'||el.id==='rwPlan')return;el.dataset.rwDisplay=el.style.display||'';el.dataset.rwHidden='1';el.style.display='none'})}
async function renderPlan(host){let box=document.getElementById('rwPlan');if(!box){box=document.createElement('div');box.id='rwPlan';box.className='rw-plan';const bar=document.getElementById('rwExpSub');bar?.after(box)}const last=await latestMonth();box.innerHTML=`<h2>2026년 실험 계획</h2><div class="cap">실험 현황 입력자료 기준 누계 완료 표시 · 현재 ${last?last+'월':'입력자료 없음'}까지 반영</div><table><thead><tr><th>구분</th><th>구분</th><th>제품명</th><th>실험항목</th><th>세부항목</th><th>실험주기</th>${Array.from({length:12},(_,i)=>`<th>${i+1}월</th>`).join('')}</tr></thead><tbody>${PLAN.map(r=>`<tr>${r.slice(0,6).map(x=>`<td>${x}</td>`).join('')}${Array.from({length:12},(_,i)=>{const m=i+1;if(!r[6].includes(m))return '<td></td>';return `<td class="dot">${last&&m<=last?'●':'○'}</td>`}).join('')}</tr>`).join('')}</tbody></table><div class="legend">○ : 진행예정 &nbsp;&nbsp; ● : 진행완료</div>`;hideOriginal(host);box.style.display='block'}
function showStatus(host){restoreOriginal(host);const box=document.getElementById('rwPlan');if(box)box.style.display='none'}
function placeBar(){addStyle();const host=findHost();const heading=findHeading();let bar=document.getElementById('rwExpSub');if(!host||!heading){if(bar)bar.style.display='none';return false}if(!bar){bar=document.createElement('div');bar.id='rwExpSub';bar.innerHTML='<button id="rwExpStatus" class="on">실험 현황</button><button id="rwExpPlanBtn">2026년 실험 계획</button>'}if(bar.parentElement!==host)heading.after(bar);bar.style.display='flex';const s=document.getElementById('rwExpStatus'),p=document.getElementById('rwExpPlanBtn');if(s&&!s.dataset.bound){s.dataset.bound='1';s.onclick=()=>{s.classList.add('on');p.classList.remove('on');showStatus(host)}}if(p&&!p.dataset.bound){p.dataset.bound='1';p.onclick=()=>{p.classList.add('on');s.classList.remove('on');renderPlan(host)}}return true}
function onNav(){setTimeout(placeBar,0);setTimeout(placeBar,120);setTimeout(placeBar,500)}
document.addEventListener('click',e=>{const t=text(e.target);if(t==='실험'||t.includes('실험 현황'))onNav();else if(t&&['반품','KPI 현황','연간 이물 현황'].some(x=>t.includes(x))||t.includes('AUDIT')||t.includes('품질')||t.includes('중점 진행')){const bar=document.getElementById('rwExpSub');if(bar)bar.style.display='none';const box=document.getElementById('rwPlan');if(box)box.style.display='none'}},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(placeBar,500)});else setTimeout(placeBar,500);
new MutationObserver(()=>{const bar=document.getElementById('rwExpSub');if(bar&&bar.style.display!=='none')placeBar()}).observe(document.documentElement,{childList:true,subtree:true});
})();