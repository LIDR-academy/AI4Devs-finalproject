# Prompt 2 — Backend Express App (Runtime)

## Role
You are a senior backend TypeScript engineer specialised in Express APIs with Hexagonal Architecture. You build production-quality middleware stacks, error handling, logging, and test infrastructure.

## Context
This is the second prompt in a session series for building a Personal Training Management Platform. The project infrastructure and Prisma schema have ALREADY been created in Prompt 1. You are building on top of that foundation.

**What already exists (do NOT re-create):**
- Root `biome.json`, `.env.example`, `docker-compose.yml`, `AGENTS.md`
- `backend/` directory with package.json, tsconfig.json, folder structure
- `backend/prisma/schema.prisma` with all 9 models (User, Level, TrainingClass, ClassEnrollment, WaitingList, RecurrenceSeries, Block, Notification, RefreshToken)
- `backend/prisma/seed.ts` with 5 seed levels

**What you need to create:** The Express application runtime — middleware, error handling, health endpoint, auth infrastructure, config module, and test setup.

## Objective
Build the complete Express application startup, middleware pipeline, error handling infrastructure, auth stubs, and test infrastructure. After this prompt, the backend should start up, respond to health checks, have JWT auth infrastructure ready, and pass a smoke test.

## Requirements

### 1. Environment Config Module

**File: `backend/src/config/env.ts`**

A Zod-validated configuration module that:

- Loads environment variables with `dotenv` (call `dotenv.config()` at the top)
- Defines a Zod object schema for ALL required env vars:

```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  COACH_FINANCIAL_ENCRYPTION_KEY: z.string().length(32),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().optional(),
  GOOGLE_CALENDAR_ID: z.string().optional(),
  FCM_SERVER_KEY: z.string().optional(),
});
```

- Parse with `envSchema.parse(process.env)`
- Export a typed `env` constant (not `process.env`)
- In non-test environments, call `process.exit(1)` with a descriptive error if validation fails

### 2. Logger

**File: `backend/src/infrastructure/logger.ts`**

Configure pino:

```typescript
import pino from "pino";
import { env } from "../../config/env.js";

const transport = env.NODE_ENV === "development"
  ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } }
  : undefined;

export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : "info",
  transport,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: { ...req.headers, authorization: "[Redacted]" },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.body.password",
      "req.body.refreshToken",
      "req.body.bankAccount",
      "req.body.ssn",
      "req.body.dni",
    ],
    censor: "[Redacted]",
  },
});
```

### 3. Error Infrastructure

**File: `backend/src/infrastructure/errors.ts`**

Custom error classes with the following hierarchy:

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public ref: string = crypto.randomUUID(),
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
```

Extend with concrete error classes:

- `ValidationError` — statusCode 400, code "VALIDATION_ERROR"
- `UnauthorizedError` — statusCode 401, code "UNAUTHORIZED"
- `ForbiddenError` — statusCode 403, code "FORBIDDEN"
- `NotFoundError` — statusCode 404, code "NOT_FOUND"
- `ConflictError` — statusCode 409, code passed as parameter (default "CONFLICT")
- `ServiceUnavailableError` — statusCode 503, code "SERVICE_UNAVAILABLE"

Each constructor accepts a message string and (for ConflictError) an optional code string.

**File: `backend/src/infrastructure/error-codes.ts`**

Export a constant object with all error codes from the API specification:

```typescript
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CAPACITY_EXCEEDED: "CAPACITY_EXCEEDED",
  CLASS_FULL: "CLASS_FULL",
  OVERLAP_DETECTED: "OVERLAP_DETECTED",
  LEVEL_MISMATCH: "LEVEL_MISMATCH",
  WAITING_LIST_FULL: "WAITING_LIST_FULL",
  ALREADY_ENROLLED: "ALREADY_ENROLLED",
  ALREADY_ON_WAITING_LIST: "ALREADY_ON_WAITING_LIST",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
} as const;
```

### 4. Global Error Handler Middleware

**File: `backend/src/infrastructure/middleware/error-handler.ts`**

A global Express error handler middleware with the following logic:

```typescript
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors.js";
import { ZodError } from "zod";
import { logger } from "../logger.js";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // If AppError, use its statusCode and code
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, ref: err.ref },
    });
    return;
  }

  // If Zod validation error, map to 400
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        ref: crypto.randomUUID(),
      },
    });
    return;
  }

  // Unknown error — log and return 500
  const ref = crypto.randomUUID();
  logger.error({ ref, err }, "Unhandled error");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
      ref,
    },
  });
}
```

### 5. Zod Validation Middleware

**File: `backend/src/infrastructure/middleware/validate.ts`**

A middleware factory that validates request body against a Zod schema:

```typescript
import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../errors.js";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(result.error.message);
    }
    req.body = result.data;
    next();
  };
}
```

### 6. JWT Auth Middleware

**File: `backend/src/infrastructure/middleware/auth.ts`**

Two middlewares:

**`authenticate` middleware:**
- Extract token from `Authorization: Bearer <token>` header
- If no token present: throw `UnauthorizedError("Missing authentication token")`
- Verify JWT using `jsonwebtoken.verify()` with `env.JWT_SECRET`
- If invalid/expired: throw `UnauthorizedError("Invalid or expired token")`
- Attach decoded payload as `{ id: string, role: UserRole }` to `req.user`
- In development mode, allow a bypass: if `NODE_ENV === "development"` and no token provided, set a default admin user for testing convenience

**`requireRole` middleware:**
- Accepts `...roles: UserRole[]`
- Must run AFTER `authenticate`
- If `req.user.role` is not in the allowed roles: throw `ForbiddenError("Insufficient permissions")`

**Express Request extension:**

Add a declaration at the top of the file:

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: import(".prisma/client/index.d.ts").UserRole;
      };
    }
  }
}
```

