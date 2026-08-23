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
  Edit2,
  CheckCircle,
  Search,
  Filter,
  X,
  Save,
} from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export function TransactionList({
  transactions,
  onRefresh,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionListProps) {
  const { currency, hapticFeedback } = useTelegram();
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE" | "PENDING">("ALL");
  const [search, setSearch] = useState("");

  // Quick Inline Edit State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editStatus, setEditStatus] = useState<"PAID" | "PENDING">("PAID");

  const filtered = transactions.filter((tx) => {
    if (filterType === "INCOME" && (tx.type !== "INCOME" || tx.status !== "PAID")) return false;
    if (filterType === "EXPENSE" && tx.type !== "EXPENSE") return false;
    if (filterType === "PENDING" && tx.status !== "PENDING") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const desc = (tx.description || "").toLowerCase();
      const client = (tx.client?.name || "").toLowerCase();
      const cat = (tx.category?.name || "").toLowerCase();
      return desc.includes(q) || client.includes(q) || cat.includes(q);
    }
    return true;
  });

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmount(tx.amount.toString());
    setEditDesc(tx.description || "");
    setEditHours((tx.totalHours || 8).toString());
    setEditStatus(tx.status);
    hapticFeedback("light");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const updated: Transaction = {
      ...editingTx,
      amount: parseFloat(editAmount) || editingTx.amount,
      description: editDesc.trim() || editingTx.description,
      totalHours: parseFloat(editHours) || editingTx.totalHours,
      status: editStatus,
    };

    if (onEditTransaction) {
      onEditTransaction(updated);
    }
    hapticFeedback("success");
    setEditingTx(null);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Ushbu yozuvni o'chirmoqchimisiz?")) return;
    hapticFeedback("warning");
    if (onDeleteTransaction) {
      onDeleteTransaction(id);
    }
    onRefresh();
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-4 sm:p-5 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-foreground">Tranzaksiyalar Tarixi</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Jami {filtered.length} ta smena va tranzaksiya
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
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-border focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground font-semibold"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {[
          { key: "ALL", label: "Barchasi" },
          { key: "INCOME", label: "🟢 Smenalar & Daromad" },
          { key: "EXPENSE", label: "🔴 Xarajatlar" },
          { key: "PENDING", label: "⏳ Kutilayotgan" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilterType(tab.key as any);
              hapticFeedback("light");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
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
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-border transition-all"
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
                      {tx.description || (isIncome ? "Smena / Daromad" : "Xarajat")}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                      {tx.totalHours && <span>{tx.totalHours} soat</span>}
                      {tx.startTime && <span>({tx.startTime}–{tx.endTime})</span>}
                      <span>• {formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions (Edit / Delete) */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  <div className="text-right mr-1">
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
                      <span className="text-[9px] uppercase font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        Kutilmoqda
                      </span>
                    )}
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(tx)}
                    className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-indigo-500" />
                <span>Smena / Tranzaksiyani Tahrirlash</span>
              </h4>
              <button
                onClick={() => setEditingTx(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400">Summa ({currency})</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-base font-black rounded-xl bg-gray-50 dark:bg-gray-900 border border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400">Izoh / Nomi</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-gray-900 border border-border text-foreground"
                />
              </div>

              {editingTx.type === "INCOME" && (
                <div>
                  <label className="text-xs font-bold text-gray-400">Ishlangan Soat</label>
                  <input
                    type="number"
                    value={editHours}
                    onChange={(e) => setEditHours(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-gray-900 border border-border text-foreground"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-400">Holat</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 text-xs font-bold rounded-xl bg-gray-50 dark:bg-gray-900 border border-border text-foreground"
                >
                  <option value="PAID">✅ To'langan (Hisoblangan)</option>
                  <option value="PENDING">⏳ Kutilayotgan (Pending)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-indigo-600/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
