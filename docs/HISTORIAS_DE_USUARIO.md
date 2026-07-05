# Historias de Usuario — Sistema de Certificados Electrónicos CCB

**Producto:** Certificados Electrónicos — Cámara de Comercio de Bogotá  
**Versión:** 1.1  
**Fecha:** Junio 2026  
**Derivado de:** PRD v2.3 — Casos de Uso UC-01 a UC-06, UC-14 y UC-15

---

## Índice

1. [HU-01 — Buscar inscrito en el registro mercantil](#hu-01--buscar-inscrito-en-el-registro-mercantil)
2. [HU-02 — Consultar catálogo de certificados disponibles](#hu-02--consultar-catálogo-de-certificados-disponibles)
3. [HU-03 — Solicitar certificados estándar](#hu-03--solicitar-certificados-estándar)
4. [HU-03A — Autenticarse como afiliado mediante MAUC SSO](#hu-03a--autenticarse-como-afiliado-mediante-mauc-sso)
5. [HU-04 — Solicitar certificados como afiliado](#hu-04--solicitar-certificados-como-afiliado)
6. [HU-05 — Consultar matrícula principal de establecimiento](#hu-05--consultar-matrícula-principal-de-establecimiento)
7. [HU-06 — Solicitar certificados especiales](#hu-06--solicitar-certificados-especiales)
8. [HU-06A — Solicitar certificado negativo como no matriculado](#hu-06a--solicitar-certificado-negativo-como-no-matriculado)
9. [HU-06B — Consultar registros de Kardex mercantil](#hu-06b--consultar-registros-de-kardex-mercantil-para-certificados-textuales)
10. [HU-06C — Generar carta de solicitud para certificados especiales](#hu-06c--generar-carta-de-solicitud-para-certificados-especiales)
11. [HU-07A — Autenticarse en el módulo de depósitos financieros](#hu-07a--autenticarse-en-el-módulo-de-depósitos-financieros)
12. [HU-07 — Solicitar certificados de depósitos financieros](#hu-07--solicitar-certificados-de-depósitos-financieros)
13. [HU-07B — Generar carta de solicitud para depósitos financieros](#hu-07b--generar-y-gestionar-carta-de-solicitud-para-depósitos-financieros)
14. [HU-08 — Solicitar certificados de costumbres mercantiles](#hu-08--solicitar-certificados-de-costumbres-mercantiles)
15. [HU-09 — Solicitar certificados desde la app móvil](#hu-09--solicitar-certificados-desde-la-app-móvil)
16. [HU-10 — Pagar certificados vía pasarela electrónica](#hu-10--pagar-certificados-vía-pasarela-electrónica)
17. [HU-11 — Registrar pago en cero para afiliados](#hu-11--registrar-pago-en-cero-para-afiliados)
18. [HU-12 — Consultar historial de certificados disponibles](#hu-12--consultar-historial-de-certificados-disponibles)
19. [HU-13 — Descargar certificado en PDF](#hu-13--descargar-certificado-en-pdf)
20. [HU-14 — Verificar autenticidad de un certificado](#hu-14--verificar-autenticidad-de-un-certificado)
21. [HU-15 — Notificar certificado generado por backoffice](#hu-15--notificar-certificado-generado-por-backoffice)
22. [HU-16 — Devolver solicitud de certificado](#hu-16--devolver-solicitud-de-certificado)
23. [HU-17 — Consultar certificados por número de orden](#hu-17--consultar-certificados-generados-por-número-de-orden)

---

## HU-01 — Buscar inscrito en el registro mercantil

**Caso de uso origen:** UC-01 (sub-flujo de búsqueda)

### Historia

**Como** solicitante público o afiliado CCB,  
**Quiero** buscar un inscrito en el registro mercantil por matrícula, NIT, razón social o número de proponente,  
**Para** identificar la persona natural o jurídica a la cual deseo solicitar certificados.

### Criterios de aceptación

#### CA-01.1 — Búsqueda exitosa por matrícula (Happy Path)

**Dado** que el solicitante se encuentra en el portal de certificados y existe un inscrito con matrícula `00012345`,  
**Cuando** ingresa el número de matrícula `12345` y ejecuta la búsqueda,  
**Entonces** el sistema formatea la matrícula con pad-left a 8 dígitos (`00012345`), consulta el servicio REST de Inscritos y muestra los datos del inscrito (razón social, NIT, estado de matrícula, dirección).

#### CA-01.2 — Búsqueda sin resultados (Error)

**Dado** que el solicitante ingresa un número de matrícula que no existe en el registro mercantil,  
**Cuando** ejecuta la búsqueda,  
**Entonces** el sistema muestra un mensaje informativo indicando "No se encontraron inscritos con los criterios ingresados" y no permite avanzar al paso de selección de certificados.

#### CA-01.3 — Búsqueda por nombre con múltiples resultados (Edge Case)

**Dado** que el solicitante ingresa una razón social parcial que coincide con más de 50 inscritos,  
**Cuando** ejecuta la búsqueda,  
**Entonces** el sistema muestra los resultados paginados, permite al solicitante navegar entre páginas y seleccionar el inscrito deseado sin degradación del rendimiento (P95 < 2 segundos).

#### CA-01.4 — Servicio REST de Inscritos no disponible (Error)

**Dado** que el servicio REST de Inscritos se encuentra caído o no responde en 5 segundos,  
**Cuando** el solicitante ejecuta una búsqueda,  
**Entonces** el sistema muestra un mensaje de error amigable ("El servicio de búsqueda no está disponible en este momento, intente nuevamente") y registra el error en los logs con el correlation ID.

#### CA-01.5 — Búsqueda por NIT con formato incorrecto (Edge Case)

**Dado** que el solicitante ingresa un NIT con caracteres no numéricos o con longitud superior a 15 dígitos,  
**Cuando** intenta ejecutar la búsqueda,  
**Entonces** el sistema valida el formato antes de consultar el servicio externo, muestra un mensaje de validación ("El NIT debe contener solo dígitos y máximo 15 caracteres") y no realiza la consulta al servicio REST.

---

## HU-02 — Consultar catálogo de certificados disponibles

**Caso de uso origen:** UC-01 (sub-flujo de catálogo)

### Historia

**Como** solicitante público,  
**Quiero** consultar los tipos de certificados disponibles para una matrícula específica,  
**Para** conocer cuáles certificados puedo solicitar y sus costos antes de agregarlos al carrito.

### Criterios de aceptación

#### CA-02.1 — Consulta exitosa del catálogo (Happy Path)

**Dado** que el solicitante ha buscado y seleccionado un inscrito con matrícula activa,  
**Cuando** el sistema consulta el catálogo de certificados disponibles vía TiendaWS,  
**Entonces** se muestra la lista de tipos de certificado con su nombre, descripción y precio unitario, excluyendo los certificados: «Información» (8), «Negativo de Inscripción» (13), «Negativos Registro Mercantil - ESAL» (14), «Negativo de Agencia Comercial» (19), «Negativo de Prenda» (20), «Negativo de Quiebra» (21), «Negativo de Embargo» (22), «Negativo de Quiebra y Embargo» (23), «Negativo de Quiebra, Embargo e Inhabilidad» (24), «Negativo de Quiebra e Inhabilidad o Incapacidad» (25), «Negativo de Embargo e Inhabilidad o Incapacidad» (26), «Negativo de Inhabilidad o Incapacidad» (27), «Negativo de Reserva de Dominio» (28).

#### CA-02.2 — Proponente en estado restringido (Edge Case)

**Dado** que el inscrito seleccionado es un proponente con estado 2800 o 2802,  
**Cuando** el sistema consulta el catálogo,  
**Entonces** se excluye adicionalmente el certificado «Inscripción de Documentos» (7) de la lista de certificados disponibles, además de los certificados ya excluidos por regla general.

#### CA-02.3 — TiendaWS no responde (Error)

**Dado** que el servicio TiendaWS no responde dentro del timeout de 8 segundos,  
**Cuando** el sistema intenta consultar el catálogo,  
**Entonces** el circuit breaker se activa, el sistema muestra un mensaje de servicio temporalmente no disponible y no permite continuar con la solicitud hasta que el servicio se recupere.

#### CA-02.4 — Matrícula sin certificados disponibles (Edge Case)

**Dado** que el inscrito seleccionado tiene una matrícula cuyo estado no permite la emisión de ningún tipo de certificado (por ejemplo, matrícula cancelada),  
**Cuando** el sistema consulta el catálogo,  
**Entonces** se muestra un mensaje indicando que no hay certificados disponibles para esta matrícula y se ofrece la opción de buscar otro inscrito.

---

## HU-03 — Solicitar certificados estándar

**Caso de uso origen:** UC-01

### Historia

**Como** solicitante público,  
**Quiero** seleccionar uno o más certificados del catálogo, diligenciar mis datos y liquidar la solicitud,  
**Para** obtener una orden de pago que me permita adquirir los certificados mercantiles electrónicos que necesito.

### Criterios de aceptación

#### CA-03.1 — Liquidación exitosa con carrito válido (Happy Path)

**Dado** que el solicitante ha seleccionado 3 certificados para la matrícula `00012345` y ha diligenciado sus datos personales (tipo documento, número, nombres, email),  
**Cuando** confirma la solicitud y el sistema liquida contra PUP (servicioId=36),  
**Entonces** se crea el registro del solicitante, la solicitud en estado GENERADA (estado 6), se registra la trazabilidad, se genera la cotización con el número de orden de PUP y el total a pagar, y se retorna al frontend la URL de la pasarela de pagos con el solicitudId encriptado.

#### CA-03.2 — Carrito excede el máximo de 100 unidades (Error)

**Dado** que el solicitante intenta agregar un certificado al carrito y ya tiene 100 unidades seleccionadas,  
**Cuando** intenta agregar el certificado número 101,  
**Entonces** el sistema rechaza la adición, muestra un mensaje "El máximo de certificados por transacción es 100" y mantiene el carrito con los 100 ítems existentes sin perder la selección previa.

#### CA-03.3 — PUP retorna error en la liquidación (Error)

**Dado** que el solicitante ha completado todos los pasos correctamente,  
**Cuando** el sistema invoca `RealizarLiquidacion` en PUP y el servicio retorna un error (timeout o fault SOAP),  
**Entonces** el sistema no crea la cotización, registra trazabilidad del error, muestra un mensaje al usuario indicando que la liquidación falló y ofrece reintentar sin perder los datos ingresados.

#### CA-03.4 — Solicitud con email inválido (Edge Case)

**Dado** que el solicitante ha diligenciado sus datos pero el campo email contiene un formato inválido (ejemplo: "usuario@"),  
**Cuando** intenta confirmar la solicitud,  
**Entonces** el sistema valida el formato del email antes de invocar PUP, muestra el error de validación en el campo correspondiente y no permite continuar hasta que se corrija.

#### CA-03.5 — Doble clic en el botón de liquidar (Edge Case)

**Dado** que el solicitante hace doble clic en el botón "Liquidar" en un intervalo menor a 2 segundos,  
**Cuando** se procesan ambas peticiones,  
**Entonces** el sistema implementa idempotencia: solo procesa la primera solicitud, la segunda retorna la misma respuesta de la primera sin crear duplicados en la base de datos ni en PUP.

---

## HU-03A — Autenticarse como afiliado mediante MAUC SSO

**Caso de uso origen:** UC-02 (precondición de autenticación)

### Historia

**Como** afiliado CCB,  
**Quiero** autenticarme en el sistema mediante MAUC SSO y que se valide que soy representante legal de la matrícula,  
**Para** acceder al beneficio de certificados gratuitos con la certeza de que mi identidad ha sido verificada de forma segura e institucional.

### Criterios de aceptación

#### CA-03A.1 — Autenticación exitosa vía MAUC SSO y validación de representante legal (Happy Path)

**Dado** que el afiliado ha buscado una matrícula con `esAfiliado=1`, ha armado su carrito de certificados y ha diligenciado sus datos de solicitante (tipo documento, número documento),  
**Cuando** el sistema detecta que es un flujo de afiliado sin token activo y redirige al usuario a MAUC SSO (`https://mauc-sso.ccb.org.co/login/107`),  
**Entonces** el usuario se autentica en MAUC, MAUC redirige de vuelta al portal con un `access_token` JWT en la URL, el sistema captura el token y lo almacena en sesión, valida que el claim `username` del JWT (formato `{tipoDoc}{numDoc}`) corresponde exactamente al tipo y número de documento ingresados por el solicitante, consulta los representantes legales de la matrícula vía TiendaWS, confirma que el documento del solicitante coincide (con pad-left a 15 dígitos) con al menos un representante legal, y habilita el flujo de liquidación con beneficio de afiliación.

#### CA-03A.2 — Token MAUC con documento que no corresponde al solicitante (Error)

**Dado** que el afiliado fue redirigido a MAUC SSO y se autenticó exitosamente con un usuario diferente al documento que ingresó en el formulario de solicitante (por ejemplo, ingresó CC 123456 pero se autenticó en MAUC con CC 789012),  
**Cuando** el sistema valida el claim `username` del token JWT contra los datos del solicitante,  
**Entonces** el sistema muestra el mensaje "El usuario tipo solicitante no corresponde al autenticado en MAUC", NO habilita el flujo de beneficio de afiliación, invalida el token de sesión y ofrece al usuario la opción de re-autenticarse con el documento correcto o continuar sin beneficio (flujo de pago estándar).

#### CA-03A.3 — MAUC SSO no está disponible o no responde (Error)

**Dado** que el afiliado está listo para autenticarse y el sistema intenta redirigir a MAUC SSO,  
**Cuando** MAUC SSO no responde, retorna un error HTTP 5xx, o el usuario experimenta un timeout en la página de MAUC,  
**Entonces** el sistema detecta que la autenticación no se completó (no se recibe token de retorno), muestra un mensaje "El servicio de autenticación no está disponible en este momento" y ofrece al usuario: (a) reintentar la autenticación MAUC, o (b) continuar con el flujo estándar (sin beneficio de afiliación, pagando por la pasarela).

#### CA-03A.4 — Validación del token antes del pago — token expirado o revocado (Edge Case)

**Dado** que el afiliado se autenticó en MAUC hace un tiempo, tiene un token almacenado en sesión, y procede a confirmar el pago de sus certificados,  
**Cuando** el sistema invoca el endpoint de validación de token de MAUC (`token-check`) inmediatamente antes de la liquidación,  
**Entonces** si MAUC retorna `status: "OK"` se procede con la liquidación; si MAUC retorna error o el token es inválido/expirado, el sistema redirige nuevamente al usuario a MAUC SSO para re-autenticarse, preservando el carrito y los datos del formulario en la sesión del navegador, de modo que tras la re-autenticación pueda continuar desde donde quedó.

#### CA-03A.5 — Afiliado autenticado NO es representante legal de la matrícula (Error)

**Dado** que el afiliado se autenticó exitosamente en MAUC y el token corresponde a su documento, pero al consultar los representantes legales vía TiendaWS su documento no aparece en la lista de representantes de la matrícula seleccionada,  
**Cuando** el sistema compara el número de documento del solicitante (pad-left 15 dígitos) contra cada representante legal de la matrícula,  
**Entonces** el sistema marca la matrícula como `esAfiliado=false` para esta transacción, muestra un mensaje "Solo el representante legal puede utilizar el beneficio de afiliación para esta matrícula", y permite al usuario continuar con el flujo de pago estándar (con costo) sin necesidad de volver a buscar ni armar el carrito.

#### CA-03A.6 — Cierre de sesión MAUC después de completar la transacción (Edge Case)

**Dado** que el afiliado completó exitosamente la autenticación, la validación de representante legal y la liquidación de certificados (ya sea gratuitos o con pago),  
**Cuando** la transacción finaliza (pago confirmado o pago en cero registrado),  
**Entonces** el sistema invoca el endpoint de sign-out de MAUC (`/api/security/signout`) con el access_token, limpia el token y los datos de sesión del navegador (`sessionStorage`), y confirma al usuario que su solicitud fue procesada. Esto previene que un token válido permanezca activo innecesariamente y protege contra uso no autorizado en sesiones compartidas.

#### CA-03A.7 — Matrícula es establecimiento y la afiliación pertenece a la sociedad propietaria (Edge Case)

**Dado** que el afiliado busca la matrícula de un establecimiento comercial (no una sociedad directamente) y dicho establecimiento no tiene `esAfiliado=1` directamente, pero su sociedad propietaria sí es afiliada,  
**Cuando** el sistema consulta la matrícula principal vía SHD y determina que la sociedad propietaria es afiliada,  
**Entonces** el sistema utiliza la matrícula de la sociedad propietaria para: (a) consultar representantes legales, (b) verificar que el solicitante autenticado es representante legal de la sociedad propietaria, y (c) validar el saldo de afiliación contra la matrícula principal. Si la validación es exitosa, el beneficio aplica al establecimiento.

### Notas técnicas (derivadas del código fuente actual)

| Aspecto | Implementación actual | Mejora requerida para modernización |
|---|---|---|
| Validación JWT | Solo lectura de claims sin verificar firma (`JwtSecurityToken` parse) | Verificar firma JWT contra las claves públicas de MAUC (JWKS endpoint) |
| Representante legal | Validación exclusivamente del lado del cliente (JavaScript) | Implementar validación server-side obligatoria en el endpoint de liquidación |
| Gestión de sesión | `sessionStorage` del navegador | Mantener, pero complementar con validación server-side por request |
| MAUC 1.0 vs 2.0 | Flag `ACTIVAR_MAUC2` selecciona el flujo | Eliminar soporte MAUC 1.0 en la modernización; usar únicamente MAUC 2.0 |
| Token-check pre-pago | Llamada directa del browser al endpoint MAUC | Mover al backend para evitar exposición de tokens en requests client-side |

---

## HU-04 — Solicitar certificados como afiliado

**Caso de uso origen:** UC-02  
**Precondición:** HU-03A completada exitosamente (afiliado autenticado y validado como representante legal)

### Historia

**Como** afiliado CCB autenticado y validado como representante legal,  
**Quiero** solicitar certificados gratuitos dentro de mi beneficio de afiliación,  
**Para** obtener mis certificados mercantiles sin costo adicional, descontando de mi cuota de afiliación.

### Criterios de aceptación

#### CA-04.1 — Liquidación gratuita exitosa para representante legal (Happy Path)

**Dado** que el afiliado se ha autenticado en MAUC SSO, es representante legal de la matrícula `00054321` con `esAfiliado=1`, tiene saldo disponible en su cuota de afiliación y seleccionó 2 certificados gratuitos (tipos «Matrícula Mercantil» y «Existencia y Representación Legal»),  
**Cuando** confirma la solicitud,  
**Entonces** el sistema liquida con servicioLiquidarId=4, el total resulta $0, se registra pago en cero automáticamente, se descuenta del saldo de afiliación consultado vía TiendaWS, y se crea la solicitud en estado ORDEN_PAGO_GENERADA (estado 13).

#### CA-04.2 — Solicitante no es representante legal (Error)

**Dado** que el afiliado se ha autenticado en MAUC pero el número de documento del token no corresponde a ningún representante legal de la matrícula seleccionada,  
**Cuando** intenta acceder al beneficio de afiliación,  
**Entonces** el sistema deniega el acceso al flujo de beneficio gratuito, muestra un mensaje "Solo el representante legal puede utilizar el beneficio de afiliación" y ofrece continuar con el flujo de pago estándar.

#### CA-04.3 — Carrito mixto: certificados gratuitos y con costo (Edge Case)

**Dado** que el afiliado selecciona 2 certificados de tipo gratuito («Matrícula Mercantil» y «Sociedad Disuelta») y 1 certificado de tipo con costo (ID 5),  
**Cuando** confirma la solicitud,  
**Entonces** el sistema clasifica correctamente los certificados: liquida los gratuitos contra la cuota de afiliación (servicioLiquidar=4) y los de costo contra la pasarela estándar (servicioId=36), generando dos liquidaciones separadas o una combinada según la lógica de PUP.

#### CA-04.4 — Saldo de afiliación insuficiente (Error)

**Dado** que el afiliado es representante legal pero su saldo de afiliación consultado vía TiendaWS es $0 (cuota agotada),  
**Cuando** intenta liquidar certificados gratuitos,  
**Entonces** el sistema informa que el saldo de afiliación se ha agotado, ofrece la opción de continuar pagando con la pasarela estándar y no bloquea la transacción.

#### CA-04.5 — Token MAUC expirado durante la sesión (Edge Case)

**Dado** que el afiliado se autenticó hace más de 8 horas y el token JWT de MAUC ha expirado,  
**Cuando** intenta confirmar la solicitud,  
**Entonces** el sistema detecta el token expirado, redirige al afiliado al flujo de re-autenticación de MAUC sin perder los datos del carrito y, tras la re-autenticación exitosa, permite continuar desde donde quedó.

---

## HU-05 — Consultar matrícula principal de establecimiento

**Caso de uso origen:** UC-02 (flujo alternativo de establecimientos)

### Historia

**Como** afiliado CCB que tiene un establecimiento comercial,  
**Quiero** que el sistema identifique automáticamente la matrícula principal (sociedad propietaria) de mi establecimiento,  
**Para** poder utilizar el beneficio de afiliación de la sociedad propietaria al solicitar certificados para mi establecimiento.

### Criterios de aceptación

#### CA-05.1 — Consulta exitosa de matrícula principal (Happy Path)

**Dado** que el afiliado ingresa la matrícula de un establecimiento comercial y dicho establecimiento tiene asociada una sociedad propietaria con `esAfiliado=1`,  
**Cuando** el sistema consulta la matrícula principal vía SHD,  
**Entonces** se retorna la matrícula de la sociedad propietaria, se valida su afiliación y se habilita el beneficio gratuito para el establecimiento.

#### CA-05.2 — Establecimiento sin sociedad propietaria afiliada (Error)

**Dado** que el establecimiento consultado tiene una sociedad propietaria que no es afiliada (`esAfiliado=0`),  
**Cuando** el sistema consulta SHD y verifica afiliación,  
**Entonces** se informa al usuario que no aplica el beneficio de afiliación para este establecimiento y se redirige al flujo de pago estándar.

#### CA-05.3 — SHD no responde o retorna error (Edge Case)

**Dado** que el servicio SHD no está disponible o excede el timeout de 8 segundos,  
**Cuando** el sistema intenta consultar la matrícula principal,  
**Entonces** el circuit breaker se activa, se registra el error, y el sistema informa al usuario que no fue posible verificar la afiliación del establecimiento, ofreciendo continuar con el flujo estándar (sin beneficio).

---

## HU-06 — Solicitar certificados especiales

**Caso de uso origen:** UC-03

### Historia

**Como** solicitante público,  
**Quiero** solicitar certificados especiales (textual, negativo o histórico) ingresando los datos requeridos según el tipo,  
**Para** obtener certificados con información específica que no está disponible en los certificados estándar del catálogo.

### Criterios de aceptación

#### CA-06.1 — Solicitud de certificado textual exitosa (Happy Path)

**Dado** que el solicitante selecciona el tipo especial "Textual" (tipo=1) y busca una matrícula válida,  
**Cuando** completa los datos requeridos y confirma la solicitud,  
**Entonces** el sistema liquida con servicioNegocioVirtualId=19 y servicioLiquidarId=34, genera una carta de solicitud adjunta para procesamiento manual por el backoffice, crea la solicitud tipo 2 y retorna la URL de pago.

#### CA-06.2 — Certificado negativo sin matrícula activa (Edge Case)

**Dado** que el solicitante selecciona el tipo especial "Negativo" (tipo=2) y no posee matrícula activa en el registro mercantil,  
**Cuando** accede al flujo de certificado negativo,  
**Entonces** el sistema habilita el formulario "no matriculado" para ingreso manual de datos (nombre completo, tipo y número de documento, dirección) sin requerir búsqueda de matrícula, y permite liquidar la solicitud normalmente.

#### CA-06.3 — Liquidación especial con error en PUP (Error)

**Dado** que el solicitante ha completado el formulario de certificado especial correctamente,  
**Cuando** el sistema invoca la liquidación con servicioLiquidarId=34 en PUP y recibe un error SOAP,  
**Entonces** no se genera la carta de solicitud ni la cotización, se muestra un mensaje de error al usuario y se permite reintentar manteniendo los datos ingresados.

#### CA-06.4 — Tipo de certificado especial no soportado (Edge Case)

**Dado** que se recibe un request con un tipo especial con valor diferente a 1, 2 o 3,  
**Cuando** el sistema intenta procesar la solicitud,  
**Entonces** se rechaza con error de validación HTTP 400 indicando "Tipo de certificado especial no válido. Valores permitidos: 1 (textual), 2 (negativo), 3 (histórico)".

---

## HU-06A — Solicitar certificado negativo como no matriculado

**Caso de uso origen:** UC-03 (flujo alternativo)  
**Derivado de:** `InscritoNegativoNoMatriculadosController`, `NegativosNoMatriculado.js`

### Historia

**Como** persona natural o jurídica que no posee matrícula mercantil activa,  
**Quiero** solicitar un certificado negativo de matrícula/inscripción ingresando manualmente mis datos de identificación,  
**Para** obtener un documento oficial que acredite que no me encuentro inscrito en el registro mercantil de la CCB.

### Criterios de aceptación

#### CA-06A.1 — Solicitud exitosa de certificado negativo sin matrícula (Happy Path)

**Dado** que el solicitante accede al flujo de certificado negativo para no matriculados y el sistema obtiene del catálogo el certificado con ID 101 ("Negativo de matrícula/inscripción", servicio `01010107`) con su precio vigente,  
**Cuando** el solicitante diligencia nombre o razón social, selecciona tipo de identificación, ingresa número de documento, define la cantidad de certificados deseados (mínimo 1) y una descripción/observación de la solicitud, y confirma,  
**Entonces** el sistema liquida con servicioNegocioVirtualId=19 y servicioLiquidarId=34, utiliza el nombre y número de documento del formulario (en lugar de datos de matrícula) como datos de la carta de solicitud, crea la solicitud tipo 2 y redirige al pago con IdServicio=34.

#### CA-06A.2 — Campos obligatorios no diligenciados (Error)

**Dado** que el solicitante accede al formulario de negativo para no matriculados,  
**Cuando** intenta confirmar la solicitud sin completar el nombre/razón social, el tipo de documento o la observación,  
**Entonces** el sistema muestra mensajes de validación en cada campo faltante y no permite continuar hasta que todos los campos obligatorios estén diligenciados.

#### CA-06A.3 — Cantidad de certificados igual a cero o negativa (Edge Case)

**Dado** que el solicitante ha diligenciado todos los campos pero ingresa una cantidad menor o igual a cero,  
**Cuando** intenta confirmar la solicitud,  
**Entonces** el sistema valida que la cantidad sea al menos 1, muestra el error de validación y recalcula el valor total como `valorUnitario × cantidad` solo cuando la cantidad es válida.

#### CA-06A.4 — Múltiples solicitudes en el mismo carrito (Edge Case)

**Dado** que el solicitante ya tiene un ítem en el carrito de negativos no matriculados y modifica la cantidad,  
**Cuando** confirma los cambios,  
**Entonces** el sistema reemplaza el ítem existente (solo se permite una línea en el carrito para este flujo) actualizando cantidad y valor total, sin crear líneas duplicadas.

---

## HU-06B — Consultar registros de Kardex mercantil para certificados textuales

**Caso de uso origen:** UC-03 (sub-flujo de textual)  
**Derivado de:** `ObtieneConsultaKardexController`, `Busqueda.js` (controller `BusquedaRegistros`)

### Historia

**Como** solicitante público que requiere un certificado textual,  
**Quiero** buscar y seleccionar registros específicos del Kardex mercantil de una matrícula filtrando por fecha, número de registro o palabra clave,  
**Para** identificar los actos inscritos exactos que necesito certificar y agregarlos al carrito de certificados textuales.

### Criterios de aceptación

#### CA-06B.1 — Búsqueda exitosa por rango de fechas (Happy Path)

**Dado** que el solicitante se encuentra en el módulo de certificados textuales y ha seleccionado una matrícula válida,  
**Cuando** ingresa una fecha de inicio y una fecha final y ejecuta la búsqueda en el Kardex (SP `SCISP_ObtenerKardex`),  
**Entonces** el sistema retorna la lista de registros que coinciden, mostrando para cada uno: número de registro (pad-left 8 dígitos), tipo de documento, descripción del libro, fecha del documento, fecha de registro e inscripción, permitiendo al solicitante seleccionar uno, asignarle cantidad y observación, y agregarlo al carrito de textuales.

#### CA-06B.2 — Búsqueda sin criterios suficientes (Error)

**Dado** que el solicitante no ha ingresado ningún criterio de búsqueda (fecha inicio, fecha final, número de registro ni palabra clave),  
**Cuando** intenta ejecutar la búsqueda,  
**Entonces** el sistema no realiza la consulta y muestra un mensaje indicando que debe ingresar al menos un criterio de filtrado.

#### CA-06B.3 — Fecha inicio sin fecha final (Error)

**Dado** que el solicitante ingresa una fecha de inicio pero deja vacía la fecha final,  
**Cuando** intenta ejecutar la búsqueda,  
**Entonces** el sistema valida que ambas fechas del rango son requeridas cuando se usa filtro por fecha, muestra el error de validación y no ejecuta la consulta.

#### CA-06B.4 — Búsqueda por número de registro específico sin resultados (Edge Case)

**Dado** que el solicitante ingresa un número de registro que no existe para la matrícula consultada,  
**Cuando** ejecuta la búsqueda,  
**Entonces** el sistema retorna una lista vacía, muestra un mensaje "No se encontraron registros con los criterios ingresados" y permite al solicitante modificar los filtros y buscar nuevamente.

#### CA-06B.5 — Selección de registro y paso al carrito de textuales (Happy Path)

**Dado** que la búsqueda retornó resultados y el solicitante selecciona un registro del Kardex,  
**Cuando** asigna cantidad (mínimo 1) y observación al registro seleccionado y confirma,  
**Entonces** el sistema agrega el registro al carrito de certificados textuales con los campos: `numeroRegistro`, `cantidad`, `observacion`, `matricula`, `proponente`, `certificadoId`, navega a la pantalla de certificados textuales donde puede ver el resumen del carrito y continuar con la liquidación.

---

## HU-06C — Generar carta de solicitud para certificados especiales

**Caso de uso origen:** UC-03 (sub-flujo post-liquidación)  
**Derivado de:** `GuardarCartaCertificadosEspecialesController`, `RegenerarCartaController`

### Historia

**Como** sistema de certificados electrónicos,  
**Quiero** generar automáticamente una carta de solicitud en PDF al completar la liquidación de un certificado especial (textual, negativo o histórico),  
**Para** que el backoffice cuente con el documento formal necesario para procesar manualmente la solicitud del certificado.

### Criterios de aceptación

#### CA-06C.1 — Generación exitosa de carta especial post-liquidación (Happy Path)

**Dado** que la liquidación de un certificado especial se completó exitosamente (solicitudId y número de orden generados),  
**Cuando** el sistema invoca `GET api/guardarCartaCertificadosEspeciales` con solicitudId y número de orden,  
**Entonces** se genera el PDF de la carta con los datos del solicitante, el detalle de certificados (número de registro, observación, tipo especial), se almacena en el file share con el patrón de nombre `Sol_{solicitudId}_{orden}_CartaEspecial.pdf` bajo Windows impersonation, y se retorna confirmación de éxito.

#### CA-06C.2 — File share no disponible (Error)

**Dado** que la liquidación se completó correctamente pero el file share de destino no está accesible (red caída o credenciales de impersonation inválidas),  
**Cuando** el sistema intenta guardar la carta PDF,  
**Entonces** se registra el error en los logs con el solicitudId, se retorna HTTP 500, pero la liquidación y la cotización ya creadas NO se revierten (la carta puede regenerarse posteriormente con `api/regeneraCarta`).

#### CA-06C.3 — Regeneración de carta tras fallo inicial (Edge Case)

**Dado** que una carta de solicitud no se generó correctamente en el flujo automático (por fallo de red o timeout),  
**Cuando** un operador invoca `GET api/regeneraCarta` con el solicitudId y número de orden,  
**Entonces** el sistema regenera el PDF a partir de los datos persistidos en base de datos (CartaSolicitante + CartaDetalle con ReporteId=2) y lo almacena en el file share, sobrescribiendo el archivo anterior si existiera.

---

## HU-07A — Autenticarse en el módulo de depósitos financieros

**Caso de uso origen:** UC-04 (precondición de autenticación)  
**Derivado de:** `Startup.cs`, `CCBProvedorIdentidad.cs`, `LoginDepositos.js`, `loginRecurso.js`

### Historia

**Como** solicitante de depósitos financieros registrado en el sistema de la CCB,  
**Quiero** autenticarme con mi tipo de documento, número de documento y clave segura en el módulo de depósitos,  
**Para** acceder de forma segura a las matrículas vinculadas a mi identificación y solicitar certificados de estados financieros depositados.

### Criterios de aceptación

#### CA-07A.1 — Autenticación exitosa con credenciales válidas (Happy Path)

**Dado** que el solicitante posee una cuenta registrada en el sistema de depósitos (validada contra SP `SCISP_ValidarIngresoAfiliados`) y accede a la pantalla de login del módulo de depósitos,  
**Cuando** ingresa tipo de documento, número de documento (alfanumérico, máximo 15 caracteres), clave segura, email y acepta los términos y condiciones,  
**Entonces** el sistema envía las credenciales al endpoint `POST /login` (OAuth resource owner), recibe un `access_token` con expiración de 8 horas, configura el header `Authorization: Bearer {token}` para las solicitudes subsiguientes, y navega automáticamente a la pantalla de matrículas vinculadas.

#### CA-07A.2 — Credenciales inválidas (Error)

**Dado** que el solicitante ingresa un número de documento o clave que no corresponden a ningún registro en la base de datos,  
**Cuando** el sistema invoca `POST /login` y el SP no retorna filas,  
**Entonces** el endpoint retorna `{ error: "invalid_grant", error_description: "el usuario no es autorizado" }`, la interfaz muestra el mensaje "No existe un usuario asociado al documento ingresado o la clave es incorrecta" y permite reintentar sin límite de intentos.

#### CA-07A.3 — Tipo documento cédula con caracteres no numéricos (Edge Case)

**Dado** que el solicitante selecciona tipo de documento "Cédula de ciudadanía" (id=1) e ingresa un número de documento con letras (por ejemplo, "ABC123"),  
**Cuando** intenta enviar el formulario,  
**Entonces** la validación del lado del cliente detecta que para tipo cédula solo se permiten dígitos numéricos, muestra el error de validación y no envía la petición al servidor.

#### CA-07A.4 — Campo email no proporcionado (Edge Case)

**Dado** que el solicitante completa tipo documento, número y clave, pero deja vacío el campo de email,  
**Cuando** intenta autenticarse,  
**Entonces** la validación del formulario exige el email como campo obligatorio (aunque el backend no lo valida contra la BD, sí lo almacena como claim del token para uso posterior en notificaciones).

#### CA-07A.5 — Token expirado durante la sesión de depósitos (Edge Case)

**Dado** que el solicitante se autenticó exitosamente pero han transcurrido más de 8 horas desde la emisión del token,  
**Cuando** intenta acceder a un endpoint protegido (`[Authorize]`) como `api/liquidarDepositos` o `api/guardarCartaDepositos`,  
**Entonces** el sistema retorna HTTP 401, la interfaz detecta la respuesta no autorizada y redirige al solicitante a la pantalla de login de depósitos para re-autenticarse, informando que la sesión ha expirado.

#### CA-07A.6 — Términos y condiciones no aceptados (Error)

**Dado** que el solicitante ha diligenciado todos los campos del formulario de login pero no ha marcado el checkbox de aceptación de términos y condiciones,  
**Cuando** intenta autenticarse,  
**Entonces** el formulario no se envía, se muestra un mensaje indicando que debe aceptar los términos y condiciones para continuar.

---

## HU-07 — Solicitar certificados de depósitos financieros

**Caso de uso origen:** UC-04  
**Precondición:** HU-07A completada exitosamente (solicitante autenticado)

### Historia

**Como** solicitante de depósitos registrado en el sistema,  
**Quiero** solicitar certificados de estados financieros depositados ingresando mis credenciales OAuth,  
**Para** obtener certificaciones oficiales de los balances y estados financieros que mi empresa ha depositado ante la CCB.

### Criterios de aceptación

#### CA-07.1 — Flujo completo de depósitos (Happy Path)

**Dado** que el solicitante posee credenciales OAuth válidas (documento + clave) y tiene matrículas vinculadas con depósitos financieros disponibles,  
**Cuando** se autentica exitosamente, selecciona una matrícula, elige estados financieros (fecha balance, folios, anexos) y confirma la solicitud,  
**Entonces** el sistema liquida con servicioNegocioVirtualId=20 y servicioLiquidarId=35, crea la solicitud tipo 3 con referencia a los documentos de depósito y retorna la URL de pago.

#### CA-07.2 — Credenciales OAuth inválidas (Error)

**Dado** que el solicitante ingresa un número de documento correcto pero una clave incorrecta,  
**Cuando** intenta autenticarse en el módulo de depósitos,  
**Entonces** el sistema retorna error HTTP 401, muestra "Credenciales incorrectas" y permite reintentar sin bloquear la cuenta en los primeros 3 intentos.

#### CA-07.3 — Matrícula sin depósitos financieros registrados (Edge Case)

**Dado** que el solicitante se autentica correctamente pero la matrícula seleccionada no tiene estados financieros depositados,  
**Cuando** consulta las matrículas vinculadas y selecciona una,  
**Entonces** el sistema muestra un mensaje "No se encontraron depósitos financieros para la matrícula seleccionada" y permite seleccionar otra matrícula sin necesidad de re-autenticarse.

#### CA-07.4 — Matrícula con formato incorrecto (Edge Case)

**Dado** que el sistema recibe una matrícula con menos de 8 dígitos desde el módulo de depósitos,  
**Cuando** procesa la solicitud,  
**Entonces** el sistema aplica pad-left a 8 dígitos automáticamente (por ejemplo, `12345` se convierte en `00012345`) antes de consultar los depósitos disponibles.

---

## HU-07B — Generar y gestionar carta de solicitud para depósitos financieros

**Caso de uso origen:** UC-04 (sub-flujo documental)  
**Derivado de:** `CartaDepositosController`, `GuardarArchivoDespositosController`, `GuardarCartaDepositoController`, `SolicitudDepositos.js`

### Historia

**Como** solicitante de depósitos financieros autenticado,  
**Quiero** generar una carta de solicitud formal, adjuntar los PDFs de mis estados financieros y que el sistema almacene todo como soporte de mi solicitud,  
**Para** cumplir con los requisitos documentales de la CCB y que el backoffice cuente con toda la información necesaria para procesar mi certificado de depósitos.

### Criterios de aceptación

#### CA-07B.1 — Generación exitosa de carta con adjuntos PDF (Happy Path)

**Dado** que el solicitante autenticado (token OAuth válido) ha seleccionado una matrícula, armado su carrito de depósitos con estados financieros (fecha balance, folios, observaciones) y adjuntado un archivo PDF por cada ítem del carrito,  
**Cuando** confirma la carta de solicitud y procede a la liquidación,  
**Entonces** el sistema: (1) genera la carta preliminar via `POST api/cartaDepositos` con datos del solicitante y detalle del carrito, (2) liquida la solicitud con servicioLiquidarId=35 obteniendo solicitudId y número de orden, (3) sube cada PDF adjunto al file share con nombre `Sol_{solicitudId}_{orden}_{contador}.pdf` bajo Windows impersonation, (4) genera el PDF de carta de depósito (`Sol_{solicitudId}_{orden}_CartaDeposito.pdf`), (5) actualiza la carta vinculando el número de orden via `PUT api/cartaDepositos`, y (6) redirige al pago con `TiendaPagos/VerOrdenPago?IdServicio=35`.

#### CA-07B.2 — Archivo adjunto no es PDF (Error)

**Dado** que el solicitante intenta adjuntar un archivo con extensión o MIME type diferente a `application/pdf` (por ejemplo, un archivo `.docx` o `.jpg`),  
**Cuando** el sistema valida el archivo del lado del cliente,  
**Entonces** se muestra un mensaje indicando los nombres de los archivos con formato inválido, no se permite continuar y se solicita al usuario reemplazar los archivos por documentos PDF válidos.

#### CA-07B.3 — File share no accesible durante upload (Error)

**Dado** que la liquidación se completó exitosamente y el sistema intenta subir los PDFs al file share de la red,  
**Cuando** el file share no responde o las credenciales de Windows impersonation son inválidas,  
**Entonces** el sistema registra el error con solicitudId y nombre de archivo, retorna HTTP 500 al frontend, y la solicitud queda en estado liquidada pero sin documentos adjuntos. El operador puede regenerar la carta posteriormente vía `api/regeneraCarta`.

#### CA-07B.4 — Carrito con notas/anexos por año (Edge Case)

**Dado** que el solicitante ha agregado al carrito no solo el estado financiero principal sino también notas por año (`carritoNotas`) y otros documentos soporte (`carritoOtrosDocumentos`), cada uno con su adjunto PDF,  
**Cuando** se procesan los uploads post-liquidación,  
**Entonces** el sistema sube todos los PDFs en secuencia con contadores incrementales (`_1.pdf`, `_2.pdf`, etc.), incluyendo los adjuntos de notas y otros documentos, manteniendo el orden definido en el carrito.

#### CA-07B.5 — Sesión OAuth expirada durante el proceso de carta (Edge Case)

**Dado** que el solicitante inició el proceso de carta de depósitos hace más de 8 horas y su token OAuth ha expirado,  
**Cuando** el sistema intenta invocar `GET api/guardarCartaDepositos` (endpoint con `[Authorize]`),  
**Entonces** el endpoint retorna HTTP 401, el frontend redirige a la pantalla de login de depósitos y los datos del carrito se preservan en la sesión del navegador para que tras la re-autenticación el solicitante pueda continuar.

---

## HU-08 — Solicitar certificados de costumbres mercantiles

**Caso de uso origen:** UC-05

### Historia

**Como** solicitante público,  
**Quiero** solicitar certificados de costumbres mercantiles seleccionando el sector económico de mi interés,  
**Para** obtener una certificación oficial de las prácticas comerciales reconocidas por la CCB en un sector específico.

### Criterios de aceptación

#### CA-08.1 — Solicitud exitosa de costumbres mercantiles (Happy Path)

**Dado** que el solicitante accede al módulo de costumbres mercantiles y el sistema consulta los sectores disponibles vía TiendaWS (tipo 506),  
**Cuando** selecciona un sector, elige los certificados deseados, diligencia sus datos y confirma la solicitud,  
**Entonces** el sistema liquida con servicioId=36 (estándar), crea la solicitud con los certificados de costumbres y retorna la URL de pago.

#### CA-08.2 — No hay sectores disponibles en TiendaWS (Error)

**Dado** que el servicio TiendaWS retorna una lista vacía de sectores disponibles para tipo 506,  
**Cuando** el solicitante accede al módulo de costumbres mercantiles,  
**Entonces** el sistema muestra un mensaje "No hay certificados de costumbres mercantiles disponibles en este momento" y ofrece la opción de volver al menú principal.

#### CA-08.3 — Selección de sector discontinuado entre consulta y confirmación (Edge Case)

**Dado** que el solicitante consultó el catálogo de sectores y seleccionó uno, pero entre la consulta y la confirmación el sector fue removido del catálogo en TiendaWS,  
**Cuando** intenta liquidar la solicitud,  
**Entonces** el sistema detecta la inconsistencia durante la liquidación en PUP, muestra un mensaje "El certificado seleccionado ya no está disponible" y solicita al usuario que actualice su selección.

---

## HU-09 — Solicitar certificados desde la app móvil

**Caso de uso origen:** UC-06

### Historia

**Como** usuario de la app móvil CCB,  
**Quiero** solicitar certificados mercantiles electrónicos directamente desde mi dispositivo móvil,  
**Para** gestionar mis certificados en cualquier momento y lugar sin necesidad de acceder al portal web.

### Criterios de aceptación

#### CA-09.1 — Solicitud exitosa desde la app móvil (Happy Path)

**Dado** que la app móvil CCB envía una solicitud válida a la API dedicada con tipoSolicitud=4 incluyendo matrícula, certificados seleccionados y datos del solicitante,  
**Cuando** el servicio procesa la solicitud,  
**Entonces** se crea la solicitud con tipo 4, se liquida en PUP (servicioId=36), se genera la cotización y se retorna la información de pago (URL pasarela o confirmación de pago cero) en formato JSON compatible con la app.

#### CA-09.2 — API key de app móvil no autorizada (Error)

**Dado** que se recibe una solicitud en el endpoint de app móvil sin credenciales válidas o con API key expirada,  
**Cuando** el sistema valida la autenticación,  
**Entonces** se retorna HTTP 401 Unauthorized con un mensaje genérico que no revela detalles de la validación y se registra el intento fallido en los logs de seguridad.

#### CA-09.3 — Payload incompleto desde la app (Edge Case)

**Dado** que la app móvil envía un request con campos obligatorios faltantes (por ejemplo, sin email del solicitante),  
**Cuando** el sistema valida el payload,  
**Entonces** se retorna HTTP 400 con un objeto de errores estructurado indicando cada campo faltante (`{"errores": [{"campo": "email", "mensaje": "El email es obligatorio"}]}`) para que la app pueda mostrar las validaciones correspondientes.

---

## HU-10 — Pagar certificados vía pasarela electrónica

**Caso de uso origen:** UC-01 (sub-flujo de pago)

### Historia

**Como** solicitante público,  
**Quiero** pagar mis certificados a través de la pasarela electrónica de pagos de la CCB,  
**Para** completar mi transacción de forma segura y recibir la confirmación de que mi solicitud será procesada.

### Criterios de aceptación

#### CA-10.1 — Pago exitoso con redirección (Happy Path)

**Dado** que la liquidación se completó exitosamente con un total > $0 y se generó una cotización con número de orden,  
**Cuando** el sistema redirige al solicitante a la pasarela de pagos (servicioId=36) con el solicitudId encriptado vía AWS Lambda,  
**Entonces** la pasarela muestra el formulario de pago, el solicitante completa el pago, la pasarela confirma el pago al sistema mediante callback, la solicitud cambia a estado PAGADA y se registra la trazabilidad.

#### CA-10.2 — Pago abandonado por el usuario (Error)

**Dado** que el solicitante fue redirigido a la pasarela de pagos,  
**Cuando** cierra la ventana o cancela el pago sin completar la transacción,  
**Entonces** la solicitud permanece en estado ORDEN_PAGO_GENERADA (estado 13) con la fecha límite de pago fijada al 31 de diciembre del año en curso, permitiendo al usuario retomar el pago posteriormente desde el historial.

#### CA-10.3 — Lambda de encriptación no disponible (Error)

**Dado** que la solicitud se liquidó correctamente pero AWS Lambda de encriptación no responde en 2 segundos,  
**Cuando** el sistema intenta encriptar el solicitudId para la pasarela,  
**Entonces** se muestra un mensaje de error al usuario, la solicitud permanece en estado 13 (con orden generada), y se registra el error para monitoreo. El usuario puede reintentar el pago sin necesidad de reliquidar.

#### CA-10.4 — Pago con fecha vencida (Edge Case)

**Dado** que el solicitante generó una orden de pago en noviembre y la fecha límite es 31 de diciembre,  
**Cuando** intenta acceder a pagar la orden el 2 de enero del año siguiente,  
**Entonces** el sistema marca la solicitud como VENCIDA, muestra "La orden de pago ha expirado" y ofrece la opción de generar una nueva solicitud con los mismos datos.

---

## HU-11 — Registrar pago en cero para afiliados

**Caso de uso origen:** UC-02 (sub-flujo de pago gratuito)

### Historia

**Como** afiliado CCB con beneficio de certificados gratuitos,  
**Quiero** que el sistema registre automáticamente el pago en cero cuando el total de mi solicitud es $0,  
**Para** obtener mis certificados de forma inmediata sin pasar por la pasarela de pagos.

### Criterios de aceptación

#### CA-11.1 — Pago en cero automático (Happy Path)

**Dado** que el afiliado autenticado liquidó su solicitud con certificados gratuitos (tipos «Matrícula Mercantil», «Existencia y Representación Legal», «Sociedad Disuelta», «Libros de Comercio», «Establecimiento de Comercio», «Negativo de Inscripción», «Copia Textual», «Histórico de Capital») y el total resultante de PUP es $0,  
**Cuando** el sistema recibe la respuesta de liquidación con total = 0,  
**Entonces** se registra el pago en cero automáticamente sin redirección a pasarela, la solicitud cambia a estado PAGADA, se registra la trazabilidad correspondiente y se envía la solicitud al motor de generación de forma inmediata.

#### CA-11.2 — Inconsistencia: total = 0 para solicitud no afiliado (Error)

**Dado** que una solicitud de un usuario no afiliado resulta con total = $0 por un error en PUP,  
**Cuando** el sistema evalúa si debe registrar pago en cero,  
**Entonces** valida que el escenario de total $0 corresponda a un afiliado autenticado con beneficio válido o a un descuento completo legítimo. Si no se cumple, registra una alerta en logs y solicita revisión manual antes de confirmar.

#### CA-11.3 — Pago en cero con saldo parcial (Edge Case)

**Dado** que el afiliado solicita 5 certificados gratuitos pero su saldo de afiliación solo cubre 3 unidades,  
**Cuando** PUP liquida la solicitud y el total resultante es > $0 (por las 2 unidades no cubiertas),  
**Entonces** el sistema NO registra pago en cero y redirige al usuario a la pasarela de pagos por el monto restante, informando cuántas unidades se cubrieron con el beneficio y cuántas tienen costo.

---

## HU-12 — Consultar historial de certificados disponibles

**Caso de uso origen:** UC-01 (sub-flujo de consulta post-solicitud)

### Historia

**Como** solicitante (público, afiliado o de depósitos),  
**Quiero** consultar el historial de mis solicitudes y los certificados que están disponibles para descarga, dentro del último año calendario,  
**Para** verificar el estado de mis solicitudes recientes y acceder a los certificados ya generados sin degradar el rendimiento del sistema.

### Criterios de aceptación

#### CA-12.1 — Consulta exitosa del historial (Happy Path)

**Dado** que el solicitante accede al módulo de descargas e ingresa su tipo y número de documento,  
**Cuando** consulta su historial de certificados,  
**Entonces** el sistema muestra una lista de solicitudes con: fecha de solicitud, tipo de certificado, matrícula, estado (generada, pagada, certificado emitido, descargada), indicando cuáles están disponibles para descarga, **limitada a los registros de los últimos 365 días** contados desde la fecha de consulta (regla RN-16).

#### CA-12.2 — Historial sin solicitudes (Edge Case)

**Dado** que el solicitante ingresa un número de documento que no tiene solicitudes previas registradas en el sistema dentro del último año,  
**Cuando** consulta su historial,  
**Entonces** el sistema muestra un mensaje "No se encontraron solicitudes para el documento ingresado en el último año" sin mostrar errores técnicos.

#### CA-12.3 — Solicitud pagada pero certificado aún no generado (Edge Case)

**Dado** que el solicitante pagó su solicitud hace 5 minutos pero el motor de generación (backoffice) aún no ha producido el PDF,  
**Cuando** consulta su historial,  
**Entonces** la solicitud aparece en estado "Pagada — En proceso de generación" sin opción de descarga, y se muestra un mensaje informativo indicando el tiempo estimado de generación.

#### CA-12.4 — Número de documento con formato incorrecto (Error)

**Dado** que el solicitante ingresa un número de documento vacío o con caracteres especiales no permitidos,  
**Cuando** intenta consultar su historial,  
**Entonces** el sistema muestra un mensaje de validación en el campo correspondiente y no realiza la consulta a la base de datos.

#### CA-12.5 — Restricción del período de consulta al último año (Regla de Negocio)

**Dado** que el solicitante tiene solicitudes registradas con más de 365 días de antigüedad,  
**Cuando** consulta su historial de certificados,  
**Entonces** el sistema aplica automáticamente el filtro de fecha (desde `GETDATE() - 365 días` hasta `GETDATE()`) antes de ejecutar la consulta en la base de datos, sin exponer registros anteriores a ese período y sin requerir ningún parámetro adicional por parte del usuario.

#### CA-12.6 — Volumen elevado de solicitudes dentro del año (Edge Case)

**Dado** que el solicitante (por ejemplo, una empresa con alto volumen de trámites) tiene más de 500 solicitudes dentro del período del último año,  
**Cuando** consulta su historial,  
**Entonces** el sistema devuelve los resultados paginados (por ejemplo, 20 registros por página), ordenados por fecha de solicitud descendente, con tiempo de respuesta P95 < 2 segundos, sin bloqueos ni degradación del servicio para otros usuarios.

---

## HU-13 — Descargar certificado en PDF

**Caso de uso origen:** UC-01 (sub-flujo de descarga)

### Historia

**Como** solicitante,  
**Quiero** descargar el PDF de mi certificado electrónico desde el portal,  
**Para** obtener el documento oficial que necesito para mis trámites legales y comerciales.

### Criterios de aceptación

#### CA-13.1 — Descarga exitosa con URL pre-firmada (Happy Path)

**Dado** que el certificado del solicitante está en estado "Certificado Emitido" y el PDF se encuentra almacenado en Amazon S3,  
**Cuando** el solicitante hace clic en "Descargar",  
**Entonces** el sistema genera una URL pre-firmada de S3 con expiración de 15 minutos, redirige al usuario a la descarga del PDF, la solicitud pasa a estado DESCARGADA y se registra la trazabilidad.

#### CA-13.2 — PDF no encontrado en S3 (Error)

**Dado** que el certificado está marcado como emitido en la base de datos pero el archivo PDF no existe en S3 (por ejemplo, fue eliminado accidentalmente),  
**Cuando** el solicitante intenta descargar el certificado,  
**Entonces** el sistema muestra un error "El archivo no está disponible temporalmente" y genera una alerta interna para el equipo de soporte, registrando el solicitudId y el nombre del archivo faltante.

#### CA-13.3 — URL pre-firmada expirada (Edge Case)

**Dado** que el solicitante obtuvo una URL pre-firmada pero no descargó el archivo dentro de los 15 minutos de vigencia,  
**Cuando** intenta usar la URL después de expirada,  
**Entonces** S3 retorna HTTP 403, el portal detecta el error y ofrece generar una nueva URL pre-firmada con un clic adicional sin necesidad de buscar nuevamente el certificado.

#### CA-13.4 — Descarga de certificado con archivo de gran tamaño (Edge Case)

**Dado** que el certificado PDF tiene un tamaño cercano al límite de 5MB (por ejemplo, certificado con múltiples anexos),  
**Cuando** el solicitante inicia la descarga,  
**Entonces** la descarga se completa en menos de 3 segundos (P95) y el sistema no experimenta timeout, soportando concurrencia de múltiples descargas simultáneas sin degradación.

---

## HU-14 — Verificar autenticidad de un certificado

**Caso de uso origen:** UC-14

### Historia

**Como** tercero verificador,  
**Quiero** validar la autenticidad de un certificado electrónico de la CCB ingresando su código de verificación,  
**Para** confirmar que el documento que recibí es legítimo, vigente y no ha sido alterado.

### Criterios de aceptación

#### CA-14.1 — Verificación exitosa de código válido (Happy Path)

**Dado** que el tercero verificador posee un código de verificación de 14 caracteres alfanuméricos correspondiente a un certificado emitido hace menos de 60 días y con verificaciones disponibles,  
**Cuando** ingresa el código en el portal público de verificación,  
**Entonces** el sistema confirma la validez del certificado (`{valido: true}`), muestra el PDF del certificado mediante el visor integrado (pdf.js), registra la verificación con la IP del verificador y la fecha/hora, e incrementa el contador de verificaciones realizadas.

#### CA-14.2 — Código de verificación expirado (Error)

**Dado** que el tercero verificador ingresa un código de 14 caracteres válido pero cuya fecha de expedición supera los 60 días calendario,  
**Cuando** el sistema valida el código,  
**Entonces** retorna HTTP 410 con el mensaje "El código de verificación ha expirado. La vigencia es de 60 días desde la expedición" y NO permite visualizar el PDF ni registra la verificación.

#### CA-14.3 — Código con verificaciones agotadas (Error)

**Dado** que el código de verificación ha alcanzado el máximo de verificaciones permitidas (`verificaciones_realizadas >= max_verificaciones`),  
**Cuando** el tercero verificador ingresa el código,  
**Entonces** retorna HTTP 410 con el mensaje "Se ha alcanzado el límite de verificaciones permitidas para este certificado" y NO muestra el PDF.

#### CA-14.4 — Código inexistente (Error)

**Dado** que el tercero verificador ingresa un código de 14 caracteres que no existe en la base de datos,  
**Cuando** el sistema busca el código,  
**Entonces** retorna HTTP 404 con el mensaje "El código de verificación ingresado no existe" sin revelar información adicional que pueda facilitar ataques de enumeración.

#### CA-14.5 — Rate limiting por IP excedido (Edge Case)

**Dado** que desde una misma IP se han realizado más de 100 requests por segundo al endpoint de verificación,  
**Cuando** se recibe el request número 101 en el mismo segundo,  
**Entonces** el sistema retorna HTTP 429 Too Many Requests con un header `Retry-After` indicando cuántos segundos debe esperar, protegiendo el servicio contra abuso sin afectar a otros verificadores desde IPs diferentes.

---

## HU-15 — Notificar certificado generado por backoffice

**Caso de uso origen:** UC-15

### Historia

**Como** motor de generación (backoffice),  
**Quiero** notificar al sistema que un certificado PDF ha sido generado y almacenado en S3,  
**Para** que el sistema actualice el estado de la solicitud, inserte los códigos de verificación y notifique al solicitante que su certificado está disponible para descarga.

### Criterios de aceptación

#### CA-15.1 — Notificación exitosa de certificado generado (Happy Path)

**Dado** que el motor de generación ha producido el PDF del certificado, lo ha almacenado en S3 y posee el número de orden y los códigos de verificación,  
**Cuando** invoca `PUT /api/v1/solicitudes/{id}/estado` con el nombre de archivo, número de orden y códigos de verificación (14 caracteres cada uno),  
**Entonces** el sistema actualiza el estado de la solicitud a CERTIFICADO_EMITIDO, inserta los códigos de verificación con vigencia de 60 días y max_verificaciones asignadas, envía un email de notificación al solicitante con instrucciones de descarga, y retorna HTTP 200.

#### CA-15.2 — Solicitud no encontrada o no pagada (Error)

**Dado** que el backoffice envía una notificación para un solicitudId que no existe o cuyo estado no es PAGADA,  
**Cuando** el sistema procesa la notificación,  
**Entonces** retorna HTTP 404 o HTTP 409 (conflicto de estado) según el caso, NO modifica ningún registro y registra el evento en los logs de auditoría.

#### CA-15.3 — Notificación duplicada para la misma solicitud (Edge Case)

**Dado** que el backoffice envía una segunda notificación PUT para una solicitud que ya fue marcada como CERTIFICADO_EMITIDO (por ejemplo, por un retry del motor de generación),  
**Cuando** el sistema recibe la notificación duplicada,  
**Entonces** detecta que la solicitud ya está en estado CERTIFICADO_EMITIDO, retorna HTTP 200 (idempotencia) sin insertar códigos duplicados ni enviar un segundo email al solicitante.

#### CA-15.4 — Fallo en el envío de email (Edge Case)

**Dado** que la notificación del backoffice se procesa correctamente (estado actualizado, códigos insertados) pero el servidor SMTP no está disponible,  
**Cuando** el sistema intenta enviar el email de notificación,  
**Entonces** completa la transacción de base de datos exitosamente (el certificado queda disponible para descarga), registra el fallo del email en los logs y encola el email para reintento posterior. NO revierte la actualización de estado por fallo del email.

#### CA-15.5 — Credenciales de servicio inválidas (Error)

**Dado** que se recibe un request PUT sin credenciales de servicio válidas o con credenciales expiradas,  
**Cuando** el sistema valida la autenticación del backoffice,  
**Entonces** retorna HTTP 401 Unauthorized, NO procesa la notificación y registra el intento fallido con la IP de origen.

---

## HU-16 — Devolver solicitud de certificado

**Caso de uso origen:** UC-15 (flujo alternativo de devolución)

### Historia

**Como** operador de backoffice,  
**Quiero** devolver una solicitud de certificado cuando no es posible generar el documento (por ejemplo, datos inconsistentes o matrícula con restricciones),  
**Para** informar al solicitante que su solicitud no pudo ser procesada y que tome las acciones correctivas necesarias.

### Criterios de aceptación

#### CA-16.1 — Devolución exitosa de solicitud (Happy Path)

**Dado** que una solicitud se encuentra en estado PAGADA y el backoffice determina que no puede generar el certificado,  
**Cuando** invoca `PUT /api/v1/solicitudes/{id}/devolucion` con el motivo de la devolución,  
**Entonces** el sistema cambia el estado de la solicitud a DEVUELTA, registra la trazabilidad con el motivo, envía un email al solicitante informando la devolución y su motivo, y retorna HTTP 200.

#### CA-16.2 — Intento de devolver solicitud en estado no pagada (Error)

**Dado** que el backoffice intenta devolver una solicitud que se encuentra en estado GENERADA (aún no pagada) o en estado CERTIFICADO_EMITIDO (ya generado),  
**Cuando** el sistema valida el cambio de estado,  
**Entonces** retorna HTTP 409 Conflict con el mensaje "Solo se pueden devolver solicitudes en estado PAGADA" y NO modifica el estado de la solicitud.

#### CA-16.3 — Devolución sin motivo especificado (Edge Case)

**Dado** que el backoffice envía la devolución sin incluir el campo `motivo` o con un motivo vacío,  
**Cuando** el sistema valida el payload,  
**Entonces** retorna HTTP 400 Bad Request indicando que el motivo es obligatorio para realizar la devolución, asegurando que el solicitante siempre recibirá una explicación.

#### CA-16.4 — Devolución con reembolso pendiente (Edge Case)

**Dado** que la solicitud fue pagada con la pasarela electrónica (total > $0) y se devuelve,  
**Cuando** el sistema procesa la devolución,  
**Entonces** además de cambiar el estado a DEVUELTA, el sistema marca la solicitud como candidata a reembolso, registra el monto pagado originalmente y genera una alerta para el equipo de finanzas con los datos de la transacción (número de orden, monto, fecha de pago).

---

## HU-17 — Consultar certificados generados por número de orden

**Caso de uso origen:** UC-15 (complemento de backoffice)  
**Derivado de:** `CCB.Certificados.ApiUpload/CertificadosController.GetCertificadosOrden`

### Historia

**Como** sistema de backoffice o servicio de generación de certificados,  
**Quiero** consultar los certificados asociados a un número de orden de pago específico, obteniendo sus códigos de verificación y el estado de verificaciones realizadas,  
**Para** validar que los certificados de una orden fueron correctamente registrados en el sistema y monitorear el uso de sus códigos de verificación.

### Criterios de aceptación

#### CA-17.1 — Consulta exitosa con certificados registrados (Happy Path)

**Dado** que una orden de pago con número `ORD-2026-001234` tiene 3 certificados registrados en el sistema, cada uno con su código de verificación y contadores de verificación,  
**Cuando** se invoca `GET api/CertificadosOrden?numOrden=ORD-2026-001234`,  
**Entonces** el sistema retorna HTTP 200 con una lista de 3 objetos, cada uno conteniendo: `codVerificacion` (código de 14 caracteres), `cntVerificaciones` (máximo de verificaciones permitidas) y `cntVerificados` (verificaciones realizadas hasta el momento).

#### CA-17.2 — Orden sin certificados registrados (Edge Case)

**Dado** que se consulta un número de orden que no tiene certificados asociados (por ejemplo, una orden recién pagada cuyo certificado aún no ha sido generado),  
**Cuando** se invoca `GET api/CertificadosOrden?numOrden=ORD-INEXISTENTE`,  
**Entonces** el sistema retorna HTTP 200 con una lista vacía (`[]`), indicando que aún no hay certificados registrados para esa orden.

#### CA-17.3 — Parámetro numOrden vacío o nulo (Error)

**Dado** que se invoca el endpoint sin proporcionar el parámetro `numOrden` o con un valor vacío,  
**Cuando** el sistema procesa la solicitud,  
**Entonces** se retorna HTTP 400 Bad Request indicando que el número de orden es un parámetro obligatorio.

#### CA-17.4 — Concurrencia: consulta mientras se registran nuevos certificados (Edge Case)

**Dado** que el motor de generación está en proceso de registrar certificados para una orden (por ejemplo, una orden con 10 certificados donde solo 6 han sido procesados),  
**Cuando** se consulta la orden en ese momento,  
**Entonces** el sistema retorna únicamente los certificados ya registrados (los 6 disponibles), sin bloquear ni esperar a que se completen los restantes, reflejando el estado parcial con datos consistentes.

---

## Trazabilidad Casos de Uso → Historias de Usuario

| Caso de Uso | Historia de Usuario | Relación | Prioridad |
|---|---|---|---|
| UC-01 | HU-01 (Buscar inscrito) | Sub-flujo de búsqueda | Alta |
| UC-01 | HU-02 (Consultar catálogo) | Sub-flujo de catálogo | Alta |
| UC-01 | HU-03 (Solicitar certificados estándar) | Flujo principal | Alta |
| UC-01 | HU-10 (Pagar vía pasarela) | Sub-flujo de pago | Alta |
| UC-01 | HU-12 (Consultar historial) | Sub-flujo de consulta post-solicitud | Alta |
| UC-01 | HU-13 (Descargar certificado PDF) | Sub-flujo de descarga | Alta |
| UC-02 | HU-03A (Autenticarse como afiliado vía MAUC SSO) | Precondición de autenticación | Alta |
| UC-02 | HU-04 (Solicitar como afiliado) | Flujo principal | Alta |
| UC-02 | HU-05 (Consultar matrícula principal) | Flujo alternativo de establecimientos | Alta |
| UC-02 | HU-11 (Pago en cero afiliados) | Sub-flujo de pago gratuito | Alta |
| UC-03 | HU-06 (Solicitar especiales) | Flujo principal | Alta |
| UC-03 | HU-06A (Negativo para no matriculados) | Flujo alternativo | Alta |
| UC-03 | HU-06B (Consultar Kardex mercantil) | Sub-flujo de textual | Alta |
| UC-03 | HU-06C (Carta de solicitud para especiales) | Sub-flujo post-liquidación | Media |
| UC-04 | HU-07A (Autenticarse en módulo de depósitos) | Precondición de autenticación | Alta |
| UC-04 | HU-07 (Solicitar depósitos financieros) | Flujo principal | Alta |
| UC-04 | HU-07B (Carta de solicitud para depósitos) | Sub-flujo documental | Alta |
| UC-05 | HU-08 (Solicitar costumbres mercantiles) | Flujo principal | Media |
| UC-06 | HU-09 (Solicitar desde app móvil) | Flujo principal | Media |
| UC-14 | HU-14 (Verificar autenticidad) | Flujo principal | Alta |
| UC-15 | HU-15 (Notificar certificado generado) | Flujo principal | Alta |
| UC-15 | HU-16 (Devolver solicitud) | Flujo alternativo de devolución | Media |
| UC-15 | HU-17 (Consultar certificados por número de orden) | Complemento de backoffice | Media |

---

## Criterios INVEST — Validación

| Criterio | Aplicación en las historias |
|---|---|
| **I**ndependiente | Cada historia puede desarrollarse y entregarse sin dependencia bloqueante de las demás. Las dependencias lógicas (búsqueda antes de liquidación) son secuenciales del flujo, no técnicas. |
| **N**egociable | Las historias definen el QUÉ, no el CÓMO. La implementación técnica queda a criterio del equipo. |
| **V**aliosa | Cada historia entrega valor tangible al usuario o al negocio: buscar, liquidar, pagar, descargar, verificar. |
| **E**stimable | El alcance de cada historia está acotado a una funcionalidad específica con criterios claros de aceptación. |
| **S**mall (Pequeña) | Las historias están dimensionadas para completarse en un sprint (1-2 semanas). Las más complejas (HU-03, HU-04) pueden requerir sprint completo. |
| **T**estable | Los criterios de aceptación en formato Dado/Cuando/Entonces son directamente automatizables como pruebas de aceptación (BDD). |

---

## Notas para el equipo de QA

1. **Pruebas de integración SOAP:** Las historias que involucran PUP, TiendaWS y SHD requieren mocks/stubs para testing unitario y acceso a ambientes de QA para testing de integración.
2. **Pruebas de concurrencia:** HU-03 (doble clic), HU-14 (rate limiting) y HU-15 (notificación duplicada) requieren pruebas con herramientas de carga.
3. **Pruebas de expiración:** HU-10 (orden vencida) y HU-14 (código expirado) requieren manipulación de fechas o datos de prueba preparados.
4. **Pruebas de seguridad:** HU-14 (enumeración de códigos), HU-15 (credenciales backoffice) y HU-09 (API key) requieren revisión en pruebas de penetración.
5. **Pruebas E2E:** El flujo completo (HU-01 → HU-02 → HU-03 → HU-10 → HU-15 → HU-13 → HU-14) debe probarse como escenario end-to-end.
