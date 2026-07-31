# Feature Specification: Portal de Verificación de Certificados

**Feature Branch**: `007-portal-verificacion`

**Created**: 2026-07-30

**Status**: Ready for implementation

**Input**: User description: "Implementar el Portal de Verificación (EPIC-06 / TKT-067 / HU-14 / RF-28) como SPA pública sin autenticación: el tercero verificador ingresa un código de 14 caracteres, valida la autenticidad del certificado contra el servicio público de verificación, visualiza el PDF con un visor integrado y registra la verificación. La UI debe conservar la imagen corporativa del Servicio Virtual CCB del sitio actual (guía docs/IMAGEN_CORPORATIVA_PORTAL_VERIFICACION.md y ADR-0001). Ticket cubierto: TKT-067. Prerequisitos: API pública de verificación ya especificada/implementada (TKT-010..013 / feature 006); scaffold Angular portal-verificacion y port de activos/tema corporativo CCB ya iniciados."

## Clarifications

### Session 2026-07-30

- Q: ¿Cómo normaliza el portal el código pegado/escrito antes de validar formato? → A: Normalizar antes de validar: recortar espacios exteriores + convertir a mayúsculas; luego aplicar la regla de exactamente 14 caracteres `A–Z0–9`
- Q: ¿Qué ocurre con el botón/formulario mientras la verificación está en curso? → A: Deshabilitar solo el botón de verificar y mostrar estado de carga hasta la respuesta; el campo de código permanece editable
- Q: ¿En qué orden invoca el portal al servicio público en el flujo feliz? → A: Tres pasos en orden: validar → documento → registro de auditoría
- Q: ¿Qué feedback recibe el usuario si falla el registro de auditoría tras un éxito? → A: Silencioso para el usuario: sin mensaje sobre el fallo de auditoría; resultado y PDF permanecen visibles
- Q: ¿Se mantiene la aceptación de T&C al iniciar otra verificación en la misma visita? → A: Mantener T&C marcados al limpiar el resultado anterior / iniciar otra verificación en la misma visita

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Verificar autenticidad e ingresar código (Priority: P1) 🎯 MVP

Como tercero verificador (ciudadano, entidad o contraparte comercial), quiero ingresar en un portal público el código de verificación de 14 caracteres de un certificado electrónico, aceptar los términos y condiciones, y conocer si el certificado es auténtico y vigente, para confirmar la legitimidad del documento que recibí sin necesidad de cuenta ni login.

**Why this priority**: Es el valor central de HU-14 / RF-28 y de TKT-067. Sin el flujo de ingreso + validación no hay portal útil; el visor y el registro dependen de este resultado.

**Independent Test**: Abrir el portal sin credenciales, ingresar un código vigente conocido (aceptando T&C), un código expirado y uno inexistente, y verificar los tres resultados diferenciados; además, intentar códigos con formato inválido y comprobar rechazo en pantalla sin consultar el servicio.

**Acceptance Scenarios**:

