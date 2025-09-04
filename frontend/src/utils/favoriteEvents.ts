// Sistema de eventos para sincronizar favoritos entre componentes

type FavoriteEventType = 'favorite_added' | 'favorite_removed';

// interface FavoriteEvent {
//   type: FavoriteEventType;
//   propertyId: string;
// }

class FavoriteEventManager {
  private listeners: Map<FavoriteEventType, Set<(propertyId: string) => void>> = new Map();

  // Suscribirse a eventos de favoritos
  subscribe(eventType: FavoriteEventType, callback: (propertyId: string) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Retornar función para desuscribirse
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  // Emitir evento de favorito
  emit(eventType: FavoriteEventType, propertyId: string) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(propertyId);
        } catch (error) {
          console.error('Error in favorite event callback:', error);
        }
      });
    }
  }

  // Limpiar todos los listeners
  clear() {
    this.listeners.clear();
  }
}

// Instancia global del manager
export const favoriteEventManager = new FavoriteEventManager();

// Hook para usar eventos de favoritos
export const useFavoriteEvents = () => {
  const subscribeToFavoriteAdded = (callback: (propertyId: string) => void) => {
    return favoriteEventManager.subscribe('favorite_added', callback);
  };

  const subscribeToFavoriteRemoved = (callback: (propertyId: string) => void) => {
    return favoriteEventManager.subscribe('favorite_removed', callback);
  };

  const emitFavoriteAdded = (propertyId: string) => {
    favoriteEventManager.emit('favorite_added', propertyId);
  };

  const emitFavoriteRemoved = (propertyId: string) => {
    favoriteEventManager.emit('favorite_removed', propertyId);
  };

  return {
    subscribeToFavoriteAdded,
    subscribeToFavoriteRemoved,
    emitFavoriteAdded,
    emitFavoriteRemoved
  };
};
