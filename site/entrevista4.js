(() => {
const A=window.Archive4;if(!A)return;
const M=Mission,C=CustodyInterview,S=A.state.interview,$=s=>document.querySelector(s);
const save=A.save;
const privacyText=()=>S.privacy==='nominal'?'Declaración identificada con el nombre ficcional Mateo Esono, antiguo encargado. Autoriza su incorporación al expediente.':'Identidad reservada · TEM-04. Elebi conserva la identificación y el acuerdo de uso fuera de la copia de consulta.';
const nav=document.createElement('button');nav.id='open-interview';nav.textContent='03 · ENTREVISTA';nav.onclick=open;document.querySelector('.archive-tabs').append(nav);
const stage=document.createElement('section');stage.id='interview-view';stage.hidden=true;$('#archive-main').append(stage);
function el(tag,text,parent=stage){const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;}
function begin(){S.started=true;S.located=true;save();M.dialog.close();A.view('interview');render();}
function open(){
if(!A.state.complete)return;
if(!S.started&&A.state.route==='formal'&&!S.located){
M.show('Localizar al antiguo encargado');
M.paragraph('La aclaración escrita no incluía localizar al testigo. El contacto del Ministerio puede consultar el registro de personal y concertar una conversación. Coste: 0 € y 1 hora de misión. Se descuenta una sola vez al confirmar.');
M.button('CONFIRMAR LOCALIZACIÓN · 1 HORA',()=>{if(S.located){begin();return;}if(!M.spend(0,1)){M.insufficient();return;}S.located=true;save();M.collect('localizacion-encargado-4','Contacto con el antiguo encargado','Consulta del registro de personal y cita de entrevista: 0 € y 1 hora.',4);begin();});
M.button('VOLVER AL ARCHIVO',()=>M.dialog.close());return;
}begin();
}
function refresh(){nav.disabled=!A.state.complete;if(S.evidence){$('#outcome-text').textContent=S.completed?'La entrevista y el tablero ampliado están incorporados al informe. La documentación de la delegación española queda como próxima actuación.':'Nuevas fuentes incorporadas. Consulta las copias y revisa el tablero ampliado antes de actualizar el informe.';}render();}
function render(){
stage.replaceChildren();el('p','CAPÍTULO IV · ENTREVISTA').className='eyebrow';
el('h2','El antiguo encargado del almacén');
el('p','Mateo Esono · personaje ficcional. Conservó copias de trabajo de la expedición de 1998. Hoy recuerda lo que presenció, pero no conoce todo el recorrido de la caja.');
if(!A.state.complete){el('p','Completa primero el archivo ministerial y elige una gestión.');return;}
if(!S.privacy){
el('h3','Acordar cómo conservar su declaración');
el('p','«Podéis registrar mi nombre en vuestro expediente o reservar mi identidad. En ambos casos quiero revisar mis palabras y que quede claro lo que no vi». Ambas opciones cuentan con su acuerdo; ninguna altera los hechos que podrá aportar.');
M.button('CONSERVAR SU NOMBRE CON SU ACUERDO',()=>{S.privacy='nominal';save();render();},stage);
M.button('RESERVAR SU IDENTIDAD · TEM-04',()=>{S.privacy='reservada';save();render();},stage);return;
}
el('p',privacyText()).className='interview-consent';
el('p','Pregunta por hechos concretos. Después distingue una observación directa, una información que le contaron y una deducción.');
const progress=el('p',C.topics.filter(t=>S.answers[t.id]===t.kind).length+' / 3 respuestas clasificadas');progress.setAttribute('role','status');
for(const topic of C.topics){
const card=document.createElement('article');card.className='interview-topic';stage.append(card);
M.button(topic.question,()=>{if(!S.heard.includes(topic.id))S.heard.push(topic.id);save();render();},card);
if(!S.heard.includes(topic.id))continue;
el('blockquote','«'+topic.answer+'»',card);
const field=document.createElement('fieldset');const legend=el('legend','Clasifica la respuesta · '+topic.question,field);card.append(field);
for(const [kind,label]of [['directa','Observación directa'],['referida','Información que le contaron'],['deduccion','Deducción del testigo']]){
const b=M.button(label,()=>{S.answers[topic.id]=kind;save();render();},field);
b.disabled=S.answers[topic.id]===topic.kind;
}
if(S.answers[topic.id]){const good=S.answers[topic.id]===topic.kind;el('p',good?'✓ '+topic.why:'Revisa el origen de la afirmación: ¿lo vio, se lo contaron o lo supone? No se ha descontado tiempo adicional.',card).className=good?'interview-correct':'feedback';}
}
const leading=document.createElement('details');const summary=el('summary','¿Fue la coordinación quien ordenó sacar el bastón?',leading);el('p','Christian: «La pregunta ya introduce una conclusión. Preguntemos si vio una orden y quién la firmó». El encargado aclara que no vio ninguna autorización. Su suposición no identifica a un responsable.',leading);stage.append(leading);
if(C.classified(S.answers)&&!S.evidence){
el('h3','Las copias que conserva');
el('p','«Guardé una hoja de preparación del embalaje y una ficha del envío previsto. Podéis copiarlas y adjuntar mi declaración revisada. No son un justificante de embarque y no sé si finalmente se ejecutó».');
M.button('INCORPORAR LAS COPIAS Y LA DECLARACIÓN',acquire,stage);
}
if(S.evidence){
el('h3','Nuevas fuentes para contrastar');
el('p','Los vínculos del bastón y de la separación de C-4 se han reabierto. Su valoración anterior permanece en el disco duro como antecedente. Las copias necesitan cotejo con los originales.');
for(const d of C.documents)M.button('EXAMINAR · '+d.title,()=>A.documentView(Custody.documents.find(x=>x.id===d.id)),stage);
M.button('REVISAR EL TABLERO AMPLIADO',()=>{M.dialog.close();A.view('board');},stage);
const update=M.button('ACTUALIZAR EL INFORME DE CUSTODIA',report,stage);update.disabled=!A.solved();
if(!A.solved())el('p','Consulta las tres nuevas fuentes y contrasta los vínculos pendientes del tablero.');
}
}
function acquire(){
if(S.evidence||!C.classified(S.answers)||!S.privacy)return;
const prior=A.state.links.baston;
if(prior?.validated)M.collect('antecedente-vinculo-baston-4','Valoración anterior · Bastón y C-4','Antes de la entrevista, la fotografía de cajas cerradas no permitía vincular el bastón con C-4; la separación solo se apoyaba en una nota sin firma. Se conserva esta valoración para documentar cómo cambió la investigación.',4);
S.evidence=true;delete A.state.links.baston;delete A.state.links.separada;C.attach(Custody,S);decorateTranscript();save();
M.collect('consentimiento-entrevista-4','Acuerdo de entrevista · TEM-04',privacyText()+' El testigo revisa y permite incorporar su declaración y copiar dos documentos. No se promete anonimato absoluto ni resultados de restitución.',4);
A.refresh();A.view('interview');M.magic();
}
function decorateTranscript(){const t=Custody.documents.find(d=>d.id==='testimonio');if(t)t.body=privacyText()+'\n\n'+C.topics.map(q=>q.question+'\n«'+q.answer+'»').join('\n\n');}
function report(){
if(!S.evidence||!A.solved()){M.show('Tablero pendiente de contraste');M.paragraph('Consulta las tres nuevas fuentes y revisa los cinco vínculos antes de emitir el informe actualizado.');M.button('IR AL TABLERO',()=>{M.dialog.close();A.view('board');});return;}
S.completed=true;save();
const text='INFORME ACTUALIZADO · ARCHIVO Y ENTREVISTA\n\n'+privacyText()+'\n\nEl encargado afirma haber visto C-4 separada y reconoce que no examinó su contenido. La referencia a un laboratorio en España procede de lo que le contó un compañero; la atribución de autorización a la coordinación es una deducción sin firma ni orden observada.\n\nLa copia de la hoja de embalaje relaciona el registro 017 con C-4. Sigue siendo un indicio pendiente de cotejo con el original. La ficha de preparación consigna C-4 y MBO-98/41, pero indica «pendiente de entrega» y no está firmada por un transportista.\n\nNo están acreditados el embarque, la salida del país, la recepción en España ni quién autorizó el traslado.\n\nPróxima actuación: solicitar a la delegación española el original de la hoja de embalaje y los antecedentes de MBO-98/41; buscar un justificante de entrega y un acuse de recepción. Esa escena queda pendiente. Se conserva el informe ministerial previo como antecedente.';
M.collect('informe-entrevista-4','Informe actualizado · Archivo y entrevista',text,4);M.show('Entrevista incorporada · Cadena de custodia');M.paragraph(text,'document-sheet');M.button('VOLVER AL TABLERO',()=>{M.dialog.close();A.view('board');});M.button('VER CAPÍTULOS',()=>location.href='capitulos.html');A.refresh();
}
window.Interview4={open,refresh,report};
if(S.evidence)decorateTranscript();
refresh();A.view(A.state.view||'documents');
})();