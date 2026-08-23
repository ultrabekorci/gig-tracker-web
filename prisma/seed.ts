import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Shift & Gig Tracker data...");

  // Default User
  const user = await prisma.user.upsert({
    where: { id: "default-user" },
    update: {
      currency: "KRW",
    },
    create: {
      id: "default-user",
      name: "Sardor (Gig & Shift Pro)",
      username: "sardor_kr",
      currency: "KRW",
      taxRate: 3.3, // Korean freelance withholding tax (3.3%)
    },
  });

  // Default Workplaces (Clients)
  const clientsData = [
    {
      id: "client-yekaterina",
      name: "Yekaterina",
      platform: "Zavod / Obekt",
      color: "#6366f1",
      defaultHourlyRate: 10320.0,
      defaultDailyRate: 121906.0,
      isActive: true,
    },
    {
      id: "client-emart",
      name: "Emart",
      platform: "Supermarket / Logistika",
      color: "#10b981",
      defaultHourlyRate: 10320.0,
      defaultDailyRate: 110000.0,
      isActive: true,
    },
    {
      id: "client-xasanboy",
      name: "Xasanboy aka",
      platform: "Shaxsiy Obekt / Remont",
      color: "#f59e0b",
      defaultHourlyRate: 12000.0,
      defaultDailyRate: 150000.0,
      isActive: true,
    },
  ];

  for (const client of clientsData) {
    await prisma.client.upsert({
      where: { id: client.id },
      update: client,
      create: {
        ...client,
        userId: user.id,
      },
    });
  }

  // Clear existing transactions to load fresh matching shifts
  await prisma.transaction.deleteMany({ where: { userId: user.id } });

  // August 2026 Shift Transactions (Total: ₩1,553,656 across 12 days, 138 hours)
  const augustShifts = [
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

  for (const s of augustShifts) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
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
        clientId: "client-yekaterina",
      },
    });
  }

  // Previous months historical data for 12 months analysis chart & leaderboard
  const historicalShifts = [
    // Emart (5,170,000 KRW total in past months)
    { date: new Date(2026, 6, 10), amount: 2600000.0, clientId: "client-emart", color: "#10b981", hours: 210 },
    { date: new Date(2026, 5, 12), amount: 2570000.0, clientId: "client-emart", color: "#10b981", hours: 205 },
    // Yekaterina in July (2,728,000 KRW)
    { date: new Date(2026, 6, 20), amount: 2728000.0, clientId: "client-yekaterina", color: "#6366f1", hours: 220 },
    // Xasanboy aka (105,000 KRW)
    { date: new Date(2026, 4, 15), amount: 105000.0, clientId: "client-xasanboy", color: "#f59e0b", hours: 8 },
  ];

  for (const h of historicalShifts) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "INCOME",
        workType: "DAILY_WAGE",
        amount: h.amount,
        currency: "KRW",
        description: "Oldingi oy hisobi",
        date: h.date,
        status: "PAID",
        totalHours: h.hours,
        color: h.color,
        clientId: h.clientId,
      },
    });
  }

  // Monthly Goal
  await prisma.goal.upsert({
    where: { id: "goal-august" },
    update: { targetAmount: 2500000.0 },
    create: {
      id: "goal-august",
      userId: user.id,
      title: "Oylik Ish Haqi Maqsadi",
      targetAmount: 2500000.0,
      currentAmount: 1553656.0,
      period: "MONTHLY",
      month: 8,
      year: 2026,
    },
  });

  console.log("Database seeded successfully with authentic shift data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
