"use client";

import React from "react";
import { DashboardStats } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useTelegram } from "./telegram-provider";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Award,
  Calendar,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

export function AnalysisView({ stats }: { stats: DashboardStats | null }) {
  const { currency } = useTelegram();

  if (!stats) {
    return (
      <div className="h-80 rounded-3xl bg-card border border-border animate-pulse" />
    );
  }

  const yearlyTotal = stats.monthlyTrend.reduce((sum, m) => sum + m.income, 0);
  const yearlyMonthsCount = stats.monthlyTrend.filter((m) => m.income > 0).length || 1;
  const monthlyAverage = Math.round(yearlyTotal / yearlyMonthsCount);

  return (
    <div className="space-y-5">
      {/* Yearly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Total Yearly */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 block">Jami 12 Oylik Daromad (Last 12 Months)</span>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
              {formatCurrency(yearlyTotal, currency)}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Barcha ish joylari va platformalar bo'yicha
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-lg">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Average */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 block">Oylik O'rtacha Daromad (Monthly Avg)</span>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1">
              {formatCurrency(monthlyAverage, currency)}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              O'rtacha barqarorlik ko'rsatkichi
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 12 Months Bar Chart */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-foreground">12 Oylik Ish Haqi Grafigi</h3>
            <p className="text-xs text-gray-400">Oylar bo'yicha tushum dinamikasi</p>
          </div>

          {stats.prevMonthDiffPercentage !== 0 && (
            <div
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold ${
                stats.prevMonthDiffPercentage > 0
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {stats.prevMonthDiffPercentage > 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span>O'tgan oyga nisbatan: {stats.prevMonthDiffPercentage}%</span>
            </div>
          )}
        </div>

        {/* Chart Canvas */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-foreground">{label}</p>
                        <p className="text-indigo-500 font-bold">
                          Daromad: {formatCurrency(payload[0]?.value as number, currency)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="income" radius={[6, 6, 0, 0]}>
                {stats.monthlyTrend.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === stats.monthlyTrend.length - 1 ? "#f97316" : "#6366f1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workplace Rankings (Leaderboard 🥇 🥈 🥉) */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-foreground">Eng Ko'p Daromad Keltirgan Ish Joylari (Leaderboard)</h3>
          <p className="text-xs text-gray-400">Ish joylarining umumiy daromaddagi ulushi</p>
        </div>

        <div className="space-y-3">
          {stats.workplaceRankings.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              Hozircha reyting mavjud emas
            </div>
          ) : (
            stats.workplaceRankings.map((wp, idx) => {
              const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-border hover:border-indigo-500/40 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl sm:text-2xl flex-shrink-0">{medal}</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-foreground">{wp.name}</h4>
                      <p className="text-[11px] text-gray-400">
                        {wp.shiftCount} ta smena • {wp.totalHours} soat
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-xs sm:text-sm text-foreground block">
                      {formatCurrency(wp.totalAmount, currency)}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-500">{wp.percentage}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
