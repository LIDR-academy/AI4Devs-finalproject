# User Stories – KinderTrack MVP

---

## Índice

1. [Introducción](#introducción)
2. [Gestión de Usuarios](#gestión-de-usuarios)
3. [Registro de Asistencias](#registro-de-asistencias)
4. [Registro de Incidentes](#registro-de-incidentes)
5. [Reportes y Seguridad](#reportes-y-seguridad)
6. [Resumen de Prioridades](#resumen-de-prioridades)

---

## Introducción

Este documento contiene las **user stories** necesarias para desarrollar el MVP de **KinderTrack**, una plataforma diseñada para instituciones de educación inicial (0-5 años) que permite registrar y dar seguimiento a la asistencia diaria y los incidentes relevantes de los niños.

Cada user story sigue el formato estándar:

```text
Como [tipo de usuario],
quiero [acción que desea realizar],
para [beneficio que espera obtener].
```

### Estructura de cada User Story

- **Título**: identificador y descripción breve
- **Descripción**: contexto y funcionalidad esperada
- **Criterios de aceptación**: condiciones específicas usando formato Dado/Cuando/Entonces
- **Notas adicionales**: información relevante para desarrollo o diseño
- **Tareas**: lista de subtareas técnicas necesarias
- **Historias relacionadas**: dependencias y relaciones con otras user stories

---

## Gestión de Usuarios

### US-001: Autenticación de usuarios

**Como** docente o directivo,  
**quiero** iniciar sesión en la aplicación de forma segura,  
**para** acceder a las funcionalidades según mi rol asignado.

#### Descripción

El sistema debe permitir a los usuarios autenticarse mediante credenciales únicas, manteniendo la sesión activa durante la jornada laboral sin necesidad de autenticarse repetidamente.

#### Criterios de aceptación

- **Dado que** soy un usuario registrado con credenciales válidas,  
  **cuando** ingreso mi usuario y contraseña,  
  **entonces** el sistema me autentica y me redirige a la pantalla principal.

- **Dado que** ingreso credenciales incorrectas,  
  **cuando** intento iniciar sesión,  
  **entonces** el sistema muestra un mensaje de error sin revelar qué dato es incorrecto.

- **Dado que** he iniciado sesión exitosamente,  
  **cuando** uso la aplicación durante mi jornada laboral,  
  **entonces** la sesión permanece activa sin solicitar nueva autenticación.

#### Notas adicionales

- Implementar almacenamiento seguro de tokens de sesión
- Considerar bloqueo temporal tras múltiples intentos fallidos
- La sesión debe expirar automáticamente al finalizar el día laboral
- Implementar en modo offline-first (SQLite local)

#### Tareas

- [ ] Diseñar e implementar pantalla de login
- [ ] Crear sistema de validación de credenciales contra base de datos local
- [ ] Implementar gestión de tokens de sesión con almacenamiento seguro
- [ ] Desarrollar lógica de expiración automática de sesión
- [ ] Crear mecanismo de bloqueo tras intentos fallidos
- [ ] Implementar pruebas de seguridad

#### Historias relacionadas

- **Requerida por**: US-002, US-003, US-006, US-009
- **Relacionada con**: US-014 (Cifrado de datos)

---

### US-002: Control de acceso por roles

**Como** directivo,  
**quiero** que cada usuario tenga permisos específicos según su rol,  
**para** garantizar que solo accedan a la información apropiada para su función.

#### Descripción

El sistema debe implementar tres roles principales (Docente, Directivo, Administrativo) con permisos diferenciados sobre asistencias, incidentes y reportes.

#### Criterios de aceptación

- **Dado que** soy un docente,  
  **cuando** accedo al sistema,  
  **entonces** puedo registrar asistencias e incidentes solo de mi aula asignada.

- **Dado que** soy un directivo,  
  **cuando** accedo al sistema,  
  **entonces** puedo consultar información de todas las aulas y generar reportes globales.

- **Dado que** soy un usuario administrativo,  
  **cuando** accedo al sistema,  
  **entonces** puedo registrar asistencias pero no puedo acceder a incidentes.

#### Notas adicionales

- Validar permisos en cada operación de lectura/escritura
- Un docente puede estar asignado a múltiples aulas
- Los directivos tienen acceso completo a todas las funcionalidades

#### Tareas

- [ ] Definir modelo de datos para roles y permisos
- [ ] Implementar matriz de permisos por rol
- [ ] Crear middleware de validación de permisos
- [ ] Desarrollar lógica de asignación docente-aula
- [ ] Implementar validación en capa de UI según rol
- [ ] Crear pruebas unitarias para cada combinación rol-permiso

#### Historias relacionadas

- **Depende de**: US-001
- **Requerida por**: US-003, US-006, US-009, US-013
- **Relacionada con**: Todas las historias funcionales

---

## Registro de Asistencias

### US-003: Registro rápido de check-in

**Como** docente,  
**quiero** registrar la llegada de un niño en menos de 15 segundos,  
**para** no interrumpir la rutina de recepción matutina y capturar información relevante del día.

#### Descripción

El docente debe poder registrar el check-in de manera ágil, capturando el estado del niño al llegar para proporcionar contexto pedagógico al día.

#### Criterios de aceptación

- **Dado que** estoy en la pantalla de asistencia de mi aula,  
  **cuando** selecciono un niño y registro su llegada,  
  **entonces** el sistema captura automáticamente la hora actual y solicita el estado del niño (tranquilo, cansado, inquieto, medicación, desayunó/no desayunó).

- **Dado que** completo el registro de check-in,  
  **cuando** confirmo la información,  
  **entonces** el proceso se completa en menos de 15 segundos y el niño aparece como "presente" en la lista.

- **Dado que** registro un check-in,  
  **cuando** guardo la información,  
  **entonces** queda asociado automáticamente mi usuario como educador responsable.

#### Notas adicionales

- Interfaz debe ser mobile-friendly y optimizada para tablets
- El timestamp debe ser inmutable una vez registrado
- Permitir agregar notas opcionales breves (máximo 100 caracteres)
- Priorizar velocidad y simplicidad sobre cantidad de datos

#### Tareas

- [ ] Diseñar UI minimalista de lista de niños del aula
- [ ] Implementar selector rápido de estado con opciones predefinidas
- [ ] Desarrollar captura automática de timestamp inmutable
- [ ] Crear servicio de persistencia en SQLite local
- [ ] Implementar asociación automática de educador responsable
- [ ] Optimizar rendimiento para respuesta <2 segundos
- [ ] Desarrollar campo opcional de notas cortas
- [ ] Crear pruebas de usabilidad y rendimiento

#### Historias relacionadas

- **Depende de**: US-001, US-002
- **Requerida por**: US-004, US-005, US-008
- **Relacionada con**: US-010 (Resumen diario)

---

### US-004: Registro rápido de check-out

**Como** docente,  
**quiero** registrar la salida de un niño cuando es recogido,  
**para** mantener control preciso de quiénes están en el aula en cada momento.

#### Descripción

El sistema debe permitir registrar la salida del niño, indicando quién lo recoge y a qué hora, asegurando trazabilidad completa.

#### Criterios de aceptación

- **Dado que** un niño presente en el aula va a ser recogido,  
  **cuando** selecciono el niño y registro su check-out,  
  **entonces** el sistema captura la hora actual y solicita confirmar quién recoge (padre, madre, autorizado, otro).

- **Dado que** completo el check-out,  
  **cuando** confirmo el registro,  
  **entonces** el niño cambia de estado a "retirado" y desaparece de la lista de presentes.

- **Dado que** selecciono "otro" como persona que recoge,  
  **cuando** continúo con el registro,  
  **entonces** debo ingresar obligatoriamente el nombre y relación con el niño.

#### Notas adicionales

- Solo permitir check-out de niños que tengan check-in registrado
- Validar que se capture quién recoge en todos los casos
- Considerar lista de personas autorizadas (puede ser post-MVP)

#### Tareas

- [ ] Diseñar UI de check-out con selector de niños presentes
- [ ] Implementar validación de check-in previo
- [ ] Crear selector de persona que recoge con opciones predefinidas
- [ ] Desarrollar campo condicional obligatorio para "otro"
- [ ] Implementar captura automática de timestamp
- [ ] Crear servicio de actualización de estado a "retirado"
- [ ] Desarrollar validaciones de campos obligatorios
- [ ] Crear pruebas de validación y casos de error

#### Historias relacionadas

- **Depende de**: US-003
- **Requerida por**: US-005, US-008
- **Relacionada con**: US-010 (Resumen diario)

---

### US-005: Visualización en tiempo real del estado del aula

**Como** docente,  
**quiero** ver en tiempo real qué niños están presentes, ausentes o retirados,  
**para** tener control inmediato y visual del estado actual de mi aula.

#### Descripción

La pantalla principal debe mostrar una vista clara y actualizada automáticamente del estado de asistencia de todos los niños del aula.

#### Criterios de aceptación

- **Dado que** accedo a la vista de mi aula,  
  **cuando** la pantalla se carga,  
  **entonces** veo tres secciones diferenciadas visualmente: "Presentes", "Ausentes" y "Retirados" con el contador de niños en cada estado.

- **Dado que** registro un check-in o check-out,  
  **cuando** completo la acción,  
  **entonces** la vista se actualiza automáticamente sin recargar la pantalla.

- **Dado que** selecciono un niño presente,  
  **cuando** accedo a su detalle,  
  **entonces** veo la hora de check-in, estado con el que llegó y educador que lo registró.

#### Notas adicionales

- Usar códigos de color para facilitar lectura: verde (presente), gris (ausente), azul (retirado)
- Mostrar contadores totales por cada estado
- Implementar actualización reactiva en tiempo real

#### Tareas

- [ ] Diseñar layout de tres secciones con códigos de color
- [ ] Implementar contadores dinámicos por estado
- [ ] Desarrollar actualización reactiva automática
- [ ] Crear componente de tarjeta de niño con información básica
- [ ] Implementar vista detallada al seleccionar un niño
- [ ] Optimizar rendimiento para aulas con muchos niños
- [ ] Implementar animaciones suaves de transición entre estados
- [ ] Crear pruebas de actualización en tiempo real

#### Historias relacionadas

- **Depende de**: US-003, US-004
- **Requerida por**: Ninguna
- **Relacionada con**: US-006, US-008

---

### US-006: Registro de ausencia justificada

**Como** docente o administrativo,  
**quiero** registrar ausencias con su motivo,  
**para** diferenciar entre ausencias justificadas y no justificadas en los reportes.

#### Descripción

Cuando un niño no asiste y la familia ha notificado el motivo, el sistema debe permitir documentar esta ausencia como justificada con su razón.

#### Criterios de aceptación

- **Dado que** un niño no ha llegado al aula,  
  **cuando** selecciono "registrar ausencia justificada",  
  **entonces** el sistema solicita el motivo (enfermedad, cita médica, viaje familiar, otro).

- **Dado que** selecciono "otro" como motivo,  
  **cuando** continúo el registro,  
  **entonces** debo ingresar una descripción breve del motivo (máximo 200 caracteres).

- **Dado que** completo el registro de ausencia justificada,  
  **cuando** guardo la información,  
  **entonces** el niño aparece en la lista de ausentes con indicador visual de "justificada".

#### Notas adicionales

- Permitir registrar ausencias anticipadas (el día anterior)
- Diferenciar visualmente en reportes ausencias justificadas vs no justificadas
- Asociar el registro al usuario que lo realiza

#### Tareas

- [ ] Diseñar UI de registro de ausencia justificada
- [ ] Crear selector de motivos predefinidos
- [ ] Implementar campo condicional para descripción personalizada
- [ ] Desarrollar lógica de registro anticipado
- [ ] Crear indicador visual en lista de ausentes
- [ ] Implementar persistencia con trazabilidad
- [ ] Desarrollar diferenciación en reportes
- [ ] Crear validaciones de campos obligatorios

#### Historias relacionadas

- **Depende de**: US-002
- **Requerida por**: US-008, US-013
- **Relacionada con**: US-005

---

### US-007: Consulta de historial de asistencia

**Como** docente o directivo,  
**quiero** consultar el historial completo de asistencia de un niño,  
**para** identificar patrones y detectar posibles situaciones que requieran atención.

#### Descripción

El sistema debe permitir visualizar todas las asistencias y ausencias de un niño en un período determinado, con estadísticas básicas.

#### Criterios de aceptación

- **Dado que** accedo al perfil de un niño,  
  **cuando** selecciono "historial de asistencia",  
  **entonces** veo una lista cronológica con fechas, horarios de check-in/check-out, estado al llegar y quién lo recogió.

- **Dado que** consulto el historial,  
  **cuando** aplico un filtro de fechas,  
  **entonces** veo solo los registros del período seleccionado.

- **Dado que** reviso el historial,  
  **cuando** el sistema procesa la información,  
  **entonces** muestra estadísticas: total de días asistidos, ausencias justificadas, ausencias sin justificar y porcentaje de asistencia.

#### Notas adicionales

- Implementar exportación a CSV para análisis externos
- Permitir consulta por rangos de fechas flexibles
- Calcular automáticamente porcentajes y promedios

#### Tareas

- [ ] Diseñar UI de historial con lista cronológica
- [ ] Implementar consulta por niño con filtros de fecha
- [ ] Desarrollar componente de visualización de registros
- [ ] Crear servicio de cálculo de estadísticas
- [ ] Implementar filtros de rango de fechas
- [ ] Desarrollar exportación a CSV
- [ ] Optimizar consultas para períodos largos
- [ ] Crear pruebas de cálculos estadísticos

#### Historias relacionadas

- **Depende de**: US-003, US-004, US-006
- **Requerida por**: Ninguna
- **Relacionada con**: US-013 (Exportación)

---

### US-008: Corrección de registros de asistencia

**Como** docente,  
**quiero** corregir errores en registros de asistencia,  
**para** mantener la precisión de la información sin afectar la trazabilidad.

#### Descripción

Si se comete un error al registrar check-in/check-out, el sistema debe permitir corregirlo de forma sencilla manteniendo la integridad de datos.

#### Criterios de aceptación

- **Dado que** he registrado un check-in o check-out con información incorrecta,  
  **cuando** selecciono "corregir registro" dentro de las 24 horas siguientes,  
  **entonces** puedo modificar el estado, hora o persona que recoge.

- **Dado que** corrijo un registro,  
  **cuando** confirmo los cambios,  
  **entonces** el sistema actualiza la información manteniendo el registro del usuario que hace la corrección.

- **Dado que** han pasado más de 24 horas del registro original,  
  **cuando** intento corregirlo,  
  **entonces** el sistema no permite la modificación directa (requeriría permiso de directivo).

#### Notas adicionales

- Ventana de corrección: 24 horas desde el registro original
- Solo el docente que creó el registro o un directivo pueden corregir
- La trazabilidad completa de cambios se implementará post-MVP

#### Tareas

- [ ] Diseñar UI de corrección de registros
- [ ] Implementar validación de ventana temporal (24h)
- [ ] Desarrollar servicio de actualización de registros
- [ ] Crear validación de permisos (autor o directivo)
- [ ] Implementar actualización en base de datos
- [ ] Desarrollar restricciones temporales
- [ ] Crear mensajes de error informativos
- [ ] Implementar pruebas de validación temporal y permisos

#### Historias relacionadas

- **Depende de**: US-003, US-004
- **Requerida por**: Ninguna
- **Relacionada con**: US-002, US-007

---

## Registro de Incidentes

### US-009: Registro rápido de incidentes

**Como** docente,  
**quiero** registrar incidentes relevantes del día de forma ágil,  
**para** documentar hechos importantes positivos y negativos sin interrumpir las actividades.

#### Descripción

El docente debe poder crear registros de incidentes seleccionando niño, categoría y agregando descripción breve de lo ocurrido.

#### Criterios de aceptación

- **Dado que** necesito documentar un incidente,  
  **cuando** accedo a "nuevo incidente",  
  **entonces** selecciono el niño, la categoría (positivo, negativo, pedagógico, salud, comportamiento, logro) y agrego descripción de máximo 500 caracteres.

- **Dado que** completo los campos obligatorios,  
  **cuando** guardo el incidente,  
  **entonces** el sistema registra automáticamente mi usuario, timestamp, aula y genera un ID único.

- **Dado que** registro el incidente,  
  **cuando** guardo la información,  
  **entonces** puedo opcionalmente etiquetar con áreas de desarrollo (motricidad, socialización, lenguaje, autonomía).

#### Notas adicionales

- Interfaz debe permitir registro desde cualquier vista del aula
- Categorías predefinidas pero debe ser intuitivo seleccionarlas
- Priorizar rapidez del registro sobre cantidad de información

#### Tareas

- [ ] Diseñar UI de registro rápido de incidente
- [ ] Implementar selector de niño del aula
- [ ] Crear selector de categorías predefinidas
- [ ] Desarrollar campo de descripción con validación de longitud
- [ ] Implementar selector múltiple de áreas de desarrollo
- [ ] Crear generador de ID único para incidente
- [ ] Desarrollar captura automática de metadatos (usuario, timestamp, aula)
- [ ] Implementar persistencia en SQLite local
- [ ] Crear pruebas de validación y persistencia

#### Historias relacionadas

- **Depende de**: US-001, US-002
- **Requerida por**: US-010, US-011, US-012
- **Relacionada con**: US-003 (contexto del día)

---

### US-010: Control de visibilidad de incidentes

**Como** docente,  
**quiero** decidir si un incidente es interno o se comparte con familias,  
**para** controlar qué información incluyo en el resumen diario.

#### Descripción

Al registrar o editar un incidente, el docente debe poder clasificarlo como interno (solo equipo educativo) o compartible (incluir en resumen para familias).

#### Criterios de aceptación

- **Dado que** estoy registrando un incidente,  
  **cuando** completo la información,  
  **entonces** debo marcar explícitamente si es "Solo interno" o "Compartir con familia" (por defecto: solo interno).

- **Dado que** marco un incidente como "Solo interno",  
  **cuando** se genera el resumen diario,  
  **entonces** ese incidente NO aparece en el resumen para familias pero es visible para docentes y directivos.

- **Dado que** marco un incidente como "Compartir con familia",  
  **cuando** se genera el resumen diario,  
  **entonces** ese incidente se incluye en el resumen del niño.

#### Notas adicionales

- Por defecto todos los incidentes son "Solo interno" para evitar compartir información sensible accidentalmente
- Solo directivos pueden cambiar la clasificación de incidentes de otros docentes
- La clasificación debe ser claramente visible en la lista de incidentes

#### Tareas

- [ ] Diseñar UI de selector de visibilidad
- [ ] Implementar valor por defecto "Solo interno"
- [ ] Crear campo de visibilidad en modelo de datos
- [ ] Desarrollar lógica de filtrado para resumen diario
- [ ] Implementar validación de permisos para cambio de clasificación
- [ ] Crear indicador visual de clasificación
- [ ] Desarrollar servicio de actualización de visibilidad
- [ ] Crear pruebas de filtrado y permisos

#### Historias relacionadas

- **Depende de**: US-009
- **Requerida por**: US-012 (Generación de resumen)
- **Relacionada con**: US-002, US-011

---

### US-011: Consulta de incidentes por niño

**Como** docente o directivo,  
**quiero** consultar todos los incidentes de un niño específico,  
**para** tener una visión completa de su evolución y situaciones relevantes.

#### Descripción

El sistema debe permitir visualizar el historial completo de incidentes de un niño, con opciones de filtrado por categoría y área de desarrollo.

#### Criterios de aceptación

- **Dado que** accedo al perfil de un niño,  
  **cuando** selecciono "ver incidentes",  
  **entonces** veo una lista cronológica con fecha, categoría, descripción resumida y docente responsable.

- **Dado que** consulto la lista de incidentes,  
  **cuando** aplico filtros por categoría o área de desarrollo,  
  **entonces** veo solo los incidentes que cumplen los criterios seleccionados.

- **Dado que** selecciono un incidente específico,  
  **cuando** veo el detalle completo,  
  **entonces** accedo a la descripción completa, etiquetas, clasificación de visibilidad y timestamp exacto.

#### Notas adicionales

- Implementar búsqueda por palabras clave en descripciones
- Diferenciar visualmente incidentes internos vs compartibles
- Mostrar contexto de asistencia del día del incidente

#### Tareas

- [ ] Diseñar UI de historial de incidentes por niño
- [ ] Implementar consulta de incidentes con filtros
- [ ] Crear lista cronológica con vista resumida y detallada
- [ ] Desarrollar filtros por categoría y área de desarrollo
- [ ] Implementar búsqueda por palabras clave
- [ ] Crear indicadores visuales de clasificación
- [ ] Desarrollar vista detallada de incidente
- [ ] Optimizar consultas para historial largo
- [ ] Crear pruebas de filtrado y búsqueda

#### Historias relacionadas

- **Depende de**: US-009, US-010
- **Requerida por**: Ninguna
- **Relacionada con**: US-007, US-012

---

### US-012: Generación de resumen diario

**Como** docente,  
**quiero** generar automáticamente un resumen del día de cada niño,  
**para** compartir con las familias la información relevante de la jornada.

#### Descripción

Al finalizar el día, el sistema debe generar un resumen coherente que combine información de asistencia y los incidentes marcados como compartibles.

#### Criterios de aceptación

- **Dado que** finaliza la jornada,  
  **cuando** selecciono "generar resúmenes del día",  
  **entonces** el sistema crea automáticamente un resumen para cada niño que asistió incluyendo: hora de llegada, estado al llegar, hora de salida, quién lo recogió, e incidentes compartibles.

- **Dado que** se genera el resumen,  
  **cuando** lo reviso,  
  **entonces** puedo editarlo antes de marcarlo como "listo para compartir".

- **Dado que** un niño no tuvo incidentes compartibles en el día,  
  **cuando** se genera su resumen,  
  **entonces** incluye solo información de asistencia y un mensaje positivo predeterminado.

#### Notas adicionales

- Formato texto plano, fácil de copiar y compartir
- Considerar plantillas personalizables por institución
- El envío automático por email/WhatsApp sería post-MVP
- Generar tono positivo y profesional automáticamente

#### Tareas

- [ ] Diseñar UI de generación masiva de resúmenes
- [ ] Implementar lógica de agregación de datos por niño
- [ ] Crear servicio de consulta de asistencia del día
- [ ] Desarrollar servicio de consulta de incidentes compartibles
- [ ] Implementar generador de texto de resumen
- [ ] Crear plantilla con campos dinámicos
- [ ] Desarrollar editor de resumen antes de compartir
- [ ] Implementar mensaje predeterminado positivo
- [ ] Crear funcionalidad de copiado al portapapeles
- [ ] Desarrollar pruebas de generación y formato

#### Historias relacionadas

- **Depende de**: US-003, US-004, US-009, US-010
- **Requerida por**: Ninguna
- **Relacionada con**: US-011

---

## Reportes y Seguridad

### US-013: Exportación de datos a CSV

**Como** directivo o administrativo,  
**quiero** exportar registros de asistencia e incidentes a formato CSV,  
**para** realizar análisis externos o cumplir con requisitos administrativos.

#### Descripción

El sistema debe permitir exportar datos seleccionados en formato CSV compatible con Excel y otras herramientas de análisis.

#### Criterios de aceptación

- **Dado que** accedo a la opción de exportación,  
  **cuando** selecciono el tipo de datos (asistencias o incidentes), rango de fechas y aulas,  
  **entonces** el sistema genera un archivo CSV con toda la información solicitada.

- **Dado que** exporto asistencias,  
  **cuando** descargo el archivo,  
  **entonces** incluye columnas: fecha, niño, aula, hora check-in, estado al llegar, hora check-out, quién recogió, docente responsable.

- **Dado que** exporto incidentes,  
  **cuando** descargo el archivo,  
  **entonces** incluye columnas: fecha, niño, aula, categoría, áreas de desarrollo, descripción, visibilidad, docente.

#### Notas adicionales

- Usar codificación UTF-8 para caracteres especiales
- Incluir encabezados descriptivos en español
- Validar que el archivo se abra correctamente en Excel
- Respetar permisos por rol al exportar

#### Tareas

- [ ] Diseñar UI de parámetros de exportación
- [ ] Implementar selectores de tipo de datos, fechas y aulas
- [ ] Desarrollar servicio de consulta con filtros aplicados
- [ ] Crear generador de CSV con codificación UTF-8
- [ ] Implementar estructura de columnas con encabezados
- [ ] Desarrollar validación de permisos de exportación
- [ ] Crear descarga de archivo
- [ ] Implementar pruebas de formato y compatibilidad

#### Historias relacionadas

- **Depende de**: US-002, US-003, US-004, US-009
- **Requerida por**: Ninguna
- **Relacionada con**: US-007, US-011

---

### US-014: Cifrado de datos locales

**Como** directivo,  
**quiero** que todos los datos estén cifrados en el dispositivo,  
**para** proteger la información sensible de niños y familias.

#### Descripción

El sistema debe implementar cifrado AES-256 para toda la información almacenada localmente en la base de datos SQLite.

#### Criterios de aceptación

- **Dado que** el sistema almacena datos sensibles,  
  **cuando** se guarda cualquier información,  
  **entonces** se cifra automáticamente con AES-256 antes de escribirse en disco.

- **Dado que** la aplicación necesita leer datos,  
  **cuando** accede al almacenamiento,  
  **entonces** descifra la información de forma transparente sin impactar el rendimiento.

- **Dado que** alguien accede físicamente al dispositivo,  
  **cuando** intenta leer los archivos de base de datos,  
  **entonces** encuentra solo información cifrada ilegible.

#### Notas adicionales

- Implementar gestión segura de claves de cifrado
- No debe impactar significativamente el rendimiento
- Considerar backup cifrado (post-MVP)
- Documentar proceso de recuperación en caso de pérdida de claves

#### Tareas

- [ ] Investigar e implementar biblioteca de cifrado AES-256
- [ ] Diseñar sistema de gestión de claves
- [ ] Implementar cifrado en capa de persistencia
- [ ] Desarrollar descifrado transparente en capa de lectura
- [ ] Crear almacenamiento seguro de claves
- [ ] Desarrollar migración de datos a formato cifrado
- [ ] Implementar pruebas de seguridad y rendimiento
- [ ] Documentar proceso de gestión de claves

#### Historias relacionadas

- **Depende de**: Ninguna (requisito transversal)
- **Requerida por**: Todas las historias que persisten datos
- **Relacionada con**: US-001

---

## Resumen de Prioridades

### Historias Críticas (MVP Mínimo - 8 historias)

Funcionalidades esenciales sin las cuales el sistema no es viable:

1. **US-001**: Autenticación de usuarios
2. **US-002**: Control de acceso por roles
3. **US-003**: Registro rápido de check-in
4. **US-004**: Registro rápido de check-out
5. **US-005**: Visualización en tiempo real del aula
6. **US-009**: Registro rápido de incidentes
7. **US-010**: Control de visibilidad de incidentes
8. **US-014**: Cifrado de datos locales

### Historias de Alta Prioridad (MVP Completo - 4 historias)

Funcionalidades importantes para completar el valor del MVP:

9. **US-006**: Registro de ausencia justificada
10. **US-008**: Corrección de registros de asistencia
11. **US-011**: Consulta de incidentes por niño
12. **US-012**: Generación de resumen diario

### Historias de Prioridad Media (MVP Extendido - 2 historias)

Funcionalidades que agregan valor pero pueden implementarse después:

13. **US-007**: Consulta de historial de asistencia
14. **US-013**: Exportación de datos a CSV

---

## Estimación y Planificación

### Resumen por Áreas Funcionales

- **Gestión de Usuarios**: 2 historias (US-001, US-002)
- **Registro de Asistencias**: 6 historias (US-003 a US-008)
- **Registro de Incidentes**: 4 historias (US-009 a US-012)
- **Reportes y Seguridad**: 2 historias (US-013, US-014)

**Total**: 14 User Stories para el MVP
  - Críticas: 8 historias
  - Alta prioridad: 4 historias
  - Prioridad media: 2 historias

### Dependencias Principales

- **US-001** es prerequisito de todas las demás
- **US-002** es prerequisito de todas las funcionalidades de registro
- **US-003** y **US-004** son prerequisitos de **US-005**, **US-007**, **US-008**
- **US-009** es prerequisito de **US-010**, **US-011**, **US-012**

### Recomendación de Implementación

**Sprint 1**: US-001, US-002, US-014 (Fundación y Seguridad)  
**Sprint 2**: US-003, US-004, US-005 (Asistencias Básicas)  
**Sprint 3**: US-006, US-008 (Completar Asistencias)  
**Sprint 4**: US-009, US-010, US-011 (Incidentes)  
**Sprint 5**: US-012, US-007, US-013 (Resúmenes y Reportes)

---

## Notas Finales

Estas user stories están diseñadas para construir un MVP de **KinderTrack** que sea:

✅ **Simple**: interfaces minimalistas y procesos rápidos  
✅ **Seguro**: cifrado, roles y trazabilidad desde el inicio  
✅ **Offline-first**: sin dependencia de servidores externos  
✅ **Escalable**: arquitectura preparada para crecimiento futuro  
✅ **Centrado en el usuario**: diseñado para docentes de educación inicial

El énfasis está en **velocidad de registro** (<15 seg por niño), **seguridad de datos** (cifrado AES-256) y **valor pedagógico** (incidentes positivos + negativos, resúmenes diarios), diferenciándose de soluciones puramente administrativas.
