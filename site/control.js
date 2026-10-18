(()=> {
const M=Mission,B=BataLocation,$=s=>document.querySelector(s),key='mandji-bata-map-v1';
if(!M.read('mandji-cultural-trail-v1',{}).complete){location.replace('asociacion.html');return;}
if(!M.leader){location.replace('capitulos.html');return;}
const state=B.migrate(M.read(key,{}));if(state.stage===3&&!B.isLocated(state))state.stage=2;
const save=()=>window.mandjiStorage.setItem(key,JSON.stringify(state));save();
let map,layer,svg,box=[0,0,1000,620],drag=null,moved=false;
const center=[1.863,9.777],zones=[{name:'Sector norte',box:[[1.871,9.768],[1.886,9.789]]},{name:'Covadonga · zona aproximada',box:[[1.857,9.768],[1.871,9.789]],target:true},{name:'Sector sur',box:[[1.843,9.768],[1.857,9.789]]}];
const say=(name,text)=>{$('#speaker').textContent=name;$('#dialogue').textContent=text;};
function button(text,fn,host){const b=document.createElement('button');b.textContent=text;b.type='button';b.onclick=fn;host.append(b);return b;}
function inspectZone(i){if(state.stage!==0)return;if(!state.visited.includes(i))state.visited.push(i);save();$('#feedback').textContent=zones[i].target?'Has localizado Covadonga. Abre el plano del barrio para buscar Mama Buna.':zones[i].name+': no coincide con el barrio de la revista.';$('#choices').querySelector('[data-select-zone]')?.remove();if(zones[i].target){const b=button('ABRIR PLANO DE COVADONGA',()=>advance(1),$('#choices'));b.dataset.selectZone='true';}if(layer)layer.getLayers()[i].bindTooltip(zones[i].name,{permanent:true,direction:'center'}).openTooltip();}
function advance(n){state.stage=n;save();M.magic();render();}
function setBox(){if(svg)svg.setAttribute('viewBox',box.join(' '));}
function zoom(factor){const w=Math.max(450,Math.min(1600,box[2]*factor)),h=w*.62;box=[box[0]+(box[2]-w)/2,box[1]+(box[3]-h)/2,w,h];setBox();}
function pan(dx,dy){box[0]+=dx*box[2];box[1]+=dy*box[3];setBox();}
function makeMap(){
box=[0,0,1000,620];const host=$('#narrative-map');host.replaceChildren();svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',box.join(' '));svg.setAttribute('aria-label',state.stage===1?'Plano interactivo de Covadonga':'Plano interactivo del patio de Mama Buna');svg.setAttribute('role','group');host.append(svg);
const neighborhood=state.stage===1;
let art='<rect width="1000" height="620" fill="#e6dfc7"/><path d="M0 340H1000 M510 0V620" stroke="#c6bca3" stroke-width="64"/><path d="M0 340H1000 M510 0V620" stroke="#f9f1d9" stroke-width="46"/><text x="930" y="40" font-size="25" fill="#284c3d">N ↑</text>';
if(neighborhood)art+='<circle cx="425" cy="310" r="44" fill="#5d8867"/><text x="390" y="370" font-size="22">CEIBA</text><circle cx="690" cy="330" r="24" fill="#72abb1"/><text x="730" y="338" font-size="20">FUENTE</text><rect x="620" y="225" width="150" height="50" fill="#b7ab8a"/><text x="635" y="258" font-size="20">ESCUELA</text><rect x="145" y="255" width="175" height="40" fill="#be9d7b"/><text x="160" y="282" font-size="20">MERCADO</text>';
else art+='<rect x="60" y="280" width="850" height="100" rx="14" fill="#cbbf99"/><text x="345" y="335" font-size="26" fill="#294939">PATIO DE MAMA BUNA</text><text x="100" y="580" font-size="20">Corredor central · edificios al norte y al sur</text>';
svg.innerHTML=art;
const candidates=neighborhood?B.patios:B.offices;
for(const c of candidates){
const g=document.createElementNS(svg.namespaceURI,'g');g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-label','Examinar '+c.label);g.classList.add('map-building');if(!neighborhood&&state.stage===3&&state.office===c.id)g.classList.add('located');
let body='<rect x="'+c.x+'" y="'+c.y+'" width="180" height="115" rx="8" fill="#f5edd7" stroke="#65785d" stroke-width="3"/><text x="'+(c.x+18)+'" y="'+(c.y+30)+'" font-size="22" fill="#213e30">'+c.label+'</text>';
if(!neighborhood){const blue=['2','3','4'].includes(c.id);body+='<rect x="'+(c.x+80)+'" y="'+(c.y+60)+'" width="25" height="55" fill="'+(blue?'#477ea3':'#688760')+'"/>';if(c.id!=='3'&&c.id!=='5'){body+='<rect x="'+(c.x+22)+'" y="'+(c.y+55)+'" width="30" height="26" fill="#a3c1c5"/>';if(c.id==='2'||c.id==='4')body+='<rect x="'+(c.x+128)+'" y="'+(c.y+55)+'" width="30" height="26" fill="#a3c1c5"/>';}}
g.innerHTML=body;g.onclick=()=>{if(!moved)inspectSite(c);};g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspectSite(c);}};svg.append(g);
}
svg.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,box:[...box]};moved=false;};
svg.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)<8)return;moved=true;const r=svg.getBoundingClientRect();box=[drag.box[0]-dx/r.width*drag.box[2],drag.box[1]-dy/r.height*drag.box[3],drag.box[2],drag.box[3]];setBox();};
svg.onpointerup=()=>{drag=null;};svg.onpointerleave=()=>{drag=null;};
$('#choices').replaceChildren();for(const c of candidates)button('EXAMINAR '+c.label.toUpperCase(),()=>inspectSite(c),$('#choices'));
}
function inspectSite(c){
const type=state.stage===1?'patio':'edificio';const id=type+'-'+c.id;if(!state.inspected.includes(id))state.inspected.push(id);save();
const host=$('#site-inspection');host.replaceChildren();const h=document.createElement('h3');h.textContent=c.label;host.append(h);M.paragraph(c.detail,'',host);
button(type==='patio'?'SELECCIONAR ESTE PATIO':'SELECCIONAR ESTE EDIFICIO',()=>{
if(!c.correct){state.mistakes++;save();$('#feedback').textContent=type==='patio'?'Compara la posición respecto a la ceiba, la fuente y la escuela. Ese patio no reúne las tres referencias.':'Compara el lado del patio, la puerta, las ventanas y la placa. Ese edificio no coincide con la descripción.';return;}
if(type==='patio'){state.patio=c.id;M.collect('mama-buna-mapa-3','Mama Buna localizada en el plano','El patio C coincide con las referencias del croquis: este de la ceiba, frente a la fuente y al sur de la escuela. Localización narrativa del juego.',3);advance(2);}
else verifyOffice(c);
},host);
}
function verifyOffice(c){
M.show('Contrastar la antigua oficina');
M.paragraph(c.detail);
M.paragraph('Selecciona las dos comprobaciones que vinculan el edificio con la redacción de Daniel. Identificar una oficina antigua no demuestra que los papeles sigan allí.');
const checks=[['rasgos','Está en el lado norte, con puerta azul y dos ventanas.'],['placa','La placa conserva el nombre Memoria del Litoral.'],['suposicion','Como es una oficina, el informe debe seguir dentro.']];
const inputs=checks.map(([id,text])=>{const label=document.createElement('label'),i=document.createElement('input');i.type='checkbox';i.value=id;label.append(i,document.createTextNode(text));label.className='map-proof';M.body.append(label);return i;});
M.button('CONFIRMAR UBICACIÓN DE LA OFICINA',()=>{
const proof=inputs.filter(x=>x.checked).map(x=>x.value);
if(proof.length!==2||!proof.includes('rasgos')||!proof.includes('placa')){M.paragraph('La ubicación se contrasta con los rasgos del edificio y el nombre de la revista. La conservación de los papeles sigue sin comprobarse.','feedback');return;}
state.office=c.id;state.proofs=proof;state.stage=3;save();M.collect('direccion-mapa-3','Antigua oficina de Daniel · Mama Buna','En el plano narrativo de Covadonga: patio Mama Buna, edificio norte con puerta azul, dos ventanas y placa Memoria del Litoral. Contraste con el croquis del número 07. No se ha confirmado quién conserva el archivo ni si el informe sigue allí.',3);M.dialog.close();M.magic();render();
});M.button('VOLVER AL PLANO',()=>M.dialog.close());
}
function render(){
$('#feedback').textContent='';$('#choices').replaceChildren();$('#next').replaceChildren();$('#site-inspection').replaceChildren();
const city=state.stage===0;$('#map').hidden=!city;$('#detail').hidden=city;$('#zoom-in').hidden=city;$('#zoom-out').hidden=city;
document.querySelectorAll('#steps li').forEach((li,i)=>li.classList.toggle('current',i===Math.min(state.stage,2)));
$('#help').hidden=state.stage===3;
$('#clue-dossier')?.remove();const clues=document.createElement('details');clues.id='clue-dossier';const summary=document.createElement('summary');summary.textContent='PISTAS DE LA REVISTA · N.º 07';clues.append(summary);M.paragraph(B.patioClue,'',clues);M.paragraph(B.officeClue,'',clues);$('#instruction').after(clues);
if(city){$('#objective').textContent='1 · Encuentra Covadonga';$('#instruction').textContent='Explora los sectores de Bata. Después abre el plano del barrio.';zones.forEach((z,i)=>button('EXPLORAR SECTOR '+(i+1),()=>inspectZone(i),$('#choices')));say('Lucía','La revista sitúa la redacción en Mama Buna, Covadonga. Tenemos un croquis de acceso para orientarnos.');if(map)setTimeout(()=>map.invalidateSize(),0);}
else if(state.stage===1){$('#objective').textContent='2 · Localiza Mama Buna';$('#instruction').textContent='Explora los patios del plano y contrasta las tres referencias del croquis. Puedes arrastrar y ampliar el plano o usar los botones de exploración.';say('André','Mama Buna debe estar al este de la ceiba, frente a la fuente y al sur de la escuela.');makeMap();}
else if(state.stage===2){$('#objective').textContent='3 · Encuentra la antigua oficina';$('#instruction').textContent='Examina los edificios de Mama Buna. Contrasta sus rasgos con la nota de los colaboradores.';say('Christian','Buscamos la redacción antigua, no una prueba de que sus documentos continúen allí.');makeMap();}
else{
$('#objective').textContent='Antigua oficina localizada';$('#instruction').textContent='Mama Buna · edificio norte con puerta azul, dos ventanas y placa de la revista. Ya puedes organizar el viaje.';say('Lucía','Tenemos identificada la antigua oficina en el plano. Al llegar preguntaremos a la familia por el archivo.');makeMap();
button('ORGANIZAR EL DESPLAZAMIENTO',travel,$('#next'));button('REVISAR MAMA BUNA',()=>advance(2),$('#next'));
}
if(M.read('mandji-travel-bata-v1',{})?.paid)button('CONTINUAR LA VISITA YA PAGADA',()=>location.href='escena3.html',$('#next'));
}
function travel(){
const paid=M.read('mandji-travel-bata-v1',{})?.paid;if(paid){location.href='escena3.html';return;}
if(!B.isLocated(state)){M.show('Localiza primero la oficina');M.paragraph('Encuentra Mama Buna y contrasta la antigua oficina antes de organizar el desplazamiento.');return;}
M.show('Viaje a Mama Buna · Covadonga, Bata');M.paragraph('Destino contrastado con el croquis: antigua oficina de Daniel en Mama Buna. Traslado: 900 € y 4 horas. Solo se descuentan al confirmar.');
M.button('CONFIRMAR VIAJE · 900 € Y 4 HORAS',()=>{if(M.read('mandji-travel-bata-v1',{})?.paid){location.href='escena3.html';return;}if(!B.isLocated(state))return;if(!M.spend(900,4)){M.insufficient();return;}window.mandjiStorage.setItem('mandji-travel-bata-v1',JSON.stringify({paid:true,cost:900,hours:4,location:'mama-buna-oficina',mapEdition:3}));M.collect('viaje-bata-3','Viaje a Mama Buna','Viaje a la antigua oficina contrastada en el plano: 900 € y 4 horas. Falta preguntar por el archivo personal.',3);location.href='escena3.html';});M.button('VOLVER AL MAPA',()=>M.dialog.close());
}
$('#help').onclick=()=>{$('#feedback').textContent=['Busca Covadonga en el sector central de Bata.','La ceiba queda al oeste del patio; la fuente está enfrente y la escuela al norte.','Descarta los edificios del sur. Compara las ventanas, la puerta y la placa.'][state.stage]||'';};
$('#zoom-in').onclick=()=>zoom(.75);$('#zoom-out').onclick=()=>zoom(1.3);
$('#recenter').onclick=()=>{if(state.stage===0)map?.setView(center,14);else{box=[0,0,1000,620];setBox();}};
if(window.L){map=L.map('map',{scrollWheelZoom:false}).setView(center,14);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).on('tileerror',()=>{$('#feedback').textContent='No se cargó parte de la base de Bata. Puedes elegir los sectores con los botones; los planos del barrio y del patio funcionan sin conexión.';}).addTo(map);layer=L.layerGroup().addTo(map);zones.forEach((z,i)=>L.rectangle(z.box,{color:'#c08c31',weight:2,fillOpacity:.12}).on('click',()=>inspectZone(i)).addTo(layer));}
render();
})();