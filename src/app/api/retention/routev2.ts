import { NextResponse } from "next/server";
import bigquery from "@/lib/bigquery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_type = searchParams.get("user_type") || "all";

  // Build the user_type condition dynamically
  const userTypeCondition =
    user_type === "all" ? "" : `AND JSON_VALUE(data, '$.user_type') = '${user_type}'`;

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
    ${userTypeCondition}
),

retention AS (
  SELECT
    -- Default retention (any progress)
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
            AND DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)) AS day90_active,

    -- Completed exercises retention
    COUNTIF(
      DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
      AND (
        SELECT COUNTIF(JSON_VALUE(ex, '$.is_completed') = 'true') = ARRAY_LENGTH(JSON_EXTRACT_ARRAY(progress, '$.day1'))
        FROM UNNEST(JSON_EXTRACT_ARRAY(progress, '$.day1')) AS ex
      )
    ) AS day1_completed_active,

    COUNTIF(
      DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
      AND (
        SELECT COUNTIF(JSON_VALUE(ex, '$.is_completed') = 'true') = ARRAY_LENGTH(JSON_EXTRACT_ARRAY(progress, '$.day3'))
        FROM UNNEST(JSON_EXTRACT_ARRAY(progress, '$.day3')) AS ex
      )
    ) AS day3_completed_active,

    COUNTIF(
      DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
      AND (
        SELECT COUNTIF(JSON_VALUE(ex, '$.is_completed') = 'true') = ARRAY_LENGTH(JSON_EXTRACT_ARRAY(progress, '$.day7'))
        FROM UNNEST(JSON_EXTRACT_ARRAY(progress, '$.day7')) AS ex
      )
    ) AS day7_completed_active,

    COUNTIF(
      DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 15 DAY)
      AND (
        SELECT COUNTIF(JSON_VALUE(ex, '$.is_completed') = 'true') = ARRAY_LENGTH(JSON_EXTRACT_ARRAY(progress, '$.day15'))
        FROM UNNEST(JSON_EXTRACT_ARRAY(progress, '$.day15')) AS ex
      )
    ) AS day15_completed_active,

    COUNTIF(
      DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
      AND (
        SELECT COUNTIF(JSON_VALUE(ex, '$.is_completed') = 'true') = ARRAY_LENGTH(JSON_EXTRACT_ARRAY(progress, '$.day30'))
        FROM UNNEST(JSON_EXTRACT_ARRAY(progress, '$.day30')) AS ex
      )
    ) AS day30_completed_active,

    COUNTIF(
      DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)
      AND (
        SELECT COUNTIF(JSON_VALUE(ex, '$.is_completed') = 'true') = ARRAY_LENGTH(JSON_EXTRACT_ARRAY(progress, '$.day60'))
        FROM UNNEST(JSON_EXTRACT_ARRAY(progress, '$.day60')) AS ex
      )
    ) AS day60_completed_active,

    COUNTIF(
      DATE(created_at) <= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
      AND (
        SELECT COUNTIF(JSON_VALUE(ex, '$.is_completed') = 'true') = ARRAY_LENGTH(JSON_EXTRACT_ARRAY(progress, '$.day90'))
        FROM UNNEST(JSON_EXTRACT_ARRAY(progress, '$.day90')) AS ex
      )
    ) AS day90_completed_active
  FROM users
)

SELECT
  -- Default retention
  ROUND(100 * (day1_active / NULLIF(eligible_day1, 0)), 2) AS day1_retention,
  eligible_day1 AS day1_users,
  ROUND(100 * (day3_active / NULLIF(eligible_day3, 0)), 2) AS day3_retention,
  eligible_day3 AS day3_users,
  ROUND(100 * (day7_active / NULLIF(eligible_day7, 0)), 2) AS day7_retention,
  eligible_day7 AS day7_users,
  ROUND(100 * (day15_active / NULLIF(eligible_day15, 0)), 2) AS day15_retention,
  eligible_day15 AS day15_users,
  ROUND(100 * (day30_active / NULLIF(eligible_day30, 0)), 2) AS day30_retention,
  eligible_day30 AS day30_users,
  ROUND(100 * (day60_active / NULLIF(eligible_day60, 0)), 2) AS day60_retention,
  eligible_day60 AS day60_users,
  ROUND(100 * (day90_active / NULLIF(eligible_day90, 0)), 2) AS day90_retention,
  eligible_day90 AS day90_users,

  -- Completed exercises retention
  ROUND(100 * (day1_completed_active / NULLIF(eligible_day1, 0)), 2) AS day1_completed_retention,
  ROUND(100 * (day3_completed_active / NULLIF(eligible_day3, 0)), 2) AS day3_completed_retention,
  ROUND(100 * (day7_completed_active / NULLIF(eligible_day7, 0)), 2) AS day7_completed_retention,
  ROUND(100 * (day15_completed_active / NULLIF(eligible_day15, 0)), 2) AS day15_completed_retention,
  ROUND(100 * (day30_completed_active / NULLIF(eligible_day30, 0)), 2) AS day30_completed_retention,
  ROUND(100 * (day60_completed_active / NULLIF(eligible_day60, 0)), 2) AS day60_completed_retention,
  ROUND(100 * (day90_completed_active / NULLIF(eligible_day90, 0)), 2) AS day90_completed_retention
FROM retention;
`;

  const [rows] = await bigquery.query(query);
  return NextResponse.json(rows[0]);
}
