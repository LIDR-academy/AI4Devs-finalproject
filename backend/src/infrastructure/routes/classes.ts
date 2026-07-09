import { Router } from "express";

const router = Router();

router.get("/classes", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.post("/classes", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.get("/classes/:id", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.delete("/classes/:id", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.delete("/recurring-series/:id", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.post("/classes/:id/enrollment", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.delete("/classes/:id/enrollment", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.get("/classes/available-slots", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

router.get("/coachee/dashboard", (_req, res) => {
  res.status(501).json({
    error: {
      code: "NOT_IMPLEMENTED",
      message: "This endpoint is not yet implemented.",
      ref: crypto.randomUUID(),
    },
  });
});

export default router;
