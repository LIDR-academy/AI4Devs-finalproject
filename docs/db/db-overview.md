# Fase 5: Implementación Detallada de Base de Datos (DDD)

Este documento detalla los esquemas físicos de base de datos propuestos para los componentes ATS MVP y TalentIA Core AI, derivados del modelo lógico DDD presentado en la Sección 11 del PRD y enriquecido con los detalles de los tickets técnicos.

**Notas Generales:**

* **Tecnología:** Se asume PostgreSQL por su robustez y soporte para tipos como UUID, JSONB y Arrays.
* **UUIDs:** Se recomienda usar UUIDs como claves primarias para facilitar la distribución y evitar colisiones si los sistemas evolucionan.
* **Timestamps:** Se utiliza `TIMESTAMP WITH TIME ZONE` para todas las fechas para evitar ambigüedades.
* **Índices:** Los índices propuestos (IDX, GIN) son una base inicial. La estrategia final debe validarse con análisis de consultas reales (`EXPLAIN ANALYZE`). Se recomiendan índices GIN para campos JSONB y Arrays en PostgreSQL para consultas eficientes dentro de ellos.
* **Claves Foráneas (FKs):** Se especifican las relaciones. Es importante definir las políticas `ON DELETE` y `ON UPDATE` (ej. `RESTRICT`, `SET NULL`, `CASCADE`) según las reglas de negocio. Por defecto, suele ser `RESTRICT`.
* **Versionado:** Se debe utilizar una herramienta de migración de bases de datos (ej. Alembic, Flyway, TypeORM migrations) para gestionar y versionar la evolución de estos esquemas.

---

## 1. Base de Datos ATS MVP

Base de datos relacional (PostgreSQL) para gestionar el flujo principal de reclutamiento.

### 1.1. Tablas Principales

**Tabla: `usuarios`**
* Almacena la información de los usuarios internos del sistema (Reclutadores, Managers, Admins).
* Corresponde a la entidad `Usuario` (TK-006).

| Columna             | Tipo                         | Constraints                                      | Índice | Notas                                                |
| :------------------ | :--------------------------- | :----------------------------------------------- | :----- | :--------------------------------------------------- |
| `id`                | UUID                         | PRIMARY KEY, DEFAULT gen_random_uuid()           | PK     | Identificador único                                  |
| `nombre_completo`   | VARCHAR(255)                 | NOT NULL                                         |        | Nombre del usuario                                   |
| `email`             | VARCHAR(255)                 | NOT NULL, UNIQUE                                 | UNIQUE | Email (usado para login)                             |
| `password_hash`     | VARCHAR(255)                 | NOT NULL                                         |        | Hash seguro de la contraseña (ej. bcrypt)           |
| `rol`               | VARCHAR(50)                  | NOT NULL, CHECK (rol IN ('RECLUTADOR','MANAGER','ADMIN')) | IDX    | Rol del usuario                                    |
| `activo`            | BOOLEAN                      | NOT NULL, DEFAULT true                           | IDX    | Indica si el usuario puede iniciar sesión            |
| `fecha_creacion`    | TIMESTAMP WITH TIME ZONE     | NOT NULL, DEFAULT CURRENT_TIMESTAMP              |        |                                                      |
| `fecha_actualizacion`| TIMESTAMP WITH TIME ZONE     | NOT NULL, DEFAULT CURRENT_TIMESTAMP              |        |                                                      |

**Tabla: `etapas_pipeline`**
* Define las etapas configurables del pipeline de selección.
* Corresponde a la entidad `EtapaPipeline` (TK-011).

| Columna           | Tipo                      | Constraints                                 | Índice | Notas                                                  |
| :---------------- | :------------------------ | :------------------------------------------ | :----- | :----------------------------------------------------- |
| `id`              | UUID                      | PRIMARY KEY, DEFAULT gen_random_uuid()      | PK     | Identificador único                                  |
| `nombre`          | VARCHAR(100)              | NOT NULL                                    |        | Nombre visible de la etapa (ej. "Entrevista RH")      |
| `orden`           | INTEGER                   | NOT NULL                                    | IDX    | Define la secuencia visual en el pipeline             |
| `seleccionable_ia`| BOOLEAN                   | NOT NULL, DEFAULT false                     | IDX    | Flag para RF-04B/TK-011                                |
| `tipo_etapa`      | VARCHAR(50)               | NULLABLE, CHECK (tipo_etapa IN ('INICIO', 'INTERMEDIO', 'FINAL', 'RECHAZO')) |        | Opcional: Para lógica adicional si se necesita       |
| `fecha_creacion`  | TIMESTAMP WITH TIME ZONE  | NOT NULL, DEFAULT CURRENT_TIMESTAMP         |        |                                                        |
| `fecha_actualizacion`| TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP         |        |                                                        |

