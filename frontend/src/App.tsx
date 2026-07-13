import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  MapPin,
  MessageCircle,
  Package,
  Percent,
  Plus,
  RefreshCcw,
  Save,
  Send,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Truck,
  UserCheck,
  Warehouse
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { API_URL, api } from './api';
import { PaymentPage } from './PaymentPage';
import type {
  Conversation,
  InventoryMovementPayload,
  PricingRulePayload,
  Product,
  ProductCreatePayload,
  ProductUpdatePayload
} from './types';

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

const statusLabels: Record<string, string> = {
  open: 'Abierta',
  human_review: 'Revision humana',
  advisor_active: 'Asesor activo',
  waiting_payment: 'Esperando pago',
  paid: 'Pagada',
  delivery_scheduled: 'Entrega programada'
};

const directionLabels: Record<string, string> = {
  inbound: 'Cliente',
  outbound: 'ComercIA',
  system: 'Sistema'
};

type DashboardSection = 'backend' | 'inventory' | 'rules' | 'whatsapp';

const defaultProductForm: ProductUpdatePayload = {
  name: '',
  description: '',
  category: '',
  basePrice: 0,
  minPrice: 0,
  status: 'active'
};

const defaultRuleForm: PricingRulePayload = {
  maxDiscountPercent: 15,
  lowRotationDays: 20,
  lowStockThreshold: 3,
  approvalDiscountThreshold: 12,
  offerExpiresInMinutes: 30,
  active: true
};

const defaultNewProductForm: ProductCreatePayload & PricingRulePayload = {
  sku: '',
  name: '',
  description: '',
  category: '',
  basePrice: 0,
  minPrice: 0,
  stock: 0,
  ...defaultRuleForm
};

const defaultStockForm: InventoryMovementPayload = {
  type: 'restock',
  quantity: 1,
  reason: 'Ajuste manual de inventario'
};

