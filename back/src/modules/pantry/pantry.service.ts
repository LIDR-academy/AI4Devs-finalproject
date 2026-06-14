import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Decimal } from "@prisma/client/runtime/library";
import type { PantryItem } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { UsersService } from "../users/users.service";
import { CreatePantryItemDto } from "./dto/create-pantry-item.dto";
import { PantryConsumptionEventType, RegisterConsumptionEventDto } from "./dto/register-consumption-event.dto";
import { UpdatePantryItemDto } from "./dto/update-pantry-item.dto";

const FAR_PAST_EXPIRY_DAYS = 7;

export function computeEstimatedValue(
  pricePaid: Decimal | null,
  originalQuantity: number,
  eventQuantity: number,
): number | null {
  if (!pricePaid || originalQuantity <= 0 || eventQuantity <= 0) {
    return null;
  }
  return (parseFloat(pricePaid.toString()) / originalQuantity) * eventQuantity;
}

export function daysPastExpiry(expirationDate: Date, now: Date): number {
  const startOfExpiry = Date.UTC(
    expirationDate.getUTCFullYear(),
    expirationDate.getUTCMonth(),
    expirationDate.getUTCDate(),
  );
  const startOfNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((startOfNow - startOfExpiry) / (1000 * 60 * 60 * 24));
}

export function isFarPastExpiry(item: Pick<PantryItem, "expirationDate">, now: Date): boolean {
  if (!item.expirationDate) {
    return false;
  }
  return daysPastExpiry(item.expirationDate, now) >= FAR_PAST_EXPIRY_DAYS;
}

@Injectable()
export class PantryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreatePantryItemDto): Promise<PantryItem> {
    await this.assertUserCanAccessPantry(userId);

    return this.prisma.pantryItem.create({
      data: {
        userId,
        name: dto.name.trim(),
        quantity: dto.quantity,
        unit: dto.unit.trim(),
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
        ...(dto.pricePaid !== undefined && { pricePaid: dto.pricePaid }),
      },
    });
  }

  async list(userId: string): Promise<PantryItem[]> {
    await this.assertUserCanAccessPantry(userId);

    const visibleUserIds = await this.resolveHouseholdUserIds(userId);

    return this.prisma.pantryItem.findMany({
      where: { userId: { in: visibleUserIds } },
      orderBy: [{ expirationDate: "asc" }, { createdAt: "desc" }],
    });
  }

  async resolveHouseholdUserIds(userId: string): Promise<string[]> {
    const membership = await this.prisma.householdMember.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        household: {
          include: {
            members: { where: { status: "ACTIVE" }, select: { userId: true } },
          },
        },
      },
    });

    if (!membership) {
      return [userId];
    }

    return membership.household.members.map((m) => m.userId);
  }

  async update(userId: string, itemId: string, dto: UpdatePantryItemDto): Promise<PantryItem> {
    await this.assertUserCanAccessPantry(userId);

    const item = await this.prisma.pantryItem.findUnique({ where: { id: itemId } });
    if (!item || item.userId !== userId) {
      throw new NotFoundException("Pantry item not found");
    }

    return this.prisma.pantryItem.update({
      where: { id: itemId },
      data: {
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.unit !== undefined && { unit: dto.unit.trim() }),
        ...(dto.pricePaid !== undefined && { pricePaid: dto.pricePaid }),
      },
    });
  }

  async registerEvent(
    userId: string,
    itemId: string,
    dto: RegisterConsumptionEventDto,
  ): Promise<{ id: string }> {
    await this.assertUserCanAccessPantry(userId);

    const item = await this.prisma.pantryItem.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException("Pantry item not found");
    }

    const visibleUserIds = await this.resolveHouseholdUserIds(userId);
    if (!visibleUserIds.includes(item.userId)) {
      throw new NotFoundException("Pantry item not found");
    }

    const now = new Date();

    if (dto.type === PantryConsumptionEventType.WASTED && isFarPastExpiry(item, now) && !dto.confirmed) {
      const days = daysPastExpiry(item.expirationDate!, now);
      throw new ConflictException({
        code: "WASTE_CONFIRMATION_REQUIRED",
        itemName: item.name,
        daysPastExpiry: days,
      });
    }

    const quantity = dto.quantity ?? item.quantity;
    const estimatedValueEur = computeEstimatedValue(item.pricePaid, item.quantity, quantity);

    const [event] = await this.prisma.$transaction([
      this.prisma.consumptionEvent.create({
        data: {
          pantryItemId: itemId,
          userId,
          type: dto.type,
          quantity,
          itemName: item.name,
          itemUnit: item.unit,
          ...(estimatedValueEur !== null && { estimatedValueEur }),
        },
        select: { id: true },
      }),
      this.prisma.pantryItem.delete({ where: { id: itemId } }),
    ]);

    return event;
  }

  async listEvents(userId: string, type?: "CONSUMED" | "WASTED") {
    await this.assertUserCanAccessPantry(userId);

    return this.prisma.consumptionEvent.findMany({
      where: { userId, ...(type && { type }) },
      orderBy: { occurredAt: "desc" },
      take: 100,
      select: {
        id: true,
        type: true,
        quantity: true,
        itemName: true,
        itemUnit: true,
        estimatedValueEur: true,
        occurredAt: true,
      },
    });
  }

  private async assertUserCanAccessPantry(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException("No access to this pantry");
    }
  }
}
