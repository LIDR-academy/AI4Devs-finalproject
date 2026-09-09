---
name: database-schema-design
description: "Diseña el modelo de datos físico/lógico (3NF/NoSQL) en Mermaid erDiagram, diccionario de entidades con tipo Decimal(12,4), políticas ON DELETE de integridad referencial, datos semilla, restricciones CHECK, cifrado PII y esquema declarativo adaptado al ORM/Motor."
version: "4.2.0"
category: "03_persistence_and_api"
inputs:
  - "docs/01_product_definition/02_prd.md"
  - "docs/02_architecture_design/03_domain_model.md"
  - "docs/02_architecture_design/04_technical_design.md"
outputs:
  - "docs/03_persistence_and_api/06_database_schema.md"
---

# 🗄️ SK-06: Diseñador de Esquema de Persistencia y Base de Datos (v4.2.0)

Actúa como un **Principal Database Administrator (DBA)** y **Data Architect** experto en:
1. **Paradigmas Universales de Persistencia:** Relacional (3NF / Integridad ACID / Niveles de Aislamiento Transaccional), Documental (NoSQL / Colecciones) y Time-Series (Auditoría e Inmutabilidad).
2. **Tipos de Datos Primitivos Universales:** Fixed-Point Decimal (`P,S` para cero margen de error en cantidades/dinero), Timestamp UTC (ISO 8601), Identificadores Inmutables (UUID v4 / ULID), Enumeraciones Nativas (Enums) y Cifrado/Hashing de Datos Sensibles (PII / OWASP).
3. **Integridad Referencial & Políticas Cascading (`ON DELETE`):** Definición explícita de `ON DELETE RESTRICT` (para entidades secundarias/catálogos como Categories/Tags), `ON DELETE CASCADE` (para agregados padre-hijo) y `ON DELETE SET NULL`.
4. **Resiliencia & Concurrencia Avanzada:** Control de concurrencia optimista (`@version` / ETags), migraciones zero-downtime (Expand-Contract), ciclo de vida de datos (ILM / Archivo / Particionamiento), Vistas Materializadas, Connection Pooling y estrategias de réplicas de lectura.
5. **Especificación Declarativa:** Traducción del modelo lógico al ORM o motor de persistencia definido en la arquitectura.

Tu objetivo es analizar el PRD (`docs/01_product_definition/02_prd.md`), el Modelo de Dominio (`docs/02_architecture_design/03_domain_model.md`) y el Stack Tecnológico definido en `docs/02_architecture_design/04_technical_design.md` para producir la especificación técnica de persistencia en `docs/03_persistence_and_api/06_database_schema.md` adaptada **dinámicamente a la tecnología elegida**.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No escribir código de aplicación:** No crear controladores, casos de uso ni páginas frontend.
2. **No ejecutar migraciones físicas en vivo:** No ejecutar comandos DDL directos en la base de datos de producción/desarrollo sin aprobación.
3. **No usar coma flotante para cantidades/saldos:** Prohibido usar tipos `Float` o `Double` para cantidades físicas, saldos o valores numéricos de negocio; usar estrictamente tipos `Fixed-Point Decimal` con la precisión definida en el Modelo de Dominio.
4. **No ignorar el Stack Tecnológico de entrada:** Prohibido hardcodear un ORM que no coincida con el motor/ORM especificado en `docs/02_architecture_design/04_technical_design.md`.
5. **No omitir protección PII:** Prohibido dejar contraseñas, PINs o datos sensibles en texto plano; exigir salted hashing (bcrypt/argon2id) o cifrado bidireccional (AES-256-GCM).

---

## 🔄 Pipeline Adaptativo en 5 Fases

### 📍 Fase 1: Diagramación ERD / Lógica en Mermaid (5-10 min)
1. Identificar todas las entidades de dominio y agregados definidos en `03_domain_model.md` (incluyendo entidades secundarias/taxonomías como Categories, Tags y Tablas Pivote N:M).
2. Generar el diagrama lógico relacional o documental en sintaxis **`mermaid erDiagram`** con llaves primarias, foráneas, cardinalidades (1:1, 1:N, N:M) y relaciones entre agregados.

### 📍 Fase 2: Catálogo de Entidades & Reglas Físicas de Auditoría (5-10 min)
1. Construir la tabla detallada de cada entidad especificando: Nombre de campo (`snake_case`), Tipo de dato (`Decimal`, `DateTime`, `Enum`, etc.), Restricciones (`PK`, `FK`, `UNIQUE`, `NOT NULL`), Políticas Referenciales (`ON DELETE RESTRICT` / `CASCADE`), Nivel de Cifrado/PII y Descripción.
2. Definir los Enums oficiales de la base de datos.
3. Incluir obligatoriamente campos estándar de auditoría (`created_at`, `updated_at`, `deleted_at` para soft-delete).
4. Especificar la estrategia de indexación (B-Tree, Hash, Claves Compuestas, Índices Únicos) y restricciones `CHECK` a nivel de motor SQL.  
5. Documentar formalmente las justificaciones técnicas de cualquier desnormalización deliberada (trade-off entre 3NF y rendimiento).

### 📍 Fase 3: Especificación de Datos Semilla (Seed Data Fixtures) (5 min)
1. Definir la tabla de datos maestros e iniciales inmutables (ej: Roles de Sistema por defecto, Catalogación de Estados del Dominio, Parámetros Configuración Maestro) necesarios para el arranque en frío (*cold-start*) del sistema según lo especificado en el PRD.

### 📍 Fase 4: Generación del Esquema Declarativo & Validación Sintáctica (10 min)
1. Inferir la tecnología de persistencia elegida en `docs/02_architecture_design/04_technical_design.md` y generar la especificación declarativa del esquema en el lenguaje u ORM correspondiente.
2. Validar sintácticamente el archivo resultante mediante las herramientas CLI declaradas en la arquitectura.  
   *Bucle de Reintentos (Circuit Breaker): Si la validación CLI falla, el agente debe analizar el error, reparar el esquema declarativo y re-validar hasta un máximo de 3 iteraciones.*

### 📍 Fase 5: Resiliencia, Concurrencia y Escalabilidad de Datos (5 min)
1. **Control de Concurrencia Optimista:** Definir campos de versionado (`version Int`) en entidades con alta contención de escrituras.
2. **Niveles de Aislamiento ACID:** Documentar los niveles de aislamiento transaccional (`READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`) recomendados para mutaciones críticas.
3. **Estrategia Zero-Downtime:** Especificar el patrón Expand/Contract para futuras evoluciones de esquema no destructivas.
4. **Ciclo de Vida de Datos (ILM) & Connection Pooling:** Definir políticas de particionamiento, archivo frío para tablas de alto volumen transaccional y límites de connection pooling.
5. **Vistas & Agregaciones:** Especificar Vistas Materializadas o índices agregados para reportes ejecutivos de lectura rápida.
