# Work Ticket: ARF-024 — Circuit Breaker para acceso a plataformas externas

| Campo | Valor |
|-------|-------|
| **Tipo** | Backend |
| **Estimación** | 2.5h |
| **Dependencias** | ARF-023 |

**Descripción**: Implementar el patrón Circuit Breaker en el Motor de Agregación para que los fallos de plataformas externas no degraden la experiencia del usuario.

**Criterios de Aceptación**:
- [ ] Si una plataforma falla 3 veces, circuit breaker se abre y marca contenido como `disponible = false` en caché Redis por 30 mins.
- [ ] `GET /obras` retorna obras con campo `disponible = false`.
- [ ] `GET /obras/:id/play-url` retorna 503 con mensaje "Contenido no disponible temporalmente" si la plataforma está abierta.
- [ ] Auto-recuperación (half-open).

**Tareas Técnicas**:
1. Instalar `opossum`.
2. Crear `AggregatorService`.
3. Configurar Redis para el estado del circuit breaker.
4. Agregar campo `disponible` al `ObraResponseDto`.

---
**User Story de referencia (US-3)**: Como Cinéfilo, quiero buscar películas de festivales reconocidos.
