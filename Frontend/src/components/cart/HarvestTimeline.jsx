import Icon from '../ui/Icon.jsx';

const STEPS = [
  { icon: 'lock_clock', title: 'Today, 8:00 PM', body: 'Harvest locks. Produce is picked in the field.' },
  { icon: 'inventory_2', title: 'Tonight', body: 'Packed in aerated crates — no cold storage.' },
  { icon: 'wb_twilight', title: 'Tomorrow, 7–10 AM', body: 'Arrives fresh at your doorstep.' },
];

export default function HarvestTimeline() {
  return (
    <section className="rounded-[20px] border border-outline-soft bg-surface-lowest p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <Icon name="schedule" size={20} className="text-primary" />
        <h2 className="text-[17px] font-semibold">Direct Harvest Timeline</h2>
      </div>
      <ol className="flex flex-col gap-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                index === 0 ? 'bg-primary text-white' : 'bg-surface-container text-primary'
              }`}
            >
              <Icon name={step.icon} size={14} />
            </span>
            <div>
              <p className="text-[13px] font-bold">{step.title}</p>
              <p className="text-[12px] text-on-surface-variant">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
