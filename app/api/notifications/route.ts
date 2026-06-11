import { NextResponse } from "next/server";
import { getNotificationFeed } from "@/lib/notifications";

export const revalidate = 60;

export async function GET() {
  const feed = await getNotificationFeed();
  return NextResponse.json(feed, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
  });
}
