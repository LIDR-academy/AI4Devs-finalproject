Actúa como un Senior Cybersecurity Architect y DevSecOps Specialist con amplia experiencia en las directrices de OWASP (tanto para aplicaciones tradicionales como para LLMs), GDPR y el EU AI Act (2026).

Tu objetivo es redactar la sección "Seguridad y Mitigación de Vulnerabilidades" para el documento de diseño técnico "design.md" de nuestro proyecto, basándote en el PRD de entrada y el modelo de datos agnóstico.

Por favor, estructura la documentación técnica de seguridad detallando con máximo rigor los siguientes 4 bloques:

---

# 💻 Seguridad y Mitigación de Vulnerabilidades

## 🔒 1. Sanitización de Entrada y Validación en Tiempo de Ejecución (Zero Trust en Entrada)
1. Detalla la estrategia de validación de datos en dos capas (Cliente para UX, Servidor para Seguridad).
2. Especifica el uso de esquemas de validación estrictos en tiempo de ejecución (ej. usando la librería Zod en Node.js) para sanitizar todos los payloads HTTP que entran por params, query y body antes de que interactúen con la capa de aplicación o dominio.
3. Prohíbe explícitamente el uso de expresiones regulares (regex) caseras para datos críticos (como validaciones de correos, números de teléfono o PINs), exigiendo librerías maduras y consolidadas (como DOMPurify para evitar Cross-Site Scripting - XSS).

## 🛡️ 2. Protección de Persistencia y Seguridad Física de Datos
1. Mitigación de SQL Injection (SQLi): Establece la obligatoriedad de que todas las consultas a la base de datos se realicen mediante consultas parametrizadas. Prohíbe explícitamente el uso de queries directas desprotegidas en el ORM (ej. evitar queryRawUnsafe de Prisma o sql.raw de Drizzle).
2. Gobernanza de Secretos de Entorno: Detalla la política de inyección de credenciales. Queda terminantemente prohibido persistir o hardcodear claves API o la variable de conexión de base de datos en archivos del repositorio; todos los secretos deben cargarse dinámicamente en tiempo de ejecución mediante gestores de secretos (Doppler, Infisical o variables de entorno del runner).
3. Conexiones Seguras y Cifrado: Exige el uso obligatorio de conexiones cifradas para la base de datos y detalla el uso de cifrado a nivel de columna para datos confidenciales (como PINs hashados o tokens).

## 📊 3. Clasificación de Riesgo bajo el EU AI Act y Privacidad de Datos
1. Clasifica el sistema de software bajo las categorías de riesgo del marco regulatorio de la Unión Europea (EU AI Act), justificando detalladamente su nivel (ej. si interactúa como un chatbot es Riesgo Limitado con obligaciones de transparencia, o si clasifica datos sensibles/empleados es Riesgo Alto con obligaciones de conformidad).
2. Detalla el cumplimiento con la directiva GDPR:
   - Principio de Minimización de Datos: Explica cómo el sistema limita la recopilación de datos de los usuarios a lo estrictamente necesario para la operación.
   - Privacidad por Diseño (Privacy by Design): Documenta el uso de técnicas de de-identificación o tokenización de información personal identificable (PII) si los datos deben transferirse a APIs de modelos LLM externos para auditorías o análisis.

## 🤖 4. Gobernanza del Agente de Codificación (Garantía Antialucinaciones y Seguridad de Código)
Para blindar al equipo contra la introducción de vulnerabilidades automatizadas, establece las siguientes directrices operativas de seguridad para el pipeline y el entorno de desarrollo:
1. Obligatoriedad de Security Review: Ningún bloque de código o script de pruebas generado por un copiloto de IA se desplegará a producción sin pasar por una revisión estática de seguridad (SAST) y un code review manual realizado por un desarrollador senior.
2. Bloqueo de Slopsquatting: Establece la obligatoriedad de ejecutar escaneos de dependencias (como npm audit, Snyk o Dependabot) de forma continua en el pipeline para detectar paquetes maliciosos o inexistentes sugeridos erróneamente por las alucinaciones de los LLMs.
3. Principio de Menor Privilegio (Least Privilege): Los servidores MCP y herramientas del agente de IA local operarán en modo de solo lectura sobre entornos con datos reales o pre-producción para evitar modificaciones destructivas accidentales.

---

Redacta las explicaciones técnicas con un tono formal, claro y extremadamente riguroso para auditores de seguridad. Comienza directamente con el título del archivo sin preámbulos.

Guarda el resultado en el archivo: [RUTA_DE_SALIDA_SEGURIDAD]
