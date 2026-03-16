const GOALS={
  "PM|Pre-construction":["Validate cut/fill balance & earthwork quantities","Compare design options in 3D for stakeholder alignment","Create a progress baseline for on-track definition","Identify schedule risk hotspots by zone"],
  "PM|Ongoing Construction":["Costs running over budget","Falling behind schedule","Equipment sitting idle","Poor progress visibility","Rework increasing"],
  "PM|Inspection":["As-built verification vs design (acceptance readiness)","Final earthwork quantity reporting for owner discussion","Review construction history to justify changes","Identify remaining rework volume by area"],
  "Site Foreman|Pre-construction":["Turn plan into daily work sequence","Define 'done' criteria by zone","Prep site communication routine (photos/notes/issues)","Confirm data capture approach (how terrain updates)"],
  "Site Foreman|Ongoing Construction":["Daily progress visibility by zone","Spot rework risk early (overcut/undercut)","Coordinate crews using remaining volume (not intuition)","Report issues fast with photos/files + context"],
  "Site Foreman|Inspection":["Verify completion per zone","Prepare evidence for walkthrough (3D + photos)","Confirm as-built surface matches intent","Close-out change/issue log"],
  "Equipment Manager|Pre-construction":["Plan fleet allocation by volume & phases","Decide data capture strategy (which sources update terrain)","Define utilization targets by phase","Prepare machine/operator readiness for planned sequence"],
  "Equipment Manager|Ongoing Construction":["Align machine deployment to highest remaining volume zones","Reduce idle time by fixing sequence mismatches","Confirm data freshness is good enough for decisions","Support daily production reporting (fleet \u2192 output)"],
  "Equipment Manager|Inspection":["Validate completion vs volume targets","Provide final equipment contribution summary","Support rework planning (machines needed where)","Archive datasets and handover reporting package"]
};

let sel={role:null,phase:null,goal:null};
let ctxSel={};
let carouselIdx=0;

function selectChip(type,val,el){
  sel[type]=val;
  document.querySelectorAll('#'+type+'-chips .chip').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
  if(type!=='goal'){sel.goal=null;renderGoals();}
  updateStartBtn();
}

function renderGoals(){
  const key=sel.role+'|'+sel.phase;
  const goals=GOALS[key];
  const area=document.getElementById('goal-area');
  if(!goals){area.innerHTML='<div class="goal-empty">Select your role and project phase above to see relevant goals</div>';return;}
  let html='<div class="goal-grid">';
  goals.forEach(g=>{html+=`<div class="goal-card" onclick="pickGoal(this,'${g.replace(/'/g,"\\'")}')">${g}</div>`;});
  html+='</div>';
  area.innerHTML=html;
}

function pickGoal(el,val){
  document.querySelectorAll('.goal-card').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
  sel.goal=val;
  updateStartBtn();
}

function updateStartBtn(){
  const btn=document.getElementById('start-btn');
  const hasGoal=sel.goal||(document.getElementById('custom-goal').value.trim().length>0);
  btn.disabled=!(sel.role&&sel.phase&&hasGoal);
}

function selectCtx(type,val,el){
  ctxSel[type]=val;
  el.closest('.chips').querySelectorAll('.chip').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
}

function show(id){['screen1','screen2','screen3'].forEach(s=>{
  const el=document.getElementById(s);
  el.style.display=s===id?'flex':'none';
});}

function goScreen2(){
  show('screen2');
  document.getElementById('ctx-role-label').textContent=sel.role||'PM';
  document.getElementById('ctx-phase-label').textContent=sel.phase||'Pre-construction';
  const g=sel.goal||(document.getElementById('custom-goal').value.trim())||'your goal';
  document.getElementById('ctx-goal-label').textContent=g.length>40?g.slice(0,38)+'…':g;
  document.getElementById('ctx-goal-bubble').textContent=g;
}
function goScreen1(){show('screen1');}
function goScreen3(){show('screen3');}

document.getElementById('s3-back').onclick=function(){show('screen2');};

function toggleAgent(){
  const p=document.getElementById('agent-panel');
  p.style.display=p.style.display==='none'?'flex':'none';
}

