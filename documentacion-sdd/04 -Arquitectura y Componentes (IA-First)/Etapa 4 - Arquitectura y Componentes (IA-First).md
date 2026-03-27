# SDD — Etapa 4: Arquitectura y Componentes (IA-First)

## Estado del documento

Etapa: 4 — Arquitectura y Componentes  
Estado: COMPLETA  
Avance estimado Etapa 4: 100%

---

## 1. Proposito de la Etapa 4

La Etapa 4 traduce el modelo funcional definido en la Etapa 3 en una arquitectura logica de componentes,
preparada para ser consumida por agentes IA (Cursor + spec-kit), manteniendo independencia tecnologica.

En esta etapa **no se define tecnologia**, pero se deja el sistema completamente preparado para pasar a
diseno e implementacion.

---

## 2. Principios IA-First

- responsabilidades explicitas (sin supuestos)
- comunicacion basada en eventos
- configurabilidad declarada y acotada
- invariantes protegidos (no negociables)
- trazabilidad obligatoria (historial inmutable a nivel logico)
- definiciones comprensibles sin contexto externo

---

## 3. Boundaries del sistema

### 3.1 Case Management

Responsabilidad:
- creacion del Caso como entidad central
- identificacion unica
- tipo de trabajo y subtipo
- metadatos basicos del Caso

Invariantes:
- todo trabajo existe como Caso
- no existen entidades paralelas fuera del Caso

---

### 3.2 Lifecycle Engine

Responsabilidad:
- gestion de estados y transiciones
- validacion de reglas duras (sin saltos, sin retrocesos)
- registro del historial de estados

Invariantes:
- un Caso siempre tiene un estado valido
- una transicion invalida nunca se ejecuta

---

### 3.3 Assignment Management

Responsabilidad:
- asignacion de area responsable
- asignacion de responsables y participantes
- reasignaciones sin cambiar estado
- historial de asignaciones

Invariantes:
- reasignar no cambia el estado
- toda reasignacion queda registrada

---

### 3.4 SLA & Metrics Engine

Responsabilidad:
- medicion de SLA y metricas
- inicio y detencion de mediciones por eventos
- emision de alertas (sin controlar flujo)

Invariantes:
- SLA y metricas no alteran el comportamiento del Caso

---

### 3.5 Time Tracking

Responsabilidad:
- registro de imputacion de tiempo
- asociacion a Caso, usuario y area
- consolidacion de esfuerzo

Invariantes:
- imputar tiempo no cambia estados

---

### 3.6 Evidence & Audit

Responsabilidad:
- historial de estados
- historial de asignaciones
- registro de acciones relevantes
- evidencia asociada a Casos

Invariantes:
- historial inmutable a nivel logico

---

### 3.7 Configuration (Admin)

Responsabilidad:
- configuracion de ciclos de vida
- configuracion de estados y transiciones
- configuracion de SLA y alertas
- catalogos (subtipos, reglas)

Invariantes:
- cambios no reescriben historicos

---

### 3.8 Communication & Notifications

Responsabilidad:
- comunicaciones asociadas al Caso
- mensajes al solicitante
- notas internas
- notificaciones por eventos

Invariantes:
- las notificaciones no controlan el flujo del Caso

---

## 4. Componentes funcionales

### 4.1 Gestor de Casos
- crea Casos
- mantiene datos base
- emite CasoCreado y CasoActualizado

---

### 4.2 Motor de Ciclo de Vida
- valida y ejecuta transiciones
- emite EstadoCambiado
- rechaza transiciones invalidas (auditable)

---

### 4.3 Gestor de Asignaciones
- asigna area y responsables
- permite reasignacion sin cambio de estado
- emite AreaAsignada y ResponsableAsignado

---

### 4.4 Motor de SLA y Metricas
- mide tiempos y SLA
- emite SLAProximoAVencer y SLAIncumplido
- consolida metricas

---

### 4.5 Imputacion de Tiempo
- registra imputaciones
- emite TiempoImputado

---

### 4.6 Evidencia y Auditoria
- registra evidencia
- registra acciones relevantes
- garantiza trazabilidad

---

### 4.7 Configuracion Administrativa
- administra configuraciones
- versiona reglas
- emite ConfiguracionActualizada

---

### 4.8 Comunicacion y Notificaciones
- registra mensajes
- envia notificaciones
- emite MensajeRegistrado

---

## 5. Catalogo canonico de eventos

- CasoCreado
- AreaAsignada
- ResponsableAsignado
- EstadoCambiado
- PrimeraAccionRegistrada
- TiempoImputado
- MensajeRegistrado
- SLAProximoAVencer
- SLAIncumplido
- CasoCerrado
- ConfiguracionActualizada

---

## 6. Definiciones funcionales clave

### 6.1 PrimeraAccionRegistrada

Se considera primera accion efectiva la primera ocurrencia de cualquiera de las siguientes:
- nota interna
- mensaje al solicitante
- imputacion de tiempo
- cambio de estado
- evidencia adjunta

Se emite un solo evento por Caso.

---

### 6.2 Alertas SLA

- alertas por proximo a vencer
- alertas por SLA incumplido
- umbrales configurables por Admin

Las alertas no cambian estados ni bloquean acciones.

---

### 6.3 Cierre automatico por inactividad

Regla:
- si no hay respuesta del usuario durante 14 dias consecutivos
- y el estado es elegible
- se ejecuta cierre automatico

Configurabilidad:
- plazo en dias configurable
- estados elegibles configurables

Se registra CasoCerrado con motivo_cierre = automatico.

---

## 7. Configurable vs Invariante

### Configurable por Admin
- ciclos de vida
- estados y transiciones
- SLA y umbrales
- reglas de cierre automatico
- subtipos y catalogos

### Invariantes
- Caso como entidad unica
- sin saltos ni retrocesos
- reasignacion no cambia estado
- trazabilidad obligatoria
- separacion de responsabilidades

---

## 8. Diagrama logico (Mermaid)

```mermaid
flowchart TD
  A[Gestor de Casos] -->|CasoCreado| B[Motor de Ciclo de Vida]
  A -->|CasoCreado| C[Motor SLA y Metricas]
  A -->|CasoCreado| D[Evidencia y Auditoria]
  A -->|CasoCreado| E[Comunicacion y Notificaciones]

  F[Gestor de Asignaciones] -->|AreaAsignada / ResponsableAsignado| C
  F -->|AreaAsignada / ResponsableAsignado| D
  F -->|AreaAsignada / ResponsableAsignado| E

  B -->|EstadoCambiado| C
  B -->|EstadoCambiado| D
  B -->|EstadoCambiado| E

  G[Imputacion de Tiempo] -->|TiempoImputado| C
  G -->|TiempoImputado| D

  E -->|MensajeRegistrado| D
  E -->|MensajeRegistrado| H[Motor de Cierre Automatico]
  H -->|CasoCerrado| B

  C -->|SLAProximoAVencer / SLAIncumplido| E

  I[Configuracion Administrativa] -->|ConfiguracionActualizada| B
  I -->|ConfiguracionActualizada| C
  I -->|ConfiguracionActualizada| E
