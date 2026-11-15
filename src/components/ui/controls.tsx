import type { ReactNode } from 'react';

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[320px_1fr] items-center gap-8 py-4">
      <div>
        <div className="text-[22px] text-white/85">{label}</div>
        {hint && <div className="mt-1 text-[15px] leading-snug text-white/40">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  label,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  label: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-6">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="vn-range h-2 flex-1 cursor-pointer appearance-none rounded-full"
        style={{ background: `linear-gradient(90deg, #e8c88f ${pct}%, rgba(255,255,255,0.12) ${pct}%)` }}
      />
      <span className="w-[120px] text-right text-[18px] tabular-nums text-white/60">{format ? format(value) : value}</span>
    </div>
  );
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className={['relative h-9 w-16 rounded-full transition-colors', value ? 'bg-[#e8c88f]' : 'bg-white/15'].join(' ')}
    >
      <span className={['absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all', value ? 'left-8' : 'left-1'].join(' ')} />
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/10 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={[
            'rounded-full px-6 py-2 text-[17px] tracking-wide transition-colors',
            value === o.value ? 'bg-[#e8c88f] text-black' : 'text-white/60 hover:text-white',
          ].join(' ')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({
  value,
  tabs,
  onChange,
  right,
}: {
  value: T;
  tabs: { value: T; label: string }[];
  onChange: (v: T) => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-8 border-b border-white/[0.07] px-12">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={[
            '-mb-px border-b-2 py-4 text-[18px] uppercase tracking-[0.25em] transition-colors',
            value === t.value ? 'border-[#e8c88f] text-white' : 'border-transparent text-white/40 hover:text-white/75',
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}

export function ConfirmBar({ text, confirmLabel, onConfirm, onCancel }: { text: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-xl border border-[#e8c88f]/30 bg-[#e8c88f]/[0.06] px-6 py-4">
      <span className="text-[19px] text-white/80">{text}</span>
      <div className="flex gap-3">
        <button onClick={onConfirm} className="rounded-full bg-[#f1ece2] px-6 py-2 text-[16px] uppercase tracking-[0.2em] text-black hover:bg-white">
          {confirmLabel}
        </button>
        <button onClick={onCancel} className="rounded-full px-6 py-2 text-[16px] uppercase tracking-[0.2em] text-white/55 hover:text-white">
          Cancel
        </button>
      </div>
    </div>
  );
}
