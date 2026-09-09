import { apiRequest } from '../../../shared/http/apiClient.js';
import { DecimalQuantity } from '../../../shared/domain/DecimalQuantity.js';
import { RecipesService } from '../../recipes/services/recipes.service.js';

export interface RecipeItem {
  id: string;
  name: string;
  category: string;
  description: string;
  ingredientsSummary: string;
}

/** US-033: tipo de unidad refrigerante, con umbral FDA propio en el dominio del backend. */
export type TemperatureUnitType = 'REFRIGERATOR' | 'FREEZER';

export interface RecordTemperatureLogDTO {
  storageLocationId: string;
  unitType: TemperatureUnitType;
  /** Decimal como string (Guard 17): hasta 3 dígitos enteros y 2 decimales, ej. "-18.00". */
  temperatureCelsius: string;
}

/* jscpd:ignore-start — espejo deliberado de TemperatureLogOutputDTO del backend.
   openapi.yaml es la SSoT; front y back son paquetes separados sin tipo compartido. */
export interface TemperatureLogItem {
  id: string;
  storageLocationId: string;
  unitType: TemperatureUnitType;
  temperatureCelsius: string;
  /** Calculado en el dominio del backend, nunca persistido — solo advierte, jamás bloquea. */
  isWithinSafeRange: boolean;
  recordedByUserId: string;
  recordedAt: string;
}
/* jscpd:ignore-end */

export interface TemperatureLogFilters {
  storageLocationId?: string;
  startDate?: string;
  endDate?: string;
}

// US-007 v1.1.0 / TK-111-FE
interface RecipeIngredientAvailability {
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  requiredQuantity: string;
  availableQuantity: string;
  isSufficient: boolean;
}

export interface RecipeAvailability {
  recipeId: string;
  recipeName: string;
  portions: number;
  ingredients: RecipeIngredientAvailability[];
  isFullyAvailable: boolean;
}

export interface RemanenteFEFOItem {
  id: string;
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  currentQuantity: string;
  initialQuantity: string;
  location: string;
  // US-026 / TK-112-FE: el backend (`GetActiveRemanentesUseCase`) ya lo enviaba —
  // el tipo del frontend lo descartaba en silencio, dejando el filtro por área
  // sin forma de distinguir un área real de otra (solo tenía el nombre en `location`).
  storageLocationId?: string;
  expirationDate: string;
  hoursRemaining: number;
  isCriticalAlert: boolean;
  status: string;
}

