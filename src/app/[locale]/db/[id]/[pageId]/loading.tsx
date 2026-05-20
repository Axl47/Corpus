export default function PageEditorLoading() {
  return (
    <div className="flex-1 flex overflow-hidden bg-neutral-850 animate-pulse">
      <div className="flex-1 flex flex-col pt-8 px-12 max-w-4xl mx-auto w-full">
        {/* Icon placeholder */}
        <div className="w-12 h-12 rounded bg-neutral-800 mb-6" />
        {/* Title placeholder */}
        <div className="h-10 w-2/3 rounded bg-neutral-800 mb-8" />
        {/* Content lines */}
        <div className="space-y-3">
          <div className="h-4 rounded bg-neutral-800 w-full" />
          <div className="h-4 rounded bg-neutral-800 w-5/6" />
          <div className="h-4 rounded bg-neutral-800 w-4/5" />
          <div className="h-4 rounded bg-neutral-800 w-full mt-6" />
          <div className="h-4 rounded bg-neutral-800 w-3/4" />
        </div>
      </div>
      {/* Properties panel skeleton */}
      <div className="w-72 border-l border-neutral-800 p-4 space-y-4">
        <div className="h-5 w-24 rounded bg-neutral-800" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-16 rounded bg-neutral-800/60" />
            <div className="h-7 w-full rounded bg-neutral-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
