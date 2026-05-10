# ADR-0002: Claves primarias numéricas frente a UUID en persistencia relacional

## Estado

Aceptada

## Contexto

Las claves primarias técnicas pueden implementarse como **enteros autogenerados** (identidad o secuencia) o como **UUID** (u otros identificadores anchos de 128 bits o similares). Los UUID destacan cuando hace falta **generación distribuida** de filas sin un coordinador central, **varios nodos de base de datos con escritura**, partición horizontal con merges, o correlación global estable entre sistemas desacoplados.

En **MyTreeLibrary**, el MVP prevé **un único servidor de base de datos** relacional para el catálogo operativo: no hay partición horizontal con escritura repartida ni requisito de asignar identificadores sin contacto con la misma secuencia o tabla.

## Alternativas consideradas

1. **UUID (u otro identificador de 128 bits) como clave primaria**  
   Ofrece unicidad global sin secuencia compartida entre aplicaciones. Incrementa tamaño de PK y FK, el peso de índices y, en muchos motores, la localidad de acceso frente a un entero secuencial. Para un único nodo de BD **no aporta** un beneficio que compense ese coste en el MVP.

2. **UUID como columna secundaria (no PK)**  
   Podría valorarse más adelante para correlación con sistemas externos o trazas, manteniendo la PK numérica. Queda **fuera del MVP** salvo necesidad funcional explícita documentada.

## Decisión

Para entidades persistidas en **bases relacionales** del MVP:

- La **clave primaria técnica** será un **número entero autogenerado** (por ejemplo `BIGINT` con columna identidad o secuencia, según el motor).
- **No** se adoptará **UUID** (ni equivalentes de 128 bits) como clave primaria por defecto.

La norma breve para el modelo de datos y casos de uso queda reflejada en la regla **R9** de [data-model.md](../data-model/data-model.md).

## Consecuencias

- **Positivas:** PK y FK más compactas, índices más ligeros, integración habitual con JPA/Spring Data, y un orden cronológico aproximado por alta que ayuda en operación y diagnóstico.
- **Negativas:** los identificadores **secuenciales** son enumerables; no deben usarse como **único** mecanismo de control de acceso u ocultación de recursos. Si en el futuro hubiera **varias instancias con escritura** sobre el mismo esquema repartido, o fusión de bases sin coordinación, habría que **reabrir** la decisión (por ejemplo con un ADR que evalúe UUID, ULID, hi/lo, o identidades por rango por servicio).
