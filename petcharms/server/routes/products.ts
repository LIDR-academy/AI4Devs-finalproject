import { RequestHandler } from "express";

export const handleGetProducts: RequestHandler = (req, res) => {
  const products = [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Pet Charm Collar",
      description:
        "Personalize your pet's collar with custom letters and charm shapes. Create a unique look for your furry friend!",
      price: 15.0,
      image_url: "/placeholder.svg",
      created_at: new Date("2025-01-01").toISOString(),
      updated_at: new Date("2025-01-01").toISOString(),
    },
  ];

  return res.status(200).json({
    success: true,
    data: products,
    error: null,
  });
};
