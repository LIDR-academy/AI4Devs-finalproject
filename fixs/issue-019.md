# Issue 019 — Botón "Reservar" en chatbot general sin destino

**Estado:** ✅ Resuelto (parcial — botón oculto)  
**Severidad:** Baja  
**Reportado:** 2026-07-18  

## Descripción
Al completar una cotización general (sin artista) desde el Home, el chatbot muestra
"¿Quieres reservar?" con un botón que no tiene destino útil, ya que no hay artista
seleccionado para redirigir.

## Solución aplicada
Ocultar el botón "Reservar" cuando el chatbot está en modo general (sin artista).

## Mejora futura
Cuando se implemente, considerar:
- Redirigir a `/artistas` con los filtros de la cotización (estilo, comuna)
- O mostrar artistas sugeridos dentro del chatbot según el estilo cotizado

## Archivos modificados
- `frontend/src/app/features/quote-chatbot/quote-chatbot.component.html`
