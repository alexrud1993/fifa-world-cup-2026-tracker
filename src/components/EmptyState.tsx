interface EmptyStateProps {
  title: string;
  message: string;
  compact?: boolean;
}

export function EmptyState({ title, message, compact = false }: EmptyStateProps) {
  return (
    <div className={compact ? "state-panel state-panel--compact" : "state-panel"} role="status">
      <div className="state-panel-copy">
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}
