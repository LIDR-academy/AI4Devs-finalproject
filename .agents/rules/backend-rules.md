# 🛡️ Reglas de Codificación del Backend (Backend & Infrastructure Rules)

Esta regla rige la implementación de las capas de Aplicación (Casos de Uso) e Infraestructura (Controladores, Base de Datos, Servidor) del backend de RestoStock.

---

## 🏗️ 1. Arquitectura Hexagonal y Puertos
*   **Aislamiento de Casos de Uso:** La capa de aplicación (Casos de Uso) solo interactúa con el exterior (base de datos, servicios externos) a través de **Puertos** (interfaces de TypeScript).
*   **Mapeadores de Datos (Mappers):** No se deben exponer los modelos autogenerados de Prisma fuera de la capa de infraestructura. Se deben utilizar clases `Mapper` específicas para transformar los modelos de Prisma a Entidades de Dominio (al leer) y viceversa (al persistir).

---

## 🚦 2. Controladores HTTP y Express
*   **Validación con Zod Obligatoria:** Todo endpoint debe validar su payload de entrada (`req.body`, `req.params`, `req.query`) usando esquemas de Zod específicos en el controlador. Si la validación falla, se debe responder inmediatamente con `400 Bad Request`.
*   **Manejo de Errores Centralizado:** Los controladores no deben capturar errores para dar respuestas genéricas. Deben delegar las excepciones al middleware global de Express, el cual mapeará los `DomainError` al código de estado HTTP adecuado (ej: `InvalidPinError` ➡️ `401 Unauthorized`).
*   **Puerto por Defecto:** El servidor Express debe escuchar en el puerto indicado por `process.env.PORT` o caer en el puerto por defecto `3000`.

---

## 🔒 3. Seguridad y Serialización
*   **Cifrado de Pines:** Los pines de usuarios deben almacenarse utilizando el algoritmo hashing `bcrypt`.
*   **Serialización Decimal:** Al retornar respuestas JSON con valores de cantidades físicas (tipos `Decimal`), estos deben serializarse obligatoriamente como cadenas de texto (`string`) para evitar problemas de redondeo y precisión flotante en el cliente/frontend.
*   **Sin RAW Queries Inseguras:** Queda estrictamente prohibido el uso de sentencias concatenadas SQL raw (`queryRawUnsafe`).
