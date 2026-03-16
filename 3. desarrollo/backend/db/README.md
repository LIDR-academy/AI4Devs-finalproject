# DB Assets (MS Collection)

Centraliza los scripts SQL y referencias de base de datos usados por cada microservicio.

## Resumen rápido

| Microservicio | Script extraído | Comentario | Docs clave |
|---|---|---|---|
| MS-CORE | — | Gateway sin tablas propias | ms-core/.prompts/06-modelo-datos.md |
| MS-AUTH | text.sql | Seeds de persona/usuario de ejemplo | ms-auth/.prompts/06-modelo-datos.md |
| MS-PERSO | — | No se encontró script SQL en el repo | ms-perso/.prompts/06-modelo-datos.md |
| MS-CONFI | 001-CreateGeoCatalog.sql | Catálogo GEO (provincias, cantones, parroquias) | ms-confi/IMPLEMENTACION-GEO-RESUMEN.md, ms-confi/.prompts/06-modelo-datos.md |

## Estructura

```
db/
├─ README.md                      # Este índice
├─ ms-core/README.md              # Gateway (sin SQL propio)
├─ ms-auth/
│   ├─ README.md                  # Descripción de seeds
│   └─ text.sql                   # Inserciones persona/usuario
├─ ms-perso/README.md             # Sin script localizado
└─ ms-confi/
    ├─ README.md                  # Resumen catálogo GEO
    └─ 001-CreateGeoCatalog.sql   # Script oficial GEO
```

## Notas
- Los scripts se copiaron desde sus ubicaciones originales para consulta centralizada. Las rutas originales se documentan en cada README.
- Mantén sincronizados estos archivos si el origen cambia (actualiza aquí después de modificar en el MS correspondiente).
