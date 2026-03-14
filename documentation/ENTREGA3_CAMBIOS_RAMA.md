# Entrega 3 - Cambios Consolidados de Rama

## Objetivo
Consolidar los cambios funcionales y técnicos implementados en la rama `feature-entrega3-leas`, con trazabilidad por HU y registro explícito de decisiones de negocio y limitaciones actuales.

## Comportamientos implementados en esta rama

### HU1/HU2 (Auth y Registro)
- Ajustes en formularios de registro de paciente y médico.
- Refuerzo de mensajes de error/validación y experiencia i18n ES/EN.
- Mejoras en hooks de autenticación y página de login.

### HU3 (Búsqueda y Descubrimiento)
- Home con formulario de búsqueda embebido en el hero y CTA "Soy médico" preservado.
- Geolocalización automática al cargar home y `/search`.
- Validación de búsqueda: requiere especialidad + (`lat/lng` o `postalCode`).
- Fallback backend: si geolocalización no retorna resultados y existe `postalCode`, reintenta por código postal.
- Estado inicial de `/search`: muestra los 5 últimos médicos aprobados.
- Endpoint nuevo `GET /api/v1/doctors/latest`.
- Homologación visual del formulario entre home y `/search`.

### HU4/HU5 (Citas Paciente)
- Ajustes en flujo de reserva/reprogramación/cancelación con cambios en modales y selector de slots.
- Endurecimiento de reglas transaccionales y validaciones de estado.
- Actualización de pruebas de integración de reprogramación/cancelación.

### HU6 (Perfil Médico)
- Mejoras en gestión de perfil de médico y validaciones de formulario.
- Ajustes de UX y mensajes en edición de perfil.

### HU7 (Verificación de Documentos)
- Endurecimiento de upload: control de tamaño, mime type canónico y escaneo de malware.
- Ajustes de almacenamiento seguro de archivos y permisos.
- Mejoras en respuesta de errores (`FILE_TOO_LARGE`, validaciones multipart).
- Pruebas de integración de upload actualizadas.

### HU8 (Horarios de Trabajo)
- Ajustes en formulario y página de horarios de médico.
- Mejoras de UX en creación/edición de horarios.

### HU9 (Reseñas)
- Ajustes en formulario de reseña, hook y consumo API.
- Mejoras de mensajes y validaciones de interacción.

### HU10 (Dashboard Administrativo)
- Evolución de dashboard y tablas de verificación/moderación.
- Mejoras en métricas y componentes visuales.
- Ajustes backend en servicios de verificación y métricas administrativas.

### HU11/HU12 (Operación Clínica por Médico)
- Implementación end-to-end de confirmación y cancelación de cita por médico.
- Reglas de ownership, estados permitidos y auditoría dedicadas.
- Cobertura de pruebas de integración extendida.

### QA/E2E transversal
- Configuración de Cypress (`cypress.config.ts`) y scripts npm de ejecución.
- Implementación de specs E2E por HU (HU1..HU10) y soporte compartido.
- Plan de pruebas MVP actualizado con checklist de regresión.

## Decisiones de negocio tomadas
- Mantener búsqueda como flujo principal desde home para reducir fricción de entrada.
- Preservar captación médica con CTA "Soy médico" siempre visible en hero.
- Priorizar geolocalización cuando exista, pero sostener fallback por código postal para resiliencia.
- Mostrar últimos 5 médicos aprobados en `/search` sin filtros para mejorar descubrimiento inicial.
- Restringir confirmación/cancelación por médico únicamente a citas propias y estados válidos.
- Mantener Web Push fuera de alcance MVP; notificaciones principales vía email.

## Limitaciones actuales
- Geolocalización depende de permisos del navegador y no puede garantizarse en todos los dispositivos.
- El fallback por código postal requiere que el cliente envíe `postalCode`.
- El endpoint `latest` no aplica ranking clínico avanzado ni personalización por paciente.
- Persisten diferencias de cobertura E2E entre HUs operativas nuevas (HU11/HU12) y HUs base.
- No existe aún señal explícita en respuesta API que indique cuándo se aplicó fallback por código postal.

## Trazabilidad de documentación actualizada
- `documentation/HISTORIAS_USUARIO.md`
- `documentation/TICKETS_INDEX.md`
- `documentation/MVP_SCOPE.md`
- `documentation/PLAN_PRUEBAS_INTEGRACION_E2E_CYPRESS_MVP.md`
- `documentation/HU3/*` (incluye tickets incrementales `HU3-*-002`)
- `documentation/HU11/*`
- `documentation/HU12/*`
