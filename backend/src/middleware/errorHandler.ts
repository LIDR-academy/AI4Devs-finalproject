import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../domain/shared/NotFoundError";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof NotFoundError) {
        res.status(400).json({ message: err.message });
        return;
    }

    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
}