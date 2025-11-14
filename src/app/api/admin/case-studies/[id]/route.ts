import { NextResponse } from "next/server";
import getDb from "../../../../database/db";
import slugify from "slugify";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const db = await getDb();

  const row = db
    .prepare(
      `
      SELECT 
        b.*,
        u.name AS author_name,
        u.email AS author_email,
        GROUP_CONCAT(DISTINCT t.name) AS tags,
        GROUP_CONCAT(DISTINCT c.name) AS categories
      FROM case_studies b
      LEFT JOIN user u ON b.author_id = u.id
      LEFT JOIN case_studies_tags bt ON b.id = bt.case_studies_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      LEFT JOIN case_studies_categories bc ON b.id = bc.case_studies_id
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

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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
      order_number = null, // may be number or null
    } = body;

    if (!title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const db = await getDb();

    // Optional: ensure unique index for non-null order numbers
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_case_studies_order_unique
      ON case_studies(order_number)
      WHERE order_number IS NOT NULL;
    `);

    const slug = slugify(title, { lower: true, strict: true });

    // 🔒 Ensure unique slug & title
    const existing = db
      .prepare("SELECT id FROM case_studies WHERE (slug = ? OR title = ?) AND id != ?")
      .get(slug, title, id);

    if (existing) {
      return NextResponse.json(
        { error: "Another case_studies with this title or slug already exists." },
        { status: 400 }
      );
    }

    const now = Date.now();
    const contentToSave =
      typeof content_json === "string"
        ? content_json
        : JSON.stringify(content_json);
    const publishedAt = status === "published" ? now : null;

    // ✅ Uniqueness check for order_number
    if (order_number !== null) {
      const existsOrder = db
        .prepare("SELECT id FROM case_studies WHERE order_number = ? AND id != ? LIMIT 1")
        .get(order_number, id);
      if (existsOrder) {
        return NextResponse.json(
          { error: "Order number already in use by another case_studies." },
          { status: 400 }
        );
      }
    }

    // ✅ Update case_studies
    db.prepare(
      `
      UPDATE case_studies
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

    // ✅ Update tags & categories
    db.prepare("DELETE FROM case_studies_tags WHERE case_studies_id = ?").run(id);
    db.prepare("DELETE FROM case_studies_categories WHERE case_studies_id = ?").run(id);

    for (const tag of tags) {
      db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)").run(tag);
      const tagId = db.prepare("SELECT id FROM tags WHERE name = ?").get(tag).id;
      db.prepare(
        "INSERT OR IGNORE INTO case_studies_tags (case_studies_id, tag_id) VALUES (?, ?)"
      ).run(id, tagId);
    }

    for (const cat of categories) {
      db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run(cat);
      const catId = db.prepare("SELECT id FROM categories WHERE name = ?").get(cat)
        .id;
      db.prepare(
        "INSERT OR IGNORE INTO case_studies_categories (case_studies_id, category_id) VALUES (?, ?)"
      ).run(id, catId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /case-studies error", err);
    return NextResponse.json(
      { error: "Failed to update case_studies" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const db = await getDb();
    db.prepare("DELETE FROM case_studies WHERE id = ?").run(id);
    db.prepare("DELETE FROM case_studies_tags WHERE case_studies_id = ?").run(id);
    db.prepare("DELETE FROM case_studies_categories WHERE case_studies_id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /case-studies error", err);
    return NextResponse.json(
      { error: "Failed to delete case_studies" },
      { status: 500 }
    );
  }
}
