# Guía de pruebas — Flow sandbox y flujo de pago end-to-end

> Cómo levantar el proyecto, configurar las credenciales del sandbox de Flow y probar
> el flujo completo de reserva + pago con tarjetas de prueba.
> Última actualización: 2026-07-16 (validado end-to-end contra sandbox.flow.cl).

---

## 1. Levantar el proyecto en local

```bash
# 1. Infraestructura (PostgreSQL 16 + PostGIS y MinIO)
docker-compose up -d

# 2. Imágenes de muestra en MinIO (primera vez)
./scripts/seed-images.ps1              # o: docker compose --profile seed-images up seed-images

# 3. Backend (desde backend/)
dotnet run --seed                      # primera vez: migra + seed (solo si la BD está vacía)
dotnet run                             # API en http://localhost:5000

# 4. Frontend (desde frontend/)
npm ci                                 # primera vez
npm start                              # http://localhost:4200
```

Suites de tests (Definition of Done):

```bash
cd backend && dotnet test              # xUnit + Testcontainers (requiere Docker corriendo)
cd frontend && npm test -- --watch=false
```

## 2. Configurar credenciales del sandbox de Flow

Las claves **nunca se commitean**. Opciones (ver también `.env.example`):

| Entorno | Dónde | Cómo |
|---|---|---|
| Local (`dotnet run`) | `dotnet user-secrets` (recomendado) | `dotnet user-secrets set "Flow:ApiKey" "..."` + `"Flow:SecretKey"` + `"Flow:UseMock" "false"` desde `backend/` |
| Local (alternativa) | `backend/appsettings.Development.json` (gitignored) | Copiar `appsettings.Development.example.json` y completar la sección `Flow` |
| Docker Compose | `.env` (gitignored) | Copiar `.env.example` y completar `FLOW_API_KEY`, `FLOW_SECRET_KEY`, `FLOW_USE_MOCK=false` |
| Producción | Variables de entorno del hosting | `Flow__ApiKey`, `Flow__SecretKey`, `Flow__UseMock=false` |

⚠️ Si copias el example, **elimina la sección `Jwt`** o pon un secret real de ≥32 caracteres:
el placeholder `<local-secret-256-bits>` es demasiado corto y rompe el login (error IDX10720).

Con `Flow:UseMock=true` (default) todo funciona sin credenciales usando el checkout
simulado `/pago-simulado` — es el modo que usan los tests automatizados y el CI.

## 3. Flujo de prueba end-to-end contra el sandbox

1. **Login** con un usuario cliente seed (password `Test1234!`). ⚠️ El sandbox de Flow
   **valida que el email del pagador sea real** (error 1620 si no lo es); los emails seed
   `@example.cl` son ficticios, así que actualiza uno en la BD dev con un email tuyo:

   ```sql
   UPDATE users SET email='tu-email-real@dominio.cl' WHERE email='camila.rojas@example.cl';
   ```

2. **Reservar**: perfil de un artista → seleccionar slot → resumen de reserva →
   "Pagar depósito". Debe redirigir a `https://sandbox.flow.cl/...` (si ves
   `/pago-simulado`, sigue activo el mock — revisa `Flow:UseMock` y reinicia la API).
   Recuerda: el hold dura **5 minutos**; si expira, reserva de nuevo.

3. **Pagar** con las tarjetas de prueba de Webpay/Transbank (ambiente de integración):

   | Resultado | Tarjeta | Número | CVV | Vencimiento |
   |---|---|---|---|---|
   | ✅ Aprobado | VISA | `4051 8856 0044 6623` | 123 | cualquier fecha futura |
   | ❌ Rechazado | Mastercard | `5186 0595 5959 0568` | 123 | cualquier fecha futura |

   Cuando el checkout pida autenticación bancaria (banco simulado):
   **RUT** `11.111.111-1` · **clave** `123`. Monto mínimo del sandbox: $350 CLP.

4. **Confirmar el pago (solo en local)**: la confirmación depende del webhook
   `POST /api/payments/confirm`, y los servidores de Flow **no pueden alcanzar
   `localhost`** — al volver del checkout la reserva aparecerá como no confirmada.
   Dispara el confirm manualmente con el token de la orden (visible en la URL del
   checkout o en el log de la API):

   ```bash
   curl -X POST "http://localhost:5000/api/payments/confirm" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "token=EL_TOKEN_DE_LA_ORDEN"
   ```

   El endpoint es seguro de invocar así: autentica consultando el estado real a Flow
   con petición firmada (el token por sí solo no otorga nada) y es idempotente.
   Alternativa sin paso manual: exponer la API con un túnel (p. ej. `ngrok http 5000`)
   y configurar `Flow:ApiBaseUrl` con la URL pública.

5. **Verificar**: "Mis reservas" debe mostrar la reserva **confirmada**; en la BD,
   `payments.status = completed` y `bookings.status = confirmed`.

## 4. Referencias

- Tarjetas y credenciales de prueba: [Transbank Developers](https://www.transbankdevelopers.cl/documentacion/como_empezar) · [Flow — Credenciales](https://developers.flow.cl/en/docs/credentials)
- Implementación: `backend/Infrastructure/External/FlowClient.cs` (firma HMAC-SHA256) y `backend/Domain/Services/PaymentService.cs`
- Historia de usuario: `docs/us/us0009/` (mock-first) · guía general de entorno: `docs/development_guide.md`
