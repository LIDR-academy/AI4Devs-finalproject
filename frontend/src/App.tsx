import { MessageCircle, Package, Send, CreditCard, MapPin, RefreshCcw } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { Conversation, Product } from './types';

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadForm, setLeadForm] = useState({
    name: 'Laura Perez',
    phone: '+573001231231',
    message: 'Hola, vi el producto en Marketplace. Tiene descuento?',
    requestedDiscountPercent: 12
  });
  const [deliveryForm, setDeliveryForm] = useState({
    addressText: 'Centro Comercial Andino, Bogota',
    latitude: 4.6671,
    longitude: -74.0534
  });

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) || conversations[0],
    [conversations, selectedId]
  );

  const selectedProduct = products[0];
  const latestNegotiation = selectedConversation?.negotiations[0];
  const latestOrder = latestNegotiation?.order;

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [nextProducts, nextConversations] = await Promise.all([
        api.products(),
        api.conversations()
      ]);
      setProducts(nextProducts);
      setConversations(nextConversations);
      if (!selectedId && nextConversations.length > 0) {
        setSelectedId(nextConversations[0].id);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function runAction(action: () => Promise<unknown>) {
    setLoading(true);
    setError(null);
    try {
      await action();
      await refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Accion fallida');
    } finally {
      setLoading(false);
    }
  }

  function submitLead(event: FormEvent) {
    event.preventDefault();
    if (!selectedProduct) return;

    runAction(async () => {
      const conversation = await api.sendWhatsappLead({
        name: leadForm.name,
        phone: leadForm.phone,
        message: leadForm.message,
        productSku: selectedProduct.sku,
        requestedDiscountPercent: Number(leadForm.requestedDiscountPercent)
      });
      setSelectedId(conversation.id);
    });
  }

  function suggestReply() {
    if (!selectedConversation) return;
    runAction(() =>
      api.suggestReply(selectedConversation.id, {
        requestedDiscountPercent: Number(leadForm.requestedDiscountPercent),
        quantity: 1
      })
    );
  }

  function acceptNegotiation() {
    if (!latestNegotiation) return;
    runAction(() => api.acceptNegotiation(latestNegotiation.id));
  }

  function createPaymentLink() {
    if (!latestOrder) return;
    runAction(() => api.createPaymentLink(latestOrder.id));
  }

  function confirmPayment() {
    if (!latestOrder?.paymentLink) return;
    runAction(() => api.confirmPayment(latestOrder.id, latestOrder.paymentLink!.externalId));
  }

  function scheduleDelivery() {
    if (!latestOrder) return;
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    runAction(() =>
      api.scheduleDelivery(latestOrder.id, {
        deliveryType: 'meetup',
        addressText: deliveryForm.addressText,
        latitude: Number(deliveryForm.latitude),
        longitude: Number(deliveryForm.longitude),
        scheduledAt: tomorrow
      })
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Entrega 2 MVP</p>
          <h1>ComercIA Marketplace Assistant</h1>
        </div>
        <button className="icon-button" onClick={refresh} disabled={loading} title="Actualizar datos">
          <RefreshCcw size={18} />
        </button>
      </header>

      {error && <div className="alert">{error}</div>}

      <section className="workspace">
        <aside className="panel side-panel">
          <SectionTitle icon={<Package size={18} />} title="Producto y reglas" />
          {selectedProduct ? (
            <div className="product-summary">
              <div>
                <strong>{selectedProduct.name}</strong>
                <span>{selectedProduct.sku}</span>
              </div>
              <dl>
                <div>
                  <dt>Precio base</dt>
                  <dd>{money.format(selectedProduct.basePrice)}</dd>
                </div>
                <div>
                  <dt>Margen minimo</dt>
                  <dd>{money.format(selectedProduct.minPrice)}</dd>
                </div>
                <div>
                  <dt>Stock</dt>
                  <dd>{selectedProduct.stock}</dd>
                </div>
                <div>
                  <dt>Descuento max.</dt>
                  <dd>{selectedProduct.pricingRule?.maxDiscountPercent ?? 0}%</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="empty">Ejecuta el seed para crear el producto demo.</p>
          )}

          <SectionTitle icon={<MessageCircle size={18} />} title="Simular WhatsApp" />
          <form className="stack" onSubmit={submitLead}>
            <label>
              Comprador
              <input
                value={leadForm.name}
                onChange={(event) => setLeadForm({ ...leadForm, name: event.target.value })}
              />
            </label>
            <label>
              Telefono
              <input
                value={leadForm.phone}
                onChange={(event) => setLeadForm({ ...leadForm, phone: event.target.value })}
              />
            </label>
            <label>
              Mensaje
              <textarea
                rows={4}
                value={leadForm.message}
                onChange={(event) => setLeadForm({ ...leadForm, message: event.target.value })}
              />
            </label>
            <label>
              Descuento pedido
              <input
                type="number"
                min="0"
                max="80"
                value={leadForm.requestedDiscountPercent}
                onChange={(event) =>
                  setLeadForm({ ...leadForm, requestedDiscountPercent: Number(event.target.value) })
                }
              />
            </label>
            <button className="primary-button" disabled={loading || !selectedProduct}>
              <Send size={16} />
              Crear lead
            </button>
          </form>
        </aside>

        <section className="panel conversation-panel">
          <SectionTitle icon={<MessageCircle size={18} />} title="Conversaciones" />
          <div className="conversation-layout">
            <nav className="conversation-list">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className={conversation.id === selectedConversation?.id ? 'selected' : ''}
                  onClick={() => setSelectedId(conversation.id)}
                >
                  <strong>{conversation.lead.name}</strong>
                  <span>{conversation.product.name}</span>
                  <small>{conversation.status}</small>
                </button>
              ))}
              {conversations.length === 0 && <p className="empty">No hay conversaciones todavia.</p>}
            </nav>

            <div className="thread">
              {selectedConversation ? (
                <>
                  <div className="thread-heading">
                    <div>
                      <h2>{selectedConversation.lead.name}</h2>
                      <p>{selectedConversation.product.name}</p>
                    </div>
                    <span className="status-pill">{selectedConversation.status}</span>
                  </div>
                  <div className="messages">
                    {selectedConversation.messages.map((message) => (
                      <article className={`message ${message.direction}`} key={message.id}>
                        <span>{message.direction}</span>
                        <p>{message.body}</p>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <p className="empty">Crea un lead para iniciar el flujo.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="panel action-panel">
          <SectionTitle icon={<CreditCard size={18} />} title="Flujo comercial" />
          <div className="action-stack">
            <button onClick={suggestReply} disabled={loading || !selectedConversation}>
              Sugerir oferta
            </button>
            <button onClick={acceptNegotiation} disabled={loading || !latestNegotiation || Boolean(latestOrder)}>
              Aceptar oferta y crear orden
            </button>
            <button onClick={createPaymentLink} disabled={loading || !latestOrder || Boolean(latestOrder.paymentLink)}>
              Generar link de pago
            </button>
            <button
              onClick={confirmPayment}
              disabled={loading || !latestOrder?.paymentLink || latestOrder.status === 'paid'}
            >
              Simular pago confirmado
            </button>
          </div>

          {latestNegotiation && (
            <div className="metric-box">
              <span>Oferta sugerida</span>
              <strong>{money.format(latestNegotiation.proposedPrice)}</strong>
              <p>{latestNegotiation.discountPercent}% - {latestNegotiation.rationale}</p>
            </div>
          )}

          {latestOrder && (
            <div className="metric-box">
              <span>Orden #{latestOrder.id}</span>
              <strong>{money.format(latestOrder.totalAmount)}</strong>
              <p>Estado: {latestOrder.status}</p>
              {latestOrder.paymentLink && (
                <a href={latestOrder.paymentLink.url} target="_blank" rel="noreferrer">
                  Abrir link de pago
                </a>
              )}
            </div>
          )}

          <SectionTitle icon={<MapPin size={18} />} title="Entrega" />
          <div className="stack">
            <label>
              Direccion
              <input
                value={deliveryForm.addressText}
                onChange={(event) => setDeliveryForm({ ...deliveryForm, addressText: event.target.value })}
              />
            </label>
            <div className="inline-fields">
              <label>
                Lat
                <input
                  type="number"
                  step="0.0001"
                  value={deliveryForm.latitude}
                  onChange={(event) => setDeliveryForm({ ...deliveryForm, latitude: Number(event.target.value) })}
                />
              </label>
              <label>
                Lng
                <input
                  type="number"
                  step="0.0001"
                  value={deliveryForm.longitude}
                  onChange={(event) => setDeliveryForm({ ...deliveryForm, longitude: Number(event.target.value) })}
                />
              </label>
            </div>
            <button onClick={scheduleDelivery} disabled={loading || latestOrder?.status !== 'paid'}>
              Coordinar entrega
            </button>
          </div>

          {latestOrder?.delivery && (
            <div className="metric-box">
              <span>Entrega</span>
              <strong>{latestOrder.delivery.status}</strong>
              <a href={latestOrder.delivery.mapsUrl} target="_blank" rel="noreferrer">
                Abrir Maps
              </a>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="section-title">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

