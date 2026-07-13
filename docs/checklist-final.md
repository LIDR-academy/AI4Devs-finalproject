# Checklist entrega final

## Local

- [ ] `npm install`
- [ ] `Copy-Item backend/.env.example backend/.env`
- [ ] `npm run db:migrate`
- [ ] `npm run db:seed`
- [ ] `npm test`
- [ ] `npm run build`

## Railway

- [ ] Crear servicio PostgreSQL.
- [ ] Crear servicio backend.
- [ ] Crear servicio frontend.
- [ ] Configurar `DATABASE_URL` en backend.
- [ ] Configurar `DATABASE_SSL=true`.
- [ ] Configurar `FRONTEND_URL`.
- [ ] Configurar `ALLOWED_ORIGINS`.
- [ ] Configurar `VITE_API_URL` en frontend.
- [ ] Verificar `/health`.
- [ ] Ejecutar seed en PostgreSQL si no hay producto demo.

## Meta WhatsApp

- [ ] Crear app en Meta Developers.
- [ ] Agregar producto WhatsApp.
- [ ] Obtener `Phone Number ID`.
- [ ] Generar access token.
- [ ] Configurar `META_WHATSAPP_VERIFY_TOKEN`.
- [ ] Configurar callback `https://TU-BACKEND/webhooks/whatsapp`.
- [ ] Suscribir eventos `messages`.
- [ ] Probar mensaje entrante con SKU.

## Flujo funcional

- [ ] Crear lead por simulador o WhatsApp real.
- [ ] Ver conversacion en frontend.
- [ ] Generar oferta.
- [ ] Aceptar oferta.
- [ ] Generar link de pago.
- [ ] Simular confirmacion de pago.
- [ ] Confirmar descuento de stock.
- [ ] Coordinar entrega.
- [ ] Abrir link de Maps.

## Evidencia

- [ ] URL frontend.
- [ ] URL backend health.
- [ ] Captura del producto y stock.
- [ ] Captura de conversacion.
- [ ] Captura de oferta.
- [ ] Captura de orden y pago.
- [ ] Captura de entrega con Maps.
- [ ] Resultado de tests/build.

