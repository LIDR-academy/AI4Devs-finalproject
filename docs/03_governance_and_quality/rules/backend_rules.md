# 🛡️ Reglas de Backend y Aplicación - Deducción de Especificaciones

Esta directiva rige la implementación de Casos de Uso (Aplicación) y Adaptadores Express/Prisma (Infraestructura), deducidas de los contratos OpenAPI y la arquitectura Hexagonal del proyecto.

---

## 🛠️ Pila Tecnológica Detectada
* **Entorno & Lenguaje:** Node.js (TypeScript)
* **Framework Web:** Express.js
* **Validación de Entradas:** Zod (Compulsory Active Sanitization)
* **ORM & Persistencia:** Prisma ORM (PostgreSQL)
* **Aritmética de Precisión:** `decimal.js`
* **Seguridad:** Bcrypt (10 salt rounds) & JWT

---

## 🏗️ 1. Arquitectura Hexagonal y Mappers
* **Aislamiento por Puertos:** La capa de aplicación interactúa con la infraestructura únicamente mediante interfaces (Puertos TypeScript).
* **Mappers de Datos:** No exponer modelos de Prisma directamente a los casos de uso o API. Se deben usar clases `Mapper` para transformar entre modelos ORM y Entidades de Dominio.

---

## 🚦 2. Controladores REST y Express
* **Validación con Zod:** Todo payload de entrada (`req.body`, `req.params`, `req.query`) debe ser validado con esquemas Zod en el controlador antes de invocar el caso de uso.
* **Manejo Centralizado de Errores:** Delegar excepciones al middleware global de Express para mapear `DomainError` a sus respectivos códigos HTTP.
* **Puerto de Servicio:** El servidor Express escucha en `process.env.PORT` o cae en el puerto por defecto `3000`.

---

## 🔄 3. Concurrencia y Transacciones
* **Atomicidad Transaccional:** Operaciones de inventario multiregistro deben ejecutarse dentro de `$transaction`.
* **Locks Pesimistas:** Utilizar `FOR UPDATE` al modificar remanentes concurrentes.
* **Prevención de Deadlocks:** Ordenar físicamente los IDs de los recursos a bloquear (`ORDER BY id ASC` o `.sort()`) antes de adquirir transacciones.

---

## 🔑 4. Precisión y Serialización JSON
* **Hashing de Credenciales:** Pines y passwords deben ser hasheados con `bcrypt`.
* **Serialización String:** Las cantidades decimales retornadas en JSON deben serializarse obligatoriamente como cadenas de texto (`string`) en formato formateado (ej. `.toFixed(4)`).

---

## 📐 5. Aplicación Estricta de Principios SOLID
* **SRP (Single Responsibility):** Caso de uso = 1 regla de negocio. Controller = 1 endpoint HTTP. Mapper = 1 transformación.
* **DIP (Dependency Inversion):** Todos los casos de uso reciben las instancias de repositorio inyectadas por interfaz en su constructor (`constructor(private userRepo: IUserRepository)`).
* **OCP (Open/Closed):** Nuevas funcionalidades se extienden agregando nuevos adaptadores sin mutar la lógica central del dominio.
