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
      UPDATE projects
      SET view_count = COALESCE(view_count, 0) + 1
      WHERE slug = ?
    `).run(slug);

    // ✅ Fetch project with author join
    const project = db
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
        FROM projects b
        LEFT JOIN user u ON b.author_id = u.id
        WHERE b.status = 'published' AND b.slug = ?
        LIMIT 1
      `)
      .get(slug);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "project not found",
          message: "The requested project post does not exist or is not published",
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
        JOIN project_tags bt ON bt.tag_id = t.id
        WHERE bt.project_id = ?
      `
      )
      .all(project.id)
      .map((t: any) => t.name);

    const categories = db
      .prepare(
        `
        SELECT c.name
        FROM categories c
        JOIN project_categories bc ON bc.category_id = c.id
        WHERE bc.project_id = ?
      `
      )
      .all(project.id)
      .map((c: any) => c.name);

    // ✅ Estimate reading time
    const wordCount = project.content_html
      ? project.content_html.split(/\s+/).length
      : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        tags,
        categories,
        reading_time: readingTime,
      },
    });
  } catch (e) {
    console.error("Error fetching project:", e);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch project",
        message: "Please try again later",
      },
      { status: 500 }
    );
  }
}
