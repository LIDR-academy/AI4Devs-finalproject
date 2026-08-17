import { prisma } from "@/db/prisma";
import type { CopyState } from "@/domain/copy/lifecycle";
import { OCCUPYING_COPY_STATES } from "@/domain/subscriptions/eligibility";
import type {
  ActiveSubscription,
  PlanConfig,
  SubscriptionRepository,
} from "@/repositories/subscription.repository";

/** Adaptador Prisma del puerto `SubscriptionRepository`. */

const SUBSCRIPTION_SELECT = {
  id: true,
  userId: true,
  status: true,
  startedAt: true,
  plan: { select: { code: true, maxSimultaneousSets: true, queueBonus: true } },
} as const;

type SubscriptionRow = {
  id: string;
  userId: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  startedAt: Date;
  plan: { code: "BASIC" | "PREMIUM"; maxSimultaneousSets: number; queueBonus: number };
};

function toSubscription(row: SubscriptionRow): ActiveSubscription {
  return {
    id: row.id,
    userId: row.userId,
    planCode: row.plan.code,
    status: row.status,
    startedAt: row.startedAt,
    maxSimultaneousSets: row.plan.maxSimultaneousSets,
    queueBonusDays: row.plan.queueBonus,
  };
}

function toPlan(row: {
  id: string;
  code: "BASIC" | "PREMIUM";
  name: string;
  monthlyPrice: { toFixed(dp: number): string };
  maxSimultaneousSets: number;
  queueBonus: number;
  active: boolean;
}): PlanConfig {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    monthlyPrice: row.monthlyPrice.toFixed(2),
    maxSimultaneousSets: row.maxSimultaneousSets,
    queueBonusDays: row.queueBonus,
    active: row.active,
  };
}

export const prismaSubscriptionRepository: SubscriptionRepository = {
  async findCurrentSubscription(userId) {
    // La más reciente que no esté cancelada: una suscripción cancelada ya no rige, y
    // un usuario puede haberse dado de alta más de una vez a lo largo del tiempo.
    const row = await prisma.subscription.findFirst({
      where: { userId, status: { not: "CANCELLED" } },
      select: SUBSCRIPTION_SELECT,
      orderBy: { startedAt: "desc" },
    });
    return row ? toSubscription(row as SubscriptionRow) : null;
  },

  async currentCopyStates(userId) {
    // Se leen los alquileres sin completar y se devuelve el estado de su copia: es la
    // vía por la que una copia está "asignada" a alguien.
    const rentals = await prisma.rental.findMany({
      where: {
        userId,
        status: { not: "COMPLETED" },
        copy: { state: { in: [...OCCUPYING_COPY_STATES] } },
      },
      select: { copy: { select: { state: true } } },
    });
    return rentals.map((rental) => rental.copy.state as CopyState);
  },

  async updateStatus(subscriptionId, status, at) {
    const { count } = await prisma.subscription.updateMany({
      where: { id: subscriptionId },
      data: { status, cancelledAt: status === "CANCELLED" ? at : null },
    });
    if (count === 0) return null;

    const row = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: SUBSCRIPTION_SELECT,
    });
    return row ? toSubscription(row as SubscriptionRow) : null;
  },

  async changePlan(subscriptionId, planId) {
    const { count } = await prisma.subscription.updateMany({
      where: { id: subscriptionId },
      data: { planId },
    });
    if (count === 0) return null;

    const row = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: SUBSCRIPTION_SELECT,
    });
    return row ? toSubscription(row as SubscriptionRow) : null;
  },

  async listPlans() {
    const rows = await prisma.plan.findMany({ orderBy: { monthlyPrice: "asc" } });
    return rows.map(toPlan);
  },

  async updatePlan(code, input) {
    const data: Record<string, unknown> = {};
    if (input.monthlyPrice !== undefined) data.monthlyPrice = input.monthlyPrice;
    if (input.maxSimultaneousSets !== undefined) data.maxSimultaneousSets = input.maxSimultaneousSets;
    if (input.queueBonusDays !== undefined) data.queueBonus = input.queueBonusDays;

    const { count } = await prisma.plan.updateMany({ where: { code }, data: data as never });
    if (count === 0) return null;

    const row = await prisma.plan.findUnique({ where: { code } });
    return row ? toPlan(row) : null;
  },
};
