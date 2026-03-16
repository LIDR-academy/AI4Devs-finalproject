import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { envs } from '../config';


@Injectable()
export class PgService implements OnModuleDestroy {
  pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: envs.db.host || 'localhost',
      port: envs.db.port || 5432,
      user: envs.db.username || 'postgres',
      password: envs.db.password || 'postgres',
      database: envs.db.name || 'test',
    });

    console.log('✅ Pool de PostgreSQL inicializado');
  }
  

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  public async queryGet<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const result = await this.pool.query(sql, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  public async queryList<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }


  public async findOne<T = any>(table: string, options: { where: Record<string, any>; orderBy?: string }): Promise<T | null> {
    const where = options.where || {};
    const keys = Object.keys(where);
    const values = Object.values(where);
    const whereClause = keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ');
    const sql = `SELECT * FROM ${table} WHERE ${whereClause} ${options.orderBy ? 'ORDER BY ' + options.orderBy : ''} LIMIT 1`;
    const result = await this.queryList<T>(sql, values);
    return result[0] || null;
  }

  public async findAndCount<T = any>(
    table: string,
    options?: {
      where?: Record<string, any>;
      skip?: number;   // equivalente a offset
      take?: number;   // equivalente a limit
      order?: Record<string, 'ASC' | 'DESC'>;
    }
  ): Promise<[T[], number]> {
    const where = options?.where || {};
    const keys = Object.keys(where);
    const values = Object.values(where);

    // Construir cláusula WHERE
    const whereClause = keys.length ? 'WHERE ' + keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ') : '';

    // Construir ORDER BY
    let orderClause = '';
    if (options?.order) {
      const [field, direction] = Object.entries(options.order)[0];
      orderClause = `ORDER BY ${field} ${direction}`;
    }

    // Paginación
    const skip = options?.skip || 0;
    const take = options?.take || 10;

    // Query de datos
    const dataSql = `SELECT * FROM ${table} ${whereClause} ${orderClause} LIMIT $${keys.length + 1} OFFSET $${keys.length + 2}`;
    const data = await this.queryList<T>(dataSql, [...values, take, skip]);

    // Query de total
    const countSql = `SELECT COUNT(*)::int AS total FROM ${table} ${whereClause}`;
    const countResult = await this.queryList<{ total: number }>(countSql, values);
    const total = countResult[0]?.total || 0;
    return [data, total];
  }

  async create<T = any>(table: string, entity: Record<string, any>): Promise<T | null> {
    const keys = Object.keys(entity);
    const values = Object.values(entity);

    const columns = keys.join(', ');
    const params = keys.map((_, i) => `$${i + 1}`).join(', ');

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${params}) RETURNING *`;

    const result = await this.queryGet<T>(sql, values);
    return result || null;
  }




  async onModuleDestroy() {
    await this.pool.end();
  }

}
