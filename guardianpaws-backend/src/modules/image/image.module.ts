import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Imagen } from './entities/imagen.entity';
import { ImagenService } from './services/imagen.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Imagen]),
        ConfigModule
    ],
    providers: [ImagenService],
    exports: [ImagenService]
})
export class ImageModule {} 