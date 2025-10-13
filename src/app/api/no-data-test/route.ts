import { NextResponse } from "next/server";

export async function GET() {
  // Simulate a successful response but with no data
  return NextResponse.json([]);
}
