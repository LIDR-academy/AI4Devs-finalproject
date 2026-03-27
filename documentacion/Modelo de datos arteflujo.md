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
*   **duracion\_min:** Tiempo total (esencial para el **Dial de Tiempo**).  
  *   **vibe\_mood:** Etiqueta de estado de ánimo para filtrado emocional. Los 4 *moods* del MVP son:
      *   ⚡ *Dinámico:* Ágil, comedia, acción o ritmo rápido.
      *   🌧️ *Melancólico:* Drama, dolor, terror u oscuridad.
      *   🌌 *Contemplativo:* Cine mudo, filosofía, documentales lentos o abstracto.
      *   ✨ *Inspirador:* Épico, triunfal, música sinfónica monumental o educativo.
  *   **valor\_cultural:** Texto breve que explica por qué la obra es un hito (máx. 280 caracteres).  
* **EJE\_VERTICAL:** Define los tres pilares de clasificación principal de la plataforma:
  *   🎬 **The Short List (Cortos):** Cortometrajes, animaciones y proyectos indie rápidos.
  *   🎼 **The Stage (Escenarios):** Conciertos, jazz, música, teatro y actuaciones en vivo.
  *   📽️ **The Cinema (Cine de autor):** Películas clásicas, largometrajes y material de festivales mayores.
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

