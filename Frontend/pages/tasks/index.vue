<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Gestión de Tareas</h1>

    <!-- Task filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <button @click="toggleView" class="btn-primary">
          {{ viewMode === "kanban" ? "Vista de Lista" : "Vista Kanban" }}
        </button>
        <button @click="clearFilters" class="btn-secondary">
          Limpiar Filtros
        </button>
      </div>
    </div>

    <!-- Tasks content -->
    <div>
      <!-- Kanban view -->
      <div
        v-if="viewMode === 'kanban'"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div
          v-for="column in kanbanColumns"
          :key="column.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <div :class="column.color" class="p-3 rounded-t-lg">
            <h3 class="font-semibold">{{ column.name }}</h3>
          </div>
          <div class="p-4">
            <button
              @click="createTaskInStatus(column.id)"
              class="btn-outline w-full mb-4"
            >
              + Nueva Tarea
            </button>
            <div
              v-if="getTasksByStatus(column.id).length === 0"
              class="text-center text-gray-500 py-4"
            >
              No hay tareas
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="task in getTasksByStatus(column.id)"
                :key="task.id"
                class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg cursor-pointer hover:shadow-md"
                @click="openTaskDetail(task)"
              >
                <h4 class="font-medium">{{ task.title }}</h4>
                <div class="flex justify-between mt-2">
                  <span
                    :class="getPriorityColor(task.priority)"
                    class="text-xs px-2 py-1 rounded"
                  >
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                  <span v-if="task.dueDate" class="text-xs">
                    {{ formatDate(task.dueDate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List view -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="p-4">
          <button
            @click="createTaskInStatus('pending')"
            class="btn-primary mb-4"
          >
            + Nueva Tarea
          </button>
          <table class="w-full">
            <thead>
              <tr>
                <th
                  v-for="column in taskColumns"
                  :key="column.key"
                  class="text-left p-2"
                >
                  {{ column.label }}
                </th>
                <th class="text-right p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="task in filteredTasks"
                :key="task.id"
                class="border-t border-gray-200 dark:border-gray-700"
              >
                <td class="p-2">{{ task.title }}</td>
                <td class="p-2">
                  <span
                    :class="getPriorityColor(task.status)"
                    class="text-xs px-2 py-1 rounded"
                  >
                    {{ getStatusLabel(task.status) }}
                  </span>
                </td>
                <td class="p-2">
                  <span
                    :class="getPriorityColor(task.priority)"
                    class="text-xs px-2 py-1 rounded"
                  >
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </td>
                <td class="p-2">{{ task.assignedTo.join(", ") }}</td>
                <td class="p-2">
                  {{ task.dueDate ? formatDate(task.dueDate) : "-" }}
                </td>
                <td class="p-2 text-right">
                  <button @click.stop="openTaskDetail(task)" class="btn-icon">
                    Ver
                  </button>
                  <button @click.stop="editTask(task)" class="btn-icon">
                    Editar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useTaskStore } from "~/stores/tasks";
import { useProjectStore } from "~/stores/projects";

// Task form
const taskForm = reactive({
  title: "",
  description: "",
  projectId: "",
  status: "pending",
  priority: "medium",
  dueDate: "",
  assignedTo: [],
});

// Computed properties
const filteredTasks = computed(() => taskStore.filteredTasks);
const uniqueAssignees = computed(() => {
  const assignees = new Set();
  taskStore.tasks.forEach((task) => {
    task.assignedTo.forEach((assignee) => assignees.add(assignee));
  });
  return Array.from(assignees);
});

const projects = computed(() => projectStore.projects);

const availableAssignees = [
  "Miguel Rico",
  "Ana García",
  "Carlos López",
  "María González",
  "Pedro Sánchez",
  "Elena Rodríguez",
  "Laura Martínez",
  "Roberto Silva",
];

// Kanban columns
const kanbanColumns = [
  {
    id: "pending",
    name: "Pendiente",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  {
    id: "in-progress",
    name: "En Progreso",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  {
    id: "review",
    name: "Revisión",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  {
    id: "completed",
    name: "Completada",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
];

// Table columns
const taskColumns = [
  { key: "title", label: "Tarea", type: "text" },
  { key: "status", label: "Estado", type: "status" },
  { key: "priority", label: "Prioridad", type: "text" },
  { key: "assignedTo", label: "Asignado a", type: "text" },
  { key: "dueDate", label: "Fecha límite", type: "date" },
];

// State
const taskStore = useTaskStore();
const projectStore = useProjectStore();
const viewMode = ref("kanban");
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDetailModal = ref(false);
const showDeleteModal = ref(false);
const selectedTask = ref(null);
const taskToDelete = ref(null);
const newComment = ref("");
const filters = reactive({
  status: "all",
  priority: "all",
  assignee: "all",
  project: "all",
});

// Methods
const toggleView = () => {
  viewMode.value = viewMode.value === "kanban" ? "list" : "kanban";
};

const getTasksByStatus = (status) => {
  return filteredTasks.value.filter((task) => task.status === status);
};

const getStatusClass = (status) => {
  const classes = {
    pending: "warning",
    "in-progress": "info",
    review: "warning",
    completed: "success",
  };
  return classes[status] || "info";
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "Pendiente",
    "in-progress": "En Progreso",
    review: "Revisión",
    completed: "Completada",
  };
  return labels[status] || status;
};

const getPriorityClass = (priority) => {
  const classes = {
    low: "info",
    medium: "warning",
    high: "danger",
    urgent: "danger",
  };
  return classes[priority] || "info";
};

const getPriorityColor = (priority) => {
  const colors = {
    low: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[priority] || colors.medium;
};

const getPriorityLabel = (priority) => {
  const labels = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    urgent: "Urgente",
  };
  return labels[priority] || priority;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("es-MX");
};

const isOverdue = (dateString) => {
  return new Date(dateString) < new Date();
};

const isDueSoon = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const diffInDays = Math.ceil(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffInDays <= 3 && diffInDays > 0;
};

const getCompletedChecklist = (task) => {
  return task.checklist.filter((item) => item.completed).length;
};

const getChecklistProgress = (task) => {
  if (task.checklist.length === 0) return 0;
  return Math.round(
    (getCompletedChecklist(task) / task.checklist.length) * 100
  );
};

const getProjectName = (projectId) => {
  const project = projects.value.find((p) => p.id === projectId);
  return project?.name || "Proyecto no encontrado";
};

const clearFilters = () => {
  taskStore.clearFilters();
  filters.status = "all";
  filters.priority = "all";
  filters.assignee = "all";
  filters.project = "all";
};

const openTaskDetail = (task) => {
  selectedTask.value = task;
  showDetailModal.value = true;
};

const createTaskInStatus = (status) => {
  resetTaskForm();
  taskForm.status = status;
  showCreateModal.value = true;
};

const editTask = (task) => {
  selectedTask.value = task;
  Object.assign(taskForm, {
    title: task.title,
    description: task.description || "",
    projectId: task.projectId,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    assignedTo: [...task.assignedTo],
  });
  showDetailModal.value = false;
  showEditModal.value = true;
};

const confirmDeleteTask = (task) => {
  taskToDelete.value = task;
  showDetailModal.value = false;
  showDeleteModal.value = true;
};

const deleteTask = async () => {
  if (taskToDelete.value) {
    await taskStore.deleteTask(taskToDelete.value.id);
    $toast?.success(
      "Tarea eliminada",
      "La tarea ha sido eliminada correctamente"
    );
    showDeleteModal.value = false;
    taskToDelete.value = null;
  }
};

const markAsCompleted = async (task) => {
  await taskStore.updateTask(task.id, { status: "completed" });
  $toast?.success(
    "Tarea completada",
    "La tarea ha sido marcada como completada"
  );
  showDetailModal.value = false;
};

const resetTaskForm = () => {
  Object.assign(taskForm, {
    title: "",
    description: "",
    projectId: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    assignedTo: [],
  });
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  resetTaskForm();
};

const saveTask = async () => {
  try {
    if (showCreateModal.value) {
      await taskStore.createTask({
        title: taskForm.title,
        description: taskForm.description,
        projectId: taskForm.projectId,
        status: taskForm.status,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate,
        assignedTo: taskForm.assignedTo,
        tags: [],
        attachments: [],
        comments: [],
        checklist: [],
      });
      $toast?.success("Tarea creada", "La tarea ha sido creada correctamente");
    } else if (showEditModal.value && selectedTask.value) {
      await taskStore.updateTask(selectedTask.value.id, {
        title: taskForm.title,
        description: taskForm.description,
        projectId: taskForm.projectId,
        status: taskForm.status,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate,
        assignedTo: taskForm.assignedTo,
      });
      $toast?.success(
        "Tarea actualizada",
        "La tarea ha sido actualizada correctamente"
      );
    }

    closeModal();
  } catch (error) {
    $toast?.error("Error", "Ocurrió un error al guardar la tarea");
  }
};

const updateChecklist = async (item) => {
  if (selectedTask.value) {
    await taskStore.updateTask(selectedTask.value.id, {
      checklist: selectedTask.value.checklist,
    });
  }
};

const addComment = async () => {
  if (selectedTask.value && newComment.value.trim()) {
    const comment = {
      id: Date.now().toString(),
      author: "Usuario Actual", // This would come from auth store
      content: newComment.value.trim(),
      createdAt: new Date().toISOString(),
    };

    selectedTask.value.comments.push(comment);
    await taskStore.updateTask(selectedTask.value.id, {
      comments: selectedTask.value.comments,
    });

    newComment.value = "";
  }
};

// Watch filters
watch(
  filters,
  (newFilters) => {
    taskStore.setFilters(newFilters);
  },
  { deep: true }
);

// Initialize data
onMounted(async () => {
  await Promise.all([taskStore.fetchTasks(), projectStore.fetchProjects()]);
});
</script>
