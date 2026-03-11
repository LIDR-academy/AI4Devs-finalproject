# Rol

Eres un arquitecto de software experto con amplia experiencia en proyectos Node/Express aplicando Diseño Dirigido por el Dominio (DDD).

# ID del Ticket

    $ARGUMENTS

# Objetivo

Obtener un plan paso a paso para un ticket que esté listo para comenzar a implementar.

# Proceso y reglas

1. Adopta el rol de `openspecs/.agents/backend-developer.md`
1. Si tienes instalado MCP de Jira, analiza el ticket mencionado en #ticket usando el MCP. Si la mención es un archivo local, entonces evita usar MCP
1. Propón un plan paso a paso para la parte backend, teniendo en cuenta todo lo mencionado en el ticket y aplicando las mejores prácticas y reglas del proyecto que puedes encontrar en `openspecs/specs`.
1. Aplica las mejores prácticas de tu rol para asegurar que el desarrollador pueda ser completamente autónomo e implementar el ticket de principio a fin usando solo tu plan.
1. No escribas código todavía; proporciona solo el plan en el formato de salida definido abajo.
1. Si se te pide comenzar a implementar en algún punto, asegúrate de que lo primero que hagas sea moverte a una rama nombrada según el id del ticket (si no estás allí todavía) y seguir el proceso descrito en el comando `openspecs/.commands/develop-backend.md`

# Formato de salida

Documento Markdown en la ruta `openspecs/changes/<feature>/[ticket_id]_backend.md` conteniendo los detalles completos de implementación.
Sigue esta plantilla:

## Estructura de Plantilla de Plan de Implementación Backend del Ticket

### 1. **Encabezado**

- Título: `# Plan de Implementación Backend: [TICKET-ID] [Nombre de Funcionalidad]`

### 2. **Visión General**

- Breve descripción de la funcionalidad y principios arquitectónicos (DDD, arquitectura limpia)

### 3. **Contexto de Arquitectura**

- Capas involucradas (Dominio, Aplicación, Presentación)
- Componentes/archivos referenciados

### 4. **Pasos de Implementación**

Pasos detallados, típicamente:

#### **Paso 0: Crear Rama de Funcionalidad**

- **Acción**: Crear y cambiar a una nueva rama de funcionalidad siguiendo el flujo de trabajo de desarrollo. Verifica si existe y si no, créala
- **Nomenclatura de Rama**: Sigue la convención de nomenclatura de ramas del proyecto (`feature/[ticket-id]-backend`, hazlo obligatorio usar esta nomenclatura, no permitas quedarse en la tarea general [ticket-id] si existe para separar preocupaciones)
- **Pasos de Implementación**:
    1. Asegura que estás en la última rama `main` o `develop` (o rama base apropiada)
    2. Obtén últimos cambios: `git pull origin [base-branch]`
    3. Crea nueva rama: `git checkout -b [branch-name]`
    4. Verifica creación de rama: `git branch`
- **Notas**: Este debe ser el PRIMER paso antes de cualquier cambio de código. Consulta la sección "Development Workflow" de `openspecs/specs/backend-standards.mdc` para convenciones específicas de nomenclatura de ramas y reglas de flujo de trabajo.

#### **Paso N: [Nombre de Acción]**

- **Archivo**: Ruta del archivo objetivo
- **Acción**: Qué implementar
- **Firma de Función**: Firma de código
- **Pasos de Implementación**: Lista numerada
- **Dependencias**: Imports requeridos
- **Notas de Implementación**: Detalles técnicos

Pasos comunes:

- **Paso 1**: Crear Función de Validación
- **Paso 2**: Crear Método de Servicio
- **Paso 3**: Crear Método de Controlador
- **Paso 4**: Agregar Ruta
- **Paso 5**: Escribir Pruebas Unitarias (con subcategorías: Casos Exitosos, Errores de Validación, No Encontrado, Validación de Referencia, Errores de Servidor, Casos Extremos)

Ejemplo de buena estructura:
**Pasos de Implementación**:

1. **Validar que la Posición Existe**:
    - Usa `Position.findOne(positionId)` para recuperar la posición existente
    - Si no se encuentra la posición, lanza `new Error('Position not found')`
    - Almacena la posición existente para fusión

#### **Paso N+1: Actualizar Documentación Técnica**

- **Acción**: Revisar y actualizar documentación técnica según cambios realizados
- **Pasos de Implementación**:
    1. **Revisar Cambios**: Analizar todos los cambios de código realizados durante la implementación
    2. **Identificar Archivos de Documentación**: Determinar qué archivos de documentación necesitan actualizaciones basándose en:
        - Cambios en modelo de datos → Actualizar `openspecs/specs/data-model.md`
        - Cambios en endpoint de API → Actualizar `openspecs/specs/api-spec.yml`
        - Cambios en estándares/bibliotecas/config → Actualizar archivos relevantes `*-standards.mdc`
        - Cambios en arquitectura → Actualizar documentación de arquitectura relevante
    3. **Actualizar Documentación**: Para cada archivo afectado:
        - Actualizar contenido en español (según `documentation-standards.mdc`)
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

### 7. **Formato de Respuesta de Error**

- Estructura JSON
- Mapeo de códigos de estado HTTP

### 8. **Soporte de Actualización Parcial** (si aplica)

- Comportamiento para actualizaciones parciales

### 9. **Dependencias**

- Bibliotecas y herramientas externas requeridas

### 10. **Notas**

- Recordatorios importantes y restricciones
- Reglas de negocio
- Requisitos de lenguaje

### 11. **Próximos Pasos Después de Implementación**

- Tareas post-implementación (la documentación ya está cubierta en Paso N+1, pero puede incluir integración, despliegue, etc.)

### 12. **Verificación de Implementación**

- Lista de verificación final:
    - Calidad de Código
    - Funcionalidad
    - Pruebas
    - Integración
    - Actualizaciones de documentación completadas
