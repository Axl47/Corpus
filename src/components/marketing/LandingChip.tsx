interface LandingChipProps {
  color: string;
  children: React.ReactNode;
  mono?: boolean;
  dot?: boolean;
}

export default function LandingChip({ color, children, mono = false, dot = false }: LandingChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11.5px] font-medium leading-[1.4] ${mono ? 'font-mono tracking-[0.02em]' : 'font-sans'}`}
      style={{ color, background: `color-mix(in oklab, ${color} 16%, transparent)` }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: color }}
        />
      )}
      {children}
    </span>
  );
}
