export default function DatabaseLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-850 animate-pulse">
      <div className="pt-8 px-8 max-w-screen-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded bg-neutral-800" />
          <div className="h-9 w-48 rounded bg-neutral-800" />
        </div>
        {/* View tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 mb-4">
          <div className="h-6 w-16 rounded bg-neutral-800" />
          <div className="h-6 w-20 rounded bg-neutral-800" />
        </div>
        {/* Table header */}
        <div className="flex gap-2 mb-2">
          <div className="h-8 w-48 rounded bg-neutral-800" />
          <div className="h-8 w-32 rounded bg-neutral-800" />
          <div className="h-8 w-32 rounded bg-neutral-800" />
          <div className="h-8 w-24 rounded bg-neutral-800" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <div className="h-8 w-48 rounded bg-neutral-800/60" />
            <div className="h-8 w-32 rounded bg-neutral-800/60" />
            <div className="h-8 w-32 rounded bg-neutral-800/60" />
            <div className="h-8 w-24 rounded bg-neutral-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
