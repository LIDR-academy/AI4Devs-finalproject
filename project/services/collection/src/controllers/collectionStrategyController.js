const CollectionStrategyService = require('../services/collectionStrategy.service');

class CollectionStrategyController {
  async createStrategy(req, res) {
    try {
      const strategy = await CollectionStrategyService.createStrategy(req.body);
      res.status(201).json(strategy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStrategiesByLevel(req, res) {
    try {
      const { nivel } = req.params;
      const strategies = await CollectionStrategyService.getStrategiesByProbabilityLevel(nivel);
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createAction(req, res) {
    try {
      const action = await CollectionStrategyService.createCollectionAction(req.body);
      res.status(201).json(action);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getActions(req, res) {
    try {
      const { estrategiaId } = req.params;
      const actions = await CollectionStrategyService.getActionsByStrategy(estrategiaId);
      res.json(actions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getContributorClassification(req, res) {
    try {
      const { contribuyenteId } = req.params;
      const classification = await CollectionStrategyService.getContributorClassification(contribuyenteId);
      
      if (!classification) {
        return res.status(404).json({ 
          error: 'No se encontró clasificación para el contribuyente' 
        });
      }
      
      res.json(classification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getContributorStrategies(req, res) {
    try {
      const { contribuyenteId } = req.params;
      const strategies = await CollectionStrategyService.getContributorStrategies(contribuyenteId);
      
      if (!strategies || strategies.length === 0) {
        return res.status(404).json({ 
          error: 'No se encontraron estrategias para el contribuyente' 
        });
      }
      
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CollectionStrategyController();