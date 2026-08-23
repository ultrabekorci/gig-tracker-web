"use client";

import React, { useState } from "react";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTelegram } from "./telegram-provider";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Trash2,
  CheckCircle,
  Search,
  Filter,
} from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export function TransactionList({ transactions, onRefresh }: TransactionListProps) {
  const { currency, hapticFeedback } = useTelegram();
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE" | "PENDING">("ALL");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = transactions.filter((tx) => {
    // Filter by type
    if (filterType === "INCOME" && (tx.type !== "INCOME" || tx.status !== "PAID")) return false;
    if (filterType === "EXPENSE" && tx.type !== "EXPENSE") return false;
    if (filterType === "PENDING" && tx.status !== "PENDING") return false;

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      const desc = (tx.description || "").toLowerCase();
      const client = (tx.client?.name || "").toLowerCase();
      const cat = (tx.category?.name || "").toLowerCase();
      return desc.includes(q) || client.includes(q) || cat.includes(q);
    }
    return true;
  });

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

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham bu tranzaksiyani o'chirmoqchimisiz?")) return;
    try {
      setDeletingId(id);
      hapticFeedback("warning");
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        hapticFeedback("success");
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-foreground">Tranzaksiyalar Tarixi</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Jami {filtered.length} ta yozuv topildi
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-border focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {[
          { key: "ALL", label: "Barchasi" },
          { key: "INCOME", label: "🟢 Kirimlar" },
          { key: "EXPENSE", label: "🔴 Chiqimlar" },
          { key: "PENDING", label: "⏳ Kutilayotgan" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilterType(tab.key as any);
              hapticFeedback("light");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filterType === tab.key
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-gray-50 dark:bg-gray-900 border-border text-gray-500 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            Tranzaksiyalar topilmadi
          </div>
        ) : (
          filtered.map((tx) => {
            const isIncome = tx.type === "INCOME";
            const isPending = tx.status === "PENDING";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-border transition-all"
              >
                {/* Left: Icon & Title */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isPending
                        ? "bg-amber-500/10 text-amber-500"
                        : isIncome
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {isPending ? (
                      <Clock className="w-4 h-4" />
                    ) : isIncome ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-foreground truncate">
                      {tx.description || (isIncome ? "Daromad" : "Xarajat")}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {tx.client && (
                        <span className="font-semibold text-indigo-500 dark:text-indigo-400">
                          {tx.client.name}
                        </span>
                      )}
                      {tx.category && (
                        <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {tx.category.name}
                        </span>
                      )}
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center space-x-2.5 sm:space-x-4 flex-shrink-0">
                  <div className="text-right">
                    <p
                      className={`font-black text-xs sm:text-sm ${
                        isPending
                          ? "text-amber-500"
                          : isIncome
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(tx.amount, currency)}
                    </p>
                    {isPending && (
                      <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        Kutilmoqda
                      </span>
                    )}
                  </div>

                  {/* Quick Action: Mark As Paid if pending */}
                  {isPending && (
                    <button
                      onClick={() => handleMarkAsPaid(tx.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                      title="To'landi deb belgilash"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deletingId === tx.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
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
