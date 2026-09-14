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
const css=`#rwExpSub{display:none;gap:8px;padding:10px 16px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;margin:12px 0;position:relative;z-index:9998}#rwExpSub button{border:1px solid #cfd5dc;background:#fff;padding:9px 14px;border-radius:8px;font-weight:800;cursor:pointer}#rwExpSub button.on{background:#26364c;color:#fff}.rw-plan{display:none;position:fixed;inset:120px 18px 18px;background:#fff;z-index:9997;overflow:auto;border:1px solid #cfd5dc;border-radius:12px;padding:18px;box-shadow:0 12px 40px #0002}.rw-plan h2{text-align:center;font-size:28px;margin:0 0 12px}.rw-plan .cap{margin-bottom:10px;color:#667085}.rw-plan table{border-collapse:collapse;width:100%;min-width:1500px}.rw-plan th,.rw-plan td{border:1px solid #777;padding:6px;text-align:center;font-size:12px}.rw-plan th{background:#d8d4d4;position:static}.rw-plan .dot{font-size:20px;font-weight:900}.rw-plan .legend{text-align:right;margin-top:8px;font-weight:800}`;
function addStyle(){if(document.getElementById('rwExpStyle'))return;const s=document.createElement('style');s.id='rwExpStyle';s.textContent=css;document.head.appendChild(s)}
function monthOf(r){const s=JSON.stringify(r);let m=s.match(/(?:2026[-\/.]|^|\D)(1[0-2]|0?[1-9])[-\/.](?:[0-3]?\d)/);if(m)return +m[1];m=s.match(/(?:^|\D)(1[0-2]|0?[1-9])\s*월/);if(m)return +m[1];for(const k of ['month','월','Month']){if(r&&r[k]!=null){const n=parseInt(r[k]);if(n>=1&&n<=12)return n}}return 0}
async function latestMonth(){try{const r=await fetch('/api/experiments?year=2026',{cache:'no-store'});const d=await r.json();return Math.max(0,...(d.rows||[]).map(monthOf))}catch{return 0}}
async function render(){let box=document.getElementById('rwPlan');if(!box){box=document.createElement('div');box.id='rwPlan';box.className='rw-plan';document.body.appendChild(box)}const last=await latestMonth();box.innerHTML=`<h2>2026년 실험 계획</h2><div class="cap">실험 현황 입력자료 기준 누계 완료 표시 · 현재 ${last?last+'월':'입력자료 없음'}까지 반영</div><table><thead><tr><th>구분</th><th>구분</th><th>제품명</th><th>실험항목</th><th>세부항목</th><th>실험주기</th>${Array.from({length:12},(_,i)=>`<th>${i+1}월</th>`).join('')}</tr></thead><tbody>${PLAN.map(r=>`<tr>${r.slice(0,6).map(x=>`<td>${x}</td>`).join('')}${Array.from({length:12},(_,i)=>{const m=i+1;if(!r[6].includes(m))return '<td></td>';return `<td class="dot">${last&&m<=last?'●':'○'}</td>`}).join('')}</tr>`).join('')}</tbody></table><div class="legend">○ : 진행예정 &nbsp;&nbsp; ● : 진행완료</div>`;box.style.display='block'}
function hidePlan(){const p=document.getElementById('rwPlan');if(p)p.style.display='none'}
function setup(){addStyle();if(document.getElementById('rwExpSub'))return;const bar=document.createElement('div');bar.id='rwExpSub';bar.innerHTML='<button id="rwExpStatus" class="on">현황</button><button id="rwExpPlanBtn">2026년 실험 계획</button>';const anchor=document.querySelector('main')||document.body;anchor.insertBefore(bar,anchor.firstChild);document.getElementById('rwExpStatus').onclick=()=>{hidePlan();document.getElementById('rwExpStatus').classList.add('on');document.getElementById('rwExpPlanBtn').classList.remove('on')};document.getElementById('rwExpPlanBtn').onclick=()=>{document.getElementById('rwExpPlanBtn').classList.add('on');document.getElementById('rwExpStatus').classList.remove('on');render()};document.addEventListener('click',e=>{const t=(e.target.innerText||e.target.textContent||'').trim();if(t==='실험'){bar.style.display='flex';hidePlan()}else if(['반품','KPI 현황','연간 이물 현황'].includes(t)||t.includes('AUDIT')||t.includes('품질 및 위생')||t.includes('중점 진행')){bar.style.display='none';hidePlan()}},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
new MutationObserver(setup).observe(document.documentElement,{childList:true,subtree:true});
})();