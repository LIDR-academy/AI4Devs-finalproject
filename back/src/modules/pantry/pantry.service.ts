import { ForbiddenException, Injectable } from "@nestjs/common";
import type { PantryItem } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { UsersService } from "../users/users.service";
import { CreatePantryItemDto } from "./dto/create-pantry-item.dto";

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

  private async assertUserCanAccessPantry(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException("No access to this pantry");
    }
  }
}
