# El Legado de Mandji

Aventura narrativa web de Iniciativas Elebi sobre patrimonio, memoria e investigación de procedencia.

[Prototipo publicado](https://el-legado-de-mandji.eleela289502.chatgpt.site)

## Estado al 18 de octubre de 2026
Fuente recuperada de Sites v181, publicada el 6 de octubre de 2026. Hay tres capítulos implementados:
1. La misión.
2. La expedición interrumpida.
3. Tras los pasos de Daniel.

El cierre de Bata propone investigar la documentación de la delegación española y la custodia de la pieza. El capítulo IV y el resto de la campaña están pendientes.

## Documentación
- [Biblia vigente](docs/BIBLIA_EL_LEGADO_DE_MANDJI.md)
- [Estado, incidencias y pruebas pendientes](docs/ESTADO_DESARROLLO.md)
- [Resultados de las comprobaciones](docs/RESULTADOS_REVISION.json)
- [Biblia histórica del 10 de septiembre](docs/BIBLIA_HISTORICA_2026-09-10.md)

## Fuente y construcción
La fuente actual está en site/. Desde esa carpeta:
```sh
node scripts/build.mjs
```
Genera dist/server/index.js y dist/client/assets para el alojamiento Worker con R2 MEDIA. dist/ no se versiona: las salidas antiguas se sustituyen por una construcción de la fuente vigente. Para configuración y música se necesita el entorno de Sites; un servidor estático no sustituye las API.

Las partidas se guardan en el navegador y no se sincronizan entre dispositivos. La revisión comprobó construcción, referencias locales, gasto de recursos y aislamiento de repetición; no certifica una partida completa por todas las rutas.

La sincronización conserva el historial anterior de GitHub. Fuente de origen en Sites: 8acaa4673aa7f4c113ccc5ab3a24abf763ef0d6f. No se ha publicado una versión nueva del juego durante esta revisión.
