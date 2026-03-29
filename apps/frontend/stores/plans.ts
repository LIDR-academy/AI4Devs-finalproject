import { defineStore } from 'pinia';
import type { Plan, PlanGroup, CreatePlanDto, UploadLayerDto, Layer } from '~/types/plan';

interface PlansState {
  groups: PlanGroup[];
  currentPlan: Plan | null;
  loading: boolean;
  error: string | null;
}

export const usePlansStore = defineStore('plans', {
  state: (): PlansState => ({
    groups: [],
    currentPlan: null,
    loading: false,
    error: null,
  }),

  getters: {
    // Obtener un plano específico por ID desde los grupos cargados
    getPlanById: (state) => (planId: string): Plan | undefined => {
      for (const group of state.groups) {
        const found = group.plans.find(p => p.id === planId);
        if (found) return found;
      }
      return undefined;
    }
  },

  actions: {
    async fetchProjectPlans(projectId: string) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api<PlanGroup[]>(`/projects/${projectId}/plans`);
        this.groups = response;
      } catch (err: any) {
        this.error = err.message || 'Error al cargar los planos';
        // TODO: Mostrar toast notification
      } finally {
        this.loading = false;
      }
    },

    async createPlan(projectId: string, dto: CreatePlanDto) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const newPlan = await $api<Plan>(`/projects/${projectId}/plans`, {
          method: 'POST',
          body: dto
        });
        
        // Actualizar estado local
        await this.fetchProjectPlans(projectId); // Refrescamos para simplificar agrupación
        return newPlan;
      } catch (err: any) {
        this.error = err.message || 'Error al crear el plano';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async setCurrentPlan(planId: string, projectId?: string) {
        const { $api } = useNuxtApp();
        
        // 1. Intentar obtener info básica local para UX inmediata (Título, etc)
        let localPlan = this.getPlanById(planId);
        
        // Determinar Project ID
        const pId = localPlan?.projectId || projectId;
        if (!pId) {
             this.error = "No se puede cargar el plano: Falta ID de proyecto";
             return;
        }

        // 2. Si tenemos local, lo seteamos temporalmente, pero SIEMPRE forzamos fetch 
        // porque el listado no trae las capas completas.
        if (localPlan) {
            this.currentPlan = localPlan;
        }

        // 3. Cargar detalle completo desde API
        this.loading = true;
        this.error = null;
        try {
             const fullPlan = await $api<Plan>(`/projects/${pId}/plans/${planId}`);
             this.currentPlan = fullPlan;
        } catch(err: any) {
             this.error = err.message || "Error al cargar el plano";
        } finally {
             this.loading = false;
        }
    },

    async uploadLayer(planId: string, dto: UploadLayerDto) {
        const { $api } = useNuxtApp();
        
        // Crear FormData para subida de ficheros
        const formData = new FormData();
        formData.append('layerName', dto.name);
        formData.append('layerType', dto.type);
        formData.append('file', dto.file);
        if (dto.pageNumber) {
            formData.append('pdfPageUserSelected', dto.pageNumber.toString());
        }

        try {
            // Optimistic Update: Añadir layer "fake" en state visual (Opcional, omitido por simplicidad ahora)
            
            const newLayer = await $api<Layer>(`/plans/${planId}/layers`, {
                method: 'POST',
                body: formData
            });

            // Actualizar la lista de capas del plano actual
            if (this.currentPlan && this.currentPlan.id === planId) {
                if (!this.currentPlan.layers) this.currentPlan.layers = [];
                this.currentPlan.layers.push(newLayer);
            }
            
            return newLayer;
        } catch (err: any) {
            throw new Error(err.message || 'Error en la subida de capa');
        }
    },

    updateLayerStatus(planId: string, layerId: string, status: 'PROCESSING' | 'READY' | 'ERROR', imageUrl?: string) {
        if (this.currentPlan && this.currentPlan.id === planId) {
            if (!this.currentPlan.layers) return;

            const layer = this.currentPlan.layers.find(l => l.id === layerId);
            if (layer) {
                layer.status = status;
                if (imageUrl) {
                    layer.imageUrl = imageUrl;
                }
            }
        }
    },

    removeLayer(planId: string, layerId: string) {
        if (this.currentPlan && this.currentPlan.id === planId) {
            if (!this.currentPlan.layers) return;
            this.currentPlan.layers = this.currentPlan.layers.filter(l => l.id !== layerId);
        }
    }
  }
});
