(() => {
 const M=Mission,$=s=>document.querySelector(s),key='mandji-search3-v1';
 const scene=M.read('mandji-scene2-v1',{});
 if(!(scene.matched&&scene.ordered&&scene.checked)){
  $('#chapter-context').textContent='Completa las tres pistas del capítulo II antes de comenzar esta búsqueda.';
  const a=document.createElement('a');a.href='escena2.html';a.textContent='VOLVER AL CAPÍTULO II';$('#chapter-context').append(a);return;
 }
 // A short synthesized startup chime; respect the game's effects preference.
 let startupAudio;
 async function startupChime(){
  try{
   const prefs=M.read('mandji-effects',{enabled:true,volume:.45});
   if(prefs.enabled===false||Number(prefs.volume)===0)return;
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
   if(startupAudio)await startupAudio.close();
   const ctx=startupAudio=new Audio();await ctx.resume();
   const out=ctx.createGain();out.gain.value=Math.min(1,Math.max(0,Number(prefs.volume)||.45))*.24;out.connect(ctx.destination);
   const start=ctx.currentTime;
   // Warm rising bell tones with a sustained final chord, reminiscent of XP.
   [[.0,659.25,1.8],[.35,880,1.65],[.72,987.77,1.9],[1.12,1318.51,2.25],[1.12,659.25,2.25],[1.12,830.61,2.25]].forEach(([delay,hz,length])=>{
    const t=start+delay;
    [1,2].forEach((harmonic,i)=>{
     const oscillator=ctx.createOscillator(),gain=ctx.createGain();
     oscillator.type='sine';oscillator.frequency.value=hz*harmonic;
     gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(i?.08:.45,t+.035);gain.gain.exponentialRampToValueAtTime(.001,t+length);
     oscillator.connect(gain);gain.connect(out);oscillator.start(t);oscillator.stop(t+length+.05);
     oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    });
   });
   setTimeout(()=>{if(startupAudio===ctx){startupAudio=null;ctx.close().catch(()=>{});}},4000);
  }catch{/* Audio must never block access to the computer. */}
 }
 window.addEventListener('pagehide',()=>{startupAudio?.close().catch(()=>{});startupAudio=null;});
 $('#use-computer').onclick=()=>{startupChime();$('#chapter-context').hidden=true;$('#computer').hidden=false;$('#search-query').focus();};
 $('#reread-context').onclick=()=>{$('#computer').hidden=true;$('#chapter-context').hidden=false;};
 let misses=0;
 const hints=[
  'No encontramos un resultado útil. Busca la publicación que dirigió Daniel, no su nombre ni el de la expedición.',
  'La búsqueda no coincide. Recuerda que era una revista digital; su título aparece en el contexto del capítulo.',
  'Aún no coincide. Usa «Releer el contexto» y fíjate en el párrafo que cuenta a qué se dedicó Daniel años después de la expedición.'
 ];
 $('#search-form').onsubmit=e=>{
  e.preventDefault();
  const q=$('#search-query').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  const found=/^(?:revista (?:digital )?)?memoria (?:del )?litoral$/.test(q);
  $('#search-results').hidden=!found;
  $('#search-query').setAttribute('aria-invalid',String(!found));
  $('#search-feedback').textContent=found?'1 resultado para tu investigación. Abre la revista.':hints[Math.min(misses++,hints.length-1)];
  if(found)window.mandjiStorage.setItem(key,JSON.stringify({searched:true}));
 };
 $('#first-result').onclick=()=>M.collect('contexto-daniel-3','El último rastro de Daniel','Tras la suspensión de la expedición, Daniel Ángel solicitó una excedencia voluntaria. Años después dirigió Memoria del Litoral. Falleció en 2013. Investigamos la revista para localizar su antigua casa/oficina y buscar sus papeles.',3);
})();
