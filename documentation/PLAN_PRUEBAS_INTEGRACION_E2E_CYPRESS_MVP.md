# Plan de Pruebas de Integracion y E2E con Cypress - MVP CitaYa

## 1. Objetivo

Implementar y ejecutar una suite automatizada con Cypress que cubra el 100% del MVP (HU1..HU12), validando flujos criticos entre frontend, backend y base de datos, con ejecucion en entorno local (`local_dev`) y estrategia de stubs para servicios externos.

## 2. Alcance

- Incluye:
  - Pruebas E2E UI (Next.js) para HU1..HU12.
  - Validaciones de integracion de contratos API ya existentes (Jest/Supertest backend) y trazabilidad hacia E2E.
  - Casos felices + casos negativos criticos de negocio por HU.
- Excluye:
  - Web Push notifications (fuera de MVP segun `documentation/MVP_SCOPE.md`).

## 3. Supuestos de ejecucion

- Entorno local con frontend y backend disponibles.
- Idioma principal de ejecucion: `es`.
- Viewport principal: desktop.
- Integraciones externas (Google Maps, reCAPTCHA, SendGrid) tratadas con stubs/mocks para evitar dependencia de red externa.

## 4. Estrategia de datos (hibrida)

- Reusar datos base del entorno local cuando existan (especialidades, usuarios semilla).
- Crear datos dinamicos por test con identificadores unicos (email y nombres con timestamp).
- Limpieza selectiva por flujo para minimizar estado compartido.
- Evitar dependencia entre specs: cada HU prepara sus precondiciones minimas.

## 5. Estrategia de automatizacion

- Herramienta E2E: Cypress.
- Estructura:
  - `frontend/cypress/e2e/hu*.cy.ts`
  - `frontend/cypress/support/{e2e.ts,commands.ts}`
  - `frontend/cypress/fixtures/*`
- Selectores estables:
  - Uso de `data-testid` en controles criticos de formularios, listados y acciones.
- Politica anti-flake:
  - `cy.intercept` en llamadas clave.
  - Esperas por condiciones (UI y request aliases), no por tiempos fijos.
  - Stubs centralizados para servicios externos.

## 6. Matriz de cobertura MVP (HU -> pruebas propuestas)

### HU1 Registro de Paciente
- E2E-01: registro exitoso con email unico.
- E2E-02: error por email duplicado (409).

### HU2 Registro de Medico
- E2E-01: registro exitoso de medico con datos profesionales.
- E2E-02: validacion de campos requeridos.

### HU3 Busqueda de Medicos
- E2E-01: busqueda desde home (banner) y redireccion a `/search`.
- E2E-02: busqueda por especialidad + geolocalizacion.
- E2E-03: fallback backend a codigo postal cuando no hay resultados por coordenadas.
- E2E-04: estado inicial de `/search` muestra ultimos 5 medicos.

### HU4 Reserva de Cita
- E2E-01: seleccion de slot y confirmacion exitosa.
- E2E-02: manejo de conflicto de slot no disponible.

### HU5 Reprogramacion y Cancelacion
- E2E-01: cancelar cita desde listado.
- E2E-02: reprogramar cita a nuevo slot disponible.

### HU6 Gestion de Perfil Medico
- E2E-01: edicion de perfil y persistencia.
- E2E-02: validacion de campos obligatorios.

### HU7 Carga de Documentos
- E2E-01: carga de documento valido.
- E2E-02: rechazo de extension invalida.

### HU8 Gestion de Horarios
- E2E-01: creacion de horario.
- E2E-02: validacion de fin mayor a inicio.

### HU9 Creacion de Resena
- E2E-01: crear resena con rating y comentario validos.
- E2E-02: validacion de longitud minima del comentario.

### HU10 Dashboard Administrativo
- E2E-01: visualizacion de metricas y tablas.
- E2E-02: accion de aprobar/rechazar en moderacion/verificacion.

### HU11 Confirmacion de Cita por Medico
- E2E-01: doctor confirma cita pendiente propia y se actualiza listado.
- E2E-02: intento de confirmar cita no pendiente retorna error controlado.

### HU12 Cancelacion de Cita por Medico
- E2E-01: doctor cancela cita `pending` o `confirmed` y se libera slot.
- E2E-02: intento de cancelar cita no propia/no permitida retorna error controlado.

## 7. Criterios de entrada y salida

### Entrada
- Frontend y backend levantados.
- Variables de entorno minimas configuradas.
- Cypress instalado y configurado.