1. **Given** un visitante en el portal público sin sesión ni credenciales, **When** accede a la pantalla de verificación, **Then** puede ver el formulario de ingreso de código y la identidad visual del Servicio Virtual CCB, sin que se le solicite autenticación.
2. **Given** que el visitante no ha marcado el checkbox de Términos y Condiciones, **When** observa el botón de verificación, **Then** el botón permanece deshabilitado y no puede iniciar la consulta.
3. **Given** que el visitante ha aceptado los Términos y Condiciones e ingresa un código de exactamente 14 caracteres en mayúsculas (`A–Z` y `0–9`) correspondiente a un certificado vigente, **When** solicita verificar, **Then** el portal confirma la autenticidad del certificado.
4. **Given** un código de 14 caracteres que existe pero cuya vigencia (60 días calendario desde la expedición) ha vencido, **When** el visitante solicita verificar (con T&C aceptados), **Then** el portal muestra un mensaje orientativo de que el código ha expirado y NO muestra el documento PDF.
5. **Given** un código de 14 caracteres que no existe, **When** el visitante solicita verificar (con T&C aceptados), **Then** el portal muestra un mensaje de que el código no existe, sin revelar información adicional útil para enumeración.
6. **Given** un código que, tras recortar espacios exteriores y convertir a mayúsculas, queda con longitud distinta de 14 o con caracteres fuera de `A–Z0–9` (p. ej. espacios internos o símbolos), **When** el visitante intenta verificar, **Then** el portal muestra un error inline de formato y NO invoca al servicio de verificación.
7. **Given** un código pegado con espacios exteriores y/o minúsculas que, tras normalizar (trim + mayúsculas), resulta en exactamente 14 caracteres `A–Z0–9` vigentes, **When** el visitante solicita verificar (con T&C aceptados), **Then** el portal acepta el código normalizado e invoca al servicio de verificación.
8. **Given** que el visitante ha iniciado una verificación con T&C aceptados y el servicio aún no responde, **When** observa el formulario, **Then** el botón de verificación está deshabilitado con indicación de carga, no puede disparar otra consulta con ese botón, y el campo de código permanece editable.
9. **Given** que el visitante ya verificó un código con T&C aceptados y el resultado/visor se limpia para otra consulta en la misma visita, **When** observa el checkbox de Términos y Condiciones, **Then** permanece marcado sin exigir una nueva aceptación (salvo desmarcado manual).

---

### User Story 2 - Visualizar y descargar el PDF del certificado (Priority: P1)

Como tercero verificador que acaba de obtener un resultado válido y vigente, quiero ver el PDF del certificado en un visor integrado en la misma experiencia y poder descargarlo, para contrastar visualmente el documento con el que recibí.

**Why this priority**: Completa el happy path de CA-14.1 (RF-28). Sin el visor, la verificación queda incompleta frente al sitio actual del Servicio Virtual.

**Independent Test**: Con un código vigente cuyo documento está disponible en el servicio público, completar la verificación y comprobar que el PDF se muestra en el marco del visor y que la descarga entrega el mismo documento; con código expirado o inexistente, comprobar que el visor no aparece.

**Acceptance Scenarios**:

1. **Given** una verificación exitosa de un código vigente cuyo documento está disponible, **When** el portal recibe el contenido del certificado (tras validar y luego obtener el documento), **Then** lo muestra en un visor integrado dentro de un contenedor con marco punteado acorde a la imagen corporativa.
2. **Given** que el visor muestra un certificado, **When** el verificador elige descargar, **Then** obtiene el archivo PDF del certificado.
3. **Given** un resultado de código expirado o inexistente, o ausencia de contenido de documento, **When** se presenta el resultado, **Then** el portal NO renderiza el visor PDF.
4. **Given** una verificación exitosa pero el servicio indica que el archivo no está disponible, **When** se presenta el resultado, **Then** el portal informa al verificador de forma clara y orientativa, sin exponer detalles técnicos internos.

---

### User Story 3 - Registrar la verificación exitosa para auditoría (Priority: P2)

Como responsable de cumplimiento de la CCB, quiero que cada verificación exitosa realizada desde el portal registre automáticamente la consulta (IP y fecha/hora capturadas por el servicio), para disponer del rastro de auditoría alineado a HU-14 y al servicio público ya especificado.

**Why this priority**: Cumple el cierre del flujo CA-14.1 y la clarificación del servicio público (registro explícito tras éxito; sin filas para fallos). El valor al ciudadano es US1/US2; la auditoría es obligación institucional.

**Independent Test**: Completar una verificación exitosa y comprobar que el portal solicita el registro de auditoría una vez; repetir con códigos expirados, inexistentes o de formato inválido y comprobar que no se solicita registro.

**Acceptance Scenarios**:

