#!/usr/bin/env node
/**
 * run-full-schema.sql をローカル or リモートの Supabase DB に実行する。
 * psql がなくても Node だけで動く。
 *
 * 使い方:
 *   npm run supabase:db:run-full-schema
 *   DATABASE_URL="postgresql://..." node scripts/run-full-schema.mjs
 */

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import pg from "pg"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, "..")
const sqlPath = join(projectRoot, "supabase", "run-full-schema.sql")

const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

function showRemoteHint() {
  console.error(`
リモートの Supabase に実行する場合:
  1. ダッシュボード https://supabase.com/dashboard → 対象プロジェクト
  2. Settings → Database → Connection string で "URI" をコピー
  3. パスワードを埋めて実行:
     DATABASE_URL="postgresql://postgres.[ref]:[パスワード]@..." npm run supabase:db:run-full-schema
`)
}

async function main() {
  const sql = readFileSync(sqlPath, "utf8")
  const client = new pg.Client({ connectionString: dbUrl })

  try {
    await client.connect()
    await client.query(sql)
    console.log("run-full-schema.sql を正常に実行しました。")
  } catch (err) {
    console.error("実行エラー:", err.message)
    if (err.code === "ECONNREFUSED" && !process.env.DATABASE_URL) {
      showRemoteHint()
    }
    process.exit(1)
  } finally {
    try {
      await client.end()
    } catch (_) {}
  }
}

main()
