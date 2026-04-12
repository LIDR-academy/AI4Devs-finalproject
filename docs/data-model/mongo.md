# Resumen técnico para implementación

## Objetivo

Implementar una solución híbrida:

- **BD relacional** como sistema maestro para `ARBOL` y `ESPECIE`
- **MongoDB** para información semiestructurada y evolutiva

## Alcance Mongo

Se implementan dos colecciones:

- `enriquecimientos_especie`
- `enriquecimientos_arbol`

---

## Modelo funcional

### 1. `enriquecimientos_especie`

Guarda información enriquecida de una **especie** obtenida principalmente de ChatGPT.

Uso previsto:
- consolidar información reutilizable por especie
- almacenar campos conocidos y también atributos no previstos

Relación lógica:
- 1 documento Mongo por `idEspecie`

Campos principales:
- `idEspecie`: identificador de la especie en SQL
- `nombreCientifico`
- `datosNormalizados`: bloque con atributos canónicos
- `atributosDinamicos`: bloque flexible para nuevos conceptos
- `resumenFuentes`
- `estado`
- `auditoria`

### 2. `enriquecimientos_arbol`

Guarda notas y observaciones asociadas a un **árbol** concreto.

Uso previsto:
- notas del usuario
- incidencias
- observaciones técnicas
- mantenimiento
- comentarios libres

Relación lógica:
- 1:N desde `ARBOL` a `enriquecimientos_arbol`

Campos principales:
- `idArbol`: identificador del árbol en SQL
- `tipoNota`
- `titulo`
- `contenido`
- `etiquetas`
- `metadatos`
- `auditoria`

---

## Reglas de diseño

### Convenciones

- colecciones en minúsculas con guion bajo
- campos en `camelCase`
- nombres en castellano
- sin tildes ni `ñ` en nombres técnicos

### Criterios

- usar `datosNormalizados` para atributos frecuentes y gobernados
- usar `atributosDinamicos` para atributos nuevos o no previstos
- la **autoridad** del maestro (`ARBOL`, `ESPECIE`, taxonomía, etc.) sigue en la BD relacional; Mongo **no** la sustituye
- se permite **denormalización mínima** en documentos o vistas lógicas en Mongo (p. ej. `nombreCientifico`, `nombreComun`, nombre local del árbol) para **búsquedas e índices** sin cruzar con SQL en cada consulta; debe mantenerse **coherencia** con el maestro (actualizar o invalidar cuando cambie el SQL)
- Mongo complementa a SQL, no lo sustituye

---

## Ejemplo de documento: `enriquecimientos_especie`

```json
{
  "_id": "esp_45",
  "idEspecie": 45,
  "nombreCientifico": "Quercus ilex",
  "datosNormalizados": {
    "familia": "Fagaceae",
    "floracion": {
      "inicio": "primavera",
      "fin": "primavera"
    },
    "origen": [
      "Region mediterranea"
    ],
    "tipoHoja": "perenne",
    "alturaMaximaMetros": 25,
    "necesidadHidrica": "baja"
  },
  "atributosDinamicos": {
    "resistenciaSequia": "alta",
    "valorEcologico": "alto",
    "aptoEntornoUrbano": true
  },
  "resumenFuentes": {
    "fuentePrincipal": "chatgpt",
    "fechaUltimaConsulta": {
      "$date": "2026-04-11T10:30:00Z"
    },
    "confianza": 0.88,
    "fuentes": [
      {
        "tipo": "chatgpt",
        "referencia": "prompt_especie_v1"
      }
    ]
  },
  "estado": {
    "estadoRevision": "pendiente",
    "version": 1,
    "activo": true
  },
  "auditoria": {
    "fechaCreacion": {
      "$date": "2026-04-11T10:30:00Z"
    },
    "fechaActualizacion": {
      "$date": "2026-04-11T10:30:00Z"
    },
    "creadoPor": "sistema",
    "actualizadoPor": "sistema"
  }
}
```

---

## Ejemplo de documento: `enriquecimientos_arbol`

