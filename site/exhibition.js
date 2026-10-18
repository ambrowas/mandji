window.renderTattooExhibition=function(host){
 const M=Mission,key='mandji-exhibition-v1',data=M.read(key,{answers:{},complete:false});
 data.rewarded=data.rewarded||[];
 data.rounds=data.rounds||{};
 // A saved active flag must not lock other portraits after a modal closes or a reload.
 data.active=null;
 const clocks=[];
 const places=['KOGO','MACHINDA','BIDJA BIDJAN','ALUM','KOM ESAMBIRA'];
 const add=(tag,text,parent=host)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;};
 const clean=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'');
 const save=()=>window.mandjiStorage.setItem(key,JSON.stringify(data));
 add('p','Los tatuajes tribales parecían haber desaparecido, pero están reapareciendo. Este fin de semana, el fotógrafo DKP presenta en Bata una exposición dedicada a ellos. Explora la colección: quién sabe, quizá encuentres algo útil para tu misión… o para tu presupuesto.');
 add('p','Cinco retratos, cinco procedencias. Completa las casillas para identificar las localidades de las mujeres retratadas. Escribe letras en cualquier orden, como en el ahorcado. Si una letra está en el nombre, se revela en verde en todas sus posiciones. Las letras que no aparecen se rechazan. Al completar el nombre se comprueba automáticamente. Si pulsas «Comprobar» sin haberlo completado, se borran todas las casillas. Puedes pedir una letra de ayuda. Por cada localidad acertada recibirás 500 € para el presupuesto de la misión, hasta un total de 2.500 €. Cada premio se entrega una sola vez.');
 const progress=add('p','');progress.className='exhibition-progress';progress.setAttribute('role','status');
 add('p','Tienes un minuto por retrato. Pulsa «Empezar · 1 minuto» cuando estés listo. Si se acaba el tiempo, pierdes esa prueba y sus 500 €, pero puedes seguir con las demás. El contador se pausa al cerrar el retrato o cuando la pantalla no está activa.');
 const update=()=>{
  const count=places.filter(name=>data.rewarded.includes(name)).length;
  progress.textContent=count+' / 5 localidades identificadas · '+places.filter(name=>data.rounds[name]?.lost).length+' pruebas perdidas';
  if(count===5&&!data.complete){data.complete=true;save();M.magic();M.collect('exposicion-3','Exposición · Cinco procedencias','Cartelas completadas: Kogo, Machinda, Bidja Bidjan, Alum y Kom Esambira. Actividad cultural opcional de la revista.',3);}
 };
 const grid=add('div','');grid.className='exhibition-grid';
 places.forEach((name,index)=>{
  const card=add('article','',grid);card.className='exhibition-card';
  add('h3','Retrato '+(index+1),card);
  const img=add('img','',card);img.src='assets/exhibit-'+(index+1)+'.png';img.alt='Retrato '+(index+1)+' de una mujer con tatuajes decorativos';img.loading='lazy';
  const modal=add('dialog','',card);modal.className='portrait-game';modal.setAttribute('aria-labelledby','portrait-title-'+index);
  const heading=add('div','',modal);heading.className='portrait-heading';
  const title=add('h2','Retrato '+(index+1),heading);title.id='portrait-title-'+index;
  const close=add('button','CERRAR',heading);close.type='button';
  const layout=add('div','',modal);layout.className='portrait-layout';
  const large=add('img','',layout);large.src=img.src;large.alt=img.alt;
  const answer=clean(name),form=add('form','',layout);form.className='locality-form';
  const label=add('p','Lugar de procedencia · '+answer.length+' letras',form);label.id='locality-label-'+index;
  const row=add('div','',form);row.className='letter-words';row.setAttribute('role','group');row.setAttribute('aria-labelledby',label.id);
  const inputs=[];let offset=0;
  name.split(' ').forEach((word,wi)=>{
   const group=add('div','',row);group.className='letter-word';
   word.split('').forEach((letter,j)=>{
    const pos=offset+j,input=add('input','',group);input.type='text';input.maxLength=1;input.autocomplete='off';input.spellcheck=false;input.setAttribute('autocapitalize','characters');input.setAttribute('aria-label','Retrato '+(index+1)+', palabra '+(wi+1)+', letra '+(j+1));
    input.value=clean((data.answers[name]||'')[pos]||'');
    input.oninput=()=>accept(pos,input.value);
    input.onpaste=e=>{e.preventDefault();accept(pos,e.clipboardData.getData('text'));};
    inputs.push(input);
   });offset+=word.length;
  });
  const actions=add('div','',form);actions.className='exhibition-actions';
  const check=add('button','COMPROBAR',actions);check.type='submit';
  const hint=add('button','DAME UNA LETRA',actions);hint.type='button';
  const feedback=add('p','',form);feedback.setAttribute('role','status');
  const round=data.rounds[name]||(data.rounds[name]={remaining:60000,started:false,lost:false});
  const timer=add('p','',form);timer.setAttribute('role','timer');
  const start=add('button','EMPEZAR · 1 MINUTO',card);start.type='button';
  let last=Date.now();
  function refresh(){
   const won=data.rewarded.includes(name),playing=round.started&&!round.lost&&!won;
   inputs.forEach(x=>{x.disabled=!playing;});check.disabled=!playing;hint.disabled=!playing;
   start.hidden=false;start.textContent=won||round.lost?'VER RESULTADO':round.started?'CONTINUAR':'EMPEZAR · 1 MINUTO';
   start.disabled=false;
   timer.textContent=won?'Prueba superada':round.lost?'Tiempo agotado':playing?'Tiempo restante: '+Math.ceil(round.remaining/1000)+' s':'Tiempo disponible: 1 minuto';
   if(round.lost){inputs.forEach((x,i)=>{x.value=answer[i];x.readOnly=true;x.classList.remove('correct','wrong');x.setAttribute('aria-invalid','false');});feedback.textContent='Tiempo agotado. La respuesta era '+name+'. No has obtenido los 500 € de esta prueba. Puedes continuar con otro retrato.';}
  }
  function clock(){
   const now=Date.now(),delta=now-last;last=now;
   if(modal.open&&round.started&&!round.lost&&!data.rewarded.includes(name)&&!document.hidden&&document.hasFocus()&&delta<5000){
    round.remaining=Math.max(0,round.remaining-delta);
    if(!round.remaining){round.lost=true;if(data.active===name)data.active=null;update();}
    save();
   }
   refresh();
  }
  clocks.push(clock);
  start.onclick=()=>{modal.showModal();if(!round.lost&&!data.rewarded.includes(name)){round.started=true;data.active=name;}last=Date.now();save();clocks.forEach(fn=>fn());(inputs.find(x=>!x.readOnly&&!x.disabled)||close).focus();};
  close.onclick=()=>{clock();modal.close();};
  modal.oncancel=e=>{e.preventDefault();close.onclick();};
  modal.onclose=()=>{if(data.active===name)data.active=null;save();clocks.forEach(fn=>fn());start.focus();};
  function allowed(){clock();return modal.open&&round.started&&!round.lost&&!data.rewarded.includes(name);}
  function persist(){data.answers[name]=inputs.map(x=>x.value||'_').join('');save();}
  function accept(pos,value){
   if(!allowed())return;
   const input=inputs[pos];
   if(input.readOnly)return;
   const letter=clean(value);
   input.value='';
   if(letter.length!==1||!answer.includes(letter)){
    feedback.textContent='Esa letra no aparece en el nombre. Prueba otra.';persist();refresh();input.focus();return;
   }
   const repeated=inputs.some((x,i)=>answer[i]===letter&&x.readOnly);
   inputs.forEach((x,i)=>{if(answer[i]===letter)x.value=letter;});
   persist();const done=mark();
   if(!done)feedback.textContent=repeated?'Esa letra ya estaba revelada. Prueba otra.':'✓ Letra encontrada. Todas sus apariciones están marcadas en verde.';
   update();clocks.forEach(fn=>fn());if(!done)inputs.find(x=>!x.readOnly)?.focus();
  }
  function mark(){
   if(round.lost)return false;
   inputs.forEach((input,i)=>{const correct=input.value===answer[i];input.classList.toggle('correct',correct);input.classList.toggle('wrong',!!input.value&&!correct);input.readOnly=correct;input.setAttribute('aria-invalid',String(!!input.value&&!correct));});
   const done=inputs.every((x,i)=>x.value===answer[i]);
   if(done){
    if(data.active===name)data.active=null;save();
    const awarded=M.read(key,{rewarded:[]}).rewarded||[];
    data.rewarded=[...new Set([...data.rewarded,...awarded])];
    const firstAward=!data.rewarded.includes(name)&&M.leader;
    if(firstAward){data.rewarded.push(name);if(data.active===name)data.active=null;M.leader.budget+=500;save();M.tick();}
    feedback.textContent='✓ '+name+(firstAward?' · ¡Has ganado 500 € para la misión!':data.rewarded.includes(name)?' · Premio de 500 € ya añadido al presupuesto.':'');check.disabled=true;hint.disabled=true;card.classList.add('solved');
   }
   return done;
  }
  form.onsubmit=e=>{e.preventDefault();if(!allowed())return;persist();if(!mark()){inputs.forEach(x=>{x.value='';x.readOnly=false;x.classList.remove('correct','wrong');x.setAttribute('aria-invalid','false');});persist();feedback.textContent='El nombre no está completo. Hemos vaciado las casillas: empieza de nuevo.';refresh();inputs[0].focus();}update();clocks.forEach(fn=>fn());};
  hint.onclick=()=>{if(!allowed())return;const i=inputs.findIndex((x,j)=>x.value!==answer[j]);if(i<0)return;accept(i,answer[i]);};
  const known=new Set(inputs.filter((x,i)=>x.value===answer[i]).map(x=>x.value));
  inputs.forEach((x,i)=>{x.value=known.has(answer[i])?answer[i]:'';x.readOnly=!!x.value;if(x.readOnly)x.classList.add('correct');});persist();
  if(data.rewarded.includes(name))mark();
  refresh();
 });
 add('p','Retratos y cartelas recreados para esta exposición del juego. Los motivos decorativos no documentan tradiciones específicas de estas localidades.').className='folio';
 update();
 const interval=setInterval(()=>{if(!host.contains(grid)){clearInterval(interval);return;}clocks.forEach(fn=>fn());},200);
};
