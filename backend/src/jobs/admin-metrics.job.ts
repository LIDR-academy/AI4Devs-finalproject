import { AdminMetricsService } from '../services/admin-metrics.service';
import { logger } from '../utils/logger';

const ONE_MINUTE = 60 * 1000;
let lastRunDate = '';

function getMexicoCityParts(date: Date): { hour: string; minute: string; date: string } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return {
    hour: getPart('hour'),
    minute: getPart('minute'),
    date: `${getPart('year')}-${getPart('month')}-${getPart('day')}`,
  };
}

export function startAdminMetricsJob() {
  const service = new AdminMetricsService();

  const tick = async () => {
    const now = new Date();
    const mx = getMexicoCityParts(now);
    const shouldRun = mx.hour === '02' && mx.minute === '00' && lastRunDate !== mx.date;
    if (!shouldRun) return;

    try {
      await service.computeAndCacheDailySnapshot();
      lastRunDate = mx.date;
      logger.info('[AdminMetricsJob] Snapshot diario actualizado');
    } catch (error) {
      logger.error('[AdminMetricsJob] Error al generar snapshot diario:', error);
    }
  };

  const timer = setInterval(() => {
    tick().catch((error) => logger.error('[AdminMetricsJob] Tick error:', error));
  }, ONE_MINUTE);

  logger.info('[AdminMetricsJob] Planificador iniciado (2:00 AM CDMX)');
  return timer;
}
