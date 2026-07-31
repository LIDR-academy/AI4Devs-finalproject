# Feature Specification: Servicio Público de Verificación de Certificados

**Feature Branch**: `006-servicio-publico-verificacion`

**Created**: 2026-07-29

**Status**: Draft

**Input**: EPIC-02 / TKT-010, TKT-011, TKT-012, TKT-013 — Implementar el servicio público de verificación de autenticidad de certificados electrónicos (microservicio `verificacion`, HU-14). Expone validación de código, obtención del documento PDF, registro de auditoría y protección contra abuso, sin autenticación y sin dependencia de PUP, TiendaWS ni SHD.

## Clarifications

### Session 2026-07-29

- Q: ¿El audit trail debe registrar también intentos fallidos (código expirado / inexistente / formato inválido)? → A: Solo verificaciones exitosas (alineado a HU-14 CA-14.2); los rechazos no generan fila de auditoría
- Q: ¿Cuándo y cómo se crea el registro de auditoría de una verificación exitosa? → A: Registro explícito por el cliente (`POST` de registros) tras validación exitosa; el servidor no auto-registra en la validación; si el cliente no llama, no hay fila de auditoría
- Q: ¿Cómo entrega el servicio el PDF al portal de verificación? → A: Contenido PDF en Base64 en la respuesta de obtención del documento (para visor pdf.js); no se expone URL pre-firmada S3 en este flujo
- Q: ¿Los códigos de verificación distinguen mayúsculas y minúsculas? → A: Formato de entrada solo mayúsculas A–Z y dígitos 0–9; cualquier minúscula se rechaza en validación de formato (antes de consultar el repositorio)
- Q: ¿En qué zona horaria se calcula la vigencia de 60 días calendario? → A: `America/Bogota` (hora de Colombia) para el cómputo de días calendario y el corte de expiración
- Q: ¿El límite de 100 req/s por IP es cupo compartido o por operación? → A: Cupo único compartido de 100 req/s por IP sumando validar + documento + registro

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validar autenticidad de un certificado por código (Priority: P1) 🎯 MVP

Como tercero verificador, quiero ingresar el código de verificación de 14 caracteres (`A–Z0–9`) de un certificado electrónico y saber si es auténtico y vigente, para confirmar que el documento que recibí es legítimo y no ha sido alterado.

**Why this priority**: Es el valor de negocio central de HU-14 y de EPIC-02. Sin validación de código no hay verificación útil; las demás capacidades (documento, auditoría, rate limit) dependen de ella o la protegen.

**Independent Test**: Con un código vigente conocido, un código expirado y un código inexistente, invocar la validación y verificar las tres respuestas diferenciadas (válido, expirado, no existe) sin autenticación.

**Acceptance Scenarios**:

1. **Given** un código de verificación de 14 caracteres alfanuméricos correspondiente a un certificado expedido hace menos de 60 días calendario, **When** el verificador solicita la validación, **Then** el sistema confirma que el certificado es válido y vigente e indica la referencia del archivo del certificado.
2. **Given** un código de 14 caracteres que existe pero cuya fecha de expedición supera los 60 días calendario, **When** el verificador solicita la validación, **Then** el sistema informa que el código ha expirado (vigencia de 60 días desde la expedición) y NO permite obtener ni visualizar el PDF.
3. **Given** un código de 14 caracteres que no existe en el sistema, **When** el verificador solicita la validación, **Then** el sistema informa que el código no existe, sin revelar información adicional que facilite ataques de enumeración.
4. **Given** un código con formato inválido (longitud distinta de 14, caracteres fuera de A–Z/0–9, o con minúsculas), **When** el verificador solicita la validación, **Then** el sistema rechaza la solicitud por validación de formato sin consultar el repositorio de códigos.
5. **Given** cualquier solicitud de validación, **When** se procesa, **Then** no se exige autenticación ni credenciales de ningún tipo.

---

### User Story 2 - Visualizar el PDF del certificado verificado (Priority: P2)

Como tercero verificador que acaba de validar un código vigente, quiero obtener el contenido del PDF del certificado para visualizarlo en el portal de verificación, para confirmar visualmente que el documento coincide con el que recibí.

