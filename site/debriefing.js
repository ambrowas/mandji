(() => {
const M=Mission,scene=M.read('mandji-scene2-v1',{}),host=document.querySelector('#debrief-content');
const ready=!!(scene.matched&&scene.ordered&&scene.checked);
if(!ready){
document.querySelector('#meeting-intro').textContent='La reunión de cierre estará disponible al completar las tres pistas del capítulo.';
document.querySelector('#meeting-stage').hidden=true;
document.querySelector('.meeting-controls').hidden=true;
M.button('VOLVER AL CAPÍTULO II',()=>location.href='escena2.html',host);return;
}
const trail=M.read('mandji-cultural-trail-v1',{});
if(trail.complete&&new URLSearchParams(location.search).get('hallazgo')==='direccion'){
 document.querySelector('.eyebrow').textContent='CAPÍTULO III · UNA DIRECCIÓN EN COVADONGA';
 document.querySelector('#meeting-intro').textContent='Repasemos lo que ya sabemos antes de decidir el próximo paso.';
 MeetingScene([
 {name:'André Esono Bibang',text:'Vayamos a Covadonga para averiguar quién conserva ahora esos papeles. No sabemos si el informe sigue allí, pero tenemos un lugar concreto donde preguntar.'},
 {name:'Lucía Nvé García',text:'¡Tenemos una dirección! El artículo sobre los comienzos de la revista sitúa las primeras oficinas y el archivo en la vivienda de Daniel en el patio de Mama Buna, en Covadonga, Bata.'},
 {name:'Christian Dougan Makosso',text:'La referencia es de 2008 y Daniel falleció en 2013. La dirección nos da una pista, pero no demuestra que sus documentos sigan en esa vivienda.'}
 ],()=>{ 
 M.button('ORGANIZAR EL DESPLAZAMIENTO',()=>{
 M.show('Viaje a Covadonga, Bata');
 if(M.read('mandji-travel-bata-v1',null)?.paid){M.paragraph('El traslado ya está pagado.');M.button('CONTINUAR LA VISITA',()=>location.href='escena3.html');return;}
 M.paragraph('Visitaremos la antigua vivienda de Daniel para preguntar por sus archivos. Traslado del equipo: 900 € y 4 horas de misión. Solo se descuentan al confirmar.');
 M.button('CONFIRMAR VIAJE · 900 € Y 4 HORAS',()=>{if(M.read('mandji-travel-bata-v1',null)?.paid){location.href='escena3.html';return;}if(!M.spend(900,4)){M.insufficient();return;}window.mandjiStorage.setItem('mandji-travel-bata-v1',JSON.stringify({paid:true,cost:900,hours:4}));M.collect('viaje-bata-3','Viaje a Covadonga, Bata','Traslado del equipo: 900 € y 4 horas de misión.',3);location.href='escena3.html';});
 M.button('VOLVER A LA REUNIÓN',()=>M.dialog.close());
 },host);
 });return;
}
const destinationKnown=trail.complete===true&&trail.source==='07';
const summary='La ficha describe un bastón compatible con el de la subasta, pero aún no demuestra que sea el mismo objeto. La cronología registra que Daniel presentó un informe al Ministerio. Su instancia anuncia un informe adjunto, pero ese documento no aparece en las copias recibidas. No sabemos dónde se conserva ni qué dice. El registro de entrega menciona cajas de hallazgos y documentos, sin una relación detallada de su contenido. No permite confirmar si el bastón estaba entre los materiales recibidos.'+(destinationKnown?' En el número 07 de Memoria del Litoral (2008) hemos localizado una referencia a su archivo personal en Covadonga, Bata, y la hemos registrado en el disco duro. Falta comprobar si sigue allí.':' Aún no hemos determinado dónde buscar su archivo personal. El siguiente objetivo será localizar a Daniel o averiguar dónde quedaron sus papeles, sin dar por hecho que conserve una copia.');
document.querySelector('#meeting-intro').textContent='Pongamos en común los hallazgos para decidir cómo continuar. Pulsa la luz de Lucía para comenzar; después hablarán Christian y André.';
MeetingScene([
{name:'André Esono Bibang',text:'Hemos descubierto que falta el informe anunciado en el oficio de Daniel Ángel. Debemos intentar localizar a Daniel o averiguar dónde quedaron sus papeles. Ese será nuestro siguiente paso. No sabemos si conserva una copia del informe.'+(destinationKnown?' La referencia que encontramos en el boletín sitúa su archivo en Covadonga, Bata, pero todavía debemos comprobar si sigue allí.':'')},
{name:'Lucía Nvé García',text:'Hemos encontrado una ficha compatible con el bastón de la subasta. La descripción coincide con el remate, el collar y las tres grapas que vemos en la fotografía, pero aún falta confirmar que sea el mismo bastón.'},
{name:'Christian Dougan Makosso',text:'También hemos reconstruido los acontecimientos de la expedición de 1998. El registro de entrega no detalla los objetos recibidos, así que no permite saber si el bastón estaba entre ellos. Además, el informe adjunto que anuncia el oficio de Daniel Ángel no aparece entre los documentos enviados por el Ministerio.'}
]);
M.collect('informe-2','Informe de cierre · La expedición interrumpida',summary,2);

M.button('VOLVER AL DESPACHO',()=>location.href='escena2.html',host);
scene.complete=true;window.mandjiStorage.setItem('mandji-scene2-v1',JSON.stringify(scene));
M.paragraph('Siguiente objetivo: localizar a Daniel Ángel o averiguar dónde quedaron sus papeles. Nuestro contacto del Ministerio está comprobando qué ocurrió con él después de la expedición.','paper',host);
M.button('CAPÍTULO III · TRAS LOS PASOS DE DANIEL',()=>location.href='ordenador3.html',host);
})();
