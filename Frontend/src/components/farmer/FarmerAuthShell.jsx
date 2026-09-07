import Icon from '../ui/Icon.jsx';

export default function FarmerAuthShell({ title, subtitle, children, onBack }) {
  return (
    <main className="ks-page-farmer pt-safe pb-safe">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-center px-4 py-8">
        {onBack ? (
          <button
            type="button"
            aria-label="Go back"
            className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface-lowest shadow-sm"
            onClick={onBack}
          >
            <Icon name="arrow_back" size={20} />
          </button>
        ) : null}
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container shadow-sm">
            <Icon name="potted_plant" size={32} filled className="text-primary" />
          </div>
        </div>
        <div className="mb-8 px-1 text-center">
          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-3 py-1 text-[11px] font-extrabold tracking-wider text-on-tertiary-fixed uppercase">
            <Icon name="wb_sunny" size={14} filled />
            Kal Aayega Portal
          </span>
          <h1 className="ks-headline mt-2">{title}</h1>
          {subtitle ? (
            <p className="ks-body mx-auto mt-1 max-w-[340px] text-on-surface-variant">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </main>
  );
}
