# Guía Rápida de Instalación - Sistema de Autenticación

## Pasos de Instalación

### 1. Instalar Django-allauth

```powershell
pip install django-allauth
```

O instalar todas las dependencias actualizadas:

```powershell
pip install -r requirements.txt
```

### 2. Aplicar Migraciones

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 3. Crear Site en la Base de Datos

Django-allauth requiere un objeto Site. Ejecutar:

```powershell
python manage.py shell
```

Luego en el shell de Django:

```python
from django.contrib.sites.models import Site
Site.objects.get_or_create(
    id=1,
    defaults={
        'domain': '127.0.0.1:8000',
        'name': 'Gamy Local'
    }
)
exit()
```

### 4. Crear Superusuario (si no existe)

```powershell
python manage.py createsuperuser
```

### 5. Iniciar el Servidor

```powershell
python manage.py runserver
```

## URLs Disponibles

- **Home**: http://127.0.0.1:8000/
- **Login**: http://127.0.0.1:8000/accounts/login/
- **Registro**: http://127.0.0.1:8000/accounts/register/
- **Dashboard**: http://127.0.0.1:8000/accounts/dashboard/
- **Admin**: http://127.0.0.1:8000/admin/

## Prueba Rápida

1. Ir a: http://127.0.0.1:8000/
2. Click en "Registrarse"
3. Completar el formulario:
   - Nombre: Juan
   - Apellido: Pérez
   - Username: juanperez
   - Email: juan@example.com
   - Contraseña: testpass123
   - Confirmar contraseña: testpass123
   - ✓ Aceptar términos
4. Click "Crear Cuenta"
5. Deberías ver el Dashboard con un mensaje de bienvenida

## Funcionalidades Implementadas

✅ Registro de usuarios  
✅ Inicio de sesión (username o email)  
✅ Cierre de sesión  
✅ Dashboard personalizado  
✅ Protección CSRF  
✅ Validación de formularios  
✅ Contraseñas encriptadas  
✅ Diseño responsive  
✅ Soporte multiidioma (ES, EN, FR)  
✅ Preparado para Google OAuth (próximamente)

## Próximos Pasos

Para activar Google OAuth, ver el archivo:
`Documents/sistema_autenticacion.md` - Sección "Configurar Google OAuth"

## Problemas Comunes

**Error: "No such table: django_site"**
→ Ejecutar: `python manage.py migrate`

**Error: "allauth not installed"**
→ Ejecutar: `pip install django-allauth`

**El login no funciona**
→ Verificar que el usuario existe y `is_active=True` en el admin

Para más detalles, ver: `Documents/sistema_autenticacion.md`
