import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../domain/errors/NotFoundError";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof NotFoundError) {
        res.status(404).json({ message: err.message });
        return;
    }

    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
}