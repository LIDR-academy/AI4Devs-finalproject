'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { COLOR_LABELS } from '../../lib/product-utils';
import { useCart } from '../../contexts/cart-context';
import { SizeSelector } from './size-selector';
import { ColorSelector } from './color-selector';
import { QuantityStepper } from './quantity-stepper';

interface ProductVariantSelectorProps {
  sizes: string[];
  colors: string[];
  stock: number;
  productId: string;
  productName: string;
  productBrand: string;
  productPrice: number;
  image: string;
}

export function ProductVariantSelector({
  sizes,
  colors,
  stock,
  productId,
}: ProductVariantSelectorProps) {
  const { addItem, isLoading } = useCart();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  const outOfStock = stock === 0;
  const colorLabels = colors.map((c) => COLOR_LABELS[c] ?? c);

  function handleSizeSelect(size: string) {
    setSelectedSize(size);
    setSizeError(false);
  }

  function handleColorSelect(color: string) {
    setSelectedColor(color);
    setColorError(false);
  }

  async function handleAddToCart() {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      setColorError(true);
      return;
    }
    setSizeError(false);
    setColorError(false);
    try {
      await addItem(
        productId,
        quantity,
        selectedSize ?? undefined,
        selectedColor ?? undefined,
      );
      toast.success('Producto añadido al carrito');
    } catch {
      toast.error('No se pudo añadir al carrito. Inténtalo de nuevo.');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SizeSelector sizes={sizes} selectedSize={selectedSize} onSelect={handleSizeSelect} />

      {sizeError && (
        <p role="alert" className="text-sm text-red-600">
          Por favor, selecciona una talla
        </p>
      )}

      <ColorSelector colors={colorLabels} selectedColor={selectedColor} onSelect={handleColorSelect} />

      {colorError && (
        <p role="alert" className="text-sm text-red-600">
          Por favor, selecciona un color
        </p>
      )}

      {!outOfStock && (
        <QuantityStepper
          quantity={quantity}
          max={stock}
          onIncrement={() => setQuantity((q) => Math.min(q + 1, stock))}
          onDecrement={() => setQuantity((q) => Math.max(q - 1, 1))}
        />
      )}

      <button
        type="button"
        disabled={outOfStock || isLoading}
        onClick={handleAddToCart}
        className={`w-full py-3 px-6 rounded-lg font-medium transition ${
          outOfStock || isLoading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-rm-cta text-white hover:bg-rm-cta-hover'
        }`}
      >
        {outOfStock ? 'Agotado' : 'Añadir al carrito'}
      </button>
    </div>
  );
}
