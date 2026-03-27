import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async addToWatchlist(userId: string, idObra: string) {
    // Verificar si la obra existe
    const obra = await this.prisma.obra.findUnique({
      where: { id: idObra },
    });

    if (!obra) {
      throw new NotFoundException('La obra no existe');
    }

    // Upsert para idempotencia
    return this.prisma.watchlist.upsert({
      where: {
        usuario_id_obra_id: {
          usuario_id: userId,
          obra_id: idObra,
        },
      },
      update: {},
      create: {
        usuario_id: userId,
        obra_id: idObra,
      },
      include: {
        obra: {
          include: {
            plataforma: true,
          },
        },
      },
    });
  }

  async getWatchlist(userId: string) {
    return this.prisma.watchlist.findMany({
      where: { usuario_id: userId },
      include: {
        obra: {
          include: {
            plataforma: {
              select: {
                nombre: true,
                logo_url: true,
              },
            },
          },
        },
      },
      orderBy: { fecha_creacion: 'desc' },
    });
  }
}
