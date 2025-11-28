import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

function sanitizeAndValidateUrl(input: string): string | null {
  if (!input) return null;

  // Clean all weird unicode whitespace
  let url = input.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ").trim();

  // Extract valid URL even inside text
  const match = url.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/);
  if (!match) return null;
  url = match[0];

  // Add protocol if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}


// 🔄 shared metadata fetcher
async function fetchMeta(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
      },
    });
    
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $("meta[property='og:title']").attr("content")?.trim() || 
      $("title").text()?.trim() ||
      $("meta[name='title']").attr("content")?.trim() ||
      "";

    const description =
      $("meta[property='og:description']").attr("content")?.trim() ||
      $("meta[name='description']").attr("content")?.trim() ||
      $("meta[name='twitter:description']").attr("content")?.trim() ||
      "";

    const image =
      $("meta[property='og:image']").attr("content")?.trim() ||
      $("meta[name='twitter:image']").attr("content")?.trim() ||
      $("meta[name='twitter:image:src']").attr("content")?.trim() ||
      $("img").first().attr("src")?.trim() ||
      "";

    // Make image URL absolute if it's relative
    let absoluteImage = image;
    if (image && !image.startsWith('http')) {
      try {
        absoluteImage = new URL(image, url).toString();
      } catch {
        absoluteImage = image;
      }
    }

    return { 
      title: title || new URL(url).hostname,
      description: description || `Visit ${new URL(url).hostname}`,
      image: absoluteImage,
      url 
    };
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

// ✅ Support both GET (for EditorJS) and POST (for testing)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ success: 0, message: "Missing ?url=" }, { status: 400 });
  }

  try {
    // Sanitize and validate the URL
    const sanitizedUrl = sanitizeAndValidateUrl(rawUrl);
    
    if (!sanitizedUrl) {
      return NextResponse.json({ 
        success: 0, 
        message: "Invalid URL provided" 
      }, { status: 400 });
    }

    const meta = await fetchMeta(sanitizedUrl);
    
    return NextResponse.json({ success: 1, meta });
  } catch (err) {
    console.error("GET /fetch-url error for URL:", rawUrl, err);
    
    // Provide fallback meta data for failed fetches
    try {
      const fallbackUrl = sanitizeAndValidateUrl(rawUrl);
      if (fallbackUrl) {
        const fallbackMeta = {
          title: new URL(fallbackUrl).hostname,
          description: `Visit ${new URL(fallbackUrl).hostname}`,
          image: "",
          url: fallbackUrl
        };
        return NextResponse.json({ success: 1, meta: fallbackMeta });
      }
    } catch (fallbackError) {
      // If even fallback fails, return error
    }
    
    return NextResponse.json({ 
      success: 0, 
      message: "Failed to fetch metadata" 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { url: rawUrl } = await req.json();
    if (!rawUrl) {
      return NextResponse.json({ success: 0, message: "No URL provided" }, { status: 400 });
    }

    // Sanitize and validate the URL
    const sanitizedUrl = sanitizeAndValidateUrl(rawUrl);
    
    if (!sanitizedUrl) {
      return NextResponse.json({ 
        success: 0, 
        message: "Invalid URL provided" 
      }, { status: 400 });
    }

    const meta = await fetchMeta(sanitizedUrl);
    return NextResponse.json({ success: 1, meta });
  } catch (error) {
    console.error("POST /fetch-url error:", error);
    
    // Provide fallback for POST requests too
    try {
      const { url: rawUrl } = await req.json();
      const fallbackUrl = sanitizeAndValidateUrl(rawUrl);
      if (fallbackUrl) {
        const fallbackMeta = {
          title: new URL(fallbackUrl).hostname,
          description: `Visit ${new URL(fallbackUrl).hostname}`,
          image: "",
          url: fallbackUrl
        };
        return NextResponse.json({ success: 1, meta: fallbackMeta });
      }
    } catch (fallbackError) {
      // If fallback fails, return original error
    }
    
    return NextResponse.json({ 
      success: 0, 
      message: "Failed to fetch metadata" 
    }, { status: 500 });
  }
}