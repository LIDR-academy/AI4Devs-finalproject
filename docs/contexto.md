# 🛠️ CONTEXTO DEL PROYECTO: SISTEMA DE GESTIÓN DE HERRAMIENTAS PORTÁTILES PARA ASTILLERO

## 🧭 OBJETIVO GENERAL
Desarrollar una **aplicación web completa** para gestionar y controlar las herramientas portátiles de un **Astillero**, con el objetivo principal de conocer **dónde está cada herramienta y qué operario la está utilizando**.

---

## 🧩 TECNOLOGÍAS Y CONDICIONES

- **Frontend:**  
  - HTML5  
  - CSS con **TailwindCSS desde CDN**  
  - JavaScript puro (sin frameworks ni librerías externas)

- **Backend:**  
  - PHP **8.2 puro**  
  - MySQL (versión estable 8+)  
  - API REST desarrollada también en PHP (sin frameworks)

- **Arquitectura del proyecto:**  
  - Estructura de carpetas escalable (ver más abajo)
  - Código limpio, modular y mantenible
  - Aplicación **responsive**, adaptada a dispositivos móviles y escritorio

---

## 🏗️ ESTRUCTURA DE DIRECTORIOS

/project-root
│
├── /src
│ ├── /api # Endpoints de la API (PHP)
│ ├── /config # Configuración del proyecto, conexión BD
│ ├── /controllers # Controladores de negocio
│ ├── /dto # Data Transfer Objects (estructuras de datos)
│ ├── /interfaces # Interfaces de clases (si aplica)
│ ├── /middlewares # Validaciones y seguridad
│ ├── /routes # Definición de rutas de la API
│ ├── /services # Lógica de negocio (servicios reutilizables)
│ ├── /utils # Funciones auxiliares (fechas, validaciones, logs)
│ ├── /test # Pruebas básicas o archivos de verificación
│ └── index.php # Punto de entrada principal
│
├── /public
│ ├── /js # Scripts JS puros (frontend)
│ └── index.html # Página principal
│
├── /docs
│ └── contexto.md # Este archivo (referencia base del proyecto)
│
└── /db
└── schema.sql # Script de creación de tablas SQL


---

## 🧱 FUNCIONALIDADES PRINCIPALES

### 1️⃣ Pantalla de **acciones principales** (3 botones)
1. **Usar herramienta portátil**
   - Formulario:
     - Desplegable con herramienta a utilizar
     - Ubicación donde la va a usar
     - Fecha de inicio y fecha final de uso
   - Flujo:
     1. Verificar si la herramienta está actualmente en uso.
     2. Si **sí está en uso** → mostrar mensaje:  
        `"La herramienta está siendo utilizada por {nombre_operario} en {nombre_ubicacion}."`
     3. Si **no está en uso** →  
        - Actualizar el último registro de esa herramienta, cerrando su uso (rellenar fecha_fin con la fecha actual).  
        - Crear un nuevo registro con: operario (de sesión), ubicación, fecha_inicio y fecha_fin introducidas.

2. **Dejar herramienta portátil**
   - Formulario:
     - Desplegable con herramienta a dejar
     - Ubicación donde se deja
   - Flujo:
     1. Buscar el registro en uso y actualizar `fecha_fin` con la fecha/hora actual.  
     2. Crear nuevo registro indicando ubicación, con `fecha_inicio` = fecha/hora actual.

3. **Consultar ubicación de herramienta**
   - Formulario:
     - Desplegable con herramienta a consultar
   - Flujo:
     1. Buscar el último registro de esa herramienta.  
     2. Mostrar ubicación actual.  
     3. Si está siendo usada, mostrar también el operario y fechas de uso.

---

### 2️⃣ Pantalla de **visualización de información** (2 botones)
1. **Dashboard de estado de herramientas**
   - Muestra cada herramienta con:
     - Nombre
     - Ubicación actual
     - Estado (libre/ocupada)
     - Operario, fecha de inicio y fecha de fin (si aplica)
   - Colores:
     - **Verde pastel** → herramienta libre  
     - **Rojo pastel** → herramienta en uso
   - Refresco automático cada **5 minutos**
   - Mostrar en la esquina inferior derecha:
     > Fecha y hora del último refresco (del dispositivo del usuario, no del servidor)

2. **Histórico de usos**
   - Listado cronológico con:
     - Herramienta
     - Operario
     - Ubicación
     - Fecha inicio / Fecha fin
   - Posibilidad de filtrar por herramienta u operario

---

## 🔐 LOGIN Y SEGURIDAD

1. **Inicio de sesión (sin contraseña tradicional)**
   - Campo: `email del operario`
   - Si el usuario **existe** → enviar código de 8 caracteres alfanuméricos por email
   - Si **no existe** → mostrar mensaje “El usuario no está registrado”

2. **Pantalla de validación del código**
   - Si el código es correcto → se inicia sesión válida durante **24 horas**
   - Si el código es incorrecto → volver al login

3. **Gestión de sesión**
   - Si hay más de 24h de inactividad → cerrar sesión automáticamente
   - El email del operario logueado se usará en las acciones (botones 1.1 y 1.2)

---

## 🗄️ BASE DE DATOS (MySQL)

