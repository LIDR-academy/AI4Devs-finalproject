# TejaFlow Implementation Checklist

This checklist converts the requirements from `readme.md` into small implementation tasks.
Each task should be approved before creating or editing application files.

## Plan Progress

- [x] Task 1: Inspect current repository.
- [x] Task 2: Extract requirements and create implementation checklist file.
- [x] Task 3: Create base project structure.
- [x] Task 4: Backend foundation.
- [x] Task 5: Domain model.
- [x] Task 6: Database layer.
- [x] Task 7: Authentication and authorization.
- [x] Task 8: Inventory API.
- [x] Task 9: Breakage/Merma API.
- [x] Task 10: Quotation API.
- [x] Task 11: Sales and payment API.
- [x] Task 12: Partial deliveries and logistics API.
- [x] Task 13: Frontend foundation.
- [x] Task 14: Frontend inventory module.
- [x] Task 15: Frontend sales module.
- [x] Task 16: Frontend quotation module.
- [x] Task 17: Frontend logistics module.
- [x] Task 18: Frontend admin/dashboard module.
- [x] Task 19: Automated testing.
- [x] Task 20: Containerization.
- [x] Task 21: Oracle Cloud deployment configuration.
- [x] Task 22: GitHub Actions CI/CD pipeline.
- [x] Task 23: GitHub Secrets and secure deployment.
- [x] Task 24: Automated production deployment.
- [x] Task 25: Local run instructions.
- [x] Task 26: Final verification.

## 1. Repository And Project Setup

- [x] Confirm repository state before each implementation phase.
- [x] Create backend folder structure under `backend/`.
- [x] Create frontend folder structure under `frontend/`.
- [x] Create database or migration support structure.
- [x] Add shared documentation/configuration files only when approved.
- [x] Keep backend, frontend, database, and deployment concerns separated.

## 2. Architecture Baseline

- [x] Implement a three-layer architecture: frontend SPA, backend REST API, SQL Server persistence.
- [x] Use Vue.js 3, TypeScript, Vite, and PrimeVue for the frontend.
- [x] Use ASP.NET Core Web API with .NET 10 for the backend.
- [x] Use Entity Framework Core 10 for data access.
- [x] Use Microsoft SQL Server 2022+ as the relational database.
- [x] Keep business rules in backend services, not directly in controllers or UI code.
- [x] Support JSON-based communication between SPA and API.
- [x] Prepare CORS configuration for frontend-to-backend communication.

## 3. Backend Solution Structure

- [x] Create `TejaFlow.Domain` for business entities and domain rules.
- [x] Create `TejaFlow.Application` for use cases, services, DTOs, and interfaces.
- [x] Create `TejaFlow.Infrastructure` for EF Core, SQL Server mappings, repositories, and external infrastructure.
- [x] Create `TejaFlow.WebApi` for controllers, authentication, Swagger/OpenAPI, and API startup.
- [x] Configure dependency injection between layers.
- [x] Add global validation/error handling.
- [x] Add Swagger/OpenAPI support for local API inspection.

## 4. Frontend Application Structure

- [x] Create Vue app shell with routing and module navigation.
- [x] Configure TypeScript.
- [x] Configure PrimeVue components and theme.
- [x] Create `src/core/` for API clients, auth helpers, shared types, and interceptors.
- [x] Create `src/features/inventario/`.
- [x] Create `src/features/ventas/`.
- [x] Create `src/features/cotizaciones/`.
- [x] Create `src/features/logistica/`.
- [x] Create `src/features/admin/`.
- [x] Add role-aware navigation and protected views.

## 5. Domain Entities

- [x] Add `Usuario` entity for internal users.
- [x] Add `ProductoTeja` or `Teja` entity for roofing tile catalog records.
- [x] Add `LoteProduccion` entity for batch-level stock.
- [x] Add `MermaRotura` entity for broken/damaged tile reports.
- [x] Add `Cliente` entity for buyers.
- [x] Add `PedidoVenta` entity for sales orders and quotations.
- [x] Add `DetallePedido` entity for sale line items.
- [x] Add `PagoVenta` entity for payment records.
- [x] Add `DespachoFlete` entity for freight/dispatch records.
- [x] Add `RemisionParcial` or `EntregaParcial` entity for partial deliveries.
- [x] Add inventory movement tracking if needed for auditability.

