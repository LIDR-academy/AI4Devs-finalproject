import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import documentationService from '@/services/documentation.service';
import websocketService from '@/services/websocket.service';
import { useAuthStore } from '@/store/authStore';
import { Documentation } from '@/services/documentation.service';

interface UseDocumentationOptions {
  surgeryId: string;
  autoConnect?: boolean;
}

export const useDocumentation = ({ surgeryId, autoConnect = true }: UseDocumentationOptions) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAutoSaveRef = useRef<{ documentationId: string; data: Partial<Documentation> } | null>(null);

  // Query para obtener documentación
  const {
    data: documentation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['documentation', surgeryId],
    queryFn: () => documentationService.getBySurgeryId(surgeryId),
    enabled: !!surgeryId,
  });

  // Mutación para actualizar (HTTP cuando WebSocket no está disponible)
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Documentation>) => {
      if (!documentation) throw new Error('Documentación no encontrada');
      return documentationService.update(documentation.id, data);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['documentation', surgeryId], updated);
      setLastSavedAt(new Date());
    },
  });

  // Conectar WebSocket
  useEffect(() => {
    if (!autoConnect || !surgeryId || !user) return;

    const socket = websocketService.connect('/documentation');
    
    socket.emit('join-surgery', {
      surgeryId,
      userId: user.id,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('field-updated', (data: any) => {
      // Actualizar cache cuando otro usuario modifica
      queryClient.setQueryData(['documentation', surgeryId], (old: Documentation | undefined) => {
        if (!old) return old;
        return {
          ...old,
          [data.field]: data.value,
          lastSavedAt: data.lastSavedAt,
        };
      });
      setLastSavedAt(new Date(data.lastSavedAt));
    });

    socket.on('user-typing', (data: any) => {
      if (data.userId !== user.id) {
        setIsTyping(data.isTyping);
      }
    });

    socket.on('auto-saved', (data: any) => {
      setLastSavedAt(new Date(data.timestamp));
    });

    return () => {
      socket.emit('leave-surgery', { surgeryId });
      websocketService.disconnect();
    };
  }, [surgeryId, user, autoConnect, queryClient]);

  // Función para actualizar campo en tiempo real
  const updateField = useCallback(
    (field: string, value: any) => {
      if (!documentation) return;

      const socket = websocketService.getSocket();
      if (socket?.connected && user) {
        socket.emit('update-field', {
          documentationId: documentation.id,
          field,
          value,
          userId: user.id,
        });
      } else {
        // Fallback a HTTP si WebSocket no está disponible
        updateMutation.mutate({ [field]: value });
      }

      // Indicar que está escribiendo
      if (socket?.connected && user) {
        socket.emit('typing', {
          userId: user.id,
          field,
          isTyping: true,
        });

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          const socket = websocketService.getSocket();
          if (socket?.connected && user) {
            socket.emit('typing', {
              userId: user.id,
              field,
              isTyping: false,
            });
          }
        }, 2000);
      }
    },
    [documentation, user, updateMutation],
  );

  // Auto-guardado (debounced); pendiente se guarda al desmontar
  const autoSave = useCallback(
    (data: Partial<Documentation>) => {
      if (!documentation) return;

      pendingAutoSaveRef.current = { documentationId: documentation.id, data };

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        const pending = pendingAutoSaveRef.current;
        if (!pending || pending.documentationId !== documentation.id) return;
        const socket = websocketService.getSocket();
        if (socket?.connected) {
          socket.emit('auto-save', {
            documentationId: pending.documentationId,
            data: pending.data,
          });
        } else {
          updateMutation.mutate(pending.data);
        }
        pendingAutoSaveRef.current = null;
      }, 1500);
    },
    [documentation, updateMutation],
  );

  // Limpiar timeouts y guardar pendiente al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      const pending = pendingAutoSaveRef.current;
      if (pending?.data && Object.keys(pending.data).length > 0) {
        documentationService.update(pending.documentationId, pending.data).catch(() => {});
      }
      pendingAutoSaveRef.current = null;
    };
  }, []);

  return {
    documentation,
    isLoading,
    error,
    isConnected,
    isTyping,
    lastSavedAt,
    updateField,
    autoSave,
    updateMutation,
  };
};
