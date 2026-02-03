# Prompts utilizados — Flotiko (AI4Devs)

Documentación de los prompts más relevantes utilizados durante la creación del proyecto, por sección. Para cada una: hasta 3 prompts clave, breve nota de cómo se guió al asistente/LLM y, opcionalmente, enlace a la conversación.

---

## 1. Producto

**Objetivo, alcance, flujo E2E, historias de usuario.**

### Prompts clave

1. *"Define el objetivo del MVP de una app de gestión de flotas (vehículos, repostajes, mantenimientos) y un flujo E2E prioritario que cree valor completo en 5 pasos."*
2. *"Escribe 5 historias Must-Have y 2 Should-Have para ese flujo, en formato: Como [rol], quiero [acción] para [beneficio], con criterios de aceptación breves."*
3. *"Resume las características y funcionalidades principales que debe tener el producto para cumplir el flujo E2E (login, listado vehículos, detalle, repostaje, mantenimiento, historial/informe)."*

### Cómo se guió al asistente

Se pidió primero el flujo E2E y el valor de negocio; después las historias alineadas a ese flujo. Se acotó el dominio (flotas) y el tipo de usuario (usuario de empresa) para evitar scope creep.

### Enlace opcional

*(Añadir enlace a conversación si se considera útil.)*

---

## 2. Arquitectura

**Decisiones backend/frontend, autenticación, multi-tenant.**

### Prompts clave

1. *"Propón una arquitectura para una app de gestión de flotas: frontend SPA que solo consuma API, backend con lógica de negocio y BD. Indica cómo debe ser la autenticación para una app móvil/web que use API key."*
2. *"Explica cómo implementar multi-tenant por empresa (company_id) en Laravel: scopes globales, asignación automática en creación, y qué modelos deben quedar filtrados por empresa."*
3. *"Dibuja un diagrama de arquitectura (Mermaid flowchart) con cliente React SPA, API Laravel, base de datos MySQL y panel Filament; incluye la relación de autenticación (Bearer API Key)."*

### Cómo se guió al asistente

Se especificó que el frontend solo lee/escribe vía API y que la lógica debe estar en el backend. Se pidió multi-tenant desde el inicio para no tener que refactorizar después. El diagrama se pidió en Mermaid para incluirlo en el README.

### Enlace opcional

*(Añadir enlace si lo tienes.)*

---

## 3. Modelo de datos

**Entidades, relaciones, reglas de negocio.**

### Prompts clave

1. *"Diseña el modelo de datos para gestión de flotas: Company, User, Vehicle, FuelRefill, Maintenance. Incluye tablas auxiliares (Brand, MaintenanceType, Workshop, VehicleInsurance, GasStation) y relaciones. Indica qué campos son obligatorios y qué índices pondrías."*
2. *"Define las reglas de negocio para FuelRefill: cálculo de coste total, actualización de km del vehículo al crear repostaje, y cómo calcular consumo L/100 km y coste por km a partir del repostaje anterior."*
3. *"Añade a la documentación del modelo: multi-tenant (company_id en cada entidad operativa), historial de seguros (is_historical, parent_id) y que GasStation sea compartida entre empresas (sin company_id)."*

### Cómo se guió al asistente

Se fue iterando por dominios (vehículos, repostajes, mantenimientos, seguros). Se insistió en normalización, foreign keys e índices para listados y filtros por company_id y vehicle_id.

### Enlace opcional

*(Añadir enlace si lo tienes.)*

---

## 4. API

**Diseño de endpoints, autenticación, recursos.**

### Prompts clave

1. *"Diseña la API REST para el frontend de flotas: recursos vehicles, fuel-refills, maintenances, brands, workshops, maintenance-types. Indica qué endpoints son públicos (login, health, gas-stations/nearby) y cuáles requieren API key."*
2. *"Escribe la especificación OpenAPI (YAML) para GET/POST/PUT/DELETE de vehicles y fuel-refills: parámetros de paginación, filtros (brand_id, search), y esquemas de request/response con los campos del modelo."*
3. *"Añade a la API: autenticación con Authorization: Bearer {api_key} y X-API-Key; middleware que inyecte company_id desde la API key; y logging de llamadas (api_calls) para auditoría."*

### Cómo se guió al asistente

Se partió de las rutas ya implementadas en Laravel y se pidió documentación OpenAPI coherente con el modelo de datos. Se aclaró que login devuelve la API key (o token) que el cliente guarda y envía en cada petición.

### Enlace opcional

*(Añadir enlace si lo tienes.)*

