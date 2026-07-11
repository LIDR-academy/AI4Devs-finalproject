Actúa como un Ingeniero de DevOps. Genera un pipeline de GitHub Actions (`ci.yml`) para mi proyecto.

El pipeline debe:
1. Ejecutarse ante cualquier Pull Request hacia la rama `main`.
2. Instalar dependencias del monorepo, correr los linters de TypeScript y ejecutar la suite de pruebas unitarias y de integración.
3. Asegurarse de no exponer secrets o variables de entorno en claro, mapeando la base de datos de pruebas a través de variables del entorno de GitHub.

Proporciona la configuración de YAML limpia y explicada.
Guarda la configuración en: [RUTA_SALIDA_PIPELINE]
