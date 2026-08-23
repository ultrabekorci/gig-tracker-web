import { Client, Category, Transaction, DashboardStats } from "@/types";
import { toDateKey } from "@/lib/utils";

const WORKPLACES_KEY = "gig_tracker_workplaces_v3";
const CATEGORIES_KEY = "gig_tracker_categories_v3";
const TRANSACTIONS_KEY = "gig_tracker_transactions_v3";
// Marks that the demo data has already been seeded once. Without it, clearing
// or deleting everything would silently bring the sample data back.
const SEEDED_KEY = "gig_tracker_seeded_v3";

function hasSeeded(): boolean {
  try {
    return localStorage.getItem(SEEDED_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeeded() {
  try {
    localStorage.setItem(SEEDED_KEY, "1");
  } catch {
    /* storage unavailable (private mode) */
  }
}

/**
 * Reads a list from localStorage. Seeds the defaults only on the very first
 * run; afterwards an empty list stays empty.
 */
function readList<T>(key: string, defaults: T[]): T[] {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      if (hasSeeded()) return [];
      localStorage.setItem(key, JSON.stringify(defaults));
      markSeeded();
      return defaults;
    }
    markSeeded();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return defaults;
  }
}

function writeList<T>(key: string, list: T[]): T[] {
  try {
    localStorage.setItem(key, JSON.stringify(list));
    markSeeded();
  } catch {
    /* storage unavailable (private mode) */
  }
  return list;
}

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
  return readList<Client>(WORKPLACES_KEY, DEFAULT_WORKPLACES);
}

export function saveLocalWorkplace(wp: Partial<Client>): Client[] {
  const current = getLocalWorkplaces();
  const id = wp.id || `client-${Date.now()}`;
  const existingIdx = current.findIndex((c) => c.id === id);
  const existing = existingIdx >= 0 ? current[existingIdx] : null;

  // Merge over the stored record so a partial edit never drops the fields it
  // did not touch (platform, color, rates, ...).
  const updatedWp: Client = {
    ...(existing || {}),
    ...wp,
    id,
    name: wp.name ?? existing?.name ?? "Yangi Ish Joyi",
    platform: wp.platform ?? existing?.platform ?? "Workplace",
    color: wp.color ?? existing?.color ?? "#6366f1",
    defaultHourlyRate: wp.defaultHourlyRate ?? existing?.defaultHourlyRate ?? 10320,
    defaultDailyRate: wp.defaultDailyRate ?? existing?.defaultDailyRate ?? 120000,
    defaultFeeRate: wp.defaultFeeRate ?? existing?.defaultFeeRate ?? 0,
    isActive: wp.isActive ?? existing?.isActive ?? true,
    userId: existing?.userId || "default-user",
  };

  let updatedList: Client[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = updatedWp;
  } else {
    updatedList = [updatedWp, ...current];
  }

  return writeList(WORKPLACES_KEY, updatedList);
}

export function deleteLocalWorkplace(id: string): Client[] {
  return writeList(
    WORKPLACES_KEY,
    getLocalWorkplaces().filter((c) => c.id !== id)
  );
}

export function getLocalCategories(): Category[] {
  return readList<Category>(CATEGORIES_KEY, DEFAULT_CATEGORIES);
}

export function saveLocalCategory(cat: Partial<Category>): Category[] {
  const current = getLocalCategories();
  const id = cat.id || `cat-${Date.now()}`;
  const existingIdx = current.findIndex((c) => c.id === id);
  const existing = existingIdx >= 0 ? current[existingIdx] : null;

  const newCat: Category = {
    ...(existing || {}),
    ...cat,
    id,
    name: cat.name ?? existing?.name ?? "Kategoriya",
    type: cat.type ?? existing?.type ?? "EXPENSE",
    icon: cat.icon ?? existing?.icon ?? "tag",
    userId: existing?.userId || "default-user",
  };

  let updatedList: Category[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = newCat;
  } else {
    updatedList = [...current, newCat];
  }

  return writeList(CATEGORIES_KEY, updatedList);
}

