import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientResponseDto } from './dto/client-response.dto';
import { ClientSearchResponseDto } from './dto/client-search-response.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { SearchClientsQueryDto } from './dto/search-clients-query.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import {
  normalizeEmail,
  normalizeFullName,
  normalizeNationalId,
  normalizeNationalIdForSearch,
  normalizePhone,
} from './utils/client-normalizer';

const SEARCH_LIMIT = 20;

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchClientsQueryDto): Promise<ClientSearchResponseDto> {
    if (query.nationalId) {
      const client = await this.findByNationalId(query.nationalId);
      const items = client ? [this.toClientResponse(client)] : [];
      return { items, total: items.length };
    }

    if (!query.q || query.q.length < 2) {
      return { items: [], total: 0 };
    }

    const searchTerm = query.q.trim();
    const phoneDigits = searchTerm.replace(/\D/g, '');

    const clients = await this.prisma.client.findMany({
      where: {
        OR: [
          {
            fullName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            nationalId: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          ...(phoneDigits.length >= 2
            ? [
                {
                  phone: {
                    contains: phoneDigits,
                  },
                },
              ]
            : []),
        ],
      },
      orderBy: { fullName: 'asc' },
      take: SEARCH_LIMIT,
    });

    const items = clients.map((client) => this.toClientResponse(client));
    return { items, total: items.length };
  }

  async findById(id: string): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Not Found');
    }

    return this.toClientResponse(client);
  }

  async create(dto: CreateClientDto): Promise<ClientResponseDto> {
    const fullName = normalizeFullName(dto.fullName);
    const nationalId = normalizeNationalId(dto.nationalId);
    const phone = normalizePhone(dto.phone) ?? null;
    const email = normalizeEmail(dto.email) ?? null;

    const existing = await this.findByNationalId(nationalId);
    if (existing) {
      this.throwNationalIdConflict(existing);
    }

    try {
      const client = await this.prisma.client.create({
        data: {
          fullName,
          nationalId,
          phone,
          email,
        },
      });

      return this.toClientResponse(client);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const raceExisting = await this.findByNationalId(nationalId);
        if (raceExisting) {
          this.throwNationalIdConflict(raceExisting);
        }
      }

      throw error;
    }
  }

  async update(id: string, dto: UpdateClientDto): Promise<ClientResponseDto> {
    const existing = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Not Found');
    }

    const client = await this.prisma.client.update({
      where: { id },
      data: {
        fullName: normalizeFullName(dto.fullName),
        phone: normalizePhone(dto.phone) ?? null,
        email: normalizeEmail(dto.email) ?? null,
      },
    });

    return this.toClientResponse(client);
  }

  async findByNationalId(nationalId: string): Promise<Client | null> {
    const trimmed = normalizeNationalId(nationalId);
    const exactMatch = await this.prisma.client.findUnique({
      where: { nationalId: trimmed },
    });

    if (exactMatch) {
      return exactMatch;
    }

    const normalizedSearch = normalizeNationalIdForSearch(nationalId);
    if (!normalizedSearch) {
      return null;
    }

    const candidates = await this.prisma.client.findMany();
    return (
      candidates.find(
        (client) =>
          normalizeNationalIdForSearch(client.nationalId) === normalizedSearch,
      ) ?? null
    );
  }

  private throwNationalIdConflict(existing: Client): never {
    throw new ConflictException({
      message: 'Client with this national ID already exists',
      error: 'Conflict',
      existingClient: this.toClientResponse(existing),
    });
  }

  private toClientResponse(client: Client): ClientResponseDto {
    return {
      id: client.id,
      fullName: client.fullName,
      nationalId: client.nationalId,
      phone: client.phone,
      email: client.email,
      createdAt: client.createdAt,
    };
  }
}
