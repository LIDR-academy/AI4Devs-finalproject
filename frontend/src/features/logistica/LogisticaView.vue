<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ClipboardCheck, PackageCheck, RefreshCw, Truck } from '@lucide/vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { ApiError, apiFetch } from '@/core/api';
import { useAuthStore } from '@/core/auth.store';

type DetallePendienteEntrega = {
  idDetallePedido: number;
  idTeja: number;
  modeloTeja: string;
  cantidadSolicitada: number;
  cantidadDespachada: number;
  cantidadPendiente: number;
};

type PedidoPendienteEntrega = {
  idPedido: number;
  idCliente: number;
  cliente: string;
  estadoPedido: string;
  total: number;
  cantidadSolicitada: number;
  cantidadDespachada: number;
  cantidadPendiente: number;
  detalles: DetallePendienteEntrega[];
};

type Remision = {
  idRemision: number;
  idDetallePedido: number;
  idTeja: number;
  modeloTeja: string;
  cantidadEnviada: number;
  cantidadSolicitada: number;
  cantidadDespachada: number;
  cantidadPendiente: number;
  firmaRecibido: string;
  fechaRegistro: string;
};

type Despacho = {
  idDespacho: number;
  idPedido: number;
  estadoPedido: string;
  tipoCamion: string;
  pesoTotalCargaKg: number;
  placasVehiculo: string;
  direccionEntrega: string;
  indicacionesDescarga: string;
  fechaSalida: string | null;
  estadoEntrega: string;
  remisiones: Remision[];
};

type TruckOption = {
  label: string;
  value: 'Pickup' | 'TresYMedia' | 'Torton' | 'Plataforma' | 'Grua';
};

const authStore = useAuthStore();
const pendingOrders = ref<PedidoPendienteEntrega[]>([]);
const selectedOrderId = ref<number | null>(null);
const dispatchResult = ref<Despacho | null>(null);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const form = reactive({
  tipoCamion: 'Pickup' as TruckOption['value'],
  pesoTotalCargaKg: 1000,
  placasVehiculo: '',
  direccionEntrega: '',
  indicacionesDescarga: '',
  firmaRecibido: '',
  cantidades: {} as Record<number, number>,
});

const truckOptions: TruckOption[] = [
  { label: 'Pickup', value: 'Pickup' },
  { label: '3.5 toneladas', value: 'TresYMedia' },
  { label: 'Torton', value: 'Torton' },
  { label: 'Plataforma', value: 'Plataforma' },
  { label: 'Grua', value: 'Grua' },
];

const orderOptions = computed(() =>
  pendingOrders.value.map((order) => ({
    label: `Pedido ${order.idPedido} | ${order.cliente} | ${order.cantidadPendiente} pendientes`,
    value: order.idPedido,
  })),
);

const selectedOrder = computed(() =>
  pendingOrders.value.find((order) => order.idPedido === selectedOrderId.value) ?? null,
);

const totalToShip = computed(() =>
  Object.values(form.cantidades).reduce((total, quantity) => total + (quantity || 0), 0),
);

const dispatchLines = computed(() =>
  selectedOrder.value?.detalles.map((detail) => ({
    ...detail,
    cantidadEnviada: form.cantidades[detail.idDetallePedido] ?? 0,
  })) ?? [],
);

const formError = computed(() => {
  if (!selectedOrder.value) {
    return 'Selecciona un pedido pendiente.';
  }

  if (form.pesoTotalCargaKg <= 0) {
    return 'El peso total de carga debe ser mayor a cero.';
  }

  if (!form.placasVehiculo.trim()) {
    return 'Las placas del vehiculo son obligatorias.';
  }

  if (!form.direccionEntrega.trim()) {
    return 'La direccion de entrega es obligatoria.';
  }

  if (totalToShip.value <= 0) {
    return 'Captura al menos una cantidad a enviar.';
  }

  const invalidLine = dispatchLines.value.find((line) =>
    line.cantidadEnviada < 0 || line.cantidadEnviada > line.cantidadPendiente,
  );

  if (invalidLine) {
    return `La cantidad para ${invalidLine.modeloTeja} excede el saldo pendiente.`;
  }

  return '';
});

const canSubmit = computed(() => !formError.value && !saving.value);

watch(selectedOrder, (order) => {
  form.cantidades = {};
  form.direccionEntrega = order ? `Entrega cliente ${order.cliente}` : '';
  dispatchResult.value = null;
});

onMounted(() => {
  void loadPendingOrders();
});

