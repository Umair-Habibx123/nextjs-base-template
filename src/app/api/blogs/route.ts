// filename: src/app/api/blogs/route.ts
import getDb from "../../database/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const db = await getDb();

    // 🔹 Extract pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10); // increased to 12
    const offset = (page - 1) * limit;

    // 🔹 Count total published blogs
    const total = db
      .prepare("SELECT COUNT(*) AS count FROM blogs WHERE status = 'published'")
      .get().count;

    // 🔹 Fetch paginated & sorted blogs with tags and categories
    const blogs = db
      .prepare(`
        SELECT 
          b.id,
          b.title,
          b.slug,
          b.cover_image,
          b.excerpt,
          b.is_featured,
          b.createdAt,
          b.view_count,
          b.order_number,
          u.name AS author_name,
          GROUP_CONCAT(DISTINCT t.name) AS tags,
          GROUP_CONCAT(DISTINCT c.name) AS categories,
          -- Calculate read time based on content length (approx 200 words per minute)
          MAX(LENGTH(b.content_html) / 1000) AS read_time
        FROM blogs b
        LEFT JOIN user u ON b.author_id = u.id
        LEFT JOIN blog_tags bt ON b.id = bt.blog_id
        LEFT JOIN tags t ON bt.tag_id = t.id
        LEFT JOIN blog_categories bc ON b.id = bc.blog_id
        LEFT JOIN categories c ON bc.category_id = c.id
        WHERE b.status = 'published'
        GROUP BY b.id
        ORDER BY 
          b.order_number ASC NULLS LAST,    -- manual ordering first
          b.is_featured DESC,               -- featured first
          b.createdAt DESC                 -- then newest
        LIMIT ? OFFSET ?
      `)
      .all(limit, offset);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      blogs,
      pagination: {
        total,
        totalPages,
        page,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (e) {
    console.error("Error fetching blogs:", e);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blogs",
        message: "Please try again later",
      },
      { status: 500 }
    );
  }
}