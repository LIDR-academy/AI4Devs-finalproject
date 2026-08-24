# 🛡️ Reglas de Backend y Aplicación - Deducción de Especificaciones

Esta directiva rige la implementación de Casos de Uso (Aplicación) y Adaptadores Express/Prisma (Infraestructura), previniendo desvíos arquitectónicos (Architectural Drift).

---

## 🛠️ Pila Tecnológica Detectada
* **Entorno & Lenguaje:** Node.js (TypeScript)
* **Framework Web:** Express.js
* **Validación de Entradas:** Zod (Compulsory Active Sanitization)
* **Linter de Contratos & Anti-Drift:** `Spectral` (OpenAPI Linter) + `prisma validate`
* **ORM & Persistencia:** Prisma ORM (PostgreSQL)
* **Aritmética de Precisión:** `decimal.js`
* **Seguridad:** Bcrypt (10 salt rounds) & JWT

---

## 🔍 1. Prevención de Drift Arquitectónico (Anti-Drift Guard)
* **Sincronización Bidireccional:** Queda prohibido editar la base de datos físicamente o agregar endpoints Express "en caliente" sin actualizar primero el contrato OpenAPI (`docs/04_persistence_and_api/10_restostock_api_specification.md`) y el modelo Prisma (`schema.prisma`).
* **Verificación Automatizada:** En cada build/commit, se ejecuta `prisma validate` y `spectral lint` para asegurar que el código no haya drifted de la especificación.

---

## 🏗️ 2. Arquitectura Hexagonal y Mappers
* **Aislamiento por Puertos:** La capa de aplicación interactúa con la infraestructura únicamente mediante interfaces (Puertos TypeScript).
* **Mappers de Datos:** No exponer modelos de Prisma directamente a los casos de uso o API. Se deben usar clases `Mapper` para transformar entre modelos ORM y Entidades de Dominio.

---

## 🚦 3. Controladores REST, Routers y Express
* **Validación con Zod:** Todo payload de entrada (`req.body`, `req.params`, `req.query`) debe ser validado con esquemas Zod en el controlador antes de invocar el caso de uso.
* **Inyección de Dependencias en Routers:** Queda prohibido instanciar repositorios o servicios concretos directamente dentro de las funciones creadoras de rutas (ej. `new InMemoryRepo()`). Todas las dependencias de persistencia y dominio deben inyectarse por parámetro.
* **Respuestas de Error RFC 7807 Problem Details:** Todas las excepciones lanzadas o capturadas en controladores y middleware global DEBEN serializarse obligatoriamente bajo el estándar **RFC 7807 Problem Details** (`{ type, title, status, detail, instance }`).
* **Puerto de Servicio:** El servidor Express escucha en `process.env.PORT` o cae en el puerto por defecto `3000`.

---

## 🔄 4. Concurrencia y Transacciones
* **Atomicidad Transaccional:** Operaciones de inventario multiregistro deben ejecutarse dentro de `$transaction`.
* **Locks Pesimistas:** Utilizar `FOR UPDATE` al modificar remanentes concurrentes.
* **Prevención de Deadlocks:** Ordenar físicamente los IDs de los recursos a bloquear (`ORDER BY id ASC` o `.sort()`) antes de adquirir transacciones.

---

## 🔑 5. Precisión y Serialización JSON
* **Hashing de Credenciales:** Pines y passwords deben ser hasheados con `bcrypt`.
* **Serialización String:** Las cantidades decimales retornadas en JSON deben serializarse obligatoriamente como cadenas de texto (`string`) en formato formateado a 3 decimales (ej. `.toFixed(3)`).
