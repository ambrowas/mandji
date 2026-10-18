const intro = document.querySelector("#chapter-intro");
const room = document.querySelector("#chapter-room");
const skipIntro = document.querySelector("[data-skip-intro]");
const lines = Array.from(document.querySelectorAll("[data-text]"));
const contextMenu = document.querySelector("#context-menu");
const contextKicker = document.querySelector("#context-kicker");
const contextTitle = document.querySelector("#context-title");
const contextBody = document.querySelector("#context-body");
const contextActions = document.querySelector("#context-actions");
const closeContext = document.querySelector("[data-context-close]");
const directorCaption = document.querySelector("#director-caption");
const roomImage = document.querySelector(".chapter-room-image");
const dossierHotspot = document.querySelector("[data-context='dossier']");
const characterHotspots = Array.from(
  document.querySelectorAll("[data-context='adrian'], [data-context='luna'], [data-context='sebastian']")
);
const mapHotspot = document.querySelector("[data-context='isla-mapa']");
const photoHotspot = document.querySelector("[data-context='foto-sala']");
const folderOverlay = document.querySelector("#folder-overlay");
const folderPages = document.querySelector("#folder-pages");
const folderClose = document.querySelector("[data-folder-close]");
const documentKicker = document.querySelector("#document-kicker");
const documentTitle = document.querySelector("#document-title");
const documentVisual = document.querySelector("#document-visual");
const documentBody = document.querySelector("#document-body");
const audioToggle = document.querySelector("[data-audio-toggle]");
const volumeControl = document.querySelector("[data-volume-control]");
const narrationToggle = document.querySelector("[data-narration-toggle]");
const leaderButton = document.querySelector("[data-leader-button]");
const mapZoomOverlay = document.querySelector("#map-zoom-overlay");
const clueCounter = document.querySelector("[data-clue-counter]");
const cluesFoundLabel = document.querySelector("[data-clues-found]");
const cluesTotalLabel = document.querySelector("[data-clues-total]");
let audioContext = null;
let introFinished = false;
let welcomePlayed = false;
let typingRun = 0;
let dialoguePaused = false;
let masterVolume = 0.8;
let narrationEnabled = true;
let expedienteClosedAfterRead = false;
let activeBiography = null;
const closedBiographies = new Set();
let dragState = null;
const SCENE_CLUE_TOTAL = 10;

const state = {
  readDocuments: new Set(),
  readBios: new Set(),
  foundClues: new Set(),
  usedDossier: false,
  exploredPhoto: false,
  exploredWallIsland: false,
  shownCharactersCue: false,
};

const welcomeText =
  "Bienvenidos. El Gobierno de Guinea Ecuatorial nos ha confiado una misión de máxima importancia y carácter secreto: recuperar una pieza de incalculable valor histórico. Revisad el expediente. Deberéis explorar cada escenario, examinar los objetos, superar retos y encontrar pistas para avanzar. Después, elegid quién de vosotros liderará la misión. Actuad con discreción y no deis nada por hecho.";

const contextData = {
  adrian: {
    kicker: "Personaje",
    title: "André Esono Bibang",
    birthplace: "Nssangayong Esangui",
    birthdate: "25 de marzo de 1980 (40)",
    bloodGroup: "O+",
    missionBudget: "20.000 €",
    missionMinutes: 72,
    preparationHours: 0,
    missionAdvantage: "Contactos locales y entrevistas: reduce gastos sobre el terreno.",
    body:
      "Investigador de campo ecuatoguineano, formado entre Malabo y Bata. Especialista en entrevistas, memoria oral y verificación de testimonios. Reservado y paciente, escucha antes de sacar conclusiones y cumple la palabra dada. Su fortaleza para esta misión es establecer relaciones de confianza con los testigos y contrastar relatos para reconstruir la procedencia de la pieza. Sus contactos pueden facilitar presentaciones, pero cada testigo tendrá sus propias condiciones. Necesita el apoyo del equipo para vincular los testimonios con fotografías, fechas y registros: una declaración por sí sola no prueba el origen del objeto.",
    actions: ["Elegir a André"],
  },
  luna: {
    kicker: "Personaje",
    title: "Lucía Nvé García",
    birthplace: "Madrid",
    birthdate: "19 de marzo de 1995 (25)",
    bloodGroup: "A−",
    missionBudget: "30.000 €",
    missionMinutes: 66,
    preparationHours: 6,
    missionAdvantage: "Comparación visual y búsqueda digital: evita algunas consultas externas.",
    body:
      "Investigadora hispano-guineana de archivo visual y cultura material. Crecio entre Malabo y Madrid y conserva un cuaderno familiar con un dibujo parecido a la pieza perdida. Intuitiva, rapida y poco conformista. Como lider detecta detalles que otros pasan por alto: fotografias, marcas, silencios en una ficha, gestos de un testigo. Su riesgo es que algunos intenten rebajar sus pistas a intuiciones personales.",
    actions: ["Elegir a Lucía"],
  },
  sebastian: {
    kicker: "Personaje",
    title: "Christian Dougan Makosso",
    birthplace: "Malabo",
    birthdate: "13 de octubre de 1963 (56)",
    bloodGroup: "B+",
    missionBudget: "45.000 €",
    missionMinutes: 60,
    preparationHours: 12,
    missionAdvantage: "Acceso a archivos y especialistas: más recursos para gestiones urgentes.",
    body:
      "Historiador guineano y especialista en archivos coloniales, con experiencia en catalogos, fondos misioneros y colecciones privadas europeas. Sereno, metodico y politicamente prudente. Como lider sabe convertir una sospecha en expediente: fechas, firmas, rutas de salida, donantes y contradicciones administrativas. Su riesgo es que puede tardar demasiado buscando el documento perfecto mientras la subasta se acerca.",
    actions: ["Elegir a Christian"],
  },
  dossier: {
    kicker: "Objeto interactivo",
    title: "Dossier MND-01",
    body:
      "Haz clic en diferentes objetos del escenario para comprobar si esconden alguna pista. Si desvelan un punto de luz, haz clic y podrás interactuar con el objeto. La información y los objetos que vayas recopilando estarán disponibles siempre en tu mochila.",
    actions: ["ABRIR FOLDER"],
  },
  mapa: {
    kicker: "Elemento de entorno",
    title: "Mapa de Mandji",
    body:
      "El mapa de pared muestra varias islas frente al estuario del Muni. Uno de los croquis del expediente coincide con una de sus formas. Si identificas la isla correcta, podras abrir una pista nueva.",
    actions: ["Observar mapa"],
  },
  "foto-sala": {
    kicker: "Pista visual",
    title: "Fotografia de referencia",
    body:
      "Imagen del anuncio de subasta remitida con el aviso. Reconstrúyela como ejercicio de observación del equipo y examina sus detalles.",
    actions: ["Ver de cerca"],
  },
  "isla-mapa": {
    kicker: "Pista del mapa",
    title: "Isla identificada",
    body:
      "La silueta coincide con el croquis del expediente. El punto senalado no prueba que la pieza saliera de alli, pero convierte la sospecha del Gobierno en una primera ruta verificable: Mandji.",
    actions: ["CERRAR"],
  },
};

const dossierDocuments = [
  {
    id: "orden",
    kicker: "Documento 01",
    title: "Orden reservada",
    image: "./assets/chapter-1-meeting.png",
    body:
      "El Gobierno encarga investigar un bastón de posible gran importancia histórica tras recibir el aviso de un coleccionista africano que colabora en restituciones. La procedencia no está comprobada. La subasta será dentro de una semana.",
  },
  {
    id: "foto",
    kicker: "Documento 02",
    title: "Fotografía actual del catálogo",
    image: "./assets/staff-catalogue.png",
    body:
      "Fotografía actual del catálogo adjunto al correo reenviado por el coleccionista. Los fragmentos deben reconstruirse y examinarse. No es una fotografía de 1998.",
  },
  {
    id: "croquis",
    kicker: "Documento 03",
    title: "Comunicación cifrada",
    image: "./assets/chapter-1-meeting.png",
    body:
      "Nuestro hacker ha descifrado el correo reenviado al Gobierno y ha protegido su acceso con una contraseña. Busca el ordenador sobre la mesa e introduce la fecha indicada en la pista para consultar la invitación y sus condiciones.",
  },
  {
    id: "inventario",
    kicker: "Documento 04",
    title: "Ficha de inventario",
    image: "./assets/chapter-1-meeting.png",
    body:
      "La ficha europea evita mencionar Mandji. Solo aparece una entrada generica: 'bastón con remate zoomorfo, Golfo de Guinea'. La fecha de ingreso esta incompleta y el campo de donante fue borrado en una copia posterior. Esta omision es importante: puede ser una negligencia archivistica, una forma de invisibilizar el origen o una pista de que alguien quiso separar la pieza de su comunidad de procedencia.",
  },
  {
    id: "mapa",
    kicker: "Documento 05",
    title: "Aviso de subasta",
    body:
      "El aviso sitúa la pieza dentro de una colección heredada ofrecida como conjunto indivisible en una subasta privada dentro de siete días. La descripción es genérica y no acredita su origen. Antes de que cambie de manos, el equipo debe contrastar la fotografía con la ficha de inventario e identificar al custodio actual. La referencia del expediente MND-01 identifica esta investigación; no debe confundirse con un número de lote.",
  },
];

