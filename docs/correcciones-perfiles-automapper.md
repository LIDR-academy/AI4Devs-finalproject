# Correcciones en Perfiles AutoMapper

## Resumen de Correcciones

Se han corregido varios errores de compilación en los perfiles de mapeo de AutoMapper que impedían la compilación correcta del proyecto. Los principales problemas estaban relacionados con nombres incorrectos de propiedades en las entidades y referencias a propiedades inexistentes.

## Detalles de las Correcciones

### 1. Perfiles de Mapeo

#### ComentarioTareaProfile.cs
- Se agregó el espacio de nombres `System` para resolver el error con `DateTime.UtcNow`
- Se corrigió la referencia a las propiedades del usuario de `Nombre` y `Apellidos` a `UserName` y `UsuarioApellidos`
- Se eliminaron referencias a propiedades inexistentes como `CreadoPor`, `CreadoPorId`, `ModificadoPor` y `ModificadoPorId`

```csharp
// Antes
.ForMember(dest => dest.UsuarioNombre, opt => opt.MapFrom(src => src.Usuario != null ? $"{src.Usuario.Nombre} {src.Usuario.Apellidos}" : null))

// Después
.ForMember(dest => dest.UsuarioNombre, opt => opt.MapFrom(src => src.Usuario != null ? $"{src.Usuario.UserName} {src.Usuario.UsuarioApellidos}" : null))
```

#### EstadoEtapaProfile.cs
- Se corrigieron las propiedades incorrectas `CreatedAt` y `UpdatedAt` por `FechaCreacion` y `FechaModificacion`

```csharp
// Antes
.ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.CreatedAt))
.ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.UpdatedAt));

// Después
.ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
.ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));
```

#### FrecuenciaMedicionProfile.cs
- Se corrigieron las propiedades incorrectas `CreatedAt` y `UpdatedAt` por `FechaCreacion` y `FechaModificacion`

```csharp
// Antes
.ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.CreatedAt))
.ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.UpdatedAt));

// Después
.ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
.ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));
```

#### EstadoAprobacionProfile.cs
- Se corrigieron las propiedades incorrectas `CreatedAt` y `UpdatedAt` por `FechaCreacion` y `FechaModificacion`

```csharp
// Antes
.ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.CreatedAt))
.ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.UpdatedAt));

// Después
.ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.FechaCreacion))
.ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.FechaModificacion));
```

#### MappingProfile.cs
- Se verificó que la clase base `Entity` realmente usa `CreatedAt` y `UpdatedAt`, por lo que se mantuvo el mapeo correcto

```csharp
// Correcto
.ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => src.CreatedAt))
.ForMember(dest => dest.FechaModificacion, opt => opt.MapFrom(src => src.UpdatedAt));
```

### 2. Pruebas Unitarias

#### EstadoEtapaServiceTests.cs
- Se corrigieron las referencias a `CreatedAt` por `FechaCreacion` en las pruebas unitarias

```csharp
// Antes
new EstadoEtapa { Id = 1, Nombre = "Planificación", Descripcion = "Etapa de planificación", CreatedAt = DateTime.UtcNow }

// Después
new EstadoEtapa { Id = 1, Nombre = "Planificación", Descripcion = "Etapa de planificación", FechaCreacion = DateTime.UtcNow }
```

#### TipoDocumentoServiceTests.cs
- Se corrigieron las referencias a `CreatedAt` por `FechaCreacion` en las pruebas unitarias

```csharp
// Antes
new TipoDocumento { Id = 1, Nombre = "Factura", Descripcion = "Factura comercial", CreatedAt = DateTime.UtcNow }

// Después
new TipoDocumento { Id = 1, Nombre = "Factura", Descripcion = "Factura comercial", FechaCreacion = DateTime.UtcNow }
```

#### TiposMovimientoViaticoControllerTests.cs
- Se corrigieron las referencias a `EsEntrada` por `Afectacion` en las pruebas unitarias
- Se cambiaron los valores booleanos `true` por `1` y `false` por `-1`

```csharp
// Antes
new TipoMovimientoViaticoDto { Id = 1, Nombre = "Anticipo", Descripcion = "Anticipo de viáticos", EsEntrada = true, FechaCreacion = DateTime.UtcNow }

// Después
new TipoMovimientoViaticoDto { Id = 1, Nombre = "Anticipo", Descripcion = "Anticipo de viáticos", Afectacion = 1, FechaCreacion = DateTime.UtcNow }
```

## Análisis de la Estructura de Entidades

Para resolver estos problemas, fue necesario analizar la estructura de las clases:

- **Entity**: Clase base que tiene propiedades `CreatedAt` y `UpdatedAt`
- **BaseEntity<TKey>**: Clase base que tiene propiedades `FechaCreacion` y `FechaModificacion`
- **ComentarioTarea**: Hereda de `BaseEntity<int>` y no tiene propiedades `CreadoPor` o `ModificadoPor`
- **Usuario**: Tiene propiedades `UserName` y `UsuarioApellidos` en lugar de `Nombre` y `Apellidos`

## Lecciones Aprendidas

1. Es importante mantener la consistencia en la nomenclatura de propiedades entre entidades relacionadas
2. Se debe verificar la clase base de la que hereda cada entidad para usar las propiedades correctas
3. Los perfiles de AutoMapper deben revisarse cuidadosamente para asegurar que mapean propiedades existentes
4. Las pruebas unitarias deben actualizarse cuando se modifican los nombres de propiedades en las entidades

## Recomendaciones

1. Seguir el estándar de nomenclatura definido en el documento `estandar-nomenclatura-entidades.md`
2. Realizar revisiones de código enfocadas en la consistencia de nombres de propiedades
3. Documentar claramente la estructura de clases base y sus propiedades
4. Implementar pruebas automatizadas que verifiquen la existencia de propiedades mapeadas