- El sistema implementa una **inicialización automática** que:
  1. Verifica la existencia de la base de datos y la crea si no existe
  2. Crea todas las tablas necesarias con sus relaciones
  3. Inserta datos iniciales de prueba para facilitar el desarrollo
  4. Se ejecuta automáticamente en el primer acceso
  
- La aplicación incluye un **script `schema.sql`** que:
  1. Define la estructura completa de la base de datos
  2. Incluye todos los índices y restricciones

- **Proceso de inicialización**:
  1. Al acceder, el sistema mostrará el formulario de login.
  2. Al confirmar el formulario se verificará que existe la base de datos.
  3. Si no existe, se crea automáticamente con el archivo `schema.sql` y se insertan los datos de dummy con el archivo `data.sql`.
  4. Se verificará el login

### Tablas principales
1. **usuarios**
   - `uuid` (char 36, PK)
   - `nombre`
   - `email` (único)
   - `activo` (boolean)
   - `dh_created`
   - `dh_updated`

2. **ubicaciones**
   - `id` (PK, autoincremental)
   - `nombre`
   - `activo` (boolean)
   - `dh_created`
   - `dh_updated`

3. **herramientas**
   - `id` (PK)
   - `nombre`
   - `codigo`
   - `activo` (boolean)
   - `dh_created`
   - `dh_updated`

4. **movimientos_herramienta**
   - `id` (PK)
   - `herramienta_id` (FK → herramientas)
   - `operario_uuid` (FK → usuarios)
   - `ubicacion_id` (FK → ubicaciones)
   - `fecha_inicio`
   - `fecha_fin`
   - `dh_created`
   - `dh_updated`

5. **codigos_login**
   - `id` (PK)
   - `usuario_uuid` (FK)
   - `codigo` (varchar 8)
   - `fecha_envio`
   - `fecha_validacion`
   - `activo` (boolean)

---

## 🧠 FLUJOS INTERNOS DE LA API

- **No se harán consultas SQL directas desde el Frontend.**  
  Todas las interacciones con la base de datos pasarán por la **API PHP**.

- **Endpoints principales (rutas orientativas):**
POST /api/login/send-code
POST /api/login/validate-code
GET /api/herramientas
GET /api/herramientas/{id}/estado
POST /api/herramientas/{id}/usar
POST /api/herramientas/{id}/dejar
GET /api/herramientas/{id}/historial
GET /api/dashboard

---

## 🛡️ CONFIGURACIÓN DE SEGURIDAD

### **1. Configuración del Servidor**
- Configuraciones requeridas en php.ini:
```ini
display_errors = Off     # No mostrar errores en producción
log_errors = On         # Habilitar logging de errores
error_reporting = E_ALL # Reportar todos los tipos de errores
allow_url_fopen = Off   # Deshabilitar inclusión de URLs remotas
allow_url_include = Off # Deshabilitar include de URLs remotas
```

### **2. Permisos de Archivos**
- Establecer permisos restrictivos:
```bash
# Directorios: lectura y ejecución para grupo y otros
chmod 755 /path/to/directories

# Archivos regulares: lectura para grupo y otros
chmod 644 /path/to/regular/files

# Archivos de configuración: solo lectura para propietario
chmod 400 /path/to/config/files
```

## 🧩 CONSIDERACIONES ADICIONALES

- Aplicación **100% responsive** (pantallas adaptadas para móvil/tablet/PC)
- Todos los textos y mensajes en **español neutro**
- Código con **comentarios explicativos claros**
- Manejo de errores controlado en Frontend y Backend
- Se registrarán logs de acciones críticas (en `/src/utils/logs` si se desea implementar)
- El **agente de IA** debe revisar SIEMPRE este archivo antes de ejecutar o modificar código

---

## ✅ RESUMEN PARA EL AGENTE DE IA

1. **Leer este archivo (`docs/contexto.md`) antes de realizar cualquier acción.**  
2. **Crear la estructura base del proyecto** siguiendo la jerarquía indicada.  
3. **Desarrollar la base de datos** a partir de la definición de tablas y generar `schema.sql`.  
4. **Construir la API PHP** con rutas y controladores para todas las operaciones.  
5. **Diseñar el Frontend** con HTML, JS puro y Tailwind desde CDN.  
6. **Implementar la lógica funcional** de cada botón exactamente como se describe.  
7. **Asegurar validaciones, seguridad y expiración de sesión.**  
8. **Mantener código modular, limpio y documentado.**

---

## 📂 DOCUMENTOS RELACIONADOS
- `/db/schema.sql` → estructura completa de base de datos  
- `/docs/contexto.md` → referencia base del proyecto (este archivo)  
- `/src/config/config.php` → configuración de conexión y constantes globales  
- `/src/routes/api.php` → definición de endpoints de la API  
- `/public/index.html` → página principal del sistema

---

> **Nota final:**  
> Este archivo `contexto.md` define el **punto de partida, estructura y reglas de desarrollo** para el sistema de gestión de herramientas portátiles del Astillero.  
> Cualquier agente de IA o desarrollador humano debe seguir fielmente este documento antes de implementar, refactorizar o ampliar el proyecto.

