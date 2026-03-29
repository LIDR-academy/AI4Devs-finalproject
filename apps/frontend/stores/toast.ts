import { defineStore } from 'pinia';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([]);

  function add(notification: Omit<ToastItem, 'id'>) {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    const newItem: ToastItem = {
      id,
      duration: 3000, // default duration
      ...notification,
    };
    
    items.value.push(newItem);

    if (newItem.duration && newItem.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, newItem.duration);
    }
  }

  function remove(id: string) {
    items.value = items.value.filter((i) => i.id !== id);
  }

  return {
    items,
    add,
    remove,
  };
});