```json
{
  "_id": "arb_1001_001",
  "idArbol": 1001,
  "tipoNota": "observacion",
  "titulo": "Daños leves en ramas inferiores",
  "contenido": "Se observan pequeñas roturas en ramas bajas tras episodio de viento.",
  "etiquetas": [
    "mantenimiento",
    "viento",
    "inspeccion"
  ],
  "metadatos": {
    "origen": "usuario",
    "prioridad": "media",
    "visibilidad": "interna",
    "adjuntos": [
      {
        "nombre": "foto_rama_abril.jpg",
        "url": "https://servidor/adjuntos/foto_rama_abril.jpg"
      }
    ]
  },
  "auditoria": {
    "fechaCreacion": {
      "$date": "2026-04-11T11:00:00Z"
    },
    "fechaActualizacion": {
      "$date": "2026-04-11T11:00:00Z"
    },
    "creadoPor": "usuario_23",
    "actualizadoPor": "usuario_23"
  }
}
```

---

## Validación Mongo: `enriquecimientos_especie`

```javascript
db.createCollection("enriquecimientos_especie", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "idEspecie",
        "nombreCientifico",
        "datosNormalizados",
        "estado",
        "auditoria"
      ],
      properties: {
        _id: {
          bsonType: "string",
          description: "Identificador interno del documento"
        },
        idEspecie: {
          bsonType: ["long", "int", "decimal"],
          description: "Identificador de la especie en la base relacional"
        },
        nombreCientifico: {
          bsonType: "string",
          description: "Nombre cientifico de la especie"
        },
        datosNormalizados: {
          bsonType: "object",
          description: "Bloque principal con atributos canonicos conocidos",
          properties: {
            familia: { bsonType: "string" },
            floracion: {
              bsonType: "object",
              properties: {
                inicio: { bsonType: "string" },
                fin: { bsonType: "string" }
              }
            },
            origen: {
              bsonType: "array",
              items: { bsonType: "string" }
            },
            tipoHoja: { bsonType: "string" },
            alturaMaximaMetros: {
              bsonType: ["int", "long", "double", "decimal"]
            },
            necesidadHidrica: { bsonType: "string" }
          },
          additionalProperties: true
        },
        atributosDinamicos: {
          bsonType: "object",
          description: "Atributos no previstos inicialmente",
          additionalProperties: true
        },
        resumenFuentes: {
          bsonType: "object",
          properties: {
            fuentePrincipal: { bsonType: "string" },
            fechaUltimaConsulta: { bsonType: "date" },
            confianza: {
              bsonType: ["double", "decimal", "int", "long"]
            },
            fuentes: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  tipo: { bsonType: "string" },
                  referencia: { bsonType: "string" }
                },
                additionalProperties: true
              }
            }
          },
          additionalProperties: true
        },
        estado: {
          bsonType: "object",
          required: ["estadoRevision", "version", "activo"],
          properties: {
            estadoRevision: {
              enum: ["pendiente", "revisado", "rechazado"]
            },
            version: {
              bsonType: ["int", "long"]
            },
            activo: {
              bsonType: "bool"
            }
          }
        },
        auditoria: {
          bsonType: "object",
          required: ["fechaCreacion", "fechaActualizacion"],
          properties: {
            fechaCreacion: { bsonType: "date" },
            fechaActualizacion: { bsonType: "date" },
            creadoPor: { bsonType: "string" },
            actualizadoPor: { bsonType: "string" }
          },
          additionalProperties: true
        }
      },
      additionalProperties: false
    }
  }
})
```

---

## Validación Mongo: `enriquecimientos_arbol`

