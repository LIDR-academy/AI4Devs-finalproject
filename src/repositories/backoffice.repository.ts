import type { CopyState } from "@/domain/copy/lifecycle";

/** Puerto de lectura y gestión del back-office (tareas 8.1–8.3). */

/** Una copia en la cola de trabajo, con lo justo para decidir qué hacer con ella. */
export interface WorkItem {
  copyId: string;
  setId: string;
  setName: string;
  state: CopyState;
  /** Desde cuándo está en este estado; ordena el trabajo por antigüedad. */
  since: Date;
  rentalId: string | null;
  subscriberName: string | null;
}

/** Ficha de cliente en su versión limitada (soporte) o completa (admin). */
export interface CustomerSummary {
  id: string;
  fullName: string;
  status: "ACTIVE" | "SUSPENDED";
  planCode: "BASIC" | "PREMIUM" | null;
  subscriptionStatus: "ACTIVE" | "PAUSED" | "CANCELLED" | null;
  activeRentals: number;
  queueEntries: number;
  /** Solo en la vista completa (`customer.read_full`). */
  email?: string;
  subscribedSince?: Date | null;
  address?: string | null;
}

export interface CustomerHistoryEntry {
  rentalId: string;
  setName: string;
  /** El mismo conjunto cerrado que `RentalSummary.status`: la interfaz lo traduce
   *  a etiqueta, así que aquí no puede ser un `string` cualquiera. */
  status: "ACTIVE" | "RETURN_INITIATED" | "IN_INSPECTION" | "COMPLETED";
  startedAt: Date;
  completedAt: Date | null;
}

export interface Employee {
  id: string;
  email: string;
  fullName: string;
  role: "OPERATOR" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
}

export interface BackofficeRepository {
  /** Copias que requieren intervención, agrupables por estado. */
  findWorkQueue(): Promise<readonly WorkItem[]>;

  listCustomers(): Promise<readonly CustomerSummary[]>;
  findCustomer(userId: string): Promise<CustomerSummary | null>;
  findCustomerHistory(userId: string): Promise<readonly CustomerHistoryEntry[]>;

  listEmployees(): Promise<readonly Employee[]>;
  createEmployee(input: {
    email: string;
    passwordHash: string;
    fullName: string;
    role: "OPERATOR" | "ADMIN";
  }): Promise<Employee | null>;
  updateEmployee(input: {
    userId: string;
    role?: "OPERATOR" | "ADMIN";
    status?: "ACTIVE" | "SUSPENDED";
  }): Promise<Employee | null>;

  /** Parámetros configurables, tal como están guardados. */
  upsertSetting(input: { key: string; value: number; adminId: string; at: Date }): Promise<void>;
}
