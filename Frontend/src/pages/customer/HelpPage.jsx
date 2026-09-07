import { useNavigate } from 'react-router-dom';
import CustomerShell from '../../components/layout/CustomerShell.jsx';
import HelpFaqs from '../../components/account/HelpFaqs.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { HARVEST_BASKET_SRC } from '../../lib/brand.js';
import { paths } from '../../lib/paths.js';

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <CustomerShell title="Help" onBack={() => navigate(paths.profile)}>
      <div className="mx-auto w-full max-w-[420px] md:max-w-[640px]">
        <div className="mb-4">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-tertiary-fixed px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase shadow-sm">
            <Icon name="wb_sunny" size={14} />
            Morning Routine FAQ
          </span>
          <p className="text-[16px] font-medium text-on-surface-variant">Questions about your morning farm harvest</p>
        </div>

        <div className="mb-5 flex items-center gap-4 rounded-[20px] bg-surface-lowest p-4 shadow-card">
          <img alt="" src={HARVEST_BASKET_SRC} className="h-16 w-16 rounded-[16px] object-cover" />
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold">Direct from Soil</p>
            <p className="mt-0.5 text-[12px] text-on-surface-variant">
              Zero warehouse holding. Picked at dusk, delivered fresh at sunrise.
            </p>
          </div>
        </div>

        <HelpFaqs />

        <div className="mt-8 flex items-center gap-3 rounded-[20px] bg-surface-low p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Icon name="psychiatry" size={20} />
          </span>
          <div>
            <p className="text-[15px] font-bold">Zero-Storage Commitment</p>
            <p className="text-[12px] text-on-surface-variant">
              Food spends zero nights in cold boxes. Directly pulled, packed, and placed.
            </p>
          </div>
        </div>
      </div>
    </CustomerShell>
  );
}
