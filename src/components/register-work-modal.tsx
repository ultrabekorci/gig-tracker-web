"use client";

import React, { useState, useEffect } from "react";
import { Client, WorkType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useTelegram } from "./telegram-provider";
import {
  X,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  Shield,
  Briefcase,
  Check,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface RegisterWorkModalProps {
  initialDate?: Date;
  clients: Client[];
  onClose: () => void;
  onSuccess: () => void;
  onOpenAddWorkplace?: () => void;
}

export function RegisterWorkModal({
  initialDate,
  clients,
  onClose,
  onSuccess,
  onOpenAddWorkplace,
}: RegisterWorkModalProps) {
  const { currency, hapticFeedback } = useTelegram();

  const [workType, setWorkType] = useState<WorkType>("HOURLY_WAGE");
  const [workTypeDropdownOpen, setWorkTypeDropdownOpen] = useState(false);

  // Selected Workplace
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || "");
  const [workColor, setWorkColor] = useState(clients[0]?.color || "#6366f1");

  // Dates
  const [workDate, setWorkDate] = useState(
    initialDate ? initialDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    initialDate ? initialDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );

  // Times & Break
  const [arrivalTime, setArrivalTime] = useState("08:00");
  const [departureTime, setDepartureTime] = useState("18:00");
  const [breakMinutes, setBreakMinutes] = useState("60");

  // Rates & Pay
  const [hourlyWage, setHourlyWage] = useState("10320");
  const [dailyWage, setDailyWage] = useState("121906");
  const [fixedSalary, setFixedSalary] = useState("83000");
  const [perCasePay, setPerCasePay] = useState("10320");
  const [perCaseCount, setPerCaseCount] = useState("1");
  const [perCaseFee, setPerCaseFee] = useState("0");
  const [advanceAmount, setAdvanceAmount] = useState("100000");
  const [nonTaxableAmount, setNonTaxableAmount] = useState("50000");
  const [annualLeaveAllowance, setAnnualLeaveAllowance] = useState("83000");

  // Shift Modifiers
  const [isNightShift, setIsNightShift] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [isSpecialDuty, setIsSpecialDuty] = useState(false);

  // Memo
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [calculatedSalary, setCalculatedSalary] = useState(0);
  const [calculatedHours, setCalculatedHours] = useState(0);

  // Colors Palette
  const colorPalette = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f43f5e", "#64748b"];

  const workTypeOptions: { type: WorkType; label: string; icon: string }[] = [
    { type: "HOURLY_WAGE", label: "Hourly wage (Soatbay ish)", icon: "🕒" },
    { type: "DAILY_WAGE", label: "Daily wage (Kunlik ish)", icon: "📅" },
    { type: "FIXED_PAY", label: "Fixed pay (Fiksirlangan to'lov)", icon: "🔒" },
    { type: "PER_CASE", label: "Per case (Ishbay / Dona)", icon: "☑️" },
    { type: "ADVANCE", label: "Advance payment (Avans)", icon: "🪙" },
    { type: "NON_TAXABLE", label: "Non-taxable (Soliqsiz)", icon: "🧾" },
    { type: "ANNUAL_LEAVE", label: "Annual leave (Pullik ta'til)", icon: "🏖️" },
    { type: "DAY_OFF", label: "Day off (Dam olish kuni)", icon: "📆" },
    { type: "NO_SHOW", label: "No-show (Kelmagan kun)", icon: "❌" },
  ];

  // Auto calculate hours and salary
  useEffect(() => {
    if (workType === "HOURLY_WAGE") {
      const [arrH, arrM] = arrivalTime.split(":").map(Number);
      const [depH, depM] = departureTime.split(":").map(Number);

      let totalMins = (depH * 60 + depM) - (arrH * 60 + arrM);
      if (totalMins < 0) totalMins += 24 * 60; // overnight shift

      const workMins = Math.max(0, totalMins - (parseInt(breakMinutes) || 0));
      const hours = workMins / 60;
      setCalculatedHours(hours);

      const baseRate = parseFloat(hourlyWage) || 0;
      let rateMultiplier = 1.0;
      if (isNightShift) rateMultiplier += 0.5;
      if (isOvertime) rateMultiplier += 0.5;
      if (isSpecialDuty) rateMultiplier += 0.5;

      const total = Math.round(hours * baseRate * rateMultiplier);
      setCalculatedSalary(total);
    } else if (workType === "DAILY_WAGE") {
      setCalculatedSalary(parseFloat(dailyWage) || 0);
      setCalculatedHours(8);
    } else if (workType === "FIXED_PAY") {
      setCalculatedSalary(parseFloat(fixedSalary) || 0);
      setCalculatedHours(0);
    } else if (workType === "PER_CASE") {
      const perCase = parseFloat(perCasePay) || 0;
      const count = parseInt(perCaseCount) || 1;
      const fee = parseFloat(perCaseFee) || 0;
      const gross = perCase * count;
      const total = gross - (gross * fee) / 100;
      setCalculatedSalary(Math.round(total));
      setCalculatedHours(0);
    } else if (workType === "ADVANCE") {
      setCalculatedSalary(-(parseFloat(advanceAmount) || 0));
      setCalculatedHours(0);
    } else if (workType === "NON_TAXABLE") {
      setCalculatedSalary(parseFloat(nonTaxableAmount) || 0);
      setCalculatedHours(0);
    } else if (workType === "ANNUAL_LEAVE") {
      setCalculatedSalary(parseFloat(annualLeaveAllowance) || 0);
      setCalculatedHours(8);
    } else {
      setCalculatedSalary(0);
      setCalculatedHours(0);
    }
  }, [
    workType,
    arrivalTime,
    departureTime,
    breakMinutes,
    hourlyWage,
    dailyWage,
    fixedSalary,
    perCasePay,
    perCaseCount,
    perCaseFee,
    advanceAmount,
    nonTaxableAmount,
    annualLeaveAllowance,
    isNightShift,
    isOvertime,
    isSpecialDuty,
  ]);

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      if (client.color) setWorkColor(client.color);
      if (client.defaultHourlyRate) setHourlyWage(client.defaultHourlyRate.toString());
      if (client.defaultDailyRate) setDailyWage(client.defaultDailyRate.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedClient = clients.find((c) => c.id === selectedClientId);

      let finalAmount = calculatedSalary;
      let txType = "INCOME";

      if (workType === "ADVANCE") {
        txType = "EXPENSE";
        finalAmount = Math.abs(calculatedSalary);
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: txType,
          workType,
          amount: finalAmount,
          currency,
          description: memo || selectedClient?.name || "Ish smenasi",
          date: workDate,
          endDate: workType === "FIXED_PAY" ? endDate : null,
          status: "PAID",
          startTime: arrivalTime,
          endTime: departureTime,
          breakMinutes: parseInt(breakMinutes) || 0,
          hourlyRate: parseFloat(hourlyWage) || 0,
          totalHours: calculatedHours,
          isNightShift,
          isOvertime,
          isSpecialDuty,
          unitCount: parseInt(perCaseCount) || 1,
          color: workColor,
          clientId: selectedClientId || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Smenani saqlashda xatolik yuz berdi");
      }

      hapticFeedback("success");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      hapticFeedback("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: workColor }}>
              ●
            </div>
            <h3 className="font-bold text-base text-foreground">Smena / Ish Kiritish (Register Work)</h3>
          </div>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Top Row: Work Color & Work Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Work Color Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Ish Joyi Rangi (Work Color)</label>
              <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border overflow-x-auto">
                {colorPalette.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setWorkColor(c);
                      hapticFeedback("light");
                    }}
                    className={`w-6 h-6 rounded-full flex-shrink-0 transition-transform ${
                      workColor === c ? "scale-125 ring-2 ring-foreground" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Type Selector Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Ish Turi (Type)</label>
              <button
                type="button"
                onClick={() => setWorkTypeDropdownOpen(!workTypeDropdownOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-border font-bold text-xs text-foreground"
              >
                <span>{workTypeOptions.find((o) => o.type === workType)?.label}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {workTypeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-2xl py-1.5 z-50 max-h-60 overflow-y-auto">
                  {workTypeOptions.map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => {
                        setWorkType(opt.type);
                        setWorkTypeDropdownOpen(false);
                        hapticFeedback("light");
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="font-semibold text-foreground">{opt.label}</span>
                      {workType === opt.type && <Check className="w-4 h-4 text-indigo-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Workplace Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Ish Joyi / Obekt (Workplace)</label>
            </div>
            <select
              value={selectedClientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-gray-50 dark:bg-gray-900 border border-border focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
            >
              {clients.length > 0 ? (
                clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    ● {c.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="client-yekaterina">● Yekaterina</option>
                  <option value="client-emart">● Emart</option>
                  <option value="client-xasanboy">● Xasanboy aka</option>
                  <option value="client-daily">● Kunlik ish (Obekt)</option>
                </>
              )}
            </select>
          </div>

          {/* Dynamic Inputs based on WorkType */}

          {/* 1. HOURLY WAGE */}
          {workType === "HOURLY_WAGE" && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-border space-y-3.5 animate-in fade-in">
              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500">Kelish vaqti (Arrival)</label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs font-bold rounded-xl bg-card border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500">Ketish vaqti (Departure)</label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs font-bold rounded-xl bg-card border border-border text-foreground"
                  />
                </div>
              </div>

              {/* Break Minutes & Hourly Wage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500">Tanaffus (Break time)</label>
                  <input
                    type="number"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(e.target.value)}
                    placeholder="60 daqiqa"
                    className="w-full mt-1 px-3 py-2 text-xs font-bold rounded-xl bg-card border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500">Soatlik stavka ({currency})</label>
                  <input
                    type="number"
                    value={hourlyWage}
                    onChange={(e) => setHourlyWage(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs font-bold rounded-xl bg-card border border-border text-foreground"
                  />
                </div>
              </div>

              {/* Modifiers Checkboxes */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-gray-500">Qo'shimcha ustamalar:</label>
                <div className="flex flex-wrap gap-2">
                  <label className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    isNightShift ? "bg-blue-500/10 border-blue-500 text-blue-500" : "bg-card border-border text-gray-400"
                  }`}>
                    <input
                      type="checkbox"
                      checked={isNightShift}
                      onChange={(e) => setIsNightShift(e.target.checked)}
                      className="hidden"
                    />
                    <span>🌙 Tungi smena (+50%)</span>
                  </label>

                  <label className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    isOvertime ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-card border-border text-gray-400"
                  }`}>
                    <input
                      type="checkbox"
                      checked={isOvertime}
                      onChange={(e) => setIsOvertime(e.target.checked)}
                      className="hidden"
                    />
                    <span>⚡ Qo'shimcha soat / Zanyop (+50%)</span>
                  </label>

                  <label className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    isSpecialDuty ? "bg-rose-500/10 border-rose-500 text-rose-500" : "bg-card border-border text-gray-400"
                  }`}>
                    <input
                      type="checkbox"
                      checked={isSpecialDuty}
                      onChange={(e) => setIsSpecialDuty(e.target.checked)}
                      className="hidden"
                    />
                    <span>🏖️ Dam / Bayram kuni (+50%)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 2. DAILY WAGE */}
          {workType === "DAILY_WAGE" && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-border space-y-3 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500">Kelish vaqti</label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs font-bold rounded-xl bg-card border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500">Ketish vaqti</label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs font-bold rounded-xl bg-card border border-border text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500">Kunlik ish haqi ({currency})</label>
                <input
                  type="number"
                  value={dailyWage}
                  onChange={(e) => setDailyWage(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-base font-black rounded-xl bg-card border border-border text-foreground"
                />
              </div>
            </div>
          )}

          {/* 3. FIXED PAY */}
          {workType === "FIXED_PAY" && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-border space-y-3 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500">Boshlanish sanasi</label>
                  <input
                    type="date"
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500">Tugash sanasi</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500">Jami Fiksirlangan Summa ({currency})</label>
                <input
                  type="number"
                  value={fixedSalary}
                  onChange={(e) => setFixedSalary(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-base font-black rounded-xl bg-card border border-border text-foreground"
                />
              </div>
            </div>
          )}

          {/* 4. PER CASE */}
          {workType === "PER_CASE" && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-border space-y-3 animate-in fade-in">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-500">1 dona narxi</label>
                  <input
                    type="number"
                    value={perCasePay}
                    onChange={(e) => setPerCasePay(e.target.value)}
                    className="w-full mt-1 px-2.5 py-2 text-xs font-bold rounded-xl bg-card border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500">Donalar soni</label>
                  <input
                    type="number"
                    value={perCaseCount}
                    onChange={(e) => setPerCaseCount(e.target.value)}
                    className="w-full mt-1 px-2.5 py-2 text-xs font-bold rounded-xl bg-card border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500">Komissiya %</label>
                  <input
                    type="number"
                    value={perCaseFee}
                    onChange={(e) => setPerCaseFee(e.target.value)}
                    className="w-full mt-1 px-2.5 py-2 text-xs font-bold rounded-xl bg-card border border-border text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. ADVANCE PAYMENT */}
          {workType === "ADVANCE" && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-border space-y-2 animate-in fade-in">
              <label className="text-[11px] font-bold text-gray-500">Olingan Avans Summasi ({currency})</label>
              <input
                type="number"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                className="w-full px-3 py-2 text-base font-black rounded-xl bg-card border border-border text-rose-500"
              />
            </div>
          )}

          {/* Date Picker (for non fixed-pay) */}
          {workType !== "FIXED_PAY" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Ish Sanasi</label>
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-border text-foreground font-semibold"
              />
            </div>
          )}

          {/* Memo / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Izoh (Memo - 100 belgigacha)</label>
            <input
              type="text"
              maxLength={100}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Masalan: 12-Obekt gipsokarton yoki qo'shimcha soat..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-border text-foreground"
            />
          </div>

          {/* Calculated Output Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Hisoblangan Kunlik Haq:</span>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {formatCurrency(calculatedSalary, currency)}
              </p>
            </div>
            {calculatedHours > 0 && (
              <div className="text-right">
                <span className="text-xs font-bold text-gray-400">Jami soat:</span>
                <p className="text-base font-black text-foreground">{calculatedHours} soat</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? "Saqlanmoqda..." : "Smenani Qo'shish (Add)"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
