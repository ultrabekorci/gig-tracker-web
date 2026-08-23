import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default-user";
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const month = searchParams.get("month"); // 1-12
    const year = searchParams.get("year");

    const where: any = { userId };

    if (type && type !== "ALL") {
      where.type = type;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (clientId) {
      where.clientId = clientId;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.description = {
        contains: search,
      };
    }

    if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        client: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Transactions GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId = "default-user",
      type,
      workType = "DAILY_WAGE",
      amount,
      currency = "KRW",
      description,
      date,
      endDate,
      status = "PAID",
      dueDate,
      fee = 0,
      startTime = "09:00",
      endTime = "18:00",
      breakMinutes = 0,
      hourlyRate = 10320,
      totalHours = 8,
      isNightShift = false,
      isOvertime = false,
      isSpecialDuty = false,
      unitCount = 1,
      color,
      categoryId,
      clientId,
    } = body;

    if (!type || amount === undefined) {
      return NextResponse.json({ error: "Type and amount are required" }, { status: 400 });
    }

    // Get client color if not provided
    let finalColor = color;
    if (!finalColor && clientId) {
      const cl = await prisma.client.findUnique({ where: { id: clientId } });
      if (cl) finalColor = cl.color || "#6366f1";
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        workType,
        amount: parseFloat(amount),
        currency,
        description: description || null,
        date: date ? new Date(date) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        fee: parseFloat(fee) || 0,
        startTime: startTime || null,
        endTime: endTime || null,
        breakMinutes: parseInt(breakMinutes) || 0,
        hourlyRate: parseFloat(hourlyRate) || 0,
        totalHours: parseFloat(totalHours) || 0,
        isNightShift: Boolean(isNightShift),
        isOvertime: Boolean(isOvertime),
        isSpecialDuty: Boolean(isSpecialDuty),
        unitCount: parseInt(unitCount) || 1,
        color: finalColor || "#6366f1",
        categoryId: categoryId || null,
        clientId: clientId || null,
      },
      include: {
        category: true,
        client: true,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error("Transactions POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create transaction" }, { status: 500 });
  }
}
