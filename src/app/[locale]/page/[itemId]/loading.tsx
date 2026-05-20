export default function PageLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-850">
      <div className="flex-1 flex flex-col pt-8 px-12 max-w-4xl mx-auto w-full animate-pulse">
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
          <div className="h-4 rounded bg-neutral-800 w-5/6" />
        </div>
      </div>
    </div>
  );
}
