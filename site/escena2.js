(() => {
const $=s=>document.querySelector(s),key='mandji-scene2-v1',timerKey='mandji-fictional-hours-v3';
const read=(key,fallback)=>{try{return JSON.parse(window.mandjiStorage.getItem(key))??fallback}catch{return fallback}};
let state=read(key,{requested:false,matched:false,ordered:false,checked:false,complete:false,revealed:[],pauses:0}),leader=read('mandji-leader-v1',null),collection=read('mandji-collection-v1',{clues:[],objects:[]});
let remaining=Number(window.mandjiStorage.getItem(timerKey)??604800000),last=performance.now(),paused=false,expiry=false;
const panel=$('#panel'),content=$('#panel-body');
function updateClueCount(){const count=[state.matched,state.ordered,state.checked].filter(Boolean).length;$('#clue-count').textContent=count+' / 3';}
const save=()=>{updateClueCount();window.mandjiStorage.setItem(key,JSON.stringify(state));window.mandjiStorage.setItem(timerKey,String(remaining));};
const fmt=n=>`${Math.floor(Math.max(0,n)/3600000)} h ${String(Math.floor(Math.max(0,n)/60000)%60).padStart(2,'0')} min`;
function collect(id,title,body){collection=read('mandji-collection-v1',{clues:[],objects:[]});const item={id,title,body,mission:2},index=collection.clues.findIndex(i=>i.id===id);if(index<0)collection.clues.push(item);else collection.clues[index]=item;window.mandjiStorage.setItem('mandji-collection-v1',JSON.stringify(collection));}
function show(title){if(briefingOpen){briefingOpen=false;stopBriefingVoice();}$('#panel-title').textContent=title;content.replaceChildren();if(!panel.open)panel.showModal();}
function paragraph(text,cls=''){const p=document.createElement('p');p.textContent=text;p.className=cls;content.append(p);return p;}
function button(text,fn,parent=content){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;parent.append(b);return b;}
function update(){const now=performance.now();if(!document.hidden&&document.hasFocus()&&now-last>=0&&now-last<=5000&&!paused&&!expiry&&leader)remaining=Math.max(0,remaining-(now-last)*24);last=now;$('#clock').textContent=fmt(remaining);$('#budget').textContent=leader?leader.budget.toLocaleString('es-ES')+' €':'Sin líder';save();if(remaining===0&&!expiry&&leader)timeChallenge();}
function timeChallenge(){expiry=true;const used=new Set();function next(){show('El tiempo se ha agotado');paragraph('Resuelve un acertijo para recuperar el plazo de misión.');let pool=missionRiddles.filter(r=>!used.has(r.id));if(!pool.length){used.clear();pool=missionRiddles;}const r=pool[Math.floor(Math.random()*pool.length)];used.add(r.id);paragraph(r.question);r.options.forEach((o,i)=>button(o,()=>{if(i!==r.answer){next();paragraph('Respuesta incorrecta. Prueba con este otro acertijo.','feedback');return;}remaining=604800000;expiry=false;last=performance.now();panel.close();save();}));}next();}
$('#close').onclick=()=>{if(!expiry)panel.close()};panel.addEventListener('cancel',e=>{if(expiry||paused)e.preventDefault()});
const briefingIntro=[
'La subasta se acerca. Tenemos una fotografía del bastón, pero todavía no sabemos de dónde procede ni cómo llegó a manos de sus actuales custodios. Antes de intentar recuperarlo, necesitamos pruebas que permitan vincularlo con el patrimonio de Guinea Ecuatorial.',
'Nuestro contacto en el Ministerio puede facilitarnos expedientes de proyectos en los que se registraron hallazgos arqueológicos. Entre esos documentos podría encontrarse la primera referencia al objeto que buscamos.'
];
const briefingGoals=[['Objetivo global de la misión','Investigar el origen del bastón, reconstruir su recorrido y reunir pruebas que fundamenten su posible recuperación.'],['Objetivo de este capítulo','Encontrar una referencia documental compatible con el bastón de la subasta y determinar hacia dónde debe continuar la investigación.']];
const briefingSpecific=[['Localizar un posible antecedente','Comparar la fotografía del bastón con los objetos descritos en los expedientes.'],['Reconstruir lo sucedido','Relacionar las comunicaciones y ordenar los acontecimientos del proyecto vinculado al hallazgo.'],['Identificar qué falta','Detectar lagunas en la documentación y buscar una fuente que permita continuar.']];
const briefingClosing='Una coincidencia es un punto de partida, no una prueba definitiva. Presta atención tanto a lo que los documentos cuentan como a lo que omiten.';
const briefingText=['Capítulo II · La expedición interrumpida','Torres Elebi · Sala de documentación',...briefingIntro,...briefingGoals.map(([h,t])=>h+'. '+t),'Objetivos específicos',...briefingSpecific.map(([h,t])=>h+'. '+t),briefingClosing].join('\n\n');
let briefingOpen=false,narrationMuted=read('mandji-briefing-muted-v1',false),narrationVersion=0,narrationStatus=null;
function stopBriefingVoice(){narrationVersion++;if('speechSynthesis' in window)window.speechSynthesis.cancel();}
function speakBriefing(){
 if(!briefingOpen||!panel.open||narrationMuted||!('speechSynthesis' in window))return;
 stopBriefingVoice();const version=narrationVersion,utterance=new SpeechSynthesisUtterance(briefingText);utterance.lang='es-ES';utterance.rate=.95;
 const voices=window.speechSynthesis.getVoices(),voice=voices.find(v=>v.lang==='es-ES')||voices.find(v=>v.lang.startsWith('es'));if(voice)utterance.voice=voice;
 narrationStatus.textContent='Preparando narración…';
 utterance.onstart=()=>{if(version===narrationVersion)narrationStatus.textContent='Escuchando el briefing';};
 utterance.onend=()=>{if(version===narrationVersion)narrationStatus.textContent='Narración finalizada';};
 utterance.onerror=()=>{if(version===narrationVersion)narrationStatus.textContent='Pulsa «Escuchar briefing» para iniciar la narración.';};
 window.speechSynthesis.speak(utterance);
}
function briefing(){
 show('Capítulo II · La expedición interrumpida');briefingOpen=true;
 paragraph('Torres Elebi · Sala de documentación','confirmation-kicker');
 const controls=document.createElement('div');controls.className='briefing-audio';content.append(controls);
 const supported='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
 const listen=button('ESCUCHAR BRIEFING',()=>{narrationMuted=false;window.mandjiStorage.setItem('mandji-briefing-muted-v1','false');syncMute();speakBriefing();},controls);listen.disabled=!supported;
 const mute=button('',()=>{narrationMuted=!narrationMuted;window.mandjiStorage.setItem('mandji-briefing-muted-v1',JSON.stringify(narrationMuted));syncMute();if(narrationMuted){stopBriefingVoice();narrationStatus.textContent='Narración silenciada';}else speakBriefing();},controls);mute.disabled=!supported;
 function syncMute(){mute.textContent=narrationMuted?'ACTIVAR NARRACIÓN':'SILENCIAR NARRACIÓN';mute.setAttribute('aria-pressed',String(narrationMuted));}syncMute();
 narrationStatus=document.createElement('span');narrationStatus.setAttribute('role','status');narrationStatus.textContent=supported?(narrationMuted?'Narración silenciada':'Pulsa «Escuchar briefing» si no comienza automáticamente.'):'Tu navegador no dispone de narración de voz. Puedes leer el briefing completo.';controls.append(narrationStatus);
 briefingIntro.forEach(t=>paragraph(t));
 briefingGoals.forEach(([heading,text])=>{const h=document.createElement('h3');h.textContent=heading;content.append(h);paragraph(text);});
 const h=document.createElement('h3');h.textContent='Objetivos específicos';content.append(h);const list=document.createElement('ul');list.className='briefing-objectives';content.append(list);
 briefingSpecific.forEach(([heading,text])=>{const li=document.createElement('li'),strong=document.createElement('strong');strong.textContent=heading+': ';li.append(strong,document.createTextNode(text));list.append(li);});
 paragraph(briefingClosing,'paper');collect('briefing-2','Briefing inicial · La expedición interrumpida',briefingText);button('COMENZAR LA INVESTIGACIÓN',()=>panel.close());if(supported&&!narrationMuted)speakBriefing();
}
panel.addEventListener('close',()=>{briefingOpen=false;stopBriefingVoice();});
window.addEventListener('pagehide',stopBriefingVoice);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&briefingOpen){stopBriefingVoice();if(narrationStatus)narrationStatus.textContent='Pulsa «Escuchar briefing» para volver a escucharlo.';}});
$('#briefing').onclick=briefing;
function placeSolved(id){return !!({computer:state.matched,board:state.ordered,folder:state.checked,sculpture:state.mbomioBonusClaimed}[id]);}
function placeAvailable(id){return id==='sculpture'?!!leader:id===activePlace()||placeSolved(id);}
function activePlace(){return !state.matched?'computer':!state.ordered?'board':!state.checked?'folder':null;}
function guidance(){updateClueCount();$('#gather-team').hidden=!(state.matched&&state.ordered&&state.checked);$('#guidance').textContent=state.checked?'Investigación documental completada. Reúne al equipo para preparar el siguiente paso.':!state.matched?'Busca en la habitación objetos o espacios con los que puedas interactuar.':!state.ordered?'Explora la habitación para encontrar la siguiente pista. Usa las flechas para recorrer el despacho.':'Explora la sala buscando objetos con los que interactuar en el orden correcto. Usa las flechas para recorrer el despacho.';}
const docs=[
{id:'a',title:'Acuerdo bilateral · Inicio de los trabajos',text:'Los Gobiernos de Guinea Ecuatorial y España firman un acuerdo para una misión arqueológica conjunta en Corisco y los Elobeyes. Se han encontrado indicios de que puede haber restos fósiles de la época prehistórica en las islas. Un equipo de la Universidad Autónoma de Navarra se traslada a Guinea Ecuatorial en febrero de 1998 para comenzar los trabajos.'},
{id:'b',title:'Denuncia anónima · Durante las excavaciones',text:'El equipo está formado por doce personas: seis guineanos y seis españoles. Sin embargo, la situación comienza a deteriorarse rápidamente y las disputas son constantes. Un componente de la expedición denuncia anónimamente irregularidades en el proceso de evaluación y clasificación de los objetos de interés encontrados bajo tierra. Señala que, en Corisco, la parte guineana ni siquiera ha tenido acceso a los hallazgos ni la posibilidad de examinarlos, aunque considera que podrían ser significativos.'},
{id:'c',title:'Enfrentamiento y suspensión · Marzo de 1998',text:'En marzo se produce un altercado violento entre los dos co-coordinadores: Miguel Ángel Sánchez Roig y Daniel Ángel Eneme Angue llegan a las manos. A raíz de la pelea, la parte española retira su personal y la financiación del proyecto, citando diferencias irreconciliables por «la incompetencia, mala fe y falta de profesionalidad de ciertos integrantes del equipo local».'},
{id:'d',title:'Recepción del informe · Tras la suspensión',text:'El registro del Ministerio deja constancia de la recepción de un informe presentado por Daniel Ángel Eneme Angue sobre lo ocurrido durante la expedición. La documentación conservada menciona una reunión con el ministro tutor y su posterior separación del cargo, pero no recoge el contenido del informe ni los detalles de aquella conversación.'},
{id:'e',title:'Entrega de materiales · Tras la retirada',text:'Tras la retirada del equipo español, los materiales de la expedición quedan depositados en dependencias del ministerio. Daniel Ángel, ya apartado de sus funciones, no participa en la entrega. El registro de recepción menciona varias cajas de hallazgos y documentación, pero entre los documentos conservados no figura una relación detallada de su contenido.'}
];
// Refresh documents already acquired without resetting the player's completed challenges.
if(state.matched){docs.forEach(d=>collect('comunicacion-'+d.id+'-2',d.title,d.text));}
if(state.ordered){collect('cronologia-2','Cronología de la suspensión',docs.map(d=>d.title+'\n'+d.text).join('\n\n'));}
collection=read('mandji-collection-v1',{clues:[],objects:[]});

