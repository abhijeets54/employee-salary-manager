import { formatINR, calculateSalary, getDaysInMonth, formatAbsentDate } from '@/lib/helpers';

export default function SummaryCard({ employee, absentDates }) {
  const totalDays = getDaysInMonth(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  // This is overridden by parent via props, but the component uses it for layout
  return null;
}

export function SummaryCardWithData({ employee, absentDates, month }) {
  const totalDays = getDaysInMonth(month);
  const summary = calculateSalary(employee, absentDates, totalDays);

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
              color: 'var(--teal)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {formatINR(summary.netPayable)}
          </p>
        </div>
        <div className="flex-between">
          <p className="small muted" style={{ margin: 0 }}>
            {summary.presentCount} present · {summary.absentCount} absent · {totalDays} days
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
            {formatINR(employee.food_allowance)}/day × {summary.presentCount} days
          </span>
        </div>
        <div className="summary-row">
          <span className="muted indent">= Food earned</span>
          <span style={{ fontWeight: 500 }}>{formatINR(summary.foodEarned)}</span>
        </div>

        {summary.absentCount > 0 && (
          <div className="summary-row">
            <span className="coral-text">
              Food cut ({summary.absentCount} day{summary.absentCount !== 1 ? 's' : ''})
            </span>
            <span className="coral-text" style={{ fontWeight: 500 }}>
              −{formatINR(summary.foodCut)}
            </span>
          </div>
        )}

        <div className="summary-total-row">
          <span style={{ fontWeight: 600, fontSize: '15px' }}>Net payable</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.15rem',
              color: 'var(--teal)',
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
    </div>
  );
}
