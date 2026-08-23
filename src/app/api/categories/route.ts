import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialData } from "@/lib/bootstrap";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default-user";
    const type = searchParams.get("type");

    await ensureInitialData(userId);

    const where: any = { userId };
    if (type) where.type = type;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId = "default-user", name, icon = "tag", type = "EXPENSE" } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await ensureInitialData(userId);

    const category = await prisma.category.create({
      data: {
        userId,
        name: name.trim(),
        icon,
        type,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Categories POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
