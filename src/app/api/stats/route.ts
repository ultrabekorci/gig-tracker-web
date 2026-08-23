import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default-user";
    const monthParam = searchParams.get("month"); // 1-12 or undefined
    const yearParam = searchParams.get("year"); // 2026 or undefined

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const taxRate = user?.taxRate ?? 4.0;

    // Get all transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        category: true,
        client: true,
      },
      orderBy: { date: "desc" },
    });

    const now = new Date();
    const currentMonth = monthParam ? parseInt(monthParam) - 1 : now.getMonth();
    const currentYear = yearParam ? parseInt(yearParam) : now.getFullYear();

    let totalGrossIncome = 0;
    let totalExpenses = 0;
    let totalFees = 0;
    let pendingAmount = 0;
    let pendingCount = 0;
    let currentMonthIncome = 0;
    let prevMonthIncome = 0;

    let totalWorkedHours = 0;
    const workedDaysSet = new Set<string>();

    const platformMap = new Map<string, { amount: number; hours: number; shifts: number; color: string }>();
    const categoryMap = new Map<string, number>();

    // 12 Months trend data
    const monthsData: { [key: string]: { name: string; income: number; expense: number; profit: number; hours: number } } = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short" });
      monthsData[key] = { name: label, income: 0, expense: 0, profit: 0, hours: 0 };
    }

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
    const currMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const txMonthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;
      const isCurrentMonth = txMonthKey === currMonthKey;

      if (tx.type === "INCOME") {
        if (tx.status === "PAID") {
          totalGrossIncome += tx.amount;
          totalFees += tx.fee;

          if (isCurrentMonth) {
            currentMonthIncome += tx.amount;
            totalWorkedHours += tx.totalHours || 0;
            workedDaysSet.add(txDate.toISOString().split("T")[0]);
          }

          if (txMonthKey === prevMonthKey) {
            prevMonthIncome += tx.amount;
          }

          // Platform mapping
          const clientName = tx.client?.name || "Boshqa / Shaxsiy";
          const clientColor = tx.client?.color || tx.color || "#6366f1";
          const existing = platformMap.get(clientName) || { amount: 0, hours: 0, shifts: 0, color: clientColor };
          existing.amount += tx.amount;
          existing.hours += tx.totalHours || 0;
          existing.shifts += 1;
          platformMap.set(clientName, existing);

          // Monthly trend
          if (monthsData[txMonthKey]) {
            monthsData[txMonthKey].income += tx.amount;
            monthsData[txMonthKey].hours += tx.totalHours || 0;
          }
        } else if (tx.status === "PENDING") {
          pendingAmount += tx.amount;
          pendingCount += 1;
        }
      } else if (tx.type === "EXPENSE") {
        if (tx.status === "PAID") {
          totalExpenses += tx.amount;

          // Category mapping
          const catName = tx.category?.name || "Boshqa xarajat";
          categoryMap.set(catName, (categoryMap.get(catName) || 0) + tx.amount);

          // Monthly trend
          if (monthsData[txMonthKey]) {
            monthsData[txMonthKey].expense += tx.amount;
          }
        }
      }
    });

    // Monthly profit calculation
    const monthlyTrend = Object.values(monthsData).map((item) => ({
      name: item.name,
      income: item.income,
      expense: item.expense,
      profit: Math.max(0, item.income - item.expense),
      hours: Math.round(item.hours),
    }));

    const netProfit = totalGrossIncome - totalFees - totalExpenses;
    const estimatedTax = netProfit > 0 ? (netProfit * taxRate) / 100 : 0;
    const takeHomePay = Math.max(0, netProfit - estimatedTax);

    // Workplace Rankings (Leaderboard: 🥇 1st, 🥈 2nd, 🥉 3rd)
    const sortedPlatforms = Array.from(platformMap.entries())
      .map(([name, data]) => ({
        name,
        totalAmount: data.amount,
        percentage: totalGrossIncome > 0 ? Math.round((data.amount / totalGrossIncome) * 100) : 0,
        shiftCount: data.shifts,
        totalHours: Math.round(data.hours),
        color: data.color,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    // Previous month difference percentage
    let prevMonthDiffPercentage = 0;
    if (prevMonthIncome > 0) {
      prevMonthDiffPercentage = Math.round(((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100);
    }

    const currentMonthName = new Date(currentYear, currentMonth, 1).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    // Category breakdown formatted
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }));

    return NextResponse.json({
      totalGrossIncome,
      totalExpenses,
      totalFees,
      netProfit,
      estimatedTax,
      takeHomePay,
      pendingAmount,
      pendingCount,
      totalWorkedDays: workedDaysSet.size,
      totalWorkedHours: Math.round(totalWorkedHours),
      currentMonthName,
      prevMonthDiffPercentage,
      monthlyTrend,
      platformBreakdown: sortedPlatforms.map((p) => ({
        name: p.name,
        amount: p.totalAmount,
        percentage: p.percentage,
        color: p.color,
      })),
      workplaceRankings: sortedPlatforms,
      categoryBreakdown,
      currency: user?.currency || "KRW",
      taxRate,
    });
  } catch (error: any) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch stats" }, { status: 500 });
  }
}
