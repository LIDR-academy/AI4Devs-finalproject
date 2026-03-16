# Componentes principales de la aplicación (según PRD de **Gamy**)

## 1) Frontend Web (UI)

* **Tecnología:** Django Templates + **HTMX** (con opción futura a SPA, p. ej. React).
* **Enfoque:** **mobile-first**/**responsive**.
* **Páginas clave:** Inicio, Catálogo (listado + filtros), Detalle de juego, Login/Registro, Dashboard de usuario, Formulario de solicitud de nuevos juegos.

---

## 2) Backend (Django)

Lógica de negocio, seguridad y orquestación de vistas/servicios:

* **Autenticación y perfiles:** registro, login, recuperación, perfil básico.
* **Catálogo y búsqueda/filtros:** listado, detalle, filtros por nº de jugadores, tiempo, edad, categoría.
* **Biblioteca personal y Wishlist:** agregar/remover juegos, visualizar colecciones.
* **Contenido diferenciado:** visitante ve reglas básicas; usuario registrado accede a reglas detalladas/contenidos extra.
* **Solicitudes de nuevos juegos:** formulario, estado y flujo de aprobación.
* **Panel de administración (Django Admin):** curación del catálogo, gestión de solicitudes y metadatos.

---

## 3) Base de Datos (PostgreSQL)

Tablas núcleo:

* **Users** (autenticación/perfiles).
* **Games** (ficha del juego: atributos, reglas, metadatos).
* **UserGameLibrary** (relación usuario–juego con estado: *owned* / *wishlist*).
* **GameRequests** (solicitudes de nuevos juegos).

> Extensiones propuestas (si aplica): `RuleSet`, `RuleVariant` y `TrainingVideo` para versionado de reglas, variantes y videos de entrenamiento.

---

## 4) Arquitectura del sistema

```
[Frontend (Templates + HTMX)]
          │  HTTP/HTTPS
          ▼
 [Django Backend (Views/Services)]
          │  SQL (ORM)
          ▼
        [PostgreSQL]
```

Apoyos:

* **Static Files** (CSS/JS/Imágenes).
* **Admin Panel** (Django Admin).
* **Herramientas de migración/carga** (comandos de management para carga inicial/ETL).

---

## 5) Archivos estáticos

* Entrega de **CSS/JS/Imágenes** optimizados para tiempos de carga bajos.
* Integración con el pipeline de build/deploy.

---

## 6) Herramientas de migración/carga de datos

* **Carga inicial** del catálogo (lote de 50–100 juegos).
* Scripts/management commands para **ETL** y actualizaciones periódicas.

---

## 7) Hosting & DevOps

* Despliegue en infraestructura compatible con Django (p. ej., **OpenLiteSpeed**, Heroku o DigitalOcean).
* Control de versiones con **Git/GitHub**.
* Variables de entorno, migraciones automatizadas y *collectstatic* en el pipeline.

---

## 8) Requisitos no funcionales

* **Performance:** < 3 s de TTFB/First Contentful Paint para vistas principales; \~100 usuarios concurrentes (MVP).
* **Disponibilidad:** objetivo **99%** (MVP).
* **Seguridad:** Django Auth, CSRF, validación de entradas, hash de contraseñas; cumplimiento básico de privacidad.

---

## 9) UX & flujos clave

* **Mobile-first** en navegación y formularios.
* Flujos principales:

  1. **Descubrimiento** (explorar catálogo + filtros).
  2. **Gestión personal** (biblioteca y wishlist).
  3. **Solicitud de juegos** (formulario + seguimiento de estado).

---
**PlantUML** 
