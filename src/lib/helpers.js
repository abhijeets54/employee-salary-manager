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
 * Get all Sunday date strings in a month: ["2026-04-06", "2026-04-13", ...]
 */
export function getSundayDates(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  const totalDays = new Date(y, m, 0).getDate();
  const sundays = [];
  for (let d = 1; d <= totalDays; d++) {
    if (new Date(y, m - 1, d).getDay() === 0) {
      sundays.push(`${yearMonth}-${pad(d)}`);
    }
  }
  return sundays;
}

/**
 * Count Sundays an employee was present in a month.
 * absentSet is a Set<'YYYY-MM-DD'>
 */
export function getSundaysPresentCount(yearMonth, absentSet) {
  const sundays = getSundayDates(yearMonth);
  return sundays.filter((d) => !absentSet.has(d)).length;
}

/**
 * Calculate salary breakdown for an employee in a given month.
 * deductions = [{ amount, reason, type, deduction_date }, ...]
 */
export function calculateSalary(employee, absentDates, totalDays, yearMonth, deductions = []) {
  const absentCount = absentDates.length;
  const presentCount = totalDays - absentCount;
  const foodEarned = employee.food_allowance * presentCount;
  const foodCut = employee.food_allowance * absentCount;

  // Sunday bonus calculation
  const absentSet = new Set(absentDates);
  const sundayRate = Number(employee.sunday_rate) || 0;
  const sundaysPresentCount = yearMonth ? getSundaysPresentCount(yearMonth, absentSet) : 0;
  const sundayBonus = sundayRate * sundaysPresentCount;

  // Deductions calculation
  const totalDeductions = deductions.reduce((sum, d) => sum + Number(d.amount), 0);
  const cashDeductions = deductions.filter((d) => d.type === 'cash').reduce((sum, d) => sum + Number(d.amount), 0);
  const goodsDeductions = deductions.filter((d) => d.type === 'goods').reduce((sum, d) => sum + Number(d.amount), 0);

  const netPayable = employee.salary + foodEarned + sundayBonus - totalDeductions;

  return {
    absentCount,
    presentCount,
    totalDays,
    foodEarned,
    foodCut,
    sundayRate,
    sundaysPresentCount,
    sundayBonus,
    totalDeductions,
    cashDeductions,
    goodsDeductions,
    deductions,
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

/**
 * Format a date string "2026-04-05" → "5 Apr 2026"
 */
export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const monthStr = new Date(y, m - 1, 1).toLocaleString('en-IN', {
    month: 'short',
  });
  return `${d} ${monthStr} ${y}`;
}

/**
 * Get today as "YYYY-MM-DD"
 */
export function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
