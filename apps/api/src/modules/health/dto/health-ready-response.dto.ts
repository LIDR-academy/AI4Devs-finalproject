export class HealthReadyResponseDto {
  status: 'ok' | 'error';
  checks: {
    database: 'up' | 'down';
  };
}
