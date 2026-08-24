"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { DashboardStats, Transaction, Category, Client } from "@/types";
import {
  getLocalWorkplaces,
  saveLocalWorkplace,
  deleteLocalWorkplace,
  getLocalCategories,
  saveLocalCategory,
  deleteLocalCategory,
  getLocalTransactions,
  saveLocalTransaction,
  deleteLocalTransaction,
  calculateLocalStats,
} from "@/lib/storage";
import { toDateKey, parseDateKey } from "@/lib/utils";
import { matchWorkplace } from "@/lib/workplace-match";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatsCards } from "@/components/stats-cards";
import { GoalProgress } from "@/components/goal-progress";
import { CalendarView } from "@/components/calendar-view";
import { SalaryMonthlyView } from "@/components/salary-monthly-view";
import { AnalysisView } from "@/components/analysis-view";
import { TransactionList } from "@/components/transaction-list";
import { InvoicesView } from "@/components/invoices-view";
import { SettingsView } from "@/components/settings-view";
import { RegisterWorkModal } from "@/components/register-work-modal";
import { DaySummaryModal } from "@/components/day-summary-modal";
import { BottomNav } from "@/components/bottom-nav";
import { useTelegram } from "@/components/telegram-provider";
import {
  Plus,
  Calendar as CalendarIcon,
  Wallet,
  TrendingUp,
  Receipt,
  Clock,
  Settings,
} from "lucide-react";

const GOAL_KEY = "gig_tracker_goal_v3";

/**
 * Local transactions only store a clientId, so every view that shows a
 * workplace name or colour needs the workplace attached first — otherwise a
 * shift from the bot shows up as a nameless "Smena".
 */
function withWorkplaces(transactions: Transaction[], workplaces: Client[]): Transaction[] {
  if (workplaces.length === 0) return transactions;
  const byId = new Map(workplaces.map((w) => [w.id, w]));

  return transactions.map((tx) => {
    const client = tx.clientId ? byId.get(tx.clientId) : undefined;
    if (!client) return tx;
    return { ...tx, client, color: tx.color || client.color || null };
  });
}