function revealRoom() {
  startMissionTimer();
  intro.classList.add("is-hidden");
  room.classList.remove("is-hidden");
  updateHotspotVisibility();
  updateDirectorCaption(welcomeText);
  speakDirectorWelcome();
}

function updateDirectorCaption(text) {
  directorCaption.innerHTML = `
    <div class="director-heading"><p class="eyebrow">INICIATIVAS ELEBI</p><button type="button" data-caption-toggle aria-controls="director-line" aria-expanded="${!directorCaption.classList.contains('is-minimized')}">${directorCaption.classList.contains('is-minimized') ? 'ABRIR DIÁLOGO ＋' : 'MINIMIZAR −'}</button></div>
    <p id="director-line"></p>
  `;
  typeText(document.querySelector("#director-line"), `"${text}"`, 18);
}

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playTypeSound() {
  if (!audioContext || audioContext.state !== "running") return;

  const now = audioContext.currentTime;
  const duration = 0.045;
  const bufferSize = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    const decay = 1 - i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * decay * decay;
  }

  const noise = audioContext.createBufferSource();
  const noiseFilter = audioContext.createBiquadFilter();
  const noiseGain = audioContext.createGain();
  const thump = audioContext.createOscillator();
  const thumpGain = audioContext.createGain();

  noise.buffer = buffer;
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(1850 + Math.random() * 320, now);
  noiseFilter.Q.setValueAtTime(2.8, now);
  noiseGain.gain.setValueAtTime(0.13 * masterVolume, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  thump.type = "triangle";
  thump.frequency.setValueAtTime(115 + Math.random() * 28, now);
  thumpGain.gain.setValueAtTime(0.055 * masterVolume, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);
  thump.connect(thumpGain);
  thumpGain.connect(audioContext.destination);

  noise.start(now);
  noise.stop(now + duration);
  thump.start(now);
  thump.stop(now + 0.04);
}

function playCarriageDing() {
  if (!audioContext || audioContext.state !== "running") return;

  const now = audioContext.currentTime;
  const bell = audioContext.createOscillator();
  const gain = audioContext.createGain();

  bell.type = "sine";
  bell.frequency.setValueAtTime(1180, now);
  bell.frequency.exponentialRampToValueAtTime(890, now + 0.18);
  gain.gain.setValueAtTime(0.05 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

  bell.connect(gain);
  gain.connect(audioContext.destination);
  bell.start(now);
  bell.stop(now + 0.44);
}

function speakDirectorWelcome() {
  if (welcomePlayed || !narrationEnabled || !("speechSynthesis" in window)) return;

  welcomePlayed = true;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(welcomeText);
  const voices = window.speechSynthesis.getVoices();
  const spanishVoice = chooseDirectorVoice(voices);

  if (spanishVoice) {
    utterance.voice = spanishVoice;
  }

  utterance.lang = spanishVoice?.lang || "es-ES";
  utterance.rate = 0.92;
  utterance.pitch = 0.82;
  utterance.volume = masterVolume;
  window.speechSynthesis.speak(utterance);
}

function chooseDirectorVoice(voices) {
  const spanishVoices = voices.filter((voice) =>
    voice.lang?.toLowerCase().startsWith("es")
  );
  const preferredNames = ["jorge", "diego", "pablo", "carlos", "miguel", "male", "hombre"];

  return (
    spanishVoices.find((voice) =>
      preferredNames.some((name) => voice.name.toLowerCase().includes(name))
    ) ||
    spanishVoices.find((voice) => voice.lang?.toLowerCase().includes("es-es")) ||
    spanishVoices[0] ||
    voices[0]
  );
}

function waitForDialogueResume() {
  if (!dialoguePaused) return Promise.resolve();

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!dialoguePaused) {
        clearInterval(interval);
        resolve();
      }
    }, 80);
  });
}

async function typeLine(element, text) {
  for (let i = 0; i <= text.length; i += 1) {
    await waitForDialogueResume();
    element.textContent = text.slice(0, i);
    if (i > 0 && text[i - 1] !== " ") {
      playTypeSound();
    }
    await new Promise((resolve) => setTimeout(resolve, 38));
  }
  element.classList.add("is-complete");
  playCarriageDing();
  await new Promise((resolve) => setTimeout(resolve, 360));
}

async function typeText(element, text, speed = 20) {
  typingRun += 1;
  const runId = typingRun;
  element.textContent = "";

  for (let i = 0; i <= text.length; i += 1) {
    if (runId !== typingRun) return;
    await waitForDialogueResume();
    element.textContent = text.slice(0, i);
    if (i > 0 && text[i - 1] !== " " && i % 2 === 0) {
      playTypeSound();
    }
    await new Promise((resolve) => setTimeout(resolve, speed));
  }
}

function availableDocuments() { return dossierDocuments.filter(doc => doc.id !== 'mapa' || state.exploredWallIsland); }

function openFolder() {
  window.playActionSound?.("folder");
  state.usedDossier = true;
  updateHotspotVisibility();
  contextMenu.classList.add("is-hidden");
  folderOverlay.classList.remove("is-hidden");
  folderOverlay.classList.remove("is-open");
  requestAnimationFrame(() => folderOverlay.classList.add("is-open"));

  folderPages.innerHTML = availableDocuments()
    .map(
      (doc, index) => `
        <button class="document-page" type="button" data-doc="${doc.id}" style="--doc-index:${index}">
          
          <span>${doc.kicker}</span>
          <strong>${doc.title}</strong>
        </button>
      `
    )
    .join("");

  openDocument(dossierDocuments[0].id);
}

function openDocument(id) {
  window.playActionSound?.("paper");
  const doc = availableDocuments().find((item) => item.id === id);
  if (!doc) return;

  activeDocumentIndex = availableDocuments().indexOf(doc);
  document.querySelector("#document-position").textContent = `${activeDocumentIndex + 1} / ${availableDocuments().length}`;
  document.querySelector("[data-doc-prev]").disabled = activeDocumentIndex === 0;
  document.querySelector("[data-doc-next]").disabled = activeDocumentIndex === availableDocuments().length - 1;
  state.readDocuments.add(id);
  completeClue(`doc-${id}`);
  documentKicker.textContent = doc.kicker;
  documentTitle.textContent = doc.title;
  renderDocumentVisual(doc);
  documentBody.textContent = doc.id === "orden" ? (state.exploredWallIsland ? "Anexos: fotografía del anuncio, comunicación confidencial, ficha de inventario y aviso de subasta." : "Anexos: fotografía del anuncio, comunicación confidencial y ficha de inventario. El aviso de subasta estará disponible tras abrir el correo.") : getDocumentBody(doc);
  updateLeaderButton();

  document.querySelectorAll(".document-page").forEach((button) => {
    button.classList.toggle("active", button.dataset.doc === id);
    button.classList.toggle("is-read", state.readDocuments.has(button.dataset.doc));
  });
}

function getDocumentBody(doc) { return doc.body; }

