import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetObrasFilterDto } from './dto/get-obras-filter.dto';

@Injectable()
export class CuratedService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: GetObrasFilterDto) {
    const { duracion_max, mood } = filters;

    const where: any = {
      activo: true,
    };

    if (duracion_max !== undefined) {
      where.duracion_min = { lte: duracion_max };
    }

    if (mood) {
      where.vibe_mood = { contains: mood, mode: 'insensitive' };
    }

    return this.prisma.obra.findMany({
      where,
      include: {
        plataforma: {
          select: {
            nombre: true,
            logo_url: true,
            permite_iframe: true,
          },
        },
        hitos: {
          select: {
            nombre: true,
            anio: true,
          },
        },
      },
      orderBy: [
        { estado_acceso: 'asc' }, // ABIERTO < SUSCRIPCION < VOD
        { fecha_creacion: 'desc' },
      ],
    });
  }
}
