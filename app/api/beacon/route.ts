import { NextResponse } from "next/server";
import { getBeaconSnapshot } from "@/lib/beacon";

export const revalidate = 30;

export async function GET() {
  const data = await getBeaconSnapshot();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
  });
}
