"use client";

import React from "react";
import { DashboardStats } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useTelegram } from "./telegram-provider";
import { TrendingUp, ArrowDownRight, Clock, DollarSign, ShieldCheck } from "lucide-react";

export function StatsCards({ stats }: { stats: DashboardStats | null }) {
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

  return (
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
  );
}
