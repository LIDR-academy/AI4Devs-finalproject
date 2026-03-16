# Mapa de Seguridad Urbana - Diego Fernando Orozco (DFO)
> Modelo - ChatGPT

## Índice

1. [Descripción general del producto](prompts-descripcion.md#1-descripción-general-del-producto)
2. [Arquitectura del sistema](prompts-arquitectura.md#2-arquitectura-del-sistema)
3. [Modelo de datos](prompts-modelo-datos.md#3-modelo-de-datos)
4. [Especificación de la API](prompts-especificacioapi.md#4-especificación-de-la-api)
5. [Historias de usuario](prompts-hu.md#5-historias-de-usuario)
6. [Tickets de trabajo](prompts-tickets.md#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

### 4. Especificación de la API

**Prompt 1:**

Mi backend se comunica a través de API y necesito describir los endpoints principales en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad.

Pídeme todo lo necesario de una API para realizar dicha actividad actividad.

**Prompt 2:**

Datos del primer API

1. Descripción general del endpoint:
  - Función principal: Crear de un reporte de incidente de seguridad
  - Contexto: Solo los usuarios registrados pueden realizar reportes
2. POST
3. /api/reportes
4. Bearer token, el cuál se obtiene del endpoint "/api/auth/login"
5. Parámetros
  - De consulta (Query): ninguno
  - De ruta (Path): ninguno
  - Del cuerpo (Body):
```json
{
    "descripcion": "Descripción del incidente",
    "direccion": "Dirección del incidente",
    "latitud": 12.345678,
    "longitud": 98.765432,
    "categoria": "Categoría del incidente"
}
```
6. Respuesta
  - Códigos de estado HTTP: 201 Created; 403 Forbidden;  500 Internal Server Error
7. Errores comunes:
  - 401 Unauthorized: No se proporcionó token
  - 403 Forbidden: Token no válido
8. Ejemplo
- Parámetros del cuerpo:
```json
{
    "descripcion": "Descripción del incidente",
    "direccion": "Dirección del incidente",
    "latitud": 12.345678,
    "longitud": 98.765432,
    "categoria": "Categoría del incidente"
}
```
- Respuesta exitosa:
  - Código: `201 Created`
  - Cuerpo:
```json
{
    "createdAt": "2024-11-16T18:02:28.476Z",
    "updatedAt": "2024-11-16T18:02:28.478Z",
    "id": "58d7d518-58b9-4e4d-bc2b-e523602feaaa",
    "fechaCreacion": "2024-11-16T18:02:28.475Z",
    "descripcion": "Descripción del incidente",
    "latitud": "12.345678",
    "longitud": "98.765432",
    "categoria": "Categoría del incidente",
    "usuarioId": "2d290d17-c462-4888-93e1-784ae20755b2"
}
```

**Prompt 3:**

Otro endpoint

1. Descripción general del endpoint:
  - Función principal: Consultar todos los reportes realizados en un perímetro de rango de 1 kilómetro, donde este valor también es parametrizable.
  - Contexto: Todo ususrio o no usuario pueden realizar reportes
2. GET
3. /api/reportes
4. No requiere autenticación
5. Parámetros
- De consulta (Query):
  - latitud: Obligatorio. Coordenada con punto decimal
  - longitud: Obligatorio. Coordenada con punto decimal
  - rango: Opcional. distacia en kilómetros, ejemplo 1 es 1 kilómetro, 0.5 son 500 metros
6. Respuesta
  - Códigos de estado HTTP: 200 OK; 400 Bad Request; 403 Forbidden;  500 Internal Server Error
7. Errores comunes:
  - 400 Bad Request: Latitud y longitud son requeridas
  - 401 Unauthorized: No se proporcionó token
  - 403 Forbidden: Token no válido
8. Ejemplo
- Enpoint completo con parámetros Query:
`/api/reportes?latitud=4.599394&longitud=-74.214062&rango=1`
- Respuesta exitosa:
  - Código: `2000 OK`
  - Cuerpo:
```json
[
    {
        "id": "936dfa9d-f959-4318-84dd-c6dfa99d2f5c",
        "usuarioId": "2d290d17-c462-4888-93e1-784ae20755b2",
        "descripcion": "delectus veniam ut",
        "categoria": "Esquina peligrosa",
        "latitud": "4.57939400000000000000000000",
        "longitud": "-74.21406200000000000000000000",
        "fechaCreacion": "2024-11-16T18:56:50.834Z",
        "createdAt": "2024-11-16T18:56:50.834Z",
        "updatedAt": "2024-11-16T18:56:50.834Z",
        "distanciaLineal": 1060.89728726091,
        "rating": null
    },
    {
        "id": "8bbe49aa-bd7f-4fcf-88d3-cf466a0537fb",
        "usuarioId": "2d290d17-c462-4888-93e1-784ae20755b2",
        "descripcion": "voluptatem",
        "categoria": "Asalto en transporte público",
        "latitud": "4.57231300000000000000000000",
        "longitud": "-74.22019000000000000000000000",
        "fechaCreacion": "2024-11-16T18:56:54.234Z",
        "createdAt": "2024-11-16T18:56:54.234Z",
        "updatedAt": "2024-11-16T18:56:54.235Z",
        "distanciaLineal": 268.49359568507225,
        "rating": null
    } 
]
```

**Prompt 4:**

Otro endpoint

1. Descripción general del endpoint:
  - Función principal: Dar una calificación entre 1 y 5 a un reporte.
  - Contexto: Calificar los reportes para tener un promedio de calificación par cada reporte.
2. POST
3. /api/ratings
4. Autenticaciónpor Bearer token, obtenido del endpoint "/api/auth/login"
5. Parámetros
- Del cuerpo:
```json
{
    "reporteId": "8ec8978e-78da-49b8-9c2c-7d5442e00231",
    "valor": 5, 
    "comentario": "No me lo habría imaginado" 
}
```

6. Respuesta
  - Códigos de estado HTTP: 201 Created; 404 Not Found; 403 Forbidden;  500 Internal Server Error
7. Errores comunes:
  - 404 Not Found: Reporte no encontrado
  - 401 Unauthorized: No se proporcionó token
  - 403 Forbidden: Token no válido
  - 500 Internal Server Error
8. Ejemplo
{
    "reporteId": "8ec8978e-78da-49b8-9c2c-7d5442e00231",
    "valor": 5, 
    "comentario": "No me lo habría imaginado" 
}
- Respuesta exitosa:
  - Código: 200 OK
  - Cuerpo:
```json
{
    "createdAt": "2024-11-16T21:51:36.494Z",
    "updatedAt": "2024-11-16T21:51:36.494Z",
    "id": "f9354f5b-35cc-4543-acee-b7088278a70b",
    "fechaCreacion": "2024-11-16T21:51:36.493Z",
    "reporteId": "8ec8978e-78da-49b8-9c2c-7d5442e00231",
    "usuarioId": "2d290d17-c462-4888-93e1-784ae20755b2",
    "valor": 5, 
    "comentario": "No me lo habría imaginado"
}
```

---