import { NextResponse } from "next/server";
import bigquery from "@/lib/bigquery";

export async function GET() {
  try {
    // ✅ Total users query (fixed syntax)
    const totalQuery = `
      SELECT COUNT(DISTINCT JSON_VALUE(data, '$.email')) AS total_users
      FROM \`keshah-app.firestore_export.users_raw_changelog\`
    `;

    const [totalRows] = await bigquery.query({ query: totalQuery });
    const total_users = totalRows?.[0]?.total_users || 0;

    // ✅ Breakdown by user_type query (fixed syntax)
    const breakdownQuery = `
      SELECT 
        JSON_VALUE(data, '$.user_type') AS user_type,
        COUNT(DISTINCT JSON_VALUE(data, '$.email')) AS user_count
      FROM \`keshah-app.firestore_export.users_raw_changelog\`
      GROUP BY user_type
      ORDER BY user_count DESC
    `;

    const [breakdownRows] = await bigquery.query({ query: breakdownQuery });

    return NextResponse.json({
      total_users,
      breakdown: breakdownRows,
    });
  } catch (err: any) {
    console.error("BigQuery error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
