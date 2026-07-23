---
name: security-strategy
description: "Define la estrategia de ciberseguridad OWASP Top 10, validación Zero Trust con Zod, hashing bcrypt y análisis GDPR/EU AI Act."
version: "1.1.0"
category: "03_governance_and_quality"
inputs:
  - prd_doc
  - design_doc
outputs:
  - "docs/03_governance_and_quality/07_security_strategy.md"
---

Actúa como un Senior Cybersecurity Architect y DevSecOps Specialist con amplia experiencia en las directrices de OWASP (tanto para aplicaciones tradicionales como para LLMs), GDPR y el EU AI Act (2026).

Tu objetivo es redactar la sección "Seguridad y Mitigación de Vulnerabilidades" basándote en el PRD de entrada [RUTA_DEL_PRD] y el documento de diseño técnico [RUTA_DEL_DISEÑO].

Por favor, estructura la documentación técnica de seguridad detallando con máximo rigor los siguientes 4 bloques:

---

# 💻 Seguridad y Mitigación de Vulnerabilidades

## 🔒 1. Sanitización de Entrada y Validación en Tiempo de Ejecución (Zero Trust en Entrada)
1. Detalla la estrategia de validación de datos en dos capas (Cliente para UX, Servidor para Seguridad).
2. Especifica el uso de esquemas de validación estrictos en tiempo de ejecución (ej. usando la librería Zod en Node.js) para validar por separado params, query y body de las peticiones HTTP antes de que interactúen con la capa de aplicación o dominio.
3. Prohíbe explícitamente el uso de expresiones regulares (regex) caseras para validar datos críticos (como correos, números de teléfono o PINs), exigiendo el uso de validadores tipados y robustos. Reserva librerías de sanitización de HTML (como DOMPurify) exclusivamente para campos de texto enriquecido que acepten intencionalmente contenido HTML.

## 🛡️ 2. Protección de Persistencia y Seguridad Física de Datos
1. Mitigación de SQL Injection (SQLi): Establece la obligatoriedad de que todas las consultas a la base de datos se realicen mediante consultas parametrizadas. Prohíbe explícitamente el uso de queries directas desprotegidas en el ORM (ej. evitar queryRawUnsafe de Prisma o sql.raw de Drizzle).
2. Gobernanza de Secretos de Entorno: Detalla la política de inyección de credenciales. Queda terminantemente prohibido persistir o hardcodear claves API o la variable de conexión de base de datos en archivos del repositorio; todos los secretos deben cargarse dinámicamente en tiempo de ejecución mediante gestores de secretos (Doppler, Infisical o variables de entorno del runner).
3. Conexiones Seguras y Cifrado: Exige el uso obligatorio de conexiones cifradas para la base de datos. Separa claramente las operaciones irreversibles de las reversibles: requiere hashing con sal (salted password hashing/KDF) para PINs y contraseñas; aplica funciones de hash de una sola vía para tokens cuando solo se requiera comparación de igualdad; y reserva el cifrado bidireccional de columnas (reversible encryption) estrictamente para tokens de acceso u otros datos confidenciales que deban recuperarse en su formato original en tiempo de ejecución.

## 📊 3. Clasificación de Riesgo bajo el EU AI Act y Privacidad de Datos
1. Inventario de IA y Jurisdicciones: Realice primero un inventario de las funcionalidades de Inteligencia Artificial y las jurisdicciones aplicables del proyecto antes de clasificar el riesgo o asumir que aplica el EU AI Act. Si no existen componentes de IA calificables, declare formalmente la no aplicabilidad justificando la decisión.
2. Clasificación de Riesgo: Si aplica, clasifique el sistema bajo los niveles de riesgo del EU AI Act, detallando las obligaciones correspondientes.
3. Cumplimiento de GDPR: Vincule el análisis GDPR estrictamente al modelo real de tratamiento de datos personales de la aplicación:
   - Principio de Minimización de Datos: Explique cómo el sistema limita la recopilación de datos de usuario a lo estrictamente necesario para su funcionamiento operacional y de persistencia.
   - Privacidad por Diseño (Privacy by Design): Documente el uso de técnicas de de-identificación, hashing o tokenización de Información de Identificación Personal (PII) en la base de datos o al interactuar con servicios externos (como APIs de LLM).

## 🤖 4. Gobernanza del Agente de Codificación (Garantía Antialucinaciones y Seguridad de Código)
Para blindar al equipo contra la introducción de vulnerabilidades automatizadas, establece las siguientes directrices operativas de seguridad para el pipeline y el entorno de desarrollo:
1. Obligatoriedad de Security Review: Ningún bloque de código o script de pruebas generado por un copiloto de IA se desplegará a producción sin pasar por una revisión estática de seguridad (SAST) y un code review manual realizado por un desarrollador senior.
2. Bloqueo de Slopsquatting: Establece la obligatoriedad de ejecutar escaneos de dependencias (como npm audit, Snyk o Dependabot) de forma continua en el pipeline para detectar paquetes maliciosos o inexistentes sugeridos erróneamente por las alucinaciones de los LLMs.
3. Principio de Menor Privilegio (Least Privilege): Los servidores MCP y herramientas del agente de IA local operarán en modo de solo lectura sobre entornos con datos reales o pre-producción para evitar modificaciones destructivas accidentales.

---

Redacta las explicaciones técnicas con un tono formal, claro y extremadamente riguroso para auditores de seguridad. Comienza directamente con el título del archivo sin preámbulos.

Guarda el resultado en el archivo: [RUTA_DE_SALIDA_SEGURIDAD]