```javascript
db.createCollection("enriquecimientos_arbol", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "idArbol",
        "tipoNota",
        "contenido",
        "auditoria"
      ],
      properties: {
        _id: {
          bsonType: "string",
          description: "Identificador interno del documento"
        },
        idArbol: {
          bsonType: ["long", "int", "decimal"],
          description: "Identificador del arbol en la base relacional"
        },
        tipoNota: {
          bsonType: "string",
          description: "Clasificacion funcional de la nota"
        },
        titulo: {
          bsonType: "string",
          description: "Titulo breve de la nota"
        },
        contenido: {
          bsonType: "string",
          description: "Texto libre introducido por el usuario"
        },
        etiquetas: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Etiquetas de clasificacion"
        },
        metadatos: {
          bsonType: "object",
          properties: {
            origen: { bsonType: "string" },
            prioridad: { bsonType: "string" },
            visibilidad: { bsonType: "string" },
            adjuntos: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  nombre: { bsonType: "string" },
                  url: { bsonType: "string" }
                },
                additionalProperties: true
              }
            }
          },
          additionalProperties: true
        },
        auditoria: {
          bsonType: "object",
          required: ["fechaCreacion", "fechaActualizacion"],
          properties: {
            fechaCreacion: { bsonType: "date" },
            fechaActualizacion: { bsonType: "date" },
            creadoPor: { bsonType: "string" },
            actualizadoPor: { bsonType: "string" }
          },
          additionalProperties: true
        }
      },
      additionalProperties: false
    }
  }
})
```

---

## Índices recomendados

### `enriquecimientos_especie`

```javascript
db.enriquecimientos_especie.createIndex(
  { idEspecie: 1 },
  { unique: true, name: "uk_enriquecimientos_especie_idEspecie" }
)

db.enriquecimientos_especie.createIndex(
  { nombreCientifico: 1 },
  { name: "idx_enriquecimientos_especie_nombreCientifico" }
)

db.enriquecimientos_especie.createIndex(
  { "estado.estadoRevision": 1 },
  { name: "idx_enriquecimientos_especie_estadoRevision" }
)
```

### `enriquecimientos_arbol`

```javascript
db.enriquecimientos_arbol.createIndex(
  { idArbol: 1 },
  { name: "idx_enriquecimientos_arbol_idArbol" }
)

db.enriquecimientos_arbol.createIndex(
  { idArbol: 1, tipoNota: 1 },
  { name: "idx_enriquecimientos_arbol_idArbol_tipoNota" }
)

db.enriquecimientos_arbol.createIndex(
  { etiquetas: 1 },
  { name: "idx_enriquecimientos_arbol_etiquetas" }
)
```

---

## Reglas de implementación

### Para `enriquecimientos_especie`

- crear o actualizar por `idEspecie`
- mantener un único documento activo por especie
- mapear campos conocidos en `datosNormalizados`
- enviar campos desconocidos a `atributosDinamicos`

### Para `enriquecimientos_arbol`

- insertar una nueva nota por cada aportación del usuario
- no sobrescribir notas previas salvo edición explícita
- usar `tipoNota` con vocabulario controlado

Valores sugeridos para `tipoNota`:
- `observacion`
- `incidencia`
- `mantenimiento`
- `valoracion`
- `comentario`
- `notaLibre`

---

## Flujo recomendado

### Alta de especie enriquecida

1. recibir respuesta JSON de ChatGPT
2. normalizar campos conocidos
3. separar campos no previstos
4. hacer `upsert` sobre `enriquecimientos_especie` por `idEspecie`

### Alta de nota de árbol

1. recibir nota del usuario
2. construir documento con `idArbol`
3. añadir `auditoria`
4. insertar en `enriquecimientos_arbol`

---

## Decisiones clave

- **SQL** sigue siendo el sistema maestro
- **Mongo** almacena enriquecimiento y notas
- puede existir **denormalización mínima** (p. ej. nombres de especie o de árbol) para búsqueda en Mongo sin SQL; debe mantenerse alineada con el maestro relacional
- `idEspecie` e `idArbol` son referencias lógicas a SQL
- no hay claves foráneas en Mongo; la integridad debe controlarse en aplicación
- la estructura debe ser flexible, pero con validación mínima obligatoria

---

## Resultado esperado

El desarrollador debe implementar:

- creación de las dos colecciones
- validadores `$jsonSchema`
- índices
- lógica de `upsert` para `enriquecimientos_especie`
- lógica de inserción para `enriquecimientos_arbol`
- normalización de atributos conocidos frente a atributos dinámicos
