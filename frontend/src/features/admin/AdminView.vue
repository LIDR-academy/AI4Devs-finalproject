<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AlertTriangle, Banknote, BarChart3, CreditCard, RefreshCw, TrendingUp } from '@lucide/vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { ApiError, apiFetch } from '@/core/api';
import { useAuthStore } from '@/core/auth.store';

type Dashboard = {
  ingresoMesActual: number;
  ventasMesActual: number;
  pedidosPendientesEntrega: number;
  alertasReorden: number;
  perdidaMermaMesActual: number;
  ventasMensuales: VentaMensual[];
  modelosMasVendidos: ModeloVendido[];
  pagosPorMetodo: PagoMetodo[];
  alertasInventario: AlertaReorden[];
  mermasRecientes: MermaResumen[];
};

type VentaMensual = {
  anio: number;
  mes: number;
  periodo: string;
  total: number;
};

type ModeloVendido = {
  idTeja: number;
  modeloTeja: string;
  cantidadVendida: number;
  totalVendido: number;
};

type PagoMetodo = {
  metodoPago: string;
  cantidadPagos: number;
  totalPagado: number;
};

type AlertaReorden = {
  idTeja: number;
  modelo: string;
  material: string;
  color: string;
  stockGlobal: number;
  stockMinimo: number;
  precioBase: number;
};

type MermaResumen = {
  idMerma: number;
  modeloTeja: string;
  codigoLote: string;
  cantidadRotas: number;
  perdidaEstimada: number;
  motivo: string;
  fechaRegistro: string;
};

const authStore = useAuthStore();
const dashboard = ref<Dashboard | null>(null);
const loading = ref(false);
const errorMessage = ref('');

const kpis = computed(() => dashboard.value
  ? [
      {
        label: 'Ingreso mes',
        value: formatCurrency(dashboard.value.ingresoMesActual),
        icon: TrendingUp,
        tone: 'blue',
      },
      {
        label: 'Ventas mes',
        value: dashboard.value.ventasMesActual.toLocaleString('es-MX'),
        icon: BarChart3,
        tone: 'green',
      },
      {
        label: 'Pendientes',
        value: dashboard.value.pedidosPendientesEntrega.toLocaleString('es-MX'),
        icon: CreditCard,
        tone: 'amber',
      },
      {
        label: 'Merma mes',
        value: formatCurrency(dashboard.value.perdidaMermaMesActual),
        icon: AlertTriangle,
        tone: 'red',
      },
    ]
  : []);

const maxMonthlyTotal = computed(() =>
  Math.max(...(dashboard.value?.ventasMensuales.map((item) => item.total) ?? [1]), 1),
);

onMounted(() => {
  void loadDashboard();
});

async function loadDashboard(): Promise<void> {
  loading.value = true;
  errorMessage.value = '';

  try {
    dashboard.value = await apiFetch<Dashboard>('/admin/dashboard', {}, authStore.accessToken ?? undefined);
  } catch (error) {
    errorMessage.value = error instanceof ApiError
      ? error.message
      : 'No se pudo cargar el dashboard administrativo.';
  } finally {
    loading.value = false;
  }
}

function monthHeight(total: number): string {
  const percent = Math.max(8, Math.round((total / maxMonthlyTotal.value) * 100));
  return `${percent}%`;
}

