<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Finanzas
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gestión de gastos y viáticos
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button @click="exportData" class="btn-secondary">
          <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
          Exportar
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <MetricCard
        title="Total Gastos"
        :value="formatCurrency(financeStore.totalExpenses)"
        :icon="ReceiptPercentIcon"
        color="blue"
      />

      <MetricCard
        title="Gastos Pendientes"
        :value="financeStore.pendingExpensesCount"
        :icon="ClockIcon"
        color="yellow"
      />

      <MetricCard
        title="Total Viáticos"
        :value="formatCurrency(financeStore.totalViatics)"
        :icon="BanknotesIcon"
        color="green"
      />

      <MetricCard
        title="Por Pagar"
        :value="formatCurrency(financeStore.totalToPay)"
        :icon="CurrencyDollarIcon"
        color="red"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Expenses by Category Chart -->
      <ChartCard
        title="Gastos por Categoría"
        type="doughnut"
        :data="expensesByCategoryData"
      />

      <!-- Monthly Expenses Chart -->
      <ChartCard
        title="Gastos Mensuales"
        type="line"
        :data="monthlyExpensesData"
      />
    </div>

    <!-- Tabs -->
    <div class="card">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8 px-6">
          <button
            @click="activeTab = 'expenses'"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="
              activeTab === 'expenses'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            "
          >
            Gastos
          </button>
          <button
            @click="activeTab = 'viatics'"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="
              activeTab === 'viatics'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            "
          >
            Viáticos
          </button>
        </nav>
      </div>

      <!-- Expenses Tab -->
      <div v-if="activeTab === 'expenses'" class="p-6 space-y-6">
        <!-- Filters and Add Button -->
        <div class="flex items-center justify-between">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 mr-6">
            <select v-model="expenseFilters.status" class="input-field">
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
              <option value="paid">Pagados</option>
            </select>

            <select v-model="expenseFilters.category" class="input-field">
              <option value="all">Todas las categorías</option>
              <option value="transport">Transporte</option>
              <option value="accommodation">Alojamiento</option>
              <option value="meals">Comidas</option>
              <option value="materials">Materiales</option>
              <option value="other">Otros</option>
            </select>

            <select v-model="expenseFilters.consultant" class="input-field">
              <option value="all">Todos los consultores</option>
              <option
                v-for="consultant in uniqueConsultants"
                :key="consultant"
                :value="consultant"
              >
                {{ consultant }}
              </option>
            </select>

            <button @click="clearExpenseFilters" class="btn-secondary">
              Limpiar Filtros
            </button>
          </div>

          <button @click="showExpenseModal = true" class="btn-primary">
            <PlusIcon class="w-4 h-4 mr-2" />
            Nuevo Gasto
          </button>
        </div>

        <!-- Expenses Table -->
        <div class="overflow-x-auto">
          <table
            class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          >
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Descripción
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Consultor
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Categoría
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Monto
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody
              class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
            >
              <tr
                v-for="expense in financeStore.filteredExpenses"
                :key="expense.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="px-6 py-4">
                  <div
                    class="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {{ expense.description }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ expense.consultantName }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ getCategoryLabel(expense.category) }}
                </td>
                <td
                  class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {{ formatCurrency(expense.amount) }}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getExpenseStatusClass(expense.status)"
                  >
                    {{ getExpenseStatusLabel(expense.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(expense.date) }}
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      v-if="expense.status === 'pending' && canApprove"
                      @click="approveExpense(expense)"
                      class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      title="Aprobar"
                    >
                      <CheckIcon class="w-4 h-4" />
                    </button>
                    <button
                      v-if="expense.status === 'pending' && canApprove"
                      @click="rejectExpense(expense)"
                      class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Rechazar"
                    >
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                    <button
                      v-if="expense.status === 'approved' && canPay"
                      @click="payExpense(expense)"
                      class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Marcar como pagado"
                    >
                      <CurrencyDollarIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="editExpense(expense)"
                      class="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                      title="Editar"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="confirmDeleteExpense(expense)"
                      class="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Eliminar"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Viatics Tab -->
      <div v-if="activeTab === 'viatics'" class="p-6 space-y-6">
        <!-- Filters and Add Button -->
        <div class="flex items-center justify-between">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 mr-6">
            <select v-model="viaticFilters.status" class="input-field">
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="paid">Pagados</option>
            </select>

            <select v-model="viaticFilters.consultant" class="input-field">
              <option value="all">Todos los consultores</option>
              <option
                v-for="consultant in uniqueConsultants"
                :key="consultant"
                :value="consultant"
              >
                {{ consultant }}
              </option>
            </select>

            <button @click="clearViaticFilters" class="btn-secondary">
              Limpiar Filtros
            </button>
          </div>

          <button @click="showViaticModal = true" class="btn-primary">
            <PlusIcon class="w-4 h-4 mr-2" />
            Nuevo Viático
          </button>
        </div>

        <!-- Viatics Table -->
        <div class="overflow-x-auto">
          <table
            class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          >
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Consultor
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Período
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Tipo
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Monto
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody
              class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
            >
              <tr
                v-for="viatic in financeStore.filteredViatics"
                :key="viatic.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td
                  class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {{ viatic.consultantName }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {{ formatDate(viatic.weekStartDate) }} -
                  {{ formatDate(viatic.weekEndDate) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="
                      viatic.isRemote
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    "
                  >
                    {{ viatic.isRemote ? "Remoto" : "Presencial" }}
                  </span>
                </td>
                <td
                  class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {{ formatCurrency(viatic.amount) }}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getViaticStatusClass(viatic.status)"
                  >
                    {{ getViaticStatusLabel(viatic.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      v-if="viatic.status === 'pending' && canApprove"
                      @click="approveViatic(viatic)"
                      class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      title="Aprobar"
                    >
                      <CheckIcon class="w-4 h-4" />
                    </button>
                    <button
                      v-if="viatic.status === 'approved' && canPay"
                      @click="payViatic(viatic)"
                      class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Marcar como pagado"
                    >
                      <CurrencyDollarIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="editViatic(viatic)"
                      class="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                      title="Editar"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="confirmDeleteViatic(viatic)"
                      class="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Eliminar"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Expense Modal -->
    <div
      v-if="showExpenseModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div class="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingExpense ? "Editar Gasto" : "Registrar Nuevo Gasto" }}
          </h3>
          <button
            @click="closeExpenseModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveExpense" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Proyecto *
              </label>
              <select
                v-model="expenseForm.projectId"
                required
                class="input-field"
              >
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
                v-model="expenseForm.consultantName"
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
                Categoría *
              </label>
              <select
                v-model="expenseForm.category"
                required
                class="input-field"
              >
                <option value="">Seleccionar categoría</option>
                <option value="transport">Transporte</option>
                <option value="accommodation">Alojamiento</option>
                <option value="meals">Comidas</option>
                <option value="materials">Materiales</option>
                <option value="other">Otros</option>
              </select>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Fecha *
              </label>
              <input
                v-model="expenseForm.date"
                type="date"
                required
                class="input-field"
              />
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Monto *
            </label>
            <div class="relative">
              <input
                v-model.number="expenseForm.amount"
                type="number"
                step="0.01"
                min="0"
                required
                class="input-field"
                placeholder="0.00"
              />
              <div
                class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm">MXN</span>
              </div>
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Descripción *
            </label>
            <textarea
              v-model="expenseForm.description"
              required
              rows="3"
              class="input-field"
              placeholder="Describe el gasto realizado..."
            ></textarea>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-6">
            <button
              type="button"
              @click="closeExpenseModal"
              class="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              {{ editingExpense ? "Guardar Cambios" : "Registrar Gasto" }}
            </button>
          </div>
        </form>
      </div>
    </div>

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
              <select
                v-model="viaticForm.projectId"
                required
                class="input-field"
              >
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
            <button
              type="button"
              @click="closeViaticModal"
              class="btn-secondary"
            >
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
          ¿Estás seguro de que deseas eliminar este {{ deleteType }}? Esta
          acción no se puede deshacer.
        </p>
        <div class="flex items-center justify-end space-x-3">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="confirmDelete" class="btn-danger">Eliminar</button>
        </div>
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
  PlusIcon,
  ArrowDownTrayIcon,
} from "@heroicons/vue/24/outline";

import { useToast } from '../composables/useToast';
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
const projects = computed(() => projectStore.projects || []);
const uniqueConsultants = computed(() => {
  const consultants = new Set<string>();
  financeStore.expenses?.forEach((expense) =>
    consultants.add(expense.consultantName)
  );
  financeStore.viatics?.forEach((viatic) =>
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
  const categories = financeStore.expensesByCategory || {};
  return {
    labels: ["Transporte", "Alojamiento", "Comidas", "Materiales", "Otros"],
    datasets: [
      {
        data: [
          categories.transport || 0,
          categories.accommodation || 0,
          categories.meals || 0,
          categories.materials || 0,
          categories.other || 0,
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
  const monthlyData = financeStore.monthlyExpenses || {};
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

// Methods
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
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
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };
  return (
    classes[status as keyof typeof classes] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  );
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
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };
  return (
    classes[status as keyof typeof classes] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  );
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
  financeStore.clearFilters?.();
  Object.assign(expenseFilters, {
    status: "all",
    category: "all",
    consultant: "all",
    project: "all",
  });
};

const clearViaticFilters = () => {
  financeStore.clearFilters?.();
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
      toast.success("Gasto actualizado correctamente");
    } else {
      await financeStore.createExpense?.({
        projectId: expenseForm.projectId,
        consultantId: "1", // This would be determined from the consultant name
        consultantName: expenseForm.consultantName,
        category: expenseForm.category as any,
        amount: expenseForm.amount,
        description: expenseForm.description,
        date: expenseForm.date,
        status: "pending",
      });
      toast.success("Gasto registrado correctamente");
    }

    closeExpenseModal();
  } catch (error) {
    console.error("Error al guardar el gasto:", error);
    toast.error("Ocurrió un error al guardar el gasto");
  }
};

const saveViatic = async () => {
  try {
    if (editingViatic.value) {
      // Update existing viatic
      toast.success("Viático actualizado correctamente");
    } else {
      await financeStore.createViatic?.({
        projectId: viaticForm.projectId,
        consultantId: "1", // This would be determined from the consultant name
        consultantName: viaticForm.consultantName,
        weekStartDate: viaticForm.weekStartDate,
        weekEndDate: viaticForm.weekEndDate,
        amount: viaticForm.amount,
        status: "pending",
        isRemote: viaticForm.isRemote,
      });
      toast.success("Viático registrado correctamente");
    }

    closeViaticModal();
  } catch (error) {
    console.error("Error al guardar el viático:", error);
    toast.error("Ocurrió un error al guardar el viático");
  }
};

const approveExpense = async (expense: any) => {
  await financeStore.approveExpense?.(expense.id, authStore.user?.name || "");
  toast.success("Gasto aprobado correctamente");
};

const rejectExpense = async (expense: any) => {
  await financeStore.rejectExpense?.(expense.id, "Rechazado por el gerente");
  toast.success("Gasto rechazado");
};

const payExpense = async (expense: any) => {
  await financeStore.payExpense?.(expense.id);
  toast.success("Gasto marcado como pagado");
};

const approveViatic = async (viatic: any) => {
  await financeStore.approveViatic?.(viatic.id, authStore.user?.name || "");
  toast.success("Viático aprobado correctamente");
};

const payViatic = async (viatic: any) => {
  await financeStore.payViatic?.(viatic.id);
  toast.success("Viático marcado como pagado");
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
    console.log("Eliminando gasto:", itemToDelete.value);
  } else {
    // Delete viatic logic
    console.log("Eliminando viático:", itemToDelete.value);
  }

  toast.success(`${deleteType.value} eliminado correctamente`);
  showDeleteModal.value = false;
  itemToDelete.value = null;
};

const exportData = () => {
  console.log("Exportando datos financieros...");
  toast.info("Función de exportación en desarrollo");
};

// Watch filters
watch(
  expenseFilters,
  (newFilters) => {
    financeStore.setFilters?.(newFilters);
  },
  { deep: true }
);

watch(
  viaticFilters,
  (newFilters) => {
    financeStore.setFilters?.(newFilters);
  },
  { deep: true }
);

// Initialize data
onMounted(async () => {
  try {
    await Promise.all([
      financeStore.fetchExpenses?.(),
      financeStore.fetchViatics?.(),
      projectStore.fetchProjects?.(),
    ]);
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
});

// Page meta
definePageMeta({
  title: "Gestión Financiera",
  layout: "default",
});
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white;
}

.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 transition-colors flex items-center;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors;
}

.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow;
}
</style>
