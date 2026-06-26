export type PantryItem = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  quantity: string;
  addedAt: string;
  expiresAt: string; // ISO
  estimated: boolean;
  pricePaid: number;
  location: "Fridge" | "Pantry" | "Freezer";
};

const today = new Date();
const daysFromNow = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

export const pantryItems: PantryItem[] = [
  { id: "1", name: "Greek Yogurt", emoji: "🥛", category: "Dairy", quantity: "500g", addedAt: daysFromNow(-3), expiresAt: daysFromNow(2), estimated: false, pricePaid: 2.4, location: "Fridge" },
  { id: "2", name: "Chicken Breast", emoji: "🍗", category: "Meat", quantity: "600g", addedAt: daysFromNow(-1), expiresAt: daysFromNow(1), estimated: false, pricePaid: 6.2, location: "Fridge" },
  { id: "3", name: "Spinach", emoji: "🥬", category: "Produce", quantity: "1 bag", addedAt: daysFromNow(-2), expiresAt: daysFromNow(0), estimated: true, pricePaid: 1.8, location: "Fridge" },
  { id: "4", name: "Whole Milk", emoji: "🥛", category: "Dairy", quantity: "1L", addedAt: daysFromNow(-4), expiresAt: daysFromNow(5), estimated: false, pricePaid: 1.1, location: "Fridge" },
  { id: "5", name: "Sourdough Bread", emoji: "🍞", category: "Bakery", quantity: "1 loaf", addedAt: daysFromNow(-1), expiresAt: daysFromNow(3), estimated: true, pricePaid: 3.5, location: "Pantry" },
  { id: "6", name: "Eggs", emoji: "🥚", category: "Dairy", quantity: "12 ct", addedAt: daysFromNow(-5), expiresAt: daysFromNow(14), estimated: false, pricePaid: 3.2, location: "Fridge" },
  { id: "7", name: "Cherry Tomatoes", emoji: "🍅", category: "Produce", quantity: "500g", addedAt: daysFromNow(-2), expiresAt: daysFromNow(4), estimated: false, pricePaid: 2.6, location: "Fridge" },
  { id: "8", name: "Pasta", emoji: "🍝", category: "Pantry", quantity: "500g", addedAt: daysFromNow(-10), expiresAt: daysFromNow(240), estimated: false, pricePaid: 1.4, location: "Pantry" },
  { id: "9", name: "Salmon Fillet", emoji: "🐟", category: "Seafood", quantity: "300g", addedAt: daysFromNow(0), expiresAt: daysFromNow(2), estimated: false, pricePaid: 8.9, location: "Fridge" },
  { id: "10", name: "Avocado", emoji: "🥑", category: "Produce", quantity: "2 ct", addedAt: daysFromNow(-1), expiresAt: daysFromNow(3), estimated: true, pricePaid: 2.0, location: "Pantry" },
];

export const wastedThisMonth = {
  moneyLost: 42.6,
  itemsLost: 11,
  weightKg: 3.2,
  vsLastMonth: -18, // %
};

export const wasteByWeek = [
  { label: "W1", value: 8.2 },
  { label: "W2", value: 12.4 },
  { label: "W3", value: 6.1 },
  { label: "W4", value: 15.9 },
];

export const topWastedFoods = [
  { name: "Spinach", emoji: "🥬", you: 6, avg: 4 },
  { name: "Bread", emoji: "🍞", you: 5, avg: 3 },
  { name: "Berries", emoji: "🫐", you: 4, avg: 5 },
  { name: "Milk", emoji: "🥛", you: 3, avg: 2 },
  { name: "Cilantro", emoji: "🌿", you: 3, avg: 4 },
  { name: "Lettuce", emoji: "🥗", you: 2, avg: 3 },
  { name: "Bananas", emoji: "🍌", you: 2, avg: 4 },
  { name: "Yogurt", emoji: "🥣", you: 2, avg: 2 },
  { name: "Tomatoes", emoji: "🍅", you: 1, avg: 3 },
  { name: "Cheese", emoji: "🧀", you: 1, avg: 2 },
];

export function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