for(const item of collection.clues){if(item.id==='acta-2')item.body=item.body.replace('25 de septiembre de 1998','Posterior al cese de Daniel');}
window.mandjiStorage.setItem('mandji-collection-v1',JSON.stringify(collection));
function computer(){show('Archivo digital · Antecedentes solicitados al Gobierno');if(!state.requested){paragraph('Elige cómo obtener acceso a los expedientes del Gobierno sobre obras públicas en las que hubo hallazgos de posible valor arqueológico.');const choices=document.createElement('div');choices.className='choices';content.append(choices);[[0,12,'Tramitación ordinaria','El contacto del Ministerio tramita la solicitud por el procedimiento habitual.'],[1200,3,'Gestión prioritaria','Contratamos apoyo local para localizar, digitalizar y entregar las copias con urgencia.']].forEach(([cost,hours,label,description])=>{const option=document.createElement('div');choices.append(option);const b=button(`${label} · ${cost.toLocaleString('es-ES')} € · ${hours} h`,()=>confirmConsultation(cost,hours,label),option);b.disabled=!leader;const explanation=document.createElement('p');explanation.textContent=description;option.append(explanation);});paragraph('Ambas vías dan acceso a los mismos documentos. El coste y el tiempo se descontarán al confirmar.');return;}archiveExplorer();}
function confirmConsultation(cost,hours,label){
update();if(expiry)return;
show('Confirmar solicitud');
paragraph(label,'confirmation-kicker');
const summary=document.createElement('div');summary.className='consultation-summary';content.append(summary);
for(const [heading,value] of [['Coste',cost.toLocaleString('es-ES')+' €'],['Tiempo de misión',hours+' horas']]){const box=document.createElement('div'),small=document.createElement('small'),strong=document.createElement('strong');small.textContent=heading;strong.textContent=value;box.append(small,strong);summary.append(box);}
paragraph('Estos recursos se descontarán al confirmar la solicitud de antecedentes.');
const actions=document.createElement('div');actions.className='choices confirmation-actions';content.append(actions);
const accept=button('CONFIRMAR',()=>{if(accept.disabled||state.requested)return;update();if(expiry)return;if(!leader||leader.budget<cost||remaining<=hours*3600000){paragraph('No dispones de recursos suficientes para esta opción. No se ha aplicado ningún cargo.','feedback');return;}accept.disabled=true;last=performance.now();leader.budget-=cost;remaining-=hours*3600000;state.requested=true;window.mandjiStorage.setItem('mandji-leader-v1',JSON.stringify(leader));collect('consulta-2','Solicitud de antecedentes',`${label}. Coste: ${cost} €. Demora: ${hours} horas. Se habilitó el acceso a los expedientes de proyectos.`);save();computer();},actions);
const cancel=button('CANCELAR',computer,actions);cancel.focus();
}
const archiveProjects = [
 {code:'EXP-96/014',title:'Rehabilitación de inmuebles',year:1996,place:'Restauración de edificios públicos',note:'Objetos recuperados al excavar cimentaciones y patios durante las obras.',items:[
 ['01','Pieza de madera torneada','Fragmento de balaustre de 34 cm, con extremos planos y restos de pintura blanca.','Depositado con los materiales de obra.','No coincide: es un elemento arquitectónico pintado, sin remate animal.'],
 ['02','Fragmentos cerámicos','Bordes de recipientes de barro y una base circular.','Caja de materiales 4.','No coincide: son fragmentos de recipientes, no un bastón.'],
 ['03','Fragmento óseo','Mandíbula incompleta de un animal pequeño, sin soporte ni perforaciones de montaje.','Pendiente de estudio.','No coincide: el hueso no forma parte de un bastón y carece de montaje.']]},
 {code:'EXP-98/037',title:'Prospección insular',year:1998,place:'Corisco y los Elobeyes',note:'Expedición Antropológica Hispano-Guineana. Extracto administrativo de los hallazgos; no se adjunta el cuaderno de campo original.',items:[
 ['016','Elemento de madera','Mango corto de herramienta con extremo romo; longitud conservada de 19 cm.','Clasificado sin valor.','No coincide: el mango es corto y no presenta un remate animal.'],
 ['017','Objeto alargado de madera','Bastón con remate óseo en forma de cráneo animal, collar circular bajo el remate y tres grapas metálicas en el tramo superior.','Clasificado sin valor; posteriormente registrado como perdido.','La descripción coincide con el remate, el collar y las tres grapas visibles en la fotografía de la subasta. Son indicios prometedores, pero todavía no bastan para confirmar que se trata del mismo bastón.',true],
 ['018','Piezas perforadas','Cinco cuentas de material claro con orificio central.','Registradas como perdidas.','No coincide: las cuentas están sueltas y no se describen como parte del bastón.']]},
 {code:'EXP-01/008',title:'Estudio de materiales cerámicos',year:2001,place:'Estudio de cerámica',note:'Inventario de materiales recuperados en sondeos y reunidos para su clasificación.',items:[
 ['01','Remate figurativo','Cabeza de animal modelada en barro cocido, separada de un recipiente.','Conservada en depósito.','No coincide: el remate es de cerámica y pertenece a un recipiente.'],
 ['02','Recipiente fragmentado','Vasija con decoración incisa y borde parcialmente conservado.','Restauración pendiente.','No coincide: la forma y el material corresponden a una vasija.'],
 ['03','Varilla de madera','Varilla lisa hallada junto a los fragmentos, sin adornos ni piezas metálicas.','Sin atribución determinada.','No coincide: no tiene cráneo, collar ni grapas.']]},
 {code:'EXP-98/022',title:'Proyecto forestal',year:1998,place:'Monte Alén / ECOFAC',note:'Relación de objetos documentados durante trabajos de campo y apertura de zanjas.',items:[
 ['01','Fragmento de cráneo','Restos de pequeño mamífero sin unión a madera ni elementos de sujeción.','Remitidos para identificación.','No coincide: son restos aislados, sin montaje sobre un bastón.'],
 ['02','Palo tallado','Vara de madera con cabeza de ave tallada en la misma pieza; no incorpora hueso ni metal.','Colección de estudio.','No coincide: la cabeza está tallada en madera y no presenta collar ni grapas.'],
 ['03','Hoja de hierro','Herramienta corroída con espiga de enmangue.','Estabilización pendiente.','No coincide: es una herramienta de hierro.']]},
 {code:'EXP-96/031',title:'Infraestructura bibliotecaria',year:1996,place:'Biblioteca Subterránea de Bata',note:'Materiales recuperados al excavar el nivel inferior del proyecto bibliotecario.',items:[
 ['01','Bastón con pomo','Caña de madera con pomo esférico de metal liso, sin remate figurativo.','Objeto sin atribución.','No coincide: el pomo es una esfera metálica, no un cráneo.'],
 ['02','Herrajes','Tres abrazaderas circulares de hierro de distinto diámetro.','Material de construcción.','No coincide: son herrajes sueltos, sin bastón asociado.'],
 ['03','Conjunto cerámico','Fragmentos de platos y dos asas de recipientes.','Inventario de obra.','No coincide: no hay una pieza alargada de madera.']]},
 {code:'EXP-99/006',title:'Estudio del terreno',year:1999,place:'Caldera de Moca',note:'Objetos registrados durante los sondeos del terreno.',items:[
 ['01','Vara con anillo','Vara de madera lisa con una abrazadera metálica en un extremo; sin remate óseo.','Estado incompleto.','No coincide: tiene una única abrazadera y carece del remate descrito en el anuncio.'],
 ['02','Fragmentos óseos','Restos dispersos sin cráneo completo ni indicios de ensamblaje.','Muestras de estudio.','No coincide: no se documenta un objeto ensamblado.'],
 ['03','Pieza lítica','Fragmento de piedra pulida con borde desgastado.','Pendiente de clasificación.','No coincide: el material y la forma no corresponden al bastón.']]}
 ,{code:'EXP-97/041',title:'Acondicionamiento de depósitos',year:1997,hidden:true,place:'Depósito de materiales · Bata',note:'Expediente oculto en el índice ordinario. Inventario de materiales recuperados al acondicionar el subsuelo del depósito.',items:[
 ['01','Mango con dos remaches','Mango de madera de 22 cm con dos remaches de hierro y extremo plano.','Transferido al depósito.','No coincide: tiene dos remaches, extremo plano y no presenta remate óseo.'],
 ['02','Fragmento óseo perforado','Pieza ósea pequeña con una perforación transversal, sin unión a madera.','Pendiente de identificación.','No coincide: no se documenta un cráneo montado sobre un bastón.'],
 ['03','Cuenco de barro','Recipiente incompleto con marcas de uso.','Conservado en caja 6.','No coincide: es un recipiente cerámico.']]}
 ,{code:'EXP-99/043',title:'Revisión de materiales sin atribución',year:1999,hidden:true,place:'Registro de revisión · Malabo',note:'Expediente oculto en el índice ordinario. Revisión de objetos sin atribución recuperados durante obras anteriores.',items:[
 ['01','Vara con figura animal','Vara con figura de ave tallada en madera y base rectangular; sin hueso ni grapas metálicas.','Origen pendiente de contrastar.','No coincide: la figura es de madera y carece de collar circular y grapas.'],
 ['02','Tres piezas de latón','Tres clavos sueltos con cabeza redonda, sin objeto asociado.','Material de reparación.','No coincide: son clavos independientes; no acreditan relación con el bastón.'],
 ['03','Fragmento de asta','Asta sin soporte de madera ni huellas de montaje.','Colección de estudio.','No coincide: el asta no tiene forma de cráneo ni forma parte de un bastón.']]}

];
let archiveSearch="";
function archiveExplorer(project=null){
 show('Archivo digital');
 const shell=document.createElement('section');shell.className='windows-explorer';content.append(shell);
 const bar=document.createElement('div');bar.className='explorer-title';bar.textContent='▣ Explorador de archivos · Archivo gubernamental';shell.append(bar);
 const menus=document.createElement('nav');menus.className='explorer-menubar';menus.setAttribute('aria-label','Menú del explorador');shell.append(menus);
 const openMenus=[];
 function menu(name){const details=document.createElement('details');details.className='explorer-menu';const summary=document.createElement('summary');summary.textContent=name;const options=document.createElement('div');options.className='explorer-menu-options';details.append(summary,options);menus.append(details);openMenus.push(details);details.addEventListener('toggle',()=>{if(details.open)openMenus.filter(x=>x!==details).forEach(x=>x.open=false)});details.addEventListener('keydown',e=>{if(e.key==='Escape'&&details.open){e.preventDefault();e.stopPropagation();details.open=false;summary.focus();}});return options;}
 const fileMenu=menu('Archivo');button('Abrir raíz de expedientes',()=>{archiveSearch='';archiveExplorer()},fileMenu);button('Cerrar explorador',()=>panel.close(),fileMenu);
 const editMenu=menu('Editar');button('Buscar expediente…',()=>{const term=prompt('Buscar por código, título o año del expediente:',archiveSearch);if(term!==null){archiveSearch=term.trim();archiveExplorer();}},editMenu);button('Limpiar búsqueda',()=>{archiveSearch='';archiveExplorer()},editMenu);
 const viewMenu=menu('Ver');
 const hiddenLabel=document.createElement('label');hiddenLabel.className='hidden-files-toggle';const hiddenCheck=document.createElement('input');hiddenCheck.type='checkbox';hiddenCheck.checked=!!state.showHiddenFiles;hiddenCheck.onchange=()=>{state.showHiddenFiles=hiddenCheck.checked;save();archiveExplorer(project?.hidden&&!state.showHiddenFiles?null:project);};hiddenLabel.append(hiddenCheck,document.createTextNode('Ver archivos ocultos'));viewMenu.append(hiddenLabel);
 const tools=document.createElement('nav');tools.className='explorer-toolbar';shell.append(tools);button('↑ Expedientes',()=>archiveExplorer(),tools).disabled=!project;
 const address=document.createElement('span');address.textContent='Este equipo › Archivo gubernamental'+(project?' › '+project.code:'');tools.append(address);
 const intro=document.createElement('p');intro.className='explorer-intro';intro.textContent='Estos expedientes gubernamentales reúnen obras y proyectos en los que se documentaron hallazgos arqueológicos significativos en diferentes lugares del territorio nacional. Examina cada uno y busca alguna referencia que pueda corresponder al bastón del anuncio, si la hay. Puede que haya archivos ocultos útiles; activa la opción correspondiente.';shell.append(intro);
 const costs=document.createElement('p');costs.className='explorer-intro explorer-costs';costs.textContent='Explorar las carpetas y leer los documentos no supone ningún coste adicional. Sin embargo, cada nueva verificación de un documento consume 2 horas de misión, aciertes o no. El tiempo sigue corriendo mientras investigas.';shell.append(costs);
 const layout=document.createElement('div');layout.className='explorer-layout';shell.append(layout);
 const main=document.createElement('div');main.className='explorer-main';layout.append(main);
 const reference=document.createElement('aside');reference.className='explorer-reference';const heading=document.createElement('h3');heading.textContent='Fotografía del anuncio';const photo=document.createElement('img');photo.src='assets/staff-catalogue.png';photo.alt='Bastón del anuncio, con remate en forma de cráneo y sujeciones metálicas';reference.append(heading,photo);layout.append(reference);
 if(!project){const grid=document.createElement('div');grid.className='folder-grid';main.append(grid);if(archiveSearch){const result=document.createElement('p');result.textContent='Búsqueda: '+archiveSearch+' · Editar → Limpiar búsqueda para ver todos los expedientes.';main.append(result);}archiveProjects.filter(p=>(!p.hidden||state.showHiddenFiles)&&(!archiveSearch||(p.code+' '+p.title+' '+p.year).toLocaleLowerCase().includes(archiveSearch.toLocaleLowerCase()))).forEach(p=>{const b=button('',()=>archiveExplorer(p),grid);const icon=document.createElement('span');icon.className='folder-icon'+(p.hidden?' hidden-folder-icon':'');icon.setAttribute('aria-hidden','true');const label=document.createElement('span');label.textContent=p.code+' · '+p.title+', '+p.year+(p.hidden?' · Oculto':'');b.append(icon,label);});}
 else {const h=document.createElement('h3');h.textContent=project.code+' · '+project.title;main.append(h);const file=button('📄 Inventario de hallazgos.txt',()=>{file.hidden=true;renderInventory(project,main)},main);if(project.code==='EXP-97/041')button('📄 Recuperacion de tiempo perdido.txt',()=>archiveBonus(project),main);if(project.code==='EXP-99/043')button('🖼️ noabrir.jpg',()=>archiveVirus(project),main);}
 const status=document.createElement('footer');status.className='explorer-status';status.textContent=project?(project.hidden?'2 documentos':'1 documento')+' · Selecciona un hallazgo después de leer el inventario':(archiveSearch?'Búsqueda activa':state.showHiddenFiles?'8 carpetas · 2 expedientes ocultos visibles':'6 carpetas visibles · Los archivos ocultos no se muestran');shell.append(status);
 if(state.matched){const p=document.createElement('p');p.className='explorer-success';p.textContent=state.ordered?'✓ Línea de investigación localizada. Puedes examinar la carpeta de la mesa.':'✓ Pista encontrada. Vuelve al despacho y explora la habitación para encontrar la siguiente pista.';shell.append(p);}
}
function archiveBonus(project){
 update();if(expiry)return;const already=!!state.archiveBonusUsed;
 if(!already){state.archiveBonusUsed=true;remaining+=7200000;last=performance.now();collect('bonus-archivo-2','Recuperacion de tiempo perdido.txt','Has ganado dos horas de misión. Bonus aplicado al abrir el archivo, una sola vez.');save();update();}
 show('Recuperacion de tiempo perdido.txt');paragraph(already?'Ya recibiste las dos horas de este archivo.':'¡Has ganado dos horas de misión! Se han añadido automáticamente al tiempo disponible.','feedback');paragraph('Este bonus solo se obtiene una vez.');button('VOLVER AL EXPEDIENTE',()=>archiveExplorer(project));
}
function archiveVirus(project){
 update();if(expiry)return;const already=!!state.archiveVirusUsed;
 if(!already){state.archiveVirusUsed=true;const money=Math.min(500,Math.max(0,leader.budget));const time=Math.min(7200000,remaining);leader.budget=Math.max(0,leader.budget-500);remaining=Math.max(0,remaining-7200000);state.archiveVirusLoss={money,time};last=performance.now();window.mandjiStorage.setItem('mandji-leader-v1',JSON.stringify(leader));collect('virus-archivo-2','Incidente · noabrir.jpg','Virus en el ordenador de la misión. Recuperación del sistema: '+money+' € y '+fmt(time)+' descontados. Incidente aplicado una sola vez.');save();$('#clock').textContent=fmt(remaining);$('#budget').textContent=leader.budget.toLocaleString('es-ES')+' €';}
 show('Alerta de virus · Ordenador de la misión');const img=document.createElement('img');img.src='assets/noabrir.jpg';img.alt='Alerta roja de archivo infectado';img.className='archive-image';content.append(img);
 paragraph(already?'Este archivo ya provocó un incidente. No se aplica otra penalización.':'Has abierto un archivo infectado. Eliminar el virus y recuperar el ordenador cuesta 500 € y dos horas de misión. La penalización se ha aplicado.','feedback');
 if(!already&&(state.archiveVirusLoss.money<500||state.archiveVirusLoss.time<7200000))paragraph('Se han agotado los recursos afectados. El saldo y el tiempo no pueden bajar de cero.');
 button('CERRAR AVISO',()=>{if(remaining===0){update();return;}archiveExplorer(project);});
}
function renderInventory(project,parent){
 const h=document.createElement('h3');h.textContent=project.place+' · '+project.year;parent.append(h);
 const note=document.createElement('p');note.textContent=project.note;parent.append(note);
 project.items.forEach(item=>{const row=document.createElement('article');row.className='inventory-record';const title=document.createElement('h4');title.textContent=item[0]+' · '+item[1];const desc=document.createElement('p');desc.textContent=item[2];const status=document.createElement('p');status.textContent='Anotación: '+item[3];row.append(title,desc,status);const known=state.verifications?.[project.code+'-'+item[0]]||(item[5]&&state.matched);button(known?'VER RESULTADO DE LA VERIFICACIÓN':'INVESTIGAR ESTE HALLAZGO',()=>requestVerification(project,item),row);parent.append(row);});
}
function requestVerification(project,item){
 const id=project.code+'-'+item[0];
 if(state.verifications?.[id]||(item[5]&&state.matched)){verificationResult(project,item);return;}
 show('Confirmar verificación');paragraph(project.code+' · '+item[0]+' · '+item[1],'paper');paragraph(item[2]);paragraph('Solicitar la verificación de este hallazgo consume 2 horas de misión, tanto si coincide como si no. No se descontará dinero.');
 button('CANCELAR Y VOLVER',()=>archiveExplorer(project));
 const confirmButton=button('CONFIRMAR · el proceso de verificación consumirá 2 horas, sea positivo el resultado o no',()=>{
  if(confirmButton.disabled)return;update();if(expiry)return;
  if(remaining<7200000){paragraph('No quedan dos horas disponibles. Cancela para volver a los expedientes.','feedback');return;}
  confirmButton.disabled=true;remaining-=7200000;last=performance.now();state.verifications??={};state.verifications[id]=true;
  collect('verificacion-'+id,'Verificación · '+id,item[1]+'. '+item[4]+' Coste: 2 horas de misión; 0 €.');
  if(item[5]){state.matched=true;collect('ficha-compatible-2','Incidencia de inventario · Corisco y los Elobeyes',item[2]+' '+item[3]+' '+item[4]);docs.forEach(d=>collect('comunicacion-'+d.id+'-2',d.title,d.text));guidance();}
  save();update();if(!expiry){verificationResult(project,item);if(item[5])playDiscoveryMagic();}
 });
}
function verificationResult(project,item){
show(item[5]?'✓ Pista encontrada':'Verificación sin coincidencia');
if(item[5]){
 paragraph('Correcto. Has encontrado la pista que buscábamos.','confirmation-kicker');
 paragraph('Este expediente registra un bastón cuya descripción es compatible con el de la fotografía de la subasta y cuyo paradero no está aclarado. La descripción hace referencia a una expedición de 1998. Es un muy buen hilo del que tirar. Todavía debemos comprobar que se trata del mismo objeto.');
 paragraph(item[4],'paper');
 paragraph('La respuesta del Ministerio confirma que esta ficha figura en el expediente de la expedición de 1998. Junto con la respuesta, nuestro contacto ha enviado documentación complementaria. Hemos dejado una carpeta con las copias sobre la mesa del despacho. La ficha y las comunicaciones también están guardadas en el disco duro, dentro de Misión 2.');
 if(!state.ordered){paragraph('Siguiente paso: vuelve al despacho y explora la habitación para encontrar la siguiente pista. Usa las flechas para recorrer la sala y busca objetos o espacios con los que puedas interactuar.','feedback');button('VOLVER AL DESPACHO',()=>panel.close());}
 else if(!state.checked){paragraph('La cronología ya está reconstruida. Siguiente paso: examina la carpeta de la mesa y comprueba la documentación complementaria enviada por el Ministerio.','feedback');button('VOLVER AL DESPACHO · BUSCAR LA CARPETA',()=>panel.close());}
 else{paragraph('Las tres pistas ya están contrastadas. Siguiente paso: reúne al equipo para valorar lo descubierto.','feedback');button('REUNIR AL EQUIPO',()=>location.href='debriefing.html');}
}else{paragraph(item[4],'paper');paragraph('Revisa los detalles de la fotografía antes de seleccionar otro hallazgo.');}
paragraph('Este resultado queda guardado. Consultarlo de nuevo no consume otras dos horas.');button('VOLVER A LOS EXPEDIENTES',()=>archiveExplorer());
}

