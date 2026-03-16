# SDD — Etapa 2: Documento Final de Especificacion Funcional

## Estado

**Etapa:** 2 — Definicion de la Especificacion
**Estado:** 🟢 FINAL

---

## 1. Contexto

Este documento consolida **todo el contenido, decisiones y definiciones** trabajadas durante la Etapa 2 del proceso SDD. Su objetivo es servir como **fuente unica y oficial** de la especificacion funcional del sistema a disenar.

El sistema reemplazara soluciones existentes (Whaticket, OTRS/Znuny y SIHR) y dara soporte a **usuarios internos** de las areas:

* Desarrollo Informatico Interno (DII)
* Soporte TI
* Procesos

---

## 2. Objetivos del sistema

* Unificar la gestion del trabajo interno en una sola plataforma
* Respetar las diferencias operativas entre areas
* Garantizar trazabilidad end-to-end
* Permitir medicion objetiva (SLA, tiempos, carga, calidad)
* Facilitar mejora continua y control de gestion

---

## 3. Tipos de trabajo

### Tipos fijos

* Incidente
* Solicitud de servicio
* Contingencia
* Requerimiento
* Proyecto
* Actividad de procesos

Cada tipo posee:

* ciclo de vida propio
* reglas funcionales propias
* metricas especificas

### Subtipos

* Administrables por roles (Admin)
* Asociados a un tipo de trabajo
* Permiten clasificacion, ruteo, validaciones y metricas

---

## 4. Ciclos de vida

* Cada tipo de trabajo tiene su propio ciclo de vida
* Los subtipos no crean ciclos nuevos, pero pueden influir reglas
* Los estados concretos se definiran en etapas posteriores

---

## 5. Roles y permisos

### Roles definidos

* Usuario Solicitante
* Agente Operativo (Soporte TI)
* Agente Operativo (DII)
* Agente Operativo (Procesos)
* Encargado de Area
* Jefe de Area
* Jefa de Gobierno TI
* Auditor
* Administrador (Admin)

### Principios

* Administracion centralizada
* Minimo privilegio
* Segmentacion por area
* Auditoria obligatoria

### Imputacion de tiempo

* Configurable por tipo de trabajo
* Permitida sin asignacion directa
* No permitida para Solicitantes ni Admin

---

## 6. Canales de entrada

* Correo (creacion automatica de casos)
* Mensajeria interna
* Portal / formularios internos
* Creacion interna por roles (requerimientos, proyectos)

Todos los canales generan trazabilidad completa.

---

## 7. Comunicaciones

* Notificaciones por eventos relevantes
* Conversaciones asociadas al caso
* Distincion entre comunicacion con solicitante y notas internas

---

## 8. Encuestas

* Encuestas por caso (CSAT)
* Disparadores configurables
* Asociadas a casos
* Reporteria agregada

---

## 9. Modelo conceptual de datos (alto nivel)

### Entidades principales

* Caso
* Tipo de trabajo / Subtipo
* Ciclo de vida / Historial de estados
* Usuario / Rol / Area
* Asignacion / Participacion
* Imputacion de tiempo
* Evidencia
* Comunicacion
* Encuesta
* Regla / Configuracion

### Atributos minimos del Caso

* fecha_hora_ingreso
* fecha_hora_cierre
* usuario_solicitante
* area_cliente_del_solicitante
* area_responsable
* tipo_de_trabajo / subtipo

---

## 10. Clasificaciones

* Tipo de incidencia (catalogo asociado a Incidente)

---

## 11. SLA

El sistema debe soportar multiples SLA:

* SLA-1: desde ingreso del caso
* SLA-2: desde asignacion a area
* SLA-3: desde asignacion a usuario
* SLA-4: desde primera accion

Los SLA son configurables por:

* tipo
* subtipo
* area responsable

---

## 12. Metricas estandar

### Volumen

* casos creados
* casos cerrados
* backlog

### Tiempo y ciclo

* tiempo total de ciclo
* tiempos hasta asignaciones
* tiempo hasta primera accion

### SLA

* cumplimiento por cada SLA

### Carga y esfuerzo

* horas imputadas
* apoyo cruzado

### Calidad

* encuestas
* reaperturas

### Ejecutivas

* consolidado por area
* comparativos

---

## 13. Fuera de alcance

* UI/UX
* arquitectura tecnica
* base de datos fisica
* integraciones especificas
* inventario / activos
* entidad Proceso
* dashboards finales

---

## 14. Condiciones de cierre

Con este documento:

* la Etapa 2 queda formalmente cerrada
* el sistema esta listo para Etapa 3 (spec-kit, modelado detallado, arquitectura)
