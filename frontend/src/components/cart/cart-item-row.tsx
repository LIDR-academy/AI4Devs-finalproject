'use client';

import Image from 'next/image';
import { Trash2, Minus, Plus } from 'lucide-react';
import type { CartItemUI } from '../../types/cart';
import { buildImageUrl } from '../../lib/product-utils';

interface CartItemRowProps {
  item: CartItemUI;
  onQuantityChange: (
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ) => Promise<void>;
  onRemove: (productId: string, size?: string, color?: string) => Promise<void>;
  isUpdating: boolean;
}

export function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
  isUpdating,
}: CartItemRowProps) {
  const { productId, productName, productBrand, productPrice, image, stock, quantity, size, color } = item;

  const formattedPrice = productPrice.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const canDecrease = quantity > 1 && !isUpdating;
  const canIncrease = quantity < stock && !isUpdating;

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        <Image
          src={buildImageUrl(image)}
          alt={productName}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="text-sm text-muted-foreground">{productBrand}</p>
        <p className="text-base font-medium leading-tight">{productName}</p>

        {(size || color) && (
          <p className="text-sm text-muted-foreground">
            {size && <span>Talla {size}</span>}
            {size && color && <span> · </span>}
            {color && <span>Color {color}</span>}
          </p>
        )}

        <p className="text-base font-semibold mt-auto">{formattedPrice} €</p>
      </div>

      <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
        <button
          aria-label="Eliminar producto"
          onClick={() => onRemove(productId, size, color)}
          disabled={isUpdating}
          className="text-destructive hover:opacity-70 disabled:opacity-40 transition-opacity"
        >
          <Trash2 size={16} />
        </button>

        <div className="flex items-center gap-2 border border-border rounded-lg">
          <button
            aria-label="Reducir cantidad"
            onClick={() => onQuantityChange(productId, quantity - 1, size, color)}
            disabled={!canDecrease}
            className="w-8 h-8 flex items-center justify-center text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
          >
            <Minus size={14} />
          </button>

          <span className="w-6 text-center text-sm font-medium select-none">
            {quantity}
          </span>

          <button
            aria-label="Aumentar cantidad"
            onClick={() => onQuantityChange(productId, quantity + 1, size, color)}
            disabled={!canIncrease}
            className="w-8 h-8 flex items-center justify-center text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
