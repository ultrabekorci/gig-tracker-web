"use client";

import React, { useState } from "react";
import { Client, Category } from "@/types";
import { useTelegram } from "./telegram-provider";
import {
  Settings,
  Coins,
  Briefcase,
  Layers,
  Plus,
  Trash2,
  Check,
  Globe,
  Sparkles,
  Zap,
} from "lucide-react";

interface SettingsViewProps {
  clients: Client[];
  categories: Category[];
  onRefresh: () => void;
}

export function SettingsView({ clients, categories, onRefresh }: SettingsViewProps) {
  const { currency, setCurrency, hapticFeedback } = useTelegram();

  // New Client State
  const [newClientName, setNewClientName] = useState("");
  const [newClientFee, setNewClientFee] = useState("0");
  const [newClientType, setNewClientType] = useState("Kunlik ish");

  // New Category State
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  // Custom Currency State
  const [customCurrency, setCustomCurrency] = useState("");

  const [loading, setLoading] = useState(false);

  // Common Currency Presets
  const currencyPresets = [
    { code: "KRW", symbol: "₩", label: "Koreya Voni (KRW ₩)" },
    { code: "UZS", symbol: "so'm", label: "O'zbek So'mi (UZS)" },
    { code: "USD", symbol: "$", label: "AQSH Dollari (USD $)" },
    { code: "EUR", symbol: "€", label: "Yevro (EUR €)" },
    { code: "RUB", symbol: "₽", label: "Rossiya Rubli (RUB ₽)" },
  ];

  // Quick Gig Platform Presets
  const platformPresets = [
    { name: "Kunlik ish (Obekt / Smena)", platform: "Kunlik ish", fee: 0 },
    { name: "Zavod / Fabrika (Kunlik / Oylik)", platform: "Zavod", fee: 0 },
    { name: "Kuryerlik xizmati", platform: "Yetkazib berish", fee: 0 },
    { name: "Taksi / Haydovchilik", platform: "Transport", fee: 12 },
    { name: "Shaxsiy Mijoz (To'g'ridan-to'g'ri)", platform: "Shaxsiy", fee: 0 },
  ];

  // Quick Category Presets
  const categoryPresets = [
    { name: "Kunlik ish haqi", type: "INCOME" as const },
    { name: "Yotoqxona & Ijara", type: "EXPENSE" as const },
    { name: "Oziq-ovqat & Tushlik", type: "EXPENSE" as const },
    { name: "Yo'lkira & Transport", type: "EXPENSE" as const },
    { name: "Ish kiyimi & Qurollar", type: "EXPENSE" as const },
    { name: "Komissiya & Xizmat haqi", type: "EXPENSE" as const },
  ];

  const handleAddClient = async (name: string, platformType: string, feeRate: number) => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      hapticFeedback("light");
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          platform: platformType,
          defaultFeeRate: feeRate,
        }),
      });
      if (res.ok) {
        setNewClientName("");
        setNewClientFee("0");
        hapticFeedback("success");
        onRefresh();
      }
    } catch (e) {
      console.error(e);
      hapticFeedback("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Ushbu ish manbasini o'chirmoqchimisiz?")) return;
    try {
      hapticFeedback("warning");
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (res.ok) {
        hapticFeedback("success");
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCategory = async (name: string, type: "EXPENSE" | "INCOME") => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      hapticFeedback("light");
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
        }),
      });
      if (res.ok) {
        setNewCatName("");
        hapticFeedback("success");
        onRefresh();
      }
    } catch (e) {
      console.error(e);
      hapticFeedback("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Ushbu kategoriyani o'chirmoqchimisiz?")) return;
    try {
      hapticFeedback("warning");
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        hapticFeedback("success");
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCustomCurrencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCurrency.trim()) {
      setCurrency(customCurrency.trim().toUpperCase());
      setCustomCurrency("");
      hapticFeedback("success");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">Sozlamalar va Moslashtirish</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Valyuta, ish turlari (kunlik ish, smena) va toifalarni o'zingizga moslang
            </p>
          </div>
        </div>
      </div>

      {/* 1. Currency Settings */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center space-x-2.5">
          <Coins className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm sm:text-base text-foreground">Asosiy Valyutani Tanlash</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {currencyPresets.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCurrency(c.code);
                hapticFeedback("light");
              }}
              className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                currency === c.code
                  ? "bg-indigo-600/10 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "bg-gray-50 dark:bg-gray-900 border-border text-gray-700 dark:text-gray-300 hover:border-gray-400"
              }`}
            >
              <span>{c.label}</span>
              {currency === c.code && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </button>
          ))}
        </div>

        {/* Custom Currency input */}
        <form onSubmit={handleCustomCurrencySubmit} className="pt-2 flex items-center space-x-2">
          <input
            type="text"
            value={customCurrency}
            onChange={(e) => setCustomCurrency(e.target.value)}
            placeholder="Boshqa valyuta kodi (masalan: JPY, GBP, CAD)..."
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-border focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            O'rnatish
          </button>
        </form>
      </div>

      {/* 2. Platforms & Gig Sources */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-foreground">Ish Manbalari va Platformalar</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kunlik ish, smena, zavod, kuryerlik yoki shaxsiy mijozlarni qo'shing
              </p>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Tezkor tavsiya etilgan ish turlari (bir bosishda qo'shish):
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {platformPresets.map((p, idx) => {
              const alreadyAdded = clients.some((c) => c.name.toLowerCase() === p.name.toLowerCase());
              return (
                <button
                  key={idx}
                  disabled={alreadyAdded}
                  onClick={() => handleAddClient(p.name, p.platform, p.fee)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
                    alreadyAdded
                      ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-border text-gray-400"
                      : "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100"
                  }`}
                >
                  <span>+ {p.name}</span>
                  {alreadyAdded && <Check className="w-3 h-3 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add custom form */}
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            type="text"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder="Yangi ish manbai (masalan: 12-Obekt gipsokarton)"
            className="sm:col-span-2 px-3 py-2 text-xs rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <input
            type="number"
            value={newClientFee}
            onChange={(e) => setNewClientFee(e.target.value)}
            placeholder="Komissiya % (0)"
            className="px-3 py-2 text-xs rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleAddClient(newClientName, newClientType, parseFloat(newClientFee) || 0)}
            disabled={loading || !newClientName.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Qo'shish</span>
          </button>
        </div>

        {/* Existing List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {clients.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-border"
            >
              <div>
                <p className="font-bold text-xs text-foreground">{c.name}</p>
                <p className="text-[11px] text-gray-400">
                  {c.defaultFeeRate > 0 ? `${c.defaultFeeRate}% komissiya` : "Komissiyasiz (0%)"}
                </p>
              </div>
              <button
                onClick={() => handleDeleteClient(c.id)}
                className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="O'chirish"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Categories Customization */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center space-x-2.5">
          <Layers className="w-5 h-5 text-emerald-500" />
          <div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">Kategoriyalar (Toifalar)</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kirim va xarajat toifalarini boshqarish
            </p>
          </div>
        </div>

        {/* Quick Category Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-500" /> Tezkor toifalar (bir bosishda qo'shish):
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {categoryPresets.map((cat, idx) => {
              const alreadyAdded = categories.some((c) => c.name.toLowerCase() === cat.name.toLowerCase());
              return (
                <button
                  key={idx}
                  disabled={alreadyAdded}
                  onClick={() => handleAddCategory(cat.name, cat.type)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
                    alreadyAdded
                      ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-border text-gray-400"
                      : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100"
                  }`}
                >
                  <span>+ {cat.name}</span>
                  {alreadyAdded && <Check className="w-3 h-3 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add custom form */}
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Yangi kategoriya nomi..."
            className="flex-1 px-3 py-2 text-xs rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            value={newCatType}
            onChange={(e) => setNewCatType(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-lg bg-card border border-border text-foreground font-semibold"
          >
            <option value="EXPENSE">🔴 Chiqim (Xarajat)</option>
            <option value="INCOME">🟢 Kirim (Daromad)</option>
          </select>
          <button
            onClick={() => handleAddCategory(newCatName, newCatType)}
            disabled={loading || !newCatName.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Qo'shish</span>
          </button>
        </div>

        {/* Category List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-border"
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    c.type === "INCOME" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                <span className="font-bold text-xs text-foreground">{c.name}</span>
              </div>
              <button
                onClick={() => handleDeleteCategory(c.id)}
                className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="O'chirish"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
