"use client";

import React, { useState } from "react";
import { Transaction, Client } from "@/types";
import { formatCurrency, toDateKey } from "@/lib/utils";
import { useTelegram } from "./telegram-provider";
import {
  Briefcase,
  Calendar,
  Sparkles,
  Trash2,
  Edit2,
  X,
  Save,
} from "lucide-react";

interface SalaryMonthlyViewProps {
  transactions: Transaction[];
  clients: Client[];
  onRefresh: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export function SalaryMonthlyView({
  transactions,
  clients,
  onRefresh,
  onEditTransaction,
  onDeleteTransaction,
}: SalaryMonthlyViewProps) {
  const { currency, hapticFeedback } = useTelegram();
  const [activeTab, setActiveTab] = useState<"WORKPLACE" | "WORK_RECORD">("WORKPLACE");

  // Edit State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Only consider paid income shifts
  const shiftList = transactions
    .filter((t) => t.type === "INCOME" && t.status === "PAID")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalActualPayment = shiftList.reduce((sum, t) => sum + t.amount, 0);
  const totalHours = shiftList.reduce((sum, t) => sum + (t.totalHours || 0), 0);
  const totalDays = new Set(shiftList.map((t) => toDateKey(t.date))).size;

  // Workplace Aggregations
  const workplaceSummaryMap = new Map<
    string,
    {
      clientName: string;
      amount: number;
      hours: number;
      shifts: number;
      color: string;
    }
  >();

  shiftList.forEach((t) => {
    const clientName = t.client?.name || (t.clientId === "client-yekaterina" ? "Yekaterina" : t.clientId === "client-emart" ? "Emart" : t.clientId === "client-xasanboy" ? "Xasanboy aka" : "Boshqa");
    const existing = workplaceSummaryMap.get(clientName) || {
      clientName,
      amount: 0,
      hours: 0,
      shifts: 0,
      color: t.client?.color || t.color || "#6366f1",
    };
    existing.amount += t.amount;
    existing.hours += t.totalHours || 0;
    existing.shifts += 1;
    workplaceSummaryMap.set(clientName, existing);
  });

  const workplaceList = Array.from(workplaceSummaryMap.entries()).map(([name, data]) => ({
    name,
    ...data,
    percentage: totalActualPayment > 0 ? Math.round((data.amount / totalActualPayment) * 100) : 0,
  }));

  const handleDelete = (id: string) => {
    if (!confirm("Ushbu smena yozuvini o'chirmoqchimisiz?")) return;
    hapticFeedback("warning");
    if (onDeleteTransaction) {
      onDeleteTransaction(id);
    }
    onRefresh();
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmount(tx.amount.toString());
    setEditHours((tx.totalHours || 8).toString());
    setEditDesc(tx.description || "");
    hapticFeedback("light");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const updated: Transaction = {
      ...editingTx,
      amount: parseFloat(editAmount) || editingTx.amount,
      totalHours: parseFloat(editHours) || editingTx.totalHours,
      description: editDesc.trim() || editingTx.description,
    };

    if (onEditTransaction) {
      onEditTransaction(updated);
    }
    hapticFeedback("success");
    setEditingTx(null);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Top Statement Card */}
      <div className="bg-gradient-to-br from-card via-card to-indigo-500/10 border border-border rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Jami Hisoblangan Ish Haqi (Actual Payment)</span>
          <div className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-500 text-xs font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{totalDays} kun, {Math.round(totalHours)} soat</span>
          </div>
        </div>

        <div className="mt-2">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
            {formatCurrency(totalActualPayment, currency)}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Barcha smenalar va ish joylari bo'yicha jami hisob
          </p>
        </div>
      </div>

      {/* Tabs: Workplace vs Work Record */}
      <div className="bg-card border border-border rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 border border-border">
          <button
            onClick={() => {
              setActiveTab("WORKPLACE");
              hapticFeedback("light");
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === "WORKPLACE"
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Ish Joylari (Workplace)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("WORK_RECORD");
              hapticFeedback("light");
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === "WORK_RECORD"
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Smenalar Tarixi (Work Record)</span>
          </button>
        </div>

        {/* 1. WORKPLACE TAB */}
        {activeTab === "WORKPLACE" && (
          <div className="space-y-3">
            {workplaceList.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                Hozircha smena ma'lumotlari mavjud emas
              </div>
            ) : (
              workplaceList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-border hover:border-indigo-500/40 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      ●
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                      <p className="text-xs text-gray-400">
                        {item.shifts} ta smena • {Math.round(item.hours)} soat
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-sm sm:text-base text-foreground block">
                      {formatCurrency(item.amount, currency)}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-500">
                      {item.percentage}% ulush
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. WORK RECORD TAB */}
        {activeTab === "WORK_RECORD" && (
          <div className="space-y-2.5">
            {shiftList.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                Smenalar yozuvi topilmadi
              </div>
            ) : (
              shiftList.map((tx) => {
                const txDate = new Date(tx.date);
                const dayName = txDate.toLocaleDateString("en-US", { weekday: "short" });
                const monthDay = txDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-border transition-all"
                  >
                    {/* Left: Date & Workplace */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 text-center flex-shrink-0">
                        <span className="text-xs font-black text-foreground block">{monthDay}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{dayName}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tx.client?.color || tx.color || "#6366f1" }}
                          />
                          <p className="font-bold text-xs sm:text-sm text-foreground truncate">
                            {tx.client?.name || tx.description || "Smena"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-gray-400 mt-0.5 font-mono">
                          <span>{tx.startTime || "08:00"}–{tx.endTime || "18:00"}</span>
                          {tx.totalHours && <span>({tx.totalHours} soat)</span>}
                          {tx.isNightShift && <span className="text-blue-500 font-sans font-bold text-[9px] bg-blue-500/10 px-1 rounded">Tungi</span>}
                          {tx.isOvertime && <span className="text-amber-500 font-sans font-bold text-[9px] bg-amber-500/10 px-1 rounded">Overtime</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Actions (Edit & Delete) */}
                    <div className="flex items-center space-x-2.5 flex-shrink-0">
                      <div className="text-right mr-1">
                        <span className="font-black text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 block">
                          +{formatCurrency(tx.amount, currency)}
                        </span>
                        <span className="text-[10px] text-gray-400">{tx.totalHours || 8} soat</span>
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1.5 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
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
        )}
      </div>

      {/* Edit Shift Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-indigo-500" />
                <span>Smena Yozuvini Tahrirlash</span>
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
                <label className="text-xs font-bold text-gray-400">Kunlik Ish Haqi ({currency})</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-base font-black rounded-xl bg-gray-50 dark:bg-gray-900 border border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400">Ishlangan Soat</label>
                <input
                  type="number"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-gray-900 border border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400">Izoh (Memo)</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-gray-900 border border-border text-foreground"
                />
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
