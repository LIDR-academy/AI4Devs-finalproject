# Checklist de validacion - Entrega 2

## Preparacion

- [ ] Crear rama `feature-entrega2-RO`.
- [ ] Confirmar que `readme.md`, `prompts.md` y `docs/entrega1/` siguen describiendo ComercIA.
- [ ] Instalar dependencias en `entrega2/`.
- [ ] Crear `backend/.env` desde `backend/.env.example`.
- [ ] Ejecutar migracion y seed.

## Comandos

```powershell
cd F:\aspis\SergioCursos\AI4Devs-finalproject\entrega2
npm install
Copy-Item backend/.env.example backend/.env
npm run db:migrate
npm run db:seed
npm test
npm run build
```

## Ejecucion manual

Terminal 1:

```powershell
npm run dev:backend
```

Terminal 2:

```powershell
npm run dev:frontend
```

## Flujo a probar

- [ ] Abrir `http://localhost:5173`.
- [ ] Ver producto demo con stock y regla de descuento.
- [ ] Crear lead desde el simulador de WhatsApp.
- [ ] Confirmar que aparece la conversacion.
- [ ] Generar oferta sugerida.
- [ ] Aceptar oferta y crear orden.
- [ ] Generar link de pago.
- [ ] Simular pago confirmado.
- [ ] Confirmar que el stock baja.
- [ ] Coordinar entrega.
- [ ] Abrir link de Maps.

## Evidencia para el PR

- [ ] Resultado de `npm test`.
- [ ] Resultado de `npm run build`.
- [ ] Captura del frontend con conversacion.
- [ ] Captura de oferta/orden/pago.
- [ ] Captura de entrega con Maps.
