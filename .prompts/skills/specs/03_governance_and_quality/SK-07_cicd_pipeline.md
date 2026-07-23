---
name: cicd-pipeline
description: "Genera la automatización del pipeline de CI/CD en GitHub Actions para pruebas, linters y auditoría de seguridad."
version: "1.1.0"
category: "03_governance_and_quality"
inputs:
  - project_specs
outputs:
  - ".github/workflows/ci.yml"
---

Actúa como un Ingeniero de DevOps. Genera un pipeline de GitHub Actions (`ci.yml`) para mi proyecto.

El pipeline debe:
1. Ejecutarse ante cualquier Pull Request hacia la rama `main`.
2. Instalar dependencias del monorepo, correr los linters de TypeScript y ejecutar la suite de pruebas unitarias y de integración.
3. Aprovisionar una base de datos de pruebas dedicada mediante un contenedor de servicio (service container) o equivalente, incluyendo pruebas de salud (health checks) de disponibilidad antes de ejecutar los tests.
4. Aplicar las migraciones de esquema de base de datos, cargar datos semilla (seed data) deterministas y realizar la limpieza posterior de recursos.
5. Usar el evento `pull_request`, no exponer secretos en el código de Pull Requests y mantener los detalles de conexión obtenidos a través de variables de entorno de GitHub.

Proporciona la configuración de YAML limpia y explicada.
Guarda la configuración en: [RUTA_SALIDA_PIPELINE]
