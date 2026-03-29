import { storeToRefs } from 'pinia';
import { usePlansStore } from '~/stores/plans';
import type { CreatePlanDto, UploadLayerDto } from '~/types/plan';

export const usePlans = () => {
    const store = usePlansStore();
    const { groups, currentPlan, loading, error } = storeToRefs(store);

    const fetchProjectPlans = (projectId: string) => store.fetchProjectPlans(projectId);
    const createPlan = (projectId: string, dto: CreatePlanDto) => store.createPlan(projectId, dto);
    const setCurrentPlan = (planId: string, projectId?: string) => store.setCurrentPlan(planId, projectId);
    const uploadLayer = (planId: string, dto: UploadLayerDto) => store.uploadLayer(planId, dto);

    // Helpers computed
    const planCounts = computed(() => {
        return groups.value.reduce((acc, group) => acc + group.plans.length, 0);
    });

    return {
        // State
        groups,
        currentPlan,
        loading,
        error,
        planCounts,
        
        // Actions
        fetchProjectPlans,
        createPlan,
        setCurrentPlan,
        uploadLayer
    };
};
