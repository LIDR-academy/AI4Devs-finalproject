# Informe de Desarrollo Backend - Sistema de Gestión Integral de Proyectos de Consultoría

## Resumen Ejecutivo

Este informe detalla las actividades de desarrollo realizadas en el backend del Sistema de Gestión Integral de Proyectos de Consultoría. El proyecto se ha implementado utilizando .NET 9.0 con una arquitectura limpia y siguiendo las mejores prácticas de desarrollo. Se han completado múltiples funcionalidades CRUD para entidades clave del sistema, así como la configuración de CI/CD para despliegue automático.

## Índice

1. [Arquitectura y Tecnologías](#1-arquitectura-y-tecnologías)
2. [Implementación de Entidades](#2-implementación-de-entidades)
3. [Pruebas Unitarias e Integración](#3-pruebas-unitarias-e-integración)
4. [Corrección de Errores](#4-corrección-de-errores)
5. [Configuración de CI/CD](#5-configuración-de-cicd)
6. [Estado Actual y Próximos Pasos](#6-estado-actual-y-próximos-pasos)

## 1. Arquitectura y Tecnologías

### 1.1 Estructura del Proyecto

El backend se ha estructurado siguiendo los principios de Arquitectura Limpia (Clean Architecture):

- **ConsultCore31.Core**: Contiene las entidades de dominio y reglas de negocio
- **ConsultCore31.Application**: Implementa la lógica de aplicación, servicios y DTOs
- **ConsultCore31.Infrastructure**: Maneja la persistencia y servicios externos
- **ConsultCore31.WebAPI**: Expone los endpoints REST y configura la aplicación
- **ConsultCore31.Tests**: Contiene pruebas unitarias y de integración

### 1.2 Tecnologías Implementadas

- **Framework**: .NET 9.0
- **ORM**: Entity Framework Core
- **Documentación API**: Scalar (reemplazo mejorado de Swagger)
- **Autenticación**: JWT
- **Validación**: FluentValidation
- **Mapeo**: AutoMapper
- **Pruebas**: xUnit, Moq, FluentAssertions
- **CI/CD**: GitHub Actions

### 1.3 Patrones de Diseño

- **Repositorio**: Para abstraer la capa de datos
- **Servicio**: Para encapsular la lógica de negocio
- **DTO (Data Transfer Object)**: Para transferencia de datos entre capas
- **Mediator**: Para desacoplar componentes (implementado con MediatR)
- **Specification Pattern**: Para consultas complejas (Ardalis.Specification)

## 2. Implementación de Entidades

### 2.1 Entidades Principales

Se ha implementado la funcionalidad CRUD completa para las siguientes entidades de alta prioridad:

#### 2.1.1 Tarea

- **DTOs**: 
  - `TareaDto` (lectura)
  - `CreateTareaDto` (creación)
  - `UpdateTareaDto` (actualización)
- **Componentes**:
  - Perfil AutoMapper (`TareaProfile`)
  - Repositorio (`ITareaRepository`, `TareaRepository`)
  - Servicio (`ITareaService`, `TareaService`)
  - Controlador (`TareasController`)
  - Pruebas unitarias (`TareaServiceTests`)
  - Pruebas de integración (`TareasControllerTests`)

#### 2.1.2 ComentarioTarea

- **DTOs**: 
  - `ComentarioTareaDto` (lectura)
  - `CreateComentarioTareaDto` (creación)
  - `UpdateComentarioTareaDto` (actualización)
- **Componentes**:
  - Perfil AutoMapper (`ComentarioTareaProfile`)
  - Repositorio (`IComentarioTareaRepository`, `ComentarioTareaRepository`)
  - Servicio (`IComentarioTareaService`, `ComentarioTareaService`)
  - Controlador (`ComentariosTareaController`)
  - Pruebas unitarias (`ComentarioTareaServiceTests`)
  - Pruebas de integración (`ComentariosTareaControllerTests`)

### 2.2 Entidades de Catálogo

Se ha implementado la funcionalidad CRUD completa para las siguientes entidades de catálogo:

#### 2.2.1 Entidades de Gestión de Proyectos

- **EstadoTarea**
- **EstadoProyecto**
- **EstadoEtapa**
- **PrioridadTarea**
- **TipoProyecto**
- **TipoDocumento**
- **TipoKPI**
- **FrecuenciaMedicion**
- **EstadoAprobacion**

#### 2.2.2 Entidades Financieras y Organizativas

- **Moneda**
- **TipoMovimientoViatico**
- **Puesto**
- **Cliente**
- **Empleado**

### 2.3 Detalles de Implementación

Para cada entidad se ha seguido el mismo patrón de implementación:

1. **Definición de DTOs**:
   - DTO de lectura con todas las propiedades necesarias
   - DTO de creación con validaciones
   - DTO de actualización con validaciones e ID

2. **Mapeo con AutoMapper**:
   - Configuración de mapeos bidireccionales
   - Manejo de propiedades calculadas cuando es necesario

3. **Implementación de Repositorios**:
   - Interfaz que extiende `IGenericRepository<TEntity, TKey>`
   - Implementación que extiende `GenericRepository<TEntity, TKey>`
   - Métodos específicos para consultas complejas

4. **Implementación de Servicios**:
   - Interfaz que extiende `IGenericService<TDto, TCreateDto, TUpdateDto, TKey>`
   - Implementación que extiende `GenericService<TDto, TCreateDto, TUpdateDto, TKey>`
   - Lógica de negocio específica

5. **Implementación de Controladores**:
   - Controlador que extiende `BaseApiController`
   - Endpoints RESTful estándar (GET, POST, PUT, DELETE)
   - Documentación con atributos XML

6. **Registro de Dependencias**:
   - Configuración en `ApplicationServiceCollectionExtensions`
   - Configuración en `RepositoryServiceCollectionExtensions`

## 3. Pruebas Unitarias e Integración

### 3.1 Pruebas Unitarias

Se han implementado pruebas unitarias para todos los servicios, cubriendo:

- Obtención de todas las entidades
- Obtención por ID (existente e inexistente)
- Creación con datos válidos
- Actualización (ID válido, no coincidente, inexistente)
- Eliminación (ID existente e inexistente)
- Verificación de existencia

### 3.2 Pruebas de Integración

Se han implementado pruebas de integración para todos los controladores, cubriendo:

- Obtención de todas las entidades (retorna OK)
- Obtención por ID (retorna OK o NotFound)
- Creación con datos válidos (retorna Created)
- Actualización (retorna NoContent o NotFound)
- Eliminación (retorna NoContent o NotFound)
- Manejo de errores de validación (retorna BadRequest)

### 3.3 Cobertura de Pruebas

Las pruebas implementadas aseguran una cobertura adecuada de:

- Flujos exitosos (happy path)
- Manejo de errores y excepciones
- Validación de datos
- Comportamiento de la API

## 4. Corrección de Errores

### 4.1 Errores en Pruebas

Se han corregido múltiples errores en el proyecto de pruebas `ConsultCore31.Tests`:

#### 4.1.1 Correcciones en Controladores de Prueba

- **EstadosProyectoControllerTests**:
  - Corrección del mock para que `UpdateAsync` devuelva `false` en lugar de lanzar excepción
  - Ajuste de pruebas para verificar `NotFoundObjectResult`

- **PuestosControllerTests**:
  - Eliminación de referencias a la propiedad inexistente `Nivel`

- **PrioridadesTareaControllerTests**:
  - Cambio de referencias de `Activo` a `Activa`

- **EtapasProyectoControllerTests**:
  - Corrección de errores relacionados con árboles de expresión con argumentos opcionales
  - Adición explícita del parámetro `CancellationToken`

- **ComentariosTareaControllerTests**:
  - Adición explícita del parámetro `CancellationToken`

- **EmpleadosControllerTests**:
  - Adición explícita del parámetro `CancellationToken`

#### 4.1.2 Correcciones en Servicios de Prueba

- **EstadoProyectoServiceTests**:
  - Mantenimiento de referencias a `Activo` (no cambio a `Activa`)
  - Corrección de la configuración del mock para `UpdateAsync`

- **PrioridadTareaServiceTests**:
  - Cambio de referencias de `Activo` a `Activa`

- **TipoMovimientoViaticoServiceTests**:
  - Reemplazo de referencias a `CreatedAt` por `FechaCreacion`
  - Reemplazo de referencias a `EsEntrada` por `Afectacion`

- **EstadoAprobacionServiceTests**:
  - Reemplazo de referencias a `CreatedAt` por `FechaCreacion`

### 4.2 Correcciones en Implementación

- **Actualización de Servicios**:
  - Actualización de todos los servicios de entidades catálogo para cumplir con el nuevo patrón de servicio genérico con 4 parámetros de tipo en lugar de 5
  - Implementación explícita de todos los métodos CRUD
  - Mejora en el manejo de errores y registro de actividad

## 5. Configuración de CI/CD

### 5.1 Implementación Inicial

Inicialmente, se configuró un workflow de GitHub Actions para CI/CD con los siguientes pasos:

1. **Build**:
   - Checkout del código fuente
   - Configuración de .NET 9.0
   - Restauración de dependencias
   - Compilación del proyecto
   - Ejecución de pruebas
   - Publicación de artefactos

2. **Deploy (Web Deploy)**:
   - Descarga de artefactos de build
   - Despliegue a IIS mediante la acción `ChristopheLav/iis-deploy@v1`

### 5.2 Problemas Encontrados

Se encontraron varios problemas con el enfoque inicial:

1. **Errores en la acción de terceros**:
   - Parámetros incorrectos o incompatibles
   - Fallos en la ejecución

2. **Script PowerShell personalizado**:
   - Se implementó un script PowerShell para invocar MSDeploy directamente
   - Problemas con rutas y ejecución en el entorno de GitHub Actions

3. **Problemas de conectividad**:
   - El servidor no permitía conexiones Web Deploy en el puerto 8172
   - El servicio Web Management Service (WMSvc) presentaba inestabilidad

### 5.3 Solución Final: Despliegue FTP

Debido a los problemas persistentes con Web Deploy, se implementó una solución basada en FTP:

1. **Configuración de FTPS**:
   - Uso de la acción `SamKirkland/FTP-Deploy-Action@v4.3.4`
   - Configuración de protocolo FTPS (el servidor requiere SSL)
   - Ajuste de parámetros de seguridad y timeout

2. **Optimizaciones**:
   - Exclusión de carpetas problemáticas como `runtimes/`
   - Aumento del timeout para transferencias grandes
   - Configuración de nivel de log detallado

3. **Seguridad**:
   - Almacenamiento de credenciales en secretos de GitHub
   - Uso de FTPS para cifrar la comunicación

### 5.4 Configuración Final del Workflow

```yaml
name: Build and Deploy to IIS

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configurar .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '9.0.x'
    
    - name: Restaurar dependencias
      run: dotnet restore Backend/ConsultCore31.sln
    
    - name: Compilar
      run: dotnet build Backend/ConsultCore31.sln --configuration Release --no-restore
    
    - name: Ejecutar pruebas
      run: dotnet test Backend/ConsultCore31.sln --configuration Release --no-build
    
    - name: Publicar
      run: dotnet publish Backend/src/ConsultCore31.WebAPI/ConsultCore31.WebAPI.csproj -c Release -o publish
    
    - name: Comprimir artefactos
      uses: actions/upload-artifact@v3
      with:
        name: webapp
        path: publish/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    
    steps:
    - name: Descargar artefactos
      uses: actions/download-artifact@v3
      with:
        name: webapp
        path: ${{github.workspace}}/publish/
    
    - name: Desplegar usando FTP
      uses: SamKirkland/FTP-Deploy-Action@v4.3.4
      with:
        server: ${{ secrets.FTP_SERVER }}
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        local-dir: ${{github.workspace}}/publish/
        server-dir: ${{ secrets.FTP_TARGET_PATH }}/
        protocol: ftps
        port: 21
        security: loose
        timeout: 600000
        log-level: verbose
        dangerous-clean-slate: false
        state-name: .ftp-deploy-sync-state.json
        dry-run: false
        exclude: |
          **/.git*
          **/.git*/**
          **/node_modules/**
          **/.vs/**
          **/obj/**
          runtimes/**
```

## 6. Estado Actual y Próximos Pasos

### 6.1 Estado Actual

- **Entidades Implementadas**: 16 entidades con CRUD completo
- **Pruebas**: Unitarias e integración para todas las entidades
- **Despliegue**: CI/CD funcional con GitHub Actions y FTPS
- **Documentación API**: Implementada con Scalar

### 6.2 Próximos Pasos

#### 6.2.1 Desarrollo Backend

- Implementación de relaciones complejas entre entidades
- Desarrollo de endpoints para operaciones específicas de negocio
- Implementación de búsqueda avanzada y filtrado
- Optimización de consultas para mejor rendimiento

#### 6.2.2 Seguridad

- Implementación completa de autenticación y autorización
- Configuración de roles y permisos
- Auditoría de operaciones críticas

#### 6.2.3 Integración

- Desarrollo de API para integración con sistemas externos
- Implementación de webhooks para notificaciones

#### 6.2.4 Frontend

- Desarrollo de la interfaz de usuario con VueJS/Nuxt
- Integración con la API backend
- Implementación de características de UX avanzadas

## Conclusión

El desarrollo del backend del Sistema de Gestión Integral de Proyectos de Consultoría ha avanzado significativamente. Se ha implementado una arquitectura robusta y escalable, con funcionalidades CRUD completas para las entidades principales del sistema. La configuración de CI/CD asegura un despliegue automático y confiable.

Los próximos pasos se centrarán en ampliar las funcionalidades específicas de negocio, mejorar la seguridad e integración, y desarrollar el frontend para proporcionar una experiencia de usuario completa y satisfactoria.

---

*Informe preparado por: Miguel Rico Rios*  
*Fecha: 3 de junio de 2025*
