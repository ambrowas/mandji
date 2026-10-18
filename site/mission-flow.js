(() => {
const read=(key,fallback)=>{try{return JSON.parse(window.mandjiStorage.getItem(key))??fallback;}catch{return fallback;}};
const timerKey='mandji-fictional-hours-v3';
let remaining=Number(window.mandjiStorage.getItem(timerKey)??604800000),last=performance.now(),paused=false;
const leader=read('mandji-leader-v1',null),dialog=document.querySelector('#panel'),body=document.querySelector('#panel-body');
function button(label,fn,parent=body){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;parent.append(b);return b;}
function paragraph(text,cls='',parent=body){const p=document.createElement('p');p.textContent=text;p.className=cls;parent.append(p);return p;}
function show(title){document.querySelector('#panel-title').textContent=title;body.replaceChildren();dialog.scrollTop=0;if(!dialog.open)dialog.showModal();}
function persist(){window.mandjiStorage.setItem(timerKey,String(remaining));if(leader)window.mandjiStorage.setItem('mandji-leader-v1',JSON.stringify(leader));}
function tick(){const now=performance.now();if(!document.hidden&&document.hasFocus()&&now-last>=0&&now-last<=5000&&!paused&&leader)remaining=Math.max(0,remaining-(now-last)*24);last=now;persist();document.querySelector('#clock').textContent=Math.floor(remaining/3600000)+' h '+String(Math.floor(remaining/60000)%60).padStart(2,'0')+' min';document.querySelector('#budget').textContent=leader?leader.budget.toLocaleString('es-ES')+' €':'Sin líder';}
function collect(id,title,text,mission=3){const c=read('mandji-collection-v1',{clues:[],objects:[]});const item={id,title,body:text,mission};const i=c.clues.findIndex(x=>x.id===id);if(i<0)c.clues.push(item);else c.clues[i]=item;window.mandjiStorage.setItem('mandji-collection-v1',JSON.stringify(c));}
function spend(euros,hours){tick();if(!leader||leader.budget<euros||remaining<=hours*3600000)return false;leader.budget-=euros;remaining-=hours*3600000;persist();tick();return true;}
function insufficient(){paragraph('No tienes tiempo o presupuesto suficiente para esta gestión. No se ha aplicado ningún cargo.','feedback');if(remaining===0)button('RECUPERAR TIEMPO',timeChallenge);}
function timeChallenge(){show('El tiempo se ha agotado');const r=missionRiddles[Math.floor(Math.random()*missionRiddles.length)];paragraph(r.question);r.options.forEach((o,i)=>button(o,()=>{if(i!==r.answer){timeChallenge();paragraph('Prueba con otro acertijo.','feedback');return;}remaining=604800000;persist();dialog.close();}));}
let audio;
async function magic(){try{const prefs=read('mandji-effects',{enabled:true,volume:.45});if(prefs.enabled===false||!prefs.volume)return;audio ||=new(window.AudioContext||window.webkitAudioContext)();await audio.resume();[659,880,988,1319,1760].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.085;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(Math.min(1,prefs.volume)*.13,t+.018);g.gain.exponentialRampToValueAtTime(.0001,t+.65);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.7);o.onended=()=>{o.disconnect();g.disconnect();};});}catch{}}
document.querySelector('#close').onclick=()=>dialog.close();
document.querySelector('#pause').onclick=()=>{paused=!paused;last=performance.now();document.querySelector('#pause').textContent=paused?'REANUDAR':'PAUSA';document.body.classList.toggle('mission-paused',paused);};
document.querySelector('#drive').onclick=()=>{show('Disco duro · Misiones');const c=read('mandji-collection-v1',{clues:[]});[1,2,3].forEach(m=>{const items=c.clues.filter(x=>(x.mission||1)===m);if(!items.length)return;const h=document.createElement('h3');h.textContent='Misión '+m;body.append(h);items.forEach(item=>button(item.title,()=>{show(item.title);if(item.id==='foto-campo-3'||item.id==='comparacion-3'){const img=document.createElement('img');img.src='assets/staff-field-1998.png';img.alt='Fotografía de campo de 1998';img.className='archive-image';body.append(img);}paragraph(item.body,'paper');}));});};
// Reset the baseline on focus/lifecycle transitions; never charge time spent away.
for(const event of ['blur','focus','pageshow','pagehide'])window.addEventListener(event,()=>{last=performance.now();persist();});
document.addEventListener('visibilitychange',()=>{last=performance.now();persist();});window.addEventListener('pagehide',persist);setInterval(tick,1000);tick();
window.Mission={read,leader,show,paragraph,button,collect,spend,insufficient,magic,dialog,body,tick};
})();
