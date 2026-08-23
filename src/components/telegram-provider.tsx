"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramContextType {
  isTelegram: boolean;
  user: TelegramUser | null;
  currency: string;
  setCurrency: (c: string) => void;
  hapticFeedback: (type?: "light" | "medium" | "heavy" | "success" | "warning" | "error") => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const TelegramContext = createContext<TelegramContextType>({
  isTelegram: false,
  user: null,
  currency: "USD",
  setCurrency: () => {},
  hapticFeedback: () => {},
  theme: "dark",
  toggleTheme: () => {},
});

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Check saved theme and currency
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }

    const savedCurrency = localStorage.getItem("currency");
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }

    // Check Telegram WebApp
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();

      if (tg.initDataUnsafe?.user) {
        setIsTelegram(true);
        setUser(tg.initDataUnsafe.user);
      }

      if (tg.colorScheme) {
        setTheme(tg.colorScheme === "dark" ? "dark" : "light");
        document.documentElement.classList.toggle("dark", tg.colorScheme === "dark");
      }
    }
  }, []);

  const updateCurrency = (c: string) => {
    setCurrency(c);
    localStorage.setItem("currency", c);
    hapticFeedback("light");
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    hapticFeedback("light");
  };

  const hapticFeedback = (type: "light" | "medium" | "heavy" | "success" | "warning" | "error" = "light") => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.HapticFeedback) {
      const haptic = (window as any).Telegram.WebApp.HapticFeedback;
      if (["light", "medium", "heavy"].includes(type)) {
        haptic.impactOccurred(type);
      } else {
        haptic.notificationOccurred(type);
      }
    }
  };

  return (
    <TelegramContext.Provider
      value={{
        isTelegram,
        user,
        currency,
        setCurrency: updateCurrency,
        hapticFeedback,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);
