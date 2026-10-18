# Estado y revisión — 18 de octubre de 2026

## Recuperación y conservación
- Fuente de Sites v181 recuperada en el espacio de trabajo local.
- Commit de origen comprobado: 8acaa4673aa7f4c113ccc5ab3a24abf763ef0d6f.
- Última publicación comprobada: 6 de octubre de 2026, despliegue succeeded.
- GitHub conservaba una sola entrega del 11 de septiembre; se actualiza site/ desde la fuente recuperada, incluidos sus activos.
- Se excluye dist/ de la copia actual porque es un resultado generado y contiene restos de una versión antigua. Se reconstruye con scripts/build.mjs.
- Se conserva la biblia anterior como documento histórico y se añade la referencia vigente.

## Alcance de la revisión
Inspección del código y de las condiciones de transición de los tres capítulos. En la publicación se comprobaron portada, selector, entrada al capítulo I, sala, apertura del dossier y lectura de comunicación cifrada y ficha de inventario. No se certifica una partida completa I–III ni todas sus rutas.

Las pruebas automatizadas de esta revisión comprueban sintaxis, referencias de archivos HTML locales, gasto de recursos y protección de la partida original durante repetición. Son comprobaciones acotadas; no sustituyen la prueba visual y jugable.

## Hallazgos pendientes de corrección
1. Reinicio incompleto: restartMission en jugar.js elimina el estado del capítulo II y del líder, pero no los estados mandji-scene3-v1, mandji-search3-v1, mandji-cultural-trail-v1, mandji-travel-bata-v1 ni mandji-bata-map-v1. Una partida nueva puede heredar viaje pagado o progreso del tercer capítulo.
2. Repetición del capítulo III: replay-state.js elimina búsqueda, viaje, revista y escena, pero conserva mandji-bata-map-v1. El mapa puede aparecer ya resuelto en la copia de repetición.
3. Recarga del capítulo I: parte del estado inicial está sólo en memoria. Pendiente probar si las pistas persistidas se reconstruyen de forma coherente con los controles de avance.
4. El selector oculta el capítulo II hasta tener líder o estado de escena. Puede dificultar entender la estructura completa desde una partida nueva.
5. Archivo Elebi y mapa general son pantallas básicas y no reflejan todavía el conjunto de pruebas recogidas.
6. Los presupuestos y tiempos de preparación difieren por líder; las ventajas descritas no acreditan por sí solas rutas completas diferenciadas.
7. El capítulo III es el límite de contenido: su cierre declara el siguiente pendiente.

## Matriz de aceptación pendiente
- I: descifrado incorrecto/correcto, puzle, reparación, tres biografías, elección y preparación con cada líder.
- II: las dos vías de solicitud, coste una sola vez, búsqueda de expediente, orden correcto/incorrecto, adjunto ausente y reunión.
- III: búsqueda incorrecta/correcta, revista, mapa, viaje una sola vez, denuncia falsa/correcta, comparación e informe.
- Persistencia: recargar y volver desde menú en cada etapa.
- Recursos: cambiar de pestaña, agotar plazo, resolver acertijo, presupuesto insuficiente.
- Repetición: I, II y III sin alterar originales; luego abandonar y regresar.
- Reinicio: debe limpiar todos los estados de campaña y reconstruir recursos.
- Presentación: escritorio y móvil, documentos largos, teclado y controles de sonido.

No se ha modificado el comportamiento del juego ni publicado una versión nueva durante esta revisión.
