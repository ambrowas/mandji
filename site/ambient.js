(() => {
 let settings={music:{},riddles:[]},track=new Audio(),enabled=true,volume=.25;
 try{const p=JSON.parse(window.mandjiStorage.getItem('mandji-music')||'null');if(p){enabled=p.enabled;volume=p.volume;}}catch{}
 track.loop=true;let chapter=1;
 const ui=document.createElement('div');ui.className='ambient-controls';ui.innerHTML='<button type="button">MÚSICA</button><label>Volumen musical <input type="range" min="0" max="100" value="25"></label>';
 document.querySelector('#chapter-room').append(ui);const button=ui.querySelector('button'),slider=ui.querySelector('input');slider.value=volume*100;
 function update(){const quiet=document.hidden||manualGamePaused||document.querySelector('#preparation-dialog[open]')||document.querySelector('#chapter-room').classList.contains('is-hidden');const duck=window.speechSynthesis?.speaking?.valueOf()? .3:1;const level=enabled&&!quiet?volume*duck:0;track.volume=level;button.textContent=enabled?'MÚSICA: ON':'MÚSICA: OFF';if(quiet)track.pause();else if(enabled&&track.src)track.play().catch(()=>{});}
 function start(){update();}
 function persist(){try{window.mandjiStorage.setItem('mandji-music',JSON.stringify({enabled,volume}));}catch{}}
 button.onclick=()=>{enabled=!enabled;start();persist();};slider.oninput=()=>{volume=slider.value/100;start();persist();};
 document.addEventListener('click',start,{once:true});document.addEventListener('visibilitychange',update);setInterval(update,600);
 function chooseTrack(){chapter=Number(document.querySelector('[data-scene-number]').dataset.sceneNumber)||1;track.pause();track.removeAttribute('src');if(settings.music[chapter])track.src=settings.music[chapter].url;update();}
 new MutationObserver(chooseTrack).observe(document.querySelector('[data-scene-number]'),{attributes:true,attributeFilter:['data-scene-number']});
 fetch('/api/settings').then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{settings=d;for(const r of d.riddles||[])if(!missionRiddles.some(old=>old.id===r.id))missionRiddles.push(r);chooseTrack();}).catch(()=>{});
 update();
})();
