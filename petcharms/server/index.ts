import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGetProducts } from "./routes/products";
import { handleGetCharms } from "./routes/charms";
import { handleGetShapes, handleGetColors } from "./routes/shapes";
import {
  handleCreateOrder,
  handleGetOrder,
  handleGetOrders,
} from "./routes/orders";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // MVP API Routes (v1)
  app.get("/api/v1/products", handleGetProducts);
  app.get("/api/v1/charms", handleGetCharms);
  app.get("/api/v1/shapes", handleGetShapes);
  app.get("/api/v1/colors", handleGetColors);
  app.post("/api/v1/orders", handleCreateOrder);
  app.get("/api/v1/orders", handleGetOrders);
  app.get("/api/v1/orders/:orderId", handleGetOrder);

  return app;
}
