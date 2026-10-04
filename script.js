/* ================= EDIT HERE ================= */
const CONFIG = {
  eventStart: "2026-11-27T17:00:00+02:00",   // Cairo time (winter, UTC+2)
  autoScroll: { delay: 2500, speed: 55 },      // ms before it starts, pixels per second
  eventTitle: "Mohab & Habiba Wedding Reception",
  eventPlace: "Emilia's venue, 537 Line 7, South, Orabi, Cairo",
  gallery: [
    "img1.jfif",
    "img2.jfif"
  ]
};
const $=s=>document.querySelector(s);

document.addEventListener("DOMContentLoaded", function() {
  /* petals */
  const petalsContainer = $('#petals');
  if (petalsContainer) {
    for(let i=0;i<14;i++){
      const p=document.createElement('div');
      p.className='petal';
      p.textContent='\u2740';
      p.style.cssText=`left:${Math.random()*100}%;font-size:${12+Math.random()*22}px;animation-duration:${14+Math.random()*16}s;animation-delay:${-Math.random()*20}s`;
      petalsContainer.appendChild(p);
    }
  }

  /* cover -> page 1 */
  const openBtn = $('#openBtn');
  if (openBtn) {
    openBtn.onclick = () => {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // === T48eel el o8nya awl m ndos Open ===
      const music = document.getElementById('bgMusic');
      if (music) {
        music.play().catch(error => {
          console.log("Audio autoplay prevented or failed:", error);
        });
      }
      // =======================================

      openBtn.disabled = true;
      $('#cover').classList.add('opening');        
      if(!reduce) burst(openBtn);                        
      setTimeout(()=>{
        $('#cover').classList.add('hide');
        $('#main').classList.add('show','enter');    
        window.scrollTo(0,0);
        const arch = $('#arch');
        if (arch) {
          new IntersectionObserver(([e])=>{$('#bg').className='bg '+(e.intersectionRatio>.5?'sharp':'blur')},{threshold:[0,.25,.5,.75,1]}).observe(arch);
        }
        startAutoScroll();
      }, reduce ? 0 : 750);
    };
  }

  function burst(el){
    const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
    for(let i=0;i<22;i++){
      const p=document.createElement('span'),a=Math.random()*Math.PI*2,d=120+Math.random()*260;
      p.className='burst';p.textContent='\u2740';
      p.style.cssText=`left:${x}px;top:${y}px;font-size:${12+Math.random()*16}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;animation-delay:${Math.random()*.15}s`;
      document.body.appendChild(p);
      setTimeout(()=>p.remove(),1600);
    }
  }

  /* gallery coverflow */
  const flow=$('#flow');
  if (flow && CONFIG.gallery) {
    let cur=4;
    const slides=CONFIG.gallery.map((src,i)=>{
      const d=document.createElement('div');d.className='slide ph';d.textContent='Photo '+(i+1);
      const im=new Image();im.onload=()=>{d.style.backgroundImage=`url(${src})`;d.classList.remove('ph');d.textContent=''};im.src=src;
      flow.appendChild(d);return d;
    });
    
    function render(){
      const w=Math.min(innerWidth*.44,360),step=w*.62;
      slides.forEach((s,i)=>{const o=i-cur,a=Math.abs(o);
        s.style.transform=`translateX(${o*step}px) translateZ(${-a*120}px) rotateY(${-Math.sign(o)*Math.min(a,2)*32}deg) scale(${a?.72:1})`;
        s.style.zIndex=10-a;s.style.opacity=a>2?0:1;s.style.filter=a?'brightness(.55) saturate(.7)':'none';s.style.pointerEvents=a>2?'none':'auto'});
      const countEl = $('#count');
      if(countEl) countEl.textContent=`${cur+1} / ${slides.length}`;
    }
    
    const go=d=>{cur=(cur+d+slides.length)%slides.length;render()};
    const prevBtn = $('#prev'), nextBtn = $('#next');
    if(prevBtn) prevBtn.onclick=()=>go(-1);
    if(nextBtn) nextBtn.onclick=()=>go(1);
    
    slides.forEach((s,i)=>s.onclick=()=>{cur=i;render()});
    let tx=0;
    flow.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
    flow.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>40)go(d<0?1:-1)});
    addEventListener('resize',render);
    render();

    setInterval(() => {
      const nBtn = document.getElementById('next');
      if (nBtn) { nBtn.click(); }
    }, 3000);
  }

  /* countdown */
  const cdEl = $('#cd');
  if (cdEl) {
    const start=new Date(CONFIG.eventStart);
    function tick(){
      let s=Math.max(0,Math.floor((start-Date.now())/1e3));
      const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);
      cdEl.textContent=`${d} days ${h} hours ${m} min ${s%60} sec`;
    }
    tick();
    setInterval(tick,1000);

    /* add to calendar (.ics) */
    const addCalBtn = $('#addcal');
    if (addCalBtn) {
      addCalBtn.onclick=()=>{
        const f=d=>d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z',end=new Date(+start+4*36e5);
        const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Invitation//EN','BEGIN:VEVENT','UID:wedding-2026@invite',`DTSTAMP:${f(new Date())}`,`DTSTART:${f(start)}`,`DTEND:${f(end)}`,`SUMMARY:${CONFIG.eventTitle}`,`LOCATION:${CONFIG.eventPlace}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
        const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='wedding.ics';a.click();
      };
    }
  }

  /* calendar */
  const calTitle = document.querySelector('.cal h4');
  if (calTitle) {
    const [Y,M,D]=CONFIG.eventStart.slice(0,10).split('-').map(Number);
    const first=new Date(Y,M-1,1),off=(first.getDay()+6)%7,days=new Date(Y,M,0).getDate(),rows=Math.ceil((off+days)/7);
    calTitle.textContent=first.toLocaleString('en-US',{month:'long'})+' '+Y;
    let h='<thead><tr>'+['Mo','Tu','We','Th','Fr','Sa','Su'].map(d=>`<th>${d}</th>`).join('')+'</tr></thead><tbody>';
    let n=1;for(let r=0;r<rows;r++){h+='<tr>';for(let c=0;c<7;c++){
      if(r*7+c<off||n>days)h+='<td></td>';else{h+=n===D?`<td class="on"><span>${n}</span></td>`:`<td>${n}</td>`;n++}}h+='</tr>'}
    const calTable = $('#calTable');
    if(calTable) calTable.innerHTML=h+'</tbody>';
  }

  /* RSVP */
  let choice=null;
  const confirmBtn = $('#confirm');
  const rnameInput = $('#rname');
  function check(){if(confirmBtn) confirmBtn.disabled=!(rnameInput && rnameInput.value.trim()&&choice)}
  
  document.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{
    document.querySelectorAll('.opt').forEach(x=>x.classList.remove('sel'));
    o.classList.add('sel');
    choice=o.dataset.v;
    check();
  });
  
  if(rnameInput) rnameInput.oninput=check;
  
  function submitRSVP(data){try{const l=JSON.parse(localStorage.getItem('rsvp')||'[]');l.push(data);localStorage.setItem('rsvp',JSON.stringify(l))}catch(e){}}
  
  if(confirmBtn){
    confirmBtn.onclick=()=>{
      submitRSVP({name:rnameInput?rnameInput.value.trim():'',attend:choice,at:new Date().toISOString()});
      const thanks = $('#thanks');
      if(thanks) thanks.textContent=choice==='yes'?'Thank you! We look forward to seeing you.':'Thank you for letting us know.';
      confirmBtn.disabled=true;
    };
  }

  /* Emojis for Guestbook */
  const emojisContainer = $('#emojis');
  const gtextInput = $('#gtext');
  if (emojisContainer && gtextInput) {
    ['\u{1F44F}','\u2764\uFE0F','\u{1F60D}','\u{1F970}','\u{1F389}','\u{1F64F}','\u{1F339}','\u{1F495}','\u2728','\u{1F38A}'].forEach(e=>{
      const s=document.createElement('span');
      s.textContent=e;
      s.onclick=()=>{$('#gtext').value+=e};
      emojisContainer.appendChild(s);
    });
    const emojiBtn = $('#emojiBtn');
    if(emojiBtn) emojiBtn.onclick=()=>emojisContainer.classList.toggle('open');
  }

  /* auto scroll */
  function startAutoScroll(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const {delay,speed}=CONFIG.autoScroll,evs=['wheel','touchstart','mousedown','keydown','focusin'];
    let pos=0,last=0,on=true,raf;
    const stop=()=>{on=false;cancelAnimationFrame(raf);evs.forEach(e=>removeEventListener(e,stop))};
    evs.forEach(e=>addEventListener(e,stop,{passive:true}));
    const step=t=>{if(!on)return;if(!last)last=t;
      const max=document.documentElement.scrollHeight-innerHeight;
      if(Math.abs(scrollY-pos)>3){stop();return}        
      pos=Math.min(max,pos+speed*(t-last)/1000);last=t;
      scrollTo({top:pos,behavior:'instant'});
      if(pos>=max)stop();else raf=requestAnimationFrame(step)};
    setTimeout(()=>{if(on){pos=scrollY;last=0;raf=requestAnimationFrame(step)}},delay);
  }

  /* ================= FIREBASE GUESTBOOK & ADMIN ================= */
  if (typeof firebase !== 'undefined') {
    const firebaseConfig = {
      apiKey: "AIzaSyBKU68FnqA8yfZbPdhSk8_OvsRO9Tylmc",
      authDomain: "habiba-wedding-1e10a.firebaseapp.com",
      databaseURL: "https://habiba-wedding-1e10a-default-rtdb.firebaseio.com",
      projectId: "habiba-wedding-1e10a",
      storageBucket: "habiba-wedding-1e10a.firebasestorage.app",
      messagingSenderId: "338864650525",
      appId: "1:338864650525:web:5cf682a0b3db635d4f49f4",
      measurementId: "G-5C8BQLDVYS"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    // Send Wishes Button Handler (Firebase)
    const sendBtn = document.getElementById('send');
    if (sendBtn) {
      sendBtn.onclick = (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('gname');
        const textInput = document.getElementById('gtext');
        
        const name = nameInput ? nameInput.value.trim() : '';
        const text = textInput ? textInput.value.trim() : '';

        if (!name || !text) {
          alert('Please fill in your name and wishes!');
          return;
        }

        db.ref('wishes').push({
          name: name,
          text: text,
            timestamp: Date.now()
        }, (error) => {
          if (error) {
            alert('Failed to send wish. Please try again.');
          } else {
            alert('Your wish has been sent successfully! ❤️');
            if (nameInput) nameInput.value = '';
            if (textInput) textInput.value = '';
          }
        });
      };
    }

    // Admin View Messages Button Handler
    const adminBtn = document.getElementById('adminBtn');
    const msgsContainer = document.getElementById('msgs');

    if (adminBtn) {
      adminBtn.onclick = (e) => {
        e.preventDefault();
        const password = prompt("Enter Admin Password to view messages:");
        const adminPassword = "1162026"; 
        
        if (password === adminPassword) {
          if (msgsContainer) msgsContainer.style.display = "block";
          adminBtn.style.display = "none";
          
          db.ref('wishes').on('value', (snapshot) => {
            if (msgsContainer) msgsContainer.innerHTML = '';
            const data = snapshot.val();
            if (data) {
              Object.values(data).reverse().forEach(wish => {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'msg-card';
                msgDiv.style.cssText = "background: rgba(255,255,255,0.7); padding: 12px; margin: 10px 0; border-radius: 10px; color: #333; text-align: left;";
                msgDiv.innerHTML = `<strong>${wish.name}</strong>: <p style="margin-top: 5px;">${wish.text}</p>`;
                if (msgsContainer) msgsContainer.appendChild(msgDiv);
              });
            } else {
              if (msgsContainer) msgsContainer.innerHTML = '<p style="color:#333; text-align:center;">No wishes yet.</p>';
            }
          });
        } else if (password !== null) {
          alert('Incorrect Password! Access Denied.');
        }
      };
    }
  }
});