window.renderFantasmasTrailer=function(host){
 const box=document.createElement('section');box.className='fantasmas-trailer';box.setAttribute('aria-label','Avance de Fantasmas de Mikomeseng');host.append(box);
 const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.poster='assets/fantasmas-teaser.png';video.src='assets/fantasmas-avance.mp4';video.setAttribute('aria-label','Fantasmas de Mikomeseng · Avance completo');video.style.cssText='display:block;width:100%;height:auto;background:#000';box.append(video);
 const pause=()=>{if(document.hidden)video.pause();};document.addEventListener('visibilitychange',pause);
 const cleanup=new MutationObserver(()=>{if(!document.contains(box)){video.pause();document.removeEventListener('visibilitychange',pause);cleanup.disconnect();}});cleanup.observe(host,{childList:true});
};
