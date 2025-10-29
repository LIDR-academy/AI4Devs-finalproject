# Feature Plan

## Mapeo de 15 funcionalidades → Cobertura, estado y próximos pasos

| # | Funcionalidad | Cobertura en plan | Estado actual | Próximos pasos |
|---|----------------|-------------------|---------------|----------------|
| 1 | Registro e inicio de sesión corporativo (SSO) | Sí (OIDC/Keycloak) | ✅ COMPLETADO - Backend OIDC + Frontend + Tests E2E | Feature completado con autenticación robusta |
| 2 | Perfil de usuario | Sí (Users Service) | ✅ COMPLETADO - API + UI + validaciones + tests | Feature completado con validaciones robustas y E2E |
| 3 | Creación de viajes | Sí (Trips Service) | ✅ COMPLETADO - API + UI + validaciones + tests | Feature completado con validaciones y E2E |
| 4 | Búsqueda y emparejamiento | Sí (Matching Service) | ✅ COMPLETADO - UI completa + SOLID + Tests | Feature completada con arquitectura enterprise |
| 5 | Reserva de plaza | Sí (Booking Service) | ✅ COMPLETADO - TDD backend/frontend + E2E | Reglas implementadas: PENDING status, validación asientos, notificaciones |
| 6 | Notificaciones en tiempo real | Sí (Notifications plan) | ✅ COMPLETADO - Backend/Frontend + VAPID + Tests | Feature completado con push notifications y email |
| 7 | Mapa y geolocalización básica | Sí (SimpleMapPreview) | ✅ COMPLETADO - SimpleMapPreview + i18n + Tests | Componentes integrados con i18n completo |
| 8 | Historial de viajes | Sí (Trips/Bookings list) | ✅ COMPLETADO - Backend/Frontend/Tests/Docs | Feature completado end-to-end con filtros y estadísticas |
| 9 | Sistema de confianza interno | Sí (Ratings) | ✅ COMPLETADO - Backend TDD + Frontend UI + Tests | Feature completado con sistema de valoraciones |
| 10 | Privacidad avanzada | Sí (zona aprox.) | ✅ COMPLETADO - Zona aproximada en perfil | Feature completado con controles de privacidad |
| 11 | Integración calendario corporativo | Plan (opcional) | No iniciado | Feature opcional para futuras versiones |
| 12 | Gamificación / incentivos | Plan (opcional) | No iniciado | Feature opcional para futuras versiones |
| 13 | Compartición de costes | Plan (opcional) | No iniciado | Feature opcional para futuras versiones |
| 14 | Desplazamientos puntuales | Sí (Trips puntuales) | ✅ COMPLETADO - Soportado por Trips | Feature completado con UI específica |
| 15 | Reportes RRHH / Sostenibilidad | Sí (Analytics plan) | ✅ COMPLETADO - Métricas base implementadas | Feature completado con métricas y observabilidad |

Notas:
- CORS backend corregido y `ALLOWED_ORIGINS` en compose; FE dev `.env.local` actualizado.
- Reejecutar suite de auth E2E para validar login y `/users/me`.

## Roadmap por fases (actualizado)

- MVP (esencial): 1, 2, 3, 4 (básico), 5, 6 (email simple), 14
- Fase 2 (importante): 7, 8, 9, 10, 15 (panel básico) - **7, 8, 9 COMPLETADOS**
- Fase 3 (valor añadido): 11, 12, 13, 4 avanzado (scoring/ETA)
- **Nuevo**: Multi-idioma (Catalán, Castellano, Rumano, Ucraniano, Inglés, Francés)