**Tabla: `vacantes`**
* Representa las ofertas de empleo.
* Corresponde al Aggregate Root `Vacante` (TK-016).

| Columna                       | Tipo                         | Constraints                                   | Índice | Notas                                                      |
| :---------------------------- | :--------------------------- | :------------------------------------------ | :----- | :--------------------------------------------------------- |
| `id`                          | UUID                         | PRIMARY KEY, DEFAULT gen_random_uuid()        | PK     | Identificador único                                      |
| `titulo`                      | VARCHAR(255)                 | NOT NULL                                      |        | Título del puesto                                        |
| `departamento`                | VARCHAR(100)                 | NULLABLE                                      |        |                                                            |
| `ubicacion_texto`             | VARCHAR(255)                 | NOT NULL                                      |        | Descripción textual de la ubicación                      |
| `requisitos_clave`            | TEXT                         | NULLABLE                                      |        | Resumen inicial de requisitos                            |
| `descripcion_html`            | TEXT                         | NULLABLE                                      |        | Descripción completa (podría venir de IA o manual)         |
| `estado`                      | VARCHAR(50)                  | NOT NULL, DEFAULT 'BORRADOR', CHECK (estado IN ('BORRADOR', 'PUBLICADA', 'CERRADA', 'ARCHIVADA')) | IDX    | Estado actual de la vacante                              |
| `tags`                        | TEXT[]                       | NULLABLE                                      | GIN?   | Array de tags/palabras clave                             |
| `fecha_creacion`              | TIMESTAMP WITH TIME ZONE     | NOT NULL, DEFAULT CURRENT_TIMESTAMP           |        |                                                            |
| `fecha_actualizacion`         | TIMESTAMP WITH TIME ZONE     | NOT NULL, DEFAULT CURRENT_TIMESTAMP           |        |                                                            |
| `fecha_publicacion`           | TIMESTAMP WITH TIME ZONE     | NULLABLE                                      |        | Se establece al pasar a 'PUBLICADA' (TK-027)               |
| `fecha_cierre`                | TIMESTAMP WITH TIME ZONE     | NULLABLE                                      |        | Se establece al pasar a 'CERRADA' (TK-027)                |
| `recruiter_id`                | UUID                         | NULLABLE, FK (usuarios.id) ON DELETE SET NULL | FK,IDX | Usuario Reclutador asignado                              |
| `hiring_manager_id`           | UUID                         | NULLABLE, FK (usuarios.id) ON DELETE SET NULL | FK,IDX | Usuario Hiring Manager asignado                          |
| `referencia_jd_generada_id`   | UUID                         | NULLABLE                                      | IDX    | ID de `DescripcionPuestoGenerada` en Core AI             |
| `enlace_portal`               | VARCHAR(2048)                | NULLABLE                                      |        | URL pública (si aplica, puede ser generada)              |

**Tabla: `candidatos`**
* Almacena la información básica identificativa de las personas que aplican.
* Corresponde a la entidad `Candidato` (parte del BC `Perfil de Candidato` en ATS).

| Columna               | Tipo                         | Constraints                                | Índice | Notas                                                |
| :-------------------- | :--------------------------- | :----------------------------------------- | :----- | :--------------------------------------------------- |
| `id`                  | UUID                         | PRIMARY KEY, DEFAULT gen_random_uuid()     | PK     | Identificador único                                  |
| `nombre_completo`     | VARCHAR(255)                 | NOT NULL                                   |        |                                                      |
| `email`               | VARCHAR(255)                 | NOT NULL, UNIQUE                           | UNIQUE | Identificador principal                              |
| `telefono`            | VARCHAR(50)                  | NULLABLE                                   |        |                                                      |
| `tags`                | TEXT[]                       | NULLABLE                                   | GIN?   | Tags manuales asignados al candidato               |
| `consentimiento_gdpr` | BOOLEAN                      | NOT NULL, DEFAULT false                    |        | Indica si aceptó política                          |
| `fecha_creacion`      | TIMESTAMP WITH TIME ZONE     | NOT NULL, DEFAULT CURRENT_TIMESTAMP        |        |                                                      |
| `fecha_actualizacion` | TIMESTAMP WITH TIME ZONE     | NOT NULL, DEFAULT CURRENT_TIMESTAMP        |        |                                                      |

**Tabla: `archivos_candidato`**
* Referencia a los archivos (principalmente CVs) subidos por los candidatos.
* Parte del Aggregate `Candidato` o `Candidatura` conceptualmente.

