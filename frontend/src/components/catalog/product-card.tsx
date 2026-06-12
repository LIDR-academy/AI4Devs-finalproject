import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../../types';
import { LEVEL_CONFIG } from '../../lib/product-utils';

interface ProductCardProps {
  product: Pick<Product, 'id' | 'name' | 'brand' | 'price' | 'image' | 'level' | 'stock'>;
}

function formatPrice(price: number): string {
  return price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

function buildImageUrl(image: string): string {
  const base = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? '/images';
  return `${base}/${image}`;
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, name, brand, price, image, level, stock } = product;

  return (
    <Link href={`/product/${id}`}>
      <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden group cursor-pointer">
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <Image
            src={buildImageUrl(image)}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        <div className="p-4 space-y-2">
          <p className="text-sm text-gray-500">{brand}</p>
          <h3 className="font-medium text-gray-900 line-clamp-2">{name}</h3>
          <div className="flex flex-wrap gap-1">
            {level.map((l) => {
              const config = LEVEL_CONFIG[l];
              if (!config) return null;
              return (
                <span
                  key={l}
                  className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}
                >
                  {config.label}
                </span>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span
              data-testid="product-price"
              className="text-xl font-bold text-gray-900"
            >
              {formatPrice(price)}
            </span>
          </div>
          {stock === 0 && (
            <p className="text-xs text-red-500 mt-1">Agotado</p>
          )}
        </div>
      </article>
    </Link>
  );
}
