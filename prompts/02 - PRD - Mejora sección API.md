# Revisión de PRD y adición de API
_Exported on 5/25/2026 at 21:33:10 UTC from Cursor (3.5.17)_

---

**User**

@docs/prd.md Quiero que revises este fichero de PRD y que entre los bloques "5. Modelo de datos" y "6. Diseño de sistema a alto nivel", añadas uno del tipo "API (Alto-Nivel)”. 

---

**Cursor**

Revisando el PRD para localizar las secciones 5 y 6 y añadir "API (Alto-Nivel)" con el mismo estilo y coherencia con el documento.



Insertando la sección «API (Alto-Nivel)» y renumerando las secciones siguientes (7–9) y sus subsecciones para mantener la tabla de contenidos coherente.



Hecho. Resumen de los cambios:

## Cambios realizados

1. **Nueva sección `## 6. API (Alto-Nivel)`** colocada justo después del bloque **5.3 Relationships (summary)** y antes del antiguo diseño de sistema, con el mismo patrón que el resto del PRD (bloque de propósito + subsecciones numeradas):
   - **6.1** Estilo REST, prefijo `/api`, JSON, fechas ISO 8601, forma orientativa de errores.
   - **6.2** Identidad en MVP (sin login, usuario implícito, evolución hacia token).
   - **6.3** Tabla de **recursos y operaciones** alineada con el modelo (perfil, semanas, bloqueo, hábitos, entradas diarias, recompensas, canjes), incluyendo las rutas ya citadas en el documento (`GET /api/profile`, `GET /api/weeks/current`, `POST /api/weeks/{weekId}/lock`) y el resto como contrato de producto.
   - **6.4** Paginación/versionado como notas de evolución.

2. **Renumeración** para que la numeración siga siendo lineal:
   - Antigua **6. Diseño de sistema…** → **7.** (subsecciones **7.1–7.4**).
   - Antigua **7. Diagramas C4** → **8.**
   - Antigua **8. Non-Goals** → **9.**

3. **Tabla de contenidos** actualizada con el nuevo enlace `#6-api-alto-nivel` y los anclajes **7**, **8** y **9**.

Si tu visor de Markdown genera otro slug para el título (por ejemplo con paréntesis), y el enlace del índice no salta bien, dímelo y lo ajustamos al formato exacto que use tu herramienta.

