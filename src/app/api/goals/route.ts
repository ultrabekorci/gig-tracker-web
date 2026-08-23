import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default-user";

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(goals);
  } catch (error: any) {
    console.error("Goals GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId = "default-user", title, targetAmount, period = "MONTHLY" } = body;

    if (!title || !targetAmount) {
      return NextResponse.json({ error: "Title and targetAmount are required" }, { status: 400 });
    }

    const now = new Date();
    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        targetAmount: parseFloat(targetAmount),
        period,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error: any) {
    console.error("Goals POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create goal" }, { status: 500 });
  }
}