Use the actual Prisma enum type or define a local enum alias for the role type.

### 7. Route Stubs

Create the following files under `backend/src/infrastructure/routes/`:

**File: `routes/index.ts`** — Main router that mounts all sub-routers:

```typescript
import { Router } from "express";

const router = Router();

router.use("/health", (await import("./health.js")).default);
router.use("/auth", (await import("./auth.js")).default);
router.use("/classes", (await import("./classes.js")).default);
router.use("/blocks", (await import("./blocks.js")).default);
router.use("/coachees", (await import("./coachees.js")).default);
router.use("/coaches", (await import("./coaches.js")).default);
router.use("/notifications", (await import("./notifications.js")).default);

export default router;
```

Note: Use dynamic `import()` for lazy loading, or use static imports — whichever is cleaner for this stage.

**File: `routes/health.ts`** — Health check endpoint:
- `GET /health` — no auth required
- Returns 200 with `{ status: "ok", timestamp: new Date().toISOString() }`

**File: `routes/auth.ts`** — Auth route stubs:
- `POST /auth/login` — returns 501 NOT_IMPLEMENTED
- `POST /auth/refresh` — returns 501 NOT_IMPLEMENTED
- `POST /auth/logout` — returns 501 NOT_IMPLEMENTED

**File: `routes/classes.ts`** — Class route stubs:
- `GET /classes` — returns 501 NOT_IMPLEMENTED
- `POST /classes` — returns 501 NOT_IMPLEMENTED
- `GET /classes/:id` — returns 501 NOT_IMPLEMENTED
- `DELETE /classes/:id` — returns 501 NOT_IMPLEMENTED
- `DELETE /recurring-series/:id` — returns 501 NOT_IMPLEMENTED
- `POST /classes/:id/enrollment` — returns 501 NOT_IMPLEMENTED
- `DELETE /classes/:id/enrollment` — returns 501 NOT_IMPLEMENTED
- `GET /classes/available-slots` — returns 501 NOT_IMPLEMENTED
- `GET /coachee/dashboard` — returns 501 NOT_IMPLEMENTED

**File: `routes/blocks.ts`** — Block route stubs:
- `GET /blocks` — returns 501 NOT_IMPLEMENTED
- `POST /blocks` — returns 501 NOT_IMPLEMENTED
- `DELETE /blocks/:id` — returns 501 NOT_IMPLEMENTED

**File: `routes/coachees.ts`** — Coachee route stubs:
- `GET /coachees` — returns 501 NOT_IMPLEMENTED
- `POST /coachees` — returns 501 NOT_IMPLEMENTED
- `GET /coachees/:id` — returns 501 NOT_IMPLEMENTED
- `PUT /coachees/:id` — returns 501 NOT_IMPLEMENTED
- `PATCH /coachees/:id/status` — returns 501 NOT_IMPLEMENTED
- `PATCH /coachees/:id/level` — returns 501 NOT_IMPLEMENTED

