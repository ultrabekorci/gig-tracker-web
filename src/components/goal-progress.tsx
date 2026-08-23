"use client";

import React, { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { useTelegram } from "./telegram-provider";
import { Target, Sparkles, Check } from "lucide-react";

export function GoalProgress({
  targetAmount = 2500,
  currentAmount = 1850,
  title = "Oylik Sof Daromad Maqsadi",
  onUpdateGoal,
}: {
  targetAmount?: number;
  currentAmount?: number;
  title?: string;
  onUpdateGoal?: (target: number) => void;
}) {
  const { currency, hapticFeedback } = useTelegram();
  const [isEditing, setIsEditing] = useState(false);
  const [newTarget, setNewTarget] = useState(targetAmount.toString());

  // Keep the input in sync when the stored goal is loaded/changed elsewhere.
  useEffect(() => {
    setNewTarget(targetAmount.toString());
  }, [targetAmount]);

  const percentage =
    targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) || 0 : 0;
  const remaining = Math.max(0, targetAmount - currentAmount);

  const handleSave = () => {
    const val = parseFloat(newTarget);
    if (val > 0 && onUpdateGoal) {
      onUpdateGoal(val);
    }
    setIsEditing(false);
    hapticFeedback("success");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">{title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {percentage >= 100 ? (
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Maqsad to'liq bajarildi!
                </span>
              ) : (
                <span>Maqsadga erishish uchun yana {formatCurrency(remaining, currency)} kerak</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isEditing ? (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-20 px-2 py-1 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="2500"
              />
              <button
                onClick={handleSave}
                className="p-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                hapticFeedback("light");
              }}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-lg transition-colors"
            >
              Maqsadni o'zgartirish
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(currentAmount, currency)}</span>
          <span className="text-gray-400">{percentage}% ({formatCurrency(targetAmount, currency)})</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
