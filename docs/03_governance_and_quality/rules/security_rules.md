# 🔒 Reglas de Ciberseguridad - Deducción de Especificaciones

Esta directiva rige la seguridad técnica según los lineamientos OWASP del proyecto.

---

## 🛠️ Pila Tecnológica Detectada
* **Cifrado de Credenciales:** Bcrypt (10 salt rounds)
* **Gestión de Sesión:** Tokens JWT (Bearer Token HTTP Header)
* **Sanitización Activa:** Zod Schema Validation (Mass Assignment & Payload injection defense)
* **Auditoría de Dependencias:** `pnpm audit` & SAST en CI/CD

---

## 🔑 1. Autenticación y Cifrado
* **PINs y Passwords:** Hashing obligatorio con `bcrypt`.
* **Tokens JWT:** Firma con secreta configurada en entorno, expiración máxima de 12 horas.

---

## 🛡️ 2. Protección de Datos y Sanitización
* **Sanitización Input:** Toda entrada debe ser validada con esquemas Zod. Prohibidas las SQL injection y raw queries inseguras.
* **Tokenización PII:** Toda información de identificación personal se someterá a de-identificación previa en logs y exportaciones.
