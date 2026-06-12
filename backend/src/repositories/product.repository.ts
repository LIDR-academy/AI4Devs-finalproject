import { PrismaClient } from '@prisma/client';
import { Product } from '../types/domain';

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
}

type PrismaProductRow = {
  id: string;
  name: string;
  brand: string;
  price: { toNumber(): number };
  image: string;
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  distance: string[];
  surface: string[];
  level: string[];
  objective: string[];
  sizes: string[];
  colors: string[];
  stock: number;
};

function mapToProduct(row: PrismaProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    price: row.price.toNumber(),
    image: row.image,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description,
    features: row.features,
    distance: row.distance,
    surface: row.surface,
    level: row.level,
    objective: row.objective,
    sizes: row.sizes,
    colors: row.colors,
    stock: row.stock,
  };
}

export class ProductRepository implements IProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany();
    return rows.map(mapToProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    if (!row) return null;
    return mapToProduct(row);
  }
}