## 6. Enumerations And Business Types

- [x] Add user roles: `Admin`, `Vendedor`, `Almacenista`, and logistics/driver role if required.
- [x] Add tile materials: clay/barro, concrete/cemento, polycarbonate, fibrocement or equivalents from the README.
- [x] Add order statuses: quotation, paid, partial, dispatched, cancelled if needed.
- [x] Add payment methods: cash, credit card, debit card.
- [x] Add freight/truck types based on total weight and logistics requirements.
- [x] Add breakage reasons or allow a required free-text reason.

## 7. Database Schema And EF Core Mapping

- [x] Map all entities to SQL Server tables using the README naming conventions.
- [x] Use snake_case table and column names where specified.
- [x] Configure primary keys.
- [x] Configure foreign keys.
- [x] Configure unique constraints, including unique batch/lot codes.
- [x] Configure `NOT NULL` constraints for required fields.
- [x] Configure `CHECK` constraints to prevent negative stock and invalid quantities.
- [x] Configure decimal precision for prices, taxes, dimensions, weight, and calculated areas.
- [x] Configure delete behavior as `Restrict` or `NoAction` for historical/transactional records.
- [x] Add indexes for stock lookup, tile filtering, sales history, and dispatch queries.
- [x] Create EF Core migrations.
- [x] Add realistic seed data for users, products, lots, clients, sales, and payments.

## 8. Inventory Requirements

- [x] List available roofing tiles with material, color, dimensions, weight, price, and global stock.
- [x] Filter inventory by material and color.
- [x] Show stock by lot/batch.
- [x] Track current stock per production lot.
- [x] Track global stock per tile model as calculated or maintained aggregate.
- [x] Prevent negative stock at the domain, API, and database levels.
- [x] Support reorder alerts when stock falls below a safe minimum.
- [x] Ensure sales and breakage affect the correct lot stock.
- [x] Preserve lot traceability to reduce color/tone mismatch in customer projects.

## 9. Breakage And Waste Requirements

- [x] Implement merma/breakage registration for warehouse users.
- [x] Require lot ID, quantity, user ID, date, and reason.
- [x] Validate that the selected lot exists.
- [x] Validate that broken quantity is greater than zero.
- [x] Validate that broken quantity does not exceed current lot stock.
- [x] Deduct broken pieces from the lot stock.
- [x] Record the breakage event for audit and financial loss reporting.
- [x] Perform stock deduction and breakage insertion in one transaction.
- [x] Return `400 Bad Request` when breakage exceeds available stock.
- [x] Return `403 Forbidden` when the user role is not allowed.

## 10. Quotation Requirements

- [x] Implement architectural quotation calculation.
- [x] Accept customer, tile, base roof area, and roof slope/inclination.
- [x] Validate no negative roof area.
- [x] Validate slope does not exceed physically valid limits.
- [x] Calculate real roof surface from base area and slope.
- [x] Calculate required tile quantity based on tile dimensions/coverage.
- [x] Apply configurable waste/breakage margin, commonly 5% to 10%.
- [x] Calculate total load weight.
- [x] Suggest freight/truck type based on weight and volume.
- [x] Apply pricing rules, volume discounts, freight cost, tax, subtotal, and total.
- [x] Return all calculated values to the frontend.
- [x] Allow converting a quotation into a sale when approved.

## 11. Sales Requirements

- [x] Build sales API endpoints for creating and managing sales orders.
- [x] Build a sales screen/shell for `Vendedor` and `Admin` users.
- [x] Allow selecting customer, tile, lot if applicable, quantity, discount, and freight data.
- [x] Show real-time stock availability before sale confirmation.
- [x] Block sale confirmation when requested quantity exceeds available stock.
- [x] Support price matrix behavior for wholesale, distributor, and end-customer scenarios.
- [x] Calculate subtotal, discount, tax, freight, and final total.
- [x] Store the seller/user responsible for each sale.
- [x] Reduce inventory transactionally when the sale is confirmed or paid, according to the selected rule.
- [x] Ensure sales inventory affectation updates lot stock and global stock consistently.
- [x] Prevent partial persistence if payment or inventory update fails.

## 12. Payment Requirements

