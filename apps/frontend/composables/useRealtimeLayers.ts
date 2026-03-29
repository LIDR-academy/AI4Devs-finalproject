import { onMounted, onUnmounted } from 'vue';
import { useNuxtApp } from '#app';
import { usePlansStore } from '~/stores/plans';
import { useToastStore } from '~/stores/toast';

export function useRealtimeLayers() {
  const config = useRuntimeConfig();
  const { $socket } = useNuxtApp() as any;
  const plansStore = usePlansStore();
  const toastStore = useToastStore();

  const handleProcessed = (payload: any) => {
    console.log('Processed payload:', payload);

    const result = payload.result || payload;
    const { status, layerId, planId, imageUrl } = result;

    if (planId && layerId && status) {
      // Ensure we have a full URL for the image to avoid port 3000 issues
      let fullImageUrl = imageUrl;
      if (imageUrl && !imageUrl.startsWith('http')) {
         const baseUrl = (config.public.socketUrl as string).replace(/\/$/, '');
         const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
         fullImageUrl = `${baseUrl}${cleanPath}`;
      }

      plansStore.updateLayerStatus(planId, layerId, status, fullImageUrl);
      toastStore.add({
        type: 'success',
        message: 'Capa procesada correctamente. Ya puedes visualizarla.',
      });
    }
  };

  const handleError = (payload: any) => {
    console.error('Layer Error:', payload);
    const { error } = payload;
    
    toastStore.add({
      type: 'error',
      message: `Error al procesar la capa: ${error || 'Desconocido'}`,
    });
  };

  onMounted(() => {
    if (!$socket) return;
    $socket.on('layer:processed', handleProcessed);
    $socket.on('layer:error', handleError);
  });

  onUnmounted(() => {
    if (!$socket) return;
    $socket.off('layer:processed', handleProcessed);
    $socket.off('layer:error', handleError);
  });
}