| Columna                   | Tipo                         | Constraints                                   | Índice | Notas                                                           |
| :------------------------ | :--------------------------- | :-------------------------------------------- | :----- | :-------------------------------------------------------------- |
| `id`                      | UUID                         | PRIMARY KEY, DEFAULT gen_random_uuid()        | PK     | Identificador único                                           |
| `candidato_id`            | UUID                         | NOT NULL, FK (candidatos.id) ON DELETE CASCADE | FK,IDX | A qué candidato pertenece (Borrar archivos si se borra candidato) |
| `nombre_archivo_original` | VARCHAR(255)                 | NOT NULL                                      |        | Nombre con el que se subió                                  |
| `tipo_archivo`            | VARCHAR(100)                 | NOT NULL                                      |        | MIME Type (ej. 'application/pdf')                         |
| `ruta_almacenamiento`     | VARCHAR(1024)                | NOT NULL                                      |        | Referencia al archivo en storage (S3 key, path local...)      |
| `fecha_subida`            | TIMESTAMP WITH TIME ZONE     | NOT NULL, DEFAULT CURRENT_TIMESTAMP           |        |                                                                 |

**Tabla: `candidaturas`**
* Representa la postulación de un `Candidato` a una `Vacante`.
* Corresponde al Aggregate Root `Candidatura`.

| Columna                       | Tipo                         | Constraints                                            | Índice | Notas                                                                         |
| :---------------------------- | :--------------------------- | :----------------------------------------------------- | :----- | :---------------------------------------------------------------------------- |
| `id`                          | UUID                         | PRIMARY KEY, DEFAULT gen_random_uuid()                 | PK     | Identificador único                                                         |
| `candidato_id`                | UUID                         | NOT NULL, FK (candidatos.id) ON DELETE RESTRICT        | FK,IDX | Quién aplica (No borrar candidato si tiene candidaturas)                      |
| `vacante_id`                  | UUID                         | NOT NULL, FK (vacantes.id) ON DELETE RESTRICT          | FK,IDX | A qué vacante aplica (No borrar vacante si tiene candidaturas)                |
| `archivo_cv_id`               | UUID                         | NOT NULL, FK (archivos_candidato.id) ON DELETE RESTRICT | FK,IDX | Qué CV se usó (No borrar archivo si está asociado a candidatura)             |
| `fecha_aplicacion`            | TIMESTAMP WITH TIME ZONE     | NOT NULL, DEFAULT CURRENT_TIMESTAMP                    | IDX    | Cuándo aplicó                                                               |
| `fuente`                      | VARCHAR(100)                 | NULLABLE                                               |        | De dónde vino (ej. 'Portal Empleo', 'Referido')                           |
| `etapa_pipeline_actual_id`    | UUID                         | NOT NULL, FK (etapas_pipeline.id) ON DELETE RESTRICT   | FK,IDX | Etapa actual (No borrar etapa si está en uso)                               |
| `motivo_rechazo_id`           | UUID                         | NULLABLE, FK (motivos_rechazo.id) ON DELETE SET NULL    | FK,IDX | Razón de descarte (Permitir borrar motivo)                                  |
| `comentario_rechazo`          | TEXT                         | NULLABLE                                               |        | Texto libre sobre el rechazo                                                  |
| `fecha_ultimo_cambio_etapa`   | TIMESTAMP WITH TIME ZONE     | NOT NULL, DEFAULT CURRENT_TIMESTAMP                    | IDX    |                                                                               |
| `referencia_evaluacion_ia_id` | UUID                         | NULLABLE                                               | IDX    | ID de `EvaluacionCandidatoIA` en Core AI                                    |
| `puntuacion_ia_general`       | INTEGER                      | NULLABLE, CHECK (0 <= puntuacion_ia_general AND puntuacion_ia_general <= 100) | IDX    | Score IA (copia/cache)                                                      |
| `etapa_sugerida`              | VARCHAR(100)                 | NULLABLE                                               |        | Nombre/ID de etapa sugerida por IA (copia/cache)                            |
| `detected_skills`             | JSONB                        | NULLABLE                                               | GIN?   | Skills detectadas por IA (copia/cache, Array de Strings) - TK-140             |
| `resumen_ia`                  | TEXT                         | NULLABLE                                               |        | Resumen IA (copia/cache) - TK-108                                             |
| `tags`                        | TEXT[]                       | NULLABLE                                               | GIN?   | Tags manuales asignados a la candidatura                                    |
| `calificacion_estrellas`      | INTEGER                      | NULLABLE, CHECK (1 <= calificacion_estrellas AND calificacion_estrellas <= 5) |        | Calificación manual (Futuro, Anexo II)                                      |
|                               |                              | UNIQUE (`candidato_id`, `vacante_id`)                  | UNIQUE | Evita aplicar dos veces a la misma vacante                                  |

