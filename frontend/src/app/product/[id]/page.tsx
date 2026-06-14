import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchProduct, ApiError } from '../../../lib/api-client';
import { ProductAttributes } from '../../../components/product/product-attributes';
import { ProductVariantSelector } from '../../../components/product/product-variant-selector';
import { TrustSignals } from '../../../components/product/trust-signals';
import { BackButton } from '../../../components/product/back-button';

interface Props {
  params: { id: string };
}

const ASSETS_BASE_URL = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? '/images';

function buildImageUrl(image: string): string {
  return `${ASSETS_BASE_URL}/${image}`;
}

function formatPrice(price: number): string {
  return price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await fetchProduct(params.id);
    const imageUrl = buildImageUrl(product.image);
    const title = `${product.name} | ${product.brand}`;
    return {
      title,
      description: product.description,
      openGraph: {
        title,
        description: product.description,
        images: [{ url: imageUrl, alt: product.name }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: product.description,
        images: [imageUrl],
      },
    };
  } catch {
    return { title: 'Producto no encontrado' };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  let product: Awaited<ReturnType<typeof fetchProduct>>;

  try {
    product = await fetchProduct(params.id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <BackButton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Imagen */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
          <Image
            src={buildImageUrl(product.image)}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Información del producto */}
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">{product.brand}</p>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</p>

          <ProductAttributes product={product} />

          <p className="text-base text-gray-700">{product.description}</p>

          {product.features.length > 0 && (
            <ul className="space-y-1">
              {product.features.map((feature) => (
                <li key={feature} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          )}

          <ProductVariantSelector
            sizes={product.sizes}
            colors={product.colors}
            stock={product.stock}
            productId={product.id}
            productName={product.name}
            productBrand={product.brand}
            productPrice={product.price}
            image={product.image}
          />

          <TrustSignals />
        </div>
      </div>
    </main>
  );
}