export default function Home() {
  const { currency, hapticFeedback } = useTelegram();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [goal, setGoal] = useState({ target: 2500000, current: 1553656, title: "Oylik Ish Haqi Maqsadi" });
  const deepLinkHandled = useRef(false);

  // Restore the saved goal target — it used to reset on every reload.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(GOAL_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.target === "number" && parsed.target > 0) {
          setGoal((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      /* ignore malformed goal */
    }
  }, []);

  const [activeTab, setActiveTab] = useState<"calendar" | "salary" | "analysis" | "transactions" | "invoices" | "settings">("calendar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | undefined>(undefined);
  const [isDaySummaryModalOpen, setIsDaySummaryModalOpen] = useState(false);

  // Sync state from storage
  const syncFromStorage = useCallback(() => {
    const localWp = getLocalWorkplaces();
    const localCats = getLocalCategories();
    const localTxs = getLocalTransactions();
    const localSt = calculateLocalStats(localTxs, currency, localCats);

    setClients(localWp);
    setCategories(localCats);
    setTransactions(withWorkplaces(localTxs, localWp));
    setStats(localSt);
  }, [currency]);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  // Recompute the dashboard from a freshly saved list (categories included, so
  // the expense breakdown stays in sync).
  const applyTransactions = useCallback(
    (list: Transaction[]) => {
      setTransactions(withWorkplaces(list, getLocalWorkplaces()));
      setStats(calculateLocalStats(list, currency, getLocalCategories()));
    },
    [currency]
  );

  // Handle Deep Links from Telegram Bot
  useEffect(() => {
    if (typeof window !== "undefined" && !deepLinkHandled.current) {
      deepLinkHandled.current = true;
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get("action");
      if (action === "add") {
        const type = urlParams.get("type") as "INCOME" | "EXPENSE" || "INCOME";
        const amount = parseFloat(urlParams.get("amount") || "0");
        const desc = urlParams.get("desc") || "";
        const dateParam = urlParams.get("date");

        if (amount > 0) {
          // The bot cannot know the workplaces — they live on this device — so
          // the match happens here, against what the message mentioned
          // ("Yekaterinada" -> Yekaterina).
          const workplace = matchWorkplace(desc, getLocalWorkplaces());

          const newTx: Partial<Transaction> = {
            type,
            amount,
            description: desc || workplace?.name || null,
            date: (dateParam ? parseDateKey(dateParam) : new Date()).toISOString(),
            status: "PAID",
            workType: type === "INCOME" ? "DAILY_WAGE" : undefined,
            clientId: workplace?.id || null,
            color: workplace?.color || undefined,
            currency
          };
          // Save and instantly sync
          applyTransactions(saveLocalTransaction(newTx));
          
          if (hapticFeedback) hapticFeedback("success");
          alert(
            workplace
              ? `Saqlandi: ${workplace.name}`
              : "Muvaffaqiyatli saqlandi!"
          );
          
          // Clear URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [currency, hapticFeedback, applyTransactions]);

  // Transaction CRUD Handlers (Instant State + Storage Update)
  const handleAddOrEditTransaction = (txData: Partial<Transaction>) => {
    applyTransactions(saveLocalTransaction(txData));
  };

  const handleDeleteTransaction = (id: string) => {
    applyTransactions(deleteLocalTransaction(id));
  };

  // Marking an invoice as paid has to update local storage — the API route
  // needs a database that the offline (Mini App) mode does not have.
  const handleMarkInvoicePaid = (id: string) => {
    applyTransactions(saveLocalTransaction({ id, status: "PAID" }));
    fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    }).catch(() => {});
  };

  // Client CRUD Handlers
  const handleAddOrEditClient = (clientData: Partial<Client>) => {
    const updatedList = saveLocalWorkplace(clientData);
    setClients(updatedList);
    setTransactions((prev) => withWorkplaces(prev, updatedList));
  };

  const handleDeleteClient = (id: string) => {
    const updatedList = deleteLocalWorkplace(id);
    setClients(updatedList);
    setTransactions((prev) => withWorkplaces(prev, updatedList));
  };

  // Category CRUD Handlers
  const handleAddOrEditCategory = (catData: Partial<Category>) => {
    const updatedList = saveLocalCategory(catData);
    setCategories(updatedList);
  };

  const handleDeleteCategory = (id: string) => {
    const updatedList = deleteLocalCategory(id);
    setCategories(updatedList);
  };

  const handleUpdateGoal = (newTarget: number) => {
    setGoal((prev) => {
      const next = { ...prev, target: newTarget };
      try {
        localStorage.setItem(GOAL_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
    try {
      fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: goal.title, targetAmount: newTarget }),
      }).catch(() => {});
    } catch {}
  };

  const handleCalendarDayClick = (date: Date) => {
    setSelectedDateForModal(date);
    // Check if there are transactions for this day
    const dayStr = toDateKey(date);
    const dayTxs = transactions.filter((t) => toDateKey(t.date) === dayStr);
    
    if (dayTxs.length > 0) {
      setIsDaySummaryModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-12">
      {/* Header with Profile circle & quick links to Sozlamalar & Tarix */}
      <DashboardHeader
        onOpenSettings={() => {
          setActiveTab("settings");
          hapticFeedback("light");
        }}
        onOpenHistory={() => {
          setActiveTab("transactions");
          hapticFeedback("light");
        }}
      />


      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-4 space-y-4">
        {/* Top Metric Cards & Goal — only on Calendar (home) tab */}
        {activeTab === "calendar" && (
          <>
            <StatsCards stats={stats} transactions={transactions} />
            <GoalProgress
              targetAmount={goal.target}
              currentAmount={stats ? stats.takeHomePay : goal.current}
              title={goal.title}
              onUpdateGoal={handleUpdateGoal}
            />
          </>
        )}

        {/* Navigation Tabs Bar */}
        <div className="hidden sm:flex items-center justify-between border-b border-border pb-2 overflow-x-auto">
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-max">
            {/* 1. Calendar (Work) */}
            <button
              onClick={() => {
                setActiveTab("calendar");
                hapticFeedback("light");
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "calendar"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>📅 Kalendar (Work)</span>
            </button>

            {/* 2. Salary (Monthly View) */}
            <button
              onClick={() => {
                setActiveTab("salary");
                hapticFeedback("light");
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "salary"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>💳 Oylik (Salary)</span>
            </button>

            {/* 3. Analysis (12-oy) */}
            <button
              onClick={() => {
                setActiveTab("analysis");
                hapticFeedback("light");
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "analysis"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>📈 Tahlil (Analysis)</span>
            </button>

            {/* 4. Transactions */}
            <button
              onClick={() => {
                setActiveTab("transactions");
                hapticFeedback("light");
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "transactions"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>📋 Tarix ({transactions.length})</span>
            </button>

            {/* 5. Invoices */}
            <button
              onClick={() => {
                setActiveTab("invoices");
                hapticFeedback("light");
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "invoices"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>⏳ Kutilayotgan ({stats?.pendingCount || 0})</span>
            </button>

            {/* 6. Settings & Workplaces */}
            <button
              onClick={() => {
                setActiveTab("settings");
                hapticFeedback("light");
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "settings"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>⚙️ Sozlamalar</span>
            </button>
          </div>

          {/* Desktop Add Shift Button */}
          <button
            onClick={() => {
              setSelectedDateForModal(undefined);
              setIsModalOpen(true);
              hapticFeedback("medium");
            }}
            className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex-shrink-0 ml-2"
          >
            <Plus className="w-4 h-4" />
            <span>Smena Qo'shish (Register Work)</span>
          </button>
        </div>

        {/* Tab Views */}

        {/* 1. CALENDAR VIEW */}
        {activeTab === "calendar" && (
          <CalendarView
            transactions={transactions}
            onSelectDate={handleCalendarDayClick}
            onRefresh={syncFromStorage}
          />
        )}

        {/* 2. SALARY & MONTHLY VIEW */}
        {activeTab === "salary" && (
          <SalaryMonthlyView
            transactions={transactions}
            clients={clients}
            onRefresh={syncFromStorage}
            onEditTransaction={handleAddOrEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {/* 3. ANALYSIS 12-MONTHS */}
        {activeTab === "analysis" && (
          <AnalysisView stats={stats} />
        )}

        {/* 4. TRANSACTIONS */}
        {activeTab === "transactions" && (
          <TransactionList
            transactions={transactions}
            onRefresh={syncFromStorage}
            onEditTransaction={handleAddOrEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {/* 5. INVOICES */}
        {activeTab === "invoices" && (
          <InvoicesView
            transactions={transactions}
            onRefresh={syncFromStorage}
            onMarkPaid={handleMarkInvoicePaid}
          />
        )}

        {/* 6. SETTINGS & WORKPLACES */}
        {activeTab === "settings" && (
          <SettingsView
            clients={clients}
            categories={categories}
            onRefresh={syncFromStorage}
            onAddClient={handleAddOrEditClient}
            onDeleteClient={handleDeleteClient}
            onAddCategory={handleAddOrEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onOpenHistory={() => setActiveTab("transactions")}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onOpenModal={() => {
          setSelectedDateForModal(undefined);
          setIsModalOpen(true);
        }}
      />

      {/* Register Work Modal */}
      {isModalOpen && (
        <RegisterWorkModal
          initialDate={selectedDateForModal}
          clients={clients}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDateForModal(undefined);
          }}
          onSuccess={() => {
            syncFromStorage();
          }}
        />
      )}

      {/* Day Summary Modal */}
      {isDaySummaryModalOpen && selectedDateForModal && (
        <DaySummaryModal
          date={selectedDateForModal}
          clients={clients}
          transactions={transactions.filter((t) => toDateKey(t.date) === toDateKey(selectedDateForModal))}
          onClose={() => setIsDaySummaryModalOpen(false)}
          onAddNew={() => {
            setIsDaySummaryModalOpen(false);
            setIsModalOpen(true);
          }}
          onEdit={(txData) => {
            handleAddOrEditTransaction(txData);
            // It automatically closes the edit state inside the modal
          }}
          onDelete={(id) => {
            handleDeleteTransaction(id);
            // If we deleted the last transaction for this day, maybe close the modal
            const remaining = transactions.filter(
              (t) => t.id !== id && toDateKey(t.date) === toDateKey(selectedDateForModal)
            );
            if (remaining.length === 0) setIsDaySummaryModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
