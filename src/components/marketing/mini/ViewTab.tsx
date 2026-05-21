interface ViewTabProps {
  active?: boolean;
  label: string;
  sub: string;
  children: React.ReactNode;
}

export default function ViewTab({ active = false, label, sub, children }: ViewTabProps) {
  return (
    <div
      className={`flex-1 rounded-[10px] overflow-hidden relative flex flex-col ${active ? 'bg-neutral-850 border border-blue-500' : 'bg-neutral-900 border border-neutral-800'}`}
    >
      {active && (
        <span className="absolute top-2.5 right-2.5 z-10 font-mono text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-[3px] tracking-[0.06em] uppercase">
          active
        </span>
      )}
      <div className="px-[18px] py-3.5 border-b border-neutral-800 bg-neutral-900">
        <div className="text-[14.5px] font-semibold text-neutral-100 tracking-tight">{label}</div>
        <div className="font-mono text-[11px] text-dim mt-0.5 tracking-[0.02em]">{sub}</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-3 bg-neutral-850">
        {children}
      </div>
    </div>
  );
}
