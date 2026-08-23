import { prisma } from "./prisma";

export async function ensureInitialData(userId: string = "default-user") {
  try {
    // Ensure User
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: "Sardor (Gig Pro)",
          username: "sardor_kr",
          currency: "KRW",
          taxRate: 3.3,
        },
      });
    }

    // Check Clients
    const clientCount = await prisma.client.count({
      where: { userId },
    });

    if (clientCount === 0) {
      const defaultClients = [
        { name: "Yekaterina", platform: "Zavod / Obekt", color: "#6366f1", defaultHourlyRate: 10320.0, defaultDailyRate: 121906.0 },
        { name: "Emart", platform: "Logistika", color: "#10b981", defaultHourlyRate: 10320.0, defaultDailyRate: 110000.0 },
        { name: "Xasanboy aka", platform: "Shaxsiy Obekt", color: "#f59e0b", defaultHourlyRate: 12000.0, defaultDailyRate: 150000.0 },
        { name: "Kunlik ish (Obekt)", platform: "Kunlik ish", color: "#ec4899", defaultHourlyRate: 10320.0, defaultDailyRate: 120000.0 },
        { name: "Zavod / Smena", platform: "Zavod", color: "#06b6d4", defaultHourlyRate: 10320.0, defaultDailyRate: 120000.0 },
      ];

      for (const cl of defaultClients) {
        await prisma.client.create({
          data: {
            ...cl,
            userId,
            isActive: true,
          },
        });
      }
    }

    // Check Categories
    const categoryCount = await prisma.category.count({
      where: { userId },
    });

    if (categoryCount === 0) {
      const defaultCategories = [
        { name: "Kunlik ish haqi", type: "INCOME", icon: "banknote" },
        { name: "Oziq-ovqat & Tushlik", type: "EXPENSE", icon: "utensils" },
        { name: "Yotoqxona & Ijara", type: "EXPENSE", icon: "home" },
        { name: "Yo'lkira & Transport", type: "EXPENSE", icon: "bus" },
        { name: "Ish kiyimi & Qurollar", type: "EXPENSE", icon: "wrench" },
        { name: "Aloqa & Internet", type: "EXPENSE", icon: "wifi" },
      ];

      for (const cat of defaultCategories) {
        await prisma.category.create({
          data: {
            ...cat,
            userId,
          },
        });
      }
    }

    // Check Transactions
    const txCount = await prisma.transaction.count({
      where: { userId },
    });

    if (txCount === 0) {
      const yekatClient = await prisma.client.findFirst({ where: { userId, name: "Yekaterina" } });

      const sampleShifts = [
        { date: new Date(2026, 7, 1), amount: 124500.0, startTime: "08:00", endTime: "17:00", totalHours: 9.0, isOvertime: true },
        { date: new Date(2026, 7, 3), amount: 121906.0, startTime: "08:00", endTime: "20:00", totalHours: 12.0, isOvertime: true },
        { date: new Date(2026, 7, 4), amount: 121906.0, startTime: "08:00", endTime: "20:00", totalHours: 12.0, isOvertime: true },
        { date: new Date(2026, 7, 5), amount: 121906.0, startTime: "08:00", endTime: "20:00", totalHours: 12.0, isOvertime: true },
        { date: new Date(2026, 7, 7), amount: 121907.0, startTime: "08:00", endTime: "20:00", totalHours: 12.0, isOvertime: true },
        { date: new Date(2026, 7, 8), amount: 124500.0, startTime: "08:00", endTime: "17:00", totalHours: 9.0, isOvertime: true },
        { date: new Date(2026, 7, 10), amount: 121906.0, startTime: "08:00", endTime: "20:00", totalHours: 12.0, isOvertime: true },
        { date: new Date(2026, 7, 11), amount: 121906.0, startTime: "08:00", endTime: "20:00", totalHours: 12.0, isOvertime: true },
        { date: new Date(2026, 7, 12), amount: 121906.0, startTime: "08:00", endTime: "20:00", totalHours: 12.0, isOvertime: true },
        { date: new Date(2026, 7, 13), amount: 121906.0, startTime: "08:00", endTime: "20:00", totalHours: 12.0, isOvertime: true },
        { date: new Date(2026, 7, 14), amount: 121907.0, startTime: "08:00", endTime: "20:00", totalHours: 12.0, isOvertime: true },
        { date: new Date(2026, 7, 15), amount: 124500.0, startTime: "08:00", endTime: "17:00", totalHours: 9.0, isOvertime: true },
      ];

      for (const s of sampleShifts) {
        await prisma.transaction.create({
          data: {
            userId,
            type: "INCOME",
            workType: "HOURLY_WAGE",
            amount: s.amount,
            currency: "KRW",
            description: "Yekaterina smenasi",
            date: s.date,
            status: "PAID",
            startTime: s.startTime,
            endTime: s.endTime,
            breakMinutes: 60,
            hourlyRate: 10320.0,
            totalHours: s.totalHours,
            isOvertime: s.isOvertime,
            color: "#6366f1",
            clientId: yekatClient?.id || null,
          },
        });
      }
    }
  } catch (e) {
    console.error("ensureInitialData error:", e);
  }
}
