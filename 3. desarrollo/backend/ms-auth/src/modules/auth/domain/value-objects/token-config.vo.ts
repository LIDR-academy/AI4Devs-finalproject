/**
 * Value Object que representa la configuración de tokens JWT
 */
export class TokenConfig {
  constructor(
    public readonly accessTokenMinutes: number,
    public readonly refreshTokenDays: number,
  ) {}

  /**
   * Calcula la fecha de expiración del access token
   */
  getAccessTokenExpiration(): Date {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + this.accessTokenMinutes);
    return expiration;
  }

  /**
   * Calcula la fecha de expiración del refresh token
   */
  getRefreshTokenExpiration(): Date {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + this.refreshTokenDays);
    return expiration;
  }
}

