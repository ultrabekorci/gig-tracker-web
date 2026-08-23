"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardStats, Transaction, Category, Client } from "@/types";
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

export default function Home() {
  const { hapticFeedback } = useTelegram();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [goal, setGoal] = useState({ target: 2500000, current: 1553656, title: "Oylik Ish Haqi Maqsadi" });

  const [activeTab, setActiveTab] = useState<"calendar" | "salary" | "analysis" | "transactions" | "invoices" | "settings">("calendar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, txRes, catRes, clientRes, goalRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/transactions"),
        fetch("/api/categories"),
        fetch("/api/clients"),
        fetch("/api/goals"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setClients(clientData);
      }
      if (goalRes.ok) {
        const goalData = await goalRes.json();
        if (goalData && goalData.length > 0) {
          setGoal({
            target: goalData[0].targetAmount,
            current: goalData[0].currentAmount,
            title: goalData[0].title,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateGoal = async (newTarget: number) => {
    setGoal((prev) => ({ ...prev, target: newTarget }));
    try {
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goal.title,
          targetAmount: newTarget,
        }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCalendarDayClick = (date: Date) => {
    setSelectedDateForModal(date);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-12">
      {/* Header */}
      <DashboardHeader />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-5 space-y-5">
        {/* Top Metric Cards */}
        <StatsCards stats={stats} />

        {/* Goal Progress */}
        <GoalProgress
          targetAmount={goal.target}
          currentAmount={stats ? stats.takeHomePay : goal.current}
          title={goal.title}
          onUpdateGoal={handleUpdateGoal}
        />

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-border pb-2 overflow-x-auto">
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

        {/* Tab Views Rendering */}

        {/* 1. CALENDAR VIEW */}
        {activeTab === "calendar" && (
          <CalendarView
            transactions={transactions}
            onSelectDate={handleCalendarDayClick}
            onRefresh={fetchData}
          />
        )}

        {/* 2. SALARY & MONTHLY VIEW */}
        {activeTab === "salary" && (
          <SalaryMonthlyView
            transactions={transactions}
            clients={clients}
            onRefresh={fetchData}
          />
        )}

        {/* 3. ANALYSIS 12-MONTHS */}
        {activeTab === "analysis" && (
          <AnalysisView stats={stats} />
        )}

        {/* 4. TRANSACTIONS */}
        {activeTab === "transactions" && (
          <TransactionList transactions={transactions} onRefresh={fetchData} />
        )}

        {/* 5. INVOICES */}
        {activeTab === "invoices" && (
          <InvoicesView transactions={transactions} onRefresh={fetchData} />
        )}

        {/* 6. SETTINGS & WORKPLACES */}
        {activeTab === "settings" && (
          <SettingsView
            clients={clients}
            categories={categories}
            onRefresh={fetchData}
          />
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => {
            setSelectedDateForModal(undefined);
            setIsModalOpen(true);
            hapticFeedback("heavy");
          }}
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 active:scale-95 transition-transform"
          aria-label="Smena qo'shish"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

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
            fetchData();
          }}
        />
      )}
    </div>
  );
}
