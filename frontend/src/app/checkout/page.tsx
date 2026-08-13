'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../contexts/cart-context';
import { apiPost, fetchOrders } from '../../lib/api-client';
import { StepIndicator } from '../../components/checkout/step-indicator';
import { ShippingForm } from '../../components/checkout/shipping-form';
import { PaymentForm } from '../../components/checkout/payment-form';
import { OrderReview } from '../../components/checkout/order-review';
import { OrderConfirmation } from '../../components/checkout/order-confirmation';
import { CheckoutOrderSummary } from '../../components/checkout/checkout-order-summary';
import type { ShippingData, PaymentData } from '../../types/checkout';
import type { OrderResponse } from '../../types/order';

const ORDER_STORAGE_KEY = 'runmarket_last_order';

export default function CheckoutPage() {
  const router = useRouter();
  const { itemCount, items, subtotal, shipping, total, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (order) return;
    if (itemCount > 0) return;

    const storedId = sessionStorage.getItem(ORDER_STORAGE_KEY);
    if (!storedId || !storedId.startsWith('ORD-')) {
      sessionStorage.removeItem(ORDER_STORAGE_KEY);
      router.push('/');
      return;
    }

    fetchOrders()
      .then((orders) => {
        const found = orders.find((o) => o.id === storedId);
        if (found) {
          setOrder(found);
          return;
        }
        sessionStorage.removeItem(ORDER_STORAGE_KEY);
        router.push('/');
      })
      .catch(() => {
        sessionStorage.removeItem(ORDER_STORAGE_KEY);
        router.push('/');
      });
  }, [order, itemCount, router]);

  function handleShippingSubmit(data: ShippingData) {
    setShippingData(data);
    setCurrentStep(2);
  }

  function handlePaymentSubmit(data: PaymentData) {
    setPaymentData(data);
    setCurrentStep(3);
  }

  function handlePaymentBack() {
    setCurrentStep(1);
  }

  async function handleConfirmOrder() {
    if (!shippingData) return;
    setIsSubmittingOrder(true);
    setCheckoutError(null);
    try {
      const result = await apiPost<OrderResponse>('/checkout', shippingData);
      setOrder(result);
      sessionStorage.setItem(ORDER_STORAGE_KEY, result.id);
      clearCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setCheckoutError(message);
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  function handleReviewBack() {
    setCurrentStep(2);
  }

  if (itemCount === 0 && !order) {
    return null;
  }

  if (order) {
    return <OrderConfirmation order={order} />;
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
              <h2 className="mb-4 text-lg font-semibold">Método de pago</h2>
              <PaymentForm
                initialData={paymentData ?? undefined}
                onSubmit={handlePaymentSubmit}
                onBack={handlePaymentBack}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Revisar pedido</h2>
              <OrderReview
                shippingData={shippingData!}
                items={items}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                isSubmitting={isSubmittingOrder}
                error={checkoutError}
                onConfirm={handleConfirmOrder}
                onBack={handleReviewBack}
              />
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
