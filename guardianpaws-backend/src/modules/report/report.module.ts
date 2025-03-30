import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportePerdida } from './entities/reporte-perdida.entity';
import { HistorialReporte } from './entities/historial-reporte.entity';
import { ReporteService } from './services/reporte.service';
import { ReporteController } from './controllers/reporte.controller';
import { Mascota } from '../mascota/entities/mascota.entity';
import { Imagen } from '../image/entities/imagen.entity';
import { ImagenService } from '../image/services/imagen.service';
import { RekognitionService } from './services/rekognition.service';
import { MailerService } from './services/mailer.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ReportePerdida, HistorialReporte, Mascota, Imagen]),
    ],
    controllers: [ReporteController],
    providers: [ReporteService, ImagenService, RekognitionService, MailerService],
    exports: [ReporteService],
})
export class ReportModule {} 