/* ================= EDIT HERE ================= */
const CONFIG = {
  eventStart: "2026-11-27T17:00:00+02:00",   // Cairo time (winter, UTC+2)
  autoScroll: { delay: 2500, speed: 55 },      // ms before it starts, pixels per second
  eventTitle: "Mohab & Habiba Wedding Reception",
  eventPlace: "Emilia's venue, 537 Line 7, South, Orabi, Cairo",
gallery: [
  "img1.jfif",
  "img2.jfif",
  "img3.jfif",
  "img4.jfif"
] // replace with your photos
};
const $=s=>document.querySelector(s);

/* petals */
for(let i=0;i<14;i++){const p=document.createElement('div');p.className='petal';p.textContent='\u2740';
  p.style.cssText=`left:${Math.random()*100}%;font-size:${12+Math.random()*22}px;animation-duration:${14+Math.random()*16}s;animation-delay:${-Math.random()*20}s`;$('#petals').appendChild(p)}

/* cover -> page 1 (arch stays; scroll down for Ceremony) */
$('#openBtn').onclick=()=>{
  const btn=$('#openBtn'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  btn.disabled=true;
  $('#cover').classList.add('opening');          /* card zooms + fades, heart beats */
  if(!reduce)burst(btn);                          /* petals fly out of the button */
  setTimeout(()=>{
    $('#cover').classList.add('hide');
    $('#main').classList.add('show','enter');     /* arch rises, names fade in, bouquet slides up */
    window.scrollTo(0,0);
    /* sharp background while the arch page is visible, blurred for the other pages */
    new IntersectionObserver(([e])=>{$('#bg').className='bg '+(e.intersectionRatio>.5?'sharp':'blur')},{threshold:[0,.25,.5,.75,1]}).observe($('#arch'));
    startAutoScroll();
  },reduce?0:750)
};
function burst(el){
  const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  for(let i=0;i<22;i++){const p=document.createElement('span'),a=Math.random()*Math.PI*2,d=120+Math.random()*260;
    p.className='burst';p.textContent='\u2740';
    p.style.cssText=`left:${x}px;top:${y}px;font-size:${12+Math.random()*16}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;animation-delay:${Math.random()*.15}s`;
    document.body.appendChild(p);setTimeout(()=>p.remove(),1600)}
}

/* gallery coverflow */
const flow=$('#flow');let cur=4;const slides=CONFIG.gallery.map((src,i)=>{
  const d=document.createElement('div');d.className='slide ph';d.textContent='Photo '+(i+1);
  const im=new Image();im.onload=()=>{d.style.backgroundImage=`url(${src})`;d.classList.remove('ph');d.textContent=''};im.src=src;
  flow.appendChild(d);return d});
function render(){
  const w=Math.min(innerWidth*.44,360),step=w*.62;
  slides.forEach((s,i)=>{const o=i-cur,a=Math.abs(o);
    s.style.transform=`translateX(${o*step}px) translateZ(${-a*120}px) rotateY(${-Math.sign(o)*Math.min(a,2)*32}deg) scale(${a?.72:1})`;
    s.style.zIndex=10-a;s.style.opacity=a>2?0:1;s.style.filter=a?'brightness(.55) saturate(.7)':'none';s.style.pointerEvents=a>2?'none':'auto'});
  $('#count').textContent=`${cur+1} / ${slides.length}`}
const go=d=>{cur=(cur+d+slides.length)%slides.length;render()};
$('#prev').onclick=()=>go(-1);$('#next').onclick=()=>go(1);
slides.forEach((s,i)=>s.onclick=()=>{cur=i;render()});
let tx=0;flow.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
flow.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>40)go(d<0?1:-1)});
addEventListener('resize',render);render();
// Auto-play lel gallery kol 3 seconds
setInterval(() => {
  const nextBtn = document.getElementById('next');
  if (nextBtn) {
    nextBtn.click();
  }
}, 3000);
/* countdown */
const start=new Date(CONFIG.eventStart);
function tick(){let s=Math.max(0,Math.floor((start-Date.now())/1e3));
  const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);
  $('#cd').textContent=`${d} days ${h} hours ${m} min ${s%60} sec`}
tick();setInterval(tick,1000);