1. **Given** una verificación exitosa (código vigente con documento obtenido), **When** el flujo termina con éxito, **Then** el portal invoca automáticamente el registro de auditoría **después** de validar y de obtener el documento (sin acción adicional del usuario).
2. **Given** un intento fallido en validación (formato inválido, código expirado o inexistente), **When** el portal muestra el mensaje de error correspondiente, **Then** NO solicita el documento ni el registro de auditoría.
3. **Given** que la validación fue exitosa pero la obtención del documento falla, **When** se presenta el resultado, **Then** el portal NO solicita el registro de auditoría.
4. **Given** que el registro de auditoría falla de forma transitoria tras una verificación ya exitosa, **When** el verificador ya ve el resultado y el PDF, **Then** la experiencia de verificación permanece útil (resultado y documento visibles), el fallo es no bloqueante y el portal NO muestra ningún mensaje al usuario sobre el fallo de auditoría.

---

### User Story 4 - Experiencia con imagen corporativa CCB e inclusión (Priority: P2)

Como visitante del Servicio Virtual CCB, quiero que el portal de verificación conserve la identidad visual institucional (logo, rótulos, tipografía, botones y alertas) y sea usable con accesibilidad adecuada, para reconocer la marca oficial y completar la verificación sin barreras.

**Why this priority**: La imagen corporativa es inmutable (guía de imagen corporativa y ADR de librería frontend). La accesibilidad (RNF-33) y el tiempo de carga (RNF-32) son requisitos de aceptación del ticket y del canal público.

**Independent Test**: Revisar el primer viewport frente al checklist visual §6 de la guía de imagen corporativa; medir carga inicial en condiciones 3G; evaluar contraste, foco y mensajes con criterios WCAG 2.1 AA.

**Acceptance Scenarios**:

1. **Given** cualquier ruta del portal, **When** el visitante carga la página, **Then** ve el shell corporativo: logo CCB, texto “Servicio Virtual”, barra institucional `#033864` con “Certificados Electrónicos” y menú off-canvas con enlaces institucionales y legales.
2. **Given** la pantalla de verificación, **When** se muestra el formulario, **Then** usa el lenguaje visual corporativo (título con acento institucional, alerta informativa de vigencia de 60 días, lista de instrucciones, controles y botones con tokens de marca `--ccb-*`), sin apariencia de Material Design ni tipografías/temas genéricos ajenos a la marca.
3. **Given** tipografía corporativa TradeGothicLTPro disponible, **When** se renderiza el texto, **Then** se usa esa familia; si no está disponible, se aplica el fallback Helvetica/Arial definido en la guía.
4. **Given** un usuario que navega con teclado o usa lector de pantalla, **When** completa el flujo principal de verificación, **Then** puede operar controles, percibir errores y estados con contraste y foco suficientes para WCAG 2.1 nivel AA.

---

### Edge Cases

- ¿Qué ocurre si el código, tras normalizar (trim de espacios exteriores + mayúsculas), tiene exactamente 14 caracteres pero aún incluye caracteres especiales o espacios internos? → Error inline de formato; no se llama al servicio.
- ¿Qué ocurre si el usuario pega un código con espacios al inicio/final y/o minúsculas? → Se normaliza (trim + mayúsculas) antes de validar; si el resultado es 14 caracteres `A–Z0–9`, se acepta; si no, error inline sin llamar al servicio.
- ¿Qué ocurre si el usuario cambia el código tras un resultado previo? → Se limpia el resultado/visor anteriores al iniciar una nueva verificación o al editar el campo de forma que invalide el resultado mostrado; la aceptación de T&C permanece marcada en la misma visita.
- ¿Qué ocurre con el checkbox de T&C al verificar un segundo código en la misma visita? → Permanece marcado; el usuario no debe volver a aceptarlo salvo que lo desmarque manualmente.
- ¿Qué ocurre si el servicio público responde límite de tasa excedido? → Se muestra un mensaje orientativo de reintentar más tarde, sin PDF ni registro.
- ¿Qué ocurre si el servicio público no está disponible o hay error de red? → Mensaje genérico de error temporal; sin PDF ni registro.
- ¿Qué ocurre si hay contenido de documento vacío tras un éxito aparente? → No se renderiza el visor; se informa indisponibilidad del documento; no se solicita registro de auditoría.
- ¿En qué orden se llaman las operaciones del servicio público? → Validar → (solo si vigente) documento → (solo si documento obtenido) registro de auditoría.
- ¿Qué ocurre en viewport estrecho (móvil)? → El shell conserva logo y menú (texto “Servicio Virtual” puede ocultarse en anchos menores según la guía); el formulario y el visor permanecen usables.
- ¿Qué ocurre si el visitante no acepta T&C pero el código es válido en formato? → El CTA permanece deshabilitado; no hay llamada al servicio.
- ¿Qué ocurre si el usuario hace doble clic o reintenta mientras la verificación está en curso? → El botón de verificación permanece deshabilitado con estado de carga hasta la respuesta; no se inician consultas adicionales por ese CTA. El campo de código sigue editable.

