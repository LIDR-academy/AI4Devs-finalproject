const db = require('../config/database');

class MonitoringService {
    async getCollectionMetrics(fechaInicio, fechaFin) {
        const query = `
            SELECT 
                COUNT(DISTINCT p.id) as total_pagos,
                SUM(p.monto) as monto_total_recaudado,
                AVG(p.monto) as promedio_pago,
                COUNT(DISTINCT p.contribuyente_id) as contribuyentes_pagadores,
                (
                    SELECT COUNT(DISTINCT contribuyente_id) 
                    FROM deuda 
                    WHERE fecha_vencimiento BETWEEN $1 AND $2
                ) as total_contribuyentes_deuda,
                (
                    SELECT SUM(monto) 
                    FROM deuda 
                    WHERE fecha_vencimiento BETWEEN $1 AND $2
                ) as monto_total_deuda
            FROM pago p
            WHERE p.fecha_pago BETWEEN $1 AND $2
            AND p.estado = 'PAGADO'
        `;
        
        const result = await db.query(query, [fechaInicio, fechaFin]);
        return result.rows[0];
    }

    async getStrategyEffectiveness() {
        const query = `
            SELECT 
                ec.nombre as estrategia,
                cl.nivel_probabilidad,
                COUNT(DISTINCT ac.id) as total_acciones,
                COUNT(DISTINCT p.id) as pagos_realizados,
                SUM(p.monto) as monto_recaudado,
                COUNT(DISTINCT p.id)::float / NULLIF(COUNT(DISTINCT ac.id), 0) * 100 as tasa_efectividad
            FROM estrategia_cobro ec
            JOIN accion_cobro ac ON ec.id = ac.estrategia_id
            JOIN clasificacion cl ON ec.clasificacion_id = cl.id
            LEFT JOIN pago p ON cl.contribuyente_id = p.contribuyente_id
            WHERE p.fecha_pago >= ac.fecha_creacion
            GROUP BY ec.nombre, cl.nivel_probabilidad
            ORDER BY tasa_efectividad DESC
        `;
        
        const result = await db.query(query);
        return result.rows;
    }

    async getNotificationEffectiveness() {
        const query = `
            SELECT 
                n.tipo as tipo_notificacion,
                COUNT(*) as total_enviadas,
                COUNT(CASE WHEN n.estado = 'ENTREGADA' THEN 1 END) as entregadas,
                COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as resultaron_en_pago,
                AVG(CASE WHEN p.id IS NOT NULL THEN p.monto END) as promedio_pago,
                COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END)::float / 
                    NULLIF(COUNT(CASE WHEN n.estado = 'ENTREGADA' THEN 1 END), 0) * 100 as tasa_conversion
            FROM notificacion n
            LEFT JOIN pago p ON n.contribuyente_id = p.contribuyente_id
                AND p.fecha_pago >= n.fecha_envio
            GROUP BY n.tipo
            ORDER BY tasa_conversion DESC
        `;
        
        const result = await db.query(query);
        return result.rows;
    }

    async getCollectionTrends() {
        const query = `
            SELECT 
                DATE_TRUNC('month', p.fecha_pago) as mes,
                COUNT(DISTINCT p.id) as total_pagos,
                SUM(p.monto) as monto_total,
                COUNT(DISTINCT p.contribuyente_id) as contribuyentes_unicos
            FROM pago p
            WHERE p.fecha_pago >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', p.fecha_pago)
            ORDER BY mes DESC
        `;
        
        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = new MonitoringService();
