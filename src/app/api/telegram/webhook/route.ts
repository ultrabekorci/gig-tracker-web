import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialData } from "@/lib/bootstrap";

export const dynamic = "force-dynamic";

// GET endpoint to test or auto-register webhook with Telegram
export async function GET(request: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const { searchParams } = new URL(request.url);
    const host = request.headers.get("host") || "gig-tracker-web.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const webhookUrl = `${protocol}://${host}/api/telegram/webhook`;

    if (!token) {
      return NextResponse.json({
        ok: false,
        error: "TELEGRAM_BOT_TOKEN is not configured in .env / Vercel Environment Variables.",
      });
    }

    // If param ?set=true, set the webhook with Telegram
    if (searchParams.get("set") === "true") {
      const setRes = await fetch(
        `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
      );
      const setData = await setRes.json();
      return NextResponse.json({
        ok: true,
        message: "Webhook registration attempt result",
        webhookUrl,
        telegramResponse: setData,
      });
    }

    // Get current webhook info
    const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const infoData = await infoRes.json();

    return NextResponse.json({
      ok: true,
      webhookUrl,
      webhookInfo: infoData,
      instructions: `Webhookni o'rnatish uchun brauzerda: ${webhookUrl}?set=true ga kiring.`,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// POST endpoint to handle incoming Telegram updates
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const host = request.headers.get("host") || "gig-tracker-web.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const appUrl = `${protocol}://${host}`;

    if (!token) {
      return NextResponse.json({ message: "No bot token configured" });
    }

    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const sender = message.from;

    await ensureInitialData("default-user");

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
          currency: "KRW",
        },
      });
    }

    // Handle /start
    if (text.startsWith("/start")) {
      const welcomeText =
        `👋 <b>Assalomu alaykum, ${sender.first_name}!</b>\n\n` +
        `<b>Gig & Shift Tracker</b> botiga xush kelibsiz.\n\n` +
        `💡 <b>Tezkor buyruqlar:</b>\n` +
        `• <code>+121900 Yekaterina</code> — Kunlik smena yozish\n` +
        `• <code>-15000 Tushlik</code> — Xarajat yozish\n` +
        `• <code>/stats</code> — Oylik hisobotni ko'rish\n\n` +
        `To'liq kalendar va smenalarni ko'rish uchun pastdagi tugmani bosing:`;

      await sendMessage(welcomeText, {
        inline_keyboard: [
          [
            {
              text: "🚀 Gig Tracker Mini App",
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
      let hours = 0;

      transactions.forEach((tx) => {
        if (tx.type === "INCOME" && tx.status === "PAID") {
          income += tx.amount;
          hours += tx.totalHours || 0;
        } else if (tx.type === "EXPENSE" && tx.status === "PAID") {
          expense += tx.amount;
        }
      });

      const net = income - expense;
      const statsText =
        `📊 <b>Sizning moliyaviy hisobotingiz:</b>\n\n` +
        `🟢 <b>Jami daromad:</b> ₩${income.toLocaleString()}\n` +
        `⏱️ <b>Jami ishlangan soat:</b> ${Math.round(hours)} soat\n` +
        `🔴 <b>Jami xarajat:</b> ₩${expense.toLocaleString()}\n` +
        `📈 <b>Sof foyda:</b> ₩${net.toLocaleString()}\n\n` +
        `Batafsil tahlil va kalendar uchun Mini App'ga kiring!`;

      await sendMessage(statsText, {
        inline_keyboard: [
          [
            {
              text: "📅 Kalendar & Mini App",
              web_app: { url: appUrl },
            },
          ],
        ],
      });
      return NextResponse.json({ ok: true });
    }

    // Handle Quick Entry: +120000 Zavod
    const incomeMatch = text.match(/^\+\s*(\d+(?:\.\d+)?)\s*(.*)$/);
    if (incomeMatch) {
      const amount = parseFloat(incomeMatch[1]);
      const desc = incomeMatch[2] || "Smena haqi (Bot)";

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "INCOME",
          workType: "DAILY_WAGE",
          amount,
          currency: user.currency || "KRW",
          description: desc,
          status: "PAID",
          totalHours: 8,
        },
      });

      await sendMessage(
        `✅ <b>Smena daromadi saqlandi!</b>\n💰 Summa: <b>+₩${amount.toLocaleString()}</b>\n📝 Izoh: <i>${desc}</i>`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle Quick Expense: -15000 Tushlik
    const expenseMatch = text.match(/^-\s*(\d+(?:\.\d+)?)\s*(.*)$/);
    if (expenseMatch) {
      const amount = parseFloat(expenseMatch[1]);
      const desc = expenseMatch[2] || "Xarajat (Bot)";

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "EXPENSE",
          amount,
          currency: user.currency || "KRW",
          description: desc,
          status: "PAID",
        },
      });

      await sendMessage(
        `✅ <b>Xarajat saqlandi!</b>\n💸 Summa: <b>-₩${amount.toLocaleString()}</b>\n📝 Izoh: <i>${desc}</i>`
      );
      return NextResponse.json({ ok: true });
    }

    // Fallback
    await sendMessage(
      `❓ Noma'lum buyruq.\n\nTezkor yozish uchun:\n<code>+120000 Zavod</code> yoki <code>-15000 Tushlik</code> deb yozing, yoki Mini App'ni oching.`
    );
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
