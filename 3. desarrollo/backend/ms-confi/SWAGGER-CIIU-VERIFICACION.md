# ✅ Verificación Swagger - Módulo CIIU

**Fecha**: 2025-01-28  
**Estado**: Swagger Completamente Configurado ✅

---

## 📋 Configuración Swagger

### Configuración Global (`main.ts`)

```typescript
const config = new DocumentBuilder()
  .setTitle(GeneralConstant.appName)
  .setDescription(GeneralConstant.appDescription)
  .setVersion(GeneralConstant.appVersion)
  .addTag(GeneralConstant.appAbr)
  .build();
SwaggerModule.setup('doc', app, documentFactory);
```

- **Ruta Swagger**: `http://localhost:3000/doc`
- **Base URL API**: `/api/v1`

---

## ✅ Endpoints Documentados en Swagger

### Tag: `ciiu`

Todos los endpoints están agrupados bajo el tag `ciiu` usando `@ApiTags('ciiu')`.

### 1. Búsqueda y Selector

#### `GET /api/v1/ciiu/actividades/search`
- **Descripción**: Buscar actividades económicas (autocomplete)
- **Query Params**:
  - `query` (string, required): Texto de búsqueda (mínimo 3 caracteres)
  - `limit` (number, optional): Número máximo de resultados (máximo 50, por defecto 20)
- **Response**: `ApiResponses<ActividadCompletaEntity>`
- **Swagger**: ✅ Completamente documentado

#### `GET /api/v1/ciiu/actividades/:id/completa`
- **Descripción**: Obtener actividad con jerarquía completa
- **Path Params**: `id` (number)
- **Response**: `ApiResponse<ActividadCompletaEntity>`
- **Swagger**: ✅ Completamente documentado

#### `GET /api/v1/ciiu/actividades/codigo/:codigo`
- **Descripción**: Obtener actividad por código CIIU
- **Path Params**: `codigo` (string)
- **Response**: `ApiResponse<ActividadCompletaEntity>`
- **Swagger**: ✅ Completamente documentado

### 2. Árbol Jerárquico

#### `GET /api/v1/ciiu/arbol`
- **Descripción**: Obtener estructura de árbol completa
- **Response**: `ApiResponses<ArbolCiiuEntity>`
- **Swagger**: ✅ Completamente documentado

#### `GET /api/v1/ciiu/arbol/:nivel/:parentId/hijos`
- **Descripción**: Obtener hijos de un nodo específico
- **Path Params**: 
  - `nivel` (number): Nivel del nodo (1-6)
  - `parentId` (number): ID del nodo padre
- **Response**: `ApiResponses<ArbolCiiuEntity>`
- **Swagger**: ✅ Completamente documentado

### 3. CRUD Secciones

#### `GET /api/v1/ciiu/secciones`
- **Descripción**: Listar todas las secciones
- **Response**: `ApiResponses<SeccionEntity>`
- **Swagger**: ✅ Completamente documentado

#### `GET /api/v1/ciiu/secciones/:id`
- **Descripción**: Obtener una sección por ID
- **Path Params**: `id` (number)
- **Response**: `ApiResponse<SeccionEntity>`
- **Swagger**: ✅ Completamente documentado

#### `POST /api/v1/ciiu/secciones`
- **Descripción**: Crear una nueva sección
- **Body**: `CreateSeccionRequestDto`
- **Response**: `ApiResponse<SeccionEntity>`
- **Swagger**: ✅ Completamente documentado con `@ApiBody`

#### `PUT /api/v1/ciiu/secciones/:id`
- **Descripción**: Actualizar una sección
- **Path Params**: `id` (number)
- **Body**: `UpdateSeccionRequestDto`
- **Response**: `ApiResponse<SeccionEntity>`
- **Swagger**: ✅ Completamente documentado

#### `DELETE /api/v1/ciiu/secciones/:id`
- **Descripción**: Eliminar una sección (soft delete)
- **Path Params**: `id` (number)
- **Response**: `ApiResponse<SeccionEntity>`
- **Swagger**: ✅ Completamente documentado

