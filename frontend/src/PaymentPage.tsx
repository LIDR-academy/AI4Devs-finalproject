import { CheckCircle2, CreditCard, Loader2, Package, ShieldCheck } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { PaymentCheckout } from './types';

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

export function PaymentPage({ externalId }: { externalId: string }) {
  const [checkout, setCheckout] = useState<PaymentCheckout | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState({
    payerName: '',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/30',
    cvv: '123'
  });

  const isPaid = checkout?.payment.status === 'paid' || checkout?.order.status === 'paid';
  const expiresLabel = useMemo(() => {
    if (!checkout?.payment.expiresAt) return '';
    return new Date(checkout.payment.expiresAt).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }, [checkout?.payment.expiresAt]);

  async function loadCheckout() {
    setLoading(true);
    setError(null);
    try {
      const nextCheckout = await api.paymentCheckout(externalId);
      setCheckout(nextCheckout);
      setCardForm((current) => ({
        ...current,
        payerName: current.payerName || nextCheckout.order.lead.name
      }));
      document.title = `Pago orden #${nextCheckout.order.id}`;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo cargar el pago');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCheckout();
  }, [externalId]);

  async function confirmPayment(event: FormEvent) {
    event.preventDefault();
    if (!checkout || !checkout.canPay || isPaid) return;

    setProcessing(true);
    setError(null);
    try {
      const result = await api.confirmMockPayment(externalId, {
        payerName: cardForm.payerName.trim() || checkout.order.lead.name
      });
      setCheckout(result.checkout);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo confirmar el pago');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="payment-page">
        <section className="payment-shell payment-state">
          <Loader2 size={24} />
          <p>Cargando pago...</p>
        </section>
      </main>
    );
  }

  if (error && !checkout) {
    return (
      <main className="payment-page">
        <section className="payment-shell payment-state">
          <CreditCard size={24} />
          <h1>Pago no disponible</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  if (!checkout) return null;

  return (
    <main className="payment-page">
      <section className="payment-shell">
        <header className="payment-header">
          <div>
            <p className="eyebrow">Checkout mock</p>
            <h1>Pago orden #{checkout.order.id}</h1>
          </div>
          <span className={`payment-status ${isPaid ? 'paid' : checkout.canPay ? 'pending' : 'blocked'}`}>
            {isPaid ? 'Pagado' : checkout.canPay ? 'Pendiente' : 'No disponible'}
          </span>
        </header>

        {error && <div className="alert">{error}</div>}

        <section className="payment-grid">
          <article className="payment-card">
            <div className="payment-product">
              <div>
                <Package size={20} />
              </div>
              <section>
                <span>{checkout.order.product.sku}</span>
                <h2>{checkout.order.product.name}</h2>
                <p>{checkout.order.product.description || checkout.order.product.category}</p>
              </section>
            </div>

            <dl className="payment-summary">
              <div>
                <dt>Comprador</dt>
                <dd>{checkout.order.lead.name}</dd>
              </div>
              <div>
                <dt>Telefono</dt>
                <dd>{checkout.order.lead.phone}</dd>
              </div>
              <div>
                <dt>Cantidad</dt>
                <dd>{checkout.order.quantity}</dd>
              </div>
              <div>
                <dt>Precio unitario</dt>
                <dd>{money.format(checkout.order.unitPrice)}</dd>
              </div>
              <div className="payment-total">
                <dt>Total</dt>
                <dd>{money.format(checkout.order.totalAmount)}</dd>
              </div>
            </dl>

            {!isPaid && expiresLabel && (
              <p className="payment-expiry">Link valido hasta {expiresLabel}</p>
            )}
          </article>

          <article className="payment-card">
            {isPaid ? (
              <div className="payment-success">
                <CheckCircle2 size={34} />
                <h2>Pago confirmado</h2>
                <p>Ya enviamos la confirmacion por WhatsApp para coordinar la entrega.</p>
              </div>
            ) : (
              <form className="payment-form" onSubmit={confirmPayment}>
                <div className="payment-method-title">
                  <CreditCard size={18} />
                  <h2>Tarjeta de prueba</h2>
                </div>
                <label>
                  Nombre en la tarjeta
                  <input
                    value={cardForm.payerName}
                    onChange={(event) => setCardForm({ ...cardForm, payerName: event.target.value })}
                  />
                </label>
                <label>
                  Numero de tarjeta
                  <input
                    inputMode="numeric"
                    value={cardForm.cardNumber}
                    onChange={(event) => setCardForm({ ...cardForm, cardNumber: event.target.value })}
                  />
                </label>
                <div className="inline-fields">
                  <label>
                    Vence
                    <input
                      value={cardForm.expiry}
                      onChange={(event) => setCardForm({ ...cardForm, expiry: event.target.value })}
                    />
                  </label>
                  <label>
                    CVV
                    <input
                      inputMode="numeric"
                      value={cardForm.cvv}
                      onChange={(event) => setCardForm({ ...cardForm, cvv: event.target.value })}
                    />
                  </label>
                </div>
                <button className="primary-button" disabled={!checkout.canPay || processing}>
                  {processing ? <Loader2 size={16} /> : <ShieldCheck size={16} />}
                  Confirmar pago mock
                </button>
                <p className="payment-note">No se procesa dinero real. Esta accion marca la orden como pagada.</p>
              </form>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}
