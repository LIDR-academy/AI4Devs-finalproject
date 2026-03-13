# **Presentación producto sitio web “latearte”**

Latearte (un hub) donde lo artístico late con fuerza, es punto de encuentro con las artes, el ingenio y la creatividad; es una plataforma web de streaming de alta especialidad diseñada para el consumo de contenidos culturales, independientes, de prestigio y de contenidos ingeniosos, audaces y creativos.

Lugar para conectar con contenidos artísticos, para entremezclar ideas nuevas con contenidos destacados; presentar una alternativa refrescante al "scroll" infinito de las plataformas comerciales. Se busca crear una plataforma de curaduría premium, donde se selecciona, organiza y gestiona contenidos artísticos, un refugio para quienes buscan calidad artística sobre cantidad algorítmica.

Se quiere crear un **Meta-Buscador Especializado** o un **Hub de Curaduría**, que resuelva el problema de la fragmentación: el usuario no tiene que saltar de app en app para saber dónde conectar con la cultura y el arte. 

Se quiere presentar al usuario contenido gratuito, acceder de forma integrada a algunos contenidos y además presentar opciones de contenido de pago, y que las pueda distinguir fácilmente.

## ---

**📄 Documentación del Producto: sitio web “latearte“**

### **1\. Objetivos del Proyecto**

* **Objetivo General:** Crear un ecosistema digital que centralice y clasifique el contenido cultural y artístico de alta calidad disperso en la web, facilitando el descubrimiento y el acceso directo.  
* **Objetivos Específicos:**  
  * **Curaduría sobre Cantidad:** Filtrar solo contenido con valor artístico (premiados, cine de autor, música académica/selecta).  
  * **Transparencia de Acceso:** Informar claramente al usuario si el contenido es gratuito, bajo suscripción (Netflix, MUBI, Qello) o de pago por evento (VOD).  
  * **Experiencia Fluida:** Reducir la fricción mediante la reproducción embebida siempre que las licencias y APIs lo permitan.

### ---

### **2\. Pilares del Contenido**

La oferta se divide en tres ejes verticales que definen la identidad de la aplicación:

* **Cortos y cortometrajes (The Short List):** Una colección de piezas breves, ingeniosas y vanguardistas. Con dos líneas:  
  *  El enfoque principal son obras premiadas en festivales internacionales o nominadas por la Academia (**Oscars**), garantizando una experiencia de alto impacto en poco tiempo.  
  * Cortos y animaciones frescas, ingeniosas, creativas, nuevas propuestas. La parte más dinámica que se conecte con la búsqueda de experiencias nuevas, que sorprendan.  
* **Escenarios (The Stage):** Un espacio dedicado a la música y las artes escénicas. No solo conciertos completos, sino **curaduría de fragmentos magistrales** (la "pieza de oro" de una presentación). Abarca desde la potencia de una orquesta sinfónica hasta la intimidad de un club de Jazz o un bolero.  
* **Cine de Autor (The Cinema):** Un catálogo alejado del *blockbuster*. Se centra en el cine de festivales (Cannes, Berlinale, etc.), cine independiente y obras que alimentan la **"Cinefilia Pura"**, donde la visión del director es el eje central.

### 

### **3\. Perfil del Usuario Objetivo**

* **El Curioso Cultural:** Personas que buscan aprender o descubrir algo nuevo en sus tiempos libres.  
* **El Melómano y Amante del Arte:** Usuarios que valoran la interpretación técnica, desde un solo de violín hasta una puesta en escena teatral.  
* **Cinefilitas:** Espectadores que huyen de los clichés de Hollywood y buscan profundidad temática.

### ---

**4\. Características Principales**

* **Agregación Inteligente:** La plataforma no solo aloja, sino que indexa contenido de terceros (YouTube, Vimeo, plataformas de nicho).  
* **Etiquetado de "Estatus de Acceso":** Un sistema de iconos visuales que indica:  
  * 🟢 **Abierto:** Contenido gratuito o de dominio público.  
  * 🟡 **Suscripción:** Requiere cuenta en una plataforma externa.  
  * 🔵 **Premium/VOD:** Pago único por alquiler o compra.  
