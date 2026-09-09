<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Banknote, CreditCard, PackageCheck, RefreshCw, ShoppingCart } from '@lucide/vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import { ApiError, apiFetch } from '@/core/api';
import { useAuthStore } from '@/core/auth.store';

type LoteInventario = {
  idLote: number;
  codigoLote: string;
  fechaEntrada: string;
  cantidadInicial: number;
  cantidadActual: number;
};

type TejaInventario = {
  idTeja: number;
  modelo: string;
  material: string;
  color: string;
  longitudCm: number;
  anchoCm: number;
  pesoKg: number;
  precioBase: number;
  stockGlobal: number;
  stockMinimo: number;
  requiereReorden: boolean;
  lotes: LoteInventario[];
};

type VentaPagada = {
  idPedido: number;
  idPago: number;
  estadoPedido: string;
  metodoPago: string;
  subtotal: number;
  impuestoIva: number;
  costoFlete: number;
  total: number;
  montoPagado: number;
  detalles: VentaDetalle[];
  stockAfectado: StockAfectado[];
};

type VentaDetalle = {
  idDetalle: number;
  idTeja: number;
  modeloTeja: string;
  cantidadSolicitada: number;
  precioUnitarioAplicado: number;
  subtotal: number;
};

type StockAfectado = {
  idTeja: number;
  modeloTeja: string;
  idLote: number;
  codigoLote: string;
  cantidadDescontada: number;
  stockLoteRestante: number;
  stockGlobalRestante: number;
};

type ClienteOption = {
  label: string;
  value: number;
  tipo: string;
};

type MetodoPagoOption = {
  label: string;
  value: 'Efectivo' | 'TarjetaCredito' | 'TarjetaDebito';
  icon: typeof Banknote;
};

const ivaRate = 0.16;
const authStore = useAuthStore();

const inventory = ref<TejaInventario[]>([]);
const saleResult = ref<VentaPagada | null>(null);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const form = reactive({
  idCliente: 1,
  idTeja: null as number | null,
  idLote: null as number | null,
  cantidad: 1,
  precioUnitario: null as number | null,
  costoFlete: 0,
  metodoPago: 'Efectivo' as MetodoPagoOption['value'],
  referenciaPago: '',
  pendienteTechoGrados: 0,
  metrosCuadradosCalculados: 1,
});

const clientes: ClienteOption[] = [
  { label: 'Constructora Norte SA de CV', value: 1, tipo: 'Mayorista' },
  { label: 'Distribuidora Techo Firme', value: 2, tipo: 'Distribuidor' },
];

const metodoPagoOptions: MetodoPagoOption[] = [
  { label: 'Efectivo', value: 'Efectivo', icon: Banknote },
  { label: 'Tarjeta de credito', value: 'TarjetaCredito', icon: CreditCard },
  { label: 'Tarjeta de debito', value: 'TarjetaDebito', icon: CreditCard },
];

const tileOptions = computed(() =>
  inventory.value.map((item) => ({
    label: `${item.modelo} | ${item.material} | ${item.color}`,
    value: item.idTeja,
  })),
);

const selectedTile = computed(() =>
  inventory.value.find((item) => item.idTeja === form.idTeja) ?? null,
);

const lotOptions = computed(() => [
  { label: 'Asignacion automatica FIFO', value: null },
  ...(selectedTile.value?.lotes ?? []).map((lot) => ({
    label: `${lot.codigoLote} | ${lot.cantidadActual.toLocaleString('es-MX')} disponibles`,
    value: lot.idLote,
  })),
]);

const selectedLot = computed(() =>
  selectedTile.value?.lotes.find((lot) => lot.idLote === form.idLote) ?? null,
);

const availableStock = computed(() =>
  selectedLot.value?.cantidadActual ?? selectedTile.value?.stockGlobal ?? 0,
);

const effectiveUnitPrice = computed(() => {
  if (form.precioUnitario !== null && form.precioUnitario >= 0) {
    return form.precioUnitario;
  }

  return selectedTile.value ? applyVolumeDiscount(selectedTile.value.precioBase, form.cantidad) : 0;
});

const subtotal = computed(() => roundMoney(effectiveUnitPrice.value * form.cantidad));
const tax = computed(() => roundMoney(subtotal.value * ivaRate));
const total = computed(() => roundMoney(subtotal.value + tax.value + form.costoFlete));
const selectedCustomer = computed(() => clientes.find((item) => item.value === form.idCliente));

const stockError = computed(() => {
  if (!selectedTile.value) {
    return 'Selecciona una teja.';
  }

  if (form.cantidad <= 0) {
    return 'La cantidad debe ser mayor a cero.';
  }

  if (form.cantidad > availableStock.value) {
    return 'La cantidad solicitada excede el stock disponible.';
  }

  return '';
});

