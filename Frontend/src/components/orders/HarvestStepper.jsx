import { FULFILLMENT_STEPS, fulfillmentOf, stepIndex } from '../../lib/orderUi.js';

function Dot({ state }) {
  if (state === 'done') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white ring-4 ring-white">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (state === 'active') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-container text-white ring-4 ring-[#FFF0EA]">
        <span className="h-2 w-2 rounded-full bg-white" />
      </span>
    );
  }
  return <span className="h-5 w-5 rounded-full bg-[#EAE3D6] ring-4 ring-white" />;
}

function stepState(index, current) {
  if (index < current) return 'done';
  if (index === current) return 'active';
  return 'upcoming';
}

export default function HarvestStepper({ order, variant = 'timeline' }) {
  const status = fulfillmentOf(order);
  if (order?.orderStatus === 'CANCELLED' || status === 'CANCELLED') {
    return (
      <p className="rounded-2xl bg-error-container px-3 py-2 text-[13px] font-semibold text-error">
        This harvest was cancelled.
      </p>
    );
  }

  const current = stepIndex(status);

  if (variant === 'flow') {
    return (
      <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold">
        {FULFILLMENT_STEPS.map((step, index) => {
          const state = stepState(index, current);
          return (
            <span key={step.id} className="flex items-center gap-2">
              {index > 0 ? <span className="text-outline">→</span> : null}
              <span
                className={
                  state === 'active'
                    ? 'rounded-md bg-[#E8F5EC] px-2.5 py-0.5 font-bold text-primary'
                    : state === 'done'
                      ? 'text-on-surface'
                      : 'font-medium text-on-surface-variant'
                }
              >
                {step.label.replace('Order ', '')}
              </span>
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative space-y-5 pl-6">
      <div className="absolute top-2.5 bottom-2.5 left-2.5 w-0.5 bg-[#EAE3D6]" />
      {FULFILLMENT_STEPS.map((step, index) => {
        const state = stepState(index, current);
        return (
          <div key={step.id} className="relative flex items-center gap-3">
            <div className="absolute -left-6">
              <Dot state={state} />
            </div>
            <p
              className={
                state === 'active'
                  ? 'text-[14px] font-bold leading-tight text-secondary-container'
                  : state === 'done'
                    ? 'text-[14px] font-semibold leading-tight'
                    : 'text-[14px] font-medium leading-tight text-on-surface-variant'
              }
            >
              {state === 'active' ? `${step.label} (active)` : step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
