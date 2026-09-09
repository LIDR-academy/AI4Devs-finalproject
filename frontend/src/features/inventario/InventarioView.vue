<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { AlertTriangle, Boxes, RefreshCw, Search, Trash2 } from '@lucide/vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
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

type MermaRegistrada = {
  idMerma: number;
  idLote: number;
  codigoLote: string;
  idTeja: number;
  cantidadRotas: number;
  stockLoteRestante: number;
  stockGlobalRestante: number;
  motivo: string;
  fechaRegistro: string;
};

type Option = {
  label: string;
  value: string | boolean | null;
};

const authStore = useAuthStore();

const inventory = ref<TejaInventario[]>([]);
const expandedRows = ref<Record<string, boolean>>({});
const loading = ref(false);
const savingMerma = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const mermaDialogVisible = ref(false);
const selectedTile = ref<TejaInventario | null>(null);
const selectedLot = ref<LoteInventario | null>(null);

const filters = reactive({
  material: null as string | null,
  color: '',
  soloBajoStock: null as boolean | null,
});

const mermaForm = reactive({
  idLote: null as number | null,
  cantidadRotas: null as number | null,
  motivo: '',
});

const materialOptions: Option[] = [
  { label: 'Todos', value: null },
  { label: 'Barro', value: 'Barro' },
  { label: 'Concreto', value: 'Concreto' },
  { label: 'Cemento', value: 'Cemento' },
  { label: 'Policarbonato', value: 'Policarbonato' },
  { label: 'Fibrocemento', value: 'Fibrocemento' },
];

const stockOptions: Option[] = [
  { label: 'Todos', value: null },
  { label: 'Bajo minimo', value: true },
  { label: 'Disponible', value: false },
];

const canRegisterMerma = computed(() => authStore.hasAnyRole(['Admin', 'Almacenista']));

const totalStock = computed(() =>
  inventory.value.reduce((total, item) => total + item.stockGlobal, 0),
);

const lowStockCount = computed(() => inventory.value.filter((item) => item.requiereReorden).length);

const totalLots = computed(() =>
  inventory.value.reduce((total, item) => total + item.lotes.length, 0),
);

const colorOptions = computed<Option[]>(() => {
  const colors = Array.from(new Set(inventory.value.map((item) => item.color))).sort();
  return [
    { label: 'Todos', value: '' },
    ...colors.map((color) => ({ label: color, value: color })),
  ];
});

const selectedLotAvailable = computed(() => selectedLot.value?.cantidadActual ?? 0);

const mermaQuantityError = computed(() => {
  if (!mermaForm.cantidadRotas) {
    return 'La cantidad es obligatoria.';
  }

  if (mermaForm.cantidadRotas <= 0) {
    return 'La cantidad debe ser mayor a cero.';
  }

  if (selectedLot.value && mermaForm.cantidadRotas > selectedLot.value.cantidadActual) {
    return 'La cantidad no puede superar el stock actual del lote.';
  }

  return '';
});

const mermaFormIsValid = computed(() =>
  Boolean(mermaForm.idLote && mermaForm.motivo.trim() && !mermaQuantityError.value),
);

onMounted(() => {
  void loadInventory();
});

async function loadInventory(): Promise<void> {
  loading.value = true;
  errorMessage.value = '';

  try {
    const query = new URLSearchParams();
    if (filters.material) {
      query.set('material', filters.material);
    }
    if (filters.color.trim()) {
      query.set('color', filters.color.trim());
    }
    if (filters.soloBajoStock !== null) {
      query.set('soloBajoStock', String(filters.soloBajoStock));
    }

    const path = query.size ? `/tejas?${query.toString()}` : '/tejas';
    inventory.value = await apiFetch<TejaInventario[]>(path, {}, authStore.accessToken ?? undefined);
  } catch (error) {
    errorMessage.value = error instanceof ApiError
      ? error.message
      : 'No se pudo cargar el inventario.';
  } finally {
    loading.value = false;
  }
}

function clearFilters(): void {
  filters.material = null;
  filters.color = '';
  filters.soloBajoStock = null;
  void loadInventory();
}

function openMermaDialog(tile: TejaInventario, lot?: LoteInventario): void {
  selectedTile.value = tile;
  selectedLot.value = lot ?? tile.lotes.find((item) => item.cantidadActual > 0) ?? null;
  mermaForm.idLote = selectedLot.value?.idLote ?? null;
  mermaForm.cantidadRotas = null;
  mermaForm.motivo = '';
  errorMessage.value = '';
  successMessage.value = '';
  mermaDialogVisible.value = true;
}

