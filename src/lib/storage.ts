import { Client, Category, Transaction, DashboardStats } from "@/types";

const WORKPLACES_KEY = "gig_tracker_workplaces_v2";
const CATEGORIES_KEY = "gig_tracker_categories_v2";
const TRANSACTIONS_KEY = "gig_tracker_transactions_v2";

export const DEFAULT_WORKPLACES: Client[] = [
  {
    id: "client-yekaterina",
    name: "Yekaterina",
    platform: "Zavod / Obekt",
    color: "#6366f1",
    defaultHourlyRate: 10320,
    defaultDailyRate: 121906,
    defaultFeeRate: 0,
    isActive: true,
    userId: "default-user",
  },
  {
    id: "client-emart",
    name: "Emart",
    platform: "Logistika",
    color: "#10b981",
    defaultHourlyRate: 10320,
    defaultDailyRate: 110000,
    defaultFeeRate: 0,
    isActive: true,
    userId: "default-user",
  },
  {
    id: "client-xasanboy",
    name: "Xasanboy aka",
    platform: "Shaxsiy Obekt",
    color: "#f59e0b",
    defaultHourlyRate: 12000,
    defaultDailyRate: 150000,
    defaultFeeRate: 0,
    isActive: true,
    userId: "default-user",
  },
  {
    id: "client-daily",
    name: "Kunlik ish (Obekt)",
    platform: "Kunlik ish",
    color: "#ec4899",
    defaultHourlyRate: 10320,
    defaultDailyRate: 120000,
    defaultFeeRate: 0,
    isActive: true,
    userId: "default-user",
  },
  {
    id: "client-factory",
    name: "Zavod / Smena",
    platform: "Zavod",
    color: "#06b6d4",
    defaultHourlyRate: 10320,
    defaultDailyRate: 120000,
    defaultFeeRate: 0,
    isActive: true,
    userId: "default-user",
  },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-daily-wage", name: "Kunlik ish haqi", type: "INCOME", icon: "banknote", userId: "default-user" },
  { id: "cat-food", name: "Oziq-ovqat & Tushlik", type: "EXPENSE", icon: "utensils", userId: "default-user" },
  { id: "cat-rent", name: "Yotoqxona & Ijara", type: "EXPENSE", icon: "home", userId: "default-user" },
  { id: "cat-transport", name: "Yo'lkira & Transport", type: "EXPENSE", icon: "bus", userId: "default-user" },
  { id: "cat-tools", name: "Ish kiyimi & Qurollar", type: "EXPENSE", icon: "wrench", userId: "default-user" },
  { id: "cat-comm", name: "Aloqa & Internet", type: "EXPENSE", icon: "wifi", userId: "default-user" },
  { id: "cat-fee", name: "Komissiya & Xizmat haqi", type: "EXPENSE", icon: "receipt", userId: "default-user" },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: "tx-1", userId: "default-user", type: "INCOME", workType: "HOURLY_WAGE", amount: 124500, currency: "KRW", description: "Yekaterina smenasi", date: "2026-08-01T08:00:00.000Z", status: "PAID", startTime: "08:00", endTime: "17:00", totalHours: 9, isOvertime: true, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-2", userId: "default-user", type: "INCOME", workType: "HOURLY_WAGE", amount: 121906, currency: "KRW", description: "Yekaterina smenasi", date: "2026-08-03T08:00:00.000Z", status: "PAID", startTime: "08:00", endTime: "20:00", totalHours: 12, isOvertime: true, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-3", userId: "default-user", type: "INCOME", workType: "HOURLY_WAGE", amount: 121906, currency: "KRW", description: "Yekaterina smenasi", date: "2026-08-04T08:00:00.000Z", status: "PAID", startTime: "08:00", endTime: "20:00", totalHours: 12, isOvertime: true, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-4", userId: "default-user", type: "INCOME", workType: "HOURLY_WAGE", amount: 121906, currency: "KRW", description: "Yekaterina smenasi", date: "2026-08-05T08:00:00.000Z", status: "PAID", startTime: "08:00", endTime: "20:00", totalHours: 12, isOvertime: true, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-5", userId: "default-user", type: "INCOME", workType: "HOURLY_WAGE", amount: 121907, currency: "KRW", description: "Yekaterina smenasi", date: "2026-08-07T08:00:00.000Z", status: "PAID", startTime: "08:00", endTime: "20:00", totalHours: 12, isOvertime: true, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-6", userId: "default-user", type: "INCOME", workType: "HOURLY_WAGE", amount: 124500, currency: "KRW", description: "Yekaterina smenasi", date: "2026-08-08T08:00:00.000Z", status: "PAID", startTime: "08:00", endTime: "17:00", totalHours: 9, isOvertime: true, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-7", userId: "default-user", type: "INCOME", workType: "HOURLY_WAGE", amount: 121906, currency: "KRW", description: "Yekaterina smenasi", date: "2026-08-10T08:00:00.000Z", status: "PAID", startTime: "08:00", endTime: "20:00", totalHours: 12, isOvertime: true, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-8", userId: "default-user", type: "INCOME", workType: "HOURLY_WAGE", amount: 121906, currency: "KRW", description: "Yekaterina smenasi", date: "2026-08-11T08:00:00.000Z", status: "PAID", startTime: "08:00", endTime: "20:00", totalHours: 12, isOvertime: true, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-9", userId: "default-user", type: "INCOME", workType: "HOURLY_WAGE", amount: 121906, currency: "KRW", description: "Yekaterina smenasi", date: "2026-08-12T08:00:00.000Z", status: "PAID", startTime: "08:00", endTime: "20:00", totalHours: 12, isOvertime: true, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-10", userId: "default-user", type: "INCOME", workType: "HOURLY_WAGE", amount: 121906, currency: "KRW", description: "Yekaterina smenasi", date: "2026-08-13T08:00:00.000Z", status: "PAID", startTime: "08:00", endTime: "20:00", totalHours: 12, isOvertime: true, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-11", userId: "default-user", type: "INCOME", workType: "HOURLY_WAGE", amount: 121907, currency: "KRW", description: "Yekaterina smenasi", date: "2026-08-14T08:00:00.000Z", status: "PAID", startTime: "08:00", endTime: "20:00", totalHours: 12, isOvertime: true, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-12", userId: "default-user", type: "INCOME", workType: "HOURLY_WAGE", amount: 124500, currency: "KRW", description: "Yekaterina smenasi", date: "2026-08-15T08:00:00.000Z", status: "PAID", startTime: "08:00", endTime: "17:00", totalHours: 9, isOvertime: true, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  // Historical
  { id: "tx-hist-1", userId: "default-user", type: "INCOME", workType: "DAILY_WAGE", amount: 2600000, currency: "KRW", description: "Emart oylik smenasi", date: "2026-07-10T08:00:00.000Z", status: "PAID", totalHours: 210, color: "#10b981", clientId: "client-emart", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-hist-2", userId: "default-user", type: "INCOME", workType: "DAILY_WAGE", amount: 2570000, currency: "KRW", description: "Emart oylik smenasi", date: "2026-06-12T08:00:00.000Z", status: "PAID", totalHours: 205, color: "#10b981", clientId: "client-emart", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-hist-3", userId: "default-user", type: "INCOME", workType: "DAILY_WAGE", amount: 2728000, currency: "KRW", description: "Yekaterina iyul oyi", date: "2026-07-20T08:00:00.000Z", status: "PAID", totalHours: 220, color: "#6366f1", clientId: "client-yekaterina", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
  { id: "tx-hist-4", userId: "default-user", type: "INCOME", workType: "DAILY_WAGE", amount: 105000, currency: "KRW", description: "Xasanboy aka obekti", date: "2026-05-15T08:00:00.000Z", status: "PAID", totalHours: 8, color: "#f59e0b", clientId: "client-xasanboy", categoryId: "cat-daily-wage", fee: 0, createdAt: new Date() },
];

export function getLocalWorkplaces(): Client[] {
  if (typeof window === "undefined") return DEFAULT_WORKPLACES;
  try {
    const raw = localStorage.getItem(WORKPLACES_KEY);
    if (!raw) {
      localStorage.setItem(WORKPLACES_KEY, JSON.stringify(DEFAULT_WORKPLACES));
      return DEFAULT_WORKPLACES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_WORKPLACES;
  } catch {
    return DEFAULT_WORKPLACES;
  }
}

export function saveLocalWorkplace(wp: Partial<Client>): Client {
  const current = getLocalWorkplaces();
  const newWp: Client = {
    id: wp.id || `client-${Date.now()}`,
    name: wp.name || "Yangi Ish Joyi",
    platform: wp.platform || "Workplace",
    color: wp.color || "#6366f1",
    defaultHourlyRate: wp.defaultHourlyRate || 10320,
    defaultDailyRate: wp.defaultDailyRate || 120000,
    defaultFeeRate: wp.defaultFeeRate || 0,
    isActive: true,
    userId: "default-user",
  };
  const updated = [newWp, ...current.filter((c) => c.id !== newWp.id)];
  localStorage.setItem(WORKPLACES_KEY, JSON.stringify(updated));
  return newWp;
}

export function deleteLocalWorkplace(id: string): Client[] {
  const current = getLocalWorkplaces();
  const updated = current.filter((c) => c.id !== id);
  localStorage.setItem(WORKPLACES_KEY, JSON.stringify(updated));
  return updated;
}

export function getLocalCategories(): Category[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveLocalCategory(cat: Partial<Category>): Category {
  const current = getLocalCategories();
  const newCat: Category = {
    id: cat.id || `cat-${Date.now()}`,
    name: cat.name || "Kategoriya",
    type: cat.type || "EXPENSE",
    icon: cat.icon || "tag",
    userId: "default-user",
  };
  const updated = [...current, newCat];
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
  return newCat;
}

export function deleteLocalCategory(id: string): Category[] {
  const current = getLocalCategories();
  const updated = current.filter((c) => c.id !== id);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
  return updated;
}

export function getLocalTransactions(): Transaction[] {
  if (typeof window === "undefined") return DEFAULT_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(DEFAULT_TRANSACTIONS));
      return DEFAULT_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TRANSACTIONS;
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveLocalTransaction(tx: Partial<Transaction>): Transaction {
  const current = getLocalTransactions();
  const newTx: Transaction = {
    id: tx.id || `tx-${Date.now()}`,
    userId: "default-user",
    type: tx.type || "INCOME",
    workType: tx.workType || "HOURLY_WAGE",
    amount: tx.amount || 0,
    currency: tx.currency || "KRW",
    description: tx.description || null,
    date: tx.date || new Date().toISOString(),
    status: tx.status || "PAID",
    startTime: tx.startTime || "08:00",
    endTime: tx.endTime || "18:00",
    breakMinutes: tx.breakMinutes || 0,
    hourlyRate: tx.hourlyRate || 10320,
    totalHours: tx.totalHours || 8,
    isNightShift: tx.isNightShift || false,
    isOvertime: tx.isOvertime || false,
    isSpecialDuty: tx.isSpecialDuty || false,
    unitCount: tx.unitCount || 1,
    color: tx.color || "#6366f1",
    clientId: tx.clientId || null,
    categoryId: tx.categoryId || null,
    fee: tx.fee || 0,
    createdAt: new Date(),
  };
  const updated = [newTx, ...current.filter((t) => t.id !== newTx.id)];
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
  return newTx;
}

export function deleteLocalTransaction(id: string): Transaction[] {
  const current = getLocalTransactions();
  const updated = current.filter((t) => t.id !== id);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
  return updated;
}

export function calculateLocalStats(transactions: Transaction[], currency: string = "KRW"): DashboardStats {
  let totalGrossIncome = 0;
  let totalExpenses = 0;
  let totalFees = 0;
  let pendingAmount = 0;
  let pendingCount = 0;
  let currentMonthIncome = 0;
  let totalWorkedHours = 0;
  const workedDaysSet = new Set<string>();

  const platformMap = new Map<string, { amount: number; hours: number; shifts: number; color: string }>();
  const categoryMap = new Map<string, number>();

  const currentYear = 2026;
  const currentMonth = 7; // August (0-indexed)
  const currMonthKey = "2026-08";

  // 12 Months Map
  const monthsData: { [key: string]: { name: string; income: number; expense: number; profit: number; hours: number } } = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
    monthsData[key] = { name: label, income: 0, expense: 0, profit: 0, hours: 0 };
  }

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

        const clientName = tx.client?.name || (tx.clientId === "client-yekaterina" ? "Yekaterina" : tx.clientId === "client-emart" ? "Emart" : tx.clientId === "client-xasanboy" ? "Xasanboy aka" : "Boshqa");
        const clientColor = tx.color || "#6366f1";
        const existing = platformMap.get(clientName) || { amount: 0, hours: 0, shifts: 0, color: clientColor };
        existing.amount += tx.amount;
        existing.hours += tx.totalHours || 0;
        existing.shifts += 1;
        platformMap.set(clientName, existing);

        if (monthsData[txMonthKey]) {
          monthsData[txMonthKey].income += tx.amount;
          monthsData[txMonthKey].hours += tx.totalHours || 0;
        }
      } else if (tx.status === "PENDING") {
        pendingAmount += tx.amount;
        pendingCount += 1;
      }
    } else if (tx.type === "EXPENSE" && tx.status === "PAID") {
      totalExpenses += tx.amount;
      if (monthsData[txMonthKey]) {
        monthsData[txMonthKey].expense += tx.amount;
      }
    }
  });

  const monthlyTrend = Object.values(monthsData).map((item) => ({
    name: item.name,
    income: item.income,
    expense: item.expense,
    profit: Math.max(0, item.income - item.expense),
    hours: Math.round(item.hours),
  }));

  const netProfit = totalGrossIncome - totalFees - totalExpenses;
  const estimatedTax = netProfit > 0 ? (netProfit * 3.3) / 100 : 0;
  const takeHomePay = Math.max(0, netProfit - estimatedTax);

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

  return {
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
    currentMonthName: "Aug 2026",
    prevMonthDiffPercentage: -56.5,
    monthlyTrend,
    platformBreakdown: sortedPlatforms.map((p) => ({
      name: p.name,
      amount: p.totalAmount,
      percentage: p.percentage,
      color: p.color,
    })),
    workplaceRankings: sortedPlatforms,
    categoryBreakdown: Array.from(categoryMap.entries()).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    })),
    currency,
    taxRate: 3.3,
  };
}
