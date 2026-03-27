# Etapa 6 — Paquete 08 (CU-08) Cierre Automatico por Inactividad (MVP)

## Metadata
- Etapa 6 — Ejecucion y Construccion (IA-First)
- Paquete 08
- Caso de uso CU-08 Cierre Automatico por Inactividad
- Alcance MVP
- Dependencias Paquetes 01–05 (casos, estados, mensajes) + motor de ciclo (Paquete 03)

---

## Caso de Uso — CU-08 Cierre Automatico por Inactividad

### Objetivo
Cerrar automaticamente los casos abiertos cuando el solicitante no responde dentro de un plazo definido (14 dias), asegurando
- no reapertura de casos cerrados
- trazabilidad (historial + evento)
- disparo de encuesta al cierre (se implementa en Paquete 09)

### Actores
- Actor primario Sistema (job programado)
- Actor secundario Usuario interno (solo para consulta posterior)

### Disparador
Ejecucion periodica de un proceso automatico (jobcron).

### Precondiciones
- Caso existe y NO esta cerrado.
- Existe al menos una comunicacion previa (mensaje) o el caso fue creado.
- Parametro de inactividad configurado (14 dias, configurable).

### Definicion de inactividad (MVP)
Se considera inactividad del solicitante cuando
- NO existe ningun mensaje entrante del solicitante
- desde la ultima comunicacion del sistema o agente
- por un periodo = 14 dias

 Nota MVP
 - En esta etapa, como aun no existe integracion de correo entrante, la inactividad se calcula sobre
   - fecha de creacion del caso
   - yo fecha del ultimo mensaje registrado (UI)
 - En paquetes posteriores, se incorporan mensajes entrantes por correoWhatsApp.

### Flujo principal
1. Job programado se ejecuta (ej 1 vez al dia).
2. Sistema busca casos elegibles
   - estado != Cerrado
   - fecha_ultima_actividad + 14 dias = hoy
3. Para cada caso elegible
   - valida que el estado actual permite cierre
   - ejecuta transicion a estado Cerrado usando el motor de ciclo
4. Sistema
   - registra historial de estado
   - emite evento `CasoCerrado` con motivo = automatico
5. (Paquete 09) Se dispara encuesta post-cierre.

### Postcondiciones
- Caso queda cerrado.
- Caso NO puede reabrirse.
- Existe trazabilidad completa del cierre automatico.

### Reglas  invariantes relevantes
- Un caso cerrado nunca se reabre.
- El cierre automatico usa el MISMO motor de ciclo que el cierre manual.
- No se cierran casos ya cerrados.

### Excepciones
- Caso no tiene transicion valida a Cerrado - se omite y se registra advertencia (log).
- Error en un caso NO debe detener el cierre de otros.

---

## Historias de Usuario asociadas

### HU-08 — Cierre automatico por inactividad (alta prioridad)
Como sistema  
Quiero cerrar automaticamente casos inactivos  
Para mantener la bandeja limpia y cumplir reglas operativas.

#### Criterios de aceptacion (GivenWhenThen)
- Given un caso abierto sin actividad por 14 dias
  When se ejecuta el job
  Then el caso cambia a Cerrado y se registra evento CasoCerrado (automatico)

- Given un caso cerrado
  When se ejecuta el job
  Then el caso no se modifica

- Given un caso abierto con actividad reciente
  When se ejecuta el job
  Then el caso no se cierra

---

## Tickets de trabajo (= 4 horas cu) para HU-08

### T6-046 — Campo de control de actividad en Caso (Laravel)
Objetivo Tener una referencia clara de la ultima actividad relevante.  
Alcance
- agregar campo `fecha_ultima_actividad` (datetime, nullable) en `caso`
- actualizar este campo cuando
  - se crea el caso
  - se registra un mensaje (Paquete 05)
Criterios de aceptacion
- el campo se setea al crear caso
- el campo se actualiza al registrar mensaje
Pruebas minimas
- unitfeature test de actualizacion

---

### T6-047 — Job de cierre automatico (Laravel)
Objetivo Implementar job programado que cierre casos inactivos.  
Alcance
- comandojob (ej `CerrarCasosInactivos`)
- parametro de dias inactividad (configurable, default 14)
- procesamiento por lotes (chunk)
- manejo de errores por caso (no aborta todo)
Criterios de aceptacion
- cierra solo casos elegibles
- no falla si un caso no puede cerrarse
Pruebas minimas
- test del job con fechas simuladas

---

### T6-048 — Uso del motor de ciclo para cierre automatico (Laravel)
Objetivo Asegurar que el cierre automatico respeta el ciclo de vida.  
Alcance
- el job NO hace update directo
- siempre invoca el servicio de transiciones
- motivo de cierre = automatico
Criterios de aceptacion
- cierre genera historial y evento
Pruebas minimas
- feature test job - EstadoCambiadoCasoCerrado

---

### T6-049 — Evento CasoCerrado (motivo automatico) (Laravel)
Objetivo Emitir evento canonico al cerrar automaticamente.  
Alcance
- payload incluye
  - caso_id
  - codigo_caso
  - motivo = automatico
  - fecha_cierre
Criterios de aceptacion
- evento se registra en `evento_log`
Pruebas minimas
- feature test verificando evento

---

### T6-050 — Configuracion de parametro de inactividad (Laravel)
Objetivo Permitir cambiar dias de inactividad sin tocar codigo.  
Alcance
- configparametro (ej tabla `configuracion` o config file)
- default 14 dias
Criterios de aceptacion
- el job usa el valor configurado
Pruebas minimas
- test de lectura de configuracion

---

## Priorizacion del paquete (orden recomendado)
1) T6-046 (fecha_ultima_actividad)  
2) T6-047 (job cierre)  
3) T6-048 (usar motor)  
4) T6-049 (evento)  
5) T6-050 (configuracion)

---

## Nota de alcance MVP
- Este paquete NO envia comunicaciones al solicitante.
- El envio de encuesta se aborda en el paquete siguiente.
- La definicion de inactividad se ampliara cuando exista correoWhatsApp entrante.

---

## Listo para Cursor + spec-kit (cuando corresponda)
- Pedir implementacion defensiva del job.
- Asegurar que el job sea idempotente (ejecutar dos veces no cambia nada).
