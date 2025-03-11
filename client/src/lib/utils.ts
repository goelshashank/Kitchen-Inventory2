import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(date: Date | string | null): string {
  if (!date) return 'No date';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format a measurement with unit
export function formatMeasurement(quantity: number, unit: string): string {
  return `${quantity}${unit}`;
}

// Check if an ingredient is low on stock
export function isLowStock(quantity: number, minimumStock: number | null): boolean {
  if (minimumStock === null) return false;
  return quantity <= minimumStock;
}

// Check if an item is expiring soon (within the next days)
export function isExpiringSoon(expiryDate: Date | string | null, days = 3): boolean {
  if (!expiryDate) return false;
  
  const dateObj = expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
  const today = new Date();
  const diffTime = dateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 && diffDays <= days;
}

// Check if an item is expired
export function isExpired(expiryDate: Date | string | null): boolean {
  if (!expiryDate) return false;
  
  const dateObj = expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
  const today = new Date();
  
  return dateObj < today;
}

// Get days until expiry (negative if already expired)
export function daysUntilExpiry(expiryDate: Date | string | null): number | null {
  if (!expiryDate) return null;
  
  const dateObj = expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
  const today = new Date();
  const diffTime = dateObj.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Convert between units (simplified version)
export function convertUnit(quantity: number, fromUnit: string, toUnit: string): number | null {
  // Simple conversions between common units
  const conversions: Record<string, Record<string, number>> = {
    'g': { 'kg': 0.001 },
    'kg': { 'g': 1000 },
    'ml': { 'l': 0.001 },
    'l': { 'ml': 1000 },
    'tsp': { 'tbsp': 1/3 },
    'tbsp': { 'tsp': 3 },
  };
  
  if (fromUnit === toUnit) return quantity;
  
  if (conversions[fromUnit] && conversions[fromUnit][toUnit]) {
    return quantity * conversions[fromUnit][toUnit];
  }
  
  return null; // Cannot convert between these units
}
