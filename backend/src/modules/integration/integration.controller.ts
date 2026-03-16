import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
  UploadedFile,
  UseInterceptors,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { IntegrationService } from './integration.service';
import { OrthancService } from './services/orthanc.service';
import { HL7Service } from './services/hl7.service';
import { PharmacyService } from './services/pharmacy.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';
import { LabWebhookPayloadDto } from './dto/lab-webhook.dto';

@ApiTags('Integración Externa')
@Controller('integration')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("bearer")
export class IntegrationController {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly orthancService: OrthancService,
    private readonly hl7Service: HL7Service,
    private readonly pharmacyService: PharmacyService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('webhook/lab')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook laboratorio',
    description: 'Recibe resultados de laboratorio desde un sistema externo. Opcional: header X-Webhook-Secret si INTEGRATION_WEBHOOK_SECRET está configurado.',
  })
  @ApiHeader({ name: 'X-Webhook-Secret', required: false, description: 'Secreto para autorizar el webhook' })
  @ApiBody({ type: LabWebhookPayloadDto })
  @ApiResponse({ status: 200, description: 'Resultados guardados', schema: { type: 'object', properties: { saved: { type: 'number' }, patientId: { type: 'string' } } } })
  @ApiResponse({ status: 400, description: 'Payload inválido o paciente no encontrado' })
  @ApiResponse({ status: 401, description: 'Webhook no autorizado (secreto incorrecto)' })
  async labWebhook(@Body() payload: LabWebhookPayloadDto, @Req() req: Request) {
    const secret = this.configService.get<string>('INTEGRATION_WEBHOOK_SECRET');
    if (secret) {
      const received = req.headers['x-webhook-secret'] as string;
      if (received !== secret) {
        throw new UnauthorizedException('Webhook no autorizado');
      }
    }
    return this.integrationService.processLabWebhook(payload);
  }

  @Get('status')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Verificar estado de integraciones externas' })
  @ApiResponse({
    status: 200,
    description: 'Estado de las integraciones',
    schema: {
      type: 'object',
      properties: {
        orthanc: { type: 'boolean' },
        fhir: { type: 'boolean' },
      },
    },
  })
  async getIntegrationStatus() {
    return this.integrationService.checkIntegrationStatus();
  }

  @Post('sync/patient/:patientId')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar todos los datos externos de un paciente' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Datos sincronizados exitosamente',
    schema: {
      type: 'object',
      properties: {
        dicomImages: { type: 'number' },
        labResults: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async syncPatientData(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.integrationService.syncAllExternalData(patientId);
  }

  @Post('sync/dicom/:patientId')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar imágenes DICOM de Orthanc' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Imágenes DICOM sincronizadas',
  })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async syncDicomImages(@Param('patientId', ParseUUIDPipe) patientId: string) {
    await this.integrationService.syncDicomImagesToPatient(patientId);
    return { message: 'Imágenes DICOM sincronizadas exitosamente' };
  }

  @Post('sync/lab-results/:patientId')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar resultados de laboratorio desde FHIR' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Resultados de laboratorio sincronizados',
  })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async syncLabResults(@Param('patientId', ParseUUIDPipe) patientId: string) {
    await this.integrationService.syncLabResultsFromFHIR(patientId);
    return { message: 'Resultados de laboratorio sincronizados exitosamente' };
  }

  @Get('orthanc/patients')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Listar pacientes en Orthanc' })
  @ApiResponse({
    status: 200,
    description: 'Lista de IDs de pacientes en Orthanc',
  })
  async getOrthancPatients() {
    return this.orthancService.getPatients();
  }

  @Get('orthanc/patients/:patientId')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Obtener información de paciente en Orthanc' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente en Orthanc' })
  @ApiResponse({
    status: 200,
    description: 'Información del paciente',
  })
  async getOrthancPatient(@Param('patientId') patientId: string) {
    return this.orthancService.getPatient(patientId);
  }

  @Get('orthanc/patients/:patientId/studies')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Obtener estudios DICOM de un paciente' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente en Orthanc' })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudios',
  })
  async getPatientStudies(@Param('patientId') patientId: string) {
    return this.orthancService.getPatientStudies(patientId);
  }

  @Get('pharmacy/status')
  @Roles('cirujano', 'administrador', 'enfermeria')
  @ApiOperation({ summary: 'Estado del servicio de farmacia' })
  @ApiResponse({ status: 200, description: 'Disponibilidad de farmacia' })
  async getPharmacyStatus() {
    return this.pharmacyService.getStatus();
  }

  @Post('pharmacy/request')
  @Roles('cirujano', 'administrador', 'enfermeria')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar medicación a farmacia' })
  @ApiBody({ schema: { type: 'object', properties: { patientId: { type: 'string' }, medicationName: { type: 'string' }, quantity: { type: 'number' }, unit: { type: 'string' }, instructions: { type: 'string' }, priority: { type: 'string', enum: ['routine', 'urgent'] } } } })
  @ApiResponse({ status: 200, description: 'Solicitud aceptada o rechazada' })
  async requestMedication(@Body() body: { patientId: string; medicationName: string; quantity?: number; unit?: string; instructions?: string; priority?: 'routine' | 'urgent' }) {
    return this.pharmacyService.requestMedication(body);
  }

  @Post('orthanc/upload')
  @Roles('cirujano', 'administrador')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir archivo DICOM a Orthanc' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo DICOM subido exitosamente',
  })
  async uploadDicomFile(@UploadedFile() file: any) {
    if (!file || !file.buffer) {
      throw new HttpException('Archivo no válido', HttpStatus.BAD_REQUEST);
    }
    const instanceId = await this.orthancService.uploadDicomFile(
      Buffer.from(file.buffer),
    );
    return {
      instanceId,
      message: 'Archivo DICOM subido exitosamente',
    };
  }
}
