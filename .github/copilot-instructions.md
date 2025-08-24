# GitHub Copilot Instructions for finalroject-JAPM

## Arquitectura y Componentes Clave
- El sistema implementa una arquitectura hexagonal (puertos y adaptadores) para desacoplar el core de dominio de frameworks y tecnologías.
- Principales componentes:
  - **Frontend:** Vue.js + Vuetify, internacionalización con vue-i18n.
  - **Backend:** Node.js + Express.js, autenticación con Auth.js, orquestadores de casos de uso.
  - **Persistencia:** Prisma + PostgreSQL.
  - **Almacenamiento de archivos:** Firebase Storage.
  - **Notificaciones:** Email (Nodemailer/SendGrid).
- El core de dominio gestiona usuarios, médicos, pacientes, especialidades, citas, valoraciones y direcciones (LOCATION, CITY, STATE).

## Flujos de trabajo y comandos
- El frontend consume la API REST y gestiona la experiencia de usuario, incluyendo internacionalización.
- Los casos de uso se exponen como interfaces invocadas por los adaptadores de entrada (API REST).
- Los adaptadores de salida implementan interfaces para persistencia y almacenamiento.
- Para desarrollo local, sigue las instrucciones de instalación en `readme.md`.

## Convenciones y patrones
- Mantén la lógica de negocio fuera de los controladores y adáptala en servicios de dominio.
- Los endpoints REST deben seguir la estructura `/api/{recurso}` y usar JWT/OAuth2 para autenticación.
- Los modelos de datos incluyen claves primarias y foráneas, y las relaciones están documentadas en los diagramas Mermaid.
- El sistema soporta multilenguaje y debe cumplir con la LFPDPPP (protección de datos personales en México).

## Integraciones y dependencias
- Autenticación con OAuth2 (Google/Outlook) y Auth.js.
- Almacenamiento de archivos en Firebase Storage.
- Emails enviados mediante Nodemailer, SendGrid o BillionMail.
- Internacionalización con vue-i18n.

## Ejemplos de patrones
- Para agregar una nueva entidad, crea el modelo en Prisma, el servicio de dominio, el caso de uso y el endpoint REST correspondiente.
- Para internacionalizar una vista, usa las funciones de vue-i18n y define los textos en los archivos de localización.
- Para agregar un nuevo filtro de búsqueda, actualiza el core de dominio y los adaptadores de entrada/salida.

## Archivos y carpetas clave
- `docs/product_requirement_document.md`: Requisitos y arquitectura.
- `docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md`: Modelo de base de datos
- `docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md`: Diagrama de arquitectura del sistema
- `docs/planificacion_y_documentacion/diagramas/diagrama_casos_de_uso.md`: Diagrama de casos de uso

## Consideraciones para tareas en especifico:
- Cuando se pida generar documentación (API, Readme, ect...) tomar en cuenta el idioma en el que se encuentra el archivo a complementar, generalmente es en español
- Cuando se pieda realizar un archivo de pruebas unitarias siempre utilizar Mocks
---

Asegúrate de seguir los patrones hexagonales y las convenciones de internacionalización y seguridad. Si tienes dudas sobre la estructura, consulta los diagramas y documentación en la carpeta `docs/`.