**Why this priority**: Completa el happy path de HU-14 (CA-14.1). Depende de la validación exitosa (US1); sin ella no tiene sentido entregar el documento.

**Independent Test**: Con un código válido y vigente cuyo PDF existe en el almacenamiento, solicitar el documento y verificar que se recibe el contenido renderizable; con código expirado o inexistente, verificar que se aplican las mismas reglas de rechazo de US1.

**Acceptance Scenarios**:

1. **Given** un código válido y vigente cuyo PDF está disponible en el almacenamiento, **When** el verificador solicita el documento, **Then** el sistema entrega el contenido del PDF codificado en Base64, listo para ser mostrado en el visor integrado del portal.
2. **Given** un código expirado o inexistente, **When** el verificador solicita el documento, **Then** el sistema aplica las mismas reglas de rechazo que en la validación (US1) y NO entrega el PDF.
3. **Given** un código válido y vigente pero cuyo archivo PDF no se encuentra en el almacenamiento, **When** el verificador solicita el documento, **Then** el sistema informa que el archivo no está disponible y genera una alerta interna de inconsistencia (código válido sin archivo), sin exponer detalles técnicos al verificador.
4. **Given** el almacenamiento de PDFs, **When** se intenta acceder al archivo fuera del flujo de verificación, **Then** los PDFs no son públicamente accesibles de forma directa; solo se obtienen a través de este servicio.

---

### User Story 3 - Registrar cada verificación para auditoría (Priority: P2)

Como responsable de cumplimiento de la CCB, quiero que cada verificación exitosa pueda registrarse explícitamente con la IP del verificador y la fecha/hora, para disponer de un rastro de auditoría de quién consultó qué certificado y cuándo.

**Why this priority**: Cumple RF-29 y RNF-20 (audit trail). Es obligatorio para trazabilidad, pero el MVP de valor al ciudadano es US1; la auditoría es una operación de escritura separada invocada tras la validación exitosa.

**Independent Test**: Tras validar un código vigente, invocar el registro de auditoría y comprobar que queda una fila con IP (considerando proxy/balanceador) y marca de tiempo; repetir varias veces el mismo código y verificar que no hay límite de cantidad de registros durante la vigencia. Verificar que la sola validación exitosa sin registro explícito no crea fila.

**Acceptance Scenarios**:

1. **Given** un código vigente ya validado exitosamente, **When** el cliente solicita explícitamente el registro de la verificación, **Then** se crea un registro de auditoría con la IP real del verificador y la fecha/hora exacta.
2. **Given** que el verificador accede a través de un balanceador o proxy que envía la IP original en la cabecera de reenvío, **When** se registra la verificación, **Then** se almacena la IP real del cliente (no la del balanceador).
3. **Given** un certificado vigente, **When** se realizan múltiples registros explícitos del mismo código, **Then** todos se almacenan sin límite de cantidad durante los 60 días de vigencia.
4. **Given** un intento de verificación con código expirado o inexistente, **When** el sistema rechaza la solicitud, **Then** NO se crea registro de auditoría (solo se permiten registros tras validación exitosa, alineado a HU-14 CA-14.2).
5. **Given** una validación exitosa, **When** el cliente no invoca el registro explícito, **Then** no se crea fila de auditoría (el servidor no auto-registra en la validación ni en la obtención del documento).

---

### User Story 4 - Proteger el servicio público contra abuso (Priority: P3)

Como operador del servicio, quiero limitar la tasa de solicitudes por dirección IP, para evitar abuso o ataques de fuerza bruta sobre el endpoint público sin afectar a verificadores legítimos.

**Why this priority**: Protege el servicio (RNF-15, CA-14.4) pero no aporta valor funcional al verificador; se activa sobre el MVP ya operativo.

**Independent Test**: Desde una misma IP enviar más de 100 solicitudes en un segundo y verificar el rechazo con indicación de espera; desde otra IP verificar que no se ve afectada; simular indisponibilidad del mecanismo de límite y verificar que el servicio sigue respondiendo.

**Acceptance Scenarios**:

