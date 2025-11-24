import { seedDatabase } from "../../utils/seed-database";

export async function GET(request) {
  try {
    await seedDatabase();

    return Response.json({
      success: true,
      message: "Database seeded successfully",
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return Response.json(
      { error: "Seeding failed", details: error.message },
      { status: 500 }
    );
  }
}