import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { IntegrationService } from './integration.service';
import { OrthancService } from './services/orthanc.service';
import { HL7Service } from './services/hl7.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';

@ApiTags('Integración Externa')
@Controller('integration')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("bearer")
export class IntegrationController {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly orthancService: OrthancService,
    private readonly hl7Service: HL7Service,
  ) {}

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
