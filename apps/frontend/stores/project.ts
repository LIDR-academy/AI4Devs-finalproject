import { defineStore } from 'pinia';
import { type Project, type CreateProjectDto, PROJECT_LIMITS } from '~/types/project';
import { useAuthStore } from './auth';

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  const activeProjectsCount = computed(() => 
    projects.value.filter(p => !p.deletedAt && p.status === 'ACTIVE').length
  );

  const canCreateProject = computed(() => {
    if (!authStore.user) return false;
    
    // Check if subscription exists and what logic applies. 
    // Assuming 'subscription' field holds plan name or similar. 
    // If null/undefined, we treat as FREE.
    const plan = authStore.user.subscription || 'FREE';
    
    // If strict match 'FREE', check limit.
    if (plan === 'FREE') {
      return activeProjectsCount.value < PROJECT_LIMITS.FREE;
    }
    
    // Other plans assumed unlimited or managed elsewhere for now
    return true;
  });

  async function fetchProjects() {
    loading.value = true;
    error.value = null;
    try {
      const config = useRuntimeConfig();
      const data = await $fetch<Project[]>(`${config.public.apiBase}/projects`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });
      projects.value = data;
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to fetch projects';
    } finally {
      loading.value = false;
    }
  }

  async function createProject(projectData: CreateProjectDto) {
    loading.value = true;
    error.value = null;
    
    try {
      const config = useRuntimeConfig();
      const data = await $fetch<Project>(`${config.public.apiBase}/projects`, {
        method: 'POST',
        body: projectData,
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });
      projects.value.push(data);
      return data;
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to create project';
      loading.value = false;
      throw new Error(error.value);
    } finally {
      loading.value = false;
    }
  }

  return {
    projects,
    loading,
    error,
    activeProjectsCount,
    canCreateProject,
    fetchProjects,
    createProject
  };
});
