import { describe, expect, it, vi } from "vitest";

import {
  ForbiddenError,
  InvariantViolationError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from "@/domain/errors";
import { problem, problemResponse, statusForCode, toProblemResponse } from "@/http/problem";

describe("contrato de errores RFC 9457 (ADR-0002 §2)", () => {
  it("mapea cada código de dominio a su status HTTP", () => {
    expect(statusForCode("UNAUTHENTICATED")).toBe(401);
    expect(statusForCode("FORBIDDEN")).toBe(403);
    expect(statusForCode("NOT_FOUND")).toBe(404);
    expect(statusForCode("COPY_STATE_CONFLICT")).toBe(409);
    expect(statusForCode("VALIDATION_ERROR")).toBe(422);
    expect(statusForCode("INTERNAL")).toBe(500);
  });

  it("sirve application/problem+json con el status del problema", async () => {
    const response = problemResponse(problem("NOT_FOUND", "No existe."));
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    await expect(response.json()).resolves.toMatchObject({
      type: "https://clickoteca/errors/not-found",
      code: "NOT_FOUND",
      status: 404,
      detail: "No existe.",
    });
  });

  it("traduce los errores de dominio conservando su código", async () => {
    for (const [error, status, code] of [
      [new UnauthenticatedError(), 401, "UNAUTHENTICATED"],
      [new ForbiddenError(), 403, "FORBIDDEN"],
      [new NotFoundError(), 404, "NOT_FOUND"],
      [new InvariantViolationError("COPY_STATE_CONFLICT", "Ya no está."), 409, "COPY_STATE_CONFLICT"],
    ] as const) {
      const response = toProblemResponse(error, "/api/x");
      expect(response.status).toBe(status);
      await expect(response.json()).resolves.toMatchObject({ code, instance: "/api/x" });
    }
  });

  it("expone los campos inválidos en errors[] con un 422", async () => {
    const response = toProblemResponse(
      new ValidationError([{ field: "email", issue: "Introduce un email válido." }])
    );
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      code: "VALIDATION_ERROR",
      errors: [{ field: "email", issue: "Introduce un email válido." }],
    });
  });

  it("nunca filtra detalles internos en un error no controlado", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = toProblemResponse(new Error("conexión a 10.0.0.5 rechazada"));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.code).toBe("INTERNAL");
    // Ni el mensaje original ni la traza pueden llegar al cliente.
    expect(JSON.stringify(body)).not.toContain("10.0.0.5");
    expect(body).not.toHaveProperty("stack");
    // Pero sí queda registrado en el servidor para poder diagnosticarlo.
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });
});