function recordsText(){return 'Registro de la Expedición Antropológica Hispano-Guineana para Corisco y los Elobeyes, 1998: bastón de madera con remate zoomorfo. Clasificación final: objeto sin valor. Paradero no aclarado. Coincidencia preliminar con la fotografía actual; identidad sin confirmar.';}
function board(){show('Panel de investigación');if(!state.matched){paragraph('Primero localiza en el ordenador el expediente relacionado con el bastón.');return;}if(!state.ordered){paragraph('La ficha del bastón que encontramos en el archivo digital hacía referencia a la expedición arqueológica conjunta de 1998 a Corisco y los Elobeyes. Al solicitar su verificación, conseguimos que nuestro contacto en el Ministerio nos enviara más documentación sobre esa expedición en concreto. Entre el material recibido están estas comunicaciones y anotaciones administrativas, cuyos extractos hemos reunido en la pizarra.');paragraph('Ordena los fragmentos para reconstruir qué ocurrió durante la expedición relacionada con la ficha del bastón y descubrir por dónde continuar la investigación. Puedes usar las flechas o mantener pulsado el botón «Arrastrar» y soltar el fragmento en la posición deseada.');let order=['d','b','e','a','c'],validate,completionPending=false;const list=document.createElement('div');content.append(list);function render(movedId){list.replaceChildren();order.forEach((id,i)=>{const d=docs.find(x=>x.id===id),row=document.createElement('article');row.className='timeline-item';const correctPosition=id===['a','b','c','d','e'][i];if(correctPosition){row.classList.add('is-correct-position');row.setAttribute('aria-label','Fragmento en su posición correcta');}const stamp=document.createElement('span');stamp.className='timeline-stamp';stamp.textContent=['I','II','III','IV','V'][i];stamp.setAttribute('aria-label','Posición '+(i+1));row.append(stamp);if(correctPosition){const status=document.createElement('span');status.className='position-status';status.textContent='✓';status.setAttribute('aria-label','Posición correcta');row.append(status);}const p=document.createElement('p');p.textContent=d.text;row.append(p);button('↑',()=>{if(i){[order[i-1],order[i]]=[order[i],order[i-1]];render(id);}},row).disabled=i===0;button('↓',()=>{if(i<order.length-1){[order[i+1],order[i]]=[order[i],order[i+1]];render(id);}},row).disabled=i===order.length-1;const drag=button('⠿ Arrastrar',()=>{},row);drag.className='timeline-drag';drag.setAttribute('aria-label','Arrastrar fragmento en posición '+(i+1));row.dataset.fragment=id;
drag.onpointerdown=e=>{
if(e.button!==0||e.isPrimary===false)return;
e.preventDefault();e.stopPropagation();
const dialog=list.closest('dialog'),startY=e.clientY;
let y=startY,frame,ghost=null,next=row.nextElementSibling,finished=false;
const candidates=[...list.children].filter(el=>el!==row);
function locate(){
next=candidates.find(el=>y<el.getBoundingClientRect().top+el.getBoundingClientRect().height/2)||null;
candidates.forEach(el=>el.classList.remove('drop-before','drop-after'));
if(next)next.classList.add('drop-before');else candidates.at(-1)?.classList.add('drop-after');
}
function tick(){
if(!list.isConnected||!dialog.open){finish(true);return;}
if(ghost){
const bounds=dialog.getBoundingClientRect();
if(y<bounds.top+100)dialog.scrollTop-=10;else if(y>bounds.bottom-70)dialog.scrollTop+=10;
ghost.style.top=Math.max(bounds.top+10,Math.min(y-25,bounds.bottom-65))+'px';locate();
}
frame=requestAnimationFrame(tick);
}
function moving(ev){
if(ev.pointerId!==e.pointerId)return;y=ev.clientY;ev.preventDefault();
if(!ghost&&Math.abs(y-startY)>5){
ghost=document.createElement('div');ghost.className='timeline-drag-preview';
ghost.textContent='⠿ Fragmento '+['I','II','III','IV','V'][i]+' · Suelta para colocarlo';
const bounds=dialog.getBoundingClientRect();ghost.style.left=(bounds.left+30)+'px';ghost.style.width=Math.max(160,bounds.width-60)+'px';
dialog.append(ghost);row.classList.add('is-dragging');
}
}
function finish(cancel){
if(finished)return;finished=true;cancelAnimationFrame(frame);
window.removeEventListener('pointermove',moving);window.removeEventListener('pointerup',released);window.removeEventListener('pointercancel',cancelled);window.removeEventListener('blur',cancelled);window.removeEventListener('keydown',escape);
if(ghost&&!cancel){locate();list.insertBefore(row,next);order=[...list.children].map(el=>el.dataset.fragment);}
const moved=!!ghost&&!cancel;ghost?.remove();render(moved?id:null);list.querySelector('[data-fragment="'+id+'"] .timeline-drag')?.focus({preventScroll:true});
}
function released(ev){if(ev.pointerId===e.pointerId){y=ev.clientY;finish(false);}}
function cancelled(){finish(true);}
function escape(ev){if(ev.key==='Escape'){ev.preventDefault();ev.stopPropagation();finish(true);}}
window.addEventListener('pointermove',moving,{passive:false});window.addEventListener('pointerup',released);window.addEventListener('pointercancel',cancelled);window.addEventListener('blur',cancelled);window.addEventListener('keydown',escape);
frame=requestAnimationFrame(tick);
};list.append(row);if(id===movedId)row.classList.add('placement-glow');});
if(movedId&&order.join('')==='abcde'&&!completionPending){completionPending=true;list.querySelectorAll('button').forEach(b=>b.disabled=true);setTimeout(()=>{if(list.isConnected&&panel.open)validate.click();},550);}
}render();validate=button('VALIDAR CRONOLOGÍA',()=>{if(order.join('')!=='abcde'){paragraph('Las fechas y las referencias entre comunicaciones permiten reconstruir el orden.','feedback');return;}state.ordered=true;playDiscoveryMagic();collect('cronologia-2','Cronología de la suspensión',docs.slice().sort((a,b)=>['a','b','c','d','e'].indexOf(a.id)-['a','b','c','d','e'].indexOf(b.id)).map(d=>d.title+'\n'+d.text).join('\n\n'));save();guidance();show('Cronología reconstruida');paragraph(docs.map(d=>d.text).join('\n\n'),'paper unified-timeline');button('CONTINUAR INVESTIGACIÓN',()=>panel.close());paragraph('Hemos reconstruido la interrupción de la expedición, pero quedan preguntas abiertas. ¿Qué ocurrió con los hallazgos a los que el equipo guineano no pudo acceder? ¿Estaba el bastón entre los materiales entregados? El expediente menciona un informe de Daniel cuyo contenido no tenemos. Localizarlo podría aportar otra versión de los hechos.');});return;}if(!state.matched){paragraph('Cronología reconstruida. Pulsa el ordenador para localizar el expediente relacionado con el bastón.');return;}if(!state.checked){paragraph('Cronología reconstruida. Examina la documentación complementaria de la carpeta de la mesa.');return;}paragraph('Las tres pistas están contrastadas. Reúne al equipo en la sala de reuniones para preparar el siguiente paso.');button('REUNIR AL EQUIPO',()=>location.href='debriefing.html');}

