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
 * Get the last Monday date string of a given month
 */
export function getLastMonday(yearMonth) {
  if (!yearMonth) return null;
  const [y, m] = yearMonth.split('-').map(Number);
  const totalDays = new Date(y, m, 0).getDate();
  for (let d = totalDays; d >= 1; d--) {
    if (new Date(y, m - 1, d).getDay() === 1) { // 1 = Monday
      return `${yearMonth}-${pad(d)}`;
    }
  }
  return null;
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
  // Last Monday closed calculation
  const lastMonday = getLastMonday(yearMonth);
  const sundays = yearMonth ? getSundayDates(yearMonth) : [];
  
  // Ensure we don't double count if the employee was mistakenly marked absent on the closed day or Sundays (if they don't work Sundays)
  let effectiveAbsentDates = absentDates;
  if (lastMonday) {
    effectiveAbsentDates = effectiveAbsentDates.filter(d => d !== lastMonday);
  }
  if (!employee.works_sundays) {
    effectiveAbsentDates = effectiveAbsentDates.filter(d => !sundays.includes(d));
  }
    
  const absentCount = effectiveAbsentDates.length;
  
  // Rule: food is not given on days they are not expected to work
  let closedDaysCount = lastMonday ? 1 : 0;
  let nonWorkingSundaysCount = !employee.works_sundays ? sundays.length : 0;
  
  const potentialWorkingDays = totalDays - closedDaysCount - nonWorkingSundaysCount;
  const foodProvidedDays = potentialWorkingDays - absentCount;
  
  const foodEarned = employee.food_allowance * Math.max(0, foodProvidedDays);
  
  // These are purely informational for the UI
  const foodCut = employee.food_allowance * absentCount;
  const lastMondayFoodCut = lastMonday ? employee.food_allowance : 0;
  const nonWorkingSundayFoodCut = nonWorkingSundaysCount * employee.food_allowance;

  // Sunday bonus calculation
  const absentSet = new Set(effectiveAbsentDates);
  const sundayRate = employee.works_sundays ? (Number(employee.sunday_rate) || 0) : 0;
  const sundaysPresentCount = (yearMonth && employee.works_sundays) ? getSundaysPresentCount(yearMonth, absentSet) : 0;
  const sundayBonus = sundayRate * sundaysPresentCount;

  // Deductions calculation
  const totalDeductions = deductions.reduce((sum, d) => sum + Number(d.amount), 0);
  const cashDeductions = deductions.filter((d) => d.type === 'cash').reduce((sum, d) => sum + Number(d.amount), 0);
  const goodsDeductions = deductions.filter((d) => d.type === 'goods').reduce((sum, d) => sum + Number(d.amount), 0);

  const netPayable = employee.salary + foodEarned + sundayBonus - totalDeductions;

  return {
    absentCount,
    potentialWorkingDays,
    foodProvidedDays,
    foodEarned,
    foodCut,
    lastMondayFoodCut,
    nonWorkingSundayFoodCut,
    lastMonday,
    sundayRate,
    sundaysPresentCount,
    sundayBonus,
    totalDeductions,
    cashDeductions,
    goodsDeductions,
    deductions,
    netPayable,
    absentDates: effectiveAbsentDates.sort(),
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
