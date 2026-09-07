import Icon from '../ui/Icon.jsx';
import { formatAddress } from '../../lib/format.js';
import { formatDisplayPhone } from '../../lib/phone.js';

export default function AddressCard({ address, onDeliverHere, onEdit, onDelete }) {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#F3ECE0] bg-surface-lowest p-5 shadow-card">
      <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-surface-low opacity-60" />
      <div className="relative z-10 mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-primary">
          <Icon name="home" size={16} filled />
          <span className="text-[13px] font-bold">{address.label || 'Home'}</span>
        </span>
        {address.isDefault ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2.5 py-0.5 text-[11px] font-extrabold">
            <Icon name="check_circle" size={13} filled />
            Delivering Here
          </span>
        ) : onDeliverHere ? (
          <button type="button" className="text-[12px] font-bold text-primary" onClick={() => onDeliverHere(address)}>
            Deliver here
          </button>
        ) : null}
      </div>
      <h2 className="relative z-10 text-[17px] font-semibold">{address.name}</h2>
      <p className="relative z-10 mt-1 text-[16px] font-semibold leading-snug">{formatAddress(address)}</p>
      {address.landmark ? (
        <p className="relative z-10 mt-1 flex items-center gap-1 text-[14px] text-on-surface-variant">
          <Icon name="park" size={16} className="text-outline" />
          {address.landmark}
        </p>
      ) : null}
      <p className="relative z-10 mt-1 flex items-center gap-1.5 text-[12px] text-outline">
        <Icon name="call" size={15} />
        {formatDisplayPhone(address.phone)}
      </p>
      <div className="relative z-10 mt-4 flex items-center gap-2 rounded-2xl bg-surface-low p-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
          <Icon name="agriculture" size={16} />
        </span>
        <div>
          <p className="ks-label text-primary">Route Schedule</p>
          <p className="text-[12px] font-medium">Morning dawn route (7–10 AM)</p>
        </div>
      </div>
      <div className="relative z-10 mt-3 flex items-center justify-between">
        {onEdit ? (
          <button type="button" className="flex items-center gap-1 text-[13px] font-bold text-on-surface-variant" onClick={() => onEdit(address)}>
            <Icon name="edit_note" size={17} />
            Edit
          </button>
        ) : (
          <span />
        )}
        {onDelete ? (
          <button type="button" className="flex items-center gap-1 text-[13px] font-bold text-outline hover:text-error" onClick={() => onDelete(address)}>
            <Icon name="delete" size={17} />
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
