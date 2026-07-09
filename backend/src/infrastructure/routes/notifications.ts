import { Router } from "express";

const router = Router();

router.get("/notifications", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.patch("/notifications/:id/read", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

export default router;
