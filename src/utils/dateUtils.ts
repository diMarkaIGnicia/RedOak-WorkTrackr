/**
 * Calculates the invoice date based on the current date
 * - If current day is between 1-15: returns the 15th of the current month
 * - If current day is 16 or later: returns the last day of the current month
 * @returns Date string in YYYY-MM-DD format
 */
export function calculateInvoiceDate(): string {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let invoiceDay: number;
  
  if (currentDay >= 1 && currentDay <= 15) {
    // First half of month - use 15th
    invoiceDay = 15;
  } else {
    // Second half of month - use last day of month
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    invoiceDay = lastDay;
  }
  
  // Format as YYYY-MM-DD
  const month = String(currentMonth + 1).padStart(2, '0');
  const day = String(invoiceDay).padStart(2, '0');
  
  return `${currentYear}-${month}-${day}`;
}
