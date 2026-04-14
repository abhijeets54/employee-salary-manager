'use client';

import { getDaysInMonth, getDayAbbrev, pad, getLastMonday } from '@/lib/helpers';
import { supabase } from '@/lib/supabase';

const WEEKDAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function AttendanceGrid({ employees, month, absentMap, setAbsentMap }) {
  const totalDays = getDaysInMonth(month);
  const dayNums = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Get today in YYYY-MM-DD to disable future dates
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  // Calculate what day of week the 1st falls on (0=Mon ... 6=Sun for our grid)
  // Calculate what day of week the 1st falls on (0=Mon ... 6=Sun for our grid)
  const [yearNum, monthNum] = month.split('-').map(Number);
  const firstDayOfWeek = (new Date(yearNum, monthNum - 1, 1).getDay() + 6) % 7; // 0=Mon
  const lastMondayStr = getLastMonday(month);

  const toggleAbsent = async (employeeId, dateStr) => {
    const currentAbsent = absentMap[employeeId] || new Set();
    const isAbsent = currentAbsent.has(dateStr);

    // Optimistic update
    const newMap = { ...absentMap };
    const newSet = new Set(currentAbsent);

    if (isAbsent) {
      newSet.delete(dateStr);
      newMap[employeeId] = newSet;
      setAbsentMap(newMap);

      // Delete from DB
      await supabase
        .from('attendance')
        .delete()
        .eq('employee_id', employeeId)
        .eq('absent_date', dateStr);
    } else {
      newSet.add(dateStr);
      newMap[employeeId] = newSet;
      setAbsentMap(newMap);

      // Insert into DB
      await supabase
        .from('attendance')
        .insert({ employee_id: employeeId, absent_date: dateStr });
    }
  };

  return (
    <>
      {/* ── Desktop: Classic table view ── */}
      <div className="att-desktop">
        <div className="att-scroll">
          <table className="att-table">
            <thead>
              <tr>
                <th className="name-col">Employee</th>
                {dayNums.map((d) => (
                  <th key={d}>
                    <div className="day-num">{d}</div>
                    <div className="day-abbr">{getDayAbbrev(month, d)}</div>
                  </th>
                ))}
                <th className="total-col">Absent</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, ei) => {
                const abSet = absentMap[emp.id] || new Set();
                const rowClass = ei % 2 === 0 ? 'row-even' : 'row-odd';
                return (
                  <tr key={emp.id} className={rowClass}>
                    <td className={`name-cell ${rowClass}`}>{emp.name}</td>
                    {dayNums.map((d) => {
                      const ds = `${month}-${pad(d)}`;
                      const isClosedDay = ds === lastMondayStr;
                      const isFuture = ds > todayStr && !isClosedDay;
                      const ab = abSet.has(ds);
                      
                      let stateClass = 'present';
                      if (isClosedDay) stateClass = 'closed';
                      else if (isFuture) stateClass = 'future';
                      else if (ab) stateClass = 'absent';
                      
                      return (
                        <td key={d} className="day-cell">
                          <button
                            className={`day-btn ${stateClass}`}
                            onClick={() => !isFuture && !isClosedDay && toggleAbsent(emp.id, ds)}
                            title={
                              isClosedDay 
                                ? 'Closed (Last Monday)'
                                : isFuture
                                  ? 'Future date'
                                  : ab
                                  ? 'Absent – click to undo'
                                  : 'Present – click to mark absent'
                            }
                            disabled={isFuture || isClosedDay}
                          >
                            {isClosedDay ? '⛔' : isFuture ? '·' : ab ? 'A' : '·'}
                          </button>
                        </td>
                      );
                    })}
                    <td
                      className="total-cell"
                      style={{
                        color: abSet.size > 0 ? 'var(--coral)' : 'var(--text-tertiary)',
                      }}
                    >
                      {abSet.size || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile: Card-based calendar view ── */}
      <div className="att-mobile">
        {employees.map((emp) => {
          const abSet = absentMap[emp.id] || new Set();
          const absentCount = abSet.size;

          // Build spacer cells for the first week
          const spacers = Array.from({ length: firstDayOfWeek }, (_, i) => i);

          return (
            <div key={emp.id} className="att-card page-enter">
              <div className="att-card-header">
                <span className="att-card-name">{emp.name}</span>
                <span
                  className={`att-card-badge ${
                    absentCount > 0 ? 'has-absent' : 'all-present'
                  }`}
                >
                  {absentCount > 0
                    ? `${absentCount} absent`
                    : '✓ All present'}
                </span>
              </div>

              <div className="att-day-grid">
                {/* Weekday headers */}
                {WEEKDAY_HEADERS.map((h) => (
                  <div key={h} className="day-header">
                    {h}
                  </div>
                ))}

                {/* Spacer buttons for alignment */}
                {spacers.map((_, i) => (
                  <div key={`spacer-${i}`} className="day-btn-mobile spacer" />
                ))}

                {/* Day buttons */}
                {dayNums.map((d) => {
                  const ds = `${month}-${pad(d)}`;
                  const isClosedDay = ds === lastMondayStr;
                  const isFuture = ds > todayStr && !isClosedDay;
                  const ab = abSet.has(ds);
                  
                  let stateClass = 'present';
                  if (isClosedDay) stateClass = 'closed';
                  else if (isFuture) stateClass = 'future';
                  else if (ab) stateClass = 'absent';

                  return (
                    <button
                      key={d}
                      className={`day-btn-mobile ${stateClass}`}
                      onClick={() => !isFuture && !isClosedDay && toggleAbsent(emp.id, ds)}
                      disabled={isFuture || isClosedDay}
                      aria-label={`Day ${d}: ${isClosedDay ? 'closed' : isFuture ? 'future' : ab ? 'absent' : 'present'}`}
                      title={isClosedDay ? 'Closed (Last Monday)' : ''}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
