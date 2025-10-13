// app/api/user-stats/route.ts
import { NextResponse } from "next/server";
import bigquery from "@/lib/bigquery";

export async function GET() {
  try {
    const data = `
      SELECT
        data
      FROM
        \`keshah-app.firestore_export.pchecka_raw_latest\`
      LIMIT 10
    `;

    const [rows] = await bigquery.query({ query: data });
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("BigQuery error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