// Recetas de demo (TK-061): mismas 3 usadas historicamente como DEFAULT_RECIPES en
// RecipeSelectorModal.tsx — ahora sirven solo como fallback offline, mismo patron que
// mockRemanentes/mockWasteReport en este archivo y en reports.service.ts.
const FALLBACK_RECIPES: RecipeItem[] = [
  {
    id: 'rec-pizza-margarita',
    name: 'Pizza Margarita',
    category: 'PIZZA',
    description: '1 Masa + 0.15 kg Queso Mozzarella + 0.10 kg Salsa Pomodoro',
    ingredientsSummary: 'Insumos: Queso Mozzarella, Salsa, Masa',
  },
  {
    id: 'rec-pasta-pomodoro',
    name: 'Pasta Pomodoro',
    category: 'PASTA',
    description: '0.20 kg Pasta Fettuccine + 0.15 kg Salsa Pomodoro',
    ingredientsSummary: 'Insumos: Pasta, Salsa Pomodoro',
  },
  {
    id: 'rec-ensalada-cesar',
    name: 'Ensalada César',
    category: 'ENSALADA',
    description: '0.15 kg Lechuga + 0.10 kg Pollo + 0.05 kg Aderezo',
    ingredientsSummary: 'Insumos: Lechuga, Pollo, Aderezo',
  },
];

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
      const path = location
        ? `/kitchen/remanentes-activos?location=${location}`
        : '/kitchen/remanentes-activos';
      return await apiRequest<RemanenteFEFOItem[]>(path);
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

  public static async checkActiveRemanente(insumoId: string): Promise<RemanenteFEFOItem[]> {
    try {
      return await apiRequest<RemanenteFEFOItem[]>(
        `/kitchen/remanentes-activos?insumoId=${encodeURIComponent(insumoId)}`
      );
    } catch (err) {
      console.error('[KitchenService] Error en checkActiveRemanente, omitiendo advertencia de apertura duplicada:', err);
      return [];
    }
  }

  // ADR-004 / US-004 / TK-108-FE: reasonId es obligatorio (catálogo administrable, US-030);
  // notes es texto libre siempre opcional.
  public static async consumeRemanente(remanenteId: string, quantity: number | string, reasonId: string, notes?: string): Promise<void> {
    try {
      await apiRequest(`/kitchen/remanentes/${remanenteId}/consume`, { method: 'POST', body: { quantity, reasonId, notes } });
      return;
    } catch (err) {
      console.error('[KitchenService] Error de red en consumeRemanente:', err);
    }

    // Aritmetica Decimal de Alta Precision (Guard 17) via el VO compartido shared/domain/DecimalQuantity
    const found = this.mockRemanentes.find((r) => r.id === remanenteId);
    if (found) {
      const next = new DecimalQuantity(found.currentQuantity).subtractClamped(quantity.toString());
      found.currentQuantity = next.toFixed(3);
      if (next.isZero()) {
        found.status = 'EXHAUSTED';
      }
    }
  }

  public static async discardRemanente(remanenteId: string, reason: string): Promise<void> {
    try {
      await apiRequest(`/kitchen/remanentes/${remanenteId}/discard`, { method: 'POST', body: { reason } });
      return;
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
      await apiRequest(`/kitchen/recipes/${recipeId}/consume`, { method: 'POST', body: { portions } });
      return;
    } catch (err) {
      console.error('[KitchenService] Error de red en consumeRecipe:', err);
    }

    // Aritmetica Decimal de Alta Precision (Guard 17) via el VO compartido shared/domain/DecimalQuantity
    if (this.mockRemanentes.length > 0) {
      const first = this.mockRemanentes[0];
      const portionCost = new DecimalQuantity('0.150').times(portions);
      const next = new DecimalQuantity(first.currentQuantity).subtractClamped(portionCost.toFixed(3));
      first.currentQuantity = next.toFixed(3);
      if (next.isZero()) first.status = 'EXHAUSTED';
    }
  }

  public static addLocalRemanente(item: RemanenteFEFOItem): void {
    this.mockRemanentes.unshift(item);
  }

  public static async fetchAvailableRecipes(): Promise<RecipeItem[]> {
    try {
      const [recipes, insumos] = await Promise.all([RecipesService.listRecipes(), RecipesService.listInsumos()]);
      const insumoNameById = new Map(insumos.map((insumo) => [insumo.id, insumo.name]));

      return recipes.map((recipe) => {
        const ingredientNames = recipe.ingredients.map(
          (ingredient) => insumoNameById.get(ingredient.insumoId) ?? ingredient.insumoId
        );
        const description = recipe.ingredients
          .map((ingredient, index) => `${ingredient.quantity} ${ingredientNames[index]}`)
          .join(' + ');

        return {
          id: recipe.id,
          name: recipe.name,
          category: recipe.category,
          description: description || recipe.description || 'Sin ingredientes registrados',
          ingredientsSummary: `Insumos: ${ingredientNames.join(', ') || 'sin insumos'}`,
        };
      });
    } catch (err) {
      console.error('[KitchenService] Error en fetchAvailableRecipes, cayendo a modo offline:', err);
      return FALLBACK_RECIPES;
    }
  }

  // US-007 v1.1.0 / TK-111-FE: a diferencia de los demás métodos de esta clase, NO cae a
  // datos mock en modo offline — mostrar una disponibilidad inventada sería peor que no
  // mostrar ninguna. El modal decide qué hacer si esta llamada falla (no bloquea el envío).
  public static async fetchRecipeAvailability(recipeId: string, portions: number): Promise<RecipeAvailability> {
    return apiRequest<RecipeAvailability>(`/kitchen/recipes/${recipeId}/availability?portions=${portions}`);
  }

  // US-033 / TK-120-FE: sin fallback a mock (AUDIT-DEV-006 F-5) — una lectura de
  // temperatura inventada es peor que ninguna, es un registro sanitario.
  public static async recordTemperatureLog(data: RecordTemperatureLogDTO): Promise<TemperatureLogItem> {
    return apiRequest<TemperatureLogItem>('/kitchen/temperature-logs', { method: 'POST', body: data });
  }

  // US-033: histórico solo-ADMIN (el backend lo gatea con requireRole('ADMIN')).
  public static async fetchTemperatureLogs(filters: TemperatureLogFilters = {}): Promise<TemperatureLogItem[]> {
    const params = new URLSearchParams();
    if (filters.storageLocationId) params.set('storageLocationId', filters.storageLocationId);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    const query = params.toString();

    return apiRequest<TemperatureLogItem[]>(`/kitchen/temperature-logs${query ? `?${query}` : ''}`);
  }
}
