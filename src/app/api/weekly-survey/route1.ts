// app/api/weekly-survey/route.ts
import { NextResponse } from "next/server";
import bigquery from "@/lib/bigquery";

export async function GET() {
  const query = `
WITH user_entries AS (
  SELECT
    JSON_VALUE(data, '$.userDetailBasic.userId') AS user_id,
    CAST(JSON_VALUE(data, '$.day') AS INT64) AS day,
    JSON_EXTRACT(data, '$.answers') AS answers
  FROM
    \`your_project.your_dataset.user_stats_json\`
),

milestones AS (
  SELECT 7 AS milestone UNION ALL
  SELECT 14 UNION ALL
  SELECT 21 UNION ALL
  SELECT 28 UNION ALL
  SELECT 35 UNION ALL
  SELECT 42
),

user_milestones AS (
  SELECT
    m.milestone,
    u.user_id,
    u.day,
    u.answers
  FROM
    user_entries u
  CROSS JOIN
    milestones m
  WHERE u.day <= m.milestone
),

latest_per_user AS (
  SELECT
    milestone,
    user_id,
    ARRAY_AGG(STRUCT(day, answers) ORDER BY day DESC LIMIT 1)[OFFSET(0)] AS latest_entry
  FROM
    user_milestones
  GROUP BY
    milestone, user_id
),

survey_stats AS (
  SELECT
    milestone,
    COUNT(DISTINCT user_id) AS total_users,
    SUM(CAST(JSON_VALUE(latest_entry.answers, '$.0') AS INT64)) AS q1_yes,
    SUM(CAST(JSON_VALUE(latest_entry.answers, '$.1') AS INT64)) AS q2_yes,
    SUM(CAST(JSON_VALUE(latest_entry.answers, '$.2') AS INT64)) AS q3_yes,
    SUM(CAST(JSON_VALUE(latest_entry.answers, '$.3') AS INT64)) AS q4_yes,
    SUM(CAST(JSON_VALUE(latest_entry.answers, '$.4') AS INT64)) AS q5_yes,
    SUM(CAST(JSON_VALUE(latest_entry.answers, '$.5') AS INT64)) AS q6_yes,
    SUM(CAST(JSON_VALUE(latest_entry.answers, '$.6') AS INT64)) AS q7_yes
  FROM
    latest_per_user
  GROUP BY
    milestone
)

SELECT
  milestone,
  total_users,
  ROUND(100 * q1_yes / NULLIF(total_users, 0), 2) AS q1_pct,
  ROUND(100 * q2_yes / NULLIF(total_users, 0), 2) AS q2_pct,
  ROUND(100 * q3_yes / NULLIF(total_users, 0), 2) AS q3_pct,
  ROUND(100 * q4_yes / NULLIF(total_users, 0), 2) AS q4_pct,
  ROUND(100 * q5_yes / NULLIF(total_users, 0), 2) AS q5_pct,
  ROUND(100 * q6_yes / NULLIF(total_users, 0), 2) AS q6_pct,
  ROUND(100 * q7_yes / NULLIF(total_users, 0), 2) AS q7_pct
FROM
  survey_stats
ORDER BY
  milestone;
`;

  try {
    const [rows] = await bigquery.query(query);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching weekly survey stats:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
