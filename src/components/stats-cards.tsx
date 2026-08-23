"use client";

import React from "react";
import { DashboardStats, Transaction } from "@/types";
import { formatCurrency, toDateKey } from "@/lib/utils";
import { useTelegram } from "./telegram-provider";
import { TrendingUp, ArrowDownRight, Clock, DollarSign, ShieldCheck } from "lucide-react";

function calculateStreak(txs: Transaction[]): number {
  if (!txs || txs.length === 0) return 0;
  
  const incomeDates = new Set(
    txs
      .filter(t => t.type === "INCOME" && t.status === "PAID")
      .map(t => toDateKey(t.date))
  );

  const cursor = new Date();
  if (!incomeDates.has(toDateKey(cursor))) {
    return 0;
  }

  let streak = 0;
  // Step back one calendar day at a time using local dates — subtracting 24h
  // from a UTC midnight skipped or repeated a day around DST changes.
  while (incomeDates.has(toDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function StatsCards({ stats, transactions = [] }: { stats: DashboardStats | null; transactions?: Transaction[] }) {
  const { currency } = useTelegram();

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-card/50 border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  const streak = calculateStreak(transactions);
  const todayStr = toDateKey(new Date());
  const todaysTxs = transactions.filter(
    (t) => t.type === "INCOME" && t.status === "PAID" && toDateKey(t.date) === todayStr
  );
  const todaysEarnings = todaysTxs.reduce((sum, t) => sum + t.amount, 0);
  const todaysHours = todaysTxs.reduce((sum, t) => sum + (t.totalHours || 0), 0);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Gross Income */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Jami Kirim (Brutto)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(stats.totalGrossIncome, currency)}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Komissiya: -{formatCurrency(stats.totalFees, currency)}
            </p>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Jami Chiqim</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {formatCurrency(stats.totalExpenses, currency)}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Xarajatlar & vositalar
            </p>
          </div>
        </div>

        {/* Net Take-Home Pay */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-card to-card border border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Sof Cho'ntak (Net)
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-300">
              {formatCurrency(stats.takeHomePay, currency)}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Soliq ({stats.estimatedTax > 0 ? formatCurrency(stats.estimatedTax, currency) : "0"}) chegirildi
            </p>
          </div>
        </div>

        {/* Pending Gigs / Invoices */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Kutilayotgan Pullar</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center relative">
              <Clock className="w-4 h-4" />
              {stats.pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {stats.pendingCount}
                </span>
              )}
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {formatCurrency(stats.pendingAmount, currency)}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {stats.pendingCount} ta buyurtma to'lovi kutilmoqda
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        {/* Work Streak Counter */}
        <div className="border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-600/80 dark:text-amber-400/80">🔥 Ketma-ket ish kunlari</span>
          <div className="mt-2">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-500">
              {streak} <span className="text-sm font-normal opacity-70">kun</span>
            </h3>
            <p className="text-[11px] text-amber-600/60 mt-1">
              {streak > 0 ? `${streak} kun ketma-ket ishladingiz!` : 'Bugun dam oldingiz'}
            </p>
          </div>
        </div>

        {/* Today's Earnings */}
        <div className="border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400/80">💰 Bugungi daromad</span>
          <div className="mt-2">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500">
              {todaysEarnings > 0 ? formatCurrency(todaysEarnings, currency) : '—'}
            </h3>
            <p className="text-[11px] text-emerald-600/60 mt-1">
              {todaysEarnings > 0 
                ? `${todaysHours > 0 ? `${todaysHours} soat ishladingiz` : 'Bugungi daromad'}`
                : 'Bugun hali ish kiritilmagan'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

