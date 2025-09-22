# 🤝 Contribuir al Proyecto: Sistema de Gestión de Inventario y Ventas

Gracias por tu interés en contribuir a este proyecto.  
Este documento describe las reglas y buenas prácticas para colaborar de manera efectiva.

---

## 🛠️ Flujo de trabajo con Git

1. **Ramas**
   - `main`: rama estable, lista para despliegue.
   - `develop`: rama de integración de nuevas funcionalidades.
   - Feature branches:
     ```
     feature/<nombre-funcionalidad>
     ```
     Ejemplo: `feature/register-products`.

2. **Commits**
   - Usar [Conventional Commits](https://www.conventionalcommits.org/):
     - `feat:` → nueva funcionalidad.
     - `fix:` → corrección de errores.
     - `docs:` → cambios en documentación.
     - `test:` → cambios o adición de tests.
     - `refactor:` → cambios internos sin alterar funcionalidad.
   - Ejemplo:
     ```
     feat(api): agregar endpoint POST /products para registrar saldos iniciales
     ```

3. **Pull Requests**
   - Toda nueva funcionalidad debe ir acompañada de un **PR** hacia `develop`.
   - El PR debe incluir:
     - Descripción clara de los cambios.
     - Motivación de la funcionalidad.
     - Evidencias (screenshots o ejemplos de requests/responses).
     - Referencia al ticket correspondiente.

---

## 📂 Estructura de carpetas

El proyecto sigue **Clean Architecture con DDD** y **Inyección de Dependencias (DI)**.  

### Backend
```
backend/
├── Application/       # Casos de uso, servicios, handlers
├── Domain/            # Entidades, DTOs, Value Objects, interfaces
├── Infrastructure/    # EF Core, repositorios, migraciones, APIs externas
├── Presentation/      # Controllers, Program.cs
```

### Frontend
```
frontend/
├── Application/       # Casos de uso, orquestación de lógica
├── Domain/            # Entidades, DTOs, value objects
├── Infrastructure/    # API client, Redux, persistencia local
├── Presentation/      # Componentes, páginas, layouts
```

### DevOps
```
devops/
├── docker/            # Dockerfiles y docker-compose
├── ci-cd/             # Pipelines de CI/CD
└── scripts/           # Scripts de despliegue y backup
```

---

## 🔑 Buenas prácticas de desarrollo

- **Inyección de dependencias:**  
  Todas las clases y servicios deben usar DI (ej. en .NET con `IServiceCollection.AddScoped<>`, en React con contenedores/hooks).  

- **Pruebas obligatorias:**  
  - Backend: xUnit para servicios y controladores.  
  - Frontend: React Testing Library para componentes + Cypress para E2E.  

- **Reglas de estilo:**  
  - C# → convenciones de .NET.  
  - TypeScript/React → ESLint + Prettier.  

- **Documentación:**  
  - Cada nueva funcionalidad debe actualizar el `README.md` o los documentos en `/docs/`.  
  - Cada ticket debe quedar reflejado en un Pull Request.  

---

## ✅ Checklist antes de abrir un PR

- [ ] Código probado localmente.  
- [ ] Tests unitarios creados/actualizados.  
- [ ] Documentación actualizada (`README.md` o `/docs/`).  
- [ ] Sin errores de linting o compilación.  
- [ ] Commits con formato **Conventional Commits**.  

---

## 🚀 Despliegue local rápido

1. Clonar repo:
   ```bash
   git clone <url>
   cd inventario-ventas
   ```
2. Levantar entorno con Docker:
   ```bash
   docker-compose up --build
   ```
3. Acceder:
   - Frontend → http://localhost:3000  
   - Backend → http://localhost:5000  
   - DB → SQL Server en puerto 1433
