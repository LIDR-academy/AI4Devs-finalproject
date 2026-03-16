import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, PoolClient, QueryResult } from 'pg';
import { envs } from '../config';
import { LoggerService } from '../log/logger.service';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean | object;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  maxUses?: number;
}

@Injectable()
export class PgService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new LoggerService();

  constructor() {
    this.initializePool();
  }

  private initializePool(): void {
    const config: DatabaseConfig = {
      host: envs.db.host,
      port: envs.db.port,
      user: envs.db.username,
      password: envs.db.password,
      database: envs.db.name,
      max: envs.db.maxPool,
      idleTimeoutMillis: envs.db.idleTimeout,
      connectionTimeoutMillis: envs.db.connTimeout,
      maxUses: envs.db.pool.maxUses,
    };

    // Configuración SSL para producción
    if (envs.db.ssl) {
      config.ssl = {
        rejectUnauthorized: envs.db.ssl
      };
    }

    this.pool = new Pool(config);

    // Event listeners para monitoreo del pool
    this.pool.on('connect', (client: PoolClient) => {
      this.logger.debug('New client connected to database', 'Database');
    });

    this.pool.on('error', (err: Error, client: PoolClient) => {
      this.logger.error(`Unexpected error on idle client: ${err.message}`, err.stack, 'Database');
    });

    this.pool.on('remove', (client: PoolClient) => {
      this.logger.debug('Client removed from pool', 'Database');
    });

    this.logger.log('Pool de PostgreSQL inicializado correctamente', 'Database');
  }

  async onModuleInit(): Promise<void> {
    try {
      // Verificar conexión al inicializar
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.logger.log('DB:: Conexión a base de datos verificada exitosamente', 'Database');
    } catch (error) {
      this.logger.error('DB:: Error al conectar con la base de datos', error.stack, 'Database');
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.log('DB:: Pool de PostgreSQL cerrado correctamente', 'Database');
    } catch (error) {
      this.logger.error('DB:: Error al cerrar el pool de PostgreSQL', error.stack, 'Database');
    }
  }

  /**
   * Ejecuta una consulta y retorna todas las filas
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const startTime = Date.now();
    let client: PoolClient | null = null;

    try {
      client = await this.pool.connect();
      const result: QueryResult<any> = await client.query(sql, params);

      const duration = Date.now() - startTime;
      this.logger.logDatabaseQuery(sql, params, duration, 'Database');

      return result.rows;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log("--------------------------------------------------")
      console.log(`Error en consulta (${duration}ms): ${sql} - Params: ${JSON.stringify(params)} - Error: ${error.message}`);
      this.logger.logDatabaseError(error as Error, sql, params, 'Database');
      throw this.handleDatabaseError(error as Error);
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Ejecuta una consulta y retorna una sola fila
   */
  async queryGet<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Ejecuta una consulta y retorna todas las filas (alias de query)
   */
  async queryList<T = any>(sql: string, params?: any[]): Promise<T[]> {
    return this.query<T>(sql, params);
  }

  /**
   * Busca una entidad por condiciones específicas
   */
  async findOne<T = any>(
    table: string,
    options: {
      where: Record<string, any>;
      orderBy?: string;
      select?: string[];
    }
  ): Promise<T | null> {
    const { where, orderBy, select } = options;
    const keys = Object.keys(where);
    const values = Object.values(where);

    if (keys.length === 0) {
      throw new Error('Se requiere al menos una condición WHERE');
    }

    const selectClause = select ? select.join(', ') : '*';
    const whereClause = keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ');
    const orderClause = orderBy ? `ORDER BY ${orderBy}` : '';

    const sql = `SELECT ${selectClause} FROM ${table} WHERE ${whereClause} ${orderClause} LIMIT 1`;

    return this.queryGet<T>(sql, values);
  }

  resolvePagination(all: string, page: number, pageSize: number) {
    const shouldPaginate = all !== '*';
    return {
      shouldPaginate,
      take: shouldPaginate ? pageSize : undefined,
      skip: shouldPaginate ? (page - 1) * pageSize : undefined,
    };
  }


  /**
   * Busca entidades con paginación y conteo
   */
  async findAndCount<T = any>(
    table: string,
    options?: {
      where?: Record<string, any>;
      skip?: number;
      take?: number;
      order?: Record<string, 'ASC' | 'DESC'>;
      select?: string[];
    }
  ): Promise<[T[], number]> {
    const {
      where = {},
      skip,
      take,
      order,
      select,
    } = options || {};

    const keys = Object.keys(where);
    const values = Object.values(where);

    const selectClause = select ? select.join(', ') : '*';
    const whereClause = keys.length
      ? 'WHERE ' + keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ')
      : '';

    let orderClause = '';
    if (order) {
      const [field, direction] = Object.entries(order)[0];
      orderClause = `ORDER BY ${field} ${direction}`;
    }

    // Generar SQL dinámico
    let dataSql = `SELECT ${selectClause} FROM ${table} ${whereClause} ${orderClause}`;
    const params: any[] = [...values];

    if (typeof take === 'number') {
      dataSql += ` LIMIT $${params.length + 1}`;
      params.push(take);
    }

    if (typeof skip === 'number') {
      dataSql += ` OFFSET $${params.length + 1}`;
      params.push(skip);
    }

    const data = await this.queryList<T>(dataSql, params);

    // Query de total
    const countSql = `SELECT COUNT(*)::int AS total FROM ${table} ${whereClause}`;
    const countResult = await this.queryList<{ total: number }>(countSql, values);
    const total = countResult[0]?.total || 0;

    return [data, total];
  }

  /*
  * Realiza una consulta con joins, paginación y conteo
  */
  async findAndCountJoin<T = any>(
    baseTable: string,
    options?: {
      joins?: {
        table: string;
        alias: string;
        on: string;
        type?: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
      }[];
      where?: Record<string, any>;
      skip?: number;
      take?: number;
      order?: Record<string, 'ASC' | 'DESC'>;
      select?: string[];
    }
  ): Promise<[T[], number]> {
    const {
      joins = [],
      where = {},
      skip,
      take,
      order,
      select,
    } = options || {};

    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);

    const selectClause = select?.length ? select.join(', ') : '*';

    const joinClause = joins
      .map(j => `${j.type ?? 'INNER'} JOIN ${j.table} AS ${j.alias} ON ${j.on}`)
      .join(' ');

    const whereClause =
      whereKeys.length > 0
        ? 'WHERE ' + whereKeys.map((k, i) => `${k} = $${i + 1}`).join(' AND ')
        : '';

    let orderClause = '';
    if (order) {
      const [field, direction] = Object.entries(order)[0];
      orderClause = `ORDER BY ${field} ${direction}`;
    }

    let dataSql = `
    SELECT ${selectClause}
    FROM ${baseTable}
    ${joinClause}
    ${whereClause}
    ${orderClause}
  `;

    const params: any[] = [...whereValues];

    // ✅ Aplicar paginación solo si están definidos take y skip como números
    if (typeof take === 'number') {
      dataSql += ` LIMIT $${params.length + 1}`;
      params.push(take);
    }

    if (typeof skip === 'number') {
      dataSql += ` OFFSET $${params.length + 1}`;
      params.push(skip);
    }

    const data = await this.queryList<T>(dataSql, params);

    const countSql = `
    SELECT COUNT(*)::int AS total
    FROM ${baseTable}
    ${joinClause}
    ${whereClause}
  `;

    const countResult = await this.queryList<{ total: number }>(countSql, whereValues);
    const total = countResult[0]?.total || 0;

    return [data, total];
  }


  /**
   * Crea una nueva entidad
   */
  async create<T = any>(table: string, entity: Record<string, any>): Promise<T | null> {
    const keys = Object.keys(entity);

    if (keys.length === 0) {
      throw new Error('No se pueden insertar entidades vacías');
    }
    // Filtrar claves y valores que no sean undefined
    const filteredEntries = Object.entries(entity).filter(([_, value]) => value !== undefined);
    const keysFiltered = filteredEntries.map(([key]) => key);
    const valuesFiltered = filteredEntries.map(([_, value]) => value);
    // Generar columnas y parámetros solo con datos válidos
    const columns = keysFiltered.join(', ');
    const params = keysFiltered.map((_, i) => `$${i + 1}`).join(', ');

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${params}) RETURNING *`;
    console.log(`Ejecutando consulta: ${sql}`);
    return this.queryGet<T>(sql, valuesFiltered);
  }

  /**
   * Actualiza una entidad existente
   */
  async update<T = any>(
    table: string,
    entity: Record<string, any>,
    where: Record<string, any>
  ): Promise<T | null> {
    // Filtrar campos de entity que no sean undefined
    const filteredEntityEntries = Object.entries(entity).filter(([_, value]) => value !== undefined);
    const entityKeys = filteredEntityEntries.map(([key]) => key);
    const entityValues = filteredEntityEntries.map(([_, value]) => value);

    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);

    if (entityKeys.length === 0) {
      throw new Error('No se pueden actualizar entidades vacías');
    }

    if (whereKeys.length === 0) {
      throw new Error('Se requiere al menos una condición WHERE para actualizar');
    }

    const setClause = entityKeys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const whereClause = whereKeys.map((k, i) => `${k} = $${entityKeys.length + i + 1}`).join(' AND ');

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
    return this.queryGet<T>(sql, [...entityValues, ...whereValues]);
  }

  /**
   * Elimina entidades que cumplan las condiciones
   */
  async delete<T = any>(table: string, where: Record<string, any>): Promise<T | null> {
    const keys = Object.keys(where);
    const values = Object.values(where);

    if (keys.length === 0) {
      throw new Error('Se requiere al menos una condición WHERE para eliminar');
    }

    const whereClause = keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;

    return this.queryGet<T>(sql, values);
  }

  /**
   * Ejecuta una transacción
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Transaction rolled back', error.stack, 'Database');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Verifica el estado de la conexión
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Health check failed', error.stack, 'Database');
      return false;
    }
  }

  /**
   * Obtiene estadísticas del pool
   */
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  /**
   * Maneja errores de base de datos de forma centralizada
   */
  private handleDatabaseError(error: Error): Error {
    // Errores específicos de PostgreSQL
    if (error.message.includes('duplicate key value')) {
      return new Error('Registro duplicado');
    }

    if (error.message.includes('violates foreign key constraint')) {
      return new Error('Violación de clave foránea');
    }

    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      return new Error(`Tabla no encontrada: ${error.message}`);
    }

    if (error.message.includes('column') && error.message.includes('does not exist')) {
      return new Error(`Columna no encontrada: ${error.message}`);
    }

    // Error genérico
    return new Error(`Error de base de datos: ${error.message}`);
  }
}
