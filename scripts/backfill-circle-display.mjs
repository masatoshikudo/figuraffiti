#!/usr/bin/env node
/**
 * 既存 spots の display_lat / display_lng / visible_after を埋める。
 *
 * 使い方:
 *   npm run supabase:db:backfill-circle-display
 *   DATABASE_URL="postgresql://..." node scripts/backfill-circle-display.mjs
 *   FORCE_ALL=1 npm run supabase:db:backfill-circle-display
 */

import pg from "pg"

const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

const EARTH_RADIUS_METERS = 6371000
const CIRCLE_RADIUS_M = 150
const forceAll = process.env.FORCE_ALL === "1"

function createRandomCircleCenter(lat, lng, maxOffsetMeters) {
  const distance = Math.sqrt(Math.random()) * maxOffsetMeters
  const angle = Math.random() * Math.PI * 2

  const northOffset = Math.cos(angle) * distance
  const eastOffset = Math.sin(angle) * distance

  const latOffset = (northOffset / EARTH_RADIUS_METERS) * (180 / Math.PI)
  const lngOffset =
    (eastOffset /
      (EARTH_RADIUS_METERS * Math.cos((lat * Math.PI) / 180))) *
    (180 / Math.PI)

  return {
    lat: lat + latOffset,
    lng: lng + lngOffset,
  }
}

async function main() {
  const client = new pg.Client({ connectionString: dbUrl })

  try {
    await client.connect()

    const { rows: spots } = await client.query(
      `
        select id, lat, lng, display_lat, display_lng, visible_after
        from spots
        where status = 'approved' or status is null
        order by created_at asc
      `
    )

    let updatedCount = 0

    for (const spot of spots) {
      const shouldUpdate =
        forceAll ||
        spot.display_lat == null ||
        spot.display_lng == null ||
        spot.visible_after == null

      if (!shouldUpdate) continue

      const center = createRandomCircleCenter(spot.lat, spot.lng, CIRCLE_RADIUS_M)

      await client.query(
        `
          update spots
          set display_lat = $2,
              display_lng = $3,
              visible_after = coalesce(visible_after, now())
          where id = $1
        `,
        [spot.id, center.lat, center.lng]
      )

      updatedCount += 1
    }

    console.log(`circle display を ${updatedCount} 件更新しました。`)
    if (!forceAll) {
      console.log("既存の display_* が入っているスポットはスキップしました。")
    }
  } catch (error) {
    console.error("実行エラー:", error.message)
    process.exit(1)
  } finally {
    try {
      await client.end()
    } catch (_) {}
  }
}

main()
