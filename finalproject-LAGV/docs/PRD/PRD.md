# Easy Reader - Product Requirements Document (PRD)

## 1. Objetivo del Producto
Easy Reader es una aplicación web diseñada para transformar la experiencia de lectura digital. La aplicación permite a los usuarios visualizar documentos PDF y contenido web de una manera más accesible e intuitiva. A través de diferentes modos de lectura automatizados, los usuarios pueden navegar por el contenido sin necesidad de interacción manual, lo que mejora significativamente la accesibilidad y comodidad durante la lectura.

## 2. Alcance del Producto
Easy Reader está dirigido a un público general, con especial énfasis en mejorar la accesibilidad para personas con discapacidades motoras o visuales. La aplicación ofrece:
- Carga de archivos PDF y lectura de enlaces web
- Modos de lectura accesible:
  - **Comandos de voz**: Control de navegación mediante comandos de voz en español
  - **Síntesis de voz**: Lectura automática del contenido con voces personalizables
- Uso sin registro con almacenamiento local

### **Funcionalidades actuales**
1. **Control por voz:**
   - Navegación entre páginas mediante comandos
   - Control de desplazamiento (arriba/abajo)
   - Múltiples variantes de comandos
   - Feedback visual de comandos reconocidos

2. **Síntesis de voz:**
   - Selección de voces disponibles
   - Control de velocidad de lectura
   - Pausa y continuación de lectura
   - Indicadores visuales del estado de lectura

### **Funcionalidades futuras**  
1. **Modos de lectura con desplazamiento automático:**
   - **Detección de rostro**: Control mediante movimientos faciales
   - **Acelerómetro**: Control mediante inclinación del dispositivo
   - **Gestos de manos**: Control por gestos para accesibilidad

2. **Sistema de usuarios:**
   - Registro e inicio de sesión
   - Almacenamiento en la nube
   - Sincronización entre dispositivos

3. **Personalización avanzada:**
   - Modo oscuro y claro
   - Ajuste de brillo
   - Notas y subrayado
   - Configuración personalizada de comandos

## 3. Requisitos del Producto  

### 3.1. Requisitos Funcionales
- El usuario podrá subir un archivo **PDF** o ingresar una **URL**
- El sistema le pedirá al usuario seleccionar un **modo de lectura**:
  - **Comandos de voz**: Para control mediante comandos de voz
  - **Síntesis de voz**: Para lectura automática del contenido
  - **Acelerómetro**: Para control mediante inclinación del dispositivo
  - **Detección de rostro** (Futuro): Para control mediante movimientos faciales
- Para el modo de **comandos de voz**:
  - El sistema solicitará permiso de micrófono
  - Reconocerá comandos para navegación
  - Proporcionará feedback visual de los comandos reconocidos
- Para el modo de **síntesis de voz**:
  - El usuario podrá seleccionar entre las voces disponibles
  - Podrá controlar la velocidad de lectura
  - Podrá pausar y reanudar la lectura en cualquier momento
- Para el modo de **acelerómetro**:
  - El sistema solicitará permiso de sensores
  - Detectará inclinación del dispositivo
  - Ajustará velocidad según grado de inclinación
- Para el modo de **detección de rostro** (Futuro):
  - El sistema solicitará permiso de cámara
  - Detectará movimientos faciales para control
  - Proporcionará feedback visual de movimientos detectados
- **Usuarios:** Todos los usuarios podrán utilizar la aplicación sin registro, con almacenamiento local

### 3.2. Requisitos No Funcionales
- **Responsividad:** La aplicación debe funcionar en distintos tamaños de pantalla
- **Compatibilidad:** 
  - Soporte para navegadores modernos (Chrome, Safari, Edge)
  - Compatibilidad con Web Speech API para comandos y síntesis de voz
  - Compatibilidad futura con APIs de cámara y sensores
- **Rendimiento:**
  - Reconocimiento de voz con latencia menor a 3 segundos
  - Feedback visual inmediato de comandos reconocidos
  - Respuesta inmediata al acelerómetro (futuro)
  - Detección facial en tiempo real (futuro)
- **Privacidad:** 
  - Los archivos de usuarios se mantienen en almacenamiento local
  - No se almacena ningún dato en servidores externos
  - No se guardan imágenes de rostros ni datos de sensores
- **Accesibilidad:**
  - Interfaz clara y fácil de usar
  - Feedback visual para todas las acciones
  - Soporte para múltiples variantes de comandos
  - Múltiples opciones de control para diferentes necesidades

## 4. Casos de Uso Principales  

