# Cómo Obtener SUPABASE_DATABASE_URL

Esta guía te ayudará a obtener la URL de conexión directa a PostgreSQL de Supabase.

## Paso 1: Acceder a tu Proyecto Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto

## Paso 2: Navegar a la Configuración de Base de Datos

1. En el menú lateral izquierdo, haz clic en **Settings** (ícono de engranaje)
2. Selecciona **Database**

## Paso 3: Copiar Connection String

1. Busca la sección **Connection string**
2. Selecciona la pestaña **URI**
3. Verás una cadena similar a:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

⚠️ **IMPORTANTE**: La contraseña no se muestra por defecto. Tienes dos opciones:

### Opción A: Usar la contraseña que guardaste durante la creación del proyecto

Si guardaste la contraseña cuando creaste el proyecto, reemplaza `[YOUR-PASSWORD]` con ella.

### Opción B: Resetear la contraseña de la base de datos

1. En la misma página **Settings → Database**
2. Busca la sección **Database Password**
3. Haz clic en **Reset database password**
4. Genera una nueva contraseña
5. **¡IMPORTANTE!** Guarda esta contraseña de forma segura (no se volverá a mostrar)
6. Actualiza el connection string con la nueva contraseña

## Paso 4: Agregar a tu .env

Copia la URL completa y agrégala a tu archivo `.env`:

```bash
SUPABASE_DATABASE_URL=postgresql://postgres.abcdefghijk:[TU-CONTRASEÑA]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## Verificación

Para verificar que la URL funciona correctamente, ejecuta:

```bash
make setup-events
```

Si todo está configurado correctamente, deberías ver:

```
✅ Loaded SQL migration
✅ Database URL loaded from .env
🔄 Connecting to Supabase PostgreSQL...
🔄 Executing migration...
✅ Migration executed successfully!
✅ Table 'events' verified in database
```

## Formatos Alternativos

Supabase ofrece diferentes formatos de connection string:

### Connection Pooler (Recomendado para aplicaciones)
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Direct Connection (Para herramientas de administración)
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Para este proyecto, **usa el Connection Pooler** (puerto 6543).

## Troubleshooting

### Error: "Could not connect to database"

1. Verifica que la URL esté correctamente formateada
2. Asegúrate de haber reemplazado `[YOUR-PASSWORD]` con tu contraseña real
3. Verifica que no haya espacios extra al copiar/pegar
4. Confirma que tu IP esté en la whitelist (Settings → Database → Connection Pooling)

### Error: "SUPABASE_DATABASE_URL not found in .env"

1. Verifica que el archivo `.env` existe en la raíz del proyecto
2. Asegúrate de que la variable se llama exactamente `SUPABASE_DATABASE_URL` (mayúsculas)
3. Verifica que no haya líneas en blanco o comentarios antes de la variable

## Seguridad

⚠️ **NUNCA** commits el archivo `.env` a git
⚠️ La contraseña de la base de datos es tan sensible como el `service_role` key
⚠️ No compartas esta URL en canales públicos o inseguros