* **Reproductor Unificado:** Capacidad de embeber marcos de reproducción para que el usuario no abandone la web (sujeto a disponibilidad técnica del origen).

### ---

**5\. Funcionalidades Detalladas**

#### **A. Módulo de Usuario y Navegación**

* **Filtros de "Costo":** Opción para mostrar solo contenido gratuito o contenido disponible en las plataformas que el usuario ya paga.  
* **Buscador por "Hito":** Permitir búsquedas como "Nominados Oscar 2024" o "Jazz Instrumental en vivo".  
* **Listas de Deseos (Watchlist):** Guardar contenido de diferentes fuentes en una sola lista personalizada.

#### **B. Visualización de Resultados (Card Design)**

Cada miniatura de video debe mostrar:

1. **Título y Director/Artista.**  
2. **Sello de Calidad:** (Ej: "Ganador Cannes", "Nominado Oscar", "Versión Sinfónica").  
3. **Indicador de Plataforma:** Logo de la fuente original (Ej: YouTube, Vimeo, MUBI).  
4. **Tipo de Acceso:** Texto o icono que indique si es pago o gratuito.

#### **C. Funcionalidades Técnicas de Reproducción**

* Smart Embedding: Si el video permite iframe (como YouTube o Vimeo), se reproduce en una ventana modal dentro de Artesir.  
* **Deep Linking:** Si el contenido es de una plataforma cerrada (como Netflix o Apple TV), el botón de "Play" abre directamente la aplicación o la web externa en el minuto exacto.

### ---

**6\. Estructura de Secciones (Matriz de Contenido)**

| Sección | Funcionalidad Específica | Subcategorías / Géneros | Atributo Diferencial | Ejemplo de Contenido |
| :---- | :---- | :---- | :---- | :---- |
| **Cortos** | Botón de "Sorpréndeme" (Random Play). | Animación, Ficción, Documental, Curiosidades. | Calidad premiada (Oscar/Festivales).Cortos nuevos, audaces, creativos, resaltados en listas artísticas o culturales. | Cortometrajes de animación de festivales. Propuestas nuevas, ingeniosas, creativas. |
| **Conciertos** | Selector de "Solo Fragmentos" o "Concierto Completo". | Sinfónico, Ópera, Teatro, Homenajes, Jazz, Salsa, Rock, Pop. | Versiones instrumentales y "**highlights**". | El solo de trompeta de un concierto de Jazz. |
| **Cine** | Ficha técnica con enfoque en el estilo visual. | Cine de Autor, Independiente, Cine Cultural. | Narrativas no convencionales. | Películas de cine independiente o experimental. |

### 

### ---

### **7\. Reglas de Negocio**

* **Prioridad de Visualización:** El contenido gratuito y embebible tendrá prioridad en los algoritmos de recomendación para mejorar la retención del usuario en la web.  
* **Afiliación:** Enlaces a plataformas de pago podrán incluir códigos de afiliado para monetizar la plataforma.

**\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_**

**Modelo de datos** 

### **2\. Contexto del Proyecto (MVP de arteflujo)**

Estas entidades son las principales para el MVP:

* **Obra/Contenido:** El ítem curado (Corto, Escenario, Cine).  
* **Eje Vertical:** Las tres categorías (Short List, Stage, Cinema).  
* **Plataforma Origen:** De dónde viene el video (YouTube, MUBI, etc.).  
* **Estado de Acceso:** El código de color/costo (Abierto, Suscripción, VOD).  
* **Usuario:** Perfil básico.  
* **Watchlist:** Lista de deseos para guardar contenido.

### **3\. Diccionario de Datos**

#### **Entidades de Contenido**

* **OBRA:** Almacena la pieza artística central (corto, concierto o película).  
  * valor\_cultural: Texto breve (máx 280 caracteres) que justifica su importancia.  
  * vibe\_mood: Etiqueta emocional para el filtro de descubrimiento (ej: "Melancólico").  
* **EJE\_VERTICAL:** Clasifica la obra en las tres categorías del negocio: *Cortos*, *Escenarios* o *Cine*.  
* **HITO:** Sellos de calidad o premios (Ej: "Ganador Cannes", "Nominado Oscar").  
* **DATO\_CONTEXTO:** Datos históricos o técnicos que aparecen mediante pop-ups durante la reproducción en el "Modo Contexto".

