/**
 * DTO para solicitud de login
 */
export interface LoginRequestDto {
  username: string;
  password: string;
  captchaToken?: string;
}

