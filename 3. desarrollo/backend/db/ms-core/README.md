# MS-CORE (Gateway) - DB Notes

- Rol: gateway y capa de observabilidad/resiliencia. No define tablas propias.
- Uso de BD: sólo métricas/estado en memoria (Prometheus) y conexión compartida para enrutar.
- Referencias:
  - Arquitectura y modelo: ../ms-core/.prompts/05-diseno.md y ../ms-core/.prompts/06-modelo-datos.md
  - Original: 3. desarrollo/backend/ms-core/
