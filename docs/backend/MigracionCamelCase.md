# Documentación de Migración a CamelCase

## Resumen

Este documento detalla el proceso de migración de los nombres de tablas en la base de datos de formato snake_case o minúsculas a formato CamelCase, realizado el 31 de mayo de 2025.

## Objetivo

El objetivo principal de esta migración fue estandarizar los nombres de las tablas en la base de datos para seguir la convención de nomenclatura CamelCase, manteniendo la coherencia con las entidades definidas en el código y mejorando la mantenibilidad del sistema.

## Cambios Realizados

### 1. Actualización de Nombres de Tablas

Se actualizaron los siguientes nombres de tablas en la base de datos:

| Nombre Anterior | Nombre Nuevo |
|-----------------|--------------|
| accesos | Accesos |
| categorias_gasto | CategoriasGasto |
| estados_aprobacion | EstadosAprobacion |
| estados_etapa | EstadosEtapa |
| estados_proyecto | EstadosProyecto |
| estados_tarea | EstadosTarea |
| frecuencias_medicion | FrecuenciasMedicion |
| menus | Menus |
| monedas | Monedas |
| objetos | Objetos |
| objetoTipos | ObjetosTipo |
| perfiles | Perfiles |
| prioridades_tarea | PrioridadesTarea |
| proyectos | Proyectos |
| refresh_tokens | RefreshTokens |
| tipos_documento | TiposDocumento |
| tipos_kpi | TiposKPI |
| tipos_movimiento_viatico | TiposMovimientoViatico |
| tipos_proyecto | TiposProyecto |
| usuarioTokens | UsuarioTokens |

### 2. Actualización de Atributos de Entidades

Se verificó y actualizó el atributo `[Table]` en todas las entidades para asegurar que coincidan con los nuevos nombres de tablas en la base de datos. Cada entidad ahora tiene el atributo `[Table]` con el formato correcto:

```csharp
[Table("NombreTabla", Schema = "dbo")]
```

## Herramientas Utilizadas

Para realizar esta migración, se desarrollaron las siguientes herramientas:

1. **MigracionSQL**: Herramienta para ejecutar scripts SQL que renombran las tablas en la base de datos.
2. **VerificadorTablas**: Herramienta para verificar que todas las tablas en la base de datos tienen el formato CamelCase correcto.
3. **PruebasIntegracion**: Herramienta para verificar que todas las entidades pueden acceder correctamente a las tablas con los nuevos nombres.

## Consideraciones Importantes

1. **Compatibilidad con Código Existente**: 
   - Las entidades ya estaban configuradas correctamente con atributos `[Column]` que especifican los nombres de columnas, por lo que no fue necesario modificar estos atributos.
   - El contexto de base de datos (`AppDbContext`) ya estaba configurado correctamente para trabajar con los nuevos nombres de tablas.

2. **Migraciones de Entity Framework**:
   - No se encontraron migraciones de Entity Framework Core en el proyecto, por lo que no fue necesario actualizar ningún archivo de migración.
   - El proyecto utiliza un enfoque de "Code First" pero con scripts SQL personalizados para la creación y actualización de la base de datos.

3. **Impacto en la Aplicación**:
   - Esta migración no afecta la funcionalidad de la aplicación, ya que solo cambia los nombres de las tablas en la base de datos, manteniendo la estructura y los datos intactos.
   - Las pruebas de integración confirman que la aplicación puede acceder correctamente a las tablas con los nuevos nombres.

## Pasos para Futuras Migraciones

Si se necesitan realizar cambios similares en el futuro, se recomienda seguir estos pasos:

1. Verificar el estado actual de las tablas en la base de datos.
2. Crear un script SQL para realizar los cambios necesarios.
3. Ejecutar el script en un entorno de prueba para verificar que los cambios funcionan correctamente.
4. Actualizar las entidades en el código para reflejar los cambios en la base de datos.
5. Ejecutar pruebas de integración para verificar que la aplicación funciona correctamente con los cambios.
6. Documentar los cambios realizados.

## Conclusión

La migración a nombres de tablas en formato CamelCase se completó exitosamente. Todas las tablas en la base de datos ahora siguen la convención de nomenclatura CamelCase, y todas las entidades en el código están correctamente configuradas para trabajar con los nuevos nombres de tablas.

Esta migración mejora la coherencia y mantenibilidad del sistema, facilitando el desarrollo y la depuración de problemas relacionados con la base de datos.
