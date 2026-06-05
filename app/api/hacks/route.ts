import { NextResponse } from "next/server";
import { getHackFeed } from "@/lib/hacks";

export const revalidate = 3600;

export async function GET() {
  const feed = await getHackFeed();
  return NextResponse.json(feed, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
  });
}
