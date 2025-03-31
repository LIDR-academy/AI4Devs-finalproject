import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportePerdida } from '../entities/reporte-perdida.entity';
import { HistorialReporte } from '../entities/historial-reporte.entity';
import { CrearReporteDto } from '../dto/crear-reporte.dto';
import { ActualizarReporteDto } from '../dto/actualizar-reporte.dto';
import { Mascota } from '../../mascota/entities/mascota.entity';
import { Imagen } from '../../image/entities/imagen.entity';
import { ImagenService } from '../../image/services/imagen.service';
import { EstadoReporte } from '../enums/estado-reporte.enum';
import { RekognitionService } from './rekognition.service';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReporteService {
    private useRekognition: boolean;

    constructor(
        @InjectRepository(ReportePerdida)
        private reporteRepository: Repository<ReportePerdida>,
        @InjectRepository(HistorialReporte)
        private historialRepository: Repository<HistorialReporte>,
        @InjectRepository(Mascota)
        private mascotaRepository: Repository<Mascota>,
        @InjectRepository(Imagen)
        private imagenRepository: Repository<Imagen>,
        private imagenService: ImagenService,
        private rekognitionService: RekognitionService,
        private mailerService: MailerService,
        private configService: ConfigService
    ) {
        this.useRekognition = this.configService.get<string>('USE_REKOGNITION')?.toLowerCase() === 'true';
    }

    async crear(crearReporteDto: CrearReporteDto, imagenes: Express.Multer.File[]): Promise<ReportePerdida> {
        // Crear la mascota primero
        const mascota = this.mascotaRepository.create(crearReporteDto.mascota);
        const mascotaGuardada = await this.mascotaRepository.save(mascota);

        // Crear el reporte con el ID de la mascota
        const reporte = this.reporteRepository.create({
            mascotaId: mascotaGuardada.id,
            usuarioId: crearReporteDto.usuarioId,
            fechaReporte: new Date(),
            ubicacion: crearReporteDto.ubicacion,
            descripcion: crearReporteDto.descripcion,
            estado: crearReporteDto.estado || EstadoReporte.ABIERTO
        });

        const reporteGuardado = await this.reporteRepository.save(reporte);

        // Crear el primer registro en el historial
        const historial = this.historialRepository.create({
            reporteId: reporteGuardado.id,
            estado: reporteGuardado.estado,
            comentario: 'Reporte creado inicialmente',
            fechaCambio: new Date(),
            email: crearReporteDto.email,
            telefono: crearReporteDto.telefono
        });

        await this.historialRepository.save(historial);

        // Si hay imágenes, procesarlas y subirlas a S3
        if (imagenes && imagenes.length > 0) {
            const imagenesGuardadas = await Promise.all(
                imagenes.map(async (imagen) => {
                    const { url, key } = await this.imagenService.subirImagen(imagen, reporteGuardado.id);
                    return this.imagenRepository.save({
                        url,
                        key,
                        reporteId: reporteGuardado.id
                    });
                })
            );
            reporteGuardado.imagenes = imagenesGuardadas;

            // Solo realizar comparaciones si Rekognition está habilitado
            if (this.useRekognition) {
                // Si es un reporte de animal encontrado, buscar coincidencias con mascotas perdidas
                if (reporteGuardado.estado === EstadoReporte.ANIMAL_ENCONTRADO) {
                    const reportesPerdidos = await this.reporteRepository.find({
                        where: { estado: EstadoReporte.ABIERTO },
                        relations: ['imagenes', 'mascota']
                    });

                    for (const reportePerdido of reportesPerdidos) {
                        for (const imagenEncontrada of imagenesGuardadas) {
                            for (const imagenPerdida of reportePerdido.imagenes) {
                                const similarity = await this.rekognitionService.comparePetImages(
                                    imagenEncontrada.key,
                                    imagenPerdida.key
                                );

                                if (similarity > 70) {
                                    // Enviar correo al dueño de la mascota perdida
                                    const historialPerdido = await this.historialRepository.findOne({
                                        where: { reporteId: reportePerdido.id },
                                        order: { fechaCambio: 'DESC' }
                                    });

                                    if (historialPerdido && historialPerdido.email) {
                                        await this.mailerService.sendPotentialMatchEmail(
                                            historialPerdido.email,
                                            reportePerdido,
                                            reporteGuardado,
                                            similarity
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
                // Si es un reporte de mascota perdida, buscar coincidencias con animales encontrados
                else if (reporteGuardado.estado === EstadoReporte.ABIERTO) {
                    const coincidencias = await this.rekognitionService.findSimilarPets(reporteGuardado.id);

                    // Enviar correos para cada coincidencia encontrada
                    for (const coincidencia of coincidencias) {
                        const reporteCoincidencia = await this.findOne(coincidencia.reporteId);
                        const historialOriginal = await this.historialRepository.findOne({
                            where: { reporteId: coincidencia.reporteId },
                            order: { fechaCambio: 'DESC' }
                        });

                        if (historialOriginal && historialOriginal.email) {
                            await this.mailerService.sendPotentialMatchEmail(
                                historialOriginal.email,
                                reporteCoincidencia,
                                reporteGuardado,
                                coincidencia.similarity
                            );
                        }
                    }
                }
            } else {
                console.log('Rekognition is disabled, skipping image comparison');
            }
        }

        return reporteGuardado;
    }

    async findAll(): Promise<ReportePerdida[]> {
        return this.reporteRepository.find();
    }

    async findOne(id: string): Promise<ReportePerdida> {
        const reporte = await this.reporteRepository.findOne({
            where: { id },
            relations: ['mascota', 'historiales', 'imagenes']
        });

        if (!reporte) {
            throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
        }

        // Obtener el último historial para tener la información de contacto más reciente
        const ultimoHistorial = reporte.historiales[reporte.historiales.length - 1];
        
        // Crear un objeto con la estructura esperada por el frontend
        const reporteFormateado = {
            ...reporte,
            email: ultimoHistorial?.email,
            telefono: ultimoHistorial?.telefono,
            mascota: {
                ...reporte.mascota,
                imagenes: reporte.imagenes || []
            }
        };

        return reporteFormateado;
    }

    async actualizar(id: string, actualizarReporteDto: ActualizarReporteDto): Promise<ReportePerdida> {
        const reporte = await this.findOne(id);

        // Actualizar el reporte
        Object.assign(reporte, actualizarReporteDto);
        await this.reporteRepository.save(reporte);

        // Crear nuevo registro en el historial
        const historial = this.historialRepository.create({
            reporteId: reporte.id,
            estado: reporte.estado,
            comentario: actualizarReporteDto.descripcion || 'Actualización del reporte',
            fechaCambio: new Date(),
            email: actualizarReporteDto.email,
            telefono: actualizarReporteDto.telefono
        });

        await this.historialRepository.save(historial);

        return reporte;
    }

    async eliminar(id: string): Promise<void> {
        const reporte = await this.findOne(id);
        await this.reporteRepository.remove(reporte);
    }

    async findByUserEmail(email: string): Promise<ReportePerdida[]> {
        // Obtener los reportes que tienen historiales con el email especificado
        const reportes = await this.reporteRepository
            .createQueryBuilder('reporte')
            .leftJoinAndSelect('reporte.historiales', 'historial')
            .leftJoinAndSelect('reporte.mascota', 'mascota')
            .leftJoinAndSelect('reporte.imagenes', 'imagenes')
            .where('historial.email = :email', { email })
            .orderBy('reporte.fechaReporte', 'DESC')
            .getMany();

        // Formatear cada reporte para incluir la información de contacto más reciente
        return reportes.map(reporte => {
            const ultimoHistorial = reporte.historiales[reporte.historiales.length - 1];
            return {
                ...reporte,
                email: ultimoHistorial?.email,
                telefono: ultimoHistorial?.telefono,
                mascota: {
                    ...reporte.mascota,
                    imagenes: reporte.imagenes || []
                }
            };
        });
    }
} 