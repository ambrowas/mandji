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
let mapZoomTimer = null;
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
  "Bienvenidos. Hemos recibido una mision muy importante y secreta del Gobierno de Guinea Ecuatorial: recuperar un objeto historico de gran valor. Leed el expediente y elegid cual de vosotros va a liderar esta mision. Durante la mision tendras que explorar los diferentes escenarios en busca de pistas e interactuar con ellos para avanzar y abrirte camino. Buena suerte, ya sabeis que es lo que esto puede suponer para Iniciativas Elebi. No me defraudeis!";

const contextData = {
  adrian: {
    kicker: "Personaje",
    title: "André Esono Bibang",
    body:
      "Investigador de campo ecuatoguineano, formado entre Malabo y Bata, especializado en trabajo comunitario, entrevistas y verificacion de memoria oral. Reservado, paciente y muy cuidadoso con la palabra dada. Como lider aporta acceso local, lectura cultural y legitimidad ante testigos de Mandji. Su punto debil es que las instituciones europeas pueden exigirle pruebas documentales antes de aceptar relatos orales.",
    actions: ["Elegir ruta de André", "Preguntar por Mandji"],
  },
  luna: {
    kicker: "Personaje",
    title: "Lucía Nvé García",
    body:
      "Investigadora hispano-guineana de archivo visual y cultura material. Crecio entre Malabo y Madrid y conserva un cuaderno familiar con un dibujo parecido a la pieza perdida. Intuitiva, rapida y poco conformista. Como lider detecta detalles que otros pasan por alto: fotografias, marcas, silencios en una ficha, gestos de un testigo. Su riesgo es que algunos intenten rebajar sus pistas a intuiciones personales.",
    actions: ["Elegir ruta de Lucía", "Revisar cuaderno"],
  },
  sebastian: {
    kicker: "Personaje",
    title: "Christian Dougan Makosso",
    body:
      "Historiador guineano y especialista en archivos coloniales, con experiencia en catalogos, fondos misioneros y colecciones privadas europeas. Sereno, metodico y politicamente prudente. Como lider sabe convertir una sospecha en expediente: fechas, firmas, rutas de salida, donantes y contradicciones administrativas. Su riesgo es que puede tardar demasiado buscando el documento perfecto mientras la subasta se acerca.",
    actions: ["Elegir ruta de Christian", "Consultar archivo"],
  },
  dossier: {
    kicker: "Objeto interactivo",
    title: "Dossier MND-01",
    body:
      "El folder contiene la primera orden de mision: recuperar un objeto historico de gran valor por encargo del Gobierno de Guinea Ecuatorial. El Gobierno sospecha que fue sustraido en la isla de Corisco, pero no ofrece mas explicaciones. Explora los documentos.",
    actions: ["Leer expediente"],
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
      "Esta fotografia es mas nitida que la copia incluida en el dossier. Mirala de cerca y examinala con calma. Si encuentras una pista, apuntala: puede servir en el futuro.",
    actions: ["Ver de cerca"],
  },
  "isla-mapa": {
    kicker: "Pista del mapa",
    title: "Isla identificada",
    body:
      "La silueta coincide con el croquis del expediente. El punto senalado no prueba que la pieza saliera de alli, pero convierte la sospecha del Gobierno en una primera ruta verificable: Mandji.",
    actions: ["Anotar pista"],
  },
};

const dossierDocuments = [
  {
    id: "orden",
    kicker: "Documento 01",
    title: "Orden reservada",
    image: "./assets/chapter-1-meeting.png",
    body:
      "Clasificacion: reservada. Remitente: enlace cultural del Gobierno de Guinea Ecuatorial. Objeto: localizar, documentar y preparar la recuperacion de una pieza historica de gran valor. El Gobierno cree que la pieza pudo ser sustraida en la isla de Corisco, Mandji, durante el periodo colonial, pero no aporta pruebas concluyentes ni explica de donde procede esa sospecha. La unica informacion operativa es una fotografia parcial, una ficha privada bajo categoria generica y la alerta de que el objeto podria pasar a una subasta cerrada en menos de setenta y dos horas. La mision de Iniciativas Elebi es averiguar todo desde cero: que es la pieza, de donde salio, quien la traslado, como acabo en Europa y que pruebas permitirian reclamarla sin ponerla en mas riesgo.",
  },
  {
    id: "foto",
    kicker: "Documento 02",
    title: "Fotografia demasiado borrosa",
    image: "./assets/mandji-archive-hero.png",
    body:
      "La copia incluida en el expediente esta demasiado borrosa. Se adivina una pieza cubierta por tela y una placa metalica, pero no se puede leer nada util. Si no puedes distinguir esta imagen, busca en la habitacion una fotografia de referencia mas clara y haz click en ella para verla de cerca.",
  },
  {
    id: "croquis",
    kicker: "Documento 03",
    title: "Croquis de isla",
    image: "./assets/chapter-1-meeting.png",
    body:
      "Entre las hojas aparece un mapa pequeno de una isla sin nombre. La forma coincide con una de las islas dibujadas en el mapa grande de la pared. Identifica esa isla en la pared y haz click en ella para abrir mas pistas.",
  },
  {
    id: "inventario",
    kicker: "Documento 04",
    title: "Ficha de inventario",
    image: "./assets/chapter-1-meeting.png",
    body:
      "La ficha europea evita mencionar Mandji. Solo aparece una entrada generica: 'objeto etnografico, Golfo de Guinea'. La fecha de ingreso esta incompleta y el campo de donante fue borrado en una copia posterior. Esta omision es importante: puede ser una negligencia archivistica, una forma de invisibilizar el origen o una pista de que alguien quiso separar la pieza de su comunidad de procedencia.",
  },
  {
    id: "mapa",
    kicker: "Documento 05",
    title: "Ruta probable",
    image: "./assets/chapter-1-meeting.png",
    body:
      "El trayecto preliminar senala cuatro nodos: Mandji, Muni, Malabo y Madrid. Mandji puede aportar memoria oral y legitimidad. Muni puede revelar el punto de salida. Malabo concentra contactos institucionales. Madrid puede contener el archivo o la coleccion actual. La primera gran decision sera decidir que tipo de prueba pesa mas al inicio: comunidad, documento, autoridad o acceso.",
  },
];