function renderDocumentVisual(doc, target = documentVisual) {
  if (doc.id === "mapa") {
    target.innerHTML = `<article class="mission-order auction-notice">
      <header><p>AVISO DE SUBASTA PRIVADA</p><strong>Circulación restringida</strong><p>Copia parcial incorporada al expediente MND-01</p></header>
      <p class="order-stamp">TRAMITACIÓN URGENTE</p>
      <h3>Venta de colección privada heredada</h3>
      <p>Se anuncia la oferta indivisible de una colección privada heredada. Entre sus objetos figura una pieza descrita como «bastón con remate zoomorfo, Golfo de Guinea». La sesión es privada y de acceso restringido.</p>
      <dl class="inventory-fields">
        <dt>Modalidad</dt><dd>Subasta privada · colección indivisible</dd>
        <dt>Identificación del lote</dt><dd>No consta en el extracto recibido</dd>
        <dt>Procedencia declarada</dt><dd>Golfo de Guinea. Sin documentación de origen adjunta.</dd>
        <dt>Precio base de toda la colección:</dt><dd>27.000.000 USD. No corresponde al precio individual de la pieza.</dd>
        <dt>Organizador y ubicación</dt><dd>No constan en la copia disponible</dd>
        <dt>Contacto del vendedor</dt><dd>No incluido en el extracto</dd>
      </dl>
      <footer><b>Nota de la Oficina de Misiones Especiales</b>
      <p>Según la alerta recibida, la sesión podría celebrarse dentro de siete días. El plazo y la identidad de la pieza están pendientes de confirmación.</p>
      <p>Prioridad: contrastar la fotografía y la ficha de inventario, identificar al custodio actual y verificar la convocatoria antes de que una transmisión dificulte el seguimiento del objeto.</p>
      <p>Este aviso no acredita la procedencia de la pieza ni autoriza a participar en la puja.</p></footer>
    </article>`;
    return;
  }

  if (doc.id === "inventario") {
    target.innerHTML = `<article class="mission-order inventory-record">
      <header><p>REGISTRO DE COLECCIÓN</p><strong>Ficha de inventario</strong><p>Copia parcial incorporada al expediente MND-01</p></header>
      <dl class="inventory-fields">
        <dt>Denominación</dt><dd>Bastón con remate zoomorfo</dd>
        <dt>Atribución y materiales</dt><dd>Pendientes de verificación independiente</dd>
        <dt>Procedencia consignada</dt><dd>Golfo de Guinea</dd>
        <dt>Comunidad de origen</dt><dd>No consta</dd>
        <dt>Fecha de ingreso</dt><dd>Incompleta en la copia disponible</dd>
        <dt>Donante / depositante</dt><dd><span class="redacted-field" aria-label="Campo borrado en una copia posterior">████████████</span></dd>
        <dt>Número de inventario</dt><dd>No legible en la copia disponible</dd>
        <dt>Localización actual</dt><dd>No consta</dd>
      </dl>
      <footer><b>Nota de examen de la copia</b><p>La ficha no menciona Mandji ni Corisco. El campo de donante presenta un borrado en una copia posterior. Debe localizarse el registro original para reconstruir la procedencia.</p></footer>
    </article>`;
    return;
  }

  if (doc.id === "orden") {
    target.innerHTML = `<article class="mission-order">
      <header><p>REPÚBLICA DE GUINEA ECUATORIAL</p><strong>Gobierno de Guinea Ecuatorial</strong><p>Oficina de Misiones Especiales</p></header>
      <p class="order-stamp">RESERVADO · MND-01</p><h3>Orden de misión</h3>
      <p>Malabo, 25 de junio de 2020</p><p><b>Destinatario:</b> Equipo de investigación de Iniciativas Elebi</p>
      <h4>1. Objeto de la comisión</h4><p>Por disposición de esta Oficina, se encomienda al equipo destinatario localizar, documentar y preparar la recuperación de un bastón de posible interés histórico para el patrimonio de Guinea Ecuatorial. Deberán esclarecer el origen del bastón, su valor histórico y comercial y las circunstancias en las que salió del país.</p>
      <h4>2. Antecedentes reservados</h4><p>Un coleccionista africano que colabora en la restitución de patrimonio ha reenviado al Gobierno un correo electrónico que recibió con una invitación en la que se anuncia una sospechosa subasta de arte africano. Se ha considerado oportuno investigar la posible importancia histórica del bastón. Su procedencia aún no está comprobada.</p>
      <h4>3. Instrucciones</h4><p>Identifiquen la pieza y a sus actuales custodios; reconstruyan su itinerario y reúnan pruebas documentales, visuales y testimoniales. Preserven la integridad de las evidencias y la confidencialidad de las fuentes. No asuman compromisos de compra ni ejecuten actuaciones de recuperación sin autorización expresa.</p>
      <h4>4. Prioridad y comunicaciones</h4><p>Existe aviso de una posible subasta privada dentro de siete días. Remitan un primer informe de situación antes de dicho plazo. Toda comunicación operativa se dirigirá a la Oficina de Misiones Especiales.</p>
      <footer>Departamento de Misiones Especiales<br><b>Coordinación de Operaciones</b><br>Clasificación: INFORMACIÓN SENSIBLE Y SECRETA</footer>
    </article>`;
    return;
  }
  if (doc.id === "foto") {
    const clearClass = state.exploredPhoto ? " is-clear" : "";
    target.innerHTML = `<img class="blurred-document${clearClass}" src="${doc.image}" alt="${doc.title}" />`;
    return;
  }

  if (doc.id === "croquis") {
    const clearClass = state.exploredWallIsland ? " is-clear" : "";
    target.innerHTML = '<article class="mission-order"><h3>Comunicación confidencial</h3><p><b>Estado: correo descifrado · acceso protegido</b></p><p>Nuestro hacker ha conseguido desencriptar el contenido del email sobre la subasta que nos ha llegado. Para acceder a él, usa la contraseña que se describe abajo.</p><p><b>Pista:</b> la fecha de la víspera de la independencia de nuestro país.</p><p>Formato: DDMMAAAA, ocho dígitos sin espacios ni barras.</p></article>';
    return;
  }

  target.innerHTML = `<img src="${doc.image}" alt="${doc.title}" />`;
}

function hasReadFullExpediente() {
  return availableDocuments().every((doc) => state.readDocuments.has(doc.id));
}

function canChooseLeader() {
  return !missionLeader && hasReadAllBios() && closedBiographies.size === 3;
}

function hasReadAllBios() {
  return ["adrian", "luna", "sebastian"].every((id) => state.readBios.has(id));
}

function updateLeaderButton() {
  if (!leaderButton) return;

  const shouldShow = canChooseLeader() && activeBiography === null;
  leaderButton.innerHTML='<span class="leader-ready-label">✓ TRES BIOGRAFÍAS CONSULTADAS</span><strong>ELEGIR LÍDER →</strong><span>Compara presupuesto, preparación y equipo</span>';
  leaderButton.classList.toggle("is-hidden", !shouldShow);
  leaderButton.disabled = !canChooseLeader();
  leaderButton.classList.toggle("is-enabled", shouldShow && canChooseLeader());
}

function updateClueCounter() {
  if (!cluesFoundLabel || !cluesTotalLabel) return;

  cluesFoundLabel.textContent = state.foundClues.size;
  cluesTotalLabel.textContent = SCENE_CLUE_TOTAL;
}

function completeClue(id) {
  if (state.foundClues.has(id)) return;

  state.foundClues.add(id);
  window.dispatchEvent(new CustomEvent("mandji:collect-clue", {detail:{id}}));
  updateClueCounter();

  if (clueCounter) {
    clueCounter.classList.remove("just-updated");
    requestAnimationFrame(() => clueCounter.classList.add("just-updated"));
  }
}

function updateHotspotVisibility() {
  const showClueHotspots = state.usedDossier;
  const showCharacters = state.exploredPhoto && state.exploredWallIsland;

  mapHotspot?.classList.toggle("is-hidden", !showClueHotspots);
  photoHotspot?.classList.toggle("is-hidden", !showClueHotspots || !state.exploredWallIsland);
  characterHotspots.forEach((hotspot) => {
    hotspot.classList.toggle("is-hidden", !showCharacters);
  });

  if (state.exploredPhoto && state.exploredWallIsland && !state.shownCharactersCue) {
    state.shownCharactersCue = true;
    updateDirectorCaption(
      "Habéis descifrado la invitación y encontrado una reparación singular en la fotografía actual del bastón. Es hora de elegir al líder de la misión."
    );
  }
}

function playMapZoom() {
  if (!mapZoomOverlay) return;

  mapZoomOverlay.classList.remove("is-hidden");
  mapZoomOverlay.classList.remove("is-playing");
  requestAnimationFrame(() => {
    mapZoomOverlay.classList.add("is-playing");
    document.querySelector("[data-map-close]").focus();
  });


}