### Caso de uso 1: Lectura con Comandos de Voz
**Actor:** Usuario

**Descripción:** Proceso de visualización y control de documentos PDF o contenido web mediante comandos de voz.

**Precondiciones:** 
- El usuario tiene acceso a la aplicación web
- El usuario dispone de un archivo PDF o URL para cargar
- El dispositivo tiene micrófono funcional

**Flujo principal:**
1. El usuario abre la aplicación y selecciona la opción "Cargar PDF" o "Ingresar URL"
2. El sistema valida el formato del archivo o accesibilidad de la URL
3. El usuario selecciona el modo de "Comandos de Voz"
4. El sistema solicita permiso para acceder al micrófono
5. Una vez concedido el permiso:
   - El sistema muestra instrucciones de uso
   - Activa el reconocimiento de voz
   - Muestra feedback visual del estado del micrófono
6. El usuario puede navegar usando comandos como:
   - "Siguiente página" o "Anterior"
   - "Arriba" o "Abajo" para desplazamiento
   - "Inicio" o "Final" de página

**Flujos alternativos:**
1. Si el archivo no es válido o la URL no es accesible:
   - El sistema muestra un mensaje de error
   - Permite al usuario intentar nuevamente
2. Si el permiso del micrófono es denegado:
   - El sistema notifica al usuario
3. Durante la lectura:
   - El usuario puede ver la lista de comandos disponibles
   - El usuario puede detener/reactivar el reconocimiento de voz

**Postcondiciones:**
- El documento se visualiza correctamente
- Los comandos de voz funcionan según lo esperado
- El sistema muestra feedback visual de los comandos reconocidos


### Caso de uso 2: Lectura con Síntesis de Voz

**Actor:** Usuario

**Descripción:** Proceso de lectura automática del contenido mediante síntesis de voz.

**Precondiciones:**
- El usuario tiene acceso a la aplicación web
- El usuario dispone de un archivo PDF o URL para cargar
- El dispositivo tiene soporte para síntesis de voz

**Flujo principal:**
1. El usuario carga un documento o URL
2. El usuario selecciona el modo "Síntesis de Voz"
3. El sistema muestra las opciones de configuración:
   - Selección de voz
   - Control de velocidad
   - Controles de reproducción
4. El usuario configura las preferencias de voz
5. El sistema comienza la lectura automática del contenido

**Flujos alternativos:**
1. Control durante la lectura:
   - El usuario puede pausar/reanudar la lectura
   - El usuario puede ajustar la velocidad
   - El usuario puede cambiar la voz
2. Si no hay voces disponibles:
   - El sistema muestra un mensaje informativo

**Postcondiciones:**
- El contenido se lee correctamente
- El usuario puede controlar la lectura en cualquier momento


### Caso de uso 3: Login y Registro

**Actor:** Usuario no autenticado

**Descripción:** Proceso de autenticación y registro de usuarios en la aplicación.

**Precondiciones:**
- El usuario tiene acceso a la aplicación web
- El usuario tiene una cuenta de correo electrónico válida

**Flujo principal:**
1. El usuario accede a la página de inicio
2. El usuario selecciona "Iniciar sesión" o "Registrarse"
3. Para inicio de sesión:
   - Ingresa correo y contraseña
   - El sistema valida las credenciales
   - Accede a su cuenta personal
4. Para registro:
   - Ingresa datos requeridos (nombre, correo, contraseña)
   - El sistema valida el formato de los datos
   - Se crea la cuenta y se inicia sesión automáticamente

**Flujos alternativos:**
1. Si las credenciales son inválidas:
   - El sistema muestra mensaje de error
   - Permite reintentar o recuperar contraseña
2. Si el correo ya está registrado:
   - El sistema notifica al usuario
   - Sugiere iniciar sesión o recuperar contraseña

**Postcondiciones:**
- El usuario queda autenticado en el sistema
- Accede a funcionalidades premium
- Sus datos y preferencias se sincronizan

## 6. Tecnologías y Arquitectura Inicial
- **Frontend:** 
  - Angular (standalone components)

- **APIs del Navegador:**
  - SpeechRecognition para comandos de voz
  - SpeechSynthesis para lectura de texto
  - PDFjs para manejo de PDFs

- **Características Técnicas:**
  - Arquitectura modular por features
  - Componentes independientes y reutilizables
  - Manejo de estados para feedback visual
  - Sin dependencia de backend

- **Futuras Implementaciones:**
  - Backend con Node.js y Prisma ORM
  - Base de datos PostgreSQL para usuarios
  - Almacenamiento en la nube
  - APIs para detección facial y acelerómetro



