import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HceService } from './hce.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { SearchPatientDto } from './dto/search-patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';

@ApiTags('Historia Clínica Electrónica (HCE)')
@Controller('hce')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearer')
export class HceController {
  constructor(private readonly hceService: HceService) {}

  @Post('patients')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo paciente' })
  @ApiResponse({
    status: 201,
    description: 'Paciente creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o paciente duplicado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  async createPatient(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: any,
  ) {
    return this.hceService.createPatient(createPatientDto, user.userId);
  }

  @Get('patients')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Buscar pacientes' })
  @ApiQuery({ name: 'firstName', required: false })
  @ApiQuery({ name: 'lastName', required: false })
  @ApiQuery({ name: 'id', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de pacientes encontrados',
  })
  async searchPatients(@Query() searchDto: SearchPatientDto) {
    return this.hceService.searchPatients(searchDto);
  }

  @Get('patients/:id')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Obtener paciente por ID' })
  @ApiParam({ name: 'id', description: 'ID del paciente (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Paciente encontrado',
  })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async getPatient(@Param('id', ParseUUIDPipe) id: string) {
    return this.hceService.findPatientById(id);
  }

  @Get('patients/:id/medical-history')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Obtener historia clínica completa del paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Historia clínica completa',
  })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async getMedicalHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.hceService.getPatientMedicalHistory(id);
  }

  @Put('patients/:id/medical-record')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Actualizar antecedentes médicos del paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente (UUID)' })
  @ApiResponse({ status: 200, description: 'Registro médico actualizado' })
  @ApiResponse({ status: 404, description: 'Paciente o registro no encontrado' })
  async updateMedicalRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateMedicalRecordDto,
  ) {
    return this.hceService.updateMedicalRecord(id, updateDto);
  }

  @Put('patients/:id')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Actualizar paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Paciente actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID inválido o datos inválidos' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async updatePatient(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: any,
  ) {
    return this.hceService.updatePatient(id, updatePatientDto, user.userId);
  }

  @Delete('patients/:id')
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente (UUID)' })
  @ApiResponse({
    status: 204,
    description: 'Paciente eliminado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async deletePatient(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    await this.hceService.deletePatient(id, user.userId);
  }

  @Post('allergies')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar alergia a paciente' })
  @ApiResponse({
    status: 201,
    description: 'Alergia agregada exitosamente',
  })
  async addAllergy(@Body() createAllergyDto: CreateAllergyDto) {
    return this.hceService.addAllergy(createAllergyDto);
  }

  @Put('allergies/:allergyId')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Actualizar alergia' })
  @ApiParam({ name: 'allergyId', description: 'ID de la alergia (UUID)' })
  @ApiResponse({ status: 200, description: 'Alergia actualizada' })
  @ApiResponse({ status: 404, description: 'Alergia no encontrada' })
  async updateAllergy(
    @Param('allergyId', ParseUUIDPipe) allergyId: string,
    @Body() updateDto: UpdateAllergyDto,
  ) {
    return this.hceService.updateAllergy(allergyId, updateDto);
  }

  @Delete('allergies/:allergyId')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar alergia' })
  @ApiParam({ name: 'allergyId', description: 'ID de la alergia (UUID)' })
  @ApiResponse({ status: 204, description: 'Alergia eliminada' })
  @ApiResponse({ status: 404, description: 'Alergia no encontrada' })
  async deleteAllergy(@Param('allergyId', ParseUUIDPipe) allergyId: string) {
    await this.hceService.deleteAllergy(allergyId);
  }

  @Post('medications')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar medicación a paciente' })
  @ApiResponse({
    status: 201,
    description: 'Medicación agregada exitosamente',
  })
  async addMedication(@Body() createMedicationDto: CreateMedicationDto) {
    return this.hceService.addMedication(createMedicationDto);
  }

  @Put('medications/:medicationId')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Actualizar medicación' })
  @ApiParam({ name: 'medicationId', description: 'ID de la medicación (UUID)' })
  @ApiResponse({ status: 200, description: 'Medicación actualizada' })
  @ApiResponse({ status: 404, description: 'Medicación no encontrada' })
  async updateMedication(
    @Param('medicationId', ParseUUIDPipe) medicationId: string,
    @Body() updateDto: UpdateMedicationDto,
  ) {
    return this.hceService.updateMedication(medicationId, updateDto);
  }

  @Delete('medications/:medicationId')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar medicación' })
  @ApiParam({ name: 'medicationId', description: 'ID de la medicación (UUID)' })
  @ApiResponse({ status: 204, description: 'Medicación eliminada' })
  @ApiResponse({ status: 404, description: 'Medicación no encontrada' })
  async deleteMedication(@Param('medicationId', ParseUUIDPipe) medicationId: string) {
    await this.hceService.deleteMedication(medicationId);
  }
}
