
# 🎨 Frontend Delivery Playbook (React)

## 🧭 Principios
- UI reactiva, desacoplada del backend
- Contratos generados desde OpenAPI
- Sin lógica de negocio en la UI (solo presentación + acciones)
- Flujo: API First → Generar cliente → Implementar UI → Tests

---

## 🖥️ Stack obligatorio
- **React** (LTS estable)
- **TypeScript**
- **Build tool**: Vite (recomendado)
- **Estado**: React Query + Zustand (o el que defina el repo)
- **Estilos**: Tailwind / CSS Modules (según convenciones)
- **Testing**: Jest/Vitest + React Testing Library
- **E2E**: Playwright o Cypress
- **API Client**: Autogenerado por OpenAPI Generator (typescript-fetch o axios)

---

## 🚫 Antipatrones
- No usar Angular/Vue/Svelte.
- No escribir clientes API manualmente.
- No copiar estructuras del backend (UI ≠ dominio).
- No introducir lógica de negocio en React.

---

## 🎯 Pipeline Frontend
1. Recibir el YAML de backend (API First)
2. Autogenerar cliente React (`npm run generate:api`)
3. Implementación de componentes y hooks
4. Tests unitarios
5. Tests de integración
6. E2E (contra backend real o mockeado)
7. Deploy  
