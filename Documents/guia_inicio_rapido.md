# Guía de Inicio Rápido - Gamy

Esta guía te ayudará a configurar el entorno de desarrollo para Gamy según los requisitos del PRD.

## 📋 Resumen de Verificación

### ✅ Componentes Instalados
- Python 3.13.5
- pip 25.1.1
- Git 2.50.1
- **PostgreSQL 15.13** (✅ Verificado y funcionando)
- Node.js 22.17.1 (opcional)
- npm 10.9.2 (opcional)

### ❌ Componentes Faltantes (CRÍTICOS)
- Django
- psycopg2-binary
- Estructura del proyecto Django
- Base de datos 'gamy' (pendiente de crear)

## 🚀 Pasos para Configurar el Entorno

### Paso 1: PostgreSQL ✅ (Ya instalado)

**Estado:** PostgreSQL 15.13 está instalado y funcionando correctamente.

**Información de conexión:**
- **Host:** localhost
- **Puerto:** 5432
- **Usuario:** postgres
- **Contraseña:** [ya configurada]
- **Ubicación:** `C:\Program Files\PostgreSQL\15\`
- **Servicio:** `postgresql-x64-15` (corriendo)

**Nota:** El comando `psql` no está en el PATH, pero está disponible en:
```
C:\Program Files\PostgreSQL\15\bin\psql.exe
```

**Crear base de datos 'gamy' (cuando sea necesario):**
```bash
# Usando PowerShell (ruta completa)
$env:PGPASSWORD='N0v4t13rr4'; & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE gamy;"
```

**Opcional - Agregar PostgreSQL al PATH:**
1. Abrir "Variables de entorno del sistema"
2. Editar la variable `Path`
3. Agregar: `C:\Program Files\PostgreSQL\15\bin`
4. Reiniciar la terminal

### Paso 2: Crear Entorno Virtual

```bash
# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual (Windows)
.venv\Scripts\activate

# Activar entorno virtual (Linux/Mac)
source .venv/bin/activate
```

### Paso 3: Instalar Dependencias

```bash
# Instalar dependencias desde requirements.txt
pip install -r requirements.txt
```

### Paso 4: Crear Proyecto Django

```bash
# Crear proyecto Django
django-admin startproject gamy .

# Crear aplicaciones Django
python manage.py startapp catalog
python manage.py startapp accounts
python manage.py startapp library
python manage.py startapp requests
```

### Paso 5: Configurar Variables de Entorno

1. Copiar el archivo de ejemplo:
   ```bash
   copy env.sample .env
   ```

2. Editar `.env` con tus configuraciones:
   ```ini
   SECRET_KEY=tu-clave-secreta-aqui
   DEBUG=True
   DATABASE_URL=postgres://postgres:N0v4t13rr4@localhost:5432/gamy
   ```
   
   **Nota:** La contraseña de PostgreSQL ya está configurada. Asegúrate de usar la misma en el archivo `.env`.

### Paso 6: Configurar Base de Datos en Django

Editar `gamy/settings.py`:

```python
import os
from decouple import config

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='gamy'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}
```

### Paso 7: Crear Migraciones y Aplicarlas

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser
```

### Paso 8: Ejecutar Servidor de Desarrollo

```bash
python manage.py runserver
```

Abrir navegador en: http://127.0.0.1:8000/

## 📁 Estructura del Proyecto Esperada

```
gamy/
├── gamy/                  # Proyecto Django principal
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── catalog/               # App de catálogo de juegos
├── accounts/              # App de autenticación
├── library/               # App de biblioteca personal
├── requests/              # App de solicitudes de juegos
├── templates/             # Templates HTML
├── static/                # Archivos estáticos (CSS, JS, imágenes)
├── media/                 # Archivos de medios subidos
├── manage.py
├── requirements.txt
├── .env
└── .gitignore
```

## 🔍 Verificación Post-Instalación

Ejecutar estos comandos para verificar que todo está correcto:

```bash
# Verificar Django
python -m django --version

# Verificar PostgreSQL (usando ruta completa)
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" --version

# Verificar conexión a la base de datos
python manage.py dbshell

# Verificar que PostgreSQL está corriendo
Get-Service -Name "*postgres*"

# Ejecutar tests (cuando estén creados)
pytest
```

## 📚 Recursos Adicionales

- **Documentación Django:** https://docs.djangoproject.com/
- **Documentación PostgreSQL:** https://www.postgresql.org/docs/
- **Documentación HTMX:** https://htmx.org/
- **PRD del Proyecto:** `Documents/prd_Gamy.md`
- **Reporte de Verificación:** `Documents/verificacion_componentes.md`

## ⚠️ Problemas Comunes

### Error: "No module named 'django'"
**Solución:** Asegúrate de haber activado el entorno virtual y ejecutado `pip install -r requirements.txt`

### Error: "could not connect to server"
**Solución:** 
- Verifica que el servicio PostgreSQL esté corriendo: `Get-Service -Name "*postgres*"`
- Verifica que el puerto 5432 esté abierto: `Test-NetConnection -ComputerName localhost -Port 5432`
- Verifica las credenciales en `.env` (usuario: postgres, contraseña: N0v4t13rr4)

### Error: "psycopg2" no se puede instalar
**Solución:** Usa `psycopg2-binary` en lugar de `psycopg2` para Windows

### Error: "Port 5432 already in use"
**Solución:** Verifica que no haya otra instancia de PostgreSQL ejecutándose o cambia el puerto

## 🎯 Próximos Pasos

1. ✅ Completar la configuración del entorno
2. ⬜ Crear modelos según el PRD (Users, Games, UserGameLibrary, GameRequests)
3. ⬜ Crear vistas y templates
4. ⬜ Implementar funcionalidades de búsqueda y filtrado
5. ⬜ Implementar sistema de autenticación
6. ⬜ Implementar biblioteca personal y wishlist
7. ⬜ Implementar sistema de solicitudes
8. ⬜ Configurar HTMX para interactividad
9. ⬜ Crear tests
10. ⬜ Preparar para despliegue

---

**Última actualización:** 2025-11-08


