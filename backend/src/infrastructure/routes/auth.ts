import { Router } from "express";

const router = Router();

router.post("/auth/login", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.post("/auth/refresh", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.post("/auth/logout", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

export default router;
