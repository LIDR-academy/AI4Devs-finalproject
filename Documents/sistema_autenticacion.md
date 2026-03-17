# Sistema de Autenticación - Gamy

## Resumen

Se ha implementado un sistema completo de autenticación para la plataforma Gamy que incluye:

- ✅ Registro de usuarios con validación completa
- ✅ Inicio de sesión con email o nombre de usuario
- ✅ Dashboard personalizado para usuarios autenticados
- ✅ Integración preparada para Google OAuth (próximamente)
- ✅ Diseño responsive siguiendo los principios del PRD
- ✅ Protección CSRF y validación de formularios
- ✅ Encriptación de contraseñas con Django Auth
- ✅ Soporte multiidioma (ES, EN, FR)
- ✅ Integración con HTMX para experiencia fluida

## Archivos Creados/Modificados

### Nuevos Archivos

1. **`accounts/forms.py`**
   - `CustomLoginForm`: Formulario personalizado de inicio de sesión
   - `CustomRegistrationForm`: Formulario de registro con validaciones

2. **`templates/accounts/login.html`**
   - Interfaz de inicio de sesión
   - Diseño coherente con home.html
   - Placeholder para Google OAuth

3. **`templates/accounts/register.html`**
   - Interfaz de registro de usuarios
   - Validación en tiempo real
   - Campos: nombre, apellido, username, email, contraseñas

4. **`templates/accounts/dashboard.html`**
   - Dashboard personalizado post-login
   - Resumen de biblioteca y lista de deseos
   - Información del perfil

### Archivos Modificados

1. **`accounts/views.py`**
   - `user_login()`: Vista para inicio de sesión
   - `user_register()`: Vista para registro
   - `user_logout()`: Vista para cerrar sesión
   - `user_dashboard()`: Dashboard del usuario

2. **`accounts/urls.py`**
   - `/accounts/login/` - Página de inicio de sesión
   - `/accounts/register/` - Página de registro
   - `/accounts/logout/` - Cerrar sesión
   - `/accounts/dashboard/` - Dashboard del usuario

3. **`templates/home.html`**
   - Botones actualizados para enlazar a login/register
   - Lógica condicional para usuarios autenticados
   - Botón de cerrar sesión cuando está logueado

4. **`gamy/settings/base.py`**
   - Configuración de django-allauth
   - AUTHENTICATION_BACKENDS actualizado
   - Configuración de Google OAuth (preparada)
   - LOGIN_REDIRECT_URL actualizado a `/accounts/dashboard/`

5. **`gamy/urls.py`**
   - Incluidas las URLs de allauth para autenticación social

6. **`requirements.txt`**
   - Añadido `django-allauth>=0.57.0`

7. **`env.sample`**
   - Variables para Google OAuth Client ID y Secret

## Flujos de Usuario

### 1. Usuario No Registrado

```
Home → Click "Ingresar" → Login Page
     → Click "Registrarse" → Register Page → Auto-login → Dashboard
```

### 2. Registro de Usuario

```
Register Page → Completar formulario:
  - Nombre
  - Apellido
  - Username
  - Email
  - Contraseña (2 veces)
  - Aceptar términos
→ Submit → Crear cuenta → Auto-login → Dashboard
```

### 3. Inicio de Sesión

```
Login Page → Ingresar:
  - Username o Email
  - Contraseña
  - [Opcional] Recordarme
→ Submit → Verificación → Dashboard
```

### 4. Usuario Autenticado

```
Dashboard → Ver:
  - Información del perfil
  - Biblioteca personal (0 juegos inicialmente)
  - Lista de deseos (0 juegos inicialmente)
  - Acceso a contenido premium
→ Cerrar Sesión → Home
```

## Instrucciones de Instalación

### 1. Instalar Dependencias

```powershell
# Activar entorno virtual (si aplica)
.\venv\Scripts\Activate.ps1

# Instalar nuevas dependencias
pip install django-allauth
# O instalar todas las dependencias actualizadas
pip install -r requirements.txt
```

### 2. Aplicar Migraciones