function revealRoom() {
  intro.classList.add("is-hidden");
  room.classList.remove("is-hidden");
  updateHotspotVisibility();
  updateDirectorCaption(welcomeText);
  speakDirectorWelcome();
}

function updateDirectorCaption(text) {
  directorCaption.innerHTML = `
    <p class="eyebrow">INICIATIVAS ELEBI</p>
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

function openFolder() {
  state.usedDossier = true;
  updateHotspotVisibility();
  contextMenu.classList.add("is-hidden");
  folderOverlay.classList.remove("is-hidden");
  folderOverlay.classList.remove("is-open");
  requestAnimationFrame(() => folderOverlay.classList.add("is-open"));

  folderPages.innerHTML = dossierDocuments
    .map(
      (doc, index) => `
        <button class="document-page" type="button" data-doc="${doc.id}" data-draggable style="--doc-index:${index}">
          <span class="grab-cue">Arrastrar</span>
          <span>${doc.kicker}</span>
          <strong>${doc.title}</strong>
        </button>
      `
    )
    .join("");

  openDocument(dossierDocuments[0].id);
}

function openDocument(id) {
  const doc = dossierDocuments.find((item) => item.id === id);
  if (!doc) return;

  state.readDocuments.add(id);
  completeClue(`doc-${id}`);
  documentKicker.textContent = doc.kicker;
  documentTitle.textContent = doc.title;
  renderDocumentVisual(doc);
  typeText(documentBody, getDocumentBody(doc), 16);
  updateLeaderButton();

  document.querySelectorAll(".document-page").forEach((button) => {
    button.classList.toggle("active", button.dataset.doc === id);
    button.classList.toggle("is-read", state.readDocuments.has(button.dataset.doc));
  });
}

function getDocumentBody(doc) {
  if (doc.id === "foto" && state.exploredPhoto) {
    return "La copia inicial era demasiado borrosa, pero la fotografia de referencia hallada en la sala permite distinguir mejor la pieza cubierta, la placa metalica y parte del entorno donde fue fotografiada. Esta imagen ya puede usarse como punto de comparacion para futuras escenas.";
  }

  if (doc.id === "croquis" && state.exploredWallIsland) {
    return "El croquis ya no es una forma anonima: coincide con una isla marcada en el mapa de pared. La orden reservada no explica por que el Gobierno sospecha de Mandji, pero esta coincidencia convierte la sala en el primer puente entre la sospecha politica y una ruta de investigacion verificable.";
  }

  return doc.body;
}

function renderDocumentVisual(doc) {
  if (doc.id === "foto") {
    const clearClass = state.exploredPhoto ? " is-clear" : "";
    documentVisual.innerHTML = `<img class="blurred-document${clearClass}" src="${doc.image}" alt="${doc.title}" />`;
    return;
  }

  if (doc.id === "croquis") {
    const clearClass = state.exploredWallIsland ? " is-clear" : "";
    documentVisual.innerHTML = `
      <div class="island-sketch${clearClass}" aria-label="Croquis de isla">
        <span></span>
      </div>
    `;
    return;
  }

  documentVisual.innerHTML = `<img src="${doc.image}" alt="${doc.title}" />`;
}

function hasReadFullExpediente() {
  return dossierDocuments.every((doc) => state.readDocuments.has(doc.id));
}

function hasReadAllBios() {
  return ["adrian", "luna", "sebastian"].every((id) => state.readBios.has(id));
}

function updateLeaderButton() {
  if (!leaderButton) return;

  const shouldShow = expedienteClosedAfterRead;
  leaderButton.classList.toggle("is-hidden", !shouldShow);
  leaderButton.disabled = !hasReadAllBios();
  leaderButton.classList.toggle("is-enabled", shouldShow && hasReadAllBios());
}

function updateClueCounter() {
  if (!cluesFoundLabel || !cluesTotalLabel) return;

  cluesFoundLabel.textContent = state.foundClues.size;
  cluesTotalLabel.textContent = SCENE_CLUE_TOTAL;
}

function completeClue(id) {
  if (state.foundClues.has(id)) return;

  state.foundClues.add(id);
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
  photoHotspot?.classList.toggle("is-hidden", !showClueHotspots);
  characterHotspots.forEach((hotspot) => {
    hotspot.classList.toggle("is-hidden", !showCharacters);
  });

  if (showCharacters && !state.shownCharactersCue) {
    state.shownCharactersCue = true;
    updateDirectorCaption(
      "Ya teneis dos primeras referencias: una imagen util y una isla identificada. Ahora revisad los perfiles de los tres posibles lideres antes de tomar una decision."
    );
  }
}

function playMapZoom() {
  if (!mapZoomOverlay) return;

  window.clearTimeout(mapZoomTimer);
  mapZoomOverlay.classList.remove("is-hidden");
  mapZoomOverlay.classList.remove("is-playing");
  requestAnimationFrame(() => {
    mapZoomOverlay.classList.add("is-playing");
  });

  mapZoomTimer = window.setTimeout(() => {
    mapZoomOverlay.classList.add("is-hidden");
    mapZoomOverlay.classList.remove("is-playing");
  }, 4200);
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
    const item = contextData[hotspot.dataset.context];
    const contextId = hotspot.dataset.context;

    if (["adrian", "luna", "sebastian"].includes(contextId)) {
      state.readBios.add(contextId);
      if (hasReadAllBios()) {
        completeClue("perfiles-lideres");
      }
      updateLeaderButton();
    }

    if (contextId === "isla-mapa") {
      state.exploredWallIsland = true;
      completeClue("isla-identificada");
      playMapZoom();
      updateHotspotVisibility();
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
    typeText(contextBody, item.body, 16);
    contextActions.innerHTML = item.actions
      .map((label) => `<button type="button" data-action="${label.toLowerCase().replaceAll(" ", "-")}">${label}</button>`)
      .join("");
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
  contextMenu.classList.add("is-hidden");
});

contextActions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  if (button.dataset.action === "leer-expediente") {
    openFolder();
  }
});

folderPages.addEventListener("click", (event) => {
  const page = event.target.closest("[data-doc]");
  if (!page) return;
  openDocument(page.dataset.doc);
});

folderClose.addEventListener("click", () => {
  folderOverlay.classList.add("is-hidden");
  if (hasReadFullExpediente()) {
    expedienteClosedAfterRead = true;
    completeClue("expediente-completo");
    updateDirectorCaption(
      "Bien. Ya habeis leido el expediente inicial. Ahora buscad en la sala una fotografia de referencia y localizad en el mapa la isla que coincide con el croquis."
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
    const selectedLeader = button.textContent;
    updateDirectorCaption(
      `${selectedLeader} liderara la primera salida. La mision queda abierta: encontrar el primer rastro verificable entre Mandji, Malabo y Madrid.`
    );
    contextMenu.classList.add("is-hidden");
    return;
  }

  if (button.dataset.action === "ver-de-cerca") {
    state.exploredPhoto = true;
    completeClue("foto-referencia");
    updateHotspotVisibility();
    contextMenu.querySelectorAll(".context-photo").forEach((photo) => photo.remove());
    contextKicker.textContent = "Fotografia ampliada";
    contextTitle.textContent = "Fotografia de referencia";
    contextActions.innerHTML = "";
    contextBody.innerHTML = "";
    contextBody.insertAdjacentHTML(
      "beforebegin",
      `<div class="photo-explorer context-photo" data-photo-explorer data-draggable>
        <span class="grab-cue">Arrastrar e inclinar</span>
        <img src="./assets/mandji-archive-hero.png" alt="Fotografia de referencia" />
        <button class="photo-clue" type="button" data-photo-clue aria-label="Inspeccionar placa"></button>
      </div>`
    );
    typeText(
      contextBody,
      "Mueve el cursor sobre la fotografia para inclinarla. Si encuentras una pista, apuntala: puede servir en el futuro.",
      16
    );
    updateLeaderButton();
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
    contextMenu.contains(clueButton) ? contextBody : documentBody,
    "Pista descubierta: en el borde inferior de la placa se distingue una marca incompleta: MND-01 / sala norte. No prueba el origen, pero sugiere que el objeto estuvo en una coleccion catalogada antes de pasar al circuito privado.",
    16
  );
  updateLeaderButton();
}

leaderButton?.addEventListener("click", () => {
  if (leaderButton.disabled) return;

  contextKicker.textContent = "Decision pendiente";
  contextTitle.textContent = "Elegir lider de la mision";
  contextBody.textContent = "";
  contextActions.innerHTML = ["André Esono Bibang", "Lucía Nvé García", "Christian Dougan Makosso"]
    .map((label) => `<button type="button" data-action="lider-${label.toLowerCase().replaceAll(" ", "-")}">${label}</button>`)
    .join("");
  typeText(
    contextBody,
    "Ya has revisado el expediente inicial y conoces los tres perfiles. Elige quien va a liderar la primera salida de investigacion.",
    16
  );
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
