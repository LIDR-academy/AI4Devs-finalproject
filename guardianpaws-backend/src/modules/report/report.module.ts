import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportePerdida } from './entities/reporte-perdida.entity';
import { HistorialReporte } from './entities/historial-reporte.entity';
import { Imagen } from '../image/entities/imagen.entity';
import { ReporteController } from './controllers/reporte.controller';
import { ImagenController } from './controllers/imagen.controller';
import { ReporteService } from './services/reporte.service';
import { ImagenService } from '../image/services/imagen.service';
import { MascotaModule } from '../mascota/mascota.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ReportePerdida, HistorialReporte, Imagen]),
        MascotaModule
    ],
    controllers: [ReporteController, ImagenController],
    providers: [ReporteService, ImagenService],
    exports: [ReporteService, ImagenService],
})
export class ReportModule {} 