## Requirements *(mandatory)*

### Functional Requirements

**Acceso público y shell**

- **FR-001**: El portal MUST ser accesible públicamente sin login, sin sesión persistida y sin exigir credenciales de ningún tipo.
- **FR-002**: El portal MUST presentar el shell del Servicio Virtual CCB en todas las rutas: logo CCB, “Servicio Virtual”, barra `#033864` con “Certificados Electrónicos” y menú off-canvas con enlaces a canales CCB, Términos y Condiciones y contenidos legales.
- **FR-003**: El portal MUST consumir exclusivamente el servicio público de verificación ya definido (feature `006-servicio-publico-verificacion`); MUST NOT depender de autenticación Cognito/MAUC ni de los portales autenticados de certificados.

**Ingreso y validación de código**

- **FR-004**: El portal MUST permitir ingresar un código de verificación que, tras normalización, sea exactamente 14 caracteres del alfabeto `A–Z` (mayúsculas) y dígitos `0–9`.
- **FR-004a**: Antes de validar formato, el portal MUST normalizar el valor ingresado recortando espacios en blanco solo al inicio y al final y convirtiendo letras a mayúsculas. MUST NOT eliminar espacios internos ni otros caracteres.
- **FR-005**: Ante longitud incorrecta o caracteres inválidos **después** de la normalización (FR-004a), el portal MUST mostrar error inline y MUST NOT invocar al servicio de verificación.
- **FR-006**: El portal MUST exigir la aceptación explícita de los Términos y Condiciones (checkbox) antes de habilitar el botón de verificación; el botón MUST permanecer deshabilitado hasta aceptar.
- **FR-006a**: Mientras una verificación está en curso (esperando respuesta del servicio), el portal MUST deshabilitar el botón de verificación, MUST mostrar un estado de carga perceptible, y MUST NOT iniciar otra consulta por ese botón hasta completar o fallar la solicitud en curso. El campo de código MUST permanecer editable durante la espera.
- **FR-006b**: Al limpiar un resultado/visor previo o al iniciar otra verificación en la misma visita, el portal MUST conservar el checkbox de Términos y Condiciones marcado (el usuario MAY desmarcarlo manualmente).
- **FR-007**: El portal MUST ofrecer acceso al documento de Términos y Condiciones de verificación de certificados electrónicos mediante el enlace institucional `https://recursos.ccb.org.co/ccb/servicios_linea/tyc/Terminos_Y_condiciones_verificacion_Certificados_Electronicos.pdf`.
- **FR-008**: Ante código vigente, el portal MUST confirmar autenticidad y continuar al flujo de visualización del documento.
- **FR-008a**: En el flujo feliz, el portal MUST invocar al servicio público en este orden: (1) validar el código, (2) obtener el documento solo si la validación indica vigente, (3) registrar la auditoría solo si el documento fue obtenido exitosamente. MUST NOT omitir la validación previa ni solicitar documento/registro tras un rechazo de validación. FR-016 y FR-017 detallan el paso de auditoría bajo este orden.
- **FR-009**: Ante código expirado (vigencia de 60 días calendario superada, según reglas del servicio público), el portal MUST mostrar un mensaje que indique que ha expirado y MUST NOT mostrar el PDF.
- **FR-010**: Ante código inexistente, el portal MUST mostrar un mensaje que indique que no existe, sin revelar información adicional.
- **FR-011**: El formulario MUST informar al usuario que la vigencia de verificación es de 60 días calendario (consultas ilimitadas dentro de esa vigencia), alineado a la guía de imagen corporativa y al sitio actual.

