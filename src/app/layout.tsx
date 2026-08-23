import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { TelegramProvider } from "@/components/telegram-provider";

export const metadata: Metadata = {
  title: "Gig Tracker — Frilanser & Gig Ishchilar uchun Moliya Ilovasi",
  description: "Kirim, chiqim, kutilayotgan to'lovlar va daromad tahlili boshqaruvi",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="dark">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased transition-colors duration-200">
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  );
}
