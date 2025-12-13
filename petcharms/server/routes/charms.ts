import { RequestHandler } from "express";

export const handleGetCharms: RequestHandler = (req, res) => {
  const charms = [
    {
      id: "660e8400-e29b-41d4-a716-446655440000",
      name: "Heart",
      description: "Cute heart charm",
      price: 9.99,
      color: "Gold",
      image_url:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop",
      stock: 100,
      created_at: new Date("2025-01-01").toISOString(),
      updated_at: new Date("2025-01-01").toISOString(),
    },
    {
      id: "770e8400-e29b-41d4-a716-446655440000",
      name: "Star",
      description: "Shiny star charm",
      price: 14.99,
      color: "Silver",
      image_url:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop",
      stock: 50,
      created_at: new Date("2025-01-01").toISOString(),
      updated_at: new Date("2025-01-01").toISOString(),
    },
    {
      id: "880e8400-e29b-41d4-a716-446655440000",
      name: "Moon",
      description: "Elegant moon charm",
      price: 12.99,
      color: "Gold",
      image_url:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop",
      stock: 75,
      created_at: new Date("2025-01-01").toISOString(),
      updated_at: new Date("2025-01-01").toISOString(),
    },
    {
      id: "990e8400-e29b-41d4-a716-446655440000",
      name: "Pearl",
      description: "Luxurious pearl charm",
      price: 24.99,
      color: "White",
      image_url:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop",
      stock: 30,
      created_at: new Date("2025-01-01").toISOString(),
      updated_at: new Date("2025-01-01").toISOString(),
    },
    {
      id: "aa0e8400-e29b-41d4-a716-446655440000",
      name: "Diamond",
      description: "Sparkling diamond charm",
      price: 34.99,
      color: "Clear",
      image_url:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop",
      stock: 25,
      created_at: new Date("2025-01-01").toISOString(),
      updated_at: new Date("2025-01-01").toISOString(),
    },
    {
      id: "bb0e8400-e29b-41d4-a716-446655440000",
      name: "Flower",
      description: "Delicate flower charm",
      price: 11.99,
      color: "Rose Gold",
      image_url:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop",
      stock: 60,
      created_at: new Date("2025-01-01").toISOString(),
      updated_at: new Date("2025-01-01").toISOString(),
    },
  ];

  return res.status(200).json({
    success: true,
    data: charms,
    error: null,
  });
};
