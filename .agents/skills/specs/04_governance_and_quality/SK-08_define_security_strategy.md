---
name: security-strategy
description: "Define la estrategia de ciberseguridad Enterprise OWASP Top 10, validación Zero Trust con esquemas tipados, cifrado PII, hardening CORS/CSP, rotación JWT, anti-fuerza bruta, logs de auditoría inmutables y cumplimiento GDPR / EU AI Act."
version: "3.3.0"
category: "04_governance_and_quality"
inputs:
  - "docs/01_product_definition/02_prd.md"
  - "docs/02_architecture_design/04_technical_design.md"
outputs:
  - "docs/04_governance_and_quality/08_security_strategy.md"
---

# 🛡️ SK-08: Estrategia de Ciberseguridad, PII y Cumplimiento (v3.3.0)

Actúa como un **Senior Cybersecurity Architect** y **DevSecOps Specialist** con amplia experiencia en directrices de OWASP Top 10, GDPR, ISO 27001 y el EU AI Act (2026).

Tu objetivo es analizar el PRD (`docs/01_product_definition/02_prd.md`) y el Diseño Técnico (`docs/02_architecture_design/04_technical_design.md`) para redactar la especificación técnica de seguridad en `docs/04_governance_and_quality/08_security_strategy.md`.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No almacenar secretos en texto plano:** Queda terminantemente prohibido escribir contraseñas, claves API o strings de conexión en archivos `.env` o código fuente; usar variables de entorno de tiempo de ejecución o gestores de secretos.
2. **No usar regex caseras para validaciones de seguridad:** Prohibido validar correos, PINs o tokens con expresiones regulares informales; exigir sanitización tipada en tiempo de ejecución con la librería de validación declarada en `docs/00_stack_manifest.md` (ej. Zod, Pydantic, Joi).
3. **No ejecutar SQL desprotegido:** Prohibido usar sintaxis de consulta SQL concatenada o insegura (`queryRawUnsafe`, `sql.raw`); exigir consultas parametrizadas o bindings del ORM.
4. **Prohibición de Wildcards en CORS en Producción:** Queda estrictamente prohibido configurar `Access-Control-Allow-Origin: *` en entornos de producción; exigir una lista blanca de orígenes permitidos.
5. **No emitir tokens JWT sin expiración corta:** Prohibido configurar tokens de acceso de larga duración; exigir `Access Token` $\le$ 15 minutos y estrategia de rotación para `Refresh Tokens`.
6. **Prohibición de Impresión de Datos Sensibles en Logs:** Queda terminantemente prohibido registrar en los logs (`stdout`/`stderr`) PINs, tokens JWT, passwords o PII en texto plano; aplicar filtros de enmascaramiento automático (`"pin": "****"`).
7. **Prohibición de Tipos Inseguros (`No Any Leakage`):** Queda estrictamente prohibido el uso de `any`/tipos dinámicos sin tipar o castings sin previa validación con el esquema de la librería de validación declarada en el stack manifest, en la frontera del sistema.
8. **Prohibición de Errores Silenciosos (`No Silent Catches`):** Prohibido usar bloques `catch (err) {}` vacíos o tragar excepciones; transformar todos los errores en respuestas estructuradas RFC 7807 o eventos auditables.
9. **No Ambogüedad de Zona Horaria (`No Timezone Ambiguity`):** Prohibido instanciar `new Date()` sin zona horaria UTC explícita (formato ISO 8601 `YYYY-MM-DDTHH:mm:ssZ`) para garantizar precisión temporal.

---

## 🔄 Pipeline de Ejecución Secuencial en 6 Bloques

### 📍 Bloque 1: Sanitización de Entrada, Validación Zero Trust & Diagrama STRIDE
1. Detallar la validación en dos capas (UX en Cliente, Seguridad estricta en Servidor).
2. Generar el Diagrama de Fronteras de Confianza y Modelo STRIDE (`mermaid graph TD`) delimitando la Zona No Confiable, Guards de API Gateway, Zona de Confianza de Dominio y Zona de Persistencia.
3. Especificar esquemas obligatorios (con la librería de validación declarada en `docs/00_stack_manifest.md`) para sanitizar `params`, `query` y `body` antes de alcanzar la capa de dominio.
4. Definir políticas contra inyección XSS y desinfección de textos enriquecidos con la librería sanitizadora declarada en el stack (ej. DOMPurify, bleach).

### 📍 Bloque 2: Protección de Persistencia, Secretos y Cifrado PII
1. Garantizar consultas 100% parametrizadas en la capa de datos.
2. Definir la matriz de cifrado de datos sensibles:
   - Contraseñas / PINs: `Argon2id` o `bcrypt` con sal.
   - Tokens temporales: Hashing unidireccional SHA-256.
   - Datos personales PII: Cifrado bidireccional AES-256-GCM si requiere recuperación.

### 📍 Bloque 3: Hardening de Red, Cabeceras HTTP & Política CORS
1. Configurar cabeceras de seguridad HTTP obligatorias:
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HSTS)
   - `X-Frame-Options: DENY` (Anti-Clickjacking)
   - `X-Content-Type-Options: nosniff` (Anti-MIME Sniffing)
   - `Content-Security-Policy` (CSP) estricta.
2. Definir la política CORS con orígenes explícitos validados por entorno.

### 📍 Bloque 4: Sesiones, Control de Acceso (RBAC) & Anti-Fuerza Bruta
1. Autenticación con `Access Token` ($\le 15\text{ min}$) y `Refresh Token` en cookie `HTTP-Only`, `SameSite=Strict`.
2. Política Anti-Fuerza Bruta: Bloqueo automático temporal (15 min) ante $\ge 5$ intentos fallidos de autenticación.
3. Matriz RBAC/ABAC para prevenir escalación horizontal y vertical de privilegios.

### 📍 Bloque 5: Trazabilidad Inmutable & Sanitización de Logs
1. Definir el esquema estandarizado de eventos de auditoría para operaciones críticas:
   `{ timestamp, userId, action, resourceId, ipAddress, correlationId }`.
2. Regla de enmascaramiento automático de secretos en la infraestructura de logs.

### 📍 Bloque 6: Clasificación EU AI Act, GDPR & Gobernanza de Agentes IA
1. Inventariar componentes de IA y evaluar nivel de riesgo bajo el EU AI Act (2026). Si no aplica IA, formalizar la no aplicabilidad.
2. Definir cumplimiento GDPR (Minimización de datos y Privacidad por Diseño / *Privacy by Design*).
3. Exigir revisión estática de seguridad (SAST) y bloqueo de alucinaciones de paquetes (*slopsquatting*) mediante el comando de auditoría de dependencias declarado en `AGENTS.md` (ej. `pnpm audit`, `pip-audit`, `cargo audit`).

---

## 📌 Formato de Salida y Cabecera GFM

El archivo generado en `docs/04_governance_and_quality/08_security_strategy.md` debe incluir la cabecera:

```markdown
---
document: security_strategy
version: 1.3.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/02_architecture_design/04_technical_design.md
---

# 🛡️ Especificación de Ciberseguridad, PII y Cumplimiento

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Especificación API REST (07_api_specification.md)](../../../../docs/03_persistence_and_api/07_api_specification.md) | [📖 Glosario & Reglas](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Estrategia de Pruebas (09_testing_strategy.md) ➡️](./09_testing_strategy.md)

---
```