async function loadPendingOrders(): Promise<void> {
  loading.value = true;
  errorMessage.value = '';

  try {
    pendingOrders.value = await apiFetch<PedidoPendienteEntrega[]>(
      '/logistica/pedidos-pendientes',
      {},
      authStore.accessToken ?? undefined,
    );

    if (!selectedOrderId.value && pendingOrders.value.length > 0) {
      selectedOrderId.value = pendingOrders.value[0].idPedido;
    }
  } catch (error) {
    errorMessage.value = error instanceof ApiError
      ? error.message
      : 'No se pudieron cargar los pedidos pendientes.';
  } finally {
    loading.value = false;
  }
}

async function createDispatch(): Promise<void> {
  if (!canSubmit.value || !selectedOrder.value) {
    return;
  }

  saving.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  dispatchResult.value = null;

  try {
    const remisiones = dispatchLines.value
      .filter((line) => line.cantidadEnviada > 0)
      .map((line) => ({
        idDetallePedido: line.idDetallePedido,
        cantidadEnviada: line.cantidadEnviada,
        firmaRecibido: form.firmaRecibido.trim() || null,
      }));

    const result = await apiFetch<Despacho>(
      '/logistica/despachos',
      {
        method: 'POST',
        body: JSON.stringify({
          idPedido: selectedOrder.value.idPedido,
          tipoCamion: form.tipoCamion,
          pesoTotalCargaKg: form.pesoTotalCargaKg,
          placasVehiculo: form.placasVehiculo.trim(),
          direccionEntrega: form.direccionEntrega.trim(),
          indicacionesDescarga: form.indicacionesDescarga.trim(),
          remisiones,
        }),
      },
      authStore.accessToken ?? undefined,
    );

    dispatchResult.value = result;
    successMessage.value = `Despacho ${result.idDespacho} registrado para pedido ${result.idPedido}.`;
    await loadPendingOrders();
  } catch (error) {
    errorMessage.value = error instanceof ApiError
      ? error.message
      : 'No se pudo registrar el despacho.';
  } finally {
    saving.value = false;
  }
}

function fillPendingQuantities(): void {
  if (!selectedOrder.value) {
    return;
  }

  form.cantidades = Object.fromEntries(
    selectedOrder.value.detalles.map((detail) => [detail.idDetallePedido, detail.cantidadPendiente]),
  );
}

function clearQuantities(): void {
  form.cantidades = {};
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}
</script>

