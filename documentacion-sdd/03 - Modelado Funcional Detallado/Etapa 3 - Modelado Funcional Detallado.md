# SDD — Etapa 3: Modelado Funcional Detallado

## Estado del documento

Etapa: 3 — Modelado Funcional Detallado  
Estado: COMPLETA  
Avance estimado Etapa 3: 100%

---

## 1. Proposito de la Etapa 3

La Etapa 3 tiene como objetivo modelar el comportamiento funcional del sistema, sin tomar decisiones tecnicas ni de implementacion.

En esta etapa se define:

- el comportamiento funcional de cada tipo de trabajo
- los estados que componen sus ciclos de vida
- las transiciones permitidas
- los eventos que disparan reglas, SLA y metricas
- las reglas duras de secuencia y trazabilidad

---

## 2. Enfoque adoptado

Enfoque B: modelar todos los ciclos de vida a alto nivel primero y luego bajar al detalle.

Principios confirmados:

- Los ciclos de vida no son fijos
- Son configurables por el rol Admin
- El modelo define un baseline por defecto
- El flujo es siempre hacia adelante
- No se permiten saltos ni retrocesos
- Se permite reasignacion sin cambiar el estado
- Toda accion deja trazabilidad

---

## 3. Definicion de ciclo de vida

Un ciclo de vida es el conjunto de:

- estados posibles de un tipo de trabajo
- transiciones validas entre estados
- eventos funcionales asociados

No incluye:

- pantallas
- tecnologia
- automatizaciones tecnicas

---

## 4. Estados base transversales (baseline)

Estados base reutilizables entre tipos de trabajo:

- Ingresado
- Asignado a area
- Asignado a responsable
- En trabajo
- Resuelto
- Cerrado

Reglas base:

- secuencia obligatoria
- sin retrocesos
- sin saltos
- reasignacion permitida sin cambio de estado
- historial obligatorio

---

## 5. Vision general de ciclos por tipo (alto nivel)

Incidente  
Ingresado → Asignado a area → Asignado a responsable → En trabajo → Resuelto → Cerrado

Solicitud de servicio  
Ingresado → Asignado a area → Asignado a responsable → En trabajo → Cerrado

Contingencia  
Ingresado → Asignado a area → En trabajo → Cerrado

Requerimiento  
Ingresado → Analisis → En trabajo → Cerrado

Proyecto  
Iniciado → Planificado → En ejecucion → Cerrado

Actividad de procesos  
Ingresado → En trabajo → Cerrado

---

## 6. Eventos clave transversales

- creacion del caso
- asignacion a area
- asignacion a responsable
- primera accion
- inicio de analisis
- inicio de ejecucion
- resolucion
- cierre

Estos eventos soportan:

- SLA
- metricas
- notificaciones
- auditoria

---

## 7. Nivel de validaciones

Se adopta un enfoque de validaciones minimas por estado.

Prioridades:

- correcta secuencia
- correcta asignacion
- cierre controlado
- trazabilidad completa

---

## 8. Modelado detallado por tipo de trabajo

---

### 8.1 Incidente

Definicion:  
Trabajo reactivo ante una interrupcion o degradacion no planificada.

Estados:

- Ingresado  
  Evento: creacion del caso  
  SLA: inicio SLA-1  

- Asignado a area  
  Evento: asignacion a area  
  SLA: inicio SLA-2  

- Asignado a responsable  
  Evento: asignacion a responsable  
  SLA: inicio SLA-3  

- En trabajo  
  Evento: primera accion  
  SLA: inicio SLA-4  

- Resuelto  
  Evento: resolucion  

- Cerrado  
  Evento: cierre del caso  

Transiciones:  
Ingresado → Asignado a area → Asignado a responsable → En trabajo → Resuelto → Cerrado

---

### 8.2 Solicitud de servicio

Definicion:  
Peticion planificada o semi-planificada para habilitar, modificar o acceder a un servicio.

Estados:

- Ingresado
- Asignado a area
- Asignado a responsable
- En trabajo
- Cerrado

No existe estado Resuelto en el baseline.

Transiciones:  
Ingresado → Asignado a area → Asignado a responsable → En trabajo → Cerrado

---

### 8.3 Contingencia

Definicion:  
Trabajo correctivo que prioriza registro de esfuerzo, evidencia e imputacion.

Estados:

- Ingresado
- Asignado a area
- En trabajo
- Cerrado

No existe asignacion obligatoria a responsable.

Transiciones:  
Ingresado → Asignado a area → En trabajo → Cerrado

SLA: opcionales.

---

### 8.4 Requerimiento

Definicion:  
Necesidad funcional o de negocio que requiere analisis previo antes de su ejecucion.

Estados:

- Ingresado
- Analisis
- En trabajo
- Cerrado

El estado Analisis es obligatorio.

Transiciones:  
Ingresado → Analisis → En trabajo → Cerrado

---

### 8.5 Proyecto

Definicion:  
Trabajo planificado, de mayor alcance y duracion, orientado a objetivos definidos.

Estados:

- Iniciado
- Planificado
- En ejecucion
- Cerrado

Transiciones:  
Iniciado → Planificado → En ejecucion → Cerrado

SLA: solo aplicable opcionalmente en ejecucion.

---

### 8.6 Actividad de procesos

Definicion:  
Trabajo interno del Area de Procesos orientado a auditoria, analisis y mejora continua.

Estados:

- Ingresado
- En trabajo
- Cerrado

No aplica SLA obligatorio.

Transiciones:  
Ingresado → En trabajo → Cerrado

---

## 9. Reasignaciones

- Permitidas en todos los tipos de trabajo
- No cambian el estado
- No rompen la secuencia
- Siempre dejan registro historico

---

## 10. Cierre de la Etapa 3

Con este documento:

- Todos los ciclos de vida baseline estan definidos
- Las reglas duras son consistentes
- El modelo es configurable por Admin
- Existe alineacion con SLA y metricas
- La Etapa 3 queda formalmente cerrada

El sistema esta listo para avanzar a la Etapa 4: Arquitectura y Componentes.