**File: `routes/coaches.ts`** — Coach route stubs:
- `GET /coaches` — returns 501 NOT_IMPLEMENTED
- `POST /coaches` — returns 501 NOT_IMPLEMENTED
- `GET /coaches/:id` — returns 501 NOT_IMPLEMENTED
- `PUT /coaches/:id` — returns 501 NOT_IMPLEMENTED
- `PATCH /coaches/:id/status` — returns 501 NOT_IMPLEMENTED
- `GET /coaches/:id/financial` — returns 501 NOT_IMPLEMENTED

**File: `routes/notifications.ts`** — Notification route stubs:
- `GET /notifications` — returns 501 NOT_IMPLEMENTED
- `PATCH /notifications/:id/read` — returns 501 NOT_IMPLEMENTED

Each stub should return:

```typescript
res.status(501).json({
  error: {
    code: "NOT_IMPLEMENTED",
    message: "This endpoint is not yet implemented.",
    ref: crypto.randomUUID(),
  },
});
```

### 8. Express Application Entry Point

**File: `backend/src/index.ts`**

Create and export the Express application with the full middleware stack in order:

```typescript
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { logger } from "./infrastructure/logger.js";
import { errorHandler } from "./infrastructure/middleware/error-handler.js";
import routes from "./infrastructure/routes/index.js";

export const app = express();

// 1. Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: Date.now() - start,
    });
  });
  next();
});

// 2. Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://fcm.googleapis.com"],
      fontSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
}));

// 3. CORS
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// 4. Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// 5. Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 6. API routes
app.use("/api/v1", routes);

// 7. 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "The requested resource was not found.", ref: crypto.randomUUID() },
  });
});

// 8. Global error handler
app.use(errorHandler);

// Start server only when not in test mode
if (env.NODE_ENV !== "test") {
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}
```

### 9. Test Infrastructure

**File: `backend/vitest.config.ts`:**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@domain": path.resolve(__dirname, "./src/domain"),
      "@application": path.resolve(__dirname, "./src/application"),
      "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@config": path.resolve(__dirname, "./src/config"),
    },
  },
});
```

**File: `backend/src/__tests__/setup.ts`:**

```typescript
import { beforeAll, afterAll } from "vitest";

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-secret-that-is-at-least-32-chars-long!!";
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/coacher_test";
  process.env.COACH_FINANCIAL_ENCRYPTION_KEY = "test-encryption-key-32-bytes-long!";
});
```

**File: `backend/src/__tests__/health.test.ts`:**

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index.js";

describe("Health endpoint", () => {
  it("GET /api/v1/health returns 200 with status ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("GET /health (without prefix) returns 404", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(404);
  });

  it("GET /api/v1/nonexistent returns 404 with error envelope", async () => {
    const res = await request(app).get("/api/v1/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
    expect(res.body.error).toHaveProperty("message");
    expect(res.body.error).toHaveProperty("ref");
  });
});

describe("Auth endpoint stubs", () => {
  it("POST /api/v1/auth/login returns 501", async () => {
    const res = await request(app).post("/api/v1/auth/login");
    expect(res.status).toBe(501);
  });
});

describe("Error envelope", () => {
  it("returns standard error format on 404", async () => {
    const res = await request(app).get("/api/v1/classes/999");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: { code: expect.any(String), message: expect.any(String), ref: expect.any(String) },
    });
  });
});
```

## Constraints
- Do NOT implement any business logic (no class creation, no enrollment, no waiting list processing)
- Do NOT implement actual auth endpoints yet (login/refresh/logout return 501 — that is next session)
- Do NOT create any frontend files
- All files must be production-quality TypeScript with strict mode
- Error messages must NOT reveal internal details (no email enumeration)
- All authentication errors must return consistent "Invalid credentials" message

## Output Expectations
After this prompt, running `npx tsx src/index.ts` from the `backend/` directory should:

1. Start the Express server on port 3001
2. `curl http://localhost:3001/api/v1/health` returns `{ "status": "ok", "timestamp": "..." }`
3. `curl -X POST http://localhost:3001/api/v1/auth/login` returns 501 with error envelope
4. `npm test` passes all smoke tests (health check, error envelope, 404 handling)
5. `npx tsc --noEmit` has no TypeScript errors
6. `npx biome check src/` has no lint errors

Do NOT leave anything as a TODO. Generate complete, working code for every file.
