/**
 * Format number as Indian Rupees: ₹12,345
 */
export function formatINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

/**
 * Pad a number to two digits: 1 → "01"
 */
export function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Get number of days in a month. yearMonth = "2026-04"
 */
export function getDaysInMonth(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

/**
 * Get human label: "2026-04" → "April 2026"
 */
export function getMonthLabel(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Get 2-letter day abbreviation: "Mo", "Tu", etc.
 */
export function getDayAbbrev(yearMonth, day) {
  const [y, m] = yearMonth.split('-').map(Number);
  return new Date(y, m - 1, day)
    .toLocaleString('en-IN', { weekday: 'short' })
    .slice(0, 2);
}

/**
 * Get the current month as "YYYY-MM"
 */
export function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/**
 * Shift a month string by delta months. "2026-04" + 1 → "2026-05"
 */
export function shiftMonth(yearMonth, delta) {
  const [y, m] = yearMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/**
 * Calculate salary breakdown for an employee in a given month.
 */
export function calculateSalary(employee, absentDates, totalDays) {
  const absentCount = absentDates.length;
  const presentCount = totalDays - absentCount;
  const foodEarned = employee.food_allowance * presentCount;
  const foodCut = employee.food_allowance * absentCount;
  const netPayable = employee.salary + foodEarned;

  return {
    absentCount,
    presentCount,
    totalDays,
    foodEarned,
    foodCut,
    netPayable,
    absentDates: absentDates.sort(),
  };
}

/**
 * Format a date string "2026-04-05" → "5 Apr"
 */
export function formatAbsentDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const monthStr = new Date(y, m - 1, 1).toLocaleString('en-IN', {
    month: 'short',
  });
  return `${d} ${monthStr}`;
}