```powershell
python manage.py makemigrations
python manage.py migrate
```

Esto creará las tablas necesarias para:
- `django.contrib.sites` (SITE_ID=1)
- `allauth.account` y `allauth.socialaccount`
- Modelos de Profile en accounts

### 3. Crear Superusuario (si no existe)

```powershell
python manage.py createsuperuser
```

### 4. Configurar Variables de Entorno

Copiar `env.sample` a `.env` y configurar (si aún no existe):

```plaintext
# Básicas (ya configuradas)
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=gamy
DB_USER=postgres
DB_PASSWORD=N0v4t13rr4

# Nuevas para Google OAuth (opcional por ahora)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
```

### 5. Ejecutar Servidor

```powershell
python manage.py runserver
```

## Probar el Sistema

### URLs Disponibles

- **Home**: http://127.0.0.1:8000/
- **Login**: http://127.0.0.1:8000/accounts/login/
- **Register**: http://127.0.0.1:8000/accounts/register/
- **Dashboard**: http://127.0.0.1:8000/accounts/dashboard/ (requiere login)
- **Admin**: http://127.0.0.1:8000/admin/

### Escenarios de Prueba

#### Test 1: Registro de Usuario Nuevo

1. Ir a http://127.0.0.1:8000/
2. Click en "Registrarse"
3. Completar formulario con datos válidos
4. Verificar redirección a dashboard
5. Verificar mensaje de bienvenida

#### Test 2: Login con Usuario Existente

1. Ir a http://127.0.0.1:8000/accounts/login/
2. Ingresar username/email y contraseña
3. Click "Iniciar Sesión"
4. Verificar redirección a dashboard

#### Test 3: Validaciones de Formulario

**Registro:**
- Email duplicado → Error "Este correo ya está registrado"
- Contraseñas no coinciden → Error de validación
- Contraseña muy corta → Error "Mínimo 8 caracteres"
- Username inválido → Error de validación

**Login:**
- Credenciales incorrectas → Error "Usuario o contraseña incorrectos"
- Campos vacíos → Errores de validación

#### Test 4: Flujo Completo

1. Home → Click "Registrarse"
2. Registro exitoso → Auto-login → Dashboard
3. Ver información del perfil
4. Logout → Volver a Home
5. Login nuevamente
6. Verificar dashboard carga correctamente

## Configurar Google OAuth (Futuro)

### Pasos para Habilitar Google Login

1. **Crear proyecto en Google Cloud Console**
   - Ir a: https://console.cloud.google.com/
   - Crear nuevo proyecto: "Gamy Auth"

2. **Configurar OAuth Consent Screen**
   - APIs & Services → OAuth consent screen
   - User Type: External
   - Añadir scopes: email, profile

3. **Crear Credenciales OAuth 2.0**
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://127.0.0.1:8000/accounts/google/login/callback/`
     - `http://localhost:8000/accounts/google/login/callback/`
     - (Agregar dominio de producción después)

4. **Configurar en Django Admin**
   - Ir a: http://127.0.0.1:8000/admin/
   - Sites → Site → Cambiar domain a `127.0.0.1:8000`
   - Social Applications → Add social application:
     - Provider: Google
     - Name: Google OAuth
     - Client ID: (del paso 3)
     - Secret key: (del paso 3)
     - Sites: Seleccionar `127.0.0.1:8000`

5. **Actualizar .env**
   ```plaintext
   GOOGLE_OAUTH_CLIENT_ID=tu-client-id.apps.googleusercontent.com
   GOOGLE_OAUTH_CLIENT_SECRET=tu-secret-key
   ```

6. **Probar Google Login**
   - Ir a login page
   - Click "Continuar con Google"
   - Seleccionar cuenta Google
   - Verificar redirección a dashboard

## Características de Seguridad

✅ **Implementadas:**

- Contraseñas hasheadas con PBKDF2
- Protección CSRF en todos los formularios
- Validación de entrada en server-side
- Sesiones seguras con cookies
- SQL Injection prevention (Django ORM)
- XSS prevention (Django templates auto-escape)