- [x] Add payment model and persistence.
- [x] Support cash payments.
- [x] Support credit card payments.
- [x] Support debit card payments.
- [x] Validate payment method is required.
- [x] Validate payment amount against sale total.
- [x] Track payment status.
- [x] Update sale status after successful payment.
- [x] Include payment method breakdown in dashboard/reporting.
- [ ] Avoid storing sensitive card data unless a proper payment provider/tokenization flow is added.

## 13. Logistics And Partial Deliveries

- [x] Track sales that can be delivered in multiple shipments.
- [x] Create dispatch/freight records with truck type, driver/user, delivery date, and weight.
- [x] Generate partial delivery/remission records for each shipment.
- [x] Track delivered quantity and pending balance per sale detail.
- [x] Prevent dispatch quantity from exceeding paid or pending quantity.
- [x] Update order status to partial after the first partial delivery.
- [x] Update order status to dispatched when pending balance reaches zero.
- [x] Include delivery address and unloading notes.
- [x] Prepare digital received-signature support if feasible.

## 14. API Endpoints

- [x] Implement `GET /api/tejas` or equivalent inventory endpoint with filters.
- [x] Implement `POST /api/ventas/cotizar`.
- [x] Implement `POST /api/inventario/mermas`.
- [x] Add sales creation and payment endpoints.
- [x] Add partial delivery/dispatch endpoints.
- [x] Return consistent status codes: `200`, `201`, `400`, `401`, `403`, `404`, `500`.
- [x] Validate request bodies with DTOs.
- [x] Keep OpenAPI documentation aligned with implemented endpoints.

## 15. Security Requirements

- [x] Implement JWT authentication signed with a secure secret.
- [x] Add role-based authorization for API endpoints.
- [x] Allow sellers to view prices, stock, create quotations, and create sales.
- [x] Allow warehouse users to modify entries/exits and register mermas.
- [x] Allow admins full access to costs, reports, pricing, and user-sensitive operations.
- [x] Deny warehouse users from applying sales discounts or modifying prices.
- [x] Use EF Core parameterized queries to reduce SQL injection risk.
- [x] Avoid rendering unsafe HTML in the frontend to reduce XSS risk.
- [x] Configure HTTPS/TLS in production via Nginx and Let's Encrypt.
- [x] Configure CORS with explicit allowed origins.
- [x] Keep SQL Server inaccessible from the public internet.
- [x] Store secrets in GitHub Secrets or environment variables, never in source code.

## 16. Frontend Inventory Module

- [x] Build inventory listing with PrimeVue DataTable.
- [x] Add filters for material, color, and stock status.
- [x] Display lot-level stock details.
- [x] Display reorder warnings.
- [x] Add merma registration dialog.
- [x] Validate merma form fields.
- [x] Disable submit until required fields are valid.
- [x] Show validation when quantity exceeds available stock.
- [x] Refresh inventory table after successful merma registration.

## 17. Frontend Sales Module

- [x] Build sales screen/shell.
- [x] Add customer selection.
- [x] Add tile/product selection.
- [x] Add quantity input with stock validation.
- [x] Add discount and freight fields where required.
- [x] Add payment method control for cash, credit card, and debit card.
- [x] Show totals and taxes.
- [x] Show inventory availability before confirmation.
- [x] Confirm sale/payment through API.
- [x] Refresh inventory after successful sale/payment.
- [x] Show payment status and sale status.

## 18. Frontend Quotation Module

- [x] Build new quotation screen.
- [x] Add base roof area input.
- [x] Add roof slope/inclination input.
- [x] Validate impossible values before sending to API.
- [x] Display calculated surface, pieces, waste margin, weight, freight, subtotal, tax, and total.
- [x] Provide a path to convert quotation into sale.

## 19. Frontend Logistics Module

- [x] Build partial dispatch screen.
- [x] Show paid orders with pending delivery balances.
- [x] Allow registering a shipment quantity.
- [x] Show delivery history.
- [x] Show order status: paid, partial, dispatched.
- [x] Block invalid dispatch quantities.

## 20. Frontend Admin And Dashboard Module

