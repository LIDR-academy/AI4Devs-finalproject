const db = require('../config/database');

class CollectionStrategyService {
  async createStrategy(strategyData) {
    const { clasificacion_id, nombre, descripcion } = strategyData;
    
    const query = `
      INSERT INTO estrategia_cobro (clasificacion_id, nombre, descripcion)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await db.query(query, [clasificacion_id, nombre, descripcion]);
    return result.rows[0];
  }

  async getStrategiesByProbabilityLevel(nivel) {
    const query = `
      SELECT ec.* 
      FROM estrategia_cobro ec
      JOIN clasificacion c ON ec.clasificacion_id = c.id
      WHERE c.nivel_probabilidad = $1 AND ec.activa = true
    `;
    
    const result = await db.query(query, [nivel]);
    return result.rows;
  }

  async createCollectionAction(actionData) {
    const { estrategia_id, tipo_accion, descripcion, orden } = actionData;
    
    const query = `
      INSERT INTO accion_cobro (estrategia_id, tipo_accion, descripcion, orden)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await db.query(query, [estrategia_id, tipo_accion, descripcion, orden]);
    return result.rows[0];
  }

  async getActionsByStrategy(estrategia_id) {
    const query = `
      SELECT * FROM accion_cobro
      WHERE estrategia_id = $1 AND activa = true
      ORDER BY orden
    `;
    
    const result = await db.query(query, [estrategia_id]);
    return result.rows;
  }

  async getContributorClassification(contribuyenteId) {
    const query = `
      SELECT 
        c.id as contribuyente_id,
        c.documento,
        c.nombre as contribuyente_nombre,
        cl.id as clasificacion_id,
        cl.nivel_probabilidad,
        cl.score as puntaje,
        cl.fecha_clasificacion
      FROM contribuyente c
      JOIN clasificacion cl ON c.id = cl.contribuyente_id
      WHERE c.id = $1
      ORDER BY cl.fecha_clasificacion DESC
      LIMIT 1
    `;
    
    const result = await db.query(query, [contribuyenteId]);
    return result.rows[0];
  }

  async getContributorStrategies(contribuyenteId) {
    const query = `
      SELECT 
        c.id as contribuyente_id,
        c.nombre as contribuyente_nombre,
        cl.nivel_probabilidad,
        ec.id as estrategia_id,
        ec.nombre as estrategia_nombre,
        ec.descripcion as estrategia_descripcion
      FROM contribuyente c
      JOIN clasificacion cl ON c.id = cl.contribuyente_id
      JOIN estrategia_cobro ec ON cl.id = ec.clasificacion_id
      WHERE c.id = $1 
        AND c.activo = true 
        AND ec.activa = true
      ORDER BY cl.fecha_clasificacion DESC
    `;
    
    const result = await db.query(query, [contribuyenteId]);
    return result.rows;
  }
}

module.exports = new CollectionStrategyService();