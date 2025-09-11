import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return amount.toString();

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

export function formatNumber(amount: string | number): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return amount.toString();

  return new Intl.NumberFormat("en-US").format(numAmount);
}

export function parsePriceToNumber(price: string | number): number {
  if (typeof price === "number") {
    return price;
  }

  if (typeof price === "string") {
    // Remove all non-numeric characters except decimal point and minus sign
    const cleanedPrice = price.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleanedPrice);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}
