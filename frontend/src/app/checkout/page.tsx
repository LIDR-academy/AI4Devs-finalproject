'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../contexts/cart-context';
import { StepIndicator } from '../../components/checkout/step-indicator';
import { ShippingForm } from '../../components/checkout/shipping-form';
import { CheckoutOrderSummary } from '../../components/checkout/checkout-order-summary';
import type { ShippingData } from '../../types/checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const { itemCount } = useCart();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);

  useEffect(() => {
    if (itemCount === 0) {
      router.push('/cart');
    }
  }, [itemCount, router]);

  function handleShippingSubmit(data: ShippingData) {
    setShippingData(data);
    setCurrentStep(2);
  }

  if (itemCount === 0) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Finalizar compra</h1>

      <StepIndicator currentStep={currentStep} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          {currentStep === 1 && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Datos de envío</h2>
              <ShippingForm
                initialData={shippingData ?? undefined}
                onSubmit={handleShippingSubmit}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-muted-foreground">
                Paso 2 — Datos de pago (disponible en US-010)
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-muted-foreground">
                Paso 3 — Revisión del pedido (disponible en US-011)
              </p>
            </div>
          )}
        </section>

        <aside>
          <CheckoutOrderSummary />
        </aside>
      </div>
    </main>
  );
}
