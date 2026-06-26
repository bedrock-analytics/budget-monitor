import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (str: string): string => {
  if (typeof str !== "string" || !str.trim()) return "?";

  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
};

export function formatCurrency(
  amount: number,
  opts?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    noDecimals?: boolean;
  },
) {
  const { currency = "USD", locale = "en-US", minimumFractionDigits, maximumFractionDigits, noDecimals } = opts ?? {};

  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: noDecimals ? 0 : minimumFractionDigits,
    maximumFractionDigits: noDecimals ? 0 : maximumFractionDigits,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}

export const formatTHB = (value: number): string => {
  // const abs = Math.abs(value);
  // const sign = value < 0 ? "-" : "";

  // if (abs >= 1_000_000) {
  //   return `${sign}฿${(abs / 1_000_000).toFixed(2)}M`;
  // }
  // if (abs >= 1_000) {
  //   return `${sign}฿${(abs / 1_000).toFixed(2)}K`;
  // }
  // return `${sign}฿${abs.toFixed(2)}`;
  value = Number(value);

  return value.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
  });
};

export const formatUSD = (value: number): string => {
  // const abs = Math.abs(value);
  // const sign = value < 0 ? "-" : "";

  // if (abs >= 1_000_000) {
  //   return `${sign}฿${(abs / 1_000_000).toFixed(2)}M`;
  // }
  // if (abs >= 1_000) {
  //   return `${sign}฿${(abs / 1_000).toFixed(2)}K`;
  // }
  // return `${sign}฿${abs.toFixed(2)}`;
  value = Number(value);
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};