function folder(){
 show('Carpeta · Documentación remitida por el Ministerio');
 if(!state.ordered||!state.matched){paragraph('Primero localiza la ficha del bastón y reconstruye la cronología.');return;}
 paragraph('Nuestro contacto del Ministerio ha enviado ahora todo lo que tienen sobre la expedición conjunta de 1998. Entre los documentos figura este oficio firmado por Daniel Ángel Eneme Angue.');
 const letter='AL MINISTRO TUTOR\n\nAsunto: Remisión de informe sobre la expedición arqueológica conjunta para la prospección de Corisco y los Elobeyes\n\nPor medio de la presente remito, para su información, constancia y efectos oportunos, el informe adjunto sobre el desarrollo y la interrupción de la reciente expedición arqueológica conjunta para la prospección de Corisco y los Elobeyes.\n\nEn dicho informe se detallan irregularidades, omisiones graves y prácticas poco éticas observadas durante los trabajos, que considero necesario poner en conocimiento de este Ministerio Tutor.\n\nDocumentación adjunta: informe sobre la expedición.\n\nPor una Guinea Mejor.\n\nDaniel Ángel Eneme Angue';
 const sheet=paragraph(letter,'paper');sheet.style.whiteSpace='pre-line';
 collect('instancia-daniel-2','Instancia de Daniel · Remisión del informe',letter);
 const firstDiscovery=!state.missingReportFound;
 state.missingReportFound=true;state.checked=true;
 collect('informe-ausente-2','El adjunto ausente','El oficio de Daniel anuncia un informe sobre la expedición, pero no aparece entre las copias remitidas por el Ministerio. Desconocemos su contenido y dónde se conserva. El siguiente paso es localizar a Daniel o averiguar dónde quedaron sus papeles.');
 save();guidance();if(firstDiscovery)playDiscoveryMagic();
 folderFinding();
}
function folderFinding(){
 paragraph('El oficio anuncia un informe adjunto sobre las irregularidades de la expedición. Sin embargo, entre las copias enviadas por el Ministerio solo están la ficha del bastón, las comunicaciones administrativas y este oficio: el informe no aparece.');
 paragraph('Esto confirma que Daniel dejó constancia de su remisión, pero todavía desconocemos el contenido del informe y dónde se conserva. Su ausencia en estas copias no demuestra que se haya perdido o que alguien lo haya ocultado.');
 paragraph('Para avanzar, necesitamos localizar a Daniel o averiguar dónde quedaron sus papeles. Su informe podría aportar otra versión de lo ocurrido y ayudarnos a seguir el rastro del bastón.','feedback');
 button('VOLVER AL DESPACHO',()=>panel.close());button('REUNIR AL EQUIPO',()=>location.href='debriefing.html');
}