function updateSceneDepth(event) {
  if (!room || room.classList.contains("is-hidden")) return;

  const rect = room.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  room.style.setProperty("--scene-x", `${x * -14}px`);
  room.style.setProperty("--scene-y", `${y * -10}px`);
  room.style.setProperty("--scene-tilt-x", `${y * 1.2}deg`);
  room.style.setProperty("--scene-tilt-y", `${x * -1.4}deg`);
}

function makeElementDraggable(element, event) {
  if (!element || event.button !== 0) return;
  if (event.target.closest("input, .context-close, .context-actions button, .photo-clue")) return;

  const parent = element.offsetParent || document.body;
  const elementRect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  if (!element.dataset.dragReady) {
    element.dataset.dragReady = "true";
    element.style.left = `${elementRect.left - parentRect.left}px`;
    element.style.top = `${elementRect.top - parentRect.top}px`;
    element.style.right = "auto";
    element.style.bottom = "auto";
    element.style.width = `${elementRect.width}px`;
    element.style.position = "absolute";
    element.style.transform = "translateZ(42px) rotate(-1deg)";
  }

  dragState = {
    element,
    parent,
    offsetX: event.clientX - elementRect.left,
    offsetY: event.clientY - elementRect.top,
  };

  element.classList.add("is-dragging");
  element.setPointerCapture?.(event.pointerId);
}

function moveDraggedElement(event) {
  if (!dragState) return;

  const parentRect = dragState.parent.getBoundingClientRect();
  dragState.element.style.left = `${event.clientX - parentRect.left - dragState.offsetX}px`;
  dragState.element.style.top = `${event.clientY - parentRect.top - dragState.offsetY}px`;
}

function endDrag() {
  if (!dragState) return;

  dragState.element.classList.remove("is-dragging");
  dragState = null;
}

async function runIntro() {
  try {
    ensureAudioContext();
  } catch {
    audioContext = null;
  }

  for (const line of lines) {
    await typeLine(line, line.dataset.text);
  }

  introFinished = true;
  skipIntro.textContent = "Entrar";
  skipIntro.classList.add("is-ready");
}

document.querySelectorAll("[data-context]").forEach((hotspot) => {
  hotspot.addEventListener("click", () => {
    contextMenu.classList.remove('leader-comparison');
    const item = contextData[hotspot.dataset.context];
    const contextId = hotspot.dataset.context;
    activeBiography = ["adrian", "luna", "sebastian"].includes(contextId) ? contextId : null;
    if (contextId === "foto-sala") { openPhotoViewer(); return; }

    if (["adrian", "luna", "sebastian"].includes(contextId)) {
      state.readBios.add(contextId);
      if (hasReadAllBios()) {
        completeClue("perfiles-lideres");
      }
      updateLeaderButton();
    }

    if (contextId === "isla-mapa") {
      contextMenu.classList.add("is-hidden");
      playMapZoom();
      return;
    }

    if (hotspot.dataset.context === "dossier") {
      dossierHotspot.classList.remove("needs-attention");
      updateDirectorCaption(
        "Ese es el expediente. A partir de ahora cada escenario tendra objetos, personas o documentos con los que podras interactuar. Explora los documentos y decide por donde empezar."
      );
    }

    contextMenu.querySelectorAll(".context-photo").forEach((photo) => photo.remove());
    contextKicker.textContent = item.kicker;
    contextTitle.textContent = item.title;
    document.querySelector('.biography-subtitles')?.remove();
    contextMenu.querySelectorAll('.leader-resources').forEach(node=>node.remove());
    if (item.birthplace) {
      const subtitles = document.createElement('div');
      subtitles.className = 'biography-subtitles';
      for (const text of [item.birthplace, item.birthdate, `Grupo sanguíneo: ${item.bloodGroup}`]) {
        const line = document.createElement('p');
        line.textContent = text;
        subtitles.append(line);
      }
      const resources = document.createElement('section');
      resources.className = 'leader-resources';
      resources.setAttribute('aria-label', 'Recursos de misión');
      const heading = document.createElement('strong');
      heading.textContent = 'Recursos de misión';
      resources.append(heading);
      for (const text of [
        `Presupuesto: ${item.missionBudget}`,
        `Plazo común: 168 horas de misión (7 días)`,
        item.preparationHours ? `Preparación: −${item.preparationHours} horas de misión sobre el tiempo restante.` : 'Sin descuento de tiempo por preparación.',
        'El tiempo ya empleado en este escenario se descuenta del total.',
        `Ventaja: ${item.missionAdvantage}`
      ]) {
        const line = document.createElement('p');
        line.textContent = text;
        resources.append(line);
      }
      const kitTitle=document.createElement('h4');kitTitle.textContent='Equipo especial que llevará a la misión';resources.append(kitTitle);
      for(const equipment of window.missionEquipment?.[contextId]||[]) {
        const card=document.createElement('div');card.className='bio-equipment';
        const icon=document.createElement('span');icon.textContent=equipment.icon;icon.setAttribute('aria-hidden','true');
        const text=document.createElement('div'),name=document.createElement('strong'),description=document.createElement('p');
        name.textContent=equipment.title;description.textContent=equipment.body;text.append(name,description);card.append(icon,text);resources.append(card);
      }
      contextBody.after(resources);
      contextTitle.after(subtitles);
    }
    typeText(contextBody, item.body, item.birthplace ? 0 : 16);
    contextActions.innerHTML = item.actions
      .map((label) => `<button type="button" data-action="${label.toLowerCase().replaceAll(" ", "-")}">${label}</button>`)
      .join("");
    if (["adrian", "luna", "sebastian"].includes(contextId)) {
      const chooseAndre = contextActions.querySelector('button');
      chooseAndre.dataset.action = `lider-${contextId}`;
      chooseAndre.disabled = !canChooseLeader();
      if (chooseAndre.disabled) {
        const hint = document.createElement('p');
        hint.className = 'leader-selection-hint';
        hint.textContent = 'Consulta y cierra las tres biografías para elegir líder.';
        contextActions.append(hint);
      }
    }
    contextMenu.classList.remove("is-hidden");
    updateLeaderButton();
  });
});

room.addEventListener("pointermove", updateSceneDepth);

document.addEventListener("pointerdown", (event) => {
  const draggable = event.target.closest("[data-draggable], [data-drag-panel]");
  makeElementDraggable(draggable, event);
});

document.addEventListener("pointermove", moveDraggedElement);
document.addEventListener("pointerup", endDrag);
document.addEventListener("pointercancel", endDrag);

closeContext.addEventListener("click", () => {
  if (activeBiography) closedBiographies.add(activeBiography);
  activeBiography = null;
  contextMenu.classList.add("is-hidden");
  updateLeaderButton();
  if(canChooseLeader()) {
    directorCaption.classList.remove('is-minimized');
    updateDirectorCaption('Ya has consultado los tres perfiles. Ahora elige quién dirigirá la misión. Pulsa ELEGIR LÍDER para comparar el presupuesto, el tiempo de preparación y el equipo de cada personaje. Después confirmarás tu elección.');
    leaderButton.focus();
  }
});

contextActions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  if (button.dataset.action === "cerrar") {
    mapZoomOverlay.classList.add("is-hidden");
    mapZoomOverlay.classList.remove("is-playing");
    contextMenu.classList.add("is-hidden");
  }
  if (button.dataset.action === "abrir-folder") {
    openFolder();
  }
});

folderPages.addEventListener("click", (event) => {
  const page = event.target.closest("[data-doc]");
  if (!page) return;
  openDocument(page.dataset.doc);
});

folderClose.addEventListener("click", () => {
  window.playActionSound?.("close");
  folderOverlay.classList.add("is-hidden");
  if (hasReadFullExpediente()) {
    expedienteClosedAfterRead = true;
    completeClue("expediente-completo");
    updateDirectorCaption(
      "Bien. Ya habeis leido el expediente inicial. Ahora abrid el correo cifrado en el ordenador de la mesa."
    );
  }
  updateHotspotVisibility();
  updateLeaderButton();
});

documentVisual.addEventListener("pointermove", (event) => {
  tiltPhoto(event);
});

documentVisual.addEventListener("pointerleave", (event) => {
  resetPhotoTilt(event);
});