function paymentIcon(method: string): typeof Banknote {
  return method === 'Efectivo' ? Banknote : CreditCard;
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
  <section class="module-panel admin-module">
    <div class="section-heading">
      <div>
        <h2>Administracion</h2>
        <p>Tablero ejecutivo para ventas, inventario critico, pagos y perdidas por merma.</p>
      </div>
      <Button type="button" severity="secondary" outlined title="Actualizar dashboard" @click="loadDashboard">
        <RefreshCw :size="17" aria-hidden="true" />
        <span>Actualizar</span>
      </Button>
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

    <div v-if="loading" class="loading-panel">
      <ProgressSpinner aria-label="Cargando dashboard" />
    </div>

    <template v-else-if="dashboard">
      <div class="admin-kpis">
        <div v-for="item in kpis" :key="item.label" class="admin-kpi" :data-tone="item.tone">
          <component :is="item.icon" :size="20" aria-hidden="true" />
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>

      <div class="admin-grid">
        <section class="dashboard-panel wide-panel">
          <div class="panel-heading">
            <h3>Ventas mensuales</h3>
            <Tag severity="info" value="12 meses" />
          </div>
          <div class="bar-chart" aria-label="Ventas mensuales">
            <div v-for="month in dashboard.ventasMensuales" :key="month.periodo" class="bar-column">
              <div class="bar-track">
                <span class="bar-value" :style="{ height: monthHeight(month.total) }" />
              </div>
              <strong>{{ formatCurrency(month.total) }}</strong>
              <span>{{ month.periodo }}</span>
            </div>
          </div>
        </section>

        <section class="dashboard-panel">
          <div class="panel-heading">
            <h3>Pagos</h3>
            <Tag severity="success" value="Pagado" />
          </div>
          <div class="payment-breakdown">
            <div v-for="payment in dashboard.pagosPorMetodo" :key="payment.metodoPago">
              <component :is="paymentIcon(payment.metodoPago)" :size="18" aria-hidden="true" />
              <span>{{ payment.metodoPago }}</span>
              <strong>{{ formatCurrency(payment.totalPagado) }}</strong>
              <small>{{ payment.cantidadPagos }} pagos</small>
            </div>
          </div>
        </section>

        <section class="dashboard-panel">
          <div class="panel-heading">
            <h3>Modelos mas vendidos</h3>
          </div>
          <DataTable :value="dashboard.modelosMasVendidos" data-key="idTeja" responsive-layout="scroll">
            <Column field="modeloTeja" header="Modelo" />
            <Column field="cantidadVendida" header="Piezas" />
            <Column header="Total">
              <template #body="{ data }: { data: ModeloVendido }">
                {{ formatCurrency(data.totalVendido) }}
              </template>
            </Column>
          </DataTable>
        </section>

        <section class="dashboard-panel wide-panel">
          <div class="panel-heading">
            <h3>Alertas de reorden</h3>
            <Tag :severity="dashboard.alertasReorden > 0 ? 'danger' : 'success'" :value="String(dashboard.alertasReorden)" />
          </div>
          <DataTable :value="dashboard.alertasInventario" data-key="idTeja" responsive-layout="scroll">
            <Column field="modelo" header="Modelo" />
            <Column field="material" header="Material" />
            <Column field="color" header="Color" />
            <Column field="stockGlobal" header="Stock" />
            <Column field="stockMinimo" header="Minimo" />
            <Column header="Precio base">
              <template #body="{ data }: { data: AlertaReorden }">
                {{ formatCurrency(data.precioBase) }}
              </template>
            </Column>
          </DataTable>
        </section>

        <section class="dashboard-panel wide-panel">
          <div class="panel-heading">
            <h3>Mermas recientes</h3>
          </div>
          <DataTable :value="dashboard.mermasRecientes" data-key="idMerma" responsive-layout="scroll">
            <Column field="modeloTeja" header="Modelo" />
            <Column field="codigoLote" header="Lote" />
            <Column field="cantidadRotas" header="Piezas" />
            <Column field="motivo" header="Motivo" />
            <Column header="Perdida">
              <template #body="{ data }: { data: MermaResumen }">
                {{ formatCurrency(data.perdidaEstimada) }}
              </template>
            </Column>
            <Column header="Fecha">
              <template #body="{ data }: { data: MermaResumen }">
                {{ formatDate(data.fechaRegistro) }}
              </template>
            </Column>
          </DataTable>
        </section>
      </div>
    </template>
  </section>
</template>
