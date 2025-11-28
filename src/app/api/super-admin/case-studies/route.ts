// filename: src/app/api/super-admin/case-studies/route.ts
import { NextResponse } from "next/server";
import getDb from "../../../database/db";
import slugify from "slugify";
import { requireAuth } from "@/lib/authHelpers";
import type { NextRequest } from "next/server";

// 🔒 SUPERADMIN-ONLY — List all case studies
export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

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
      FROM case_studies b
      LEFT JOIN user u ON b.author_id = u.id
      LEFT JOIN case_studies_tags bt ON b.id = bt.case_studies_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      LEFT JOIN case_studies_categories bc ON b.id = bc.case_studies_id
      LEFT JOIN categories c ON bc.category_id = c.id
      GROUP BY b.id
      ORDER BY 
        CASE WHEN b.order_number IS NULL THEN 1 ELSE 0 END ASC,
        b.order_number ASC,
        b.is_featured DESC,
        b.createdAt DESC
    `
    )
    .all();

  return NextResponse.json({ success: true, data: rows });
}

// 🔒 SUPERADMIN-ONLY — Create a new case study
export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAuth(req, {
    roles: "superadmin",
  });
  if (errorResponse) return errorResponse;

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
      author_id,
      order_number = null,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_case_studies_order_unique
      ON case_studies(order_number)
      WHERE order_number IS NOT NULL;
    `);

    const slug = slugify(title, { lower: true, strict: true });

    // unique title/slug
    const existing = db
      .prepare(
        "SELECT id FROM case_studies WHERE slug = ? OR title = ?"
      )
      .get(slug, title);

    if (existing) {
      return NextResponse.json(
        { error: "A case study with this title or slug already exists." },
        { status: 400 }
      );
    }

    const now = Date.now();

    const contentToSave =
      typeof content_json === "string"
        ? content_json
        : JSON.stringify(content_json);

    const publishedAt = status === "published" ? now : null;

    if (order_number !== null) {
      const existsOrder = db
        .prepare("SELECT id FROM case_studies WHERE order_number = ? LIMIT 1")
        .get(order_number);

      if (existsOrder) {
        return NextResponse.json(
          { error: "Order number already in use by another case study." },
          { status: 400 }
        );
      }
    }

    const stmt = db.prepare(`
      INSERT INTO case_studies (
        title, slug, cover_image, excerpt,
        content_html, content_json, status,
        is_featured, author_id, createdAt, updatedAt,
        published_at, order_number
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
      author_id,
      now,
      now,
      publishedAt,
      order_number
    );

    const caseStudyId = info.lastInsertRowid as number;

    // Tags
    for (const tag of tags) {
      db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)").run(tag);
      const tagId = db.prepare("SELECT id FROM tags WHERE name = ?").get(tag).id;

      db.prepare(
        "INSERT OR IGNORE INTO case_studies_tags (case_studies_id, tag_id) VALUES (?, ?)"
      ).run(caseStudyId, tagId);
    }

    // Categories
    for (const cat of categories) {
      db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").run(cat);
      const catId = db
        .prepare("SELECT id FROM categories WHERE name = ?")
        .get(cat).id;

      db.prepare(
        "INSERT OR IGNORE INTO case_studies_categories (case_studies_id, category_id) VALUES (?, ?)"
      ).run(caseStudyId, catId);
    }

    return NextResponse.json({
      success: true,
      id: caseStudyId,
      author_id,
    });
  } catch (err) {
    console.error("POST /case-studies error", err);
    return NextResponse.json(
      { error: "Failed to create case study" },
      { status: 500 }
    );
  }
}