**Tabla: `historial_etapas`**
* Registra los cambios de etapa de una `Candidatura`.

| Columna         | Tipo                      | Constraints                                     | Índice | Notas                                         |
| :-------------- | :------------------------ | :---------------------------------------------- | :----- | :-------------------------------------------- |
| `id`            | UUID                      | PRIMARY KEY, DEFAULT gen_random_uuid()          | PK     | Identificador único                         |
| `candidatura_id`| UUID                      | NOT NULL, FK (candidaturas.id) ON DELETE CASCADE | FK,IDX | A qué candidatura afecta (Borrar historial si se borra candidatura) |
| `etapa_id`      | UUID                      | NOT NULL, FK (etapas_pipeline.id) ON DELETE RESTRICT | FK,IDX | A qué etapa se movió (No borrar etapa si está en historial) |
| `fecha_cambio`  | TIMESTAMP WITH TIME ZONE  | NOT NULL, DEFAULT CURRENT_TIMESTAMP             | IDX    | Cuándo ocurrió el cambio                      |
| `usuario_id`    | UUID                      | NULLABLE, FK (usuarios.id) ON DELETE SET NULL    | FK,IDX | Quién realizó el cambio (null si sistema)     |
| `comentario`    | TEXT                      | NULLABLE                                        |        | Nota sobre el cambio                        |

**Tabla: `notas`**
* Permite añadir comentarios manuales a una `Candidatura`.

| Columna          | Tipo                      | Constraints                                     | Índice | Notas                                     |
| :--------------- | :------------------------ | :---------------------------------------------- | :----- | :------------------------------------------ |
| `id`             | UUID                      | PRIMARY KEY, DEFAULT gen_random_uuid()          | PK     | Identificador único                       |
| `candidatura_id` | UUID                      | NOT NULL, FK (candidaturas.id) ON DELETE CASCADE | FK,IDX | Sobre qué candidatura (Borrar notas si se borra candidatura) |
| `usuario_id`     | UUID                      | NOT NULL, FK (usuarios.id) ON DELETE RESTRICT    | FK,IDX | Quién escribió la nota (No borrar usuario si tiene notas) |
| `contenido`      | TEXT                      | NOT NULL                                        |        | Texto de la nota                          |
| `fecha_creacion` | TIMESTAMP WITH TIME ZONE  | NOT NULL, DEFAULT CURRENT_TIMESTAMP             |        |                                             |

**Tabla: `motivos_rechazo`** (Catálogo)
* Define las razones estándar para descartar una candidatura.

| Columna     | Tipo                      | Constraints                            | Índice | Notas                                      |
| :---------- | :------------------------ | :------------------------------------- | :----- | :----------------------------------------- |
| `id`        | UUID                      | PRIMARY KEY, DEFAULT gen_random_uuid() | PK     | Identificador único                      |
| `nombre`    | VARCHAR(100)              | NOT NULL, UNIQUE                       | UNIQUE | Nombre corto del motivo (ej. 'No_ajuste') |
| `descripcion`| TEXT                      | NULLABLE                               |        | Explicación (opcional)                   |

**Tabla: `vacante_plantillas`** (Could Have - US-008)
* Almacena plantillas reutilizables para vacantes (TK-030).

| Columna           | Tipo                      | Constraints                            | Índice | Notas                                                        |
| :---------------- | :------------------------ | :------------------------------------- | :----- | :----------------------------------------------------------- |
| `id`              | UUID                      | PRIMARY KEY, DEFAULT gen_random_uuid() | PK     | Identificador único                                        |
| `nombre`          | VARCHAR(100)              | NOT NULL, UNIQUE                       | UNIQUE | Nombre de la plantilla                                     |
| `datos_vacante`   | JSONB                     | NOT NULL                               | GIN?   | JSON con campos relevantes de la vacante (titulo, desc, etc.) |
| `fecha_creacion`  | TIMESTAMP WITH TIME ZONE  | NOT NULL, DEFAULT CURRENT_TIMESTAMP    |        |                                                              |

**Tabla: `system_configurations`** (Could Have - US-032)
* Almacena configuraciones globales (TK-101).

| Columna           | Tipo                      | Constraints                            | Índice | Notas                                                        |
| :---------------- | :------------------------ | :------------------------------------- | :----- | :----------------------------------------------------------- |
| `key`             | VARCHAR(100)              | PRIMARY KEY                            | PK     | Nombre de la configuración (ej. 'ENABLE_AUTO_STAGE_MOVE') |
| `value`           | TEXT                      | NOT NULL                               |        | Valor (ej. 'true', 'false', número como string)            |
| `fecha_actualizacion`| TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT CURRENT_TIMESTAMP    |        |                                                              |