<template>
  <section class="module-panel logistics-module">
    <div class="section-heading">
      <div>
        <h2>Logistica</h2>
        <p>Controla despachos parciales, saldos por surtir, remisiones, camion e instrucciones de descarga.</p>
      </div>
      <Button type="button" severity="secondary" outlined title="Actualizar pendientes" @click="loadPendingOrders">
        <RefreshCw :size="17" aria-hidden="true" />
        <span>Pendientes</span>
      </Button>
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <Message v-if="successMessage" severity="success" :closable="false">{{ successMessage }}</Message>

    <div v-if="loading" class="loading-panel">
      <ProgressSpinner aria-label="Cargando pedidos pendientes" />
    </div>

    <div v-else class="logistics-layout">
      <form class="dispatch-form" @submit.prevent="createDispatch">
        <div class="form-section">
          <h3>Pedido y transporte</h3>
          <div class="form-grid two-columns">
            <div class="field">
              <label for="pending-order">Pedido pendiente</label>
              <Select
                id="pending-order"
                v-model="selectedOrderId"
                :options="orderOptions"
                option-label="label"
                option-value="value"
                filter
                placeholder="Selecciona un pedido"
              />
            </div>

            <div class="field">
              <label for="truck-type">Camion</label>
              <Select
                id="truck-type"
                v-model="form.tipoCamion"
                :options="truckOptions"
                option-label="label"
                option-value="value"
              />
            </div>

            <div class="field">
              <label for="weight-input">Peso de carga</label>
              <InputNumber
                id="weight-input"
                v-model="form.pesoTotalCargaKg"
                suffix=" kg"
                :min="0.01"
                :min-fraction-digits="2"
                :max-fraction-digits="2"
              />
            </div>

            <div class="field">
              <label for="plates-input">Placas</label>
              <InputText id="plates-input" v-model="form.placasVehiculo" placeholder="ABC-123-A" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Entrega</h3>
          <div class="form-grid">
            <div class="field">
              <label for="address-input">Direccion</label>
              <InputText id="address-input" v-model="form.direccionEntrega" />
            </div>

            <div class="field">
              <label for="notes-input">Indicaciones de descarga</label>
              <Textarea
                id="notes-input"
                v-model="form.indicacionesDescarga"
                rows="3"
                auto-resize
                placeholder="Acceso, horario, contacto o maniobras especiales"
              />
            </div>

            <div class="field">
              <label for="signature-input">Firma recibido</label>
              <InputText id="signature-input" v-model="form.firmaRecibido" placeholder="Opcional" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="inline-heading">
            <h3>Remisiones parciales</h3>
            <div>
              <Button type="button" severity="secondary" text @click="fillPendingQuantities">Todo</Button>
              <Button type="button" severity="secondary" text @click="clearQuantities">Limpiar</Button>
            </div>
          </div>

          <DataTable :value="dispatchLines" data-key="idDetallePedido" responsive-layout="scroll">
            <Column field="modeloTeja" header="Modelo" />
            <Column field="cantidadSolicitada" header="Solicitado" />
            <Column field="cantidadDespachada" header="Despachado" />
            <Column field="cantidadPendiente" header="Pendiente" />
            <Column header="Enviar" style="width: 12rem">
              <template #body="{ data }: { data: DetallePendienteEntrega & { cantidadEnviada: number } }">
                <InputNumber
                  v-model="form.cantidades[data.idDetallePedido]"
                  :min="0"
                  :max="data.cantidadPendiente"
                  show-buttons
                  input-class="quantity-cell-input"
                />
              </template>
            </Column>
          </DataTable>
        </div>

        <Message v-if="formError" severity="warn" :closable="false">{{ formError }}</Message>

        <div class="form-actions">
          <Button type="submit" :disabled="!canSubmit">
            <Truck :size="17" aria-hidden="true" />
            <span>{{ saving ? 'Registrando' : 'Registrar despacho' }}</span>
          </Button>
        </div>
      </form>

      <aside class="dispatch-summary">
        <h3>Saldo del pedido</h3>
        <div v-if="selectedOrder" class="dispatch-card">
          <ClipboardCheck :size="20" aria-hidden="true" />
          <div>
            <strong>Pedido {{ selectedOrder.idPedido }}</strong>
            <span>{{ selectedOrder.cliente }}</span>
          </div>
          <Tag
            :severity="selectedOrder.estadoPedido === 'Parcial' ? 'warning' : 'info'"
            :value="selectedOrder.estadoPedido"
          />
        </div>

        <dl v-if="selectedOrder" class="totals-list">
          <div>
            <dt>Total venta</dt>
            <dd>{{ formatCurrency(selectedOrder.total) }}</dd>
          </div>
          <div>
            <dt>Solicitado</dt>
            <dd>{{ selectedOrder.cantidadSolicitada.toLocaleString('es-MX') }}</dd>
          </div>
          <div>
            <dt>Despachado</dt>
            <dd>{{ selectedOrder.cantidadDespachada.toLocaleString('es-MX') }}</dd>
          </div>
          <div>
            <dt>Pendiente</dt>
            <dd>{{ selectedOrder.cantidadPendiente.toLocaleString('es-MX') }}</dd>
          </div>
          <div class="total-row">
            <dt>Este envio</dt>
            <dd>{{ totalToShip.toLocaleString('es-MX') }}</dd>
          </div>
        </dl>

        <div v-if="!selectedOrder" class="empty-state">
          <PackageCheck :size="24" aria-hidden="true" />
          <span>No hay pedidos pendientes por despachar.</span>
        </div>
      </aside>
    </div>

    <section v-if="dispatchResult" class="result-panel">
      <div class="section-heading">
        <div>
          <h3>Despacho {{ dispatchResult.idDespacho }}</h3>
          <p>Pedido {{ dispatchResult.idPedido }} | {{ dispatchResult.tipoCamion }} | {{ dispatchResult.estadoEntrega }}</p>
        </div>
        <Tag
          :severity="dispatchResult.estadoPedido === 'Despachado' ? 'success' : 'warning'"
          :value="dispatchResult.estadoPedido"
        />
      </div>

      <DataTable :value="dispatchResult.remisiones" data-key="idRemision" responsive-layout="scroll">
        <Column field="modeloTeja" header="Modelo" />
        <Column field="cantidadEnviada" header="Enviado" />
        <Column field="cantidadDespachada" header="Despachado" />
        <Column field="cantidadPendiente" header="Pendiente" />
        <Column field="firmaRecibido" header="Firma" />
      </DataTable>
    </section>
  </section>
</template>
