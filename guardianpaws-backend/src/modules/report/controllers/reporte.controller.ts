import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { ReporteService } from '../services/reporte.service';
import { CrearReporteDto } from '../dto/crear-reporte.dto';
import { ActualizarReporteDto } from '../dto/actualizar-reporte.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('reportes-perdida')
export class ReporteController {
    constructor(private readonly reporteService: ReporteService) {}

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'imagenes', maxCount: 3 },
    ]))
    async crear(
        @Body() body: any,
        @UploadedFiles() files: { imagenes?: Express.Multer.File[] }
    ) {
        // Parsear los datos JSON del formulario
        const crearReporteDto: CrearReporteDto = {
            ...body,
            mascota: typeof body.mascota === 'string' ? JSON.parse(body.mascota) : body.mascota
        };

        const reporte = await this.reporteService.crear(crearReporteDto, files?.imagenes || []);
        return { id: reporte.id };
    }

    @Get()
    async listarTodos() {
        return await this.reporteService.findAll();
    }

    @Get(':id')
    async obtenerPorId(@Param('id') id: string) {
        // Si el id contiene @, asumimos que es un email
        if (id.includes('@')) {
            return await this.reporteService.findByUserEmail(id);
        }
        // Si no, tratamos de obtener por ID
        const reporte = await this.reporteService.findOne(id);
        return reporte;
    }

    @Put(':id')
    async actualizar(
        @Param('id') id: string,
        @Body() actualizarReporteDto: ActualizarReporteDto
    ) {
        return await this.reporteService.actualizar(id, actualizarReporteDto);
    }

    @Delete(':id')
    @HttpCode(204)
    async eliminar(@Param('id') id: string) {
        await this.reporteService.eliminar(id);
    }
}