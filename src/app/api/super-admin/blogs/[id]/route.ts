// filename: src/app/api/super-admin/blogs/[id]/route.ts
import { NextResponse } from "next/server";
import getDb from "../../../../database/db";
import slugify from "slugify";
import { requireAuth } from "@/lib/authHelpers";
import type { NextRequest } from "next/server";

// 🔒 PROTECTED: Get Blog by ID (superadmin only)
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Require SUPERADMIN
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const db = await getDb();

  const row = db
    .prepare(
      `
      SELECT 
        b.*,
        u.name AS author_name,
        u.image AS author_image,
        u.email AS author_email,
        GROUP_CONCAT(DISTINCT t.name) AS tags,
        GROUP_CONCAT(DISTINCT c.name) AS categories
      FROM blogs b
      LEFT JOIN user u ON b.author_id = u.id
      LEFT JOIN blog_tags bt ON b.id = bt.blog_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      LEFT JOIN blog_categories bc ON b.id = bc.blog_id
      LEFT JOIN categories c ON bc.category_id = c.id
      WHERE b.id = ?
      GROUP BY b.id
    `
    )
    .get(id);

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  row.tags = row.tags ? row.tags.split(",") : [];
  row.categories = row.categories ? row.categories.split(",") : [];

  return NextResponse.json(row);
}

// 🔒 PROTECTED: Update Blog (superadmin only)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Require SUPERADMIN
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;

  try {
    const body = await req.json();
    const {
      title,
      cover_image,
      excerpt,
      content_json,
      content_html,
      status,
      is_featured = 0,
      tags = [],
      categories = [],
      order_number = null,
    } = body;

    if (!title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const db = await getDb();

    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_blogs_order_unique
      ON blogs(order_number)
      WHERE order_number IS NOT NULL;
    `);

    const slug = slugify(title, { lower: true, strict: true });

    const existing = db
      .prepare("SELECT id FROM blogs WHERE (slug = ? OR title = ?) AND id != ?")
      .get(slug, title, id);

    if (existing) {
      return NextResponse.json(
        { error: "Another blog with this title or slug already exists." },
        { status: 400 }
      );
    }

    const now = Date.now();
    const contentToSave =
      typeof content_json === "string"
        ? content_json
        : JSON.stringify(content_json);

    const publishedAt = status === "published" ? now : null;

    // Check order number uniqueness
    if (order_number !== null) {
      const existsOrder = db
        .prepare(
          "SELECT id FROM blogs WHERE order_number = ? AND id != ? LIMIT 1"
        )
        .get(order_number, id);
      if (existsOrder) {
        return NextResponse.json(
          { error: "Order number already in use by another blog." },
          { status: 400 }
        );
      }
    }

    // Update blog entry
    db.prepare(
      `
      UPDATE blogs
      SET title = ?, slug = ?, cover_image = ?, excerpt = ?, 
          content_html = ?, content_json = ?, status = ?, 
          is_featured = ?, updatedAt = ?, published_at = ?, 
          order_number = ?
      WHERE id = ?
    `
    ).run(
      title,
      slug,
      cover_image,
      excerpt,
      content_html,
      contentToSave,
      status,
      is_featured ? 1 : 0,
      now,
      publishedAt,
      order_number,
      id
    );

    // Update tags + categories
    db.prepare("DELETE FROM blog_tags WHERE blog_id = ?").run(id);
    db.prepare("DELETE FROM blog_categories WHERE blog_id = ?").run(id);

    // Tags
    for (const tag of tags) {
      db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)").run(tag);
      const tagId = db
        .prepare("SELECT id FROM tags WHERE name = ?")
        .get(tag).id;
      db.prepare(
        "INSERT OR IGNORE INTO blog_tags (blog_id, tag_id) VALUES (?, ?)"
      ).run(id, tagId);
    }

    // Categories
    for (const cat of categories) {
      db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run(cat);
      const catId = db
        .prepare("SELECT id FROM categories WHERE name = ?")
        .get(cat).id;
      db.prepare(
        "INSERT OR IGNORE INTO blog_categories (blog_id, category_id) VALUES (?, ?)"
      ).run(id, catId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /blogs error", err);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

// 🔒 PROTECTED: Delete Blog (superadmin only)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Require SUPERADMIN
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;

  try {
    const db = await getDb();

    db.prepare("DELETE FROM blogs WHERE id = ?").run(id);
    db.prepare("DELETE FROM blog_tags WHERE blog_id = ?").run(id);
    db.prepare("DELETE FROM blog_categories WHERE blog_id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /blogs error", err);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
