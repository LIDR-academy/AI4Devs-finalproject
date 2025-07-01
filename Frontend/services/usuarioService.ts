/**
 * Servicio para la gestión de usuarios
 */
import { apiClient } from './api';

// Interfaces para los DTOs
export interface UsuarioDto {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  movil: string;
  perfilId: number;
  empleadoId?: number;
  objetoId: number;
  activo: boolean;
  perfilNombre?: string;
  fechaCreacion?: string;
  fechaUltimoAcceso?: string;
}

export interface CreateUsuarioDto {
  nombre: string;
  apellidos: string;
  email: string;
  movil?: string;
  password?: string;
  perfilId: number;
  empleadoId?: number;
  objetoId: number;
  activo?: boolean;
}

export interface UpdateUsuarioDto {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  movil?: string;
  perfilId: number;
  empleadoId?: number;
  objetoId: number;
  activo: boolean;
}

export interface ChangePasswordDto {
  id: number;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Servicio para la gestión de usuarios
 */
export const usuarioService = {
  /**
   * Obtiene todos los usuarios
   * @returns Lista de usuarios
   */
  async getUsuarios() {
    return apiClient.get<{
      data: UsuarioDto[];
      statusCode: number;
      message: string;
    }>('/v1/Usuarios');
  },

  /**
   * Obtiene un usuario por su ID
   * @param id - ID del usuario
   * @returns Datos del usuario
   */
  async getUsuarioById(id: number) {
    return apiClient.get<{
      data: UsuarioDto;
      statusCode: number;
      message: string;
    }>(`/v1/Usuarios/${id}`);
  },

  /**
   * Crea un nuevo usuario
   * @param usuario - Datos del usuario a crear
   * @returns Usuario creado
   */
  async createUsuario(usuario: CreateUsuarioDto) {
    return apiClient.post<{
      data: UsuarioDto;
      statusCode: number;
      message: string;
    }>('/v1/Usuarios', usuario);
  },

  /**
   * Actualiza un usuario existente
   * @param id - ID del usuario a actualizar
   * @param usuario - Datos actualizados del usuario
   * @returns Usuario actualizado
   */
  async updateUsuario(id: number, usuario: any) {
    // Asegurarse de que los datos se envían con el formato correcto para el backend
    return apiClient.put<{
      data: UsuarioDto;
      statusCode: number;
      message: string;
    }>(`/v1/Usuarios/${id}`, usuario);
  },

  /**
   * Elimina un usuario
   * @param id - ID del usuario a eliminar
   * @returns Resultado de la operación
   */
  async deleteUsuario(id: number) {
    return apiClient.delete<{
      data: boolean;
      statusCode: number;
      message: string;
    }>(`/v1/Usuarios/${id}`);
  },

  /**
   * Cambia la contraseña de un usuario
   * @param changePasswordDto - Datos para el cambio de contraseña
   * @returns Resultado de la operación
   */
  async changePassword(changePasswordDto: ChangePasswordDto) {
    return apiClient.post<{
      data: boolean;
      statusCode: number;
      message: string;
    }>('/v1/Usuarios/change-password', changePasswordDto);
  },

  /**
   * Activa o desactiva un usuario
   * @param id - ID del usuario
   * @param activo - Estado a establecer
   * @returns Resultado de la operación
   */
  async toggleUsuarioStatus(id: number, activo: boolean) {
    // Usar el endpoint general de actualización
    return apiClient.put<{
      data: boolean;
      statusCode: number;
      message: string;
    }>(`/v1/Usuarios/${id}`, { id, activo });
  }
};
