import { NextResponse } from "next/server";
import { getGithubFeed } from "@/lib/github";

export const revalidate = 3600;

export async function GET() {
  const feed = await getGithubFeed();
  return NextResponse.json(feed, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
  });
}
