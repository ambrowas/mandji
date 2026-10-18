(() => {
const key='mandji-replay-session-v1',real=window.localStorage;
const page=location.pathname.split('/').pop();
if(['capitulos.html','index.html',''].includes(page))sessionStorage.removeItem(key);
let data;try{data=JSON.parse(sessionStorage.getItem(key));}catch{}
window.mandjiStorage=real;
if(data){
const values=data.values,save=()=>sessionStorage.setItem(key,JSON.stringify(data));
window.mandjiStorage={getItem:k=>Object.hasOwn(values,k)?values[k]:null,setItem:(k,v)=>{values[String(k)]=String(v);save();},removeItem:k=>{delete values[k];save();},clear:()=>{Object.keys(values).forEach(k=>delete values[k]);save();},key:i=>Object.keys(values)[i]??null,get length(){return Object.keys(values).length;}};
document.addEventListener('DOMContentLoaded',()=>{const bar=document.createElement('aside');bar.className='replay-notice';bar.style.cssText='position:fixed;bottom:8px;right:8px;z-index:10000;background:#14271f;color:#f8ecd2;border:1px solid #dab76c;padding:8px 12px;font:13px system-ui;max-width:90vw';bar.append(document.createTextNode('Repetición · Tu partida original está guardada. '));const a=document.createElement('a');a.href='capitulos.html';a.textContent='Salir';a.style.color='#ffe099';bar.append(a);document.body.append(bar);});
}
const replayAtLoad=!!data;
window.addEventListener('pageshow',e=>{if(e.persisted&&replayAtLoad!==!!sessionStorage.getItem(key))location.reload();});
window.startMissionReplay=mission=>{
const values={};for(let i=0;i<real.length;i++){const k=real.key(i);if(k.startsWith('mandji-'))values[k]=real.getItem(k);}
const remove=keys=>keys.forEach(k=>delete values[k]);
if(mission===1)remove(['mandji-leader-v1','mandji-plan-v1','mandji-map-puzzle-v1','mandji-email-v1','mandji-riddles-v1','mandji-photo-puzzle-v2','mandji-pauses-scene-1']);
if(mission===2)remove(['mandji-scene2-v1','mandji-cultural-trail-v1','mandji-search3-v1','mandji-travel-bata-v1','mandji-scene3-v1']);
if(mission===3)remove(['mandji-exhibition-v1','mandji-scene3-v1','mandji-cultural-trail-v1','mandji-search3-v1','mandji-travel-bata-v1']);
let collection;try{collection=JSON.parse(values['mandji-collection-v1']);}catch{}
if(collection){collection.clues=(collection.clues||[]).filter(c=>(c.mission||1)!==mission);values['mandji-collection-v1']=JSON.stringify(collection);}
values['mandji-fictional-hours-v3']='604800000';
sessionStorage.setItem(key,JSON.stringify({mission,values}));
location.href=['','jugar.html','escena2.html','ordenador3.html'][mission];
};
})();
