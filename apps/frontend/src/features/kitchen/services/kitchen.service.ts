import Decimal from 'decimal.js';

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
      currentQuantity: '1.750',
      initialQuantity: '2.000',
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
      currentQuantity: '4.500',
      initialQuantity: '5.000',
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
      currentQuantity: '12.000',
      initialQuantity: '15.000',
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
      console.warn(`[KitchenService] API respondio con estatus ${response.status}. Usando fallback offline.`);
    } catch (err) {
      console.error('[KitchenService] Error en fetchActiveRemanentes, cayendo a modo offline:', err);
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
      console.warn(`[KitchenService] consumeRemanente HTTP status ${response.status}`);
    } catch (err) {
      console.error('[KitchenService] Error de red en consumeRemanente:', err);
    }

    // Aritmetica Decimal de Alta Precision con decimal.js (Guard 17)
    const found = this.mockRemanentes.find((r) => r.id === remanenteId);
    if (found) {
      const currentDec = new Decimal(found.currentQuantity);
      const subDec = new Decimal(quantity.toString());
      const nextDec = Decimal.max(0, currentDec.minus(subDec));
      found.currentQuantity = nextDec.toFixed(3);
      if (nextDec.isZero()) {
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
      console.warn(`[KitchenService] discardRemanente HTTP status ${response.status}`);
    } catch (err) {
      console.error('[KitchenService] Error de red en discardRemanente:', err);
    }

    const found = this.mockRemanentes.find((r) => r.id === remanenteId);
    if (found) {
      found.currentQuantity = '0.000';
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
      console.warn(`[KitchenService] consumeRecipe HTTP status ${response.status}`);
    } catch (err) {
      console.error('[KitchenService] Error de red en consumeRecipe:', err);
    }

    // Aritmetica Decimal de Alta Precision con decimal.js (Guard 17)
    if (this.mockRemanentes.length > 0) {
      const first = this.mockRemanentes[0];
      const currentDec = new Decimal(first.currentQuantity);
      const portionDec = new Decimal('0.150').times(new Decimal(portions));
      const nextDec = Decimal.max(0, currentDec.minus(portionDec));
      first.currentQuantity = nextDec.toFixed(3);
      if (nextDec.isZero()) first.status = 'EXHAUSTED';
    }
  }

  public static addLocalRemanente(item: RemanenteFEFOItem): void {
    this.mockRemanentes.unshift(item);
  }
}