documentVisual.addEventListener("click", (event) => {
  inspectPhotoClue(event);
});

contextActions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  if (button.dataset.action.startsWith("lider-")) {
    if (button.disabled || !canChooseLeader()) return;
    if (missionLeader) return;
    const id = button.dataset.action.slice(6);
    const profile = contextData[id];
    if (!profile?.missionBudget) return;
    updateMissionTime();
    const cost = profile.preparationHours * 3600000;
    if (missionRemaining <= cost) {
      window.alert('No queda tiempo suficiente para esta preparación. Elige otro líder o recupera tiempo.');
      return;
    }
    if (!window.confirm(`¿Elegir a ${profile.title}? Presupuesto: ${profile.missionBudget}. Preparación: ${profile.preparationHours} horas de misión. Tiempo tras elegir: ${formatMissionTime(missionRemaining-cost)}. La elección quedará fijada para esta partida.`)) return;
    missionRemaining = Math.max(0, missionRemaining - cost);
    missionLeader = {id, budget: Number(profile.missionBudget.replace(/[^0-9]/g, ''))};
    try { window.mandjiStorage.setItem('mandji-leader-v1', JSON.stringify(missionLeader)); } catch {}
    saveMissionTime();
    state.selectedLeader = profile.title;
    renderMissionResources();
    renderMissionTime();
    updateLeaderButton();
    updateDirectorCaption(`${profile.title} liderará la misión. Presupuesto disponible: ${profile.missionBudget}.`);
    openMissionPreparation();
    contextMenu.classList.add("is-hidden");
    return;
  }

  if (button.dataset.action === "ver-de-cerca") {
    openPhotoViewer();
  }
});

contextMenu.addEventListener("pointermove", tiltPhoto);
contextMenu.addEventListener("pointerleave", resetPhotoTilt);
contextMenu.addEventListener("click", inspectPhotoClue);

function tiltPhoto(event) {
  const explorer = event.target.closest("[data-photo-explorer]");
  if (!explorer) return;

  const rect = explorer.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  explorer.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
}

function resetPhotoTilt(event) {
  const explorer = event.target.closest("[data-photo-explorer]");
  if (!explorer) return;
  explorer.style.transform = "";
}

function inspectPhotoClue(event) {
  const clueButton = event.target.closest("[data-photo-clue]");
  if (!clueButton) return;

  state.exploredPhoto = true;
  completeClue("marca-mnd-01");
  updateHotspotVisibility();
  clueButton.classList.add("found");
  typeText(
    photoDialog.contains(clueButton) ? photoNote : contextMenu.contains(clueButton) ? contextBody : documentBody,
    "Pista descubierta: tres grapas reparan una grieta en la unión de la empuñadura y el asta. Será necesario comparar este detalle con otras imágenes.",
    16
  );
  updateLeaderButton();
}

leaderButton?.addEventListener("click", () => {
  if (leaderButton.disabled) return;

  contextKicker.textContent = "Decision pendiente";
  document.querySelector('.biography-subtitles')?.remove();
  contextTitle.textContent = "Elegir lider de la mision";
  contextBody.textContent = "";
  contextMenu.classList.add('leader-comparison');
  contextBody.textContent = 'Objetivo: investigar el origen del bastón, su valor histórico y comercial y cómo salió del país. La subasta comienza en siete días. Los tres personajes siguen en el equipo; aquí eliges quién lo dirige. El presupuesto paga viajes, consultas y servicios, no el lote ni el depósito de un millón. El reloj usa horas ficticias: 1 minuto de juego consume 24 minutos de misión. Cerrar el juego lo pausa. Los desplazamientos futuros descontarán la duración indicada antes de confirmar. El acompañante se decidirá en cada briefing.';
  const portraits={adrian:'adrian-mbolo.png',luna:'luna-nve.png',sebastian:'sebastian-vidal.png'};
  const specialties={adrian:'Contactos y entrevistas',luna:'Análisis de imágenes y objetos',sebastian:'Investigación documental'};
  contextActions.innerHTML = ['adrian','luna','sebastian'].map(id=>{
    const p=contextData[id],remaining=Math.max(0,missionRemaining-p.preparationHours*3600000);
    return `<article class="leader-option"><img src="./assets/${portraits[id]}" alt="${p.title}"><h3>${p.title}</h3><p>${specialties[id]}</p><p><b>Presupuesto: ${p.missionBudget}</b></p><p>Preparación: ${p.preparationHours} h</p><p>Tiempo tras elegir: ${formatMissionTime(remaining)}</p><button type="button" data-action="lider-${id}" ${remaining<=0?'disabled':''}>ELEGIR · ${p.missionBudget}</button></article>`;
  }).join('');
  contextMenu.classList.remove("is-hidden");
});

audioToggle.addEventListener("click", () => {
  dialoguePaused = !dialoguePaused;
  audioToggle.textContent = dialoguePaused ? "Play" : "Pause";

  if ("speechSynthesis" in window) {
    if (dialoguePaused) {
      window.speechSynthesis.pause();
    } else {
      window.speechSynthesis.resume();
    }
  }
});

volumeControl.addEventListener("input", () => {
  masterVolume = Number(volumeControl.value) / 100;
});

narrationToggle.addEventListener("change", () => {
  narrationEnabled = narrationToggle.checked;

  if (!narrationEnabled && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  } else if (narrationEnabled && room && !room.classList.contains("is-hidden")) {
    welcomePlayed = false;
    speakDirectorWelcome();
  }
});

document.addEventListener(
  "pointerdown",
  () => {
    try {
      ensureAudioContext();
    } catch {
      audioContext = null;
    }
  },
  { once: true }
);

skipIntro.addEventListener("click", () => {
  if (!introFinished) {
    lines.forEach((line) => {
      line.textContent = line.dataset.text;
      line.classList.add("is-complete");
    });
    introFinished = true;
  }

  revealRoom();
});

updateClueCounter();
runIntro();