**Tabla: `notificaciones`** (Could Have - US-041)
* Almacena notificaciones internas para usuarios (TK-141).

| Columna           | Tipo                      | Constraints                                     | Índice | Notas                                                   |
| :---------------- | :------------------------ | :---------------------------------------------- | :----- | :------------------------------------------------------ |
| `id`              | UUID                      | PRIMARY KEY, DEFAULT gen_random_uuid()          | PK     | Identificador único                                   |
| `user_id`         | UUID                      | NOT NULL, FK (usuarios.id) ON DELETE CASCADE    | FK,IDX | Destinatario (Borrar notifs si se borra usuario)      |
| `mensaje`         | TEXT                      | NOT NULL                                        |        | Texto de la notificación                              |
| `link_url`        | VARCHAR(2048)             | NULLABLE                                        |        | Enlace a la entidad relevante (candidatura, etc.)      |
| `leida`           | BOOLEAN                   | NOT NULL, DEFAULT false                         | IDX    | Indica si el usuario la ha leído                      |
| `fecha_creacion`  | TIMESTAMP WITH TIME ZONE  | NOT NULL, DEFAULT CURRENT_TIMESTAMP             | IDX    |                                                         |

### 1.2. Diagrama ERD (Mermaid) - ATS MVP

```mermaid
erDiagram
    USUARIOS {
        UUID id PK
        VARCHAR(255) nombre_completo NOT_NULL
        VARCHAR(255) email UNIQUE_NOT_NULL
        VARCHAR(255) password_hash NOT_NULL
        VARCHAR(50) rol CHECK_NOT_NULL
        BOOLEAN activo NOT_NULL_DEFAULT_TRUE
        TIMESTAMPZ fecha_creacion NOT_NULL
        TIMESTAMPZ fecha_actualizacion NOT_NULL
    }

    ETAPAS_PIPELINE {
        UUID id PK
        VARCHAR(100) nombre NOT_NULL
        INTEGER orden NOT_NULL
        BOOLEAN seleccionable_ia NOT_NULL_DEFAULT_FALSE
        VARCHAR(50) tipo_etapa NULLABLE
        TIMESTAMPZ fecha_creacion NOT_NULL
        TIMESTAMPZ fecha_actualizacion NOT_NULL
    }

    VACANTES {
        UUID id PK
        VARCHAR(255) titulo NOT_NULL
        VARCHAR(100) departamento NULLABLE
        VARCHAR(255) ubicacion_texto NOT_NULL
        TEXT requisitos_clave NULLABLE
        TEXT descripcion_html NULLABLE
        VARCHAR(50) estado CHECK_NOT_NULL_DEFAULT_BORRADOR
        TEXT_ARRAY tags NULLABLE
        TIMESTAMPZ fecha_creacion NOT_NULL
        TIMESTAMPZ fecha_actualizacion NOT_NULL
        TIMESTAMPZ fecha_publicacion NULLABLE
        TIMESTAMPZ fecha_cierre NULLABLE
        UUID recruiter_id FK_NULLABLE
        UUID hiring_manager_id FK_NULLABLE
        UUID referencia_jd_generada_id NULLABLE
        VARCHAR(2048) enlace_portal NULLABLE
    }

    CANDIDATOS {
        UUID id PK
        VARCHAR(255) nombre_completo NOT_NULL
        VARCHAR(255) email UNIQUE_NOT_NULL
        VARCHAR(50) telefono NULLABLE
        TEXT_ARRAY tags NULLABLE
        BOOLEAN consentimiento_gdpr NOT_NULL_DEFAULT_FALSE
        TIMESTAMPZ fecha_creacion NOT_NULL
        TIMESTAMPZ fecha_actualizacion NOT_NULL
    }

    ARCHIVOS_CANDIDATO {
        UUID id PK
        UUID candidato_id FK_NOT_NULL
        VARCHAR(255) nombre_archivo_original NOT_NULL
        VARCHAR(100) tipo_archivo NOT_NULL
        VARCHAR(1024) ruta_almacenamiento NOT_NULL
        TIMESTAMPZ fecha_subida NOT_NULL
    }

    CANDIDATURAS {
        UUID id PK
        UUID candidato_id FK_NOT_NULL
        UUID vacante_id FK_NOT_NULL
        UUID archivo_cv_id FK_NOT_NULL
        TIMESTAMPZ fecha_aplicacion NOT_NULL
        VARCHAR(100) fuente NULLABLE
        UUID etapa_pipeline_actual_id FK_NOT_NULL
        UUID motivo_rechazo_id FK_NULLABLE
        TEXT comentario_rechazo NULLABLE
        TIMESTAMPZ fecha_ultimo_cambio_etapa NOT_NULL
        UUID referencia_evaluacion_ia_id NULLABLE
        INTEGER puntuacion_ia_general NULLABLE
        VARCHAR(100) etapa_sugerida NULLABLE
        JSONB detected_skills NULLABLE
        TEXT resumen_ia NULLABLE
        TEXT_ARRAY tags NULLABLE
        INTEGER calificacion_estrellas NULLABLE
        "UNIQUE (candidato_id, vacante_id)"
    }

    HISTORIAL_ETAPAS {
        UUID id PK
        UUID candidatura_id FK_NOT_NULL
        UUID etapa_id FK_NOT_NULL
        TIMESTAMPZ fecha_cambio NOT_NULL
        UUID usuario_id FK_NULLABLE
        TEXT comentario NULLABLE
    }

    NOTAS {
        UUID id PK
        UUID candidatura_id FK_NOT_NULL
        UUID usuario_id FK_NOT_NULL
        TEXT contenido NOT_NULL
        TIMESTAMPZ fecha_creacion NOT_NULL
    }

    MOTIVOS_RECHAZO {
        UUID id PK
        VARCHAR(100) nombre UNIQUE_NOT_NULL
        TEXT descripcion NULLABLE
    }

    VACANTE_PLANTILLAS {
        UUID id PK
        VARCHAR(100) nombre UNIQUE_NOT_NULL
        JSONB datos_vacante NOT_NULL
        TIMESTAMPZ fecha_creacion NOT_NULL
    }

    SYSTEM_CONFIGURATIONS {
        VARCHAR(100) key PK
        TEXT value NOT_NULL
        TIMESTAMPZ fecha_actualizacion NOT_NULL
    }

    NOTIFICACIONES {
        UUID id PK
        UUID user_id FK_NOT_NULL
        TEXT mensaje NOT_NULL
        VARCHAR(2048) link_url NULLABLE
        BOOLEAN leida NOT_NULL_DEFAULT_FALSE
        TIMESTAMPZ fecha_creacion NOT_NULL
    }

    USUARIOS ||--o{ VACANTES : "es Recruiter"
    USUARIOS ||--o{ VACANTES : "es Manager"
    USUARIOS ||--o{ HISTORIAL_ETAPAS : "realiza cambio"
    USUARIOS ||--o{ NOTAS : "escribe"
    USUARIOS ||--o{ NOTIFICACIONES : "recibe"

    VACANTES ||--o{ CANDIDATURAS : "recibe"
    CANDIDATOS ||--o{ CANDIDATURAS : "realiza"
    CANDIDATOS ||--o{ ARCHIVOS_CANDIDATO : "posee"

    ARCHIVOS_CANDIDATO ||--|| CANDIDATURAS : "se usa en"

    ETAPAS_PIPELINE ||--o{ CANDIDATURAS : "esta en"
    MOTIVOS_RECHAZO ||--o{ CANDIDATURAS : "motiva rechazo"

    CANDIDATURAS ||--o{ HISTORIAL_ETAPAS : "tiene"
    ETAPAS_PIPELINE ||--o{ HISTORIAL_ETAPAS : "registra entrada a"

    CANDIDATURAS ||--o{ NOTAS : "tiene"
```


