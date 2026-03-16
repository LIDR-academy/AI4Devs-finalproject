# 🧪 Guía de Pruebas - Endpoints Módulo Geo

## 📋 Prerequisitos

1. ✅ Script SQL ejecutado (tablas creadas)
2. ✅ Servidor MS-CONFI corriendo en puerto 8012
3. ✅ Base de datos conectada
4. ✅ Token JWT válido (si requiere autenticación)

## 🚀 Iniciar el Servidor

```bash
cd BACKEND/MS-CONFI
npm run start:dev
```

El servidor debería iniciar en: `http://localhost:8012`

## 📍 Endpoints Disponibles

### **Base URL**: `http://localhost:8012`

---

## 🔵 **PROVINCIAS**

### 1. Listar Provincias
```http
GET /geo/provincias?active=true
```

**Ejemplo con curl:**
```bash
curl -X GET "http://localhost:8012/geo/provincias?active=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta esperada:**
```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "pageSize": 0,
  "detail": {
    "action": "list",
    "resource": "Provincias",
    "method": "findAllProvincias"
  }
}
```

---

### 2. Crear Provincia
```http
POST /geo/provincias
Content-Type: application/json
```

**Body:**
```json
{
  "provi_cod_prov": "01",
  "provi_nom_provi": "Azuay",
  "provi_flg_acti": true
}
```

**Ejemplo con curl:**
```bash
curl -X POST "http://localhost:8012/geo/provincias" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "provi_cod_prov": "01",
    "provi_nom_provi": "Azuay",
    "provi_flg_acti": true
  }'
```

**Respuesta esperada:**
```json
{
  "data": {
    "provi_cod_provi": 1,
    "provi_cod_prov": "01",
    "provi_nom_provi": "Azuay",
    "provi_flg_acti": true,
    "provi_fec_creac": "2025-01-27T...",
    "provi_fec_modif": "2025-01-27T...",
    "provi_fec_elimi": null
  },
  "detail": {
    "action": "create",
    "resource": "Provincias",
    "method": "createProvincia"
  }
}
```

---

### 3. Actualizar Provincia
```http
PUT /geo/provincias/:id
Content-Type: application/json
```

**Ejemplo:**
```bash
curl -X PUT "http://localhost:8012/geo/provincias/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "provi_cod_prov": "01",
    "provi_nom_provi": "Azuay (Actualizado)",
    "provi_flg_acti": true
  }'
```

---

### 4. Eliminar Provincia (Soft Delete)
```http
DELETE /geo/provincias/:id
```

**Ejemplo:**
```bash
curl -X DELETE "http://localhost:8012/geo/provincias/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🟢 **CANTONES**

### 1. Listar Cantones por Provincia
```http
GET /geo/provincias/:provi_cod_prov/cantones?active=true
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:8012/geo/provincias/01/cantones?active=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Crear Cantón
```http
POST /geo/cantones
Content-Type: application/json
```

**Body:**
```json
{
  "provi_cod_provi": 1,
  "canto_cod_cant": "01",
  "canto_nom_canto": "Cuenca",
  "canto_flg_acti": true
}
```

**Ejemplo:**
```bash
curl -X POST "http://localhost:8012/geo/cantones" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "provi_cod_provi": 1,
    "canto_cod_cant": "01",
    "canto_nom_canto": "Cuenca",
    "canto_flg_acti": true
  }'
```

---

### 3. Actualizar Cantón
```http
PUT /geo/cantones/:id
```

### 4. Eliminar Cantón
```http
DELETE /geo/cantones/:id
```

---

## 🟡 **PARROQUIAS**

### 1. Listar Parroquias por Cantón
```http
GET /geo/provincias/:provi_cod_prov/cantones/:canto_cod_cant/parroquias?active=true
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:8012/geo/provincias/01/cantones/01/parroquias?active=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Buscar Parroquias
```http
GET /geo/parroquias/search?q=TEXT&limit=20
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:8012/geo/parroquias/search?q=Cuenca&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Crear Parroquia
```http
POST /geo/parroquias
Content-Type: application/json
```

**Body:**
```json
{
  "canto_cod_canto": 1,
  "parro_cod_parr": "01",
  "parro_nom_parro": "El Sagrario",
  "parro_tip_area": "U",
  "parro_flg_acti": true
}
```

**Ejemplo:**
```bash
curl -X POST "http://localhost:8012/geo/parroquias" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "canto_cod_canto": 1,
    "parro_cod_parr": "01",
    "parro_nom_parro": "El Sagrario",
    "parro_tip_area": "U",
    "parro_flg_acti": true
  }'
```

---

### 4. Actualizar Parroquia
```http
PUT /geo/parroquias/:id
```

### 5. Eliminar Parroquia
```http
DELETE /geo/parroquias/:id
```

---

## 📊 **Swagger UI**

Acceder a la documentación interactiva:
```
http://localhost:8012/doc
```

Buscar el tag **"geo"** para ver todos los endpoints documentados.

---

## ✅ **Secuencia de Prueba Recomendada**

1. **Crear Provincia**
   ```bash
   POST /geo/provincias
   Body: { "provi_cod_prov": "01", "provi_nom_provi": "Azuay", "provi_flg_acti": true }
   ```

2. **Listar Provincias**
   ```bash
   GET /geo/provincias?active=true
   ```

3. **Crear Cantón**
   ```bash
   POST /geo/cantones
   Body: { "provi_cod_provi": 1, "canto_cod_cant": "01", "canto_nom_canto": "Cuenca", "canto_flg_acti": true }
   ```

4. **Listar Cantones**
   ```bash
   GET /geo/provincias/01/cantones?active=true
   ```

5. **Crear Parroquia**
   ```bash
   POST /geo/parroquias
   Body: { "canto_cod_canto": 1, "parro_cod_parr": "01", "parro_nom_parro": "El Sagrario", "parro_tip_area": "U", "parro_flg_acti": true }
   ```

6. **Listar Parroquias**
   ```bash
   GET /geo/provincias/01/cantones/01/parroquias?active=true
   ```

7. **Buscar Parroquias**
   ```bash
   GET /geo/parroquias/search?q=Sagrario&limit=10
   ```

8. **Actualizar Provincia**
   ```bash
   PUT /geo/provincias/1
   Body: { "provi_cod_prov": "01", "provi_nom_provi": "Azuay Actualizado", "provi_flg_acti": true }
   ```

9. **Eliminar (Soft Delete)**
   ```bash
   DELETE /geo/provincias/1
   ```

---

## 🐛 **Troubleshooting**

### Error: "Servidor no disponible"
- Verificar que el servidor esté corriendo: `npm run start:dev`
- Verificar el puerto en `.env` (debe ser 8012)

### Error: "Unauthorized" o "Forbidden"
- Verificar que el token JWT sea válido
- Verificar que el usuario tenga permisos ADMIN para endpoints de escritura

### Error: "Table does not exist"
- Verificar que el script SQL se ejecutó correctamente
- Verificar conexión a la base de datos

### Error: "Validation failed"
- Verificar que los campos requeridos estén presentes
- Verificar formato de datos (códigos SEPS deben ser strings de 2 caracteres)

---

## 📝 **Notas**

- Los códigos SEPS preservan ceros a la izquierda (ej: "01", "02", "09")
- El soft delete actualiza `fec_elimi`, no elimina físicamente
- El flag `flg_acti` controla activación/inactivación de negocio
- Los endpoints de lectura requieren autenticación
- Los endpoints de escritura requieren rol ADMIN

