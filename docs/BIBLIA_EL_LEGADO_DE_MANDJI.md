# El Legado de Mandji — Biblia de desarrollo vigente

Revisión: 18 de octubre de 2026. Base: fuente de Sites v181, commit 8acaa4673aa7f4c113ccc5ab3a24abf763ef0d6f, publicada el 6 de octubre. Esta revisión sustituye como referencia de implementación al documento del 10 de septiembre, conservado como BIBLIA_HISTORICA_2026-09-10.md. No implica aprobación de una nueva trama.

## Identidad y premisa vigente
Aventura narrativa web de Iniciativas Elebi sobre patrimonio, memoria e investigación de procedencia. Mandji es el nombre de Corisco empleado en el proyecto.

El 25 de junio de 2020, en Malabo, el equipo recibe un encargo reservado del Gobierno: identificar un bastón con remate zoomorfo, investigar su valor y reconstruir las circunstancias de su salida. La atribución a Mandji debe probarse; no es un hecho establecido al comenzar.

La invitación anuncia una subasta privada para el 2 de julio, con un conjunto indivisible de arte africano. El presupuesto operativo del equipo se destina a investigar, no a comprar la colección ni a efectuar el depósito descrito en la ficción.

## Recorrido implementado

### I. La misión
Entrada cinematográfica y sala de reuniones con objetos que se desbloquean progresivamente.
- Dossier: orden reservada, fotografía del catálogo, comunicación cifrada y ficha de inventario.
- Ordenador: contraseña deducida de la víspera de la independencia, en formato DDMMAAAA.
- Fotografía: puzle de nueve piezas y examen de tres grapas en una reparación.
- Biografías de André, Lucía y Christian; elección de líder condicionada por la investigación.
- Preparación: recursos, tres nombres en clave distintos, equipo común y equipo especial.
- Continuación hacia la sala de documentación del capítulo II.
El contador de la escena anuncia diez pistas; no equivale a diez capítulos.

### II. La expedición interrumpida
Sala de documentación con ordenador, pizarra y carpeta.
- Solicitar antecedentes: vía ordinaria (0 € y 12 h) o prioritaria (1.200 € y 3 h).
- Localizar en los expedientes una descripción compatible con el bastón.
- Ordenar cinco comunicaciones sobre la expedición de Corisco y los Elobeyes de 1998.
- Detectar que el oficio de Daniel anuncia un informe adjunto que no está en las copias recibidas.
- Reunión de cierre del equipo y objetivo de localizar a Daniel o sus papeles.
Las tres condiciones de avance son matched, ordered y checked.
Hay contenido opcional de exploración, bonificaciones y penalizaciones; no es necesario para describir la línea principal.

### III. Tras los pasos de Daniel
- Búsqueda de la revista digital Memoria del Litoral en el ordenador.
- Lectura de sus ediciones para localizar la referencia al archivo de Daniel en el patio de Mama Buna, Covadonga, Bata.
- Mapa por sectores y preguntas sobre el alcance real de la dirección.
- Traslado del equipo: 900 € y cuatro horas, previa confirmación dentro del juego.
- Despacho de Daniel: examen de papeles, carpetas, cajón y caja de fotografías.
- Identificar la denuncia por destinatario, firma y contenido; una selección errónea puede consumir una hora, una vez por documento.
- Comparar la fotografía de campo de 1998 (tarjeta COR-98 · 017) con la del catálogo.
- Redactar el informe de visita una vez completadas las dos pruebas.

El cierre afirma expresamente que el siguiente capítulo está pendiente de desarrollo. No hay campaña completa implementada.

## Equipo y recursos
| Líder | Presupuesto inicial | Preparación |
| --- | ---: | ---: |
| André Esono Bibang | 20.000 € | 0 h |
| Lucía Nvé García | 30.000 € | 6 h |
| Christian Dougan Makosso | 45.000 € | 12 h |

Los tres investigadores siguen formando parte del equipo. Las especialidades y objetos se describen en las fichas; no debe darse por implementada toda ventaja futura por aparecer en una biografía.

El plazo inicial es de 168 horas ficticias. Un minuto real activo equivale a 24 minutos de misión. El código suspende el consumo al perder el foco o esconderse la página; determinados trámites y viajes descuentan tiempo adicional. Hay acertijos para recuperar el plazo agotado.

## Guardado
Progreso, recursos y colección se conservan en localStorage del navegador, mediante mandjiStorage. No existe sincronización de partidas entre dispositivos. El modo de repetición usa una copia en sessionStorage para preservar la partida original.

No todo el estado temporal de la sala inicial se serializa: documentos leídos y algunos indicadores están en memoria, mientras correo, puzle, líder y recursos tienen persistencia específica. Se debe probar la recarga a mitad del capítulo.

## Pantallas y servicios complementarios
- Selector de capítulos, disco duro con pistas y mochila.
- Archivo Elebi: pantalla básica de tres tarjetas; pendiente del archivo educativo completo previsto.
- Mapa general: esquema Mandji–Muni–Madrid; independiente del mapa interactivo de Bata.
- Personajes y créditos.
- Administración: configuración de música por capítulo y acertijos mediante Worker y R2 MEDIA. Revisado en código; no se han probado cargas ni cambios de configuración.
- Activos de un avance de Fantasmas de Mikomeseng incluidos en la fuente.

## Continuación pendiente
El capítulo III propone contrastar la denuncia y la fotografía con la documentación de la delegación española y reconstruir la custodia tras la suspensión de 1998. Éste es el punto de partida vigente para diseñar el capítulo IV.

Los diez capítulos y finales de la biblia histórica son una propuesta anterior, no una lista de contenido construido. En particular, sus títulos de capítulos II y III ya no reflejan la publicación.

## Criterios narrativos
Distinguir una coincidencia visual, el testimonio de una persona y una cadena de procedencia acreditada. La denuncia es un testimonio a contrastar, no prueba automática de sus acusaciones. La investigación histórica inicial y su bibliografía permanecen en la biblia histórica; esta revisión no las valida ni convierte los documentos ficcionales del juego en hechos históricos.

## Prioridades
1. Verificar en navegador el recorrido completo I–III y las tres elecciones de líder.
2. Corregir y comprobar reinicio, repetición y persistencia antes de ampliar campaña.
3. Diseñar capítulo IV desde el informe final de Bata.
4. Ampliar Archivo Elebi, fuentes y mapa general según las pistas reales del juego.
5. Desarrollar cadena de custodia, negociación y finales cuando se cierre la estructura narrativa restante.
