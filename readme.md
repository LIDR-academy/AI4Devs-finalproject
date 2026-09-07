## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
    Fernando Castro Medina
### **0.2. Nombre del proyecto:**
    TejaFlow
### **0.3. Descripción breve del proyecto:**
    TejaFlow es una plataforma ERP especializada para la industria del techado que optimiza la cadena de suministro, el control de inventario por lotes y la gestión de ventas de tejas, transformando la logística pesada en procesos digitales ágiles y rentables.
### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio
https://github.com/fernme37/AI4Devs-finalproject


---

## 1. Descripción general del producto

### **1.1. Objetivo:**

1. Propósito del Producto (Por qué existe)

El propósito central de la plataforma es digitalizar y optimizar el complejo ciclo operativo del manejo de tejas. A diferencia de un software de punto de venta genérico, esta aplicación está construida para comprender el inventario pesado por volumen, las variantes específicas de materiales (barro, cemento, fibrocemento) y los cálculos arquitectónicos, uniendo la producción, el almacenamiento en patio y la entrega final en la obra.

2. Valor que Entrega (El beneficio que aporta)

* Precisión en la Estimación: Traduce las medidas de los planos de construcción en cantidades exactas de tejas, reduciendo el desperdicio de material y eliminando las costosas faltas de stock de último minuto en la obra.

* Optimización Logística: Las tejas son un producto excepcionalmente pesado y frágil. La app calcula el peso y volumen total de los pedidos automáticamente, permitiendo asignar el camión de flete correcto (por ejemplo, camión torton, plataforma o grúa) de inmediato.

* Claridad Financiera en Tiempo Real: Calcula instantáneamente los costos de venta junto con descuentos por volumen, tarifas de flete variables e impuestos, protegiendo los márgenes de ganancia en pedidos de mayoreo.

3. Qué Resuelve (Los problemas que soluciona)

* El Factor "Rotura" y Descuadres de Stock: Las tejas sufren quiebres constantes durante el transporte y acomodo. La app resuelve esto introduciendo un "margen de merma" en el inventario y registrando de forma automática las bajas por material dañado.

* El Dolor de Cabeza del Cálculo por Plano: Los vendedores suelen batallar para calcular cuántas piezas se necesitan según la inclinación o pendiente de un techo. La app elimina el error humano con una calculadora integrada (Área + % de Pendiente = Cantidad Exacta).

* Caos en Entregas Parciales: Los pedidos grandes de constructoras rara vez se entregan de un solo golpe debido al espacio en la obra. La app gestiona despachos parciales, mostrando exactamente cuántas tejas han salido del almacén y cuántas quedan pendientes por entregar.

4. ¿Para Quién? (El Público Objetivo)

* Usuarios Internos (Dentro de tu empresa):

    - Vendedores y Cotizadores: Personal de primera línea que necesita una interfaz rápida para armar presupuestos, aplicar descuentos por niveles de distribuidor y revisar el stock en tiempo real frente al cliente.

* Gerentes de Almacén y Patio de Carga: Operadores logísticos que requieren ver la entrada de lotes de producción, organizar los pallets en el patio, registrar mermas y generar los manifiestos de carga para los choferes.

* Administradores y Dueños del Negocio: Directivos que necesitan tableros visuales para medir los ingresos mensuales, identificar qué modelos de tejas se venden más y planificar cuándo comprar o fabricar más stock.

### **1.2. Características y funcionalidades principales:**

1. Gestión Avanzada de Inventario y Patio de CargaControl de Stock por Variantes y Lotes: 

Permite registrar cada modelo de teja clasificándolo por material (barro, concreto, policarbonato, fibrocemento), color, dimensiones y lote de producción (crucial para evitar variaciones de tono en una misma obra).Módulo Automático de Merma y Rotura: Sistema para que el personal del patio registre tejas rotas o dañadas durante el traslado. Resta automáticamente estas piezas del stock disponible y genera un reporte de pérdidas financieras sin descuadrar el inventario teórico.Alertas de Reorden Inteligente: Notificaciones automáticas cuando el stock de un modelo específico de teja baje del mínimo seguro, calculando el tiempo que tarda la fábrica o proveedor en resurtir.

2. Motor de Cotización y Cálculo ArquitectónicoCalculadora Integrada de Pendiente y Superficie: 

El vendedor introduce los metros cuadrados de la base del techo y el porcentaje de inclinación (pendiente). La app calcula automáticamente los metros cuadrados reales de la cubierta y la cantidad exacta de piezas necesarias.Calculador del Margen de Quiebre (Desperdicio): Añade automáticamente un porcentaje configurable (usualmente entre el 5% y 10%) al total de tejas calculadas para cubrir los cortes en los remates del techo y las posibles roturas en la instalación, asegurando que el cliente no se quede sin material a mitad del proyecto.Matriz de Precios Dinámica (Mayoreo y Distribuidores): Ajusta el precio unitario de la teja de forma automática según el volumen de la compra o el tipo de cliente (constructor, distribuidor, cliente final).

3. Logística de Despacho y Entregas ParcialesAsistente de Peso y Cubicaje para Fletes: 

Suma el peso unitario de cada teja multiplicándolo por el pedido. El sistema indica el peso total de la carga y sugiere el tipo de camión necesario (evitando multas por sobrepeso o daños en la suspensión del transporte).Control de Entregas Parciales y Saldos: Permite registrar si un pedido de 10,000 tejas se entregará en tres partes. Genera notas de remisión específicas para cada salida, mostrando en tiempo real cuántas tejas ya se entregaron y cuántas quedan "en saldo" dentro del almacén.Hojas de Ruta para Choferes: Genera un manifiesto de carga digital con la dirección de entrega, indicaciones de descarga (por ejemplo, "requiere montacargas") y un espacio para la firma digital de recibido del cliente.

4. Administración y Roles de Seguridad

Permisos de Usuario por Rol:

* Vendedores: Solo pueden ver precios, existencias y crear cotizaciones.
* Almacenistas: Solo pueden modificar entradas, salidas y registrar mermas.
* Administradores: Tienen acceso total a costos de producción, reportes de ganancias y modificación de precios.

Historial de Auditoría: Registro de "quién hizo qué". Si se modificó el stock manual de una teja de forma inusual o se aplicó un descuento extraordinario, el sistema guarda el nombre del usuario, la fecha y la hora.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

La robustez de Microsoft SQL Server, junto con el rendimiento masivo de .NET 10 / ASP.NET Core y la agilidad de Vue.js 3 con TypeScript y PrimeVue, dan una aplicación de administración y ventas de tejas ultra rápida, segura y altamente escalable.

+-----------------------------------------------------------------------------------+

|                        CAPA DE PRESENTACIÓN (FRONTEND SPA)                        |
|                                                                                   |
|  [ HTML5 / CSS3 / TypeScript / Vue.js 3 ]                                         |
|         │                                                                         |
|         ├──► Panel de Ventas: Calculadora de pendientes y metraje (TypeScript).   |
|         ├──► Gestión de Patio: Modales de registro de merma y mermas (PrimeVue).  |
|         └──► Componentes Visuales: DataTables de PrimeVue estilizados con CSS3.    |
+-----------------------------------------------------------------------------------+
                                         │
                                         │ Peticiones HTTPS (JSON)
                                         │ Autenticación vía JWT Bearer Tokens
                                         ▼
+-----------------------------------------------------------------------------------+

|                         CAPA DE NEGOCIO (BACKEND API REST)                        |
|                                                                                   |
|  [ ASP.NET Core Web API (.NET 10) ]                                               |
|         │                                                                         |
|         ├──► Controladores (Controllers): Endpoints expuestos para la SPA.        |
|         ├──► Servicios C#: Lógica de peso/cubicaje para camiones y saldos de tejas.|
|         └──► Entity Framework Core 10 (EF Core): ORM para mapear la base de datos.|
+-----------------------------------------------------------------------------------+
                                         │
                                         │ Consultas LinQ / SQL Compilado
                                         │ Transacciones Seguras (TransactionScope)
                                         ▼
+-----------------------------------------------------------------------------------+

|                          CAPA DE PERSISTENCIA (DATOS)                             |
|                                                                                   |
|  [ Microsoft SQL Server 2022+ ]                                                   |
|         │                                                                         |
|         ├──► Tablas Relacionales: Clientes, Tejas, Lotes, Ventas, Entregas.       |
|         └──► Procedimientos / Índices: Optimización para reportes de stock.       |
+-----------------------------------------------------------------------------------+

La arquitectura planteada para TejaFlow sigue un patrón de diseño e ingeniería de software muy claro y extendido en la industria actual. A continuación, se explica el patrón utilizado, la justificación de su elección, sus beneficios clave y las desventajas (o compensaciones) que debes tener en cuenta.
------------------------------
## 1. Patrón Arquitectónico Seguido
El sistema sigue el patrón Arquitectura de Tres Capas (Three-Tier Architecture) combinado con un estilo arquitectónico Desacoplado basado en API REST.
Las tres capas están claramente separadas en su responsabilidad:

* Capa de Presentación (Frontend SPA): Construida con Vue.js y PrimeVue. Su única función es pintar la interfaz y capturar las interacciones del usuario.
* Capa de Lógica de Negocio (Backend API): Procesa las reglas del negocio (cálculos de pendientes, mermas, cubicaje de camiones).
* Capa de Datos (Base de Datos): Almacena y asegura la persistencia de la información (pedidos, clientes, inventario).

------------------------------
## 2. Justificación de la Elección (Por qué esta arquitectura)
Para un negocio de administración y ventas de tejas, un enfoque tradicional donde el servidor web renderiza y recarga toda la página en cada clic (como el PHP de la vieja escuela) sería ineficiente.
Se eligió esta arquitectura porque el comportamiento de un ERP debe emular al de una aplicación de escritorio. Los vendedores están en el teléfono con un cliente cotizando metros cuadrados de teja o los almacenistas están registrando una merma en el patio de carga; necesitan que la aplicación responda al instante, guarde datos en segundo plano y actualice las tablas de stock en tiempo real sin pestañear ni recargar pantallas completas.
------------------------------
## 3. Beneficios Clave (Ventajas que justifican su uso)

* Rendimiento y Reactividad Extrema: Al ser una SPA (Single Page Application), el navegador descarga el diseño visual de PrimeVue una sola vez. A partir de ahí, solo viajan datos puros en formato JSON a través de la API REST. Esto hace que la navegación entre pestañas (de inventario a ventas) sea instantánea.
* Desacoplamiento y Escalabilidad: El Frontend y el Backend son totalmente independientes. Si en el futuro decides crear una aplicación móvil nativa para que los choferes firmen las entregas de tejas en la obra, no tendrás que reprogramar el sistema; la app móvil se conectará exactamente a la misma API REST que ya utilizas.
* Mantenimiento Sencillo: Si hay un error en la fórmula matemática del cálculo de pendientes de techos, solo se modifica el código en el Backend. El Frontend no se entera ni requiere una actualización o nueva compilación.
* Especialización del Equipo: Permite que un desarrollador se enfoque al 100% en que la interfaz HTML/TypeScript de PrimeVue se vea hermosa y sea intuitiva, mientras otro trabaja exclusivamente en la seguridad y las consultas de la base de datos.

------------------------------
## 4. Desventajas y Trade-offs (Lo que debes sacrificar)
Ninguna arquitectura es perfecta. Al elegir este modelo, aceptas las siguientes compensaciones:

* Mayor Complejidad Inicial: Tienes que configurar, desarrollar y desplegar dos proyectos de software independientes (el Frontend y el Backend). Esto requiere manejar políticas de seguridad como CORS (Cross-Origin Resource Sharing) para que el navegador permita que que el frontend hable con el backend de forma segura.
* Carga Inicial del Cliente: La primera vez que un vendedor abra la aplicación por la mañana, el navegador tardará un par de segundos en descargar todo el JavaScript de la SPA y los componentes de PrimeVue. Una vez cargado vuela, pero esa primera carga es el "precio" a pagar.
* Problemas de SEO (Posicionamiento en Google): Las SPAs puras no se llevan bien con los motores de búsqueda porque el HTML inicial llega casi vacío y se llena con JavaScript. Nota: Para el panel de administración esto no importa en absoluto (ya que es privado), pero si decides poner el catálogo de tejas al público general en el futuro, se tendrá que activar el modo híbrido (SSR) de SvelteKit/Nuxt para que Google pueda indexar tus productos.
* Duplicidad de Validaciones: Por seguridad, tendrás que validar los datos dos veces. Por ejemplo, si una teja no puede venderse en cantidades negativas, debes poner esa regla en el formulario del Frontend (para que el usuario lo vea) y también en el Backend (para evitar hackeos o peticiones corruptas).

### **2.2. Descripción de componentes principales:**

## 1. Frontend: La Interfaz de Ventas e Inventario

* Rol: El navegador web descarga los archivos compilados de Vue.js 3 y TypeScript. La SPA se comunica con el servidor .NET 10 asíncronamente mediante fetch o axios.
* Uso con PrimeVue: Se usarán componentes nativos de PrimeVue (como el <DataTable> para listar las tejas por lote y color, y el <Dialog> para capturar las mermas en el patio). TypeScript asegura que los objetos recibidos de la API de .NET coincidan exactamente en sus tipos de datos (evitando dolores de cabeza con valores null o vacíos).

## 2. Backend: El Motor de Reglas de Negocio (.NET 10)

* Rol: Un servicio de ASP.NET Core Web API de alto rendimiento. .NET 10 incluye optimizaciones extremas en el recolector de basura (GC) y procesamiento de JSON, haciendo que las peticiones vuelen.
* Uso con EF Core 10: En lugar de escribir consultas SQL a mano para actualizar el stock, utilizas Entity Framework Core. Mediante consultas LINQ fuertemente tipadas, EF Core se encarga de leer, insertar y actualizar los pedidos de tejas en la base de datos de manera limpia, además de soportar migraciones de código (Code-First).

## 3. Base de Datos: El Guardián del Almacén (SQL Server)

* Rol: Un motor de base de datos relacional de nivel corporativo.
* Uso en el negocio de tejas: Maneja de forma estricta la integridad referencial. Gracias al soporte transaccional nativo que hereda desde EF Core, si un vendedor confirma un pedido, SQL Server garantiza que el inventario de tejas disminuya y la cuenta por cobrar del cliente aumente en una sola operación atómica. Si el camión de flete no pasa las validaciones de peso, la transacción hace un Rollback completo previniendo datos corruptos.

------------------------------

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

------------------------------
## 📂 Estructura General del Proyecto (Solución Única: TejaFlow)

TejaFlowApp/
├── backend/                  # Solución de ASP.NET Core (.NET 10)
│   ├── TejaFlow.Domain/      # Entidades puras y lógica del negocio principal (Tejas, Lotes)
│   ├── TejaFlow.Application/ # Casos de uso, interfaces de repositorios y DTOs
│   ├── TejaFlow.Infrastructure/# Acceso a datos (EF Core, SQL Server 2026) y fletes
│   └── TejaFlow.WebApi/      # Controllers de ASP.NET Core y autenticación JWT
└── frontend/                 # Aplicación SPA (Vue.js 3, TypeScript, Vite)
    ├── src/
    │   ├── assets/           # Estilos CSS3 globales e imágenes corporativas
    │   ├── components/       # Componentes PrimeVue reutilizables globales
    │   ├── core/             # Tipos de TypeScript, clientes API e interceptores de tokens
    │   ├── features/         # Módulos del negocio de tejas
    │   │   ├── inventario/   # Control de stock por lotes/color y registro de mermas
    │   │   └── ventas/       # Componentes de cotización y despacho de pedidos
    │   ├── App.vue           # Componente raíz de la SPA
    │   └── main.ts           # Inicialización de Vue 3 y registro de PrimeVue