let activeDocumentIndex = 0;
document.querySelector('[data-doc-prev]').addEventListener('click', () => openDocument(availableDocuments()[Math.max(0, activeDocumentIndex - 1)].id));
document.querySelector('[data-doc-next]').addEventListener('click', () => openDocument(availableDocuments()[Math.min(availableDocuments().length - 1, activeDocumentIndex + 1)].id));
const photoDialog = document.querySelector('#photo-dialog');
const photoNote = document.querySelector('#photo-note');
let photoReturnFocus;
const PUZZLE_KEY = 'mandji-photo-puzzle-v2';
let puzzlePieces = [4, 0, 7, 2, 8, 1, 6, 3, 5];
let puzzleSelected = null;
let puzzleShuffling = false;
let inscriptionFound = false;
try {
  const saved = JSON.parse(window.mandjiStorage.getItem(PUZZLE_KEY));
  if (Array.isArray(saved?.pieces) && saved.pieces.length === 9 && new Set(saved.pieces).size === 9 && saved.pieces.every(n => Number.isInteger(n) && n >= 0 && n < 9)) {
    puzzlePieces = saved.pieces;
    inscriptionFound = saved.found === true && puzzlePieces.every((n,i) => n === i);
  }
} catch {}
const puzzleBoard = document.querySelector('#photo-puzzle');
function puzzleSolved() { return puzzlePieces.every((piece,index) => piece === index); }
function savePuzzle() {
  try { window.mandjiStorage.setItem(PUZZLE_KEY, JSON.stringify({pieces:puzzlePieces,found:inscriptionFound})); } catch {}
}
function renderPuzzle() {
  const solved = puzzleSolved();
  const correct = puzzlePieces.filter((piece,index)=>piece===index).length;
  document.querySelector('#puzzle-help').textContent=solved?'Fotografía completada. Pulsa el punto de luz sobre la reparación para guardar la pista.':`Reconstruye la fotografía del anuncio. Pulsa dos piezas para intercambiarlas. ${correct}/9 piezas en su lugar.`;
  puzzleBoard.classList.toggle('is-solved', solved);
  puzzleBoard.innerHTML = puzzlePieces.map((piece,slot) => {
    const x = piece % 3 * 50, y = Math.floor(piece / 3) * 50;
    return `<button type="button" class="puzzle-piece${puzzleSelected === slot ? ' is-selected' : ''}" data-puzzle-slot="${slot}" aria-pressed="${puzzleSelected === slot}" aria-label="${solved && piece === 7 ? 'Examinar reparación antigua' : `Pieza ${piece + 1}, posición ${slot + 1}`}" style="background-position:${x}% ${y}%">${piece === 7 && inscriptionFound ? `<span class="puzzle-inscription" aria-hidden="true">Reparación antigua</span>` : piece === 7 && solved ? `<span class="puzzle-spotlight" aria-hidden="true"></span>` : ''}</button>`;
  }).join('');
  photoNote.textContent = inscriptionFound ? 'Pista guardada en 💾: Reparación antigua.' : solved ? '✓ Fotografía completada. Pulsa el punto de luz en la pieza central inferior para examinar las tres grapas.' : puzzleSelected !== null ? 'Ahora pulsa otra pieza para intercambiarlas.' : 'Pulsa dos piezas para intercambiarlas. Las piezas se mezclan al abrir el puzle hasta que lo resuelvas.';
  document.querySelector('#inscription-detail').hidden = !inscriptionFound;
}
function restorePhotoClues() {
  if (puzzleSolved()) completeClue('foto-referencia');
  if (inscriptionFound) {
    state.exploredPhoto = true;
    completeClue('marca-mnd-01');
  }
  updateHotspotVisibility();
  updateLeaderButton();
}
function openPhotoViewer() {
  photoReturnFocus = document.activeElement;
  contextMenu.classList.add('is-hidden');
  restorePhotoClues();
  renderPuzzle();
  photoDialog.showModal();
  if (!puzzleSolved()) shufflePhotoPuzzle();
}
function shufflePhotoPuzzle() {
  const previous = [...puzzlePieces];
  do {
    puzzlePieces = Array.from({length:9}, (_, i) => i);
    for (let i = 8; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [puzzlePieces[i], puzzlePieces[j]] = [puzzlePieces[j], puzzlePieces[i]];
    }
  } while (puzzleSolved() || puzzlePieces.every((piece, i) => piece === previous[i]));
  puzzleSelected = null;
  savePuzzle();
  renderPuzzle();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  puzzleShuffling = true;
  photoNote.textContent = 'Mezclando las piezas…';
  const animations = [...puzzleBoard.children].map((tile, slot) => {
    tile.disabled = true;
    const oldSlot = previous.indexOf(puzzlePieces[slot]);
    const stepX = tile.offsetWidth + 5, stepY = tile.offsetHeight + 5;
    return tile.animate([
      {transform:`translate(${(oldSlot % 3 - slot % 3) * stepX}px, ${(Math.floor(oldSlot / 3) - Math.floor(slot / 3)) * stepY}px)`, opacity:.65},
      {transform:'translate(0, 0)', opacity:1}
    ], {duration:650, easing:'ease-in-out'});
  });
  Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
    puzzleShuffling = false;
    renderPuzzle();
  });
}
puzzleBoard.addEventListener('click', event => {
  if (puzzleShuffling) return;
  const button = event.target.closest('[data-puzzle-slot]');
  if (!button) return;
  const slot = Number(button.dataset.puzzleSlot);
  if (puzzleSolved()) {
    if (puzzlePieces[slot] === 7) {
      inscriptionFound = true;
      savePuzzle();
      restorePhotoClues();
      renderPuzzle();
      puzzleBoard.children[slot].focus();
    } else photoNote.textContent = 'La fotografía está completa. Pulsa el punto de luz sobre las tres grapas, en la pieza central inferior.';
    return;
  }
  if (puzzleSelected === null) puzzleSelected = slot;
  else if (puzzleSelected === slot) puzzleSelected = null;
  else {
    window.playActionSound?.("piece");
    [puzzlePieces[puzzleSelected],puzzlePieces[slot]] = [puzzlePieces[slot],puzzlePieces[puzzleSelected]];
    puzzleSelected = null;
    savePuzzle();
    if (puzzleSolved()) completeClue('foto-referencia');
  }
  renderPuzzle();
  puzzleBoard.children[slot].focus();
});
photoDialog.querySelector('[data-photo-close]').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('close', () => { puzzleSelected = null; savePuzzle(); photoReturnFocus?.focus(); });
// Restore only after inventory listeners have loaded; do not reveal the photo clue early.
window.addEventListener('DOMContentLoaded', restorePhotoClues);

const MISSION_DURATION = 168 * 60 * 60 * 1000;
const MISSION_TIME_SCALE = 24;
const MISSION_TIMER_KEY = 'mandji-fictional-hours-v3';
let missionRemaining = MISSION_DURATION;
let missionLastTick = null;
let missionTimerStarted = false;
let manualGamePaused = false;
function formatMissionTime(milliseconds) {
  const minutes = Math.max(0, Math.ceil(milliseconds / 60000));
  return `${Math.floor(minutes/60)} h ${String(minutes%60).padStart(2,'0')} min`;
}
function saveMissionTime() {
  try { window.mandjiStorage.setItem(MISSION_TIMER_KEY, String(missionRemaining)); } catch {}
}
function renderMissionTime() {
  document.querySelector('#mission-time').textContent = formatMissionTime(missionRemaining);
  const timer = document.querySelector('.mission-countdown');
  timer.classList.toggle('is-urgent', missionRemaining <= 6 * 60 * 60 * 1000);
  timer.querySelector('span').textContent = missionRemaining <= 0 ? 'Tiempo agotado' : missionLastTick === null ? 'Misión en pausa' : 'Hasta la subasta';
  timer.querySelector('small').textContent='Tiempo ficticio · 1 min real = 24 min de misión';
  if (missionRemaining <= 0 && missionTimerStarted) openTimeChallenge();
  timer.setAttribute('aria-label', missionRemaining <= 0 ? 'Tiempo de investigación agotado' : 'Tiempo de investigación restante');
}
function updateMissionTime() {
  if (missionLastTick !== null) {
    const now = performance.now();
    const elapsed = now - missionLastTick;
    if (!document.hidden && document.hasFocus() && !manualGamePaused && elapsed >= 0 && elapsed <= 5000) missionRemaining = Math.max(0, missionRemaining - elapsed * MISSION_TIME_SCALE);
    missionLastTick = missionRemaining > 0 ? now : null;
    saveMissionTime();
  }
  renderMissionTime();
}
function pauseMissionTimer() {
  if (!missionTimerStarted) return;
  updateMissionTime();
  missionLastTick = null;
  saveMissionTime();
  renderMissionTime();
}
function resumeMissionTimer() {
  if (!missionTimerStarted || manualGamePaused || document.hidden || !document.hasFocus() || document.querySelector('#preparation-dialog[open]') || missionRemaining <= 0) return;
  if (missionLastTick === null) missionLastTick = performance.now();
  renderMissionTime();
}
function startMissionTimer() {
  if (missionTimerStarted) { resumeMissionTimer(); return; }
  try {
    const saved = window.mandjiStorage.getItem(MISSION_TIMER_KEY);
    const value = Number(saved);
    if (saved === null) { const old=window.mandjiStorage.getItem('mandji-active-minutes-v2'); if(old!==null && Number.isFinite(Number(old))) missionRemaining=Math.max(0,Math.min(1,Number(old)/(72*60000)))*MISSION_DURATION; }
    if (saved !== null && Number.isFinite(value) && value >= 0 && value <= MISSION_DURATION) missionRemaining = value;
  } catch {}
  missionTimerStarted = true;
  saveMissionTime();
  resumeMissionTimer();
  renderMissionTime();
  setInterval(updateMissionTime, 1000);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseMissionTimer(); else resumeMissionTimer();
});
window.addEventListener('blur', pauseMissionTimer);
window.addEventListener('focus', resumeMissionTimer);
window.addEventListener('pagehide', pauseMissionTimer);
window.addEventListener('pageshow', resumeMissionTimer);
document.querySelector('.room-home-link').addEventListener('click', pauseMissionTimer);

document.querySelector('[data-map-close]').addEventListener('click', () => {
  mapZoomOverlay.classList.add('is-hidden');
  mapZoomOverlay.classList.remove('is-playing');
  contextMenu.classList.add('is-hidden');
  mapHotspot?.focus();
});

