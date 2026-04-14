import { formatINR, calculateSalary, getDaysInMonth, formatAbsentDate } from '@/lib/helpers';

export default function SummaryCard({ employee, absentDates }) {
  const totalDays = getDaysInMonth(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  // This is overridden by parent via props, but the component uses it for layout
  return null;
}

export function SummaryCardWithData({ employee, absentDates, month, deductions = [] }) {
  const totalDays = getDaysInMonth(month);
  const summary = calculateSalary(employee, absentDates, totalDays, month, deductions);

  return (
    <div className="card page-enter" style={{ marginBottom: '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '14px' }}>
        <div className="flex-between" style={{ marginBottom: '6px' }}>
          <p style={{ fontWeight: 600, fontSize: '16px', margin: 0 }}>
            {employee.name}
          </p>
          <p
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: summary.netPayable >= 0 ? 'var(--teal)' : 'var(--coral)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {formatINR(summary.netPayable)}
          </p>
        </div>
        <div className="flex-between">
          <p className="small muted" style={{ margin: 0 }}>
            {summary.foodProvidedDays} days food credited · {summary.absentCount} absences
          </p>
          <p className="small muted" style={{ margin: 0 }}>
            to be paid
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="divider">
        <div className="summary-row">
          <span className="muted">Fixed salary</span>
          <span style={{ fontWeight: 500 }}>{formatINR(employee.salary)}</span>
        </div>
        <div className="summary-row">
          <span className="muted">Food allowance</span>
          <span className="muted small">
            {formatINR(employee.food_allowance)}/day × {summary.foodProvidedDays} days
          </span>
        </div>
        <div className="summary-row">
          <span className="muted indent">= Food earned</span>
          <span style={{ fontWeight: 500 }}>{formatINR(summary.foodEarned)}</span>
        </div>

        {/* Sunday bonus */}
        {summary.sundayRate > 0 && (
          <>
            <div className="summary-row">
              <span className="teal-text">
                Sunday bonus
              </span>
              <span className="muted small">
                {formatINR(summary.sundayRate)}/Sun × {summary.sundaysPresentCount} Sundays
              </span>
            </div>
            <div className="summary-row">
              <span className="teal-text indent">= Sunday earned</span>
              <span className="teal-text" style={{ fontWeight: 500 }}>
                +{formatINR(summary.sundayBonus)}
              </span>
            </div>
          </>
        )}

        {/* Deductions */}
        {summary.totalDeductions > 0 && (
          <>
            {summary.cashDeductions > 0 && (
              <div className="summary-row">
                <span className="coral-text">💵 Cash taken</span>
                <span className="coral-text" style={{ fontWeight: 500 }}>
                  −{formatINR(summary.cashDeductions)}
                </span>
              </div>
            )}
            {summary.goodsDeductions > 0 && (
              <div className="summary-row">
                <span className="coral-text">📦 Goods taken</span>
                <span className="coral-text" style={{ fontWeight: 500 }}>
                  −{formatINR(summary.goodsDeductions)}
                </span>
              </div>
            )}
          </>
        )}

        <div className="summary-total-row">
          <span style={{ fontWeight: 600, fontSize: '15px' }}>Net payable</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.15rem',
              color: summary.netPayable >= 0 ? 'var(--teal)' : 'var(--coral)',
            }}
          >
            {formatINR(summary.netPayable)}
          </span>
        </div>
      </div>

      {/* Absent dates */}
      {summary.absentCount > 0 && (
        <div className="absent-notice">
          <strong>Absent on:</strong>{' '}
          {summary.absentDates.map((d) => formatAbsentDate(d)).join(', ')}
        </div>
      )}

      {/* Deduction details */}
      {deductions.length > 0 && (
        <div className="deduction-notice">
          <strong>Deductions:</strong>
          {deductions.map((d, i) => (
            <span key={d.id || i} className="deduction-detail-item">
              {' '}{d.type === 'cash' ? '💵' : '📦'} {formatINR(d.amount)}
              {d.reason ? ` (${d.reason})` : ''}
              {i < deductions.length - 1 ? ',' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
