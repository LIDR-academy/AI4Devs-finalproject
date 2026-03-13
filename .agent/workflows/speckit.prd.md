---
description: Cargar y revisar el PRD del proyecto. Extrae User Personas y Requisitos del documento de producto y los persiste en .specify/memory/ para los pasos siguientes del proceso de desarrollo.
handoffs:
  - label: Generar User Stories
    agent: speckit.userstories
    prompt: Generar User Stories a partir del PRD cargado
    send: true
  - label: Crear Especificación de Feature
    agent: speckit.specify
    prompt: Crear especificación de feature basada en el PRD
---

## User Input

```text
$ARGUMENTS
```

Si el usuario proporciona texto o una ruta de archivo como argumento, úsalo como fuente del PRD.
Si el argumento está vacío, busca automáticamente los documentos del repositorio (ver paso 1).

## Outline

Este workflow implementa los pasos `UploadPRD()` y `ProductOwner.ReviewPRD()` del proceso
de desarrollo definido en `sudolang.sudo`.

### 1. Cargar el PRD

Intentar obtener el PRD en este orden de prioridad:

a. **Si `$ARGUMENTS` contiene una ruta de archivo**: leer ese archivo directamente.

b. **Si `$ARGUMENTS` contiene texto libre**: usar ese texto como PRD.

c. **Si `$ARGUMENTS` está vacío**: buscar automáticamente en el repositorio:
   - Leer todos los archivos `.md` de `documentacion/`
   - Leer `readme.md` en la raíz del proyecto
   - Consolidar en un único documento de contexto PRD

Registrar la fuente utilizada en el output.

### 2. Extraer User Personas

Analizar el PRD y extraer todos los perfiles de usuario identificados. Para cada persona:

```markdown
### Persona: [NOMBRE]
- **Descripción**: [Quién es, qué hace]
- **Motivación principal**: [Por qué usa el producto]
- **Frustración actual**: [Qué problema resuelve el producto para él/ella]
- **Comportamiento clave**: [Cómo interactúa con el sistema]
```

**Restricción**: Identificar mínimo 1 y máximo 5 personas. Si el PRD describe más de 5,
agrupar las similares y justificar la agrupación.

### 3. Extraer Requisitos

Extraer y clasificar todos los requisitos del PRD en dos categorías:

**Funcionales (RF)**: Lo que el sistema debe hacer.
```
RF-001: [descripción]
RF-002: [descripción]
...
```

**No Funcionales (RNF)**: Calidad, rendimiento, seguridad, escalabilidad.
```
RNF-001: [descripción]
RNF-002: [descripción]
...
```

### 4. Confirmar con el usuario

Presentar al usuario el resumen de:
- Fuente del PRD usada
- N personas identificadas
- N requisitos funcionales
- N requisitos no funcionales

Preguntar:
> ¿Confirmas esta información extraída del PRD? Responde **Sí** para continuar o **No** e
> indica qué deseas modificar.

Si el usuario responde **No**:
- Solicitar las correcciones específicas
- Aplicar los cambios mencionados
- Volver a mostrar el resumen actualizado y confirmar

### 5. Persistir en memoria

Una vez confirmado, escribir el archivo `.specify/memory/prd-context.md` con la siguiente
estructura:

```markdown
# PRD Context: [NOMBRE DEL PROYECTO]

**Fuente**: [archivo(s) o texto libre]
**Generado**: [FECHA ISO]

## User Personas

[Personas extraídas en formato del paso 2]

## Requisitos Funcionales

[Lista RF-xxx]

## Requisitos No Funcionales

[Lista RNF-xxx]
```

### 6. Reporte final

Mostrar al usuario:
- ✅ Ruta del archivo generado: `.specify/memory/prd-context.md`
- Resumen: N personas, N RF, N RNF
- Próximo paso sugerido: `/speckit.userstories` para generar User Stories por persona
