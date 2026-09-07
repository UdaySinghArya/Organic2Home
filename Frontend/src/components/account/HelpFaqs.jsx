import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import { HELP_FAQS } from '../../lib/helpFaqs.js';

export default function HelpFaqs({ variant = 'accordion', defaultOpen = 'when' }) {
  const [openId, setOpenId] = useState(defaultOpen);

  if (variant === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {HELP_FAQS.map((item) => (
          <div key={item.id} className="rounded-[20px] bg-surface-low p-5">
            <div className="flex items-start gap-3">
              <Icon name={item.icon} size={20} className={`${item.tone} mt-0.5`} />
              <div>
                <h3 className="text-[17px] font-semibold">{item.q}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-on-surface-variant">{item.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {HELP_FAQS.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="rounded-[20px] bg-surface-lowest shadow-card">
            <button
              type="button"
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 p-5 text-left"
              onClick={() => setOpenId(open ? '' : item.id)}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container ${item.tone}`}>
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="text-[17px] font-semibold">{item.q}</span>
              </div>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-low text-on-surface-variant transition ${open ? 'rotate-180' : ''}`}>
                <Icon name="expand_more" size={18} />
              </span>
            </button>
            {open ? (
              <div className="px-5 pb-5 pl-16">
                <p className="text-[14px] leading-relaxed text-on-surface-variant">{item.a}</p>
                {item.chip ? (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-primary uppercase">
                    <Icon name={item.chipIcon} size={14} />
                    {item.chip}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