const gamePauseButton = document.querySelector('[data-game-pause]');
const gamePauseDialog = document.querySelector('#game-pause-dialog');
function pauseCountKey() { return 'mandji-pauses-scene-' + (room.dataset.sceneNumber || '1'); }
function pausesUsed() {
  try { return Math.max(0, Math.min(2, Number(window.mandjiStorage.getItem(pauseCountKey())) || 0)); } catch { return pauseMemory[pauseCountKey()] || 0; }
}
const pauseMemory = {};
function updatePauseButton() {
  const left = 2 - pausesUsed();
  gamePauseButton.textContent = `PAUSA · ${left}/2`;
  gamePauseButton.disabled = left === 0;
}
let dialogueBeforeGamePause = false;
gamePauseButton.addEventListener('click', () => {
  if (pausesUsed() >= 2 || manualGamePaused) return;
  const used = pausesUsed() + 1;
  pauseMemory[pauseCountKey()] = used;
  try { window.mandjiStorage.setItem(pauseCountKey(), String(used)); } catch {}
  pauseMissionTimer();
  manualGamePaused = true;
  dialogueBeforeGamePause = dialoguePaused;
  dialoguePaused = true;
  if ('speechSynthesis' in window) window.speechSynthesis.pause();
  updatePauseButton();
  gamePauseDialog.showModal();
});
function continueGame() {
  if (!manualGamePaused) return;
  manualGamePaused = false;
  dialoguePaused = dialogueBeforeGamePause;
  if (!dialoguePaused && 'speechSynthesis' in window) window.speechSynthesis.resume();
  gamePauseDialog.close();
  resumeMissionTimer();
  gamePauseButton.focus();
}
gamePauseDialog.addEventListener('cancel', event => { event.preventDefault(); continueGame(); });
document.querySelector('[data-game-resume]').addEventListener('click', continueGame);
function restartMission() {
  pauseMissionTimer();
  if (!window.confirm('¿Reiniciar toda la partida? Se borrarán las pistas, los objetos y el puzle guardados. El tiempo volverá a 168 horas de misión y recuperarás las dos pausas por escenario.')) {
    resumeMissionTimer();
    return;
  }
  try {
    const keys = ['mandji-scene2-v1','mandji-plan-v1','mandji-leader-v1','mandji-map-puzzle-v1','mandji-email-v1','mandji-riddles-v1','mandji-collection-v1','mandji-photo-puzzle-v2','mandji-active-minutes-v2','mandji-fictional-hours-v3','mandji-mission-deadline-v1','mandji-search3-v1','mandji-cultural-trail-v1','mandji-bata-map-v1','mandji-travel-bata-v1','mandji-scene3-v1','mandji-exhibition-v1'];
    for (let i=0;i<window.mandjiStorage.length;i++) {
      const key=window.mandjiStorage.key(i);
      if (key?.startsWith('mandji-pauses-scene-')) keys.push(key);
    }
    keys.forEach(key => window.mandjiStorage.removeItem(key));
  } catch {}
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  missionTimerStarted = false;
  missionLastTick = null;
  window.location.href = './jugar.html';
}
document.querySelector('[data-game-restart]').addEventListener('click', restartMission);
document.querySelector('[data-prep-restart]').addEventListener('click', restartMission);
new MutationObserver(updatePauseButton).observe(room, {attributes:true,attributeFilter:['data-scene-number']});
updatePauseButton();

const challengeDialog = document.createElement('dialog');
challengeDialog.className = 'collection-dialog';
challengeDialog.setAttribute('aria-labelledby','challenge-title');
challengeDialog.innerHTML = '<h2 id="challenge-title">El tiempo se ha agotado</h2><p>Resuelve este acertijo para retroceder en el tiempo y continuar la misión.</p><p id="challenge-question"></p><div id="challenge-answers"></div><p id="challenge-feedback" aria-live="polite"></p><button type="button" id="challenge-hint" hidden>VER AYUDA</button><p id="challenge-help" hidden></p>';
document.body.append(challengeDialog);
challengeDialog.addEventListener('cancel',e=>e.preventDefault());
let challengeState = {used:[],active:null,attempts:0};
try {
  const saved=JSON.parse(window.mandjiStorage.getItem('mandji-riddles-v1'));
  if(saved && Array.isArray(saved.used)) challengeState={used:saved.used.filter(id=>missionRiddles.some(r=>r.id===id)),active:missionRiddles.some(r=>r.id===saved.active)?saved.active:null,attempts:Math.max(0,Number(saved.attempts)||0)};
} catch {}
let challengePreviousDialogue = false;
function saveChallenge() { try {window.mandjiStorage.setItem('mandji-riddles-v1',JSON.stringify(challengeState));} catch {} }
function openTimeChallenge() {
  if(challengeDialog.open) return;
  challengePreviousDialogue=dialoguePaused;
  dialoguePaused=true;
  if('speechSynthesis' in window) window.speechSynthesis.pause();
  if(!challengeState.active) {
    let available=missionRiddles.filter(r=>!challengeState.used.includes(r.id));
    if(!available.length) {challengeState.used=[];available=missionRiddles;}
    challengeState.active=available[Math.floor(Math.random()*available.length)].id;
    challengeState.attempts=0;
    saveChallenge();
  }
  renderTimeChallenge();
  challengeDialog.showModal();
}
function renderTimeChallenge() {
  const r=missionRiddles.find(r=>r.id===challengeState.active);
  challengeDialog.querySelector('#challenge-question').textContent=r.question;
  const choices=challengeDialog.querySelector('#challenge-answers');choices.replaceChildren();
  r.options.forEach((option,index)=>{
    const button=document.createElement('button');button.type='button';button.textContent=option;
    button.onclick=()=>{
      if(index!==r.answer) {
        challengeState.used.push(r.id);
        let available=missionRiddles.filter(next=>next.id!==r.id&&!challengeState.used.includes(next.id));
        if(!available.length){challengeState.used=[r.id];available=missionRiddles.filter(next=>next.id!==r.id);}
        if(!available.length)return;
        challengeState.active=available[Math.floor(Math.random()*available.length)].id;
        challengeState.attempts=0;saveChallenge();
        renderTimeChallenge();
        challengeDialog.querySelector('#challenge-feedback').textContent='Respuesta incorrecta. Prueba con este nuevo acertijo.';
        challengeDialog.querySelector('#challenge-answers button')?.focus();
        return;
      }
      challengeState.used.push(r.id);challengeState.active=null;challengeState.attempts=0;saveChallenge();
      missionRemaining=MISSION_DURATION;missionLastTick=null;saveMissionTime();
      dialoguePaused=challengePreviousDialogue;
      challengeDialog.close();
      if(!dialoguePaused && 'speechSynthesis' in window) window.speechSynthesis.resume();
      resumeMissionTimer();renderMissionTime();
    };choices.append(button);
  });
  challengeDialog.querySelector('#challenge-feedback').textContent='';
  const hint=challengeDialog.querySelector('#challenge-hint'),help=challengeDialog.querySelector('#challenge-help');
  hint.hidden=challengeState.attempts<2;help.hidden=true;help.textContent=r.hint;
  hint.onclick=()=>{help.hidden=false;};
}

// Persist the selected leader and remaining mission funds across visits.
let missionLeader = null;
try {
  const saved = JSON.parse(window.mandjiStorage.getItem('mandji-leader-v1'));
  if (['adrian','luna','sebastian'].includes(saved?.id) && Number.isFinite(saved.budget) && saved.budget >= 0) missionLeader = saved;
} catch {}
function renderMissionResources() {
  let display = document.querySelector('#mission-resources');
  if (!missionLeader) return;
  if (!display) {
    display = document.createElement('div');
    display.id = 'mission-resources';
    display.setAttribute('aria-live', 'polite');
    document.querySelector('#chapter-room').append(display);
  }
  state.selectedLeader = contextData[missionLeader.id].title;
  display.textContent = `${state.selectedLeader} · Presupuesto: ${new Intl.NumberFormat('es-ES', {style:'currency',currency:'EUR',maximumFractionDigits:0}).format(missionLeader.budget)}`;
}
renderMissionResources();

