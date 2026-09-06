# Casos de uso

Orquestan el dominio y los repositorios para ejecutar una acción de negocio
(p. ej. "encolar en reserva", "confirmar oferta"). Reciben sus dependencias
(repositorios, reloj, notificador) por parámetro — sin DI pesado (ADR-0001 §2).

- No importan `next/*` ni tipos HTTP: son invocables desde un Route Handler **y**
  desde el scheduler (`scheduler/`).
- La validación de entrada se hace con Zod en el borde (Route Handler); aquí se
  asumen datos ya validados y se aplican las **invariantes de dominio**.

Cada capability de `openspec/changes/clickoteca-mvp/specs/*` aporta sus casos de uso
al implementarse (tareas 2–7).
