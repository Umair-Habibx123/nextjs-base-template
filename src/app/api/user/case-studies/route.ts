// filename: src/app/api/user/case-studies/route.ts
import getDb from "../../../database/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const db = await getDb();

    // 🔹 Extract pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10); // increased to 12
    const offset = (page - 1) * limit;

    // 🔹 Count total published case-studies
    const total = db
      .prepare("SELECT COUNT(*) AS count FROM case_studies WHERE status = 'published'")
      .get().count;

    // 🔹 Fetch paginated & sorted case-studies with tags and categories
    const case_studies = db
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
          u.image AS author_image,
          GROUP_CONCAT(DISTINCT t.name) AS tags,
          GROUP_CONCAT(DISTINCT c.name) AS categories,
          -- Calculate read time based on content length (approx 200 words per minute)
          MAX(LENGTH(b.content_html) / 1000) AS read_time
        FROM case_studies b
        LEFT JOIN user u ON b.author_id = u.id
        LEFT JOIN case_studies_tags bt ON b.id = bt.case_studies_id
        LEFT JOIN tags t ON bt.tag_id = t.id
        LEFT JOIN case_studies_categories bc ON b.id = bc.case_studies_id
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
      case_studies,
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
    console.error("Error fetching case_studies:", e);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch case-studies",
        message: "Please try again later",
      },
      { status: 500 }
    );
  }
}