**Visor y descarga del documento**

- **FR-012**: Tras verificación exitosa con documento disponible, el portal MUST mostrar el PDF en un visor integrado dentro de un contenedor con marco punteado (look corporativo del visor actual).
- **FR-013**: Si no hay contenido de documento, el portal MUST NOT renderizar el visor.
- **FR-014**: El portal MUST permitir descargar el PDF desde el visor cuando hay documento mostrado.
- **FR-015**: El portal MUST NOT mostrar el PDF en escenarios de código expirado, inexistente o formato inválido.

**Registro de verificación**

- **FR-016**: Según FR-008a paso (3): tras una verificación exitosa (código vigente y documento obtenido), el portal MUST invocar automáticamente el registro de auditoría (`POST .../registros`).
- **FR-017**: Según FR-008a: el portal MUST NOT solicitar registro de auditoría para intentos fallidos (formato inválido, expirado, inexistente o documento no disponible).
- **FR-017a**: Si la validación rechaza el código, el portal MUST NOT invocar la obtención del documento.
- **FR-018**: Un fallo del registro de auditoría MUST NOT impedir al usuario ver el resultado de autenticidad y el PDF ya obtenidos. El portal MUST NOT mostrar mensaje al usuario sobre el fallo de auditoría (silencioso en UI). El cliente MAY registrar el fallo solo en observabilidad interna (`console.warn` o flag interno); MUST NOT exponer detalle técnico al verificador.

**Imagen corporativa e inclusión**

- **FR-019**: La UI MUST conservar la imagen corporativa del Servicio Virtual CCB definida en la guía de imagen del portal de verificación (tokens de marca `--ccb-*`, tipografía TradeGothicLTPro o fallback Helvetica/Arial, patrones de formulario corporativos) y MUST cumplir el checklist visual §6 de dicha guía.
- **FR-020**: El portal MUST NOT adoptar Material Design, tipografías genéricas Inter/Roboto como tipografía principal, “pills” redondeadas ni degradados púrpura ajenos a la marca CCB.
- **FR-021**: El portal MUST cumplir accesibilidad WCAG 2.1 nivel AA (RNF-33) en el flujo principal de verificación (formularios, errores, contraste, foco y estados del botón).

**Rendimiento percibido**

- **FR-022**: El portal MUST cargar la experiencia inicial en menos de 3 segundos en condiciones de conexión 3G (RNF-32). Si el peso del visor de documentos impide cumplir ese umbral, el portal MUST diferir la carga del visor hasta que sea necesario (tras una verificación exitosa), sin degradar el shell ni el formulario inicial.

### Key Entities

