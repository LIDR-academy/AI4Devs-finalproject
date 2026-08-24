---
name: SK-33_environment_configuration_auditor
description: "Guía procedimental agnóstica para auditar, validar y forzar esquemas de configuración de entorno Fail-Fast y desinfectar plantillas .env.example."
version: "1.0.0"
category: "development/01_rules_extraction"
inputs:
  - env_files: "Archivos de entorno del proyecto (.env, .env.example, config files)"
outputs:
  - "Esquema de validación Fail-Fast en tiempo de arranque"
  - "Plantilla .env.example libre de secretos reales y alineada con OWASP"
  - "Parametrización de CORS, Rate Limit y Entropía de Secretos"
---

Actúa como un **DevSecOps Architect** y **Platform Engineer Senior**. Tu objetivo es auditar y forzar las buenas prácticas universales en la gestión de variables de entorno para proyectos **nuevos y legacy**, garantizando que el sistema sea 100% agnóstico a la tecnología (Node.js, Python, Go, Rust, Java, etc.).

---

## 📐 FASE 1: Auditoría de Plantillas y Fugas de Secretos (.env.example)
1. **Auditoría de Plantilla (.env.example / config.template):**
   - Confirmar que exista un archivo de plantilla versionado en Git (`.env.example`).
   - Verificar que **ningún** secreto real (claves privadas, contraseñas de DB, JWT secrets reales) esté presente.
   - Forzar el uso de identificadores sintéticos universales (`YOUR_DB_PASSWORD`, `YOUR_SECRET_KEY_MIN_32_CHARS`).
2. **Verificación de GitIgnore:**
   - Confirmar que los archivos de claves reales (`.env`, `.env.local`, `.env.production`) estén declarados en `.gitignore`.

---

## 🛡️ FASE 2: Validación Fail-Fast en Tiempo de Arranque
1. **Parseo Estricto de Esquema (Zod / Pydantic / Viper / Envy):**
   - Forzar la validación de tipos y formatos de todas las variables al iniciar la aplicación (ej. URIs válidas, números enteros, enums de entorno).
   - En caso de faltar una variable requerida, la aplicación **debe abortar el arranque de inmediato (Fail-Fast)** con un reporte legible.
2. **Entropía Mínima de Secretos y Prohibición de Valores por Defecto Inseguros:**
   - En entornos de producción (`NODE_ENV=production` / `ENV=prod`), **PROHIBIR los valores por defecto para claves secretas y credenciales** (`JWT_SECRET`, `DATABASE_URL`, `API_KEY`). Si no se proveen explícitamente, la app debe fallar (Fail-Fast).
   - Rechazar en producción claves con palabras como `'dev'`, `'test'`, `'default'` o patrones conocidos.
   - Prohibir comodines permisivos en producción (`CORS_ALLOWED_ORIGINS="*"`) obligando a especificar dominios de origen explícitos.
   - Permitir únicamente valores por defecto **operativos y seguros** en desarrollo local (ej. `PORT=3000`, `RATE_LIMIT_WINDOW_MS=900000`).

---

## 🌐 FASE 3: Parametrización de Seguridad de Red y Aislamiento
1. **Parametrización de CORS & Rate Limit:**
   - Garantizar que los orígenes permitidos de CORS (`CORS_ALLOWED_ORIGINS`) y los parámetros de limitación de tasa (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`) se lean desde variables de entorno y no estén hardcodeados.
2. **Aisle de Variables de Cliente (Frontend / Mobile):**
   - Garantizar que el cliente solo consuma variables explícitamente expuestas por el *bundler* o compilador (`VITE_`, `REACT_APP_`, `NEXT_PUBLIC_`, `ENV_`), evitando fugas de claves del servidor.

---

## 🧪 FASE 4: Verificación y Testing de Entorno
1. Crear o actualizar las suites de pruebas unitarias/integración para simular el fallo de arranque cuando falte una variable requerida.
2. Ejecutar el validador de arnés `.agents/scripts/validate_agents.sh` para confirmar la integridad del sistema.
