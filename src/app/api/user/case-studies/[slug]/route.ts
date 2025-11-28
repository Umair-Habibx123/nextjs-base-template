import getDb from "../../../../database/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const db = await getDb();

  try {
    // ✅ Increment view count
    db.prepare(`
      UPDATE case_studies
      SET view_count = COALESCE(view_count, 0) + 1
      WHERE slug = ?
    `).run(slug);

    // ✅ Fetch case_studies with author join
    const case_studies = db
      .prepare(`
        SELECT 
          b.id,
          b.title,
          b.slug,
          b.cover_image,
          b.excerpt,
          b.content_html,
          b.content_json,
          b.status,
          b.createdAt,
          b.updatedAt,
          b.published_at,
          b.view_count,
          b.order_number,
          u.name AS author_name,
          u.email AS author_email,
          u.image AS author_image
        FROM case_studies b
        LEFT JOIN user u ON b.author_id = u.id
        WHERE b.status = 'published' AND b.slug = ?
        LIMIT 1
      `)
      .get(slug);

    if (!case_studies) {
      return NextResponse.json(
        {
          success: false,
          error: "case_studies not found",
          message: "The requested case_studies post does not exist or is not published",
        },
        { status: 404 }
      );
    }

    // ✅ Fetch tags and categories
    const tags = db
      .prepare(
        `
        SELECT t.name
        FROM tags t
        JOIN case_studies_tags bt ON bt.tag_id = t.id
        WHERE bt.case_studies_id = ?
      `
      )
      .all(case_studies.id)
      .map((t: any) => t.name);

    const categories = db
      .prepare(
        `
        SELECT c.name
        FROM categories c
        JOIN case_studies_categories bc ON bc.category_id = c.id
        WHERE bc.case_studies_id = ?
      `
      )
      .all(case_studies.id)
      .map((c: any) => c.name);

    // ✅ Estimate reading time
    const wordCount = case_studies.content_html
      ? case_studies.content_html.split(/\s+/).length
      : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return NextResponse.json({
      success: true,
      case_studies: {
        ...case_studies,
        tags,
        categories,
        reading_time: readingTime,
      },
    });
  } catch (e) {
    console.error("Error fetching case_studies:", e);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch case_studies",
        message: "Please try again later",
      },
      { status: 500 }
    );
  }
}