export function deleteLocalCategory(id: string): Category[] {
  return writeList(
    CATEGORIES_KEY,
    getLocalCategories().filter((c) => c.id !== id)
  );
}

export function getLocalTransactions(): Transaction[] {
  const list = readList<Transaction>(TRANSACTIONS_KEY, DEFAULT_TRANSACTIONS);
  // Newest first, so every view shows the latest shift at the top.
  return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function saveLocalTransaction(tx: Partial<Transaction>): Transaction[] {
  const current = getLocalTransactions();
  const id = tx.id || `tx-${Date.now()}`;
  const existingIdx = current.findIndex((t) => t.id === id);
  const existing = existingIdx >= 0 ? current[existingIdx] : null;

  // An edit only carries the changed fields, so merge over the stored record.
  // Rebuilding it from defaults used to reset the date, type, workplace and
  // worked hours of the edited shift.
  const updatedTx: Transaction = {
    ...(existing || {}),
    ...tx,
    id,
    userId: existing?.userId || "default-user",
    type: tx.type ?? existing?.type ?? "INCOME",
    workType: tx.workType ?? existing?.workType ?? "HOURLY_WAGE",
    amount: tx.amount ?? existing?.amount ?? 0,
    currency: tx.currency ?? existing?.currency ?? "KRW",
    description: tx.description ?? existing?.description ?? null,
    date: tx.date ?? existing?.date ?? new Date().toISOString(),
    status: tx.status ?? existing?.status ?? "PAID",
    startTime: tx.startTime ?? existing?.startTime ?? null,
    endTime: tx.endTime ?? existing?.endTime ?? null,
    breakMinutes: tx.breakMinutes ?? existing?.breakMinutes ?? 0,
    hourlyRate: tx.hourlyRate ?? existing?.hourlyRate ?? 0,
    totalHours: tx.totalHours ?? existing?.totalHours ?? 0,
    isNightShift: tx.isNightShift ?? existing?.isNightShift ?? false,
    isOvertime: tx.isOvertime ?? existing?.isOvertime ?? false,
    isSpecialDuty: tx.isSpecialDuty ?? existing?.isSpecialDuty ?? false,
    unitCount: tx.unitCount ?? existing?.unitCount ?? 1,
    color: tx.color ?? existing?.color ?? "#6366f1",
    clientId: tx.clientId ?? existing?.clientId ?? null,
    categoryId: tx.categoryId ?? existing?.categoryId ?? null,
    fee: tx.fee ?? existing?.fee ?? 0,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  let updatedList: Transaction[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = updatedTx;
  } else {
    updatedList = [updatedTx, ...current];
  }

  updatedList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return writeList(TRANSACTIONS_KEY, updatedList);
}

export function deleteLocalTransaction(id: string): Transaction[] {
  return writeList(
    TRANSACTIONS_KEY,
    getLocalTransactions().filter((t) => t.id !== id)
  );
}

export const DEFAULT_TAX_RATE = 3.3;

export function calculateLocalStats(
  transactions: Transaction[],
  currency: string = "KRW",
  categories: Category[] = [],
  taxRate: number = DEFAULT_TAX_RATE
): DashboardStats {
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

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const currMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;

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
          workedDaysSet.add(toDateKey(txDate));
        }

        if (txMonthKey === prevMonthKey) {
          prevMonthIncome += tx.amount;
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

      // Expense breakdown per category — this was collected nowhere before,
      // so the category breakdown always came back empty.
      const catName =
        tx.category?.name ||
        (tx.categoryId ? categoryNameById.get(tx.categoryId) : undefined) ||
        "Boshqa xarajat";
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + tx.amount);

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
  const estimatedTax = netProfit > 0 ? (netProfit * taxRate) / 100 : 0;
  const takeHomePay = Math.max(0, netProfit - estimatedTax);

  const prevMonthDiffPercentage =
    prevMonthIncome > 0
      ? Math.round(((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100)
      : 0;

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
    currentMonthName: now.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    prevMonthDiffPercentage,
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
    taxRate,
  };
}
