const tabTitles = {
  jugar: "Sala de reuniones de Iniciativas Elebi",
  archivo: "Archivo Elebi",
  expediente: "Expediente MND-01",
  personajes: "Personajes disponibles",
  mapa: "Mapa de investigacion",
  creditos: "Creditos",
  finales: "Finales posibles",
};

const characterCopy = {
  mbolo: {
    name: "André Esono Bibang",
    route: "memoria comunitaria",
    text:
      '"André, necesito que empieces por Mandji. Tu fuerza esta en escuchar sin invadir, ordenar testimonios y ganar legitimidad local. Tu riesgo sera convertir esa memoria en pruebas que un museo o una administracion no puedan ignorar."',
  },
  vidal: {
    name: "Christian Dougan Makosso",
    route: "archivo europeo",
    text:
      '"Christian, tu entrada esta en los registros que nadie consulta. Sabes leer una ficha incompleta, una firma perdida y una omision deliberada. Tu ventaja sera construir un expediente solido; tu riesgo, que el tiempo de la subasta corra mas rapido que el archivo."',
  },
  luna: {
    name: "Lucía Nvé García",
    route: "pista familiar",
    text:
      '"Lucía, tu cuaderno no parece una prueba, pero a veces una familia conserva lo que una institucion borra. Tu ventaja sera ver conexiones invisibles; tu riesgo, que intenten tratar tu pista como algo demasiado personal."',
  },
};

const briefingCopy =
  '"El folder contiene tres piezas: una fotografia borrosa de un emblema ceremonial, una ficha de inventario sin procedencia y una nota: Mandji no olvida. La pieza podria entrar en una subasta privada en setenta y dos horas. Necesito una ruta, pruebas y una estrategia antes de que desaparezca."';

const title = document.querySelector("#window-title");
const landing = document.querySelector("#inicio");
const app = document.querySelector("#game-app");
const startButtons = document.querySelectorAll("[data-start-target]");
const tabButtons = document.querySelectorAll("[data-tab-target]");
const panels = document.querySelectorAll("[data-tab-panel]");
const directorPanel = document.querySelector("#director-panel");
const characterButtons = document.querySelectorAll("[data-character]");
const briefingButton = document.querySelector("[data-briefing]");
let selectedCharacter = null;

function setActiveTab(tabName) {
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tabPanel === tabName);
  });

  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tabTarget === tabName);
  });

  title.textContent = tabTitles[tabName];
}

function enterGame(tabName = "jugar") {
  landing.classList.add("is-hidden");
  app.classList.remove("is-hidden");
  setActiveTab(tabName);
}

startButtons.forEach((button) => {
  button.addEventListener("click", () => {
    enterGame(button.dataset.startTarget);
  });
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tabTarget);
  });
});

characterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const character = button.dataset.character;
    const profile = characterCopy[character];
    selectedCharacter = character;

    characterButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");

    directorPanel.innerHTML = `
      <p class="eyebrow">Director de Iniciativas Elebi</p>
      <h3>${profile.name}</h3>
      <p>${profile.text}</p>
      <div class="meeting-status">
        <span>${profile.route}</span>
        <span>personaje elegido</span>
      </div>
    `;
  });
});

briefingButton.addEventListener("click", () => {
  const nextLine = selectedCharacter
    ? " Ya has elegido quien asumira la investigacion. Ahora abre el Archivo Elebi cuando quieras revisar las primeras pruebas."
    : " Primero elige quien asumira la investigacion; despues el briefing tendra consecuencias distintas.";

  directorPanel.innerHTML = `
    <p class="eyebrow">Briefing de mision</p>
    <h3>Expediente MND-01</h3>
    <p>${briefingCopy}${nextLine}</p>
    <div class="stat-grid" aria-label="Variables iniciales">
      <span><strong>0</strong> pruebas</span>
      <span><strong>3</strong> rutas</span>
      <span><strong>72h</strong> riesgo</span>
    </div>
  `;
});