const formError = computed(() => {
  if (!form.idCliente) {
    return 'Selecciona un cliente.';
  }

  if (stockError.value) {
    return stockError.value;
  }

  if (form.costoFlete < 0) {
    return 'El flete no puede ser negativo.';
  }

  if (form.pendienteTechoGrados < 0 || form.pendienteTechoGrados > 90) {
    return 'La pendiente debe estar entre 0 y 90 grados.';
  }

  if (form.metrosCuadradosCalculados <= 0) {
    return 'Los metros cuadrados deben ser mayores a cero.';
  }

  return '';
});

const canSubmit = computed(() => !formError.value && !saving.value);

watch(selectedTile, (tile) => {
  form.idLote = null;
  form.precioUnitario = tile?.precioBase ?? null;
});

onMounted(() => {
  void loadInventory();
});

async function loadInventory(): Promise<void> {
  loading.value = true;
  errorMessage.value = '';

  try {
    inventory.value = await apiFetch<TejaInventario[]>('/tejas', {}, authStore.accessToken ?? undefined);

    if (!form.idTeja && inventory.value.length > 0) {
      form.idTeja = inventory.value[0].idTeja;
      form.precioUnitario = inventory.value[0].precioBase;
    }
  } catch (error) {
    errorMessage.value = error instanceof ApiError
      ? error.message
      : 'No se pudo cargar el inventario para ventas.';
  } finally {
    loading.value = false;
  }
}

async function createSale(): Promise<void> {
  if (!canSubmit.value || !selectedTile.value) {
    return;
  }

  saving.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  saleResult.value = null;

  try {
    const result = await apiFetch<VentaPagada>(
      '/ventas',
      {
        method: 'POST',
        body: JSON.stringify({
          idCliente: form.idCliente,
          detalles: [
            {
              idTeja: form.idTeja,
              cantidad: form.cantidad,
              idLote: form.idLote,
              precioUnitario: effectiveUnitPrice.value,
              pendienteTechoGrados: form.pendienteTechoGrados,
              metrosCuadradosCalculados: form.metrosCuadradosCalculados,
            },
          ],
          metodoPago: form.metodoPago,
          montoPagado: total.value,
          costoFlete: form.costoFlete,
          referenciaPago: form.referenciaPago.trim() || null,
        }),
      },
      authStore.accessToken ?? undefined,
    );

    saleResult.value = result;
    successMessage.value = `Venta ${result.idPedido} pagada con ${paymentLabel(result.metodoPago)}.`;
    await loadInventory();
  } catch (error) {
    errorMessage.value = error instanceof ApiError
      ? error.message
      : 'No se pudo confirmar la venta.';
  } finally {
    saving.value = false;
  }
}

function applyVolumeDiscount(basePrice: number, quantity: number): number {
  const discount = quantity >= 5000
    ? 0.12
    : quantity >= 2500
      ? 0.08
      : quantity >= 1000
        ? 0.05
        : 0;

  return roundMoney(basePrice * (1 - discount));
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}

function paymentLabel(value: string): string {
  return metodoPagoOptions.find((item) => item.value === value)?.label ?? value;
}
</script>

