// app/api/user-stats/route.ts
import { NextResponse } from "next/server";
import bigquery from "@/lib/bigquery";

export async function GET() {
  try {
    // ✅ Users who started today
    const usersStartedTodayQuery = `
      SELECT
        COUNT(DISTINCT JSON_EXTRACT_SCALAR(data, '$.wp_user.ID')) AS users_started_today
      FROM
        \`keshah-app.firestore_export.users_raw_latest\`
      WHERE
        JSON_EXTRACT_SCALAR(data, '$.start_date.date') = FORMAT_DATE('%d/%m/%Y', CURRENT_DATE())
        AND JSON_EXTRACT_SCALAR(data, '$.is_deleted') = 'false'
    `;


const totalGroupedUsersQuery = `
  SELECT
    JSON_EXTRACT_SCALAR(data, '$.user_type') AS user_type,
    COUNT(DISTINCT JSON_EXTRACT_SCALAR(data, '$.wp_user.ID')) AS user_count,
    (SELECT COUNT(DISTINCT JSON_EXTRACT_SCALAR(data, '$.wp_user.ID')) 
     FROM \`keshah-app.firestore_export.users_raw_latest\`
     WHERE JSON_EXTRACT_SCALAR(data, '$.is_deleted') = 'false') AS total_users
  FROM
    \`keshah-app.firestore_export.users_raw_latest\`
  WHERE
    JSON_EXTRACT_SCALAR(data, '$.is_deleted') = 'false'
  GROUP BY user_type
  ORDER BY user_count DESC;
`;


    // ✅ Total users
    const totalUsersQuery = `
      SELECT
  COUNT(DISTINCT JSON_EXTRACT_SCALAR(data, '$.wp_user.ID')) AS total_users
FROM
  \`keshah-app.firestore_export.users_raw_latest\`
WHERE
  JSON_EXTRACT_SCALAR(data, '$.is_deleted') = 'false'

    `;

    // ✅ Users started in the last 7 days
    const usersLast7DaysQuery = `
      SELECT
        COUNT(DISTINCT JSON_EXTRACT_SCALAR(data, '$.wp_user.ID')) AS users_started_last_7_days
      FROM
        \`keshah-app.firestore_export.users_raw_latest\`
      WHERE
        JSON_EXTRACT_SCALAR(data, '$.is_deleted') = 'false'
        AND JSON_EXTRACT_SCALAR(data, '$.start_date.date') IS NOT NULL
        AND PARSE_DATE('%d/%m/%Y', JSON_EXTRACT_SCALAR(data, '$.start_date.date'))
          BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND CURRENT_DATE()
    `;

    // ✅ Active users in the last 2 days
    const activeUsersQuery = `
      WITH user_progress AS (
        SELECT
          JSON_EXTRACT_SCALAR(data, '$.wp_user.ID') AS user_id,
          SAFE_CAST(JSON_EXTRACT_SCALAR(data, '$.created_at._seconds') AS INT64) AS created_seconds,
          JSON_EXTRACT_SCALAR(data, '$.is_deleted') AS is_deleted,
          JSON_EXTRACT_ARRAY(data, '$.progress.days') AS progress_days
        FROM
          \`keshah-app.firestore_export.users_raw_latest\`
        WHERE
          JSON_EXTRACT_SCALAR(data, '$.is_deleted') = 'false'
      ),
      recent_progress AS (
        SELECT
          user_id,
          ARRAY_LENGTH(
            ARRAY(
              SELECT day
              FROM UNNEST(progress_days) AS day
              WHERE SAFE_CAST(JSON_EXTRACT_SCALAR(day, '$.modified_at._seconds') AS INT64)
                >= UNIX_SECONDS(TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 DAY))
            )
          ) AS recent_days_count
        FROM user_progress
      )
      SELECT
        COUNT(DISTINCT user_id) AS active_users
      FROM user_progress up
      LEFT JOIN recent_progress rp USING(user_id)
      WHERE
        SAFE_CAST(created_seconds AS INT64) >= UNIX_SECONDS(TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 DAY))
        OR recent_days_count > 0
    `;

    // ✅ Execute all queries in parallel
    const [
      [usersTodayResult],
      [totalUsersResult],
      [usersLast7DaysResult],
      [activeUsersResult],
      groupedUsersResult
    ] = await Promise.all([
      bigquery.query({ query: usersStartedTodayQuery }),
      bigquery.query({ query: totalUsersQuery }),
      bigquery.query({ query: usersLast7DaysQuery }),
      bigquery.query({ query: activeUsersQuery }),
      bigquery.query({ query: totalGroupedUsersQuery })
    ]);

// console.log("📊 BigQuery groupedUsersResult:", JSON.stringify(groupedUsersResult[0], null, 2));


    // ✅ Return structured response
    return NextResponse.json({
      success: true,
      data: {
        todayUsers: Number(usersTodayResult[0]?.users_started_today ?? 0),
        totalUsers: Number(totalUsersResult[0]?.total_users ?? 0),
        last7DaysUsers: Number(usersLast7DaysResult[0]?.users_started_last_7_days ?? 0),
        activeUsers: Number(activeUsersResult[0]?.active_users ?? 0),
        groupedUsers: groupedUsersResult[0].map((row: any) => ({
          user_type: row.user_type ?? "Unknown",
          user_count: Number(row.user_count ?? 0),
                    total_users: Number(row.total_users ?? 0),
        })),
      },
    });
  } catch (error: any) {
    console.error("BigQuery error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