### 4. CRUD Actividades

#### `GET /api/v1/ciiu/actividades`
- **Descripción**: Listar todas las actividades
- **Response**: `ApiResponses<ActividadEntity>`
- **Swagger**: ✅ Completamente documentado

#### `GET /api/v1/ciiu/actividades/:id`
- **Descripción**: Obtener una actividad por ID
- **Path Params**: `id` (number)
- **Response**: `ApiResponse<ActividadEntity>`
- **Swagger**: ✅ Completamente documentado

#### `POST /api/v1/ciiu/actividades`
- **Descripción**: Crear una nueva actividad
- **Body**: `CreateActividadRequestDto`
- **Response**: `ApiResponse<ActividadEntity>`
- **Swagger**: ✅ Completamente documentado

#### `PUT /api/v1/ciiu/actividades/:id`
- **Descripción**: Actualizar una actividad
- **Path Params**: `id` (number)
- **Body**: `UpdateActividadRequestDto`
- **Response**: `ApiResponse<ActividadEntity>`
- **Swagger**: ✅ Completamente documentado

#### `DELETE /api/v1/ciiu/actividades/:id`
- **Descripción**: Eliminar una actividad (soft delete)
- **Path Params**: `id` (number)
- **Response**: `ApiResponse<ActividadEntity>`
- **Swagger**: ✅ Completamente documentado

---

## 📝 DTOs Documentados

Todos los DTOs tienen decoradores `@ApiProperty` con:
- ✅ `example`: Ejemplo de valor
- ✅ `description`: Descripción en español
- ✅ `required`: Si es requerido o no
- ✅ `type`: Tipo de dato
- ✅ Validaciones: `@MinLength`, `@MaxLength`, etc.

### DTOs Request Documentados

1. ✅ `CreateSeccionRequestDto`
2. ✅ `UpdateSeccionRequestDto`
3. ✅ `CreateActividadRequestDto`
4. ✅ `UpdateActividadRequestDto`
5. ✅ `SearchActividadDto`

---

## 🚀 Probar Swagger

### 1. Iniciar el servidor

```bash
cd BACKEND/MS-CONFI
npm run start:dev
```

### 2. Abrir Swagger UI

Navegar a: `http://localhost:3000/doc`

### 3. Probar Endpoints

#### Búsqueda de Actividades
1. Expandir el tag `ciiu`
2. Seleccionar `GET /api/v1/ciiu/actividades/search`
3. Click en "Try it out"
4. Ingresar `query: "maiz"` y `limit: 20`
5. Click en "Execute"
6. Verificar respuesta

#### Obtener Árbol
1. Seleccionar `GET /api/v1/ciiu/arbol`
2. Click en "Try it out"
3. Click en "Execute"
4. Verificar estructura de árbol

#### Crear Sección
1. Seleccionar `POST /api/v1/ciiu/secciones`
2. Click en "Try it out"
3. Modificar el body JSON:
   ```json
   {
     "cisec_abr_cisec": "A",
     "cisec_des_cisec": "Agricultura, ganadería, silvicultura y pesca"
   }
   ```
4. Click en "Execute"
5. Verificar respuesta

---

## ✅ Verificaciones Realizadas

- ✅ Todos los endpoints tienen `@ApiOperation` con summary
- ✅ Todos los endpoints tienen `@ApiResponseSwagger` documentado
- ✅ Query params documentados con `@ApiQuery`
- ✅ Path params documentados con `@Param` y `ParseIntPipe`
- ✅ Request bodies documentados con `@ApiBody`
- ✅ DTOs tienen `@ApiProperty` en todos los campos
- ✅ Tag `ciiu` agrupa todos los endpoints
- ✅ Autenticación requerida con `@ApiBearerAuth()`

---

## 📊 Resumen

- **Total Endpoints**: 15 endpoints
- **Endpoints Documentados**: 15/15 ✅
- **DTOs Documentados**: 5/5 ✅
- **Swagger UI**: Accesible en `/doc` ✅
- **Estado**: ✅ Completamente funcional

---

**Última actualización**: 2025-01-28

