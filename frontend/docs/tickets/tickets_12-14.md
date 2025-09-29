## 12. Crear la carpeta frontend e inicializar el proyecto con npm

**Descripción detallada:**  
- **Propósito:**  
Establecer la estructura base del frontend para el sistema Buscadoc, permitiendo la gestión independiente del código y dependencias de la interfaz de usuario.
- **Detalle específico:**  
Crear la carpeta `frontend` en el directorio raíz del proyecto y ejecutar la inicialización de npm para generar el archivo `package.json`. No se instalarán dependencias en este ticket.

**Criterios de aceptación:**  
- Se crea la carpeta `frontend` en la raíz del proyecto.
- Se ejecuta `npm init` dentro de la carpeta y se genera el archivo `package.json`.
- El comando se ejecuta sin errores y el archivo queda listo para instalar dependencias.
- **Pruebas de validación:**  
  - Verificar que la carpeta existe y contiene el archivo `package.json`.
  - Ejecutar `npm install` (sin paquetes) y confirmar que no hay errores.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
0.5 horas

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Frontend, Configuración

**Comentarios y Notas:**  
Este ticket es el primer paso para la configuración del frontend. No incluye instalación de dependencias ni configuración adicional.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para inicialización de frontend.

## 13. Instalar las dependencias necesarias en frontend (React + Tailwind CSS + Headless UI, react-i18next, etc.)

**Descripción detallada:**  
- **Propósito:**  
Preparar el entorno de desarrollo frontend instalando todas las dependencias esenciales para el stack definido en el PRD, permitiendo la implementación de la interfaz de usuario y consumo de la API.
- **Detalle específico:**  
Instalar los siguientes paquetes en la carpeta `frontend`:
  - react
  - tailwindcss
  - headlessui/react
  - react-i18next
  - axios (para consumo de API)
  - react-router-dom
  - dotenv
  - Otros paquetes necesarios según el PRD

**Criterios de aceptación:**  
- Todos los paquetes principales del stack están instalados correctamente.
- El archivo `package.json` refleja las dependencias instaladas.
- No hay errores tras la instalación.
- **Pruebas de validación:**  
  - Ejecutar `npm ls` y verificar que todas las dependencias aparecen sin conflictos.
  - Probar importación básica de cada paquete en un archivo de prueba.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Frontend, Configuración

**Comentarios y Notas:**  
Revisar el PRD para confirmar versiones y dependencias adicionales. Documentar cualquier paquete extra instalado.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para instalación de dependencias frontend.

## 14. Configurar el entorno de desarrollo para frontend (variables de entorno, archivo .env)

**Descripción detallada:**  
- **Propósito:**  
Asegurar que el frontend tenga configuraciones seguras y flexibles para consumir la API, gestionar internacionalización y otros servicios, siguiendo las mejores prácticas y requisitos del PRD.
- **Detalle específico:**  
Crear un archivo `.env` en la carpeta `frontend` con las siguientes variables mínimas:
  - `APP_API_URL` (URL base de la API backend)
  - `APP_I18N_LOCALE` (idioma por defecto)
  - Variables adicionales según dependencias (Firebase, etc. si aplica)
Configurar el uso de `dotenv` o el sistema de variables de entorno de React en el proyecto para cargar estas variables.

**Criterios de aceptación:**  
- El archivo `.env` existe y contiene las variables necesarias.
- El frontend puede leer las variables de entorno correctamente.
- El consumo de la API y la internacionalización funcionan usando las variables configuradas.
- **Pruebas de validación:**  
  - Ejecutar el frontend y verificar que consume la API usando `APP_API_URL`.
  - Probar el cambio de idioma y otras variables configuradas.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Frontend, Configuración

**Comentarios y Notas:**  
No subir el archivo `.env` al repositorio. Documentar las variables requeridas en un archivo `README` o similar.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para configuración de entorno