import { RequestHandler } from "express";
import { z } from "zod";

// Validation schema
const createOrderSchema = z.object({
  product_id: z.string(),
  size: z.enum(["S", "M", "L"]),
  collarColor: z.string(),
  petName: z.string(),
  customizations: z.object({
    letters: z.array(
      z.object({
        letter: z.string(),
        colorId: z.string(),
      })
    ),
    shapes: z.array(
      z.object({
        shapeId: z.string(),
      })
    ),
  }),
  total_price: z.number().positive("Total price must be positive"),
});

type CreateOrderRequest = z.infer<typeof createOrderSchema>;

interface Order {
  id: string;
  product_id: string;
  size: "S" | "M" | "L";
  collarColor: string;
  petName: string;
  customizations: {
    letters: Array<{
      letter: string;
      colorId: string;
    }>;
    shapes: Array<{
      shapeId: string;
    }>;
  };
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// In-memory storage for orders (replace with DB in production)
const orders: Map<string, Order> = new Map();

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const handleCreateOrder: RequestHandler = (req, res) => {
  try {
    const body = req.body;

    // Validate request
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: validation.error.flatten(),
        },
      });
    }

    const data: CreateOrderRequest = validation.data;

    // Create order
    const orderId = generateUUID();
    const order: Order = {
      id: orderId,
      product_id: data.product_id,
      size: data.size,
      collarColor: data.collarColor,
      petName: data.petName,
      customizations: data.customizations,
      total_price: data.total_price,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    orders.set(orderId, order);

    return res.status(200).json({
      success: true,
      data: order,
      error: null,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });
  }
};

export const handleGetOrder: RequestHandler = (req, res) => {
  try {
    const { orderId } = req.params;

    // Validate UUID format
    if (
      !orderId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid order ID format",
        },
      });
    }

    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Order not found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });
  }
};

export const handleGetOrders: RequestHandler = (req, res) => {
  try {
    const allOrders = Array.from(orders.values());

    return res.status(200).json({
      success: true,
      data: allOrders,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });
  }
};
