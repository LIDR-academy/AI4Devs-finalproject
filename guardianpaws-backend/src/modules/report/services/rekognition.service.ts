import { Injectable } from '@nestjs/common';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Imagen } from '../../image/entities/imagen.entity';
import { ReportePerdida } from '../entities/reporte-perdida.entity';
import { EstadoReporte } from '../enums/estado-reporte.enum';
import { Not } from 'typeorm';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class RekognitionService {
    private rekognitionClient: RekognitionClient;
    private s3Client: S3Client;
    private useRekognition: boolean;

    // Características relevantes para mascotas
    private readonly petCharacteristics = new Set([
        // Tipos de animales
        'dog', 'cat', 'puppy', 'kitten', 'pet', 'animal',
        
        // Razas de perros
        'golden retriever', 'labrador', 'german shepherd', 'dachshund', 'pug', 'bulldog',
        'beagle', 'rottweiler', 'yorkshire terrier', 'boxer', 'chihuahua',
        
        // Razas de gatos
        'persian cat', 'siamese cat', 'ragdoll', 'maine coon', 'british shorthair',
        
        // Colores
        'brown', 'black', 'white', 'golden', 'gray', 'orange', 'tan', 'cream',
        
        // Características físicas
        'fur', 'tail', 'ears', 'paws', 'face', 'coat'
    ]);

    constructor(
        private configService: ConfigService,
        @InjectRepository(Imagen)
        private imagenRepository: Repository<Imagen>,
        @InjectRepository(ReportePerdida)
        private reporteRepository: Repository<ReportePerdida>
    ) {
        this.useRekognition = this.configService.get<string>('USE_REKOGNITION')?.toLowerCase() === 'true';
        
        if (!this.useRekognition) {
            console.log('Rekognition service is disabled');
            return;
        }

        const region = this.configService.get<string>('AWS_REGION');
        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

        if (!region || !accessKeyId || !secretAccessKey) {
            throw new Error('AWS credentials not properly configured');
        }

        const credentials = {
            accessKeyId,
            secretAccessKey,
        };

        this.rekognitionClient = new RekognitionClient({
            region,
            credentials,
        });

        this.s3Client = new S3Client({
            region,
            credentials,
        });
    }

    private async checkImageExists(key: string, bucketName: string): Promise<boolean> {
        if (!this.useRekognition) return false;
        
        try {
            // Limpiar la key de la imagen
            const cleanKey = key.startsWith('/') ? key.slice(1) : key;
            
            console.log(`Checking image existence: ${cleanKey} in bucket ${bucketName}`);
            
            const command = new HeadObjectCommand({
                Bucket: bucketName,
                Key: cleanKey,
            });
            await this.s3Client.send(command);
            return true;
        } catch (error) {
            console.error(`Image ${key} does not exist in bucket ${bucketName}:`, error);
            return false;
        }
    }

    private async getImageCharacteristics(imageKey: string, bucketName: string): Promise<{ type: string; characteristics: Set<string> }> {
        if (!this.useRekognition) {
            return { type: '', characteristics: new Set() };
        }

        try {
            // Limpiar la key de la imagen
            const cleanKey = imageKey.startsWith('/') ? imageKey.slice(1) : imageKey;
            
            console.log(`Getting characteristics for image: ${cleanKey}`);
            
            const labelsCommand = new DetectLabelsCommand({
                Image: {
                    S3Object: {
                        Bucket: bucketName,
                        Name: cleanKey,
                    },
                },
            });

            const labelsResponse = await this.rekognitionClient.send(labelsCommand);
            
            // Determinar el tipo de mascota
            let petType = '';
            const characteristics = new Set<string>();
            
            // Primero verificar si es una mascota y determinar el tipo
            const isDog = labelsResponse.Labels?.some(label => 
                label.Name?.toLowerCase() === 'dog' || 
                label.Name?.toLowerCase() === 'puppy'
            );
            
            const isCat = labelsResponse.Labels?.some(label => 
                label.Name?.toLowerCase() === 'cat' || 
                label.Name?.toLowerCase() === 'kitten'
            );

            if (isDog && !isCat) {
                petType = 'dog';
            } else if (isCat && !isDog) {
                petType = 'cat';
            } else {
                console.log(`Image ${cleanKey} is not a clear pet image or contains multiple pets`);
                return { type: '', characteristics: new Set() };
            }

            // Procesar etiquetas
            labelsResponse.Labels?.forEach(label => {
                const name = label.Name?.toLowerCase();
                if (name && this.petCharacteristics.has(name)) {
                    characteristics.add(name);
                }
            });

            console.log(`Characteristics found for ${cleanKey}:`, {
                type: petType,
                characteristics: [...characteristics]
            });

            return { type: petType, characteristics };
        } catch (error) {
            console.error(`Error detecting characteristics for image ${imageKey}:`, error);
            return { type: '', characteristics: new Set() };
        }
    }

    async comparePetImages(sourceImageKey: string, targetImageKey: string): Promise<number> {
        if (!this.useRekognition) {
            console.log('Rekognition is disabled, returning 0 similarity');
            return 0;
        }

        try {
            const bucketName = this.configService.get<string>('S3_BUCKET_NAME');
            if (!bucketName) {
                throw new Error('S3 bucket name not configured');
            }

            // Limpiar las keys de las imágenes
            const cleanSourceKey = sourceImageKey.startsWith('/') ? sourceImageKey.slice(1) : sourceImageKey;
            const cleanTargetKey = targetImageKey.startsWith('/') ? targetImageKey.slice(1) : targetImageKey;

            console.log(`Comparing images: source=${cleanSourceKey}, target=${cleanTargetKey}`);

            // Obtener características para ambas imágenes
            const sourceResult = await this.getImageCharacteristics(cleanSourceKey, bucketName);
            const targetResult = await this.getImageCharacteristics(cleanTargetKey, bucketName);

            // Si alguna imagen no es de una mascota o los tipos no coinciden, retornar 0
            if (sourceResult.type === '' || targetResult.type === '' || sourceResult.type !== targetResult.type) {
                return 0;
            }

            // Calcular similitud basada en características comunes
            const commonCharacteristics = [...sourceResult.characteristics].filter(char => 
                targetResult.characteristics.has(char)
            );
            const totalCharacteristics = new Set([
                ...sourceResult.characteristics, 
                ...targetResult.characteristics
            ]).size;

            // Calcular porcentaje de similitud
            const similarity = totalCharacteristics > 0 ? (commonCharacteristics.length / totalCharacteristics) * 100 : 0;

            console.log('Characteristics comparison:', {
                sourceType: sourceResult.type,
                targetType: targetResult.type,
                sourceCharacteristics: [...sourceResult.characteristics],
                targetCharacteristics: [...targetResult.characteristics],
                commonCharacteristics,
                similarity
            });

            return similarity;
        } catch (error) {
            console.error('Error comparing images:', error);
            return 0;
        }
    }

    async findSimilarPets(reporteId: string): Promise<{ reporteId: string; similarity: number }[]> {
        if (!this.useRekognition) {
            console.log('Rekognition is disabled, returning empty matches');
            return [];
        }

        const reporte = await this.reporteRepository.findOne({
            where: { id: reporteId },
            relations: ['imagenes'],
        });

        if (!reporte || !reporte.imagenes.length) {
            console.log('No images found for report:', reporteId);
            return [];
        }

        const bucketName = this.configService.get<string>('S3_BUCKET_NAME');
        if (!bucketName) {
            throw new Error('S3 bucket name not configured');
        }

        // Verificar que las imágenes del reporte actual existen
        const validSourceImages = await Promise.all(
            reporte.imagenes.map(async (imagen) => {
                const exists = await this.checkImageExists(imagen.key, bucketName);
                if (!exists) {
                    console.log(`Skipping non-existent source image: ${imagen.key}`);
                    return null;
                }
                console.log(`Valid source image found: ${imagen.key}`);
                return imagen;
            })
        );

        // Filtrar solo las imágenes que existen
        const existingSourceImages = validSourceImages.filter((img): img is Imagen => img !== null);
        
        if (existingSourceImages.length === 0) {
            console.log('No valid source images found');
            return [];
        }

        // Buscar solo reportes de animales encontrados
        const reportesEncontrados = await this.reporteRepository.find({
            where: {
                estado: EstadoReporte.ANIMAL_ENCONTRADO,
                id: Not(reporteId) // Excluir el reporte actual
            },
            relations: ['imagenes'],
        });

        console.log(`Found ${reportesEncontrados.length} reports of found animals to compare against`);

        const similarities: { reporteId: string; similarity: number }[] = [];

        for (const reporteEncontrado of reportesEncontrados) {
            // Verificar que las imágenes del reporte encontrado existen
            const validTargetImages = await Promise.all(
                reporteEncontrado.imagenes.map(async (imagen) => {
                    const exists = await this.checkImageExists(imagen.key, bucketName);
                    if (!exists) {
                        console.log(`Skipping non-existent target image: ${imagen.key}`);
                        return null;
                    }
                    console.log(`Valid target image found: ${imagen.key}`);
                    return imagen;
                })
            );

            // Filtrar solo las imágenes que existen
            const existingTargetImages = validTargetImages.filter((img): img is Imagen => img !== null);

            if (existingTargetImages.length === 0) {
                console.log(`Skipping report ${reporteEncontrado.id} - no valid images found`);
                continue;
            }

            for (const sourceImage of existingSourceImages) {
                for (const targetImage of existingTargetImages) {
                    console.log(`Comparing images: source=${sourceImage.key}, target=${targetImage.key}`);
                    const similarity = await this.comparePetImages(
                        sourceImage.key,
                        targetImage.key
                    );

                    if (similarity > 70) {
                        similarities.push({
                            reporteId: reporteEncontrado.id,
                            similarity,
                        });
                        console.log(`Found match with similarity: ${similarity}`);
                        break; // Si encontramos una coincidencia, no necesitamos comparar más imágenes
                    }
                }
            }
        }

        return similarities;
    }
} 