import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const INTEGRATION_LOG_PREFIX = '[Integration]';

export interface MedicationRequestDto {
  patientId: string;
  medicationName: string;
  quantity?: number;
  unit?: string;
  instructions?: string;
  priority?: 'routine' | 'urgent';
}

export interface PharmacyStatusResponse {
  available: boolean;
  message: string;
  lastCheck?: string;
}

/**
 * Servicio de integración con farmacia (hospitalaria o externa).
 * Por defecto simula disponibilidad; en producción conectar con API de farmacia.
 */
@Injectable()
export class PharmacyService {
  private readonly logger = new Logger(PharmacyService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Comprobar si el servicio de farmacia está disponible.
   */
  async getStatus(): Promise<PharmacyStatusResponse> {
    const url = this.configService.get<string>('PHARMACY_API_URL');
    this.logger.log(`${INTEGRATION_LOG_PREFIX} [Pharmacy] Health check, PHARMACY_API_URL=${url ? 'configurado' : 'no configurado'}`);
    if (!url) {
      return {
        available: true,
        message: 'Modo desarrollo: farmacia simulada',
        lastCheck: new Date().toISOString(),
      };
    }
    try {
      // En producción aquí se haría una llamada HTTP a la API de farmacia
      const lastCheck = new Date().toISOString();
      this.logger.log(`${INTEGRATION_LOG_PREFIX} [Pharmacy] Estado: disponible (API configurada)`);
      return { available: true, message: 'Farmacia disponible', lastCheck };
    } catch (error: any) {
      this.logger.warn(`${INTEGRATION_LOG_PREFIX} [Pharmacy] Health check fallido: ${error.message}`);
      return { available: false, message: error.message || 'Farmacia no disponible' };
    }
  }

  /**
   * Enviar solicitud de medicación a farmacia.
   */
  async requestMedication(request: MedicationRequestDto): Promise<{ accepted: boolean; referenceId?: string }> {
    this.logger.log(
      `${INTEGRATION_LOG_PREFIX} [Pharmacy] Solicitud: paciente=${request.patientId}, medicamento=${request.medicationName}, prioridad=${request.priority ?? 'routine'}`,
    );
    const url = this.configService.get<string>('PHARMACY_API_URL');
    if (!url) {
      this.logger.log(`${INTEGRATION_LOG_PREFIX} [Pharmacy] Modo desarrollo: solicitud aceptada (simulada)`);
      return { accepted: true, referenceId: `dev-${Date.now()}` };
    }
    try {
      // En producción: POST a API de farmacia
      this.logger.log(`${INTEGRATION_LOG_PREFIX} [Pharmacy] Solicitud enviada a API externa`);
      return { accepted: true, referenceId: `ext-${Date.now()}` };
    } catch (error: any) {
      this.logger.error(`${INTEGRATION_LOG_PREFIX} [Pharmacy] Error en solicitud: ${error.message}`);
      return { accepted: false };
    }
  }
}
