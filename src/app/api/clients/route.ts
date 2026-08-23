import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialData } from "@/lib/bootstrap";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default-user";

    await ensureInitialData(userId);

    const clients = await prisma.client.findMany({
      where: { userId },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(clients);
  } catch (error: any) {
    console.error("Clients GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId = "default-user",
      name,
      platform = "Workplace",
      color = "#6366f1",
      defaultFeeRate = 0,
      defaultHourlyRate = 10320,
      defaultDailyRate = 120000,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await ensureInitialData(userId);

    const client = await prisma.client.create({
      data: {
        userId,
        name: name.trim(),
        platform,
        color,
        defaultFeeRate: parseFloat(defaultFeeRate) || 0,
        defaultHourlyRate: parseFloat(defaultHourlyRate) || 10320,
        defaultDailyRate: parseFloat(defaultDailyRate) || 120000,
        isActive: true,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error("Clients POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create client" }, { status: 500 });
  }
}
