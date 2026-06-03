# Capa application

Hooks y orquestación de casos de uso que combinan dominio e infraestructura.

- **Dashboard:** `useHabitDashboard.ts` — estado del panel de hábitos y recompensas
- **Perfil:** `useUserProfile.ts` — carga del usuario vía `profileApi`

Los hooks consumen tipos de `domain/` y adaptadores de `infrastructure/`; no contienen JSX.
