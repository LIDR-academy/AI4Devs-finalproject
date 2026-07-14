import type { UserRole } from "@prisma/client";

export function canViewAllClients(role: UserRole | null) {
  return role === "ADMIN" || role === "PARTNER";
}

export function canManageSuppliers(role: UserRole | null) {
  return role === "ADMIN" || role === "PARTNER";
}

export function canManageProducts(role: UserRole | null) {
  return role === "ADMIN" || role === "PARTNER";
}

export function canManageOrders(role: UserRole | null) {
  return role === "ADMIN" || role === "PARTNER";
}