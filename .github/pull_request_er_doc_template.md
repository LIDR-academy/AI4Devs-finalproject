### Checklist ER Diagram (README)

- [ ] Encabezado del bloque con formato homogéneo: `#### **<motor> <servicio>:**` o, con numeración de sección, `#### **X.X.X <motor> <servicio>:**`.
- [ ] Nombres de entidades en `MAYÚSCULAS_SNAKE_CASE` en todo el diagrama.
- [ ] Tipos consistentes entre diagramas del mismo motor (PostgreSQL: `bigint`, `varchar`, `text`, `timestamptz`, `numeric`, `integer`, etc.; modelo lógico: `string`, `datetime`, `boolean`, `decimal`, `int` si aplica).
- [ ] Orden de campos por entidad:
  1) PK  
  2) FK (relaciones de negocio; ver excepción auditoría abajo)  
  3) atributos de negocio  
  4) auditoría (`creado_en`, `creado_por`, `modificado_en`, `modificado_por`, u homólogos).
- [ ] Sufijos `PK/FK/UK` aplicados de forma uniforme; **no** usar sufijo `FK` en `creado_por` ni `modificado_por` (auditoría JPA; la relación con `USUARIO_APP` se expresa en Mermaid si procede).
- [ ] Cardinalidades Mermaid coherentes (`||--o{`, `||--||`, etc.) para relaciones equivalentes.
- [ ] Labels de relación con estilo verbal uniforme (misma voz y mismo idioma).
- [ ] Indentación y espaciado uniforme (sin líneas en blanco entre entidades del bloque `erDiagram`).
- [ ] Leyenda común presente (una vez por sección §4.2): significado de `PK/FK/UK`, excepción de auditoría y convención de tipos.
- [ ] Render validado en GitHub (desktop + móvil) sin solapes ni saturación visual.