## 2. Base de Datos TalentIA Core AI

Se propone una base de datos que puede ser relacional (ej. PostgreSQL) o documental (ej. MongoDB), o una combinación, dado que algunas entidades se benefician de la flexibilidad de JSON/Documentos (Arquitectura Políglota - PRD Sec 12). Para simplificar la definición inicial, se mostrará una versión relacional con uso de `JSONB` donde aplique.

### 2.1. Tablas Principales

**Tabla: `descripciones_puesto_generadas`**
* Almacena las JDs generadas/configuradas por IA.
* Corresponde al Aggregate Root `DescripcionPuestoGenerada`.

| Columna               | Tipo                      | Constraints                            | Índice | Notas                                                    |
| :-------------------- | :------------------------ | :------------------------------------- | :----- | :------------------------------------------------------- |
| `id`                  | UUID                      | PRIMARY KEY, DEFAULT gen_random_uuid() | PK     | Identificador único                                    |
| `vacante_ats_id`      | UUID                      | NOT NULL                               | IDX    | ID de la `Vacante` en ATS MVP a la que pertenece         |
| `parametros_entrada`  | JSONB                     | NULLABLE                               | GIN?   | Datos usados para generar (ej. prompt)                   |
| `contenido_generado`  | TEXT                      | NULLABLE                               |        | Texto completo de la JD generada                       |
| `metadata_ia`         | JSONB                     | NULLABLE                               | GIN?   | Info del proceso (modelo LLM, tokens, etc.)            |
| `fecha_generacion`    | TIMESTAMP WITH TIME ZONE  | NOT NULL, DEFAULT CURRENT_TIMESTAMP    |        |                                                          |
| `evaluacion_corte`    | FLOAT                     | NULLABLE, CHECK (0 <= val <= 100)      |        | Umbral score IA (RF-04B/TK-060)                          |
| `etapa_pre_aceptacion`| VARCHAR(100)              | NULLABLE                               |        | ID/Nombre etapa si score >= corte (RF-04B/TK-060)        |
| `etapa_pre_rechazo`   | VARCHAR(100)              | NULLABLE                               |        | ID/Nombre etapa si score < corte (RF-04B/TK-060)         |

