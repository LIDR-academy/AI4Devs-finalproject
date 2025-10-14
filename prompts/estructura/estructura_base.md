# 🏗 Metaprompt: Generador de Estructura

## 🎯 Propósito
Instruir a un modelo de IA para que genere **exactamente** la estructura de carpetas, stack tecnológico y herramientas del proyecto **Genesis**, siguiendo principios de **arquitectura limpia, modularidad, escalabilidad y buenas prácticas** de desarrollo fullstack.

---

## 🧠 Configuración de Roles del Modelo

### **Rol 1 – Arquitecto de Software**
- **Objetivo:** Diseñar y validar la estructura de carpetas y modularidad.
- **Responsabilidades:**
  - Aplicar patrones como **arquitectura hexagonal** y **separación de dominios**.
  - Definir nombres consistentes para carpetas y archivos.
  - Documentar propósito de cada carpeta.
- **Entregables:**
  - Estructura `backend/`, `frontend/` y `ai-integration/` lista para usar.
  - Archivos `README.md` explicativos.

---

### **Rol 2 – DevOps Engineer**
- **Objetivo:** Configurar entornos reproducibles y despliegue.
- **Responsabilidades:**
  - Configurar contenedores con **Docker**.
  - Preparar `docker-compose.yml` para levantar backend y frontend.
  - Configurar `.env` y `.env.example`.
- **Entregables:**
  - `Dockerfile` optimizado para backend y frontend.
  - Guía `DEPLOYMENT.md` para entornos local y producción.

---

### **Rol 3 – Desarrollador Fullstack**
- **Objetivo:** Implementar backend y frontend base.
- **Responsabilidades:**
  - **Backend:** Node.js + Express + JWT + Nodemailer.
  - **Frontend:** React + Vite + TailwindCSS + PostCSS + React Router DOM.
  - Crear ejemplos funcionales:
    - Backend: controlador base
    - Frontend: página Home, Login, Router de administrador, hooks personalizados.
- **Entregables:**
  - Código ejecutable con `npm run local`.

---

### **Rol 4 – Ingeniero de Prompts**
- **Objetivo:** Crear la capa de integración de IA.
- **Responsabilidades:**
  - Carpeta `ai-integration/` con prompts y metaprompts reutilizables.
  - Organización por módulos y roles.
  - Documentación para extender fácilmente.
- **Entregables:**
  - Estructura `metaprompts/` y `services/` lista y documentada.

---

### **Rol 5 – seguridad**
- **Objetivo:** Garantizar calidad, seguridad y estándares.
- **Responsabilidades:**
  - Revisar dependencias y vulnerabilidades.
  - Aplicar convenciones (ESLint, Prettier).
  - Revisar OWASP Top 10 y seguridad de `.env`.
- **Entregables:**
  - Reporte `QUALITY_REPORT.md` con hallazgos y mejoras.

---

## 📋 Instrucciones para el Modelo

1. **Analizar el requerimiento:** Replicar exactamente la estructura, stack y herramientas de Genesis.
2. **Generar jerarquía de carpetas y archivos**, incluyendo:
   - `backend/` (API con Node.js, Express, JWT, Docker).
   - `frontend/` (SPA con React, Vite, TailwindCSS, Docker).
   - `ai-integration/` (Prompts y metaprompts organizados por módulos).
3. **Configurar stack tecnológico**:
   - Backend: `express`, `jsonwebtoken`, `nodemailer`.
   - Frontend: `react`, `react-router-dom`, `tailwindcss`, `vite`.
4. **Crear archivos de configuración listos**:
   - `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `Dockerfile`.
5. **Agregar ejemplos funcionales** para backend y frontend.
6. **Documentar cada carpeta** con propósito, dependencias y relación con el stack.
7. **Aplicar buenas prácticas**:
   - Separación por capas.
   - Variables en `.env` seguras.
   - Uso de Docker y modularidad.

---

## 📂 Estructura de Carpeta Ejemplo

```plaintext
backend/
  Dockerfile
  package.json
  src/
    index.js
    common/config/database/index.js
    common/config/swagger/index.js
    common/function/sendEmail.js
    common/middleware/apiCache.js
    common/middleware/authToken.js
    modules/genesis/domain/
    modules/genesis/infra/
    modules/main/app/index.js

frontend/
  Dockerfile
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  vite.config.js
  public/img/
  src/
    App.jsx
    index.jsx
    router.jsx
    Common/Components/
    Pages/Genesis/Components/
    Pages/Genesis/Hooks/
    Pages/Genesis/Pages/
    Pages/Home/index.jsx
    Pages/Login/index.jsx
    Pages/Main/index.jsx
    Router/RouterAdministrator.routes.jsx
    Static/css/
    Static/img/
    Static/json/

ai-integration/
  metaprompts/
    estructura/estructura_base.md
    home/home.md
    menu/menu.md
    prompts/analisis_proyecto.md
    prompts/estructura_base.md
    prompts/pipeline.md
    prompts/README.md
    prompts/modulos/login/roles/
  services/suggest-next-module.ts

## 🛠 Stack Tecnológico y Herramientas

**Backend:**
- Node.js
- Express
- JWT (jsonwebtoken)
- Nodemailer
- Docker

**Frontend:**
- React
- Vite
- TailwindCSS
- PostCSS
- React Router DOM
- Docker

**AI Integration:**
- Metaprompts estructurados
- basado en roles x modulos

---

## 💡 Técnicas de Metaprompting Utilizadas

1. **División clara de roles especializados**  
   - Asignar tareas y entregables específicos por perfil (arquitecto, devops, fullstack, etc.) para garantizar modularidad y calidad.

2. **Ejemplos de estructura explícitos**  
   - Incluir un árbol de carpetas y archivos exacto para evitar interpretaciones ambiguas.

3. **Documentación contextual por carpeta y archivo**  
   - Breve explicación de la función de cada elemento del proyecto.

4. **Checklist interno para asegurar completitud**  
   - Lista de verificación que la IA debe seguir antes de finalizar la entrega.

5. **Reutilización de prompts para módulos futuros**  
   - Metaprompts diseñados para ser escalables y adaptables.

---

## ✅ Resultado Esperado

El modelo debe entregar:

- **Estructura exacta** del proyecto Genesis.
- **Configuraciones y dependencias** instaladas y funcionales.
- **Ejemplos funcionales** en backend (API, autenticación, envío de email) y frontend (páginas base, enrutamiento).
- **Documentación y metaprompts** listos para la ampliación del proyecto.