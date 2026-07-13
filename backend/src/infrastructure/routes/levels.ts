import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/levels", authenticate, async (_req, res, next) => {
  try {
    const levels = await prisma.level.findMany({ orderBy: { sort_order: "asc" } });
    res.json({ data: levels });
  } catch (err) {
    next(err);
  }
});

export default router;
