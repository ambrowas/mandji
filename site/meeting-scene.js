window.MeetingScene=function(people,onComplete){
 const $=s=>document.querySelector(s),bubble=$('#speech-bubble'),text=$('#speaker-text'),voice=$('#meeting-voice'),status=$('#voice-status');
 const order=[1,2,0],buttons=[];
 let muted=window.mandjiStorage.getItem('mandji-meeting-muted')==='true',timer=null,current=null,token=0,turn=0,completed=false;
 function stop(){token++;clearInterval(timer);window.speechSynthesis?.cancel();}
 function lights(){buttons.forEach((b,i)=>{b.hidden=i!==order[turn];b.disabled=i!==order[turn];});}
 function label(){voice.textContent=muted?'ACTIVAR VOZ':'SILENCIAR VOZ';voice.setAttribute('aria-pressed',String(muted));}
 function play(person,index){
  if(index!==order[turn])return;
  stop();current={person,index};const run=token;
  bubble.hidden=false;bubble.style.setProperty('--tail',[25,50,79][index]+'%');
  $('#speaker-name').textContent=person.name;text.textContent='';
  buttons.forEach((b,i)=>b.setAttribute('aria-expanded',String(i===index)));
  const full=person.text;let pos=0,finished=false;
  const speaking=!muted&&window.speechSynthesis&&window.SpeechSynthesisUtterance;
  function finish(){
   if(run!==token||finished)return;finished=true;clearInterval(timer);text.textContent=full;
   if(turn<order.length-1){turn++;lights();status.textContent='Ahora pulsa la luz de '+people[order[turn]].name+'.';}
   else{status.textContent='El equipo ha puesto en común los hallazgos.';if(!completed){completed=true;onComplete?.();}}
  }
  const reveal=()=>{if(run!==token)return;pos=Math.min(full.length,pos+2);text.textContent=full.slice(0,pos);if(pos===full.length){clearInterval(timer);if(!speaking)finish();}};
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){text.textContent=full;if(!speaking)finish();}else timer=setInterval(reveal,30);
  if(!finished)status.textContent=muted?'Voz silenciada. Lee la intervención.':'';
  if(speaking){
   const speech=new SpeechSynthesisUtterance(full);speech.lang='es-ES';speech.rate=.95;
   speech.onboundary=e=>{if(run===token&&e.name==='word'){pos=Math.max(pos,e.charIndex+(e.charLength||1));text.textContent=full.slice(0,pos);}};
   speech.onend=finish;speech.onerror=finish;window.speechSynthesis.speak(speech);
  }
 }
 people.forEach((person,i)=>{const b=document.createElement('button');b.className='spot meeting-spot';b.style.left=[25,50,79][i]+'%';b.style.top='42%';b.setAttribute('aria-label','Escuchar a '+person.name);b.setAttribute('aria-controls','speech-bubble');b.setAttribute('aria-expanded','false');b.onclick=()=>play(person,i);$('#meeting-spots').append(b);buttons.push(b);});
 voice.onclick=()=>{muted=!muted;window.mandjiStorage.setItem('mandji-meeting-muted',String(muted));label();if(current&&current.index===order[turn])play(current.person,current.index);};
 $('#close-speech').onclick=()=>{stop();bubble.hidden=true;current=null;buttons.forEach(b=>b.setAttribute('aria-expanded','false'));};
 function suspend(){stop();if(current)text.textContent=current.person.text;}
 window.addEventListener('pagehide',suspend);window.addEventListener('blur',suspend);document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();});
 $('#pause').addEventListener('click',suspend);$('#drive').addEventListener('click',suspend);
 lights();label();
};
