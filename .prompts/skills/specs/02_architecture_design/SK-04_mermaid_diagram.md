---
name: mermaid-diagram
description: "Genera diagramas de contenedores C4 lógicos y físicos utilizando sintaxis válida de Mermaid."
version: "1.1.0"
category: "02_architecture_design"
inputs:
  - prd_doc
  - design_doc
outputs:
  - "docs/02_architecture_design/04_architecture_diagram.md"
---

Actúa como un Senior Systems Architect experto en el Modelo C4 y Diagramas como Código (DaC). Tu objetivo es generar un diagrama de contenedores de Nivel 2 (Modelo C4) en formato Mermaid para documentar de forma visual la arquitectura física y lógica del sistema [NOMBRE_DEL_SISTEMA].

Analiza minuciosamente los archivos de especificación técnica del proyecto (principalmente '[RUTA_DEL_PRD]' y '[RUTA_DEL_DISEÑO]') para extraer el contexto del sistema, las tecnologías y las fronteras de red. Genera el código Mermaid aplicando con máximo rigor las siguientes directrices:

1. El diagrama debe estructurarse utilizando subgrafos (subgraphs) bien definidos para separar físicamente las capas:
   - Capa de Presentación (Frontend): Debe agrupar los componentes de cliente ([TECNOLOGIAS_FRONTEND]) y los roles de usuario que interactúan con ellos ([ROLES_USUARIO]).
   - Capa de Procesamiento (Backend): Debe ilustrar la API REST ([TECNOLOGIAS_BACKEND]), el Core de Dominio puro (inmutable, agnóstico y estructurado por Vertical Slices) y el adaptador de persistencia (ORM/Driver).
   - Capa de Persistencia: Representada por la base de datos ([TECNOLOGIA_BASE_DATOS]).

2. Todos los flujos de datos e interacciones entre componentes deben estar explícitamente etiquetados indicando:
   - La acción de negocio (ej. registrar datos, autorizar transacciones).
   - El protocolo de comunicación y formato de intercambio (ej. HTTPS, REST JSON).
   - El mecanismo de seguridad y firma aplicable (ej. autenticación por JWT, PIN, etc.).

3. Asegura el cumplimiento de la Arquitectura Hexagonal en el flujo del backend: la API de entrada/controlador invoca y orquesta los Casos de Uso, el Core de Dominio define las interfaces (puertos) de base de datos, y el ORM/Driver actúa como adaptador de infraestructura.

4. Aplica clases de estilo personalizadas de Mermaid (classDef) para que el diagrama sea visualmente pulido y profesional, distinguiendo con colores y bordes claros a las Personas (roles de usuario), los Contenedores de software y la Base de Datos.

Genera únicamente el bloque de código Mermaid compatible con renderizado nativo en GitHub Markdown, comenzando directamente con la etiqueta ```mermaid sin preámbulos conversacionales.

Guarda la respuesta en el archivo: [RUTA_DE_SALIDA_DIAGRAMA]