- **Código de verificación**: Identificador de 14 caracteres (`A–Z0–9` en mayúsculas) impreso o asociado al certificado electrónico; vigencia de 60 días calendario desde la expedición (reglas del servicio público). En el portal, el valor ingresado se normaliza (trim de extremos + mayúsculas) antes de validar formato y consultar el servicio.
- **Resultado de verificación**: Estado de UI alineado al contrato de cliente — `vigente`, `expirado`, `inexistente`, `formato_invalido`, `documento_no_disponible`, `rate_limit`, `error_temporal` (más `idle`/`loading`) — con mensajes orientativos diferenciados.
- **Documento del certificado**: Contenido PDF obtenido del servicio público tras validación exitosa; se visualiza en el visor y puede descargarse.
- **Registro de verificación**: Evento de auditoría (`POST .../registros`) solicitado por el portal solo tras éxito; IP y fecha/hora son responsabilidad del servicio (lado servidor).
- **Términos y Condiciones**: Consentimiento obligatorio del verificador antes de consultar; enlace al PDF institucional `https://recursos.ccb.org.co/ccb/servicios_linea/tyc/Terminos_Y_condiciones_verificacion_Certificados_Electronicos.pdf`.
- **Identidad visual Servicio Virtual CCB**: Shell, tokens de color, tipografía y patrones de formulario/visor que el portal debe preservar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un verificador completa el flujo feliz (aceptar T&C → código vigente → ver PDF → registro automático) en menos de 2 minutos en la primera visita.
- **SC-002**: CA-14.1 — El 100% de las verificaciones exitosas de prueba siguen el orden validar → documento → registro, muestran el visor PDF y solicitan el registro de auditoría automáticamente tras obtener el documento.
- **SC-003**: CA-14.2 — Ante códigos expirados de prueba, el 100% de los casos muestran mensaje de que ha expirado y el 0% muestran el PDF.
- **SC-004**: CA-14.3 — Ante códigos inexistentes de prueba, el 100% de los casos muestran mensaje de que no existe, sin información adicional de enumeración.
- **SC-005**: Códigos con formato inválido **después de normalización** (trim + mayúsculas) producen error en pantalla en el 100% de los casos de prueba sin llamar al servicio de verificación; códigos que solo difieren por espacios exteriores o minúsculas y normalizan a 14 caracteres `A–Z0–9` se aceptan en el 100% de esos casos de prueba.
- **SC-006**: El botón de verificación permanece deshabilitado en el 100% de los casos hasta aceptar Términos y Condiciones; tras una verificación en la misma visita, el checkbox permanece marcado en el 100% de los casos de prueba al limpiar el resultado (salvo desmarcado manual).
- **SC-007**: La carga inicial del portal (shell + formulario usable) ocurre en menos de 3 segundos en conexión 3G (RNF-32).
- **SC-008**: El flujo principal cumple WCAG 2.1 nivel AA en evaluación de accesibilidad (RNF-33); sin fallos bloqueantes de contraste, foco o etiquetado en controles críticos.
- **SC-009**: El checklist visual §6 de la guía de imagen corporativa del portal de verificación se cumple al 100% (logo + “Servicio Virtual” + barra `#033864` + tipografía corporativa o fallback + botones/alertas con tokens de marca).
- **SC-010**: Al menos el 95% de verificadores de prueba comprenden el resultado (válido / expirado / no existe) sin asistencia, medido en prueba de usabilidad corta o revisión de aceptación con negocio.

## Assumptions

- El servicio público de verificación (feature `006-servicio-publico-verificacion` / TKT-010..013) está disponible con validación de código, obtención de documento y registro de auditoría; el portal no implementa ni modifica ese microservicio.
- El scaffold del portal de verificación y el port inicial de activos/tema corporativo CCB ya existen en el monorepo; esta feature completa el flujo funcional sobre esa base.
- Las reglas de formato del código, vigencia de 60 días (`America/Bogota`), mensajes de expirado/inexistente y la política de auditoría solo en éxitos son las ya clarificadas en el servicio público; el portal las refleja en UX.
- El contenido del documento se obtiene según el contrato del servicio público (contenido del PDF listo para el visor integrado); no se usan URLs pre-firmadas S3 en este flujo.
- El portal orquesta el flujo feliz en tres llamadas secuenciales al servicio público: validar → documento → registro de auditoría (FR-008a).
- CORS y orígenes permitidos siguen la política institucional (`*.ccb.org.co` en producción; localhost solo en no-prod).
- Fuera de alcance: portal de certificados autenticado, Cognito/MAUC, carrito, pagos, historial de descargas, generación de PDFs, cambios al microservicio `verificacion` y migración ETL del legado.
- El desarrollo de la lógica del portal (servicios y componentes del flujo) sigue TDD, conforme a la constitución del proyecto.
- La licencia web de TradeGothicLTPro para el dominio de despliegue debe confirmarse con CCB antes de producción; si no aplica, se mantiene el fallback tipográfico de la guía.
- La URL canónica de Términos y Condiciones de verificación es `https://recursos.ccb.org.co/ccb/servicios_linea/tyc/Terminos_Y_condiciones_verificacion_Certificados_Electronicos.pdf` (guía de imagen corporativa §7 / sitio actual).
