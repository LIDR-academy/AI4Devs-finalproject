# Issue-009: Botón "Cotizar con IA" del Home redirige a artista en vez de chatbot general

**Fecha:** 2026-07-18  
**Contexto:** El botón "Cotiza en segundos con nuestro agente de IA" en el Home navega al perfil de un artista específico con `?cotizar=1`. Debería abrir un chatbot general que no requiera un artista predefinido.  
**Estado:** 🔧 En progreso

---

## Problema

- El botón del Home redirige a la ruta de un artista concreto con el parámetro `?cotizar=1`
- El chatbot de cotización actualmente asume que ya existe un artista seleccionado
- No existe flujo de cotización general sin artista previo

## Comportamiento esperado

- El botón "Cotiza en segundos con nuestro agente de IA" debe abrir un chatbot general
- El chatbot debe preguntar al usuario:
  - Ubicación (cerca de mí + radio en KM)
  - Estilo de tatuaje deseado
  - Demás datos relevantes para la cotización
- No debe requerir un artista predefinido para iniciar el flujo

## Solución

1. Cambiar el `href`/`onClick` del botón en el Home para que no apunte a un artista específico
2. Crear (o reutilizar) un componente de chatbot general de cotización
3. Implementar pasos de conversación: ubicación → estilo → tamaño → presupuesto
4. Al finalizar, sugerir artistas cercanos que coincidan con los criterios ingresados

## Archivos a modificar

- `frontend/src/pages/Home.tsx` (o componente equivalente del botón)
- `frontend/src/components/ChatBot/` — adaptar para flujo sin artista predefinido
- Posible: rutas del router para el chatbot general

## Relacionado

- Issue-007 (chatbot de cotización por artista)
