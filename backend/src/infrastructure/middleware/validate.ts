import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../errors.js";

type ValidateSource = "body" | "query";

export function validate(schema: ZodSchema, source: ValidateSource = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const target = source === "query" ? req.query : req.body;
    const result = schema.safeParse(target);
    if (!result.success) {
      throw new ValidationError(result.error.message);
    }
    if (source === "query") {
      req.query = result.data as typeof req.query;
    } else {
      req.body = result.data;
    }
    next();
  };
}