---

## 5. Backend

**Implementación Laravel, servicios, políticas.**

### Prompts clave

1. *"Implementa en Laravel el controlador API para FuelRefill: index con filtros por vehicle_id y paginación, store con validación (refill_date, kms, liters, price_per_liter, fuel_type), cálculo de total_cost y actualización de vehicle.kms al crear."*
2. *"Crea un FuelRefillService que encapsule la lógica: calcular total_cost, actualizar kms del vehículo si el repostaje tiene más km, y método calculateConsumption() respecto al repostaje anterior. El controlador debe usar el servicio."*
3. *"Añade políticas (Policy) para Vehicle y FuelRefill: el usuario solo puede ver/editar/eliminar recursos de su company_id; super admin puede todo. Asocia las políticas a los controladores API."*

### Cómo se guió al asistente

Se pidió separar lógica en servicios y mantener controladores delgados. Se referenció el modelo de datos y las reglas de negocio ya definidas para que la implementación fuera consistente.

### Enlace opcional

*(Añadir enlace si lo tienes.)*

---

## 6. Frontend

**Páginas, contexto, llamadas API.**

### Prompts clave

1. *"En React (Vite), crea la estructura de rutas para: login, dashboard (listado vehículos), vehicle/:id (detalle), vehicle/:id/add-fuel, vehicle/:id/add-maintenance, vehicle/:id/history, vehicle/:id/report. Usa React Router y un Layout que muestre navegación solo si hay API key en localStorage."*
2. *"Implementa un cliente API con axios: baseURL configurable por env, interceptor que añada Authorization: Bearer con la API key de localStorage, y que en 401 limpie la key y redirija a /login. Otro axios sin interceptor para el endpoint de login."*
3. *"Crea la página AddFuelRefill: formulario con fecha, km, litros, precio por litro, tipo de combustible y opcional gasolinera; al enviar POST /api/fuel-refills con vehicle_id; mostrar toast de éxito o error y redirección al detalle del vehículo."*

### Cómo se guió al asistente

Se indicó que el frontend no debe contener lógica de negocio (cálculos, reglas) y que todo debe ir contra la API. Se pidió manejo de 401 centralizado y uso de variables de entorno para la URL del API.

### Enlace opcional

*(Añadir enlace si lo tienes.)*

---

## 7. Tests

**Unitarios, integración, E2E.**

### Prompts clave

1. *"Escribe tests PHPUnit para FuelRefillService: test que al crear un repostaje se calcule total_cost correctamente; test que vehicle.kms se actualice si el repostaje tiene más km; test de calculateConsumption con dos repostajes consecutivos."*
2. *"Añade un test de integración (Feature) en Laravel que simule POST /api/fuel-refills con API key válida: crear company, user, vehicle, y comprobar que el repostaje se guarda con total_cost y que la respuesta tiene los campos esperados."*
3. *"Genera un test E2E con Cypress o Playwright para el flujo: visitar login, introducir API key y enviar; ver listado de vehículos; hacer clic en el primero; ir a 'Añadir repostaje', rellenar formulario y enviar; comprobar que aparece en historial o detalle."*

### Cómo se guió al asistente

Se pidió primero tests unitarios del servicio y después tests de API (feature). El prompt E2E sirve como guión para implementar la suite cuando se añada Cypress/Playwright al proyecto.

### Enlace opcional

*(Añadir enlace si lo tienes.)*

---

## 8. Infra y despliegue

**CI/CD, gestión de secretos, URL pública.**

### Prompts clave

1. *"Configura el despliegue del frontend React/Vite en Netlify: comando de build, carpeta de publicación, y cómo inyectar la URL del API (VITE_API_BASE_URL) en build time desde variables de entorno de Netlify."*
2. *"Diseña un pipeline CI/CD básico (GitHub Actions): job que ejecute composer install y phpunit en el backend en cada push a main; y job que haga npm install y npm run build en el frontend y opcionalmente despliegue a Netlify."*
3. *"Lista qué secretos y variables de entorno necesita el backend (DB, APP_KEY, API keys de servicios externos) y el frontend (solo VITE_* para API URL y Firebase si aplica); indica qué no debe commitearse y cómo documentar el .env.example."*

### Cómo se guió al asistente

Se aclaró que las variables VITE_* se embeben en el build del frontend y no son secretos sensibles para la API; los secretos reales están en el backend y en Netlify (env de build). El pipeline se describió para poder implementarlo después.

### Enlace opcional

*(Añadir enlace si lo tienes.)*
