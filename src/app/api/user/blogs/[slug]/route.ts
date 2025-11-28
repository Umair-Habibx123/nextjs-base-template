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
      UPDATE blogs
      SET view_count = COALESCE(view_count, 0) + 1
      WHERE slug = ?
    `).run(slug);

    // ✅ Fetch blog with author join
    const blog = db
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
        FROM blogs b
        LEFT JOIN user u ON b.author_id = u.id
        WHERE b.status = 'published' AND b.slug = ?
        LIMIT 1
      `)
      .get(slug);

    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          error: "Blog not found",
          message: "The requested blog post does not exist or is not published",
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
        JOIN blog_tags bt ON bt.tag_id = t.id
        WHERE bt.blog_id = ?
      `
      )
      .all(blog.id)
      .map((t: any) => t.name);

    const categories = db
      .prepare(
        `
        SELECT c.name
        FROM categories c
        JOIN blog_categories bc ON bc.category_id = c.id
        WHERE bc.blog_id = ?
      `
      )
      .all(blog.id)
      .map((c: any) => c.name);

    // ✅ Estimate reading time
    const wordCount = blog.content_html
      ? blog.content_html.split(/\s+/).length
      : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return NextResponse.json({
      success: true,
      blog: {
        ...blog,
        tags,
        categories,
        reading_time: readingTime,
      },
    });
  } catch (e) {
    console.error("Error fetching blog:", e);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blog",
        message: "Please try again later",
      },
      { status: 500 }
    );
  }
}
