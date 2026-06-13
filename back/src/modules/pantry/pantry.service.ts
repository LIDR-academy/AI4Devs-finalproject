import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { PantryItem } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { UsersService } from "../users/users.service";
import { CreatePantryItemDto } from "./dto/create-pantry-item.dto";
import { UpdatePantryItemDto } from "./dto/update-pantry-item.dto";

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
      },
    });
  }

  async list(userId: string): Promise<PantryItem[]> {
    await this.assertUserCanAccessPantry(userId);

    return this.prisma.pantryItem.findMany({
      where: { userId },
      orderBy: [{ expirationDate: "asc" }, { createdAt: "desc" }],
    });
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

  private async assertUserCanAccessPantry(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException("No access to this pantry");
    }
  }
}
