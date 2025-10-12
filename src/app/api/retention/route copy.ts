import { NextResponse } from "next/server";
import bigquery from "@/lib/bigquery"; // ✅ Make sure you already have this instance set up

export async function GET() {
  const query = `
  WITH users AS (
  SELECT
    JSON_VALUE(data, '$.email') AS email,
    DATE(TIMESTAMP_SECONDS(CAST(JSON_VALUE(data, '$.created_at._seconds') AS INT64))) AS signup_date,
    JSON_QUERY(data, '$.progress') AS progress
  FROM
    \`keshah-app.firestore_export.users_raw_latest\`
  WHERE
    JSON_QUERY(data, '$.progress') IS NOT NULL
    AND JSON_EXTRACT_SCALAR(data, '$.is_deleted') = 'false'
),

-- Define cohort and calculate retention per day
cohorts AS (
  SELECT
    signup_date,
    COUNT(DISTINCT email) AS total_users,
    COUNTIF(JSON_QUERY(progress, '$.day1') IS NOT NULL) AS day1_active,
    COUNTIF(JSON_QUERY(progress, '$.day3') IS NOT NULL) AS day3_active,
    COUNTIF(JSON_QUERY(progress, '$.day7') IS NOT NULL) AS day7_active,
    COUNTIF(JSON_QUERY(progress, '$.day15') IS NOT NULL) AS day15_active,
    COUNTIF(JSON_QUERY(progress, '$.day30') IS NOT NULL) AS day30_active
  FROM users
  GROUP BY signup_date
)

SELECT
  signup_date,
  total_users,
  ROUND(100 * (day1_active / NULLIF(total_users, 0)), 2) AS day1_retention,
  ROUND(100 * (day3_active / NULLIF(total_users, 0)), 2) AS day3_retention,
  ROUND(100 * (day7_active / NULLIF(total_users, 0)), 2) AS day7_retention,
  ROUND(100 * (day15_active / NULLIF(total_users, 0)), 2) AS day15_retention,
  ROUND(100 * (day30_active / NULLIF(total_users, 0)), 2) AS day30_retention
FROM cohorts
ORDER BY signup_date DESC;



  `;

  const [rows] = await bigquery.query(query);
  return NextResponse.json(rows[0]);
}
