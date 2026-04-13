export default function EmptyState({ icon = '📋', message = 'Nothing here yet.' }) {
  return (
    <div className="empty-state page-enter">
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-text">{message}</p>
    </div>
  );
}
