import { describe, expect, it } from "vitest";

import { authorizeCron } from "@/http/cron-auth";
import { JOB_NAMES, isJobName } from "@/use-cases/scheduler/jobs";

/**
 * El candado de `/api/cron/:job`. Es lo único del disparador que decide algo, y lo que
 * separa un trabajo interno de una URL que cualquiera puede pulsar en bucle.
 */
describe("autorización del cron", () => {
  const SECRETO = "un-secreto-largo-de-verdad";

  it("acepta el `Bearer` que emite el disparador", () => {
    expect(authorizeCron(`Bearer ${SECRETO}`, SECRETO)).toEqual({ ok: true });
  });

  /**
   * Lo que protege: que un despliegue al que se le olvidó `CRON_SECRET` **no** deje el
   * endpoint abierto. "Sin secreto" no puede significar "sin comprobación".
   */
  it("sin secreto configurado no se ejecuta nada, y responde como si no existiera", () => {
    const resultado = authorizeCron(`Bearer ${SECRETO}`, undefined);
    expect(resultado).toMatchObject({ ok: false, code: "NOT_FOUND" });
    // Sin cabecera tampoco: el fallo es de configuración, no de quien llama.
    expect(authorizeCron(null, "")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("rechaza la credencial equivocada, la que falta y la que no trae esquema", () => {
    for (const header of [null, "", SECRETO, "Bearer ", "Bearer otro-secreto", "Basic x"]) {
      expect(authorizeCron(header, SECRETO)).toMatchObject({
        ok: false,
        code: "UNAUTHENTICATED",
      });
    }
  });

  /**
   * `timingSafeEqual` revienta si las longitudes no coinciden, así que el caso de un
   * token más corto o más largo tiene que estar cubierto antes de llegar a él: si no,
   * la excepción subiría como un 500 y el endpoint quedaría contando quién acierta el
   * tamaño del secreto.
   */
  it("un token de otra longitud se rechaza sin reventar", () => {
    expect(authorizeCron("Bearer corto", SECRETO)).toMatchObject({ ok: false });
    expect(authorizeCron(`Bearer ${SECRETO}-de-más`, SECRETO)).toMatchObject({ ok: false });
  });
});

describe("catálogo de trabajos periódicos", () => {
  it("son exactamente los dos que programa el proceso scheduler", () => {
    expect(JOB_NAMES).toEqual(["offers", "retention"]);
  });

  it("un nombre que no está en el catálogo no es un trabajo", () => {
    expect(isJobName("offers")).toBe(true);
    expect(isJobName("../../etc")).toBe(false);
    expect(isJobName("constructor")).toBe(false);
  });
});
