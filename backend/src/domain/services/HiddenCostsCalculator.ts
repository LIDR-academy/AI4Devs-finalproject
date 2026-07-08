/**
 * HiddenCostsCalculator (T053).
 * Wraps the HiddenCosts value object.
 */
import { HiddenCosts } from '../value-objects/HiddenCosts';
import type { Region } from '../value-objects/FinancialProfile';

export class HiddenCostsCalculator {
  calculate(price: number, region: Region, isNewHousing = false): HiddenCosts {
    return HiddenCosts.calculate(price, region, isNewHousing);
  }
}
