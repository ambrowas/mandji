(() => {
 let context,enabled=true,volume=.35,last=0;
 try{const saved=JSON.parse(window.mandjiStorage.getItem('mandji-effects'));if(saved){enabled=saved.enabled!==false;volume=Math.max(0,Math.min(1,Number(saved.volume)||0));}}catch{}
 const controls=document.createElement('div');controls.className='effects-controls';
 controls.innerHTML='<button type="button">EFECTOS</button><label>Volumen de efectos <input type="range" min="0" max="100"></label>';
 document.querySelector('.ambient-controls').append(controls);
 const button=controls.querySelector('button'),slider=controls.querySelector('input');slider.value=volume*100;
 function render(){button.textContent=enabled?'EFECTOS: ON':'EFECTOS: OFF';button.setAttribute('aria-pressed',String(enabled));}
 function save(){try{window.mandjiStorage.setItem('mandji-effects',JSON.stringify({enabled,volume}));}catch{}render();}
 function init(){if(!context)context=new AudioContext();if(context.state==='suspended')context.resume().catch(()=>{});}
 // Short generated textures: no external audio assets or network dependency.
 window.playActionSound=(kind)=>{
  if(!enabled||!volume||document.hidden)return;
  if(!context)return;
  init();const now=context.currentTime;
  if(now-last<.045)return;last=now;
  const gain=context.createGain();gain.connect(context.destination);
  const duration=kind==='clue'?.48:kind==='folder'?.24:kind==='close'?.14:.12;
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume*.12,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  if(kind==='clue'){
   [523.25,783.99].forEach((frequency,i)=>{const osc=context.createOscillator();osc.type='sine';osc.frequency.value=frequency;osc.connect(gain);osc.start(now+i*.09);osc.stop(now+duration);});
  }else{
   const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
   for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);
   const source=context.createBufferSource(),filter=context.createBiquadFilter();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=kind==='folder'?550:kind==='close'?260:kind==='paper'?1800:950;filter.Q.value=.7;source.connect(filter);filter.connect(gain);source.start(now);source.stop(now+duration);
  }
  setTimeout(()=>gain.disconnect(),(duration+.1)*1000);
 };
 document.addEventListener('pointerdown',init,{once:true,capture:true});document.addEventListener('keydown',init,{once:true,capture:true});
 button.onclick=()=>{enabled=!enabled;save();};slider.oninput=()=>{volume=slider.value/100;save();};slider.onchange=()=>window.playActionSound('paper');render();
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.matches('[data-map-close],[data-photo-close],.muni-close'))window.playActionSound('close');else if(b.matches('[data-prep-collection],[data-collection]'))window.playActionSound('folder');});
 window.addEventListener('mandji:collect-clue',()=>window.playActionSound('clue'));
})();
