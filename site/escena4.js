(() => {
const M=Mission,D=Custody,$=s=>document.querySelector(s),key='mandji-scene4-v1';
const state=M.read(key,{read:[],links:{},route:null,complete:false});
const save=()=>window.mandjiStorage.setItem(key,JSON.stringify(state));
const allRead=()=>D.documents.every(d=>state.read.includes(d.id));
const solved=()=>D.links.every(l=>state.links[l.id]?.validated);
const routes={
formal:{title:'Solicitar aclaración formal',hours:3,text:'La oficina de depósitos confirma por escrito que el libro consultado contiene tres entradas y que no dispone, en este expediente, de inventario individual de la entrega. No puede certificar el contenido de C-4 ni la presencia del bastón. Se incorpora la respuesta a la solicitud MND-04.'},
encargado:{title:'Localizar al antiguo encargado',hours:1,text:'El contacto del Ministerio localiza una referencia del antiguo encargado en el registro de personal y registra nuestra petición de entrevista. Aún no hemos hablado con él: no hay testimonio nuevo ni confirmación de qué contenía C-4. La entrevista queda como próxima actuación.'}
};
function view(board){$('#documents-view').hidden=board;$('#board-view').hidden=!board;$('#open-documents').setAttribute('aria-pressed',String(!board));$('#open-board').setAttribute('aria-pressed',String(board));state.view=board?'board':'documents';save();}
function documentView(d){if(!state.read.includes(d.id))state.read.push(d.id);save();M.collect('archivo-4-'+d.id,d.title,d.ref+'\n\n'+d.body,4);refresh();M.show(d.title);M.paragraph(d.ref,'doc-ref');M.paragraph(d.body,'document-sheet');M.button('VOLVER AL EXPEDIENTE',()=>M.dialog.close());}
function refresh(){
const n=D.links.filter(l=>state.links[l.id]?.validated).length;
$('#chapter-progress').textContent=n+' / 3';
$('#reading-progress').textContent=state.read.length+' / 4 documentos consultados';
$('#board-guidance').textContent=allRead()?'Contrasta cada vínculo. No atribuyas al bastón un recorrido que los documentos no demuestran.':'Consulta los cuatro documentos antes de validar el tablero. Puedes volver al expediente cuando quieras.';
$('#next-step').hidden=!solved()||state.complete;
$('#archive-outcome').hidden=!state.complete;
if(state.complete)$('#outcome-text').textContent='Has documentado la discrepancia entre los registros y las lagunas de custodia. '+routes[state.route]?.title+'. La entrevista y la documentación de la delegación española serán las siguientes actuaciones.';
$('#document-list').replaceChildren();
for(const d of D.documents){const card=document.createElement('article');card.className='archive-doc';const ref=document.createElement('p');ref.className='doc-ref';ref.textContent=d.ref;const h=document.createElement('h3');h.textContent=d.title;const p=document.createElement('p');p.className='read-mark';p.textContent=state.read.includes(d.id)?'✓ Consultado y guardado en el disco duro':'Pendiente de consultar';card.append(ref,h,p);M.button('EXAMINAR · '+d.title,()=>documentView(d),card);$('#document-list').append(card);}
renderBoard();
}
function renderBoard(){
const host=$('#custody-links');host.replaceChildren();
for(const link of D.links){
const saved=state.links[link.id]||{evidence:[],level:''};const card=document.createElement('article');card.className='custody-card'+(saved.validated?' validated':'');const h=document.createElement('h3');h.textContent=link.title;const p=document.createElement('p');p.textContent=link.question;card.append(h,p);
const field=document.createElement('fieldset');const legend=document.createElement('legend');legend.textContent='Pruebas para «'+link.title+'»';field.append(legend);
const inputs=D.documents.map(d=>{const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=d.id;input.checked=saved.evidence.includes(d.id);input.disabled=!!saved.validated;label.append(input,document.createTextNode(d.title));field.append(label);return input;});card.append(field);
const label=document.createElement('label');label.textContent='Grado de certeza';const select=document.createElement('select');select.setAttribute('aria-label','Certeza · '+link.title);
for(const [value,text] of [['','Selecciona una valoración'],['acreditado','Acreditado por la documentación'],['indicio','Indicio pendiente de contraste'],['desconocido','Desconocido']]){const o=document.createElement('option');o.value=value;o.textContent=text;select.append(o);}select.value=saved.level;select.disabled=!!saved.validated;label.append(select);card.append(label);
const feedback=document.createElement('p');feedback.className='feedback';feedback.setAttribute('role','status');if(saved.validated)feedback.textContent='✓ '+link.explanation;
const draft=()=>{state.links[link.id]={evidence:inputs.filter(x=>x.checked).map(x=>x.value),level:select.value,validated:false};save();};inputs.forEach(x=>x.onchange=draft);select.onchange=draft;
const validate=M.button(saved.validated?'VÍNCULO CONTRASTADO':'VALIDAR · '+link.title,()=>{
if(!allRead()){feedback.textContent='Consulta primero los cuatro documentos del expediente.';return;}
const evidence=inputs.filter(x=>x.checked).map(x=>x.value);
if(!D.validate(link.id,evidence,select.value)){feedback.textContent='Revisa qué documento respalda esta afirmación y hasta dónde permite llegar. '+(link.id==='cuentas'?'Contrasta los dos registros de recepción.':link.id==='separada'?'Una nota sin firma todavía requiere otra fuente.':'Una caja cerrada no revela su contenido.');return;}
state.links[link.id]={evidence,level:select.value,validated:true};save();M.collect('vinculo-4-'+link.id,link.title,link.explanation,4);M.magic();refresh();
},card);validate.disabled=!!saved.validated||!allRead();card.append(feedback);host.append(card);
}
}
function decision(){
M.show('El siguiente paso');
M.paragraph('Los tres vínculos están contrastados. Puedes conseguir una respuesta escrita o preparar la localización del antiguo encargado. Ambas gestiones son gratuitas; el tiempo se descuenta al confirmar. La búsqueda del encargado prepara una próxima visita.');
for(const [id,r]of Object.entries(routes)){const section=document.createElement('section');section.className='route-choice';const h=document.createElement('h3');h.textContent=r.title;section.append(h);M.paragraph('0 € · '+r.hours+(r.hours===1?' hora de misión. ':' horas de misión. ')+(id==='formal'?'Añade una aclaración escrita sobre el alcance de los registros.':'Registra una solicitud de entrevista para la siguiente fase.'),'',section);M.button('REVISAR GESTIÓN · '+r.title,()=>confirmRoute(id),section);M.body.append(section);}
M.button('VOLVER AL TABLERO',()=>M.dialog.close());
}
function confirmRoute(id){const r=routes[id];M.show('Confirmar gestión');M.paragraph(r.title+' · 0 € · '+r.hours+(r.hours===1?' hora. Solo se aplica una vez.':' horas. Solo se aplica una vez.'));M.button('CONFIRMAR · '+r.title,()=>{if(state.complete){report();return;}if(!solved())return;if(!M.spend(0,r.hours)){M.insufficient();return;}state.route=id;state.complete=true;save();M.collect('gestion-4',r.title,r.text,4);refresh();report();});M.button('VOLVER A LAS OPCIONES',decision);}
function report(){
const r=routes[state.route];if(!r)return;
const text='ARCHIVO MINISTERIAL · INFORME PARCIAL\n\nEl acta anuncia cuatro cajas y el libro registra tres. La discrepancia está documentada, pero desconocemos su causa.\n\nLa nota sin firma indica que C-4 fue separada antes de la entrega. Debemos contrastarla. La fotografía muestra cajas cerradas y no permite situar el bastón 017 en ninguna de ellas.\n\nGestión realizada: '+r.title+'.\n'+r.text+'\n\nPróximas actuaciones: entrevistar al antiguo encargado y solicitar la copia de la delegación española. No disponemos de una hoja de embalaje, un número de envío ni un destino verificado en España.\n\nEste primer tramo del capítulo IV termina aquí. Las escenas siguientes están pendientes de desarrollo.';
M.collect('informe-4','Informe parcial · El rastro de las cajas',text,4);M.show('Archivo revisado · El rastro de las cajas');M.paragraph(text,'document-sheet');M.button('VOLVER AL TABLERO',()=>M.dialog.close());M.button('VER CAPÍTULOS',()=>location.href='capitulos.html');
}
function briefing(){M.show('Capítulo IV · El rastro de las cajas');M.paragraph('Tras el informe de Bata tenemos la denuncia y una fotografía del bastón en la expedición de 1998. No sabemos quién lo custodió después. El Ministerio nos permite consultar las copias del expediente de entrega.');M.paragraph('Examina cuatro documentos y contrasta tres vínculos del tablero. Leer y corregir el tablero no cuesta recursos. Al final elegirás una gestión con una demora indicada antes de confirmar.');M.button('EXAMINAR EL ARCHIVO',()=>M.dialog.close());}
if(!M.leader||!M.read('mandji-scene3-v1',{}).complete){$('#archive-main').hidden=true;$('#briefing').disabled=true;M.show('Completa primero el informe de Bata');M.paragraph('El archivo ministerial se abre al redactar el informe final del capítulo III.');M.button('VER CAPÍTULOS',()=>location.href='capitulos.html');return;}
$('#open-documents').onclick=()=>view(false);$('#open-board').onclick=()=>view(true);$('#briefing').onclick=briefing;$('#next-step').onclick=decision;$('#review-report').onclick=report;
refresh();view(state.view==='board');if(state.complete)report();else briefing();
})();