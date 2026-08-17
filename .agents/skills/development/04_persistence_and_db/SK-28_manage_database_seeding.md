---
name: SK-28_manage_database_seeding
description: "Guía procedimental agnóstica para crear, auditar y ejecutar estrategias de sembrado de datos (seeding) bajo los 5 pilares profesionales de ingeniería."
version: "1.0.0"
category: "development/04_persistence_and_db"
inputs:
  - seeding_requirements: "Descripción de las entidades, catálogo maestro o fixtures a sembrar"
outputs:
  - "Script o módulo de seeding idempotente generado"
  - "Verificación de la separación de entornos (Essential vs Fixtures)"
  - "Ejecución exitosa y limpia del sembrado"
---

Actúa como un Database Administrator (DBA) y Backend Engineer Senior. Tu objetivo es crear o refactorizar la estrategia de sembrado de datos (*seeding*) del proyecto aplicando estrictamente los **5 Pilares del Seeding Profesional** de forma completamente agnóstica de la pila tecnológica.

Sigue secuencialmente este flujo procedimental:

---

## 🔍 FASE 1: Verificación de Reglas y Clasificación de Datos
1. **Leer Reglas de Base de Datos:** Revisa `docs/04_governance_and_quality/rules/database_rules.md` (Sección 3: *Gobernanza y Manejo Profesional de Semillas*).
2. **Clasificar los Datos Solicitados:**
   - **Essential Seeds (Estructurales):** ¿Son catálogos fijos, roles o configuraciones obligatorias para el funcionamiento del sistema en Producción?
   - **Synthetic Fixtures Seeds (Desarrollo/Demo):** ¿Son registros simulados para pruebas de cocineros, insumos o transacciones?
3. **Verificar Aislamiento de Entorno:** Garantiza que los *Fixtures* de prueba solo se ejecuten cuando `process.env.NODE_ENV !== 'production'`.

---

## 🛠️ FASE 2: Diseño del Script de Sembrado Agnóstico e Idempotente
1. **Garantizar Idempotencia Obligatoria:**
   - En ORMs (Prisma, TypeORM, Drizzle): Utiliza `upsert({ where, update, create })`.
   - En SQL Nativo: Utiliza `INSERT INTO ... ON CONFLICT (...) DO UPDATE`.
   - En Repositorios InMemory/NoSQL: Comprueba la existencia por identificador único antes de sembrar.
2. **Sanitización PII y Hashing Seguro:**
   - Asigna correos y nombres sintéticos (`admin@restostock.com`, `USER_SYNTHETIC_001`).
   - Cifra todas las credenciales o PINs con hashes realistas (`Argon2id` / `bcrypt` / `Salted Hash`).

---

## 🚀 FASE 3: Desacoplamiento y Runner CLI
1. **Crear o Actualizar el Runner CLI:** Ubica la semilla en un runner independiente (ej. `prisma/seed.ts` o un script CLI desacoplado).
2. **Configurar el Comando de Ejecución:** Asegúrate de declarar el script ejecutable en `package.json` (ej. `"db:seed"`).
3. **Desacoplar de Servidores Web:** Garantiza que el arranque del servidor de producción (`app.ts` / `server.ts`) NO ejecute semillas pesadas en tiempo de recepción de tráfico.

---

## 🧪 FASE 4: Verificación y Reporte
1. **Ejecutar el Runner:** Corre el comando de sembrado (ej. `pnpm --filter @restostock/backend exec prisma db seed` o runner equivalente).
2. **Probar Idempotencia:** Re-ejecuta el comando por segunda vez y confirma que termine con **0 errores** y **0 registros duplicados**.
3. **Reportar al Humano:** Notifica el estado y los registros sembrados estructurados según `.agents/rules/00_output_reporting_standard.md`.
