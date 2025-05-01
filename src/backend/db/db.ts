import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './types.js'
import 'dotenv/config';

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    max: 10,
  })
})

export const db = new Kysely<Database>({
  dialect,
})