function selectMermaLot(idLote: number): void {
  const lot = selectedTile.value?.lotes.find((item) => item.idLote === idLote) ?? null;
  selectedLot.value = lot;
  mermaForm.idLote = lot?.idLote ?? null;
}

async function submitMerma(): Promise<void> {
  if (!mermaFormIsValid.value) {
    return;
  }

  savingMerma.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const result = await apiFetch<MermaRegistrada>(
      '/inventario/mermas',
      {
        method: 'POST',
        body: JSON.stringify({
          idLote: mermaForm.idLote,
          cantidadRotas: mermaForm.cantidadRotas,
          motivo: mermaForm.motivo.trim(),
        }),
      },
      authStore.accessToken ?? undefined,
    );

    successMessage.value = `Merma ${result.idMerma} registrada para el lote ${result.codigoLote}.`;
    mermaDialogVisible.value = false;
    await loadInventory();
  } catch (error) {
    errorMessage.value = error instanceof ApiError
      ? error.message
      : 'No se pudo registrar la merma.';
  } finally {
    savingMerma.value = false;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}
</script>

<template>
  <section class="module-panel inventory-module">
    <div class="section-heading">
      <div>
        <h2>Inventario por lotes</h2>
        <p>Consulta existencias por modelo, material, color y lote de produccion.</p>
      </div>
      <Button type="button" severity="secondary" outlined title="Actualizar inventario" @click="loadInventory">
        <RefreshCw :size="17" aria-hidden="true" />
        <span>Actualizar</span>
      </Button>
    </div>

    <div class="metric-strip">
      <div class="metric-item">
        <Boxes :size="20" aria-hidden="true" />
        <span>Stock global</span>
        <strong>{{ totalStock.toLocaleString('es-MX') }}</strong>
      </div>
      <div class="metric-item">
        <AlertTriangle :size="20" aria-hidden="true" />
        <span>Bajo minimo</span>
        <strong>{{ lowStockCount }}</strong>
      </div>
      <div class="metric-item">
        <Boxes :size="20" aria-hidden="true" />
        <span>Lotes activos</span>
        <strong>{{ totalLots }}</strong>
      </div>
    </div>

    <div class="toolbar-surface">
      <div class="filter-field">
        <label for="material-filter">Material</label>
        <Select
          id="material-filter"
          v-model="filters.material"
          :options="materialOptions"
          option-label="label"
          option-value="value"
          placeholder="Todos"
        />
      </div>
      <div class="filter-field">
        <label for="color-filter">Color</label>
        <Select
          id="color-filter"
          v-model="filters.color"
          :options="colorOptions"
          option-label="label"
          option-value="value"
          editable
          placeholder="Todos"
        />
      </div>
      <div class="filter-field">
        <label for="stock-filter">Stock</label>
        <Select
          id="stock-filter"
          v-model="filters.soloBajoStock"
          :options="stockOptions"
          option-label="label"
          option-value="value"
          placeholder="Todos"
        />
      </div>
      <div class="toolbar-actions">
        <Button type="button" title="Aplicar filtros" @click="loadInventory">
          <Search :size="17" aria-hidden="true" />
          <span>Filtrar</span>
        </Button>
        <Button type="button" severity="secondary" outlined title="Limpiar filtros" @click="clearFilters">
          Limpiar
        </Button>
      </div>
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <Message v-if="successMessage" severity="success" :closable="false">{{ successMessage }}</Message>

    <div v-if="loading" class="loading-panel">
      <ProgressSpinner aria-label="Cargando inventario" />
    </div>

    <DataTable
      v-else
      v-model:expanded-rows="expandedRows"
      :value="inventory"
      data-key="idTeja"
      striped-rows
      show-gridlines
      responsive-layout="scroll"
      class="inventory-table"
      empty-message="No hay tejas que coincidan con los filtros."
    >
      <Column expander style="width: 3rem" />
      <Column field="modelo" header="Modelo" sortable />
      <Column field="material" header="Material" sortable />
      <Column field="color" header="Color" sortable />
      <Column header="Medidas">
        <template #body="{ data }: { data: TejaInventario }">
          {{ data.longitudCm }} x {{ data.anchoCm }} cm
        </template>
      </Column>
      <Column header="Peso">
        <template #body="{ data }: { data: TejaInventario }">
          {{ data.pesoKg }} kg
        </template>
      </Column>
      <Column header="Precio base">
        <template #body="{ data }: { data: TejaInventario }">
          {{ formatCurrency(data.precioBase) }}
        </template>
      </Column>
      <Column field="stockGlobal" header="Stock" sortable />
      <Column header="Estado">
        <template #body="{ data }: { data: TejaInventario }">
          <Tag
            :severity="data.requiereReorden ? 'danger' : 'success'"
            :value="data.requiereReorden ? 'Reorden' : 'Disponible'"
          />
        </template>
      </Column>
      <Column header="Acciones" style="width: 10rem">
        <template #body="{ data }: { data: TejaInventario }">
          <Button
            v-if="canRegisterMerma"
            type="button"
            severity="danger"
            text
            title="Registrar merma"
            :disabled="data.stockGlobal <= 0"
            @click="openMermaDialog(data)"
          >
            <Trash2 :size="17" aria-hidden="true" />
            <span>Merma</span>
          </Button>
        </template>
      </Column>

      <template #expansion="{ data }: { data: TejaInventario }">
        <div class="lot-panel">
          <DataTable :value="data.lotes" data-key="idLote" responsive-layout="scroll">
            <Column field="codigoLote" header="Lote" />
            <Column header="Entrada">
              <template #body="{ data: lot }: { data: LoteInventario }">
                {{ formatDate(lot.fechaEntrada) }}
              </template>
            </Column>
            <Column field="cantidadInicial" header="Inicial" />
            <Column field="cantidadActual" header="Actual" />
            <Column header="Disponibilidad">
              <template #body="{ data: lot }: { data: LoteInventario }">
                <Tag
                  :severity="lot.cantidadActual > 0 ? 'info' : 'secondary'"
                  :value="lot.cantidadActual > 0 ? 'Con stock' : 'Sin stock'"
                />
              </template>
            </Column>
            <Column header="Accion" style="width: 9rem">
              <template #body="{ data: lot }: { data: LoteInventario }">
                <Button
                  v-if="canRegisterMerma"
                  type="button"
                  severity="danger"
                  text
                  title="Registrar merma en lote"
                  :disabled="lot.cantidadActual <= 0"
                  @click="openMermaDialog(data, lot)"
                >
                  <Trash2 :size="16" aria-hidden="true" />
                  <span>Merma</span>
                </Button>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </DataTable>

    <Dialog
      v-model:visible="mermaDialogVisible"
      modal
      header="Registrar merma"
      class="inventory-dialog"
      :style="{ width: 'min(92vw, 520px)' }"
    >
      <form class="dialog-form" @submit.prevent="submitMerma">
        <div class="dialog-context">
          <strong>{{ selectedTile?.modelo }}</strong>
          <span>{{ selectedTile?.material }} | {{ selectedTile?.color }}</span>
        </div>

        <div class="field">
          <label for="lot-select">Lote</label>
          <Select
            id="lot-select"
            v-model="mermaForm.idLote"
            :options="selectedTile?.lotes ?? []"
            option-label="codigoLote"
            option-value="idLote"
            placeholder="Selecciona un lote"
            @update:model-value="selectMermaLot"
          />
        </div>

        <div class="field">
          <label for="quantity-input">Cantidad rota</label>
          <InputNumber
            id="quantity-input"
            v-model="mermaForm.cantidadRotas"
            :min="1"
            :max="selectedLotAvailable"
            show-buttons
          />
          <small>Disponible en lote: {{ selectedLotAvailable.toLocaleString('es-MX') }}</small>
          <small v-if="mermaQuantityError && mermaForm.cantidadRotas !== null" class="error-text">
            {{ mermaQuantityError }}
          </small>
        </div>

        <div class="field">
          <label for="reason-input">Motivo</label>
          <Textarea
            id="reason-input"
            v-model="mermaForm.motivo"
            rows="4"
            auto-resize
            placeholder="Rotura en patio, traslado, descarga..."
          />
        </div>

        <div class="dialog-actions">
          <Button type="button" severity="secondary" outlined @click="mermaDialogVisible = false">
            Cancelar
          </Button>
          <Button type="submit" severity="danger" :disabled="!mermaFormIsValid || savingMerma">
            <Trash2 :size="17" aria-hidden="true" />
            <span>{{ savingMerma ? 'Registrando' : 'Registrar' }}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  </section>
</template>
