# Casos de Uso Principales – KinderTrack

## 1️⃣ Roles de usuario

Para el MVP, identificamos los siguientes **roles**:

| Rol                           | Descripción                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| **Docente**                   | Responsable directo de los niños. Registra asistencias, incidentes y datos de aula.     |
| **Directivo / Administrador** | Supervisa la operación del centro, accede a reportes, controla usuarios y permisos.     |
| **Familia / Tutor** (futuro)  | Recibe reportes diarios/semanales sobre asistencia e incidentes del niño. Solo lectura. |

> Nota: para el MVP inicial, el rol de **Familia** puede omitirse y planificarse como futura extensión.

---

## 2️⃣ Casos de uso principales

### Caso de uso 1: Registro de asistencia

**Actor principal:** Docente
**Descripción:** Permite al docente registrar la llegada y salida de cada niño, incluyendo su estado o necesidades especiales.

**Flujo principal:**

1. Docente abre la pantalla de asistencia del aula.
2. Selecciona la fecha y hora (auto-registrada).
3. Marca el estado de cada niño:

   * Presente / Ausente
   * Estado del niño: tranquilo, inquieto, cansado, medicación, alimentación, etc.
4. Confirma el registro.
5. Sistema guarda el registro de manera **inmutable**, asignando:

   * Usuario responsable
   * Timestamp
   * Aula
6. Sistema permite exportar datos en CSV para respaldo o futuras integraciones cloud.

**Dependencias:**

* Necesita que el niño esté registrado en la base de datos.
* Depende de que el docente tenga permisos para registrar asistencia en esa aula.

---

### Caso de uso 2: Registro de incidente

**Actor principal:** Docente
**Descripción:** Permite al docente registrar hechos relevantes, positivos o negativos, relacionados con el desarrollo o cuidado de los niños.

**Flujo principal:**

1. Docente abre la pantalla de incidentes del aula.
2. Selecciona al niño.
3. Selecciona tipo de incidente (logro, comportamiento, evento especial, necesidad de atención, etc.)
4. Escribe una breve descripción del incidente.
5. Agrega etiquetas pedagógicas (motricidad, socialización, lenguaje, etc.)
6. Confirma el registro.
7. Sistema guarda el registro de manera **inmutable** con:

   * Usuario responsable
   * Timestamp
   * Aula
8. El incidente queda disponible para reportes y futuras exportaciones CSV.

**Dependencias:**

* Necesita que el niño esté registrado.
* Depende de que el docente tenga permisos de registro.
* Puede depender del registro previo de asistencia si se desea vincular evento con presencia del niño.

---

### Caso de uso 3: Visualización de reportes (Docente / Directivo)

**Actor principal:** Docente, Directivo
**Descripción:** Permite consultar el historial de asistencias e incidentes, generando reportes diarios, semanales o por período personalizado.

**Flujo principal:**

1. Usuario selecciona tipo de reporte (Asistencia, Incidentes, Ambos).
2. Selecciona el período y aula.
3. Sistema filtra los registros disponibles.
4. Usuario puede visualizar datos en tabla y exportar CSV.

**Dependencias:**

* Depende de que existan registros de asistencia e incidentes.
* Depende del rol del usuario: docentes pueden ver su aula, directivos todas las aulas.

---

### Caso de uso 4: Gestión de usuarios (Directivo / Administrador)

**Actor principal:** Directivo / Administrador
**Descripción:** Permite crear y administrar usuarios del sistema, asignando roles y permisos.

**Flujo principal:**

1. Directivo abre la pantalla de administración de usuarios.
2. Crea, edita o desactiva usuarios.
3. Asigna rol y permisos:

   * Docente → acceso aula, registrar asistencia e incidentes
   * Directivo → acceso completo y reportes
4. Sistema guarda los cambios y controla acceso a funciones.

**Dependencias:**

* Necesario para que los docentes puedan registrar datos.
* Afecta seguridad y trazabilidad del sistema.

---

### Caso de uso 5: Exportación de datos

**Actor principal:** Docente, Directivo
**Descripción:** Permite exportar datos de asistencias e incidentes para respaldo o integración futura con cloud.

**Flujo principal:**

1. Usuario selecciona tipo de datos y rango de fechas.
2. Sistema genera un archivo CSV seguro.
3. Usuario descarga o guarda el archivo.

**Dependencias:**

* Depende de registros existentes.
* Depende del rol del usuario (solo lectura de su aula o todas las aulas).

---

## 3️⃣ Dependencias entre acciones

| Acción               | Depende de                      | Impacta                                       |
| -------------------- | ------------------------------- | --------------------------------------------- |
| Registrar asistencia | Niño registrado, docente activo | Reportes, exportación, historial              |
| Registrar incidente  | Niño registrado, docente activo | Reportes, exportación, historial              |
| Visualizar reportes  | Existencia de registros         | Toma de decisiones, comunicación con familias |
| Gestión de usuarios  | Directivo activo                | Acceso seguro a funcionalidades               |
| Exportar datos       | Existencia de registros         | Respaldo, integración cloud futura            |

---

Si quieres, puedo generar un **diagrama de casos de uso UML** para KinderTrack con **roles, acciones y dependencias visualizadas**, listo para integrar en el PRD. Esto ayuda mucho al equipo de desarrollo a entender el flujo completo.

¿Quieres que haga eso?
