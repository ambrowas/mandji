(() => {
const patioClue='La redacción estaba en el patio de Mama Buna: al este de la ceiba y frente a la fuente. La entrada quedaba al sur de la escuela.';
const officeClue='En el lado norte del patio, la antigua oficina tenía una puerta azul y dos ventanas hacia el corredor. Una pequeña placa decía «Memoria del Litoral».';
const patios=[
{id:'A',label:'Patio A',x:170,y:110,detail:'Patio al oeste de la ceiba y al norte del mercado.',correct:false},
{id:'B',label:'Patio B',x:680,y:100,detail:'Patio al este de la ceiba, pero al norte de la escuela y lejos de la fuente.',correct:false},
{id:'C',label:'Patio C',x:650,y:390,detail:'Patio al este de la ceiba, frente a la fuente y al sur de la escuela. Una entrada conserva el nombre Mama Buna.',correct:true},
{id:'D',label:'Patio D',x:160,y:400,detail:'Patio al oeste de la ceiba, junto al mercado.',correct:false}
];
const offices=[
{id:'1',label:'Edificio 1',x:100,y:90,detail:'Lado norte. Puerta verde y una sola ventana. Parece una vivienda.',correct:false},
{id:'2',label:'Edificio 2',x:400,y:90,detail:'Lado norte. Puerta azul, dos ventanas al corredor y una placa descolorida: «Memoria del Litoral».',correct:true},
{id:'3',label:'Edificio 3',x:700,y:90,detail:'Lado norte. Puerta azul, sin ventanas al corredor. El rótulo corresponde a un almacén.',correct:false},
{id:'4',label:'Edificio 4',x:110,y:410,detail:'Lado sur. Dos ventanas y puerta azul, pero sin placa de la revista.',correct:false},
{id:'5',label:'Edificio 5',x:600,y:410,detail:'Lado sur. Acceso de servicio y persiana cerrada.',correct:false}
];
function isLocated(s){return s?.edition===3&&s.stage===3&&s.patio==='C'&&s.office==='2'&&s.proofs?.includes('rasgos')&&s.proofs?.includes('placa');}
function migrate(old={}){if(old.edition===3)return {...old,visited:Array.isArray(old.visited)?old.visited:[],inspected:Array.isArray(old.inspected)?old.inspected:[],proofs:Array.isArray(old.proofs)?old.proofs:[]};return {edition:3,stage:Number(old.stage)>0?1:0,visited:Array.isArray(old.visited)?old.visited:[],inspected:[],patio:null,office:null,proofs:[],mistakes:0};}
window.BataLocation={patioClue,officeClue,patios,offices,isLocated,migrate};
})();