export function App() {
  const paymentMatch = window.location.pathname.match(/^\/pay\/([^/]+)/);
  if (paymentMatch) {
    return <PaymentPage externalId={decodeURIComponent(paymentMatch[1])} />;
  }

  const [activeSection, setActiveSection] = useState<DashboardSection>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [reviewQueue, setReviewQueue] = useState<Conversation[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [productQuery, setProductQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productForm, setProductForm] = useState<ProductUpdatePayload>(defaultProductForm);
  const [ruleForm, setRuleForm] = useState<PricingRulePayload>(defaultRuleForm);
  const [newProductForm, setNewProductForm] = useState(defaultNewProductForm);
  const [stockForm, setStockForm] = useState<InventoryMovementPayload>(defaultStockForm);
  const [caseForm, setCaseForm] = useState({ requestedDiscountPercent: 12, quantity: 1 });
  const [advisorName, setAdvisorName] = useState('Sergio');
  const [advisorReply, setAdvisorReply] = useState('');
  const [deliveryForm, setDeliveryForm] = useState({
    addressText: 'Centro Comercial Andino, Bogota',
    latitude: 4.6671,
    longitude: -74.0534
  });
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || products[0] || null,
    [products, selectedProductId]
  );

  const selectedConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === selectedConversationId) ||
      reviewQueue.find((conversation) => conversation.id === selectedConversationId) ||
      conversations[0] ||
      reviewQueue[0] ||
      null,
    [conversations, reviewQueue, selectedConversationId]
  );

  const latestNegotiation = selectedConversation?.negotiations[0] || null;
  const latestOrder = latestNegotiation?.order || null;
  const latestMessage = selectedConversation?.messages[selectedConversation.messages.length - 1] || null;

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [categoryFilter, productQuery, products]);

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const inventoryValue = products.reduce((sum, product) => sum + product.stock * product.basePrice, 0);
  const lowStockProducts = products.filter((product) => product.stock <= (product.pricingRule?.lowStockThreshold ?? 0));
  const humanReviewCount = reviewQueue.length;
  const advisorActiveCount = conversations.filter((conversation) => conversation.status === 'advisor_active').length;
  const agentReadyCount = products.filter((product) => product.pricingRule?.active && product.status === 'active').length;
  const reviewQueueIds = useMemo(() => new Set(reviewQueue.map((conversation) => conversation.id)), [reviewQueue]);
  const isAdvisorLocked = Boolean(
    selectedConversation?.automationPaused ||
    selectedConversation?.status === 'human_review' ||
    selectedConversation?.status === 'advisor_active'
  );
  const requiresAdvisorOrder = Boolean(
    latestNegotiation?.status === 'human_review' ||
    selectedConversation?.status === 'human_review'
  );
  const advisorHasTakenCase = selectedConversation?.status === 'advisor_active';
  const canSuggestOffer = Boolean(selectedConversation && (!isAdvisorLocked || advisorHasTakenCase));
  const canAcceptCurrentNegotiation = Boolean(
    latestNegotiation &&
    !latestOrder &&
    (!requiresAdvisorOrder || advisorHasTakenCase)
  );

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [health, nextProducts, nextConversations, nextReviewQueue] = await Promise.all([
        api.health(),
        api.products(),
        api.conversations(),
        api.reviewQueue()
      ]);

      setApiStatus(health.ok ? 'online' : 'offline');
      setProducts(nextProducts);
      setConversations(nextConversations);
      setReviewQueue(nextReviewQueue);

      if (!selectedProductId && nextProducts.length > 0) {
        setSelectedProductId(nextProducts[0].id);
      }

      if (!selectedConversationId) {
        const defaultConversation = nextReviewQueue[0] || nextConversations[0];
        if (defaultConversation) {
          setSelectedConversationId(defaultConversation.id);
        }
      }
    } catch (nextError) {
      setApiStatus('offline');
      setError(nextError instanceof Error ? nextError.message : 'No se pudo cargar la informacion');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;

    setProductForm({
      name: selectedProduct.name,
      description: selectedProduct.description || '',
      category: selectedProduct.category,
      basePrice: selectedProduct.basePrice,
      minPrice: selectedProduct.minPrice,
      status: selectedProduct.status === 'inactive' ? 'inactive' : 'active'
    });
    setRuleForm({
      maxDiscountPercent: selectedProduct.pricingRule?.maxDiscountPercent ?? defaultRuleForm.maxDiscountPercent,
      lowRotationDays: selectedProduct.pricingRule?.lowRotationDays ?? defaultRuleForm.lowRotationDays,
      lowStockThreshold: selectedProduct.pricingRule?.lowStockThreshold ?? defaultRuleForm.lowStockThreshold,
      approvalDiscountThreshold:
        selectedProduct.pricingRule?.approvalDiscountThreshold ?? defaultRuleForm.approvalDiscountThreshold,
      offerExpiresInMinutes:
        selectedProduct.pricingRule?.offerExpiresInMinutes ?? defaultRuleForm.offerExpiresInMinutes,
      active: selectedProduct.pricingRule?.active ?? true
    });
  }, [selectedProduct?.id]);

  async function runAction(action: () => Promise<unknown>) {
    setLoading(true);
    setError(null);
    try {
      await action();
      await refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'La accion no se pudo completar');
    } finally {
      setLoading(false);
    }
  }

  function saveProduct(event: FormEvent) {
    event.preventDefault();
    if (!selectedProduct) return;

    runAction(async () => {
      await api.updateProduct(selectedProduct.id, normalizeProductUpdate(productForm));
      await api.updatePricingRule(selectedProduct.id, normalizePricingRule(ruleForm));
    });
  }

  function applyStockMovement(event: FormEvent) {
    event.preventDefault();
    if (!selectedProduct) return;

    runAction(() =>
      api.createInventoryMovement(selectedProduct.id, {
        type: stockForm.type,
        quantity: Math.trunc(Number(stockForm.quantity)),
        reason: stockForm.reason.trim()
      })
    );
  }

  function createProduct(event: FormEvent) {
    event.preventDefault();

    runAction(async () => {
      const created = await api.createProduct({
        sku: newProductForm.sku.trim().toUpperCase(),
        name: newProductForm.name.trim(),
        description: cleanOptional(newProductForm.description),
        category: newProductForm.category.trim(),
        basePrice: Number(newProductForm.basePrice),
        minPrice: Number(newProductForm.minPrice),
        stock: Math.trunc(Number(newProductForm.stock))
      });

      await api.updatePricingRule(created.id, normalizePricingRule(newProductForm));
      setSelectedProductId(created.id);
      setNewProductForm(defaultNewProductForm);
    });
  }

  function suggestReply() {
    if (!selectedConversation) return;
    if (selectedConversation.status === 'advisor_active') {
      runAction(async () => {
        const result = await api.sendAdvisorManualOffer(selectedConversation.id, {
          discountPercent: Number(caseForm.requestedDiscountPercent),
          quantity: Math.max(1, Math.trunc(Number(caseForm.quantity))),
          advisorName: cleanOptional(advisorName)
        });
        setSelectedConversationId(result.conversation.id);
      });
      return;
    }

    runAction(() =>
      api.suggestReply(selectedConversation.id, {
        requestedDiscountPercent: Number(caseForm.requestedDiscountPercent),
        quantity: Math.max(1, Math.trunc(Number(caseForm.quantity)))
      })
    );
  }

  function takeConversation() {
    if (!selectedConversation) return;
    runAction(async () => {
      const conversation = await api.takeConversation(selectedConversation.id, {
        advisorName: cleanOptional(advisorName)
      });
      setSelectedConversationId(conversation.id);
    });
  }

  function sendAdvisorReply(event: FormEvent) {
    event.preventDefault();
    if (!selectedConversation || !advisorReply.trim()) return;

    runAction(async () => {
      const conversation = await api.sendAdvisorReply(selectedConversation.id, {
        message: advisorReply.trim(),
        advisorName: cleanOptional(advisorName)
      });
      setSelectedConversationId(conversation.id);
      setAdvisorReply('');
    });
  }

  function acceptNegotiation() {
    if (!latestNegotiation) return;
    const payload =
      requiresAdvisorOrder || advisorHasTakenCase
        ? { actor: 'advisor' as const, advisorName: cleanOptional(advisorName) }
        : {};

    runAction(() => api.acceptNegotiation(latestNegotiation.id, payload));
  }

  function createPaymentLink() {
    if (!latestOrder) return;
    runAction(() => api.createPaymentLink(latestOrder.id));
  }

  function confirmPayment() {
    if (!latestOrder?.paymentLink) return;
    const { id, paymentLink } = latestOrder;
    runAction(() => api.confirmPayment(id, paymentLink.externalId));
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
          <p className="eyebrow">Operacion comercial</p>
          <h1>ComercIA Inventory Manager</h1>
        </div>
        <button className="icon-button" onClick={refresh} disabled={loading} title="Actualizar">
          <RefreshCcw size={18} />
        </button>
      </header>

      <section className="status-grid" aria-label="Estado del sistema">
        <StatusCard
          icon={apiStatus === 'online' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          label="Backend"
          value={apiStatus === 'online' ? 'Conectado' : apiStatus === 'checking' ? 'Validando' : 'Sin conexion'}
          detail={API_URL}
          tone={apiStatus === 'online' ? 'success' : 'danger'}
          active={activeSection === 'backend'}
          onClick={() => setActiveSection('backend')}
        />
        <StatusCard
          icon={<Warehouse size={18} />}
          label="Inventario"
          value={`${totalStock} unidades`}
          detail={money.format(inventoryValue)}
          active={activeSection === 'inventory'}
          onClick={() => setActiveSection('inventory')}
        />
        <StatusCard
          icon={<Percent size={18} />}
          label="Reglas agente"
          value={`${agentReadyCount}/${products.length} activas`}
          detail={`${lowStockProducts.length} productos en bajo stock`}
          tone={lowStockProducts.length ? 'danger' : 'success'}
          active={activeSection === 'rules'}
          onClick={() => setActiveSection('rules')}
        />
        <StatusCard
          icon={<MessageCircle size={18} />}
          label="WhatsApp"
          value={`${conversations.length} conversaciones`}
          detail={`${humanReviewCount} pendientes, ${advisorActiveCount} en asesoria`}
          tone={humanReviewCount || advisorActiveCount ? 'danger' : 'neutral'}
          active={activeSection === 'whatsapp'}
          onClick={() => setActiveSection('whatsapp')}
        />
      </section>

      {error && <div className="alert">{error}</div>}

      {activeSection === 'backend' && (
        <section className="section-grid backend-grid">
          <section className="panel backend-panel">
            <SectionTitle
              icon={apiStatus === 'online' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              title="Estado del backend"
            />
            <div className="backend-summary">
              <div>
                <span>Conexion</span>
                <strong>{apiStatus === 'online' ? 'Conectado' : apiStatus === 'checking' ? 'Validando' : 'Sin conexion'}</strong>
                <p>{API_URL}</p>
              </div>
              <button className="secondary-button" onClick={refresh} disabled={loading}>
                <RefreshCcw size={16} />
                Actualizar
              </button>
            </div>
          </section>

          <section className="panel">
            <SectionTitle icon={<Package size={18} />} title="Resumen operativo" />
            <div className="detail-list">
              <div>
                <span>Productos</span>
                <strong>{products.length}</strong>
              </div>
              <div>
                <span>Unidades en inventario</span>
                <strong>{totalStock}</strong>
              </div>
              <div>
                <span>Reglas activas</span>
                <strong>{agentReadyCount}</strong>
              </div>
              <div>
                <span>Pendientes de asesor</span>
                <strong>{humanReviewCount}</strong>
              </div>
            </div>
          </section>
        </section>
      )}

      {activeSection === 'inventory' && (
      <section className="inventory-grid">
        <section className="panel inventory-panel">
          <SectionTitle icon={<Warehouse size={18} />} title="Inventario" />
          <div className="inventory-toolbar">
            <label>
              Buscar
              <input
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
                placeholder="SKU, nombre o categoria"
              />
            </label>
            <label>
              Categoria
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="product-table inventory-table">
            <div className="table-head">
              <span>Producto</span>
              <span>Precio</span>
              <span>Stock</span>
              <span>Agente</span>
            </div>
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                className={product.id === selectedProduct?.id ? 'selected' : ''}
                onClick={() => setSelectedProductId(product.id)}
              >
                <strong>{product.name}</strong>
                <span>{money.format(product.basePrice)}</span>
                <StockBadge product={product} />
                <span>{product.pricingRule?.active ? `${product.pricingRule.maxDiscountPercent}% max` : 'Pausado'}</span>
                <small>{product.sku} | {product.category}</small>
              </button>
            ))}
            {filteredProducts.length === 0 && <p className="empty">No hay productos con ese filtro.</p>}
          </div>
        </section>

        <section className="panel editor-panel">
          <SectionTitle icon={<SlidersHorizontal size={18} />} title="Producto seleccionado" />
          {selectedProduct ? (
            <>
              <div className="product-heading">
                <div>
                  <strong>{selectedProduct.sku}</strong>
                  <span>{selectedProduct.status}</span>
                </div>
                <span className="status-pill">{money.format(selectedProduct.basePrice - selectedProduct.minPrice)} margen</span>
              </div>

              <form className="editor-form" onSubmit={saveProduct}>
                <div className="form-grid">
                  <label>
                    Nombre
                    <input
                      value={productForm.name}
                      onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                    />
                  </label>
                  <label>
                    Categoria
                    <input
                      value={productForm.category}
                      onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
                    />
                  </label>
                  <label>
                    Precio base
                    <input
                      type="number"
                      min="1"
                      value={productForm.basePrice}
                      onChange={(event) => setProductForm({ ...productForm, basePrice: Number(event.target.value) })}
                    />
                  </label>
                  <label>
                    Precio minimo
                    <input
                      type="number"
                      min="1"
                      value={productForm.minPrice}
                      onChange={(event) => setProductForm({ ...productForm, minPrice: Number(event.target.value) })}
                    />
                  </label>
                  <label>
                    Estado
                    <select
                      value={productForm.status}
                      onChange={(event) =>
                        setProductForm({ ...productForm, status: event.target.value as ProductUpdatePayload['status'] })
                      }
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </label>
                  <label className="wide-field">
                    Descripcion
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                    />
                  </label>
                </div>

                <div className="form-section-title">
                  <Percent size={16} />
                  <h3>Reglas del agente</h3>
                </div>
                <div className="form-grid">
                  <label>
                    Descuento max. agente
                    <input
                      type="number"
                      min="0"
                      max="80"
                      value={ruleForm.maxDiscountPercent}
                      onChange={(event) => setRuleForm({ ...ruleForm, maxDiscountPercent: Number(event.target.value) })}
                    />
                  </label>
                  <label>
                    Revision humana desde
                    <input
                      type="number"
                      min="0"
                      max="80"
                      value={ruleForm.approvalDiscountThreshold}
                      onChange={(event) =>
                        setRuleForm({ ...ruleForm, approvalDiscountThreshold: Number(event.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Bajo stock
                    <input
                      type="number"
                      min="0"
                      value={ruleForm.lowStockThreshold}
                      onChange={(event) => setRuleForm({ ...ruleForm, lowStockThreshold: Number(event.target.value) })}
                    />
                  </label>
                  <label>
                    Baja rotacion dias
                    <input
                      type="number"
                      min="1"
                      value={ruleForm.lowRotationDays}
                      onChange={(event) => setRuleForm({ ...ruleForm, lowRotationDays: Number(event.target.value) })}
                    />
                  </label>
                  <label>
                    Vigencia oferta min
                    <input
                      type="number"
                      min="1"
                      value={ruleForm.offerExpiresInMinutes}
                      onChange={(event) =>
                        setRuleForm({ ...ruleForm, offerExpiresInMinutes: Number(event.target.value) })
                      }
                    />
                  </label>
                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={ruleForm.active}
                      onChange={(event) => setRuleForm({ ...ruleForm, active: event.target.checked })}
                    />
                    Agente activo
                  </label>
                </div>

                <button className="primary-button" disabled={loading}>
                  <Save size={16} />
                  Guardar producto
                </button>
              </form>

              <form className="stock-form" onSubmit={applyStockMovement}>
                <div className="form-section-title">
                  <Warehouse size={16} />
                  <h3>Ajuste de stock</h3>
                </div>
                <div className="inline-fields">
                  <label>
                    Tipo
                    <select
                      value={stockForm.type}
                      onChange={(event) =>
                        setStockForm({ ...stockForm, type: event.target.value as InventoryMovementPayload['type'] })
                      }
                    >
                      <option value="restock">Entrada</option>
                      <option value="adjustment">Ajuste</option>
                      <option value="reservation">Reserva</option>
                      <option value="sale">Venta</option>
                    </select>
                  </label>
                  <label>
                    Cantidad +/-
                    <input
                      type="number"
                      value={stockForm.quantity}
                      onChange={(event) => setStockForm({ ...stockForm, quantity: Number(event.target.value) })}
                    />
                  </label>
                </div>
                <label>
                  Motivo
                  <input
                    value={stockForm.reason}
                    onChange={(event) => setStockForm({ ...stockForm, reason: event.target.value })}
                  />
                </label>
                <button className="secondary-button" disabled={loading}>
                  <Warehouse size={16} />
                  Registrar movimiento
                </button>
              </form>
            </>
          ) : (
            <p className="empty">No hay productos cargados.</p>
          )}
        </section>

        <section className="panel create-panel">
          <SectionTitle icon={<Plus size={18} />} title="Nuevo producto" />
          <form className="create-form" onSubmit={createProduct}>
            <div className="form-grid single">
              <label>
                SKU
                <input
                  value={newProductForm.sku}
                  onChange={(event) => setNewProductForm({ ...newProductForm, sku: event.target.value })}
                />
              </label>
              <label>
                Nombre
                <input
                  value={newProductForm.name}
                  onChange={(event) => setNewProductForm({ ...newProductForm, name: event.target.value })}
                />
              </label>
              <label>
                Categoria
                <input
                  value={newProductForm.category}
                  onChange={(event) => setNewProductForm({ ...newProductForm, category: event.target.value })}
                />
              </label>
              <label className="wide-field">
                Descripcion
                <textarea
                  rows={3}
                  value={newProductForm.description}
                  onChange={(event) => setNewProductForm({ ...newProductForm, description: event.target.value })}
                />
              </label>
              <div className="inline-fields">
                <label>
                  Precio base
                  <input
                    type="number"
                    min="1"
                    value={newProductForm.basePrice}
                    onChange={(event) => setNewProductForm({ ...newProductForm, basePrice: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Precio minimo
                  <input
                    type="number"
                    min="1"
                    value={newProductForm.minPrice}
                    onChange={(event) => setNewProductForm({ ...newProductForm, minPrice: Number(event.target.value) })}
                  />
                </label>
              </div>
              <div className="inline-fields">
                <label>
                  Stock inicial
                  <input
                    type="number"
                    min="0"
                    value={newProductForm.stock}
                    onChange={(event) => setNewProductForm({ ...newProductForm, stock: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Desc. agente
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={newProductForm.maxDiscountPercent}
                    onChange={(event) =>
                      setNewProductForm({ ...newProductForm, maxDiscountPercent: Number(event.target.value) })
                    }
                  />
                </label>
              </div>
              <div className="inline-fields">
                <label>
                  Revision desde
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={newProductForm.approvalDiscountThreshold}
                    onChange={(event) =>
                      setNewProductForm({ ...newProductForm, approvalDiscountThreshold: Number(event.target.value) })
                    }
                  />
                </label>
                <label>
                  Bajo stock
                  <input
                    type="number"
                    min="0"
                    value={newProductForm.lowStockThreshold}
                    onChange={(event) =>
                      setNewProductForm({ ...newProductForm, lowStockThreshold: Number(event.target.value) })
                    }
                  />
                </label>
              </div>
            </div>
            <button className="primary-button" disabled={loading}>
              <Plus size={16} />
              Crear producto
            </button>
          </form>
        </section>
      </section>

      )}

      {activeSection === 'rules' && (
        <section className="rules-grid">
          <section className="panel inventory-panel">
            <SectionTitle icon={<Percent size={18} />} title="Producto para reglas" />
            <div className="inventory-toolbar">
              <label>
                Buscar
                <input
                  value={productQuery}
                  onChange={(event) => setProductQuery(event.target.value)}
                  placeholder="SKU, nombre o categoria"
                />
              </label>
              <label>
                Categoria
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  <option value="all">Todas</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="product-table inventory-table">
              <div className="table-head">
                <span>Producto</span>
                <span>Precio</span>
                <span>Stock</span>
                <span>Agente</span>
              </div>
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  className={product.id === selectedProduct?.id ? 'selected' : ''}
                  onClick={() => setSelectedProductId(product.id)}
                >
                  <strong>{product.name}</strong>
                  <span>{money.format(product.basePrice)}</span>
                  <StockBadge product={product} />
                  <span>{product.pricingRule?.active ? `${product.pricingRule.maxDiscountPercent}% max` : 'Pausado'}</span>
                  <small>{product.sku} | {product.category}</small>
                </button>
              ))}
              {filteredProducts.length === 0 && <p className="empty">No hay productos con ese filtro.</p>}
            </div>
          </section>

          <section className="panel editor-panel">
            <SectionTitle icon={<SlidersHorizontal size={18} />} title="Precios y reglas del agente" />
            {selectedProduct ? (
              <>
                <div className="product-heading">
                  <div>
                    <strong>{selectedProduct.name}</strong>
                    <span>{selectedProduct.sku} | {selectedProduct.status}</span>
                  </div>
                  <span className="status-pill">{money.format(selectedProduct.basePrice - selectedProduct.minPrice)} margen</span>
                </div>

                <form className="editor-form" onSubmit={saveProduct}>
                  <div className="form-grid">
                    <label>
                      Nombre
                      <input
                        value={productForm.name}
                        onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                      />
                    </label>
                    <label>
                      Categoria
                      <input
                        value={productForm.category}
                        onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
                      />
                    </label>
                    <label>
                      Precio base
                      <input
                        type="number"
                        min="1"
                        value={productForm.basePrice}
                        onChange={(event) => setProductForm({ ...productForm, basePrice: Number(event.target.value) })}
                      />
                    </label>
                    <label>
                      Precio minimo
                      <input
                        type="number"
                        min="1"
                        value={productForm.minPrice}
                        onChange={(event) => setProductForm({ ...productForm, minPrice: Number(event.target.value) })}
                      />
                    </label>
                    <label>
                      Estado
                      <select
                        value={productForm.status}
                        onChange={(event) =>
                          setProductForm({ ...productForm, status: event.target.value as ProductUpdatePayload['status'] })
                        }
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </label>
                    <label className="wide-field">
                      Descripcion
                      <textarea
                        rows={3}
                        value={productForm.description}
                        onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                      />
                    </label>
                  </div>

                  <div className="form-section-title">
                    <Percent size={16} />
                    <h3>Reglas automaticas</h3>
                  </div>
                  <div className="form-grid">
                    <label>
                      Descuento max. agente
                      <input
                        type="number"
                        min="0"
                        max="80"
                        value={ruleForm.maxDiscountPercent}
                        onChange={(event) => setRuleForm({ ...ruleForm, maxDiscountPercent: Number(event.target.value) })}
                      />
                    </label>
                    <label>
                      Revision humana desde
                      <input
                        type="number"
                        min="0"
                        max="80"
                        value={ruleForm.approvalDiscountThreshold}
                        onChange={(event) =>
                          setRuleForm({ ...ruleForm, approvalDiscountThreshold: Number(event.target.value) })
                        }
                      />
                    </label>
                    <label>
                      Bajo stock
                      <input
                        type="number"
                        min="0"
                        value={ruleForm.lowStockThreshold}
                        onChange={(event) => setRuleForm({ ...ruleForm, lowStockThreshold: Number(event.target.value) })}
                      />
                    </label>
                    <label>
                      Baja rotacion dias
                      <input
                        type="number"
                        min="1"
                        value={ruleForm.lowRotationDays}
                        onChange={(event) => setRuleForm({ ...ruleForm, lowRotationDays: Number(event.target.value) })}
                      />
                    </label>
                    <label>
                      Vigencia oferta min
                      <input
                        type="number"
                        min="1"
                        value={ruleForm.offerExpiresInMinutes}
                        onChange={(event) =>
                          setRuleForm({ ...ruleForm, offerExpiresInMinutes: Number(event.target.value) })
                        }
                      />
                    </label>
                    <label className="toggle-row">
                      <input
                        type="checkbox"
                        checked={ruleForm.active}
                        onChange={(event) => setRuleForm({ ...ruleForm, active: event.target.checked })}
                      />
                      Agente activo
                    </label>
                  </div>

                  <button className="primary-button" disabled={loading}>
                    <Save size={16} />
                    Guardar reglas
                  </button>
                </form>
              </>
            ) : (
              <p className="empty">No hay productos cargados.</p>
            )}
          </section>
        </section>
      )}

      {activeSection === 'whatsapp' && (
      <section className="operations-grid">
        <aside className="panel inbox-panel">
          <SectionTitle icon={<MessageCircle size={18} />} title="Bandeja WhatsApp" />
          {reviewQueue.length > 0 && (
            <div className="queue-section">
              <div className="queue-heading">
                <UserCheck size={15} />
                <span>Pendientes de asesor</span>
              </div>
              <div className="conversation-list compact">
                {reviewQueue.map((conversation) => (
                  <button
                    key={`review-${conversation.id}`}
                    className={conversation.id === selectedConversation?.id ? 'selected' : ''}
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <span className={`status-dot ${conversation.status}`} />
                    <strong>{conversation.lead.name}</strong>
                    <span>{conversation.product.name}</span>
                    <small>{conversation.negotiations[0]?.discountPercent ?? 0}% requiere revision</small>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="conversation-list">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`${conversation.id === selectedConversation?.id ? 'selected' : ''} ${reviewQueueIds.has(conversation.id) ? 'queued' : ''}`}
                onClick={() => setSelectedConversationId(conversation.id)}
              >
                <span className={`status-dot ${conversation.status}`} />
                <strong>{conversation.lead.name}</strong>
                <span>{conversation.product.name}</span>
                <small>{statusLabels[conversation.status] || conversation.status}</small>
              </button>
            ))}
            {conversations.length === 0 && <p className="empty">No hay conversaciones en la BD.</p>}
          </div>
        </aside>

        <section className="panel thread-panel">
          <SectionTitle icon={<MessageCircle size={18} />} title="Conversacion seleccionada" />
          {selectedConversation ? (
            <>
              <div className="thread-heading">
                <div>
                  <h2>{selectedConversation.lead.name}</h2>
                  <p>{selectedConversation.lead.phone}</p>
                </div>
                <div className="status-pills">
                  <span className="status-pill">{statusLabels[selectedConversation.status] || selectedConversation.status}</span>
                  {selectedConversation.automationPaused && <span className="status-pill warning">Bot pausado</span>}
                </div>
              </div>

              <div className="product-strip">
                <div>
                  <span>Producto</span>
                  <strong>{selectedConversation.product.name}</strong>
                </div>
                <div>
                  <span>SKU</span>
                  <strong>{selectedConversation.product.sku}</strong>
                </div>
                <div>
                  <span>Stock</span>
                  <strong>{selectedConversation.product.stock}</strong>
                </div>
                <div>
                  <span>Precio base</span>
                  <strong>{money.format(selectedConversation.product.basePrice)}</strong>
                </div>
              </div>

              <div className="messages">
                {selectedConversation.messages.map((message) => (
                  <article className={`message ${message.direction}`} key={message.id}>
                    <span>{directionLabels[message.direction] || message.direction}</span>
                    <p>{message.body}</p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p className="empty">No hay una conversacion seleccionada.</p>
          )}
        </section>

        <aside className="panel action-panel">
          <SectionTitle icon={<Sparkles size={18} />} title="Gestion del caso" />
          <div className="advisor-controls">
            <label>
              Asesor
              <input value={advisorName} onChange={(event) => setAdvisorName(event.target.value)} />
            </label>
            <button
              className="secondary-button"
              onClick={takeConversation}
              disabled={loading || selectedConversation?.status !== 'human_review'}
            >
              <UserCheck size={16} />
              Tomar caso
            </button>
          </div>

          {selectedConversation && ['human_review', 'advisor_active'].includes(selectedConversation.status) && (
            <div className="advisor-notice">
              <strong>{selectedConversation.status === 'advisor_active' ? 'Caso tomado por asesor' : 'Requiere asesor'}</strong>
              <p>
                {selectedConversation.status === 'advisor_active'
                  ? 'Puedes responder al cliente, crear la orden o continuar con el pago.'
                  : 'El bot esta pausado. Toma el caso antes de crear la orden.'}
              </p>
            </div>
          )}

          {selectedConversation?.status === 'advisor_active' && (
            <form className="advisor-reply-form" onSubmit={sendAdvisorReply}>
              <label>
                Respuesta al cliente
                <textarea
                  rows={4}
                  value={advisorReply}
                  onChange={(event) => setAdvisorReply(event.target.value)}
                  placeholder="Escribe el mensaje que se enviara por WhatsApp"
                />
              </label>
              <button className="primary-button" disabled={loading || advisorReply.trim().length < 2}>
                <Send size={16} />
                Enviar respuesta
              </button>
            </form>
          )}

          <div className="case-inputs">
            <label>
              {advisorHasTakenCase ? 'Descuento manual asesor' : 'Descuento pedido'}
              <input
                type="number"
                min="0"
                max="80"
                value={caseForm.requestedDiscountPercent}
                onChange={(event) =>
                  setCaseForm({ ...caseForm, requestedDiscountPercent: Number(event.target.value) })
                }
              />
            </label>
            <label>
              Cantidad
              <input
                type="number"
                min="1"
                value={caseForm.quantity}
                onChange={(event) => setCaseForm({ ...caseForm, quantity: Number(event.target.value) })}
              />
            </label>
          </div>

          <div className="action-stack">
            <button onClick={suggestReply} disabled={loading || !canSuggestOffer}>
              <Sparkles size={16} />
              {advisorHasTakenCase ? 'Enviar oferta manual' : 'Calcular oferta'}
            </button>
            <button onClick={acceptNegotiation} disabled={loading || !canAcceptCurrentNegotiation}>
              <ShoppingBag size={16} />
              {requiresAdvisorOrder ? 'Crear orden asesor' : 'Crear orden'}
            </button>
            <button onClick={createPaymentLink} disabled={loading || !latestOrder || Boolean(latestOrder.paymentLink)}>
              <CreditCard size={16} />
              Crear link de pago
            </button>
            <button onClick={confirmPayment} disabled={loading || !latestOrder?.paymentLink || latestOrder.status === 'paid'}>
              <CheckCircle2 size={16} />
              Confirmar pago demo
            </button>
          </div>

          {latestNegotiation && (
            <div className="summary-block">
              <span>Oferta actual</span>
              <strong>{money.format(latestNegotiation.proposedPrice)}</strong>
              <p>{latestNegotiation.discountPercent}% - {latestNegotiation.rationale}</p>
            </div>
          )}

          {latestOrder && (
            <div className="summary-block">
              <span>Orden #{latestOrder.id}</span>
              <strong>{money.format(latestOrder.totalAmount)}</strong>
              <p>Estado: {latestOrder.status}</p>
              {latestOrder.paymentLink && (
                <a href={latestOrder.paymentLink.url} target="_blank" rel="noreferrer">
                  Link de pago <ExternalLink size={13} />
                </a>
              )}
            </div>
          )}

          <SectionTitle icon={<Truck size={18} />} title="Entrega" />
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
              <MapPin size={16} />
              Programar entrega
            </button>
          </div>

          {latestOrder?.delivery && (
            <div className="summary-block">
              <span>Entrega</span>
              <strong>{latestOrder.delivery.status}</strong>
              <a href={latestOrder.delivery.mapsUrl} target="_blank" rel="noreferrer">
                Abrir Maps <ExternalLink size={13} />
              </a>
            </div>
          )}

          {latestMessage && <p className="last-message">Ultimo mensaje: {latestMessage.body}</p>}
        </aside>
      </section>
      )}
    </main>
  );
}

function normalizeProductUpdate(form: ProductUpdatePayload): ProductUpdatePayload {
  return {
    name: form.name.trim(),
    description: cleanOptional(form.description),
    category: form.category.trim(),
    basePrice: Number(form.basePrice),
    minPrice: Number(form.minPrice),
    status: form.status
  };
}

function normalizePricingRule(form: PricingRulePayload): PricingRulePayload {
  return {
    maxDiscountPercent: Number(form.maxDiscountPercent),
    lowRotationDays: Math.trunc(Number(form.lowRotationDays)),
    lowStockThreshold: Math.trunc(Number(form.lowStockThreshold)),
    approvalDiscountThreshold: Number(form.approvalDiscountThreshold),
    offerExpiresInMinutes: Math.trunc(Number(form.offerExpiresInMinutes)),
    active: Boolean(form.active)
  };
}

function cleanOptional(value?: string) {
  const nextValue = value?.trim();
  return nextValue || undefined;
}

function StockBadge({ product }: { product: Product }) {
  const threshold = product.pricingRule?.lowStockThreshold ?? 0;
  const tone = product.stock <= threshold ? 'danger' : product.stock <= threshold + 2 ? 'warning' : 'success';
  return <span className={`stock-badge ${tone}`}>{product.stock} uds</span>;
}

function StatusCard({
  icon,
  label,
  value,
  detail,
  tone = 'neutral',
  active = false,
  onClick
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'success' | 'danger';
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`status-card ${tone} ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </button>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="section-title">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}
