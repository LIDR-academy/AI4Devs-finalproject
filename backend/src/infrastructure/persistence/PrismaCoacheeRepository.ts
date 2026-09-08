import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import type {
  CoacheeStatus,
  CreateCoacheeData,
  UpdateCoacheeData,
} from "../../domain/entities/Coachee.js";
import { Coachee as CoacheeEntity } from "../../domain/entities/Coachee.js";
import type {
  CoacheeFilters,
  CoacheeRepository,
  PaginatedResult,
} from "../../domain/ports/CoacheeRepository.js";

function toDomain(row: {
  id: string;
  name: string;
  email: string;
  phone: string;
  class_type_preference: string | null;
  status: string;
  level_id: string | null;
  additional_info: string | null;
  created_at: Date;
  updated_at: Date;
}): CoacheeEntity {
  return new CoacheeEntity(
    row.id,
    row.name,
    row.email,
    row.phone,
    row.class_type_preference as CoacheeEntity["classTypePreference"],
    row.status as CoacheeStatus,
    row.level_id,
    row.additional_info,
    row.created_at,
    row.updated_at,
  );
}

export class PrismaCoacheeRepository implements CoacheeRepository {
  private _prisma: PrismaClient | null = null;

  private get prisma(): PrismaClient {
    if (!this._prisma) {
      this._prisma = new PrismaClient();
    }
    return this._prisma;
  }

  async create(data: CreateCoacheeData & { passwordHash: string }): Promise<CoacheeEntity> {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? "",
        password_hash: data.passwordHash,
        role: UserRole.COACHEE,
        status: UserStatus.ACTIVE,
        level_id: data.levelId ?? null,
        // biome-ignore lint/suspicious/noExplicitAny: Prisma enum cast from domain string
        class_type_preference: (data.classTypePreference ?? null) as any,
        additional_info: data.additionalInfo ?? null,
      },
    });
    return toDomain(user);
  }

  async findById(id: string): Promise<CoacheeEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, role: UserRole.COACHEE },
    });
    return user ? toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<CoacheeEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { email, role: UserRole.COACHEE },
    });
    return user ? toDomain(user) : null;
  }

  async findAll(filters: CoacheeFilters): Promise<PaginatedResult<CoacheeEntity>> {
    // biome-ignore lint/suspicious/noExplicitAny: dynamic Prisma query building
    const where: any = { role: UserRole.COACHEE };

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status.map((s) => s.toUpperCase()) };
    }

    if (filters.levelId && filters.levelId.length > 0) {
      where.level_id = { in: filters.levelId };
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { created_at: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map(toDomain),
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async update(id: string, data: UpdateCoacheeData): Promise<CoacheeEntity> {
    // biome-ignore lint/suspicious/noExplicitAny: dynamic Prisma update building
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.classTypePreference !== undefined) {
      updateData.class_type_preference = data.classTypePreference;
    }
    if (data.additionalInfo !== undefined) updateData.additional_info = data.additionalInfo;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    return toDomain(user);
  }

  async updateStatus(id: string, status: CoacheeStatus): Promise<CoacheeEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: status as UserStatus },
    });
    return toDomain(user);
  }

  async updateLevel(id: string, levelId: string): Promise<CoacheeEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { level_id: levelId },
    });
    return toDomain(user);
  }
}
