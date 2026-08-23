import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  try {
    if (currency === "KRW") {
      return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
      }).format(amount);
    }
    if (currency === "UZS") {
      return `${new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(amount)} so'm`;
    }
    if (currency === "RUB") {
      return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
      }).format(amount);
    }
    if (currency === "EUR") {
      return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(amount);
    }
    if (currency === "TRY") {
      return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(amount);
    }
    // Any other ISO code (JPY, GBP, CAD, ...) — format with the code itself,
    // not as USD.
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch (e) {
    return `${amount.toLocaleString()} ${currency}`.trim();
  }
}

/**
 * Local (not UTC) "YYYY-MM-DD" key for a date.
 * toISOString() shifts the day by one in every timezone that is not UTC,
 * so it must never be used to compare a stored date with a calendar cell.
 */
export function toDateKey(date: string | Date): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Parse a "YYYY-MM-DD" input value into a local (not UTC) Date. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("uz-UZ", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
