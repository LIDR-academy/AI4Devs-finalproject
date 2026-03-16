const MonitoringService = require('../services/monitoring.service');

class MonitoringController {
    async getCollectionMetrics(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            const metrics = await MonitoringService.getCollectionMetrics(
                new Date(fechaInicio), 
                new Date(fechaFin)
            );
            res.json(metrics);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getStrategyEffectiveness(req, res) {
        try {
            const effectiveness = await MonitoringService.getStrategyEffectiveness();
            res.json(effectiveness);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getNotificationEffectiveness(req, res) {
        try {
            const effectiveness = await MonitoringService.getNotificationEffectiveness();
            res.json(effectiveness);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCollectionTrends(req, res) {
        try {
            const trends = await MonitoringService.getCollectionTrends();
            res.json(trends);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new MonitoringController();
