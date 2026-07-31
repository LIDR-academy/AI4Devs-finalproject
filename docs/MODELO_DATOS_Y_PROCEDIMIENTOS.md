# Modelo de Datos y Procedimientos Almacenados — Sistema de Certificados Electrónicos CCB

**Base de datos:** `SolicitudServiciosVirtuales`  
**Servidor:** (SQL Server 2016 SP3 — Developer Edition 64-bit)  
**Esquema:** `dbo`  
**Fecha de documentación:** Junio 2026  
**Derivado de:** Exploración directa vía MCP MSSQL sobre el ambiente de staging

---

## Índice

1. [Resumen del modelo](#1-resumen-del-modelo)
2. [Tablas transaccionales (sv_)](#2-tablas-transaccionales-sv_)
3. [Tablas de catálogo (ta_)](#3-tablas-de-catálogo-ta_)
4. [Tablas de auditoría y trazabilidad de APIs](#4-tablas-de-auditoría-y-trazabilidad-de-apis)
5. [Tablas de administración y usuarios](#5-tablas-de-administración-y-usuarios)
6. [Diagrama de relaciones (ER simplificado)](#6-diagrama-de-relaciones-er-simplificado)
7. [Procedimientos almacenados](#7-procedimientos-almacenados)
8. [Funciones](#8-funciones)
9. [Datos de catálogo relevantes](#9-datos-de-catálogo-relevantes)

---



## 1. Resumen del modelo

El modelo de datos del sistema de Certificados Electrónicos de la CCB contiene **90 tablas** distribuidas en las siguientes categorías:


| Categoría       | Prefijo                    | Cantidad | Descripción                                                       |
| --------------- | -------------------------- | -------- | ----------------------------------------------------------------- |
| Transaccionales | `sv_`                      | ~18      | Solicitudes, solicitantes, cotizaciones, trazabilidad, generación |
| Catálogos       | `ta_`                      | ~45      | Tipos, estados, parámetros, municipios, departamentos, sedes      |
| Auditoría APIs  | `ta_trazabilidad_api_`     | 3        | Trazabilidad de APIs de notificación, verificación y devolución   |
| Logs            | `Log*`, `ExcepcionEnviada` | ~5       | Logs de afiliados, solicitudes, excepciones, descargas            |
| Administración  | `Usuario_*`                | ~5       | Usuarios, roles, permisos del backoffice                          |


Adicionalmente existen **120+ procedimientos almacenados** y **5 funciones** que soportan toda la lógica de negocio.

---



## 2. Tablas transaccionales (sv_)



### 2.1 `sv_solicitante` — Datos del solicitante

Almacena la información personal de quien solicita los certificados.


| Columna                   | Tipo            | Nulo | Descripción                                   |
| ------------------------- | --------------- | ---- | --------------------------------------------- |
| `id_solicitante`          | `int`           | NO   | PK — Identificador del solicitante (IDENTITY) |
| `id_crm`                  | `varchar(50)`   | SÍ   | ID de integración con CRM                     |
| `num_cliente_sirep`       | `int`           | SÍ   | Número de cliente en SIREP                    |
| `nom1_solicitante`        | `varchar(400)`  | SÍ   | Primer nombre                                 |
| `nom2_solicitante`        | `varchar(50)`   | SÍ   | Segundo nombre                                |
| `ape1_solicitante`        | `varchar(50)`   | SÍ   | Primer apellido                               |
| `ape2_solicitante`        | `varchar(50)`   | SÍ   | Segundo apellido                              |
| `nombre_completo`         | `varchar(200)`  | SÍ   | Nombre completo concatenado                   |
| `mail_cliente`            | `varchar(150)`  | NO   | Email del solicitante (obligatorio)           |
| `num_id`                  | `varchar(15)`   | SÍ   | Número de identificación                      |
| `id_clase_identificacion` | `smallint`      | SÍ   | FK → `ta_clase_identificacion`                |
| `num_telefono`            | `varchar(15)`   | SÍ   | Teléfono fijo                                 |
| `id_pais`                 | `nvarchar(6)`   | SÍ   | Código de país                                |
| `id_ciudad`               | `nvarchar(5)`   | SÍ   | Código de ciudad                              |
| `nom_ciudad`              | `nvarchar(100)` | SÍ   | Nombre de la ciudad                           |
| `direccion`               | `nvarchar(150)` | SÍ   | Dirección del solicitante                     |
| `num_movil`               | `nvarchar(16)`  | SÍ   | Teléfono celular                              |


---



### 2.2 `sv_solicitud` — Solicitud de certificados

Registro principal de cada solicitud realizada al sistema.


| Columna                   | Tipo               | Nulo | Descripción                                                                 |
| ------------------------- | ------------------ | ---- | --------------------------------------------------------------------------- |
| `id_solicitud`            | `int`              | NO   | PK — Identificador de la solicitud (IDENTITY)                               |
| `fec_inicio`              | `datetime`         | SÍ   | Fecha de creación de la solicitud                                           |
| `fec_finalizacion`        | `datetime`         | SÍ   | Fecha de finalización/vencimiento                                           |
| `id_solicitante`          | `int`              | SÍ   | FK → `sv_solicitante.id_solicitante`                                        |
| `id_servicio_neg_virtual` | `int`              | SÍ   | ID del servicio de negocio virtual (18=estándar, 19=especial, 20=depósitos) |
| `num_cliente`             | `varchar(15)`      | SÍ   | Número de cliente PUP                                                       |
| `num_matricula`           | `varchar(10)`      | SÍ   | Matrícula mercantil (pad-left 8 dígitos)                                    |
| `num_proponente`          | `varchar(10)`      | SÍ   | Número de proponente                                                        |
| `id_solicitud_origen`     | `int`              | SÍ   | Referencia a solicitud original (reliquidaciones)                           |
| `guid_workflow_instance`  | `uniqueidentifier` | SÍ   | GUID del workflow (legacy)                                                  |
| `TipoSolicitud`           | `int`              | SÍ   | FK → `ta_tipo_solicitud` (1=estándar, 2=especial, 3=depósitos, 4=app móvil) |


---



### 2.3 `sv_cotizaciones` — Cotizaciones y órdenes de pago

Registra las cotizaciones generadas por PUP para cada solicitud.


| Columna            | Tipo            | Nulo | Descripción                                                                                        |
| ------------------ | --------------- | ---- | -------------------------------------------------------------------------------------------------- |
| `id_solicitud`     | `int`           | NO   | PK compuesta — FK → `sv_solicitud`                                                                 |
| `num_cotizacion`   | `int`           | NO   | PK compuesta — Número de orden de PUP                                                              |
| `num_recibo_pago`  | `varchar(15)`   | SÍ   | Número de recibo de pago                                                                           |
| `fecha_cotizacion` | `date`          | SÍ   | Fecha de generación de la cotización                                                               |
| `estado`           | `smallint`      | SÍ   | FK → `ta_estado_cotizacion` (0=SinProcesar, 4=Proceso, 5=PendienteDePago, 6=Aprobada, 8=Rechazada) |
| `archivo`          | `nvarchar(256)` | SÍ   | Nombre del archivo del certificado en S3                                                           |


---



### 2.4 `sv_trazabilidad` — Registro de cambios de estado

Bitácora de todos los cambios de estado de las solicitudes.


| Columna                  | Tipo           | Nulo | Descripción                                                |
| ------------------------ | -------------- | ---- | ---------------------------------------------------------- |
| `id_item`                | `numeric`      | NO   | PK — Identificador del registro de trazabilidad (IDENTITY) |
| `id_estado`              | `int`          | SÍ   | Estado en el grafo de workflow                             |
| `id_solicitud`           | `int`          | SÍ   | FK → `sv_solicitud`                                        |
| `fec_inicio`             | `datetime`     | SÍ   | Fecha de inicio del estado                                 |
| `fec_final`              | `datetime`     | SÍ   | Fecha de finalización del estado                           |
| `id_calificacion_estado` | `smallint`     | SÍ   | Calificación del estado (aprobado, rechazado)              |
| `id_calificacion`        | `smallint`     | SÍ   | Calificación interna                                       |
| `id_usuario_generador`   | `nvarchar(10)` | SÍ   | Usuario que generó el cambio                               |
| `hora_inicio`            | `char(10)`     | SÍ   | Hora de inicio                                             |
| `hora_finalizacion`      | `char(10)`     | SÍ   | Hora de finalización                                       |


---



### 2.5 `sv_preliquidacion` — Detalle de items preliquidados

Almacena cada línea del carrito de certificados liquidados.


| Columna                 | Tipo           | Nulo | Descripción                         |
| ----------------------- | -------------- | ---- | ----------------------------------- |
| `id_preliquidacion`     | `int`          | NO   | PK — Identificador (IDENTITY)       |
| `id_solicitud`          | `int`          | SÍ   | FK → `sv_solicitud`                 |
| `num_liquida`           | `int`          | SÍ   | Número de liquidación               |
| `fec_preliquidacion`    | `datetime`     | SÍ   | Fecha de preliquidación             |
| `estado_preliquidacion` | `int`          | SÍ   | Estado de la preliquidación         |
| `descripcion_servicio`  | `varchar(250)` | SÍ   | Descripción del tipo de certificado |
| `cantidad`              | `int`          | SÍ   | Cantidad de certificados del tipo   |
| `valor_servicio`        | `float`        | SÍ   | Valor unitario del servicio         |
| `id_servicio`           | `nvarchar(15)` | SÍ   | ID del servicio en TiendaWS         |
| `matricula`             | `nvarchar(9)`  | SÍ   | Matrícula asociada                  |
| `ctr_afiliado`          | `bit`          | SÍ   | Indicador de si es afiliado         |
| `base_liquidacion`      | `float`        | SÍ   | Base para liquidación               |
| `base_activos`          | `float`        | SÍ   | Base de activos                     |


---



### 2.6 `sv_generacion` — Estado de generación de certificados

Controla el estado de generación de los PDFs por el motor de backoffice.


| Columna         | Tipo       | Nulo | Descripción                                                            |
| --------------- | ---------- | ---- | ---------------------------------------------------------------------- |
| `id_generacion` | `int`      | NO   | PK — Identificador (IDENTITY)                                          |
| `fecha`         | `datetime` | SÍ   | Fecha de generación                                                    |
| `id_solicitud`  | `int`      | SÍ   | FK → `sv_solicitud`                                                    |
| `estado`        | `int`      | SÍ   | FK → `ta_estado_generacion` (0=Creado, 1=Generado, 2=Fallo, 3=Parcial) |


---



### 2.7 `sv_inscrito` — Datos del inscrito en registro mercantil

Cache local de datos del inscrito consultado desde el servicio REST externo.


| Columna          | Tipo          | Nulo | Descripción                   |
| ---------------- | ------------- | ---- | ----------------------------- |
| `id_inscrito`    | `int`         | NO   | PK — Identificador (IDENTITY) |
| `num_cliente`    | `varchar(15)` | SÍ   | Número de cliente             |
| `num_matricula`  | `varchar(10)` | SÍ   | Matrícula mercantil           |
| `num_proponente` | `varchar(10)` | SÍ   | Número de proponente          |


---



### 2.8 `sv_solicitud_afiliados` — Solicitudes de afiliados

Datos específicos para solicitudes realizadas por afiliados CCB.


| Columna            | Tipo             | Nulo | Descripción                         |
| ------------------ | ---------------- | ---- | ----------------------------------- |
| `Id_solicitud`     | `int`            | NO   | PK — FK → `sv_solicitud`            |
| `TipoDocumento`    | `nvarchar(64)`   | NO   | Descripción del tipo de documento   |
| `TipoDocumentoId`  | `int`            | NO   | ID del tipo de documento            |
| `NumeroDocumento`  | `nvarchar(64)`   | NO   | Número de documento del afiliado    |
| `Nombre`           | `nvarchar(256)`  | NO   | Nombre del afiliado                 |
| `NumeroMatricula`  | `nvarchar(64)`   | NO   | Matrícula del afiliado              |
| `Correo`           | `nvarchar(64)`   | NO   | Correo electrónico                  |
| `Celular`          | `nvarchar(64)`   | NO   | Teléfono celular                    |
| `FechaSolicitud`   | `datetime`       | SÍ   | Fecha de la solicitud               |
| `SedeId`           | `int`            | SÍ   | ID de la sede                       |
| `Sede`             | `nvarchar(64)`   | SÍ   | Nombre de la sede                   |
| `InfoPEP`          | `bit`            | SÍ   | Es persona expuesta políticamente   |
| `OperacionInter`   | `bit`            | SÍ   | Realiza operaciones internacionales |
| `PaisesId`         | `nvarchar(1600)` | SÍ   | IDs de países de operación          |
| `SagrilaftYPtee`   | `bit`            | SÍ   | Acepta Sagrilaft y PTEE             |
| `TipoOrganizacion` | `bit`            | SÍ   | Tipo de organización                |


---



### 2.9 `sv_direccion_envio` — Dirección de envío

Dirección de entrega asociada a la solicitud (para envío físico o referencia de sede).


| Columna        | Tipo            | Nulo | Descripción                      |
| -------------- | --------------- | ---- | -------------------------------- |
| `id_solicitud` | `int`           | NO   | PK — FK → `sv_solicitud`         |
| `direccion`    | `nvarchar(150)` | SÍ   | Dirección de envío               |
| `id_ciudad`    | `nvarchar(5)`   | SÍ   | Código de ciudad                 |
| `nom_ciudad`   | `nvarchar(100)` | SÍ   | Nombre de la ciudad              |
| `pais`         | `nvarchar(6)`   | SÍ   | Código de país                   |
| `metodo_envio` | `nvarchar(5)`   | SÍ   | Método de entrega                |
| `codigo_sede`  | `nvarchar(5)`   | SÍ   | Código de sede CCB para recogida |


---



### 2.10 `sv_documento_anexo` — Documentos adjuntos

Almacena las rutas de documentos anexos (PDFs de depósitos financieros, cartas, etc.).


| Columna                | Tipo            | Nulo | Descripción                                   |
| ---------------------- | --------------- | ---- | --------------------------------------------- |
| `id_tipo_documento`    | `int`           | NO   | PK compuesta — FK → `ta_tipo_documento_anexo` |
| `id_solicitud`         | `int`           | NO   | PK compuesta — FK → `sv_solicitud`            |
| `ruta_servidor`        | `varchar(6000)` | SÍ   | Ruta del archivo en el file share             |
| `Id_imagen`            | `numeric`       | NO   | Identificador de imagen                       |
| `id_item_trazabilidad` | `numeric`       | NO   | FK → `sv_trazabilidad.id_item`                |
| `id_item`              | `numeric`       | NO   | Identificador del ítem                        |


---



### 2.11 Otras tablas transaccionales


| Tabla                             | Descripción                              |
| --------------------------------- | ---------------------------------------- |
| `sv_factura`                      | Datos de factura electrónica asociada    |
| `sv_tramites`                     | Trámites adicionales vinculados          |
| `sv_estrategia_preliquida`        | Estrategias de preliquidación            |
| `sv_solic_af_accionistas`         | Accionistas de solicitudes de afiliados  |
| `sv_solic_eliminacion_documentos` | Registro de eliminación de documentos    |
| `sv_autoriza_contacto`            | Autorización de contacto del solicitante |
| `sv_solicitante_telefono`         | Teléfonos adicionales del solicitante    |
| `sv_control_notificacion_SIPREF`  | Control de notificaciones SIPREF         |




### 2.12 Tablas históricas (`*_hist`)

Las siguientes tablas almacenan copias históricas de los datos transaccionales:


| Tabla histórica                    | Tabla origen                  |
| ---------------------------------- | ----------------------------- |
| `sv_solicitud_hist`                | `sv_solicitud`                |
| `sv_solicitante_hist`              | `sv_solicitante`              |
| `sv_cotizaciones_hist`             | `sv_cotizaciones`             |
| `sv_trazabilidad_hist`             | `sv_trazabilidad`             |
| `sv_generacion_hist`               | `sv_generacion`               |
| `sv_solicitante_telefono_hist`     | `sv_solicitante_telefono`     |
| `sv_autoriza_contacto_hist`        | `sv_autoriza_contacto`        |
| `sv_autoriza_contacto_autdit_hist` | `sv_autoriza_contacto_autdit` |


---



## 3. Tablas de catálogo (ta_)



### 3.1 Catálogos de estado


| Tabla                            | Columnas PK                | Descripción                                          |
| -------------------------------- | -------------------------- | ---------------------------------------------------- |
| `ta_estado_solicitud`            | `id_estado` CHAR(4)        | Estados del flujo de solicitud                       |
| `ta_estado_cotizacion`           | `id_estado` INT            | Estados de la cotización/orden de pago               |
| `ta_estado_generacion`           | `id_estado_generacion` INT | Estados de generación del certificado PDF            |
| `ta_estado_tramite`              | —                          | Estados de trámites                                  |
| `ta_estado_grafo`                | —                          | Nodos del grafo de workflow                          |
| `ta_estado_juridico_empresa`     | —                          | Estado jurídico de la empresa                        |
| `ta_estado_servicio_virtual_neg` | —                          | Estados del servicio virtual de negocio              |
| `ta_calificacion_estado`         | —                          | Calificaciones de estado (aprobado, rechazado, etc.) |




### 3.2 Catálogos de tipos


| Tabla                        | Descripción                                                           |
| ---------------------------- | --------------------------------------------------------------------- |
| `ta_tipo_solicitud`          | Tipos de solicitud (1=estándar, 2=especial, 3=depósitos, 4=app móvil) |
| `ta_clase_identificacion`    | Tipos de documento de identidad                                       |
| `ta_tipo_sociedad`           | Tipos de sociedad mercantil                                           |
| `ta_tipo_autenticacion`      | Métodos de autenticación                                              |
| `ta_tipo_documento_anexo`    | Tipos de documentos adjuntos                                          |
| `ta_tipo_parametro_servicio` | Tipos de parámetros de servicio                                       |
| `ta_tipo_aporte_social`      | Tipos de aporte social                                                |
| `ta_tipo_telefono`           | Tipos de teléfono (fijo, celular, etc.)                               |
| `ta_tipo_ubicacion`          | Tipos de ubicación                                                    |




### 3.3 Catálogos geográficos


| Tabla             | Descripción                 |
| ----------------- | --------------------------- |
| `ta_pais`         | Catálogo de países          |
| `ta_departamento` | Departamentos de Colombia   |
| `ta_municipios`   | Municipios por departamento |
| `ta_nacionalidad` | Nacionalidades              |
| `ta_consulados`   | Consulados                  |




### 3.4 Catálogos de negocio


| Tabla                         | Descripción                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `ta_servicio_virtual_negocio` | Servicios virtuales de negocio (certificados estándar, especiales, depósitos) |
| `ta_parametros_servicio`      | Parámetros configurables por servicio                                         |
| `ta_grafo`                    | Definición del grafo de workflow por servicio                                 |
| `ta_Sede`                     | Sedes de la CCB                                                               |
| `ta_sede_administrativa`      | Sedes administrativas                                                         |
| `ta_plantilla`                | Plantillas de documentos                                                      |
| `ta_bancos`                   | Catálogo de bancos                                                            |
| `ta_grupo_niif`               | Grupos NIIF para estados financieros                                          |




### 3.5 Catálogos de clasificación


| Tabla                          | Descripción                                     |
| ------------------------------ | ----------------------------------------------- |
| `ta_ciiu`                      | Clasificación Industrial Internacional Uniforme |
| `ta_ciiu_shd`                  | CIIU para SHD                                   |
| `ta_bienes_servicio`           | Bienes y servicios                              |
| `ta_bienes_servicio_producto`  | Productos de bienes y servicios                 |
| `ta_bienes_servicios_familia`  | Familias de bienes y servicios                  |
| `ta_bienes_servicios_segmento` | Segmentos de bienes y servicios                 |
| `ta_criterios_aceptacion`      | Criterios de aceptación                         |




### 3.6 Catálogos fiscales


| Tabla                       | Descripción                           |
| --------------------------- | ------------------------------------- |
| `ta_regimen_fiscal`         | Régimen fiscal                        |
| `ta_responsabilidad_fiscal` | Responsabilidades fiscales            |
| `ta_responsabilidades`      | Responsabilidades tributarias         |
| `ta_tributo_fe`             | Tributos para facturación electrónica |




### 3.7 Catálogos de cartas de solicitud


| Tabla                 | Descripción                                                             |
| --------------------- | ----------------------------------------------------------------------- |
| `ta_InformacionCarta` | Encabezado de carta de solicitud (especiales y depósitos) — 18 columnas |
| `ta_DetalleCarta`     | Detalle/líneas de la carta de solicitud — 11 columnas                   |


---



## 4. Tablas de auditoría y trazabilidad de APIs



### 4.1 `ta_trazabilidad_api_notificarCertificados`

Registra cada invocación de la API de notificación de certificados por parte del backoffice.


| Columna             | Tipo            | Nulo | Descripción                                  |
| ------------------- | --------------- | ---- | -------------------------------------------- |
| `TrazabilidadId`    | `int`           | NO   | PK — IDENTITY                                |
| `Archivo`           | `nvarchar(128)` | NO   | Nombre del archivo PDF notificado            |
| `NumeroOrden`       | `int`           | NO   | Número de orden de pago                      |
| `FechaExpedicion`   | `datetime`      | SÍ   | Fecha de expedición del certificado          |
| `FechaSolicitud`    | `datetime`      | NO   | Fecha de la solicitud de la API              |
| `CodigoVerficacion` | `nvarchar(MAX)` | SÍ   | Códigos de verificación (separados por coma) |
| `Mensaje`           | `nvarchar(256)` | NO   | Mensaje de resultado de la operación         |




### 4.2 `ta_trazabilidad_api_verificarCertificados`

Registra cada verificación de autenticidad de certificados.


| Columna              | Tipo            | Nulo | Descripción                                   |
| -------------------- | --------------- | ---- | --------------------------------------------- |
| `TrazabilidadId`     | `int`           | NO   | PK — IDENTITY                                 |
| `CodigoVerificacion` | `nvarchar(64)`  | NO   | Código de verificación consultado             |
| `IpCliente`          | `nvarchar(64)`  | SÍ   | Dirección IP del tercero verificador          |
| `FechaVerificacion`  | `datetime`      | SÍ   | Fecha en que se verificó el código            |
| `FechaSolicitud`     | `datetime`      | NO   | Fecha de la solicitud de la API               |
| `Mensaje`            | `nvarchar(256)` | NO   | Resultado (válido, expirado, no existe, etc.) |




### 4.3 `ta_trazabilidad_api_devolverCertificados`

Registra cada devolución de solicitud ejecutada por el backoffice.


| Columna          | Tipo            | Nulo | Descripción                              |
| ---------------- | --------------- | ---- | ---------------------------------------- |
| `TrazabilidadId` | `int`           | NO   | PK — IDENTITY                            |
| `Orden`          | `int`           | NO   | Número de orden de la solicitud devuelta |
| `FechaSolicitud` | `datetime`      | NO   | Fecha de la solicitud de devolución      |
| `Observaciones`  | `nvarchar(512)` | NO   | Motivo de la devolución                  |


---



## 5. Tablas de administración y usuarios


| Tabla                  | Descripción                                      |
| ---------------------- | ------------------------------------------------ |
| `Usuario_Admon`        | Usuarios del módulo de administración/backoffice |
| `Usuario_Admon_Rol`    | Roles asignados a usuarios                       |
| `Usuario_Item`         | Ítems de menú o funcionalidades                  |
| `Usuario_Log`          | Log de acciones de usuarios                      |
| `Usuario_Rol_Item`     | Permisos por rol sobre ítems                     |
| `Usuario_Rol_Servicio` | Permisos por rol sobre servicios                 |




### Tablas de log


| Tabla                    | Descripción                                    |
| ------------------------ | ---------------------------------------------- |
| `ExcepcionEnviada`       | Excepciones de aplicación notificadas          |
| `LogAfiliadosEnvioMail`  | Log de envío de emails a afiliados             |
| `LogDescargaDBAfiliados` | Log de descargas de base de datos de afiliados |
| `LogSolicitudAfiliados`  | Log de solicitudes de afiliados                |
| `sv_ErrorAplicacion`     | Errores de aplicación registrados              |
| `ta_log_error`           | Log de errores general                         |


---



## 6. Diagrama de relaciones (ER simplificado)

```mermaid
erDiagram
    sv_solicitante ||--o{ sv_solicitud : "1 solicitante → N solicitudes"
    sv_solicitud ||--o{ sv_cotizaciones : "1 solicitud → N cotizaciones"
    sv_solicitud ||--o{ sv_trazabilidad : "1 solicitud → N trazas"
    sv_solicitud ||--o{ sv_preliquidacion : "1 solicitud → N items"
    sv_solicitud ||--o{ sv_generacion : "1 solicitud → N generaciones"
    sv_solicitud ||--o| sv_direccion_envio : "1 solicitud → 0..1 dirección"
    sv_solicitud ||--o{ sv_documento_anexo : "1 solicitud → N documentos"
    sv_solicitud ||--o| sv_solicitud_afiliados : "1 solicitud → 0..1 datos afiliado"
    sv_solicitud }o--|| ta_tipo_solicitud : "tipo solicitud"
    sv_solicitante }o--|| ta_clase_identificacion : "tipo identificación"
    sv_cotizaciones }o--|| ta_estado_cotizacion : "estado cotización"
    sv_generacion }o--|| ta_estado_generacion : "estado generación"
    ta_InformacionCarta ||--o{ ta_DetalleCarta : "1 carta → N detalles"

    sv_solicitante {
        int id_solicitante PK
        varchar num_id
        smallint id_clase_identificacion FK
        varchar mail_cliente
        varchar nombre_completo
    }

    sv_solicitud {
        int id_solicitud PK
        int id_solicitante FK
        int id_servicio_neg_virtual
        varchar num_matricula
        int TipoSolicitud FK
        datetime fec_inicio
    }

    sv_cotizaciones {
        int id_solicitud PK_FK
        int num_cotizacion PK
        smallint estado FK
        nvarchar archivo
    }

    sv_trazabilidad {
        numeric id_item PK
        int id_solicitud FK
        int id_estado
        datetime fec_inicio
    }

    sv_preliquidacion {
        int id_preliquidacion PK
        int id_solicitud FK
        int cantidad
        float valor_servicio
        nvarchar id_servicio
    }

    sv_generacion {
        int id_generacion PK
        int id_solicitud FK
        int estado FK
    }
```



---



## 7. Procedimientos almacenados

Se identificaron **120+ procedimientos almacenados** agrupados por funcionalidad. A continuación se documentan los **procedimientos principales** del sistema (excluyendo copias `_tmp`, `_v0`, `_vtemp`, `_hernan`, `_nvo` y SPs de diagramas del sistema).

### 7.1 Módulo de Solicitudes — Inserción



#### `Insertar_svSolicitante`

> Crea un nuevo registro de solicitante en el sistema.


| Parámetro                  | Tipo            | Modo      | Descripción                |
| -------------------------- | --------------- | --------- | -------------------------- |
| `@id_crm`                  | `varchar(50)`   | IN        | ID CRM                     |
| `@nom1_solicitante`        | `varchar(50)`   | IN        | Primer nombre              |
| `@nom2_solicitante`        | `varchar(50)`   | IN        | Segundo nombre             |
| `@ape1_solicitante`        | `varchar(50)`   | IN        | Primer apellido            |
| `@ape2_solicitante`        | `varchar(50)`   | IN        | Segundo apellido           |
| `@nombre_completo`         | `varchar(200)`  | IN        | Nombre completo            |
| `@mail_cliente`            | `varchar(150)`  | IN        | Email                      |
| `@num_id`                  | `varchar(15)`   | IN        | Número de documento        |
| `@id_clase_identificacion` | `smallint`      | IN        | Tipo de documento          |
| `@num_telefono`            | `nvarchar(15)`  | IN        | Teléfono                   |
| `@id_pais`                 | `nvarchar(6)`   | IN        | País                       |
| `@id_ciudad`               | `nvarchar(5)`   | IN        | Ciudad                     |
| `@nom_ciudad`              | `nvarchar(100)` | IN        | Nombre ciudad              |
| `@direccion`               | `nvarchar(150)` | IN        | Dirección                  |
| `@num_movil`               | `nvarchar(16)`  | IN        | Celular                    |
| `@id_solicitante`          | `int`           | **INOUT** | **Retorna el ID generado** |


---



#### `Insertar_svSolicitud`

> Crea una nueva solicitud de certificados.


| Parámetro                  | Tipo               | Modo      | Descripción                                       |
| -------------------------- | ------------------ | --------- | ------------------------------------------------- |
| `@fec_inicio`              | `datetime`         | IN        | Fecha de inicio                                   |
| `@fec_finalizacion`        | `datetime`         | IN        | Fecha de finalización (31-dic año actual)         |
| `@num_proponente`          | `varchar(10)`      | IN        | Número de proponente                              |
| `@guid_workflow_instance`  | `uniqueidentifier` | IN        | GUID del workflow                                 |
| `@id_solicitante`          | `int`              | IN        | FK solicitante                                    |
| `@id_servicio_neg_virtual` | `int`              | IN        | Servicio de negocio (18, 19, 20)                  |
| `@num_cliente`             | `varchar(15)`      | IN        | Número de cliente PUP                             |
| `@num_matricula`           | `varchar(10)`      | IN        | Matrícula mercantil                               |
| `@tipo_solicitud`          | `int`              | IN        | Tipo (1=estándar, 2=especial, 3=depósitos, 4=app) |
| `@id_solicitud`            | `int`              | **INOUT** | **Retorna el ID generado**                        |


---



#### `Insertar_svCotizaciones`

> Registra una cotización/orden de pago para la solicitud.


| Parámetro           | Tipo          | Modo | Descripción                |
| ------------------- | ------------- | ---- | -------------------------- |
| `@id_solicitud`     | `int`         | IN   | FK solicitud               |
| `@num_cotizacion`   | `int`         | IN   | Número de orden de PUP     |
| `@num_recibo_pago`  | `varchar(15)` | IN   | Número de recibo           |
| `@fecha_cotizacion` | `datetime`    | IN   | Fecha                      |
| `@estado`           | `int`         | IN   | Estado inicial (4=Proceso) |


---



#### `Insertar_sv_trazabilidad`

> Registra un cambio de estado en la bitácora de trazabilidad.


| Parámetro                 | Tipo       | Modo | Descripción                  |
| ------------------------- | ---------- | ---- | ---------------------------- |
| `@id_estado`              | `int`      | IN   | ID del estado en el grafo    |
| `@id_solicitud`           | `int`      | IN   | FK solicitud                 |
| `@fec_inicio`             | `datetime` | IN   | Fecha inicio del estado      |
| `@fec_final`              | `datetime` | IN   | Fecha fin del estado         |
| `@id_calificacion_estado` | `smallint` | IN   | Calificación                 |
| `@id_calificacion`        | `smallint` | IN   | Calificación interna         |
| `@id_usuario_generador`   | `char(10)` | IN   | Usuario que genera el cambio |
| `@hora_inicio`            | `char(10)` | IN   | Hora inicio                  |
| `@hora_finalizacion`      | `char(10)` | IN   | Hora fin                     |


---



#### `Insertar_svPreliquidacion`

> Registra una línea del carrito de certificados preliquidados.


| Parámetro                | Tipo           | Modo | Descripción              |
| ------------------------ | -------------- | ---- | ------------------------ |
| `@id_solicitud`          | `int`          | IN   | FK solicitud             |
| `@num_liquida`           | `int`          | IN   | Número de liquidación    |
| `@fec_preliquidacion`    | `datetime`     | IN   | Fecha                    |
| `@estado_preliquidacion` | `int`          | IN   | Estado                   |
| `@descripcion_servicio`  | `varchar(250)` | IN   | Nombre del certificado   |
| `@cantidad`              | `int`          | IN   | Cantidad de certificados |
| `@valor_servicio`        | `float`        | IN   | Valor unitario           |
| `@id_servicio`           | `nvarchar(15)` | IN   | ID servicio TiendaWS     |
| `@matricula`             | `nvarchar(9)`  | IN   | Matrícula                |
| `@ctr_afiliado`          | `bit`          | IN   | Es afiliado              |
| `@base_liquidacion`      | `float`        | IN   | Base de liquidación      |
| `@base_activos`          | `float`        | IN   | Base de activos          |


---



#### `Insertar_svDireccionEnvio`

> Registra la dirección de envío de la solicitud.


| Parámetro       | Tipo            | Modo | Descripción     |
| --------------- | --------------- | ---- | --------------- |
| `@id_solicitud` | `int`           | IN   | FK solicitud    |
| `@direccion`    | `nvarchar(150)` | IN   | Dirección       |
| `@id_ciudad`    | `nvarchar(5)`   | IN   | Código ciudad   |
| `@nom_ciudad`   | `nvarchar(100)` | IN   | Nombre ciudad   |
| `@pais`         | `nvarchar(6)`   | IN   | País            |
| `@metodo_envio` | `nvarchar(5)`   | IN   | Método de envío |
| `@codigo_sede`  | `nvarchar(5)`   | IN   | Sede CCB        |


---



#### `Insertar_svSolicitudAfiliados`

> Registra los datos específicos de una solicitud de afiliado.


| Parámetro           | Tipo           | Modo      | Descripción                    |
| ------------------- | -------------- | --------- | ------------------------------ |
| `@tipo_documentoId` | `int`          | IN        | ID tipo documento              |
| `@tipo_documento`   | `varchar(64)`  | IN        | Descripción tipo documento     |
| `@numero_documento` | `varchar(64)`  | IN        | Número documento               |
| `@nombre`           | `varchar(256)` | IN        | Nombre afiliado                |
| `@numero_matricula` | `varchar(64)`  | IN        | Matrícula                      |
| `@correo`           | `varchar(64)`  | IN        | Email                          |
| `@celular`          | `varchar(64)`  | IN        | Celular                        |
| `@id_solicitud`     | `int`          | **INOUT** | **Retorna el ID de solicitud** |


---



#### `Insertar_svSolicitanteTelefono`

> Registra un teléfono adicional del solicitante.


| Parámetro           | Tipo          | Modo |
| ------------------- | ------------- | ---- |
| `@id_solicitante`   | `int`         | IN   |
| `@id_tipo_telefono` | `int`         | IN   |
| `@num_telefono`     | `varchar(30)` | IN   |


---



### 7.2 Módulo de Solicitudes — Actualización



#### `Actualizar_svSolicitud`

> Actualiza datos de una solicitud existente (solicitante, matrícula, cliente, proponente).


| Parámetro           | Tipo          | Modo  |
| ------------------- | ------------- | ----- |
| `@fec_finalizacion` | `datetime`    | IN    |
| `@num_proponente`   | `varchar(10)` | IN    |
| `@id_solicitante`   | `int`         | IN    |
| `@num_cliente`      | `varchar(15)` | IN    |
| `@num_matricula`    | `varchar(10)` | IN    |
| `@id_solicitud`     | `int`         | INOUT |




#### `SCISP_Actualizar_svSolicitud`

> Actualiza el solicitante de una solicitud (versión SCISP).


| Parámetro         | Tipo  | Modo |
| ----------------- | ----- | ---- |
| `@id_solicitante` | `int` | IN   |
| `@id_solicitud`   | `int` | IN   |




#### `Actualizar_svCotizaciones`

> Actualiza estado y recibo de pago de una cotización.


| Parámetro           | Tipo          | Modo |
| ------------------- | ------------- | ---- |
| `@id_solicitud`     | `int`         | IN   |
| `@num_cotizacion`   | `int`         | IN   |
| `@num_recibo_pago`  | `varchar(15)` | IN   |
| `@fecha_cotizacion` | `datetime`    | IN   |
| `@estado`           | `int`         | IN   |




#### `ActualizarEstadotrazabilidad`

> Actualiza un registro de trazabilidad existente.


| Parámetro                                      | Tipo       | Modo |
| ---------------------------------------------- | ---------- | ---- |
| `@idItemAnterior`                              | `numeric`  | IN   |
| `@id_estado`                                   | `int`      | IN   |
| `@id_solicitud`                                | `int`      | IN   |
| `@fec_inicio` / `@fec_final`                   | `datetime` | IN   |
| `@id_calificacion_estado` / `@id_calificacion` | `smallint` | IN   |
| `@id_usuario_generador`                        | `char(10)` | IN   |
| `@hora_inicio` / `@hora_finalizacion`          | `char(10)` | IN   |




#### `Actualizar_EstadoPreliquidacionBySolicitud`

> Actualiza el estado de todas las preliquidaciones de una solicitud.


| Parámetro                | Tipo  | Modo |
| ------------------------ | ----- | ---- |
| `@id_solicitud`          | `int` | IN   |
| `@estado_preliquidacion` | `int` | IN   |


---



### 7.3 Módulo de Pagos



#### `AprobarPagoCotizacion`

> Marca una cotización como aprobada (pagada) y registra el recibo de pago.


| Parámetro          | Tipo          | Modo |
| ------------------ | ------------- | ---- |
| `@id_solicitud`    | `int`         | IN   |
| `@num_cotizacion`  | `int`         | IN   |
| `@num_recibo_pago` | `varchar(15)` | IN   |




#### `RechazarPagoCotizacion`

> Marca una cotización como rechazada.


| Parámetro         | Tipo  | Modo |
| ----------------- | ----- | ---- |
| `@id_solicitud`   | `int` | IN   |
| `@num_cotizacion` | `int` | IN   |




#### `AprobarEstudioCotizacion`

> Aprueba el estudio de una cotización.


| Parámetro         | Tipo  | Modo |
| ----------------- | ----- | ---- |
| `@id_solicitud`   | `int` | IN   |
| `@num_cotizacion` | `int` | IN   |




#### `RechazarEstudioCotizacion`

> Rechaza el estudio de una cotización.


| Parámetro         | Tipo  | Modo |
| ----------------- | ----- | ---- |
| `@id_solicitud`   | `int` | IN   |
| `@num_cotizacion` | `int` | IN   |


---



### 7.4 Módulo de Certificados y Verificación



#### `SCISP_InsertaSolicitudEstadoCertificado`

> Registra el estado del certificado generado por el backoffice (nombre del PDF, orden, fecha de expedición y códigos de verificación).


| Parámetro             | Tipo            | Modo | Descripción                                  |
| --------------------- | --------------- | ---- | -------------------------------------------- |
| `@Archivo`            | `nvarchar(128)` | IN   | Nombre del archivo PDF en S3                 |
| `@Orden`              | `int`           | IN   | Número de orden                              |
| `@FechaExpedicion`    | `datetime`      | IN   | Fecha de expedición                          |
| `@CodigoVerificacion` | `nvarchar(MAX)` | IN   | Códigos de verificación (separados por coma) |




#### `SCISP_InsertaCodigosVerificacion`

> Inserta un código de verificación individual asociado a un certificado.


| Parámetro          | Tipo           | Modo | Descripción                                         |
| ------------------ | -------------- | ---- | --------------------------------------------------- |
| `@Orden`           | `nvarchar(64)` | IN   | Número de orden                                     |
| `@Codigo`          | `nvarchar(64)` | IN   | Código de verificación (14 caracteres)              |
| `@Matricula`       | `nvarchar(64)` | IN   | Matrícula asociada                                  |
| `@Proponente`      | `nvarchar(64)` | IN   | Proponente                                          |
| `@ServicioId`      | `nvarchar(64)` | IN   | ID del servicio                                     |
| `@TipoCertificado` | `int`          | IN   | Tipo de certificado                                 |
| `@FechaExpedicion` | `datetime`     | IN   | Fecha de expedición (inicio de vigencia de 60 días) |




#### `SCISP_InsertaSolicitudVerificacionCertificado`

> Registra una verificación de certificado (IP del verificador y fecha).


| Parámetro             | Tipo           | Modo | Descripción                          |
| --------------------- | -------------- | ---- | ------------------------------------ |
| `@FechaVerificacion`  | `datetime`     | IN   | Fecha y hora de la verificación      |
| `@CodigoVerificacion` | `nvarchar(64)` | IN   | Código de 14 caracteres verificado   |
| `@Ip`                 | `nvarchar(64)` | IN   | Dirección IP del tercero verificador |




#### `SCISP_ActualizaEstadoSolicitudDevuelto`

> Marca una solicitud como devuelta por el backoffice.


| Parámetro        | Tipo            | Modo | Descripción                |
| ---------------- | --------------- | ---- | -------------------------- |
| `@Orden`         | `int`           | IN   | Número de orden a devolver |
| `@Observaciones` | `nvarchar(512)` | IN   | Motivo de la devolución    |


---



### 7.5 Módulo de Consultas



#### `Obtener_SolicitudById`

> Consulta una solicitud por su ID.


| Parámetro       | Tipo  | Modo |
| --------------- | ----- | ---- |
| `@id_solicitud` | `int` | IN   |




#### `Obtener_SolicitanteById`

> Consulta un solicitante por su ID.


| Parámetro         | Tipo  | Modo |
| ----------------- | ----- | ---- |
| `@id_solicitante` | `int` | IN   |




#### `BuscarSolicitanteByIdSolicitud`

> Busca el solicitante asociado a una solicitud.


| Parámetro       | Tipo  | Modo |
| --------------- | ----- | ---- |
| `@id_solicitud` | `int` | IN   |




#### `Obtener_Solicitante`

> Busca un solicitante por tipo y número de documento.


| Parámetro          | Tipo          | Modo |
| ------------------ | ------------- | ---- |
| `@tipoDocumento`   | `int`         | IN   |
| `@numeroDocumento` | `varchar(20)` | IN   |




#### `Obtener_sv_trazabilidadBySolicitud`

> Consulta la bitácora de trazabilidad de una solicitud.


| Parámetro       | Tipo  | Modo |
| --------------- | ----- | ---- |
| `@id_solicitud` | `int` | IN   |




#### `Obtener_CotizacionByNumCotizacion`

> Consulta una cotización por número de orden.


| Parámetro         | Tipo  | Modo |
| ----------------- | ----- | ---- |
| `@num_cotizacion` | `int` | IN   |




#### `Obtener_SolicitudByNumCotizacion`

> Busca la solicitud asociada a un número de cotización.


| Parámetro         | Tipo  | Modo |
| ----------------- | ----- | ---- |
| `@num_cotizacion` | `int` | IN   |




#### `Obtener_CotizacionValorByNumSolicitud`

> Obtiene el valor de cotización por lista de IDs de solicitud.


| Parámetro         | Tipo            | Modo |
| ----------------- | --------------- | ---- |
| `@idsSolicitudes` | `varchar(8000)` | IN   |




#### `Obtener_PreliquidacionBySolicitud`

> Consulta las líneas preliquidadas de una solicitud.


| Parámetro       | Tipo  | Modo |
| --------------- | ----- | ---- |
| `@id_solicitud` | `int` | IN   |


---



### 7.6 Módulo de Descargas



#### `Obtener_ListadoSolicitudesDescarga`

> Consulta solicitudes disponibles para descarga por tipo y número de documento del solicitante.


| Parámetro          | Tipo          | Modo |
| ------------------ | ------------- | ---- |
| `@tipoDocumento`   | `int`         | IN   |
| `@numeroDocumento` | `varchar(20)` | IN   |




#### `SCISP_Obtener_ListadoSolicitudesDescarga`

> Versión SCISP — Lista certificados descargables por documento del solicitante.


| Parámetro          | Tipo          | Modo |
| ------------------ | ------------- | ---- |
| `@tipoDocumento`   | `int`         | IN   |
| `@numeroDocumento` | `varchar(20)` | IN   |




#### `Obtener_ListadoSolicitudesDescargaAfil`

> Lista certificados descargables específicamente para afiliados.


| Parámetro          | Tipo          | Modo |
| ------------------ | ------------- | ---- |
| `@tipoDocumento`   | `int`         | IN   |
| `@numeroDocumento` | `varchar(20)` | IN   |




#### `SCISP_MatriculasDescarga`

> Obtiene matrículas con certificados disponibles para descarga.


| Parámetro          | Tipo           | Modo |
| ------------------ | -------------- | ---- |
| `@NumeroDocumento` | `nvarchar(15)` | IN   |




#### `SCISP_DatosMatriculasDescarga`

> Obtiene datos detallados de una matrícula para descarga.


| Parámetro    | Tipo           | Modo |
| ------------ | -------------- | ---- |
| `@Matricula` | `nvarchar(10)` | IN   |


---



### 7.7 Módulo de Generación



#### `Obtener_CertificadosPendientesGenerar`

> Lista certificados pendientes de generación por servicio de negocio.


| Parámetro               | Tipo  | Modo |
| ----------------------- | ----- | ---- |
| `@idServicioNegVirtual` | `int` | IN   |




#### `SCISP_ObtenerCertificadosPorGenerar`

> Versión SCISP — Lista certificados por generar.


| Parámetro                   | Tipo  | Modo |
| --------------------------- | ----- | ---- |
| `@ServicioNegocioVirtualId` | `int` | IN   |


---



### 7.8 Módulo de Afiliados



#### `SCISP_ValidarIngresoAfiliados`

> Valida credenciales de ingreso para el módulo de depósitos financieros (OAuth).


| Parámetro             | Tipo           | Modo | Descripción         |
| --------------------- | -------------- | ---- | ------------------- |
| `@NumeroDocumento`    | `varchar(100)` | IN   | Número de documento |
| `@TipoIdentificacion` | `int`          | IN   | Tipo de documento   |
| `@ClaveEncriptada`    | `varchar(256)` | IN   | Clave encriptada    |




#### `SCISP_ObtenerDatosAfiliado`

> Obtiene datos del afiliado por ID de solicitud.


| Parámetro      | Tipo  | Modo |
| -------------- | ----- | ---- |
| `@SolicitudId` | `int` | IN   |




#### `SCISP_GuardaLogAfiliados`

> Registra un log de operación de afiliados.


| Parámetro      | Tipo           | Modo |
| -------------- | -------------- | ---- |
| `@SolicitudId` | `int`          | IN   |
| `@Orden`       | `nvarchar(20)` | IN   |




#### `SCISP_InsertaLogDescargaDBAfiliados`

> Registra una descarga del módulo de afiliados.


| Parámetro          | Tipo          | Modo |
| ------------------ | ------------- | ---- |
| `@AccionRealizada` | `varchar(50)` | IN   |
| `@Usuario`         | `varchar(50)` | IN   |
| `@numeroMatricula` | `varchar(50)` | IN   |




#### `SCISP_InsertaErrorAfiliadosPup`

> Registra errores de integración con PUP para afiliados.


| Parámetro      | Tipo            | Modo |
| -------------- | --------------- | ---- |
| `@SolicitudId` | `int`           | IN   |
| `@Error`       | `nvarchar(MAX)` | IN   |




#### `SCISP_ReporteSolicitudAfiliados`

> Genera reporte de solicitudes de afiliados.


| Parámetro      | Tipo           | Modo |
| -------------- | -------------- | ---- |
| `@SolicitudId` | `nvarchar(20)` | IN   |


---



### 7.9 Módulo de Depósitos y Matrículas Vinculadas



#### `SCISP_ObtenerMatriculasVinculadas`

> Obtiene matrículas vinculadas a un documento (para módulo de depósitos).


| Parámetro        | Tipo          | Modo | Descripción                     |
| ---------------- | ------------- | ---- | ------------------------------- |
| `@TipoDocumento` | `char(1)`     | IN   | Tipo de documento (clase)       |
| `@Documento`     | `varchar(15)` | IN   | Número de documento             |
| `@Todas`         | `bit`         | IN   | Si retorna todas o solo activas |




#### `Sirep_Obtener_EmpresasPorAfiliado`

> Consulta empresas vinculadas a un afiliado en SIREP.


| Parámetro  | Tipo          | Modo |
| ---------- | ------------- | ---- |
| `@IdClase` | `varchar(1)`  | IN   |
| `@NumId`   | `varchar(15)` | IN   |




#### `Sirep_Obtener_SaldosPorMatricula`

> Consulta saldos pendientes por matrícula.


| Parámetro       | Tipo         | Modo |
| --------------- | ------------ | ---- |
| `@NumMatricula` | `varchar(8)` | IN   |


---



### 7.10 Módulo de Cartas de Solicitud



#### `SCISP_AgregarCartaSolicitante`

> Crea el encabezado de la carta de solicitud (especiales y depósitos).


| Parámetro            | Tipo            | Modo |
| -------------------- | --------------- | ---- |
| `@TipoDocumento`     | `int`           | IN   |
| `@Descripcion`       | `nvarchar(128)` | IN   |
| `@Documento`         | `nvarchar(20)`  | IN   |
| `@Nombre`            | `nvarchar(512)` | IN   |
| `@NombreSociedad`    | `nvarchar(512)` | IN   |
| `@NumeroMatricula`   | `nvarchar(40)`  | IN   |
| `@Nit`               | `nvarchar(40)`  | IN   |
| `@Telefono`          | `nvarchar(40)`  | IN   |
| `@Direccion`         | `nvarchar(64)`  | IN   |
| `@Email`             | `nvarchar(64)`  | IN   |
| `@ReporteId`         | `int`           | IN   |
| `@TipoCertificadoId` | `int`           | IN   |
| `@Sede`              | `nvarchar(64)`  | IN   |




#### `SCISP_AgregarDetalleCartaSolicitante`

> Agrega una línea de detalle a la carta de solicitud.


| Parámetro                | Tipo           | Modo |
| ------------------------ | -------------- | ---- |
| `@InformacionCartaId`    | `int`          | IN   |
| `@TipoDocumento`         | `int`          | IN   |
| `@Documento`             | `varchar(20)`  | IN   |
| `@ClaseFinanciero`       | `varchar(100)` | IN   |
| `@CantidadFolios`        | `int`          | IN   |
| `@FechaEstadoFinanciero` | `datetime`     | IN   |
| `@Observacion`           | `varchar(MAX)` | IN   |
| `@FechaInicio`           | `datetime`     | IN   |
| `@FechaFin`              | `datetime`     | IN   |
| `@NumeroRegistro`        | `nvarchar(16)` | IN   |




#### `SCISP_ActualizaCarta`

> Actualiza la carta vinculando el número de orden post-liquidación.


| Parámetro             | Tipo           | Modo |
| --------------------- | -------------- | ---- |
| `@TipoDocumento`      | `int`          | IN   |
| `@Documento`          | `nvarchar(64)` | IN   |
| `@SolicitudId`        | `int`          | IN   |
| `@Orden`              | `nvarchar(16)` | IN   |
| `@InformacionCartaId` | `int`          | IN   |




#### `SCISP_ObtenerCartaSolicitante`

> Consulta los datos de una carta de solicitud.


| Parámetro             | Tipo  | Modo |
| --------------------- | ----- | ---- |
| `@InformacionCartaId` | `int` | IN   |




#### `SCISP_ReporteCartaCertificados`

> Genera reporte de carta para certificados especiales.


| Parámetro        | Tipo          | Modo |
| ---------------- | ------------- | ---- |
| `@Documento`     | `varchar(20)` | IN   |
| `@TipoDocumento` | `int`         | IN   |




#### `SCISP_ReporteCartaDepositos`

> Genera reporte de carta para depósitos financieros.


| Parámetro        | Tipo          | Modo |
| ---------------- | ------------- | ---- |
| `@Documento`     | `varchar(20)` | IN   |
| `@TipoDocumento` | `int`         | IN   |


---



### 7.11 Módulo de Kardex Mercantil



#### `SCISP_ObtenerKardex`

> Consulta registros del Kardex mercantil para certificados textuales.


| Parámetro         | Tipo            | Modo | Descripción                   |
| ----------------- | --------------- | ---- | ----------------------------- |
| `@NumMatricula`   | `varchar(8)`    | IN   | Matrícula mercantil           |
| `@FechaInicio`    | `date`          | IN   | Fecha inicio del rango        |
| `@FechaFin`       | `date`          | IN   | Fecha fin del rango           |
| `@NumeroRegistro` | `varchar(10)`   | IN   | Número de registro específico |
| `@PalabraClave`   | `nvarchar(100)` | IN   | Palabra clave de búsqueda     |




#### `buscarLibrosComerciante`

> Busca libros del comerciante por matrícula.


| Parámetro       | Tipo         | Modo |
| --------------- | ------------ | ---- |
| `@matricula_in` | `varchar(8)` | IN   |


---



### 7.12 Módulo de Catálogos y Consultas Genéricas



#### `Obtener_ListadoGenericoCombo`

> Consulta genérica de catálogos por tipo para combos de la interfaz.


| Parámetro      | Tipo  | Modo |
| -------------- | ----- | ---- |
| `@TipoListado` | `int` | IN   |




#### `get_ta_clase_identificacion`

> Consulta tipos de identificación.


| Parámetro      | Tipo         | Modo |
| -------------- | ------------ | ---- |
| `@id_clase_id` | `varchar(4)` | IN   |




#### `Obtener_Departamentos` / `Obtener_TodosMunicipios` / `Obtener_Municipios`

> Consultan catálogos geográficos.



#### `ConsultaPaises` / `SP_ConsultarPaises`

> Consultan catálogo de países.



#### `SCISP_ObtenerSede`

> Consulta sedes de la CCB (sin parámetros).



#### `SCISP_ObtenerValorCertificadoPorServicioId`

> Consulta el valor de un certificado por su ID de servicio en TiendaWS.


| Parámetro      | Tipo          | Modo |
| -------------- | ------------- | ---- |
| `@Id_Servicio` | `varchar(20)` | IN   |




#### `Obtener_Ta_Grafo_byIdNegocio`

> Obtiene la definición del grafo de workflow para un servicio de negocio.


| Parámetro         | Tipo  | Modo |
| ----------------- | ----- | ---- |
| `@id_ServNegocio` | `int` | IN   |




#### `Obtener_ListadoGrupoNiif`

> Lista grupos NIIF para estados financieros (sin parámetros).

---



### 7.13 Módulo de Reportes y Administración



#### `Obtener_ListSolicitudesRealizadas`

> Lista solicitudes realizadas en un rango de fechas.


| Parámetro               | Tipo          | Modo |
| ----------------------- | ------------- | ---- |
| `@fechaInicial`         | `datetime`    | IN   |
| `@fechaFinal`           | `datetime`    | IN   |
| `@idServicioNegVirtual` | `int`         | IN   |
| `@numMatricula`         | `varchar(10)` | IN   |




#### `Obtener_ListSolicitudesEstampadas`

> Lista solicitudes con certificado estampado/generado.


| Parámetro               | Tipo          | Modo |
| ----------------------- | ------------- | ---- |
| `@fechaInicial`         | `datetime`    | IN   |
| `@fechaFinal`           | `datetime`    | IN   |
| `@idServicioNegVirtual` | `int`         | IN   |
| `@numMatricula`         | `varchar(10)` | IN   |




#### `Obtener_ListSolicitudesVerificadas`

> Lista solicitudes verificadas en un rango de fechas.


| Parámetro               | Tipo          | Modo |
| ----------------------- | ------------- | ---- |
| `@fechaInicial`         | `datetime`    | IN   |
| `@fechaFinal`           | `datetime`    | IN   |
| `@idServicioNegVirtual` | `int`         | IN   |
| `@numMatricula`         | `varchar(10)` | IN   |




#### `Obtener_ListadoSolicitudesVencidas`

> Lista solicitudes vencidas sin pago.


| Parámetro               | Tipo       | Modo |
| ----------------------- | ---------- | ---- |
| `@fechaIniial`          | `datetime` | IN   |
| `@fechaFinal`           | `datetime` | IN   |
| `@idServicioNegVirtual` | `int`      | IN   |




#### `Obtener_ListCantSolicPorEstado`

> Cuenta solicitudes agrupadas por estado.


| Parámetro      | Tipo       | Modo |
| -------------- | ---------- | ---- |
| `@fechaIniial` | `datetime` | IN   |
| `@fechaFinal`  | `datetime` | IN   |




#### `Obtener_ReporteMercadeo`

> Genera reporte de mercadeo.


| Parámetro        | Tipo          | Modo |
| ---------------- | ------------- | ---- |
| `@tipo_busqueda` | `varchar(20)` | IN   |
| `@fecha_Inicio`  | `date`        | IN   |
| `@fecha_Fin`     | `date`        | IN   |




#### `Obtener_ListadoConsumo`

> Lista consumo de certificados por matrícula.


| Parámetro        | Tipo          | Modo |
| ---------------- | ------------- | ---- |
| `@FECHA_INICIAL` | `datetime`    | IN   |
| `@FECHA_FINAL`   | `datetime`    | IN   |
| `@MATRICULA`     | `varchar(20)` | IN   |


---



### 7.14 Módulo de Trazabilidad Masiva



#### `Insertar_TrazasSolicitudesFinalizadas`

> Proceso batch que inserta trazabilidad de finalización masiva.


| Parámetro | Tipo       | Modo |
| --------- | ---------- | ---- |
| `@fecIni` | `datetime` | IN   |
| `@fecFin` | `datetime` | IN   |




#### `Insertar_TrazasSolicitudesVencidas`

> Proceso batch que marca solicitudes vencidas.


| Parámetro      | Tipo       | Modo |
| -------------- | ---------- | ---- |
| `@fechaIniial` | `datetime` | IN   |
| `@fechaFinal`  | `datetime` | IN   |




#### `Validar_AnioSolicitud`

> Valida si la solicitud pertenece al año en curso (para vencimiento).


| Parámetro       | Tipo  | Modo |
| --------------- | ----- | ---- |
| `@id_solicitud` | `int` | IN   |


---



### 7.15 Módulo de Errores y Logging



#### `Insertar_sv_ErrorAplicacion`

> Registra un error de aplicación.


| Parámetro                  | Tipo            | Modo |
| -------------------------- | --------------- | ---- |
| `@Mensaje`                 | `text`          | IN   |
| `@Excepcion`               | `text`          | IN   |
| `@Aplicacion`              | `nvarchar(100)` | IN   |
| `@id_servicio_neg_virtual` | `int`           | IN   |




#### `SCISP_InsertaErrorAplicacion`

> Versión SCISP — Registra error con API, método y parámetros.


| Parámetro     | Tipo            | Modo |
| ------------- | --------------- | ---- |
| `@Error`      | `nvarchar(MAX)` | IN   |
| `@Api`        | `nvarchar(128)` | IN   |
| `@Metodo`     | `nvarchar(64)`  | IN   |
| `@Parametros` | `nvarchar(MAX)` | IN   |




#### `Insertar_Usuario_Log`

> Registra acciones de usuarios del backoffice.


| Parámetro               | Tipo           | Modo |
| ----------------------- | -------------- | ---- |
| `@Usuario`              | `varchar(50)`  | IN   |
| `@Opcion`               | `varchar(200)` | IN   |
| `@Accion`               | `varchar(100)` | IN   |
| `@Dato`                 | `varchar(50)`  | IN   |
| `@TipoDato`             | `varchar(50)`  | IN   |
| `@Fecha`                | `datetime`     | IN   |
| `@IdServicioNegVirtual` | `int`          | IN   |




#### `RegistrarFalloNotificacionSipref`

> Registra fallos en la notificación a SIPREF.


| Parámetro               | Tipo             | Modo |
| ----------------------- | ---------------- | ---- |
| `@IdServicioNegocio`    | `varchar(4)`     | IN   |
| `@IdTipoSolicitud`      | `varchar(4)`     | IN   |
| `@NumMatricula`         | `varchar(8)`     | IN   |
| `@IdTipoIdentificacion` | `char(1)`        | IN   |
| `@NumeroIdentificacion` | `varchar(15)`    | IN   |
| `@IdSucursal`           | `varchar(2)`     | IN   |
| `@TipoReferencia`       | `varchar(4)`     | IN   |
| `@NumeroReferencia`     | `varchar(29)`    | IN   |
| `@CorreoElectronico`    | `nvarchar(1800)` | IN   |
| `@Celular`              | `nvarchar(1400)` | IN   |
| `@Enviado`              | `bit`            | IN   |
| `@FechaIntento`         | `datetime`       | IN   |
| `@FechaEnvio`           | `datetime`       | IN   |


---



### 7.16 Módulo de Validaciones



#### `Validar_Identificacion`

> Valida tipo y número de documento.


| Parámetro          | Tipo           | Modo |
| ------------------ | -------------- | ---- |
| `@tipoDocumento`   | `nvarchar(1)`  | IN   |
| `@numeroDocumento` | `nvarchar(15)` | IN   |




#### `Validar_Clasificaciones`

> Valida una lista de clasificaciones.


| Parámetro            | Tipo           | Modo |
| -------------------- | -------------- | ---- |
| `@ClasificacionList` | `varchar(MAX)` | IN   |




#### `Sirep_VerificarNit`

> Verifica la validez de un NIT.


| Parámetro | Tipo          | Modo |
| --------- | ------------- | ---- |
| `@nit_in` | `varchar(15)` | IN   |




#### `Sirep_Sp_VerificaVinculosClaveIdentificacion`

> Verifica vínculos por clave e identificación.


| Parámetro  | Tipo          | Modo |
| ---------- | ------------- | ---- |
| `@IdClase` | `char(1)`     | IN   |
| `@NumId`   | `varchar(15)` | IN   |




#### `SCISP_Obtener_DatosSolicitante`

> Obtiene datos del solicitante por orden y solicitud.


| Parámetro      | Tipo  | Modo |
| -------------- | ----- | ---- |
| `@Orden`       | `int` | IN   |
| `@SolicitudId` | `int` | IN   |


---



## 8. Funciones


| Función                        | Tipo                      | Descripción                                       | Parámetros                                               |
| ------------------------------ | ------------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| `fn_ObtenerParametros`         | Escalar → `varchar(4000)` | Obtiene parámetros de servicio por tipo           | `@id_servicio_neg_virtual INT`, `@id_tipo_parametro INT` |
| `get_val_nit`                  | Escalar → `varchar(15)`   | Formatea/valida un NIT                            | `@pi_nit NVARCHAR(15)`                                   |
| `get_valida_identificacion`    | Escalar → `varchar(128)`  | Valida combinación tipo/número de identificación  | `@pi_clase NVARCHAR(1)`, `@pi_numid NVARCHAR(15)`        |
| `ufn_ObtenerEstadoSolicitudes` | Tabla inline              | Retorna estado de solicitudes por rango de fechas | `@fecIni DATETIME`, `@fecFin DATETIME`                   |
| `fn_SplitString`               | Tabla                     | Divide una cadena por separador                   | `@Texto NVARCHAR(MAX)`, `@Separador CHAR(1)`             |


---



## 9. Datos de catálogo relevantes



### 9.1 Estados de cotización (`ta_estado_cotizacion`)


| ID  | Descripción       |
| --- | ----------------- |
| 0   | SinProcesar       |
| 4   | Proceso           |
| 5   | Pendiente De Pago |
| 6   | Aprobada          |
| 8   | Rechazada         |




### 9.2 Estados de generación (`ta_estado_generacion`)


| ID  | Descripción |
| --- | ----------- |
| 0   | Creado      |
| 1   | Generado    |
| 2   | Fallo       |
| 3   | Parcial     |




### 9.3 Tipos de identificación (`ta_clase_identificacion`)


| ID  | Descripción           |
| --- | --------------------- |
| 1   | Cédula de Ciudadanía  |
| 2   | NIT                   |
| 3   | Cédula de Extranjería |
| 4   | Tarjeta de Identidad  |
| 5   | Pasaporte             |
| 6   | Personería Jurídica   |
| 7   | Otro                  |




### 9.4 Servicios de negocio virtual (según PRD)


| ID  | Descripción                                            | Servicio Liquidar PUP |
| --- | ------------------------------------------------------ | --------------------- |
| 18  | Certificados Electrónicos Estándar                     | 36                    |
| 19  | Certificados Especiales (textual, negativo, histórico) | 34                    |
| 20  | Depósitos Financieros                                  | 35                    |
| —   | Afiliados (beneficio gratuito)                         | 4                     |




### 9.5 Tipos de certificados


| ID  | Descripción                                                                      |
| --- | -------------------------------------------------------------------------------- |
| 1   | MATRICULA MERCANTIL                                                              |
| 2   | EXISTENCIA Y REPRESENTACION LEGAL O INSCRIPCION DE DOCUMENTOS REGISTRO MERCANTIL |
| 3   | SOCIEDAD DE HECHO                                                                |
| 4   | LIBROS DE COMERCIO                                                               |
| 6   | EXISTENCIA Y REPRESENTACION LEGAL DE LA ENTIDAD SIN ANIMO DE LUCRO               |
| 7   | INSCRIPCION, CLASIFICACION Y CALIFICACION (PROPONENTES)                          |
| 8   | INFORMACION COMERCIAL                                                            |
| 9   | PROPONENTES NO RENOVADO                                                          |
| 10  | PROPONENTES CANCELADOS                                                           |
| 11  | ESTABLECIMIENTO COMERCIAL                                                        |
| 12  | MATRICULA MERCANTIL CANCELADA                                                    |
| 13  | NEGATIVO DE LIBROS DE COMERCIO                                                   |
| 14  | NEGATIVOS REGISTRO MERCANTIL - ESAL                                              |
| 16  | BUSQUEDA DE NOMBRES                                                              |
| 17  | COPIA TEXTUAL                                                                    |
| 18  | REPRODUCCION INSCRIPCION                                                         |
| 19  | NEGATIVO DE AGENCIA COMERCIAL                                                    |
| 20  | NEGATIVO DE PRENDA                                                               |
| 21  | NEGATIVO DE QUIEBRA                                                              |
| 22  | NEGATIVO DE EMBARGO                                                              |
| 23  | NEGATIVO DE QUIEBRA Y EMBARGO                                                    |
| 24  | NEGATIVO DE QUIEBRA EMBARGO E INHABILIDAD                                        |
| 25  | NEGATIVO DE QUIEBRA E INHABILIDAD O INCAPACIDAD.                                 |
| 26  | NEGATIVO DE EMBARGO E INHABILIDAD O INCAPACIDAD                                  |
| 27  | NEGATIVO DE INHABILIDAD O INCAPACIDAD                                            |
| 28  | NEGATIVO DE RESERVA DE DOMINIO                                                   |
| 29  | HISTORICO DE NOMBRAMIENTOS DE REPRESENTANTE LEGAL                                |
| 30  | HISTORICO DE NOMBRAMIENTO DE REVISOR FISCAL                                      |
| 31  | HISTORICO DE NOMBRAMIENTO DE JUNTA DIRECTIVA                                     |
| 32  | HISTORICO DE CAPITAL                                                             |
| 35  | NEGATIVO DE PERSONA NATURAL                                                      |


---



## Resumen de conteo


| Tipo de objeto                    | Cantidad | Notas                                  |
| --------------------------------- | -------- | -------------------------------------- |
| Tablas totales                    | 90       | Incluye históricas y temporales        |
| Procedimientos almacenados        | ~120     | Incluye versiones _tmp y de diagrama   |
| **SPs funcionales (principales)** | **~75**  | Excluyendo _tmp, _v0, diagramas        |
| Funciones                         | 5        | 3 escalares + 1 tabla inline + 1 tabla |
| Tablas transaccionales (sv_)      | ~18      | Núcleo del sistema                     |
| Tablas de catálogo (ta_)          | ~45      | Configuración y referencia             |
| Tablas históricas (*_hist)        | 8        | Archivado de datos                     |


