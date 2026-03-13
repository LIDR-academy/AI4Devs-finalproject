# **🔌Especificación API Arteflujo OpenAPI 3.0**

A continuación presento la especificación de la API para **arteflujo** en formato **OpenAPI 3.0**. Este diseño integra el modelo de datos núcleo (Obras, Hitos, Contexto), la lógica de acceso por colores y los requerimientos de seguridad y arquitectura definidos previamente.

YAML

openapi: 3.0.3  
info:  
  title: API de arteflujo \- Hub de Curaduría Cultural  
  description: \>  
    API para la gestión de contenidos artísticos curados, metadatos de terceros,   
    y personalización de experiencia de usuario (Watchlist y Modo Contexto).  
  version: 1.0.0  
servers:  
  \- url: https://api.arteflujo.com/v1  
    description: Servidor de producción

components:  
  securitySchemes:  
    bearerAuth:  
      type: http  
      scheme: bearer  
      bearerFormat: JWT

  schemas:  
    EstadoAcceso:  
      type: object  
      properties:  
        tipo:  
          type: string  
          enum: \[Abierto, Suscripcion, VOD\]  
        codigo\_color:  
          type: string  
          example: "verde"  
        descripcion:  
          type: string  
          example: "Gratuito o dominio público"  
      description: "Clasifica el costo y acceso visual de la obra."

    Obra:  
      type: object  
      properties:  
        id\_obra:  
          type: integer  
        titulo:  
          type: string  
        director\_artista:  
          type: string  
        duracion\_min:  
          type: integer  
          description: "Esencial para el Dial de Tiempo."  
        vibe\_mood:  
          type: string  
          example: "Melancólico"  
        valor\_cultural:  
          type: string  
          maxLength: 280  
        plataforma:  
          type: object  
          properties:  
            nombre:  
              type: string  
            permite\_iframe:  
              type: boolean  
              description: "Determina si se usa Smart Embedding o Deep Linking."  
        acceso:  
          $ref: '\#/components/schemas/EstadoAcceso'  
        hitos:  
          type: array  
          items:  
            type: string  
            example: "Ganador Cannes"

    DatoContexto:  
      type: object  
      properties:  
        marca\_tiempo:  
          type: string  
          example: "00:02:15"  
        texto\_curiosidad:  
          type: string  
          description: "Pop-up informativo para el Modo Contexto."

paths:  
  /obras:  
    get:  
      summary: "Listar y filtrar obras curadas"  
      description: "Permite el filtrado por el Dial de Tiempo y etiquetas de Mood."  
      parameters:  
        \- name: duracion\_max  
          in: query  
          schema:  
            type: integer  
          description: "Filtro para el Dial de Tiempo"  
        \- name: mood  
          in: query  
          schema:  
            type: string  
        \- name: eje\_vertical  
          in: query  
          schema:  
            type: string  
            enum: \[Short List, Stage, Cinema\]  
      responses:  
        '200':  
          description: Lista de obras encontradas  
          content:  
            application/json:  
              schema:  
                type: array  
                items:  
                  $ref: '\#/components/schemas/Obra'

  /obras/{id\_obra}:  
    get:  
      summary: "Detalle de una obra específica"  
      parameters:  
        \- name: id\_obra  
          in: path  
          required: true  
          schema:  
            type: integer  
      responses:  
        '200':  
          description: Detalle completo de la obra e hitos  
          content:  
            application/json:  
              schema:  
                $ref: '\#/components/schemas/Obra'

  /obras/{id\_obra}/contexto:  
    get:  
      summary: "Obtener datos para el Modo Contexto"  
      description: "Retorna los pop-ups informativos sincronizados con la línea de tiempo."  
      parameters:  
        \- name: id\_obra  
          in: path  
          required: true  
          schema:  
            type: integer  
      responses:  
        '200':  
          description: Lista de eventos de contexto  
          content:  
            application/json:  
              schema:  
                type: array  
                items:  
                  $ref: '\#/components/schemas/DatoContexto'

  /watchlist:  
    get:  
      security:  
        \- bearerAuth: \[\]  
      summary: "Ver la lista de deseos del usuario"  
      responses:  
        '200':  
          description: Obras guardadas por el usuario  
    post:  
      security:  
        \- bearerAuth: \[\]  
      summary: "Agregar obra a la watchlist"  
      requestBody:  
        required: true  
        content:  
          application/json:  
            schema:  
              type: object  
              properties:  
                id\_obra:  
                  type: integer  
      responses:  
        '201':  
          description: Obra agregada exitosamente

### **Puntos clave de esta especificación:**

* **Smart Embedding:** El esquema Obra incluye el campo permite\_iframe para que el frontend decida si renderiza un modal o redirige a la app externa.  
* **Filtros de Negocio:** Se han mapeado los parámetros de consulta para el **Dial de Tiempo** (duracion\_max) y el selector de **Mood** (mood).  
* **Modo Contexto:** El endpoint /contexto permite al reproductor obtener las "piezas de oro" informativas basadas en la entidad DATO\_CONTEXTO.  
* **Seguridad:** Se define bearerAuth (JWT) para proteger la persistencia de las **Watchlists**.

¿Te gustaría que genere ahora los **endpoints administrativos** para que los curadores puedan cargar nuevos "Hitos" y premios, o prefieres que nos enfoquemos en los **ejemplos de JSON** para las pruebas de integración?