# Configuración de Variables de Entorno - Gamy

## 📋 Resumen

El proyecto usa `python-decouple` para manejar variables de entorno desde un archivo `.env`. Esta es una práctica recomendada para mantener las configuraciones sensibles fuera del código.

## 🔧 Configuración Actual

### Archivo de Configuración
- **Ubicación:** `gamy/settings/base.py`
- **Librería:** `python-decouple`
- **Archivo de variables:** `.env` (en el directorio raíz del proyecto)

### Variables de Base de Datos Configuradas

Las siguientes variables se leen desde el archivo `.env`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='gamy'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='N0v4t13rr4'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432', cast=int),
    }
}
```

## 📝 Pasos para Configurar

### 1. Crear Archivo .env

El archivo `.env` debe crearse en el directorio raíz del proyecto (donde está `manage.py`):

```bash
# Copiar el archivo de ejemplo
copy env.sample .env

# O en Linux/Mac
cp env.sample .env
```

### 2. Configurar Variables en .env

Editar el archivo `.env` y configurar las variables necesarias:

```ini
# Database Configuration
DB_NAME=gamy
DB_USER=postgres
DB_PASSWORD=N0v4t13rr4
DB_HOST=localhost
DB_PORT=5432
```

### 3. Verificar que .env existe

```bash
# Verificar que el archivo existe
Test-Path .env  # PowerShell
# o
ls .env  # Linux/Mac
```

## 🔍 Cómo Funciona python-decouple

### Búsqueda del Archivo .env

`python-decouple` busca el archivo `.env` en el siguiente orden:

1. **Directorio actual de trabajo** (donde se ejecuta el comando)
2. **Directorio del archivo que llama a `config()`**
3. **Directorio raíz del proyecto** (donde está `manage.py`)

### Valores por Defecto

Si una variable no se encuentra en el archivo `.env`, se usa el valor por defecto especificado en `config()`:

```python
config('DB_NAME', default='gamy')  # Si DB_NAME no existe en .env, usa 'gamy'
```

### Tipos de Datos

`python-decouple` puede convertir automáticamente los tipos:

```python
config('DB_PORT', default='5432', cast=int)  # Convierte a entero
config('DEBUG', default='True', cast=bool)   # Convierte a booleano
config('ALLOWED_HOSTS', cast=Csv())          # Convierte a lista separada por comas
```

## ✅ Verificación

### Verificar que las Variables se Leen Correctamente

```python
# En Python
from decouple import config
print(config('DB_NAME'))
print(config('DB_USER'))
```

### Verificar la Configuración de Django

```bash
# Verificar que Django puede leer la configuración
python manage.py check --settings=gamy.settings.local

# Verificar la configuración de la base de datos
python manage.py dbshell
```

## 🔒 Seguridad

### ⚠️ Importante

1. **Nunca commitees el archivo `.env`** al repositorio
2. **Usa `.gitignore`** para excluir `.env`
3. **Usa `env.sample`** como plantilla sin valores sensibles
4. **Genera un `SECRET_KEY` único** para cada entorno

### Generar SECRET_KEY

```python
# En Python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

## 📚 Variables Configuradas Actualmente

### Base de Datos
- `DB_NAME` - Nombre de la base de datos
- `DB_USER` - Usuario de PostgreSQL
- `DB_PASSWORD` - Contraseña de PostgreSQL
- `DB_HOST` - Host de PostgreSQL
- `DB_PORT` - Puerto de PostgreSQL

### Django
- `SECRET_KEY` - Clave secreta de Django
- `DEBUG` - Modo de depuración
- `ALLOWED_HOSTS` - Hosts permitidos
- `LANGUAGE_CODE` - Código de idioma
- `TIME_ZONE` - Zona horaria

### Static Files
- `STATIC_ROOT` - Directorio para archivos estáticos
- `MEDIA_ROOT` - Directorio para archivos de medios

## 🐛 Solución de Problemas

### Problema: Variables no se leen

**Solución:**
1. Verificar que el archivo `.env` existe en el directorio raíz
2. Verificar que las variables están escritas correctamente (sin espacios alrededor del `=`)
3. Verificar que no hay comillas innecesarias en los valores

### Problema: Valores por defecto siempre se usan

**Solución:**
1. Verificar que el archivo `.env` está en el directorio correcto
2. Verificar que las variables tienen el nombre correcto (case-sensitive)
3. Reiniciar el servidor de Django después de cambiar `.env`

### Problema: Error de conexión a la base de datos

**Solución:**
1. Verificar que PostgreSQL está corriendo
2. Verificar que las credenciales en `.env` son correctas
3. Verificar que la base de datos existe
4. Verificar que el usuario tiene permisos

## 📖 Referencias

- [python-decouple documentation](https://github.com/henriquebastos/python-decouple)
- [Django Settings](https://docs.djangoproject.com/en/5.2/topics/settings/)
- [12 Factor App - Config](https://12factor.net/config)

