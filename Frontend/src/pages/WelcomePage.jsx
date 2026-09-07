import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND_NAME, BRAND_TAGLINE, LOGO_SRC } from '../lib/brand.js';
import { paths } from '../lib/paths.js';

export default function WelcomePage() {
  const [role, setRole] = useState('consumer');
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-surface text-on-surface pt-safe pb-safe">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-4 pb-6 md:max-w-[480px] md:py-10">
        <div className="relative flex w-full flex-col items-center pt-4 text-center">
          <div className="relative mb-2">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-surface-lowest p-1 shadow-card">
              <img alt={`${BRAND_NAME} farm emblem`} className="h-full w-full rounded-full object-contain" src={LOGO_SRC} />
            </div>
            <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-tertiary-fixed px-2 py-0.5 text-on-tertiary-fixed shadow-sm">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                wb_sunny
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.04em]">6 AM</span>
            </div>
          </div>

          <h1 className="mb-1 text-[26px] font-extrabold leading-8 tracking-[-0.02em] sm:text-[30px] sm:leading-9">{BRAND_NAME}</h1>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-low px-3 py-1 shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              spa
            </span>
            <p className="text-[17px] font-medium leading-[22px]">{BRAND_TAGLINE}</p>
          </div>
        </div>

        <div className="mt-5 flex w-full flex-col gap-4">
          <button
            type="button"
            onClick={() => setRole('consumer')}
            className="relative w-full rounded-[20px] bg-surface-lowest p-4 text-left shadow-card transition active:scale-[0.98]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary-fixed px-2 py-0.5 text-on-primary-fixed">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    agriculture
                  </span>
                  <span className="text-[11px] font-extrabold tracking-[0.04em]">Single-Farm Batch</span>
                </div>
                <h2 className="text-[20px] font-bold leading-[26px] tracking-[-0.01em]">Shop Produce</h2>
                <p className="mt-1 text-[12px] font-medium leading-4 text-on-surface-variant">
                  Direct from one verified farmer • Freshly clipped dusk harvest delivered tomorrow dawn.
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-low text-primary shadow-sm">
                <span className="material-symbols-outlined text-[24px]">local_mall</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between pt-2 text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                <span className="text-[13px] font-bold text-on-surface">Zero Warehouse Latency</span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-primary">arrow_forward</span>
            </div>
            {role === 'consumer' && (
              <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-primary ring-4 ring-primary-fixed/40" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setRole('farmer')}
            className={`relative w-full rounded-[20px] bg-surface-low p-4 text-left shadow-sm transition active:scale-[0.98] ${
              role === 'farmer' ? '' : 'opacity-85'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2 py-0.5 text-on-tertiary-fixed">
                  <span className="material-symbols-outlined text-[14px]">psychiatry</span>
                  <span className="text-[11px] font-extrabold tracking-[0.04em]">Kisan Portal</span>
                </div>
                <h2 className="text-[20px] font-bold leading-[26px] tracking-[-0.01em]">I'm the Farmer</h2>
                <p className="mt-1 text-[12px] font-medium leading-4 text-on-surface-variant">
                  List morning yields, track crate counts & oversee 8 PM cutoff pickups.
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-lowest text-tertiary shadow-sm">
                <span className="material-symbols-outlined text-[24px]">yard</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between pt-2 text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-tertiary">payments</span>
                <span className="text-[13px] font-bold text-on-surface">Same-Day UPI Settlements</span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-tertiary">arrow_forward</span>
            </div>
          </button>
        </div>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={() => navigate(role === 'farmer' ? paths.farmerLogin : paths.login)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-secondary-container text-[15px] font-bold text-white shadow-sm"
          >
            {role === 'farmer' ? 'Open Farmer Portal' : 'Shop Fresh Produce'}
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
          <p className="mt-3 text-center text-[12px] font-medium text-on-surface-variant">
            No instant delivery · book before 8 PM
          </p>
        </div>
      </div>
    </main>
  );
}
