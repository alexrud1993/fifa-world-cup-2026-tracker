interface ErrorStateProps {
  title?: string;
  message: string;
}

export function ErrorState({ title = "Something went wrong", message }: ErrorStateProps) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <div className="state-panel-copy">
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}