------------------------------

   1. TejaFlow.Domain: Aloja tus clases maestras como Teja.cs, Lote.cs y Merma.cs. Ninguna línea de código aquí sabe que existe SQL Server; son reglas de negocio puras.
   2. TejaFlow.Application: Implementa los flujos del sistema como CalcularFleteTejas.cs o RegistrarPedidoDetallado.cs.
   3. TejaFlow.Infrastructure: Contiene tu archivo TejaFlowDbContext.cs. Usando Entity Framework Core 10, mapea las clases de C# directamente a tus tablas físicas en SQL Server.
   4. TejaFlow.WebApi: Expone los endpoints de tu API REST (ej. https://tejaflow.com). Protege las operaciones críticas mediante la directiva [Authorize].

------------------------------

* Las llamadas HTTP dirigidas a /api/ventas o /api/inventario se gestionan en la carpeta src/core/.
* Las vistas del panel de administración importan los componentes avanzados de PrimeVue (como el <DataTable> para auditar las mermas o buscar tipos de tejas), y se estilizan de manera responsiva utilizando CSS3.


### **2.4. Infraestructura y despliegue**

Entorno de Oracle Cloud Free Tier, una infraestructura en la nube y completamente integrada al repositorio de GitHub mediante un pipeline de CI/CD con GitHub Actions.

------------------------------
## 🌐 Diagrama de Infraestructura y Despliegue (Oracle Cloud + GitHub)

[ REPOSITORIO GITHUB ] ──(git push main)──► [ GITHUB ACTIONS ]
                                                    │
                                                    │ Construye imágenes Docker
                                                    ▼ y las sube de forma segura
                                            [ GITHUB CONTAINER REGISTRY ]
                                                    │
                                                    │ Conexión SSH (Llave Privada)
                                                    ▼ Envía orden de actualización
+-----------------------------------------------------------------------------------+

| INSTANCIA DE ORACLE CLOUD (VPS Siempre Gratis - Ubuntu Linux)                     |
|                                                                                   |
|  +---------------------------+                                                    |
|  | PROXY INVERSO / SSL       | ◄─── (Acceso Usuarios vía HTTPS / Puerto 443)      |
|  | (Nginx)                   |                                                    |
|  +---------------------------+                                                    |
|                │                                                                  |
|                │ Red Interna Docker                                               |
|                ▼                                                                  |
|  +---------------------------+              +----------------------------------+  |
|  | CONTENEDOR 1: FRONTEND    |              | CONTENEDOR 2: BACKEND            |  |
|  | (Vue.js 3 + PrimeVue)     |              | (.NET 10 ASP.NET Core)           |  |
|  +---------------------------+              +----------------------------------+  |
|                                                               │                   |
|                                                               │ Conexión TCP/IP   |
|                                                               ▼ (Puerto 1433)     |
|  +---------------------------+              +----------------------------------+  |
|  | VOLUMEN PERMANENTE        | ◄────────────| CONTENEDOR 3: BASE DE DATOS      |  |
|  | (tejaflow_production_data)|              | (SQL Server)                     |  |
|  +---------------------------+              +----------------------------------+  |
+-----------------------------------------------------------------------------------+

------------------------------
## ⚙️ Detalle de la Infraestructura en Oracle Cloud
Al utilizar la capa gratuita de Oracle, se configura una máquina virtual basada en arquitectura ARM (Ampere) con Ubuntu Linux, asignándole recursos dedicados:

   1. El Servidor VPS: Le asignaremos 2 o 3 vCPUs y de 8 a 12 GB de RAM (Oracle te permite hasta 24 GB de forma gratuita [1]). Esta cantidad de memoria es ideal para que SQL Server funcione con máxima soltura junto a .NET 10, respondiendo a las consultas de inventario en milisegundos.
   2. Capa Perimetral (Nginx + SSL): Instalado directamente en la máquina virtual, se encarga de recibir las conexiones seguras en el puerto 443 (HTTPS) mediante un certificado gratuito de Let's Encrypt. Nginx sirve la SPA de Vue.js 3 y redirige las llamadas de la API al contenedor interno de .NET.
   3. Aislamiento con Docker Compose: Dentro del VPS, los tres servicios corren en contenedores aislados. El puerto de SQL Server (1433) queda bloqueado para el internet público mediante el Firewall de Oracle y las tablas de iptables de Docker, permitiendo conexiones únicamente desde el contenedor del backend de .NET 10.

------------------------------
## 🚀 El Proceso de Despliegue Automatizado (Pipeline CI/CD)
Todo el flujo se dispara de forma automática sin que tener que entrar a la consola de Oracle a escribir comandos manualmente:
## Paso 1: Compilación en la Nube de GitHub
Al hacer git push a la rama main en tu repositorio de GitHub, GitHub Actions activa un flujo de trabajo. Descarga tu código, compila la SPA de Vue validando el código de TypeScript, y compila tu API de .NET 10 asegurando que no haya errores de C#.
## Paso 2: Publicación de Imágenes Cifradas
GitHub empaqueta tu Frontend y tu Backend en imágenes Docker optimizadas para producción y las publica de forma privada en su propio registro seguro: GitHub Container Registry (GHCR).
## Paso 3: Conexión Segura vía SSH y Despliegue
GitHub Actions lee la IP de tu VPS de Oracle y tu llave SSH privada desde la sección segura de GitHub Secrets. Se conecta a tu servidor y ejecuta de forma remota las siguientes instrucciones:

   1. Hace un login seguro en GHCR y descarga las imágenes recién compiladas (docker compose pull).
   2. Reinicia los contenedores de la aplicación sin perder datos (docker compose up -d).
   3. El contenedor de .NET 10 arranca y, antes de abrir el servicio a los vendedores, ejecuta automáticamente las migraciones pendientes de Entity Framework Core 10 en tu instancia de SQL Server, adaptando las tablas de lotes o ventas al instante.


### **2.5. Seguridad**

Para proteger la información financiera de tus ventas, el inventario de almacén y los datos de clientes en TejaFlow, se implementa una estrategia de Seguridad en Profundidad (Defense in Depth). Al utilizar un stack empresarial moderno (SQL Server, .NET 10, Vue.js 3 con TypeScript y GitHub Actions), la aplicación cuenta con capas de protección en cada nivel.
A continuación, se enumeran y describen las prácticas de seguridad clave implementadas:
------------------------------
## 🔑 1. Autenticación y Autorización Basada en Roles (RBAC) con JWT
Para evitar que usuarios no autorizados accedan al panel de ventas o alteren el stock, el backend de ASP.NET Core implementa tokens JWT (JSON Web Tokens) cifrados y firmados con un algoritmo seguro (HMAC-SHA256).

* Cómo funciona: El usuario inicia sesión y el servidor le devuelve un token de corta duración. El frontend de Vue.js almacena este token de forma segura y lo adjunta automáticamente en cada petición HTTP en la cabecera Authorization: Bearer <token>.
* Ejemplo en .NET 10: El backend protege los endpoints usando decoradores nativos. Si un almacenista intenta acceder al endpoint de facturación, el servidor bloquea la petición antes de ejecutar el código:

[Authorize(Roles = "Administrador,GerenteVentas")]
[HttpPost("aplicar-descuento-tejas")]public IActionResult AplicarDescuento([FromBody] DescuentoDto dto) {
    // Solo administradores o gerentes pueden ejecutar esta lógica
    return Ok();
}


## 🦺 2. Prevención de Inyección de Código (SQL Injection y XSS)
Los ataques de inyección ocurren cuando un atacante mete código malicioso en un formulario de la web para intentar hackear el sistema.

* En la Base de Datos (SQL Injection): Al utilizar Entity Framework Core 10 en lugar de consultas de texto plano, todas las peticiones a SQL Server se ejecutan mediante consultas parametrizadas automáticas. SQL Server trata los datos introducidos por el usuario estrictamente como texto, nunca como código ejecutable.
* En la Interfaz Web (XSS - Cross-Site Scripting): El motor de renderizado de Vue.js 3 escapa automáticamente cualquier texto que pongas entre llaves ({{ teja.nombre }}). Si un atacante registra un cliente con el nombre <script>stealCookies()</script>, Vue lo imprimirá literalmente en pantalla como texto inofensivo en lugar de ejecutar el script.

## 🌐 3. Cifrado de Datos en Tránsito (HTTPS y TLS) y Configuración de CORS
Toda la comunicación entre los navegadores de tus vendedores y tu servidor en Oracle Cloud debe estar completamente encriptada.

* HTTPS con Let's Encrypt: El proxy inverso Nginx en tu VPS de Oracle Cloud intercepta el tráfico y obliga a usar TLS 1.3. Esto evita ataques de intercepción (Man-in-the-Middle), impidiendo que alguien robe las contraseñas o altere el precio de las tejas en una red Wi-Fi pública.
* CORS Estricto (.NET 10): Se restringe qué páginas web tienen permitido hablar con tu API. El backend de TejaFlow rechaza peticiones de cualquier dominio que no sea el dominio oficial de tu aplicación.
* Ejemplo de configuración en Program.cs de .NET 10:

builder.Services.AddCors(options => {
    options.AddPolicy("ProdPolicy", policy => {
        policy.WithOrigins("https://tejaflow.com") // Solo se permite tu frontend oficial
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});


## 🔒 4. Aislamiento de Infraestructura de Red en Docker y Oracle Cloud
Un error común es dejar los puertos de la base de datos abiertos a internet, facilitando ataques de fuerza bruta.

* Cómo funciona: Mediante Docker Compose, el contenedor de SQL Server opera dentro de una red virtual privada y aislada de Docker (tejaflow_network). El puerto 1433 de SQL Server no se publica hacia el exterior del servidor VPS.
* Ejemplo práctico: El backend de .NET se conecta a la base de datos usando el nombre interno del servicio de Docker (Server=database;...). Si un atacante escanea la IP pública de tu servidor de Oracle Cloud, solo verá abierto el puerto 443 (Nginx), haciendo que la base de datos sea completamente invisible e inaccesible desde el internet público.

## 🚀 5. Gestión Segura de Credenciales con GitHub Secrets
Para evitar que contraseñas, llaves de servidores o credenciales de SQL Server queden expuestas públicamente por error, el código fuente en GitHub nunca debe contener estos datos.

* Cómo funciona: Las cadenas de conexión de producción y las llaves SSH se almacenan en la sección GitHub Secrets de tu repositorio. El pipeline de GitHub Actions las inyecta en memoria únicamente durante el proceso de despliegue automatizado.
* Ejemplo en el pipeline (deploy.yml):

- name: Desplegar en Oracle Cloud vía SSH
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.ORACLE_VPS_IP }}
    username: ${{ secrets.ORACLE_VPS_USER }}
    key: ${{ secrets.ORACLE_SSH_PRIVATE_KEY }}
    script: |
      cd /var/www/tejaflow
      docker compose pull
      docker compose up -d

### **2.6. Tests**

Para garantizar que TejaFlow opere libre de errores críticos al calcular cotizaciones, gestionar el inventario pesado y procesar datos financieros en producción, se implementaron tres niveles de pruebas esenciales dentro del flujo de desarrollo y de GitHub Actions:
------------------------------
## 🧪 1. Pruebas Unitarias (Unit Tests) — Backend & Frontend
Se encargan de evaluar de forma aislada que una función matemática, algoritmo o regla de negocio específica dé el resultado correcto ante diferentes escenarios, sin conectarse a la base de datos real.

* En el Backend (.NET 10 con xUnit): Validar el algoritmo de la calculadora arquitectónica de pendientes para la venta de tejas.
* Ejemplo de prueba: Si el vendedor ingresa una base de techo de $100\text{ m}^2$ con una inclinación del 30%, la función debe retornar exactamente las piezas correspondientes más el 10% de margen de merma. Si retorna menos o un valor negativo, la prueba falla e interrumpe el pipeline en GitHub.
* En el Frontend (Vue.js con Vitest): Validar componentes puros de TypeScript que formatean datos.
* Ejemplo de prueba: Verificar que una función que calcula el peso total de las tejas para los fletes convierta correctamente las unidades de kilogramos a toneladas métricas.

## ⚙️ 2. Pruebas de Integración (Integration Tests) — Capa de Datos
Evalúan que múltiples componentes del sistema interactúen correctamente entre sí, enfocándose principalmente en la comunicación entre el código y la base de datos.

* En el Backend (.NET 10 + EF Core + SQL Server): Validar que las transacciones y consultas complejas se escriban correctamente en SQL Server.
* Ejemplo de prueba: Simular la baja de 500 tejas coloniales por concepto de "Merma/Rotura" en el patio de carga. La prueba verifica físicamente en una base de datos de pruebas que el stock disminuya exactamente en 500 unidades y que se inserte una fila en la tabla de auditoría con el ID del almacenista correspondiente.

## 🛡️ 3. Pruebas de Seguridad y Acceso (Security & Authorization Tests)
Verifican que las políticas de seguridad basadas en roles (RBAC) y los mecanismos de cifrado funcionen con total rigidez para proteger el ERP.

* En el Backend (ASP.NET Core REST API): Validar el bloqueo de endpoints protegidos.
* Ejemplo de prueba: El pipeline realiza una petición HTTP simulada al endpoint /api/ventas/aplicar-descuento-tejas enviando un token JWT que pertenece a un usuario con rol de Almacenista. La prueba es exitosa únicamente si el servidor .NET responde con un código de estado 403 Forbidden (Acceso Denegado), demostrando que un empleado de patio no puede alterar los precios de venta.

------------------------------
## 🚀 Integración en GitHub Actions
Todas estas pruebas se ejecutan de forma automatizada dentro de tu archivo .github/workflows/deploy.yml cada vez que haces un git push. Si un desarrollador altera accidentalmente una fórmula de cálculo o desprotege un endpoint, las pruebas fallarán en la nube de GitHub y el sistema bloqueará el despliegue automático hacia tu VPS de Oracle Cloud, protegiendo la estabilidad de tu negocio.


---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

A continuación, se detalla el modelo de datos relacional para TejaFlow diseñado específicamente para implementarse en Microsoft SQL Server 2026 a través de Entity Framework Core 10.
El diagrama utiliza la sintaxis extendida de Mermaid, detallando tipos de datos nativos de SQL Server, llaves primarias (PK), llaves foráneas (FK), restricciones de obligatoriedad (not null) y la cardinalidad exacta de las relaciones del negocio de las tejas.
## 📊 Diagrama del Modelo de Datos (Mermaid)

erDiagram
    USUARIO {
        INT id_usuario PK "identity(1,1)"
        VARCHAR_100 nombre "not null"
        VARCHAR_100 email "not null, unique"
        VARCHAR_255 password_hash "not null"
        VARCHAR_30 rol "not null (Admin, Vendedor, Almacenista)"
        DATETIME2 fecha_registro "not null, default GETDATE()"
        BIT activo "not null, default 1"
    }

    PRODUCTO_TEJA {
        INT id_teja PK "identity(1,1)"
        VARCHAR_100 modelo "not null (Colonial, Francesa, etc)"
        VARCHAR_50 material "not null (Barro, Concreto, Plastico)"
        VARCHAR_50 color "not null"
        DECIMAL_5_2 longitud_cm "not null"
        DECIMAL_5_2 ancho_cm "not null"
        DECIMAL_4_2 peso_kg "not null"
        DECIMAL_10_2 precio_base "not null"
        INT stock_global "not null, default 0"
        INT stock_minimo_alerta "not null"
    }

    LOTE_PRODUCCION {
        INT id_lote PK "identity(1,1)"
        INT id_teja FK "not null"
        VARCHAR_50 codigo_lote "not null, unique"
        DATETIME2 fecha_entrada "not null"
        INT cantidad_inicial "not null"
        INT cantidad_actual "not null"
    }

    MERMA_ROTURA {
        INT id_merma PK "identity(1,1)"
        INT id_lote FK "not null"
        INT id_usuario FK "not null (Almacenista que registra)"
        INT cantidad_rotas "not null"
        DATETIME2 fecha_registro "not null"
        VARCHAR_255 motivo "not null (Traslado, Defecto, Carga)"
    }

    CLIENTE {
        INT id_cliente PK "identity(1,1)"
        VARCHAR_150 razon_social "not null"
        VARCHAR_20 rfc_nit "not null, unique"
        VARCHAR_100 email "not null"
        VARCHAR_20 telefono "not null"
        VARCHAR_30 tipo_cliente "not null (Minorista, Mayorista, Distribuidor)"
    }

    PEDIDO_VENTA {
        INT id_pedido PK "identity(1,1)"
        INT id_cliente FK "not null"
        INT id_usuario FK "not null (Vendedor)"
        DATETIME2 fecha_pedido "not null"
        DECIMAL_12_2 subtotal "not null"
        DECIMAL_12_2 impuesto_iva "not null"
        DECIMAL_12_2 costo_flete "not null"
        DECIMAL_12_2 total "not null"
        VARCHAR_30 estado_pedido "not null (Cotizacion, Pagado, Despachado, Parcial)"
    }

    DETALLE_PEDIDO {
        INT id_detalle PK "identity(1,1)"
        INT id_pedido FK "not null"
        INT id_teja FK "not null"
        INT cantidad_solicitada "not null"
        DECIMAL_10_2 precio_unitario_aplicado "not null"
        DECIMAL_5_2 pendiente_techo_grados "not null"
        DECIMAL_10_2 metros_cuadrados_calculados "not null"
    }

    DESPACHO_FLETE {
        INT id_despacho PK "identity(1,1)"
        INT id_pedido FK "not null"
        INT id_usuario FK "not null (Almacenista/Chofer)"
        DATETIME2 fecha_salida "null"
        DATETIME2 fecha_entrega_real "null"
        DECIMAL_7_2 peso_total_carga_kg "not null"
        VARCHAR_50 placas_vehiculo "not null"
        VARCHAR_30 estado_entrega "not null (En_Ruta, Entregado, Cancelado)"
    }

    REMISION_PARCIAL {
        INT id_remision PK "identity(1,1)"
        INT id_despacho FK "not null"
        INT id_detalle_pedido FK "not null"
        INT cantidad_entregada_lote "not null"
    }

    %% Definición de Relaciones de Cardinalidad
    USUARIO ||--o{ PEDIDO_VENTA : "registra"
    USUARIO ||--o{ MERMA_ROTURA : "reporta"
    USUARIO ||--o{ DESPACHO_FLETE : "conduce_o_valida"
    
    CLIENTE ||--o{ PEDIDO_VENTA : "realiza"
    
    PRODUCTO_TEJA ||--o{ LOTE_PRODUCCION : "se_divide_en"
    PRODUCTO_TEJA ||--o{ DETALLE_PEDIDO : "se_incluye_en"
    
    LOTE_PRODUCCION ||--o{ MERMA_ROTURA : "sufre"
    
    PEDIDO_VENTA ||--|{ DETALLE_PEDIDO : "contiene"
    PEDIDO_VENTA ||--o{ DESPACHO_FLETE : "se_envia_en"
    
    DESPACHO_FLETE ||--|{ REMISION_PARCIAL : "ampara"
    DETALLE_PEDIDO ||--o{ REMISION_PARCIAL : "se_despacha_en"

------------------------------
## 📝 Descripción del Comportamiento Logístico del Modelo
Este modelo relacional está estrictamente optimizado para solucionar las necesidades específicas del negocio de tejas descritas anteriormente:

   1. Manejo de Variaciones de Tono (Lotes): La tabla PRODUCTO_TEJA almacena el catálogo maestro de materiales y dimensiones. Sin embargo, las ventas y las mermas se descuentan de la tabla LOTE_PRODUCCION. Esto asegura que cuando un cliente compre tejas de barro, el sistema sepa exactamente de qué lote se tomaron, garantizando que el color sea uniforme en el techo del cliente.
   2. El Factor Rotura (MERMA_ROTURA): Está enlazado directamente a un LOTE_PRODUCCION y a un USUARIO (Almacenista). Permite auditar qué lotes de tejas salieron más frágiles de la fábrica y qué operarios registran más quiebres en el patio de carga.
   3. Auditoría e Integridad de Cálculos (DETALLE_PEDIDO): Guarda la pendiente_techo_grados y los metros_cuadrados_calculados introducidos en la pantalla de Vue.js de los vendedores. Si hay un reclamo posterior de que faltó material, el administrador puede revisar el plano y auditar si el cálculo matemático inicial fue correcto.
   4. Control de Entregas Parciales (REMISION_PARCIAL): Resuelve el problema de despachar pedidos masivos a constructoras. Un PEDIDO_VENTA puede tener múltiples registros en DESPACHO_FLETE (Camiones enviados). La tabla REMISION_PARCIAL une el artículo específico del pedido (DETALLE_PEDIDO) con el camión (DESPACHO_FLETE) para saber exactamente cuántas tejas de las 10,000 solicitadas ya se subieron al transporte y cuántas quedan en saldo.


### **3.2. Descripción de entidades principales:**

A continuación, se detalla la especificación técnica completa del modelo de datos relacional para TejaFlow, optimizado estructuralmente para Microsoft SQL Server y mapeado mediante la Fluent API de Entity Framework Core 10.
Cada entidad incluye el máximo nivel de detalle exigido para un entorno de base de datos empresarial.
------------------------------
## 1. Diccionario Técnico de Entidades y Atributos## Entidad: USUARIO
Representa al personal interno que opera el sistema (Administradores, Vendedores y Almacenistas).

* id_usuario (INT): Llave Primaria (PK). Autoincremental IDENTITY(1,1).
* nombre (VARCHAR(100)): Nombre completo del empleado. Restricción: NOT NULL.
* email (VARCHAR(100)): Correo institucional. Restricciones: NOT NULL, UNIQUE INDEX.
* password_hash (VARCHAR(255)): Contraseña encriptada con algoritmo seguro. Restricción: NOT NULL.
* rol (VARCHAR(30)): Rol de seguridad (Control de Acceso RBAC). Restricción: NOT NULL. Validación por check en código o base de datos: ('Admin', 'Vendedor', 'Almacenista').
* fecha_registro (DATETIME2): Auditoría de creación. Restricciones: NOT NULL, DEFAULT GETDATE().
* activo (BIT): Borrado lógico para deshabilitar usuarios. Restricciones: NOT NULL, DEFAULT 1.

## Entidad: PRODUCTO_TEJA
Catálogo maestro de modelos de tejas y sus especificaciones físicas/comerciales.

* id_teja (INT): Llave Primaria (PK). Autoincremental IDENTITY(1,1).
* modelo (VARCHAR(100)): Nombre comercial de la línea (Ej: "Colonial", "Romana", "Plana"). Restricción: NOT NULL.
* material (VARCHAR(50)): Composición física. Restricción: NOT NULL ('Barro', 'Concreto', 'Policarbonato', 'Fibrocemento').
* color (VARCHAR(50)): Tono o acabado estético. Restricción: NOT NULL.
* longitud_cm (DECIMAL(5,2)): Largo de la pieza. Restricción: NOT NULL.
* ancho_cm (DECIMAL(5,2)): Ancho de la pieza. Restricción: NOT NULL.
* peso_kg (DECIMAL(4,2)): Peso unitario crítico para el cálculo logístico de fletes. Restricción: NOT NULL.
* precio_base (DECIMAL(10,2)): Precio de lista antes de aplicar descuentos por volumen. Restricción: NOT NULL.
* stock_global (INT): Sumatoria calculada del inventario disponible. Restricciones: NOT NULL, DEFAULT 0, CHECK (stock_global >= 0).
* stock_minimo_alerta (INT): Umbral mínimo tolerado antes de disparar notificaciones de reorden. Restricción: NOT NULL.

## Entidad: LOTE_PRODUCCION
Control de inventario por lotes específicos de fabricación para mitigar las variaciones de tonalidad en la obra.

* id_lote (INT): Llave Primaria (PK). Autoincremental IDENTITY(1,1).
* id_teja (INT): Llave Foránea (FK). Relaciona con PRODUCTO_TEJA(id_teja). Restricción: NOT NULL.
* codigo_lote (VARCHAR(50)): Identificador único del lote (Ej: "LOT-202609-BARRO"). Restricciones: NOT NULL, UNIQUE INDEX.
* fecha_entrada (DATETIME2): Fecha en la que el lote ingresó al patio de carga. Restricción: NOT NULL.
* cantidad_inicial (INT): Cantidad original del lote al fabricarse o recibirse. Restricción: NOT NULL.
* cantidad_actual (INT): Unidades disponibles actualmente en el lote. Restricciones: NOT NULL, CHECK (cantidad_actual >= 0).

## Entidad: MERMA_ROTURA
Registro estricto y auditoría del material que sufre quiebres o daños en el patio o durante los traslados.

* id_merma (INT): Llave Primaria (PK). Autoincremental IDENTITY(1,1).
* id_lote (INT): Llave Foránea (FK). Relaciona con LOTE_PRODUCCION(id_lote). Restricción: NOT NULL.
* id_usuario (INT): Llave Foránea (FK). Relaciona con USUARIO(id_usuario). Identifica al almacenista que reporta. Restricción: NOT NULL.
* cantidad_rotas (INT): Número de tejas dadas de baja por daño. Restricción: NOT NULL, CHECK (cantidad_rotas > 0).
* fecha_registro (DATETIME2): Sello de tiempo del reporte. Restricciones: NOT NULL, DEFAULT GETDATE().
* motivo (VARCHAR(255)): Causa del daño (Ej: "Mal acomodo en montacargas", "Defecto de horneado"). Restricción: NOT NULL.

## Entidad: CLIENTE
Almacena la información de contacto y clasificación comercial de los compradores (B2B o B2C).

* id_cliente (INT): Llave Primaria (PK). Autoincremental IDENTITY(1,1).
* razon_social (VARCHAR(150)): Nombre legal o comercial de la constructora o particular. Restricción: NOT NULL.
* rfc_nit (VARCHAR(20)): Identificador fiscal para facturación. Restricciones: NOT NULL, UNIQUE INDEX.
* email (VARCHAR(100)): Correo para el envío de cotizaciones y facturas. Restricción: NOT NULL.
* telefono (VARCHAR(20)): Teléfono de contacto. Restricción: NOT NULL.
* tipo_cliente (VARCHAR(30)): Clasificación comercial. Restricción: NOT NULL ('Minorista', 'Mayorista', 'Distribuidor').

## Entidad: PEDIDO_VENTA
Encabezado de la transacción comercial. Controla los estados financieros y totales del pedido.

* id_pedido (INT): Llave Primaria (PK). Autoincremental IDENTITY(1,1).
* id_cliente (INT): Llave Foránea (FK). Relaciona con CLIENTE(id_cliente). Restricción: NOT NULL.
* id_usuario (INT): Llave Foránea (FK). Relaciona con USUARIO(id_usuario). Identifica al vendedor. Restricción: NOT NULL.
* fecha_pedido (DATETIME2): Fecha y hora de creación. Restricciones: NOT NULL, DEFAULT GETDATE().
* subtotal (DECIMAL(12,2)): Suma de los productos antes de impuestos y fletes. Restricción: NOT NULL.
* impuesto_iva (DECIMAL(12,2)): Monto impositivo aplicado. Restricción: NOT NULL.
* costo_flete (DECIMAL(12,2)): Costo logístico calculado por el peso del material. Restricción: NOT NULL.
* total (DECIMAL(12,2)): Monto neto a pagar. Restricción: NOT NULL.
* estado_pedido (VARCHAR(30)): Ciclo de vida del pedido. Restricción: NOT NULL ('Cotizacion', 'Pagado', 'Despachado', 'Parcial').

## Entidad: DETALLE_PEDIDO
Desglose de cada tipo de teja solicitada junto con la auditoría de los cálculos arquitectónicos del vendedor.

* id_detalle (INT): Llave Primaria (PK). Autoincremental IDENTITY(1,1).
* id_pedido (INT): Llave Foránea (FK). Relaciona con PEDIDO_VENTA(id_pedido). Restricción: NOT NULL.
* id_teja (INT): Llave Foránea (FK). Relaciona con PRODUCTO_TEJA(id_teja). Restricción: NOT NULL.
* cantidad_solicitada (INT): Unidades totales requeridas por el cliente (incluye el margen de desperdicio). Restricción: NOT NULL, CHECK (cantidad_solicitada > 0).
* precio_unitario_aplicado (DECIMAL(10,2)): Precio final por pieza acordado (afectado por la matriz de descuentos). Restricción: NOT NULL.
* pendiente_techo_grados (DECIMAL(5,2)): Grados de inclinación del techo extraídos de los planos. Restricción: NOT NULL.
* metros_cuadrados_calculados (DECIMAL(10,2)): Superficie neta calculada en base a la pendiente. Restricción: NOT NULL.

## Entidad: DESPACHO_FLETE
Módulo logístico que controla las unidades de transporte asignadas para mover el peso masivo de las tejas.

* id_despacho (INT): Llave Primaria (PK). Autoincremental IDENTITY(1,1).
* id_pedido (INT): Llave Foránea (FK). Relaciona con PEDIDO_VENTA(id_pedido). Restricción: NOT NULL.
* id_usuario (INT): Llave Foránea (FK). Relaciona con USUARIO(id_usuario). Chofer o almacenista que despacha. Restricción: NOT NULL.
* fecha_salida (DATETIME2): Salida física del camión del patio de carga. Restricción: NULL.
* fecha_entrega_real (DATETIME2): Firma de recibido en la obra del cliente. Restricción: NULL.
* peso_total_carga_kg (DECIMAL(7,2)): Peso acumulado de las tejas cargadas. Restricción: NOT NULL.
* placas_vehiculo (VARCHAR(50)): Identificación del transporte (Camión/Plataforma). Restricción: NOT NULL.
* estado_entrega (VARCHAR(30)): Situación logística. Restricción: NOT NULL ('En_Ruta', 'Entregado', 'Cancelado').

## Entidad: REMISION_PARCIAL
Rompe la relación de muchos a muchos entre las partidas solicitadas y los camiones enviados. Controla de qué lotes físicos sale el material para mitigar saldos pendientes.

* id_remision (INT): Llave Primaria (PK). Autoincremental IDENTITY(1,1).
* id_despacho (INT): Llave Foránea (FK). Relaciona con DESPACHO_FLETE(id_despacho). Restricción: NOT NULL.
* id_detalle_pedido (INT): Llave Foránea (FK). Relaciona con DETALLE_PEDIDO(id_detalle). Restricción: NOT NULL.
* cantidad_entregada_lote (INT): Cantidad física de piezas de tejas subidas a este viaje específico. Restricción: NOT NULL, CHECK (cantidad_entregada_lote > 0).

------------------------------
## 🔀 2. Matriz de Relaciones y Cardinalidad

   1. USUARIO a PEDIDO_VENTA (1:N): Un vendedor puede registrar múltiples pedidos de venta a lo largo del tiempo; un pedido es levantado estrictamente por un único vendedor.
   2. USUARIO a MERMA_ROTURA (1:N): Un almacenista puede levantar múltiples reportes de tejas rotas en el patio; un reporte de merma está asociado a un único empleado responsable.
   3. USUARIO a DESPACHO_FLETE (1:N): Un chofer o inspector de patio puede despachar o conducir múltiples fletes; un flete es conducido/validado por un único empleado.
   4. CLIENTE a PEDIDO_VENTA (1:N): Un cliente (ej. constructora) puede realizar múltiples compras o cotizaciones; un pedido pertenece exclusivamente a un cliente.
   5. PRODUCTO_TEJA a LOTE_PRODUCCION (1:N): Un modelo maestro de teja se divide en múltiples lotes físicos según su fecha de horneado o recepción; un lote pertenece a un solo modelo de teja.
   6. PRODUCTO_TEJA a DETALLE_PEDIDO (1:N): Un tipo de teja puede ser incluido en múltiples partidas de diferentes pedidos; un renglón de detalle especifica una sola teja.
   7. LOTE_PRODUCCION a MERMA_ROTURA (1:N): Un lote puede sufrir múltiples incidentes de rotura de material en el almacén; un reporte de merma afecta a un único lote.
   8. PEDIDO_VENTA a DETALLE_PEDIDO (1:1..*): Un pedido contiene obligatoriamente una o muchas partidas de tejas detalladas; una partida pertenece a un único pedido principal (Relación Fuerte de Composición).
   9. PEDIDO_VENTA a DESPACHO_FLETE (1:N): Debido al volumen y peso de las tejas, un solo pedido puede requerir múltiples viajes de camiones (entregas parciales); un flete transporta material asociado a un pedido.
   10. DESPACHO_FLETE a REMISION_PARCIAL (1:1..*): Un viaje de camión transporta obligatoriamente el desglose de una o varias remisiones de material; una remisión viaja en un único flete.
   11. DETALLE_PEDIDO a REMISION_PARCIAL (1:N): Una partida solicitada de tejas puede ser surtida en partes a través de múltiples remisiones de camiones independientes; una remisión parcial ampara una sola línea de detalle de la compra.

------------------------------
## 🛡️ 3. Reglas de Integridad Referencial de SQL Server (Cascadas)
Para evitar inconsistencias de datos financieros u operativos, la base de datos se configura mediante EF Core Fluent API con las siguientes políticas ante eliminaciones:

* Restrict / NoAction (Bloqueo de eliminación): Si intentas eliminar un registro en PRODUCTO_TEJA, SQL Server bloqueará la operación si existen lotes activos en LOTE_PRODUCCION o pedidos históricos en DETALLE_PEDIDO. Lo mismo aplica para CLIENTE y USUARIO. No se permite el borrado físico si el elemento tiene un historial transaccional.
* Cascade (Eliminación en Cascada): Si un administrador elimina de forma explícita un PEDIDO_VENTA en estado de "Cotización", SQL Server borrará de forma automática todos los renglones asociados dentro de DETALLE_PEDIDO, manteniendo limpia la base de datos sin dejar registros huérfanos.


---

## 4. Especificación de la API

A continuación, se presentan los 3 endpoints más críticos para la API REST de TejaFlow estructurados bajo la especificación oficial de OpenAPI 3.0.0 (Swagger).
Estos endpoints resuelven las tres necesidades operativas principales identificadas: listar el inventario de tejas, crear una cotización con cálculo arquitectónico y registrar mermas por rotura en el almacén.
------------------------------
## 📄 Especificación OpenAPI (Formato YAML)

openapi: 3.0.0info:
  title: API REST de TejaFlow
  description: Servicios backend en .NET 10 para la gestión de inventario y ventas de tejas.
  version: 1.0.0servers:
  - url: https://tejaflow.compaths:

  # ENDPOINT 1: Consultar inventario con filtros
  /tejas:
    get:
      summary: Consultar catálogo e inventario global de tejas
      description: Retorna la lista de tejas disponibles en stock. Permite filtrar por material y color para los paneles de Vue.js y PrimeVue.
      parameters:
        - name: material
          in: query
          required: false
          schema:
            type: string
            example: Barro
        - name: color
          in: query
          required: false
          schema:
            type: string
            example: Terracota
      responses:
        '200':
          description: Listado de tejas obtenido exitosamente.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/TejaInventario'
        '401':
          description: No autorizado. Token JWT ausente o inválido.

  # ENDPOINT 2: Procesar cotización arquitectónica
  /ventas/cotizar:
    post:
      summary: Calcular y crear una cotización de tejas
      description: Procesa las dimensiones del plano y los grados de pendiente del techo para calcular la cantidad exacta de tejas necesarias (incluyendo margen de merma y peso de flete).
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CotizacionRequest'
      responses:
        '200':
          description: Cotización calculada exitosamente.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CotizacionResponse'
        '400':
          description: Datos de entrada inválidos (ej. metros cuadrados negativos).

  # ENDPOINT 3: Registrar merma en el patio de carga
  /inventario/mermas:
    post:
      summary: Registrar tejas rotas en el patio de almacén
      description: Resta stock físico de un lote específico debido a daños de traslado o manipulación. Requiere rol de Almacenista.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MermaRequest'
      responses:
        '201':
          description: Registro de merma guardado y stock actualizado en SQL Server.
        '403':
          description: Prohibido. El usuario autenticado no tiene el rol de Almacenista.
components:
  schemas:
    TejaInventario:
      type: object
      properties:
        idTeja:
          type: integer
        modelo:
          type: string
        material:
          type: string
        color:
          type: string
        pesoKg:
          type: number
          format: float
        precioBase:
          type: number
          format: float
        stockGlobal:
          type: integer

    CotizacionRequest:
      type: object
      required:
        - idCliente
        - idTeja
        - metrosBaseTecho
        - gradosPendiente
      properties:
        idCliente:
          type: integer
        idTeja:
          type: integer
        metrosBaseTecho:
          type: number
          format: float
        gradosPendiente:
          type: number
          format: float

    CotizacionResponse:
      type: object
      properties:
        idPedido:
          type: integer
        cantidadTejasNeta:
          type: integer
        cantidadTejasConMerma:
          type: integer
        pesoTotalCargaToneladas:
          type: number
          format: float
        subtotal:
          type: number
          format: float
        total:
          type: number
          format: float

    MermaRequest:
      type: object
      required:
        - idLote
        - cantidadRotas
        - motivo
      properties:
        idLote:
          type: integer
        cantidadRotas:
          type: integer
        motivo:
          type: string

------------------------------
## 🔄 Ejemplos de Petición y Respuesta (Caso: Endpoint de Cotización)
Para dar total claridad al flujo de datos entre la SPA de Vue.js y tu backend en .NET 10, aquí tienes un ejemplo real de lo que viaja por la red al calcular un techo:
## Ejemplo de Solicitud (Request POST /ventas/cotizar)
El vendedor introduce en la interfaz web de TejaFlow los datos del plano de un cliente:

{
  "idCliente": 142,
  "idTeja": 5,
  "metrosBaseTecho": 120.00,
  "gradosPendiente": 30.00
}

## Ejemplo de Respuesta (Response 200 OK)
El backend de .NET 10 procesa la trigonometría de la pendiente, le añade el 10% de desperdicio técnico estructural, calcula el costo y el peso logístico para SQL Server, y le devuelve al frontend los datos totalmente listos para pintarse en los componentes de PrimeVue:

{
  "idPedido": 8921,
  "cantidadTejasNeta": 1540,
  "cantidadTejasConMerma": 1694,
  "pesoTotalCargaToneladas": 4.23,
  "subtotal": 38115.00,
  "total": 44213.40
}

---

## 5. Historias de Usuario

Para documentar las historias de usuario de TejaFlow, se utiliza el estándar ágil de la industria: el formato "Como [Rol], quiero [Acción] para [Beneficio]", acompañado de sus respectivos Criterios de Aceptación estructurados bajo el enfoque BDD (Behavior-Driven Development) utilizando las palabras clave Dado que (Given), Cuando (When), Entonces (Then).

**Historia de Usuario 1**

## 📝 Calculadora de Cotizaciones Arquitectónicas

* ID: US-01
* Título: Cálculo automático de piezas por pendiente y área de techado.
* Prioridad: Alta.

Declaración de la Historia:

Como Vendedor de TejaFlow,
Quiero una calculadora integrada en el formulario de ventas que procese los metros cuadrados base y la inclinación del techo,
Para generar presupuestos exactos al cliente de forma inmediata, incluyendo el margen de desperdicio por quiebre sin realizar cálculos manuales.

Criterios de Aceptación (Escenarios BDD):

* Escenario 1: Cálculo exitoso con pendiente estándar.
* Dado que estoy en la pantalla de "Nueva Cotización" y he seleccionado una teja con peso y dimensiones válidas,
   * Cuando introduzco 120 en metros cuadrados base y 30 en grados de pendiente del techo,
   * Entonces el sistema debe calcular automáticamente la superficie real de la cubierta, aplicar un 10% extra por concepto de merma de instalación, y mostrar el total de piezas y toneladas métricas de carga estimadas.
* Escenario 2: Bloqueo de valores físicamente imposibles.
* Dado que estoy capturando un presupuesto,
   * Cuando intento ingresar un valor negativo en metros cuadrados o una pendiente mayor a 90 grados,
   * Entonces los componentes de PrimeVue deben marcar el campo en rojo y el sistema debe bloquear el botón de "Calcular" impidiendo el envío de datos corruptos al backend de .NET.

**Historia de Usuario 2**

## 📝 Registro de Mermas y Roturas en Patio

* ID: US-02
* Título: Declaración de bajas por rotura de material en almacén.
* Prioridad: Alta.

Declaración de la Historia:

Como Almacenista de TejaFlow,
Quiero registrar la cantidad de tejas que sufren quiebres en el patio de carga especificando el lote y el motivo,
Para mantener el inventario teórico de SQL Server 100% cuadrado con las existencias reales y transparentar las pérdidas.

Criterios de Aceptación (Escenarios BDD):

* Escenario 1: Registro correcto de merma por un operador autorizado.
* Dado que he iniciado sesión con mi usuario de rol Almacenista,
   * Cuando selecciono el lote LOT-2026-B01, digito que se rompieron 50 piezas y selecciono el motivo "Mal acomodo en montacargas",
   * Entonces el backend de .NET debe restar inmediatamente esas 50 tejas de la tabla LOTE_PRODUCCION en SQL Server y actualizar el stock_global.
* Escenario 2: Intento de registro superior al stock disponible.
* Dado que un lote tiene actualmente 20 tejas físicas registradas,
   * Cuando intento declarar una merma de 35 tejas en ese lote,
   * Entonces el sistema debe lanzar una alerta indicando que no se pueden dar de baja más unidades de las existentes y abortar la transacción.

**Historia de Usuario 3**

## 📝 Control de Despachos y Saldos Parciales

* ID: US-03
* Título: Gestión de entregas divididas para pedidos masivos de constructoras.
* Prioridad: Media-Alta.

Declaración de la Historia:

Como Gerente de Logística,
Quiero registrar salidas parciales de material asociadas a un camión específico y ver el saldo pendiente de tejas por entregar,
Para controlar de forma ordenada los despachos de pedidos grandes que las obras no pueden recibir de un solo golpe.

Criterios de Aceptación (Escenarios BDD):

* Escenario 1: Envío del primer viaje parcial de tejas.
* Dado que un cliente tiene un pedido pagado por 10,000 tejas y su estado es "Pagado",
   * Cuando autorizo un flete cargando el camión con 4,000 tejas,
   * Entonces el sistema debe generar una nota de remisión parcial, cambiar el estado del pedido global a "Parcial" y mostrar en la tabla de PrimeVue que restan 6,000 tejas por surtir.
* Escenario 2: Cierre definitivo del pedido.
* Dado que un pedido en estado "Parcial" tiene un saldo pendiente de exactamente 2,500 tejas,
   * Cuando el almacén registra la salida del último camión con esas 2,500 piezas remanentes,
   * Entonces el saldo pendiente debe pasar a 0 y el estado general del pedido en la base de datos debe actualizarse automáticamente a "Despachado".

---

## 6. Tickets de Trabajo

**Ticket 1**

## 🗄️ Ticket 1: BASE DE DATOS (Database Task)

* ID: TF-DB-001
* Título: Creación de Estructura de Tablas y Restricciones para Control de Lotes y Mermas.
* Componente: TejaFlow.Database / SQL Server.
* Prioridad: Alta (Bloqueante para el backend).

## 📄 Descripción del requerimiento:
Se requiere implementar el diseño físico de las tablas encargadas del control logístico de inventario en SQL Server. Es crítico asegurar que las mermas afecten a lotes específicos y que el sistema maneje restricciones de integridad referencial rígidas para evitar mermas huérfanas o duplicidad en códigos de lote.
## 🔧 Especificaciones Técnicas y Código Base:
El desarrollador deberá ejecutar el siguiente script DDL optimizado para la base de datos de producción:

-- Crear tabla de lotesCREATE TABLE LOTE_PRODUCCION (
    id_lote INT IDENTITY(1,1) CONSTRAINT PK_LOTE_PRODUCCION PRIMARY KEY,
    id_teja INT NOT NULL,
    codigo_lote VARCHAR(50) NOT NULL,
    fecha_entrada DATETIME2 NOT NULL CONSTRAINT DF_LOTE_ENTRADA DEFAULT GETDATE(),
    cantidad_inicial INT NOT NULL CONSTRAINT CK_LOTE_CANT_INI CHECK (cantidad_inicial > 0),
    cantidad_actual INT NOT NULL,
    CONSTRAINT UQ_LOTE_CODIGO UNIQUE (codigo_lote),
    CONSTRAINT CK_LOTE_CANT_ACT CHECK (cantidad_actual >= 0)
);
-- Crear tabla de mermasCREATE TABLE MERMA_ROTURA (
    id_merma INT IDENTITY(1,1) CONSTRAINT PK_MERMA_ROTURA PRIMARY KEY,
    id_lote INT NOT NULL,
    id_usuario INT NOT NULL,
    cantidad_rotas INT NOT NULL CONSTRAINT CK_MERMA_CANT CHECK (cantidad_rotas > 0),
    fecha_registro DATETIME2 NOT NULL CONSTRAINT DF_MERMA_FECHA DEFAULT GETDATE(),
    motivo VARCHAR(255) NOT NULL,
    CONSTRAINT FK_MERMA_LOTE FOREIGN KEY (id_lote) 
        REFERENCES LOTE_PRODUCCION(id_lote) ON DELETE NO ACTION
);
-- Índices de Rendimiento para búsquedas frecuentes de stock en patioCREATE NONCLUSTERED INDEX IX_LOTE_TEJA_ACTUAL ON LOTE_PRODUCCION (id_teja, cantidad_actual);

## ✅ Criterios de Aceptación y Definición de Listo (DoD):

* Los nombres de las columnas y tablas respetan el estándar snake_case definido para la base de datos.
* Se incluye una restricción CHECK que impide físicamente que la columna cantidad_actual sea menor a cero.
* La llave foránea hacia lotes tiene configurado ON DELETE NO ACTION para evitar que se elimine un lote si ya tiene mermas asociadas.

**Ticket 2**

## ⚙️ BACKEND (Backend Task)

* ID: TF-BE-042
* Título: Implementación del Endpoint REST para Registro de Mermas con EF Core 10.
* Componente: TejaFlow.WebApi / TejaFlow.Application (.NET 10).
* Prioridad: Alta.

## 📄 Descripción del requerimiento:
Desarrollar el endpoint POST /api/inventario/mermas protegido bajo rol de Almacenista. El servicio debe descontar de manera atómica las tejas rotas de la tabla de lotes e insertar el registro de auditoría de la merma utilizando una Transacción Segura de Entity Framework Core.
## 🔧 Especificaciones Técnicas y Código Base:
Implementar la lógica dentro de un servicio de aplicación inyectado en el controlador:

[Authorize(Roles = "Almacenista,Admin")]
[ApiController]
[Route("api/inventario/mermas")]public class MermasController : ControllerBase
{
    private readonly ITejaFlowDbContext _context;

    public MermasController(ITejaFlowDbContext context) => _context = context;

    [HttpPost]
    public async Task<IActionResult> RegistrarMerma([FromBody] RegistrarMermaDto dto)
    {
        // Ejecución en bloque transaccional atómico
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var lote = await _context.Lotes.FirstOrDefaultAsync(l => l.IdLote == dto.IdLote);
            if (lote == null) return NotFound("El lote especificado no existe.");

            if (lote.CantidadActual < dto.CantidadRotas)
                return BadRequest("No puedes registrar una merma mayor al stock actual del lote.");

            // 1. Descontar del lote físico
            lote.CantidadActual -= dto.CantidadRotas;

            // 2. Insertar registro de merma
            var merma = new MermaRotura
            {
                IdLote = dto.IdLote,
                IdUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!),
                CantidadRotas = dto.CantidadRotas,
                Motivo = dto.Motivo,
                FechaRegistro = DateTime.UtcNow
            };

            await _context.Mermas.AddAsync(merma);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(RegistrarMerma), new { id = merma.IdMerma }, dto);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Error interno al procesar la merma.");
        }
    }
}

## ✅ Criterios de Aceptación y Definición de Listo (DoD):

* El endpoint valida con un 400 Bad Request si la merma excede las existencias del lote.
* Si el guardado falla a mitad del proceso, la transacción realiza un Rollback completo en SQL Server.
* Se incluye una prueba unitaria que valida la lógica del descuento de stock.

**Ticket 3**

## 🎨 FRONTEND (Frontend Task)

* ID: TF-FE-089
* Título: Componente de Formulario Reactivo para Declaración de Mermas en Patio de Carga.
* Componente: src/features/inventario (Vue.js 3 + TypeScript).
* Prioridad: Media-Alta.

## 📄 Descripción del requerimiento:
Crear la interfaz de usuario utilizando los componentes de PrimeVue para que los almacenistas reporten las piezas de tejas quebradas desde una tablet o computadora en el patio de carga. Debe conectarse al endpoint del backend mediante una llamada asíncrona tipada en TypeScript.
## 🔧 Especificaciones Técnicas y Código Base:
Estructurar el archivo utilizando la sintaxis de la Composition API y Runes de Svelte/Vue modernos:

<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

// Tipado estricto de TypeScript para la petición
interface MermaPayload {
  idLote: number;
  cantidadRotas: number;
  motivo: string;
}

const props = defineProps<{ idLote: number; stockDisponible: number; visible: boolean }>();
const emit = defineEmits(['close', 'success']);

const cantidad = ref<number | null>(null);
const motivo = ref<string>('');
const cargando = ref<boolean>(false);

async function enviarMerma() {
  if (!cantidad.value || cantidad.value > props.stockDisponible || !motivo.value) return;

  cargando.value = true;
  const payload: MermaPayload = { idLote: props.idLote, cantidadRotas: cantidad.value, motivo: motivo.value };

  const res = await fetch('https://tejaflow.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify(payload)
  });

  cargando.value = false;
  if (res.ok) {
    emit('success');
    cantidad.value = null;
    motivo.value = '';
  }
}
</script>

<template>
  <Dialog :visible="visible" modal header="Reportar Tejas Rotas en Patio" :style="{ width: '450px' }" @update:visible="emit('close')">
    <div class="flex flex-col gap-4 p-2">
      <div>
        <label class="block font-bold mb-1">Cantidad de piezas dañadas</label>
        <InputNumber v-model="cantidad" :max="stockDisponible" :min="1" placeholder="Ej. 45" class="w-full" :invalid="cantidad ? cantidad > stockDisponible : false" />
        <small v-if="cantidad ? cantidad > stockDisponible : false" class="text-red-500">No puedes exceder las {{ stockDisponible }} tejas del lote.</small>
      </div>
      <div>
        <label class="block font-bold mb-1">Motivo o Causa del daño</label>
        <Textarea v-model="motivo" rows="3" class="w-full" placeholder="Describa cómo ocurrió el quiebre..." />
      </div>
    </div>
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" text @click="emit('close')" />
      <Button label="Registrar Baja" icon="pi pi-check" :loading="cargando" :disabled="!cantidad || !motivo" @click="enviarMerma" class="bg-orange-600 border-none" />
    </template>
  </Dialog>
</template>

## ✅ Criterios de Aceptación y Definición de Listo (DoD):

* El botón "Registrar Baja" permanece deshabilitado hasta que todos los campos obligatorios estén llenos.
* El componente <InputNumber> restringe de forma nativa que se introduzcan valores flotantes o menores a 1.
* Se emite el evento 'success' para obligar a la tabla principal de inventario a refrescar sus datos tras guardar el registro de mermas.

---

## 7. Pull Requests

**Pull Request 1**

**Fundación Inicial de TejaFlow**

Este PR establece la base inicial de **TejaFlow**, una plataforma ERP para la administración, control de inventario y gestión de ventas de tejas. Define la estructura principal del producto, la arquitectura técnica, el modelo de datos inicial y el primer flujo operativo relacionado con el control de lotes y registro de mermas por rotura.

**Resumen**

El objetivo de este PR es preparar el proyecto para el desarrollo end-to-end, dejando definidos los primeros componentes de frontend, backend, base de datos y seguridad. El flujo principal cubierto es la gestión de inventario en patio de carga, permitiendo registrar tejas dañadas y mantener el stock físico alineado con el sistema.

**Alcance**

- Define la arquitectura base de tres capas: SPA frontend, API backend y base de datos SQL Server.
- Introduce la estructura inicial para inventario por modelo, material, color y lote de producción.
- Prepara el flujo de registro de mermas o roturas en almacén.
- Establece las reglas principales para evitar inconsistencias de stock.
- Alinea el proyecto con futuros módulos de cotización, despacho y entregas parciales.

**Frontend**

Se contempla la base para una interfaz en **Vue.js 3 + TypeScript + PrimeVue**, orientada a que los almacenistas puedan registrar piezas dañadas desde tablet o computadora. El formulario deberá validar campos obligatorios, impedir cantidades mayores al stock disponible y emitir un evento de éxito para refrescar la tabla principal de inventario.

**Backend**

Se prepara la lógica para un endpoint REST protegido:

```http
POST /api/inventario/mermas
```

Este endpoint permitirá registrar mermas de inventario de forma segura, validando que el lote exista, que la cantidad rota no exceda el stock disponible y que la actualización del inventario se realice de manera transaccional.

**Base de Datos**

Se define la estructura inicial para:

- `LOTE_PRODUCCION`: almacenamiento de lotes, código de lote, fecha de entrada, cantidad inicial y cantidad actual.
- `MERMA_ROTURA`: registro de bajas por tejas rotas, asociadas a un lote específico.
- Restricciones `CHECK` para evitar cantidades inválidas o stock negativo.
- Llaves primarias, llaves foráneas e índices para asegurar integridad y rendimiento.

**Seguridad**

El flujo de registro de mermas queda alineado con el modelo de seguridad de TejaFlow:

- Autenticación mediante JWT.
- Autorización por roles.
- Acceso permitido solo para usuarios `Almacenista` y `Admin`.
- Registro preparado para auditoría de acciones críticas sobre inventario.

**Pruebas**

Este PR debe contemplar o preparar pruebas para validar que:

- No se pueda registrar una merma mayor al stock disponible.
- El stock del lote se descuente correctamente.
- La operación sea atómica y haga rollback si ocurre un error.
- Los campos obligatorios sean validados antes de procesar la solicitud.

**Valor de Negocio**

Este PR permite que TejaFlow comience a resolver uno de los problemas más importantes en la industria del techado: mantener el inventario real alineado con el inventario del sistema. Al tratarse de productos pesados y frágiles, el registro de mermas por rotura es clave para evitar descuadres, mejorar la confiabilidad del stock y tomar mejores decisiones comerciales y logísticas.

**Pull Request 2**

**Pull Request 3**