📋 **Pendientes para Producción:**

- SSL/HTTPS (SECURE_SSL_REDIRECT)
- Secure cookies (SESSION_COOKIE_SECURE)
- Rate limiting en login/register
- Two-factor authentication (2FA)
- Password reset por email
- Email verification obligatoria
- CAPTCHA en formularios públicos

## Estructura de Datos

### User Model (Django Auth)

```python
User
├── id (AutoField)
├── username (unique)
├── email (unique)
├── first_name
├── last_name
├── password (hashed)
├── is_active
├── is_staff
├── is_superuser
├── date_joined
└── last_login
```

### Profile Model (accounts.Profile)

```python
Profile
├── id (AutoField)
├── user (OneToOne → User)
├── bio (TextField)
├── location (CharField)
└── date_of_birth (DateField)
```

## Personalización

### Cambiar Colores

Los colores están definidos en Tailwind config en cada template:

```javascript
colors: {
    'game-green': '#2D5C50',
    'game-salmon': '#E78787',
    'game-beige': '#D8D0B8',
    'game-dark-salmon': '#D57272'
}
```

### Añadir Campos al Registro

1. Editar `accounts/forms.py` → `CustomRegistrationForm`
2. Añadir campo al formulario
3. Actualizar `templates/accounts/register.html`
4. Si es para Profile, actualizar `accounts/models.py`

### Personalizar Mensajes

Los mensajes están en `accounts/views.py`:

```python
messages.success(request, _("¡Bienvenido!"))
messages.error(request, _("Error al iniciar sesión"))
```

Usar `{% trans "texto" %}` para soporte multiidioma.

## Troubleshooting

### Error: "SITE_ID not found"

```powershell
python manage.py migrate
python manage.py shell
```

```python
from django.contrib.sites.models import Site
site = Site.objects.get_or_create(id=1, defaults={'domain': '127.0.0.1:8000', 'name': 'Gamy Local'})
```

### Error: "allauth not installed"

```powershell
pip install django-allauth
python manage.py migrate
```

### Error: "CSRF token missing"

Verificar que todos los forms tengan:
```html
<form method="post">
    {% csrf_token %}
    <!-- campos -->
</form>
```

### Usuario no puede iniciar sesión

1. Verificar que el usuario existe en DB
2. Verificar que `is_active=True`
3. Verificar contraseña con:
   ```python
   from django.contrib.auth.models import User
   user = User.objects.get(username='test')
   user.check_password('password123')  # Debe retornar True
   ```

## Próximos Pasos

1. **Implementar recuperación de contraseña**
   - Vista de "Olvidé mi contraseña"
   - Envío de email con token de reset
   - Vista de cambio de contraseña

2. **Perfil de usuario editable**
   - Formulario de edición de perfil
   - Cambio de contraseña
   - Upload de foto de perfil

3. **Integración con biblioteca**
   - Conectar dashboard con UserGameLibrary
   - Mostrar juegos reales en biblioteca
   - Funcionalidad de agregar/remover juegos

4. **Activar Google OAuth**
   - Configurar credenciales en Google Cloud
   - Probar flujo completo de OAuth
   - Manejo de usuarios sin username

5. **Email verification**
   - Configurar SMTP en producción
   - Template de email de confirmación
   - Lógica de activación de cuenta

## Recursos

- **Django Auth Docs**: https://docs.djangoproject.com/en/5.0/topics/auth/
- **Django-allauth Docs**: https://django-allauth.readthedocs.io/
- **Google OAuth Setup**: https://console.cloud.google.com/apis/credentials
- **Tailwind CSS**: https://tailwindcss.com/docs
- **HTMX**: https://htmx.org/docs/

## Soporte

Para problemas o preguntas:
1. Verificar logs del servidor: `python manage.py runserver`
2. Revisar base de datos: `python manage.py dbshell`
3. Verificar migraciones: `python manage.py showmigrations`
4. Consultar documentación de Django Auth

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0  
**Estado**: ✅ MVP Completado - Google OAuth Preparado
