# 1. Descripción general del producto

### **1.1. Objetivo:**

El propósito de Route Searcher es resolver la dificultad que enfrentan los usuarios actuales con una interfaz de búsqueda de rutas limitada y poco intuitiva. Aporta valor al permitir a los usuarios identificar rápidamente la mejor ruta para su viaje corporativo (Home → Work → Home) mediante un diseño "más inteligente", filtros contextuales y una reducción de la fricción en el proceso de selección. Está dirigido a empleados corporativos que necesitan gestionar sus desplazamientos diarios de manera eficiente.

**Métricas de Éxito (KPIs):**

* **Reducción del Tiempo de Búsqueda:** Disminuir el tiempo desde el aterrizaje hasta la selección de ruta.
* **Precisión de Búsqueda:** Aumentar el porcentaje de usuarios que encuentran una ruta que coincide con su horario.
* **Tasa de Abandono:** Disminuir el abandono durante el proceso de filtrado/selección.
* **Preferencia del Usuario:** Feedback cualitativo positivo (Lista vs. Mapa).

**Riesgos e Incertidumbres:**

* **Complejidad de UI:** Saturación en móvil/landing al añadir múltiples filtros.
* **Dependencias de Backend:** Lógica compleja para matching de horarios en tiempo real.
* **Consistencia:** Mantener la lógica alineada con otras integraciones y apps.

### **1.2. Características y funcionalidades principales:**

1. **Tipos de Viaje Explícitos:**
    * Soporte para viajes de "Solo Ida" (Outbound), "Solo Vuelta" (Return) y "Ida y Vuelta" (Round-trip).
2. **Lógica de Búsqueda y Filtrado Avanzada:**
    * **Radio de Búsqueda Configurable:**
        * El sistema utiliza un radio máximo (configurable por sitio) para validar la disponibilidad de paradas.
        * **Comportamiento fuera de radio:** Si la ubicación geográfica del usuario excede este radio predefinido respecto a las paradas del sitio, el sistema no devolverá resultados y mostrará un mensaje de error específico ("Ubicación fuera del área de servicio").
    * **Filtros Contextuales:**
        * Origen/Destino mediante búsqueda libre (Google) o paradas predefinidas.
        * Selección de fecha específica (bloqueando fechas diferentes para ida y vuelta en la misma búsqueda).
        * Filtros de hora (Salida después de XX:XXh / Llegada antes de XX:XXh).
    * **Asignación Inteligente:** Asignación automática de la parada más cercana a la dirección seleccionada por el usuario.
3. **Visualización y Ordenación de Resultados:**
    * Resultados ordenados por hora de salida ascendente.
    * Visualización clara de horarios para rutas de expedición única y multi-expedición.
    * Filtrado estricto: las rutas que no cumplen con los filtros de tiempo no se muestran.

### **1.3. Diseño y experiencia de usuario:**

La experiencia de usuario se centra en un flujo secuencial para reducir la carga cognitiva:

1. **Landing / Búsqueda:** El usuario introduce su origen/destino y selecciona el tipo de viaje.
2. **Selección de Ida:** Se muestran las opciones de ida filtradas. El usuario selecciona su preferida.
3. **Selección de Vuelta (si aplica):** Una vez seleccionada la ida, el usuario procede a seleccionar la vuelta.
4. **Feedback Visual:** Mensajes claros si la ubicación excede el radio de búsqueda.

> **Nota:** El diseño de alta fidelidad de las interfaces se encuentra disponible en la siguiente referencia gestionada por el equipo de diseño:
> [Ver Diseños en Stitch](https://stitch.withgoogle.com/projects/13706256767192248996)

### **1.4. Instrucciones de instalación:**

El proyecto sigue una arquitectura **Monorepo**, separando claramente el Backend del Frontend.

#### **Requisitos Previos**

* **Docker** (para el entorno local)

#### **Backend**

* **Tecnologías:** Laravel 10.10, PHP >= 8.1, MySQL 8.0.
* **Pasos de instalación:**
    1. Navegar a la carpeta `backend/`.
    2. Copiar el archivo de entorno: `cp .env.example .env`.
    3. Levantar los contenedores Docker: `docker-compose up -d`.
    4. Instalar dependencias de PHP (dentro del contenedor): `docker-compose exec app composer install`.
    5. Generar key de aplicación: `docker-compose exec app php artisan key:generate`.
    6. Ejecutar migraciones: `docker-compose exec app php artisan migrate`.

#### **Frontend**

* **Tecnologías:** Vue 3, Composition API, Vite 4.x, Vue Router 4, Pinia, Sass, Tailwind CSS 3.
* **Pasos de instalación:**
    1. Navegar a la carpeta `frontend/`.
    2. Instalar dependencias: `npm install`.
    3. Configurar variables de entorno si es necesario (ej. API Key de Google Maps).
    4. Ejecutar servidor de desarrollo: `npm run dev`.
    5. Para producción: `npm run build`.