function report(){show('Informe de situación · Capítulo 2');button('REVISAR LA DOCUMENTACIÓN DEL MINISTERIO',folder);paragraph('La descripción del inventario es compatible con el bastón. La denuncia íntegra de Daniel no figura en el expediente y la entrega carece de cotejo independiente. Reúne al equipo para preparar la búsqueda de su archivo personal.','paper');button('REUNIR AL EQUIPO',()=>location.href='debriefing.html');}

function files(objects=false){show(objects?'Mochila':'Disco duro · Misiones');collection=read('mandji-collection-v1',{clues:[],objects:[]});if(objects){const extras={adrian:[['🎙️ Grabadora','Para conservar testimonios.'],['📒 Agenda de contactos','Para preparar entrevistas.']],luna:[['📷 Cámara','Para documentar detalles.'],['🔬 Kit de análisis visual','Para comparar rasgos de las piezas.']],sebastian:[['🖨️ Escáner portátil','Para digitalizar documentos.'],['📚 Índice de archivos','Para orientar consultas documentales.']]};collection.objects.forEach(i=>button(i.title,()=>{show(i.title);paragraph(i.body);button('VOLVER',()=>files(true))}));(extras[leader?.id]||[]).forEach(([title,body])=>button(title,()=>{show(title);paragraph(body);paragraph('Equipo disponible para las actuaciones correspondientes.');button('VOLVER',()=>files(true))}));return;}const missions=[...new Set(collection.clues.map(i=>i.mission||1))].sort();missions.forEach(m=>button('📁 Misión '+m,()=>{show('Misión '+m+' · Archivos');const grid=document.createElement('div');grid.className='archive-grid';content.append(grid);collection.clues.filter(i=>(i.mission||1)===m).forEach(i=>button('📄 '+i.title,()=>{show(i.title);if(/foto|fotograf/i.test(i.title)){const image=document.createElement('img');image.src='assets/staff-catalogue.png';image.alt=i.title;image.className='archive-image';content.append(image);}paragraph(i.body,'paper').style.whiteSpace='pre-line';button('VOLVER A CARPETAS',()=>files());},grid));button('VOLVER',()=>files());}));}
$('#gather-team').onclick=()=>location.href='debriefing.html';$('#drive').onclick=()=>files();$('#bag').onclick=()=>files(true);
$('#pause').onclick=()=>{if(state.pauses>=2)return;update();paused=true;state.pauses++;save();$('#pause').textContent=`PAUSA · ${2-state.pauses}/2`;show('Misión en pausa');$('#close').hidden=true;button('REANUDAR',()=>{paused=false;last=performance.now();$('#close').hidden=false;panel.close();});};$('#pause').textContent=`PAUSA · ${2-state.pauses}/2`;
const discoveredThisVisit=new Set();
const discoveryDialogue={
computer:'Veamos si el contacto en el Ministerio ya nos ha enviado los expedientes. Pulsa la luz del ordenador para consultarlos.',
board:'El Ministerio ha enviado más documentación sobre la expedición de 1998 a raíz de la verificación de la ficha del bastón. Organicemos sus comunicaciones en esta pizarra para entender qué ocurrió. Pulsa el punto de luz para empezar.',
folder:'Aquí están las copias que el Ministerio ha enviado con la verificación del expediente. Pulsa la luz de la carpeta para examinarlas.'
};
let panPosition=.5,suppressRoomClick=false,panGesture=null;
function imageGeometry(){const room=$('#archive-room'),scale=Math.max(room.clientWidth/1536,room.clientHeight/864),overflow=Math.max(0,1536*scale-room.clientWidth);return {room,scale,overflow,left:-overflow*panPosition,top:(room.clientHeight-864*scale)/2};}
function align(){const {room,scale,left,top,overflow}=imageGeometry();$('.room-art').style.objectPosition=(panPosition*100)+'% 50%';$('#pan-left').hidden=$('#pan-right').hidden=$('#pan-hint').hidden=overflow<2;$('#pan-left').disabled=panPosition<=0;$('#pan-right').disabled=panPosition>=1;[['computer',.22,.60],['folder',.50,.72],['board',.85,.28],['sculpture',.42,.35]].forEach(([id,x,y])=>{const b=$(`[data-place="${id}"]`),screenX=left+x*1536*scale,screenY=top+y*864*scale;b.style.left=screenX+'px';b.style.top=screenY+'px';b.hidden=!placeAvailable(id)||!(discoveredThisVisit.has(id)||placeSolved(id))||screenX<0||screenX>room.clientWidth;});}
function shiftView(direction){const {room,overflow}=imageGeometry();if(overflow){panPosition=Math.max(0,Math.min(1,panPosition+direction*room.clientWidth*.55/overflow));align();}}
$('#pan-left').onclick=()=>shiftView(-1);$('#pan-right').onclick=()=>shiftView(1);
const panorama=$('#archive-room');
panorama.addEventListener('keydown',e=>{if(panel.open||e.target.closest('header,aside')||e.target.matches('input,textarea'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();shiftView(e.key==='ArrowLeft'?-1:1);}});
panorama.addEventListener('pointerdown',e=>{suppressRoomClick=false;if(e.button!==0||e.isPrimary===false||e.target.closest('button,a,header,aside')||panel.open)return;panGesture={id:e.pointerId,x:e.clientX,start:panPosition,moved:false};});
panorama.addEventListener('pointermove',e=>{if(!panGesture||panGesture.id!==e.pointerId)return;const dx=e.clientX-panGesture.x,{overflow}=imageGeometry();if(!overflow)return;if(Math.abs(dx)>6){panGesture.moved=true;suppressRoomClick=true;panorama.setPointerCapture(e.pointerId);panorama.classList.add('is-panning');}if(panGesture.moved){panPosition=Math.max(0,Math.min(1,panGesture.start-dx/overflow));align();}});
function endPan(e){if(!panGesture||panGesture.id!==e.pointerId)return;panGesture=null;panorama.classList.remove('is-panning');if(panorama.hasPointerCapture(e.pointerId))panorama.releasePointerCapture(e.pointerId);}
panorama.addEventListener('pointerup',endPan);panorama.addEventListener('pointercancel',endPan);
new ResizeObserver(align).observe($('#archive-room'));
let discoveryAudio;
async function playDiscoveryMagic(){
try{
const prefs=JSON.parse(window.mandjiStorage.getItem('mandji-effects')||'null');
if(prefs?.enabled===false)return;
const volume=prefs?Math.max(0,Math.min(1,Number(prefs.volume)||0)):.45;
if(!volume)return;
const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
discoveryAudio ||= new Audio();
if(discoveryAudio.state==='suspended')await discoveryAudio.resume();
const ctx=discoveryAudio,start=ctx.currentTime;
[659.25,880,987.77,1318.51,1760].forEach((frequency,i)=>{
const tone=ctx.createOscillator(),gain=ctx.createGain(),at=start+i*.085;
tone.type='sine';tone.frequency.setValueAtTime(frequency,at);
gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume*.13,at+.018);gain.gain.exponentialRampToValueAtTime(.0001,at+.65);
tone.connect(gain);gain.connect(ctx.destination);tone.start(at);tone.stop(at+.7);
tone.onended=()=>{tone.disconnect();gain.disconnect();};
});
}catch{}
}
function sculpture(){
 if(!leader||paused||expiry)return;
 const first=!state.mbomioBonusClaimed;
 if(first){state.mbomioBonusClaimed=true;leader.budget+=2000;window.mandjiStorage.setItem('mandji-leader-v1',JSON.stringify(leader));collect('obra-mbomio-2','Hallazgo extraordinario · Leandro Mbomio','Has encontrado una obra perdida de Leandro Mbomio. Bonificación de juego: 2.000 € añadidos al presupuesto de la misión. Recompensa concedida una sola vez.');save();$('#budget').textContent=leader.budget.toLocaleString('es-ES')+' €';playDiscoveryMagic();}
 show('✦ Hallazgo extraordinario');
 paragraph('¡Vaya! Has encontrado una obra perdida del gran Leandro Mbomio.','confirmation-kicker');
 paragraph(first?'Has ganado 2.000 €, pero no son para ti: son para el presupuesto de la misión. Ya se han añadido al dinero disponible.':'Ya recibiste los 2.000 € de este hallazgo para el presupuesto de la misión. Puedes volver a contemplar la obra, pero la recompensa se concede una sola vez.','paper');
 button('CONTINUAR EXPLORANDO',()=>panel.close());
}
function openPlace(id){if(id==='sculpture'&&state.mbomioBonusClaimed){sculpture();return;}if(!placeAvailable(id)||(!discoveredThisVisit.has(id)&&!placeSolved(id)))return;discoveredThisVisit.add(id);align();({computer,folder,board,sculpture}[id])();}
$('#archive-room').addEventListener('click',e=>{if(suppressRoomClick||e.target.closest('button,a,header,aside'))return;const {room,scale,left,top}=imageGeometry(),rect=room.getBoundingClientRect(),x=(e.clientX-rect.left-left)/(1536*scale),y=(e.clientY-rect.top-top)/(864*scale);if(leader&&x>=.403&&x<=.439&&y>=.292&&y<=.438){discoveredThisVisit.add('sculpture');sculpture();align();return;}const areas={board:[.745,0,1,.54],computer:[.105,.46,.365,.745],folder:[.40,.65,.61,.79]},id=Object.keys(areas).find(id=>{const [x1,y1,x2,y2]=areas[id];return placeAvailable(id)&&x>=x1&&x<=x2&&y>=y1&&y<=y2;});if(id){const firstDiscovery=!discoveredThisVisit.has(id);discoveredThisVisit.add(id);align();$('#guidance').textContent=discoveryDialogue[id];if(firstDiscovery)playDiscoveryMagic();}});
document.querySelectorAll('.spot').forEach(b=>b.onclick=()=>openPlace(b.dataset.place));
panel.addEventListener('close',()=>{guidance();align();});
// Reset the baseline on focus/lifecycle transitions; never charge time spent away.
for(const event of ['blur','focus','pageshow','pagehide'])window.addEventListener(event,()=>{last=performance.now();save();});
document.addEventListener('visibilitychange',()=>{last=performance.now();save()});window.addEventListener('pagehide',save);setInterval(update,1000);guidance();align();
if(!leader){show('Elige primero al líder');paragraph('La segunda misión utiliza el líder y los recursos de tu partida.');button('VOLVER AL CAPÍTULO 1',()=>location.href='jugar.html');}else briefing();
})();
