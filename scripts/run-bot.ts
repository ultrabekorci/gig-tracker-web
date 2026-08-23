import { Bot, InlineKeyboard } from "grammy";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN topilmadi! Iltimos .env fayliga bot tokeningizni kiriting.");
  process.exit(1);
}

const bot = new Bot(token);
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

bot.command("start", async (ctx) => {
  const from = ctx.from;
  if (!from) return;

  // Find or create user
  await prisma.user.upsert({
    where: { telegramId: BigInt(from.id) },
    update: {
      name: from.first_name + (from.last_name ? ` ${from.last_name}` : ""),
      username: from.username || null,
    },
    create: {
      telegramId: BigInt(from.id),
      name: from.first_name + (from.last_name ? ` ${from.last_name}` : ""),
      username: from.username || null,
    },
  });

  const keyboard = new InlineKeyboard().webApp("🚀 Gig Tracker Mini App", appUrl);

  await ctx.reply(
    `👋 <b>Assalomu alaykum, ${from.first_name}!</b>\n\n` +
      `<b>Gig Tracker</b> botiga xush kelibsiz.\n\n` +
      `💡 <b>Tezkor buyruqlar:</b>\n` +
      `• <code>+150 Upwork Logo dizayn</code> — Kirim yozish\n` +
      `• <code>-25 Benzin</code> — Chiqim yozish\n` +
      `• <code>/stats</code> — Oylik hisobotni ko'rish\n\n` +
      `Ilovani ochish uchun pastdagi tugmani bosing:`,
    {
      parse_mode: "HTML",
      reply_markup: keyboard,
    }
  );
});

bot.command("stats", async (ctx) => {
  const from = ctx.from;
  if (!from) return;

  const user = await prisma.user.findFirst({
    where: { telegramId: BigInt(from.id) },
  });

  if (!user) {
    await ctx.reply("Siz hali birorta tranzaksiya kiritmadingiz. /start bosing.");
    return;
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
  });

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

  const net = income - expense;
  const keyboard = new InlineKeyboard().webApp("📊 To'liq Dashboard", appUrl);

  await ctx.reply(
    `📊 <b>Sizning moliyaviy hisobotingiz:</b>\n\n` +
      `🟢 <b>Jami daromad:</b> $${income.toLocaleString()}\n` +
      `🔴 <b>Jami xarajat:</b> $${expense.toLocaleString()}\n` +
      `📈 <b>Sof foyda:</b> $${net.toLocaleString()}\n` +
      `⏳ <b>Kutilayotgan pullar:</b> $${pending.toLocaleString()}\n\n` +
      `Batafsil tahlil va grafiklar uchun Mini App'ga kiring!`,
    {
      parse_mode: "HTML",
      reply_markup: keyboard,
    }
  );
});

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text.trim();
  const from = ctx.from;
  if (!from) return;

  let user = await prisma.user.findFirst({
    where: { telegramId: BigInt(from.id) },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId: BigInt(from.id),
        name: from.first_name + (from.last_name ? ` ${from.last_name}` : ""),
        username: from.username || null,
      },
    });
  }

  // Quick Income: +50 ...
  const incomeMatch = text.match(/^\+\s*(\d+(?:\.\d+)?)\s*(.*)$/);
  if (incomeMatch) {
    const amount = parseFloat(incomeMatch[1]);
    const desc = incomeMatch[2] || "Kirim (Telegram Bot)";

    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "INCOME",
        amount,
        description: desc,
        status: "PAID",
      },
    });

    await ctx.reply(`✅ <b>Kirim saqlandi!</b>\n💰 Summa: <b>+$${amount}</b>\n📝 Izoh: <i>${desc}</i>`, {
      parse_mode: "HTML",
    });
    return;
  }

  // Quick Expense: -15 ...
  const expenseMatch = text.match(/^-\s*(\d+(?:\.\d+)?)\s*(.*)$/);
  if (expenseMatch) {
    const amount = parseFloat(expenseMatch[1]);
    const desc = expenseMatch[2] || "Chiqim (Telegram Bot)";

    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "EXPENSE",
        amount,
        description: desc,
        status: "PAID",
      },
    });

    await ctx.reply(`✅ <b>Xarajat saqlandi!</b>\n💸 Summa: <b>-$${amount}</b>\n📝 Izoh: <i>${desc}</i>`, {
      parse_mode: "HTML",
    });
    return;
  }

  await ctx.reply(
    `❓ Noma'lum buyruq.\n\nTezkor kiritish uchun:\n<code>+50 Upwork</code> yoki <code>-15 Tushlik</code> deb yozing.`
  );
});

console.log("🤖 Gig Tracker Telegram boti ishga tushdi...");
bot.start();
