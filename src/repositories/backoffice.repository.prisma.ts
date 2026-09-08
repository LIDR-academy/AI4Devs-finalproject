import { prisma } from "@/db/prisma";
import type { CopyState } from "@/domain/copy/lifecycle";
import { OCCUPYING_COPY_STATES } from "@/domain/subscriptions/eligibility";
import type {
  BackofficeRepository,
  CustomerSummary,
  Employee,
  WorkItem,
} from "@/repositories/backoffice.repository";

/** Adaptador Prisma del puerto `BackofficeRepository`. */

/**
 * Estados que exigen que alguien haga algo **por el estado en sí**. `DISPONIBLE`,
 * `OFRECIDA` y `BAJA` no aparecen: no hay nada que el back-office deba hacer con ellos.
 */
const ACTIONABLE_STATES = [
  "INTAKE",
  "EN_DEVOLUCION",
  "EN_INSPECCION",
  "EN_HIGIENIZACION",
  "INCOMPLETA",
] as const satisfies readonly CopyState[];

/**
 * `ALQUILADA` es el caso aparte, y era el bloqueo de W2 (`wireframes.md` §8.1): una
 * copia adjudicada espera a que el operador registre su condición y prepare el envío,
 * y sin esto **no había forma de enterarse** — la pantalla de registro era inalcanzable.
 *
 * No basta con añadir el estado: registrar la condición **no mueve la copia** —crea el
 * informe y el envío `OUTBOUND`, pero sigue en `ALQUILADA`—, así que se excluyen las
 * que ya tengan envío de salida. Si no, lo preparado se quedaría en la cola para
 * siempre. Es una condición más en la consulta, no un estado nuevo.
 */
const PENDING_DISPATCH = {
  state: "ALQUILADA",
  rentals: {
    some: {
      status: { not: "COMPLETED" },
      shipments: { none: { direction: "OUTBOUND" } },
    },
  },
} as const;

export const prismaBackofficeRepository: BackofficeRepository = {
  async findWorkQueue() {
    const copies = await prisma.copy.findMany({
      where: { OR: [{ state: { in: [...ACTIONABLE_STATES] } }, PENDING_DISPATCH] },
      select: {
        id: true,
        state: true,
        setId: true,
        set: { select: { name: true } },
        // La transición más reciente da el "desde cuándo": es lo que ordena el
        // trabajo por antigüedad sin necesidad de una columna extra.
        stateTransitions: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        rentals: {
          where: { status: { not: "COMPLETED" } },
          select: { id: true, user: { select: { fullName: true } } },
          take: 1,
        },
        acquiredAt: true,
      },
    });

    return copies
      .map(
        (copy): WorkItem => ({
          copyId: copy.id,
          setId: copy.setId,
          setName: copy.set.name,
          state: copy.state as CopyState,
          since: copy.stateTransitions[0]?.createdAt ?? copy.acquiredAt,
          rentalId: copy.rentals[0]?.id ?? null,
          subscriberName: copy.rentals[0]?.user.fullName ?? null,
        })
      )
      .sort((a, b) => a.since.getTime() - b.since.getTime());
  },

  async listCustomers() {
    const users = await prisma.user.findMany({
      where: { role: "SUBSCRIBER" },
      select: CUSTOMER_SELECT,
      orderBy: { fullName: "asc" },
    });
    return users.map(toCustomer);
  },

  async findCustomer(userId) {
    const user = await prisma.user.findFirst({
      where: { id: userId, role: "SUBSCRIBER" },
      select: CUSTOMER_SELECT,
    });
    return user ? toCustomer(user) : null;
  },

  async findCustomerHistory(userId) {
    const rentals = await prisma.rental.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        startedAt: true,
        completedAt: true,
        copy: { select: { set: { select: { name: true } } } },
      },
      orderBy: { startedAt: "desc" },
      take: 50,
    });

    return rentals.map((rental) => ({
      rentalId: rental.id,
      setName: rental.copy.set.name,
      status: rental.status,
      startedAt: rental.startedAt,
      completedAt: rental.completedAt,
    }));
  },

  async listEmployees() {
    const users = await prisma.user.findMany({
      where: { role: { in: ["OPERATOR", "ADMIN"] } },
      select: { id: true, email: true, fullName: true, role: true, status: true },
      orderBy: { fullName: "asc" },
    });
    return users as Employee[];
  },

  async createEmployee({ email, passwordHash, fullName, role }) {
    try {
      const user = await prisma.user.create({
        data: { email, passwordHash, fullName, role, isAdult: true },
        select: { id: true, email: true, fullName: true, role: true, status: true },
      });
      return user as Employee;
    } catch (error) {
      // Email ya registrado: quien llama lo traduce a un error de validación.
      if ((error as { code?: string }).code === "P2002") return null;
      throw error;
    }
  },

  async updateEmployee({ userId, role, status }) {
    const { count } = await prisma.user.updateMany({
      // El filtro por rol impide convertir a un suscriptor en empleado por esta vía:
      // dar de alta personal es otra operación, con su propia auditoría.
      where: { id: userId, role: { in: ["OPERATOR", "ADMIN"] } },
      data: { ...(role ? { role } : {}), ...(status ? { status } : {}) },
    });
    if (count === 0) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, role: true, status: true },
    });
    return user as Employee | null;
  },

  async upsertSetting({ key, value, adminId, at }) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: value as never, updatedById: adminId, updatedAt: at },
      create: { key, value: value as never, updatedById: adminId },
    });
  },
};

