window.missionEquipment = {
 adrian:[{id:'special-grabadora',title:'Grabadora de entrevistas',icon:'🎙️',body:'Equipo de André. Permite conservar testimonios y comparar versiones durante las entrevistas. Su uso se ofrecerá cuando una conversación permita registrar el testimonio.'},{id:'special-agenda',title:'Agenda de contactos',icon:'📒',body:'Equipo de André. Reúne contactos de campo para solicitar presentaciones y localizar fuentes. No garantiza la colaboración de un testigo.'}],
 luna:[{id:'special-camara',title:'Cámara macro',icon:'📷',body:'Equipo de Lucía. Sirve para documentar reparaciones, marcas y pequeños detalles cuando se pueda examinar una pieza directamente.'},{id:'special-kit-visual',title:'Kit de comparación visual',icon:'🔬',body:'Equipo de Lucía. Permite cotejar fotografías y detalles de superficie durante los análisis de evidencias.'}],
 sebastian:[{id:'special-escaner',title:'Escáner portátil',icon:'🖨️',body:'Equipo de Christian. Permite copiar documentación con autorización para cotejarla posteriormente.'},{id:'special-indice',title:'Guía de archivos',icon:'📚',body:'Equipo de Christian. Organiza referencias y directorios para orientar solicitudes de inventarios y expedientes.'}]
};
(() => {
  const key = 'mandji-collection-v1';
  let collection = {clues:[], objects:[]};
  try {
    const saved = JSON.parse(window.mandjiStorage.getItem(key));
    if (saved && Array.isArray(saved.clues) && Array.isArray(saved.objects)) collection = saved;
  } catch {}
  if (new URLSearchParams(location.search).get('vista') === 'transicion') {
    for (const item of [{id:'kit-linterna',title:'Linterna',body:'Para examinar zonas poco iluminadas.'},{id:'kit-lupa',title:'Lupa',body:'Para observar marcas y detalles pequeños.'},{id:'kit-cuaderno',title:'Cuaderno de campo',body:'Para registrar observaciones.'}]) if (!collection.objects.some(existing=>existing.id===item.id)) collection.objects.push(item);
  }
  const persist = () => { if (new URLSearchParams(location.search).get('vista') === 'transicion') return; try { window.mandjiStorage.setItem(key, JSON.stringify(collection)); } catch {} };
  const labels = {
    'foto-referencia':'Fotografía de referencia examinada',
    'correo-descifrado':'Correo de invitación descifrado',
    'marca-mnd-01':'Reparación antigua: tres grapas en la unión del bastón',
    'perfiles-lideres':'Perfiles de los tres investigadores',
    'expediente-completo':'Expediente inicial revisado',
  };
  window.addEventListener('mandji:collect-clue', ({detail}) => {
    if (!detail?.id) return; const existing=collection.clues.find(item=>item.id===detail.id); if(existing){if(detail.body){existing.body=detail.body;persist();}return;}
    const doc = dossierDocuments.find(doc => `doc-${doc.id}` === detail.id);
    collection.clues.push({id:detail.id, title:detail.title || doc?.title || labels[detail.id] || detail.id, body:detail.body || doc?.body || labels[detail.id] || '', mission:Number(detail.mission)||Number(document.querySelector('[data-scene-number]')?.dataset.sceneNumber)||1});
    persist();
  });
  // Future scenes collect physical items explicitly rather than treating every clue as an object.
  window.addEventListener('mandji:collect-object', ({detail}) => {
    if (!detail?.id || !detail.title || collection.objects.some(item => item.id === detail.id)) return;
    collection.objects.push({id:detail.id,title:detail.title,body:detail.body || '',icon:detail.icon});
    persist();
  });
  const dialog = document.createElement('dialog');
  dialog.className = 'collection-dialog';
  dialog.setAttribute('aria-labelledby','collection-title');
  dialog.innerHTML = '<header><h2 id="collection-title"></h2><button type="button" aria-label="Cerrar">×</button></header><div class="collection-content"></div>';
  document.body.append(dialog);
  dialog.querySelector('button').onclick = () => dialog.close();
  function openCollection(type) {
    for(const id of state.foundClues) window.dispatchEvent(new CustomEvent('mandji:collect-clue',{detail:{id,mission:1}}));
    window.dispatchEvent(new CustomEvent('mandji:collect-clue',{detail:{id:'briefing-1',title:'Briefing inicial · La misión',mission:1,body:'El Gobierno encomienda investigar el origen del bastón, su valor histórico y comercial y las circunstancias en las que salió del país. Punto de partida: una invitación de subasta remitida por un coleccionista colaborador en restituciones. Plazo inicial: siete días. Examinar el expediente, acceder al correo en el ordenador y reconstruir la fotografía del catálogo. La procedencia no está demostrada.'}}));
    dialog.querySelector('h2').textContent = type === 'objects' ? 'Mochila' : 'Disco duro';
    const content = dialog.querySelector('.collection-content');
    content.replaceChildren();
    dialog.classList.toggle('file-explorer',type==='clues');
    let leader='adrian';
    try { leader=JSON.parse(window.mandjiStorage.getItem('mandji-leader-v1'))?.id||leader; } catch {}
    const notes={
      adrian:{title:'Entrevistas · André',body:'Antes de entrevistar a una fuente, separa lo que vio directamente de lo que recuerda o deduce. Contrasta cada afirmación con documentos. No prometas resultados a una fuente.'},
      luna:{title:'Análisis visual · Lucía',body:'Compara la marca, la unión del collar y las reparaciones visibles en las imágenes. Busca otras fotografías con las que contrastar la imagen actual; una semejanza aislada no basta.'},
      sebastian:{title:'Archivo · Christian',body:'Solicita los antecedentes del aviso y coteja fechas, firmas y versiones. Distingue inventario inicial, registro final y documentos de adquisición.'}
    };
    const personal={mission:1,id:'personal-'+leader,...(notes[leader]||notes.adrian)};
    const items=type==='objects'?[...collection.objects.filter(item=>!item.id.startsWith('special-')),...(window.missionEquipment[leader]||[])]:[...collection.clues.filter(item=>item.id!=='isla-identificada' && (item.id!=='doc-mapa'||state.exploredWallIsland)),personal];
    const toolbar=document.createElement('div');toolbar.className='explorer-toolbar';
    const home=document.createElement('button');home.type='button';home.textContent='← Todos los archivos';
    const path=document.createElement('span');path.textContent=type==='objects'?'Mochila / Equipo':'Este equipo / Disco de misión / Archivos';
    toolbar.append(home,path);content.append(toolbar);
    const layout=document.createElement('div');layout.className='explorer-layout';
    const grid=document.createElement('div');grid.className='file-grid';
    const viewer=document.createElement('article');viewer.className='file-viewer';viewer.hidden=true;
    let selectedMission=null;
    home.onclick=()=>{ if(!viewer.hidden){viewer.hidden=true;grid.hidden=false;path.textContent=type==='objects'?'Mochila / Equipo':'Disco duro / Misión '+selectedMission;}else if(type==='clues'){selectedMission=null;showFolders();} };
    const fileButtons=[];
    if(!items.length){grid.textContent='Todavía no has recogido objetos.';}
    items.forEach(item=>{
      const button=document.createElement('button');button.type='button';button.className='file-icon';
      const icon=document.createElement('span');icon.className='file-symbol';icon.setAttribute('aria-hidden','true');
      icon.textContent=item.icon || (item.id.startsWith('personal-')?'📓':type==='objects'?({'kit-linterna':'🔦','kit-lupa':'🔍','kit-cuaderno':'📓'}[item.id] || '📦'):item.id.includes('foto')?'🖼️':item.id.includes('isla')||item.id.includes('croquis')?'🗺️':'📄');
      const name=document.createElement('span');name.textContent=item.title;button.append(icon,name);
      button.onclick=()=>{
        viewer.replaceChildren();const title=document.createElement('h3'),body=document.createElement('p');title.textContent=item.title;
        const doc=dossierDocuments.find(doc=>'doc-'+doc.id===item.id);
        body.textContent=doc?.body||(item.id==='marca-mnd-01'?labels[item.id]:item.body)||labels[item.id];
        viewer.append(title);
        const visual=document.createElement('div');visual.className='archive-visual';
        if(doc) renderDocumentVisual(doc,visual);
        else if(['foto-referencia','marca-mnd-01','isla-identificada'].includes(item.id)) {
          const img=document.createElement('img');img.src=item.id==='isla-identificada'?'./assets/corisco-croquis.svg':'./assets/staff-catalogue.png';img.alt=item.title;visual.append(img);
        }
        viewer.append(visual,body);viewer.hidden=false;grid.hidden=true;path.textContent=(type==='objects'?'Mochila':'Disco duro / Misión '+selectedMission)+' / '+item.title;
        window.playActionSound?.('paper');home.focus();
      };fileButtons.push({button,mission:Number(item.mission)||1});grid.append(button);
    });
    function showFolders(){
      viewer.hidden=true;grid.hidden=false;grid.replaceChildren();path.textContent='Este equipo / Disco de misión';home.disabled=true;
      [...new Set(fileButtons.map(file=>file.mission))].sort((a,b)=>a-b).forEach(mission=>{
        const folder=document.createElement('button');folder.type='button';folder.className='file-icon';
        const icon=document.createElement('span');icon.className='file-symbol';icon.textContent='📁';icon.setAttribute('aria-hidden','true');
        const label=document.createElement('span');label.textContent='Misión '+mission+(mission===1?' · La misión':'');folder.append(icon,label);
        folder.onclick=()=>{selectedMission=mission;home.disabled=false;grid.replaceChildren(...fileButtons.filter(file=>file.mission===mission).map(file=>file.button));path.textContent='Disco duro / '+label.textContent;};grid.append(folder);
      });
    }
    if(type==='clues')showFolders();
    layout.append(grid,viewer);content.append(layout);
    dialog.showModal();
  }
  window.addEventListener('mandji:open-collection', ({detail}) => { if (['objects','clues'].includes(detail?.type)) openCollection(detail.type); });
  const controls = document.createElement('nav');
  controls.className='collection-controls';controls.setAttribute('aria-label','Objetos y pistas');
  controls.innerHTML='<button type="button" data-collection="objects" aria-label="Abrir mochila" title="Mochila"><span aria-hidden="true">🎒</span></button><button type="button" data-collection="clues" aria-label="Abrir folder de pistas" title="Folder de pistas"><span aria-hidden="true">💾</span></button>';
  controls.addEventListener('click',e=>{const b=e.target.closest('[data-collection]');if(b)openCollection(b.dataset.collection);});
  document.querySelector('.mission-topbar').append(controls);
  const scene=document.querySelector('[data-scene-number]');
  function configureScene() {
    const explore=Number(scene.dataset.sceneNumber)>=2;
    controls.hidden=!explore;
    scene.querySelectorAll('[data-context]').forEach(h=>{
      h.classList.toggle('unrevealed-hotspot',explore && h.dataset.revealed!=='true');
      if(explore && h.dataset.revealed!=='true') {h.tabIndex=-1;h.setAttribute('aria-hidden','true');}
      else {h.tabIndex=0;h.removeAttribute('aria-hidden');}
    });
  }
  scene.addEventListener('click',event=>{
    if(Number(scene.dataset.sceneNumber)<2 || event.target.closest('button,a,aside,dialog,.folder-overlay'))return;
    scene.querySelectorAll('.unrevealed-hotspot').forEach(h=>{
      const r=h.getBoundingClientRect();
      if(event.clientX>=r.left-36 && event.clientX<=r.right+36 && event.clientY>=r.top-36 && event.clientY<=r.bottom+36) {
        h.dataset.revealed='true';h.classList.remove('unrevealed-hotspot');h.tabIndex=0;h.removeAttribute('aria-hidden');
      }
    });
  });
  new MutationObserver(configureScene).observe(scene,{attributes:true,attributeFilter:['data-scene-number']});
  configureScene();
})();
