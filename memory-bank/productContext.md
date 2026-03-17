# Product Context

## Problem Statement
- Costes altos de transporte (combustible, parking, peajes) y baja ocupación de vehículos.
- Necesidad corporativa de reducir CO₂ y mejorar bienestar y parking.
- Falta de una herramienta interna y segura para coordinar trayectos entre empleados.

## Target Users
- Primary users: Empleados (Conductores y Pasajeros).
- Secondary users: RRHH, Sostenibilidad, Facilities/Seguridad.

## Value Proposition
- Plataforma interna y segura para compartir coche con integración SSO, privacidad y control de datos.
- Reduce costes, CO₂ y presión de parking; mejora coordinación y experiencia de empleados.
- Integración con sistemas corporativos (calendario, BI) y capacidad de personalización.

## Key Use Cases
- UC1 Autenticación corporativa (SSO) y perfil mínimo.
- UC3 Publicar trayecto como conductor.
- UC4 Buscar trayecto como pasajero.
- UC5 Reservar plaza y recibir confirmaciones/notificaciones.
- UC6 Ver viajes confirmados.

## Methodology & Collaboration
- Enfoque DDD/TDD/SOLID: definir epics y US, derivar tickets técnicos, tests antes de código.
- Documentación viva en `/doc` (PlantUML/Mermaid) y registro de prompts en `/Prompts/prompts_xvb.md`.
- El asistente pregunta dudas antes de implementar y no genera código sin autorización explícita.

## UX Principles
- Onboarding rápido y privacidad (zona aproximada, no dirección exacta).
- Matching claro y filtrado básico por sede/horario en MVP.
- Coordinación simple pre‑viaje; feedback 1‑clic en evolutivo.
