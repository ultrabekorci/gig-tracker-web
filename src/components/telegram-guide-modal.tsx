"use client";

import React from "react";
import { X, Send, Terminal, CheckCircle2, Smartphone } from "lucide-react";
import { useTelegram } from "./telegram-provider";

export function TelegramGuideModal({ onClose }: { onClose: () => void }) {
  const { hapticFeedback } = useTelegram();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500 text-white">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Telegram Bot & Mini App Integratsiyasi</h3>
              <p className="text-xs text-muted-foreground text-gray-500">Ilovani Telegram bilan bog'lash qo'llanmasi</p>
            </div>
          </div>
          <button
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-sm text-gray-700 dark:text-gray-300">
          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-border">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <div>
                <p className="font-semibold text-foreground">Telegram Bot yaratish</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Telegram'da <b className="text-blue-500">@BotFather</b> ga kiring va <code>/newbot</code> buyrug'i bilan yangi bot yarating va Bot Token'ini oling.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-border">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <div className="w-full">
                <p className="font-semibold text-foreground">Tokenni .env fayliga kiritish</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Loyiha ildizidagi <code>.env</code> faylida bot tokeningizni saqlang:
                </p>
                <div className="mt-2 p-2 rounded-lg bg-black text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  TELEGRAM_BOT_TOKEN="123456789:ABCdefGhIJKlmNoPQRstu"
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-border">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <div>
                <p className="font-semibold text-foreground">Botni ishga tushirish</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Terminalda quyidagi buyruqni bering:
                </p>
                <div className="mt-2 p-2 rounded-lg bg-black text-emerald-400 font-mono text-[11px]">
                  npm run bot
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-border">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 font-bold text-xs flex items-center justify-center">
                <Smartphone className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Telegram Mini App sifatida ulash</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  @BotFather'da <code>/newapp</code> buyrug'i orqali veb-ilovangiz manzilini kiriting. Shunda foydalanuvchilar to'g'ridan-to'g'ri Telegram ichida ushbu ilovani to'liq ekranda ishlata oladilar!
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50">
            <h4 className="font-bold text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Bot orqali tezkor yozish namunalari:
            </h4>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-white dark:bg-gray-900 border border-border">
                <span className="text-emerald-500 font-bold">+500</span> Upwork UI Dizayn
              </div>
              <div className="p-2 rounded bg-white dark:bg-gray-900 border border-border">
                <span className="text-rose-500 font-bold">-25</span> Yoqilg'i benzin
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-gray-50 dark:bg-gray-900/40 flex justify-end">
          <button
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Tushunarli
          </button>
        </div>
      </div>
    </div>
  );
}
