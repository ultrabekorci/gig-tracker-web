"use client";

import React from "react";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTelegram } from "./telegram-provider";
import { Clock, CheckCircle2, AlertCircle, Building2, Calendar } from "lucide-react";

export function InvoicesView({
  transactions,
  onRefresh,
}: {
  transactions: Transaction[];
  onRefresh: () => void;
}) {
  const { currency, hapticFeedback } = useTelegram();

  const pendingList = transactions.filter((t) => t.status === "PENDING" && t.type === "INCOME");
  const totalPending = pendingList.reduce((acc, curr) => acc + curr.amount, 0);

  const handleMarkAsPaid = async (id: string) => {
    try {
      hapticFeedback("medium");
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      if (res.ok) {
        hapticFeedback("success");
        onRefresh();
      }
    } catch (e) {
      console.error(e);
      hapticFeedback("error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Kutilayotgan To'lovlar (Invoices)</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Bajarilgan ishlar va mijozlardan kutilayotgan pul mablag'lari
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs font-semibold text-gray-400">Jami kutilayotgan summa:</span>
          <p className="text-2xl font-black text-amber-500">{formatCurrency(totalPending, currency)}</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {pendingList.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-card border border-border rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-bold text-sm text-foreground">Barcha to'lovlar qabul qilingan!</p>
            <p className="text-xs text-gray-400 mt-0.5">Hozirda kutilayotgan to'lovlar mavjud emas</p>
          </div>
        ) : (
          pendingList.map((item) => {
            const isOverdue = item.dueDate && new Date(item.dueDate) < new Date();

            return (
              <div
                key={item.id}
                className="bg-card border border-border hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span className="font-bold text-xs sm:text-sm text-foreground">
                        {item.client?.name || "Shaxsiy Mijoz"}
                      </span>
                    </div>
                    <span className="font-black text-sm text-amber-500">
                      +{formatCurrency(item.amount, currency)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 font-medium">
                    {item.description || "Buyurtma uchun to'lov"}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-[11px] text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Muddati: {item.dueDate ? formatDate(item.dueDate) : formatDate(item.date)}</span>
                    {isOverdue && (
                      <span className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5 ml-1">
                        <AlertCircle className="w-3 h-3" /> Muddati o'tgan
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMarkAsPaid(item.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>To'landi deb belgilash</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
