"use client";

import React, { useState } from "react";
import { useTelegram } from "./telegram-provider";
import { Wallet, Sun, Moon, Send, ChevronDown, Check } from "lucide-react";
import { TelegramGuideModal } from "./telegram-guide-modal";

export function DashboardHeader() {
  const { isTelegram, user, currency, setCurrency, theme, toggleTheme, hapticFeedback } = useTelegram();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const currencies = [
    { code: "KRW", symbol: "₩", label: "KRW (₩ Koreya Voni)" },
    { code: "UZS", symbol: "so'm", label: "UZS (so'm)" },
    { code: "USD", symbol: "$", label: "USD ($ Dollar)" },
    { code: "EUR", symbol: "€", label: "EUR (€ Evro)" },
    { code: "RUB", symbol: "₽", label: "RUB (₽ Rubl)" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & User info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight">Gig Tracker</h1>
                {isTelegram ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Telegram App
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Web App
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-gray-500 dark:text-gray-400">
                {user ? `Xush kelibsiz, ${user.first_name}` : "Frilanser & Gig Moliya Boshqaruvi"}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Telegram Bot connection button */}
            <button
              onClick={() => {
                hapticFeedback("light");
                setGuideOpen(true);
              }}
              className="flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
              title="Telegram Bot bilan bog'lash"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bot bilan ulash</span>
            </button>

            {/* Currency selector dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  hapticFeedback("light");
                  setCurrencyOpen(!currencyOpen);
                }}
                className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-border"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {currencyOpen && (
                <div className="absolute right-0 mt-1 w-32 rounded-xl bg-card border border-border shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrency(c.code);
                        setCurrencyOpen(false);
                        hapticFeedback("light");
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className={currency === c.code ? "font-bold text-indigo-500" : ""}>
                        {c.label}
                      </span>
                      {currency === c.code && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
              title="Mavzuni almashtirish"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Guide Modal */}
      {guideOpen && <TelegramGuideModal onClose={() => setGuideOpen(false)} />}
    </>
  );
}