**Tabla: `candidatos_ia`**
* Almacena el perfil unificado del candidato en Core AI.
* Corresponde al Aggregate Root `CandidatoIA` (TK-062).

| Columna               | Tipo                      | Constraints                            | Índice | Notas                                                     |
| :-------------------- | :------------------------ | :------------------------------------- | :----- | :-------------------------------------------------------- |
| `id`                  | UUID                      | PRIMARY KEY, DEFAULT gen_random_uuid() | PK     | Identificador único                                     |
| `email`               | VARCHAR(255)              | NOT NULL, UNIQUE                       | UNIQUE | Clave natural para vincular/agregar                     |
| `nombre_completo`     | VARCHAR(255)              | NULLABLE                               |        | Sincronizado desde ATS                                  |
| `telefono`            | VARCHAR(50)               | NULLABLE                               |        | Sincronizado desde ATS                                  |
| `candidaturas_ids`    | UUID[]                    | NOT NULL, DEFAULT ARRAY[]::UUID[]      | GIN?   | Array de IDs de `Candidatura` del ATS MVP             |
| `fecha_creacion`      | TIMESTAMP WITH TIME ZONE  | NOT NULL, DEFAULT CURRENT_TIMESTAMP    |        |                                                           |
| `fecha_actualizacion` | TIMESTAMP WITH TIME ZONE  | NOT NULL, DEFAULT CURRENT_TIMESTAMP    |        |                                                           |
| `tags_agregados`      | TEXT[]                    | NULLABLE                               | GIN?   | Opcional: Tags consolidados/inferidos                 |
| `perfil_enriquecido`  | JSONB                     | NULLABLE                               | GIN?   | Opcional: Info agregada por IA (resumen carrera, etc.) |

**Tabla: `evaluaciones_candidato_ia`**
* Almacena el resultado de la evaluación de un CV para una candidatura.
* Corresponde al Aggregate Root `EvaluacionCandidatoIA`.

| Columna                       | Tipo                      | Constraints                                 | Índice | Notas                                                           |
| :---------------------------- | :------------------------ | :------------------------------------------ | :----- | :-------------------------------------------------------------- |
| `id`                          | UUID                      | PRIMARY KEY, DEFAULT gen_random_uuid()      | PK     | Identificador único de la evaluación                          |
| `candidatura_ats_id`          | UUID                      | NOT NULL                                    | IDX    | ID de la `Candidatura` en ATS MVP                             |
| `candidato_ia_id`             | UUID                      | NOT NULL, FK -> candidatos_ia(id)           | FK,IDX | Vínculo al perfil unificado                                     |
| `vacante_ats_id`              | UUID                      | NOT NULL                                    | IDX    | ID de la `Vacante` en ATS MVP                                   |
| `archivo_candidato_ats_id`    | UUID                      | NULLABLE                                    | IDX    | ID del `ArchivoCandidato` específico evaluado (si aplica)       |
| `score_valor_general`         | FLOAT                     | NULLABLE, CHECK (0 <= val <= 100)           | IDX    | Score principal (VO `Score`)                                    |
| `score_scores_parciales`      | JSONB                     | NULLABLE                                    | GIN?   | Desglose (VO `Score`)                                           |
| `score_justificacion_basica`  | TEXT                      | NULLABLE                                    |        | Breve explicación (VO `Score`)                                |
| `resumen_generado`            | TEXT                      | NULLABLE                                    |        | Resumen textual (US-025 / TK-079)                             |
| `datos_extraidos_cv`          | JSONB                     | NULLABLE                                    | GIN?   | Datos parseados (skills, exp, edu, soft skills?) (TK-070/TK-080) |
| `metadata_ia`                 | JSONB                     | NULLABLE                                    | GIN?   | Info del proceso (modelo, confianza, etc.)                    |
| `fecha_evaluacion`            | TIMESTAMP WITH TIME ZONE  | NOT NULL, DEFAULT CURRENT_TIMESTAMP         |        |                                                                 |

