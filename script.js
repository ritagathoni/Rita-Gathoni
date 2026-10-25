
const menu = document.querySelector('.nav-toggle');
const nav = document.querySelector('#site-nav');
if(menu && nav){
  menu.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded','false');
  }));
}
const year = document.querySelector('#year'); if(year) year.textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{if(entry.isIntersecting) entry.target.classList.add('active')})
},{threshold:.14});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const grid=document.querySelector('#repo-grid');
if(grid){
 fetch('https://api.github.com/users/ritagathoni/repos?per_page=30&sort=updated',{headers:{'Accept':'application/vnd.github+json'}})
 .then(r=>{if(!r.ok) throw new Error('GitHub unavailable'); return r.json()})
 .then(repos=>{
   grid.textContent='';
   const selected = repos.filter(r =>
  !r.fork &&
  r.name !== 'rita-gathoni-portfolio2' &&
  r.name !== 'Rita-Gathoni' &&
  r.name !== 'ritagathoni' &&
  r.name !== 'about-me' &&
  !r.name.toLowerCase().includes('portfolio')
).slice(0,6);
   if(!selected.length){grid.innerHTML='<p class="muted">Public repositories will appear here as they are updated. <a href="https://github.com/ritagathoni" target="_blank" rel="noopener">View GitHub directly</a>.</p>'; return;}
   selected.forEach(r=>{
     const card=document.createElement('article'); card.className='repo-card';
     const link=document.createElement('a');link.href=r.html_url;link.target='_blank';link.rel='noopener';link.textContent=r.name;const desc=document.createElement('p');desc.textContent=r.description||'Public GitHub repository';const lang=document.createElement('small');lang.textContent=r.language||'Repository';card.append(link,desc,lang);
     grid.append(card);
   });
 }).catch(()=>{grid.innerHTML='<p class="muted">Live repository data is unavailable right now. <a href="https://github.com/ritagathoni" target="_blank" rel="noopener">View GitHub directly</a>.</p>'})
}

(()=>{
 const wrap=document.querySelector('#work-map');
 const inner=document.querySelector('#work-map-inner');
 if(!wrap || !inner) return;
 let x=0,y=0,scale=1,drag=false,moved=false,startX=0,startY=0;
 const draw=()=>{ inner.style.transform=`translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`; };
 wrap.addEventListener('pointerdown', e=>{
   if(e.target.closest('button')) return;
   drag=true;moved=false;startX=e.clientX-x;startY=e.clientY-y;wrap.classList.add('dragging');
 });
 window.addEventListener('pointermove', e=>{
   if(!drag) return;
   const nx = e.clientX-startX; const ny = e.clientY-startY;
   if(Math.abs(nx-x)>3 || Math.abs(ny-y)>3) moved=true;
   x=Math.max(-420, Math.min(420, nx));
   y=Math.max(-280, Math.min(280, ny));
   draw();
 });
 window.addEventListener('pointerup', ()=>{ drag=false; wrap.classList.remove('dragging'); });
 wrap.querySelectorAll('.note-card').forEach(a=>a.addEventListener('click',e=>{ if(moved){ e.preventDefault(); moved=false; }}));
 document.querySelector('#map-left')?.addEventListener('click',()=>{x=Math.min(420,x+60);draw()});
 document.querySelector('#map-right')?.addEventListener('click',()=>{x=Math.max(-420,x-60);draw()});
 document.querySelector('#map-zoom-in')?.addEventListener('click',()=>{scale=Math.min(1.35, +(scale+.1).toFixed(2));draw()});
 document.querySelector('#map-zoom-out')?.addEventListener('click',()=>{scale=Math.max(.75, +(scale-.1).toFixed(2));draw()});
 document.querySelector('#map-reset')?.addEventListener('click',()=>{x=0;y=0;scale=1;draw()});
 wrap.addEventListener('keydown',e=>{
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
     e.preventDefault();
     if(e.key==='ArrowLeft') x=Math.min(420,x+50);
     if(e.key==='ArrowRight') x=Math.max(-420,x-50);
     if(e.key==='ArrowUp') y=Math.min(280,y+50);
     if(e.key==='ArrowDown') y=Math.max(-280,y-50);
     draw();
   }
 });
 draw();
})();

// Synthetic evaluation lab: educational cases only; no client material.
(()=>{
 const root=document.querySelector('#lab-main');if(!root)return;
 const cases={
 factuality:{title:"The model claims a fact the record doesn't contain.",quote:'“The customer approved the revised delivery date.”',evidence:'The record notes a proposed date, but contains no customer approval.',correct:'fail',reason:'Unsupported claim: the source supports a proposal, not approval. The safe response reports the proposed change without assuming consent.'},
 schema:{title:'Correct meaning, wrong JSON type.',quote:'Expected {"approved": false} — received {"approved": "false"}',evidence:'The schema requires a Boolean. The model returned a string.',correct:'fail',reason:'Schema validation fails even though the words look equivalent. Type correctness is part of the contract.'},
 agent:{title:'The agent selected an unrelated tool.',quote:'Task: check an existing order status. Agent used: product_search.',evidence:'An order-status tool was available; the search tool cannot verify a customer order.',correct:'fail',reason:'Tool choice failed the task. The agent should choose the status endpoint and then ground its reply in the tool result.'},
 rubric:{title:'A response is accurate but mismatched in tone.',quote:'User asked for a warm customer update. The model replies in formal legalistic language.',evidence:'All facts are accurate, but register and audience fit are part of the requested output.',correct:'fail',reason:'Quality includes user intent, not factuality alone. The review should note correct facts and failed audience alignment separately.'}
 };
 function show(id){const c=cases[id];root.innerHTML='<p class="eyebrow">SYNTHETIC EVALUATION / '+id.toUpperCase()+'</p><h3>'+c.title+'</h3><p class="lab-quote">'+c.quote.replaceAll('<','&lt;')+'</p><p class="lab-evidence"><strong>Evidence:</strong> '+c.evidence+'</p><div class="lab-choice"><button class="lab-decision" data-answer="pass">PASS</button><button class="lab-decision" data-answer="fail">FLAG ISSUE</button></div><div class="lab-feedback" id="lab-feedback" aria-live="polite">Choose a verdict to reveal the rationale.</div>';
 root.querySelectorAll('.lab-decision').forEach(b=>b.addEventListener('click',()=>{
 const ok=b.dataset.answer===c.correct;root.querySelectorAll('.lab-decision').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');root.querySelector('#lab-feedback').textContent=(ok?'Correct evaluation. ':'Review the evidence again. ')+c.reason;
 }));}
 document.querySelectorAll('.lab-tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.lab-tab').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false')});b.classList.add('active');b.setAttribute('aria-pressed','true');show(b.dataset.lab)}));
 show('factuality');
})();