1. **Given** que desde una misma IP se han realizado 100 solicitudes en el mismo segundo al servicio de verificación (sumando validar, documento y/o registro), **When** llega la solicitud número 101 a cualquiera de esas operaciones, **Then** el sistema la rechaza e informa cuántos segundos debe esperar antes de reintentar.
2. **Given** dos IPs distintas, **When** una de ellas excede el límite, **Then** la otra sigue pudiendo verificar sin restricción.
3. **Given** que el mecanismo de limitación de tasa no está disponible, **When** llega una solicitud de verificación, **Then** el sistema permite la solicitud (fallback permisivo) en lugar de bloquear a todos los usuarios, y registra el incidente para monitoreo.

---

### Edge Cases

- ¿Qué ocurre si el código tiene exactamente 14 caracteres pero incluye caracteres especiales, espacios o minúsculas? → Se rechaza por formato inválido sin consultar el repositorio.
- ¿Qué ocurre si el código tiene 14 caracteres A–Z/0–9 en mayúsculas? → Formato válido; se consulta el repositorio con coincidencia exacta.
- ¿Qué ocurre si el código está en el día 60 exacto de vigencia (límite de los 60 días calendario)? → Se considera vigente mientras no se haya superado el día 60 en zona `America/Bogota`; a partir del día 61 (inicio del día calendario en esa zona) se trata como expirado.
- ¿Qué ocurre si el almacenamiento de PDFs no está disponible al solicitar el documento? → Se informa un error temporal al verificador y se registra el fallo para monitoreo; no se expone detalle técnico interno.
- ¿Qué ocurre si la cabecera de IP reenviada contiene varias IPs (cadena de proxies)? → Se usa la primera IP de la cadena (cliente original).
- ¿Qué ocurre si se solicita el documento de un código válido cuyo PDF existe pero está corrupto o vacío? → Se trata como archivo no disponible, con alerta interna.
- ¿Qué ocurre con solicitudes al servicio fuera de las operaciones de verificación (p. ej. health)? → El límite de tasa aplica únicamente a las operaciones de verificación pública, no a health ni readiness.
- ¿Qué ocurre si el cliente valida un código vigente pero nunca invoca el registro de auditoría? → No se crea fila; el servidor no auto-registra.
- ¿Qué ocurre si se solicita el registro para un código expirado o inexistente? → Se rechaza la operación sin crear fila de auditoría.

## Requirements *(mandatory)*

### Functional Requirements

**Validación de código (TKT-010 / HU-14 CA-14.1, CA-14.2, CA-14.3)**

- **FR-001**: El sistema MUST permitir validar un código de verificación de exactamente 14 caracteres del alfabeto `A–Z` (mayúsculas) y dígitos `0–9`, sin exigir autenticación.
- **FR-001a**: Cualquier código con minúsculas, longitud distinta de 14 o caracteres fuera de `A–Z0–9` MUST rechazarse por formato inválido **antes** de consultar el repositorio (única regla de formato; consolida el antiguo FR-006).
- **FR-002**: El sistema MUST verificar que el código no haya expirado, aplicando una vigencia de 60 días calendario desde la fecha de expedición del certificado, calculados en zona horaria `America/Bogota`.
- **FR-003**: Ante un código vigente, el sistema MUST confirmar validez e indicar la referencia del archivo del certificado asociado.
- **FR-004**: Ante un código expirado, el sistema MUST informar de forma explícita que la vigencia (60 días) ha vencido y MUST NOT permitir la obtención del PDF.
- **FR-005**: Ante un código inexistente, el sistema MUST informar que el código no existe, sin revelar información adicional útil para enumeración (p. ej. indicios de códigos cercanos o historial).
- **FR-006**: *(retirado — duplicado de FR-001a; ver FR-001a)*
- **FR-007**: El servicio de verificación MUST ser accesible públicamente; MUST NOT requerir token, sesión ni credenciales.

**Obtención del documento (TKT-011 / HU-14 CA-14.1 / RF-28)**

