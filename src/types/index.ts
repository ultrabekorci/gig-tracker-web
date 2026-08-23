export type TransactionType = "INCOME" | "EXPENSE";
export type PaymentStatus = "PAID" | "PENDING";

export type WorkType =
  | "HOURLY_WAGE"     // Soatbay ish (Hourly wage)
  | "DAILY_WAGE"      // Kunlik ish (Daily wage)
  | "FIXED_PAY"       // Fiksirlangan to'lov (Fixed pay)
  | "PER_CASE"        // Dona / Ishbay (Per case)
  | "ADVANCE"         // Avans to'lovi (Advance payment)
  | "NON_TAXABLE"     // Soliqsiz daromad (Non-taxable)
  | "ANNUAL_LEAVE"    // Pullik ta'til (Annual leave)
  | "DAY_OFF"         // Dam olish kuni (Day off)
  | "NO_SHOW";        // Kelmadi / Kelinmagan kun (No-show)

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  workType?: WorkType | string;
  amount: number;
  currency: string;
  description: string | null;
  date: string | Date;
  endDate?: string | Date | null;
  status: PaymentStatus;
  dueDate?: string | Date | null;
  fee: number;
  
  // Shift specifics
  startTime?: string | null;
  endTime?: string | null;
  breakMinutes?: number;
  hourlyRate?: number;
  totalHours?: number;
  isNightShift?: boolean;
  isOvertime?: boolean;
  isSpecialDuty?: boolean;
  unitCount?: number;
  color?: string | null;

  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    icon: string | null;
    type: string;
  } | null;
  clientId: string | null;
  client?: {
    id: string;
    name: string;
    platform: string | null;
    color?: string | null;
    isActive?: boolean;
    defaultFeeRate: number;
    defaultHourlyRate?: number;
    defaultDailyRate?: number;
  } | null;
  createdAt: string | Date;
}

export interface Client {
  id: string;
  name: string;
  platform: string | null;
  color?: string | null;
  isActive?: boolean;
  defaultFeeRate: number;
  defaultHourlyRate?: number;
  defaultDailyRate?: number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  userId: string;
  _count?: {
    transactions: number;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  type: string;
  userId: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  period: string;
  month?: number | null;
  year?: number | null;
}

export interface WorkplaceRanking {
  name: string;
  totalAmount: number;
  percentage: number;
  shiftCount: number;
  totalHours: number;
  color: string;
  rank: number;
}

export interface DashboardStats {
  totalGrossIncome: number;
  totalExpenses: number;
  totalFees: number;
  netProfit: number;
  estimatedTax: number;
  takeHomePay: number;
  pendingAmount: number;
  pendingCount: number;
  
  // Shift stats
  totalWorkedDays: number;
  totalWorkedHours: number;
  currentMonthName: string;
  prevMonthDiffPercentage: number;
  
  monthlyTrend: {
    name: string;
    income: number;
    expense: number;
    profit: number;
    hours?: number;
  }[];
  platformBreakdown: {
    name: string;
    amount: number;
    percentage: number;
    color?: string;
  }[];
  workplaceRankings: WorkplaceRanking[];
  categoryBreakdown: {
    name: string;
    amount: number;
    percentage: number;
  }[];
}