/* calendar (Mon first) - built from CONFIG.eventStart */
(function(){const [Y,M,D]=CONFIG.eventStart.slice(0,10).split('-').map(Number);
  const first=new Date(Y,M-1,1),off=(first.getDay()+6)%7,days=new Date(Y,M,0).getDate(),rows=Math.ceil((off+days)/7);
  document.querySelector('.cal h4').textContent=first.toLocaleString('en-US',{month:'long'})+' '+Y;
  let h='<thead><tr>'+['Mo','Tu','We','Th','Fr','Sa','Su'].map(d=>`<th>${d}</th>`).join('')+'</tr></thead><tbody>';
  let n=1;for(let r=0;r<rows;r++){h+='<tr>';for(let c=0;c<7;c++){
    if(r*7+c<off||n>days)h+='<td></td>';else{h+=n===D?`<td class="on"><span>${n}</span></td>`:`<td>${n}</td>`;n++}}h+='</tr>'}
  $('#calTable').innerHTML=h+'</tbody>'})();

/* add to calendar (.ics) */
$('#addcal').onclick=()=>{
  const f=d=>d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z',end=new Date(+start+4*36e5);
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Invitation//EN','BEGIN:VEVENT','UID:wedding-2026@invite',`DTSTAMP:${f(new Date())}`,`DTSTART:${f(start)}`,`DTEND:${f(end)}`,`SUMMARY:${CONFIG.eventTitle}`,`LOCATION:${CONFIG.eventPlace}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='wedding.ics';a.click()};

/* RSVP (stored in this browser; connect a backend in submitRSVP to collect real replies) */
let choice=null;
function check(){$('#confirm').disabled=!($('#rname').value.trim()&&choice)}
document.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{document.querySelectorAll('.opt').forEach(x=>x.classList.remove('sel'));o.classList.add('sel');choice=o.dataset.v;check()});
$('#rname').oninput=check;
function submitRSVP(data){try{const l=JSON.parse(localStorage.getItem('rsvp')||'[]');l.push(data);localStorage.setItem('rsvp',JSON.stringify(l))}catch(e){}}
$('#confirm').onclick=()=>{submitRSVP({name:$('#rname').value.trim(),attend:choice,at:new Date().toISOString()});
  $('#thanks').textContent=choice==='yes'?'Thank you! We look forward to seeing you.':'Thank you for letting us know.';$('#confirm').disabled=true};

/* guestbook (stored in this browser; replace save/load with a backend for shared messages) */
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let msgs=[];try{msgs=JSON.parse(localStorage.getItem('gb')||'[]')}catch(e){}
function drawMsgs(){$('#msgs').innerHTML=msgs.map(m=>`<div class="msg"><div class="hd"><b>${esc(m.n)}</b><time>${esc(m.t)}</time></div><p>${esc(m.m)}</p></div>`).join('')}
['\u{1F44F}','\u2764\uFE0F','\u{1F60D}','\u{1F970}','\u{1F389}','\u{1F64F}','\u{1F339}','\u{1F495}','\u2728','\u{1F38A}'].forEach(e=>{const s=document.createElement('span');s.textContent=e;s.onclick=()=>{$('#gtext').value+=e};$('#emojis').appendChild(s)});
$('#emojiBtn').onclick=()=>$('#emojis').classList.toggle('open');
$('#send').onclick=()=>{const n=$('#gname').value.trim(),m=$('#gtext').value.trim();if(!n||!m)return;
  msgs.unshift({n,m,t:new Date().toLocaleString('en-US')});try{localStorage.setItem('gb',JSON.stringify(msgs))}catch(e){}
  $('#gname').value=$('#gtext').value='';drawMsgs()};
drawMsgs();

/* auto scroll: starts after "Open", stops as soon as the visitor scrolls, touches or types */
function startAutoScroll(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const {delay,speed}=CONFIG.autoScroll,evs=['wheel','touchstart','mousedown','keydown','focusin'];
  let pos=0,last=0,on=true,raf;
  const stop=()=>{on=false;cancelAnimationFrame(raf);evs.forEach(e=>removeEventListener(e,stop))};
  evs.forEach(e=>addEventListener(e,stop,{passive:true}));
  const step=t=>{if(!on)return;if(!last)last=t;
    const max=document.documentElement.scrollHeight-innerHeight;
    if(Math.abs(scrollY-pos)>3){stop();return}            // visitor dragged the scrollbar
    pos=Math.min(max,pos+speed*(t-last)/1000);last=t;
    scrollTo({top:pos,behavior:'instant'});
    if(pos>=max)stop();else raf=requestAnimationFrame(step)};
  setTimeout(()=>{if(on){pos=scrollY;last=0;raf=requestAnimationFrame(step)}},delay)}
