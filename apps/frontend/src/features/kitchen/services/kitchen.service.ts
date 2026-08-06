export interface RemanenteFEFOItem {
  id: string;
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  currentQuantity: string;
  initialQuantity: string;
  location: string;
  expirationDate: string;
  hoursRemaining: number;
  isCriticalAlert: boolean;
  status: string;
}

export class KitchenService {
  private static mockRemanentes: RemanenteFEFOItem[] = [
    {
      id: 'rem-101',
      insumoId: 'ins-1',
      insumoName: 'Queso Mozzarella',
      unitOfMeasure: 'KG',
      currentQuantity: '1.7500',
      initialQuantity: '2.0000',
      location: 'KITCHEN_FRIDGE',
      expirationDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      hoursRemaining: 2.0,
      isCriticalAlert: true,
      status: 'ACTIVE',
    },
    {
      id: 'rem-102',
      insumoId: 'ins-2',
      insumoName: 'Salsa Pomodoro',
      unitOfMeasure: 'L',
      currentQuantity: '4.5000',
      initialQuantity: '5.0000',
      location: 'KITCHEN_FRIDGE',
      expirationDate: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
      hoursRemaining: 14.0,
      isCriticalAlert: true,
      status: 'ACTIVE',
    },
    {
      id: 'rem-103',
      insumoId: 'ins-3',
      insumoName: 'Masa de Pizza',
      unitOfMeasure: 'UNITS',
      currentQuantity: '12.0000',
      initialQuantity: '15.0000',
      location: 'KITCHEN_PREP',
      expirationDate: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      hoursRemaining: 22.0,
      isCriticalAlert: true,
      status: 'ACTIVE',
    },
  ];

  public static async fetchActiveRemanentes(location?: string): Promise<RemanenteFEFOItem[]> {
    try {
      const url = location
        ? `/api/v1/kitchen/remanentes-activos?location=${location}`
        : '/api/v1/kitchen/remanentes-activos';
      const response = await fetch(url);
      if (response.ok) {
        return (await response.json()) as RemanenteFEFOItem[];
      }
    } catch {
      // Fallback offline
    }

    let list = [...this.mockRemanentes].filter((r) => r.status === 'ACTIVE');
    if (location) {
      list = list.filter((r) => r.location === location);
    }
    return list.sort(
      (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
    );
  }

  public static async consumeRemanente(remanenteId: string, quantity: number | string): Promise<void> {
    try {
      const response = await fetch(`/api/v1/kitchen/remanentes/${remanenteId}/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (response.ok) return;
    } catch {
      // Fallback offline
    }

    const found = this.mockRemanentes.find((r) => r.id === remanenteId);
    if (found) {
      const current = parseFloat(found.currentQuantity);
      const sub = parseFloat(quantity.toString());
      const next = Math.max(0, current - sub);
      found.currentQuantity = next.toFixed(4);
      if (next === 0) {
        found.status = 'EXHAUSTED';
      }
    }
  }

  public static async discardRemanente(remanenteId: string, reason: string): Promise<void> {
    try {
      const response = await fetch(`/api/v1/kitchen/remanentes/${remanenteId}/discard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (response.ok) return;
    } catch {
      // Fallback offline
    }

    const found = this.mockRemanentes.find((r) => r.id === remanenteId);
    if (found) {
      found.currentQuantity = '0.0000';
      found.status = 'DISCARDED';
    }
  }

  public static async consumeRecipe(recipeId: string, portions: number): Promise<void> {
    try {
      const response = await fetch(`/api/v1/kitchen/recipes/${recipeId}/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portions }),
      });
      if (response.ok) return;
    } catch {
      // Fallback offline
    }

    // Descuento simulado offline sobre mockRemanentes
    if (this.mockRemanentes.length > 0) {
      const first = this.mockRemanentes[0];
      const current = parseFloat(first.currentQuantity);
      const next = Math.max(0, current - 0.15 * portions);
      first.currentQuantity = next.toFixed(4);
      if (next === 0) first.status = 'EXHAUSTED';
    }
  }

  public static addLocalRemanente(item: RemanenteFEFOItem): void {
    this.mockRemanentes.unshift(item);
  }
}
