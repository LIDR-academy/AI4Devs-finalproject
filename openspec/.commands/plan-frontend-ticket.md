# Rol

Eres un arquitecto frontend experto con amplia experiencia en proyectos React aplicando mejores prácticas.

# ID del Ticket

    $ARGUMENTS

# Objetivo

Obtener un plan paso a paso para un ticket de Jira que esté listo para comenzar a implementar.

# Proceso y reglas

1. Adopta el rol de `openspecs/.agents/frontend-developer.md`
2. Si tienes instalado MCP de Jira, analiza el ticket de Jira mencionado en #ticket usando el MCP. Si la mención es un archivo local, entonces evita usar MCP
3. Propón un plan paso a paso para la parte frontend, teniendo en cuenta todo lo mencionado en el ticket y aplicando las mejores prácticas y reglas del proyecto que puedes encontrar en `openspecs/specs`.
4. Aplica las mejores prácticas de tu rol para asegurar que el desarrollador pueda ser completamente autónomo e implementar el ticket de principio a fin usando solo tu plan.
5. No escribas código todavía; proporciona solo el plan en el formato de salida definido abajo.
6. Si se te pide comenzar a implementar en algún punto, asegúrate de que lo primero que hagas sea moverte a una rama nombrada según el id del ticket (si no estás allí todavía) y seguir el proceso descrito en el comando /develop-us.md

# Formato de salida

Documento Markdown en la ruta `openspecs/changes/<feature>/[ticket_id]_frontend.md` conteniendo los detalles completos de implementación.
Sigue esta plantilla:

## Estructura de Plantilla de Plan de Implementación Frontend del Ticket

### 1. **Encabezado**

- Título: `# Plan de Implementación Frontend: [TICKET-ID] [Nombre de Funcionalidad]`

### 2. **Visión General**

- Breve descripción de la funcionalidad y principios de arquitectura frontend (arquitectura basada en componentes, capa de servicio, patrones React)

### 3. **Contexto de Arquitectura**

- Componentes/servicios involucrados
- Archivos referenciados
- Consideraciones de enrutamiento (si aplica)
- Enfoque de gestión de estado

### 4. **Pasos de Implementación**

Pasos detallados, típicamente:

#### **Paso 0: Crear Rama de Funcionalidad**

- **Acción**: Crear y cambiar a una nueva rama de funcionalidad siguiendo el flujo de trabajo de desarrollo. Verifica si existe y si no, créala
- **Nomenclatura de Rama**: Sigue la convención de nomenclatura de ramas del proyecto (`feature/[ticket-id]-frontend`, hazlo obligatorio usar esta nomenclatura, no permitas quedarse en la tarea general [ticket-id] si existe para separar preocupaciones)
- **Pasos de Implementación**:
    1. Asegura que estás en la última rama `main` o `develop` (o rama base apropiada)
    2. Obtén últimos cambios: `git pull origin [base-branch]`
    3. Crea nueva rama: `git checkout -b [branch-name]`
    4. Verifica creación de rama: `git branch`
- **Notas**: Este debe ser el PRIMER paso antes de cualquier cambio de código. Consulta la sección "Development Workflow" de `openspecs/specs/frontend-standards.mdc` para convenciones específicas de nomenclatura de ramas y reglas de flujo de trabajo.

#### **Paso N: [Nombre de Acción]**

- **Archivo**: Ruta del archivo objetivo
- **Acción**: Qué implementar
- **Firma de Función/Componente**: Firma de código
- **Pasos de Implementación**: Lista numerada
- **Dependencias**: Imports requeridos
- **Notas de Implementación**: Detalles técnicos

Pasos comunes:

- **Paso 1**: Actualizar/Crear Métodos de Servicio (comunicación con API en `src/services/`)
- **Paso 2**: Crear/Actualizar Componentes (componentes React en `src/components/`)
- **Paso 3**: Actualizar Enrutamiento (si se necesitan nuevas páginas/rutas en `src/App.js`)
- **Paso 4**: Escribir Pruebas E2E de Playwright (archivos de prueba en `playwright/e2e/`)

#### **Paso N+1: Actualizar Documentación Técnica**

- **Acción**: Revisar y actualizar documentación técnica según cambios realizados
- **Pasos de Implementación**:
    1. **Revisar Cambios**: Analizar todos los cambios de código realizados durante la implementación
    2. **Identificar Archivos de Documentación**: Determinar qué archivos de documentación necesitan actualizaciones basándose en:
        - Cambios en endpoint de API → Actualizar `openspecs/specs/api-spec.yml`
        - Patrones UI/UX o patrones de componentes → Actualizar `openspecs/specs/frontend-standards.mdc`
        - Cambios en enrutamiento → Actualizar documentación de enrutamiento
        - Nuevas dependencias o cambios de configuración → Actualizar `openspecs/specs/frontend-standards.mdc`
        - Patrones de prueba o cambios en Playwright → Actualizar documentación de pruebas
    3. **Actualizar Documentación**: Para cada archivo afectado:
        - Actualizar contenido en español (según `openspecs/specs/documentation-standards.mdc`)
        - Mantener consistencia con estructura de documentación existente
        - Asegurar formato apropiado
    4. **Verificar Documentación**:
        - Confirmar que todos los cambios están reflejados con precisión
        - Verificar que la documentación siga la estructura establecida
    5. **Reportar Actualizaciones**: Documentar qué archivos fueron actualizados y qué cambios se hicieron
- **Referencias**:
    - Seguir proceso descrito en `openspecs/specs/documentation-standards.mdc`
    - Toda la documentación debe escribirse en español
- **Notas**: Este paso es OBLIGATORIO antes de considerar la implementación completa. No omitas actualizaciones de documentación.

### 5. **Orden de Implementación**

- Lista numerada de pasos en secuencia (debe comenzar con Paso 0: Crear Rama de Funcionalidad y terminar con paso de actualización de documentación)

### 6. **Lista de Verificación de Pruebas**

- Lista de verificación de verificación post-implementación
- Cobertura de pruebas E2E de Playwright
- Verificación de funcionalidad de componentes
- Verificación de manejo de errores

### 7. **Patrones de Manejo de Errores**

- Gestión de estado de error en componentes
- Mensajes de error amigables para el usuario
- Manejo de errores de API en servicios

### 8. **Consideraciones de UI/UX** (si aplica)

- Uso de componentes Bootstrap
- Consideraciones de diseño responsivo
- Requisitos de accesibilidad
- Estados de carga y retroalimentación

### 9. **Dependencias**

- Bibliotecas y herramientas externas requeridas
- Componentes React Bootstrap usados
- Paquetes de terceros (si hay)

### 10. **Notas**

- Recordatorios importantes y restricciones
- Reglas de negocio
- Requisitos de lenguaje
- Consideraciones TypeScript vs JavaScript

### 11. **Próximos Pasos Después de Implementación**

- Tareas post-implementación (la documentación ya está cubierta en Paso N+1, pero puede incluir integración, despliegue, etc.)

### 12. **Verificación de Implementación**

- Lista de verificación final:
    - Calidad de Código
    - Funcionalidad
    - Pruebas
    - Integración
    - Actualizaciones de documentación completadas
