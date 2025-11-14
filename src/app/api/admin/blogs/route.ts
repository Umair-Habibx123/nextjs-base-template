// filename: src/app/api/admin/blogs/route.ts
import { NextResponse } from "next/server";
import getDb from "../../../database/db";
import slugify from "slugify";

export async function GET() {
  const db = await getDb();
  const rows = db
    .prepare(
      `
      SELECT 
        b.*, 
        u.name AS author_name,
        u.email AS author_email,
        GROUP_CONCAT(DISTINCT t.name) AS tags,
        GROUP_CONCAT(DISTINCT c.name) AS categories
      FROM blogs b
      LEFT JOIN user u ON b.author_id = u.id
      LEFT JOIN blog_tags bt ON b.id = bt.blog_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      LEFT JOIN blog_categories bc ON b.id = bc.blog_id
      LEFT JOIN categories c ON bc.category_id = c.id
      GROUP BY b.id
      ORDER BY 
        CASE WHEN b.order_number IS NULL THEN 1 ELSE 0 END ASC, -- ordered first
        b.order_number ASC,
        b.is_featured DESC,
        b.createdAt DESC
    `
    )
    .all();

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
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
      order_number = null, // can be number or null
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const db = await getDb();

    // (Optional once per app startup) ensure unique index for non-null order numbers
    // Multiple NULLs are allowed; duplicate numbers are not.
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_blogs_order_unique
      ON blogs(order_number)
      WHERE order_number IS NOT NULL;
    `);

    const slug = slugify(title, { lower: true, strict: true });

    // 🔒 Ensure unique slug & title
    const existing = db
      .prepare("SELECT id FROM blogs WHERE slug = ? OR title = ?")
      .get(slug, title);

    if (existing) {
      return NextResponse.json(
        { error: "A blog with this title or slug already exists." },
        { status: 400 }
      );
    }

    const now = Date.now();

    // ✅ Author (assuming at least one admin exists as per your seeding)
    const author = db
      .prepare("SELECT id FROM user WHERE role = 'admin' LIMIT 1")
      .get();
    const authorId = author?.id;

    if (!authorId) {
      return NextResponse.json(
        { error: "No admin author found. Seed an admin user first." },
        { status: 500 }
      );
    }

    const contentToSave =
      typeof content_json === "string" ? content_json : JSON.stringify(content_json);

    const publishedAt = status === "published" ? now : null;

    // ✅ Only check uniqueness when order_number is not null
    if (order_number !== null) {
      const existsOrder = db
        .prepare("SELECT id FROM blogs WHERE order_number = ? LIMIT 1")
        .get(order_number);
      if (existsOrder) {
        return NextResponse.json(
          { error: "Order number already in use by another blog." },
          { status: 400 }
        );
      }
    }

    const stmt = db.prepare(`
      INSERT INTO blogs (
        title, slug, cover_image, excerpt,
        content_html, content_json, status,
        is_featured, author_id, createdAt, updatedAt, published_at,
        order_number
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      title,
      slug,
      cover_image,
      excerpt,
      content_html,
      contentToSave,
      status,
      is_featured ? 1 : 0,
      authorId,
      now,
      now,
      publishedAt,
      order_number // can be null or number
    );

    const blogId = info.lastInsertRowid as number;

    // ✅ Tags
    for (const tag of tags) {
      db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)").run(tag);
      const tagId = db.prepare("SELECT id FROM tags WHERE name = ?").get(tag).id;
      db.prepare("INSERT OR IGNORE INTO blog_tags (blog_id, tag_id) VALUES (?, ?)")
        .run(blogId, tagId);
    }

    // ✅ Categories
    for (const cat of categories) {
      db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run(cat);
      const catId = db.prepare("SELECT id FROM categories WHERE name = ?").get(cat).id;
      db.prepare("INSERT OR IGNORE INTO blog_categories (blog_id, category_id) VALUES (?, ?)")
        .run(blogId, catId);
    }

    return NextResponse.json({ id: blogId, author_id: authorId });
  } catch (err) {
    console.error("POST /blogs error", err);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
