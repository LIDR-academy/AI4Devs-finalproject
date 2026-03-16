# 06 - Modelo de Datos (MS-PERSO)

Tablas usadas por el microservicio según las implementaciones y planes documentados. Solo se listan tablas referenciadas en los módulos actuales.

## Tablas núcleo (Persona/Cliente)
### rrfperson
- **Descripción**: Datos de persona base.
- **Campos clave** (según uso en clien): identificacion, nombres/apellidos, email, teléfonos, fechas, sexo, nacionalidad, estado civil, etc.
- **PK**: id_persona (entero/autonumérico).
- **Relaciones**: 1:1 con rrfclien; 1:N con módulos auxiliares que referencian persona/cliente.
- **Uso**: Lectura/Escritura (crear/actualizar persona, búsqueda por identificación, soft delete).

### rrfclien
- **Descripción**: Datos de cliente/socio vinculados a una persona.
- **Campos clave**: id_cliente, persona_id (FK a rrfperson), es_socio, estados, fechas, oficina, observaciones.
- **PK**: id_cliente.
- **FK**: persona_id → rrfperson.
- **Uso**: Lectura/Escritura (CRUD cliente, búsqueda por persona, transacción unificada).

## Tablas auxiliares 1:1 u opcionales (integradas en la transacción)
### rrfcldom (Domicilio)
- **PK**: id_cldom; **FK**: clien_id → rrfclien.
- **Uso**: Lectura/Escritura; obligatorio en alta completa.

### rrfcleco (Actividad Económica)
- **PK**: id_cleco; **FK**: clien_id → rrfclien.
- **Uso**: Lectura/Escritura; obligatorio en alta completa.

### rrfclrep (Representante)
- **PK**: id_clrep; **FK**: clien_id → rrfclien.
- **Uso**: Lectura/Escritura; condicional (menor de edad o persona jurídica).

### rrfclcyg (Cónyuge)
- **PK**: id_clcyg; **FK**: clien_id → rrfclien.
- **Uso**: Lectura/Escritura; condicional a estado civil.

### rrfcllab (Información Laboral)
- **PK**: id_cllab; **FK**: clien_id → rrfclien.
- **Uso**: Lectura/Escritura; condicional a persona natural adulta.

### rrfclref (Referencias)
- **PK**: id_clref; **FK**: clien_id → rrfclien.
- **Uso**: Lectura/Escritura; opcional, soporta múltiples tipos (personal/comercial/financiera).

### rrfclben (Beneficiarios)
- **PK**: id_clben; **FK**: clien_id → rrfclien.
- **Uso**: Lectura/Escritura; opcional, 1:N.

### rrfclfin (Información Financiera)
- **PK**: id_clfin; **FK**: clien_id → rrfclien.
- **Uso**: Lectura/Escritura; opcional.

### rrfclrfi (Residencia Fiscal)
- **PK**: id_clrfi; **FK**: clien_id → rrfclien.
- **Uso**: Lectura/Escritura; opcional.

### rrfclasm (Asamblea)
- **PK**: id_clasm; **FK**: clien_id → rrfclien.
- **Uso**: Lectura/Escritura; opcional.

### rrfclbnc (Banca Digital)
- **PK**: id_clbnc; **FK**: clien_id → rrfclien.
- **Uso**: Lectura/Escritura; incluye credenciales y estados de acceso.

## Tablas de catálogos (soporte)
- **Implementado**: `rrftiden` (tipos de identificación).
- **Pendientes** (planificados): `rrftpers`, `rrfsexos`, `rrfinstr`, `rrfecivi`, `rrfnacio`, `rrfetnia`, `rrftcont`, `rrftiref`, `rrftrep`, `rrftifin`, `rrfrasam`, `rrfifina`. Todos seguirán el patrón de `tiden`.

## Uso general
- Todas las tablas usan soft delete donde aplica.
- Acceso via repositorios con `PgService` y DTO/value objects para normalización.
- Transacciones: la alta completa usa inserciones coordinadas en todas las tablas anteriores según reglas de negocio.
