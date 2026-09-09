<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Calculator, FileCheck2, RefreshCw, Ruler, Truck } from '@lucide/vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import { ApiError, apiFetch } from '@/core/api';
import { useAuthStore } from '@/core/auth.store';

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
};

type CotizacionResponse = {
  idPedido: number;
  idCliente: number;
  idTeja: number;
  modeloTeja: string;
  metrosBaseTecho: number;
  gradosPendiente: number;
  metrosCuadradosCalculados: number;
  cantidadTejasNeta: number;
  cantidadTejasConMerma: number;
  margenMermaPorcentaje: number;
  pesoTotalCargaKg: number;
  pesoTotalCargaToneladas: number;
  tipoCamionSugerido: string;
  precioUnitarioAplicado: number;
  subtotal: number;
  costoFlete: number;
  impuestoIva: number;
  total: number;
};

type ClienteOption = {
  label: string;
  value: number;
  tipo: string;
};

const authStore = useAuthStore();
const inventory = ref<TejaInventario[]>([]);
const quote = ref<CotizacionResponse | null>(null);
const loading = ref(false);
const calculating = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const form = reactive({
  idCliente: 1,
  idTeja: null as number | null,
  metrosBaseTecho: 100,
  gradosPendiente: 15,
  margenMermaPorcentaje: 10,
});

const clientes: ClienteOption[] = [
  { label: 'Constructora Norte SA de CV', value: 1, tipo: 'Mayorista' },
  { label: 'Distribuidora Techo Firme', value: 2, tipo: 'Distribuidor' },
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

const selectedCustomer = computed(() =>
  clientes.find((item) => item.value === form.idCliente),
);

const localSurfacePreview = computed(() => {
  if (form.metrosBaseTecho <= 0 || form.gradosPendiente < 0 || form.gradosPendiente >= 90) {
    return 0;
  }

  const radians = form.gradosPendiente * Math.PI / 180;
  return Math.round((form.metrosBaseTecho / Math.cos(radians) + Number.EPSILON) * 100) / 100;
});

const formError = computed(() => {
  if (!form.idCliente) {
    return 'Selecciona un cliente.';
  }

  if (!form.idTeja) {
    return 'Selecciona una teja.';
  }

  if (form.metrosBaseTecho <= 0) {
    return 'El area base debe ser mayor a cero.';
  }

  if (form.gradosPendiente < 0 || form.gradosPendiente >= 90) {
    return 'La pendiente debe estar entre 0 y menos de 90 grados.';
  }

  if (form.margenMermaPorcentaje < 0 || form.margenMermaPorcentaje > 25) {
    return 'La merma debe estar entre 0% y 25%.';
  }

  return '';
});

const canCalculate = computed(() => !formError.value && !calculating.value);

const resultRows = computed(() => quote.value
  ? [
      { label: 'Area real', value: `${quote.value.metrosCuadradosCalculados.toLocaleString('es-MX')} m2` },
      { label: 'Piezas netas', value: quote.value.cantidadTejasNeta.toLocaleString('es-MX') },
      { label: 'Piezas con merma', value: quote.value.cantidadTejasConMerma.toLocaleString('es-MX') },
      { label: 'Peso total', value: `${quote.value.pesoTotalCargaKg.toLocaleString('es-MX')} kg` },
      { label: 'Camion sugerido', value: quote.value.tipoCamionSugerido },
    ]
  : []);

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
    }
  } catch (error) {
    errorMessage.value = error instanceof ApiError
      ? error.message
      : 'No se pudo cargar el catalogo de tejas.';
  } finally {
    loading.value = false;
  }
}