// Copias en arrays mutables: dentro de un objeto `as const` un literal se vuelve
// `readonly`, y Prisma no acepta arrays de solo lectura en un filtro `in`.
const OCCUPYING: CopyState[] = [...OCCUPYING_COPY_STATES];
const ACTIVE_QUEUE_STATUSES: Array<"WAITING" | "OFFERED"> = ["WAITING", "OFFERED"];

const CUSTOMER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  status: true,
  subscriptions: {
    where: { status: { not: "CANCELLED" as const } },
    select: { status: true, startedAt: true, plan: { select: { code: true } } },
    orderBy: { startedAt: "desc" as const },
    take: 1,
  },
  addresses: {
    select: { line1: true, city: true, postalCode: true },
    orderBy: { isDefault: "desc" as const },
    take: 1,
  },
  _count: {
    select: {
      // Las **dos** condiciones, como en el resto de consultas que cuentan plaza
      // ocupada (`subscription.repository` → `currentCopyStates`). Filtrar solo por el
      // estado de la copia contaba los alquileres **ya cerrados** de una copia que hoy
      // está fuera con otra persona: el cliente aparecía con cinco sets y su historial
      // los tenía todos devueltos.
      rentals: {
        where: { status: { not: "COMPLETED" }, copy: { state: { in: OCCUPYING } } },
      },
      queueEntries: { where: { status: { in: ACTIVE_QUEUE_STATUSES } } },
    },
  },
} as const;

type CustomerRow = {
  id: string;
  email: string;
  fullName: string;
  status: "ACTIVE" | "SUSPENDED";
  subscriptions: Array<{
    status: "ACTIVE" | "PAUSED" | "CANCELLED";
    startedAt: Date;
    plan: { code: "BASIC" | "PREMIUM" };
  }>;
  addresses: Array<{ line1: string; city: string; postalCode: string }>;
  _count: { rentals: number; queueEntries: number };
};

/**
 * Devuelve la ficha **completa**. El recorte a la versión limitada se hace en el caso
 * de uso, que es quien conoce el permiso de quien pregunta: si se hiciera aquí, cada
 * consulta nueva tendría que acordarse de repetirlo.
 */
function toCustomer(row: CustomerRow): CustomerSummary {
  const subscription = row.subscriptions[0];
  const address = row.addresses[0];

  return {
    id: row.id,
    fullName: row.fullName,
    status: row.status,
    planCode: subscription?.plan.code ?? null,
    subscriptionStatus: subscription?.status ?? null,
    activeRentals: row._count.rentals,
    queueEntries: row._count.queueEntries,
    email: row.email,
    subscribedSince: subscription?.startedAt ?? null,
    address: address ? `${address.line1}, ${address.postalCode} ${address.city}` : null,
  };
}