- **FR-008**: Ante un código válido y vigente, el sistema MUST entregar el contenido del PDF del certificado codificado en Base64 (con tipo `application/pdf`) para su visualización en el portal de verificación.
- **FR-008a**: El flujo de verificación MUST NOT devolver URLs pre-firmadas ni enlaces públicos al almacenamiento; la entrega es exclusivamente por contenido Base64 en la respuesta.
- **FR-009**: Antes de entregar el PDF, el sistema MUST aplicar las mismas reglas de validez y vigencia que en la validación del código (FR-001, FR-001a y FR-002 a FR-005).
- **FR-010**: Si el código es válido pero el archivo no existe en el almacenamiento (o está vacío/corrupto), el sistema MUST informar indisponibilidad al verificador y MUST generar una **alerta interna de inconsistencia**. En esta feature, “alerta interna” MUST consistir en: (1) log estructurado WARN/ERROR con `correlationId`, código de verificación y `nombreArchivo` (sin volcar el PDF ni PII adicional), y (2) incremento de un counter Micrometer `verificacion.archivo_ausente` (exportable a Dynatrace). MUST NOT exponer detalles técnicos de S3 al verificador. La configuración de alarmas/pager en Dynatrace queda fuera de alcance (operación).
- **FR-011**: Los PDFs MUST NOT ser públicamente accesibles de forma directa en el almacenamiento; solo se obtienen a través de este servicio de verificación (contenido Base64).

**Registro de auditoría (TKT-012 / RF-29 / RNF-20)**

- **FR-012**: El sistema MUST exponer una operación explícita de registro de verificación que, tras una validación exitosa del código, almacene la IP del verificador y la fecha/hora exacta.
- **FR-012a**: La validación del código y la obtención del documento MUST NOT crear automáticamente filas de auditoría; el registro ocurre solo cuando el cliente invoca la operación de registro.
- **FR-013**: El sistema MUST obtener la IP real del cliente considerando que puede estar detrás de un balanceador o proxy.
- **FR-014**: El sistema MUST permitir un número ilimitado de registros de verificación por código durante su vigencia de 60 días.
- **FR-015**: El sistema MUST NOT registrar en el audit trail los intentos fallidos (código expirado, inexistente o formato inválido); el registro explícito solo aplica tras validación exitosa (HU-14 CA-14.2).
- **FR-015a**: Si el cliente solicita el registro para un código expirado, inexistente o con formato inválido, el sistema MUST rechazar la operación sin crear fila.

**Protección contra abuso (TKT-013 / CA-14.4 / RNF-15)**

- **FR-016**: El sistema MUST limitar las solicitudes de verificación a un máximo de 100 por segundo por dirección IP, con un cupo único compartido entre validación, obtención de documento y registro de auditoría.
- **FR-017**: Al exceder el límite, el sistema MUST rechazar la solicitud e informar el tiempo de espera antes de reintentar.
- **FR-018**: El límite MUST aplicarse de forma independiente por IP; el exceso de una IP MUST NOT afectar a otras.
- **FR-019**: Si el mecanismo de limitación no está disponible, el sistema MUST permitir las solicitudes (fallback permisivo) y registrar el incidente, en lugar de bloquear el servicio completo.
- **FR-020**: El límite de tasa MUST aplicarse a las operaciones públicas de verificación (validar, documento, registro); MUST NOT aplicarse a los chequeos de salud del servicio.

**Fuera de alcance (explícito)**

- **FR-021**: Esta feature MUST NOT incluir el frontend del Portal de Verificación (pertenece a EPIC-06 / TKT-067).
- **FR-022**: Esta feature MUST NOT crear ni modificar el modelo de datos ni las migraciones de las tablas de verificación (ya cubiertas en TKT-005 / `specs/005-modelo-datos-verificaciones`).
- **FR-023**: Esta feature MUST NOT integrar ni depender de PUP, TiendaWS ni SHD.

### Key Entities

