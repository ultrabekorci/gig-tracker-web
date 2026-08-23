"use client";

import React from "react";
import { useTelegram } from "./telegram-provider";
import { User, Sun, Moon, Settings, Receipt } from "lucide-react";

interface DashboardHeaderProps {
  onOpenSettings?: () => void;
  onOpenHistory?: () => void;
}

export function DashboardHeader({ onOpenSettings, onOpenHistory }: DashboardHeaderProps) {
  const { isTelegram, user, theme, toggleTheme, hapticFeedback } = useTelegram();

  const displayName = user ? user.first_name : "Sardor";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-3.5 py-2.5 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Circular Avatar & Profile info */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20 flex-shrink-0 ring-2 ring-indigo-500/30">
            {user ? userInitial : <User className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-bold text-sm sm:text-base tracking-tight text-foreground">{displayName}</h1>
              {isTelegram ? (
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Telegram
                </span>
              ) : (
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Pro
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Gig & Shift Tracker
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls (Tarix, Sozlamalar, Mavzu) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Tarix (History) button */}
          {onOpenHistory && (
            <button
              onClick={() => {
                hapticFeedback("light");
                onOpenHistory();
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground font-bold text-xs transition-colors border border-border"
              title="Tranzaksiyalar Tarixi"
            >
              <Receipt className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Tarix</span>
            </button>
          )}

          {/* Sozlamalar (Settings) button */}
          {onOpenSettings && (
            <button
              onClick={() => {
                hapticFeedback("light");
                onOpenSettings();
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground font-bold text-xs transition-colors border border-border"
              title="Sozlamalar"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Sozlamalar</span>
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors border border-border"
            title="Mavzuni almashtirish"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
