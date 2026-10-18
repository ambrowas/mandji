# Prueba de guardado y recorrido — 18 de octubre de 2026

## Correcciones
- Reinicio total: ahora borra búsqueda de Daniel, revista, mapa de Bata, viaje, despacho y exposición, además del estado anterior de campaña. Conserva las preferencias de sonido.
- Repetición: el mapa de Bata se limpia al repetir III y al repetir II, que también reinicia el progreso posterior. La partida original permanece aislada.

## Prueba completa en navegador integrado
Partida local nueva; recorrido principal con André, presupuesto inicial de 20.000 €. Se usaron los controles de juego, sin introducir progreso artificial.
1. I: dossier completo, contraseña del correo, puzle de nueve piezas, reparación de tres grapas, tres biografías, elección de André, nombres en clave, informe y briefing de transición.
2. II: consulta ordinaria (0 € / 12 h), expediente EXP-98/037, registro 017 (verificación de 2 h), cronología de cinco fragmentos, oficio con informe ausente y reunión de cierre.
3. III: buscador, revista Memoria del Litoral n.º 07, dirección del patio de Mama Buna, tres etapas del mapa, viaje (900 € / 4 h), denuncia identificada con dos indicios, comparación con tres observaciones e informe final.
Resultado: capítulo III muestra «Investigación completada» y 2/2 pruebas. Presupuesto final 19.100 €. El selector mantiene II y III completados.
4. Repetición III: vuelve a comenzar en el buscador y el mapa presenta «1 · Encuentra Covadonga»; no hereda el mapa resuelto. Al salir, las pistas originales —incluidas denuncia, comparación e informe— siguen disponibles.
5. Recarga: al abrir de nuevo el capítulo I, líder y presupuesto de la partida completada siguen disponibles.
6. Reinicio real desde el botón: vuelve a 168 h, 0/10 pistas, dos pausas y sin líder. El selector vuelve a mostrar III bloqueado y no ofrece II como disponible.

## Comprobaciones automatizadas
scripts/check-save-state.mjs pasa: cancelar reinicio conserva datos; confirmar elimina toda la campaña; mantiene preferencias y datos ajenos; repetición II/III limpia mapa y progreso posterior, conserva recursos y no modifica el original; salir restaura el almacenamiento original.

## Alcance
Se comprobó el recorrido principal completo con André. No equivale a probar todas las rutas opcionales, todos los acertijos, la administración de música o los otros dos líderes. El capítulo IV sigue pendiente.
