import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://t.me";

    if (!token) {
      return NextResponse.json({ message: "No bot token configured, skipping telegram webhook" });
    }

    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const sender = message.from;

    // Helper to send message via Telegram Bot API
    const sendMessage = async (msgText: string, replyMarkup?: any) => {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: msgText,
          parse_mode: "HTML",
          reply_markup: replyMarkup,
        }),
      });
    };

    // Ensure user exists
    let user = await prisma.user.findFirst({
      where: { telegramId: BigInt(sender.id) },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: BigInt(sender.id),
          name: sender.first_name + (sender.last_name ? ` ${sender.last_name}` : ""),
          username: sender.username || null,
        },
      });
    }

    // Handle /start
    if (text.startsWith("/start")) {
      const welcomeText = `👋 <b>Assalomu alaykum, ${sender.first_name}!</b>\n\n` +
        `<b>Gig Tracker</b> botiga xush kelibsiz.\n\n` +
        `💡 <b>Tezkor buyruqlar:</b>\n` +
        `• <code>+150 Upwork Logo dizayn</code> — Kirim yozish\n` +
        `• <code>-25 Benzin</code> — Chiqim yozish\n` +
        `• <code>/stats</code> — Oylik hisobotni ko'rish\n\n` +
        `To'liq interfeysni ochish uchun quyidagi tugmani bosing:`;

      await sendMessage(welcomeText, {
        inline_keyboard: [
          [
            {
              text: "🚀 Gig Tracker Mini App'ni ochish",
              web_app: { url: appUrl },
            },
          ],
        ],
      });
      return NextResponse.json({ ok: true });
    }

    // Handle /stats
    if (text.startsWith("/stats")) {
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
      const statsText = `📊 <b>Sizning moliyaviy hisobotingiz:</b>\n\n` +
        `🟢 <b>Jami daromad:</b> $${income.toLocaleString()}\n` +
        `🔴 <b>Jami xarajat:</b> $${expense.toLocaleString()}\n` +
        `📈 <b>Sof foyda:</b> $${net.toLocaleString()}\n` +
        `⏳ <b>Kutilayotgan pullar:</b> $${pending.toLocaleString()}\n\n` +
        `Batafsil tahlil va grafiklar uchun Mini App'ga kiring!`;

      await sendMessage(statsText, {
        inline_keyboard: [
          [
            {
              text: "📊 To'liq Dashboard",
              web_app: { url: appUrl },
            },
          ],
        ],
      });
      return NextResponse.json({ ok: true });
    }

    // Handle Quick Entry (+150 or -30)
    const incomeMatch = text.match(/^\+\s*(\d+(?:\.\d+)?)\s*(.*)$/);
    const expenseMatch = text.match(/^-\s*(\d+(?:\.\d+)?)\s*(.*)$/);

    if (incomeMatch) {
      const amount = parseFloat(incomeMatch[1]);
      const desc = incomeMatch[2] || "Kirim (Telegram Bot orqali)";

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "INCOME",
          amount,
          description: desc,
          status: "PAID",
        },
      });

      await sendMessage(`✅ <b>Kirim saqlandi!</b>\n💰 Summa: <b>+$${amount}</b>\n📝 Izoh: <i>${desc}</i>`);
      return NextResponse.json({ ok: true });
    }

    if (expenseMatch) {
      const amount = parseFloat(expenseMatch[1]);
      const desc = expenseMatch[2] || "Chiqim (Telegram Bot orqali)";

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "EXPENSE",
          amount,
          description: desc,
          status: "PAID",
        },
      });

      await sendMessage(`✅ <b>Xarajat saqlandi!</b>\n💸 Summa: <b>-$${amount}</b>\n📝 Izoh: <i>${desc}</i>`);
      return NextResponse.json({ ok: true });
    }

    // Default Fallback
    await sendMessage(
      `❓ Noma'lum buyruq. Tezkor kiritish uchun:\n<code>+50 Upwork</code> yoki <code>-15 Tushlik</code> deb yozing, yoki Mini App'ni oching.`
    );
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