- [x] Add dashboard for monthly income.
- [x] Add best-selling tile models.
- [x] Add reorder/low-stock alerts.
- [x] Add breakage/loss reporting.
- [x] Add payment method breakdown.
- [x] Add admin-only pricing/cost visibility.
- [x] Add role-aware module visibility.

## 21. Testing Requirements

- [x] Add backend unit tests for quotation calculations.
- [x] Add backend unit tests for merma stock deduction.
- [x] Add backend unit tests for sales inventory affectation.
- [ ] Add backend integration tests for EF Core transactions.
- [ ] Add authorization tests for role-protected endpoints.
- [ ] Add frontend unit tests or component tests for critical form validation when feasible.
- [x] Run frontend TypeScript checks.
- [x] Run frontend production build.
- [x] Ensure tests run in GitHub Actions.
- [x] Block deployment when tests fail.

## 22. Containerization Requirements

- [x] Add backend production Dockerfile.
- [x] Add frontend production Dockerfile.
- [x] Add Docker Compose file for frontend, backend, and SQL Server.
- [x] Create an internal Docker network such as `tejaflow_network`.
- [x] Keep SQL Server port 1433 internal-only.
- [x] Expose only the public frontend/API entry point through Nginx or reverse proxy.
- [x] Configure production environment variables for containers.
- [x] Ensure backend can run EF Core migrations on startup or deployment, if approved.

## 23. Oracle Cloud Deployment Requirements

- [x] Prepare deployment for Oracle Cloud Free Tier VPS with Ubuntu Linux.
- [x] Assume ARM/Ampere-compatible container images or configure builds accordingly.
- [x] Define expected VPS resources: 2-3 vCPU and 8-12 GB RAM if available.
- [x] Configure firewall rules to expose only required public ports, ideally 80/443.
- [x] Configure Nginx as reverse proxy.
- [x] Configure HTTPS with Let's Encrypt.
- [x] Keep database isolated from public internet.
- [x] Document required server bootstrap steps.

## 24. GitHub Actions CI/CD Requirements

- [x] Create `.github/workflows/deploy.yml`.
- [x] Trigger workflow on push to `main`.
- [x] Check out repository code.
- [x] Build and validate frontend TypeScript/Vue app.
- [x] Build backend .NET API.
- [x] Run backend tests.
- [ ] Run integration/security tests where feasible.
- [x] Build Docker images for frontend and backend.
- [x] Push images to GitHub Container Registry (GHCR).
- [x] Use GitHub Secrets for SSH and production secrets.
- [x] Connect to Oracle VPS through SSH.
- [x] Pull latest images on VPS.
- [x] Run `docker compose pull`.
- [x] Run `docker compose up -d`.
- [x] Block deployment if build or tests fail.

## 25. Secrets And Configuration

- [x] Define required local development settings.
- [x] Define required production environment variables.
- [x] Add examples without real secrets.
- [x] Document GitHub Secrets for Oracle host/IP.
- [x] Document GitHub Secrets for SSH private key.
- [x] Document GitHub Secrets for SQL Server password.
- [x] Document GitHub Secrets for JWT signing key.
- [x] Document GitHub Secrets for production connection string.
- [x] Document GHCR authentication needs if required.
- [x] Ensure no secret values are committed.

## 26. Local Development And Documentation

- [x] Document backend local run commands.
- [x] Document frontend local run commands.
- [x] Document database startup and migration commands.
- [x] Document seed data process.
- [x] Document Docker Compose local workflow.
- [x] Document default local URLs.
- [x] Update README installation instructions.
- [x] Keep implementation notes aligned with actual commands and files.

## 27. Final Verification Checklist

- [x] Confirm inventory listing works.
- [x] Confirm inventory filters work.
- [x] Confirm merma registration deducts stock.
- [x] Confirm quotation calculation works.
- [x] Confirm sale creation works.
- [x] Confirm cash payment works.
- [x] Confirm credit card payment works.
- [x] Confirm debit card payment works.
- [x] Confirm inventory is reduced after valid sale/payment.
- [x] Confirm sales cannot exceed stock.
- [x] Confirm partial delivery updates pending balance.
- [x] Confirm role restrictions work.
- [x] Confirm frontend builds successfully.
- [x] Confirm backend tests pass.
- [x] Confirm Docker Compose starts expected services.
- [x] Confirm CI/CD workflow syntax is valid.
