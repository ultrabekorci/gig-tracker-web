"use client";

import React, { useState } from "react";
import { Category, Client } from "@/types";
import { useTelegram } from "./telegram-provider";
import { X, PlusCircle, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from "lucide-react";

interface QuickEntryModalProps {
  categories: Category[];
  clients: Client[];
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickEntryModal({
  categories,
  clients,
  onClose,
  onSuccess,
}: QuickEntryModalProps) {
  const { currency, hapticFeedback } = useTelegram();
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"PAID" | "PENDING">("PAID");
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [fee, setFee] = useState("0");
  const [dueDate, setDueDate] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredCategories = categories.filter((c) => c.type === type);

  // Auto calculate fee when client changes
  const handleClientChange = (selectedId: string) => {
    setClientId(selectedId);
    const client = clients.find((c) => c.id === selectedId);
    if (client && client.defaultFeeRate > 0 && amount) {
      const calculatedFee = (parseFloat(amount) * client.defaultFeeRate) / 100;
      setFee(calculatedFee.toString());
    }
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const client = clients.find((c) => c.id === clientId);
    if (client && client.defaultFeeRate > 0 && val) {
      const calculatedFee = (parseFloat(val) * client.defaultFeeRate) / 100;
      setFee(calculatedFee.toString());
    }
  };

  const addPresetAmount = (preset: number) => {
    const current = parseFloat(amount) || 0;
    const nextVal = (current + preset).toString();
    handleAmountChange(nextVal);
    hapticFeedback("light");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError("Iltimos, to'g'ri summa kiriting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          currency,
          description: description || (type === "INCOME" ? "Daromad" : "Xarajat"),
          date,
          status: type === "EXPENSE" ? "PAID" : status,
          dueDate: status === "PENDING" ? dueDate : null,
          fee: parseFloat(fee) || 0,
          clientId: type === "INCOME" ? clientId || null : null,
          categoryId: categoryId || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Tranzaksiyani saqlashda xatolik yuz berdi");
      }

      hapticFeedback("success");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
      hapticFeedback("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-base text-foreground">Tranzaksiya Qo'shish</h3>
          <button
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle Tabs */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 border border-border">
            <button
              type="button"
              onClick={() => {
                setType("INCOME");
                hapticFeedback("light");
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                type === "INCOME"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "text-gray-500 hover:text-foreground"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>💰 Kirim (Daromad)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType("EXPENSE");
                hapticFeedback("light");
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                type === "EXPENSE"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "text-gray-500 hover:text-foreground"
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>💸 Chiqim (Xarajat)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Summa ({currency})</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full pl-4 pr-12 py-3 text-2xl font-black rounded-2xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">
                {currency}
              </span>
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center space-x-1.5 pt-1 overflow-x-auto">
              {[50, 100, 250, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addPresetAmount(preset)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground transition-colors border border-border"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* If Income: Client/Platform & Status */}
          {type === "INCOME" && (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Mijoz / Platforma / Ish turi</label>
                </div>
                <select
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.defaultFeeRate > 0 ? `(${c.defaultFeeRate}% komissiya)` : "(0% komissiya)"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Switcher (Paid vs Pending) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">To'lov Holati</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("PAID");
                      hapticFeedback("light");
                    }}
                    className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      status === "PAID"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                        : "bg-background border-border text-gray-400"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>To'langan (Paid)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStatus("PENDING");
                      hapticFeedback("light");
                    }}
                    className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      status === "PENDING"
                        ? "bg-amber-500/10 border-amber-500 text-amber-500"
                        : "bg-background border-border text-gray-400"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Kutilmoqda (Pending)</span>
                  </button>
                </div>
              </div>

              {/* Due Date if Pending */}
              {status === "PENDING" && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Kutilayotgan to'lov sanasi</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
                  />
                </div>
              )}
            </>
          )}

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Kategoriya</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
            >
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Izoh (Buyurtma yoki xarajat nomi)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === "INCOME" ? "Masalan: Landing page dizayni" : "Masalan: ChatGPT Plus obunasi"}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Sana</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
              type === "INCOME"
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? "Saqlanmoqda..." : "Tranzaksiyani Saqlash"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
