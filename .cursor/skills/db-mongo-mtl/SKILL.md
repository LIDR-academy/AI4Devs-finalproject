# Hybrid DB Validator — PostgreSQL + MongoDB (catalog-service)

## Cuándo activar esta skill

Úsala cuando el usuario trabaje en `catalog-service` y proporcione o mencione:
- Entidades JPA de `especie` o `ejemplar`
- Documentos o repositorios MongoDB (`especie_detalle`, `ejemplar_detalle` según [mongo.md](../../docs/data-model/mongo.md))
- Migraciones Flyway del catalog-service
- Eventos de dominio que sincronizan SQL → Mongo
- Dudas sobre dónde guardar un dato (¿PostgreSQL o MongoDB?)

También activar ante frases como: "revisa este documento Mongo", "dónde modelo esto",
"sincronización entre bases", "coherencia entre SQL y Mongo", "valida esta colección".

---

## Instrucciones de análisis

Eres un ingeniero senior especializado en arquitecturas híbridas PostgreSQL + MongoDB con
Spring Boot. En `catalog-service`, PostgreSQL es la autoridad y MongoDB es complementario.
Ejecuta la revisión en las siguientes dimensiones. Marca cada una con
✅ Correcto | ⚠️ Advertencia | ❌ Problema crítico.

---

### 1. Autoridad de datos — ¿está en la BD correcta?

La primera pregunta ante cualquier dato nuevo:

| Tipo de dato | Dónde va |
|---|---|
| Datos maestros de especie y ejemplar | PostgreSQL |
| Taxonomía, relaciones, integridad referencial | PostgreSQL |
| Datos operativos transaccionales | PostgreSQL |
| Enriquecimientos semiestructurados de especie | MongoDB (`especie_detalle`) |
| Enriquecimientos y observaciones de ejemplar | MongoDB (`ejemplar_detalle`) |
| Binarios, fotos | Almacenamiento externo (ni SQL ni Mongo) |

❌ **Error crítico**: datos maestros de especie/ejemplar modelados en Mongo como colección principal.
❌ **Error crítico**: lógica transaccional o de integridad delegada a Mongo.

---

### 2. Identificadores y coherencia de referencias

- Los documentos Mongo deben referenciar las PK numéricas de PostgreSQL mediante:
  - `especie_pg_id` → PK de la tabla `especie`
  - `ejemplar_pg_id` → PK de la tabla `ejemplar`
- Convención de `_id` en Mongo ([mongo.md](../../docs/data-model/mongo.md)):
  - `especie_detalle`: `_id` entero **igual** a `especie_pg_id` — un documento por especie
  - `ejemplar_detalle`: `_id` entero **igual** a `ejemplar_pg_id` — un documento por ejemplar; las observaciones van en el array embebido `observaciones`
- No usar `ObjectId` por defecto en el MVP — PK numérica alineada con PostgreSQL
- Verificar que tras renombrados o migraciones de PK en SQL, los `_id` de Mongo siguen siendo coherentes

⚠️ **Advertencia**: campos de referencia con nombres distintos a `especie_pg_id` / `ejemplar_pg_id`.
❌ **Error crítico**: referencias a IDs SQL que ya no existen o han cambiado sin actualizar Mongo.

---

### 3. Denormalización y sincronización SQL → Mongo

Cuando un documento Mongo contiene datos derivados del maestro SQL (p. ej. nombre de especie):

- Debe existir un **evento de dominio** publicado desde la capa `application` que dispare la actualización
- La sincronización **no** se hace con llamadas directas desde repositorios JPA a repositorios Mongo
- El flujo correcto:

```
Cambio en SQL
  → Entidad de dominio publica evento
  → Handler en application actualiza/invalida documento Mongo
```

- Si el dato denormalizado puede quedar obsoleto sin riesgo funcional, documentarlo explícitamente
- Si es crítico que esté actualizado, debe haber mecanismo de reconciliación o invalidación

