"use client";

import React, { useState } from "react";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useTelegram } from "./telegram-provider";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react";

interface CalendarViewProps {
  transactions: Transaction[];
  onSelectDate: (date: Date) => void;
  onRefresh: () => void;
}

export function CalendarView({ transactions, onSelectDate, onRefresh }: CalendarViewProps) {
  const { currency, hapticFeedback } = useTelegram();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workView, setWorkView] = useState<"WORKPLACE" | "TIME" | "CLOCK_IN">("WORKPLACE");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    hapticFeedback("light");
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    hapticFeedback("light");
  };

  // Calendar math
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Filter transactions for current displayed month
  const monthTransactions = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getFullYear() === year && d.getMonth() === month && tx.type === "INCOME" && tx.status === "PAID";
  });

  const totalMonthlyIncome = monthTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalMonthlyHours = monthTransactions.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
  const workedDaysCount = new Set(monthTransactions.map((tx) => new Date(tx.date).getDate())).size;

  // Day cells builder
  const days: { dayNumber: number; isCurrentMonth: boolean; date: Date }[] = [];

  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    days.push({
      dayNumber: d,
      isCurrentMonth: false,
      date: new Date(year, month - 1, d),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      dayNumber: d,
      isCurrentMonth: true,
      date: new Date(year, month, d),
    });
  }

  // Next month padding (total cells to 35 or 42)
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    days.push({
      dayNumber: d,
      isCurrentMonth: false,
      date: new Date(year, month + 1, d),
    });
  }

  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const weekDayNames = [
    { label: "Mon", full: "Dush" },
    { label: "Tue", full: "Sesh" },
    { label: "Wed", full: "Chor" },
    { label: "Thu", full: "Pay" },
    { label: "Fri", full: "Jum" },
    { label: "Sat", full: "Shan", color: "text-blue-500" },
    { label: "Sun", full: "Yak", color: "text-rose-500" },
  ];

  return (
    <div className="bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
      {/* Month Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        {/* Month Selector */}
        <div className="flex items-center space-x-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
              {month + 1}/{year}
            </h2>
            <p className="text-[11px] text-gray-400">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Monthly Earnings & Hours Badge */}
        <div className="flex items-center justify-between sm:justify-end space-x-3">
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-gray-400 block">Jami Oylik Daromad:</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {formatCurrency(totalMonthlyIncome, currency)}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold text-center">
            <span>{workedDaysCount} kun</span>
            <span className="block text-[10px] text-gray-400 font-normal">{Math.round(totalMonthlyHours)} soat</span>
          </div>
        </div>
      </div>

      {/* Work View Mode Selector */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400">Ko'rinish rejimi:</span>
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-border">
          <button
            onClick={() => {
              setWorkView("WORKPLACE");
              hapticFeedback("light");
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              workView === "WORKPLACE"
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Ish joyi</span>
          </button>
          <button
            onClick={() => {
              setWorkView("TIME");
              hapticFeedback("light");
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              workView === "TIME"
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Soat</span>
          </button>
          <button
            onClick={() => {
              setWorkView("CLOCK_IN");
              hapticFeedback("light");
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              workView === "CLOCK_IN"
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Vaqt</span>
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs">
        {weekDayNames.map((w, idx) => (
          <div key={idx} className={`py-1.5 ${w.color || "text-gray-500 dark:text-gray-400"}`}>
            <span>{w.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((item, index) => {
          const isSat = index % 7 === 5;
          const isSun = index % 7 === 6;

          // Find transactions on this day
          const dayTxs = transactions.filter((t) => {
            const td = new Date(t.date);
            return (
              td.getFullYear() === item.date.getFullYear() &&
              td.getMonth() === item.date.getMonth() &&
              td.getDate() === item.date.getDate() &&
              t.type === "INCOME" &&
              t.status === "PAID"
            );
          });

          const dayTotal = dayTxs.reduce((sum, t) => sum + t.amount, 0);
          const firstTx = dayTxs[0];

          return (
            <div
              key={index}
              onClick={() => {
                hapticFeedback("medium");
                onSelectDate(item.date);
              }}
              className={`min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${
                item.isCurrentMonth
                  ? "bg-gray-50/80 dark:bg-gray-900/50 border-border hover:border-indigo-500/50"
                  : "bg-transparent border-transparent opacity-30 cursor-default"
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isToday(item.date)
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : isSun
                      ? "text-rose-500"
                      : isSat
                      ? "text-blue-500"
                      : "text-foreground"
                  }`}
                >
                  {item.dayNumber}
                </span>

                {dayTxs.length > 1 && (
                  <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-500 px-1 rounded-full">
                    {dayTxs.length}
                  </span>
                )}
              </div>

              {/* Middle: Shift Tag / Hours Badge */}
              {firstTx && item.isCurrentMonth && (
                <div className="my-1">
                  {workView === "WORKPLACE" && (
                    <span
                      className="block truncate text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-lg text-white text-center shadow-xs"
                      style={{ backgroundColor: firstTx.client?.color || firstTx.color || "#6366f1" }}
                    >
                      {firstTx.client?.name || "Smena"}
                    </span>
                  )}
                  {workView === "TIME" && (
                    <span className="block text-[10px] sm:text-[11px] font-semibold bg-gray-200 dark:bg-gray-800 text-foreground px-1 py-0.5 rounded text-center">
                      {firstTx.totalHours ? `${firstTx.totalHours} soat` : "8 soat"}
                    </span>
                  )}
                  {workView === "CLOCK_IN" && (
                    <span className="block text-[9px] font-mono bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-0.5 py-0.5 rounded text-center truncate">
                      {firstTx.startTime || "09:00"}-{firstTx.endTime || "18:00"}
                    </span>
                  )}
                </div>
              )}

              {/* Bottom: Calculated Daily Amount */}
              {dayTotal > 0 && item.isCurrentMonth ? (
                <div className="text-right">
                  <span className="font-extrabold text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 block truncate">
                    {formatCurrency(dayTotal, currency)}
                  </span>
                </div>
              ) : (
                <div />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