#### **Entidades de Acceso y Operación**

* **PLATAFORMA\_ORIGEN:** Identifica si el contenido viene de YouTube, Vimeo, MUBI, etc..  
* **ESTADO\_ACCESO:** Clasifica el acceso en Abierto (Verde), Suscripción (Amarillo) o VOD (Azul).  
* **LISTA\_DESEOS:** Tabla intermedia que permite al usuario guardar obras de diversas fuentes en un solo lugar.

### ---

**4\. Notas de Diseño**

* **Normalización:** Se separaron los **Hitos** y los **Datos de Contexto** en tablas independientes para permitir que una sola obra tenga múltiples premios o múltiples datos educativos sin redundancia.  
* **MVP Focus:** Se omitieron atributos de auditoría (fechas de creación) para mantener el modelo enfocado puramente en la lógica de navegación y filtrado por tiempo/mood.  
* **Integración:** La entidad PLATAFORMA\_ORIGEN incluye el campo permite\_iframe para decidir si se usa el "Smart Embedding" o se realiza un "Deep Linking" a la app externa.

# **Modelo de Entidades: arteflujo (MVP)**

El siguiente modelo define la estructura de datos necesaria para soportar la curaduría premium, el sistema de acceso por colores y la experiencia de descubrimiento por tiempo y "mood".

## **1\. Entidades de Contenido (Núcleo Artístico)**

Estas entidades gestionan la información de las piezas y su clasificación cultural.

* **OBRA:** Es la entidad central que representa cortos, películas o fragmentos musicales.  
  * id\_obra: Identificador único.  
  * titulo: Nombre de la pieza.  
  * director\_artista: Creador de la obra.  
  * region: País o zona de origen.  
  * duracion\_min: Tiempo total (esencial para el **Dial de Tiempo**).  
  * vibe\_mood: Etiqueta de estado de ánimo (ej: Melancólico, Inspirador).  
  * valor\_cultural: Texto breve que explica por qué la obra es un hito (máx. 280 caracteres).  
* **EJE\_VERTICAL:** Define los tres pilares de la plataforma: **The Short List** (Cortos), **The Stage** (Escenarios) y **The Cinema** (Cine de autor).  
* **HITO:** Almacena los reconocimientos de la obra, como premios Oscar o menciones en festivales como Cannes o la Berlinale.  
* **DATO\_CONTEXTO:** Información para el **Modo Contexto** que aparece como pop-up durante la reproducción.

## ---

**2\. Entidades de Acceso e Integración**

Gestionan la transparencia sobre dónde y cómo ver el contenido.

* **PLATAFORMA\_ORIGEN:** Identifica la fuente externa (YouTube, Vimeo, MUBI, Netflix) y si permite reproducción embebida (Smart Embedding).  
* **ESTADO\_ACCESO:** Controla el sistema visual de iconos y costos:  
  * 🟢 **Abierto:** Gratuito o dominio público.  
  * 🟡 **Suscripción:** Requiere cuenta externa.  
  * 🔵 **Premium/VOD:** Pago por evento.

## ---

**3\. Entidades de Usuario y Personalización**

* **USUARIO:** Perfil básico del espectador (Curioso Cultural, Melómano o Cinefilia).  
* **LISTA\_DESEOS (Watchlist):** Permite al usuario centralizar obras de diferentes plataformas en una sola lista personalizada.

## ---

**Resumen de Atributos (Diccionario MVP)**

| Entidad | Atributos Clave | Relación Principal |
| :---- | :---- | :---- |
| **Obra** | titulo, vibe\_mood, valor\_cultural | Pertenece a un **Eje Vertical**. |
| **Plataforma** | nombre\_plataforma, permite\_iframe | Aloja múltiples **Obras**. |
| **Acceso** | tipo\_acceso, codigo\_color | Clasifica el costo de la **Obra**. |
| **Dato Contexto** | texto\_curiosidad, marca\_tiempo | Vinculado a una **Obra** específica. |
| **Lista Deseos** | usuario\_id, obra\_id | Vincula **Usuarios** con **Obras**. |

