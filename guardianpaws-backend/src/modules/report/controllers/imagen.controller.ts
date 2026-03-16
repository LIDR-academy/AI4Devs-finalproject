import { Controller, Post, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagenService } from '../../image/services/imagen.service';

@Controller('reportes-perdida/:reporteId/imagenes')
export class ImagenController {
    constructor(private readonly imagenService: ImagenService) {}

    @Post()
    @UseInterceptors(FileInterceptor('imagen'))
    async subirImagen(
        @Param('reporteId') reporteId: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException('No se ha proporcionado ninguna imagen');
        }

        // Validar tipo de archivo
        if (!file.mimetype.includes('image')) {
            throw new BadRequestException('El archivo debe ser una imagen');
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new BadRequestException('La imagen no debe superar los 5MB');
        }

        const url = await this.imagenService.subirImagen(file, reporteId);
        return { url };
    }
} 