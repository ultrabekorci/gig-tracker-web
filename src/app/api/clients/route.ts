import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default-user";

    const clients = await prisma.client.findMany({
      where: { userId },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { name: "asc" },
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
    const { userId = "default-user", name, platform = "Direct", defaultFeeRate = 0 } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        userId,
        name,
        platform,
        defaultFeeRate: parseFloat(defaultFeeRate) || 0,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error("Clients POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create client" }, { status: 500 });
  }
}