<template>
  <section class="module-panel sales-module">
    <div class="section-heading">
      <div>
        <h2>Ventas</h2>
        <p>Captura pedidos pagados y descuenta inventario con pago en efectivo, credito o debito.</p>
      </div>
      <Button type="button" severity="secondary" outlined title="Actualizar stock" @click="loadInventory">
        <RefreshCw :size="17" aria-hidden="true" />
        <span>Stock</span>
      </Button>
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <Message v-if="successMessage" severity="success" :closable="false">{{ successMessage }}</Message>

    <div v-if="loading" class="loading-panel">
      <ProgressSpinner aria-label="Cargando datos de venta" />
    </div>

    <div v-else class="sales-layout">
      <form class="sales-form" @submit.prevent="createSale">
        <div class="form-section">
          <h3>Cliente y producto</h3>
          <div class="form-grid two-columns">
            <div class="field">
              <label for="customer-select">Cliente</label>
              <Select
                id="customer-select"
                v-model="form.idCliente"
                :options="clientes"
                option-label="label"
                option-value="value"
              />
              <small>{{ selectedCustomer?.tipo }}</small>
            </div>

            <div class="field">
              <label for="tile-select">Teja</label>
              <Select
                id="tile-select"
                v-model="form.idTeja"
                :options="tileOptions"
                option-label="label"
                option-value="value"
                filter
                placeholder="Selecciona una teja"
              />
            </div>

            <div class="field">
              <label for="lot-select">Lote</label>
              <Select
                id="lot-select"
                v-model="form.idLote"
                :options="lotOptions"
                option-label="label"
                option-value="value"
                placeholder="Asignacion automatica"
              />
            </div>

            <div class="field">
              <label for="quantity-input">Cantidad</label>
              <InputNumber id="quantity-input" v-model="form.cantidad" :min="1" show-buttons />
              <small>Disponible: {{ availableStock.toLocaleString('es-MX') }}</small>
              <small v-if="stockError && form.idTeja" class="error-text">{{ stockError }}</small>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Importes y pago</h3>
          <div class="form-grid two-columns">
            <div class="field">
              <label for="price-input">Precio unitario</label>
              <InputNumber
                id="price-input"
                v-model="form.precioUnitario"
                mode="currency"
                currency="MXN"
                locale="es-MX"
                :min="0"
              />
            </div>

            <div class="field">
              <label for="freight-input">Flete</label>
              <InputNumber
                id="freight-input"
                v-model="form.costoFlete"
                mode="currency"
                currency="MXN"
                locale="es-MX"
                :min="0"
              />
            </div>

            <div class="field">
              <label for="slope-input">Pendiente</label>
              <InputNumber
                id="slope-input"
                v-model="form.pendienteTechoGrados"
                suffix=" grados"
                :min="0"
                :max="90"
              />
            </div>

            <div class="field">
              <label for="area-input">Area calculada</label>
              <InputNumber
                id="area-input"
                v-model="form.metrosCuadradosCalculados"
                suffix=" m2"
                :min="0.01"
                :min-fraction-digits="2"
                :max-fraction-digits="2"
              />
            </div>

            <div class="field">
              <label for="payment-select">Metodo de pago</label>
              <Select
                id="payment-select"
                v-model="form.metodoPago"
                :options="metodoPagoOptions"
                option-label="label"
                option-value="value"
              >
                <template #option="{ option }: { option: MetodoPagoOption }">
                  <div class="select-option">
                    <component :is="option.icon" :size="16" aria-hidden="true" />
                    <span>{{ option.label }}</span>
                  </div>
                </template>
              </Select>
            </div>

            <div class="field">
              <label for="reference-input">Referencia</label>
              <InputText id="reference-input" v-model="form.referenciaPago" placeholder="Opcional" />
            </div>
          </div>
        </div>

        <Message v-if="formError" severity="warn" :closable="false">{{ formError }}</Message>

        <div class="form-actions">
          <Button type="submit" :disabled="!canSubmit">
            <ShoppingCart :size="17" aria-hidden="true" />
            <span>{{ saving ? 'Confirmando' : 'Confirmar venta' }}</span>
          </Button>
        </div>
      </form>

      <aside class="summary-panel">
        <h3>Resumen</h3>
        <div class="availability-box">
          <PackageCheck :size="20" aria-hidden="true" />
          <div>
            <span>Disponibilidad</span>
            <strong>{{ availableStock.toLocaleString('es-MX') }}</strong>
          </div>
          <Tag
            :severity="stockError ? 'danger' : 'success'"
            :value="stockError ? 'Revisar' : 'Listo'"
          />
        </div>

        <dl class="totals-list">
          <div>
            <dt>Precio unitario</dt>
            <dd>{{ formatCurrency(effectiveUnitPrice) }}</dd>
          </div>
          <div>
            <dt>Subtotal</dt>
            <dd>{{ formatCurrency(subtotal) }}</dd>
          </div>
          <div>
            <dt>IVA</dt>
            <dd>{{ formatCurrency(tax) }}</dd>
          </div>
          <div>
            <dt>Flete</dt>
            <dd>{{ formatCurrency(form.costoFlete) }}</dd>
          </div>
          <div class="total-row">
            <dt>Total a pagar</dt>
            <dd>{{ formatCurrency(total) }}</dd>
          </div>
        </dl>

        <div class="payment-strip">
          <component
            :is="metodoPagoOptions.find((item) => item.value === form.metodoPago)?.icon"
            :size="18"
            aria-hidden="true"
          />
          <span>{{ paymentLabel(form.metodoPago) }}</span>
          <strong>{{ formatCurrency(total) }}</strong>
        </div>
      </aside>
    </div>

    <section v-if="saleResult" class="result-panel">
      <div class="section-heading">
        <div>
          <h3>Venta {{ saleResult.idPedido }}</h3>
          <p>Pago {{ saleResult.idPago }} | {{ paymentLabel(saleResult.metodoPago) }} | {{ saleResult.estadoPedido }}</p>
        </div>
        <Tag severity="success" value="Pagado" />
      </div>

      <DataTable :value="saleResult.stockAfectado" data-key="idLote" responsive-layout="scroll">
        <Column field="modeloTeja" header="Modelo" />
        <Column field="codigoLote" header="Lote" />
        <Column field="cantidadDescontada" header="Descontado" />
        <Column field="stockLoteRestante" header="Stock lote" />
        <Column field="stockGlobalRestante" header="Stock global" />
      </DataTable>
    </section>
  </section>
</template>