async function createQuote(): Promise<void> {
  if (!canCalculate.value) {
    return;
  }

  calculating.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  quote.value = null;

  try {
    quote.value = await apiFetch<CotizacionResponse>(
      '/ventas/cotizar',
      {
        method: 'POST',
        body: JSON.stringify({
          idCliente: form.idCliente,
          idTeja: form.idTeja,
          metrosBaseTecho: form.metrosBaseTecho,
          gradosPendiente: form.gradosPendiente,
          margenMermaPorcentaje: form.margenMermaPorcentaje,
        }),
      },
      authStore.accessToken ?? undefined,
    );

    successMessage.value = `Cotizacion ${quote.value.idPedido} generada para ${quote.value.modeloTeja}.`;
  } catch (error) {
    errorMessage.value = error instanceof ApiError
      ? error.message
      : 'No se pudo generar la cotizacion.';
  } finally {
    calculating.value = false;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}
</script>

<template>
  <section class="module-panel quotation-module">
    <div class="section-heading">
      <div>
        <h2>Cotizaciones arquitectonicas</h2>
        <p>Calcula area real, piezas, margen de merma, carga, flete sugerido e importe total.</p>
      </div>
      <Button type="button" severity="secondary" outlined title="Actualizar catalogo" @click="loadInventory">
        <RefreshCw :size="17" aria-hidden="true" />
        <span>Catalogo</span>
      </Button>
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <Message v-if="successMessage" severity="success" :closable="false">{{ successMessage }}</Message>

    <div v-if="loading" class="loading-panel">
      <ProgressSpinner aria-label="Cargando catalogo" />
    </div>

    <div v-else class="quotation-layout">
      <form class="quotation-form" @submit.prevent="createQuote">
        <div class="form-section">
          <h3>Datos del proyecto</h3>
          <div class="form-grid two-columns">
            <div class="field">
              <label for="quote-customer">Cliente</label>
              <Select
                id="quote-customer"
                v-model="form.idCliente"
                :options="clientes"
                option-label="label"
                option-value="value"
              />
              <small>{{ selectedCustomer?.tipo }}</small>
            </div>

            <div class="field">
              <label for="quote-tile">Teja</label>
              <Select
                id="quote-tile"
                v-model="form.idTeja"
                :options="tileOptions"
                option-label="label"
                option-value="value"
                filter
                placeholder="Selecciona una teja"
              />
            </div>

            <div class="field">
              <label for="base-area">Area base</label>
              <InputNumber
                id="base-area"
                v-model="form.metrosBaseTecho"
                suffix=" m2"
                :min="0.01"
                :min-fraction-digits="2"
                :max-fraction-digits="2"
              />
            </div>

            <div class="field">
              <label for="slope">Pendiente</label>
              <InputNumber
                id="slope"
                v-model="form.gradosPendiente"
                suffix=" grados"
                :min="0"
                :max="89.99"
                :min-fraction-digits="2"
                :max-fraction-digits="2"
              />
            </div>

            <div class="field">
              <label for="waste">Margen de merma</label>
              <InputNumber
                id="waste"
                v-model="form.margenMermaPorcentaje"
                suffix=" %"
                :min="0"
                :max="25"
                :min-fraction-digits="2"
                :max-fraction-digits="2"
              />
            </div>

            <div class="field preview-field">
              <label>Area real estimada</label>
              <strong>{{ localSurfacePreview.toLocaleString('es-MX') }} m2</strong>
              <small>Vista previa antes de guardar la cotizacion.</small>
            </div>
          </div>
        </div>

        <Message v-if="formError" severity="warn" :closable="false">{{ formError }}</Message>

        <div class="form-actions">
          <Button type="submit" :disabled="!canCalculate">
            <Calculator :size="17" aria-hidden="true" />
            <span>{{ calculating ? 'Calculando' : 'Generar cotizacion' }}</span>
          </Button>
        </div>
      </form>

      <aside class="quotation-summary">
        <h3>Teja seleccionada</h3>
        <div v-if="selectedTile" class="tile-summary">
          <Ruler :size="20" aria-hidden="true" />
          <div>
            <strong>{{ selectedTile.modelo }}</strong>
            <span>{{ selectedTile.material }} | {{ selectedTile.color }}</span>
          </div>
          <Tag
            :severity="selectedTile.requiereReorden ? 'danger' : 'success'"
            :value="selectedTile.requiereReorden ? 'Reorden' : 'Disponible'"
          />
        </div>
        <dl v-if="selectedTile" class="totals-list">
          <div>
            <dt>Medidas</dt>
            <dd>{{ selectedTile.longitudCm }} x {{ selectedTile.anchoCm }} cm</dd>
          </div>
          <div>
            <dt>Peso pieza</dt>
            <dd>{{ selectedTile.pesoKg }} kg</dd>
          </div>
          <div>
            <dt>Precio base</dt>
            <dd>{{ formatCurrency(selectedTile.precioBase) }}</dd>
          </div>
          <div>
            <dt>Stock global</dt>
            <dd>{{ selectedTile.stockGlobal.toLocaleString('es-MX') }}</dd>
          </div>
        </dl>
      </aside>
    </div>

    <section v-if="quote" class="result-panel quote-result">
      <div class="section-heading">
        <div>
          <h3>Cotizacion {{ quote.idPedido }}</h3>
          <p>{{ quote.modeloTeja }} | {{ quote.margenMermaPorcentaje }}% merma | {{ quote.gradosPendiente }} grados</p>
        </div>
        <Tag severity="info" value="Cotizacion" />
      </div>

      <div class="quote-kpis">
        <div>
          <FileCheck2 :size="20" aria-hidden="true" />
          <span>Total</span>
          <strong>{{ formatCurrency(quote.total) }}</strong>
        </div>
        <div>
          <Truck :size="20" aria-hidden="true" />
          <span>Flete</span>
          <strong>{{ quote.tipoCamionSugerido }}</strong>
        </div>
        <div>
          <Ruler :size="20" aria-hidden="true" />
          <span>Carga</span>
          <strong>{{ quote.pesoTotalCargaToneladas }} t</strong>
        </div>
      </div>

      <div class="result-grid">
        <DataTable :value="resultRows" responsive-layout="scroll" class="compact-table">
          <Column field="label" header="Concepto" />
          <Column field="value" header="Valor" />
        </DataTable>

        <dl class="totals-list">
          <div>
            <dt>Precio unitario</dt>
            <dd>{{ formatCurrency(quote.precioUnitarioAplicado) }}</dd>
          </div>
          <div>
            <dt>Subtotal</dt>
            <dd>{{ formatCurrency(quote.subtotal) }}</dd>
          </div>
          <div>
            <dt>IVA</dt>
            <dd>{{ formatCurrency(quote.impuestoIva) }}</dd>
          </div>
          <div>
            <dt>Flete</dt>
            <dd>{{ formatCurrency(quote.costoFlete) }}</dd>
          </div>
          <div class="total-row">
            <dt>Total</dt>
            <dd>{{ formatCurrency(quote.total) }}</dd>
          </div>
        </dl>
      </div>

      <div class="handoff-note">
        <FileCheck2 :size="18" aria-hidden="true" />
        <span>Lista para convertirse en venta mediante el pago del pedido {{ quote.idPedido }}.</span>
      </div>
    </section>
  </section>
</template>
