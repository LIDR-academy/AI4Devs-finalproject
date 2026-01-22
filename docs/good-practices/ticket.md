# Guía de Buenas Prácticas para Definición de Tickets de Trabajo en Agile

Un **ticket de trabajo efectivo** contiene toda la información necesaria para que cualquier miembro del equipo comprenda y ejecute la tarea correctamente. Además, clasificar correctamente el ticket según su tipo ayuda a priorizar, planificar y dar seguimiento a las tareas de manera eficiente.

---

## 1. Tipos de Tickets en Metodología Agile

Definir el **tipo de ticket** permite identificar rápidamente la naturaleza de la tarea y cómo debe ser abordada:

1. **Historia de Usuario (User Story)**

   * Representa una funcionalidad desde la perspectiva del usuario.
   * Debe describir el **valor para el usuario** y tener criterios de aceptación claros.
   * Ejemplo: *Como usuario, quiero recibir notificaciones por correo para eventos importantes.*

2. **Tarea (Task)**

   * Trabajo técnico o administrativo que debe completarse, pero que no añade valor directo al usuario.
   * Ejemplo: *Actualizar la librería de autenticación a la última versión.*

3. **Bug / Defecto (Bug)**

   * Indica un error o problema que debe corregirse.
   * Debe incluir **pasos para reproducirlo**, resultado esperado y resultado observado.

4. **Mejora / Chore (Improvement / Chore)**

   * Actividades que optimizan el sistema o proceso sin agregar funcionalidad visible.
   * Ejemplo: *Refactorizar el código de la API de login para mejorar mantenibilidad.*

5. **Spike**

   * Investigación o experimentación para resolver incertidumbre antes de implementar una funcionalidad.
   * Ejemplo: *Investigar opciones de integración con un proveedor de SMS.*

---

## 2. Componentes de un Ticket de Trabajo

Un ticket bien definido incluye los siguientes elementos:

1. **Título Claro y Conciso**

   * Resumen breve que refleja la esencia de la tarea.
   * Debe permitir entender rápidamente de qué se trata.

2. **Descripción Detallada**

   * **Propósito:** Por qué es necesaria la tarea y qué problema resuelve.
   * **Detalles específicos:** Requerimientos, restricciones o condiciones para completarla.

3. **Criterios de Aceptación**

   * Lista clara de condiciones para considerar el ticket completado.
   * Pasos de validación para comprobar la correcta ejecución.

4. **Prioridad**

   * Clasificación de importancia y urgencia.
   * Ayuda a determinar el orden de trabajo dentro del backlog.

5. **Estimación de Esfuerzo**

   * Puntos de historia o tiempo estimado para completar la tarea.
   * Fundamental para la planificación del sprint.

6. **Asignación**

   * Persona o equipo responsable de completar el ticket.

7. **Etiquetas o Tags**

   * Clasificación por tipo, área del producto, sprint o versión.

8. **Comentarios y Notas**

   * Espacio para colaboración, dudas y actualizaciones de progreso.

9. **Enlaces o Referencias**

   * Documentación, diseños, especificaciones o tickets relacionados.

10. **Historial de Cambios**

* Registro de modificaciones, reasignaciones y actualizaciones de estado o prioridad.

---

## 3. Buenas Prácticas para Definir Tickets

* Mantener **títulos y descripciones claros** y específicos.
* Definir **criterios de aceptación medibles**.
* Asignar un **tipo de ticket adecuado** y usar etiquetas consistentes.
* Priorizar tareas según impacto y urgencia.
* Estimar el esfuerzo de forma realista.
* Mantener actualizado el **historial de cambios**.
* Incluir referencias y documentación para reducir dudas.

---

## 4. Ejemplo de Ticket Bien Formulado

**Tipo de Ticket:** Historia de Usuario

**Título:** Implementación de Autenticación de Dos Factores (2FA)

**Descripción:** Añadir autenticación de dos factores para mejorar la seguridad del login de usuarios. Debe soportar aplicaciones como Authenticator y mensajes SMS.

**Criterios de Aceptación:**

* Los usuarios pueden activar 2FA desde su perfil.
* Soporte para Google Authenticator y SMS.
* Confirmación del dispositivo 2FA durante la configuración.

**Prioridad:** Alta
**Estimación:** 8 puntos de historia
**Asignado a:** Equipo de Backend
**Etiquetas:** Seguridad, Backend, Sprint 10
**Comentarios:** Verificar compatibilidad con usuarios internacionales para el envío de SMS.
**Enlaces:** Documento de Especificación de Requerimientos de Seguridad
**Historial de Cambios:**

* 01/10/2023: Creado por [nombre]
* 05/10/2023: Prioridad actualizada a Alta por [nombre]

---