function openMissionPreparation() {
  if (!missionLeader) return;
  pauseMissionTimer();
  const dialog = document.querySelector('#preparation-dialog');
  let saved = {};
  try { saved = JSON.parse(window.mandjiStorage.getItem('mandji-plan-v1')) || {}; } catch {}
  const ids = ['adrian','luna','sebastian'];
  const defaults = {adrian:'Chicket',luna:'Princesa',sebastian:'Macho'};
  const fields = dialog.querySelector('[data-aliases]');
  fields.replaceChildren();
  ids.forEach(id => {
    const label = document.createElement('label');
    label.className='alias-card';
    const portrait=document.createElement('img');
    portrait.src='./assets/'+({adrian:'adrian-mbolo',luna:'luna-nve',sebastian:'sebastian-vidal'}[id])+'.png';
    portrait.alt=contextData[id].title;
    const name=document.createElement('strong');
    name.textContent=contextData[id].title + (id === missionLeader.id ? ' · Líder' : '');
    label.append(portrait,name);
    const input = document.createElement('input');
    input.name = id; input.required = false; input.maxLength = 24;
    input.value = saved.aliases?.[id] || defaults[id];
    label.append(input); fields.append(label);
  });
  let confirmedAliases=saved.aliasesConfirmed ? saved.aliases : null;
  const initialBudget=Number(contextData[missionLeader.id].missionBudget.replace(/[^0-9]/g,''));
  const prepMinutes=contextData[missionLeader.id].preparationHours;
  const spent=Math.max(0,initialBudget-missionLeader.budget),used=Math.max(0,MISSION_DURATION-missionRemaining);
  dialog.querySelector('[data-plan-summary]').innerHTML=[
    ['⏳','Tiempo disponible',formatMissionTime(missionRemaining),`${formatMissionTime(used)} consumidos · preparación: ${prepMinutes} h`,missionRemaining/MISSION_DURATION],
    ['💶','Presupuesto disponible',missionLeader.budget.toLocaleString('es-ES')+' €',`${spent.toLocaleString('es-ES')} € gastados de ${initialBudget.toLocaleString('es-ES')} €`,missionLeader.budget/initialBudget],
    ['🎒','Equipo común','3 objetos','Linterna · Lupa · Cuaderno de campo · sin coste',1]
  ].map(([icon,title,value,note,ratio])=>`<article class="resource-card"><span>${icon}</span><h4>${title}</h4><strong>${value}</strong><progress max="1" value="${Math.max(0,Math.min(1,ratio))}" aria-label="${title}"></progress><p>${note}</p></article>`).join('');
  dialog.querySelector('[data-special-equipment]').innerHTML='<h4>Equipo especial de '+contextData[missionLeader.id].title+'</h4><p>Incluido sin coste. Sus usos se habilitarán en las escenas correspondientes.</p>'+ (window.missionEquipment?.[missionLeader.id]||[]).map(item=>`<button type="button" data-show-special><span>${item.icon}</span><b>${item.title}</b><small>${item.body}</small></button>`).join('');
  dialog.querySelectorAll('[data-show-special]').forEach(button=>button.onclick=()=>window.dispatchEvent(new CustomEvent('mandji:open-collection',{detail:{type:'objects'}})));

  dialog.querySelectorAll('[data-prep-collection]').forEach(button=>button.onclick=()=>window.dispatchEvent(new CustomEvent('mandji:open-collection',{detail:{type:button.dataset.prepCollection}})));
  if (new URLSearchParams(location.search).get('vista') !== 'transicion') {
    for (const item of [{id:'kit-linterna',title:'Linterna',body:'Para examinar zonas poco iluminadas.'},{id:'kit-lupa',title:'Lupa',body:'Para observar marcas y detalles pequeños.'},{id:'kit-cuaderno',title:'Cuaderno de campo',body:'Para registrar observaciones durante las salidas.'}]) window.dispatchEvent(new CustomEvent('mandji:collect-object',{detail:item}));
  }
  dialog.querySelector('[data-next-briefing]').onclick=()=>{
    if (!confirmedAliases || ids.some(id=>fields.querySelector(`[name=${id}]`).value.trim()!==confirmedAliases[id])) { dialog.querySelector('[data-next-status]').textContent='Guarda primero los nombres en clave en la sección 2.'; return; }
    const briefing=document.querySelector('#next-briefing');
    briefing.querySelector('[data-operational-call]').textContent=`${confirmedAliases[missionLeader.id]}, coordina la investigación. ${ids.filter(id=>id!==missionLeader.id).map(id=>confirmedAliases[id]).join(' y ')}: preparaos para contrastar los documentos.`;
    briefing.showModal();
    window.dispatchEvent(new CustomEvent('mandji:collect-clue',{detail:{id:'briefing-2',title:'Briefing inicial · La expedición interrumpida',mission:2,body:[...briefing.querySelectorAll('p')].map(p=>p.textContent).join('\n\n')}}));
    briefing.querySelector('[data-briefing-back]').onclick=()=>briefing.close();
  };
  dialog.querySelector('form').onsubmit=event => {
    event.preventDefault();
    const aliases=Object.fromEntries(ids.map(id=>[id,fields.querySelector(`[name=${id}]`).value.trim()]));
    if (Object.values(aliases).some(alias=>!alias) || new Set(Object.values(aliases).map(alias=>alias.toLocaleLowerCase())).size<3) {
      dialog.querySelector('[data-plan-error]').textContent='Introduce tres nombres en clave diferentes.'; return;
    }
    const plan={aliases,leader:missionLeader.id,cost:0,aliasesConfirmed:true};
    confirmedAliases=aliases;
    if (new URLSearchParams(location.search).get('vista') !== 'transicion') { try { window.mandjiStorage.setItem('mandji-plan-v1',JSON.stringify(plan)); } catch {} }
    dialog.querySelector('[data-alias-status]').textContent='Nombres confirmados. Se usarán en las comunicaciones operativas.';
    dialog.querySelector('[data-plan-error]').textContent='';
  };
  let step=0;
  const showStep=next=>{
    step=next;
    dialog.querySelectorAll('[data-prep-panel]').forEach(panel=>panel.hidden=Number(panel.dataset.prepPanel)!==step);
    dialog.querySelectorAll('[data-prep-step]').forEach(button=>{button.setAttribute('aria-current',Number(button.dataset.prepStep)===step?'step':'false');});
    dialog.querySelector('[data-prep-back]').hidden=step===0;
    dialog.querySelector('[data-prep-next]').hidden=step===2;
    dialog.querySelector('[data-prep-position]').textContent=`${step+1} / 3`;
    dialog.scrollTop=0;
  };
  dialog.querySelectorAll('[data-prep-step]').forEach(button=>button.onclick=()=>showStep(Number(button.dataset.prepStep)));
  dialog.querySelector('[data-prep-back]').onclick=()=>showStep(Math.max(0,step-1));
  dialog.querySelector('[data-prep-next]').onclick=()=>showStep(Math.min(2,step+1));
  showStep(0);
  if (!dialog.open) dialog.showModal();
}
const prepareButton=document.createElement('button');
prepareButton.type='button';prepareButton.textContent='NOMBRES EN CLAVE';prepareButton.className='prepare-mission-button';
prepareButton.addEventListener('click',openMissionPreparation);
document.querySelector('#chapter-room').append(prepareButton);
prepareButton.hidden=!missionLeader;
const originalRenderResources=renderMissionResources;
renderMissionResources=function(){originalRenderResources();prepareButton.hidden=!missionLeader;};
document.querySelector('#preparation-dialog').addEventListener('cancel',event=>event.preventDefault());

// A review-only route shows the real transition without changing the saved game.
if (new URLSearchParams(location.search).get('vista') === 'transicion') {
  window.addEventListener('DOMContentLoaded', () => {
    if (!missionLeader) missionLeader = {id:'adrian',budget:20000};
    const previewNotice=document.createElement('p');
    previewNotice.textContent='Vista previa · No modifica tu partida';
    previewNotice.className='eyebrow';
    document.querySelector('#preparation-dialog form').prepend(previewNotice);
    openMissionPreparation();
  });
}

directorCaption.addEventListener('click', event => {
  const toggle=event.target.closest('[data-caption-toggle]');
  if(!toggle)return;
  const minimized=directorCaption.classList.toggle('is-minimized');
  toggle.setAttribute('aria-expanded',String(!minimized));
  toggle.textContent=minimized?'ABRIR DIÁLOGO ＋':'MINIMIZAR −';
});

document.querySelector('.preparation-close').addEventListener('click',()=>{document.querySelector('#preparation-dialog').close();resumeMissionTimer();prepareButton.focus();});

window.addEventListener('DOMContentLoaded',()=>{const soundPanel=document.querySelector('.ambient-controls');
if(soundPanel) new ResizeObserver(()=>room.style.setProperty('--sound-controls-height',soundPanel.getBoundingClientRect().height+'px')).observe(soundPanel);});
