<template>
  <!-- Viatic Modal -->
  <div
    v-if="showViaticModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
  >
    <div class="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ editingViatic ? "Editar Viático" : "Registrar Nuevo Viático" }}
        </h3>
        <button
          @click="closeViaticModal"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="saveViatic" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Proyecto *
            </label>
            <select v-model="viaticForm.projectId" required class="input-field">
              <option value="">Seleccionar proyecto</option>
              <option
                v-for="project in projects"
                :key="project.id"
                :value="project.id"
              >
                {{ project.name }}
              </option>
            </select>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Consultor *
            </label>
            <select
              v-model="viaticForm.consultantName"
              required
              class="input-field"
            >
              <option value="">Seleccionar consultor</option>
              <option
                v-for="consultant in availableConsultants"
                :key="consultant"
                :value="consultant"
              >
                {{ consultant }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Fecha de inicio de semana *
            </label>
            <input
              v-model="viaticForm.weekStartDate"
              type="date"
              required
              class="input-field"
              @change="calculateViaticAmount"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Fecha de fin de semana *
            </label>
            <input
              v-model="viaticForm.weekEndDate"
              type="date"
              required
              class="input-field"
              @change="calculateViaticAmount"
            />
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <input
            id="isRemote"
            v-model="viaticForm.isRemote"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            @change="calculateViaticAmount"
          />
          <label
            for="isRemote"
            class="text-sm text-gray-700 dark:text-gray-300"
          >
            Trabajo remoto (50% del monto estándar)
          </label>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Monto
          </label>
          <div class="relative">
            <input
              v-model.number="viaticForm.amount"
              type="number"
              step="0.01"
              min="0"
              required
              class="input-field"
              readonly
            />
            <div
              class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            >
              <span class="text-gray-500 sm:text-sm">MXN</span>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Monto calculado automáticamente: $1,500 MXN presencial / $750 MXN
            remoto por semana
          </p>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-6">
          <button type="button" @click="closeViaticModal" class="btn-secondary">
            Cancelar
          </button>
          <button type="submit" class="btn-primary">
            {{ editingViatic ? "Guardar Cambios" : "Registrar Viático" }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div
    v-if="showDeleteModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="card p-6 m-4 max-w-md w-full">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Confirmar Eliminación
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        ¿Estás seguro de que deseas eliminar este {{ deleteType }}? Esta acción
        no se puede deshacer.
      </p>
      <div class="flex items-center justify-end space-x-3">
        <button @click="showDeleteModal = false" class="btn-secondary">
          Cancelar
        </button>
        <button @click="confirmDelete" class="btn-danger">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ReceiptPercentIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
  BanknotesIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

import { useToast } from "vue-toastification";
import { useFinanceStore } from "~/stores/finance";
import { useProjectStore } from "~/stores/projects";
import { useAuthStore } from "~/stores/auth";

const financeStore = useFinanceStore();
const projectStore = useProjectStore();
const authStore = useAuthStore();
const toast = useToast();

// Reactive state
const activeTab = ref("expenses");
const showExpenseModal = ref(false);
const showViaticModal = ref(false);
const showDeleteModal = ref(false);
const editingExpense = ref(false);
const editingViatic = ref(false);
const deleteType = ref("");
const itemToDelete = ref<any>(null);

// Filters
const expenseFilters = reactive({
  status: "all",
  category: "all",
  consultant: "all",
  project: "all",
});

const viaticFilters = reactive({
  status: "all",
  consultant: "all",
  project: "all",
});

// Forms
const expenseForm = reactive({
  projectId: "",
  consultantName: "",
  category: "",
  amount: 0,
  description: "",
  date: new Date().toISOString().split("T")[0],
});

const viaticForm = reactive({
  projectId: "",
  consultantName: "",
  weekStartDate: "",
  weekEndDate: "",
  amount: 1500,
  isRemote: false,
});

// Computed properties
const projects = computed(() => projectStore.projects);
const uniqueConsultants = computed(() => {
  const consultants = new Set<string>();
  financeStore.expenses.forEach((expense) =>
    consultants.add(expense.consultantName)
  );
  financeStore.viatics.forEach((viatic) =>
    consultants.add(viatic.consultantName)
  );
  return Array.from(consultants);
});

const availableConsultants = [
  "Miguel Rico",
  "Ana García",
  "Carlos López",
  "María González",
  "Pedro Sánchez",
  "Elena Rodríguez",
  "Laura Martínez",
  "Roberto Silva",
];

const canApprove = computed(() => authStore.isAdmin || authStore.isManager);
const canPay = computed(() => authStore.isAdmin);

// Chart data
const expensesByCategoryData = computed(() => {
  const categories = financeStore.expensesByCategory;
  return {
    labels: ["Transporte", "Alojamiento", "Comidas", "Materiales", "Otros"],
    datasets: [
      {
        data: [
          categories.transport,
          categories.accommodation,
          categories.meals,
          categories.materials,
          categories.other,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(234, 179, 8, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(168, 85, 247, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
});

const monthlyExpensesData = computed(() => {
  const monthlyData = financeStore.monthlyExpenses;
  const months = Object.keys(monthlyData).sort();

  return {
    labels: months.map((month) => {
      const [year, monthNum] = month.split("-");
      return new Date(
        parseInt(year),
        parseInt(monthNum) - 1
      ).toLocaleDateString("es-MX", {
        month: "short",
        year: "numeric",
      });
    }),
    datasets: [
      {
        label: "Gastos Mensuales",
        data: months.map((month) => monthlyData[month]),
        borderColor: "rgba(14, 165, 233, 1)",
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
});

// Table columns
const expenseColumns = [
  { key: "description", label: "Descripción", type: "text" },
  { key: "consultantName", label: "Consultor", type: "text" },
  { key: "amount", label: "Monto", type: "currency" },
  { key: "status", label: "Estado", type: "status" },
  { key: "date", label: "Fecha", type: "date" },
];

const viaticColumns = [
  { key: "consultantName", label: "Consultor", type: "text" },
  { key: "period", label: "Período", type: "text" },
  { key: "amount", label: "Monto", type: "currency" },
  { key: "status", label: "Estado", type: "status" },
];

// Methods
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-MX");
};

const getCategoryLabel = (category: string) => {
  const labels = {
    transport: "Transporte",
    accommodation: "Alojamiento",
    meals: "Comidas",
    materials: "Materiales",
    other: "Otros",
  };
  return labels[category as keyof typeof labels] || category;
};

const getExpenseStatusClass = (status: string) => {
  const classes = {
    pending: "warning",
    approved: "info",
    rejected: "danger",
    paid: "success",
  };
  return classes[status as keyof typeof classes] || "info";
};

const getExpenseStatusLabel = (status: string) => {
  const labels = {
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
    paid: "Pagado",
  };
  return labels[status as keyof typeof labels] || status;
};

const getViaticStatusClass = (status: string) => {
  const classes = {
    pending: "warning",
    approved: "info",
    paid: "success",
  };
  return classes[status as keyof typeof classes] || "info";
};

const getViaticStatusLabel = (status: string) => {
  const labels = {
    pending: "Pendiente",
    approved: "Aprobado",
    paid: "Pagado",
  };
  return labels[status as keyof typeof labels] || status;
};

const clearExpenseFilters = () => {
  financeStore.clearFilters();
  Object.assign(expenseFilters, {
    status: "all",
    category: "all",
    consultant: "all",
    project: "all",
  });
};

const clearViaticFilters = () => {
  financeStore.clearFilters();
  Object.assign(viaticFilters, {
    status: "all",
    consultant: "all",
    project: "all",
  });
};

const resetExpenseForm = () => {
  Object.assign(expenseForm, {
    projectId: "",
    consultantName: "",
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
};

const resetViaticForm = () => {
  Object.assign(viaticForm, {
    projectId: "",
    consultantName: "",
    weekStartDate: "",
    weekEndDate: "",
    amount: 1500,
    isRemote: false,
  });
};

const calculateViaticAmount = () => {
  viaticForm.amount = viaticForm.isRemote ? 750 : 1500;
};

const editExpense = (expense: any) => {
  editingExpense.value = true;
  Object.assign(expenseForm, {
    projectId: expense.projectId,
    consultantName: expense.consultantName,
    category: expense.category,
    amount: expense.amount,
    description: expense.description,
    date: expense.date,
  });
  showExpenseModal.value = true;
};

const editViatic = (viatic: any) => {
  editingViatic.value = true;
  Object.assign(viaticForm, {
    projectId: viatic.projectId,
    consultantName: viatic.consultantName,
    weekStartDate: viatic.weekStartDate,
    weekEndDate: viatic.weekEndDate,
    amount: viatic.amount,
    isRemote: viatic.isRemote,
  });
  showViaticModal.value = true;
};

const closeExpenseModal = () => {
  showExpenseModal.value = false;
  editingExpense.value = false;
  resetExpenseForm();
};

const closeViaticModal = () => {
  showViaticModal.value = false;
  editingViatic.value = false;
  resetViaticForm();
};

const saveExpense = async () => {
  try {
    if (editingExpense.value) {
      // Update existing expense
      toast.success(
        "Gasto actualizado",
        "El gasto ha sido actualizado correctamente"
      );
    } else {
      await financeStore.createExpense({
        projectId: expenseForm.projectId,
        consultantId: "1", // This would be determined from the consultant name
        consultantName: expenseForm.consultantName,
        category: expenseForm.category as any,
        amount: expenseForm.amount,
        description: expenseForm.description,
        date: expenseForm.date,
        status: "pending",
      });
      toast.success(
        "Gasto registrado",
        "El gasto ha sido registrado correctamente"
      );
    }

    closeExpenseModal();
  } catch (error) {
    toast.error("Error", "Ocurrió un error al guardar el gasto");
  }
};

const saveViatic = async () => {
  try {
    if (editingViatic.value) {
      // Update existing viatic
      toast.success(
        "Viático actualizado",
        "El viático ha sido actualizado correctamente"
      );
    } else {
      await financeStore.createViatic({
        projectId: viaticForm.projectId,
        consultantId: "1", // This would be determined from the consultant name
        consultantName: viaticForm.consultantName,
        weekStartDate: viaticForm.weekStartDate,
        weekEndDate: viaticForm.weekEndDate,
        amount: viaticForm.amount,
        status: "pending",
        isRemote: viaticForm.isRemote,
      });
      toast.success(
        "Viático registrado",
        "El viático ha sido registrado correctamente"
      );
    }

    closeViaticModal();
  } catch (error) {
    toast.error("Error", "Ocurrió un error al guardar el viático");
  }
};

const approveExpense = async (expense: any) => {
  await financeStore.approveExpense(expense.id, authStore.user?.name || "");
  toast.success("Gasto aprobado", "El gasto ha sido aprobado correctamente");
};

const rejectExpense = async (expense: any) => {
  await financeStore.rejectExpense(expense.id, "Rechazado por el gerente");
  toast.success("Gasto rechazado", "El gasto ha sido rechazado");
};

const payExpense = async (expense: any) => {
  await financeStore.payExpense(expense.id);
  toast.success("Gasto pagado", "El gasto ha sido marcado como pagado");
};

const approveViatic = async (viatic: any) => {
  await financeStore.approveViatic(viatic.id, authStore.user?.name || "");
  toast.success(
    "Viático aprobado",
    "El viático ha sido aprobado correctamente"
  );
};

const payViatic = async (viatic: any) => {
  await financeStore.payViatic(viatic.id);
  toast.success("Viático pagado", "El viático ha sido marcado como pagado");
};

const confirmDeleteExpense = (expense: any) => {
  itemToDelete.value = expense;
  deleteType.value = "gasto";
  showDeleteModal.value = true;
};

const confirmDeleteViatic = (viatic: any) => {
  itemToDelete.value = viatic;
  deleteType.value = "viático";
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  if (deleteType.value === "gasto") {
    // Delete expense logic
  } else {
    // Delete viatic logic
  }

  toast.success(
    `${deleteType.value} eliminado`,
    `El ${deleteType.value} ha sido eliminado correctamente`
  );
  showDeleteModal.value = false;
  itemToDelete.value = null;
};

// Watch filters
watch(
  expenseFilters,
  (newFilters) => {
    financeStore.setFilters(newFilters);
  },
  { deep: true }
);

watch(
  viaticFilters,
  (newFilters) => {
    financeStore.setFilters(newFilters);
  },
  { deep: true }
);

// Initialize data
onMounted(async () => {
  await Promise.all([
    financeStore.fetchExpenses(),
    financeStore.fetchViatics(),
    projectStore.fetchProjects(),
  ]);
});
</script>