### Salida
- 10/10 HUs con al menos un flujo E2E automatizado.
- Casos negativos criticos implementados por HU.
- Sin fallos de lint/typecheck introducidos por los cambios.

## 8. Riesgos y mitigaciones

- Rate limiting en registro:
  - Mitigacion: emails unicos por ejecucion.
- Estado compartido en entorno local:
  - Mitigacion: setup de datos por test y limpieza selectiva.
- Dependencia de APIs externas:
  - Mitigacion: stubs globales para Maps/reCAPTCHA/Email.
- Flakiness por asincronia:
  - Mitigacion: intercepts, asserts de estado y selectores estables.

## 9. Ejecucion

Desde `frontend/`:

- `npm run test:e2e` para corrida headless.
- `npm run test:e2e:open` para modo interactivo.

## 10. Evidencia y trazabilidad

- Cada spec se nombra por HU (`hu1-...`, `hu2-...`, ... `hu12-...`).
- Evidencia de ejecucion por Cypress (screenshots/videos cuando aplique).
- Trazabilidad mantenida en este documento y en los archivos de prueba por HU.

## 11. Checklist de regresion MVP (HU1..HU12)

Usar este checklist antes de cada release beta.  
Estado sugerido: marcar `[x]` cuando el caso pase en `es` y `[ ]` cuando falle o quede pendiente.

### HU1 Registro de Paciente
- [ ] Registro exitoso con email unico.
- [ ] Error por email duplicado (409).
- [ ] Validaciones de campos requeridos y formato.

### HU2 Registro de Medico
- [ ] Registro exitoso con direccion y codigo postal.
- [ ] Flujo con geocodificacion fallida muestra advertencia sin bloquear.
- [ ] Estado pendiente de verificacion visible tras registro.

### HU3 Busqueda de Medicos
- [ ] Busqueda por especialidad + codigo postal.
- [ ] Busqueda por geolocalizacion + radio.
- [ ] Lista y mapa renderizan resultados consistentes.

### HU4 Reserva de Cita
- [ ] Seleccion de fecha/slot y confirmacion de cita.
- [ ] Manejo de slot no disponible/conflicto.
- [ ] Formulario de confirmacion muestra validaciones basicas.

### HU5 Reprogramacion y Cancelacion
- [ ] Cancelar cita activa con motivo opcional.
- [ ] Reprogramar cita a slot disponible del mismo medico.
- [ ] Citas no modificables (completed/cancelled) respetan restricciones.

### HU6 Gestion de Perfil Medico
- [ ] Carga y edicion de perfil del medico.
- [ ] Validaciones de telefono, bio, direccion y codigo postal.
- [ ] Mensajes de exito/advertencia/error visibles.

### HU7 Carga de Documentos
- [ ] Carga de documento valido (pdf/jpg/png) menor a 10MB.
- [ ] Rechazo por extension o tamano invalido.
- [ ] Estado de documentos listado correctamente.

### HU8 Gestion de Horarios
- [ ] Crear horario valido.
- [ ] Editar horario existente.
- [ ] Manejo de error por solapamiento.

### HU9 Resenas
- [ ] Crear resena valida (rating 1..5 + comentario >=10).
- [ ] Error por cita no elegible o resena duplicada.
- [ ] Estado pendiente de moderacion visible.

### HU10 Dashboard Administrativo
- [ ] Carga de metricas, graficas y tablas.
- [ ] Aprobar/rechazar medico con modal de confirmacion.
- [ ] Aprobar/rechazar resena con modal de confirmacion.

### HU11 Confirmacion de Cita por Medico
- [ ] Doctor confirma cita pendiente propia.
- [ ] Cita cambia de `pending` a `confirmed` sin recarga manual.
- [ ] Mensajes de exito/error mostrados correctamente.

### HU12 Cancelacion de Cita por Medico
- [ ] Doctor cancela cita `pending`/`confirmed`.
- [ ] Slot asociado se libera tras cancelacion.
- [ ] Mensajes de exito/error mostrados correctamente.

### Accesibilidad y responsive (transversal)
- [ ] Navegacion por teclado en formularios y modales principales.
- [ ] Focus visible en acciones y campos interactivos.
- [ ] Layout usable en mobile (320px+), tablet y desktop.

### Regresion visual minima
- [ ] Home.
- [ ] Search resultados.
- [ ] Reserva (confirmacion de cita).
- [ ] Dashboard admin.
