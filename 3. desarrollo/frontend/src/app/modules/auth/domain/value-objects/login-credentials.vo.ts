/**
 * Value Object para credenciales de login
 * Inmutable y con validación
 */
export class LoginCredentials {
  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly rememberMe: boolean = false,
    public readonly captchaToken?: string
  ) {
    this.validate();
  }

  /**
   * Valida que las credenciales tengan el formato correcto
   */
  private validate(): void {
    if (!this.username || this.username.trim().length === 0) {
      throw new Error('El nombre de usuario es requerido');
    }

    if (this.username.length < 3) {
      throw new Error('El nombre de usuario debe tener al menos 3 caracteres');
    }

    if (this.username.length > 50) {
      throw new Error('El nombre de usuario no puede exceder 50 caracteres');
    }

    if (!this.password || this.password.length === 0) {
      throw new Error('La contraseña es requerida');
    }

    if (this.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
  }

  /**
   * Crea una instancia desde un objeto plano
   */
  static fromPlain(plain: {
    username: string;
    password: string;
    rememberMe?: boolean;
    captchaToken?: string;
  }): LoginCredentials {
    return new LoginCredentials(
      plain.username,
      plain.password,
      plain.rememberMe ?? false,
      plain.captchaToken
    );
  }

  /**
   * Convierte a objeto plano para envío al backend
   */
  toPlain(): {
    username: string;
    password: string;
    captchaToken?: string;
  } {
    return {
      username: this.username,
      password: this.password,
      ...(this.captchaToken && { captchaToken: this.captchaToken }),
    };
  }
}

