"use client";

import React, { useState } from "react";
import { DashboardStats } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useTelegram } from "./telegram-provider";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { BarChart3, PieChart as PieIcon, Layers } from "lucide-react";

export function AnalyticsCharts({ stats }: { stats: DashboardStats | null }) {
  const { currency } = useTelegram();
  const [chartTab, setChartTab] = useState<"trend" | "platforms" | "categories">("trend");

  if (!stats) {
    return (
      <div className="h-72 rounded-2xl bg-card/50 border border-border animate-pulse" />
    );
  }

  const hasTrendData = stats.monthlyTrend && stats.monthlyTrend.length > 0;
  const hasPlatformData = stats.platformBreakdown && stats.platformBreakdown.length > 0;
  const hasCategoryData = stats.categoryBreakdown && stats.categoryBreakdown.length > 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-foreground">Daromad va Xarajatlar Tahlili</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {chartTab === "trend" && "Oylik kirim, chiqim va sof foyda dinamikasi"}
            {chartTab === "platforms" && "Qaysi mijoz/platforma ko'proq daromad keltirdi"}
            {chartTab === "categories" && "Xarajatlarning kategoriyalar bo'yicha taqsimoti"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-border self-start sm:self-auto">
          <button
            onClick={() => setChartTab("trend")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartTab === "trend"
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Oylik Dinamika</span>
          </button>
          <button
            onClick={() => setChartTab("platforms")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartTab === "platforms"
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Platformalar</span>
          </button>
          <button
            onClick={() => setChartTab("categories")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartTab === "categories"
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Xarajatlar</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="pt-4 h-64 sm:h-72 w-full">
        {chartTab === "trend" && hasTrendData && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-foreground">{label}</p>
                        <p className="text-emerald-500">Kirim: {formatCurrency(payload[0]?.value as number, currency)}</p>
                        <p className="text-rose-500">Chiqim: {formatCurrency(payload[1]?.value as number, currency)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Kirim"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorIncome)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Chiqim"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartTab === "platforms" && (
          <div className="h-full flex flex-col sm:flex-row items-center justify-around gap-4">
            {hasPlatformData ? (
              <>
                <div className="w-48 h-48 sm:w-56 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.platformBreakdown}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {stats.platformBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || "#6366f1"} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-card border border-border p-2 rounded-xl shadow-xl text-xs">
                                <span className="font-bold text-foreground">{data.name}: </span>
                                <span className="text-indigo-500 font-semibold">{formatCurrency(data.amount, currency)} ({data.percentage}%)</span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list */}
                <div className="space-y-2 w-full max-w-xs">
                  {stats.platformBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-border">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || "#6366f1" }} />
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                      <span className="font-bold text-foreground">{formatCurrency(item.amount, currency)} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-500 flex items-center justify-center h-full">
                Hozircha daromad ma'lumotlari mavjud emas
              </div>
            )}
          </div>
        )}

        {chartTab === "categories" && (
          <div className="h-full">
            {hasCategoryData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border p-2 rounded-xl shadow-xl text-xs">
                            <span className="font-bold text-foreground">{label}: </span>
                            <span className="text-rose-500 font-semibold">{formatCurrency(payload[0].value as number, currency)}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-gray-500 flex items-center justify-center h-full">
                Hozircha xarajat toifalari kiritilmagan
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
