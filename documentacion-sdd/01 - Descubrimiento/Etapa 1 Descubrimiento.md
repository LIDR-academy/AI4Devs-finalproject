# SDD — Etapa 1: Descubrimiento

## Estado de la etapa

**Etapa:** 1 — Descubrimiento
**Estado:** ✅ Completada
**Resultado:** Problema comprendido, alcance cerrado y base sólida para iniciar la Etapa 2 (Definición de la Spec).

---

## 1. Contexto general

El proyecto busca diseñar un **sistema único e integrado** que reemplace completamente las plataformas actualmente utilizadas:

* **Whaticket**: canal de entrada y atención (WhatsApp / mensajería).
* **Znuny (OTRS)**: gestión de tickets, estados y derivaciones.
* **SIHR**: sistema legacy interno para imputación de horas, requerimientos, contingencias y proyectos.

El sistema será utilizado **exclusivamente por usuarios internos** de la empresa y dará soporte transversal a:

1. Desarrollo Informático (DII)
2. Soporte TI (infraestructura, redes, hardware, cambios)
3. Área de Procesos (auditoría y mejora continua)

---

## 2. Proceso actual (As-Is)

### 2.1 Flujo operativo vía Soporte

* Usuarios internos contactan a Soporte por Whaticket o correo.
* Se genera un ticket en OTRS.
* Soporte clasifica y deriva el ticket al área correspondiente.
* Un encargado del área asigna el trabajo según expertise.
* El equipo ejecuta el trabajo basándose en el ticket.

### 2.2 Registro de trabajo e imputación

* Solo el área DII crea manualmente incidencias/contingencias/requerimientos en SIHR.
* Las horas se imputan diariamente en SIHR.
* OTRS y SIHR no están integrados; la relación es manual y conceptual.

### 2.3 Requerimientos iniciados fuera del flujo de soporte

* Algunos requerimientos (proyectos grandes) nacen desde reuniones de jefaturas.
* Se crean directamente en SIHR con fases y tareas.
* No existe ticket de origen en OTRS.

### 2.4 Área de Procesos

* Registra su trabajo en SIHR como contingencias, aunque el sistema no fue diseñado para ese fin.
* Utiliza el sistema de forma forzada para dejar evidencia.

### 2.5 Área de Soporte TI

* No registra horas.
* Solo dispone de métricas básicas desde OTRS (tiempos de respuesta, estados).
* No existe visibilidad detallada de en qué se ocupa el tiempo del equipo.

---

## 3. Actores identificados

* **Usuario solicitante interno**: reporta incidentes o solicita servicios.
* **Analista / Técnico**: ejecuta trabajo operativo y, en algunos casos, imputa horas.
* **Encargado de área / Jefatura**: asigna trabajo y supervisa.
* **Área de Procesos / Auditoría**: analiza datos, evidencia y trazabilidad, sin operar tickets.

---

## 4. Problemas estructurales identificados

### 4.1 Fragmentación del trabajo

* El trabajo nace en múltiples sistemas y canales.
* No existe un punto único de origen ni una fuente única de verdad.

### 4.2 Desacople entre trabajo y registro

* El trabajo se ejecuta en función de OTRS.
* La imputación se realiza en SIHR.
* La relación entre ambos no es sistémica.

### 4.3 Uso forzado de herramientas

* Procesos utiliza SIHR fuera de su diseño original.
* Soporte carece de mecanismos formales para registrar esfuerzo real.

### 4.4 Trazabilidad y auditoría deficientes

* Evidencias dispersas.
* Auditorías basadas en reconstrucción manual.
* Reporterías inconsistentes y costosas.

---

## 5. Tensiones organizacionales

* Velocidad operativa vs control y trazabilidad.
* Flexibilidad de ejecución vs estandarización de procesos.
* Operación diaria vs necesidades de auditoría histórica.

El sistema futuro debe equilibrar estas tensiones para ser viable.

---

## 6. Problem Statement

> La organización necesita un sistema único e integrado que permita gestionar requerimientos, incidentes, proyectos y actividades, junto con la imputación de horas, para las áreas de Desarrollo, Soporte TI y Procesos, eliminando la fragmentación de herramientas actuales y asegurando trazabilidad completa, auditoría confiable y soporte efectivo a la mejora continua, sin sobrecargar la operación diaria.

---

## 7. Jobs To Be Done (JTBD)

### Transversales

* Gestionar un requerimiento de principio a fin sin perder contexto.
* Contar con una fuente única y confiable de información.
* Registrar evidencia como parte natural del trabajo.

### Desarrollo Informático (DII)

* Imputar horas como consecuencia del trabajo.
* Gestionar contingencias sin duplicar esfuerzos.
* Reducir fricción administrativa.

### Soporte TI

* Atender incidencias con contexto completo del usuario y sus activos.
* Relacionar incidentes con inventario e historial.

### Área de Procesos

* Auditar procesos sin reconstrucción manual.
* Analizar datos reales para mejora continua.

### Gestión

* Supervisar carga, tiempos y estado sin microgestión.

---

## 8. Capacidades necesarias (nivel problema)

El sistema debe permitir:

* Un punto único de ingreso del trabajo.
* Gestión del ciclo de vida completa y configurable.
* Asociación directa entre trabajo ejecutado e imputación de horas.
* Registro nativo de evidencia y trazabilidad histórica.
* Visión transversal por área y rol.
* Reporterías consistentes, reutilizables y auditables.

---

## 9. Cierre de la etapa

La Etapa 1 (Descubrimiento) se considera **formalmente completada**.

El proyecto cuenta con:

* Alcance cerrado
* Problema bien definido
* Actores claros
* Flujo actual documentado
* JTBD validados

Está en condiciones de iniciar la **Etapa 2: Definición de la Especificación (Spec)**.
