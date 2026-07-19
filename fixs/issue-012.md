# Issue-012: Pago con Flow da error al reservar

**Fecha:** 2026-07-18  
**Contexto:** El pago con Flow no funciona y da error al intentar completar una reserva. Se debe verificar la integración, configuración y manejo de errores del servicio de pago.  
**Estado:** 🔧 En progreso

---

## Problema

- Al intentar completar una reserva usando Flow como método de pago, se produce un error
- No está claro si el error ocurre en la creación de la orden, en la redirección a Flow o en el webhook de confirmación
- El usuario no recibe retroalimentación útil del error

## Comportamiento esperado

- El flujo de pago con Flow debe completarse sin errores
- El usuario debe ser redirigido correctamente al formulario de pago de Flow
- Al confirmar el pago, Flow debe notificar al backend y la reserva debe quedar registrada como pagada
- En caso de error, mostrar un mensaje claro al usuario

## Solución

1. Revisar las credenciales de Flow (`apiKey`, `secretKey`, `environment`) en la configuración del backend
2. Verificar que la URL de retorno (`returnUrl`) y la URL de confirmación (`confirmationUrl`) sean accesibles
3. Revisar los logs del endpoint de creación de orden en Flow
4. Validar el webhook de confirmación: firma HMAC, parsing del body, actualización del estado de la reserva
5. Agregar manejo de errores explícito y logging en el servicio de pago
6. Probar en entorno sandbox de Flow antes de producción

## Archivos a modificar

- `backend/Services/FlowPaymentService.cs` (o equivalente)
- `backend/Controllers/PaymentController.cs`
- `backend/appsettings.json` / variables de entorno — verificar credenciales
- `frontend/src/pages/Checkout.tsx` — manejo de errores en UI

## Relacionado

- Reservas (Issue de booking flow)
- Configuración de entorno (variables de Flow en `.env` o secrets)
