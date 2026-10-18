(() => {
function read(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}}
const scene=read('mandji-scene2-v1'),leader=read('mandji-leader-v1');
const unlocked=!!scene||['adrian','luna','sebastian'].includes(leader?.id);
const secondCard=document.querySelector('#chapter-two');
secondCard.hidden=false;
if(!unlocked){
secondCard.removeAttribute('href');secondCard.setAttribute('aria-disabled','true');secondCard.classList.add('locked');
document.querySelector('#status-two').textContent='Bloqueado';
secondCard.querySelector('strong').textContent='Elige un líder en el capítulo I para continuar';
}
document.querySelector('#status-one').textContent=unlocked?'Anterior':'Actual';
const travel=read('mandji-travel-bata-v1'),third=read('mandji-scene3-v1');
const thirdCard=document.querySelector('#chapter-three');
const chapterThreeUnlocked=!!(travel?.paid||scene?.complete||(scene?.matched&&scene?.ordered&&scene?.checked));
thirdCard.href=travel?.paid?'escena3.html':'ordenador3.html';
if(!chapterThreeUnlocked){
thirdCard.removeAttribute('href');thirdCard.setAttribute('aria-disabled','true');thirdCard.classList.add('locked');
document.querySelector('#status-three').textContent='Bloqueado';
thirdCard.querySelector('strong').textContent='Se desbloquea al completar las tres pistas del capítulo II';
}
if(third?.complete)document.querySelector('#status-three').textContent='Completado';
if(scene?.complete)document.querySelector('#status-two').textContent='Completado';
if(scene?.matched&&scene?.ordered&&scene?.checked&&!travel?.paid){document.querySelector('#status-two').textContent='Reunir al equipo';}
const activeCard=chapterThreeUnlocked?thirdCard:unlocked?document.querySelector('#chapter-two'):document.querySelector('.chapter');
activeCard.classList.add('active-chapter');
activeCard.setAttribute('aria-current','step');
const beam=document.createElement('span');beam.className='chapter-gold-beam';beam.setAttribute('aria-hidden','true');activeCard.append(beam);

const modal=document.querySelector('#mission-return'),body=document.querySelector('#return-body'),title=document.querySelector('#return-title');
document.querySelector('#return-close').onclick=()=>modal.close();
const add=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;body.append(n);return n;};
function review(mission){title.textContent='Pistas recogidas · Capítulo '+['','I','II','III'][mission];body.replaceChildren();const items=(read('mandji-collection-v1')?.clues||[]).filter(c=>(c.mission||1)===mission);if(!items.length)add('p','No hay pistas guardadas de esta misión en este navegador.');for(const item of items){const article=add('article','');article.className='review-clue';const h=document.createElement('h3');h.textContent=item.title;article.append(h);if(['foto-campo-3','comparacion-3'].includes(item.id)){const img=document.createElement('img');img.src='assets/staff-field-1998.png';img.alt='Fotografía de campo de 1998';article.append(img);}const p=document.createElement('p');p.textContent=item.body;article.append(p);}const back=add('button','VOLVER A LAS OPCIONES');back.onclick=()=>choose(mission);modal.scrollTop=0;}
function choose(mission){title.textContent='Misión completada · Capítulo '+['','I','II','III'][mission];body.replaceChildren();add('p','¿Quieres volver a jugar o revisar las pistas que recogiste?');const replay=add('button','VOLVER A JUGAR');replay.onclick=()=>window.startMissionReplay(mission);const clues=add('button','REVISAR PISTAS RECOLECTADAS');clues.onclick=()=>review(mission);add('p','Volver a jugar inicia una repetición con un plazo nuevo y una copia de tus recursos actuales. Tu partida original y sus pistas se conservan. Revisar las pistas no consume tiempo ni dinero.');if(!modal.open)modal.showModal();}
const completed=[unlocked,!!(scene?.complete||(scene?.matched&&scene?.ordered&&scene?.checked)),!!third?.complete];
document.querySelectorAll('.chapter').forEach((card,i)=>{if(completed[i]&&card.hasAttribute('href'))card.addEventListener('click',e=>{e.preventDefault();choose(i+1);});});
})();
