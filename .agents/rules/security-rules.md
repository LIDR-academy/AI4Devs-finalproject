# 🔒 Reglas de Ciberseguridad y Cumplimiento (Security Rules)

Esta regla define los estándares de ciberseguridad innegociables para el backend y frontend de RestoStock.

---

## 🔑 1. Autenticación y Autorización
*   **Hash de PINs:** Los PINs numéricos de 4 dígitos de los operarios deben procesarse con hashing `bcrypt` antes de almacenarse en la base de datos. Está estrictamente prohibido guardar PINs en texto plano.
*   **Vigencia del Token:** Los tokens de sesión JWT deben emitirse con una validez exacta de **12 horas** (tiempo límite de un turno de cocina largo).
*   **Validación de Roles:** Las rutas protegidas (ej. reportes, conciliación) deben verificar explícitamente el rol del usuario (`Role.ADMIN` o `Role.CHEF`) en el payload del JWT.

---

## 🛡️ 2. Protección de Datos y Sanitización
*   **Sanitización contra Inyección SQL:** Todas las consultas a la base de datos PostgreSQL deben pasar por el cliente ORM de Prisma (que parametriza las consultas automáticamente). No usar `queryRawUnsafe` ni concatenación de cadenas de texto.
*   **Sanitización de Inputs:** Toda entrada externa recibida por los controladores debe sanitizarse con esquemas de `Zod`. Se deben rechazar de forma estricta los caracteres sospechosos o formatos inválidos.

---

## 📝 3. Fuga de Datos y Logs
*   **No Registrar Información Sensible:** Queda estrictamente prohibido escribir contraseñas, PINs en texto plano o tokens JWT en los logs de la consola o archivos de log del sistema.
*   **Mensajes de Error Seguros:** Las respuestas HTTP a los clientes externos en producción no deben revelar el stack trace de la base de datos o detalles internos de la infraestructura.
