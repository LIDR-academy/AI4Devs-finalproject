import { apiClient } from './api';

// Definición de interfaces
export interface EmpleadoDto {
  id: number;
  nombre: string;
  apellidos: string;
  // Añadir otros campos según sea necesario
}

// Servicio para gestionar empleados
const empleadoService = {
  /**
   * Obtiene todos los empleados
   * @returns Lista de empleados
   */
  async getEmpleados() {
    return apiClient.get<{
      data: EmpleadoDto[];
      statusCode: number;
      message: string;
    }>('/v1/Empleados');
  },

  /**
   * Obtiene un empleado por su ID
   * @param id - ID del empleado
   * @returns Datos del empleado
   */
  async getEmpleadoById(id: number) {
    return apiClient.get<{
      data: EmpleadoDto;
      statusCode: number;
      message: string;
    }>(`/v1/Empleados/${id}`);
  },
};

export default empleadoService;
