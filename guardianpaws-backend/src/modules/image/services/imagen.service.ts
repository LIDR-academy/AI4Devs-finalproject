import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Imagen } from '../entities/imagen.entity';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImagenService implements OnModuleInit {
    private s3Client: S3;
    private bucketName: string;

    constructor(
        @InjectRepository(Imagen)
        private imagenRepository: Repository<Imagen>,
        private configService: ConfigService,
    ) {
        // Validar variables de entorno requeridas
        const requiredEnvVars = [
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
            'AWS_REGION',
            'S3_BUCKET_NAME'
        ];

        for (const envVar of requiredEnvVars) {
            if (!this.configService.get(envVar)) {
                throw new Error(`Missing required environment variable: ${envVar}`);
            }
        }

        this.bucketName = this.configService.get('S3_BUCKET_NAME')!;
        this.s3Client = new S3({
            region: this.configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!
            }
        });
    }

    async onModuleInit() {
        // Verificar que el bucket existe
        try {
            await this.s3Client.headBucket({
                Bucket: this.bucketName
            }).promise();
        } catch (error) {
            throw new Error(`Bucket ${this.bucketName} does not exist or is not accessible`);
        }
    }

    private getSignedUrl(key: string, expiresIn: number = 3600): string {
        const signedUrl = this.s3Client.getSignedUrl('getObject', {
            Bucket: this.bucketName,
            Key: key,
            Expires: expiresIn // URL válida por 1 hora por defecto
        });
        return signedUrl;
    }

    async subirImagen(file: Express.Multer.File, reporteId: string): Promise<{ url: string; key: string }> {
        const key = `imagenes/${uuidv4()}-${file.originalname}`;

        const params = {
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        try {
            await this.s3Client.upload(params).promise();
            // Generar URL firmada
            const url = this.getSignedUrl(key);
            
            return { url, key };
        } catch (error) {
            throw new Error(`Error uploading file to S3: ${error.message}`);
        }
    }

    // Método para obtener una nueva URL firmada para una imagen existente
    async obtenerUrlFirmada(key: string): Promise<string> {
        return this.getSignedUrl(key);
    }

    async uploadFile(file: Express.Multer.File, reporteId: string): Promise<Imagen> {
        const key = `reportes/${reporteId}/${Date.now()}-${file.originalname}`;

        const uploadResult = await this.s3Client.upload({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }).promise();

        const imagen = this.imagenRepository.create({
            url: uploadResult.Location,
            key: key,
            reporte: { id: reporteId } as any,
        });

        return this.imagenRepository.save(imagen);
    }

    async deleteFile(key: string): Promise<void> {
        await this.s3Client.deleteObject({
            Bucket: this.bucketName,
            Key: key,
        }).promise();
    }
} 