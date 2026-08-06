# 🔒 Reglas de Ciberseguridad y Sandboxing - Deducción de Especificaciones

Esta directiva rige la seguridad técnica, sanitización activa y ejecución segura en entornos aislados (Sandboxing).

---

## 🛠️ Pila Tecnológica Detectada
* **Cifrado de Credenciales:** Bcrypt (10 salt rounds)
* **Gestión de Sesión:** Tokens JWT (Bearer Token HTTP Header)
* **Sanitización Activa:** Zod Schema Validation
* **Ejecución en Entorno Aislado:** Sandboxed Execution (Docker / Restricciones de Sistema)
* **Defensa Anti-Prompt Injection:** Desinfección de inputs externos no confiables

---

## 🔑 1. Autenticación y Cifrado
* **PINs y Passwords:** Hashing obligatorio con `bcrypt`.
* **Tokens JWT:** Firma con secreta configurada en entorno, expiración máxima de 12 horas.

---

## 🛡️ 2. Protección de Datos y Sanitización
* **Sanitización Input:** Toda entrada debe ser validada con esquemas Zod. Prohibidas las SQL injection y raw queries inseguras.
* **Tokenización PII:** Toda información de identificación personal se someterá a de-identificación previa en logs y exportaciones.

---

## 🔒 3. Gestión de Entornos y Secretos
* **Aislamiento `.env`:** Los archivos `.env` reales con secretos deben permanecer ignorados en `.gitignore`.
* **Plantillas `.env.example`:** Deben utilizar obligatoriamente la convención universal de placeholders `YOUR_..._HERE` (ej. `JWT_SECRET="YOUR_JWT_SECRET_KEY_HERE"`, `DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/YOUR_DB"`). Se prohíbe incrustar llaves o credenciales reales en las plantillas.

---

## 🧪 3. Sandboxing y Protección Anti-Prompt Injection
* **Sandboxed Command Execution:** Todas las ejecuciones de comandos en terminal local (tests, builds, migraciones) deben operar dentro del workspace del repositorio sin permisos de escritura fuera del proyecto.
* **Prevención de Injection Indirecta:** Los datos recuperados de fuentes externas no confiables (p. ej. issues, payloads de terceos, HTTP headers de clientes) no deben ser evaluados como código ejecutable ni introducidos directamente a los prompts del agente sin sanitización previa.
