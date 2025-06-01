# Estándar de Nomenclatura para Entidades

## Objetivo
Establecer un estándar claro para la nomenclatura de propiedades en las entidades del proyecto para evitar inconsistencias y facilitar el mantenimiento.

## Clases Base

### Entity
La clase base `Entity` contiene las siguientes propiedades:
- `Id` (int): Identificador único de la entidad
- `CreatedAt` (DateTime): Fecha de creación
- `UpdatedAt` (DateTime): Fecha de última actualización

### BaseEntity<TKey>
La clase base `BaseEntity<TKey>` contiene las siguientes propiedades:
- `Id` (TKey): Identificador único de la entidad
- `FechaCreacion` (DateTime): Fecha de creación
- `FechaModificacion` (DateTime): Fecha de última actualización
- `Activo` (bool): Indica si el registro está activo

## Reglas Generales

1. **Consistencia con la clase base**: 
   - Si la entidad hereda de `Entity`, usar `CreatedAt` y `UpdatedAt` para fechas
   - Si la entidad hereda de `BaseEntity<TKey>`, usar `FechaCreacion` y `FechaModificacion` para fechas

2. **Nombres de propiedades**:
   - Usar PascalCase para todas las propiedades
   - Nombres en español para propiedades de negocio
   - Evitar abreviaturas a menos que sean estándar en el dominio

3. **Propiedades de navegación**:
   - Para relaciones uno a muchos: `Entidad` (singular) y `Entidades` (plural)
   - Para relaciones muchos a muchos: `EntidadesRelacionadas`

4. **Propiedades de usuario**:
   - `UserName`: Nombre de usuario
   - `UsuarioApellidos`: Apellidos del usuario
   - No usar `Nombre` ni `Apellidos` para usuarios

5. **Claves foráneas**:
   - Formato: `EntidadId` (por ejemplo, `UsuarioId`, `TareaId`)
   - Para relaciones opcionales, marcar como nullable: `EntidadId?`

## Mapeo con AutoMapper

1. **Perfiles de mapeo**:
   - Crear un perfil específico por entidad
   - Nombrar como `[Entidad]Profile`
   - Incluir mapeos para todas las operaciones (lectura, creación, actualización)

2. **Mapeo de fechas**:
   - Asegurarse de mapear correctamente según la clase base:
     - `Entity`: `CreatedAt` → `FechaCreacion` (en DTO)
     - `BaseEntity<TKey>`: `FechaCreacion` → `FechaCreacion` (en DTO)

3. **Propiedades calculadas**:
   - Definir explícitamente en el perfil de mapeo
   - Documentar con comentarios el cálculo realizado

## Convenciones para DTOs

1. **Nomenclatura**:
   - `[Entidad]Dto`: Para lectura
   - `Create[Entidad]Dto`: Para creación
   - `Update[Entidad]Dto`: Para actualización

2. **Propiedades de fechas en DTOs**:
   - Siempre usar `FechaCreacion` y `FechaModificacion` independientemente de la clase base

3. **Validaciones**:
   - Incluir atributos de validación en los DTOs
   - Documentar con comentarios XML

## Implementación y Verificación

1. **Revisión de código**:
   - Verificar la adherencia a este estándar en las revisiones de código
   - Corregir inconsistencias antes de la integración

2. **Pruebas**:
   - Asegurar que las pruebas reflejen correctamente los nombres de propiedades
   - Actualizar pruebas cuando se modifiquen nombres de propiedades

3. **Documentación**:
   - Mantener este documento actualizado con cualquier cambio en las convenciones
   - Referenciar este documento en la documentación del proyecto
