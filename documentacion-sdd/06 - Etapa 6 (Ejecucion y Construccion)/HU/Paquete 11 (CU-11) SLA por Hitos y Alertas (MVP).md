# Etapa 6 — Paquete 11 (CU-11): SLA por Hitos y Alertas (MVP)

## Metadata
- Etapa: 6 — Ejecucion y Construccion (IA-First)
- Paquete: 11
- Caso de uso: CU-11 SLA por Hitos
- Alcance: MVP
- Dependencias: Paquetes 01–05 (casos, estados, mensajes), Paquete 03 (ciclo), Paquete 08 (cierre), eventos canonicos

---

## Caso de Uso — CU-11: Medicion de SLA por Hitos

### Objetivo
Medir y controlar el cumplimiento de **SLA por hitos** (4 hitos estandar), con:
- configuracion por tipo de trabajo
- instancias de SLA por caso
- alertas por vencer e incumplimiento
- **sin** cambiar estados automaticamente

### Hitos estandar (configurables)
1. **Asignacion**: CasoCreado → AreaAsignada/ResponsableAsignado  
2. **Primera respuesta**: CasoCreado → PrimeraAccionRegistrada  
3. **Resolucion**: CasoCreado → Estado=Resuelto  
4. **Cierre**: CasoCreado → Estado=Cerrado

> Regla: no todos los tipos usan todos los hitos. Cada tipo puede activar/desactivar hitos.

### Actores
- Actor primario: Sistema
- Actor secundario: Usuario interno (solo visualiza)

### Disparador
- Eventos canonicos del sistema (CasoCreado, AreaAsignada, PrimeraAccionRegistrada, EstadoCambiado).
- Job de evaluacion periodica (alertas).

### Precondiciones
- Existen configuraciones SLA vigentes por tipo de trabajo.
- Existen eventos canonicos persistidos.

### Flujo principal
1. Al crear un caso, el sistema **instancia** los SLA-hitos activos para el tipo.
2. Cada hito registra:
   - inicio
   - vencimiento (segun configuracion)
3. Al recibir el evento de **fin** del hito:
   - marca hito como cumplido
4. Un job periodico evalua:
   - proximos a vencer → alerta
   - vencidos → incumplido (alerta)
5. No se cambian estados del caso por SLA.

### Postcondiciones
- Hitos con estado: pendiente / cumplido / incumplido.
- Alertas registradas y notificables (canal MVP: interno).

### Reglas / invariantes
- Un hito no se evalua dos veces.
- SLA es informativo; **no gobierna** el ciclo.
- Configuracion versionada.

---

## Historias de Usuario asociadas

### HU-11 — Medir y alertar SLA por hitos (alta prioridad)
Como sistema  
Quiero medir SLA por hitos y alertar incumplimientos  
Para asegurar control operativo y cumplimiento.

#### Criterios de aceptacion (Given/When/Then)
- Given un caso creado con hitos activos
  When ocurre el evento de fin del hito
  Then el hito se marca como cumplido

- Given un hito proximo a vencer
  When el job de evaluacion corre
  Then se registra alerta por vencer

- Given un hito vencido
  When el job corre
  Then se marca como incumplido y se alerta

---

## Tickets de trabajo (<= 4 horas c/u) para HU-11

### T6-065 — Migraciones: sla_config, sla_hito, sla_instancia (Laravel)
**Objetivo:** Persistir configuracion y ejecucion de SLA.  
**Alcance:**
- `sla_config` (por tipo_trabajo, version, vigente)
- `sla_hito` (por config: nombre, evento_inicio, evento_fin, minutos_objetivo, activo)
- `sla_instancia` (por caso+hito: inicio, vence, fin, estado)
**Criterios de aceptacion:**
- migraciones aplican sin errores
**Pruebas minimas:**
- migrate:fresh

---

### T6-066 — Seed SLA baseline por tipo de trabajo (Laravel)
**Objetivo:** Cargar configuracion SLA estandar (4 hitos) por tipo.  
**Alcance:**
- activar/desactivar hitos segun tipo
- tiempos objetivo iniciales (configurables)
**Criterios de aceptacion:**
- existe SLA vigente por tipo
**Pruebas minimas:**
- seed + query verificacion

---

### T6-067 — Instanciacion de SLA al crear caso (Laravel)
**Objetivo:** Crear instancias SLA-hito por caso.  
**Alcance:**
- listener de `CasoCreado`
- crear `sla_instancia` para hitos activos
**Criterios de aceptacion:**
- crear caso -> crea instancias SLA
**Pruebas minimas:**
- feature test

---

### T6-068 — Consumo de eventos para cerrar hitos (Laravel)
**Objetivo:** Marcar hitos como cumplidos segun eventos.  
**Alcance:**
- listeners:
  - AreaAsignada / ResponsableAsignado → cierra hito Asignacion
  - PrimeraAccionRegistrada → cierra hito Primera respuesta
  - EstadoCambiado=Resuelto → cierra hito Resolucion
  - EstadoCambiado=Cerrado → cierra hito Cierre
**Criterios de aceptacion:**
- evento correcto cierra hito correcto
**Pruebas minimas:**
- feature tests por evento

---

### T6-069 — Job de evaluacion SLA (Laravel)
**Objetivo:** Detectar proximos a vencer e incumplidos.  
**Alcance:**
- job programado
- thresholds configurables (ej: 80% del tiempo)
- registra estado y alerta
**Criterios de aceptacion:**
- marca estados correctamente
**Pruebas minimas:**
- test con fechas simuladas

---

### T6-070 — Alertas SLA (persistencia y evento) (Laravel)
**Objetivo:** Registrar alertas SLA.  
**Alcance:**
- tabla `sla_alerta`
- eventos:
  - SLAProximoAVencer
  - SLAIncumplido
**Criterios de aceptacion:**
- alertas persistidas
**Pruebas minimas:**
- feature test

---

### T6-071 — Endpoint GET /api/casos/{id}/sla (Laravel)
**Objetivo:** Consultar estado SLA de un caso.  
**Alcance:**
- lista hitos con estado y tiempos
**Criterios de aceptacion:**
- UI puede mostrar SLA del caso
**Pruebas minimas:**
- feature test

---

### T6-072 — UI Angular: visualizacion SLA por caso (Angular)
**Objetivo:** Mostrar hitos SLA en detalle del caso.  
**Alcance:**
- semaforos por hito (ok / por vencer / incumplido)
**Criterios de aceptacion:**
- datos visibles y actualizados
**Pruebas minimas:**
- prueba manual

---

## Priorizacion del paquete (orden recomendado)
1) T6-065 (tablas SLA)  
2) T6-066 (seed)  
3) T6-067 (instanciacion)  
4) T6-068 (consumo eventos)  
5) T6-069 (job evaluacion)  
6) T6-070 (alertas)  
7) T6-071 (API)  
8) T6-072 (UI)

---

## Nota de alcance MVP
- Alertas solo internas (UI/log).
- Notificaciones externas pueden agregarse despues.
- SLA no cambia estados automaticamente.

---

## Listo para Cursor + spec-kit (cuando corresponda)
- En Cursor, trabajar primero modelo+instanciacion.
- Usar eventos existentes; no duplicar logica en controladores.
