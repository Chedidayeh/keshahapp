// app/api/weekly-survey/route.ts
import { NextResponse } from "next/server";
import bigquery from "@/lib/bigquery";

export async function GET() {
  try {
    const query = `
      WITH parsed AS (
        SELECT
          CAST(JSON_VALUE(data, '$.day') AS INT64) AS day,
          CAST(JSON_VALUE(data, '$.answers.0') AS INT64) AS q1,
          CAST(JSON_VALUE(data, '$.answers.1') AS INT64) AS q2,
          CAST(JSON_VALUE(data, '$.answers.2') AS INT64) AS q3,
          CAST(JSON_VALUE(data, '$.answers.3') AS INT64) AS q4,
          CAST(JSON_VALUE(data, '$.answers.4') AS INT64) AS q5,
          CAST(JSON_VALUE(data, '$.answers.5') AS INT64) AS q6,
          CAST(JSON_VALUE(data, '$.answers.6') AS INT64) AS q7
        FROM \`keshah-app.firestore_export.pchecka_raw_latest\`
      )

      SELECT
        day AS week,
        
        COUNTIF(q1 = 1) AS q1_yes,
        COUNTIF(q1 = 0) AS q1_no,
        ROUND(100 * COUNTIF(q1 = 1)/COUNT(*), 2) AS q1_pct_yes,
        ROUND(100 * COUNTIF(q1 = 0)/COUNT(*), 2) AS q1_pct_no,
        
        COUNTIF(q2 = 1) AS q2_yes,
        COUNTIF(q2 = 0) AS q2_no,
        ROUND(100 * COUNTIF(q2 = 1)/COUNT(*), 2) AS q2_pct_yes,
        ROUND(100 * COUNTIF(q2 = 0)/COUNT(*), 2) AS q2_pct_no,
        
        COUNTIF(q3 = 1) AS q3_yes,
        COUNTIF(q3 = 0) AS q3_no,
        ROUND(100 * COUNTIF(q3 = 1)/COUNT(*), 2) AS q3_pct_yes,
        ROUND(100 * COUNTIF(q3 = 0)/COUNT(*), 2) AS q3_pct_no,
        
        COUNTIF(q4 = 1) AS q4_yes,
        COUNTIF(q4 = 0) AS q4_no,
        ROUND(100 * COUNTIF(q4 = 1)/COUNT(*), 2) AS q4_pct_yes,
        ROUND(100 * COUNTIF(q4 = 0)/COUNT(*), 2) AS q4_pct_no,
        
        COUNTIF(q5 = 1) AS q5_yes,
        COUNTIF(q5 = 0) AS q5_no,
        ROUND(100 * COUNTIF(q5 = 1)/COUNT(*), 2) AS q5_pct_yes,
        ROUND(100 * COUNTIF(q5 = 0)/COUNT(*), 2) AS q5_pct_no,
        
        COUNTIF(q6 = 1) AS q6_yes,
        COUNTIF(q6 = 0) AS q6_no,
        ROUND(100 * COUNTIF(q6 = 1)/COUNT(*), 2) AS q6_pct_yes,
        ROUND(100 * COUNTIF(q6 = 0)/COUNT(*), 2) AS q6_pct_no,
        
        COUNTIF(q7 = 1) AS q7_yes,
        COUNTIF(q7 = 0) AS q7_no,
        ROUND(100 * COUNTIF(q7 = 1)/COUNT(*), 2) AS q7_pct_yes,
        ROUND(100 * COUNTIF(q7 = 0)/COUNT(*), 2) AS q7_pct_no

      FROM parsed
      GROUP BY week
      ORDER BY week;
    `;

    const [rows] = await bigquery.query({ query });
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching weekly survey:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
