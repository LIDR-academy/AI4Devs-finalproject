import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import type { CoachStatus } from "../../domain/entities/Coach.js";
import { Coach as CoachEntity } from "../../domain/entities/Coach.js";
import type {
  CoachFilters,
  CoachRepository,
  PaginatedResult,
} from "../../domain/ports/CoachRepository.js";

function toDomain(row: {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialities: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}): CoachEntity {
  return new CoachEntity(
    row.id,
    row.name,
    row.email,
    row.phone,
    row.specialities,
    row.status as CoachStatus,
    row.created_at,
    row.updated_at,
  );
}

export class PrismaCoachRepository implements CoachRepository {
  private _prisma: PrismaClient | null = null;

  private get prisma(): PrismaClient {
    if (!this._prisma) {
      this._prisma = new PrismaClient();
    }
    return this._prisma;
  }

  async create(data: {
    name: string;
    email: string;
    phone?: string | null;
    specialities?: string | null;
    bankAccount: string;
    ssn: string;
    dni: string;
    passwordHash: string;
  }): Promise<CoachEntity> {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? "",
        password_hash: data.passwordHash,
        role: UserRole.COACH,
        status: UserStatus.ACTIVE,
        bank_account: data.bankAccount,
        ssn: data.ssn,
        dni: data.dni,
        specialities: data.specialities ?? null,
      },
    });
    return toDomain(user);
  }

  async findById(id: string): Promise<CoachEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, role: UserRole.COACH },
    });
    return user ? toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<CoachEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { email, role: UserRole.COACH },
    });
    return user ? toDomain(user) : null;
  }

  async findAll(filters: CoachFilters): Promise<PaginatedResult<CoachEntity>> {
    // biome-ignore lint/suspicious/noExplicitAny: dynamic Prisma query building
    const where: any = { role: UserRole.COACH };

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status.map((s) => s.toUpperCase()) };
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

  async update(
    id: string,
    data: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      specialities?: string | null;
    },
  ): Promise<CoachEntity> {
    // biome-ignore lint/suspicious/noExplicitAny: dynamic Prisma update building
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.specialities !== undefined) updateData.specialities = data.specialities;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    return toDomain(user);
  }

  async updateStatus(id: string, status: CoachStatus): Promise<CoachEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: status as UserStatus },
    });
    return toDomain(user);
  }

  async findFinancialData(
    id: string,
  ): Promise<{ id: string; name: string; bankAccount: string; ssn: string; dni: string } | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, role: UserRole.COACH },
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      bankAccount: user.bank_account ?? "",
      ssn: user.ssn ?? "",
      dni: user.dni ?? "",
    };
  }
}
