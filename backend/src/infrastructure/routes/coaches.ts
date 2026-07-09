import { Router } from "express";

const router = Router();

router.get("/coaches", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.post("/coaches", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.get("/coaches/:id", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.put("/coaches/:id", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.patch("/coaches/:id/status", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.get("/coaches/:id/financial", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

export default router;
