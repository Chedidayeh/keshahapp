import { NextResponse } from "next/server";
import bigquery from "@/lib/bigquery"; // ✅ Make sure you already have this instance set up

export async function GET() {
  const query = `
  WITH users AS (
  SELECT
    JSON_VALUE(data, '$.email') AS email,
    TIMESTAMP_SECONDS(CAST(JSON_VALUE(data, '$.created_at._seconds') AS INT64)) AS created_at,
    JSON_QUERY(data, '$.progress') AS progress
  FROM
   \`keshah-app.firestore_export.users_raw_latest\`
  WHERE
    JSON_QUERY(data, '$.progress') IS NOT NULL
    AND JSON_EXTRACT_SCALAR(data, '$.is_deleted') = 'false'
),

retention AS (
  SELECT
    COUNTIF(DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)) AS eligible_day1,
    COUNTIF(DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)) AS eligible_day3,
    COUNTIF(DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)) AS eligible_day7,
    COUNTIF(DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 15 DAY)) AS eligible_day15,
    COUNTIF(DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) AS eligible_day30,
    COUNTIF(DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)) AS eligible_day60,
    COUNTIF(DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)) AS eligible_day90,

    COUNTIF(JSON_QUERY(progress, '$.day1') IS NOT NULL
            AND DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)) AS day1_active,
    COUNTIF(JSON_QUERY(progress, '$.day3') IS NOT NULL
            AND DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)) AS day3_active,
    COUNTIF(JSON_QUERY(progress, '$.day7') IS NOT NULL
            AND DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)) AS day7_active,
    COUNTIF(JSON_QUERY(progress, '$.day15') IS NOT NULL
            AND DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 15 DAY)) AS day15_active,
    COUNTIF(JSON_QUERY(progress, '$.day30') IS NOT NULL
            AND DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) AS day30_active,
    COUNTIF(JSON_QUERY(progress, '$.day60') IS NOT NULL
            AND DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)) AS day60_active,
    COUNTIF(JSON_QUERY(progress, '$.day90') IS NOT NULL
            AND DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)) AS day90_active
  FROM users
)

SELECT
  ROUND(100 * (day1_active / NULLIF(eligible_day1, 0)), 2) AS day1_retention,
  ROUND(100 * (day3_active / NULLIF(eligible_day3, 0)), 2) AS day3_retention,
  ROUND(100 * (day7_active / NULLIF(eligible_day7, 0)), 2) AS day7_retention,
  ROUND(100 * (day15_active / NULLIF(eligible_day15, 0)), 2) AS day15_retention,
  ROUND(100 * (day30_active / NULLIF(eligible_day30, 0)), 2) AS day30_retention,
  ROUND(100 * (day60_active / NULLIF(eligible_day60, 0)), 2) AS day60_retention,
  ROUND(100 * (day90_active / NULLIF(eligible_day90, 0)), 2) AS day90_retention
FROM retention;

  `;

  const [rows] = await bigquery.query(query);
  return NextResponse.json(rows[0]);
}
