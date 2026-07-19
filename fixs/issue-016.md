# Issue 016 — Chatbot general (sin artista) falla al cotizar

**Estado:** ✅ Resuelto  
**Severidad:** Alta  
**Reportado:** 2026-07-18  

## Descripción
Al presionar "Cotizar con IA" desde el Home, el chatbot abre en modo general (sin artista).
Al completar los pasos y pedir cotización, el backend devuelve error porque `ArtistProfileId`
es `Guid.Empty` y no encuentra ningún artista.

## Causa raíz
`QuoteCalculatorService.CalculateAsync()` busca `a.Id == request.ArtistProfileId` — con
`Guid.Empty` no hay match → retorna `ArtistNotFound` → frontend muestra error genérico.

## Solución
Agregado manejo de `Guid.Empty` en `CalculateAsync`: cuando no se especifica artista,
se calcula un promedio de precios entre todos los artistas publicados usando
`CalculateGeneralAsync()`.

## Archivos modificados
- `backend/Domain/Services/QuoteCalculatorService.cs` — Nuevo método `CalculateGeneralAsync`