**Tabla: `registros_feedback_ia`**
* Almacena el feedback proporcionado por los usuarios.
* Corresponde al Aggregate Root `RegistroFeedbackIA` (TK-135).

| Columna              | Tipo                      | Constraints                                     | Índice | Notas                                                             |
| :------------------- | :------------------------ | :---------------------------------------------- | :----- | :---------------------------------------------------------------- |
| `id`                 | UUID                      | PRIMARY KEY, DEFAULT gen_random_uuid()          | PK     | Identificador único                                             |
| `evaluacion_ia_id`   | UUID                      | NOT NULL, FK -> evaluaciones_candidato_ia(id)   | FK,IDX | Evaluación sobre la que se da feedback                          |
| `candidatura_ats_id` | UUID                      | NOT NULL                                        | IDX    | Contexto ATS                                                      |
| `usuario_ats_id`     | UUID                      | NOT NULL                                        | IDX    | Quién dio el feedback (ID de `Usuario` ATS)                   |
| `tipo_feedback`      | VARCHAR(50)               | NOT NULL, CHECK (tipo_feedback IN (...))        | IDX    | 'SCORE_VALIDADO_UP', 'SCORE_AJUSTADO', 'SKILL_VALIDADA', ...    |
| `datos_feedback`     | JSONB                     | NULLABLE                                        | GIN?   | Detalles: { adjusted_score: 85, skill: "Java", validation: "OK" } |
| `fecha_feedback`     | TIMESTAMP WITH TIME ZONE  | NOT NULL, DEFAULT CURRENT_TIMESTAMP             |        |                                                                   |

### 2.2. Diagrama ERD (Conceptual) - TalentIA Core AI

```mermaid
erDiagram
    DESCRIPCIONES_PUESTO_GENERADAS {
        UUID id PK
        UUID vacante_ats_id NOT_NULL_IDX
        JSONB parametros_entrada NULLABLE
        TEXT contenido_generado NULLABLE
        JSONB metadata_ia NULLABLE
        TIMESTAMPZ fecha_generacion NOT_NULL
        FLOAT evaluacion_corte NULLABLE
        VARCHAR etapa_pre_aceptacion NULLABLE
        VARCHAR etapa_pre_rechazo NULLABLE
    }

    CANDIDATOS_IA {
        UUID id PK
        VARCHAR email UNIQUE_NOT_NULL_IDX
        VARCHAR nombre_completo NULLABLE
        VARCHAR telefono NULLABLE
        UUID_ARRAY candidaturas_ids NOT_NULL_DEFAULT_EMPTY_ARRAY
        TIMESTAMPZ fecha_creacion NOT_NULL
        TIMESTAMPZ fecha_actualizacion NOT_NULL
        TEXT_ARRAY tags_agregados NULLABLE
        JSONB perfil_enriquecido NULLABLE
    }

    EVALUACIONES_CANDIDATO_IA {
        UUID id PK
        UUID candidatura_ats_id NOT_NULL_IDX
        UUID candidato_ia_id FK_NOT_NULL_IDX
        UUID vacante_ats_id NOT_NULL_IDX
        UUID archivo_candidato_ats_id NULLABLE_IDX
        FLOAT score_valor_general NULLABLE_IDX
        JSONB score_scores_parciales NULLABLE
        TEXT score_justificacion_basica NULLABLE
        TEXT resumen_generado NULLABLE
        JSONB datos_extraidos_cv NULLABLE
        JSONB metadata_ia NULLABLE
        TIMESTAMPZ fecha_evaluacion NOT_NULL
    }

    REGISTROS_FEEDBACK_IA {
        UUID id PK
        UUID evaluacion_ia_id FK_NOT_NULL_IDX
        UUID candidatura_ats_id NOT_NULL_IDX
        UUID usuario_ats_id NOT_NULL_IDX
        VARCHAR tipo_feedback NOT_NULL_IDX
        JSONB datos_feedback NULLABLE
        TIMESTAMPZ fecha_feedback NOT_NULL
    }

    CANDIDATOS_IA ||--|{ EVALUACIONES_CANDIDATO_IA : "tiene evaluaciones"
    EVALUACIONES_CANDIDATO_IA ||--o{ REGISTROS_FEEDBACK_IA : "recibe feedback"

    %% Notas:
    %% - Las relaciones con ATS MVP son por ID (ej. vacante_ats_id).
    %% - JSONB es recomendado para campos flexibles (PostgreSQL).
    %% - Los índices (IDX) y Foreign Keys (FK) son cruciales.
```

*Este resumen proporciona una visión general de la implementación de las bases de datos para el proyecto TalentIA.*
