import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReporteController } from './controllers/reporte.controller';
import { ReporteService } from './services/reporte.service';
import { ReportePerdida } from './entities/reporte-perdida.entity';
import { HistorialReporte } from './entities/historial-reporte.entity';
import { MascotaModule } from '../mascota/mascota.module';
import { ImageModule } from '../image/image.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ReportePerdida, HistorialReporte]),
        MascotaModule,
        ImageModule
    ],
    controllers: [ReporteController],
    providers: [ReporteService],
    exports: [ReporteService]
})
export class ReporteModule {} 