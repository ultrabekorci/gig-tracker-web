import { parseDateKey } from "@/lib/utils";
import type { ParsedEntry } from "./parse";

export interface TelegramSender {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface SavedEntry {
  id: string;
  currency: string;
}

export interface TelegramStats {
  income: number;
  expense: number;
  pending: number;
  net: number;
  currency: string;
  count: number;
}

/** The bot can only write to a database when one is configured. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

// Imported lazily: instantiating the Prisma client without DATABASE_URL throws,
// and the webhook must keep working in the storage-only (Mini App) setup.
async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

async function findOrCreateUser(sender: TelegramSender) {
  const prisma = await getPrisma();
  const telegramId = BigInt(sender.id);
  const name = [sender.first_name, sender.last_name].filter(Boolean).join(" ") || "Freelancer";

  return prisma.user.upsert({
    where: { telegramId },
    update: { name, username: sender.username || null },
    create: {
      telegramId,
      name,
      username: sender.username || null,
      // The schema default is USD; the app itself works in KRW by default.
      currency: process.env.DEFAULT_CURRENCY || "KRW",
    },
  });
}

/**
 * Writes the entry straight into the database — the "classic" bot flow, where
 * the user never has to open the Mini App.
 */
export async function saveEntryForSender(
  sender: TelegramSender,
  entry: ParsedEntry
): Promise<SavedEntry | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    const prisma = await getPrisma();
    const user = await findOrCreateUser(sender);

    const tx = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: entry.type,
        workType: entry.type === "INCOME" ? "DAILY_WAGE" : null,
        amount: entry.amount,
        currency: user.currency,
        description: entry.description,
        date: entry.date ? parseDateKey(entry.date) : new Date(),
        status: "PAID",
      },
    });

    return { id: tx.id, currency: user.currency };
  } catch (e) {
    console.error("Telegram entry save failed:", e);
    return null;
  }
}

export async function getStatsForSender(sender: TelegramSender): Promise<TelegramStats | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    const prisma = await getPrisma();
    const user = await prisma.user.findUnique({ where: { telegramId: BigInt(sender.id) } });
    if (!user) return null;

    const transactions = await prisma.transaction.findMany({ where: { userId: user.id } });

    let income = 0;
    let expense = 0;
    let pending = 0;

    transactions.forEach((tx) => {
      if (tx.type === "INCOME") {
        if (tx.status === "PAID") income += tx.amount;
        else pending += tx.amount;
      } else if (tx.type === "EXPENSE" && tx.status === "PAID") {
        expense += tx.amount;
      }
    });

    return {
      income,
      expense,
      pending,
      net: income - expense,
      currency: user.currency,
      count: transactions.length,
    };
  } catch (e) {
    console.error("Telegram stats failed:", e);
    return null;
  }
}
