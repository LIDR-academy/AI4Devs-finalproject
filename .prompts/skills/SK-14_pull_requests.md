Actúa como un Tech Lead, Release Manager y experto en Git/DevOps. Tu objetivo es documentar de manera transparente el historial de integraciones del repositorio para la sección "7. Histórico de Pull Requests" del archivo [ARCHIVO_README_DE_ENTREGA].

Por favor, ejecuta las siguientes tareas de forma autónoma utilizando tus herramientas de lectura de archivos y ejecución de terminal:

---

### Paso 1: Inspección de Git e Inicialización de Contexto
1. Ejecuta comandos de terminal como `git log --oneline -n 15` o `git branch` para identificar las ramas de características (feature branches) y los commits lógicos reales que se han realizado en el proyecto.
2. Si el repositorio aún no cuenta con un historial de commits maduro o te encuentras en una fase inicial de documentación, analiza la estructura de carpetas físicas en `/` y contrasta el backlog del proyecto para deducir qué hitos de desarrollo lógicos deben plasmarse para cumplir con el MVP.

### Paso 2: Redacción de la Especificación de 3 Pull Requests
Genera la documentación detallada de exactamente tres (3) Pull Requests consecutivas e incrementales. Cada Pull Request debe estructurarse con la siguiente plantilla de Markdown:

#### 🔄 PR #[Número]: [Título de la PR con Semántica Conventional Commits]
- **Ramas:** `[nombre-rama-origen]` ➡️ `main` (La rama origen debe reflejar el prefijo de feature y tus iniciales de entrega, ej. feature-auth-JL).
- **Ticket Relacionado:** Enlace lógico al ID del ticket técnico del backlog (ej. RS-TK-001).
- **Descripción del Cambio:** Un resumen breve de los archivos afectados clasificados por sus capas de arquitectura (Domain, Application, Infrastructure) y la justificación técnica de la integración.
- **Quality Gates (DoD):** Lista de verificación de las validaciones de calidad obligatorias que superó este cambio (ej. TypeScript compilado sin advertencias, tests de integración pasando en verde con Snyk/npm audit y cobertura del linter).

*Nota técnica:*
- El **PR #1** debe representar la base del sistema (ej. Inicialización de infraestructura, Docker y esquemas físicos ORM).
- El **PR #2** debe representar la primera funcionalidad core (ej. Autenticación o módulo de usuarios).
- El **PR #3** debe representar la lógica de negocio avanzada del MVP (ej. Gestión de lógica de negocio o módulos prioritarios).

### Paso 3: Modificación del Archivo de Documentación
1. Lee el archivo [ARCHIVO_README_DE_ENTREGA] para comprender su estado actual.
2. Localiza la sección "7. Histórico de Pull Requests" (o el final del documento) y escribe/reemplaza el contenido con las 3 fichas detalladas generadas en el Paso 2.
3. Preserva intacto todo el resto del documento; no realices modificaciones destructivas ni elimines información de secciones previas.

---

Redacta las explicaciones manteniendo un tono profesional, directo e impecable. Deja los fragmentos de código, nombres de archivos y configuraciones técnicas en inglés para garantizar la compatibilidad con el compilador. Ejecuta los cambios directamente en el archivo y muéstrame el diff resultante.

Guarda los últimos 3 PRs en la seccion de Pull Requests del archivo: [ARCHIVO_README_DE_ENTREGA].
