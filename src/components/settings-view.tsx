"use client";

import React, { useState } from "react";
import { Client, Category } from "@/types";
import { useTelegram } from "./telegram-provider";
import {
  saveLocalWorkplace,
  deleteLocalWorkplace,
  saveLocalCategory,
  deleteLocalCategory,
} from "@/lib/storage";
import {
  Settings,
  Coins,
  Briefcase,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  Zap,
  X,
  Save,
} from "lucide-react";

interface SettingsViewProps {
  clients: Client[];
  categories: Category[];
  onRefresh: () => void;
  onAddClient?: (wp: Partial<Client>) => void;
  onDeleteClient?: (id: string) => void;
  onAddCategory?: (cat: Partial<Category>) => void;
  onDeleteCategory?: (id: string) => void;
}

export function SettingsView({
  clients,
  categories,
  onRefresh,
  onAddClient,
  onDeleteClient,
  onAddCategory,
  onDeleteCategory,
}: SettingsViewProps) {
  const { currency, setCurrency, hapticFeedback } = useTelegram();

  // New Client State
  const [newClientName, setNewClientName] = useState("");
  const [newClientHourly, setNewClientHourly] = useState("10320");
  const [newClientDaily, setNewClientDaily] = useState("120000");
  const [newClientPlatform, setNewClientPlatform] = useState("Kunlik ish");

  // Edit Client Modal
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editClientName, setEditClientName] = useState("");
  const [editClientHourly, setEditClientHourly] = useState("");
  const [editClientDaily, setEditClientDaily] = useState("");

  // New Category State
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  // Custom Currency State
  const [customCurrency, setCustomCurrency] = useState("");

  // Common Currency Presets
  const [currencyPresets, setCurrencyPresets] = useState([
    { code: "KRW", symbol: "₩", label: "Koreya Voni (KRW ₩)" },
    { code: "UZS", symbol: "so'm", label: "O'zbek So'mi (UZS)" },
    { code: "USD", symbol: "$", label: "AQSH Dollari (USD $)" },
    { code: "EUR", symbol: "€", label: "Yevro (EUR €)" },
    { code: "RUB", symbol: "₽", label: "Rossiya Rubli (RUB ₽)" },
  ]);

  // Quick Gig Platform Presets
  const platformPresets = [
    { name: "Kunlik ish (Obekt / Smena)", platform: "Kunlik ish", fee: 0, hourly: 10320, daily: 120000 },
    { name: "Zavod / Fabrika (Smena)", platform: "Zavod", fee: 0, hourly: 10320, daily: 120000 },
    { name: "Kuryerlik xizmati", platform: "Yetkazib berish", fee: 0, hourly: 11000, daily: 130000 },
    { name: "Taksi / Haydovchilik", platform: "Transport", fee: 12, hourly: 12000, daily: 140000 },
    { name: "Shaxsiy Mijoz (Obekt)", platform: "Shaxsiy", fee: 0, hourly: 15000, daily: 150000 },
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

  const colorOptions = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f43f5e"];

  const handleAddClientSubmit = (
    name: string,
    platformType: string = "Workplace",
    hourly: number = 10320,
    daily: number = 120000
  ) => {
    if (!name || !name.trim()) return;
    hapticFeedback("light");
    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];

    const newWpData: Partial<Client> = {
      name: name.trim(),
      platform: platformType,
      defaultHourlyRate: hourly,
      defaultDailyRate: daily,
      defaultFeeRate: 0,
      color: randomColor,
      isActive: true,
    };

    if (onAddClient) {
      onAddClient(newWpData);
    } else {
      saveLocalWorkplace(newWpData);
    }

    // Try backend sync
    fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWpData),
    }).catch(() => {});

    setNewClientName("");
    hapticFeedback("success");
    onRefresh();
  };

  const handleDeleteClientSubmit = (id: string) => {
    if (!confirm("Ushbu ish manbasini o'chirmoqchimisiz?")) return;
    hapticFeedback("warning");
    if (onDeleteClient) {
      onDeleteClient(id);
    } else {
      deleteLocalWorkplace(id);
    }
    fetch(`/api/clients/${id}`, { method: "DELETE" }).catch(() => {});
    onRefresh();
  };

  const handleOpenEditClient = (c: Client) => {
    setEditingClient(c);
    setEditClientName(c.name);
    setEditClientHourly((c.defaultHourlyRate || 10320).toString());
    setEditClientDaily((c.defaultDailyRate || 120000).toString());
    hapticFeedback("light");
  };

  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    const updated: Client = {
      ...editingClient,
      name: editClientName.trim() || editingClient.name,
      defaultHourlyRate: parseFloat(editClientHourly) || 10320,
      defaultDailyRate: parseFloat(editClientDaily) || 120000,
    };

    if (onAddClient) {
      onAddClient(updated);
    } else {
      saveLocalWorkplace(updated);
    }

    setEditingClient(null);
    hapticFeedback("success");
    onRefresh();
  };

  const handleAddCategorySubmit = (name: string, type: "EXPENSE" | "INCOME") => {
    if (!name || !name.trim()) return;
    hapticFeedback("light");

    const newCatData: Partial<Category> = {
      name: name.trim(),
      type,
    };

    if (onAddCategory) {
      onAddCategory(newCatData);
    } else {
      saveLocalCategory(newCatData);
    }

    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCatData),
    }).catch(() => {});

    setNewCatName("");
    hapticFeedback("success");
    onRefresh();
  };

  const handleDeleteCategorySubmit = (id: string) => {
    if (!confirm("Ushbu kategoriyani o'chirmoqchimisiz?")) return;
    hapticFeedback("warning");
    if (onDeleteCategory) {
      onDeleteCategory(id);
    } else {
      deleteLocalCategory(id);
    }
    fetch(`/api/categories/${id}`, { method: "DELETE" }).catch(() => {});
    onRefresh();
  };

  const handleCustomCurrencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCurrency.trim()) {
      const code = customCurrency.trim().toUpperCase();
      setCurrency(code);
      if (!currencyPresets.some((c) => c.code === code)) {
        setCurrencyPresets((prev) => [...prev, { code, symbol: code, label: `${code} (${code})` }]);
      }
      setCustomCurrency("");
      hapticFeedback("success");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-card border border-border rounded-3xl p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-foreground">Sozlamalar va Moslashtirish</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Valyuta, ish joylari (Zavod, Emart, Obekt) va toifalarni boshqarish
            </p>
          </div>
        </div>
      </div>

      {/* 1. Currency Settings */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
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
              className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                currency === c.code
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                  : "bg-gray-50 dark:bg-gray-900 border-border text-foreground hover:border-gray-400"
              }`}
            >
              <span>{c.label}</span>
              {currency === c.code && <Check className="w-4 h-4 text-white" />}
            </button>
          ))}
        </div>

        {/* Custom Currency input */}
        <form onSubmit={handleCustomCurrencySubmit} className="pt-2 flex items-center space-x-2">
          <input
            type="text"
            value={customCurrency}
            onChange={(e) => setCustomCurrency(e.target.value)}
            placeholder="Boshqa valyuta kodi (masalan: JPY, GBP, CAD, TRY)..."
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-border focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground font-semibold"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            O'rnatish
          </button>
        </form>
      </div>

      {/* 2. Platforms & Gig Sources */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <Briefcase className="w-5 h-5 text-indigo-500" />
          <div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">Ish Joylari va Obektlar ({clients.length})</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Yangi ish joyini qo'shing yoki mavjudlarini tahrirlang
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Bir bosishda qo'shish:
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {platformPresets.map((p, idx) => {
              const alreadyAdded = clients.some((c) => c.name.toLowerCase() === p.name.toLowerCase());
              return (
                <button
                  key={idx}
                  disabled={alreadyAdded}
                  onClick={() => handleAddClientSubmit(p.name, p.platform, p.hourly, p.daily)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
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
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <input
            type="text"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder="Yangi ish joyi nomi (masalan: 12-Obekt)..."
            className="sm:col-span-2 px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <input
            type="number"
            value={newClientHourly}
            onChange={(e) => setNewClientHourly(e.target.value)}
            placeholder="Soatlik stavka (10320)"
            className="px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleAddClientSubmit(newClientName, newClientPlatform, parseFloat(newClientHourly) || 10320, parseFloat(newClientDaily) || 120000)}
            disabled={!newClientName.trim()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Qo'shish</span>
          </button>
        </div>

        {/* Existing List with Edit & Delete */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {clients.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-border hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.color || "#6366f1" }}
                />
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-foreground truncate">{c.name}</p>
                  <p className="text-[11px] text-gray-400">
                    {c.defaultHourlyRate ? `${c.defaultHourlyRate.toLocaleString()} ₩/soat` : "Kunlik smena"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEditClient(c)}
                  className="p-1.5 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  title="Tahrirlash"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClientSubmit(c.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="O'chirish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-indigo-500" />
                <span>Ish Joyini Tahrirlash</span>
              </h4>
              <button
                onClick={() => setEditingClient(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClient} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400">Ish Joyi Nomi</label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs font-bold rounded-xl bg-gray-50 dark:bg-gray-900 border border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400">Standart Soatlik Stavka ({currency})</label>
                <input
                  type="number"
                  value={editClientHourly}
                  onChange={(e) => setEditClientHourly(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs font-bold rounded-xl bg-gray-50 dark:bg-gray-900 border border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400">Standart Kunlik Stavka ({currency})</label>
                <input
                  type="number"
                  value={editClientDaily}
                  onChange={(e) => setEditClientDaily(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs font-bold rounded-xl bg-gray-50 dark:bg-gray-900 border border-border text-foreground"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
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

      {/* 3. Categories Customization */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <Layers className="w-5 h-5 text-emerald-500" />
          <div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">Kategoriyalar / Toifalar ({categories.length})</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kirim va xarajat toifalarini boshqarish
            </p>
          </div>
        </div>

        {/* Quick Category Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-500" /> Bir bosishda qo'shish:
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {categoryPresets.map((cat, idx) => {
              const alreadyAdded = categories.some((c) => c.name.toLowerCase() === cat.name.toLowerCase());
              return (
                <button
                  key={idx}
                  disabled={alreadyAdded}
                  onClick={() => handleAddCategorySubmit(cat.name, cat.type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
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
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Yangi kategoriya nomi..."
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            value={newCatType}
            onChange={(e) => setNewCatType(e.target.value as any)}
            className="px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border text-foreground font-bold"
          >
            <option value="EXPENSE">🔴 Chiqim (Xarajat)</option>
            <option value="INCOME">🟢 Kirim (Daromad)</option>
          </select>
          <button
            onClick={() => handleAddCategorySubmit(newCatName, newCatType)}
            disabled={!newCatName.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Qo'shish</span>
          </button>
        </div>

        {/* Category List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-border"
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    c.type === "INCOME" ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                <span className="font-bold text-xs text-foreground">{c.name}</span>
              </div>
              <button
                onClick={() => handleDeleteCategorySubmit(c.id)}
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
