---
name: folder-structure
description: "Genera el árbol físico de directorios del Monorepo aplicando el Principio de Cierre Común (CCP) y Vertical Slices."
version: "1.1.0"
category: "02_architecture_design"
inputs:
  - design_doc
outputs:
  - "docs/02_architecture_design/06_folder_structure.md"
---

Basándote en los archivos: 
  - [RUTA_DEL_PRD]
  - [RUTA_DEL_DISEÑO]
  - [RUTA_DEL_DIAGRAMA]
  - [RUTA_DESCRIPCION_COMPONENTES]

Genera la estructura de carpetas de mi proyecto combinando Vertical Slicing y Arquitectura Hexagonal para un monorepo con Frontend ([TECNOLOGIAS_FRONTEND]) y Backend ([TECNOLOGIAS_BACKEND]).
Quiero que me muestres la jerarquía exacta de ficheros que herede el Principio de Cierre Común (CCP), asegurando que todo lo que cambia en conjunto para una feature viva cerca.
No utilices carpetas globales horizontales de controladores o servicios. Devuelve la estructura en formato de árbol de texto Markdown con anotaciones de lo que almacena cada directorio.

Guarda la respuesta en el archivo: [RUTA_DE_SALIDA_ESTRUCTURA]


---

## 📌 Directiva de Gobernanza Documental (Agnóstica):
- En la sección `docs/`, debes estructurar la documentación en las 5 fases cronológicas:
  `01_product_definition/`, `02_architecture_design/`, `03_governance_and_quality/`, `04_persistence_and_api/` y `05_agile_planning/`.
