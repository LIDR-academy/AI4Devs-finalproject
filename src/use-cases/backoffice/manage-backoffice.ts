import { hashPassword } from "@/domain/auth/password";
import { can } from "@/domain/auth/permissions";
import type { Role } from "@/domain/auth/roles";
import { ForbiddenError, NotFoundError, ValidationError } from "@/domain/errors";
import { SYSTEM_SETTING_KEYS, type SystemSettingKey } from "@/domain/settings/system-settings";
import { normalizeEmail } from "@/use-cases/auth/login";
import type { AuditRepository } from "@/repositories/audit.repository";
import type {
  BackofficeRepository,
  CustomerHistoryEntry,
  CustomerSummary,
  Employee,
  WorkItem,
} from "@/repositories/backoffice.repository";

export interface BackofficeDeps {
  backoffice: BackofficeRepository;
  audit: AuditRepository;
  now?: () => Date;
}

export interface Actor {
  id: string;
  role: Role;
}

/** Cola de trabajo del operador: copias que esperan una acción (8.1). */
export async function loadWorkQueue(
  { backoffice }: BackofficeDeps,
  actor: Actor
): Promise<readonly WorkItem[]> {
  requirePermission(actor, "backoffice.access", "No tienes acceso al back-office.");
  return backoffice.findWorkQueue();
}

/**
 * Ficha de cliente **recortada según el permiso** (8.3).
 *
 * El operador la ve en modo limitado —lo justo para atender una llamada— y el admin
 * completa. El recorte se hace aquí, en un solo sitio: si cada pantalla decidiera qué
 * ocultar, bastaría con olvidarlo una vez.
 */
export function projectCustomer(customer: CustomerSummary, actor: Actor): CustomerSummary {
  if (can(actor.role, "customer.read_full")) return customer;

  const { email: _email, subscribedSince: _since, address: _address, ...limited } = customer;
  return limited;
}

export async function listCustomers(
  { backoffice }: BackofficeDeps,
  actor: Actor
): Promise<readonly CustomerSummary[]> {
  requirePermission(actor, "customer.read_limited", "No puedes consultar clientes.");
  const customers = await backoffice.listCustomers();
  return customers.map((customer) => projectCustomer(customer, actor));
}

export async function viewCustomer(
  { backoffice }: BackofficeDeps,
  input: { userId: string; actor: Actor }
): Promise<{ customer: CustomerSummary; history: readonly CustomerHistoryEntry[] }> {
  requirePermission(input.actor, "customer.read_limited", "No puedes consultar clientes.");

  const customer = await backoffice.findCustomer(input.userId);
  if (!customer) throw new NotFoundError("El cliente no existe.");

  // El historial de alquileres sí lo ve también el operador: es justo lo que necesita
  // para dar soporte por teléfono (D6).
  const history = await backoffice.findCustomerHistory(input.userId);
  return { customer: projectCustomer(customer, input.actor), history };
}

/** Gestión de empleados — solo admin (8.2). */
export async function listEmployees(
  { backoffice }: BackofficeDeps,
  actor: Actor
): Promise<readonly Employee[]> {
  requirePermission(actor, "employee.manage", "Solo un administrador gestiona el personal.");
  return backoffice.listEmployees();
}

export async function createEmployee(
  { backoffice, audit, now = () => new Date() }: BackofficeDeps,
  input: { email: string; password: string; fullName: string; role: "OPERATOR" | "ADMIN"; actor: Actor }
): Promise<Employee> {
  requirePermission(input.actor, "employee.manage", "Solo un administrador gestiona el personal.");

  const employee = await backoffice.createEmployee({
    email: normalizeEmail(input.email),
    passwordHash: await hashPassword(input.password),
    fullName: input.fullName.trim(),
    role: input.role,
  });
  if (!employee) {
    throw new ValidationError([{ field: "email", issue: "Ya existe una cuenta con este email." }]);
  }

  await audit.record({
    actorId: input.actor.id,
    action: "employee.created",
    entityType: "User",
    entityId: employee.id,
    metadata: { email: employee.email, role: employee.role },
    at: now(),
  });

  return employee;
}

export async function updateEmployee(
  { backoffice, audit, now = () => new Date() }: BackofficeDeps,
  input: {
    userId: string;
    role?: "OPERATOR" | "ADMIN";
    status?: "ACTIVE" | "SUSPENDED";
    actor: Actor;
  }
): Promise<Employee> {
  requirePermission(input.actor, "employee.manage", "Solo un administrador gestiona el personal.");

  if (input.userId === input.actor.id) {
    // Quitarse a uno mismo el rol de admin, o suspenderse, dejaría el sistema sin
    // quien pueda deshacerlo.
    throw new ValidationError([
      { field: "userId", issue: "No puedes cambiar tu propio rol ni suspenderte." },
    ]);
  }

  const employee = await backoffice.updateEmployee(input);
  if (!employee) throw new NotFoundError("El empleado no existe.");

  await audit.record({
    actorId: input.actor.id,
    action: input.status === "SUSPENDED" ? "user.suspended" : "employee.role_changed",
    entityType: "User",
    entityId: employee.id,
    metadata: { role: employee.role, status: employee.status },
    at: now(),
  });

  return employee;
}

/** Configuración de parámetros del sistema — solo admin (8.2). */
export async function updateSetting(
  { backoffice, audit, now = () => new Date() }: BackofficeDeps,
  input: { key: string; value: number; actor: Actor }
): Promise<{ key: SystemSettingKey; value: number }> {
  requirePermission(input.actor, "settings.manage", "Solo un administrador configura el sistema.");

  if (!SYSTEM_SETTING_KEYS.includes(input.key as SystemSettingKey)) {
    // El catálogo es cerrado: aceptar claves libres llenaría la tabla de parámetros
    // que nadie lee y que nunca se sabría si están mal escritos.
    throw new ValidationError([{ field: "key", issue: "Ese parámetro no existe." }]);
  }
  if (!Number.isFinite(input.value) || input.value < 0) {
    throw new ValidationError([{ field: "value", issue: "Debe ser un número no negativo." }]);
  }

  const at = now();
  const key = input.key as SystemSettingKey;
  await backoffice.upsertSetting({ key, value: input.value, adminId: input.actor.id, at });

  await audit.record({
    actorId: input.actor.id,
    action: "settings.updated",
    entityType: "SystemSetting",
    // `entityId` es UUID en la base; la clave legible va en el metadata.
    entityId: null,
    metadata: { key, value: input.value },
    at,
  });

  return { key, value: input.value };
}

function requirePermission(
  actor: Actor,
  permission: Parameters<typeof can>[1],
  message: string
): void {
  if (!can(actor.role, permission)) throw new ForbiddenError(message);
}