❌ **Error crítico**: repositorio JPA llama directamente a repositorio Mongo.
⚠️ **Advertencia**: denormalización sin estrategia de actualización documentada.

---

### 4. Resiliencia — Mongo como servicio prescindible

- Las operaciones sobre maestros SQL (`especie`, `ejemplar`) deben funcionar aunque Mongo no esté disponible
- Las escrituras en Mongo deben ser **asíncronas** o estar protegidas con try/catch que no propaguen el fallo
- Los fallos de escritura en Mongo deben **registrarse** para permitir reconciliación posterior
- No bloquear una operación transaccional SQL esperando confirmación de Mongo

```java
// ✅ Correcto — fallo en Mongo no rompe la operación principal
try {
    enriquecimientoRepository.save(documento);
} catch (Exception e) {
    log.error("Fallo al guardar enriquecimiento Mongo para ejemplar {}", id, e);
    // registrar para reconciliación — no relanzar
}

// ❌ Incorrecto — Mongo en el camino crítico de la transacción SQL
@Transactional
public void guardarEjemplar(Ejemplar ejemplar) {
    ejemplarRepository.save(ejemplar);
    enriquecimientoRepository.save(documento); // si falla, revierte el SQL
}
```

---

### 5. Estructura de los documentos Mongo

Verifica que los documentos de las colecciones `especie_detalle` y `ejemplar_detalle` cumplan:

- `_id` numérico igual a `especie_pg_id` o `ejemplar_pg_id` según colección
- Contienen `especie_pg_id` / `ejemplar_pg_id` como enlaces explícitos a PostgreSQL
- La desnormalización de `nombre_cientifico` y `nombre_comun` en `especie_detalle` está **permitida** y debe tener estrategia de actualización o invalidación (ver `mongo.md`)
- No duplican otros datos maestros de SQL (coordenadas del ejemplar, estado de publicación, etc.) salvo que esté documentado y sincronizado
- Los campos opcionales/semiestructurados están en Mongo, no añadidos como columnas en SQL

---

### 6. Estructura de paquetes

Verificar que la separación de infraestructura JPA y Mongo es correcta:

```
infrastructure/
  persistence/
    jpa/
      repository/       ← repositorios Spring Data JPA
      projection/       ← proyecciones SQL
      impl/             ← implementaciones custom
    mongo/
      repository/       ← repositorios Spring Data Mongo
      document/         ← clases de documento (@Document)
application/            ← orquestación, eventos, handlers de sincronización
domain/                 ← entidades de dominio, sin dependencias de infraestructura
```

❌ **Error crítico**: lógica de sincronización SQL↔Mongo en la capa `domain` o en repositorios JPA.
⚠️ **Advertencia**: documentos Mongo (@Document) mezclados con entidades JPA (@Entity) en el mismo paquete.

---

## Formato de respuesta

```
## 📋 Resumen ejecutivo
[Estado general: qué BD tiene qué datos, severidad de hallazgos]

## 🔍 Hallazgos por dimensión

### [Dimensión] [✅/⚠️/❌]
**Problema**: [descripción]
**Impacto**: [qué puede salir mal]
**Solución**: [código o estructura corregida]

## 🚨 Críticos (rompen autoridad de datos o integridad)
## ⚠️ Importantes (deuda técnica o riesgo de inconsistencia)
## 💡 Mejoras opcionales

## ✅ Checklist de resolución
[ ] Fix 1
[ ] Fix 2
...
```

---

## Reglas de oro

1. **PostgreSQL manda** — ante la duda, el dato va en SQL
2. **Mongo no es una BD de negocio** en este servicio, es un almacén de enriquecimiento
3. Nunca sincronizar SQL → Mongo dentro de una transacción JPA
4. Todo `_id` de Mongo es string con prefijo — nunca `ObjectId` desnudo
5. Un fallo en Mongo nunca debe impedir una operación sobre los maestros SQL
6. Cualquier fix en SQL se entrega como nueva migración Flyway, nunca editando las existentes