const PROBLEM_MSGS={
  fuel:"Fuel and equipment costs often indicate fleet efficiency issues. Let's check how your machines are operating.",
  labor:"Labor productivity issues often trace back to poor task sequencing and unclear zone assignments. Let's map where time is being lost.",
  material:"Material waste usually signals a mismatch between planned quantities and actual site conditions. Let's identify where overruns are happening.",
  survey:"Survey delays cascade quickly into decision bottlenecks. Let's understand how your terrain data is being captured and how often it's updated.",
  unknown:"Not knowing the root cause is itself valuable signal. Let's use a structured set of questions to narrow it down together."
};

function selectProblem(val,el){
  ctxSel.problem=val;
  document.querySelectorAll('#screen2 .ctx-section:first-child .chip').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
  const msg=document.getElementById('problem-msg');
  msg.textContent=PROBLEM_MSGS[val]||'';
  msg.style.display='block';
  document.getElementById('ctx-locked').style.opacity='1';
  document.getElementById('ctx-locked').style.pointerEvents='auto';
}


function toggleStep(n){
  const body=document.getElementById('sbody-'+n);
  const chev=document.getElementById('schev-'+n);
  const dot=document.querySelector('#sitem-'+n+' .stepper-dot');
  const open=body.style.display!=='none';
  body.style.display=open?'none':'block';
  chev.classList.toggle('open',!open);
  dot.classList.toggle('active',!open);
}

// chatbot
let chatOpen=false;
const CHAT_MIN=120,CHAT_DEFAULT=120,CHAT_MAX=420;
let isDragging=false,dragStartY=0,dragStartH=0;

function toggleChat(){
  const p=document.getElementById('chatbot-panel');
  const tog=document.getElementById('chat-toggle');
  chatOpen=!chatOpen;
  p.style.height=(chatOpen?'280px':CHAT_MIN+'px');
  tog.innerHTML=chatOpen?'&#8963;':'&#8964;';
}

function startDrag(e){
  isDragging=true;
  dragStartY=e.clientY;
  dragStartH=document.getElementById('chatbot-panel').offsetHeight;
  e.preventDefault();
}
document.addEventListener('mousemove',function(e){
  if(!isDragging)return;
  const delta=dragStartY-e.clientY;
  const newH=Math.min(CHAT_MAX,Math.max(CHAT_MIN,dragStartH+delta));
  document.getElementById('chatbot-panel').style.height=newH+'px';
  chatOpen=newH>CHAT_MIN+10;
  document.getElementById('chat-toggle').innerHTML=chatOpen?'&#8963;':'&#8964;';
});
document.addEventListener('mouseup',function(){isDragging=false;});

function sendChat(){
  const inp=document.getElementById('chat-input');
  const msgs=document.getElementById('chat-messages');
  const txt=inp.value.trim();
  if(!txt)return;
  msgs.innerHTML+=`<div style="align-self:flex-end;background:var(--brand);color:#fff;border-radius:12px 12px 2px 12px;padding:8px 12px;font-size:12px;max-width:80%">${txt}</div>`;
  inp.value='';
  if(!chatOpen)toggleChat();
  setTimeout(()=>{
    msgs.innerHTML+=`<div style="align-self:flex-start;background:#f4f4f4;color:#333;border-radius:12px 12px 12px 2px;padding:8px 12px;font-size:12px;max-width:85%;line-height:1.4">Thanks for the context. I've noted this and can refine the diagnosis if you'd like — just ask.</div>`;
    msgs.scrollTop=msgs.scrollHeight;
  },600);
  msgs.scrollTop=msgs.scrollHeight;
}

const carouselLen=3;
function goSlide(i){
  carouselIdx=i;
  document.getElementById('carousel-track').style.transform=`translateX(-${i*100}%)`;
  document.querySelectorAll('.dot').forEach((d,j)=>d.classList.toggle('active',j===i));
}
function nextSlide(){goSlide((carouselIdx+1)%carouselLen);}
function prevSlide(){goSlide((carouselIdx-1+carouselLen)%carouselLen);}
