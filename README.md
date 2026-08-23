# Gig Tracker

Smena, kirim va xarajatlarni yuritish uchun Next.js ilovasi + Telegram bot.
Ilova Telegram Mini App sifatida ham ishlaydi.

## Ishga tushirish

```bash
npm install
cp .env.example .env     # kerakli qiymatlarni to'ldiring
npm run dev              # http://localhost:3000
```

Ma'lumotlar bazasidan foydalanmoqchi bo'lsangiz:

```bash
npm run prisma:push      # DATABASE_URL bo'yicha jadvallarni yaratadi
```

## Telegram bot

Bot ikkala usulda ham ishlaydi va **bir xil mantiqdan** foydalanadi
(`src/lib/telegram/`) — matnni tahlil qilish, ovozni matnga aylantirish va
saqlash ikkalasida bir xil.

### 1. Klassik usul — long-polling (`npm run bot`)

Serverga ochiq URL ham, webhook ham kerak emas. Kompyuterda yoki VPS'da:

```bash
npm run bot
```

Ishga tushganda bot avval mavjud webhook'ni o'chiradi (Telegram webhook
qo'yilgan bo'lsa `getUpdates` ishlamaydi), so'ng xabarlarni o'zi so'rab turadi.

### 2. Webhook usuli (Vercel va shunga o'xshash serverless)

```
GET /api/telegram/webhook?set=true     # webhook'ni o'rnatadi
GET /api/telegram/webhook              # holatini ko'rsatadi
GET /api/telegram/webhook?delete=true  # o'chiradi (klassik usulga qaytish uchun)
```

`TELEGRAM_WEBHOOK_SECRET` o'rnatilgan bo'lsa, webhook faqat Telegram yuborgan
maxfiy sarlavhali so'rovlarni qabul qiladi.

### Yozuvlar qayerga saqlanadi?

| `DATABASE_URL` | Xatti-harakat |
| --- | --- |
| bor | Bot yozuvni **o'zi bazaga saqlaydi** — ilovani ochish shart emas |
| yo'q | Bot "📥 Ilovada Saqlash" tugmasini yuboradi, yozuv Mini App xotirasiga tushadi |

### Buyruqlar va xabar formatlari

| Yozasiz | Natija |
| --- | --- |
| `+150000 Emart smenasi` | Kirim |
| `-25000 Tushlik` | Xarajat |
| `120 ming zavodda ishladim` | Kirim, 120 000 |
| `bugun 85 000 so'm xarajat qildim` | Xarajat, 85 000 |
| `/stats` | Umumiy hisobot |
| `/help` | Yordam |

`-` belgisi yoki "xarajat", "chiqim" so'zlari chiqim sifatida, qolgani kirim
sifatida yoziladi.

### Ovozli xabar orqali kirim/chiqim

Mikrofon tugmasini bosib gapirsangiz bo'ldi:

1. Bot ovozni yuklab oladi va Whisper (`OPENAI_API_KEY`) orqali matnga aylantiradi;
2. matnni xuddi yozilgan xabar kabi tahlil qiladi;
3. summani va izohni ajratib, yozuvni saqlaydi.

Raqamlar so'z bilan aytilsa ham tushunadi — masalan
*"yuz yigirma ming zavodda ishladim"* → **120 000 kirim**,
*"bugun ellik ming so'm tushlikka xarajat qildim"* → **50 000 chiqim**.

`OPENAI_API_KEY` berilmagan bo'lsa, bot buni aytib, matn orqali yozishni
taklif qiladi.
