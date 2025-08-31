import { drizzle } from 'drizzle-orm/d1'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from './schema'

export type Database = DrizzleD1Database<typeof schema>

// HonoX の Context から D1 バインディングを取得してクライアントを初期化
export function createDrizzleClient(d1: D1Database): Database {
  return drizzle(d1, { schema })
}

// 環境変数から型定義
export interface Env {
  DB: D1Database
}