- **Código de verificación**: Identificador de 14 caracteres `A–Z0–9` (solo mayúsculas) asociado a un certificado emitido; atributos relevantes: valor del código, fecha de vencimiento (derivada de la expedición + 60 días), referencia al archivo del PDF.
- **Registro de verificación**: Entrada de auditoría de una consulta de verificación; atributos relevantes: código consultado, IP del verificador, fecha/hora.
- **Documento de certificado**: Archivo PDF almacenado de forma no pública, recuperable solo tras validación exitosa del código asociado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un verificador obtiene confirmación de validez de un código vigente en menos de 500 milisegundos en el percentil 95 de las solicitudes.
- **SC-002**: El 100% de las validaciones de códigos vigentes conocidos retornan confirmación positiva con referencia al archivo.
- **SC-003**: El 100% de las validaciones de códigos expirados informan expiración y bloquean la visualización del PDF.
- **SC-004**: El 100% de las validaciones de códigos inexistentes informan que el código no existe, sin filtrar información adicional de enumeración.
- **SC-005**: Tras una validación exitosa seguida del registro explícito por el cliente, existe un registro de auditoría con IP y marca de tiempo consultable; la sola validación sin registro explícito no deja fila.
- **SC-006**: La solicitud número 101 desde la misma IP en el mismo segundo (cupo compartido entre validar/documento/registro) es rechazada con indicación de tiempo de espera; IPs distintas no se afectan entre sí.
- **SC-007**: Ante indisponibilidad del mecanismo de limitación, el sistema MUST aplicar **fallback permisivo** (fail-open): las solicitudes de verificación se atienden y se registra el incidente (log WARN/ERROR); el servicio MUST NOT degradarse a rechazo masivo 429/503 por caída del limitador. Criterio cualitativo verificable por IT (Redis detenido → requests pasan); **no** se exige medición del “99%” en CI ni prueba de carga en el alcance de esta feature.
- **SC-008**: Un verificador con código vigente puede obtener el PDF en Base64 y visualizarlo en el portal sin autenticarse.
- **SC-009**: Ninguna operación de verificación exige credenciales; el acceso público se mantiene para el 100% de los flujos de esta feature.

## Assumptions

- Se reutiliza el esquema y las tablas de verificación ya creados por TKT-005 (`specs/005-modelo-datos-verificaciones`): códigos y registros de verificación existen y están listos para consulta/inserción.
- El andamiaje del microservicio `verificacion` (TKT-001) y el núcleo compartido (TKT-002) ya están disponibles.
- La distinción entre código expirado y código inexistente (mensajes diferenciados) se mantiene según HU-14 (CA-14.2 y CA-14.3); la frase de anti-enumeración de la descripción se interpreta como "no revelar información extra sobre códigos inexistentes", no como unificar ambos errores.
- El día límite de vigencia se interpreta en días calendario completos en `America/Bogota` (decisión clarify Q4:A): un código expedido el día D vence al finalizar el día D+60; a partir del inicio del día D+61 está expirado.
- La entrega del PDF al verificador es responsabilidad de este servicio backend; el portal Angular (TKT-067) solo consume el resultado para renderizarlo.
- El almacenamiento definitivo de PDFs es Amazon S3 (restricción institucional); en verificación la entrega al cliente es Base64 en la respuesta (decisión clarify Q2:A). Las URLs pre-firmadas (RNF-19) aplican al canal de descargas autenticado, no a este flujo público.
- Redis u otro almacén compartido para el contador de tasa ya está disponible en el entorno local y en los ambientes CCB (TKT-004).
- El volumen esperado del canal de verificación es compatible con el SLA de P95 < 500 ms bajo la carga típica de la CCB.
- No existe límite de cantidad de verificaciones por código durante su vigencia (decisión ya resuelta en el PRD).
- El audit trail registra únicamente verificaciones exitosas; los rechazos (expirado, inexistente, formato inválido, rate limit) no generan fila de auditoría (decisión Q1:A, alineada a HU-14 CA-14.2).
- El registro de auditoría es una operación explícita invocada por el cliente tras validación exitosa; ni la validación ni la obtención del documento auto-registran (decisión clarify Q1:B).
- El portal de verificación (TKT-067, fuera de alcance) es responsable de invocar el registro tras un código válido; esta feature solo garantiza el contrato de la operación de escritura.
- El código de verificación admite solo `A–Z` y `0–9` (14 caracteres); las minúsculas son formato inválido (decisión clarify Q3:C). La búsqueda en repositorio es por coincidencia exacta del valor almacenado.
- El rate limit es un cupo único de 100 req/s por IP compartido entre validar, documento y registro (decisión clarify Q5:A).
- La “alerta interna” de inconsistencia código vigente sin archivo (FR-010) se materializa como log estructurado + métrica Micrometer `verificacion.archivo_ausente`; no implica ticket automático ni integración a pager en el alcance de esta feature.
- SC-007 (fallback permisivo si Redis/Bucket4j no está disponible) se verifica de forma cualitativa en IT (fail-open + log); no se instrumenta umbral porcentual tipo “99%” en CI.
