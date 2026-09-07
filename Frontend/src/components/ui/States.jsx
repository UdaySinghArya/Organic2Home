import Icon from './Icon.jsx';
import Button from './Button.jsx';

export function LoadingState({ label = 'Loading harvest…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-on-surface-variant">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-low border-t-primary" />
      <p className="ks-body">{label}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-container text-error">
        <Icon name="error" size={28} />
      </div>
      <p className="ks-subtitle">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({ icon = 'shopping_basket', title, body, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-fixed text-tertiary">
        <Icon name={icon} size={32} filled />
      </div>
      <h2 className="ks-subtitle">{title}</h2>
      <p className="ks-caption mt-1 max-w-[260px] text-on-surface-variant">{body}</p>
      {actionLabel ? (
        <Button variant="primary" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
