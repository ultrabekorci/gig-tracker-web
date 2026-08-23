import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const { searchParams } = new URL(request.url);
    const host = request.headers.get("host") || "gig-tracker-web.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const webhookUrl = `${protocol}://${host}/api/telegram/webhook`;

    if (!token) return NextResponse.json({ ok: false, error: "No token" });

    if (searchParams.get("set") === "true") {
      const setRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
      return NextResponse.json({ ok: true, telegramResponse: await setRes.json() });
    }

    const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    return NextResponse.json({ ok: true, webhookUrl, webhookInfo: await infoRes.json() });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const openAiKey = process.env.OPENAI_API_KEY;
    const host = request.headers.get("host") || "gig-tracker-web.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const appUrl = `${protocol}://${host}`;

    if (!token) return NextResponse.json({ message: "No bot token configured" });

    const message = body.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const sender = message.from;

    const sendMessage = async (msgText: string, replyMarkup?: any) => {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: msgText, parse_mode: "HTML", reply_markup: replyMarkup }),
      });
    };

    let text = message.text || "";

    // Handle Voice Message
    if (message.voice) {
      if (!openAiKey) {
        await sendMessage(`🎙 <b>Ovozli xabar qabul qilindi.</b>\n\nAmmo ovozni matnga aylantirish uchun serverda <code>OPENAI_API_KEY</code> ulanmagan.\nIltimos, hozircha matn orqali yozing yoki Mini App orqali kiriting.`);
        return NextResponse.json({ ok: true });
      }

      await sendMessage(`⏳ Ovozli xabar qayta ishlanmoqda...`);

      // 1. Get file path from Telegram
      const fileId = message.voice.file_id;
      const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
      const fileData = await fileRes.json();
      
      if (fileData.ok) {
        // 2. Download file
        const filePath = fileData.result.file_path;
        const audioUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
        const audioRes = await fetch(audioUrl);
        const audioBlob = await audioRes.blob();

        // 3. Send to OpenAI Whisper
        const formData = new FormData();
        formData.append("file", audioBlob, "voice.oga");
        formData.append("model", "whisper-1");
        formData.append("language", "uz");

        const aiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${openAiKey}` },
          body: formData
        });

        const aiData = await aiRes.json();
        if (aiData.text) {
          text = aiData.text;
          await sendMessage(`🗣 <b>Sizning gapingiz:</b>\n<i>"${text}"</i>`);
        } else {
          await sendMessage(`❌ Ovozni aniqlab bo'lmadi.`);
          return NextResponse.json({ ok: true });
        }
      }
    }

    if (!text) return NextResponse.json({ ok: true });
    text = text.trim();

    // Handle /start
    if (text.startsWith("/start")) {
      await sendMessage(
        `👋 <b>Assalomu alaykum, ${sender.first_name}!</b>\n\n` +
        `Sizning ma'lumotlaringiz ilovaning o'zida (telefon xotirasida) saqlanadi.\n` +
        `Smena qo'shish uchun matn yozing yoki ovozli xabar yuboring.\n\n` +
        `Misol: <code>120 ming zavodda ishladim</code>\n\n` +
        `Yoki to'g'ridan-to'g'ri ilovaga kiring:`,
        { inline_keyboard: [[{ text: "🚀 Gig Tracker", web_app: { url: appUrl } }]] }
      );
      return NextResponse.json({ ok: true });
    }

    // Try to parse amount and description from Text
    // E.g., "+120000 Zavod", "120 ming zavodda ishladim", "-15000 tushlik"
    let amount = 0;
    let desc = "";
    let type = "INCOME";

    if (text.startsWith("-") || text.toLowerCase().includes("xarajat") || text.toLowerCase().includes("chiqim")) {
      type = "EXPENSE";
    }

    // Extract numbers
    const numMatch = text.match(/\d+([.,]\d+)?/g);
    if (numMatch) {
      let rawNum = parseFloat(numMatch[0].replace(",", "."));
      if (text.toLowerCase().includes("ming")) rawNum *= 1000;
      amount = rawNum;
      
      // Clean up description
      desc = text.replace(numMatch[0], "").replace(/ming|ishladim|zavodda/gi, "").trim();
      if (desc.length < 2) desc = type === "INCOME" ? "Smena (Bot)" : "Xarajat (Bot)";
    }

    if (amount > 0) {
      // Send Deep Link to App
      const deepLinkUrl = `${appUrl}?action=add&type=${type}&amount=${amount}&desc=${encodeURIComponent(desc)}`;
      
      await sendMessage(
        `✅ <b>Ma'lumot aniqlandi!</b>\n\n` +
        `${type === "INCOME" ? "💰 Daromad" : "💸 Xarajat"}: <b>${amount.toLocaleString()}</b>\n` +
        `📝 Izoh: <i>${desc}</i>\n\n` +
        `Ilovaga saqlash uchun quyidagi tugmani bosing:`,
        { inline_keyboard: [[{ text: "📥 Ilovada Saqlash", web_app: { url: deepLinkUrl } }]] }
      );
      return NextResponse.json({ ok: true });
    }

    // Fallback
    await sendMessage(
      `❓ Tushunarsiz buyruq.\n\nSmena yozish uchun summani kiriting:\nMasalan: <code>120000 Zavod</code> yoki ovozli xabar yuboring.`
    );
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
