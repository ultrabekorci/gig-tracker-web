"use client";

import React, { useState } from "react";
import { Client, Transaction } from "@/types";
import { formatCurrency, toDateKey, parseDateKey } from "@/lib/utils";
import { useTelegram } from "./telegram-provider";
import { X, Plus, Edit2, Trash2, Clock, CheckCircle } from "lucide-react";

interface DaySummaryModalProps {
  date: Date;
  transactions: Transaction[];
  clients?: Client[];
  onClose: () => void;
  onAddNew: () => void;
  onEdit: (txData: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
}

export function DaySummaryModal({
  date,
  transactions,
  clients = [],
  onClose,
  onAddNew,
  onEdit,
  onDelete,
}: DaySummaryModalProps) {
  const { currency, hapticFeedback } = useTelegram();
  const dateStr = date.toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });

  // Quick edit state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editClientId, setEditClientId] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStatus, setEditStatus] = useState<"PAID" | "PENDING">("PAID");

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmount(tx.amount.toString());
    setEditDesc(tx.description || "");
    setEditClientId(tx.clientId || "");
    setEditHours(tx.totalHours ? tx.totalHours.toString() : "");
    setEditDate(toDateKey(tx.date));
    setEditStatus(tx.status);
    hapticFeedback("light");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const client = clients.find((c) => c.id === editClientId);

    onEdit({
      id: editingTx.id,
      amount: parseFloat(editAmount) || editingTx.amount,
      description: editDesc,
      clientId: editClientId || null,
      color: client?.color || editingTx.color,
      totalHours: editHours ? parseFloat(editHours) : editingTx.totalHours,
      date: editDate ? parseDateKey(editDate).toISOString() : editingTx.date,
      status: editStatus,
    });
    setEditingTx(null);
    hapticFeedback("success");
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu ma'lumotni o'chirmoqchimisiz?")) {
      onDelete(id);
      hapticFeedback("warning");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:w-[500px] bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-lg font-black text-foreground">{dateStr}</h2>
            <p className="text-xs text-gray-500">Kiritilgan smena va xarajatlar</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Bu kunda hech qanday ma'lumot yo'q.</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 rounded-2xl border border-border bg-gray-50/50 dark:bg-gray-900/50">
                {editingTx?.id === tx.id ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Summa ({currency})</label>
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Ish joyi</label>
                      <select
                        value={editClientId}
                        onChange={(e) => setEditClientId(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-semibold"
                      >
                        <option value="">— Tanlanmagan —</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Sana</label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Ishlangan soat</label>
                        <input
                          type="number"
                          step="0.5"
                          value={editHours}
                          onChange={(e) => setEditHours(e.target.value)}
                          placeholder="8"
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Holat</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as "PAID" | "PENDING")}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm font-semibold"
                      >
                        <option value="PAID">✅ To'langan</option>
                        <option value="PENDING">⏳ Kutilayotgan</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Izoh (ixtiyoriy)</label>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm"
                      />
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                      >
                        Saqlash
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTx(null)}
                        className="flex-1 py-2 bg-gray-200 dark:bg-gray-800 text-foreground text-xs font-bold rounded-xl"
                      >
                        Bekor qilish
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount, currency)}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {tx.client?.name || tx.description || (tx.type === "INCOME" ? "Daromad" : "Xarajat")}
                      </p>
                      {tx.client?.name && tx.description && tx.description !== tx.client.name && (
                        <p className="text-[11px] text-gray-400 mt-0.5">{tx.description}</p>
                      )}
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          tx.type === "INCOME" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                        }`}>
                          {tx.type === "INCOME" ? "Kirim" : "Chiqim"}
                        </span>
                        {tx.status === "PENDING" ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-amber-500/10 text-amber-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> Kutilmoqda
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-blue-500/10 text-blue-600 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" /> To'landi
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 hover:text-indigo-500"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={() => {
              onClose();
              onAddNew();
            }}
            className="w-full flex items-center justify-center py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yangi Qo'shish
          </button>
        </div>
      </div>
    </div>
  );
}
