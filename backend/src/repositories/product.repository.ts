import { PrismaClient, Prisma, Category } from '@prisma/client';
import { Product, ProductFilters } from '../types/domain';

export interface IProductRepository {
  findAll(filters?: ProductFilters): Promise<Product[]>;
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

  private buildWhere(filters?: ProductFilters): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};
    if (filters?.distance?.length)  where.distance  = { hasSome: filters.distance };
    if (filters?.surface?.length)   where.surface   = { hasSome: filters.surface };
    if (filters?.level?.length)     where.level     = { hasSome: filters.level };
    if (filters?.objective?.length) where.objective = { hasSome: filters.objective };
    if (filters?.category)              where.category = filters.category as Category;
    if (filters?.priceMax !== undefined) where.price = { lte: filters.priceMax };
    return where;
  }

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const where = this.buildWhere(filters);
    const hasFilters = Object.keys(where).length > 0;
    const rows = await (hasFilters
      ? this.prisma.product.findMany({ where })
      : this.prisma.product.findMany());
    return rows.map(mapToProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    if (!row) return null;
    return mapToProduct(row);
  }
}
