# SDD — Etapa 3: Prompts de Modelado Funcional Detallado

## Proposito del documento

Este archivo consolida todos los prompts utilizados durante la Etapa 3 del proceso SDD.
Su objetivo es permitir reutilizacion, versionado y ejecucion incremental del modelado funcional,
sin decisiones tecnicas ni de implementacion.

---

## Prompt 0 — Contexto base de Etapa 3

Estamos trabajando en un proyecto bajo enfoque SDD.
Nos encontramos en la Etapa 3: Modelado Funcional Detallado.

El sistema:
- Reemplaza Whaticket, OTRS/Znuny y SIHR
- Es de uso interno
- Da soporte a las areas DII, Soporte TI y Procesos
- Posee tipos de trabajo fijos
- Los ciclos de vida son configurables por el rol Admin

Restricciones duras:
- No se permiten saltos de estado
- No se permite retroceso
- El flujo es siempre hacia adelante
- Se permite reasignacion sin cambiar el estado
- No se toman decisiones tecnicas ni de implementacion

Objetivo de la etapa:
Modelar el comportamiento funcional del sistema mediante ciclos de vida.

---

## Prompt 1 — Definicion de estados base transversales

Define un conjunto de estados base transversales aplicables a la mayoria de los tipos de trabajo
en un sistema de gestion interna.

Considera que:
- Existen distintos tipos de trabajo
- No todos requieren los mismos estados
- El baseline debe ser configurable por Admin
- El modelo no debe depender de tecnologia ni UI

Entrega una lista clara de estados y reglas generales.

---

## Prompt 2 — Vision general de ciclos por tipo (alto nivel)

Para los siguientes tipos de trabajo:
- Incidente
- Solicitud de servicio
- Contingencia
- Requerimiento
- Proyecto
- Actividad de procesos

Define la vision general de su ciclo de vida a alto nivel,
mostrando solo la secuencia de estados.

Respeta estrictamente:
- Flujo hacia adelante
- Sin saltos
- Sin retrocesos

---

## Prompt 3 — Template de modelado detallado de ciclo de vida

Modela el ciclo de vida funcional detallado para el tipo de trabajo: <TIPO>.

Incluye:
- Definicion funcional del tipo
- Estados del ciclo
- Descripcion de cada estado
- Transiciones permitidas
- Reglas duras del flujo
- Eventos relevantes
- Relacion con SLA
- Roles con accion por estado

No incluyas:
- UI
- tecnologia
- automatizaciones tecnicas

---

## Prompt 4 — Ciclo de vida Incidente

Modela el ciclo de vida funcional detallado para el tipo de trabajo Incidente.

Considera que:
- Es reactivo
- Tiene multiples SLA
- Requiere resolucion antes del cierre
- Tiene asignacion obligatoria de area y responsable

Utiliza un baseline configurable.

---

## Prompt 5 — Ciclo de vida Solicitud de servicio

Modela el ciclo de vida funcional detallado para el tipo de trabajo Solicitud de servicio.

Considera que:
- Es planificada o semi-planificada
- No requiere estado de resolucion intermedia
- Comparte estructura con Incidente
- El cierre es directo desde ejecucion

Mantente en nivel funcional.

---

## Prompt 6 — Ciclo de vida Contingencia

Modela el ciclo de vida funcional detallado para el tipo de trabajo Contingencia.

Considera que:
- Prioriza imputacion de tiempo
- Puede no tener responsable obligatorio
- Puede originarse desde otros casos
- Los SLA son opcionales

Define un ciclo simple y flexible.

---

## Prompt 7 — Ciclo de vida Requerimiento

Modela el ciclo de vida funcional detallado para el tipo de trabajo Requerimiento.

Considera que:
- Requiere estado obligatorio de Analisis
- No es reactivo
- Puede involucrar decisiones de jefatura
- El estado Analisis no puede omitirse

Define reglas claras de transicion.

---

## Prompt 8 — Ciclo de vida Proyecto

Modela el ciclo de vida funcional detallado para el tipo de trabajo Proyecto.

Considera que:
- Es planificado
- Tiene fases claras
- Permite imputacion prolongada
- No utiliza SLA clasicos

Diferencia claramente inicio, planificacion y ejecucion.

---

## Prompt 9 — Ciclo de vida Actividad de procesos

Modela el ciclo de vida funcional detallado para el tipo de trabajo Actividad de procesos.

Considera que:
- Es propio del Area de Procesos
- No es reactivo
- Prioriza evidencia y trazabilidad
- No requiere SLA obligatorios

Define un ciclo minimo y claro.

---

## Prompt 10 — Consolidacion y cierre de Etapa 3

Revisa el modelo funcional de ciclos de vida definido para todos los tipos de trabajo.

Valida que:
- Todos respetan las reglas duras
- No existen contradicciones entre ciclos
- El baseline es coherente
- La configurabilidad por Admin es viable

Indica si la Etapa 3 puede considerarse completa.
