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

1. Bot ovozni yuklab oladi va **Google Cloud Speech-to-Text** orqali matnga
   aylantiradi (`uz-UZ` tili qo'llab-quvvatlanadi);
2. matnni xuddi yozilgan xabar kabi tahlil qiladi;
3. summani va izohni ajratib, yozuvni saqlaydi.

Raqamlar so'z bilan aytilsa ham tushunadi — masalan
*"yuz yigirma ming zavodda ishladim"* → **120 000 kirim**,
*"bugun ellik ming so'm tushlikka xarajat qildim"* → **50 000 chiqim**.

Ovozli xabar 60 soniyagacha bo'lishi kerak (Google'ning sinxron `recognize`
chegarasi). Hech qanday kalit berilmagan bo'lsa, bot buni aytib, matn orqali
yozishni taklif qiladi.

#### Google Speech-to-Text'ni ulash

1. Google Cloud loyihasida **Cloud Speech-to-Text API**'ni yoqing;
2. quyidagilardan birini `.env` ga qo'ying:

   | Usul | O'zgaruvchi |
   | --- | --- |
   | API kaliti | `GOOGLE_SPEECH_API_KEY` |
   | Service account | `GOOGLE_SERVICE_ACCOUNT_JSON` (JSON yoki uning base64 nusxasi) |
   | Service account (alohida) | `GOOGLE_CLIENT_EMAIL` + `GOOGLE_PRIVATE_KEY` |

   Service account berilsa, bot OAuth2 tokenini o'zi oladi va keshlaydi —
   qo'shimcha kutubxona kerak emas.

3. ixtiyoriy sozlamalar: `GOOGLE_SPEECH_LANGUAGE` (standart `uz-UZ`),
   `GOOGLE_SPEECH_ALT_LANGUAGES` (masalan `ru-RU,en-US`),
   `GOOGLE_SPEECH_MODEL`.

`OPENAI_API_KEY` faqat zaxira sifatida qoldirilgan: Google sozlanmagan bo'lsa,
bot Whisper'ga o'tadi. Joriy holatni
`GET /api/telegram/webhook` javobidagi `speechToText` maydonida ko'rish mumkin.
