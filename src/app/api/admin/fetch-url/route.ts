import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// 🔄 shared metadata fetcher
async function fetchMeta(url: string) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const title =
    $("meta[property='og:title']").attr("content") || $("title").text();
  const description =
    $("meta[property='og:description']").attr("content") ||
    $("meta[name='description']").attr("content") ||
    "";
  const image =
    $("meta[property='og:image']").attr("content") ||
    $("img").first().attr("src") ||
    "";

  return { title, description, image, url };
}

// ✅ Support both GET (for EditorJS) and POST (for testing)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ success: 0, message: "Missing ?url=" }, { status: 400 });
  }

  try {
    const meta = await fetchMeta(url);
    return NextResponse.json({ success: 1, meta });
  } catch (err) {
    console.error("GET /fetch-url error", err);
    return NextResponse.json({ success: 0, message: "Failed to fetch metadata" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: 0, message: "No URL provided" }, { status: 400 });
    }

    const meta = await fetchMeta(url);
    return NextResponse.json({ success: 1, meta });
  } catch (error) {
    console.error("POST /fetch-url error:", error);
    return NextResponse.json({ success: 0, message: "Failed to fetch metadata" }, { status: 500 });
  }
}
